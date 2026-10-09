"""Seamless cotton-paper texture for the envelope (seeded; run again to regenerate).

Built the way a macro photograph of cotton stock reads: warm ivory, a soft cloud of
variation, a felted fine grain, short curly fibres (light ones catching the light,
dark ones sunk in the sheet), a few brown flecks, and all of it lit from the top-left
so the surface has tooth rather than looking like printed noise.
Every layer is periodic, so the tile repeats without a seam.
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

N = int(sys.argv[1]) if len(sys.argv) > 1 else 768
OUT = sys.argv[2] if len(sys.argv) > 2 else "cotton-paper.webp"
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
cloud2 = band(70, 260, 2)       # a second, warmer cloud so tone and hue drift apart
felt = band(12, 46, 3)          # the felted pulp
tooth = band(2.2, 6.0, 4)       # fine grain
fl = fibres(int(N * N / 300), 5, alpha=(90, 230))              # light fibres
fd = fibres(int(N * N / 520), 6, length=(7, 28), alpha=(70, 170))   # dark, sunk fibres
fk = flecks(int(N * N / 20000), 7)                              # brown flecks
fp = flecks(int(N * N / 36000), 8, radius=(0.7, 1.2))           # pale flecks

# ---- height, lit from the top-left ------------------------------------------------
height = 0.55 * felt + 0.8 * tooth + 3.0 * fl - 1.1 * fd
gx, gy = grad(height)
shade = (gx + gy) / math.sqrt(2)

lum = (1.0
       + 0.0095 * cloud
       + 0.0110 * felt
       + 0.0135 * tooth
       + 0.0270 * shade)

base = np.array([250, 242, 226], dtype=np.float32) / 255.0
rgb = lum[..., None] * base[None, None, :]
# hue drift: a little warmer here, a little cooler there
rgb[..., 2] *= 1 + 0.0030 * cloud2
rgb[..., 0] *= 1 + 0.0008 * cloud2
# light fibres lift the sheet; dark fibres and flecks sit in it, in warm brown
rgb += 0.066 * fl[..., None] * np.array([1.0, 1.0, 0.92])[None, None, :]
rgb *= 1 - fd[..., None] * np.array([0.085, 0.120, 0.195])[None, None, :]
rgb *= 1 - fk[..., None] * np.array([0.30, 0.40, 0.56])[None, None, :]
rgb += 0.030 * fp[..., None]

rgb = np.clip(rgb, 0, 1)
out = Image.fromarray((rgb * 255 + 0.5).astype(np.uint8), "RGB")
out.save(OUT, "WEBP", quality=Q, method=6)
a = np.asarray(out, dtype=np.float32)
print(OUT, N, "size", os.path.getsize(OUT), "bytes; mean", a.mean(axis=(0, 1)).round(1), "std", a.std(axis=(0, 1)).round(2))
