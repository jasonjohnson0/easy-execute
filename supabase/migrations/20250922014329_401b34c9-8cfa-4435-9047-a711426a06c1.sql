-- Enable real-time for analytics tables
ALTER TABLE public.qr_scans REPLICA IDENTITY FULL;
ALTER TABLE public.share_clicks REPLICA IDENTITY FULL;
ALTER TABLE public.deals REPLICA IDENTITY FULL;
ALTER TABLE public.businesses REPLICA IDENTITY FULL;

-- Add tables to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE qr_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE share_clicks;
ALTER PUBLICATION supabase_realtime ADD TABLE deals;
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;