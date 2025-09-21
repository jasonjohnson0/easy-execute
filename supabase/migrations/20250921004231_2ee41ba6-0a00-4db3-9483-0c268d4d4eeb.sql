-- Fix RLS security issue: Remove the overly permissive "Anyone can view active deals" policy
-- This was allowing business users to see each other's deals

DROP POLICY IF EXISTS "Anyone can view active deals" ON public.deals;

-- Create a specific policy for public deal viewing (for consumers/homepage)
-- This will be used when we implement the public-facing deal browsing feature
CREATE POLICY "Public can view active deals for browsing" 
ON public.deals 
FOR SELECT 
TO anon, authenticated
USING (is_active = true AND expires_at > now());

-- Update the business owner policy to be more explicit
DROP POLICY IF EXISTS "Business owners can view their own deals" ON public.deals;

CREATE POLICY "Authenticated business owners can view only their own deals" 
ON public.deals 
FOR SELECT 
TO authenticated
USING (auth.uid() = business_id);

-- Ensure businesses can only see their own profiles  
DROP POLICY IF EXISTS "Businesses can view their own profile" ON public.businesses;

CREATE POLICY "Authenticated businesses can view only their own profile" 
ON public.businesses 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);