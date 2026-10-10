/**
 * booth-lock.js
 * ------------------------------------------------------------
 * The photo booth stays closed until the wedding day (booth.lock in config.js),
 * then opens by itself, even on a page that was left open.
 *
 * Testing while it is locked: open the site with  ?booth=<previewKey>  on the end.
 * That phone then keeps the booth open (and says so on the wall). ?booth=lock
 * puts it back.
 *
 * Honest about what this is: the time comes from the guest's own phone, and the
 * test key is in this site's code, so it keeps the booth shut for ordinary guests
 * but is not a security lock.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const lock = W && W.booth && W.booth.lock;
  const KEY = "booth:preview";

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"];

  // the opening moment, at the venue (empty = always open)
  const opens = lock && lock.opens
    ? new Date(String(lock.opens).replace(/(Z|[+-]\d\d:?\d\d)$/, "") + (W.timezone || "")).getTime()
    : NaN;

  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return window.__boothPreview || null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) { window.__boothPreview = v; } },
    del() { try { localStorage.removeItem(KEY); } catch (e) { window.__boothPreview = null; } },
  };

  // ?booth=<key> turns the test mode on, ?booth=lock turns it off; then tidy the address bar
  try {
    const url = new URL(location.href);
    const q = url.searchParams.get("booth");
    if (q !== null) {
      if (q === "lock") store.del();
      else if (lock && lock.previewKey && q === lock.previewKey) store.set(q);
      url.searchParams.delete("booth");
      history.replaceState(null, "", url.pathname + (url.search || "") + url.hash);
    }
  } catch (e) { /* an old browser: the lock still works, only the test link does not */ }

  function status() {
    if (isNaN(opens)) return { locked: false, preview: false };
    const preview = !!(lock.previewKey && store.get() === lock.previewKey);
    const ms = opens - Date.now();
    return { locked: ms > 0 && !preview, preview: preview && ms > 0, ms: Math.max(0, ms) };
  }

  // "12 December 2026", read straight from the date in config.js
  function dateText() {
    const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String((lock && lock.opens) || ""));
    return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : "";
  }

  // "62 days", "5 hours", "20 minutes"
  function whenText(ms) {
    const u = lock.units, n = (v, k) => `${v} ${u[k][v === 1 ? 0 : 1]}`;
    const days = Math.floor(ms / 86400000);
    if (days >= 1) return n(days, "day");
    const hours = Math.floor(ms / 3600000);
    if (hours >= 1) return n(hours, "hour");
    const mins = Math.ceil(ms / 60000);
    return mins >= 1 ? n(mins, "minute") : "";
  }

  // tell the page when the state changes (it opens by itself at the moment)
  let last = JSON.stringify(status());
  function check() {
    const now = JSON.stringify(status());
    if (now !== last) { last = now; window.dispatchEvent(new CustomEvent("booth:lockchange")); }
  }
  setInterval(check, 15000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });

  window.BoothLock = {
    status,
    dateText,
    whenText,
    clearPreview() { store.del(); last = JSON.stringify(status()); window.dispatchEvent(new CustomEvent("booth:lockchange")); },
  };
})();
