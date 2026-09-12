/**
 * envelope.js
 * ------------------------------------------------------------
 * Drives Scenes 1–7: the closed envelope, the lift, the wax
 * seal crack, the flap opening, the card's emergence, the
 * title reveal, and the final crossfade into the scrollable
 * invitation.
 *
 * State machine: idle -> lifted -> breaking -> opened -> done
 * ------------------------------------------------------------
 */
(function () {
  const scene = document.getElementById("envelope-scene");
  if (!scene) return;

  const envelope = document.getElementById("envelope");
  const flap = document.getElementById("envelope-flap");
  const card = document.getElementById("envelope-card");
  const seal = document.getElementById("wax-seal");
  const hint = document.getElementById("envelope-hint");
  const continueBtn = document.getElementById("continue-btn");
  const fragments = document.querySelectorAll("#wax-fragments i");
  const pocket = document.querySelector(".envelope__pocket");
  const back = document.querySelector(".envelope__back");
  const tagline = document.querySelector(".envelope__tagline");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  scene.dataset.state = "idle";

  function liftEnvelope() {
    if (scene.dataset.state !== "idle") return;
    scene.dataset.state = "lifted";
    hint.textContent = "Tap the Seal to Open";

    gsap.timeline()
      .to(envelope, { scale: 1.035, y: -6, duration: 0.55, ease: "power2.out" })
      .to(".envelope__floor-shadow", { opacity: 0.55, scaleX: 1.06, duration: 0.55 }, "<")
      .to(tagline, { opacity: 0.4, duration: 0.4 }, "<");
  }

  function breakSeal() {
    if (scene.dataset.state !== "lifted") return;
    scene.dataset.state = "breaking";
    hint.classList.add("is-hidden");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        scene.dataset.state = "opened";
      },
    });

    if (prefersReduced) {
      // Reduced-motion path: same beats, none of the spatial/3D motion.
      tl.to(seal, { opacity: 0, duration: 0.3 })
        .to(flap, { opacity: 0, duration: 0.4 }, "<")
        .to(pocket, { opacity: 0, duration: 0.4 }, "<")
        .to(back, { opacity: 0.2, duration: 0.4 }, "<")
        .add(() => card.classList.add("is-interactive"))
        .to(card, { opacity: 1, scale: 1, y: 0, duration: 0.6 }, "-=0.1")
        .to(".reveal-title__eyebrow, .reveal-title__name, .reveal-title__amp, .reveal-title__date, .reveal-title__continue",
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
        .set(".reveal-title__rule span", { scaleX: 1 }, "<");
      return;
    }

    // ---- Scene 3: the wax seal cracks -----------------------------------
    tl.to(seal, { scale: 0.9, duration: 0.12, ease: "power2.in" })
      .to(seal, { rotate: -4, duration: 0.06 })
      .to(seal, { rotate: 3, duration: 0.06 })
      .to(seal, { rotate: 0, scale: 1.04, duration: 0.12 })
      .set("#wax-seal-visual", { opacity: 0 })
      .set(".wax-seal__half", { opacity: 1 })
      .to(".wax-seal__half--left", { x: -15, y: 9, rotate: -24, opacity: 0, duration: 0.55, ease: "power2.in" })
      .to(".wax-seal__half--right", { x: 15, y: 13, rotate: 22, opacity: 0, duration: 0.55, ease: "power2.in" }, "<")
      .add(() => {
        fragments.forEach((f) => {
          const angle = Math.random() * Math.PI * 2;
          const dist = 14 + Math.random() * 20;
          gsap.fromTo(
            f,
            { opacity: 1, x: 0, y: 0, rotate: 0 },
            {
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist * 0.6 + 14,
              rotate: (Math.random() - 0.5) * 240,
              opacity: 0,
              duration: 0.6 + Math.random() * 0.3,
              ease: "power2.out",
            }
          );
        });
      }, "<")
      .to(seal, { opacity: 0, duration: 0.3 }, "-=0.15")

      // ---- Scene 4: the flap opens ----------------------------------------
      .to(flap, { rotateX: -178, duration: 1.15, ease: "power3.inOut" }, "-=0.1")
      .to(pocket, { scaleY: 0.9, opacity: 0, transformOrigin: "bottom center", duration: 0.55, ease: "power2.in" }, "-=0.65")
      .to(back, { opacity: 0.25, duration: 0.6 }, "<")
      .to(tagline, { opacity: 0, duration: 0.3 }, "<")

      // ---- Scene 5: the invitation emerges ---------------------------------
      .add(() => card.classList.add("is-interactive"))
      .to(card, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }, "-=0.35")
      .to(flap, { opacity: 0, duration: 0.4 }, "-=0.6")

      // ---- Scene 6: the title reveals --------------------------------------
      .fromTo(".reveal-title__eyebrow", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.55")
      .fromTo(".reveal-title__name", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.16 }, "-=0.3")
      .to(".reveal-title__amp", { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: "back.out(2)" }, "-=0.55")
      .to(".reveal-title__rule span", { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.25")
      .fromTo(".reveal-title__date", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .to(".reveal-title__continue", { opacity: 1, duration: 0.6 }, "-=0.1");
  }

  function transitionToSite() {
    if (scene.dataset.state !== "opened") return;
    scene.dataset.state = "done";

    gsap.to(scene, {
      opacity: 0,
      scale: 1.03,
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: () => {
        scene.style.display = "none";
        scene.classList.add("is-done");
        document.body.classList.remove("is-locked");
        window.dispatchEvent(new CustomEvent("invitation:opened"));
      },
    });
  }

  scene.addEventListener("click", (e) => {
    const state = scene.dataset.state;
    if (state === "idle") return liftEnvelope();
    if (state === "lifted") return breakSeal();
    if (state === "opened" && !e.target.closest("#continue-btn")) return transitionToSite();
  });

  scene.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const state = scene.dataset.state;
    if (state === "idle") liftEnvelope();
    else if (state === "lifted") breakSeal();
    else if (state === "opened") transitionToSite();
  });

  continueBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    transitionToSite();
  });
})();
