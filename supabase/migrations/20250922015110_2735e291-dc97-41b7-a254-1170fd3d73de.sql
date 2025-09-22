-- Create user_status table to track banned/disabled users
CREATE TABLE IF NOT EXISTS public.user_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'disabled')),
    banned_until timestamptz,
    ban_reason text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

-- Admin can manage all user statuses
CREATE POLICY "Admins can manage user status" 
ON public.user_status 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to ban users
CREATE OR REPLACE FUNCTION public.admin_ban_user(
    target_user_id uuid, 
    ban_duration_hours integer DEFAULT NULL,
    reason text DEFAULT 'No reason provided'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Insert or update user status
    INSERT INTO public.user_status (user_id, status, banned_until, ban_reason, created_by)
    VALUES (
        target_user_id, 
        'banned',
        CASE 
            WHEN ban_duration_hours IS NULL THEN '2099-12-31'::timestamptz
            ELSE now() + (ban_duration_hours || ' hours')::interval
        END,
        reason,
        auth.uid()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        status = 'banned',
        banned_until = CASE 
            WHEN ban_duration_hours IS NULL THEN '2099-12-31'::timestamptz
            ELSE now() + (ban_duration_hours || ' hours')::interval
        END,
        ban_reason = reason,
        updated_at = now();

    RETURN true;
END;
$$;

-- Create function to unban users
CREATE OR REPLACE FUNCTION public.admin_unban_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Update user status to active
    INSERT INTO public.user_status (user_id, status, created_by)
    VALUES (target_user_id, 'active', auth.uid())
    ON CONFLICT (user_id) 
    DO UPDATE SET
        status = 'active',
        banned_until = NULL,
        ban_reason = NULL,
        updated_at = now();

    RETURN true;
END;
$$;

-- Create function to disable users
CREATE OR REPLACE FUNCTION public.admin_disable_user(
    target_user_id uuid,
    reason text DEFAULT 'Account disabled by administrator'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Set user status to disabled
    INSERT INTO public.user_status (user_id, status, ban_reason, created_by)
    VALUES (target_user_id, 'disabled', reason, auth.uid())
    ON CONFLICT (user_id) 
    DO UPDATE SET
        status = 'disabled',
        ban_reason = reason,
        updated_at = now();

    RETURN true;
END;
$$;

-- Update the get_all_users function to include user status
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
            'id', user_data.id,
            'email', user_data.email,
            'created_at', user_data.created_at,
            'email_confirmed_at', user_data.email_confirmed_at,
            'last_sign_in_at', user_data.last_sign_in_at,
            'role', user_data.role,
            'user_profile', user_data.referral_code,
            'business_profile', user_data.business_profile,
            'status', COALESCE(user_data.status, 'active'),
            'banned_until', user_data.banned_until,
            'ban_reason', user_data.ban_reason
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
            END as business_profile,
            us.status,
            us.banned_until,
            us.ban_reason
        FROM auth.users au
        LEFT JOIN public.user_roles ur ON au.id = ur.user_id
        LEFT JOIN public.user_profiles up ON au.id = up.id
        LEFT JOIN public.businesses b ON au.id = b.id
        LEFT JOIN public.user_status us ON au.id = us.user_id
    ) user_data;

    RETURN COALESCE(result, '[]'::json);
END;
$$;