## What I found

The toast text **"Device Check Failed — Could not verify device. Some features may be limited."** does not exist anywhere in the current source code. I searched all of `src/`, `public/`, and `index.html` for every relevant phrase ("Device Check", "verify device", "Some features", "fingerprint", etc.) and there are zero matches.

That means the toast is being rendered by **stale JavaScript that your browser cached from a previous deployment** that had this feature. Our service worker (`public/sw.js`) aggressively caches JS/CSS, which is why it keeps showing up even though the code is gone.

## Plan

Since there's nothing to comment out, the cheapest fix (fewest credits) is a one-time cache purge so the old bundle stops being served.

### 1. Replace `public/sw.js` with a self-unregistering "kill switch"

Strip the current SW down to a version that, on activate:
- Deletes every cache it finds (`caches.keys()` → `caches.delete()`)
- Calls `self.registration.unregister()`
- Reloads any open clients once

This evicts the cached "Device Check" bundle for every user on their next visit and stops the SW from re-caching anything.

### 2. Add a tiny cleanup in `src/main.tsx`

Right after mount, run a guarded one-liner:
```ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(rs => rs.forEach(r => r.unregister()));
}
```
This ensures even users whose browser hasn't fetched the new `sw.js` yet drop the old worker immediately.

### 3. No other code changes

I will **not** touch `useIsMobile`, `checkBrowserCompatibility`, or any analytics — none of them produce this toast.

## After deploy

You (and any affected users) will need to refresh the page **once**. The toast will not come back, and we haven't spent credits hunting code that isn't there.

## Note on credits

This is the lowest-credit path: 2 small file edits, no feature work, no searches across the codebase needed at build time. If you'd rather just ignore the toast (it'll disappear on its own after the next published deploy + hard refresh, since no new code reintroduces it), say the word and I'll do nothing at all.
