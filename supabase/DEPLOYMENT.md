# Where the database lives, and how changes reach it

## There is one database

Supabase project **`nmsnsnfqufykwpesnjup`**. That is the only database this app
has ever pointed at. It is named in three places, all in agreement:

- `supabase/config.toml` — `project_id = "nmsnsnfqufykwpesnjup"`
- `src/integrations/supabase/client.ts` — the URL the app connects to
- `.env` — `VITE_SUPABASE_URL`

No other project reference exists anywhere in the repo. The project you see in
the Supabase dashboard is the one serving production.

## "Not connected to a repository" is expected

That message refers to Supabase's optional GitHub integration, which watches a
repo and applies new migration files automatically on push. **This project has
never used it.** Migrations were applied directly to the database by Lovable
through its own connection.

So the files in `supabase/migrations/` are a *record* of changes that were
already made — not the mechanism that makes them. Nothing in this repository
applies anything to the database on its own.

The practical consequence: **adding a migration file to git does not change the
database.** It has to be run by hand.

## What that means right now

The 35 migrations dated 2025-09-20 through 2025-09-22 were applied by Lovable
and are live. Every commit since then changed only `src/`, so the schema has
been stable since.

Two migration files are in git but have **not** been applied to the database:

| File | What it does |
|---|---|
| `20260901120000_public_embed_api.sql` | Adds the public read API the WordPress embed needs |
| `20260901130000_fix_membership_and_business_rls.sql` | Closes the paywall bypass; consolidates the accumulated `businesses` SELECT policies |

Until they are run, the WordPress widget will render "No active deals right
now" no matter what, and the paywall bypass is still open in production.

## Step 1 — check the real state first

Don't trust this file over the database. Paste this into the Supabase dashboard
under **SQL Editor → New query**. It only reads metadata; it changes nothing.

```sql
-- Which functions exist? Expect 2 rows before the migrations, 5 after.
SELECT p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_deals_with_safe_business_info', 'get_safe_businesses',
    'get_public_deals', 'get_public_sponsored_offers', 'get_public_business'
  )
ORDER BY 1;

-- Is the paywall bypass still open?
-- A row named "Users can create their own memberships" means yes.
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'memberships'
ORDER BY cmd, policyname;

-- Who can read business contact data?
-- Expect owner-only. A policy whose qual is "true" would mean every logged-in
-- user can read every business's email, phone, and address; a clean replay of
-- the migration history does not produce one, but this database was built
-- out-of-band, so check rather than assume.
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'businesses'
ORDER BY cmd, policyname;

-- Has the membership source column been added yet?
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'memberships'
  AND column_name = 'source';
```

## Step 2 — apply the two migrations

In the same SQL Editor, run them **in this order**, one at a time, pasting the
full contents of each file:

1. `supabase/migrations/20260901120000_public_embed_api.sql`
2. `supabase/migrations/20260901130000_fix_membership_and_business_rls.sql`

Both are written to be safe to run twice: every `DROP` uses `IF EXISTS`, every
function uses `CREATE OR REPLACE`, and the new column uses `ADD COLUMN IF NOT
EXISTS`. If a run half-fails, fix the error and run the whole file again.

Then re-run the Step 1 queries. You should see five functions, no
`"Users can create their own memberships"` policy, exactly two `businesses`
SELECT policies (owner and admin), and a `source` column.

## Step 3 — audit for forged memberships

The paywall bypass let any logged-in user grant themselves a membership. After
the migration, run this to see what is currently active:

```sql
SELECT id, user_id, status, expires_at, payment_amount, source, created_at
FROM public.memberships
WHERE status = 'active' AND expires_at > now()
ORDER BY created_at DESC;
```

Cross-check these against real Stripe customers. Anything with
`payment_amount = 0`, an implausibly distant `expires_at`, or no matching Stripe
subscription was forged. You do not have to delete them: `check-subscription`
now verifies every `source = 'stripe'` row against Stripe and expires the ones
with nothing behind them on the next check.

## Step 4 — redeploy the edge function

`check-subscription` was changed and needs redeploying for the Stripe
verification to take effect. The other two functions are untouched.

If Lovable handles your deploys, a deploy from Lovable picks it up. Otherwise:

```bash
supabase functions deploy check-subscription --project-ref nmsnsnfqufykwpesnjup
```

## Step 5 — the app build

`public/embed.js` ships as a static file. Vite copies everything in `public/`
to the build output untouched, so it is live at `https://your-app/embed.js`
after the next deploy. No build config change is needed.

## If you want migrations to apply themselves in future

Connect the repo in the Supabase dashboard under **Project Settings →
Integrations → GitHub**, pointing at this repository. After that, merging a
migration file to the default branch applies it automatically, and the
dashboard stops saying "not connected to a repository."

Worth knowing before you turn it on: it will try to reconcile the 35 existing
migration files against a database where they were already applied out-of-band.
Do that on a Supabase branch first, not straight onto production.
