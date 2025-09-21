-- Add foreign key constraints to enable Supabase embedded queries

-- Add foreign key constraint from deals.business_id to businesses.id
ALTER TABLE public.deals 
ADD CONSTRAINT deals_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add foreign key constraint from sponsored_offers.business_id to businesses.id
ALTER TABLE public.sponsored_offers 
ADD CONSTRAINT sponsored_offers_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;