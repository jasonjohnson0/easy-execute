-- Reverses the two pending migrations, returning the database to the state a
-- clean replay of the 2025 migration history produces.
--
-- WARNING: this re-opens the paywall bypass. Running it restores the policy that
-- lets any authenticated user insert their own active membership row. Only run
-- it if applying the migrations broke something and you need the previous
-- behaviour back while you work out why.
--
-- This reverses schema changes only. It does not restore data. If rows were
-- changed since the migration, use the backup or the dashboard snapshot.
--
-- Safe to run twice.

/* ---- reverse 20260901130000_fix_membership_and_business_rls.sql ---------- */

-- Put back the INSERT policy that allowed self-issued memberships.
DROP POLICY IF EXISTS "Users can create their own memberships" ON public.memberships;
CREATE POLICY "Users can create their own memberships"
ON public.memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Drop the Stripe/admin discriminator.
-- check-subscription reads memberships.source. If you roll this back, redeploy
-- the previous version of that function too, or it will error on every call.
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_source_check;
ALTER TABLE public.memberships DROP COLUMN IF EXISTS source;

-- Restore the single owner-only SELECT policy under its previous name.
DROP POLICY IF EXISTS "Business owners can view their own profile" ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can view their full profile" ON public.businesses;
CREATE POLICY "Business owners can view their full profile"
ON public.businesses
FOR SELECT
USING (auth.uid() = id);

-- anon had no SELECT on businesses before the migration either, so the REVOKE
-- is left in place deliberately. Nothing to undo here.

/* ---- reverse 20260901120000_public_embed_api.sql ------------------------- */

-- The WordPress embed stops returning data once these are gone.
DROP FUNCTION IF EXISTS public.get_public_deals(uuid, text, integer);
DROP FUNCTION IF EXISTS public.get_public_sponsored_offers(uuid, integer);
DROP FUNCTION IF EXISTS public.get_public_business(uuid);
