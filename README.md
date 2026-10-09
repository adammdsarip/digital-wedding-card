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
  render.js              Fills the page from config.js; draws the QR code
  envelope.js            The opening-sequence state machine + GSAP timeline
  scroll-reveals.js      Entrance animations for the sheets
  audio.js               Optional background-music toggle
  main.js                Keeps ScrollTrigger's measurements honest
  vendor/                GSAP, ScrollTrigger and a QR generator, vendored (see note below)
assets/
  images/                Stone, paper and leaf-shadow textures (SVG)
  florals/               Drop floral artwork here (see "Adding the florals")
  audio/                 Put an mp3/ogg here and point js/config.js at it
```

## The six sheets

1. **The invitation** — arched gold frame, the names, the date, the venue.
2. **The Big Day** — the itinerary, with a line that draws itself stop by stop.
3. **Location** — map, an "Open in Google Maps" button, and how to get there.
4. **RSVP** — a QR code and a link, both generated from `rsvp.url`.
5. **Dress code** — the colour swatches, and a note from you.
6. **Contact** — two family contacts and your social links.

## Customising your own wedding

**Everything** — names, date, venue, schedule, RSVP link, contacts, dress code,
colours, music — lives in `js/config.js` as one plain object. Nothing else needs
to change for day-to-day edits; `render.js` fills the page from it on load.
Anything marked `PLACEHOLDER` in that file is sample content from the layout
design and should be replaced.

**The date drives everything.** Set `isoDate` once. The weekday, day number,
month and year on the invitation and on the envelope card are all worked out
from it, so they can never disagree (a hand-typed "Sunday 24 March" that is
really a Tuesday is the classic way an invitation goes wrong).

**Itinerary icons** are chosen per stop with `icon:` — `mosque`, `cutlery`,
`camera`, `toast` or `music`. Transport icons are `car`, `train` or `bus`.

**RSVP.** Change `rsvp.url` and both the QR code and the button follow it.

**Social links.** Fill in `contact.follow.instagram` / `facebook` / `tiktok`.
Any left empty is shown but not clickable.

To add music: place an mp3 in `assets/audio/` and set `music.src` in
`config.js`. The toggle button in the top-right corner appears automatically
once a track is configured; it never autoplays (browsers block that, and it
would undercut the quiet tone of the piece).

To change the map: `venue.mapEmbedUrl` accepts either a key-free
`https://maps.google.com/maps?q=<address>&output=embed` URL (default) or a
full "Share → Embed a map" URL copied from Google Maps for more control.

### Adding the florals

The sheets are designed to carry floral corners, but ship without them. When
you have the artwork, export it as **transparent PNGs** (about 1200px wide is
plenty for a phone), put them in `assets/florals/`, and set the paths:

```js
florals: {
  topLeft: "assets/florals/top-left.png",
  bottomRight: "assets/florals/bottom-right.png",
},
```

The same two images are placed on every sheet, behind the text. Leaving them
empty keeps a clean sheet.

## The opening sequence — design notes

### Built in layers, not from a photo

The envelope follows the three-panel reference (closed → opening → revealed),
but it is not a picture: a flat image can't open on a real hinge. Every part
is its own HTML/CSS layer, so each can move on its own with genuine 3D
transforms:

1. **Background** — warm stone (an SVG texture in `assets/images/stone.svg`),
   two soft bands of sun, and gypsophila drawn as SVG.
2. **Envelope back** and 3. **lining** — the taupe liner inside, inset from
   the paper's edges, darker toward the pocket.
4. **The card** — lives in a slot that clips only at the envelope's bottom
   edge, so it can rise freely above the envelope with its foot still tucked in.
5. **Front pocket** — two side flaps under a folded-up bottom flap.
6. **Flap** — rotates on `rotateX` about its top edge inside a `perspective`
   wrapper. At 90° (edge-on, so the swap can't be seen) it turns over to show
   its lined inside and drops behind the card.
7. **Wax seal** — your supplied seal photograph (`assets/images/wax-seal.webp`),
   set on the tip of the flap as a child of it, so it turns with the flap. It
   stands a few pixels off the paper with its own shadow on the flap, and
   darkens as it turns away from the light. To swap the seal, replace that
   file (transparent background; keep the 512 × 485 proportions, or adjust
   `.seal` in `css/envelope.css`).
8. **Light and shadow** — paper texture (`assets/images/paper.svg`), leaf
   shadows overhead, the flap's shadow on the mouth of the envelope, and the
   card's shadow, which grows as the card lifts toward you.

The ribbon and gold dishes in the reference photograph are props and are not
recreated.

### The three states

- **Closed** — the envelope rests on the stone, drifting very slightly; the
  leaf shadows move; with a mouse, it turns a few degrees under the pointer.
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
A tap during the opening speeds it up rather than being lost.

`prefers-reduced-motion` is respected: instead of the 3D choreography, the
scene dims and comes back with the envelope already open and the card out.

## Why GSAP is vendored rather than loaded from a CDN

`js/vendor/gsap.min.js`, `ScrollTrigger.min.js` and `CustomEase.min.js` are the real, unmodified
GSAP 3.12.5 distribution files (installed via `npm pack gsap`), and
`qrcode.js` is Kazuhiko Arase's MIT-licensed QR generator (`qrcode-generator`
2.0.4), all committed directly into the project. This avoids a runtime dependency on a third-party
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
