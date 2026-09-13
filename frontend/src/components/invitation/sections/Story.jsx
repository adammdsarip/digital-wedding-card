import React from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";
import { Eyebrow, Ornament } from "./Hero";

export default function Story() {
  return (
    <section className="section story" data-testid="section-story">
      <Reveal className="section-head">
        <Eyebrow>How it began</Eyebrow>
        <h2 className="section-title">Our Story</h2>
        <Ornament />
      </Reveal>

      <div className="story-wrap">
        <Reveal className="story-photo">
          <img src={wedding.storyPhoto} alt="The couple" loading="lazy" />
          <span className="story-photo-frame" aria-hidden="true" />
        </Reveal>

        <div className="story-timeline">
          {wedding.story.map((s, i) => (
            <Reveal key={s.year} className="story-item" delay={i * 100}>
              <span className="story-year">{s.year}</span>
              <span className="story-item-title">{s.title}</span>
              <p className="story-text">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
