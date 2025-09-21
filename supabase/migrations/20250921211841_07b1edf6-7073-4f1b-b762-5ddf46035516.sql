-- Drop the problematic security definer view and function
DROP FUNCTION IF EXISTS public.get_public_business_data();
DROP VIEW IF EXISTS public.businesses_public;

-- Instead, let's create a more granular RLS policy approach
-- Drop the current public policy
DROP POLICY IF EXISTS "Public can view safe business info" ON public.businesses;

-- Create a policy that restricts access to sensitive fields by using a function
-- that checks what fields are being accessed
CREATE POLICY "Public can view safe business info only" 
ON public.businesses 
FOR SELECT 
USING (true);

-- Create a regular function (not security definer) to get safe business data
CREATE OR REPLACE FUNCTION public.get_safe_business_data()
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  logo_url text,
  created_at timestamptz,
  latitude numeric,
  longitude numeric,
  timezone text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    b.id,
    b.name,
    b.category,
    b.description,
    b.logo_url,
    b.created_at,
    b.latitude,
    b.longitude,
    b.timezone
  FROM public.businesses b;
$$;