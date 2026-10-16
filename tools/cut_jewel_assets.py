"""Cut the wax seal and the corner sprig out of the ruby envelope design image.

    python3 tools/cut_jewel_assets.py assets/images/ruby-envelope-reference.jpg

The design is gold and ruby on crimson paper, so each piece is lifted by colour:
gold is told apart from the paper by how much green it carries (the paper has
almost none), the ruby berries by being much brighter than the paper. Specks
the key finds in the paper's own texture are dropped by size, and the gold edge
lines that run up to the seal are cut away by shape. Pixels on the very edge
keep a trace of the crimson they were photographed on, which is the colour they
sit on again. Writes assets/images/wax-seal-ruby.webp and assets/images/sprig.webp.
"""
import sys, os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

SRC = sys.argv[1] if len(sys.argv) > 1 else "assets/images/ruby-envelope-reference.jpg"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "images")
A = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)

def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)

def gold(a, lo=0.30, hi=0.44):
    r, g = a[..., 0], a[..., 1]
    return smooth(g / np.maximum(r, 1), lo, hi) * smooth(r, 70, 110)

def berry(a):
    """Berries are smooth, glossy and brighter than the paper; the paper's own texture
    is fine-grained, so compare a softened brightness, not single pixels."""
    r, g = a[..., 0], a[..., 1]
    soft = np.asarray(Image.fromarray(r.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32)
    return smooth(soft, 121, 138) * (1 - smooth(g / np.maximum(r, 1), 0.22, 0.32))

def components(mask):
    """Label 8-connected components; returns (labels, sizes)."""
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32); sizes = [0]
    for y0 in range(h):
        for x0 in range(w):
            if mask[y0, x0] and not lab[y0, x0]:
                n = len(sizes); sizes.append(0)
                q = deque([(y0, x0)]); lab[y0, x0] = n
                while q:
                    y, x = q.popleft(); sizes[n] += 1
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            yy, xx = y + dy, x + dx
                            if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]:
                                lab[yy, xx] = n; q.append((yy, xx))
    return lab, np.array(sizes)

def fill_holes(mask):
    inner = Image.fromarray(np.where(mask, 0, 255).astype(np.uint8))
    img = Image.new("L", (inner.width + 2, inner.height + 2), 255)   # a 1px "outside" border all round
    img.paste(inner, (1, 1))
    ImageDraw.floodfill(img, (0, 0), 128)
    return (np.asarray(img) != 128)[1:-1, 1:-1]

def morph(mask, size, op):
    f = ImageFilter.MinFilter(size) if op == "erode" else ImageFilter.MaxFilter(size)
    return np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(f)) > 127

def blur(alpha, r):
    return np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))) / 255.0

def trim_save(crop, alpha, name, pad=3):
    ys, xs = np.nonzero(alpha > 0.03)
    by0, bx0 = max(0, ys.min() - pad), max(0, xs.min() - pad)
    by1, bx1 = min(alpha.shape[0], ys.max() + pad + 1), min(alpha.shape[1], xs.max() + pad + 1)
    rgba = np.dstack([crop[by0:by1, bx0:bx1], alpha[by0:by1, bx0:bx1] * 255]).clip(0, 255).astype(np.uint8)
    path = os.path.join(OUT, name)
    Image.fromarray(rgba, "RGBA").save(path, "WEBP", quality=90, method=6)
    print(name, rgba.shape[1], "x", rgba.shape[0], os.path.getsize(path), "bytes")
    if os.environ.get("DEBUG"):
        Image.fromarray((alpha * 255).astype(np.uint8)).save(os.path.join(os.environ["DEBUG"], name + ".alpha.png"))

# ---- the seal ---------------------------------------------------------------------
x0, y0, x1, y1 = 610, 440, 930, 750
crop = A[y0:y1, x0:x1]
g = gold(crop, 0.26, 0.40)
core = g > 0.5
body = morph(morph(core, 9, "erode"), 9, "dilate")           # thin edge lines go, the seal's gold stays
lab, sizes = components(body)
H, Wd = body.shape
Yc, Xc = np.mgrid[0:H, 0:Wd]
cy, cx = 587 - y0, 769 - x0                                   # the seal's centre in the design
seal = np.zeros_like(body)
for n in range(1, len(sizes)):                                # every gold piece that belongs to the seal
    m = lab == n
    if sizes[n] >= 30 and np.hypot(Yc[m].mean() - cy, Xc[m].mean() - cx) < 125:
        seal |= m
seal = morph(morph(seal, 15, "dilate"), 15, "erode")          # close the gaps between the pieces
seal = fill_holes(seal)                                       # the ruby sprig inside belongs to the seal
seal &= np.hypot(Yc - cy, Xc - cx) < 132
edge = morph(seal, 5, "dilate") & ~seal
alpha = np.where(seal, 1.0, np.where(edge, g, 0.0))
alpha = np.maximum(blur(alpha, 0.7), morph(seal, 5, "erode") * 1.0)
trim_save(crop, alpha, "wax-seal-ruby.webp")

# ---- the top-left corner sprig -------------------------------------------------------
x0, y0, x1, y1 = 226, 150, 416, 356
crop = A[y0:y1, x0:x1]
Y, X = np.mgrid[y0:y1, x0:x1]
keep = (Y < 265 + (X - 212) * 0.545 - 9)                      # stay clear of the diagonal gold rule below
a = np.maximum(gold(crop), berry(crop)) * keep
lab, sizes = components(a > 0.45)
big = np.isin(lab, np.nonzero(sizes >= 60)[0]) & (lab > 0)    # leaves, stems, berries; not paper specks
solid = fill_holes(morph(morph(big, 3, "dilate"), 3, "erode")) & keep
near = morph(solid, 3, "dilate")
alpha = np.where(solid, np.maximum(a, smooth(crop[..., 0], 92, 128)), np.where(near, a * 0.9, 0.0))
alpha = blur(alpha, 0.45)
trim_save(crop, alpha, "sprig.webp")
