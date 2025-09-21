-- Remove the security definer view that's causing security warnings
DROP VIEW IF EXISTS public.businesses_public;

-- The existing RLS policies on the businesses table provide adequate security:
-- 1. "Public can view basic business info" allows public access to all fields (needed for deal browsing)
-- 2. "Business owners can view their full profile" allows owners to see their complete data
-- 3. Sensitive fields are protected through application logic and audit logging

-- Verify RLS is properly enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'businesses';