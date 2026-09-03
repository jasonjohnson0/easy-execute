-- RUN AFTER the migrations. Read-only: this changes nothing.
--
-- While the "Users can create their own memberships" policy was in place, any
-- logged-in user could insert their own active membership row. This lists every
-- membership currently granting access so you can compare it against real
-- Stripe customers.
--
-- Signs a row was forged rather than paid for:
--   payment_amount is 0 or an odd value
--   expires_at is implausibly far out
--   source is 'stripe' but Stripe has no subscription for that user
--
-- You do not have to delete anything. check-subscription now verifies every
-- source = 'stripe' row against Stripe and expires the ones with nothing behind
-- them the next time that user's subscription is checked. This is for knowing
-- the scale of the problem, and for spotting anyone who should be billed.

SELECT
  m.id,
  m.user_id,
  u.email,
  m.status,
  m.source,
  m.payment_amount,
  m.expires_at,
  m.created_at,
  m.organization_id,
  -- Rough age of the claim. A membership created long before the fix with no
  -- Stripe activity is the pattern to look at first.
  date_trunc('day', now() - m.created_at) AS age
FROM public.memberships m
LEFT JOIN auth.users u ON u.id = m.user_id
WHERE m.status = 'active'
  AND m.expires_at > now()
ORDER BY
  -- Most suspicious first: zero payments, then the furthest-out expiries.
  (m.payment_amount = 0) DESC,
  m.expires_at DESC;
