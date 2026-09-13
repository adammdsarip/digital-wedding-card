import React from "react";
import InviteCard from "./InviteCard";

// The envelope is built entirely from styled layers so each piece can be
// controlled independently for the opening animation. The card only ever
// translates (never rotates); only the flap rotates as it opens.
export default function Envelope() {
  return (
    <div className="envelope" data-testid="envelope">
      {/* back panel of the envelope */}
      <div className="env-back" />

      {/* the invitation card, tucked inside */}
      <InviteCard />

      {/* static flaps keep the card fully hidden while closed */}
      <div className="flap-face env-flap-left" />
      <div className="flap-face env-flap-right" />
      <div className="flap-face env-flap-bottom" />

      {/* the top flap that folds open (rotateX on its top hinge only) */}
      <div className="flap-face env-flap">
        <div className="env-flap-shade" />
      </div>

      {/* wax seal sitting on the flap tip */}
      <img
        className="wax-seal"
        src="/assets/wax_seal.png"
        alt="Wax seal"
        data-testid="wax-seal"
      />
    </div>
  );
}
