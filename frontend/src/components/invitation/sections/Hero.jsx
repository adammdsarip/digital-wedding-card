import React from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";

// Small reusable ornamental divider using the gold flourish asset.
export function Ornament({ className = "" }) {
  return (
    <img
      src="/assets/gold_divider.png"
      alt=""
      aria-hidden="true"
      className={`ornament ${className}`}
    />
  );
}

// Section label eyebrow.
export function Eyebrow({ children }) {
  return <span className="eyebrow">{children}</span>;
}

export default function Hero() {
  return (
    <section className="section hero" data-testid="section-hero">
      <img className="hero-sprig hero-sprig--tl" src="/assets/florals_sprig.png" alt="" aria-hidden="true" />
      <img className="hero-sprig hero-sprig--br" src="/assets/florals_sprig.png" alt="" aria-hidden="true" />

      <Reveal className="hero-inner">
        <Eyebrow>Together with their families</Eyebrow>
        <p className="hero-script">the wedding of</p>
        <h1 className="hero-names">
          <span>{wedding.groom}</span>
          <span className="hero-amp">&amp;</span>
          <span>{wedding.bride}</span>
        </h1>
        <Ornament className="hero-ornament" />
        <p className="hero-date">{wedding.dateShort}</p>
        <p className="hero-place">{wedding.venue.name} · {wedding.city}</p>
        <span className="scroll-cue" aria-hidden="true">
          <span className="scroll-cue-dot" />
          Scroll
        </span>
      </Reveal>
    </section>
  );
}
