-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create QR scan tracking table
CREATE TABLE public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
    business_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on qr_scans
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- RLS policies for qr_scans
CREATE POLICY "Anyone can insert QR scans" 
ON public.qr_scans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Business owners can view their QR scans" 
ON public.qr_scans 
FOR SELECT 
USING (auth.uid() = business_id);

CREATE POLICY "Admins can view all QR scans" 
ON public.qr_scans 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create share clicks tracking table
CREATE TABLE public.share_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
    business_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    platform TEXT, -- 'twitter', 'facebook', 'whatsapp', 'copy', etc.
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on share_clicks
ALTER TABLE public.share_clicks ENABLE ROW LEVEL SECURITY;

-- RLS policies for share_clicks
CREATE POLICY "Anyone can insert share clicks" 
ON public.share_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Business owners can view their share clicks" 
ON public.share_clicks 
FOR SELECT 
USING (auth.uid() = business_id);

CREATE POLICY "Admins can view all share clicks" 
ON public.share_clicks 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_qr_scans_deal_id ON public.qr_scans(deal_id);
CREATE INDEX idx_qr_scans_business_id ON public.qr_scans(business_id);
CREATE INDEX idx_qr_scans_scanned_at ON public.qr_scans(scanned_at);

CREATE INDEX idx_share_clicks_deal_id ON public.share_clicks(deal_id);
CREATE INDEX idx_share_clicks_business_id ON public.share_clicks(business_id);
CREATE INDEX idx_share_clicks_clicked_at ON public.share_clicks(clicked_at);

-- Create analytics functions
CREATE OR REPLACE FUNCTION public.get_admin_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_users INTEGER;
    total_businesses INTEGER;
    total_deals INTEGER;
    active_deals INTEGER;
    inactive_deals INTEGER;
    total_qr_scans BIGINT;
    total_share_clicks BIGINT;
BEGIN
    -- Check if user is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Get user count from auth.users (using RPC to count)
    SELECT COUNT(*) INTO total_users FROM auth.users;
    
    -- Get business metrics
    SELECT COUNT(*) INTO total_businesses FROM public.businesses;
    
    -- Get deal metrics
    SELECT COUNT(*) INTO total_deals FROM public.deals;
    SELECT COUNT(*) INTO active_deals FROM public.deals WHERE is_active = true AND expires_at > now();
    SELECT COUNT(*) INTO inactive_deals FROM public.deals WHERE is_active = false OR expires_at <= now();
    
    -- Get analytics metrics
    SELECT COUNT(*) INTO total_qr_scans FROM public.qr_scans;
    SELECT COUNT(*) INTO total_share_clicks FROM public.share_clicks;

    RETURN json_build_object(
        'total_users', total_users,
        'total_businesses', total_businesses,
        'total_deals', total_deals,
        'active_deals', active_deals,
        'inactive_deals', inactive_deals,
        'total_qr_scans', total_qr_scans,
        'total_share_clicks', total_share_clicks
    );
END;
$$;

-- Create function to get QR scan analytics
CREATE OR REPLACE FUNCTION public.get_qr_scan_analytics(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT (now() - interval '30 days'),
    end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is admin or business owner
    IF NOT (public.has_role(auth.uid(), 'admin') OR EXISTS(SELECT 1 FROM public.businesses WHERE id = auth.uid())) THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'date', date_trunc('day', scanned_at),
            'scans', COUNT(*)
        ) ORDER BY date_trunc('day', scanned_at)
    ) INTO result
    FROM public.qr_scans
    WHERE scanned_at >= start_date AND scanned_at <= end_date
    AND (
        public.has_role(auth.uid(), 'admin') OR 
        business_id = auth.uid()
    )
    GROUP BY date_trunc('day', scanned_at);

    RETURN COALESCE(result, '[]'::json);
END;
$$;