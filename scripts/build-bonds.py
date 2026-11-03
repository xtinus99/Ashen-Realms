"""Build the Bonds & Standing page's data from the DM's vault ledger.

Reads  ../DND Campaign/00 - Campaign Management/Bonds and Standing.md
Writes public/relationships-data.json

Only what the players have unlocked is written out:
  - the DM-only lines (Deed, Amends) never;
  - an Ask only when the ledger names a character it was told to;
  - a fall (Cold, Against you, Enemy) only when some character stands at it or below it.
The published JSON is public, so anything left out here can't be read in the browser either.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(os.path.dirname(ROOT), "DND Campaign", "00 - Campaign Management", "Bonds and Standing.md")
OUT = os.path.join(ROOT, "public", "relationships-data.json")
DATA = os.path.join(ROOT, "public", "data.json")
IMAGES = os.path.join(ROOT, "public", "images")

# Show every reward step (Known, Trusted, Sworn) so players can see what to work toward.
# Set to False to show a reward only once a character has reached that step.
SHOW_LOCKED_REWARDS = True

STEPS = ["Enemy", "Against you", "Cold", "Known", "Trusted", "Sworn"]
RANK = {s: i for i, s in enumerate(STEPS)}
FALLS = ["Cold", "Against you", "Enemy"]
REWARDS = ["Known", "Trusted", "Sworn"]
CHARACTERS = {"farkas": "Farkas", "veezara": "Veezara", "anvil": "Anvil"}
BY_NAME = {v.lower(): k for k, v in CHARACTERS.items()}
DM_ONLY = {"Deed (DM)", "Amends (DM)", "Vault name (DM)"}


def parse(text):
    people = []
    for m in re.finditer(r"^## (.+?)\n(.*?)(?=^## |\Z)", text, flags=re.S | re.M):
        name, body = m.group(1).strip(), m.group(2)
        if "- **Standing:**" not in body:
            continue  # a heading, not a person
        fields, chronicle = {}, []
        in_chron = False
        for line in body.splitlines():
            fm = re.match(r"^- \*\*(.+?):\*\*\s*(.*)$", line)
            if fm:
                key, val = fm.group(1), fm.group(2).strip()
                in_chron = key == "Chronicle"
                if not in_chron:
                    fields[key] = val
                continue
            cm = re.match(r"^\s+- (.+?) · (.+?): (.+)$", line)
            if in_chron and cm:
                pcs = [BY_NAME[p.strip().lower()] for p in cm.group(2).split(",") if p.strip().lower() in BY_NAME]
                chronicle.append({"session": cm.group(1).strip(), "pcs": pcs, "text": cm.group(3).strip()})
        people.append((name, fields, chronicle))
    return people


def standing_of(val):
    out = {}
    for part in val.split(";"):
        part = part.strip()
        if not part or part.endswith("—"):
            continue
        who, _, step = part.partition(" ")
        key = BY_NAME.get(who.lower())
        if key and step in RANK:
            out[key] = step
        elif key:
            sys.exit(f"Unknown step '{step}' for {who}")
    return out


# Factions have no portrait of their own; show the face the company knows them by.
IMAGE_ALIAS = {
    "House Vander": "images/Lord Theron Vander.webp",
    "Drey's Crew": "images/S57 Drey.webp",
    "The face trade": "images/S60 Elf-Faced Man.webp",
}


def image_for(name, catalogue):
    if name in IMAGE_ALIAS:
        return IMAGE_ALIAS[name]
    hit = catalogue.get(name.lower())
    if hit:
        return hit
    for stem in (name, name.split(",")[0]):
        if os.path.exists(os.path.join(IMAGES, stem + ".webp")):
            return f"images/{stem}.webp"
    return None


def load_catalogue():
    """Title -> portrait, from the compendium, preferring the living page over an eve one."""
    cat = {}
    data = json.load(open(DATA, encoding="utf-8"))
    for category, block in data.items():
        if not isinstance(block, dict):
            continue
        items = list(block.get("items") or [])
        for sub in (block.get("subcategories") or {}).values():
            items += sub
        for it in items:
            if not isinstance(it, dict):
                continue
            pic = it.get("portrait") or it.get("image")
            if not pic:
                m = re.search(r'<img[^>]+src=(["\'])(.*?)\1', it.get("content") or "")
                pic = m.group(2) if m else None
            title = (it.get("title") or "").lower()
            if pic and title and (title not in cat or it.get("era") != "eve"):
                cat[title] = pic
    return cat


def main():
    text = open(LEDGER, encoding="utf-8").read()
    catalogue = load_catalogue()
    out = []
    for name, f, chronicle in parse(text):
        standing = standing_of(f.get("Standing", ""))
        if not standing:
            continue
        reached_low = min(RANK[s] for s in standing.values())
        person = {
            "name": name,
            "kind": f.get("Kind", "npc"),
            "realm": f.get("Realm", "living"),
            "where": f.get("Where", ""),
            "who": f.get("Who", ""),
            "says": f.get("Says", ""),
            "wants": f.get("Wants", ""),
            "image": image_for(name, catalogue),
            "romance": f.get("Romance", "no").lower().startswith("y"),
            "standing": standing,
            "rewards": {},
            "falls": {},
            "ask": None,
            "chronicle": chronicle,
        }
        best = max(RANK[s] for s in standing.values())
        for step in REWARDS:
            if f.get(step) and (SHOW_LOCKED_REWARDS or RANK[step] <= best):
                person["rewards"][step] = f[step]
        for step in FALLS:
            if f.get(step) and reached_low <= RANK[step]:
                person["falls"][step] = f[step]
        told = [BY_NAME[p.strip().lower()] for p in f.get("Ask told to", "").split(",") if p.strip().lower() in BY_NAME]
        ask = f.get("Ask", "")
        if told and ask and not ask.startswith("(DM"):
            person["ask"] = {"text": ask, "told": told}
        out.append(person)

    leaks = [k for p in out for k in DM_ONLY if k in json.dumps(p)]
    assert not leaks, leaks
    doc = {"version": 2, "steps": STEPS, "characters": CHARACTERS, "people": out}
    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    per_pc = {k: sum(1 for p in out if k in p["standing"]) for k in CHARACTERS}
    no_pic = [p["name"] for p in out if not p["image"]]
    print(f"Wrote {len(out)} bonds {per_pc}; falls shipped: {sum(len(p['falls']) for p in out)}; asks shipped: {sum(1 for p in out if p['ask'])}")
    if no_pic:
        print("No portrait found:", ", ".join(no_pic))


if __name__ == "__main__":
    main()
