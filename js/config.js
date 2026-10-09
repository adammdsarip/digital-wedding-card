/**
 * ============================================================
 * WEDDING CONFIGURATION
 * ------------------------------------------------------------
 * Every piece of copy, date, link and colour that appears on the
 * invitation lives in this one file. Nothing is hard-coded in the
 * HTML — edit this object and the whole site updates.
 *
 * Anything marked PLACEHOLDER is sample content taken from the
 * layout design; replace it with your real details.
 * ============================================================
 */

const WEDDING = {

  // ---- The couple -------------------------------------------------
  // Names appear in this order everywhere: envelope, card, invitation.
  partnerOne: "Isz",
  partnerTwo: "Khaty",

  // The word set between the two names ("and", or "&").
  connector: "and",

  // Social hashtag. Leave empty to derive it from the names.
  hashtag: "",

  // ---- The envelope -------------------------------------------------
  // The monogram and the wax seal are struck from the two initials above;
  // the card's date row is worked out from isoDate below.
  envelope: {
    eyebrow: ["A special invitation", "awaits"],
    hint: "Tap to open",
    revealHint: "Tap to view the invitation",
    card: {
      eyebrow: "Together with our families",
      connector: "&",
      invite: ["Invite you to celebrate", "our wedding"],
      place: "Singapore",
    },
  },

  // ---- The day (PLACEHOLDER date, taken from the envelope design) ------
  // One date drives everything. The weekday, day number, month and year
  // are all worked out from it, so they can never disagree with each other.
  isoDate: "2026-11-14T11:00:00",
  timeText: "11.00 AM",

  // ---- Panel 1: the invitation ------------------------------------------
  invitation: {
    eyebrow: ["Together", "with our families"],
    invite: "We cordially invite you to the wedding of",
    blessing: ["Two hearts • One journey", "In the name of love"],
    reception: "Reception to follow",
    closing: ["We look forward to", "celebrating with you"],
  },

  // ---- Venue (PLACEHOLDER) -----------------------------------------------
  venue: {
    name: "Venue Name",
    address: ["123 Street Name", "Singapore 123456"],
    // A key-free embed: change the q= search to your venue, or paste a full
    // "Share > Embed a map" URL from Google Maps for finer control.
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Somerset+MRT+Station+Singapore&z=16&ie=UTF8&iwloc=&output=embed",
    mapLinkUrl: "https://maps.google.com/?q=Somerset+MRT+Station+Singapore",
    mapButton: "Open in Google Maps",
  },

  // ---- Panel 2: the itinerary (PLACEHOLDER times) --------------------------
  // icon: mosque | cutlery | camera | toast | music
  itinerary: {
    eyebrow: "The",
    title: "Big Day",
    subtitle: "Itinerary",
    items: [
      { time: "11.00 AM", title: "Nikah Ceremony", detail: "A sacred moment as we say I do", icon: "mosque" },
      { time: "12.30 PM", title: "Lunch Reception", detail: "Join us for a meal and celebration", icon: "cutlery" },
      { time: "2.00 PM", title: "Photo Session", detail: "Capture the moments with us", icon: "camera" },
      { time: "3.30 PM", title: "Toast & Speeches", detail: "Heartfelt words, love and blessings", icon: "toast" },
      { time: "4.00 PM", title: "Celebration", detail: "Let's dine, mingle and celebrate together", icon: "music" },
    ],
  },

  // ---- Panel 3: location --------------------------------------------------
  // icon: car | train | bus
  location: {
    title: "Location",
    gettingHere: {
      title: "Getting here",
      items: [
        { icon: "car", label: "By Car", detail: ["Parking available", "at venue"] },
        { icon: "train", label: "By MRT", detail: ["Somerset MRT", "(5 mins walk)"] },
        { icon: "bus", label: "By Bus", detail: ["Multiple bus", "services nearby"] },
      ],
    },
  },

  // ---- Panel 4: RSVP ---------------------------------------------------------
  // A short form: name, coming or not, how many, any dietary needs, a message.
  // Every word on it is here. `endpoint` is where it will be sent once the Tally
  // form is connected (next step); until then it only previews.
  rsvp: {
    eyebrow: "Kindly",
    title: "RSVP",
    deadline: "By 31 October 2026",   // PLACEHOLDER
    intro: "Please let us know if you can join us.",
    endpoint: "",
    labels: {
      name: "Your name",
      attending: "Will you be joining us?",
      yes: ["Accepts", "with pleasure"],
      no: ["Regretfully", "declines"],
      guests: "Number of guests",
      guestsHint: "Including yourself",
      dietary: "Dietary requirements",
      message: "A note for us",
      optional: "Optional",
      submit: "Send RSVP",
      sending: "Sending…",
    },
    maxGuests: 6,
    errors: {
      name: "Please tell us your name.",
      attending: "Please let us know if you can come.",
      send: "Sorry, that did not send. Please try again.",
    },
    done: {
      yes: { title: "Thank you", text: "We are so happy you will be joining us. We cannot wait to celebrate with you." },
      no: { title: "Thank you for letting us know", text: "You will be missed. We will be thinking of you on the day." },
    },
  },

  // ---- Panel 5: dress code and a note -------------------------------------
  dressCode: {
    title: "Dress Code",
    style: "Semi Formal",
    caption: "We would love to see you in these colours",
    colors: [
      { name: "Forest", hex: "#2f3b33" },
      { name: "Sand", hex: "#b9a283" },
      { name: "Ivory", hex: "#eee6d6" },
    ],
  },

  note: {
    title: "A Note From Us",
    text:
      "Your presence means the world to us. No gifts are necessary, but your prayers, blessings and well wishes are the greatest gift we could ever ask for.",
  },

  // ---- Panel 6: contact and socials (PLACEHOLDER numbers) -------------------
  contact: {
    title: "Contact",
    intro: "For any enquiries, please reach out to:",
    people: [
      { role: "Bride's Family", phone: "+65 9123 4567", name: "(Puan Aisyah)" },
      { role: "Groom's Family", phone: "+65 8765 4321", name: "(Encik Rahman)" },
    ],
    follow: {
      title: "Follow our journey",
      text: "Share your photos with us",
      // Leave a link empty and that icon is shown but not clickable.
      instagram: "",
      facebook: "",
      tiktok: "",
    },
  },

  // ---- Floral artwork ----------------------------------------------------
  // The four corners of the floral frame, set behind the type on every sheet.
  // They are cut from your artwork by tools/make_florals.py. Leave a path empty
  // to leave that corner bare.
  florals: {
    topLeft: "assets/florals/top-left.webp",
    topRight: "assets/florals/top-right.webp",
    bottomLeft: "assets/florals/bottom-left.webp",
    bottomRight: "assets/florals/bottom-right.webp",
  },

  // ---- Music -----------------------------------------------------------------
  music: {
    // Point this at an mp3/ogg to enable the toggle in the corner.
    src: "assets/audio/wedding-theme.mp3",
    title: "Our Song",
  },
};

// Expose to the rest of the app.
window.WEDDING = WEDDING;
