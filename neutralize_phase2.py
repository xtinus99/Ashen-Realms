# -*- coding: utf-8 -*-
import json, re, os
DATA="public/data.json"; d=json.load(open(DATA,encoding="utf-8"))
def find(t):
    for cat,cd in d.items():
        for it in cd.get("items",[]):
            if it.get("title")==t: return it
        for arr in (cd.get("subcategories") or {}).values():
            for it in arr:
                if it.get("title")==t: return it

REPL={
 "Veinspire":[
   (", station of High Inquisitor Seraphine Vale.", "."),
   ("While the party was in the Blooming Rot laying Mira to rest, the Tribunal completed their ritual. Seraphine's status is unknown.",
    "The Tribunal completed its great ritual in the Grand Cathedral."),
 ],
 "The Basilica of the Unincarnate":[
   ("Sol communed with her here, returned the Passion-Seed to the tree, released Velara Ashyn to rest in the wood, and stood beside Teldryn while the figment severed his pact with Aral-Vyn and bound him as a Hexblade of Aedwynn.",
    "It is one of the very few places in the world where the Maker, in some diminished form, can still be reached."),
 ],
 "The Dregs":[
   ("A barely-standing hovel where the party sheltered.", "A barely-standing hovel."),
   ("<p><strong>Current Status:</strong> Former party shelter</p>",
    "<p><strong>Current Status:</strong> Abandoned; squatters use it when it stands empty.</p>"),
   ("The child thief was spotted here during Fursen's fourth watch.",
    "The child thief has been seen watching from here."),
   ("<p>A barefoot child who marked the party when REDACTED flashed gold. Led watchers to their shack. Stole Sol's pouch during REDACTED's failed watch.</p>",
    "<p>A barefoot child who marks anyone who flashes coin in the Dregs, then leads the district's watchers to where they sleep — and lifts a purse when the watch grows careless.</p>"),
   ("<p>Still watching. Still out there with 300 gold that doesn't belong to them.</p>",
    "<p>Still watching. Still out there.</p>"),
 ],
 "Slavers' Hollow":[
   ("Teldryn killed a guard and freed them all", "A raid killed a guard and freed them all"),
   ("Told Teldryn to get out", "Told the raiders to get out"),
   ("Teldryn reported what he found to Captain Hael.", "What was found here was reported to Captain Hael."),
 ],
 "The Resolve":[
   ("<p>The party visited in Session 32. Sol and Teldryn discovered it; Fursen landed nearby after departing the Void. Teldryn lost three games and carries the ship's debt.</p>", ""),
 ],
}
log=[]
for title,subs in REPL.items():
    it=find(title); c=it["content"]
    for old,new in subs:
        if old in c: c=c.replace(old,new); log.append(f"{title}: ok")
        else: log.append(f"{title}: MISS -> {old[:45]!r}")
    it["content"]=c

# Lesser Sacral District: strip old-party Status lines + Seraphine bullets
ls=find("Lesser Sacral District"); c=ls["content"]
c=re.sub(r'\s*<strong>Status:</strong>[^<]*', '', c)
c=c.replace("<li>Seraphine Vale's current station</li>","").replace("<li>Seraphine's cover is fragile</li>","")
ls["content"]=re.sub(r'\n{3,}','\n\n',c)

json.dump(d,open(DATA,"w",encoding="utf-8"),ensure_ascii=False,indent=2)

# verify: 0 old-party names across all 26 neutralized targets
SOV=[it["title"] for it in d["Sovereigns"]["items"]]
LOC=["Veinspire","The Basilica of the Unincarnate","The Resolve","Ashford","The Dregs",
     "Lesser Sacral District","Slavers' Hollow","The Velvet Thorn","The Silken Refuge",
     "The Docent's Archive","Dusthollow","The Broken Antler","The Reach"]
NAMES=re.compile(r'\b(Sol Raven|Sol|Fursen|Teldryn|Seraphine|REDACTED|Lawrence)\b')
d2=json.load(open(DATA,encoding="utf-8"))
def f2(t):
    for cat,cd in d2.items():
        for it in cd.get("items",[]):
            if it.get("title")==t: return it
        for arr in (cd.get("subcategories") or {}).values():
            for it in arr:
                if it.get("title")==t: return it
bad=[]
for t in SOV+LOC:
    it=f2(t)
    n=len(NAMES.findall(it["content"]))
    if n: bad.append(f"{t}({n})")
print("\n".join(log))
print("\nentries still with old-party names:", bad if bad else "NONE")
print("valid JSON:", bool(d2))
if os.path.exists("_res.txt"): os.remove("_res.txt")
