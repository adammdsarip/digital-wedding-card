import React, { useState } from "react";
import Reveal from "../Reveal";
import { Eyebrow } from "./Hero";
import { Heart, Check } from "lucide-react";

const empty = { name: "", email: "", attending: "yes", guests: "1", message: "" };

export default function Rsvp() {
  const [form, setForm] = useState(empty);
  const [sent, setSent] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    // Form UI only for now — capture locally and show a thank-you state.
    setSent(true);
  };

  return (
    <section className="section rsvp" data-testid="section-rsvp">
      <Reveal className="section-head">
        <Eyebrow>Kindly respond</Eyebrow>
        <h2 className="section-title">RSVP</h2>
        <p className="section-sub">We would be honoured by your presence.</p>
      </Reveal>

      {sent ? (
        <Reveal className="rsvp-thanks" data-testid="rsvp-thanks">
          <span className="rsvp-thanks-icon">
            <Heart size={26} />
          </span>
          <p className="rsvp-thanks-title">Thank you, {form.name || "friend"}!</p>
          <p className="rsvp-thanks-text">
            {form.attending === "yes"
              ? "We can't wait to celebrate with you."
              : "You'll be dearly missed — thank you for letting us know."}
          </p>
          <button className="ghost-btn" onClick={() => { setForm(empty); setSent(false); }} data-testid="rsvp-reset">
            Send another response
          </button>
        </Reveal>
      ) : (
        <Reveal as="form" className="rsvp-form" onSubmit={submit} delay={100}>
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Your name"
              data-testid="rsvp-name"
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              placeholder="you@email.com"
              data-testid="rsvp-email"
            />
          </label>

          <div className="field">
            <span>Will you attend?</span>
            <div className="choice-row">
              <button
                type="button"
                className={`choice ${form.attending === "yes" ? "active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, attending: "yes" }))}
                data-testid="rsvp-attend-yes"
              >
                Joyfully accept
              </button>
              <button
                type="button"
                className={`choice ${form.attending === "no" ? "active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, attending: "no" }))}
                data-testid="rsvp-attend-no"
              >
                Regretfully decline
              </button>
            </div>
          </div>

          {form.attending === "yes" && (
            <label className="field">
              <span>Number of guests</span>
              <select value={form.guests} onChange={update("guests")} data-testid="rsvp-guests">
                {["1", "2", "3", "4", "5"].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span>A note for the couple</span>
            <textarea
              rows={3}
              value={form.message}
              onChange={update("message")}
              placeholder="Share your wishes…"
              data-testid="rsvp-message"
            />
          </label>

          <button type="submit" className="submit-btn" data-testid="rsvp-submit">
            <Check size={16} /> Send RSVP
          </button>
        </Reveal>
      )}
    </section>
  );
}
