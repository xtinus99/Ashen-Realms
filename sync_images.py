# -*- coding: utf-8 -*-
"""Re-sync site WebPs from the vault: any public/images/*.webp whose source
vault PNG (matched by filename stem) is NEWER gets re-converted. Run whenever
vault art is updated. Preserves alpha for transparent sources (sigils/crests).
"""
import os
from PIL import Image

VAULT = r"C:\Users\khali\Documents\DND Campaign\DND Campaign"
IMG_OUT = r"C:\Users\khali\Documents\DND Campaign\player-site\public\images"

# Build stem -> (path, mtime) over every PNG in the vault; newest wins on dupes.
vault = {}
for root, _dirs, files in os.walk(VAULT):
    for fn in files:
        if fn.lower().endswith(".png"):
            p = os.path.join(root, fn)
            try:
                m = os.path.getmtime(p)
            except OSError:
                continue
            stem = fn[:-4]
            if stem not in vault or m > vault[stem][1]:
                vault[stem] = (p, m)

def convert(src, dst):
    im = Image.open(src)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
    else:
        im = im.convert("RGB")
    im.save(dst, "WEBP", quality=85, method=6)

reconv, uptodate, unmatched = [], 0, []
for fn in sorted(os.listdir(IMG_OUT)):
    if not fn.lower().endswith(".webp"):
        continue
    stem = fn[:-5]
    dst = os.path.join(IMG_OUT, fn)
    if stem in vault:
        src, pmt = vault[stem]
        if pmt > os.path.getmtime(dst) + 1:   # 1s tolerance
            convert(src, dst)
            reconv.append(fn)
        else:
            uptodate += 1
    else:
        unmatched.append(fn)

print(f"=== IMAGE SYNC ===")
print(f"Re-converted {len(reconv)} stale image(s) from newer vault PNGs:")
for fn in reconv:
    print(f"   updated -> {fn}")
print(f"\nAlready up-to-date: {uptodate}")
print(f"No matching vault PNG (name-safe / one-off): {len(unmatched)}")
for fn in unmatched:
    print(f"   (no source) {fn}")
