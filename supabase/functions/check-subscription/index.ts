import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { data: membership } = await supabaseClient
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    // A comped membership has no Stripe subscription behind it, so it is the one
    // case where the row itself is the answer.
    if (membership && membership.source === 'admin') {
      logStep("Admin-granted membership found", { membershipId: membership.id, expiresAt: membership.expires_at });
      return new Response(JSON.stringify({
        subscribed: true,
        membership_id: membership.id,
        expires_at: membership.expires_at,
        organization_id: membership.organization_id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Everything else is checked against Stripe. Returning subscribed: true
    // straight from the row would keep access alive for a cancelled subscriber
    // until expires_at, and would trust any row that reached the table by
    // another route.
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Prefer the customer explicitly linked to this user id at checkout. Falling
    // back to email alone means whoever holds an address controls the customer,
    // which matters when the address has never been confirmed.
    let customer = null;
    try {
      const linked = await stripe.customers.search({
        query: `metadata['supabase_user_id']:'${user.id}'`,
        limit: 1,
      });
      if (linked.data.length > 0) {
        customer = linked.data[0];
        logStep("Customer matched by supabase_user_id", { customerId: customer.id });
      }
    } catch (searchError) {
      logStep("Customer search unavailable, falling back to email", {
        message: searchError instanceof Error ? searchError.message : String(searchError),
      });
    }

    if (!customer) {
      const byEmail = await stripe.customers.list({ email: user.email, limit: 1 });
      if (byEmail.data.length > 0) {
        customer = byEmail.data[0];
        logStep("Customer matched by email", { customerId: customer.id });
      }
    }

    // Stripe says this user is not subscribed, so any active row claiming
    // otherwise is stale (cancelled subscription) or was never legitimate.
    const revokeStaleMembership = async () => {
      if (!membership) return;
      const { error: revokeError } = await supabaseClient
        .from('memberships')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', membership.id);
      if (revokeError) {
        console.error('Error expiring stale membership:', revokeError);
      } else {
        logStep("Expired membership with no active Stripe subscription", { membershipId: membership.id });
      }
    };

    if (!customer) {
      logStep("No customer found, no subscription");
      await revokeStaleMembership();
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customer.id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active Stripe subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });

      const { data: userProfile } = await supabaseClient
        .from('user_profiles')
        .select('referred_by_organization')
        .eq('id', user.id)
        .maybeSingle();

      // Refresh the existing row rather than stacking another one on every check.
      let membershipId = membership?.id;
      if (membership) {
        const { error: refreshError } = await supabaseClient
          .from('memberships')
          .update({ expires_at: subscriptionEnd, updated_at: new Date().toISOString() })
          .eq('id', membership.id);
        if (refreshError) {
          console.error('Error refreshing membership record:', refreshError);
        }
      } else {
        const { data: newMembership, error: membershipError } = await supabaseClient
          .from('memberships')
          .insert({
            user_id: user.id,
            organization_id: userProfile?.referred_by_organization,
            expires_at: subscriptionEnd,
            status: 'active',
            source: 'stripe',
            payment_amount: 30.00
          })
          .select()
          .single();

        if (membershipError && !membershipError.message.includes('duplicate')) {
          console.error('Error creating membership record:', membershipError);
        }
        membershipId = newMembership?.id;
      }

      return new Response(JSON.stringify({
        subscribed: true,
        membership_id: membershipId,
        expires_at: subscriptionEnd,
        organization_id: userProfile?.referred_by_organization
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("No active subscription found");
      await revokeStaleMembership();
    }

    return new Response(JSON.stringify({
      subscribed: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});