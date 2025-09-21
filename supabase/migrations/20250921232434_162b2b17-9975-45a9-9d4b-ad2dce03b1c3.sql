-- Update the get_deals_with_safe_business_info function to require authentication
CREATE OR REPLACE FUNCTION public.get_deals_with_safe_business_info()
 RETURNS TABLE(id uuid, business_id uuid, title text, description text, discount_value text, discount_type text, terms text, expires_at timestamp with time zone, is_active boolean, views integer, prints integer, created_at timestamp with time zone, business_name text, business_category text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE d.is_active = true 
    AND d.expires_at > now()
    AND auth.uid() IS NOT NULL  -- Require authentication
  ORDER BY d.created_at DESC;
$function$