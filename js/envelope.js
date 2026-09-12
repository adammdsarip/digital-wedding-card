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
  const sheen = document.getElementById("foil-sheen");
  const stage = document.querySelector(".envelope-scene__stage");

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

  /* ---- Scene 1: the envelope settles onto the table ------------------- */
  let shimmer;

  function playIntro() {
    if (reduceMotion) {
      startShimmer();
      return;
    }
    gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: startShimmer })
      .from(envelope, { y: 18, scale: 0.965, autoAlpha: 0, duration: 1.4 })
      .from(".envelope__floor-shadow", { scaleX: 0.8, autoAlpha: 0, duration: 1.4 }, "<")
      .from(hint, { autoAlpha: 0, y: 8, duration: 0.8 }, "-=0.5");
  }

  /* Gold foil catches the light every few seconds — the shimmer travels
     through the printed names and a soft highlight crosses the paper. */
  function startShimmer() {
    if (reduceMotion || shimmer) return;
    shimmer = gsap.timeline({ repeat: -1, repeatDelay: 3.6, defaults: { ease: "power1.inOut" } })
      .fromTo(".envelope__name",
        { backgroundPosition: "130% 0" },
        { backgroundPosition: "-30% 0", duration: 2.6 })
      .fromTo(sheen,
        { autoAlpha: 0, xPercent: -55 },
        { autoAlpha: 0.45, xPercent: 0, duration: 1.3 }, "<")
      .to(sheen, { autoAlpha: 0, xPercent: 55, duration: 1.3 });
  }

  /* Ambient parallax: the envelope turns a few degrees toward the pointer.
     quickTo reuses one tween per property instead of spawning a new tween
     on every pointermove — and stays the single owner of rotationX/Y, so
     nothing else needs to overwrite it. */
  let turnX, turnY;

  if (stage) {
    turnY = gsap.quickTo(envelope, "rotationY", { duration: 0.9, ease: "power3" });
    turnX = gsap.quickTo(envelope, "rotationX", { duration: 0.9, ease: "power3" });

    scene.addEventListener("pointermove", (e) => {
      if (reduceMotion || e.pointerType !== "mouse") return;
      if (scene.dataset.state === "breaking" || scene.dataset.state === "done") return;
      turnY((e.clientX / window.innerWidth - 0.5) * 7);
      turnX((e.clientY / window.innerHeight - 0.5) * -5);
    });

    scene.addEventListener("pointerleave", () => {
      if (reduceMotion) return;
      turnY(0);
      turnX(0);
    });
  }

  playIntro();

  function liftEnvelope() {
    if (scene.dataset.state !== "idle") return;
    scene.dataset.state = "lifted";
    hint.textContent = "Tap the Seal to Open";

    // overwrite:"auto" hands the envelope over cleanly if a guest taps
    // while the intro tween is still settling it into place.
    gsap.timeline({ defaults: { duration: 0.55, ease: "power2.out", overwrite: "auto" } })
      .to(envelope, { scale: 1.035, y: -6 })
      .to(".envelope__floor-shadow", { autoAlpha: 0.55, scaleX: 1.06 }, "<")
      .to(tagline, { autoAlpha: 0.4, duration: 0.4 }, "<");
  }

  function breakSeal() {
    if (scene.dataset.state !== "lifted") return;
    scene.dataset.state = "breaking";
    hint.classList.add("is-hidden");

    // The foil has done its job; square the envelope up to the viewer so
    // the flap opens face-on rather than from a parallax angle.
    if (shimmer) shimmer.kill();
    gsap.to(sheen, { autoAlpha: 0, duration: 0.3 });
    if (turnX) { turnX(0); turnY(0); }

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
