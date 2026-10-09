/**
 * rsvp.js
 * ------------------------------------------------------------
 * The RSVP form: what shows when, checking it, and sending it.
 * Every word comes from js/config.js (rsvp.*), filled in by render.js.
 *
 * Sending is isolated in send() at the bottom. Today it only previews —
 * nothing leaves the page. The Tally form is connected there, in one place,
 * without touching anything else in this file.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const form = document.getElementById("rsvp-form");
  if (!W || !W.rsvp || !form) return;

  const cfg = W.rsvp;
  const $ = (id) => document.getElementById(id);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const refreshScroll = () => { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };

  const nameInput = $("rsvp-name");
  const more = $("rsvp-more");
  const guestsInput = $("rsvp-guests");
  const guestsOut = $("rsvp-guests-out");
  const minus = $("rsvp-minus");
  const plus = $("rsvp-plus");
  const submitBtn = $("rsvp-submit-btn");
  const fail = $("rsvp-fail");
  const choiceRow = form.querySelector(".choice__row");
  const MAX = Math.max(1, cfg.maxGuests || 6);

  const L = cfg.labels || {};
  minus.setAttribute("aria-label", "Fewer guests");
  plus.setAttribute("aria-label", "More guests");

  // ---- errors ----------------------------------------------------------------------
  // `control` is a field, or the row of choices (marked with data-invalid for styling,
  // and its radios with aria-invalid for assistive tech)
  function mark(control, on) {
    const fields = control === choiceRow ? form.querySelectorAll('input[name="attending"]') : [control];
    fields.forEach((f) => (on ? f.setAttribute("aria-invalid", "true") : f.removeAttribute("aria-invalid")));
    if (control === choiceRow) { if (on) choiceRow.dataset.invalid = ""; else delete choiceRow.dataset.invalid; }
  }
  function showError(id, message, control) {
    const el = $(id);
    el.textContent = message;
    el.hidden = false;
    mark(control, true);
  }
  function clearError(id, control) {
    $(id).hidden = true;
    mark(control, false);
  }

  nameInput.addEventListener("input", () => clearError("rsvp-name-error", nameInput));

  // ---- coming or not: the guest questions open only for "yes" -------------------
  function setMore(open) {
    more.dataset.open = open ? "true" : "false";
    if (open) more.removeAttribute("inert"); else more.setAttribute("inert", "");
    window.setTimeout(refreshScroll, reduced() ? 0 : 480);
  }
  form.querySelectorAll('input[name="attending"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      clearError("rsvp-attending-error", choiceRow);
      setMore(radio.value === "yes" && radio.checked);
    });
  });

  // ---- number of guests ---------------------------------------------------------------
  let guests = 1;
  function setGuests(n) {
    guests = Math.min(MAX, Math.max(1, n));
    guestsInput.value = String(guests);
    guestsOut.textContent = String(guests);
    minus.disabled = guests <= 1;
    plus.disabled = guests >= MAX;
  }
  minus.addEventListener("click", () => setGuests(guests - 1));
  plus.addEventListener("click", () => setGuests(guests + 1));
  setGuests(1);

  // ---- checking it ---------------------------------------------------------------------
  function validate() {
    let firstBad = null;
    if (!nameInput.value.trim()) {
      showError("rsvp-name-error", cfg.errors.name, nameInput);
      firstBad = firstBad || nameInput;
    }
    if (!form.querySelector('input[name="attending"]:checked')) {
      showError("rsvp-attending-error", cfg.errors.attending, choiceRow);
      firstBad = firstBad || form.querySelector('input[name="attending"]');
    }
    if (firstBad) firstBad.focus({ preventScroll: false });
    return !firstBad;
  }

  // ---- what gets sent ------------------------------------------------------------------
  function collect() {
    const attending = form.querySelector('input[name="attending"]:checked').value;
    const coming = attending === "yes";
    return {
      name: nameInput.value.trim(),
      attending,
      guests: coming ? guests : 0,
      dietary: coming ? $("rsvp-dietary").value.trim() : "",
      message: $("rsvp-message").value.trim(),
    };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    fail.hidden = true;
    if (!validate()) return;

    // A bot filled the hidden field: look like it worked, send nothing.
    if (form.elements.website && form.elements.website.value) return showDone("yes");

    const data = collect();
    const label = submitBtn.querySelector("span");
    const idle = label.textContent;
    submitBtn.disabled = true;
    label.textContent = L.sending || "Sending…";
    try {
      await send(data);
      showDone(data.attending);
    } catch (err) {
      fail.textContent = cfg.errors.send;
      fail.hidden = false;
    } finally {
      submitBtn.disabled = false;
      label.textContent = idle;
    }
  });

  function showDone(attending) {
    const msg = (cfg.done && cfg.done[attending]) || cfg.done.yes;
    $("rsvp-done-title").textContent = msg.title;
    $("rsvp-done-text").textContent = msg.text;
    form.hidden = true;
    const done = $("rsvp-done");
    done.hidden = false;
    refreshScroll();
    done.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
  }

  // ---- sending: the one place that reaches outside the page --------------------------
  // PREVIEW: nothing is sent yet. The Tally form connects here (next step): send
  // `data` ({ name, attending: "yes"|"no", guests, dietary, message }) to it, resolve
  // when it accepts, throw when it does not.
  async function send(data) {
    if (!cfg.endpoint) {
      console.info("[rsvp] preview only, not sent:", data);
      return;
    }
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("RSVP not accepted: " + res.status);
  }
})();
