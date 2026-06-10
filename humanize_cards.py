# -*- coding: utf-8 -*-
import json, re
DATA = "public/data.json"
data = json.load(open(DATA, encoding="utf-8"))
sr = next(x for x in data["Locations"]["subcategories"]["Crownfall"] if x["id"] == "the-silken-refuge")
content = sr["content"]

# (display-name, humanized description, humanized personality)
CARDS = [
("Mor",
 "A wiry goblin woman in her late twenties, sharp-eyed and faintly amused, with a thin scar across the bridge of her nose and a small bone hairpin in her cropped dark hair. She is an Ashford refugee who fled the burning city and was scooped up by Crownfall&rsquo;s slave market on her second day; Madame Veshra Coil bought and freed her on the third. She stays at the Refuge by choice.",
 "Biting humour in a Crownfall street-cadence with a goblin lilt, teasing without cruelty, with a soft spot for small-folk who rarely see one of their own in a place like this. She reads a person like a question she has already answered, will not talk about Ashford, and goes quiet when she is actually enjoying herself."),
("Veil",
 "An air genasi of apparent late twenties, with crystal-pale skin under the barest blue undertone, long white-silver hair that drifts upward and sideways even in still air, eyes the colour of a clear winter sky, and faint pale-blue patterns along her temples and collarbones like cloud-script. She was kept as a &ldquo;weather instrument&rdquo; in some Sovereign-adjacent court before Madame Veshra got her out of it; the precise how is left unspoken.",
 "Quiet, contemplative, half-otherworldly. She speaks in a soft voice the room seems to lean toward, and people who come to her wanting to feel rare tend to leave saying they were the rare thing."),
("Pella",
 "A half-orc woman in her early thirties, olive-green with warm umber undertones, lower tusks just past her lips, a broad jaw and a nose set crooked from old arena fights. Her dark hair is shaved at the sides and braided down the back, there are faint geometric scars across her brow, and her build is powerful in the way that is earned rather than for show. She was a Sprawl-pit arena slave who won her freedom on points, and when the house refused to honour it, Veshra bought her contract.",
 "Easy laugh, wary eyes, strong hands. She is the one for clients who want to be physically tested by someone who can actually do it, and she does not like being asked about the pit unless she brings it up herself."),
("Quill",
 "A kenku woman of indeterminate age, sleek matte-black feathers across her head and shoulders shading to deep grey at the chest, a sharp obsidian beak, bright black eyes, and a small bone token on a leather cord at her throat. She served in a temple in an Aethranox-touched ruin before it fell, then was sold to Crownfall as a curiosity. She speaks only in borrowed voices.",
 "She listens far more than she &ldquo;talks.&rdquo; Clients sometimes hear their own voices come back from her, or the voices of people they have lost; she promises neither, and the voices choose themselves. Veshra keeps anyone who would use the gift for cruelty away from her."),
("Sweet",
 "A dryad of apparent middle age and far older than that, her skin the warm pale-brown of stripped birchwood with a living grain at the temples and forearms, long deep-green hair like moss-tangled vine threaded with small leaves, and eyes the colour of new growth in dim wood. She was bonded to an old oak that was felled for a Drennan timber contract, and Veshra found her wandering the Sprawl barely solid.",
 "Sorrowful and welcoming at once, like someone holding the memory of a place she can no longer return to. Small white flowers bloom where her bare fingertips rest, and a potted oak sapling grafted from her old tree stands beside her bed."),
("Ashes",
 "A half-elf woman in her early twenties, pale with a faint warm undertone, lightly pointed ears, long ash-brown hair worn loose, and tired green-grey eyes. There is fine smoke-burn scarring across one cheekbone and the back of a hand, and an ink-stain on one finger that never quite scrubbed out. She was an apprentice scribe in Ashford before the burn took her family, was trafficked in her second week in Crownfall, and was freed by Veshra on a tip from the house.",
 "Introspective, sad-eyed, intelligent, the grief settled into a way of being. She is for clients who want a particular grief in the room with them, and she will read aloud from old books while they fall asleep, if asked. She will never talk about the burn."),
("Idris",
 "A hobgoblin man in his apparent thirties, burnished red-orange, with sharp canines at the lower lip, pointed ears, the steady dark eyes of someone military-trained, and black hair cut short and disciplined. Clean old battle-scars cross his jaw, brow, and one hand. He defected from a war-band and was nearly killed by his own for it, then washed up in Crownfall as a foreign curiosity, where Veshra outbid the buyer.",
 "Composed, attentive, kind beneath the discipline. He stands at parade-rest unless told otherwise and reads a new client in under thirty seconds. He is the one for structured play and formal protocol, and he will not lie about his war or pretend the scars are decoration."),
("Marigold",
 "A firbolg woman of apparent middle age, seven feet tall and broad-shouldered but soft, her skin pale lavender-grey with a faint moss-cast at the temples and forearms, a few tiny pale flowers tucked behind one large pointed ear, long pale-green hair tied loosely back, kind dark eyes, and small flat tusks at the corners of a soft mouth. She was a sacred forest-keeper from the eastern Unclaimed-edge, captured during a Selvik clearance survey.",
 "Open, kind, and patient, the sort of presence that makes a room feel safer just for being in it. She is for clients who want to feel small and held without being harmed, and she does not understand cruelty, asking careful questions whenever she meets it."),
("Aria",
 "A triton woman of apparent late twenties, pale blue-grey with darker oceanic mottling along the shoulders and ribs, delicate gill-marks below the jaw, fine fin-ridges along the forearms that catch the light like silver leaf, long damp kelp-dark hair streaked with aquamarine, and large luminous deep-water eyes with vertical-slit pupils. She was sold as an aquarium piece to a Veinspire collector, and Veshra found her dying in a saltwater tub.",
 "Tender and slightly distant, she watches a client the way someone watches a shoreline from offshore. She keeps the only tub-room in the house, for slow tactile evenings, and asks permission before touching, then asks again the second time."),
]

for name, desc, pers in CARDS:
    pat = re.compile(
        r'(<h3>' + re.escape(name) + r' \([^)]*\)</h3>\s*<div class="worker-description">)(.*?)(</div>\s*<p class="worker-personality">)(.*?)(</p>)',
        re.S)
    content, n = pat.subn(lambda m: m.group(1) + desc + m.group(3) + pers + m.group(5), content)
    assert n == 1, f"{name}: matched {n} (expected 1)"
    print(f"  humanized card: {name}")

sr["content"] = content
json.dump(data, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

d2 = json.load(open(DATA, encoding="utf-8"))
sr2 = next(x for x in d2["Locations"]["subcategories"]["Crownfall"] if x["id"] == "the-silken-refuge")
moji = sum(1 for ch in sr2["content"] if (0x80 <= ord(ch) <= 0x9F) or ch in "âÃ")
cards = sr2["content"].count('class="worker-card-container"')
print(f"\nworker cards still present: {cards} | mojibake: {moji} | content len: {len(sr2['content'])}")
