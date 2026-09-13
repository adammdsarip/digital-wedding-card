import React, { useEffect, useRef } from "react";

/**
 * ParallaxScene tracks pointer / touch / device-tilt and writes two CSS
 * custom properties (--mx, --my), each in the range roughly [-1, 1], onto its
 * root element. Child layers consume these with translate3d() only — no
 * rotation — so the composition keeps a straight, front-facing camera.
 *
 * Movement is smoothed with a rAF lerp loop, reduced on small screens, and
 * fully disabled when prefers-reduced-motion is set.
 */
export default function ParallaxScene({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const strength = isMobile ? 0.55 : 1; // reduce parallax on phones

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      // negative so layers drift opposite the pointer (natural depth)
      el.style.setProperty("--mx", (-cx * strength).toFixed(4));
      el.style.setProperty("--my", (-cy * strength).toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    const setFromPoint = (x, y) => {
      tx = (x / window.innerWidth) * 2 - 1;
      ty = (y / window.innerHeight) * 2 - 1;
    };
    const onMouse = (e) => setFromPoint(e.clientX, e.clientY);
    const onTouch = (e) => {
      const t = e.touches && e.touches[0];
      if (t) setFromPoint(t.clientX, t.clientY);
    };
    const onTilt = (e) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 28));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 28));
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("deviceorientation", onTilt, true);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onTilt, true);
    };
  }, []);

  return (
    <div ref={ref} className={`parallax-scene ${className}`}>
      {children}
    </div>
  );
}
