-- Remove the overly permissive policy we just created
DROP POLICY IF EXISTS "Public can view safe business fields for deals" ON public.businesses;

-- Create a secure function specifically for deals that only returns safe business data
CREATE OR REPLACE FUNCTION public.get_deals_with_safe_business_info()
RETURNS TABLE (
  id uuid,
  business_id uuid,
  title text,
  description text,
  discount_value text,
  discount_type text,
  terms text,
  expires_at timestamptz,
  is_active boolean,
  views integer,
  prints integer,
  created_at timestamptz,
  business_name text,
  business_category text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    d.id,
    d.business_id,
    d.title,
    d.description,
    d.discount_value,
    d.discount_type,
    d.terms,
    d.expires_at,
    d.is_active,
    d.views,
    d.prints,
    d.created_at,
    b.name as business_name,
    b.category as business_category
  FROM public.deals d
  JOIN public.businesses b ON d.business_id = b.id
  WHERE d.is_active = true;
$$;

-- Grant access to the secure function
GRANT EXECUTE ON FUNCTION public.get_deals_with_safe_business_info() TO anon;
GRANT EXECUTE ON FUNCTION public.get_deals_with_safe_business_info() TO authenticated;