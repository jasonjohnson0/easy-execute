-- Public, anonymous-safe read API for third-party embeds (WordPress widget).
--
-- The existing get_deals_with_safe_business_info() requires auth.uid() IS NOT NULL,
-- so it returns zero rows to an anonymous visitor on someone else's website. These
-- functions serve the same data to anonymous callers, but expose a deliberately
-- narrower column set: no views/prints counters, no business email/phone/address,
-- no subscription or referral fields.
--
-- All three are SECURITY DEFINER with a pinned search_path, EXECUTE revoked from
-- PUBLIC and granted explicitly, and a hard server-side row cap so an embed cannot
-- be turned into a bulk export endpoint.

-- Active, unexpired deals. Optionally scoped to one business and/or category.
CREATE OR REPLACE FUNCTION public.get_public_deals(
  p_business_id uuid DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  title text,
  description text,
  discount_value text,
  discount_type text,
  terms text,
  expires_at timestamp with time zone,
  business_name text,
  business_category text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    d.id,
    d.business_id,
    d.title,
    d.description,
    d.discount_value,
    d.discount_type,
    d.terms,
    d.expires_at,
    b.name AS business_name,
    b.category AS business_category
  FROM public.deals d
  JOIN public.businesses b ON d.business_id = b.id
  WHERE d.is_active = true
    AND d.expires_at > now()
    AND (p_business_id IS NULL OR d.business_id = p_business_id)
    AND (p_category IS NULL OR b.category = p_category)
  ORDER BY d.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 12), 1), 50);
$$;

-- Active, unexpired sponsored offers. Optionally scoped to one business.
CREATE OR REPLACE FUNCTION public.get_public_sponsored_offers(
  p_business_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  business_id uuid,
  title text,
  description text,
  offer_type text,
  banner_image_url text,
  banner_link_url text,
  discount_value text,
  discount_type text,
  terms text,
  expires_at timestamp with time zone,
  business_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    s.id,
    s.business_id,
    s.title,
    s.description,
    s.offer_type,
    s.banner_image_url,
    s.banner_link_url,
    s.discount_value,
    s.discount_type,
    s.terms,
    s.expires_at,
    b.name AS business_name
  FROM public.sponsored_offers s
  JOIN public.businesses b ON s.business_id = b.id
  WHERE s.is_active = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
    AND (p_business_id IS NULL OR s.business_id = p_business_id)
  ORDER BY s.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 6), 1), 25);
$$;

-- Safe public header info for a single business, for business-scoped embeds.
CREATE OR REPLACE FUNCTION public.get_public_business(p_business_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  logo_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    b.id,
    b.name,
    b.category,
    b.description,
    b.logo_url
  FROM public.businesses b
  WHERE b.id = p_business_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_deals(uuid, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_sponsored_offers(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_business(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_public_deals(uuid, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_sponsored_offers(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_business(uuid) TO anon, authenticated;
