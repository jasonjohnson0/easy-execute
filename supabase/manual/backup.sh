#!/usr/bin/env bash
#
# Takes a portable backup of the Easy Execute database before applying the
# pending migrations.
#
#   ./backup.sh 'postgresql://postgres:PASSWORD@db.nmsnsnfqufykwpesnjup.supabase.co:5432/postgres'
#
# or set DATABASE_URL and run it with no arguments.
#
# Where to get that string:
#   Supabase dashboard -> Project Settings -> Database -> Connection string ->
#   URI. Use the DIRECT connection (port 5432), not the transaction pooler
#   (6543); pg_dump needs a session, and the pooler will not give it one.
#   The password is your database password, not the anon or service_role key.
#
# READ THIS FIRST. A pg_dump run as the postgres role is a portable copy of your
# data, and it is worth having. It is NOT a complete project backup: Supabase
# internals (auth schema tables owned by supabase_auth_admin, storage objects,
# vault secrets, realtime config) are partly or wholly outside what this role can
# read. For a true restore point, use the dashboard as well:
#
#   Database -> Backups        daily snapshots, and Point-in-Time Recovery on Pro
#
# Do both. This script is the copy you can grep, diff, and load somewhere else.
# The dashboard snapshot is the one that can actually put the project back.

set -euo pipefail

DB_URL="${1:-${DATABASE_URL:-}}"

if [[ -z "$DB_URL" ]]; then
  echo "error: no connection string." >&2
  echo "usage: $0 'postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres'" >&2
  echo "   or: DATABASE_URL='...' $0" >&2
  exit 2
fi

for tool in pg_dump psql; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "error: $tool not found." >&2
    echo "  macOS:         brew install libpq && brew link --force libpq" >&2
    echo "  Debian/Ubuntu: sudo apt-get install postgresql-client" >&2
    echo "  Windows:       install PostgreSQL and add its bin/ to PATH" >&2
    exit 2
  fi
done

if [[ "$DB_URL" == *":6543"* ]]; then
  echo "error: that is the transaction pooler (port 6543). pg_dump needs the" >&2
  echo "       direct connection on port 5432." >&2
  exit 2
fi

echo "==> checking connection"
SERVER_VERSION="$(psql "$DB_URL" -X -t -A -c "SHOW server_version;" 2>/dev/null || true)"
if [[ -z "$SERVER_VERSION" ]]; then
  echo "error: could not connect. Check the host, password, and that your IP is" >&2
  echo "       allowed under Project Settings -> Database -> Network Restrictions." >&2
  exit 1
fi

SERVER_MAJOR="${SERVER_VERSION%%.*}"
DUMP_MAJOR="$(pg_dump --version | sed -E 's/.* ([0-9]+).*/\1/')"
echo "    server postgres $SERVER_VERSION / local pg_dump $DUMP_MAJOR"

# pg_dump refuses to dump from a server newer than itself. The reverse is fine.
if (( DUMP_MAJOR < SERVER_MAJOR )); then
  echo "error: pg_dump $DUMP_MAJOR is older than the server ($SERVER_MAJOR) and will refuse." >&2
  echo "       Install a client of $SERVER_MAJOR or newer, then re-run." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/easy-execute-${STAMP}"
mkdir -p "$OUT"
echo "==> writing to $OUT"

# Custom format: compressed, and pg_restore can pull single objects out of it.
echo "==> dumping public schema (custom format)"
pg_dump "$DB_URL" --schema=public --no-owner --no-privileges \
  --format=custom --file="$OUT/public.dump"

# Plain SQL of the same thing, so you can read and grep it without pg_restore.
echo "==> dumping public schema (plain sql)"
pg_dump "$DB_URL" --schema=public --no-owner --no-privileges \
  --format=plain --file="$OUT/public.sql"

# Schema-only, the cleanest thing to diff against a later dump.
echo "==> dumping public schema (structure only)"
pg_dump "$DB_URL" --schema=public --no-owner --no-privileges \
  --schema-only --format=plain --file="$OUT/public-schema-only.sql"

# auth.users is your account list and matters more than anything in public.
# Parts of the auth schema are owned by supabase_auth_admin and may be refused;
# that is expected and not a reason to stop.
echo "==> dumping auth schema (best effort)"
if pg_dump "$DB_URL" --schema=auth --no-owner --no-privileges \
     --format=plain --file="$OUT/auth.sql" 2>"$OUT/auth-dump-errors.txt"; then
  echo "    ok"
else
  echo "    partial or refused; see $OUT/auth-dump-errors.txt"
  echo "    your users still exist in Supabase -- this only limits the portable copy"
fi

# The state these migrations change, recorded so you can diff it afterwards.
echo "==> recording current policy and function inventory"
psql "$DB_URL" -X -o "$OUT/pre-change-inventory.txt" <<'SQL'
\echo === RLS policies ===
SELECT schemaname, tablename, policyname, cmd, coalesce(qual,'-') AS using_expr,
       coalesce(with_check,'-') AS with_check
FROM pg_policies WHERE schemaname='public' ORDER BY tablename, cmd, policyname;

\echo === functions ===
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args,
       CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'invoker' END AS security
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' ORDER BY 1,2;

\echo === table grants for anon and authenticated ===
SELECT table_name, grantee, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privs
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN ('anon','authenticated')
GROUP BY table_name, grantee ORDER BY table_name, grantee;

\echo === row counts ===
SELECT relname, n_live_tup AS approx_rows
FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY relname;
SQL

echo "==> verifying the dump"
FAIL=0

for f in public.dump public.sql public-schema-only.sql pre-change-inventory.txt; do
  if [[ ! -s "$OUT/$f" ]]; then
    echo "    FAIL  $f is missing or empty"
    FAIL=1
  fi
done

# The dump is only useful if the tables that matter are actually in it.
MISSING=""
for t in businesses deals memberships user_roles user_profiles sponsored_offers; do
  if ! pg_restore --list "$OUT/public.dump" 2>/dev/null | grep -q " $t\b"; then
    MISSING="$MISSING $t"
  fi
done
if [[ -n "$MISSING" ]]; then
  echo "    FAIL  tables absent from the dump:$MISSING"
  FAIL=1
fi

if (( FAIL )); then
  echo
  echo "BACKUP INCOMPLETE -- do not run the migrations yet." >&2
  exit 1
fi

SIZE="$(du -sh "$OUT" | cut -f1)"
echo "    OK  all files present, expected tables found"
echo
echo "Backup complete: $OUT ($SIZE)"
ls -la "$OUT"
cat <<EOF

Before you run the migrations, also take a dashboard snapshot:
  Supabase -> Database -> Backups

To see exactly what the migrations changed, re-run the inventory query
afterwards and diff it against $OUT/pre-change-inventory.txt.

To undo the two migrations without a full restore, run rollback.sql from this
same directory -- it reverses precisely what they do.

To restore a single table from this backup:
  pg_restore --data-only --table=memberships -d "\$DATABASE_URL" $OUT/public.dump

Restoring the whole thing over a live Supabase project is disruptive and not
something to reach for casually. Prefer the dashboard snapshot, or load this
dump into a fresh project or a Supabase branch and compare.
EOF
