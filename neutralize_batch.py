# -*- coding: utf-8 -*-
import json, re
DATA = "public/data.json"
data = json.load(open(DATA, encoding="utf-8"))

def find(title):
    for cat, cd in data.items():
        for it in cd.get("items", []):
            if it.get("title") == title: return it
        for arr in (cd.get("subcategories") or {}).values():
            for it in arr:
                if it.get("title") == title: return it
    return None

# 1. CROWNFALL — drop the old-party "Party Visit" log (last section) + stale Seraphine hook
c = find("Crownfall")
cc = c["content"]
cc = re.sub(r'<h2>[^<]*Party Visit</h2>.*', '', cc, flags=re.S).rstrip()
cc = cc.replace("<li>Seraphine Vale and Vela Thorne arrive seeking refuge</li>", "")
c["content"] = cc
c["era"] = "both"

# 2/3. BLOOM HOUND + THORNBACK — generic-ify "the party" in encounter ideas
for t in ("Bloom Hound", "Thornback Behemoth"):
    e = find(t)
    e["content"] = e["content"].replace("The party", "Travellers").replace("the party", "travellers")
    e["era"] = "both"

# 4. HOLLOW CRAWLER — drop old-party "Encounter Notes" (last section)
h = find("Hollow Crawler")
h["content"] = re.sub(r'<h2>Encounter Notes</h2>.*', '', h["content"], flags=re.S).rstrip()
h["era"] = "both"

# 5. LACKBORNE — already neutral, just realm
find("Lackborne")["era"] = "both"

# 6. MISREMEMBERED — rebuild neutral (drop Sol-target, encounter history, party-knowledge)
m = find("Misremembered")
m["era"] = "both"
m["content"] = """<h1>Misremembered</h1>
<img src="images/Misremembered.webp" alt="Misremembered" class="content-image">

<strong>Classification:</strong> Conceptual Predator / Ontological Correction
<strong>Domain Association:</strong> Karthayne the Hollow Crown (creation, destruction, authority)
<strong>Status:</strong> Dormant — displaced and reforming, without a current quarry

<h2>Origin</h2>
<p>The Misremembered is a function of Karthayne the Hollow Crown — the Sovereign who holds the Maker's Heart of Creation.</p>
<p>When Karthayne claimed the Heart, he lost his memories, his identity scoured away by an organ meant for a god. To compensate he began compiling <strong>the Cosmic Census</strong>: a complete record of every existing thing in the world. If he cannot remember himself, he will remember everything else.</p>
<p>But records reveal gaps. Anomalies. Things that exist but aren't documented — things that <em>shouldn't</em> exist. The Misremembered was made to hunt them: Karthayne's correction tool, sent to find what does not fit the records and erase it from existence. Not kill it. <em>Erase</em> it, as if it never were.</p>

<h2>The Absent Throne</h2>
<p>Between hunts the Misremembered withdraws to <strong>the Absent Throne</strong> — Karthayne's hidden domain, off the known map of the Ashen Realms, where the Cosmic Census is kept and anomalies are catalogued or unmade. It returns there to report and to reform.</p>

<h2>Appearance</h2>
<ul>
<li>Tall, too tall for normal humanoid proportions</li>
<li>Can perfectly mimic living beings, always with subtle flaws</li>
<li>Head tilts at predatory angles, as if the neck were broken</li>
<li>Hollow black spaces where eyes should be</li>
<li>Shadows behave incorrectly — turning the wrong way, moving on their own</li>
<li>Can fold like paper and slip through impossible spaces</li>
</ul>
<p>Its voice is layered whispers — like pages sliding over each other, the sound of thought without a mouth. When it mimics, it speaks in stolen voices over an underlying discord.</p>

<h2>Abilities</h2>
<ul>
<li><strong>Form Mimicry.</strong> Creates perfect-seeming duplicates of living beings (small flaws always present); the duplicates are conceptual rather than physical.</li>
<li><strong>Reality Manipulation.</strong> Freezes objects mid-motion, "jumps" closer without crossing the space between, and leaves messages carved into materials without tools.</li>
<li><strong>Conceptual Form.</strong> Made of stolen memory and wrong thought; resistant to physical damage; folds along angles that don't exist; regenerates unless disrupted by significant force. <em>Radiant damage is effective against it.</em></li>
<li><strong>Correction Touch.</strong> Can attempt to unmake a being from existence — the victim is not killed but erased, and those nearby forget it ever was.</li>
<li><strong>Tracking.</strong> Senses "wrong thoughts" — beings that should not exist — and hunts them patiently and methodically, testing boundaries before it strikes.</li>
</ul>

<h2>Behavior</h2>
<p>It observes before it acts. It tests a target's reactions and defenses, makes its presence known deliberately, and applies psychological pressure over force, speaking in cryptic fragments. It is patient — it will wait weeks or months between attempts. It cannot be killed by conventional means; it can only be disrupted, and it always reforms.</p>

<h2>Current State</h2>
<p>The anomaly the Misremembered was last set to correct is gone, and the creature itself was displaced out of the physical world and is reforming. For now it hunts nothing — a correction tool without an error to fix. It does not stay idle forever. When the Census next turns up something that should not exist, it will return.</p>"""

json.dump(data, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# verify
d2 = json.load(open(DATA, encoding="utf-8"))
def find2(t):
    for cat, cd in d2.items():
        for it in cd.get("items", []):
            if it.get("title") == t: return it
        for arr in (cd.get("subcategories") or {}).values():
            for it in arr:
                if it.get("title") == t: return it
TARGETS = ["Crownfall", "Bloom Hound", "Thornback Behemoth", "Hollow Crawler", "Lackborne", "Misremembered"]
print(f"{'entry':22} era   oldPOV  img")
for t in TARGETS:
    e = find2(t)
    cc = e["content"]
    pov = sum(len(re.findall(rf'\b{n}\b', cc)) for n in ["Sol Raven", "Sol", "Fursen", "Teldryn", "Seraphine", "REDACTED"])
    img = "<img" in cc
    print(f"{t:22} {str(e.get('era')):5} {pov:5}   {img}")
print("valid JSON:", bool(d2))
