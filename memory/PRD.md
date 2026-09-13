# Luxe Vows — Cinematic Digital Wedding Invitation

## Problem Statement
Premium, cinematic digital wedding invitation recreating a luxury physical invitation
(warm ivory/champagne, gold accents, paper texture, envelope + wax seal, delicate florals).
Reference video provided (Canva "Save the Date"). CRITICAL constraint: the invitation card
must NEVER tilt/rotate/skew — it stays perfectly front-facing; the 3D feeling comes ONLY
from translate3d parallax between independent layers (straight camera).

## User Choices (2026-06)
- Placeholder content: couple "Aarav & Isha" (editable in `src/data/wedding.js`)
- Stock gallery photos (Unsplash)
- RSVP is form UI only (no backend persistence)
- Language: English

## Tech / Architecture
- Frontend: React 18 (CRA), custom CSS (no Tailwind), framer-motion + lucide-react installed.
- Backend: minimal FastAPI (`/api/health` only) to satisfy supervisor.
- Assets in `/app/frontend/public/assets` (generated + rembg-cutout PNGs: wax_seal, florals_sprig,
  foreground_florals, gold_divider; textures: bg_texture, paper_texture). CSS references textures
  via `--img-bg`/`--img-paper` vars defined in public/index.html (avoids CRA url() resolution).
- Parallax: `ParallaxScene` writes `--mx/--my` CSS vars (rAF + lerp, mouse/touch/device-tilt,
  reduced on mobile, disabled for prefers-reduced-motion). Layers use `translate3d()` only,
  per-layer depth via `--d`. Envelope built from CSS flap layers; only the top flap rotates.
- Opening state machine in `OpeningScene.jsx` (cumulative ph-ge-* classes): environment responds →
  seal reacts → flap opens → card emerges (translate only) → settle → handoff (fade) to main.

## Implemented (2026-06)
- STAGE 1 Opening scene: layered parallax (bg, vignette, distant, flowers-behind, envelope,
  card, wax seal, foreground florals, particles). Closed X-seam envelope, upright.
- STAGE 2 Parallax: pointer/touch/tilt, reduced on mobile, reduced-motion respected.
- STAGE 3 Envelope opening animation (flap rotateX, seal fade, card emerge) — card stays upright.
- STAGE 4 Main invitation sections: Hero, Details (ceremony+reception+venue), Countdown (live),
  Our Story timeline, Photo Gallery (masonry + lightbox), Schedule timeline, Location (Google
  Maps embed + directions), RSVP (form UI only + thank-you state), Closing.
- STAGE 5 Mobile-first verified at 375/390/414 — no horizontal overflow.
- STAGE 6 Polish: typography (Cormorant Garamond / Pinyon Script / Jost), gold ornaments,
  scroll reveals, soft shadows.
- Verified by testing agent: 100% frontend, transforms confirmed translate-only (no tilt).

## Backlog / Next
- P1: Working RSVP persistence (backend + admin view of responses).
- P2: Background music toggle; add-to-calendar (.ics) button; gift registry; multi-language.
- P2: Real couple photos + custom illustrated florals; richer particle petals.
