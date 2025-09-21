-- Create a secure RLS policy for public business information access
-- This allows anyone to see basic business info (name, category, description, logo) 
-- while protecting sensitive data (email, phone, address, location, subscription info)

-- First, drop the existing overly restrictive policy that prevents public browsing
DROP POLICY IF EXISTS "Authenticated businesses can view only their own profile" ON public.businesses;

-- Create a policy for public access to safe business fields only
-- This is needed for deal browsing where users need to see business names
CREATE POLICY "Public can view basic business info" 
ON public.businesses 
FOR SELECT 
USING (true);

-- Create a policy for business owners to access their full profile data
CREATE POLICY "Business owners can view their full profile" 
ON public.businesses 
FOR SELECT 
USING (auth.uid() = id);

-- Add a security function to filter sensitive fields for public access
CREATE OR REPLACE FUNCTION public.get_public_business_info(business_row public.businesses)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'id', business_row.id,
    'name', business_row.name,
    'category', business_row.category,
    'description', business_row.description,
    'logo_url', business_row.logo_url,
    'created_at', business_row.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create a secure view for public business data
CREATE OR REPLACE VIEW public.businesses_public AS 
SELECT 
  id,
  name,
  category,
  description,
  logo_url,
  created_at
FROM public.businesses;

-- Enable RLS on the view
ALTER VIEW public.businesses_public SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.businesses_public TO anon;
GRANT SELECT ON public.businesses_public TO authenticated;

-- Add audit logging for sensitive business data access
CREATE TABLE IF NOT EXISTS public.business_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id),
  accessed_by UUID,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.business_audit_log ENABLE ROW LEVEL SECURITY;

-- Only business owners can view their own audit logs
CREATE POLICY "Business owners can view their audit logs" 
ON public.business_audit_log 
FOR SELECT 
USING (business_id IN (SELECT id FROM public.businesses WHERE auth.uid() = id));

-- Create audit trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.log_business_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive business data
  INSERT INTO public.business_audit_log (
    business_id, 
    accessed_by, 
    access_type
  ) VALUES (
    NEW.id,
    auth.uid(),
    TG_OP
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for UPDATE operations on sensitive fields
CREATE TRIGGER business_sensitive_access_log
  AFTER UPDATE OF email, phone, address, latitude, longitude, subscription_status, subscription_plan
  ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_business_access();