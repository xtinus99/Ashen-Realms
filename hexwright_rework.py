# -*- coding: utf-8 -*-
import json, os
from PIL import Image

VDIR = r"C:\Users\khali\Documents\DND Campaign\DND Campaign\11 - Dungeons\Hexwright's Tower"
OUT = "public/images"

# convert tower exterior + floor images 6-15
for stem in ["Hexwright's Tower"] + [f"Floor {n}" for n in range(6, 16)]:
    p = os.path.join(VDIR, stem + ".png")
    if os.path.exists(p):
        Image.open(p).convert("RGB").save(os.path.join(OUT, stem + ".webp"), "WEBP", quality=85, method=6)

CONTENT = """<h1>The Hexwright's Tower</h1>

<img src="images/Hexwright's Tower.webp" alt="The Hexwright's Tower" class="content-image">

<p><strong>Type:</strong> Fallen spire (dimensional catastrophe) | <strong>Region:</strong> The Unclaimed, west of the Reach | <strong>Status:</strong> Grounded derelict — the tower nobody returns from</p>

<h2>What It Is</h2>
<p>A twisted spire that violates every principle of architecture and physics. Magister <strong>Valdron Grimhex</strong> was an artificer of vast ambition who believed he could bind fragments of many Sovereigns' stolen aspects into a single focal tower, channelling divine power from a dozen of the Thirteen at once while serving none of them.</p>
<p>He was catastrophically wrong.</p>
<p>When Valdron lit his <strong>Aspect Convergence Engine</strong>, the competing divine influences tore reality apart in layers around the structure. Each floor came to sit inside a different Sovereign's aspect, overlapping and bleeding through in impossible ways, and the whole tower tore free of the ground and rose into the air. It hung over the western Unclaimed for years, cycling through Sovereign energies, reality-storms sweeping its floors — gravity reversals, architectural mutations, stairs that lead somewhere different depending on which aspect holds sway. Most who went in did not come out.</p>

<h2>The Fall</h2>
<p>The tower floated for years, then came down. Whatever held it aloft — the Convergence Engine at its apex — was destroyed, and the spire dropped out of the air to the ground in a single thunderclap that carried for miles. It has not moved since. It sits grounded and derelict on the western Unclaimed, west of the Reach, and people keep well clear of it. By every account that reaches Crownfall, it is the tower nobody returns from.</p>

<h2>What Walks It Now</h2>
<p>Something moves through the fallen tower: a tall, wrong-shouldered figure in ragged grey and blood, a corrupted blade fused to one hand, its head canted as if the neck were broken, laughing without end. It wanders the floors with no pattern anyone has charted, drawn toward sound and the presence of the living, and it kills whatever it finds. See <strong>The Thing in the Tower</strong>. A full expedition was lost climbing the spire before it fell — they reached as high as the devouring floor near its heart before the last of them was gone.</p>

<h2>The Floors</h2>
<p>Each floor sits inside a different Sovereign's aspect — not the Sovereign's true domain, but a hungry imitation Valdron's Engine shaped around their themes, each with its own warden. From the ground up:</p>

<h3>Floor 1 — The Anchor Chamber</h3>
<p>The entrance and the most stable ground in the structure, though cracked through with reality fissures. Valdron's workshop: containment circles and thirteen ritual focuses, one per Sovereign, once kept steady by a pair of stone-and-metal <strong>Reality Anchors</strong>. With the Anchors broken, the cracks have widened through the lower floors.</p>

<h3>Floor 2 — The Ossuary (Vortegas's aspect)</h3>
<p>A cathedral of bone — every surface fused human and divine bone, polished and load-bearing — built and rebuilt by a <strong>Bone Architect</strong> of articulated marrow and stained ivory.</p>

<h3>Floor 3 — The Vein Cathedral (Mareatha's aspect)</h3>
<p>Once a flooded sanctuary of veins and warm blood-light, its walls pulsing to a heart that was not in the building, watched by a <strong>Pulse Warden</strong> of bound vascular tissue. It is bare stone now — the thing that walks the tower ate the one floor made entirely of blood and stayed hungry.</p>

<h3>Floor 4 — The Crucible of Sinew (Aral-Vyn's aspect)</h3>
<p>A surgical theatre of fused muscle and tendon, held together by something that knows anatomy too well: the <strong>Chirurgeon</strong>.</p>

<h3>Floor 5 — The Breathless Heights (Azerach's aspect)</h3>
<p>A vast chamber with no visible walls, no air, no sound — defended by the <strong>Windless Void</strong>, a guardian of pressure and silence with no body of its own.</p>

<h3>Floor 6 — The Forge of Passions (Kaedris's aspect)</h3>
<img src="images/Floor 6.webp" alt="Floor 6 — The Forge of Passions" class="content-image">
<p>A foundry lit by a heart-shaped fire above the central anvil — the <strong>Heart-Flame</strong>, a portion of bound passion given burning shape.</p>

<h3>Floor 7 — The Blooming Rot (Talaris's aspect)</h3>
<img src="images/Floor 7.webp" alt="Floor 7 — The Blooming Rot" class="content-image">
<p>A composting cathedral, floor and walls thick with fungal growth turning over with each minute, presided over by a <strong>Compost Sovereign</strong> and its rooted fungal dead.</p>

<h3>Floor 8 — The Shattered Gravitas (Eredain's aspect)</h3>
<img src="images/Floor 8.webp" alt="Floor 8 — The Shattered Gravitas" class="content-image">
<p>A vaulted hall of suspended chains and broken acoustics, held by a <strong>Resonant Knight</strong> of harmonised chain and glass and its chain-bound singers.</p>

<h3>Floor 9 — The Preservation Hall (Imhuran's aspect)</h3>
<img src="images/Floor 9.webp" alt="Floor 9 — The Preservation Hall" class="content-image">
<p>A chamber out of time, kept by a <strong>Preservation Custodian</strong> and fragments of stolen hours that age whatever they touch.</p>

<h3>Floor 10 — The Cognition Library (Ismara's aspect)</h3>
<img src="images/Floor 10.webp" alt="Floor 10 — The Cognition Library" class="content-image">
<p>A slowly rotating library of cognition-books written in <strong>Brancalic</strong>, currents of blue-violet thought-light circling a central pedestal, driven by a <strong>Thought-Eater</strong> and its idea-worms.</p>

<h3>Floor 11 — The Mirror Labyrinth (Ultharion's aspect)</h3>
<img src="images/Floor 11.webp" alt="Floor 11 — The Mirror Labyrinth" class="content-image">
<p>A maze of mirrors held by a <strong>Hollow Reflection</strong> and its face-wearers — guardians that take the shape and the face of whoever enters.</p>

<h3>Floor 12 — The Maw of Meaning</h3>
<img src="images/Floor 12.webp" alt="Floor 12 — The Maw of Meaning" class="content-image">
<p>The devouring floor near the tower's heart: a vast hungry maw — <strong>the Consumer</strong> — that did not merely kill but unmade, digesting flesh, gear, and meaning alike. This is as high as the lost expedition reached. The Consumer is dead now, split open from the inside; what killed it is the thing that still walks the tower.</p>

<h3>Floor 13 — The Drowned Observatory (Nhalyra's aspect)</h3>
<img src="images/Floor 13.webp" alt="Floor 13 — The Drowned Observatory" class="content-image">
<p>A flooded hall of dreaming above the Maw, its instruments long drowned. Whatever kept it is gone — cleared by the horror during its endless wandering.</p>

<h3>Floors 14–15 — The Apex</h3>
<img src="images/Floor 14.webp" alt="The Apex — upper works" class="content-image">
<img src="images/Floor 15.webp" alt="The Apex — the Convergence Engine" class="content-image">
<p>The upper works and the apex, where the <strong>Convergence Engine</strong> ran and Magister Valdron was last trapped. Both are cleared now. When the Engine died, the tower fell.</p>

<h2>Environmental Features</h2>
<ul>
<li><strong>Dimensional Flux.</strong> Each floor sits inside a different Sovereign's aspect; reality shifts without warning as influences compete.</li>
<li><strong>Aspect Bleeding.</strong> Floors manifest the effects of their theme: bone architecture, forge heat, vascular pulse, breathless silence.</li>
<li><strong>Reality Storms.</strong> Gravity reversals, architectural mutations, and weather-like chaos sweep the structure.</li>
<li><strong>Navigation Chaos.</strong> Stairs may lead to different destinations depending on which aspect dominates at the moment of use.</li>
</ul>

<h2>Magister Valdron Grimhex</h2>
<p>The artificer who built the tower. He spent decades mapping the Sovereign domains and theorising about how their stolen aspects related, believing divine power ran on a spectrum from material to conceptual and that channelling it meant ascending through that spectrum. He was last known trapped at his own apex. Whether anything of him remains is unknown.</p>"""

data = json.load(open("public/data.json", encoding="utf-8"))
e = next(it for it in data["Locations"]["items"] if it["id"] == "the-hexwrights-tower")
e["content"] = CONTENT
e["era"] = "both"
data["Locations"]["items"]  # keep
json.dump(data, open("public/data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

import re
d2 = json.load(open("public/data.json", encoding="utf-8"))
e2 = next(it for it in d2["Locations"]["items"] if it["id"] == "the-hexwrights-tower")
imgs = re.findall(r'src="(images/[^"]+)"', e2["content"])
missing = [i for i in imgs if not os.path.exists(os.path.join("public", i))]
print("era:", e2.get("era"))
print("old-party tells (Sol/Fursen/Teldryn/'the party'):", sum(x in e2["content"] for x in ["Sol", "Fursen", "Teldryn", "the party"]))
print("floor images referenced:", len(imgs), "| missing files:", missing)
print("valid JSON:", bool(d2))
