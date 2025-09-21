-- Create a simple view without RLS policies (views inherit RLS from underlying tables)
CREATE VIEW public.businesses_public AS 
SELECT 
  id,
  name,
  category,
  description,
  logo_url,
  created_at
FROM public.businesses;

-- Grant access to the public view
GRANT SELECT ON public.businesses_public TO anon;
GRANT SELECT ON public.businesses_public TO authenticated;

-- The existing RLS policies on businesses table will handle access control