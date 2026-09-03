-- Security fixes: self-issued memberships, and public read of business contact data.
--
-- 1. Paywall bypass
--    "Users can create their own memberships" allowed INSERT with only
--    WITH CHECK (auth.uid() = user_id). Nothing constrained status, expires_at,
--    or payment_amount, so any authenticated user could grant themselves an
--    active membership expiring far in the future with a single PostgREST call.
--    check-subscription reads that row before consulting Stripe and returns
--    subscribed: true, so the forged row was sufficient to unlock the paywall.
--
--    Memberships are created by the edge functions using the service role, which
--    bypasses RLS, and by admins through the "Admins can manage all memberships"
--    policy. No client code inserts memberships, so dropping the user-facing
--    INSERT policy removes the hole without changing any working path.
--
-- 2. businesses SELECT policy consolidation (hardening, not an open hole)
--    On 2025-09-21 a policy named "Public can view safe business fields for
--    deals" was created USING (true), which would have let any authenticated
--    user select * and read every business's email, phone, address, and
--    referral code. It was dropped 59 seconds later by migration 20250921212326
--    ("Remove the overly permissive policy we just created"), so a clean replay
--    of this history ends with owner-only SELECT and the table is not exposed.
--
--    What is left is eleven differently-named SELECT policies created and
--    dropped across that afternoon. Policies are OR'd, so the table's safety
--    depends on none of them having survived. This database was built by
--    applying migrations out-of-band rather than through a tracked pipeline, so
--    the file history is evidence about production, not proof of it.
--
--    This section drops all of them by name and leaves exactly two: owner and
--    admin. If production matches the file history, this is a no-op that makes
--    the intent explicit. If any permissive policy did survive, this removes it.
--    Run supabase/manual/check_current_state.sql to see which case you are in.
--
--    Note that "Admins can view all businesses" is new. Admins previously read
--    businesses only through get_all_businesses(), which is unaffected; this
--    grants direct table SELECT to admins as well.
--
--    Public and cross-business reads go through SECURITY DEFINER functions that
--    return a vetted column set (get_safe_businesses,
--    get_deals_with_safe_business_info, get_public_deals, get_public_business,
--    get_all_businesses). Those bypass RLS and keep working. Every direct table
--    read in the client is scoped to the caller's own row.

/* ------------------------------------------------------- 1. memberships --- */

DROP POLICY IF EXISTS "Users can create their own memberships" ON public.memberships;

-- Distinguishes subscriptions Stripe is the source of truth for from comped
-- memberships granted by an admin. Existing rows default to 'stripe' so they are
-- re-verified against Stripe on the next check: if any forged rows were created
-- while the INSERT policy was open, that revokes them rather than trusting them.
ALTER TABLE public.memberships
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'stripe';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memberships_source_check'
  ) THEN
    ALTER TABLE public.memberships
      ADD CONSTRAINT memberships_source_check CHECK (source IN ('stripe', 'admin'));
  END IF;
END $$;

COMMENT ON COLUMN public.memberships.source IS
  'stripe = verified against an active Stripe subscription on each check; admin = comped, trusted as-is.';

/* --------------------------------------------------------- 2. businesses -- */

-- Every SELECT policy this table has accumulated. RLS policies are OR'd, so a
-- single surviving permissive one re-opens the table; they are dropped by name
-- before the replacement is created.
DROP POLICY IF EXISTS "Public can view safe business fields for deals" ON public.businesses;
DROP POLICY IF EXISTS "Public can view safe business info only" ON public.businesses;
DROP POLICY IF EXISTS "Public can view safe business info" ON public.businesses;
DROP POLICY IF EXISTS "Public can view basic business info" ON public.businesses;
DROP POLICY IF EXISTS "Public can count businesses for statistics" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can view public business info" ON public.businesses;
DROP POLICY IF EXISTS "Restrict sensitive business data access" ON public.businesses;
DROP POLICY IF EXISTS "Authenticated businesses can view only their own profile" ON public.businesses;
DROP POLICY IF EXISTS "Businesses can view their own profile" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can view their full profile" ON public.businesses;

-- Also the replacements below, so this migration can be re-run safely.
DROP POLICY IF EXISTS "Business owners can view their own profile" ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;

CREATE POLICY "Business owners can view their own profile"
ON public.businesses
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all businesses"
ON public.businesses
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anonymous visitors never read this table directly; they go through the
-- SECURITY DEFINER functions, which run as the owner and are unaffected.
REVOKE SELECT ON public.businesses FROM anon;

-- Post-deploy audit. Any of these rows was created while the INSERT policy was
-- open and is not backed by Stripe; review before the next billing cycle.
--
--   SELECT m.id, m.user_id, m.status, m.expires_at, m.payment_amount, m.created_at
--   FROM public.memberships m
--   WHERE m.status = 'active'
--     AND m.expires_at > now()
--   ORDER BY m.created_at DESC;
