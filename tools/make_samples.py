"""Draws the three sample photos for the Vice City Postcard app with Pillow.

Every image here is an original flat illustration drawn in code: no real
person, no game artwork. They are the photos the editor loads as samples.
"""
import math
from PIL import Image, ImageDraw

TEAL_DARK = (11, 74, 82)
TEAL = (18, 122, 125)
TEAL_LIGHT = (64, 178, 168)
ORANGE = (244, 130, 44)
ORANGE_DEEP = (214, 84, 32)
CREAM = (250, 232, 196)
GOLD = (238, 178, 74)
SKY_TOP = (16, 96, 104)
SKY_MID = (38, 148, 138)
INK = (14, 42, 48)


def vgrad(img, top, bottom):
    """Paints a top-to-bottom vertical gradient over the whole image."""
    w, h = img.size
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        c = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        draw.line([(0, y), (w, y)], fill=c)


def sunburst(draw, cx, cy, r0, r1, rays, c1, c2, start=-math.pi / 2):
    """Alternating-colour rays fanning out from (cx, cy)."""
    for i in range(rays * 2):
        a0 = start + i * math.pi / rays
        a1 = start + (i + 1) * math.pi / rays
        p0 = (cx + r0 * math.cos(a0), cy + r0 * math.sin(a0))
        p1 = (cx + r1 * math.cos(a0), cy + r1 * math.sin(a0))
        p2 = (cx + r1 * math.cos(a1), cy + r1 * math.sin(a1))
        p3 = (cx + r0 * math.cos(a1), cy + r0 * math.sin(a1))
        draw.polygon([p0, p1, p2, p3], fill=c1 if i % 2 == 0 else c2)


def palm(draw, x, y, s, colour):
    """A simple palm silhouette: curved trunk and fronds."""
    draw.line([(x, y), (x + 6 * s, y - 120 * s)], fill=colour, width=max(2, int(7 * s)))
    top = (x + 6 * s, y - 120 * s)
    for ang in (-150, -120, -95, -70, -45, -20):
        a = math.radians(ang)
        ex = top[0] + 62 * s * math.cos(a)
        ey = top[1] + 62 * s * math.sin(a) * 0.55
        mx = top[0] + 34 * s * math.cos(a)
        my = top[1] + 34 * s * math.sin(a) * 0.55 - 18 * s
        draw.line([top, (mx, my), (ex, ey)], fill=colour, width=max(2, int(4 * s)))
    draw.ellipse([top[0] - 7 * s, top[1] - 7 * s, top[0] + 7 * s, top[1] + 7 * s], fill=colour)


def skyline(draw, w, base, colour, seed):
    """Stepped art-deco towers along the bottom of the frame."""
    import random
    rnd = random.Random(seed)
    x = -20
    while x < w + 20:
        bw = rnd.randint(70, 150)
        bh = rnd.randint(120, 320)
        top = base - bh
        draw.rectangle([x, top, x + bw, base], fill=colour)
        # stepped crown
        step = bw // 3
        draw.rectangle([x + step, top - 34, x + bw - step, top], fill=colour)
        draw.rectangle([x + step + 12, top - 58, x + bw - step - 12, top - 34], fill=colour)
        # lit windows
        for wy in range(top + 18, base - 14, 26):
            for wx in range(x + 12, x + bw - 12, 24):
                if rnd.random() < 0.45:
                    draw.rectangle([wx, wy, wx + 8, wy + 12], fill=GOLD)
        x += bw + rnd.randint(6, 26)


def sample_skyline(path):
    w, h = 1200, 1500
    img = Image.new("RGB", (w, h))
    vgrad(img, SKY_TOP, ORANGE)
    d = ImageDraw.Draw(img, "RGBA")
    sunburst(d, w // 2, 560, 60, 980, 18, (255, 196, 110, 70), (255, 150, 70, 0))
    d.ellipse([w // 2 - 210, 350, w // 2 + 210, 770], fill=(255, 214, 130))
    d.ellipse([w // 2 - 210, 350, w // 2 + 210, 770], outline=(255, 240, 200), width=6)
    # sea band
    d.rectangle([0, 1080, w, 1180], fill=(20, 110, 118))
    for i in range(6):
        d.line([(0, 1100 + i * 14), (w, 1100 + i * 14)], fill=(120, 200, 190), width=3)
    skyline(d, w, 1180, INK, 7)
    palm(d, 110, 1180, 1.15, INK)
    palm(d, 1090, 1180, 0.95, INK)
    img.save(path, quality=90)


def sample_boulevard(path):
    w, h = 1200, 900
    img = Image.new("RGB", (w, h))
    vgrad(img, (250, 214, 160), ORANGE)
    d = ImageDraw.Draw(img, "RGBA")
    sunburst(d, w // 2, 330, 40, 760, 16, (255, 190, 100, 80), (255, 150, 70, 0))
    d.ellipse([w // 2 - 150, 180, w // 2 + 150, 480], fill=(255, 222, 140))
    # road vanishing to the sun
    d.polygon([(0, h), (w, h), (w // 2 + 130, 480), (w // 2 - 130, 480)], fill=(32, 66, 74))
    d.polygon([(w // 2 - 26, h), (w // 2 + 26, h), (w // 2 + 8, 480), (w // 2 - 8, 480)], fill=GOLD)
    # sidewalks and palms receding
    for i, t in enumerate([0.0, 0.22, 0.42, 0.6, 0.76, 0.88]):
        s = 1.5 - t * 1.15
        lx = int(w // 2 - 130 - (w // 2 - 130) * t * 2.6)
        rx = int(w // 2 + 130 + (w - w // 2 - 130) * t * 2.6)
        y = int(480 + (h - 480) * t * t)
        palm(d, lx, y, s, INK)
        palm(d, rx, y, s, INK)
    # low deco buildings at the edges
    d.rectangle([0, 560, 120, h], fill=TEAL_DARK)
    d.rectangle([w - 120, 560, w, h], fill=TEAL_DARK)
    for bx in (0, w - 120):
        for wy in range(590, h - 20, 34):
            d.rectangle([bx + 18, wy, bx + 34, wy + 16], fill=GOLD)
            d.rectangle([bx + 70, wy, bx + 86, wy + 16], fill=GOLD)
    img.save(path, quality=90)


def sample_portrait(path):
    """A stylised portrait silhouette: head and shoulders against a sunburst.
    No real person is depicted; the figure is drawn from simple shapes."""
    w, h = 1200, 1500
    img = Image.new("RGB", (w, h))
    vgrad(img, TEAL_DARK, (24, 130, 128))
    d = ImageDraw.Draw(img, "RGBA")
    sunburst(d, w // 2, 620, 90, 1100, 20, (255, 190, 100, 90), (255, 150, 70, 0))
    d.ellipse([w // 2 - 260, 360, w // 2 + 260, 880], fill=(255, 196, 96))
    d.ellipse([w // 2 - 260, 360, w // 2 + 260, 880], outline=(255, 232, 180), width=5)
    # shoulders, neck and head: a tall oval head in flat deep-teal silhouette
    d.ellipse([w // 2 - 430, 1100, w // 2 + 430, 1700], fill=INK)
    d.rectangle([w // 2 - 62, 940, w // 2 + 62, 1140], fill=INK)
    d.ellipse([w // 2 - 168, 540, w // 2 + 168, 990], fill=INK)
    # hair sweep over the crown
    d.pieslice([w // 2 - 178, 500, w // 2 + 178, 880], 180, 360, fill=INK)
    d.polygon([(w // 2 - 178, 700), (w // 2 - 96, 540), (w // 2 - 40, 700)], fill=INK)
    # collar and shirt stripe
    d.polygon([(w // 2 - 130, 1120), (w // 2, 1260), (w // 2 + 130, 1120),
               (w // 2 + 90, 1080), (w // 2, 1160), (w // 2 - 90, 1080)], fill=CREAM)
    d.rectangle([w // 2 - 8, 1260, w // 2 + 8, 1500], fill=ORANGE)
    # gold hoop earring hanging at the head's edge
    d.ellipse([w // 2 + 138, 880, w // 2 + 188, 930], outline=GOLD, width=8)
    img.save(path, quality=90)


if __name__ == "__main__":
    sample_skyline("app/samples/skyline.jpg")
    sample_boulevard("app/samples/boulevard.jpg")
    sample_portrait("app/samples/portrait.jpg")
    print("samples written")
