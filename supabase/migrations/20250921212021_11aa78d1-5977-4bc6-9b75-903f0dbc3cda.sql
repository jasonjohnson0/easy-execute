-- First, let's see what policies currently exist and clean them up properly
DROP POLICY IF EXISTS "Restrict sensitive business data access" ON public.businesses;
DROP POLICY IF EXISTS "Public can view safe business info only" ON public.businesses;

-- The "Business owners can view their full profile" policy already exists, so we'll keep it

-- Remove any public access policy if it exists
DROP POLICY IF EXISTS "Public can view basic business info" ON public.businesses;

-- Revoke direct table access for anonymous users and grant function access instead
REVOKE SELECT ON public.businesses FROM anon;
GRANT EXECUTE ON FUNCTION public.get_safe_businesses() TO anon;
GRANT EXECUTE ON FUNCTION public.get_safe_businesses() TO authenticated;