import React, { useState } from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";
import { Eyebrow } from "./Hero";
import { X } from "lucide-react";

export default function Gallery() {
  const [active, setActive] = useState(null);
  return (
    <section className="section gallery" data-testid="section-gallery">
      <Reveal className="section-head">
        <Eyebrow>Moments</Eyebrow>
        <h2 className="section-title">Photo Gallery</h2>
      </Reveal>

      <div className="gallery-grid">
        {wedding.gallery.map((src, i) => (
          <Reveal
            key={src}
            as="button"
            className={`gallery-item g-${i % 3}`}
            delay={(i % 3) * 90}
            onClick={() => setActive(src)}
            data-testid={`gallery-item-${i}`}
          >
            <img src={src} alt={`Gallery ${i + 1}`} loading="lazy" />
            <span className="gallery-veil" aria-hidden="true" />
          </Reveal>
        ))}
      </div>

      {active && (
        <div className="lightbox" onClick={() => setActive(null)} data-testid="lightbox">
          <button className="lightbox-close" aria-label="Close" data-testid="lightbox-close">
            <X size={22} />
          </button>
          <img src={active} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
