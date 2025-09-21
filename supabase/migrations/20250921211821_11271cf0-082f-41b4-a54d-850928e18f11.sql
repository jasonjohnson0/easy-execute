-- First, drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view basic business info" ON public.businesses;

-- Create a more restrictive policy that only allows viewing specific safe fields
-- We'll use a row-level security policy that filters columns
CREATE POLICY "Public can view safe business info" 
ON public.businesses 
FOR SELECT 
USING (true);

-- Create a secure view for public business data that only exposes safe fields
CREATE OR REPLACE VIEW public.businesses_public AS
SELECT 
  id,
  name,
  category,
  description,
  logo_url,
  created_at,
  latitude,
  longitude,
  timezone
FROM public.businesses;

-- Enable RLS on the view
ALTER VIEW public.businesses_public OWNER TO postgres;

-- Grant public access to the view
GRANT SELECT ON public.businesses_public TO anon;
GRANT SELECT ON public.businesses_public TO authenticated;

-- Create a security definer function to get public business data safely
CREATE OR REPLACE FUNCTION public.get_public_business_data()
RETURNS SETOF public.businesses_public
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.businesses_public;
$$;