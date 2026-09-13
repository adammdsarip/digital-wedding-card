import React from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";
import { Eyebrow, Ornament } from "./Hero";
import { MapPin, Clock } from "lucide-react";

export default function Details() {
  const cards = [wedding.ceremony, wedding.reception];
  return (
    <section className="section details" data-testid="section-details">
      <Reveal className="section-head">
        <Eyebrow>Join us</Eyebrow>
        <h2 className="section-title">The Celebration</h2>
        <p className="section-sub">
          {wedding.dateLabel}, {wedding.yearLabel}
        </p>
        <Ornament />
      </Reveal>

      <div className="detail-grid">
        {cards.map((c, i) => (
          <Reveal key={c.title} className="detail-card" delay={i * 120}>
            <span className="detail-card-title">{c.title}</span>
            <span className="detail-time">
              <Clock size={15} /> {c.time}
            </span>
            <span className="detail-place">{c.place}</span>
            <p className="detail-note">{c.note}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="venue-block" delay={120}>
        <span className="venue-icon">
          <MapPin size={18} />
        </span>
        <span className="venue-name">{wedding.venue.name}</span>
        <span className="venue-line">{wedding.venue.line}</span>
      </Reveal>
    </section>
  );
}
