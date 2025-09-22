-- Create organizations table for referral partners
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  keyword TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.25,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memberships table to track $50 annual memberships
CREATE TABLE public.memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral conversions table to track successful referrals
CREATE TABLE public.referral_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL,
  membership_id UUID NOT NULL REFERENCES public.memberships(id),
  commission_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add referred_by_organization to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN referred_by_organization UUID REFERENCES public.organizations(id);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Anyone can view active organizations" 
ON public.organizations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage organizations" 
ON public.organizations 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for memberships
CREATE POLICY "Users can view their own memberships" 
ON public.memberships 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships" 
ON public.memberships 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own memberships" 
ON public.memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memberships" 
ON public.memberships 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral conversions
CREATE POLICY "Admins can view all referral conversions" 
ON public.referral_conversions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage referral conversions" 
ON public.referral_conversions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_organizations_keyword ON public.organizations(keyword);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON public.memberships(organization_id);
CREATE INDEX idx_referral_conversions_organization_id ON public.referral_conversions(organization_id);
CREATE INDEX idx_user_profiles_referred_by_organization ON public.user_profiles(referred_by_organization);

-- Create triggers for updating timestamps
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get referral analytics for admins
CREATE OR REPLACE FUNCTION public.get_referral_analytics(start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), end_date timestamp with time zone DEFAULT now())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    result json;
BEGIN
    -- Check if user is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    SELECT json_build_object(
        'organizations', (
            SELECT json_agg(
                json_build_object(
                    'id', o.id,
                    'name', o.name,
                    'keyword', o.keyword,
                    'contact_email', o.contact_email,
                    'commission_rate', o.commission_rate,
                    'total_referrals', o.total_referrals,
                    'total_earnings', o.total_earnings,
                    'is_active', o.is_active,
                    'created_at', o.created_at,
                    'recent_conversions', COALESCE(rc.recent_count, 0),
                    'recent_earnings', COALESCE(rc.recent_earnings, 0)
                ) ORDER BY o.created_at DESC
            )
            FROM public.organizations o
            LEFT JOIN (
                SELECT 
                    organization_id,
                    COUNT(*) as recent_count,
                    SUM(commission_amount) as recent_earnings
                FROM public.referral_conversions
                WHERE created_at >= start_date AND created_at <= end_date
                GROUP BY organization_id
            ) rc ON o.id = rc.organization_id
        ),
        'total_conversions', (
            SELECT COUNT(*) FROM public.referral_conversions
            WHERE created_at >= start_date AND created_at <= end_date
        ),
        'total_commission_paid', (
            SELECT COALESCE(SUM(commission_amount), 0) FROM public.referral_conversions
            WHERE created_at >= start_date AND created_at <= end_date
        ),
        'active_memberships', (
            SELECT COUNT(*) FROM public.memberships
            WHERE status = 'active' AND expires_at > now()
        )
    ) INTO result;

    RETURN COALESCE(result, '{}'::json);
END;
$function$;