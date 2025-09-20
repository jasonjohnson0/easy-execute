-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  category TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'unpaid')),
  subscription_plan TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  referral_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for businesses
CREATE POLICY "Businesses can view their own profile" ON public.businesses
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Businesses can update their own profile" ON public.businesses
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert business profile" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_value TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo')),
  terms TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  prints INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies for deals
CREATE POLICY "Anyone can view active deals" ON public.deals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can view their own deals" ON public.deals
  FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "Business owners can create deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Business owners can update their own deals" ON public.deals
  FOR UPDATE USING (auth.uid() = business_id);

CREATE POLICY "Business owners can delete their own deals" ON public.deals
  FOR DELETE USING (auth.uid() = business_id);

-- Create sponsored_offers table
CREATE TABLE public.sponsored_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('banner', 'coupon')),
  banner_image_url TEXT,
  banner_link_url TEXT,
  discount_value TEXT,
  discount_type TEXT,
  terms TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sponsored_offers
ALTER TABLE public.sponsored_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsored_offers
CREATE POLICY "Anyone can view active sponsored offers" ON public.sponsored_offers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can view their own sponsored offers" ON public.sponsored_offers
  FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "Business owners can create sponsored offers" ON public.sponsored_offers
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Business owners can update their own sponsored offers" ON public.sponsored_offers
  FOR UPDATE USING (auth.uid() = business_id);

CREATE POLICY "Business owners can delete their own sponsored offers" ON public.sponsored_offers
  FOR DELETE USING (auth.uid() = business_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsored_offers_updated_at
  BEFORE UPDATE ON public.sponsored_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_deals_business_id ON public.deals(business_id);
CREATE INDEX idx_deals_is_active ON public.deals(is_active);
CREATE INDEX idx_deals_expires_at ON public.deals(expires_at);
CREATE INDEX idx_sponsored_offers_business_id ON public.sponsored_offers(business_id);
CREATE INDEX idx_sponsored_offers_is_active ON public.sponsored_offers(is_active);