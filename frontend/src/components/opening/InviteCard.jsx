import React from "react";
import { wedding } from "../../data/wedding";

// The invitation card that lives inside the envelope and slides up on open.
// It stays perfectly front-facing at all times (translate only, no rotate).
export default function InviteCard() {
  return (
    <div className="invite-card" data-testid="invite-card">
      <div className="card-inner">
        <img
          className="card-sprig card-sprig--tr"
          src="/assets/florals_sprig.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="card-sprig card-sprig--bl"
          src="/assets/florals_sprig.png"
          alt=""
          aria-hidden="true"
        />

        <span className="card-mono">
          {wedding.monogram.left} <span className="amp">&amp;</span>{" "}
          {wedding.monogram.right}
        </span>

        <span className="card-script">You&apos;re Invited</span>

        <span className="card-names">
          {wedding.groom} <span className="card-names-amp">&amp;</span>{" "}
          {wedding.bride}
        </span>

        <img
          className="card-divider"
          src="/assets/gold_divider.png"
          alt=""
          aria-hidden="true"
        />

        <span className="card-savedate">
          <span>Save</span>
          <span className="the">the</span>
          <span>Date</span>
        </span>

        <span className="card-date">{wedding.dateShort}</span>
        <span className="card-note">{wedding.city}</span>
      </div>
    </div>
  );
}
