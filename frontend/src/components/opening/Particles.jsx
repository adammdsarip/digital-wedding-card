import React, { useMemo } from "react";

// Lightweight drifting petals / dust motes for the foreground.
// Pure CSS animation (transform + opacity), GPU friendly.
export default function Particles({ count = 10 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 5 + Math.random() * 9,
        delay: -Math.random() * 14,
        dur: 12 + Math.random() * 12,
        drift: (Math.random() * 2 - 1) * 40,
        opacity: 0.25 + Math.random() * 0.45,
      })),
    [count]
  );

  return (
    <div className="particles" aria-hidden="true">
      {items.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            "--drift": `${p.drift}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
