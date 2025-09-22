import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body for options
    const body = await req.json().catch(() => ({}));
    const { applyFirstTimeDiscount = false } = body;

    // Check if user already has an active subscription
    const { data: existingMembership } = await supabaseClient
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (existingMembership) {
      throw new Error("User already has an active subscription");
    }

    // Get user's referral organization for attribution
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('referred_by_organization')
      .eq('id', user.id)
      .single();

    const organizationId = userProfile?.referred_by_organization;
    logStep("User referral info", { organizationId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists, if not create one
    let customerId;
    const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
          organization_id: organizationId || 'none'
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Prepare checkout session options
    const sessionOptions: any = {
      customer: customerId,
      line_items: [
        {
          price: "price_1SA01kItSX6cq7bOPF8oTOcv", // $30/year membership
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/subscription-canceled`,
      metadata: {
        user_id: user.id,
        organization_id: organizationId || 'none',
        first_time_discount: applyFirstTimeDiscount ? 'true' : 'false'
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          organization_id: organizationId || 'none'
        }
      }
    };

    // Apply $2 off coupon for first-time users if requested
    if (applyFirstTimeDiscount) {
      sessionOptions.discounts = [{
        coupon: "ICqW1FYg" // $2 off coupon
      }];
      logStep("First-time discount applied");
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});