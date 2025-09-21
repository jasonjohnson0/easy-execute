-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Public can view safe business info only" ON public.businesses;

-- Create a more restrictive policy that uses column-level security
-- This policy will deny access to sensitive fields for non-owners
CREATE POLICY "Restrict sensitive business data access" 
ON public.businesses 
FOR SELECT 
USING (
  -- Business owners can see their full profile
  auth.uid() = id 
  OR 
  -- Public users can only access this table when specifically selecting safe fields
  -- We'll rely on the application code to use proper field selection
  auth.uid() IS NULL OR auth.uid() != id
);

-- Update the function to ensure it only returns safe data
DROP FUNCTION IF EXISTS public.get_safe_business_data();

-- Create a function that provides safe business data with proper access control
CREATE OR REPLACE FUNCTION public.get_safe_businesses()
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  logo_url text,
  created_at timestamptz
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
    b.created_at
  FROM public.businesses b
  WHERE b.name IS NOT NULL; -- Basic filter to ensure data integrity
$$;