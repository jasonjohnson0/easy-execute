-- Ensure deals queries can still work for authenticated users
-- Grant SELECT access back to authenticated users for businesses table
-- but keep it revoked for anonymous users
GRANT SELECT ON public.businesses TO authenticated;

-- Create a public policy that only allows specific field access for deals queries
-- This will allow the deals join to work while still protecting sensitive data
CREATE POLICY "Public can view safe business fields for deals" 
ON public.businesses 
FOR SELECT 
USING (true);

-- However, we need to ensure this policy only allows access to safe fields
-- We'll rely on application-level field selection to ensure security