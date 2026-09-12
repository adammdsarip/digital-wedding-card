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

  // gsap.matchMedia() keeps this in sync with the OS setting for as long as
  // the page lives — not just a value read once at load — and is the
  // documented pattern for gating motion on prefers-reduced-motion.
  let reduceMotion = false;
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    reduceMotion = true;
    return () => {
      reduceMotion = false;
    };
  });

  scene.dataset.state = "idle";

  function liftEnvelope() {
    if (scene.dataset.state !== "idle") return;
    scene.dataset.state = "lifted";
    hint.textContent = "Tap the Seal to Open";

    gsap.timeline({ defaults: { duration: 0.55, ease: "power2.out" } })
      .to(envelope, { scale: 1.035, y: -6 })
      .to(".envelope__floor-shadow", { autoAlpha: 0.55, scaleX: 1.06 }, "<")
      .to(tagline, { autoAlpha: 0.4, duration: 0.4 }, "<");
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

    if (reduceMotion) {
      // Reduced-motion path: same beats, none of the spatial/3D motion.
      tl.to(seal, { autoAlpha: 0, duration: 0.3 })
        .to(flap, { autoAlpha: 0, duration: 0.4 }, "<")
        .to(pocket, { autoAlpha: 0, duration: 0.4 }, "<")
        .to(back, { opacity: 0.2, duration: 0.4 }, "<")
        .to(card, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6 }, "-=0.1")
        .to(".reveal-title__eyebrow, .reveal-title__name, .reveal-title__amp, .reveal-title__date, .reveal-title__continue",
          { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
        .set(".reveal-title__rule span", { scaleX: 1 }, "<");
      return;
    }

    // ---- Scene 3: the wax seal cracks -----------------------------------
    tl.addLabel("crack")
      .to(seal, { scale: 0.9, duration: 0.12, ease: "power2.in" }, "crack")
      .to(seal, { rotation: -4, duration: 0.06 })
      .to(seal, { rotation: 3, duration: 0.06 })
      .to(seal, { rotation: 0, scale: 1.04, duration: 0.12 })
      .set("#wax-seal-visual", { autoAlpha: 0 })
      .set(".wax-seal__half", { autoAlpha: 1 })
      .to(".wax-seal__half--left", { x: -15, y: 9, rotation: -24, autoAlpha: 0, duration: 0.55, ease: "power2.in" })
      .to(".wax-seal__half--right", { x: 15, y: 13, rotation: 22, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, "<")
      .to(fragments, {
        x: () => gsap.utils.random(-24, 24),
        y: () => gsap.utils.random(6, 32),
        rotation: () => gsap.utils.random(-120, 120),
        autoAlpha: 0,
        duration: () => gsap.utils.random(0.6, 0.9),
        stagger: { each: 0.02, from: "random" },
        ease: "power2.out",
      }, "<")
      .to(seal, { autoAlpha: 0, duration: 0.3 }, "-=0.15")

      // ---- Scene 4: the flap opens ----------------------------------------
      .addLabel("open", "-=0.1")
      .to(flap, { rotateX: -178, duration: 1.15, ease: "power3.inOut" }, "open")
      .to(pocket, { scaleY: 0.9, autoAlpha: 0, transformOrigin: "bottom center", duration: 0.55, ease: "power2.in" }, "open-=0.55")
      .to(back, { opacity: 0.25, duration: 0.6 }, "open")
      .to(tagline, { autoAlpha: 0, duration: 0.3 }, "open")

      // ---- Scene 5: the invitation emerges ---------------------------------
      .addLabel("emerge", "-=0.35")
      .to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }, "emerge")
      .to(flap, { autoAlpha: 0, duration: 0.4 }, "emerge+=0.25")

      // ---- Scene 6: the title reveals --------------------------------------
      .addLabel("reveal", "-=0.55")
      .to(".reveal-title__eyebrow", { autoAlpha: 1, y: 0, duration: 0.5 }, "reveal")
      .to(".reveal-title__name", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.16 }, "reveal+=0.25")
      .to(".reveal-title__amp", { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2)" }, "<")
      .to(".reveal-title__rule span", { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.25")
      .to(".reveal-title__date", { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.3")
      .to(".reveal-title__continue", { autoAlpha: 1, duration: 0.6 }, "-=0.1");
  }

  function transitionToSite() {
    if (scene.dataset.state !== "opened") return;
    scene.dataset.state = "done";

    gsap.to(scene, {
      autoAlpha: 0,
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
