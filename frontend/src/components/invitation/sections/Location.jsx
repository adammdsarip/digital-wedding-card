import React from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";
import { Eyebrow } from "./Hero";
import { Navigation } from "lucide-react";

export default function Location() {
  const q = encodeURIComponent(wedding.venue.mapQuery);
  return (
    <section className="section location" data-testid="section-location">
      <Reveal className="section-head">
        <Eyebrow>Find your way</Eyebrow>
        <h2 className="section-title">The Venue</h2>
      </Reveal>

      <Reveal className="map-frame" delay={120}>
        <iframe
          title="Venue map"
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Reveal>

      <Reveal className="map-meta" delay={160}>
        <span className="map-venue">{wedding.venue.name}</span>
        <span className="map-line">{wedding.venue.line}</span>
        <a
          className="map-btn"
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noreferrer"
          data-testid="directions-btn"
        >
          <Navigation size={15} /> Get Directions
        </a>
      </Reveal>
    </section>
  );
}
