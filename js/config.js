/**
 * ============================================================
 * WEDDING CONFIGURATION
 * ------------------------------------------------------------
 * Every piece of copy, every date, every photo and colour that
 * appears on the invitation is driven from this single file.
 * Nothing below is referenced by literal text anywhere else in
 * the codebase — edit this object and the whole site updates.
 * ============================================================
 */

const WEDDING = {

  // ---- The couple -------------------------------------------------
  // Names appear in this order everywhere: envelope, hero, sign-offs.
  partnerOne: "Adam",
  partnerOneFull: "Adam Mohd Sarip",
  partnerTwo: "Nurin",
  partnerTwoFull: "Nurin Batrisyia",

  // The word between the two names. "and" (set in the script face) matches
  // the printed envelope; "&" also works.
  connector: "and",

  // Envelope copy. The seal monogram is derived from the two initials.
  envelopeEyebrow: "The Wedding Of",
  tagline: "A Beautiful Journey Together",

  // ---- The date -----------------------------------------------------
  // isoDate powers the countdown; the rest are for display.
  isoDate: "2027-05-15T16:00:00",
  weekday: "Saturday",
  day: "15",
  month: "May",
  year: "2027",
  displayDate: "15 May 2027",

  // ---- Invitation message ------------------------------------------
  invitation: {
    eyebrow: "Together with their families",
    message:
      "we joyfully invite you to share in the celebration of our marriage — an evening of love, laughter, and the beginning of forever.",
    signoff: "With love, Adam and Nurin",
  },

  // ---- Hero / couple photograph --------------------------------------
  heroPhoto: {
    src: "assets/images/couple-hero.jpg",
    alt: "Adam and Nurin",
  },

  // ---- Our story ------------------------------------------------------
  story: {
    heading: "Our Story",
    intro: "A brief history of us, told in moments.",
    milestones: [
      {
        year: "2019",
        title: "How We Met",
        text: "A chance introduction at a mutual friend's dinner party turned into a conversation that lasted until sunrise.",
      },
      {
        year: "2021",
        title: "First Adventure",
        text: "A spontaneous trip to the coast confirmed what we already suspected — this was the beginning of something lasting.",
      },
      {
        year: "2023",
        title: "Moving In Together",
        text: "We found a small home to call our own, and with it, a quiet, steady kind of happiness.",
      },
      {
        year: "2026",
        title: "The Proposal",
        text: "On a walk beneath the autumn trees, with no fanfare at all, the question was asked — and answered without hesitation.",
      },
    ],
  },

  // ---- Ceremony ---------------------------------------------------------
  ceremony: {
    heading: "Wedding Ceremony",
    time: "4:00 PM",
    venueName: "St. Augustine's Chapel",
    address: "12 Laurel Hill Road, Hartford",
    note: "A brief exchange of vows beneath the chapel's original stone archway.",
  },

  // ---- Reception ----------------------------------------------------------
  reception: {
    heading: "Reception",
    time: "6:30 PM",
    venueName: "The Willowmere Estate",
    address: "4 Willowmere Lane, Hartford",
    note: "Dinner, dancing, and a night to remember beneath the garden lights.",
  },

  // ---- Venue / map --------------------------------------------------------
  venue: {
    heading: "Venue",
    name: "The Willowmere Estate",
    address: "4 Willowmere Lane, Hartford, CT 06103",
    // A key-free embed: swap the query for your own venue, or paste a
    // full "Share > Embed a map" URL from Google Maps for more control.
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Willowmere+Estate%2C+4+Willowmere+Lane%2C+Hartford%2C+CT&t=&z=15&ie=UTF8&iwloc=&output=embed",
    mapLinkUrl: "https://maps.google.com/?q=Willowmere+Estate+Hartford",
  },

  // ---- Timeline (day-of schedule) -----------------------------------------
  timeline: {
    heading: "Wedding Timeline",
    items: [
      { time: "3:30 PM", label: "Guest Arrival", detail: "Doors open, welcome drinks served." },
      { time: "4:00 PM", label: "Ceremony", detail: "Exchange of vows." },
      { time: "5:00 PM", label: "Cocktail Hour", detail: "Canapés and refreshments on the terrace." },
      { time: "6:30 PM", label: "Reception & Dinner", detail: "Seated dinner and toasts." },
      { time: "8:30 PM", label: "First Dance", detail: "Followed by open dancing." },
      { time: "11:30 PM", label: "Send-Off", detail: "A warm farewell beneath the fairy lights." },
    ],
  },

  // ---- Gallery ------------------------------------------------------------
  gallery: {
    heading: "Photo Gallery",
    intro: "A few of our favourite moments together.",
    photos: [
      { src: "assets/images/gallery-1.jpg", alt: "Adam and Nurin, moment one" },
      { src: "assets/images/gallery-2.jpg", alt: "Adam and Nurin, moment two" },
      { src: "assets/images/gallery-3.jpg", alt: "Adam and Nurin, moment three" },
      { src: "assets/images/gallery-4.jpg", alt: "Adam and Nurin, moment four" },
      { src: "assets/images/gallery-5.jpg", alt: "Adam and Nurin, moment five" },
      { src: "assets/images/gallery-6.jpg", alt: "Adam and Nurin, moment six" },
    ],
  },

  // ---- RSVP -----------------------------------------------------------------
  rsvp: {
    heading: "RSVP",
    intro: "We would be honoured to have you join us. Kindly respond by 1 April 2027.",
    deadline: "1 April 2027",
    // Set a `formEndpoint` (e.g. a Formspree URL) to receive real submissions.
    formEndpoint: "",
    email: "adam.and.nurin@example.com",
    phone: "+1 (555) 019-2847",
  },

  // ---- Closing ----------------------------------------------------------------
  closing: {
    heading: "We Can't Wait to Celebrate With You",
    message:
      "Your presence is the greatest gift of all. Thank you for being part of our story, and for the one that begins next.",
    signoff: "Adam and Nurin",
  },

  // ---- Music ---------------------------------------------------------------------
  music: {
    // Point this at a hosted mp3/ogg to enable the toggle in the corner.
    src: "assets/audio/wedding-theme.mp3",
    title: "Our Song",
  },

  // ---- Colour palette (mirrored in css/variables.css — kept here for
  //      reference / for any JS-driven theming) --------------------------------
  palette: {
    ivory: "#FDFAF4",
    cream: "#F4EAD9",
    champagne: "#ECDCC0",
    blush: "#F3E3DA",
    gold: "#B08B4F",
    goldWax: "#C2A263",
    charcoal: "#3A302A",
  },
};

// Expose to the rest of the app.
window.WEDDING = WEDDING;
