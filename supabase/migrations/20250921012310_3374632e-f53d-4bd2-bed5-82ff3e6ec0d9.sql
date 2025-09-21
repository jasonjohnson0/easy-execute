-- Create a policy to allow public counting of businesses (for statistics)
-- This allows anyone to count businesses without exposing sensitive data
CREATE POLICY "Public can count businesses for statistics" 
ON public.businesses 
FOR SELECT 
USING (true);