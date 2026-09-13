import React from "react";
import { wedding } from "../../../data/wedding";
import useCountdown from "../../../hooks/useCountdown";
import Reveal from "../Reveal";
import { Eyebrow } from "./Hero";

export default function Countdown() {
  const t = useCountdown(wedding.dateISO);
  const units = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];
  return (
    <section className="section countdown" data-testid="section-countdown">
      <Reveal className="section-head">
        <Eyebrow>Counting down</Eyebrow>
        <h2 className="section-title">Until We Say “I Do”</h2>
      </Reveal>
      <Reveal className="count-grid" delay={120}>
        {units.map((u) => (
          <div className="count-cell" key={u.label} data-testid={`count-${u.label.toLowerCase()}`}>
            <span className="count-num">{String(u.value).padStart(2, "0")}</span>
            <span className="count-label">{u.label}</span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
