"""The emerald backdrop the ruby envelope rests on (seeded; run again to regenerate).

    python3 tools/make_emerald_backdrop.py

Writes two images to assets/images/:
  emerald-felt.webp  a seamless 512px tile of deep emerald felt (a soft, fine nap)
  leaf-shadows.webp  soft shadows of leaves on a branch, black on transparent, laid
                     over a corner of the backdrop (CSS sets two of them, top-right
                     and, turned round, bottom-left), as in the design
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "images")

# ---- felt -------------------------------------------------------------------------
N = 512
fx = np.fft.fftfreq(N)[:, None]; fy = np.fft.fftfreq(N)[None, :]
K = np.sqrt(fx ** 2 + fy ** 2)
def band(lo, hi, seed):
    r = np.random.default_rng(seed)
    spec = np.fft.fft2(r.standard_normal((N, N)))
    k0 = 1.0 / math.sqrt(lo * hi); w = math.log(hi / lo) / 2.2
    g = np.exp(-0.5 * (np.log(np.maximum(K, 1e-9) / k0) / w) ** 2); g[0, 0] = 0
    n = np.real(np.fft.ifft2(spec * g)); return n / n.std()
lum = 1 + 0.018 * band(60, 260, 1) + 0.030 * band(6, 20, 2) + 0.055 * band(1.6, 4, 3)
base = np.array([5, 47, 28], dtype=np.float32)
rgb = np.clip(lum[..., None] * base[None, None, :], 0, 255)
Image.fromarray((rgb + 0.5).astype(np.uint8), "RGB").save(os.path.join(OUT, "emerald-felt.webp"), "WEBP", quality=86, method=6)

# ---- leaf shadows -------------------------------------------------------------------
S = 1100
rng = np.random.default_rng(12)
img = Image.new("L", (S, S), 0)
d = ImageDraw.Draw(img)

def leaf(cx, cy, length, width, ang, shade):
    """A pointed leaf: two arcs meeting at tip and base, as a polygon."""
    pts = []
    for side in (1, -1):
        for i in range(0, 41):
            t = i / 40
            x = t * length
            y = side * width * math.sin(math.pi * t) ** 0.85 * (1 - 0.25 * t)
            pts.append((x, y))
        pts.reverse() if side == 1 else None
    ca, sa = math.cos(ang), math.sin(ang)
    d.polygon([(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in pts], fill=shade)

def branch(x, y, ang, length, leaves, size):
    pts = [(x, y)]
    for i in range(int(length / 12)):
        ang += rng.normal(0, 0.04)
        x += math.cos(ang) * 12; y += math.sin(ang) * 12
        pts.append((x, y))
    d.line(pts, fill=150, width=6)
    for k in range(leaves):
        i = int((k + 0.6) / leaves * (len(pts) - 1))
        px, py = pts[i]
        side = 1 if k % 2 else -1
        la = ang + side * rng.uniform(0.55, 0.95)
        L = size * rng.uniform(0.75, 1.15)
        leaf(px, py, L, L * rng.uniform(0.2, 0.28), la, int(rng.uniform(170, 230)))

# a few branches reaching in from the top-right corner
branch(1120, 60, math.radians(160), 760, 9, 175)
branch(1100, 300, math.radians(196), 560, 7, 150)
branch(900, -40, math.radians(118), 520, 6, 140)
branch(1150, 520, math.radians(210), 380, 4, 130)

shadow = img.filter(ImageFilter.GaussianBlur(7)).filter(ImageFilter.GaussianBlur(5))
# fade out toward the inner (bottom-left) side of the image so its edge never shows
Y, X = np.mgrid[0:S, 0:S]
fade = np.clip(1.35 - np.hypot(S - X, Y) / (S * 0.95), 0, 1)
a = (np.asarray(shadow, dtype=np.float32) / 255.0) * fade * 0.55
rgba = np.zeros((S, S, 4), np.uint8); rgba[..., 0:3] = (0, 12, 6); rgba[..., 3] = (a * 255).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "leaf-shadows.webp"), "WEBP", quality=80, method=6)
for n in ("emerald-felt.webp", "leaf-shadows.webp"):
    print(n, os.path.getsize(os.path.join(OUT, n)), "bytes")
