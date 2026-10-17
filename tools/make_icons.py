"""Make the browser-tab icon and the phone home-screen icon from the I|K seal.

    python3 tools/make_icons.py

Writes assets/images/favicon.png (64 px) and assets/images/apple-touch-icon.png (180 px,
on the emerald ground because iPhones do not draw transparency). Needs Pillow.
"""
import os
from PIL import Image

IMG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "images")
seal = Image.open(os.path.join(IMG, "wax-seal-monogram.webp")).convert("RGBA")
seal = seal.crop(seal.getbbox())
side = max(seal.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(seal, ((side - seal.width) // 2, (side - seal.height) // 2))

fav = sq.resize((64, 64), Image.LANCZOS)
fav.save(os.path.join(IMG, "favicon.png"), optimize=True)

size = 180
icon = Image.new("RGB", (size, size), (13, 92, 69))
s = sq.resize((int(size * 0.8),) * 2, Image.LANCZOS)
icon.paste(s, ((size - s.width) // 2, (size - s.height) // 2), s)
icon.save(os.path.join(IMG, "apple-touch-icon.png"), optimize=True)
print("ok")
