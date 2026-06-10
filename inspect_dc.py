# -*- coding: utf-8 -*-
import json, os
data = json.load(open("public/data.json", encoding="utf-8"))
IMG = "public/images"

def walk():
    for cat, cd in data.items():
        for it in cd.get("items", []): yield cat, None, it
        for sub, arr in (cd.get("subcategories") or {}).items():
            for it in arr: yield cat, sub, it

def srcs(c):
    out, idx = [], 0
    while True:
        k = c.find('src="images/', idx)
        if k == -1: break
        end = c.find('"', k + 5)
        out.append(c[k + 5:end])  # images/....
        idx = end + 1
    return out

# (a) entries whose title/id mentions "devoured"
print("=== title/id contains 'devoured' ===")
for cat, sub, it in walk():
    if "devoured" in (it.get("title", "") + " " + it.get("id", "")).lower():
        c = it.get("content", "")
        print(f"{cat}/{sub} | id={it.get('id')} | title={it.get('title')!r} | has<img>={'<img' in c}")
        for s in srcs(c):
            rel = s[len('images/'):]
            p = os.path.join(IMG, rel)
            print(f"    {s} | exists={os.path.exists(p)} | size={os.path.getsize(p) if os.path.exists(p) else 0}")
        if "<img" not in c:
            print("    head:", c[:240])

# (b) any image filename containing 'devoured' anywhere in data
print("\n=== any image ref containing 'devoured' ===")
seen = set()
for cat, sub, it in walk():
    for s in srcs(it.get("content", "")):
        if "devoured" in s.lower() and s not in seen:
            seen.add(s)
            rel = s[len('images/'):]
            p = os.path.join(IMG, rel)
            print(f"  {s} | exists={os.path.exists(p)} | size={os.path.getsize(p) if os.path.exists(p) else 0} | in {it.get('id')}")
if not seen:
    print("  (none)")
