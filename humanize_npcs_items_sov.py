"""Humanize Sovereigns (Aral-Vyn, Kaedris), NPCs (Galheran, Velara), Items (Vigil, Passion-Seed)."""
import json

PATH = r"C:\Users\khali\Documents\DND Campaign\player-site\public\data.json"


ARAL_VYN = '''<h1>ARAL-VYN THE BLADED SAINT</h1>

<img src="images/Aral-Vyn the Bladed Saint.webp" alt="Aral-Vyn the Bladed Saint" style="max-width: 300px; float: right; margin: 0 0 1rem 1rem; border-radius: 8px;">

<strong>The Sovereign of Blades and Sacrifice</strong>

<strong>Domain:</strong> The Crucible of Flesh

<h2>What the Party Knows</h2>

<h3>Teldryn's Pact — Severed</h3>

<p>The party's connection to Aral-Vyn was Teldryn, a Shadar-kai Hexblade Warlock who walked into the Crucible without a face and walked out with a sculpted one and a pact. That connection ended in Session 36.</p>

<p>In the antechamber of an Aedwynn figment beneath the Basilica of the Unincarnate, Teldryn knelt and renounced his Sovereign aloud. The figment confirmed the pact was already severed. Teldryn peeled the grafted face off with his own hands; the original Shadar-kai face beneath was restored. The Annual Correction is cancelled forever, and Excision and Sinew Wrought no longer answer.</p>

<p>Teldryn is now bound to Aedwynn the Maker. The Crucible has lost its pact-bearer.</p>

<h3>The Docent's Research</h3>

<p>Teldryn purchased two Aral-Vyn texts from the Docent in Crownfall, paying with the experience of losing one's face:</p>

<ul>
<li><strong>The Pilgrim's Account.</strong> Year-by-year progression of a pact-bearer. Year one: the blade becomes a sensory extension. Year two: first correction, fear removed. Year three: blade hums near altered flesh. Year five: Sculptor's Reach.</li>
<li><strong>The Surgeon's Correspondence.</strong> Resonance channels. Geometric patterns inscribed in flesh with the patron's blade, self-cut at precise depth, pain used as signal. Direct communication with Aral-Vyn. The surgeon who wrote it vanished a fortnight after achieving resonance.</li>
</ul>

<h3>What This Costs</h3>

<p>What Aral-Vyn does about a renounced pact-bearer is unknown. Teldryn was warned that Remnant Resurrection on the Hollow's road carried retribution risk and refused that gamble. Renouncing a Sovereign on Aedwynn-consecrated ground may carry a different weight. The party left the Basilica without an answer.</p>'''


KAEDRIS = '''<h1>KAEDRIS THE CRIMSON MATRON</h1>

<img src="images/Kaedris the Crimson Matron.webp" alt="Kaedris the Crimson Matron" style="max-width: 300px; float: right; margin: 0 0 1rem 1rem; border-radius: 8px;">

<strong>The Sovereign of Passion and Heat</strong>

<strong>Domain:</strong> Bastion of Fireblood

<h2>What the Party Knows</h2>

<h3>Direct Confrontation</h3>

<p>An Ember Avatar — a portion of Kaedris given form — descended on the party near the Bastion's border. She had felt the Passion-Seed Sol carried, the original cutting from Aedwynn's Left Heart.</p>

<blockquote><em>"I felt something of mine. Moving through my borders. You carry the seed. The first cutting. My template. Give it to me, little bone-man. Return what was taken. And I will let your companions live."</em></blockquote>

<h3>Sol's Defiance</h3>

<p>Sol refused to surrender the seed and told her it belonged to Aedwynn. Kaedris was furious. She claimed she had loved the Maker more than any of the Thirteen, and had taken Aedwynn's heart because she could not bear to see it divided among those who didn't understand.</p>

<blockquote><em>"I LOVED Her! I loved Her more than any of the Thirteen! I took Her heart because I could not BEAR to see it divided among those who did not understand! Two thousand years I have carried Her passion!"</em></blockquote>

<h3>The Battle</h3>

<p>The party fought and defeated the Avatar. Lawrence landed the killing blow. As the Avatar collapsed, Kaedris spoke through it:</p>

<blockquote><em>"This is not over, bone-man. I am everywhere passion burns. I will be watching. And when you fail — when the seed corrupts you as it corrupts all who carry it — I will be there to take back what is mine."</em></blockquote>

<h3>The Seed Returned</h3>

<p>In Session 36, beneath the Basilica of the Unincarnate, Sol returned the seed to a living figment of Aedwynn. The cutting was accepted back into the Maker. Sol no longer carries it. Whatever channel Kaedris was using to track the seed through his bones is no longer there for her to listen on.</p>

<h3>Current Threat Level</h3>

<p>Surveillance via the seed is over. Kaedris named herself "everywhere passion burns" and the party should not assume distance equals safety; watching is not the same as carrying. What she does next is unknown.</p>'''


KARTHAYNE = '''<h1>KARTHAYNE THE HOLLOW CROWN</h1>

<strong>The Sovereign of Creation and Erasure</strong>

<strong>Domain:</strong> The Absent Throne (off any known map)

<h2>What the Party Knows</h2>

<h3>Through the Absent Pride</h3>

<p>Two thousand years ago, sixty Leonin fled into Karthayne's Void to escape Imhuran's net. They survived. They are still there: about two hundred and fifty of them now, in a settlement called <strong>Kel'vahr</strong>. The Void stains everything. Their fur shifts to violet over the years and the children born in the Void come out purple. Karthayne could have unmade the entire population with a thought, and has not. He watches.</p>

<p>Fursen spent seven weeks in Kel'vahr in Sessions 31–32. He trained under Yira Duskmane, hunted with Tharren Voidclaw, and spoke his name at the Assertion. He came back with two Void techniques and purple at the tips of his fur. He saw nothing of Karthayne directly. The Pride does not pretend to understand why he allows them to exist.</p>

<h3>Through the Misremembered</h3>

<p>The Misremembered is Karthayne's correction tool, a creature sent to find anomalies and erase them from existence. It has appeared three times to hunt Sol Raven, who registers in Karthayne's records as a wrong thought — a being connected to a god who died before Karthayne ever held the Heart of Creation. The party drove it back the first two times. The third time, Ashka Voidmane seized it bare-handed and dragged it through a tear into the Void. Whatever happened on the other side, it has not returned yet.</p>

<h3>What This Means</h3>

<p>Karthayne is not actively hunting Sol. To him, Sol is too small to matter, and the Misremembered was deemed sufficient to handle the problem. If Sol becomes important enough to register on a Sovereign's scale, that may change.</p>

<p>The party has no other contact with him. They have not seen the Absent Throne. They have not been spoken to. They know Karthayne through what he allows and what he sends, and nothing more.</p>'''


GALHERAN = '''<h1>Galheran, the Unmoved</h1>

<div class="npc-portrait"><img src="images/Galheran.webp" alt="Galheran the Unmoved"></div>
<p><strong>Role:</strong> Knight-protector of Aedwynn the Maker (pre-Usurpation) | <strong>Location:</strong> The Basilica of the Unincarnate, antechamber to the Maker's chamber | <strong>Status:</strong> Active at his post</p>

<h2>Who He Is</h2>

<p>Galheran was Aedwynn's knight-protector — her shield and her shadow, one of about twenty mortals in the Maker's innermost circle. He served from a loyalty so absolute it became the defining fact of his existence. When the Thirteen approached him with their plan, he refused without argument, and they killed him for it.</p>

<p>He was the first casualty of the Usurpation, killed before the act itself, silenced because his refusal was a threat to their conviction more than to their power. A man who looked at the chance to become a god and said no made the others wonder whether they should be saying yes.</p>

<p>Aedwynn buried him in the days she had left. She placed his weapons in his hands, closed the stone coffin, and laid him at the foot of the doors that led to her own hidden chamber. She did not bind him with magic. She did not tell him to stand watch. She knew what he was.</p>

<h2>Appearance</h2>

<p>Six and a half feet tall, broad-shouldered, desiccated but intact, preserved by the same ambient divine energy that saturates the Basilica. Dark leathered skin drawn tight over heavy bone. Faint points of pale gold light in the eye sockets when he wakes.</p>

<p>His armour is plate that predates any Sovereign-era craft, not forged but <em>shaped</em>. Dark gunmetal with a faint blue-black sheen, completely seamless where it joins. No sigil, no house, no banner. Just the armour of a man who served one person and needed nothing else to say so. The metal has fused partially with his body over millennia.</p>

<p>He carries two weapons: the longsword <strong>Dawn's Edge</strong>, straight-bladed and single-edged with a guard shaped like folded wings; and the staff <strong>The Vigil</strong>, pale wood threaded with veins of dull gold. Both impossibly intact.</p>

<h2>What the Party Saw</h2>

<p>Below the Basilica's nave, past the flooded crypt and a narrower stair, the party found a long rectangular chamber the jungle had refused to enter. A stone sarcophagus stood on a raised plinth. Beyond it, a pair of double doors carved with a single symbol.</p>

<p>The party opened the lid. Galheran lay inside with both weapons in his hands. Teldryn tried to lift Dawn's Edge. The hand wouldn't release. He tried again with his pact-bond.</p>

<p>The eye-lights opened.</p>

<p>What followed was not a fight Teldryn could win. Galheran rose, put him on the flagstone in seconds, and called him <em>"Bastard... Dog of Valdyrian... USURPER!"</em> Fursen ran for the stairs. Sol stayed.</p>

<p>Sol stepped between the knight and Teldryn's body and tried to reason with him. It didn't work. He tried again, this time opening the Witness power directly so the Maker's signature came up through his ribs and into the chamber. Galheran stopped. The eye-lights changed. Sword and staff lowered.</p>

<p>Sol showed him the seed and the figment of Aedwynn waiting beyond the doors. Galheran accepted the mission, but only for Sol. The hatred for Teldryn stayed where it was. He spat the word <em>"Powerless dog"</em> at him and let him leave anyway.</p>

<h2>The Vigil</h2>

<p>After Sol communed with the figment and came back out, Galheran was still where he had been. Sol carried something out of the chamber for him: not a message exactly, but the figment's attention given face-to-face through a fragment of herself.</p>

<p>Galheran's eye-lights flared. He bowed. When the lights opened again there was moisture in the sockets. The hatred stayed; the watch felt less alone.</p>

<p>Then he stepped out of his post — first time in two thousand years — and crossed to Sol. He extended <strong>The Vigil</strong>, the keeping-half of his vocabulary, and spoke without rage:</p>

<blockquote><em>"Your future seems brighter than mine."</em></blockquote>

<p>Sol accepted. Galheran kept Dawn's Edge and returned to his post.</p>

<h2>Behaviour</h2>

<p>Galheran speaks rarely. When he does it costs him; the desiccated body has no proper apparatus for it, and the words come through anyway. He doesn't roar or taunt. Most of the sounds he makes are armour scrape and joints in motion. Speech is reserved for moments that demand it.</p>

<p>He doesn't pursue and he doesn't hunt. He stands in front of the doors. Whatever comes through him to reach the Maker's chamber answers to him for what it is. The duty is the door.</p>

<h2>Lore</h2>

<h3>Before the Usurpation</h3>

<p>Galheran was not the strongest of Aedwynn's circle. Not the wisest, not the most gifted, not the most ambitious. He was the most constant. Where others debated the nature of divinity or pursued their own understanding of the power they had been given, Galheran simply served. He stood where he was told to stand. He did not ask why.</p>

<p>The Thirteen expected him to be persuadable. A soldier follows orders, and they intended to give him new ones. He said no. Not with argument. Not with theology. Just <em>no</em>.</p>

<p>Aral-Vyn and Vortegas killed him for it. Aedwynn buried him with both weapons still in his hands, which is how the rest of the world knows he fought.</p>

<h3>The Burial</h3>

<p>Aedwynn laid him in the lower chamber of the Basilica, the church that had been built to honour her. She placed his weapons in his hands, closed the coffin, and left him before the double doors that lead to her own hidden chamber. She knew what he was.</p>

<p>Two thousand years on, the jungle has swallowed the Basilica. Creatures nest in the nave. Vines push through the stonework. Roots crack the floor. Nothing has touched the coffin and nothing has opened the double doors. The creatures of the Basilica gave the lower chamber a wide berth — they could feel something down there that had been still for longer than their species had existed.</p>

<p>The figment of Aedwynn beneath the nave has been with him for the whole watch and for the two thousand years before it. She has not tried to take his hatred from him. What Aral-Vyn and Vortegas did is not the kind of grievance she would ask anyone to give up.</p>

<h2>Quotes</h2>

<blockquote><em>"Bastard... Dog of Valdyrian... USURPER!"</em></blockquote>

<blockquote><em>"Powerless dog."</em></blockquote>

<blockquote><em>"Your future seems brighter than mine."</em></blockquote>'''


VELARA = '''<h1>Velara Ashyn</h1>

<div class="npc-portrait">
<img src="images/Velara Ashyn.webp" alt="Velara Ashyn">
</div>

<h2>Overview</h2>

<p>Velara Ashyn was Kaedris's consort and lover. She stole the original Passion-Seed to keep Kaedris from burning the world with it, and was killed by a burning emissary in the Unclaimed shortly afterwards. Her soul was anchored in an amulet recovered by the party in the Bone Field. After five hundred years of waiting in tarnished metal, she was released into Aedwynn's tree at the Basilica of the Unincarnate in Session 36.</p>

<h2>Status — At Rest</h2>

<p>The figment of Aedwynn beneath the Basilica called Velara by name. Velara stepped out of the amulet on her own, crossed the chamber, and walked into the Maker's tree. She did not say goodbye to the party. The amulet is empty now; the metal is still cold to the touch but there is no heartbeat in it.</p>

<h2>Appearance (in life, and in the amulet)</h2>

<p>Her body was long dead. Her soul persisted in the Soul Anchor Amulet — dull metal, tarnished green, that pulsed with a heartbeat rhythm and grew cold near the Bastion's influence.</p>

<h2>Background</h2>

<h3>Kaedris's Consort</h3>

<p>Velara lived in the Heartspire at the centre of the Bastion of Fireblood. She loved Kaedris, and Kaedris loved her as much as something like the Sovereign of Passion can love. Eventually Velara saw what Kaedris was becoming.</p>

<h3>The Theft</h3>

<p>Kaedris had found a way to amplify her power — to make the world feel as she did. She had begun breeding <strong>passion-seeds</strong>, fragments of concentrated emotion harvested from Aedwynn's heart. Velara stole the original, the one Kaedris had cut from the Maker's heart with her own hands. Without the original, the others were echoes. With it, Kaedris could finish what she had started.</p>

<p>Velara ran. Five hundred years ago.</p>

<h3>The Flight</h3>

<p>She hired the <strong>Morrow Trading Company</strong> to take her far from the Bastion. Kaedris sent something after her — a shape in the heat shimmer, beautiful and burning, leaving glass in the dirt where her feet fell. The figure caught the caravan in the Unclaimed. Everyone burned from the inside out. Velara was already dead when the burning woman arrived. The amulet preserved her consciousness.</p>

<p>She watched the caravan rot for five centuries.</p>

<h2>Relationship with Sol</h2>

<p>Sol Raven found her in the Bone Field and carried her amulet from there to the Basilica. He communed with her, learned her history, agreed to take her to the Docent's Archive, and ultimately carried her past the Docent's neutral ground to the Maker who could finish what she had started.</p>

<p>She thanked him without words.</p>

<h2>Key Moments</h2>

<ul>
<li>Stole the original Passion-Seed from Kaedris and fled the Bastion (~500 years ago)</li>
<li>Killed in the Unclaimed by Kaedris's burning emissary; soul preserved in the amulet</li>
<li>Found in the Bone Field; communed with Sol</li>
<li>Carried to Crownfall, consulted the Docent, refused to be returned to the Bastion</li>
<li>Travelled with the party west through the Left Hand</li>
<li>Released into Aedwynn's tree at the Basilica of the Unincarnate, 13th of Hathren, 2,831 AS</li>
</ul>'''


VIGIL = '''<h1>The Vigil</h1>

<img src="images/The Vigil.webp" alt="The Vigil" class="content-image" style="max-width: 400px;">

<p><strong>Type:</strong> Legendary Quarterstaff / Divine Focus (requires attunement) | <strong>Bearer:</strong> Sol Raven | <strong>Source:</strong> Galheran the Unmoved (Session 36)</p>

<h2>The Staff</h2>

<p>A staff of pale wood, five feet long, threaded with veins of dull gold. The wood is not heartwood, and not divine timber. It is something older than either, harder and denser, from a tree species that no longer exists. The grain runs straight and unbroken from end to end as though the staff was grown rather than carved. The gold veins are organic, fractal, and converge at the head into a lattice that does not glow on its own. The lattice warms to the touch when divine magic is nearby.</p>

<p>The staff is cool to the touch in the absence of divine magic, and warm in its presence. The warmth is the kind that comes from held wood that has been against another person's body. The Vigil remembers being carried. When swung it makes no sound. When grounded it does not click against stone — it settles.</p>

<h2>Origin</h2>

<p>The Vigil was forged by <strong>Aedwynn the Maker</strong> herself, before the Usurpation, as the second of two weapons given to her knight-protector <strong>Galheran</strong> the Unmoved. Where his sword <strong>Dawn's Edge</strong> was the instrument of stopping, The Vigil was the instrument of keeping — the conduit through which Aedwynn's blessing passed into protection, warding, and healing.</p>

<p>Galheran was not solely a swordsman. He was the Maker's steward of mercy in the field. Where a person had to be stopped, the sword answered. Where a person had to be kept — sheltered, healed, drawn back from the edge — the staff answered. The two weapons were a complete vocabulary.</p>

<p>Two thousand years after Galheran was killed, he gave The Vigil to Sol Raven and kept Dawn's Edge for himself. The keeping passed to the Witness; the ending stayed with the duty.</p>

<h2>Properties</h2>

<p><em>Quarterstaff, legendary (requires attunement by a creature aligned with Aedwynn the Maker's signature)</em></p>

<p><strong>+3 quarterstaff</strong> &nbsp; <strong>Damage:</strong> 1d6 + STR (versatile 1d8) &nbsp; <strong>Weight:</strong> 6 lbs</p>

<p>The Vigil functions as a <strong>spellcasting focus</strong> for divine magic. While attuned and using The Vigil as a focus, the wielder gains:</p>

<ul>
<li>+1 to the spell save DC of spells cast through the staff</li>
<li>+1 to spell attack rolls for spells cast through the staff</li>
</ul>

<h3>Maker's Conduit</h3>

<p>Spells cast through The Vigil that deal radiant damage deal an additional 1d6 radiant damage on a hit.</p>

<h3>Mass Cure Wounds (1/Long Rest)</h3>

<p>The wielder can cast <em>Mass Cure Wounds</em> at 5th level through the staff once per long rest. Healing is rolled as <strong>3d8 + 5</strong> (the staff's own divine charge — not modified by wielder stats). The dice roll maximum on each die when cast in the presence of an active fragment of the Maker (the Maker's Chamber, near the tree-figment, or when an Aedwynn-Born is within 30 ft.).</p>

<h3>Wall of Light (1/Long Rest)</h3>

<p>Cast <em>Wall of Light</em> through the staff once per long rest at 5th level. Fixed save DC 18. The wall's bright light extends to 90 ft. instead of 60, and creatures bearing Sovereign influence or void-touch take an additional 1d6 radiant damage when struck by its rays.</p>

<h3>Maker's Resonance</h3>

<p>The staff vibrates faintly in the presence of an Aedwynn-Born, the Witness, or any divine fragment of the Maker. The wielder knows the direction and rough proximity (within 60 ft.) of the nearest such fragment. This sense persists while attuned.</p>

<h3>Sovereign Disruption</h3>

<p>While holding The Vigil, the wielder has advantage on saving throws against Sovereign-aligned magic, Sovereign-forged abilities, and effects originating from any of the Thirteen or their direct vessels.</p>

<h2>Attunement Restrictions</h2>

<p>The Vigil cannot be attuned by any creature bearing a Sovereign pact, brand, or Sovereign-forged modification, by any creature with active void-touch, or by any creature whose primary patron, deity, or god-binding belongs to a Sovereign.</p>

<p>It can be attuned by Aedwynn-Born, the Witness, or any creature granted explicit acknowledgement by an active fragment of Aedwynn. A creature attempting to attune without meeting these conditions takes 5d10 radiant damage at the end of each long rest of the attempted attunement period and gains no benefit. The staff rejects hands that should not hold it.</p>

<h2>Companion Weapon</h2>

<p>The Vigil is paired with <strong>Dawn's Edge</strong>, Galheran's sword. The two weapons were forged as a set. The Vigil alone is the staff of keeping; the sword alone is the blade of ending. Together they were the Unmoved.</p>

<h2>Current Status</h2>

<p>Held by Sol Raven, accepted from Galheran in the antechamber of the Maker's Chamber on the 13th of Hathren, 2,831 AS. Galheran's words on the handover: <em>"Your future seems brighter than mine."</em></p>

<blockquote>
<p><em>"The sword was for the people who deserved stopping. The staff was for the people who deserved keeping. He carried both because the duty required both, and he never once put either of them down."</em></p>
</blockquote>'''


PASSION_SEED = '''<h1>The Passion-Seed</h1>

<img src="images/The Passion-Seed.webp" alt="The Passion-Seed" class="content-image">

<p><strong>Type:</strong> Divine Fragment | <strong>Status:</strong> Returned to Aedwynn</p>

<h2>Status — Returned</h2>

<p>In Session 36, beneath the Basilica of the Unincarnate, Sol Raven returned the seed to a living figment of Aedwynn the Maker. The figment accepted the cutting back into herself. The seed is no longer in the world as a separate object. The cord at Sol's hip is empty.</p>

<h2>What It Was</h2>

<p>A black stone darker than obsidian, warm to the touch, that seemed to deny light around it. It pulsed with heat that resonated with intense emotion. This was the original passion-seed: a fragment of concentrated passion crystallised from Aedwynn's heart. Kaedris cut it from the Maker's heart with her own hands during the Usurpation.</p>

<h2>Danger (in transit)</h2>

<p>While Sol carried it, the rules were:</p>
<ul>
<li>Kaedris could perceive its location through anyone whose passion ran high near it</li>
<li>Strong emotion in its presence amplified — Velara's warning was <em>"Don't feel strongly near it"</em></li>
<li>It could not be destroyed by fire, blade, or magic. Velara had tried for centuries</li>
<li>It resonated with the Bleeding Blade when both were near each other</li>
</ul>

<h2>Why It Was Carried, Not Destroyed</h2>

<p>Sister Varen told Sol the seed had to be purified, not unmade. Returned to the Maker, not erased. The Docent and Velara both confirmed it could not be ended by conventional means. The destination was somewhere in the Hand region. The party did not know exactly where until they found it.</p>

<h2>Resolution</h2>

<p>The Basilica of the Unincarnate, deep in the Left Hand jungle, contains a living figment of Aedwynn beneath the nave. The figment recognised Sol as <em>Witness, Aedwynn-Born</em> and called the seed back. Sol opened the cord, the seed warmed once, and the figment took it. The work is finished.</p>

<p>Kaedris no longer has anything to track through Sol's bones. What she does about that is her own business.</p>'''


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    for i, p in enumerate(data["Sovereigns"]["items"]):
        if p["id"] == "aral-vyn-the-bladed-saint":
            data["Sovereigns"]["items"][i]["content"] = ARAL_VYN
            print("Aral-Vyn: humanized")
        elif p["id"] == "kaedris-the-crimson-matron":
            data["Sovereigns"]["items"][i]["content"] = KAEDRIS
            print("Kaedris: humanized")
        elif p["id"] == "karthayne-the-hollow-crown":
            data["Sovereigns"]["items"][i]["content"] = KARTHAYNE
            print("Karthayne: humanized")

    for i, p in enumerate(data["NPCs"]["items"]):
        if p["id"] == "galheran":
            data["NPCs"]["items"][i]["content"] = GALHERAN
            print("Galheran: humanized")
        elif p["id"] == "velara-ashyn":
            data["NPCs"]["items"][i]["content"] = VELARA
            print("Velara: humanized")

    for i, p in enumerate(data["Items"]["items"]):
        if p["id"] == "the-vigil":
            data["Items"]["items"][i]["content"] = VIGIL
            print("The Vigil: humanized")
        elif p["id"] == "passion-seed":
            data["Items"]["items"][i]["content"] = PASSION_SEED
            print("Passion-Seed: humanized")

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Saved.")


if __name__ == "__main__":
    main()
