-- Add user status and blocking functionality
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS banned_until timestamptz;

-- Create function to ban/unban users
CREATE OR REPLACE FUNCTION public.ban_user(target_user_id uuid, ban_duration_hours integer DEFAULT NULL)
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

    -- Update user's ban status
    IF ban_duration_hours IS NULL THEN
        -- Permanent ban
        UPDATE auth.users 
        SET banned_until = '2099-12-31'::timestamptz
        WHERE id = target_user_id;
    ELSE
        -- Temporary ban
        UPDATE auth.users 
        SET banned_until = now() + (ban_duration_hours || ' hours')::interval
        WHERE id = target_user_id;
    END IF;

    RETURN true;
END;
$$;

-- Create function to unban users
CREATE OR REPLACE FUNCTION public.unban_user(target_user_id uuid)
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

    -- Remove ban
    UPDATE auth.users 
    SET banned_until = NULL
    WHERE id = target_user_id;

    RETURN true;
END;
$$;

-- Create function to delete users (soft delete by disabling)
CREATE OR REPLACE FUNCTION public.disable_user(target_user_id uuid)
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

    -- Disable user by setting email_confirmed_at to null and banned_until to far future
    UPDATE auth.users 
    SET 
        email_confirmed_at = NULL,
        banned_until = '2099-12-31'::timestamptz
    WHERE id = target_user_id;

    RETURN true;
END;
$$;

-- Create function to update user profile data
CREATE OR REPLACE FUNCTION public.update_user_profile(
    target_user_id uuid,
    new_email text DEFAULT NULL,
    new_raw_user_meta_data jsonb DEFAULT NULL
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

    -- Update user data
    UPDATE auth.users 
    SET 
        email = COALESCE(new_email, email),
        raw_user_meta_data = COALESCE(new_raw_user_meta_data, raw_user_meta_data),
        updated_at = now()
    WHERE id = target_user_id;

    RETURN true;
END;
$$;