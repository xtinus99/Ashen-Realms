# -*- coding: utf-8 -*-
import json, re
DATA="public/data.json"; d=json.load(open(DATA,encoding="utf-8"))

def find(t):
    for cat,cd in d.items():
        for it in cd.get("items",[]):
            if it.get("title")==t: return it
        for arr in (cd.get("subcategories") or {}).values():
            for it in arr:
                if it.get("title")==t: return it
    return None

def oldpov(s):
    return sum(len(re.findall(rf'\b{n}\b',s)) for n in ["Sol Raven","Fursen","Teldryn","Seraphine","REDACTED","Lawrence"]) + len(re.findall(r'\bSol\b',s))

# section headers that mark a pure old-party log -> drop the whole <h2> section
DROP = re.compile(r'(What the Party Knows|Party History|Party Experience|Party Events|Party Lodging|'
                  r'Party Visit|Party Interaction|Party Connection|Party Members|Fursen|Vorath Encounter|'
                  r'Encounter History|Encounter Notes|Key Moments|Notable Events)', re.I)

SOV=[it["title"] for it in d["Sovereigns"]["items"]]
LOC=["Veinspire","The Basilica of the Unincarnate","The Resolve","Ashford","The Dregs",
     "Lesser Sacral District","Slavers' Hollow","The Velvet Thorn","The Silken Refuge",
     "The Docent's Archive","Dusthollow","The Broken Antler","The Reach"]

report=[]
for title in SOV+LOC:
    it=find(title)
    if not it: report.append(f"?? {title} not found"); continue
    c=it["content"]
    parts=re.split(r'(?=<h2>)', c)
    head=parts[0]; secs=parts[1:]
    kept=[]; dropped=[]
    for s in secs:
        hm=re.match(r'<h2>(.*?)</h2>', s)
        h=hm.group(1) if hm else ""
        if hm and DROP.search(h) and oldpov(s)>=1:
            dropped.append(h.strip())
        else:
            kept.append(s)
    it["content"]=(head+"".join(kept)).rstrip()
    it["era"]="both"
    report.append(f"{title}: era=both | dropped: {dropped if dropped else '(none)'}")

json.dump(d,open(DATA,"w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("\n".join(report))
print("\nvalid JSON:", bool(json.load(open(DATA,encoding="utf-8"))))
