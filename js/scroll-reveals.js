/**
 * scroll-reveals.js
 * ------------------------------------------------------------
 * Scroll-driven choreography for the invitation body. Kept
 * deliberately restrained: fades move upward, images settle
 * in from a slight scale, decorative lines draw themselves.
 * Hierarchy over spectacle — not everything moves at once.
 * ------------------------------------------------------------
 */
(function () {
  function init() {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // gsap.matchMedia() re-evaluates automatically if the OS-level
    // reduced-motion setting ever changes mid-session, rather than
    // reading it once at load — the documented pattern for accessible,
    // responsive GSAP setup.
    gsap.matchMedia().add(
      { reduceMotion: "(prefers-reduced-motion: reduce)" },
      (context) => {
        const { reduceMotion } = context.conditions;

        if (reduceMotion) {
          // Simply present everything — no motion, still fully readable.
          document.querySelectorAll("[data-reveal]").forEach((el) => {
            el.style.opacity = 1;
            el.style.visibility = "visible";
            el.style.transform = "none";
          });
          document.querySelectorAll(".reveal-title__rule span, .hero__ornament span")
            .forEach((el) => (el.style.transform = "scaleX(1)"));
          return;
        }

        const fadeEls = gsap.utils.toArray('[data-reveal="fade"]');
        const scaleEls = gsap.utils.toArray('[data-reveal="scale"]');
        const lineEls = gsap.utils.toArray('[data-reveal="line"]');

        // autoAlpha (opacity + visibility) keeps content not yet revealed
        // out of the tab order too — a hidden RSVP field or gallery tile
        // can't steal keyboard focus before its entrance has played.
        gsap.set(fadeEls, { autoAlpha: 0, y: 26 });
        gsap.set(scaleEls, { autoAlpha: 0, scale: 0.94 });

        ScrollTrigger.batch(fadeEls, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.08,
            }),
        });

        ScrollTrigger.batch(scaleEls, {
          start: "top 85%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              stagger: 0.1,
            }),
        });

        lineEls.forEach((line) => {
          ScrollTrigger.create({
            trigger: line,
            start: "top 90%",
            once: true,
            onEnter: () =>
              gsap.to(line.querySelector("span") || line, {
                scaleX: 1,
                duration: 1,
                ease: "power2.inOut",
              }),
          });
        });

        // Timeline items (.timeline__item, .day-timeline__item) and gallery
        // tiles (.gallery__item) already carry data-reveal="fade"/"scale" in
        // their markup, so the batches above handle their entrance — no need
        // for a second, duplicate set of ScrollTriggers here.

        // ---- Subtle parallax on the couple photograph -----------------------
        const photoImg = document.querySelector(".photo__frame img");
        if (photoImg) {
          gsap.to(photoImg, {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: ".photo__frame",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }
    );
  }

  // Reveals only need to run once the opening sequence hands off,
  // but ScrollTrigger can safely initialise immediately — the body
  // is scroll-locked until then.
  document.addEventListener("DOMContentLoaded", init);
})();
