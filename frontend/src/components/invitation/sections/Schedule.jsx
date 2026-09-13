import React from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";
import { Eyebrow, Ornament } from "./Hero";

export default function Schedule() {
  return (
    <section className="section schedule" data-testid="section-schedule">
      <Reveal className="section-head">
        <Eyebrow>The day</Eyebrow>
        <h2 className="section-title">Wedding Schedule</h2>
        <Ornament />
      </Reveal>

      <div className="timeline">
        {wedding.schedule.map((s, i) => (
          <Reveal key={s.time} className="timeline-row" delay={i * 80}>
            <span className="timeline-time">{s.time}</span>
            <span className="timeline-dot" aria-hidden="true" />
            <span className="timeline-body">
              <span className="timeline-title">{s.title}</span>
              <span className="timeline-note">{s.note}</span>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
