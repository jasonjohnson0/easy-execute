/**
 * Easy Execute embeddable widget.
 *
 * Renders live deals from Supabase inside any third-party page (WordPress,
 * Squarespace, plain HTML) with no build step and no dependencies.
 *
 * Usage:
 *   <div data-ee-embed data-ee-mode="deals" data-ee-limit="6"></div>
 *   <script src="https://YOUR-APP/embed.js" async></script>
 *
 * Every widget renders into a shadow root, so the host site's theme CSS cannot
 * leak in and these styles cannot leak out. All server data is written with
 * textContent / setAttribute, never innerHTML, so a malicious deal title cannot
 * inject script into a customer's site.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://nmsnsnfqufykwpesnjup.supabase.co';
  // Supabase publishable ("anon") key. Public by design: it carries no privileges
  // beyond the RLS policies and the grants on the get_public_* functions.
  var SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tc25zbmZxdWZ5a3dwZXNuanVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDQxNjEsImV4cCI6MjA3Mzk4MDE2MX0.XV_tASDS5Z2WeZssB4Tr2BMkEw6CjXMb_TKlSILFJUM';

  var SCRIPT_ORIGIN = (function () {
    var el = document.currentScript;
    if (el && el.src) {
      try {
        return new URL(el.src).origin;
      } catch (e) {
        /* fall through */
      }
    }
    return '';
  })();

  var STYLES = [
    ':host{all:initial;display:block;container-type:inline-size}',
    '*,*::before,*::after{box-sizing:border-box}',
    '.ee{',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
    'font-size:15px;line-height:1.5;color:var(--ee-fg);',
    '--ee-bg:#ffffff;--ee-fg:#18181b;--ee-muted:#71717a;--ee-border:#e4e4e7;',
    '--ee-accent:#0f766e;--ee-accent-fg:#ffffff;--ee-surface:#fafafa;--ee-radius:12px}',
    '.ee[data-theme="dark"]{',
    '--ee-bg:#18181b;--ee-fg:#fafafa;--ee-muted:#a1a1aa;--ee-border:#3f3f46;',
    '--ee-accent:#2dd4bf;--ee-accent-fg:#0b3b36;--ee-surface:#27272a}',
    '.ee-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}',
    '.ee-card{background:var(--ee-surface);border:1px solid var(--ee-border);',
    'border-radius:var(--ee-radius);padding:16px;display:flex;flex-direction:column;gap:8px}',
    '.ee-badge{display:inline-block;align-self:flex-start;background:var(--ee-accent);',
    'color:var(--ee-accent-fg);font-weight:700;font-size:13px;padding:3px 10px;border-radius:999px}',
    '.ee-title{font-size:17px;font-weight:650;margin:0}',
    '.ee-biz{font-size:13px;color:var(--ee-muted);margin:0}',
    '.ee-desc{font-size:14px;margin:0}',
    '.ee-terms{font-size:12px;color:var(--ee-muted);margin:0}',
    '.ee-foot{display:flex;align-items:center;justify-content:space-between;',
    'gap:8px;margin-top:auto;padding-top:8px}',
    '.ee-exp{font-size:12px;color:var(--ee-muted)}',
    '.ee-btn{display:inline-block;background:var(--ee-accent);color:var(--ee-accent-fg);',
    'text-decoration:none;font-weight:600;font-size:14px;padding:8px 14px;border:0;',
    'border-radius:8px;cursor:pointer;font-family:inherit}',
    '.ee-btn:hover{opacity:.9}',
    '.ee-hdr{display:flex;align-items:center;gap:12px;margin-bottom:16px}',
    '.ee-logo{width:48px;height:48px;border-radius:10px;object-fit:cover;',
    'border:1px solid var(--ee-border)}',
    '.ee-hdr-name{font-size:20px;font-weight:700;margin:0}',
    '.ee-banner{display:block;width:100%;border-radius:var(--ee-radius);',
    'border:1px solid var(--ee-border);overflow:hidden}',
    '.ee-banner img{display:block;width:100%;height:auto}',
    '.ee-signup{background:var(--ee-surface);border:1px solid var(--ee-border);',
    'border-radius:var(--ee-radius);padding:20px;display:flex;flex-direction:column;gap:12px}',
    '.ee-row{display:flex;gap:8px;flex-wrap:wrap}',
    '.ee-input{flex:1 1 200px;padding:9px 12px;border:1px solid var(--ee-border);',
    'border-radius:8px;background:var(--ee-bg);color:var(--ee-fg);font:inherit;font-size:14px}',
    '.ee-msg{padding:14px;border:1px dashed var(--ee-border);border-radius:var(--ee-radius);',
    'color:var(--ee-muted);font-size:14px;text-align:center}',
    '.ee-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '@media(prefers-reduced-motion:no-preference){.ee-card{transition:transform .15s ease}',
    '.ee-card:hover{transform:translateY(-2px)}}'
  ].join('');

  /* ---------------------------------------------------------------- helpers */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== '') node.textContent = String(text);
    return node;
  }

  function rpc(fnName, args, config) {
    var url = config.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + fnName;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseKey,
        Authorization: 'Bearer ' + config.supabaseKey
      },
      body: JSON.stringify(args)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (body) {
          throw new Error('Easy Execute API ' + res.status + ': ' + body.slice(0, 200));
        });
      }
      return res.json();
    });
  }

  function discountLabel(deal) {
    var value = deal.discount_value == null ? '' : String(deal.discount_value).trim();
    switch (deal.discount_type) {
      case 'percentage':
        return value ? value.replace(/%+$/, '') + '% OFF' : 'DISCOUNT';
      case 'fixed':
        return value ? '$' + value.replace(/^\$+/, '') + ' OFF' : 'DISCOUNT';
      case 'bogo':
        return 'BOGO';
      default:
        return value || 'DEAL';
    }
  }

  function expiryLabel(iso) {
    if (!iso) return '';
    var when = new Date(iso);
    if (isNaN(when.getTime())) return '';
    var days = Math.ceil((when.getTime() - Date.now()) / 86400000);
    if (days <= 0) return 'Ends today';
    if (days === 1) return 'Ends tomorrow';
    if (days <= 30) return 'Ends in ' + days + ' days';
    return 'Ends ' + when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /** Only ever emit links we built ourselves, or vetted http(s) URLs. */
  function safeHttpUrl(raw) {
    if (!raw) return null;
    try {
      var parsed = new URL(String(raw), 'https://invalid.example');
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
    } catch (e) {
      return null;
    }
  }

  function appLink(config, params) {
    var base = config.appUrl.replace(/\/+$/, '') + '/';
    var url;
    try {
      url = new URL(base);
    } catch (e) {
      return null;
    }
    if (config.ref) url.searchParams.set('ref', config.ref);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key] != null && params[key] !== '') url.searchParams.set(key, params[key]);
    });
    return url.href;
  }

  function ctaLink(config, params, label) {
    var href = appLink(config, params);
    var node = el('a', 'ee-btn', label);
    node.setAttribute('href', href || '#');
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    return node;
  }

  /* ------------------------------------------------------------- rendering */

  function dealCard(deal, config) {
    var card = el('div', 'ee-card');
    card.appendChild(el('span', 'ee-badge', discountLabel(deal)));
    card.appendChild(el('h3', 'ee-title', deal.title));
    if (deal.business_name) card.appendChild(el('p', 'ee-biz', deal.business_name));
    if (deal.description) card.appendChild(el('p', 'ee-desc', deal.description));
    if (deal.terms) card.appendChild(el('p', 'ee-terms', deal.terms));

    var foot = el('div', 'ee-foot');
    foot.appendChild(el('span', 'ee-exp', expiryLabel(deal.expires_at)));
    foot.appendChild(ctaLink(config, { deal: deal.id }, 'Get deal'));
    card.appendChild(foot);
    return card;
  }

  function offerCard(offer, config) {
    var banner = safeHttpUrl(offer.banner_image_url);
    if (offer.offer_type === 'banner' && banner) {
      var link = safeHttpUrl(offer.banner_link_url) || appLink(config, {});
      var wrap = el(link ? 'a' : 'div', 'ee-banner');
      if (link) {
        wrap.setAttribute('href', link);
        wrap.setAttribute('target', '_blank');
        wrap.setAttribute('rel', 'noopener noreferrer sponsored');
      }
      var img = el('img');
      img.setAttribute('src', banner);
      img.setAttribute('alt', offer.title || 'Sponsored offer');
      img.setAttribute('loading', 'lazy');
      wrap.appendChild(img);
      return wrap;
    }
    return dealCard(offer, config);
  }

  function signupCard(config) {
    var box = el('div', 'ee-signup');
    box.appendChild(el('h3', 'ee-title', config.heading || 'Get local deals in your inbox'));
    box.appendChild(
      el('p', 'ee-desc', config.subheading || 'Join free and start saving at businesses near you.')
    );

    var form = el('form', 'ee-row');
    var label = el('label', 'ee-sr', 'Email address');
    var input = el('input', 'ee-input');
    var inputId = 'ee-email-' + Math.random().toString(36).slice(2, 9);
    input.setAttribute('id', inputId);
    input.setAttribute('type', 'email');
    input.setAttribute('name', 'email');
    input.setAttribute('required', 'required');
    input.setAttribute('autocomplete', 'email');
    input.setAttribute('placeholder', 'you@example.com');
    label.setAttribute('for', inputId);

    var submit = el('button', 'ee-btn', config.ctaLabel || 'Join free');
    submit.setAttribute('type', 'submit');

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(submit);

    // The embed never collects a password and never creates the account itself:
    // handing credentials to a script running on a third-party page would put
    // signup at the mercy of that site's own XSS. It hands off to the real app,
    // carrying the referral code so attribution survives the jump.
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var href = appLink(config, { signup: '1', email: input.value.trim() });
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
    });

    box.appendChild(form);
    return box;
  }

  function businessHeader(business) {
    var header = el('div', 'ee-hdr');
    var logo = safeHttpUrl(business.logo_url);
    if (logo) {
      var img = el('img', 'ee-logo');
      img.setAttribute('src', logo);
      img.setAttribute('alt', business.name || '');
      img.setAttribute('loading', 'lazy');
      header.appendChild(img);
    }
    var text = el('div');
    text.appendChild(el('h2', 'ee-hdr-name', business.name));
    if (business.category) text.appendChild(el('p', 'ee-biz', business.category));
    header.appendChild(text);
    return header;
  }

  function renderInto(root, nodes) {
    while (root.firstChild) root.removeChild(root.firstChild);
    nodes.forEach(function (node) {
      root.appendChild(node);
    });
  }

  /* ----------------------------------------------------------------- config */

  function readConfig(host) {
    var d = host.dataset;
    var theme = d.eeTheme || 'auto';
    if (theme === 'auto') {
      theme =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    }
    var limit = parseInt(d.eeLimit, 10);
    return {
      mode: d.eeMode || 'deals',
      businessId: d.eeBusinessId || null,
      category: d.eeCategory || null,
      limit: isNaN(limit) ? null : limit,
      ref: d.eeRef || null,
      theme: theme === 'dark' ? 'dark' : 'light',
      heading: d.eeHeading || null,
      subheading: d.eeSubheading || null,
      ctaLabel: d.eeCta || null,
      appUrl: d.eeAppUrl || SCRIPT_ORIGIN || SUPABASE_URL,
      supabaseUrl: d.eeSupabaseUrl || SUPABASE_URL,
      supabaseKey: d.eeSupabaseKey || SUPABASE_ANON_KEY
    };
  }

  /* ------------------------------------------------------------------ mount */

  function mount(host) {
    if (host.dataset.eeMounted === '1') return;
    host.dataset.eeMounted = '1';

    var config = readConfig(host);
    var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : null;
    if (!shadow) return; // Shadow DOM unsupported; leave the page untouched.

    var style = document.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);

    var wrapper = el('div', 'ee');
    wrapper.setAttribute('data-theme', config.theme);
    shadow.appendChild(wrapper);

    if (config.mode === 'signup') {
      wrapper.appendChild(signupCard(config));
      return;
    }

    wrapper.appendChild(el('div', 'ee-msg', 'Loading deals…'));

    var work;
    if (config.mode === 'sponsored') {
      work = rpc(
        'get_public_sponsored_offers',
        { p_business_id: config.businessId, p_limit: config.limit || 6 },
        config
      ).then(function (offers) {
        if (!offers.length) return [el('div', 'ee-msg', 'No featured offers right now.')];
        var grid = el('div', 'ee-grid');
        offers.forEach(function (offer) {
          grid.appendChild(offerCard(offer, config));
        });
        return [grid];
      });
    } else {
      // "deals" and "business" share the deal grid; "business" adds a header and
      // requires a business id to scope to.
      var wantsHeader = config.mode === 'business' && config.businessId;
      var deals = rpc(
        'get_public_deals',
        {
          p_business_id: config.businessId,
          p_category: config.category,
          p_limit: config.limit || 12
        },
        config
      );
      var business = wantsHeader
        ? rpc('get_public_business', { p_business_id: config.businessId }, config)
        : Promise.resolve([]);

      work = Promise.all([deals, business]).then(function (results) {
        var nodes = [];
        if (results[1] && results[1].length) nodes.push(businessHeader(results[1][0]));
        if (!results[0].length) {
          nodes.push(el('div', 'ee-msg', 'No active deals right now. Check back soon.'));
          return nodes;
        }
        var grid = el('div', 'ee-grid');
        results[0].forEach(function (deal) {
          grid.appendChild(dealCard(deal, config));
        });
        nodes.push(grid);
        return nodes;
      });
    }

    work
      .then(function (nodes) {
        renderInto(wrapper, nodes);
      })
      .catch(function (error) {
        renderInto(wrapper, [el('div', 'ee-msg', 'Deals are unavailable right now.')]);
        if (window.console && console.warn) console.warn('[easy-execute]', error);
      });
  }

  function mountAll(scope) {
    var hosts = (scope || document).querySelectorAll('[data-ee-embed]');
    Array.prototype.forEach.call(hosts, mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mountAll();
    });
  } else {
    mountAll();
  }

  // Exposed so page builders and block editors can mount markup added after load.
  window.EasyExecuteEmbed = { mount: mount, mountAll: mountAll };
})();
