"""Cuts the four corner clusters out of the supplied floral artwork, ready to sit in
the corners of the invitation sheets.

Usage:  python3 tools/make_florals.py path/to/floral-frame.png

Each corner is cropped to the same width (so one scale fits them all), and its
inner edge is feathered with an elliptical fade centred on the corner itself, so
the cluster dissolves into the sheet rather than ending on a line. The artwork's
own cream is kept: the sheets are tinted to match it (see --sheet-* in
css/sections.css), which keeps the white florets crisp against the page.
Needs numpy and Pillow.
"""
import sys, os
import numpy as np
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "floral-frame.png"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "florals")
WIDTH = 560                      # output width in px; displayed at roughly 40-50% of a phone-width sheet

im = Image.open(SRC).convert("RGB")
W, H = im.size                    # 1536 x 1024 for the supplied artwork
CW = 700                          # source crop width, shared by every corner
crops = {                         # name: (x0, y0, x1, y1, corner)  -- corner = which corner the fade is centred on
    "top-left":     (0,        0,        CW,     500,      "tl"),
    "top-right":    (W - CW,   0,        W,      500,      "tr"),
    "bottom-left":  (0,        H - 600,  CW,     H,        "bl"),
    "bottom-right": (W - CW,   H - 600,  W,      H,        "br"),
}

def smootherstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * t * (t * (t * 6 - 15) + 10)

for name, (x0, y0, x1, y1, corner) in crops.items():
    c = im.crop((x0, y0, x1, y1))
    w, h = c.size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = xx if corner in ("tl", "bl") else (w - 1 - xx)       # distance from the corner this cluster grows from
    dy = yy if corner in ("tl", "tr") else (h - 1 - yy)
    d = np.sqrt((dx / w) ** 2 + (dy / h) ** 2)
    alpha = 1.0 - smootherstep(0.80, 1.0, d)
    rgba = np.dstack([np.asarray(c, dtype=np.uint8), (alpha * 255 + 0.5).astype(np.uint8)])
    out = Image.fromarray(rgba, "RGBA").resize((WIDTH, round(h * WIDTH / w)), Image.LANCZOS)
    path = os.path.join(OUT, f"{name}.webp")
    out.save(path, "WEBP", quality=84, alpha_quality=85, method=6)
    print(f"{name}.webp  {out.size}  {os.path.getsize(path) // 1024} KB")
