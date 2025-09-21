-- Create a final, more restrictive RLS policy that prevents direct access to sensitive fields
DROP POLICY IF EXISTS "Restrict sensitive business data access" ON public.businesses;

-- Create policies that separate business owner access from public access clearly
CREATE POLICY "Business owners can view their full profile" 
ON public.businesses 
FOR SELECT 
USING (auth.uid() = id);

-- No public policy - this means public users cannot directly query the businesses table
-- They must use the secure RPC function instead
REVOKE SELECT ON public.businesses FROM anon;
GRANT EXECUTE ON FUNCTION public.get_safe_businesses() TO anon;
GRANT EXECUTE ON FUNCTION public.get_safe_businesses() TO authenticated;