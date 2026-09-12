# Adam & Nurin — Digital Wedding Invitation

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
index.html              Markup for the opening sequence + all 13 site sections
css/
  variables.css          Design tokens — colour palette, type, motion, shadows
  base.css               Reset + shared paper-grain texture utility
  envelope.css           Scenes 1–6: the envelope, seal, flap, card, title reveal
  sections.css           The scrollable invitation's sections
  responsive.css          Breakpoint overrides (mobile-first base lives in the files above)
js/
  config.js              *** Single source of truth for all wedding content ***
  render.js               Populates the DOM from config.js — no copy is hard-coded in HTML
  envelope.js             The opening-sequence state machine + GSAP timeline
  scroll-reveals.js       ScrollTrigger-driven entrance animations for the site
  audio.js                Optional background-music toggle
  main.js                 RSVP form handling, scroll-cue, small glue
  vendor/                 GSAP + ScrollTrigger, vendored (see note below)
assets/
  images/                 Photos (placeholders are generated gradients — swap them)
  audio/                  Put an mp3/ogg here and point js/config.js at it
```

## Customising your own wedding

**Everything** — names, date, venue, schedule, RSVP details, colours, photo
paths, music — lives in `js/config.js` as one plain object. Nothing else in
the codebase needs to change for day-to-day edits. Open it and edit the
`WEDDING` object; the site re-renders those values on load via `render.js`.

To swap photos: drop your files into `assets/images/` and update the
corresponding `src` paths in `config.js` (`heroPhoto`, `gallery.photos`).
The placeholder images were generated purely so the layout never shows
broken-image icons before you add real photos — replace them freely.

To add music: place an mp3 in `assets/audio/` and set `music.src` in
`config.js`. The toggle button in the top-right corner appears automatically
once a track is configured; it never autoplays (browsers block that, and it
would undercut the quiet tone of the piece).

To change the map: `venue.mapEmbedUrl` accepts either a key-free
`https://maps.google.com/maps?q=<address>&output=embed` URL (default) or a
full "Share → Embed a map" URL copied from Google Maps for more control.

## The opening sequence — design notes

### Why the envelope is built from CSS/SVG, not a photo crop

The original art-direction photo is kept at `assets/images/envelope-reference.jpg`
for context; it isn't loaded by the site itself. The supplied envelope
photograph is beautiful as **art direction reference** — it set the palette
(ivory paper, gold foil, gold sealing wax, blush silk), the proportions, the
flap geometry, and the overall stationery-photography mood — but a flat photo
can't be convincingly cracked open, folded back, or lifted with real
perspective; masking and animating pieces cut from a single raster image
always reads as "a photo with things fading in and out," which the brief
explicitly asked to avoid.

So the envelope, its flap, its pocket, and the wax seal are all real layered
DOM elements styled to match the reference photo's materiality (paper-grain
noise filter, layered soft shadows, gold-line accents, an embossed wax
gradient), which means every one of them can be independently animated with
genuine 3D transforms:

- **`.envelope__flap`** is a clipped triangle that rotates on `rotateX` around
  its top edge inside a perspective wrapper, with a separate, pre-rotated
  "inner face" (a standard flip-card technique) so the underside is a
  believable warm interior tone once it swings past 90°, not a mirrored front.
  Its printed copy — eyebrow, both names, the script connector between two
  rules, the sprig — is live text, so it re-renders for any couple, and the
  gold hairline along the folded edges is an SVG path with
  `vector-effect: non-scaling-stroke` so it stays a crisp foil line at every
  envelope size instead of anti-aliasing to grey.
- **`.wax-seal`** is a gold gradient with a deliberately irregular
  `border-radius` (poured wax never sets to a perfect circle) and a recessed
  inner face holding the monogram — two initials taken straight from
  `config.js`, split by a struck rule. On tap it presses, jitters, then
  reveals two clipped half-copies of itself that rotate apart and fall while
  wax fragments scatter — no sprite sheet or video required.
- **`.invitation-card`** (the invitation itself) deliberately lives outside
  the small envelope footprint, centred on the viewport from the start, so
  it can grow from "tucked inside the envelope" to "full readable card" as
  one continuous GSAP tween without ever needing to clip real typography to
  a business-card-sized box.

If you want to art-direct your own envelope photo into this system later,
the pieces you'd need as separate assets are: a flat back panel, a flap
(front + a plausible "inner" tone), a pocket-front shape, and the wax seal —
i.e. exactly the layers already modelled in `envelope.css`.

### The sequence

0. **Load** — the envelope settles onto the table rather than appearing.
1. **Idle** — ambient light drift, breathing floor shadow, a shimmer
   travelling through the gold foil every few seconds, and (with a mouse) a
   few degrees of parallax turn driven by `gsap.quickTo`.
2. **Tap** → envelope lifts slightly, a soft glow highlights the seal.
3. **Tap the seal** → press, crack, split, and scatter — one continuous
   GSAP timeline carries this straight into:
4. **The flap opens** on a real hinge (3D `rotateX`, not a fade).
5. **The invitation rises** out of the pocket, growing to full size.
6. **The title reveals** — names, connector, rule line, date — staggered.
7. **A crossfade** hands off to the scrollable site, which opens on the
   same names/date treatment so the transition reads as continuous rather
   than "cinematic intro, then a different website."

`prefers-reduced-motion` is respected throughout: a much simpler
opacity/settle sequence replaces the 3D choreography, hitting the same
narrative beats without the spatial motion.

## Why GSAP is vendored rather than loaded from a CDN

`js/vendor/gsap.min.js` and `ScrollTrigger.min.js` are the real, unmodified
GSAP 3.12.5 distribution files (installed via `npm pack gsap`), committed
directly into the project. This avoids a runtime dependency on a third-party
CDN being reachable — relevant for guests opening the invitation over
patchy venue wifi — and pins the exact version the animations were tuned
against. If you'd rather load from a CDN, swap the two `<script>` tags near
the bottom of `index.html`.

## Browser support / performance notes

- Animations use `transform`/`opacity` almost exclusively (GPU-friendly);
  the only layout-affecting property touched is the flap's `rotateX` inside
  a `perspective` context, which is standard and well-supported.
- Every scroll reveal uses `once: true` — nothing re-animates on re-scroll,
  keeping scroll performance smooth on lower-end phones.
- `prefers-reduced-motion: reduce` short-circuits both the opening sequence
  and the scroll reveals into simple, instant/opacity-based equivalents.
