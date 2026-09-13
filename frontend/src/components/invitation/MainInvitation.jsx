import React from "react";
import Hero from "./sections/Hero";
import Details from "./sections/Details";
import Countdown from "./sections/Countdown";
import Story from "./sections/Story";
import Gallery from "./sections/Gallery";
import Schedule from "./sections/Schedule";
import Location from "./sections/Location";
import Rsvp from "./sections/Rsvp";
import Closing from "./sections/Closing";

export default function MainInvitation() {
  return (
    <main className="invitation" data-testid="main-invitation">
      <div className="paper-bg" aria-hidden="true" />
      <Hero />
      <Details />
      <Countdown />
      <Story />
      <Gallery />
      <Schedule />
      <Location />
      <Rsvp />
      <Closing />
    </main>
  );
}
