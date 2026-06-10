"""Humanize party entries (Sol, Fursen, Teldryn). Removes AI-pattern cadence:
em-dash stacking for rhythm, tricolons, parallelism beats, and the
"X. Y. Z." short-sentence stack used as a closer."""
import json

PATH = r"C:\Users\khali\Documents\DND Campaign\player-site\public\data.json"

SOL = '''<h1>Sol Raven</h1>

<div class="npc-portrait">
<img src="images/Sol Raven.webp" alt="Sol Raven">
</div>

<p><strong>Race:</strong> Skeleton (God-Woken) | <strong>Class:</strong> Sorcerer | <strong>Level:</strong> 14</p>

<h2>Who He Is</h2>
<p>Sol Raven is a skeleton animated by a shard of Aedwynn the Maker, the god the Thirteen killed to make the world. He has no flesh, no organs, and no memory of a life before the bones. He wears robes and a hood in public so that he can pass as something the living are willing to talk to.</p>

<p>He doesn't know who he was, how he died, or whether the thoughts in his skull belong to him at all.</p>

<h2>The Maker's Witness</h2>
<p>Beneath Veinspire, in a hidden chamber called the Chamber of the Final Breath, the party found a white-barked tree with veins of gold and Aedwynn's preserved body at its base. When they touched her, she stirred. She recognised the shard inside Sol's bones as her own, and Sol accepted the role of <strong>Witness</strong> — the Maker's heir, carrying her memory forward.</p>

<p>The role gave him access to memories of the world before the Usurpation, the ability to share those memories through touch, and the ability to make permanent objects from nothing. They are not Sovereign powers. They predate the Sovereigns.</p>

<h2>Aedwynn-Born</h2>
<p>The Witness role stopped being abstract beneath the Basilica. A figment of Aedwynn there recognised Sol by name, called him <em>Witness, Aedwynn-Born</em>, and accepted the Passion-Seed back into herself. Sol now carries a confirmed shard of the Maker's living essence, and the world bends slightly around that fact.</p>

<p><strong>Permanent gain:</strong> one free 5th-level spell slot per long rest, on top of his normal slots.</p>

<h2>The Vigil</h2>
<p>Galheran of the Unclaimed — the two-thousand-year-old knight who stands watch outside Aedwynn's chamber — stepped out of his post long enough to give Sol his staff. Not freely; with the expectation that it return to the duty when the work is done. <strong>The Vigil</strong> is a legendary quarterstaff of Aedwynn-light, attuned now to Sol. It is older than the Sovereigns and remembers the Maker's hand.</p>

<h2>Clockmaker's Touch</h2>
<p>During the 13-Hour Trial, Sol traded a personal memory for a temporal ability called <strong>Clockmaker's Touch</strong>. He's still learning what it can do.</p>

<h2>The Possibility Infection — Cured</h2>
<p>In the Concept Graveyard inside Vor'Kael's Throat, Sol opened the <strong>Door of Possibility</strong> and was infected with the lives he didn't live: every path not taken, whispering against the inside of his skull. Sister Varen burned the infection out of him in Crownfall. The whispers stopped. Disadvantage on Wisdom saves removed.</p>

<h2>Death and Return — Knuckle Pass</h2>
<p>A Ridge-Stalker dropped Sol on the bone path of the eastern Knuckle Pass and the party fled with him on Fursen's shoulder. Sol failed his death saves on a natural one during the retreat.</p>

<p>Teldryn refused to perform the resurrection. He had read enough about Remnant Resurrection to be unwilling to gamble on what came back. Fursen called the Absent Pride instead. Yira Duskmane answered in person and performed <em>ehn-varuu</em>, the old Leonin restoration rite that returns the body but takes a permanent toll on death saves.</p>

<p>Sol came back diminished. The figment beneath the Basilica cured the death-save penalty later that day. Ehn-varuu cannot be performed on him a second time.</p>

<h2>Key Moments</h2>
<ul>
<li>Hired as escort to Veinspire</li>
<li>Sensed divine resonance in the corrupted church catacombs</li>
<li>Ascended for the first time in a floating village on a river of blood</li>
<li>Traded a memory for Clockmaker's Touch during the 13-Hour Trial</li>
<li>Touched Aedwynn's body and became the Witness</li>
<li>Showed Talaris Bloomrend a vision of the Maker alive</li>
<li>Placed Mira's wedding ring on her finger in the Cave of Waiting</li>
<li>Retrieved the Remembrance Seal from the Throat's bile pools</li>
<li>Opened the Door of Possibility, later cured by Sister Varen</li>
<li>Communed with Velara Ashyn's soul in the amulet</li>
<li>Refused to surrender the seed to an Ember Avatar of Kaedris: <em>"It belongs to Aedwynn"</em></li>
<li>Showed Sorrow the sky for the first time and received Sorrow's Tear</li>
<li>Helped kill Cordwain Corbel in Warehouse 11; lost a finger to Corbel's bone saw</li>
<li>Climbed the Hexwright's Tower with the party, cleared Floors 1 through 7, retreated from Floor 8</li>
<li>Took the Cycle-Liver from the Compost Sovereign on Floor 7</li>
<li>Spotted a hooded figure 150 yards from camp on the road to the Reach. The figure raised a hand and walked away</li>
<li>Killed by a Ridge-Stalker on the bone path of the Knuckle Pass</li>
<li>Restored by ehn-varuu, performed by Yira Duskmane of the Absent Pride</li>
<li>Found the Basilica of the Unincarnate in the deep Left Hand</li>
<li>Read the five murals in the nave — Shaping, Two Dragons, Circle, Living World, and the Damaged Panel</li>
<li>Defeated the Crowned One in the flooded crypt and entered Galheran's chamber</li>
<li>Calmed Galheran from attacking Teldryn by Witnessing him directly</li>
<li>Communed with the figment of Aedwynn beneath the nave and returned the Passion-Seed</li>
<li>Released Velara Ashyn to rest in Aedwynn's tree</li>
<li>Accepted The Vigil from Galheran; gained a permanent free 5th-level slot per long rest</li>
<li>Stood beside Teldryn while he renounced Aral-Vyn and bound himself to the Maker</li>
</ul>

<h2>Current Status</h2>
<p>Level 14. At the Basilica of the Unincarnate, in Galheran's chamber (13th of Hathren, 2,831 AS). Diminished from death until next long rest. The ehn-varuu penalty is cured, the Passion-Seed is gone, and Velara is at peace. He carries the Resonant Codex with Kael's Echo, the empty Soul Anchor Amulet, the Remembrance Seal, the Cycle-Liver, Sorrow's Tear, a Cloak of Protection, and <strong>The Vigil</strong>. Missing his left ring finger.</p>'''


FURSEN = '''<h1>Fursen</h1>

<div class="npc-portrait">
<img src="images/Fursen Diamond Teeth.webp" alt="Fursen">
</div>

<p><strong>Race:</strong> Leonin | <strong>Class:</strong> Monk (Open Hand) | <strong>Level:</strong> 14</p>

<h2>Who He Is</h2>
<p>Fursen is a Leonin monk of the Open Hand, freed from one of Imhuran's temporal cells during the 13-Hour Trial. The party assumed for a long time that he was the last surviving Leonin. He wasn't. The Absent Pride is hidden behind Karthayne's Void, and there are about two hundred and fifty more of his people in there. Fursen still walks under open sky, which is a different question.</p>

<h2>The 10,000 Names</h2>
<p>Fursen's blood carries the memory of <strong>10,000 Leonin ancestors</strong>. At the Mouth of the World, where Vor'Kael waits, the names screamed in recognition. In the Basilica of the Unincarnate they did something different — they attended in silence, the way an audience attends a long-postponed reckoning.</p>

<h2>The Ledger of Moments</h2>
<p>Thessaly at the Frayed Codex gave Fursen <em>The Ledger of Moments</em>, a heavy clockwork-bound tome with gears still turning in its cover. It contains a partial transcription of Imhuran's temporal records and updates itself as new names appear and old names vanish. It also holds Leonin history, including information about Fursen's mother, Tessara Sunpride.</p>

<h2>The Absent Pride</h2>
<p>In Sessions 31–32, Ashka Voidmane pulled Fursen through a tear and he spent seven weeks in <strong>Kel'vahr</strong>, the Leonin settlement of about two hundred and fifty in the Void. He trained under Yira Duskmane, hunted Void-stalkers with Tharren Voidclaw, and spoke his own name at the Assertion as the 251st voice. The Void stains everything: the tips of his fur are now purple.</p>

<p>He came back with two techniques:</p>
<ul>
<li><strong>Void Strike (Passive):</strong> Unarmed strikes deal +1d8 force damage. On a critical hit, the target cannot regain HP until the end of Fursen's next turn.</li>
<li><strong>Absence Step (1 ki point):</strong> Bonus action teleport up to 30 ft. During Flurry of Blows, can teleport 15 ft between each strike at no additional cost.</li>
</ul>

<p>In the Knuckle Pass, after Sol fell to the Ridge-Stalker, Fursen called the Pride himself and asked them to come. <strong>Yira Duskmane answered in person</strong> and performed <em>ehn-varuu</em> on Sol's body. The Pride is no longer a rumour to him; it is something that answers when he asks.</p>

<h2>Sekris's Contract-Token</h2>
<p>A meaning-dealer named <strong>Sekris</strong> gave Fursen a smoke-grey coin in Lastwell. Breaking it summons Sekris to arrange for meanings to be removed. Fursen still carries it, unbroken.</p>

<h2>Diamond Teeth</h2>
<p>The Hollow Crawler took two of Fursen's wisdom teeth on the road to Crownfall. Thresh replaced them with diamond, anchored to the jawbone, paid for in stories — names from the 10,000.</p>

<h2>Key Moments</h2>
<ul>
<li>Freed from temporal imprisonment during the 13-Hour Trial</li>
<li>Received the Ledger of Moments from Thessaly</li>
<li>Witnessed Kael and Mira's deaths in the Catacomb Reliquary</li>
<li>Carried Mira's remains in a barrel through the Blooming Rot to Elias's grave</li>
<li>Lost two wisdom teeth to the Hollow Crawler; replaced with diamond by Thresh</li>
<li>Pulled Sol back from the Door of Possibility</li>
<li>Helped defeat an Ember Avatar of Kaedris</li>
<li>Helped kill Cordwain Corbel in Warehouse 11; rescued Subject 6</li>
<li>Cleared the Slavers' Hollow alongside the party; killed Korvain</li>
<li>Pulled into the Void by Ashka Voidmane and trained for seven weeks in Kel'vahr</li>
<li>Spoke his own name at the Assertion as the 251st voice of the Pride</li>
<li>Reunited with the party aboard the Resolve Undying; survived Captain Hask's games</li>
<li>Climbed the Hexwright's Tower; took the Bloodtide Pendant from the Pulse Warden</li>
<li>Carried Sol's body off the Ridge-Stalker's corridor and called the Absent Pride for help</li>
<li>Attended the Basilica's nave with the 10,000 names quiet for the first time he could remember</li>
<li>Stood with Teldryn through the renunciation and helped stop the bleeding</li>
</ul>

<h2>Being Hunted</h2>
<p>Ultharion is tracking the party through Fursen. The Absent Pride is hidden behind Karthayne's Void; Fursen, by contrast, walks the surface, and the surface keeps records.</p>

<h2>Current Status</h2>
<p>Level 14. At the Basilica of the Unincarnate, in Galheran's chamber (13th of Hathren, 2,831 AS). Full HP, full ki. Carries the Ledger of Moments, the Bloodtide Pendant, Sekris's contract-token, Cinder's copper scale, Lawrence's ashes, Curtain Call (Vaunclair's brass bell), an ivory span tear, and Lackborne Dust. Fur tipped purple. Ultharion still tracks him. The Pride answers when he calls.</p>'''


TELDRYN = '''<h1>Teldryn</h1>

<div class="npc-portrait">
<img src="images/Teldryn - Renewed.webp" alt="Teldryn">
</div>

<p><strong>Race:</strong> Shadar-kai | <strong>Class:</strong> Hexblade Warlock | <strong>Patron:</strong> Aedwynn the Maker | <strong>Level:</strong> 13</p>

<h2>Who He Is</h2>
<p>Ash-grey skin. Dark eyes with a faint iridescence in firelight. His face is his own again, original Shadar-kai features. The grafted face the Crucible gave him is gone, peeled off by his own hands and replaced by what the Skin-Walker had taken from him as a child. The seam along the jaw is gone, and his expressions translate cleanly now.</p>

<p>He moves with an economy that borders on unsettling. No wasted motion. Every gesture has a purpose.</p>

<h2>The Blackfold</h2>
<p>Teldryn was born in the Umbrasseur Isles — the Blackfold — Ultharion's domain. He was a slave. His owner was a Skin-Walker, one of Ultharion's identity-thieves: creatures that wear stolen faces like clothing.</p>

<p>The Skin-Walker took his face as punishment, tore the features off, and threw him out. Not all of the face. Enough that he could still see, still breathe, still scream, but not enough to pass for a person.</p>

<h2>The Crucible — and the Renunciation</h2>
<p>He crawled to Crownfall and begged in the Sprawl, then heard a rumour about a Sovereign who fixes what is broken: Aral-Vyn the Bladed Saint, in the Crucible of Flesh. He graverobbed the borderlands of Ultharion's domain to fund the journey, walked into the Crucible faceless, and made a pact. They built him a new face out of harvested material, sculpted by hands that understood anatomy the way poets understand language. It was not the face he had been born with. It was a new one.</p>

<p>In Session 36, kneeling in front of an Aedwynn figment, he asked for the pact to be severed. When the figment said it was already done, he peeled the grafted face off himself, declared aloud that he was renouncing his Sovereign, and bound himself to the Maker. <strong>The pact with Aral-Vyn is broken.</strong> The Annual Correction is cancelled forever. Beneath the graft was the Shadar-kai face he was born with — the figment had restored it before letting him stand again.</p>

<h2>Hexblade of Aedwynn</h2>
<p>His patron is now <strong>Aedwynn the Maker</strong>. Excision and Sinew Wrought no longer answer; they were Aral-Vyn's tools and they left with the pact. The replacement features for the new patron are still being worked out at the table. Whatever Aedwynn gives back, it will not be what he had before.</p>

<h2>Oathbreaker's End</h2>
<p>From the Hollow's forge, Teldryn carries <strong>Oathbreaker's End</strong>, a +2 legendary warhammer forged by Balen Bright — a Bastion defector who escaped Kaedris by deadening every emotion he had. The initials B.B. are etched into the base of the haft. The hammer was built to break the passion-fire chains Balen helped create.</p>

<h2>The Resolve's Debt</h2>
<p>In Session 32, Teldryn lost games aboard the Resolve Undying, a pre-Usurpation shipwreck crewed by bound skeletons. The ship's tax left him with two active conditions:</p>
<ul>
<li><strong>Stolen Fortune:</strong> Cannot roll with advantage. Any effect that would grant advantage grants a normal roll instead.</li>
<li><strong>The Ship's Call:</strong> Movement speed reduced by 10 ft. Dreams of the ship every long rest.</li>
</ul>

<p>Both cures require returning to the ship or to its origin grove.</p>

<h2>Key Moments</h2>
<ul>
<li>Called Sol and Fursen cowards in Ashford; got bitten by Fursen for it</li>
<li>Fought in the Ashford wall breach alongside the party and town guard</li>
<li>Healed Dalla Merrik's ankle on the road with the Sculptor's Touch</li>
<li>Established himself as healer-for-hire at the Hall of Mending in Crownfall</li>
<li>Discovered the Slavers' Hollow entrance beneath the Kennels and freed eight prisoners</li>
<li>Earned Captain Hael's bounty for actionable intelligence on the Hollow</li>
<li>Took Oathbreaker's End and Balen Bright's journal from the Hollow's forge</li>
<li>Played and lost three games aboard the Resolve Undying</li>
<li>Climbed the Hexwright's Tower with the party, claimed the Passion Forge from Heart-Flame, and retreated from the Resonant Knight after a failed attempt to sing back to it</li>
<li>Refused to perform Remnant Resurrection on Sol, citing retribution risk</li>
<li>Read all five Basilica murals alongside Sol and Fursen</li>
<li>Knelt before the figment of Aedwynn, peeled off the grafted face, renounced Aral-Vyn aloud, and was bound to the Maker</li>
<li>Walked out of Galheran's chamber on his own feet, past the knight who had nearly killed him an hour earlier</li>
</ul>

<h2>Current Status</h2>
<p>Level 13. At the Basilica of the Unincarnate, in Galheran's chamber (13th of Hathren, 2,831 AS). HP low from the face-removal blood loss; needs a long rest or healing. The pact with Aral-Vyn is severed, the Annual Correction is cancelled forever, and the original Shadar-kai face is restored. Carries Oathbreaker's End, Corbel's Master Tools, Balen Bright's journal, and Valdron's Research Notes. Stolen Fortune and the Ship's Call are still active. The patron is now Aedwynn the Maker. Replacement features pending.</p>'''


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    for i, p in enumerate(data["Party"]["items"]):
        if p["id"] == "sol-raven":
            data["Party"]["items"][i]["content"] = SOL
            print("Sol Raven: humanized")
        elif p["id"] == "fursen":
            data["Party"]["items"][i]["content"] = FURSEN
            print("Fursen: humanized")
        elif p["id"] == "teldryn":
            data["Party"]["items"][i]["content"] = TELDRYN
            print("Teldryn: humanized")
    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Saved.")


if __name__ == "__main__":
    main()
