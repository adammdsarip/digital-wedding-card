/**
 * countdown.js
 * ------------------------------------------------------------
 * Counts down to the wedding: days, hours, minutes and seconds.
 * The moment comes from config.js: isoDate, read in the venue's time zone
 * (timezone), so it ends at the same instant for every guest.
 * On the day it says so, and afterwards it thanks them.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const cd = W && W.countdown;
  const timer = document.getElementById("cd-timer");
  if (!cd || !timer) return;

  const $ = (id) => document.getElementById(id);
  const out = { days: $("cd-days"), hours: $("cd-hours"), minutes: $("cd-minutes"), seconds: $("cd-seconds") };
  const caption = $("cd-caption");
  const done = $("cd-done");

  // the date and time in config.js, at the venue (a missing zone means the guest's own)
  const target = new Date(String(W.isoDate).replace(/(Z|[+-]\d\d:?\d\d)$/, "") + (W.timezone || "")).getTime();
  if (isNaN(target)) return;

  const pad = (n) => String(n).padStart(2, "0");
  let lastLabel = "";
  let handle = 0;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      timer.hidden = true;
      caption.hidden = true;
      done.hidden = false;
      done.textContent = Date.now() - target < 24 * 3600 * 1000 ? cd.today : cd.after;
      timer.removeAttribute("aria-label");
      stop();
      return;
    }
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    out.days.textContent = String(d);
    out.hours.textContent = pad(h);
    out.minutes.textContent = pad(m);
    out.seconds.textContent = pad(sec);
    // a screen reader hears it once a minute, not every second
    const unit = (n, word) => `${n} ${n === 1 ? word.replace(/s$/i, "") : word}`;
    const label = `${unit(d, cd.labels.days)}, ${unit(h, cd.labels.hours)}, ${unit(m, cd.labels.minutes)} ${cd.caption}`;
    if (label !== lastLabel) { timer.setAttribute("aria-label", label); lastLabel = label; }
  }

  function start() { if (!handle) { tick(); handle = setInterval(tick, 1000); } }
  function stop() { clearInterval(handle); handle = 0; }

  // no ticking while the page is hidden
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
  start();
})();
