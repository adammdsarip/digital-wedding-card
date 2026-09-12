/**
 * main.js
 * ------------------------------------------------------------
 * Small glue: scroll cue, RSVP submission, and a ScrollTrigger
 * refresh once the opening sequence releases the page.
 * ------------------------------------------------------------
 */
(function () {
  // ---- Scroll cue on the hero -------------------------------------------------
  const scrollCue = document.getElementById("scroll-cue");
  if (scrollCue) {
    scrollCue.addEventListener("click", () => {
      const next = document.getElementById("invite");
      if (next) next.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ---- Once the envelope hands off, make sure ScrollTrigger has fresh
  //      measurements (nothing shifts, but overflow toggling on <body>
  //      can nudge the scrollbar width). --------------------------------------
  window.addEventListener("invitation:opened", () => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  // ---- RSVP form ---------------------------------------------------------------
  const form = document.getElementById("rsvp-form");
  const status = document.getElementById("rsvp-status");
  if (form && status) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const endpoint = window.WEDDING && window.WEDDING.rsvp && window.WEDDING.rsvp.formEndpoint;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      status.textContent = "Sending…";

      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          if (!res.ok) throw new Error("Request failed");
        }
        status.textContent = "Thank you — your response has been received.";
        form.reset();
      } catch (err) {
        status.textContent = "Something went wrong. Please try again, or reach out to us directly.";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
