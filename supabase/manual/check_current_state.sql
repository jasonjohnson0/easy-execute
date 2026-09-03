-- RUN FIRST. Read-only: this changes nothing.
--
-- Paste the whole file into the Supabase dashboard under SQL Editor -> New query
-- and press Run. It returns one table telling you what state your database is
-- actually in, so you don't have to take anyone's word for it.
--
-- It is deliberately a single query. The Supabase SQL editor only displays the
-- result of the last statement in a script, so several separate SELECTs would
-- hide most of the answer.

SELECT check_name, result, verdict
FROM (

  -- Are you even in the right project? Supabase accounts hold many, and the
  -- dashboard remembers whichever you opened last. Check this row first: if it
  -- says WRONG PROJECT, nothing below it means anything.
  SELECT
    0 AS sort,
    'Is this the Easy Execute database?' AS check_name,
    count(*)::text || ' of 6 core tables found' AS result,
    CASE WHEN count(*) = 6
      THEN 'OK'
      ELSE 'WRONG PROJECT -> expected ref nmsnsnfqufykwpesnjup; check the ref in the dashboard URL'
    END AS verdict
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('businesses', 'deals', 'memberships',
                       'user_roles', 'user_profiles', 'sponsored_offers')

  UNION ALL

  -- The three functions the WordPress embed reads from.
  SELECT
    1 AS sort,
    'Embed API functions' AS check_name,
    count(*)::text || ' of 3 installed' AS result,
    CASE WHEN count(*) = 3
      THEN 'OK'
      ELSE 'MISSING -> run migration 20260901120000_public_embed_api.sql'
    END AS verdict
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('get_public_deals', 'get_public_sponsored_offers', 'get_public_business')

  UNION ALL

  -- Any INSERT policy here lets users create their own membership rows.
  SELECT
    2,
    'Paywall bypass (memberships INSERT policy)',
    coalesce(string_agg(policyname, ', '), 'none'),
    CASE WHEN count(*) = 0
      THEN 'OK'
      ELSE 'STILL OPEN -> run migration 20260901130000_fix_membership_and_business_rls.sql'
    END
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'memberships' AND cmd = 'INSERT'

  UNION ALL

  -- Lists every SELECT policy on businesses with the condition it applies.
  -- A condition of "true" means every logged-in user can read every business's
  -- email, phone, and address.
  SELECT
    3,
    'Business contact data (businesses SELECT policies)',
    coalesce(string_agg(policyname || ' => ' || coalesce(qual, 'n/a'), '; '), 'none'),
    CASE WHEN bool_or(qual = 'true')
      THEN 'STILL OPEN -> run migration 20260901130000_fix_membership_and_business_rls.sql'
      ELSE 'OK'
    END
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'businesses' AND cmd IN ('SELECT', 'ALL')

  UNION ALL

  -- Separates Stripe-backed subscriptions from admin comps.
  SELECT
    4,
    'memberships.source column',
    CASE WHEN count(*) > 0 THEN 'present' ELSE 'absent' END,
    CASE WHEN count(*) > 0
      THEN 'OK'
      ELSE 'MISSING -> run migration 20260901130000_fix_membership_and_business_rls.sql'
    END
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'memberships'
    AND column_name = 'source'

  UNION ALL

  -- Sanity check on the pre-existing schema. These should already be there.
  -- If they aren't, this database is not the one the repo describes.
  SELECT
    5,
    'Baseline app functions (should already exist)',
    count(*)::text || ' of 2 installed',
    CASE WHEN count(*) = 2
      THEN 'OK'
      ELSE 'UNEXPECTED -> this database does not match the repo'
    END
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('get_deals_with_safe_business_info', 'get_safe_businesses')

) checks
ORDER BY sort;
