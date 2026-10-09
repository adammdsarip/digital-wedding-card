/**
 * envelope.js
 * ------------------------------------------------------------
 * The opening sequence, as three states:
 *
 *   closed   — sealed and resting on the stone, gently alive: an idle
 *              drift, a breathing shadow, leaf shadows moving overhead.
 *   opening  — the seal lets go, the flap swings up over its hinge
 *              (gathering pace to upright, easing down past it), and
 *              the card slides up out of the pocket toward the viewer.
 *   revealed — the card rests above the envelope, its foot still in
 *              the pocket. One more tap enters the invitation site.
 *
 * Each state has its own function below. Every timing and curve lives
 * in MOTION, so the feel can be tuned in one place without touching
 * the choreography.
 * ------------------------------------------------------------
 */
(function () {
  const scene = document.getElementById("envelope-scene");
  if (!scene) return;

  // Hands the page over to the invitation site. Shared by every path out.
  const finish = () => {
    scene.style.display = "none";
    document.body.classList.remove("is-locked");
    window.dispatchEvent(new CustomEvent("invitation:opened"));
  };

  // Without GSAP the scene must never trap the guest: one tap goes straight in.
  if (typeof gsap === "undefined") {
    const skip = () => {
      window.dispatchEvent(new CustomEvent("invitation:opening"));
      finish();
    };
    scene.addEventListener("click", skip, { once: true });
    return;
  }

  // ---- MOTION: the feel of the whole sequence --------------------------------
  // Curves are cubic-béziers [x1, y1, x2, y2]. Durations in seconds; distances
  // as fractions of the envelope's width, so they hold at every screen size.
  const MOTION = {
    curves: {
      press:    [0.3, 0, 0.2, 1],     // a short, firm push
      flapUp:   [0.42, 0, 0.78, 0.5], // paper peels free, then gathers pace to upright…
      flapOver: [0.2, 0.48, 0.3, 1],  // …carries that speed over the top, then eases down
      camera:   [0.5, 0, 0.2, 1],     // the view drifts down to make room for the card
      cardRise: [0.45, 0, 0.15, 1],   // drawn up out of the pocket, slowing as it clears
      settle:   [0.37, 0, 0.63, 1],   // comes to rest — no bounce
    },
    dur: {
      press: 0.2,
      release: 0.6,
      flapUp: 0.8,
      flapOver: 0.9,
      camera: 2.4,
      cardRise: 1.8,
      cardToward: 1.3,
      settle: 1.0,
      exit: 1.0,
    },
    // when each beat starts, in seconds from the tap
    at: { flap: 0.55, camera: 0.9 },
    // the card starts rising this long after the flap passes upright
    cardAfterUpright: 0.1,
    card: {
      rise: 0.76,       // × W: from tucked in to resting above the envelope
      overshoot: 0.016, // × W: drawn a touch too far, then let down onto it
      scale: 1.035,     // toward the viewer
      tiltFrom: 9,      // degrees it leans back while still inside
    },
    idle: { period: 4.8, drift: 0.006, tilt: 1.5 },
    pointerTilt: 5,       // degrees, mouse only
    skipSpeed: 2.4,       // a tap mid-sequence speeds it up rather than being lost
    // space kept clear around the revealed composition, in px
    frame: { top: 18, bottom: 64 },
  };

  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const EASE = {};
  Object.entries(MOTION.curves).forEach(([name, [x1, y1, x2, y2]]) => {
    EASE[name] = window.CustomEase
      ? CustomEase.create(name, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`)
      : "power2.inOut";
  });

  // ---- The layers ---------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const stage = scene.querySelector(".scene__stage");
  const title = $("scene-title");
  const cue = $("scene-cue");
  const cueLine = cue.querySelector(".scene__cue-line");
  const next = $("scene-next");
  const leaves = $("scene-leaves");
  const rig = $("env-rig");
  const tilt = $("env-tilt");
  const float = $("env-float");
  const envelope = $("envelope");
  const floor = $("env-floor");
  const hinge = $("env-hinge");
  const flap = $("env-flap");
  const flapOuter = $("flap-outer");
  const flapInner = $("flap-inner");
  const shadeOut = $("flap-shade-out");
  const shadeIn = $("flap-shade-in");
  const contact = $("flap-contact");
  const cast = $("flap-cast");
  const cardRig = $("card-rig");
  const card = $("envelope-card");
  const cardShadow = $("card-shadow");
  const sheen = $("card-sheen");
  const sealWax = $("seal-wax");
  const sealShadow = $("seal-shadow");
  const glint = $("seal-glint");

  const W = () => envelope.offsetWidth;

  const copy = (window.WEDDING && window.WEDDING.envelope) || {};
  const LABELS = {
    closed: "Tap to open your wedding invitation",
    opening: "Opening your invitation",
    revealed: copy.revealHint || "Tap to view the invitation",
    leaving: "Opening your invitation",
  };

  let state = "closed";
  const setState = (s) => {
    state = s;
    scene.dataset.state = s;
    scene.setAttribute("aria-label", LABELS[s]);
  };

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = reducedQuery.matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Normalise transforms GSAP will own (the CSS parks these off to one side).
  gsap.set([glint, sheen], { x: 0, xPercent: -100 });

  // ---- Shared poses ----------------------------------------------------------------
  // How far the rig must move so the opened composition — the card's top
  // down to the envelope's foot — sits centred in the space available.
  function cameraOffset(w) {
    const box = rig.getBoundingClientRect();
    const restingTop = box.top - (gsap.getProperty(rig, "y") || 0);
    const cardTop = restingTop + 0.04 * w - MOTION.card.rise * w
      - (MOTION.card.scale - 1) * 1.2 * w * 0.88;
    const bottom = restingTop + 0.7 * w + 0.04 * w;            // envelope plus its shadow
    const areaTop = MOTION.frame.top;
    const areaBottom = scene.clientHeight - MOTION.frame.bottom;
    const span = bottom - cardTop;
    const targetTop = span > areaBottom - areaTop
      ? areaTop                                                  // too tall: keep the card's top on screen
      : areaTop + (areaBottom - areaTop - span) / 2;
    return targetTop - cardTop;
  }

  // At 90° the flap is edge-on to the viewer: the moment to turn it over
  // (swap faces) and send it behind the card, where it now physically is.
  function turnFlapOver() {
    gsap.set(hinge, { zIndex: 2 });
    gsap.set(flapOuter, { autoAlpha: 0 });
    gsap.set(flapInner, { autoAlpha: 1 });
  }

  function setRevealedPose() {
    const w = W();
    turnFlapOver();
    gsap.set([title, cue, contact, cast], { autoAlpha: 0 });
    gsap.set(flap, { rotationX: 180 });
    gsap.set(shadeIn, { opacity: 0.12 });
    gsap.set(rig, { y: cameraOffset(w) });
    gsap.set(cardRig, { y: -MOTION.card.rise * w, rotationX: 0, scale: MOTION.card.scale });
    gsap.set(cardShadow, { opacity: 1 });
  }

  // ---- Ambient life ----------------------------------------------------------------
  let idle = [];
  let leavesTween = null;

  function startLeaves() {
    if (reduce || leavesTween) return;
    leavesTween = gsap.to(leaves, {
      xPercent: 2.4, yPercent: -1.4, rotation: 0.8,
      duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
  }

  function startIdle() {
    stopIdle(false);
    if (reduce) return;
    const w = W();
    const P = MOTION.idle.period;
    const loop = { ease: "sine.inOut", yoyo: true, repeat: -1 };

    idle.push(
      gsap.to(float, { y: -MOTION.idle.drift * w, rotation: 0.3, duration: P, ...loop }),
      gsap.to(floor, { scale: 0.975, opacity: 0.85, duration: P, ...loop })
    );
    // On touch screens the envelope turns a few degrees on its own; with a
    // mouse the pointer owns that turn instead (see below).
    if (!finePointer) {
      idle.push(gsap.to(tilt, {
        rotationX: MOTION.idle.tilt, rotationY: -MOTION.idle.tilt * 1.4,
        duration: P * 1.4, ...loop,
      }));
    }
    if (state === "closed") {
      idle.push(
        gsap.fromTo(cueLine, { scaleY: 0.4, opacity: 0.5 },
          { scaleY: 1, opacity: 1, duration: 1.7, ...loop }),
        gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 2 })
          .fromTo(glint, { xPercent: -100 }, { xPercent: 100, duration: 1.5, ease: "sine.inOut" })
      );
    } else {
      // revealed: the card breathes very slightly in its pocket
      idle.push(gsap.to(card, { y: -0.004 * w, duration: P * 0.9, ...loop }));
    }
  }

  function stopIdle(ease = true) {
    idle.forEach((t) => t.kill());
    idle = [];
    if (!ease) return;
    const back = { duration: 0.7, ease: "sine.out", overwrite: "auto" };
    gsap.to(float, { y: 0, rotation: 0, ...back });
    gsap.to(floor, { scale: 1, opacity: 1, ...back });
    gsap.to(card, { y: 0, ...back });
    if (!finePointer) gsap.to(tilt, { rotationX: 0, rotationY: 0, ...back });
  }

  // A few degrees of turn under the mouse — the one owner of the tilt on desktop.
  if (finePointer) {
    const turnY = gsap.quickTo(tilt, "rotationY", { duration: 1.2, ease: "power3.out" });
    const turnX = gsap.quickTo(tilt, "rotationX", { duration: 1.2, ease: "power3.out" });
    scene.addEventListener("pointermove", (e) => {
      if (reduce || state === "leaving") return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      turnY(nx * MOTION.pointerTilt);
      turnX(-ny * MOTION.pointerTilt);
    });
    scene.addEventListener("pointerleave", () => { turnY(0); turnX(0); });
  }

  // ==================================================================================
  // STATE 1 · CLOSED
  // ==================================================================================
  function toClosed() {
    setState("closed");
    gsap.from(stage, { autoAlpha: 0, y: reduce ? 0 : 14, duration: reduce ? 0.4 : 1.4, ease: "power2.out" });
    startLeaves();
    startIdle();
  }

  // ==================================================================================
  // STATE 2 · OPENING
  // ==================================================================================
  let openTl = null;

  function toOpening() {
    if (state !== "closed") return;
    setState("opening");
    stopIdle();
    openTl = reduce ? buildOpeningReduced() : buildOpening();
  }

  function buildOpening() {
    const w = W();
    const C = EASE;
    const D = MOTION.dur;
    const rise = MOTION.card.rise * w;
    const over = MOTION.card.overshoot * w;
    const camY = cameraOffset(w);
    const tl = gsap.timeline({ onComplete: toRevealed });

    // ---- press: the words step aside, the seal is pressed and lets go -------------
    tl.addLabel("press", 0)
      .to(title, { autoAlpha: 0, y: -0.03 * w, duration: 0.8, ease: "power2.inOut" }, "press")
      .to(cue, { autoAlpha: 0, y: 0.03 * w, duration: 0.6, ease: "power2.inOut" }, "press")
      .to(sealWax, { scale: 0.955, duration: D.press, ease: C.press }, "press")
      .to(sealShadow, { scale: 0.92, duration: D.press, ease: C.press }, "press")

      .addLabel("seal", `press+=${D.press}`)
      .to(sealWax, { scale: 1.03, y: -0.004 * w, duration: D.release, ease: "power2.out" }, "seal")
      .to(sealShadow, { scale: 1.08, x: 0.004 * w, y: 0.008 * w, opacity: 0.8, duration: D.release, ease: "power2.out" }, "seal")
      .fromTo(glint, { xPercent: -100 }, { xPercent: 100, duration: 1.1, ease: "sine.inOut" }, "seal")
      .to(sealWax, { scale: 1, y: 0, duration: 0.9, ease: C.settle }, `seal+=${D.release}`)
      .to(sealShadow, { scale: 1, x: 0, y: 0, opacity: 1, duration: 0.9, ease: C.settle }, "<")

    // ---- flap, first half: peels free and lifts toward the viewer ------------------
      .addLabel("flap", `press+=${MOTION.at.flap}`)
      .to(contact, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, "flap")
      .to(flap, { rotationX: 90, duration: D.flapUp, ease: C.flapUp }, "flap")
      .to(shadeOut, { opacity: 0.45, duration: D.flapUp, ease: C.flapUp }, "flap")
      // its shadow darkens the mouth beneath it, then thins as it stands up
      .fromTo(cast, { autoAlpha: 0, scaleY: 1 },
        { autoAlpha: 1, scaleY: 0.75, duration: D.flapUp * 0.55, ease: "sine.out" }, "flap")
      .to(cast, { autoAlpha: 0, scaleY: 0.4, duration: D.flapUp * 0.5, ease: "sine.in" }, `flap+=${D.flapUp * 0.55}`)

    // ---- upright: edge-on, so it turns over and drops behind the card -------------
      .addLabel("upright", `flap+=${D.flapUp}`)
      // (.set rather than a callback, so seeking or skipping lands it too)
      .set(hinge, { zIndex: 2 }, "upright")
      .set(flapOuter, { autoAlpha: 0 }, "upright")
      .set(flapInner, { autoAlpha: 1 }, "upright")
      .to(flap, { rotationX: 180, duration: D.flapOver, ease: C.flapOver }, "upright")
      // the inside starts in its own shadow and comes into the light as it lies back
      .fromTo(shadeIn, { opacity: 1 }, { opacity: 0.12, duration: D.flapOver, ease: C.flapOver }, "upright")

    // ---- the view drifts down to make room above ------------------------------------
      .to(rig, { y: camY, duration: D.camera, ease: C.camera }, `press+=${MOTION.at.camera}`)

    // ---- card: up out of the pocket, straightening and coming toward the viewer --------
      .addLabel("card", `upright+=${MOTION.cardAfterUpright}`)
      .fromTo(cardRig, { y: 0, rotationX: MOTION.card.tiltFrom },
        { y: -(rise + over), rotationX: 0, duration: D.cardRise, ease: C.cardRise }, "card")
      .to(cardRig, { scale: MOTION.card.scale, duration: D.cardToward, ease: "sine.inOut" },
        `card+=${D.cardRise - D.cardToward}`)
      // the further it lifts off the lining, the softer and wider its shadow
      .to(cardShadow, { opacity: 1, duration: D.cardRise, ease: "sine.inOut" }, "card")
      .to(leaves, { opacity: 0.08, duration: D.cardRise, ease: "sine.inOut" }, "card")

    // ---- settle: let down onto its resting place ----------------------------------------
      .addLabel("settle", `card+=${D.cardRise}`)
      .to(cardRig, { y: -rise, duration: D.settle, ease: C.settle }, "settle")

    // ---- reveal: one pass of light across the card, then the next cue ---------------------
      .addLabel("reveal", "settle+=0.15")
      .fromTo(sheen, { autoAlpha: 1, xPercent: -60 }, { xPercent: 60, duration: 1.7, ease: "sine.inOut" }, "reveal")
      .to(sheen, { autoAlpha: 0, duration: 0.5, ease: "sine.in" }, "reveal+=1.2")
      .fromTo(next, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, "reveal+=0.4");

    return tl;
  }

  // Reduced motion: nothing travels. The scene dims, the envelope is
  // found open with the card out, and it fades back up.
  function buildOpeningReduced() {
    return gsap.timeline({ onComplete: toRevealed })
      .to(stage, { autoAlpha: 0, duration: 0.35, ease: "power1.out" })
      .add(setRevealedPose)
      .to(stage, { autoAlpha: 1, duration: 0.5, ease: "power1.out" })
      .to(next, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, "<");
  }

  // ==================================================================================
  // STATE 3 · REVEALED
  // ==================================================================================
  function toRevealed() {
    setState("revealed");
    openTl = null;
    startIdle();
  }

  // ---- …and into the invitation site ------------------------------------------------
  function toSite() {
    if (state !== "revealed") return;
    setState("leaving");
    stopIdle(false);

    // The first sheet starts arriving as the envelope starts to fade.
    window.dispatchEvent(new CustomEvent("invitation:opening"));

    const tl = gsap.timeline({
      onComplete: () => {
        if (leavesTween) leavesTween.kill();
        finish();
      },
    });
    tl.to(next, { autoAlpha: 0, duration: 0.4 }, 0);
    if (!reduce) {
      tl.to(cardRig, {
        y: `-=${0.02 * W()}`, scale: MOTION.card.scale * 1.04,
        duration: MOTION.dur.exit * 1.1, ease: EASE.camera,
      }, 0);
    }
    tl.to(scene, { autoAlpha: 0, duration: reduce ? 0.5 : MOTION.dur.exit, ease: "power2.inOut" }, reduce ? 0 : 0.15);
  }

  // ---- Input ------------------------------------------------------------------------
  function advance() {
    if (state === "closed") return toOpening();
    if (state === "opening") {
      if (openTl) openTl.timeScale(MOTION.skipSpeed);
      return;
    }
    if (state === "revealed") return toSite();
  }

  scene.addEventListener("click", advance);
  scene.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    advance();
  });

  // The revealed pose depends on the screen's size; keep it framed on rotate/resize.
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state === "revealed") {
        stopIdle(false);
        setRevealedPose();
        startIdle();
      }
    }, 150);
  });

  // The OS setting can change while the page is open.
  const onReduceChange = (e) => {
    reduce = e.matches;
    if (reduce) {
      stopIdle();
      if (leavesTween) { leavesTween.kill(); leavesTween = null; }
    } else if (state === "closed" || state === "revealed") {
      startLeaves();
      startIdle();
    }
  };
  if (reducedQuery.addEventListener) reducedQuery.addEventListener("change", onReduceChange);

  toClosed();
})();
