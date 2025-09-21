-- Update default subscription status for businesses to 'active' instead of 'trial'
-- and update existing trial businesses to active
UPDATE public.businesses 
SET subscription_status = 'active'
WHERE subscription_status = 'trial';

-- Update the default value for new businesses
ALTER TABLE public.businesses 
ALTER COLUMN subscription_status SET DEFAULT 'active';