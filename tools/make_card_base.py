"""Make the card's blank base: the supplied card artwork with its small lettering removed.

    python3 tools/make_card_base.py [path/to/invitation-card-original.webp]

The card that slides out of the envelope is the supplied artwork, but its lettering is tiny at
the size the card is shown. This keeps everything of the artwork (frame, flowers, I|K monogram
and the big "ISZ & Khaty") and paints plain paper over the family names, the invitation line,
the date row and the place, which css/envelope.css then sets in real, larger type.

Paper is rebuilt from the cream either side of each blanked area plus the artwork's own fine
grain (taken from a clean strip), so no patch shows. Writes assets/images/invitation-card-blank.webp.
Needs numpy and Pillow.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "source", "invitation-card-original.webp")
OUT = os.path.join(HERE, "..", "assets", "images", "invitation-card-blank.webp")

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
H, W, _ = a.shape  # 1536 x 1024

# (x0, y0, x1, y1) of the areas to blank
AREAS = [
    (190, 305, 885, 552),    # "Together with our families", the two family lines
    (235, 1000, 800, 1268),  # invitation line, SAT | 12 | DEC 2026 row, SINGAPORE
]

# the artwork's grain, from a clean strip of paper between the family block and the names
strip = a[522:588, 200:830]
grain = strip - np.asarray(Image.fromarray(strip.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32)

out = a.copy()
for (x0, y0, x1, y1) in AREAS:
    h, w = y1 - y0, x1 - x0
    # paper colour: blend what lies just above and below, and just left and right
    top = a[y0 - 6:y0 - 2, x0:x1].mean(axis=0)            # w x 3
    bot = a[y1 + 2:y1 + 6, x0:x1].mean(axis=0)
    left = a[y0:y1, x0 - 6:x0 - 2].mean(axis=1)            # h x 3
    right = a[y0:y1, x1 + 2:x1 + 6].mean(axis=1)
    ty = np.linspace(0, 1, h)[:, None, None]
    tx = np.linspace(0, 1, w)[None, :, None]
    vert = top[None] * (1 - ty) + bot[None] * ty
    horz = left[:, None] * (1 - tx) + right[:, None] * tx
    base = (vert + horz) / 2
    # grain, tiled with mirroring so edges meet
    gh, gw, _ = grain.shape
    reps_y, reps_x = -(-h // gh) + 1, -(-w // gw) + 1
    row = np.concatenate([grain if i % 2 == 0 else grain[:, ::-1] for i in range(reps_x)], axis=1)
    tile = np.concatenate([row if i % 2 == 0 else row[::-1] for i in range(reps_y)], axis=0)[:h, :w]
    patch = base + tile
    # feathered edge so the patch melts into the surrounding artwork
    m = np.zeros((H, W), np.float32)
    m[y0:y1, x0:x1] = 1
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
    full = out.copy()
    full[y0:y1, x0:x1] = patch
    out = out * (1 - m[..., None]) + full * m[..., None]

res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
res.save(OUT, quality=90, method=6)
print(OUT, os.path.getsize(OUT) // 1024, "KB")
