"""Turn the supplied floral frame artwork into the frame every sheet wears.

    python3 tools/make_sheet_frame.py path/to/floral-frame.png

The artwork is a cream page with four flower clusters and a double gold frame line.
The sheets show it as a CSS 9-slice (border-image), so the four corners keep their
shape on a sheet of any height and the frame lines stretch between them. For that to
look seamless the artwork's own cream is made transparent, so what is drawn over the
sheet is only the flowers, the leaves, the gold lines and the faint ribbons, never a
rectangle of slightly different cream. The sheets are painted the artwork's cream
(PAPER below; css/sections.css uses the same value) so the faint parts keep their colour.

Writes assets/images/sheet-frame.webp. Needs numpy and Pillow.
"""
import sys, os
import numpy as np
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "floral-frame.png"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "images", "sheet-frame.webp")

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
H, W, _ = a.shape
PAPER = np.median(a[int(H * 0.36):int(H * 0.60), int(W * 0.16):int(W * 0.85)].reshape(-1, 3), axis=0)
print("paper cream (use this for the sheet colour):", "#%02x%02x%02x" % tuple(int(round(v)) for v in PAPER))

def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)

dist = np.abs(a - PAPER).max(axis=2)           # how far each pixel is from the plain cream
alpha = smooth(dist, 4.0, 20.0)                # plain cream goes, everything with substance stays
rgba = np.dstack([a, alpha * 255]).clip(0, 255).astype(np.uint8)
out = Image.fromarray(rgba, "RGBA")
out.save(OUT, "WEBP", quality=88, alpha_quality=90, method=6)
print("sheet-frame.webp", out.size, os.path.getsize(OUT) // 1024, "KB; transparent share", round(float((alpha < 0.02).mean()), 3))
