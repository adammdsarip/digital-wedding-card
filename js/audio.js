/**
 * audio.js
 * ------------------------------------------------------------
 * Optional background music. Never autoplays — browsers block
 * that anyway, and it would undercut the quiet, editorial tone.
 * The toggle only appears interactive once a track is configured.
 * ------------------------------------------------------------
 */
(function () {
  const W = window.WEDDING;
  const toggle = document.getElementById("audio-toggle");
  const audio = document.getElementById("bg-audio");
  if (!W || !toggle || !audio) return;

  if (!W.music || !W.music.src) {
    toggle.style.display = "none";
    return;
  }

  audio.src = W.music.src;
  audio.volume = 0.55;
  let playing = false;

  toggle.addEventListener("click", () => {
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      audio.play().catch(() => {
        /* Autoplay-policy or missing file — fail silently. */
      });
      playing = true;
    }
    toggle.setAttribute("aria-pressed", String(playing));
  });

  // Once the invitation opens, gently offer the music — still requires
  // the explicit toggle press to satisfy autoplay policies, so we just
  // make the control visible and inviting at that moment.
  window.addEventListener("invitation:opened", () => {
    toggle.classList.add("audio-toggle--ready");
  }, { once: true });
})();
