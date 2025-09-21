-- Fix the get_all_users function to handle ORDER BY correctly with json_agg
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result json;
BEGIN
    -- Check if user is platform admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Fix: Move ORDER BY inside the json_agg to avoid GROUP BY issues
    SELECT json_agg(
        json_build_object(
            'id', user_data.id,
            'email', user_data.email,
            'created_at', user_data.created_at,
            'email_confirmed_at', user_data.email_confirmed_at,
            'last_sign_in_at', user_data.last_sign_in_at,
            'role', user_data.role,
            'user_profile', user_data.referral_code,
            'business_profile', user_data.business_profile
        ) ORDER BY user_data.created_at DESC
    ) INTO result
    FROM (
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.email_confirmed_at,
            au.last_sign_in_at,
            COALESCE(ur.role, 'user') as role,
            up.referral_code,
            CASE WHEN b.id IS NOT NULL THEN 
                json_build_object(
                    'business_name', b.name,
                    'category', b.category,
                    'subscription_status', b.subscription_status,
                    'subscription_plan', b.subscription_plan
                ) 
                ELSE null 
            END as business_profile
        FROM auth.users au
        LEFT JOIN public.user_roles ur ON au.id = ur.user_id
        LEFT JOIN public.user_profiles up ON au.id = up.id
        LEFT JOIN public.businesses b ON au.id = b.id
    ) user_data;

    RETURN COALESCE(result, '[]'::json);
END;
$function$