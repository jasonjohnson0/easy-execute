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
-- 2. Business contact data exposure
--    The most recent SELECT policy on public.businesses was USING (true) with
--    GRANT SELECT TO authenticated, on the stated assumption that application
--    code would only ask for safe columns. RLS filters rows, not columns, so any
--    authenticated user could select * and read every business's email, phone,
--    address, subscription status, and referral code. Signup is open, so this
--    was effectively public.
--
--    Public and cross-business reads already go through SECURITY DEFINER
--    functions that return a vetted column set (get_safe_businesses,
--    get_deals_with_safe_business_info, get_public_deals, get_public_business,
--    get_all_businesses). Those bypass RLS and keep working. Every direct table
--    read in the client is scoped to the caller's own row, so owner-only SELECT
--    is sufficient.

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
