"""Seamless ruby paper texture for the envelope (seeded; run again to regenerate).

    python3 tools/make_ruby_paper.py 768 assets/images/ruby-paper.webp

The same construction as make_cotton.py, tuned to the ruby envelope design: a deep
crimson stock with a crinkled, mottled surface, the fine raised veins of a pressed
paper catching the light, short fibres, and all of it lit from the top-left.
Every layer is periodic, so the tile repeats without a seam.
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

N = int(sys.argv[1]) if len(sys.argv) > 1 else 768
OUT = sys.argv[2] if len(sys.argv) > 2 else "ruby-paper.webp"
Q = int(sys.argv[3]) if len(sys.argv) > 3 else 82
rng = np.random.default_rng(2026)

fx = np.fft.fftfreq(N)[:, None]
fy = np.fft.fftfreq(N)[None, :]
K = np.sqrt(fx ** 2 + fy ** 2)

def band(lo, hi, seed):
    """Periodic noise with unit std, energy between wavelengths lo and hi (px)."""
    r = np.random.default_rng(seed)
    spec = np.fft.fft2(r.standard_normal((N, N)))
    k0 = 1.0 / math.sqrt(lo * hi)
    w = math.log(hi / lo) / 2.2
    g = np.exp(-0.5 * (np.log(np.maximum(K, 1e-9) / k0) / w) ** 2)
    g[0, 0] = 0
    n = np.real(np.fft.ifft2(spec * g))
    return n / n.std()

def fibres(count, seed, length=(9, 34), curl=0.42, width=2, alpha=(70, 200)):
    """Short wavy fibres, drawn 2x supersampled, wrapped around the tile edges."""
    r = np.random.default_rng(seed)
    S = 2
    img = Image.new("L", (N * S, N * S), 0)
    d = ImageDraw.Draw(img)
    for _ in range(count):
        x, y = r.uniform(0, N), r.uniform(0, N)
        th = r.uniform(0, math.tau)
        n = int(r.uniform(*length) / 1.6)
        bend = r.normal(0, curl * 0.5)
        pts = [(x, y)]
        for _ in range(n):
            th += bend + r.normal(0, curl)
            x += math.cos(th) * 1.6
            y += math.sin(th) * 1.6
            pts.append((x, y))
        a = int(r.uniform(*alpha))
        for ox in (-N, 0, N):
            for oy in (-N, 0, N):
                d.line([((px + ox) * S, (py + oy) * S) for px, py in pts], fill=a, width=width, joint="curve")
    img = img.filter(ImageFilter.GaussianBlur(0.6)).resize((N, N), Image.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255.0

def flecks(count, seed, radius=(0.9, 1.8)):
    r = np.random.default_rng(seed)
    S = 4
    img = Image.new("L", (N * S, N * S), 0)
    d = ImageDraw.Draw(img)
    for _ in range(count):
        x, y = r.uniform(0, N), r.uniform(0, N)
        rad = r.uniform(*radius) * S
        sx, sy = rad * r.uniform(0.7, 1.4), rad * r.uniform(0.7, 1.4)
        a = int(r.uniform(110, 230))
        for ox in (-N, 0, N):
            for oy in (-N, 0, N):
                cx, cy = (x + ox) * S, (y + oy) * S
                d.ellipse([cx - sx, cy - sy, cx + sx, cy + sy], fill=a)
    img = img.filter(ImageFilter.GaussianBlur(S * 0.45)).resize((N, N), Image.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255.0

def grad(h):
    """Periodic central differences."""
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
    return gx, gy

# ---- the layers ------------------------------------------------------------------
cloud = band(110, 420, 1)       # soft, organic variation across the sheet
cloud2 = band(70, 260, 2)
felt = band(12, 46, 3)          # the felted pulp
tooth = band(2.2, 6.0, 4)       # fine grain
vein = band(6, 26, 9)          # crinkle: the sheet's pressed veins sit where this crosses zero
vein2 = band(16, 60, 10)
ridges = np.exp(-(vein / 0.16) ** 2)
ridges2 = np.exp(-(vein2 / 0.14) ** 2)
fl = fibres(int(N * N / 300), 5, length=(18, 56), curl=0.36, alpha=(90, 230))   # the bright, curly fibres
fd = fibres(int(N * N / 640), 6, length=(7, 28), alpha=(60, 160))

# ---- height, lit from the top-left ------------------------------------------------
height = 0.55 * felt + 0.7 * tooth + 1.6 * ridges + 1.0 * ridges2 + 3.2 * fl - 1.0 * fd
gx, gy = grad(height)
shade = (gx + gy) / math.sqrt(2)

lum = (1.0
       + 0.028 * cloud
       + 0.030 * felt
       + 0.030 * tooth
       + 0.120 * ridges
       + 0.070 * ridges2
       + 0.260 * shade)

base = np.array([109, 4, 12], dtype=np.float32) / 255.0
rgb = lum[..., None] * base[None, None, :]
rgb[..., 2] *= 1 + 0.06 * cloud2                     # a little cooler here, a little warmer there
rgb += 0.200 * fl[..., None] * np.array([1.0, 0.07, 0.15])[None, None, :]
rgb *= 1 - fd[..., None] * np.array([0.16, 0.20, 0.20])[None, None, :]

rgb = np.clip(rgb, 0, 1)
out = Image.fromarray((rgb * 255 + 0.5).astype(np.uint8), "RGB")
out.save(OUT, "WEBP", quality=Q, method=6)
a = np.asarray(out, dtype=np.float32)
print(OUT, N, "size", os.path.getsize(OUT), "bytes; mean", a.mean(axis=(0, 1)).round(1), "std", a.std(axis=(0, 1)).round(2))
