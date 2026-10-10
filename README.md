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
  rsvp.js                The RSVP form: what shows when, checking it, sending it
  booth.js               The photo booth: camera, filters, frames, stickers, download
  wall.js                The guest wall: the cards, posting the booth photo, hearts
  envelope.js            The opening-sequence state machine + GSAP timeline
  scroll-reveals.js      Entrance animations for the sheets
  audio.js               Optional background-music toggle
  main.js                Keeps ScrollTrigger's measurements honest
  vendor/                GSAP, ScrollTrigger and CustomEase, vendored (see note below)
assets/
  images/                Background photograph, cotton-paper and wax-seal images, card paper
  florals/               The four floral corners used on every sheet
  wall/                  Sample photos for the guest wall's preview (removed once it is connected)
  audio/                 Put an mp3/ogg here and point js/config.js at it
```

## The seven sheets

1. **The invitation** — arched gold frame, the names, the date, the venue. Set in
   `em` from one size that follows the screen's width *and* height, so on a phone the
   whole sheet fits one screen (down to 320 × 568) and is centred on taller ones.
2. **The Big Day** — the itinerary, with a line that draws itself stop by stop.
3. **Location** — map, an "Open in Google Maps" button, and how to get there.
4. **RSVP** — a short form: name, coming or not, number of guests, dietary needs,
   and a note. (See "The RSVP form" below.)
5. **Dress code** — the colour swatches, and a note from you.
6. **Contact** — two family contacts and your social links.
7. **Guest Wall** — guests take a photo in the photo booth, leave a wish, and see everyone's.
   (See "The photo booth" and "The guest wall" below.)

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

**RSVP.** Every word on the form, the most guests one reply can name, and the
thank-you messages are under `rsvp` in `config.js`.

**Social links.** Fill in `contact.follow.instagram` / `facebook` / `tiktok`.
Any left empty is shown but not clickable.

To add music: place an mp3 in `assets/audio/` and set `music.src` in
`config.js`. The toggle button in the top-right corner appears automatically
once a track is configured; it never autoplays (browsers block that, and it
would undercut the quiet tone of the piece).

To change the map: `venue.mapEmbedUrl` accepts either a key-free
`https://maps.google.com/maps?q=<address>&output=embed` URL (default) or a
full "Share → Embed a map" URL copied from Google Maps for more control.

### The RSVP form

Name, coming or not (two large choices), then — only for guests who are coming —
the number of guests and any dietary needs, and finally an optional note. It
checks the name and the choice, shows what is missing next to the field, and then
swaps itself for a thank-you whose wording depends on the answer. Fields are 16px
or more so iPhones do not zoom in on them, the choices and the guest counter are
thumb-sized, and it works from the keyboard alone. A hidden field catches
form-filling bots.

**Sending is not connected yet.** `send()` at the bottom of `js/rsvp.js` is the
one place that talks to the outside: for now it only logs what would be sent
(`{ name, attending, guests, dietary, message }`) to the browser console. The
Tally form connects there.

### The photo booth

**Open the photo booth** (on the guest wall) opens a full-screen booth:

1. **Shoot** — live camera with a 3-second countdown, as a single **Photo** or a
   **Strip** of four. Guests without camera permission can choose a photo
   instead (and, on phones, use their camera app).
2. **Edit** — seven filters, nine frames (None, Polaroid, Gold, Floral, Film, Forest, Blush,
   Sparkle, Arch), emoji
   stickers (drag to move, pinch to resize and turn), a caption, and Flip.
3. **Keep it** — **Download** saves a full-size JPEG (on iPhone it opens the share
   sheet, where "Save Image" puts it in Photos), and/or **Post to the wall**.

Everything is made on the guest's own phone, with no upload until they tap Post.
Words, counts and the sticker set are in `booth` in `js/config.js`; the filters
are in `FILTERS` at the top of `js/booth.js`. To add a frame: a row in `FR`, its
name in `booth.frames` (`js/config.js`), and a branch in `drawFrame()`. Camera access needs HTTPS (Netlify
has it) and cannot be tested on a plain `http://` address except localhost.

### The guest wall

Open to anyone with the link: no approval step, no code. After the booth, a guest
adds a name and an optional wish (140 characters) and posts. Their card goes to
the top of the wall straight away; guests can tap a heart on any card. Posted
pictures are shrunk on the guest's own phone first (a photo is a 900px square, a
strip is kept whole). Everything a guest types is put on the page as plain text,
never as HTML.

**Not connected yet.** Until a backend is set in `wall.backend` (`js/config.js`),
the wall shows six made-up sample posts (`wall.samples`, photos in
`assets/wall/`) and anything added lasts only until the page is reloaded.
`createStore()` in `js/wall.js` is the one place that changes when it is
connected: `list()`, `add()` and `heart()`. Remove the samples at the same time.

### The florals

All six sheets carry the floral frame you supplied: its four corners sit behind
the type, and the sheets are tinted to the artwork's own cream so the clusters
melt into them. The four corner images are in `assets/florals/` and are cut
from your artwork by `tools/make_florals.py`:

```bash
python3 tools/make_florals.py path/to/floral-frame.png   # needs numpy + Pillow
```

Each corner is cropped to the same width, so one scale fits all, and feathered
on its inner edge so it dissolves rather than ending on a line. To change or
drop a corner, edit `florals` in `js/config.js` (an empty path leaves that corner
bare). The sheets keep clear room at top and bottom so the type never sits on the
roses; if you change the artwork's size, adjust `.sheet__floral { width }` and
the sheet padding in `css/sections.css` together.

## The opening sequence — design notes

### Built in layers, not from a photo

The envelope follows the three-panel reference (closed → opening → revealed),
but it is not a picture: a flat image can't open on a real hinge. Every part
is its own HTML/CSS layer, so each can move on its own with genuine 3D
transforms:

1. **Background** — your photograph, `assets/images/wedding-background.webp`
   (853 × 1844), used as it is: nothing is drawn over it. On a phone it fills
   the screen; on wider screens two more crops of the same photograph, one
   from its top and one from its bottom, keep the flowers framing both corners.
   To change it, replace that file (a tall portrait works best, with the
   centre kept clear for the envelope).
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
8. **Light and shadow** — the cotton texture, the flap's shadow on the mouth of
   the envelope, and the card's shadow, which grows as the card lifts toward
   you. (The sunlight and leaf shadows are in the background photograph.)

The ribbon and gold dishes in the reference photograph are props and are not
recreated.

### The paper

The envelope is meant to read as luxury cotton stationery, not a flat colour.
`assets/images/cotton-paper.webp` is one seamless 768px tile: warm ivory, a soft
cloud of variation, felted grain, short curly fibres, a few flecks, all lit from
the top-left. Each piece of the envelope (back, flap outside, flap inside,
pocket sides, bottom flap, lining) lays it as its own background at its own
offset, so the texture belongs to the paper and turns and foreshortens with it
through the whole 3D opening. Matte throughout; nothing is glossy.

On top of the texture: edge faces that give the sheet its thickness (bright on
the sides that face the light, shaded on the others), a soft key light across the
flap and pocket, a contact and an ambient shadow under the flap's edges, and a
shadow thrown by the raised bottom flap onto the side flaps behind it. The card
keeps its own smoother stock (`paper.svg`).

To adjust or regenerate the tile, `tools/make_cotton.py` is a short seeded Python script
(numpy + Pillow); its amplitudes (grain, fibres, warmth) are the first few lines
of the "layers" section.

### The three states

- **Closed** — the envelope rests on the wall, drifting very slightly; with a
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
