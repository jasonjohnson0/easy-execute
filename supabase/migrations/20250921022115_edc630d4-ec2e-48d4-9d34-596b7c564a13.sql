-- Create business hours table
CREATE TABLE public.business_hours (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time,
  close_time time,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(business_id, day_of_week)
);

-- Add location columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN latitude decimal(10,8),
ADD COLUMN longitude decimal(11,8),
ADD COLUMN timezone text DEFAULT 'America/New_York';

-- Enable RLS on business_hours
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_hours
CREATE POLICY "Business owners can manage their hours"
ON public.business_hours
FOR ALL
USING (auth.uid() = business_id);

CREATE POLICY "Anyone can view business hours"
ON public.business_hours
FOR SELECT
USING (true);

-- Create function to check if business is open now
CREATE OR REPLACE FUNCTION public.is_business_open_now(business_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_hours bh
    JOIN businesses b ON b.id = bh.business_id
    WHERE bh.business_id = business_uuid
    AND bh.day_of_week = EXTRACT(DOW FROM (now() AT TIME ZONE COALESCE(b.timezone, 'America/New_York')))
    AND bh.is_closed = false
    AND bh.open_time <= (now() AT TIME ZONE COALESCE(b.timezone, 'America/New_York'))::time
    AND bh.close_time > (now() AT TIME ZONE COALESCE(b.timezone, 'America/New_York'))::time
  );
$$;

-- Create function to calculate distance between coordinates (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 decimal, lon1 decimal, lat2 decimal, lon2 decimal)
RETURNS decimal
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    3959 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  )::decimal(10,2);
$$;