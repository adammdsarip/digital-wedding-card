# Isz & Khaty — Digital Wedding Invitation

A cinematic, editorial-stationery wedding invitation: a tap-to-open wax-seal
envelope sequence that dissolves into a vertically scrolling invitation site.
Pure HTML/CSS/JS, no build step, no framework — open `index.html` and it runs.

## Running it locally

Any static file server works, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly via `file://` also works, except the venue
map `<iframe>`, which most browsers block from `file://` for security.)

## Project structure

```
index.html              The opening sequence + the six sheets, and the icon sprite
css/
  variables.css          Design tokens — palette, type, motion, shadows
  base.css               Reset, lining figures, shared paper-grain texture
  envelope.css           The opening scene: envelope layers, seal, card
  sections.css           The six sheets
  responsive.css         Breakpoint overrides (the base is mobile-first, sized with clamp())
js/
  config.js              *** Single source of truth for all wedding content ***
  render.js              Fills the page from config.js
  rsvp.js                Loads the Tally RSVP form into its sheet
  envelope.js            The opening-sequence state machine + GSAP timeline
  scroll-reveals.js      Entrance animations for the sheets
  audio.js               Optional background-music toggle
  main.js                Keeps ScrollTrigger's measurements honest
  vendor/                GSAP, ScrollTrigger and CustomEase, vendored (see note below)
assets/
  images/                The envelope's ruby paper, seal, corner sprig and emerald backdrop; the card paper; the floral sheet frame
  audio/                 Put an mp3/ogg here and point js/config.js at it
```

## The six sheets

1. **The invitation** — arched gold frame, the names, the date, the venue. Set in
   `em` from one size that follows the screen's width *and* height, so on a phone the
   whole sheet fits one screen (down to 320 × 568) and is centred on taller ones.
2. **The Big Day** — the itinerary, with a line that draws itself stop by stop.
3. **Location** — map, an "Open in Google Maps" button, and how to get there.
4. **RSVP** — your Tally form, shown inside the sheet. (See "The RSVP form" below.)
5. **Countdown** — days, hours, minutes and seconds to the wedding, and a note from you.
6. **Contact** — two family contacts, each with a Call button, and a doa.

## The look: jewel-glam

Emerald green and ruby red, with gold foil, on a cream base. The colours are tokens in
`css/variables.css`, so changing one changes it everywhere:

- **Emerald** (`--color-emerald`): headings, the names, the venue, the main buttons, links.
- **Ruby** (`--color-ruby`): the small accents: section labels, the ampersand, the date number,
  itinerary times, the countdown numbers, the little ornaments.
- **Gold foil** (`--color-gold…`, and `--gold-foil` for the metallic sheen): the frame around each
  sheet, the rules and the icon rings.

The opening scene follows the same palette: a ruby envelope with gold foil edges and your gold I | K seal,
on an emerald backdrop (see "The opening sequence" below). Text colours are all at least 5:1
against the cream.

## Customising your own wedding

**Everything** — names, date, venue, schedule, RSVP link, contacts, doa,
colours, music — lives in `js/config.js` as one plain object. Nothing else needs
to change for day-to-day edits; `render.js` fills the page from it on load.
Anything marked `PLACEHOLDER` in that file is sample content from the layout
design and should be replaced.

**The date drives everything.** Set `isoDate` once (the countdown counts to it, in the venue's
time zone: `timezone`, Singapore by default). The weekday, day number,
month and year on the invitation and on the envelope card are all worked out
from it, so they can never disagree (a hand-typed "Sunday 24 March" that is
really a Tuesday is the classic way an invitation goes wrong).

**Itinerary icons** are chosen per stop with `icon:` — `mosque`, `cutlery`,
`camera`, `toast` or `music`. Transport icons are `car`, `train` or `bus`.

**RSVP.** The deadline, the line under it, and the Tally form's address are under `rsvp` in `config.js`.

**Contacts and the doa.** Each person under `contact.people` gets their number and a tap-to-call button. The prayer under them is `contact.doa` (Arabic, transliteration and meaning); replace it with your own.
Any left empty is shown but not clickable.

To add music: place an mp3 in `assets/audio/` and set `music.src` in
`config.js`. The toggle button in the top-right corner appears automatically
once a track is configured; it never autoplays (browsers block that, and it
would undercut the quiet tone of the piece).

To change the map: `venue.mapEmbedUrl` accepts either a key-free
`https://maps.google.com/maps?q=<address>&output=embed` URL (default) or a
full "Share → Embed a map" URL copied from Google Maps for more control.

### The RSVP form

The reply form is a **Tally** form, built and edited in Tally, and shown inside the RSVP
sheet. Replies appear in your Tally dashboard (turn on email notifications there for a
message with each reply, or export them to a spreadsheet). This site stores nothing.

- `rsvp.tally` in `js/config.js` is the form's embed address (`https://tally.so/embed/<id>?…`).
  `rsvp.openLink` is the same form as a normal page, offered under the form as
  "Form not showing? Open it here" for any browser that will not load the embed.
- The form is loaded when the sheet is near the screen, not before, so it stays out of the
  way of the opening sequence. If Tally's helper script cannot load, the form still opens,
  at a fixed height. Change the questions, thank-you message or colours in Tally, not here.
- To use a different form, replace those two addresses.

### The floral frame

Every sheet after the envelope uses the floral artwork you supplied as its background:
one image, `assets/images/sheet-frame.webp`, stretched over each sheet as a CSS
nine-slice `border-image` (the four flower corners keep their shape; the plain edges
between them stretch). The artwork's cream is made transparent so it blends into the
sheet colour (`#f4e7d7`). Rebuild it from a new image with:

```bash
python3 tools/make_sheet_frame.py path/to/floral-frame.png   # needs numpy + Pillow
```

The type colours follow the jewel theme (emerald titles, ruby kickers and numbers,
gold rules). The sheets keep clear room at the top, sides and bottom so the text never
sits on the roses; if you swap the artwork, adjust the `border-image-slice`/`-width`
numbers and the sheet padding in `css/sections.css` together.

## The opening sequence — design notes

### Built in layers, not from a photo

The envelope follows the three-panel reference (closed → opening → revealed),
but it is not a picture: a flat image can't open on a real hinge. Every part
is its own HTML/CSS layer, so each can move on its own with genuine 3D
transforms:

1. **Background** — your photograph, `assets/images/emerald-background.webp`
   (852 × 1846): emerald felt with red blooms and gypsophila in two corners and
   leaf shadows, used as it is. On a phone it fills the screen; on wider screens two
   more crops of the same photograph, one from its top and one from its bottom, keep
   the flowers framing both corners. To change it, replace that file (a tall
   portrait works best, with the centre kept clear for the envelope).
2. **Envelope back** and 3. **lining** — the back carries a gold foil rim; the
   lining inside is a deeper ruby, darker toward the pocket.
4. **The card** — your supplied card artwork (`assets/images/invitation-card.webp`,
   1024 × 1536), in a slot that clips at the envelope's bottom edge, so it can rise
   freely above the envelope with its foot still tucked in. Its lettering (the
   families, the names, "Sat 12 Dec 2026") is part of the picture, so **when a detail
   changes, replace that image**; the screen-reader description of the card is still
   built from `config.js`. The card box is 0.8 × 1.2 of the envelope's width: the
   artwork's 2:3 shape, with the height the animation is built around.
5. **Front pocket** — two side flaps under a folded-up bottom flap, all edged in
   gold foil (the X of gold lines on the closed envelope).
6. **Flap** — rotates on `rotateX` about its top edge inside a `perspective`
   wrapper, with a gold foil band along its edges and a gold sprig in each upper
   corner (`sprig.webp`). At 90° (edge-on, so the swap can't be seen) it turns
   over to show its lined inside and drops behind the card.
7. **Wax seal** — your supplied gold seal with the I | K monogram
   (`assets/images/wax-seal-monogram.webp`, 512 × 496, transparent background), set
   on the tip of the flap as a child of it, so it turns with the flap. It stands a few
   pixels off the paper with its own shadow, and darkens as it turns away from the
   light. To swap the seal, replace that file (keep its proportions, or adjust `.seal`
   and `--seal` in `css/envelope.css`).
8. **Light and shadow** — the paper texture, the flap's shadow on the mouth of the
   envelope, and the card's shadow, which grows as the card lifts toward you.

The corner sprig is cut out of the design image
(`assets/images/ruby-envelope-reference.jpg`) by `tools/cut_jewel_assets.py`, which
lifts it by colour (gold and ruby against the crimson paper).

### The paper

`assets/images/ruby-paper.webp` is one seamless 768px tile matched to the design: deep
crimson, crinkled, with fine bright curly fibres, lit from the top-left. Each piece
of the envelope (back, flap outside, flap inside, pocket sides, bottom flap,
lining) lays it as its own background at its own offset, so the texture belongs
to the paper and turns and foreshortens with it through the whole 3D opening.
Over it: a soft key light, the gold foil edges, contact shadows under the flap,
and a shadow thrown by the raised bottom flap. Regenerate or adjust the tile with
`tools/make_ruby_paper.py` (numpy + Pillow; the amplitudes are in its "layers"
section).

The earlier ivory look's files (`cotton-paper.webp`, `wax-seal.webp`,
`wedding-background.webp`, and `tools/make_cotton.py`) are still in the project,
unused, if you want to switch back.

### The three states

- **Closed** — the envelope rests on the green, drifting very slightly; with a
  mouse, it turns a few degrees under the pointer.
- **Opening** (one tap) — the seal is pressed and lets go, the flap gathers
  pace up to vertical carrying the seal with it, and eases down past it, the view drifts down, and the
  card slides up out of the pocket, straightening and coming toward you, then
  settles.
- **Revealed** — the card rests above the envelope. One more tap fades into
  the invitation site.

Each state is a function in `js/envelope.js` (`toClosed`, `toOpening`,
`toRevealed`, then `toSite`), and every duration, curve and distance is in
the `MOTION` object at the top of that file. The curves are custom
cubic-béziers (via GSAP's CustomEase); nothing bounces and nothing is linear.
A tap during the opening (after its first 0.9s) speeds it up rather than being
lost; earlier taps, key auto-repeat, and a tap in the first 0.7s of the reveal
are ignored, so a nervous double-tap or a held key can't skip the sequence.
If the screen is rotated mid-opening, it lands on the pose framed for the new
size. When it hands over, keyboard focus moves to the invitation.

`prefers-reduced-motion` is respected: instead of the 3D choreography, the
scene dims and comes back with the envelope already open and the card out.

## Why GSAP is vendored rather than loaded from a CDN

`js/vendor/gsap.min.js`, `ScrollTrigger.min.js` and `CustomEase.min.js` are the real, unmodified
GSAP 3.12.5 distribution files (installed via `npm pack gsap`), committed
directly into the project. This avoids a runtime dependency on a third-party
CDN being reachable — relevant for guests opening the invitation over
patchy venue wifi — and pins the exact version the animations were tuned
against. If you'd rather load from a CDN, swap the three GSAP `<script>` tags near
the bottom of `index.html`.

## Browser support / performance notes

- Animations use `transform`/`opacity` almost exclusively (GPU-friendly);
  the only layout-affecting property touched is the flap's `rotateX` inside
  a `perspective` context, which is standard and well-supported.
- Every scroll reveal uses `once: true` — nothing re-animates on re-scroll,
  keeping scroll performance smooth on lower-end phones.
- `prefers-reduced-motion: reduce` short-circuits both the opening sequence
  and the scroll reveals into simple, instant/opacity-based equivalents.
