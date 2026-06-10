# -*- coding: utf-8 -*-
import json, os
data = json.load(open("public/data.json", encoding="utf-8"))
VAULT = r"C:\Users\khali\Documents\DND Campaign\DND Campaign"

def walk():
    for cat, cd in data.items():
        for it in cd.get("items", []): yield cat, None, it
        for sub, arr in (cd.get("subcategories") or {}).items():
            for it in arr: yield cat, sub, it

# vault art index by lowercase stem (newest wins)
vault = {}
for root, _d, files in os.walk(VAULT):
    for f in files:
        if f.lower().endswith((".png", ".webp", ".jpg", ".jpeg")):
            stem = os.path.splitext(f)[0].lower()
            p = os.path.join(root, f)
            try: mt = os.path.getmtime(p)
            except OSError: continue
            if stem not in vault or mt > vault[stem][1]:
                vault[stem] = (p, mt, f)

def find_art(title):
    t = title.lower().strip()
    cands = [t]
    if t.startswith("the "): cands.append(t[4:])
    for c in cands:
        if c in vault: return vault[c]
    return None

SKIP_CATS = {"Sessions"}  # logs, not portrait entries
have, none_ = [], []
for cat, sub, it in walk():
    if cat in SKIP_CATS: continue
    if "<img" in it.get("content", ""): continue
    art = find_art(it.get("title", ""))
    (have if art else none_).append((cat, sub, it, art))

print(f"=== {len(have)} imageless entries WITH matching vault art (candidates to add) ===")
for cat, sub, it, art in have:
    print(f"  [{cat}] {it.get('title')!r}  <-  {art[2]}")
print(f"\n=== {len(none_)} imageless entries with NO title-matched art ===")
for cat, sub, it, _ in none_:
    print(f"  [{cat}] {it.get('title')!r}")
