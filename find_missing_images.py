# -*- coding: utf-8 -*-
import os, re
from PIL import Image

SITE = r"C:\Users\khali\Documents\DND Campaign\player-site"
VAULT = r"C:\Users\khali\Documents\DND Campaign\DND Campaign"
IMG = os.path.join(SITE, "public", "images")
PUB = os.path.join(SITE, "public")

# 1. Collect every "images/...ext" reference across the public data files.
refs = {}  # rel-path -> set(source files)
for fn in os.listdir(PUB):
    if not fn.endswith(".json"):
        continue
    txt = open(os.path.join(PUB, fn), encoding="utf-8").read()
    for m in re.finditer(r'images/([^"\\]+?\.(?:webp|png|jpe?g))', txt, re.I):
        refs.setdefault(m.group(1), set()).add(fn)

missing = [r for r in sorted(refs) if not os.path.exists(os.path.join(IMG, r))]
print(f"referenced images: {len(refs)} | already present: {len(refs)-len(missing)} | MISSING: {len(missing)}\n")

# 2. Index every vault image by lowercase stem (newest wins).
vault = {}
for root, _d, files in os.walk(VAULT):
    for f in files:
        if f.lower().endswith((".png", ".webp", ".jpg", ".jpeg")):
            stem = os.path.splitext(f)[0].lower()
            p = os.path.join(root, f)
            try: mt = os.path.getmtime(p)
            except OSError: continue
            if stem not in vault or mt > vault[stem][1]:
                vault[stem] = (p, mt)

def convert(src, dst):
    im = Image.open(src)
    im = im.convert("RGBA") if (im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)) else im.convert("RGB")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "WEBP", quality=85, method=6)

# 3. Try to resolve each missing image from the vault by stem.
fixed, unresolved = [], []
for r in missing:
    stem = os.path.splitext(os.path.basename(r))[0].lower()
    if stem in vault:
        try:
            convert(vault[stem][0], os.path.join(IMG, r))
            fixed.append((r, os.path.basename(vault[stem][0])))
        except Exception as e:
            unresolved.append((r, f"convert error: {e}"))
    else:
        unresolved.append((r, "no vault source"))

print(f"FIXED — converted from vault ({len(fixed)}):")
for r, s in fixed:
    print(f"  + {r}   <-  {s}")
print(f"\nUNRESOLVED — need source art ({len(unresolved)}):")
for r, why in unresolved:
    print(f"  ! {r}   [{why}]   refs: {', '.join(sorted(refs[r]))}")
