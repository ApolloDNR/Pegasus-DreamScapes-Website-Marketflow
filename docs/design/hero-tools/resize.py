#!/usr/bin/env python3
"""Warm-preserving hero resize (no navy-shadow seat): source PNG -> webp
at 2000w + 1080w, and a left-third luma report. Usage:
  python3 resize.py <src.png> <out-dir>
"""
import sys, os
from PIL import Image
import numpy as np

src = sys.argv[1]
outdir = sys.argv[2]
os.makedirs(outdir, exist_ok=True)
img = Image.open(src).convert('RGB')
for w, name, q in ((2000, 'hero.webp', 86), (1080, 'hero-m.webp', 84)):
    r = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    r.save(os.path.join(outdir, name), quality=q, method=6)
h, wd = img.height, img.width
left = np.array(img.crop((0, int(h * 0.18), int(wd * 0.34), int(h * 0.85)))).mean()
print(f'left-third mean luma: {left:.1f}')
