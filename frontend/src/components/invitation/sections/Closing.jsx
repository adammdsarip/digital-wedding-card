import React from "react";
import { wedding } from "../../../data/wedding";
import Reveal from "../Reveal";
import { Ornament } from "./Hero";

export default function Closing() {
  return (
    <section className="section closing" data-testid="section-closing">
      <img className="closing-sprig" src="/assets/florals_sprig.png" alt="" aria-hidden="true" />
      <Reveal className="closing-inner">
        <span className="closing-mono">
          {wedding.monogram.left} <span className="amp">&amp;</span> {wedding.monogram.right}
        </span>
        <p className="closing-message">{wedding.closing}</p>
        <Ornament />
        <p className="closing-names">
          {wedding.groom} &amp; {wedding.bride}
        </p>
        <p className="closing-hashtag">{wedding.hashtag}</p>
      </Reveal>
    </section>
  );
}
