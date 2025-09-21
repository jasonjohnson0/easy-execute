-- Drop the overly permissive policy
DROP POLICY "Public can count businesses for statistics" ON public.businesses;

-- Create a security definer function for public business counting
-- This allows counting without exposing business data
CREATE OR REPLACE FUNCTION public.get_business_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.businesses;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Grant execute permission to public (anon users)
GRANT EXECUTE ON FUNCTION public.get_business_count() TO anon;