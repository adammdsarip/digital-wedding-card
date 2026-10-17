/**
 * ============================================================
 * WEDDING CONFIGURATION
 * ------------------------------------------------------------
 * Every piece of copy, date, link and colour that appears on the
 * invitation lives in this one file. Nothing is hard-coded in the
 * HTML — edit this object and the whole site updates.
 * ============================================================
 */

const WEDDING = {

  // ---- The couple -------------------------------------------------
  // Names appear in this order everywhere: envelope, card, invitation.
  partnerOne: "Isz",
  partnerTwo: "Khaty",

  // The word set between the two names ("and", or "&").
  connector: "and",

  // ---- The envelope -------------------------------------------------
  // The monogram and the wax seal are struck from the two initials above;
  // the card's date row is worked out from isoDate below.
  envelope: {
    eyebrow: ["A special invitation", "awaits"],
    hint: "Tap to open",
    revealHint: "Tap to view the invitation",
    card: {
      eyebrow: "Together with our families",
      // The family names shown just under the eyebrow. `names` can be one or several people.
      families: [
        { names: "Saadiah Binte Said", role: "Bride's Mother" },
        { names: "Saéyah Salleh & Siti Ischa Salleh", role: "Groom's Sisters" },
      ],
      connector: "&",
      invite: ["Invite you to celebrate", "our wedding"],
      place: "Singapore",
    },
  },

  // ---- The day -------------------------------------------------------
  // One date drives everything. The weekday, day number, month and year
  // are all worked out from it, so they can never disagree with each other.
  isoDate: "2026-12-12T19:30:00",
  timeText: "7.30 PM",
  // The venue's time zone (Singapore), so the countdown reaches zero at the same moment
  // wherever a guest opens the invitation.
  timezone: "+08:00",

  // ---- Panel 1: the invitation ------------------------------------------
  invitation: {
    eyebrow: ["Together", "with our families"],
    invite: "We cordially invite you to the wedding of",
    blessing: ["Two hearts • One journey", "In the name of love"],
    closing: ["We look forward to", "celebrating with you"],
  },

  // ---- Venue --------------------------------------------------------------
  venue: {
    name: "De Hall",
    address: ["3 Irving Road, #02-10", "Singapore 369522"],
    // The map shown on the page. A key-free embed: change the q= search to your venue, or paste
    // the src="..." from Google Maps "Share > Embed a map". Empty = no map is shown.
    mapEmbedUrl:
      "https://maps.google.com/maps?q=De+Hall,+3+Irving+Road,+Singapore+369522&z=16&ie=UTF8&iwloc=&output=embed",
    // What the "Open in Google Maps" button opens (the venue's own share link)
    mapLinkUrl: "https://maps.app.goo.gl/4kyRC5K9K3MYWo3K9?g_st=awb",
    mapButton: "Open in Google Maps",
  },

  // ---- Panel 2: the itinerary -------------------------------------------------
  // icon: mosque | cutlery | hanger | rings | cake | camera | toast | music
  // `detail` is the optional second line; leave it "" for none.
  itinerary: {
    eyebrow: "The",
    title: "Big Day",
    subtitle: "Itinerary",
    items: [
      { time: "6.30 PM", title: "Solemnization", detail: "Family only", icon: "mosque" },
      { time: "7.30 PM", title: "Buffet Opens", detail: "", icon: "cutlery" },
      { time: "8.00 PM", title: "Change to 2nd Bridalwear", detail: "Bride & Groom", icon: "hanger" },
      { time: "9.00 PM", title: "March In", detail: "Bride & Groom", icon: "rings" },
      { time: "9.15 PM", title: "Cake Cutting", detail: "", icon: "cake" },
      { time: "9.30 PM", title: "Photo Taking & Mingle", detail: "", icon: "camera" },
      { time: "10.00 PM", title: "End of Wedding Celebration", detail: "", icon: "toast" },
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
        { icon: "train", label: "By MRT", detail: ["Tai Seng MRT", "(3 mins walk)"] },
        { icon: "bus", label: "By Bus", detail: ["Multiple bus", "services nearby"] },
      ],
    },
  },

  // ---- Panel 4: RSVP ---------------------------------------------------------
  // The reply form is a Tally form (replies go to your Tally dashboard). `tally` is its
  // embed address, `openLink` the same form as a normal page for anyone the embed does not
  // load for (some in-app browsers).
  rsvp: {
    eyebrow: "Kindly",
    title: "RSVP",
    deadline: "By 1 December 2026",
    intro: "Please let us know if you can join us.",
    tally: "https://tally.so/embed/ZjMNvy?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1",
    openLink: "https://tally.so/r/ZjMNvy",
    fallbackText: "Form not showing? Open it here",
  },

  // ---- Panel 5: the countdown and a note --------------------------------
  // Counts down to isoDate (in the venue's time zone) above.
  countdown: {
    eyebrow: "Counting down",
    title: "To Our Big Day",
    labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
    caption: "until we celebrate together",
    today: "Today is the day",
    after: "Thank you for celebrating with us",
  },

  note: {
    title: "A Note From Us",
    text:
      "Your presence means the world to us. No gifts are necessary, but your prayers, blessings and well wishes are the greatest gift we could ever ask for.",
  },

  // ---- Panel 6: contact and the doa -----------------------------------------
  // Each person gets a "Call" button. `name` can be one line or several.
  contact: {
    title: "Contact",
    intro: "For any enquiries, please reach out to:",
    callLabel: "Call",
    people: [
      { role: "Bride", phone: "+65 9653 5655", name: ["Yanni", "(Bride's Sister)"] },
      { role: "Groom", phone: "+65 9183 8076", name: ["Siti Ischa", "(Groom's Sister)"] },
    ],
    // The prayer shown under the contacts (the well-known doa for a newly married couple).
    // Replace the three lines with your own doa; leave one empty to leave it out.
    doa: {
      title: "Doa",
      intro: "A prayer for the bride and groom",
      arabic: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
      transliteration: "Bārakallāhu laka wa bāraka ʿalaika wa jamaʿa bainakumā fī khair.",
      meaning: "May Allah bless you, shower His blessings upon you, and unite you both in goodness.",
    },
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
