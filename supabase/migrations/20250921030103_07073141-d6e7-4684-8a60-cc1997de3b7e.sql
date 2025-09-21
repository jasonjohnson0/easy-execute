-- Fix the security definer view issue by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.businesses_public;

-- Create a regular view without security definer (safer approach)
CREATE VIEW public.businesses_public AS 
SELECT 
  id,
  name,
  category,
  description,
  logo_url,
  created_at
FROM public.businesses
WHERE true; -- This will respect RLS policies

-- Create RLS policy for the view access
CREATE POLICY "Anyone can view public business info" 
ON public.businesses_public 
FOR SELECT 
USING (true);

-- Remove the unnecessary security definer function since we're using the view approach
DROP FUNCTION IF EXISTS public.get_public_business_info(public.businesses);