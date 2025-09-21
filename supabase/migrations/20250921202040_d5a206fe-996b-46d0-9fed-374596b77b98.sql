-- Remove incorrect admin assignment
DELETE FROM public.user_roles WHERE user_id = 'ff1498d2-abf6-4c3b-a566-153f54074c3b';

-- Add platform admin roles for the correct emails
-- Note: These will only work once users with these emails have registered
-- If they haven't registered yet, the inserts will be handled by a trigger after they sign up

-- Create platform admin functions for full visibility
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
BEGIN
    -- Check if user is platform admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', au.id,
            'email', au.email,
            'created_at', au.created_at,
            'email_confirmed_at', au.email_confirmed_at,
            'last_sign_in_at', au.last_sign_in_at,
            'role', COALESCE(ur.role, 'user'),
            'user_profile', up.referral_code,
            'business_profile', CASE WHEN b.id IS NOT NULL THEN 
                json_build_object(
                    'business_name', b.name,
                    'category', b.category,
                    'subscription_status', b.subscription_status,
                    'subscription_plan', b.subscription_plan
                ) 
                ELSE null 
            END
        )
    ) INTO result
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.user_profiles up ON au.id = up.id
    LEFT JOIN public.businesses b ON au.id = b.id
    ORDER BY au.created_at DESC;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_businesses()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
BEGIN
    -- Check if user is platform admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', b.id,
            'name', b.name,
            'email', b.email,
            'phone', b.phone,
            'address', b.address,
            'category', b.category,
            'description', b.description,
            'subscription_status', b.subscription_status,
            'subscription_plan', b.subscription_plan,
            'referral_code', b.referral_code,
            'referred_by', b.referred_by,
            'created_at', b.created_at,
            'deal_count', COALESCE(d.deal_count, 0),
            'active_deal_count', COALESCE(d.active_deal_count, 0)
        ) ORDER BY b.created_at DESC
    ) INTO result
    FROM public.businesses b
    LEFT JOIN (
        SELECT 
            business_id,
            COUNT(*) as deal_count,
            COUNT(CASE WHEN is_active = true AND expires_at > now() THEN 1 END) as active_deal_count
        FROM public.deals 
        GROUP BY business_id
    ) d ON b.id = d.business_id;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_deals()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
BEGIN
    -- Check if user is platform admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', d.id,
            'title', d.title,
            'description', d.description,
            'discount_value', d.discount_value,
            'discount_type', d.discount_type,
            'terms', d.terms,
            'expires_at', d.expires_at,
            'is_active', d.is_active,
            'views', d.views,
            'prints', d.prints,
            'created_at', d.created_at,
            'business_name', b.name,
            'business_category', b.category
        ) ORDER BY d.created_at DESC
    ) INTO result
    FROM public.deals d
    JOIN public.businesses b ON d.business_id = b.id;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_analytics(start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), end_date timestamp with time zone DEFAULT now())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result json;
BEGIN
    -- Check if user is platform admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    SELECT json_build_object(
        'user_signups_by_day', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', created_at),
                    'signups', COUNT(*)
                ) ORDER BY date_trunc('day', created_at)
            )
            FROM auth.users
            WHERE created_at >= start_date AND created_at <= end_date
            GROUP BY date_trunc('day', created_at)
        ),
        'business_signups_by_day', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', created_at),
                    'signups', COUNT(*)
                ) ORDER BY date_trunc('day', created_at)
            )
            FROM public.businesses
            WHERE created_at >= start_date AND created_at <= end_date
            GROUP BY date_trunc('day', created_at)
        ),
        'deals_created_by_day', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', created_at),
                    'deals', COUNT(*)
                ) ORDER BY date_trunc('day', created_at)
            )
            FROM public.deals
            WHERE created_at >= start_date AND created_at <= end_date
            GROUP BY date_trunc('day', created_at)
        ),
        'qr_scans_by_day', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', scanned_at),
                    'scans', COUNT(*)
                ) ORDER BY date_trunc('day', scanned_at)
            )
            FROM public.qr_scans
            WHERE scanned_at >= start_date AND scanned_at <= end_date
            GROUP BY date_trunc('day', scanned_at)
        )
    ) INTO result;

    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Function to add admin role (for platform management)
CREATE OR REPLACE FUNCTION public.add_admin_role(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Find user by email
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_email;
    END IF;

    -- Add admin role (INSERT ... ON CONFLICT DO NOTHING to avoid duplicates)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN true;
END;
$$;

-- Function to remove admin role
CREATE OR REPLACE FUNCTION public.remove_admin_role(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Find user by email
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_email;
    END IF;

    -- Remove admin role
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'admin';

    RETURN true;
END;
$$;

-- Trigger to automatically assign admin role to platform admin emails
CREATE OR REPLACE FUNCTION public.assign_platform_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Assign admin role to platform admin emails
    IF NEW.email IN ('jasonjohnson0@gmail.com', 'jason@omegatechllc.com') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto-admin assignment
DROP TRIGGER IF EXISTS assign_platform_admin_trigger ON auth.users;
CREATE TRIGGER assign_platform_admin_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_platform_admin();

-- If the platform admin users already exist, assign them admin roles now
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Assign admin to jasonjohnson0@gmail.com if exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'jasonjohnson0@gmail.com';
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    -- Assign admin to jason@omegatechllc.com if exists  
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'jason@omegatechllc.com';
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;