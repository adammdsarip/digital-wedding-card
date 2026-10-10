/**
 * main.js
 * ------------------------------------------------------------
 * Keeps ScrollTrigger's measurements honest. Trigger positions depend
 * on layout, and layout shifts when the web fonts arrive and when the
 * opening sequence hands the page back its scroll.
 * ------------------------------------------------------------
 */
(function () {
  const refresh = () => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("invitation:opened", refresh);
})();
