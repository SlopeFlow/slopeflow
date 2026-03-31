from PIL import Image, ImageDraw, ImageFont
import math

# Colors
BG       = (13, 13, 13)
CARD     = (26, 26, 26)
BORDER   = (42, 42, 42)
ACCENT   = (0, 229, 255)
GREEN    = (0, 230, 118)
RED      = (255, 23, 68)
GOLD     = (255, 214, 0)
WHITE    = (255, 255, 255)
GRAY     = (158, 158, 158)
MUTED    = (97, 97, 97)

W, H = 390, 844  # iPhone-ish
SCREENS = 3
GAP = 30
TOTAL_W = W * SCREENS + GAP * (SCREENS - 1)
img = Image.new('RGB', (TOTAL_W + 80, H + 80), (8, 8, 8))
draw = ImageDraw.Draw(img)

def phone(x_off, y_off):
    # Phone frame
    draw.rounded_rectangle([x_off, y_off, x_off+W, y_off+H], radius=40, fill=BG, outline=(50,50,50), width=2)

def rect(draw, x, y, w, h, fill, radius=14, outline=None, width=1):
    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=fill, outline=outline, width=width)

def text(draw, x, y, s, size=14, color=WHITE, bold=False, center=False, max_w=None):
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        font = ImageFont.load_default()
    if center and max_w:
        bbox = draw.textbbox((0,0), s, font=font)
        tw = bbox[2] - bbox[0]
        x = x + (max_w - tw) // 2
    draw.text((x, y), s, fill=color, font=font)

def progress_bar(draw, xo, yo, pct):
    draw.rectangle([xo+20, yo+60, xo+W-20, yo+63], fill=BORDER)
    draw.rectangle([xo+20, yo+60, xo+20+int((W-40)*pct), yo+63], fill=ACCENT)

# ─── SCREEN 1: ONBOARDING (Welcome) ────────────────────────────────────────
X0, Y0 = 40, 40
phone(X0, Y0)
progress_bar(draw, X0, Y0, 0.0)

text(draw, X0+160, Y0+120, "🏔", size=52, center=False)
text(draw, X0+30, Y0+190, "Welcome to", size=26, bold=True)
text(draw, X0+30, Y0+225, "SlopeFlow", size=32, bold=True, color=ACCENT)
text(draw, X0+30, Y0+280, "Real signals. No noise.", size=15, color=GRAY)
text(draw, X0+30, Y0+305, "Built for riders who want to", size=15, color=GRAY)
text(draw, X0+30, Y0+328, "understand markets — not just", size=15, color=GRAY)
text(draw, X0+30, Y0+351, "follow them.", size=15, color=GRAY)

# Continue button
rect(draw, X0+30, Y0+720, W-60, 52, ACCENT, radius=14)
text(draw, X0+30, Y0+737, "CONTINUE →", size=14, color=BG, bold=True, center=True, max_w=W-60)
text(draw, X0+155, Y0+800, "1 of 6", size=12, color=MUTED)

# ─── SCREEN 2: EXPERIENCE ───────────────────────────────────────────────────
X1 = X0 + W + GAP
phone(X1, Y0)
progress_bar(draw, X1, Y0, 0.6)

text(draw, X1+30, Y0+90, "WHERE ARE YOU", size=11, color=ACCENT, bold=True)
text(draw, X1+30, Y0+112, "ON THE MOUNTAIN?", size=11, color=ACCENT, bold=True)
text(draw, X1+30, Y0+140, "Fresh drop", size=24, bold=True)

# Option cards
opts = [
    ("Fresh drop",        "Never traded before",    True),
    ("Getting my footing","Know the basics",         False),
    ("Already riding",    "I've made real trades",  False),
]
oy = Y0 + 200
for label, sub, active in opts:
    outline_col = ACCENT if active else BORDER
    fill_col = (0, 229, 255, 18) if active else CARD
    rect(draw, X1+24, oy, W-48, 72, CARD, radius=14,
         outline=ACCENT if active else BORDER, width=2)
    text(draw, X1+40, oy+14, label, size=16, bold=True, color=ACCENT if active else WHITE)
    text(draw, X1+40, oy+38, sub, size=13, color=GRAY)
    oy += 84

rect(draw, X1+30, Y0+720, W-60, 52, ACCENT, radius=14)
text(draw, X1+30, Y0+737, "CONTINUE →", size=14, color=BG, bold=True, center=True, max_w=W-60)
text(draw, X1+155, Y0+800, "4 of 6", size=12, color=MUTED)

# ─── SCREEN 3: BTC DASHBOARD ────────────────────────────────────────────────
X2 = X1 + W + GAP
phone(X2, Y0)

# Status bar area
text(draw, X2+30, Y0+20, "BITCOIN", size=11, color=ACCENT, bold=True)
text(draw, X2+320, Y0+20, "BTC", size=11, color=MUTED, bold=True)

# Price
text(draw, X2+24, Y0+55, "$83,412.50", size=34, bold=True)
text(draw, X2+24, Y0+100, "▲ 2.34%  (24h)", size=16, bold=True, color=GREEN)

# Range buttons
text(draw, X2+24, Y0+140, "READ THE LINE", size=10, color=ACCENT, bold=True)
ranges = ["15M","1H","4H","1D","1W","1M","1Y"]
rx = X2+24
for i, r in enumerate(ranges):
    active = (r == "1D")
    bw = 36
    rect(draw, rx, Y0+158, bw, 24, ACCENT if active else CARD, radius=12,
         outline=ACCENT if not active else None, width=1)
    text(draw, rx+2, Y0+163, r, size=10, color=BG if active else GRAY, bold=active)
    rx += bw + 6

# Chart area (simulated area chart)
rect(draw, X2+16, Y0+196, W-32, 160, CARD, radius=14)
# Draw a fake chart line
import math
pts = []
for i in range(60):
    px = X2+30 + int(i * (W-60)/59)
    base = 270
    wave = math.sin(i * 0.18) * 22 + math.sin(i * 0.4) * 10
    noise = math.sin(i * 1.3) * 5
    py = Y0 + base - int(wave + noise) + int(i * 0.3)
    pts.append((px, py))
# Area fill
fill_pts = [(X2+30, Y0+356)] + pts + [(X2+30+int(59*(W-60)/59), Y0+356)]
draw.polygon(fill_pts, fill=(0, 229, 255, 40))
# Line
for i in range(len(pts)-1):
    draw.line([pts[i], pts[i+1]], fill=ACCENT, width=2)
# Pointer dot
draw.ellipse([pts[45][0]-5, pts[45][1]-5, pts[45][0]+5, pts[45][1]+5], fill=ACCENT)
# Pointer label
rect(draw, pts[45][0]-45, pts[45][1]-32, 90, 24, CARD, radius=6, outline=ACCENT, width=1)
text(draw, pts[45][0]-42, pts[45][1]-28, "$83,180.20", size=10, color=ACCENT, bold=True)

# Stat cards
sy = Y0+372
sw = (W-48-8) // 3
for label, val in [("24H HIGH","$84,120"),("24H LOW","$81,340"),("MKT CAP","$1.64T")]:
    rect(draw, X2+16+sw*[0,1,2][["24H HIGH","24H LOW","MKT CAP"].index(label)]+[0,8+sw,16+sw*2][["24H HIGH","24H LOW","MKT CAP"].index(label)]-[0,0,0][["24H HIGH","24H LOW","MKT CAP"].index(label)], sy, sw, 62, CARD, radius=12)
sx = X2+16
for label, val in [("24H HIGH","$84,120"),("24H LOW","$81,340"),("MKT CAP","$1.64T")]:
    text(draw, sx+8, sy+8,  label, size=9,  color=MUTED, bold=True)
    text(draw, sx+8, sy+28, val,   size=13, color=WHITE, bold=True)
    sx += sw + 8

# Halving card
rect(draw, X2+16, Y0+450, W-32, 70, CARD, radius=14, outline=ACCENT, width=1)
# Left accent strip
draw.rectangle([X2+16, Y0+450, X2+19, Y0+520], fill=ACCENT)
text(draw, X2+30, Y0+462, "⛏  HALVING CONTEXT", size=10, color=ACCENT, bold=True)
text(draw, X2+30, Y0+482, "~21M max supply. Next halving ~2028.", size=12, color=GRAY)
text(draw, X2+30, Y0+500, "Supply: 19.8M / 21M BTC", size=12, color=GRAY)

# Bottom tab bar
rect(draw, X2+0, Y0+H-70, W, 70, CARD, radius=0)
draw.line([X2, Y0+H-70, X2+W, Y0+H-70], fill=BORDER, width=1)
tabs = [("₿","BTC",True),("📈","WATCHLIST",False),("🏂","LEARN",False)]
tx = X2+30
for icon, label, active in tabs:
    text(draw, tx, Y0+H-55, icon, size=20)
    text(draw, tx-8, Y0+H-28, label, size=9, color=ACCENT if active else MUTED, bold=active)
    tx += 120

# Labels under screens
label_y = Y0 + H + 14
text(draw, 40+140, label_y, "Onboarding", size=14, color=GRAY, bold=True)
text(draw, X1+130, label_y, "Experience", size=14, color=GRAY, bold=True)
text(draw, X2+120, label_y, "BTC Dashboard", size=14, color=GRAY, bold=True)

img.save("mockup.png")
print("Saved mockup.png")
