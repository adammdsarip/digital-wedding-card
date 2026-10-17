"""Build the picture that shows when the invitation link is shared (WhatsApp, iMessage, etc.).

    python3 tools/make_og_image.py

Puts the invitation card, tilted slightly, over the emerald backdrop at 1200 x 630 (the
size link previews use) and writes assets/images/og-image.jpg, kept under ~150 KB.
Needs Pillow.
"""
import os
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "assets", "images")
W, H = 1200, 630

bg = Image.open(os.path.join(IMG, "emerald-background.webp")).convert("RGB")
# cover-crop the portrait backdrop to the wide frame, from its middle
scale = W / bg.width
bg = bg.resize((W, round(bg.height * scale)), Image.LANCZOS)
top = (bg.height - H) // 2
bg = bg.crop((0, top, W, top + H)).filter(ImageFilter.GaussianBlur(2))
# a soft vignette so the card stands out
vig = Image.new("L", (W, H), 0)
ImageDraw.Draw(vig).ellipse((-W * 0.2, -H * 0.5, W * 1.2, H * 1.5), fill=255)
vig = vig.filter(ImageFilter.GaussianBlur(120))
dark = Image.new("RGB", (W, H), (4, 24, 12))
bg = Image.composite(bg, dark, vig)

card = Image.open(os.path.join(IMG, "invitation-card.webp")).convert("RGBA")
ch = 560
card = card.resize((round(card.width * ch / card.height), ch), Image.LANCZOS)
card = card.rotate(3, resample=Image.BICUBIC, expand=True)
shadow = Image.new("RGBA", (card.width + 120, card.height + 120), (0, 0, 0, 0))
shadow.paste((0, 0, 0, 150), (60, 70), card.getchannel("A"))
shadow = shadow.filter(ImageFilter.GaussianBlur(22))
cx, cy = (W - card.width) // 2, (H - card.height) // 2
canvas = bg.convert("RGBA")
canvas.alpha_composite(shadow, (cx - 60, cy - 60))
canvas.alpha_composite(card, (cx, cy))

out = os.path.join(IMG, "og-image.jpg")
canvas.convert("RGB").save(out, quality=84, optimize=True, progressive=True)
print(out, os.path.getsize(out) // 1024, "KB")
