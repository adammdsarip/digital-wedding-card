/**
 * scroll-reveals.js
 * ------------------------------------------------------------
 * Motion for the invitation sheets. Kept deliberately restrained:
 * the first sheet settles in as the envelope dissolves, content on
 * later sheets rises into place as it enters the screen, and the
 * itinerary's line draws itself down the page. Hierarchy over
 * spectacle — not everything moves at once.
 * ------------------------------------------------------------
 */
(function () {
  function init() {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // gsap.matchMedia() re-evaluates automatically if the OS-level
    // reduced-motion setting changes mid-session, rather than reading
    // it once at load.
    gsap.matchMedia().add(
      { reduceMotion: "(prefers-reduced-motion: reduce)" },
      (context) => {
        const { reduceMotion } = context.conditions;

        if (reduceMotion) {
          // Present everything at rest — no motion, fully readable.
          document.querySelectorAll("[data-reveal], [data-intro], .arch").forEach((el) => {
            el.style.opacity = 1;
            el.style.visibility = "visible";
            el.style.transform = "none";
          });
          return;
        }

        // ---- Sheet 1: settles in while the envelope dissolves ----------------
        // Started by the envelope the moment it begins to fade, so the guest
        // watches the sheet arrive rather than finding it already there.
        const arch = document.querySelector(".arch");
        const introEls = gsap.utils.toArray("[data-intro]");
        gsap.set(arch, { autoAlpha: 0, scale: 0.97 });
        gsap.set(introEls, { autoAlpha: 0, y: 18 });

        let introPlayed = false;
        const playIntro = () => {
          if (introPlayed) return;
          introPlayed = true;
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .to(arch, { autoAlpha: 1, scale: 1, duration: 1.4 })
            .to(introEls, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.3);
        };
        window.addEventListener("invitation:opening", playIntro, { once: true });

        // No envelope on the page (or it is already gone): just show the sheet.
        const scene = document.getElementById("envelope-scene");
        if (!scene || getComputedStyle(scene).display === "none") playIntro();

        // ---- Later sheets: rise into place on entering the screen ---------------
        // autoAlpha (opacity + visibility) keeps content that has not been
        // revealed yet out of the tab order too.
        const fadeEls = gsap.utils.toArray('[data-reveal="fade"]');
        const scaleEls = gsap.utils.toArray('[data-reveal="scale"]');
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

        // ---- The itinerary's line draws itself down the day, stop by stop ----------
        const segs = gsap.utils.toArray(".itinerary__seg");
        if (segs.length) {
          gsap.set(segs, { scaleY: 0 });
          ScrollTrigger.create({
            trigger: ".itinerary",
            start: "top 80%",
            once: true,
            onEnter: () =>
              gsap.to(segs, { scaleY: 1, duration: 0.55, ease: "none", stagger: 0.5 }),
          });
        }
      }
    );
  }

  document.addEventListener("DOMContentLoaded", init);
})();
