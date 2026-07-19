#!/usr/bin/env python3
"""Grade + prep the masterpiece hero art the moment it lands (usage:
python3 grade-hero.py <input-image>). Master-premium-design pipeline:
brand-navy shadow seat, slight desaturation, left-third darkness check
for headline contrast, webp output at 2000w + 1080w."""
import sys
from PIL import Image, ImageEnhance
import numpy as np

SRC = sys.argv[1]
OUT_DIR = '/root/pegasus-site/client/public/images/hero'
img = Image.open(SRC).convert('RGB')
print('in:', img.size)

# 1) gentle grade: -8% saturation, seat shadows toward brand navy (#091421)
img = ImageEnhance.Color(img).enhance(0.92)
a = np.array(img).astype(np.float64)
lum = a.mean(axis=2, keepdims=True) / 255.0
navy = np.array([9, 20, 33], dtype=np.float64)[None, None, :]
shadow_w = np.clip((0.38 - lum) / 0.38, 0, 1) * 0.35  # only the darks, gently
a = a * (1 - shadow_w) + navy * shadow_w
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# 2) left-third darkness check (headline sits there; want mean luma < 60)
w, h = img.size
left = np.array(img.crop((0, int(h*0.18), int(w*0.34), int(h*0.85)))).mean()
print(f'left-third mean luma: {left:.1f} ({"OK" if left < 60 else "TOO BRIGHT — css wash must carry more, or re-crop"})')

# 3) outputs
import os
os.makedirs(OUT_DIR, exist_ok=True)
for width, name, q in ((2000, 'nocturne.webp', 82), (1080, 'nocturne-m.webp', 80)):
    r = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    p = f'{OUT_DIR}/{name}'
    r.save(p, quality=q, method=4)
    print('out:', p, r.size, round(os.path.getsize(p)/1024), 'KB')
print('done — now wire .hv-hero-art in home-v51.tsx and rebuild.')
