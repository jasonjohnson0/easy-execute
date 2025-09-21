-- Create a function to get active deals count without authentication requirement
CREATE OR REPLACE FUNCTION public.get_active_deals_count()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INTEGER 
  FROM public.deals d
  WHERE d.is_active = true 
    AND d.expires_at > now();
$function$