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

card = Image.open(os.path.join(IMG, "invitation-card-base.webp")).convert("RGB")
# The blank card has no small wording, so it is drawn here (the page sets the same wording in
# real type). Keep these lines in step with js/config.js if a name, date or place changes.
from PIL import ImageFont
_F = "/usr/share/fonts/truetype/liberation/LiberationSerif-%s.ttf"
def _font(style, size):
    try:
        return ImageFont.truetype(_F % style, size)
    except OSError:
        return ImageFont.load_default()
def _spaced(d, text, cy, size, track, fill, style="Bold", cx=512):
    f = _font(style, size)
    ws = [d.textlength(c, font=f) for c in text]
    total = sum(ws) + track * (len(text) - 1)
    x = cx - total / 2
    for c, w in zip(text, ws):
        d.text((x, cy), c, font=f, fill=fill, anchor="lm")
        x += w + track
    return total
_d = ImageDraw.Draw(card)
INK, GREEN, RUBY, GOLD = (47, 36, 27), (8, 64, 47), (160, 28, 51), (184, 145, 63)
_spaced(_d, "TOGETHER WITH OUR FAMILIES", 322, 31, 3.4, INK)
_spaced(_d, "Saadiah Binte Said", 368, 41, 0.8, GREEN)
_spaced(_d, "(Bride's Mother)", 410, 30, 1.2, INK, "Italic")
_spaced(_d, "Saéyah Salleh & Sitiischa Salleh", 450, 41, 0.8, GREEN)
_spaced(_d, "(Groom's Sisters)", 492, 30, 1.2, INK, "Italic")
_spaced(_d, "INVITE YOU TO CELEBRATE", 1026, 37, 4.5, INK)
_spaced(_d, "OUR WEDDING", 1075, 37, 4.5, INK)
for x0, x1 in ((222, 440), (584, 802)):
    _d.line((x0, 1113, x1, 1113), fill=GOLD, width=3); _d.line((x0, 1203, x1, 1203), fill=GOLD, width=3)
_d.line((440, 1112, 440, 1204), fill=GOLD, width=3); _d.line((584, 1112, 584, 1204), fill=GOLD, width=3)
_spaced(_d, "SAT", 1158, 40, 2.4, GREEN, cx=331)
_d.text((512, 1158), "12", font=_font("Bold", 112), fill=RUBY, anchor="mm")
_spaced(_d, "DEC 2026", 1158, 40, 2.4, GREEN, cx=693)
_spaced(_d, "SINGAPORE", 1275, 35, 7.5, INK)
card = card.convert("RGBA")
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
