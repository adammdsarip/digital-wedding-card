import React, { useCallback, useEffect, useRef, useState } from "react";
import ParallaxScene from "../parallax/ParallaxScene";
import Envelope from "./Envelope";
import Particles from "./Particles";

// Cumulative phase classes so earlier effects persist as we advance.
// phase 0 idle → 1 environment responds → 2 seal reacts → 3 flap opens
// → 4 card emerges → 5 settle + foreground → 6 hand off to main content.
function phaseClasses(p) {
  return Array.from({ length: p }, (_, i) => `ph-ge-${i + 1}`).join(" ");
}

const TIMELINE = [
  { p: 1, at: 0 },
  { p: 2, at: 380 },
  { p: 3, at: 820 },
  { p: 4, at: 1900 },
  { p: 5, at: 3050 },
  { p: 6, at: 3950 },
];
const HANDOFF_AT = 4650;

export default function OpeningScene({ onOpened }) {
  const [phase, setPhase] = useState(0);
  const [opening, setOpening] = useState(false);
  const timers = useRef([]);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const open = useCallback(() => {
    if (opening) return;
    setOpening(true);

    if (reduce) {
      setPhase(6);
      timers.current.push(setTimeout(() => onOpened(), 500));
      return;
    }

    TIMELINE.forEach(({ p, at }) => {
      timers.current.push(setTimeout(() => setPhase(p), at));
    });
    timers.current.push(setTimeout(() => onOpened(), HANDOFF_AT));
  }, [opening, reduce, onOpened]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div
      className={`opening-root ${phaseClasses(phase)}`}
      data-phase={phase}
      data-testid="opening-scene"
    >
      <ParallaxScene className="stage">
        {/* BACK → FRONT layered parallax system */}
        <div
          className="p-layer layer-bg"
          style={{ "--d": 0.05 }}
          aria-hidden="true"
        />
        <div
          className="p-layer layer-vignette"
          style={{ "--d": 0.08 }}
          aria-hidden="true"
        />
        <div
          className="p-layer layer-distant"
          style={{ "--d": 0.12 }}
          aria-hidden="true"
        />

        <img
          className="p-layer layer-flowers-behind"
          style={{ "--d": 0.2 }}
          src="/assets/florals_sprig.png"
          alt=""
          aria-hidden="true"
        />

        <button
          type="button"
          className="envelope-stage p-layer"
          style={{ "--d": 0.3 }}
          onClick={open}
          aria-label="Open the wedding invitation"
          data-testid="open-envelope-btn"
        >
          <Envelope />
        </button>

        {/* foreground florals (in front of the envelope) */}
        <img
          className="p-layer layer-fg-flowers layer-fg-flowers--left"
          style={{ "--d": 0.55 }}
          src="/assets/foreground_florals.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="p-layer layer-fg-flowers layer-fg-flowers--right"
          style={{ "--d": 0.55 }}
          src="/assets/foreground_florals.png"
          alt=""
          aria-hidden="true"
        />

        <div className="p-layer layer-particles" style={{ "--d": 0.7 }}>
          <Particles count={12} />
        </div>
      </ParallaxScene>

      {!opening && (
        <div className="open-hint" data-testid="open-hint">
          <span className="open-hint-line" />
          <span className="open-hint-text">Tap to open</span>
        </div>
      )}

      <button
        type="button"
        className="skip-btn"
        onClick={() => {
          timers.current.forEach(clearTimeout);
          onOpened();
        }}
        data-testid="skip-btn"
      >
        Skip
      </button>
    </div>
  );
}
