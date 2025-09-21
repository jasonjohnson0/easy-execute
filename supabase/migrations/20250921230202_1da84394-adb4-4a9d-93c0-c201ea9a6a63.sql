-- Drop the existing public policy that allows unauthenticated access
DROP POLICY IF EXISTS "Public can view active deals for browsing" ON deals;

-- Create a new policy that requires authentication to view deals
CREATE POLICY "Authenticated users can view active deals" 
ON deals 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true AND expires_at > now());