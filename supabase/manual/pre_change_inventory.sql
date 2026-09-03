-- RUN IN THE SQL EDITOR before applying the migrations. Read-only.
--
-- This is the record-keeping half of backup.sh, rewritten to run in the
-- dashboard with no terminal. It captures the exact state of everything the
-- migrations touch -- policies, functions, grants, row counts -- as one result
-- set you can export to CSV and compare against afterwards.
--
-- It is NOT a data backup. It records structure, not rows. For your data,
-- either take a dashboard snapshot (Database -> Backups) or run backup.sh from
-- a terminal. Do one of those as well.
--
-- Export the result: run it, then use the download button above the results
-- grid to save CSV.

SELECT kind, name, detail
FROM (

  SELECT 1 AS sort, 'policy' AS kind,
         tablename || ' / ' || policyname AS name,
         cmd || ' | using: ' || coalesce(qual, '-')
             || ' | with check: ' || coalesce(with_check, '-') AS detail
  FROM pg_policies
  WHERE schemaname = 'public'

  UNION ALL

  SELECT 2, 'function',
         p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
         CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'invoker' END
             || ' | returns ' || pg_get_function_result(p.oid)
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'

  UNION ALL

  -- What the anon and authenticated roles can reach at the table level, before
  -- RLS is considered.
  SELECT 3, 'grant',
         table_name || ' / ' || grantee,
         string_agg(privilege_type, ',' ORDER BY privilege_type)
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
  GROUP BY table_name, grantee

  UNION ALL

  -- Approximate, from the planner's statistics. Good enough to notice if a
  -- table emptied out; not an exact count.
  SELECT 4, 'row count',
         relname,
         n_live_tup::text || ' rows (approx)'
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'

  UNION ALL

  SELECT 5, 'columns',
         table_name,
         string_agg(column_name, ', ' ORDER BY ordinal_position)
  FROM information_schema.columns
  WHERE table_schema = 'public'
  GROUP BY table_name

) inventory
ORDER BY sort, name;
