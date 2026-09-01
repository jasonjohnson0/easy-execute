# Easy Execute — WordPress embed

Puts live Easy Execute deals on a self-hosted WordPress site. Two pieces:

- `public/embed.js` — a dependency-free widget served from the Easy Execute app.
- `wordpress-plugin/easy-execute/` — a WordPress plugin exposing `[easy_execute]`.

The plugin is a thin wrapper: it validates shortcode attributes and renders the
container div. All rendering and data fetching happens in `embed.js`, so updating
the widget means redeploying the app, not reinstalling the plugin.

## Install

1. Deploy the app so `https://your-app-domain/embed.js` is reachable. `embed.js`
   lives in `public/`, which Vite copies to the build output as-is.
2. Apply the migration that adds the public read API:
   `supabase/migrations/20260901120000_public_embed_api.sql`.
3. Zip the `easy-execute` folder and upload it under **Plugins → Add New →
   Upload Plugin**, then activate it.
4. Go to **Settings → Easy Execute** and set the App URL to your app's origin.

To pin the URL so it can't be changed from the dashboard, add this to
`wp-config.php` instead — the settings field then shows as locked:

```php
define( 'EASY_EXECUTE_APP_URL', 'https://your-app-domain' );
```

## Shortcodes

| Shortcode | Renders |
|---|---|
| `[easy_execute]` | All active deals, newest first |
| `[easy_execute limit="6" category="Restaurants"]` | Filtered deal grid |
| `[easy_execute mode="business" business_id="UUID"]` | One business's deals, with a logo/name header |
| `[easy_execute mode="sponsored" limit="3"]` | Sponsored banners and coupons |
| `[easy_execute mode="signup" ref="CODE"]` | Referral-attributed signup CTA |

### Attributes

| Attribute | Applies to | Notes |
|---|---|---|
| `mode` | all | `deals` (default), `business`, `sponsored`, `signup` |
| `business_id` | `business`, `sponsored` | Must be a UUID; rejected otherwise |
| `category` | `deals` | Matches the business category exactly |
| `limit` | `deals`, `sponsored` | Server caps at 50 deals / 25 offers |
| `theme` | all | `auto` (default, follows the visitor's OS), `light`, `dark` |
| `ref` | all | Referral code appended to every outbound link |
| `heading`, `subheading`, `cta` | `signup` | Override the default copy |

## Using it without the plugin

The plugin is optional. Any page builder that allows raw HTML can do this
directly:

```html
<div data-ee-embed data-ee-mode="deals" data-ee-limit="6"
     data-ee-app-url="https://your-app-domain"></div>
<script src="https://your-app-domain/embed.js" async></script>
```

One script tag serves any number of containers on a page. If your builder injects
markup after page load, call `window.EasyExecuteEmbed.mountAll()` afterwards.

## How it handles data and security

**Styles can't collide.** Each widget renders into a shadow root with
`:host { all: initial }`. A WordPress theme's CSS cannot reach into the widget,
and the widget's CSS cannot leak into the theme.

**Deal content can't inject script.** Every value from the database is written
with `textContent`. Image and link URLs are parsed and rejected unless they are
`http:` or `https:`, so a `javascript:` URL stored on a sponsored offer cannot
become a live link on a customer's site.

**The API key is meant to be public.** `embed.js` carries the Supabase
publishable (anon) key — the same one already shipped in the app bundle. It
grants nothing beyond the RLS policies and the explicit grants on the
`get_public_*` functions.

**The public read API is narrower than the app's.** The embed reads through
three SECURITY DEFINER functions added by the migration, not through table
access. They return deal and business display fields only — never the business
email, phone, address, subscription status, or referral code — and cap row
counts server-side so the widget can't be used as a bulk export endpoint.

**Signup mode never touches a password.** It collects an email and hands off to
the real app in a new tab, carrying `?ref=` for attribution. Accepting a password
in a script running on a third-party page would make Easy Execute accounts only
as safe as that site's own XSS posture, so the embed doesn't do it.

`?ref=` is already read by the app (`src/pages/Index.tsx`), so referral
attribution works today. The `email` and `signup=1` parameters are passed but
not yet consumed — prefilling the signup form from them is a small app-side
addition.

## If deals don't appear

- **Empty state on every mode.** The migration probably hasn't been applied.
  Check that `get_public_deals` exists and is granted to `anon`.
- **Nothing renders at all.** Confirm `https://your-app-domain/embed.js` loads in
  a browser. A 404 means the app deploy didn't include `public/`.
- **Console CSP error.** If your WordPress site sets its own Content-Security-Policy,
  it needs `script-src` to allow your app's origin and `connect-src` to allow
  `https://nmsnsnfqufykwpesnjup.supabase.co`.
- **Only sponsored offers are empty.** Sponsored offers with no `expires_at` are
  treated as never expiring; ones with a past `expires_at` are filtered out.
