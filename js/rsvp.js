/**
 * rsvp.js
 * ------------------------------------------------------------
 * The RSVP is a Tally form (rsvp.tally in config.js), shown inside the sheet.
 * Replies go to the Tally dashboard; nothing is stored by this site.
 *
 * It loads when the sheet is near the screen, so Tally's script stays out of the
 * way of the opening sequence. Tally's own script sets the form's height as the
 * guest moves through it. If that script cannot load (a blocker, an in-app
 * browser, no signal), the form is opened directly at a fixed height instead, and
 * the "Form not showing?" link under it opens the same form as a normal page.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const cfg = W && W.rsvp;
  const embed = document.getElementById("rsvp-embed");
  const frame = document.getElementById("rsvp-frame");
  if (!embed || !frame) return;
  if (!cfg || !cfg.tally) { embed.hidden = true; return; }

  const EMBED_JS = "https://tally.so/widgets/embed.js";
  frame.dataset.tallySrc = cfg.tally;      // Tally's script reads this and sets the address
  let started = false;

  // no helper script: open the form itself, tall enough to use, scrolling inside
  function direct() {
    if (frame.getAttribute("src")) return;
    frame.style.height = "46rem";
    frame.src = cfg.tally;
  }

  function start() {
    if (started) return;
    started = true;
    const ready = () => {
      if (window.Tally && typeof window.Tally.loadEmbeds === "function") window.Tally.loadEmbeds();
      else direct();
    };
    if (window.Tally) return ready();
    const s = document.createElement("script");
    s.src = EMBED_JS;
    s.async = true;
    s.onload = ready;
    s.onerror = direct;
    document.body.appendChild(s);
    setTimeout(direct, 8000);               // a script that never answers
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: "600px 0px" });
    io.observe(embed);
  } else {
    start();
  }

  // the form changes height as it goes: keep the scroll animations' measurements right
  if ("ResizeObserver" in window && window.ScrollTrigger) {
    let t = 0;
    new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => window.ScrollTrigger.refresh(), 150);
    }).observe(frame);
  }
})();
