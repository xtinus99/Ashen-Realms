"""Humanize locations (Basilica, Hexwright), creatures (Ridge-Stalker, Crowned One, Smoldering Remnant)."""
import json

PATH = r"C:\Users\khali\Documents\DND Campaign\player-site\public\data.json"


BASILICA = '''<h1>The Basilica of the Unincarnate</h1>

<img src="images/Basilica Exterior.webp" alt="The Basilica of the Unincarnate" class="content-image" style="max-width: 600px;">

<p><strong>Type:</strong> Pre-Usurpation Temple (Jungle Ruin) | <strong>Region:</strong> The Left Hand, deep jungle northwest of the Knuckles | <strong>Status:</strong> Found and partially explored (Session 36)</p>

<p>The Basilica is the last standing remnant of a once-prominent church built during the Age of the Maker, when Aedwynn walked among mortals, shaped the world with her hands, and was worshipped as a living, present god. The church was a place of devotion, gathering, and prayer. It was not the only institution that honoured the Maker, but it may be the only one that survived.</p>

<p>It was built by mortal hands with the Maker's guidance: stone quarried from the hills, walls raised by craftspeople, murals painted by artists who had seen the things they depicted. It is not divine architecture. It is human architecture made for a divine purpose. The Sovereigns build with stolen organs and corrupted flesh; this building was built with chisels and scaffolding and faith.</p>

<p>The Basilica was already ancient when the Usurpation occurred two thousand years ago. The jungle around it — part of the original creation, untouched by Sovereign influence — swallowed it slowly over the centuries that followed. Roots pushed through the stonework. Vines threaded the windows. Trees grew through the collapsed sections of roof. The building did not fall; it was absorbed.</p>

<h2>Exterior</h2>

<p>You almost walk past it. The jungle is so dense that the stonework registers as natural rock formation at first glance, until you see the angle of a wall — too straight, too deliberate — and behind a curtain of vines an archway, carved stone, a doorway built for people rather than carved by water.</p>

<p>The structure is sixty feet wide and at least twice as long, with walls rising thirty feet before the canopy obscures them. The roof is largely gone, replaced by a lattice of interwoven branches and vine-growth that filters the light into green-gold shafts. Trees grow from inside the structure, their trunks pushing through gaps where the roof collapsed centuries ago. The entrance is a pair of stone doors, each twelve feet tall, standing ajar.</p>

<h2>The Nave</h2>

<img src="images/Basilica Nave Interior.webp" alt="The Nave" class="content-image" style="max-width: 600px;">

<p>The largest single space in the Basilica: sixty feet wide, eighty long, with a vaulted ceiling that rises forty feet at its apex. Stone pews carved from single blocks still sit in their original rows, though many are cracked or tilted by root growth. Vines hang from every surface. Tiny six-legged lizards (<strong>Giltweavers</strong>) build glowing silk-structures in every crack and crevice, providing the nave's ambient golden illumination. <strong>Veilwings</strong> roost in dense clusters on the ceiling. A territorial <strong>Rootjaw</strong> dens in the northeast corner.</p>

<p>The walls and surviving ceiling sections carry ancient mineral paintings — the five murals the party read on entry. The raised altar at the north end is cracked but intact, carved with symbols that predate any known religious tradition. Behind the altar, a stone stairway descends into the lower levels.</p>

<h2>The Murals</h2>

<p>Five painted panels, layered mineral pigments applied directly to stone in a style that belongs to no culture the party has ever seen.</p>

<ul>
<li><strong>Mural 1 — The Shaping.</strong> A feminine figure kneels with both hands pressed into the earth; trees, rivers, and terrain rise from the points of contact.</li>
<li><strong>Mural 2 — The Two Dragons.</strong> Two enormous dragons (one gold and amber, one near-black with silver) coiled in opposite directions, foreclaws meeting at the centre.</li>
<li><strong>Mural 3 — The Circle.</strong> About twenty figures standing in a circle around the same feminine figure, each distinct, one holding a staff, one holding a blade.</li>
<li><strong>Mural 4 — The Living World.</strong> A panoramic landscape with mortals building and farming under the gold dragon (sun) and the dark dragon (moon).</li>
<li><strong>Mural 5 — The Damaged Panel.</strong> Almost entirely destroyed. Deliberate gouge marks where someone clawed or chiselled the image away with sustained force; only fragments at the edges survive.</li>
</ul>

<p>The Circle shows about twenty figures around Aedwynn. The Sovereigns are thirteen. Some of the others have been erased.</p>

<h2>The Archive</h2>

<p>A side chamber off the nave on the west wall. Stone shelves built floor to ceiling, mostly empty — whatever was stored here decayed beyond recognition over two millennia. The lowest shelves still hold carved stone tablets in a script no living person can read, but the illustrations and diagrams can be interpreted visually. Among them is a roster of about twenty names with portrait illustrations, some struck through with deliberate chisel marks, and a separately stored floor-plan tablet showing the lower levels of the building.</p>

<h2>The Garden Atrium</h2>

<p>An open courtyard on the northeast side, originally a formal garden, now fully consumed by jungle. It is the only part of the Basilica where the jungle feels welcoming rather than encroaching: lush green growth fed by the divine energy radiating from the foundations, flowers in colours the party has not seen anywhere else in the Unclaimed. Resting here for an hour restores a hit die. The fountain basin holds clean rainwater, faintly warm, the best the party has tasted in this region.</p>

<h2>The Flooded Crypt</h2>

<p>Down the broad ceremonial stairs behind the altar. The transition is stark — within ten steps the vine-growth thins, the moss disappears, and the air cools. The Giltweavers' silk-structures stop abruptly two-thirds of the way down, as if they reached a boundary they chose not to cross.</p>

<p>The chamber is long and partially submerged, the southern half dry stone, the northern half flooded with still, dark water that is faintly warm. Burial niches line the walls, empty. <strong>The Crowned One</strong> lived in the flooded section: a Gargantuan amphibian that had occupied the chamber for centuries, feeding off the radiance bleeding from the deeper chamber below. The party defeated it in its own water on the 13th of Hathren.</p>

<h2>Galheran's Vigil</h2>

<p>Past the Crowned One's pool, a narrower and steeper stair descends fifteen feet further into a long rectangular chamber, vaulted ceiling supported by paired columns. Cold, dry, completely untouched by jungle growth. The stone is bare and clean — not maintained, but avoided. The air had not moved in this room for two thousand years.</p>

<p>A stone sarcophagus on a raised plinth in the centre, plain and uninscribed. Beyond it, a pair of fifteen-foot double doors carved with a single symbol: a hand. The Maker's mark, the same gesture from Mural 1.</p>

<p>Inside the sarcophagus: <strong>Galheran the Unmoved</strong>, Aedwynn's pre-Usurpation knight-protector, both weapons in his hands. Killed by the Thirteen for refusing to join them, buried by the Maker herself, still standing watch.</p>

<h2>The Maker's Chamber</h2>

<p>Through the double doors. A chamber larger than the building should hold, cathedral-vast, lost in soft gold light without source. At the centre, a living tree: dark bark, leaves pulsing gold-green-gold like a slow heart, roots cracking the floor into mosaic. At the base, a worn stone bench.</p>

<p>The bench is empty, but the air above it shimmers — a shape almost resolving and dissolving in patient repetition. <em>She is here. Present, not visible.</em></p>

<p>This is a figment of Aedwynn's consciousness, similar to the presence beneath Veinspire in the Chamber of the Final Breath. Sol communed with her here, returned the Passion-Seed to the tree, released Velara Ashyn to rest in the wood, and stood beside Teldryn while the figment severed his pact with Aral-Vyn and bound him as a Hexblade of Aedwynn.</p>

<h2>Environmental Notes</h2>

<ul>
<li><strong>Divine Saturation.</strong> The entire complex is saturated with ambient divine energy. It is not corrupted and not dangerous, but it is present, and it has shaped the local ecology over millennia: the Giltweavers' metallic sheen, the Rootjaw's symbiotic plant growth, the Crowned One's translucent skin and crystal crown. The energy is Aedwynn's original creation-power, not stolen or corrupted.</li>
<li><strong>No Sovereign Influence.</strong> The Basilica sits in a gap between Sovereign territories that has never been claimed.</li>
<li><strong>Acoustic Preservation.</strong> The nave's surviving vault carries sound; whispers cross the hall.</li>
<li><strong>Ancient Inscriptions.</strong> Carved text appears throughout the building in a pre-Usurpation script no living person can read.</li>
</ul>

<h2>What's There Now</h2>

<ul>
<li>Galheran continues his vigil before the doors with Dawn's Edge alone</li>
<li>The figment of Aedwynn remains in the tree</li>
<li>The Crowned One is dead. The luminescent groundwater, the prismatic refraction, and the regional resonance will fade over the days ahead</li>
<li>The murals remain. The Damaged Panel is still missing whatever it once depicted</li>
<li>The Archive's tablets are still unreadable</li>
<li>The roster shows about twenty entries with some struck through, and the Circle mural shows about twenty figures around the Maker. The Sovereigns are thirteen. The Basilica remembers more than the world does.</li>
</ul>'''


HEXWRIGHT = '''<h1>The Hexwright's Tower</h1>

<img src="images/Hexwright's Tower.webp" alt="The Hexwright's Tower" class="content-image">

<p><strong>Type:</strong> Floating Spire (Dimensional Catastrophe) | <strong>Region:</strong> The Unclaimed, west of the Reach | <strong>Status:</strong> Abandoned mid-climb (Session 35) — descending</p>

<h2>What It Is</h2>

<p>A twisted spire that violates every principle of architecture and physics. Magister <strong>Valdron Grimhex</strong> was an artificer of extraordinary ambition who believed he could bind fragments of multiple Sovereigns' stolen aspects into a single focal tower, channelling divine energy from many of the Thirteen at once while serving none of them.</p>

<p>He was catastrophically wrong.</p>

<p>When Valdron activated his Aspect Convergence Engine three years ago, the competing divine influences tore reality apart in layers around his tower. Each floor now exists partially in a different Sovereign's domain, overlapping and bleeding through in impossible ways. The tower drifted free of the ground and began floating. Reality storms — gravity reversals, emotional hurricanes, architectural mutations — sweep through the floors unpredictably. Stairs between floors lead to different destinations depending on which Sovereign influence dominates at the moment of use.</p>

<p>The tower has been visible from the surrounding wilds for three years. Most parties that go in do not come out.</p>

<h2>How the Party Found It</h2>

<p>On the night watch west of the Reach, the party spotted the floating tower southwest of their position and diverted to investigate. They watched it cycle through Sovereign energies for several hours from cover, then climbed up via a rope anchored at the entrance by Teldryn's spectre.</p>

<h2>The Climb</h2>

<h3>Floor 1 — The Anchor Chamber</h3>

<p>The tower's entrance and the most stable area in the structure, though still cracked through with reality fissures. Valdron's original workshop: mundane in appearance, surrounded by containment circles, with thirteen ritual focuses ringing the chamber, one per Sovereign. Two stone-and-metal constructs (<strong>Reality Anchors</strong>) maintained dimensional stability.</p>

<p>The party initially bypassed the Anchors. After clearing the next two floors above, they returned and destroyed both. <strong>Valdron's Research Notes</strong> were recovered from the workbench. Tower baseline stability has been compromised since, and the reality cracks have widened throughout the lower floors.</p>

<h3>Floor 2 — The Ossuary Architecture (Vortegas)</h3>

<p>A cathedral of bone. Walls, columns, and ceiling were every surface fused human and divine bone, polished and load-bearing. The <strong>Bone Architect</strong> presided here, a tall thing of articulated marrow and stained ivory that built and rebuilt the room around itself. Cleared. <strong>Structural Bone</strong> recovered: a pre-Usurpation load-bearing rod, indestructible, compatible with Corbel's Master Tools.</p>

<h3>Floor 3 — The Vein Cathedral (Mareatha)</h3>

<p>A flooded sanctuary of veins and warm blood-light. The walls pulsed with the slow rhythm of a heart that was not in the building. The <strong>Pulse Warden</strong> stood watch, a bound construct of vascular tissue. Cleared. The <strong>Bloodtide Pendant</strong> was recovered from its remains and claimed by Fursen.</p>

<h3>Floor 4 — The Crucible of Sinew (Aral-Vyn)</h3>

<p>A surgical theatre of fused muscle and tendon, held together by something that knew anatomy too well. The <strong>Chirurgeon</strong> presided. A close fight; the party barely won.</p>

<h3>Floor 5 — The Breathless Heights (Azerach)</h3>

<p>A vast empty chamber with no walls visible, only a ceiling far above and a featureless floor underfoot. No air. No sound. The <strong>Windless Void</strong> defended it without a body of its own — pressure, silence, the absence of breath. Cleared.</p>

<h3>Floor 6 — The Forge of Passions (Kaedris)</h3>

<img src="images/Floor 6.webp" alt="Floor 6 — The Forge of Passions" class="content-image">

<p>A foundry chamber lit by a heart-shaped fire suspended above the central anvil. The <strong>Heart-Flame</strong> was a portion of Kaedris's passion bound into burning shape. It saw Oathbreaker's End at Teldryn's hip, demanded he hand it over, and attacked when he refused. Cleared. <strong>Passion Forge</strong> (Rare) claimed.</p>

<h3>Floor 7 — The Blooming Rot (Talaris)</h3>

<img src="images/Floor 7.webp" alt="Floor 7 — The Blooming Rot" class="content-image">

<p>A composting cathedral. Floor and walls thick with fungal growth, slow rot turning over visibly with each minute. The <strong>Compost Sovereign</strong> presided, attended by two fungal zombies rooted into the floor. The party broke through the rooting and put all three down. <strong>The Cycle-Liver</strong> (Very Rare, attunement) was recovered — restores HP on nearby kills, grants necrotic resistance.</p>

<h3>Floor 8 — The Shattered Gravitas (Eredain) — Declined</h3>

<img src="images/Floor 8.webp" alt="Floor 8 — The Shattered Gravitas" class="content-image">

<p>A vast vaulted chamber of suspended chains and broken acoustics. The <strong>Resonant Knight</strong> waited at the centre, a knight forged of harmonised chain and glass armour, attended by two chain-bound singers. The party assessed the encounter and pulled out: Sol Dimension-Doored back to Floor 1 with Teldryn, and Fursen jumped from a high window and slow-fell.</p>

<p>The tower was at roughly ninety feet of altitude when they evacuated. It was still descending.</p>

<h3>Upper Floors — Uncleared</h3>

<p>The party did not climb past Floor 8. The structure of the tower above remains unknown to them.</p>

<h2>Status — Departed</h2>

<ul>
<li>Tower abandoned mid-climb at the start of Session 35's evacuation</li>
<li>Reality Anchors destroyed; baseline stability compromised; tower descending steadily toward the earth</li>
<li>Convergence Engine still running</li>
<li>Floor 6's Heart-Flame, Floor 7's Compost Sovereign, and the Floor 1 Anchors were the only fights resolved by the party. Other lower-floor opposition is dead but the tower has not been cleared</li>
<li>The party left with the Passion Forge, the Cycle-Liver, the Bloodtide Pendant, the Structural Bone, and Valdron's Research Notes</li>
<li>Going back is an option. Going up is an option. Neither is a guarantee — the tower has continued to drift and to deteriorate since they left</li>
</ul>

<h2>Environmental Features</h2>

<ul>
<li><strong>Dimensional Flux.</strong> Each floor exists partially in a different Sovereign's domain. Reality shifts without warning as influences compete for dominance.</li>
<li><strong>Aspect Bleeding.</strong> Floors manifest environmental effects from specific Sovereigns: bone architecture, forge heat, vascular pulse, breathless silence.</li>
<li><strong>Reality Storms.</strong> Gravity reversals, architectural mutations, and weather-like chaos sweep through the tower unpredictably.</li>
<li><strong>Navigation Chaos.</strong> Stairs may lead to different destinations depending on which Sovereign influence dominates at the moment of use.</li>
<li><strong>Divine Resonance.</strong> Characters with strong connections to specific Sovereigns find certain floors easier or harder to navigate.</li>
</ul>

<h2>Magister Valdron Grimhex</h2>

<p>The artificer who built the tower. He spent decades mapping the Sovereign domains and theorising about the relationships between their stolen aspects. He believed divine power existed on a spectrum from material to conceptual, and that channelling required ascending through that spectrum. The party recovered his research notes from the Floor 1 workbench but has not encountered him in person. His current state is unknown.</p>

<blockquote>
<p><em>"Most parties that go in do not come out. We saw the tower from a long way off and went looking for trouble. We found it. We did not find Valdron."</em></p>
</blockquote>'''


RIDGE_STALKER = '''<h1>Ridge-Stalker</h1>

<img src="images/Ridge-Stalker.webp" alt="Ridge-Stalker" class="content-image" style="max-width: 500px;">

<h2>Overview</h2>

<p><strong>Type:</strong> Beast (Pre-Usurpation) | <strong>Challenge:</strong> CR 11 (7,200 XP) | <strong>Habitat:</strong> The Left Hand, Knuckle pass corridors and canopy flight-lines</p>

<p>The Ridge-Stalker is the apex predator of the Left Hand's Knuckle ridges, a long-bodied hexapod hunter that evolved to exploit the bone-corridor architecture of Aedwynn's fingers. Solitary. Territorial. The kind of patient that mistakes a corpse for an obstacle.</p>

<p>It hunts a fixed corridor and maintains a cleared flight-line through the canopy above as a second hunting layer. It does not chase, and it does not pursue prey beyond the far mouth of its territory. It waits, and it waits well.</p>

<h2>Appearance</h2>

<p>Eighteen to twenty-two feet nose to tail, built low and heavily muscled. Six limbs: four for climbing, two heavier for striking. Pale bone-white hide mottled with grey, near-perfect camouflage against the ridge it hunts along. Elongated jaws with multiple rows of backward-curved teeth. Gripping claws that span two feet at the paw, deeply hooked for vertical ascent. Cold pupil-less eyes. A thick drag-tail that leaves unmistakable trails when it pulls kills back to its pile. Its shoulder blades rise higher than its skull when it crouches to strike.</p>

<h2>Behaviour</h2>

<p>The Ridge-Stalker does not wander. It claims a single corridor — one of the Knuckle passes — and holds that territory for its entire life. It marks the walls. It maintains the flight-line. It keeps its bone piles clean enough to scent-mark but unordered enough to look abandoned.</p>

<p>Prey entering the corridor thinks in two dimensions: forward to the far end, back to the near end. The Ridge-Stalker thinks in three. It uses the canopy line above as a second hunting surface, climbs to elevation when it smells prey approaching, and drops at the narrow part of the pass where the escape routes thin.</p>

<p>It does not attack anything that smells wrong. Corpses, carrion, and rotting matter are ignored. Living prey that moves with uncertainty (tired, limping, lost) gets prioritised over prey that moves with confidence. The Left Hand's ecosystem has trained it to read posture.</p>

<p>The closest thing it has to a weakness is that it will not pursue prey that leaves the corridor. Once you are past the far mouth, it considers the hunt over and resets.</p>

<h2>Three Corridors, Three Stalkers</h2>

<p>Each Knuckle pass (East, Centre, West) holds its own Ridge-Stalker. They do not interact, share scent-markers, or form a mated pair. Each is solitary and territorial to the other. The Vreth have a word for them, <em>ohnn-taak</em> — roughly "the one above" — and consider the corridors above their ravines cursed ground.</p>

<h2>D&D 5e Statistics</h2>

<div class="stat-block">

<p class="stat-block-header">Ridge-Stalker</p>
<p><em>Huge beast, unaligned</em></p>

<hr>

<p><strong>Armor Class</strong> 18 (natural hide)</p>
<p><strong>Hit Points</strong> 242 (21d12 + 105)</p>
<p><strong>Speed</strong> 40 ft., climb 40 ft.</p>

<hr>

<table class="stat-table">
<thead><tr><th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th></tr></thead>
<tbody><tr><td>22 (+6)</td><td>18 (+4)</td><td>20 (+5)</td><td>4 (-3)</td><td>16 (+3)</td><td>8 (-1)</td></tr></tbody>
</table>

<hr>

<p><strong>Saving Throws</strong> Str +10, Dex +8, Con +9</p>
<p><strong>Skills</strong> Athletics +10, Perception +7, Stealth +8 (+12 in bone-corridor terrain)</p>
<p><strong>Damage Resistances</strong> bludgeoning, piercing, slashing from nonmagical attacks</p>
<p><strong>Senses</strong> darkvision 60 ft., tremorsense 60 ft., passive Perception 17</p>
<p><strong>Languages</strong> —</p>
<p><strong>Challenge</strong> 11 (7,200 XP)</p>

<hr>

<h3>Traits</h3>

<p><strong>Pale Camouflage.</strong> While motionless against a pale bone surface, the Ridge-Stalker has advantage on Stealth checks. A creature must succeed on a DC 18 Wisdom (Perception) check to spot it before it moves.</p>

<p><strong>Keen Senses.</strong> The Ridge-Stalker has advantage on Wisdom (Perception) checks that rely on hearing, smell, or vibration.</p>

<p><strong>Pounce.</strong> If the Ridge-Stalker moves at least 20 ft in a straight line toward a creature and then hits it with a Rending Claw on the same turn, the target must succeed on a DC 18 Strength save or be knocked prone. If the target is prone, the Ridge-Stalker can make one Bite attack against it as a bonus action.</p>

<p><strong>Standing Leap.</strong> Long jump up to 30 ft, high jump up to 15 ft, with or without a running start. From the canopy flight-line, it can drop up to 80 ft without damage.</p>

<p><strong>Wall-Climber.</strong> The Ridge-Stalker can climb sheer bone surfaces without needing ability checks.</p>

<p><strong>Territorial.</strong> While inside its home corridor, the Ridge-Stalker has advantage on attack rolls against creatures that have moved through the corridor in the past minute.</p>

<p><strong>Legendary Resistance (3/Day).</strong> If the Ridge-Stalker fails a saving throw, it can choose to succeed instead.</p>

<hr>

<h3>Actions</h3>

<p><strong>Multiattack.</strong> The Ridge-Stalker makes four attacks: one Bite, two Rending Claws, and one Tail Lash.</p>

<p><strong>Bite.</strong> <em>Melee Weapon Attack:</em> +10 to hit, reach 10 ft., one target. <em>Hit:</em> 17 (2d10 + 6) piercing damage. On a critical hit or against a prone target, the bite also grapples (escape DC 18).</p>

<p><strong>Rending Claw.</strong> <em>Melee Weapon Attack:</em> +10 to hit, reach 10 ft., one target. <em>Hit:</em> 13 (2d6 + 6) slashing damage. If both claw attacks hit the same target on the same turn, the target must succeed on a DC 18 Strength save or be grappled (escape DC 18).</p>

<p><strong>Tail Lash.</strong> <em>Melee Weapon Attack:</em> +10 to hit, reach 15 ft., one target. <em>Hit:</em> 14 (2d8 + 5) bludgeoning damage and the target is pushed 10 ft away. If the target is pushed into a wall, they take an additional 5 (1d10) bludgeoning damage and are knocked prone.</p>

<p><strong>Drag.</strong> While grappling a creature, the Ridge-Stalker moves up to half its speed, pulling the grappled creature with it. This movement does not provoke opportunity attacks from the grappled target.</p>

<p><strong>Canopy Leap (Recharge 5-6).</strong> The Ridge-Stalker leaps up to 60 ft straight up into the canopy flight-line, vanishing from ground-level sight for 1 round (cover from canopy obscurement). At the start of its next turn, it descends on any target within 60 ft of its position, making one Rending Claw attack with advantage. If the attack hits, the target takes an additional 14 (4d6) bludgeoning damage from the fall-strike and must succeed on a DC 18 Dexterity save or be knocked prone. During the intervening round, the Ridge-Stalker has full cover and cannot be targeted by attacks that do not pierce the canopy.</p>

<hr>

<h3>Legendary Actions</h3>

<p>The Ridge-Stalker can take 3 legendary actions per round, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The Ridge-Stalker regains spent legendary actions at the start of its turn.</p>

<p><strong>Claw Strike (Costs 1 Action).</strong> The Ridge-Stalker makes one Rending Claw attack.</p>

<p><strong>Reposition (Costs 1 Action).</strong> The Ridge-Stalker moves up to half its speed (including climbing a bone wall or shifting along the canopy flight-line). This movement does not provoke opportunity attacks.</p>

<p><strong>Tail Sweep (Costs 2 Actions).</strong> The Ridge-Stalker sweeps its tail in a 15-ft cone in a direction of its choice. Each creature in the area must succeed on a DC 18 Dexterity save or take 28 (4d8 + 5) bludgeoning damage and be knocked prone. On a success, a creature takes half damage and is not knocked prone.</p>

</div>

<h2>Lore</h2>

<p>The Ridge-Stalker is old. Pre-Usurpation old. When the Thirteen killed the Maker, Ridge-Stalkers were already hunting the Knuckles. They came out of the Palm's ecosystem in the same long, slow accretion that produced the Thalwynn — a product of Aedwynn's residual creative essence working through the land without Sovereign interference.</p>

<p>They do not know any of this. They hunt. They hunt well.</p>'''


CROWNED_ONE = '''<h1>The Crowned One</h1>

<img src="images/Crying Crowned One.webp" alt="The Crowned One" class="content-image" style="max-width: 500px;">

<h2>Overview</h2>

<p><strong>The Last of Its Kind — DEFEATED</strong></p>
<p><strong>Type:</strong> Beast (Pre-Usurpation, Divinely Influenced) | <strong>Challenge:</strong> CR 14 (11,500 XP) | <strong>Status:</strong> Defeated (Session 36)</p>

<p>The Crowned One was a single specimen, a Gargantuan amphibian that had occupied the flooded lower chambers of the Basilica of the Unincarnate for centuries. The oldest living thing in the building. The last of a species that never had enough members to have a name.</p>

<p>It cried when it died.</p>

<h2>Appearance</h2>

<p>Roughly twenty-five feet from blunt snout to tail-tip, wider than it was long, body plan like a giant salamander but enormously broadened and flattened for life in shallow water. Pale, semi-translucent skin stretched taut over visible bone, with golden organs pulsing beneath in slow rhythm. Feathery external gill-fronds threaded with golden capillaries. Dark, deep-set eyes that reflected no light.</p>

<p>The crown was the most striking feature: an asymmetrical crest of jagged crystallised mineral, accumulated layer by layer over centuries from the divinely-charged water it lived in, refracting any light source into prismatic scatter-patterns across the chamber walls.</p>

<h2>Behaviour</h2>

<p>The Crowned One was not, ordinarily, hostile. Its diet was fish, frogs, and large insects — anything that lived in or fell into the water — and humanoids were not on its list. It watched the party wade through its pool. It turned its head to track them. It did not attack.</p>

<p>It attacked when they approached the stone doors at the far end of the chamber. Behind those doors, deeper still, was the source of the radiance the creature had spent centuries absorbing: the divine warmth that lit its organs and grew the crystals on its skull. The party reading those doors as a way through, the Crowned One read as a threat to its food. It moved with surprising speed for something of its size, and it did not allow them to leave the water without a fight.</p>

<h2>How It Died</h2>

<p>The party defeated it in its own water. The crown went dark, the golden glow under its skin faded slowly, and the creature made one small wet sound — a kind of cry — before going still.</p>

<h2>D&D 5e Statistics</h2>

<div class="stat-block">

<p class="stat-block-header">The Crowned One</p>
<p><em>Gargantuan beast, unaligned</em></p>

<hr>

<p><strong>Armor Class</strong> 18 (natural armor + crystalline crown)</p>
<p><strong>Hit Points</strong> 250 (20d12 + 120)</p>
<p><strong>Speed</strong> 20 ft., swim 60 ft.</p>

<hr>

<table class="stat-table">
<thead><tr><th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th></tr></thead>
<tbody><tr><td>24 (+7)</td><td>8 (-1)</td><td>22 (+6)</td><td>3 (-4)</td><td>16 (+3)</td><td>8 (-1)</td></tr></tbody>
</table>

<hr>

<p><strong>Saving Throws</strong> Str +12, Con +11, Wis +8</p>
<p><strong>Skills</strong> Perception +8, Stealth +4 (in water only)</p>
<p><strong>Damage Resistances</strong> bludgeoning, piercing, and slashing from nonmagical attacks</p>
<p><strong>Damage Immunities</strong> poison, lightning, cold, radiant</p>
<p><strong>Condition Immunities</strong> charmed, frightened, poisoned, prone (in water)</p>
<p><strong>Senses</strong> blindsight 60 ft., darkvision 120 ft., tremorsense 30 ft. (through connected water), passive Perception 18</p>
<p><strong>Languages</strong> —</p>
<p><strong>Challenge</strong> 14 (11,500 XP) &emsp; <strong>Proficiency Bonus</strong> +5</p>

<hr>

<h3>Traits</h3>

<p><strong>Amphibious.</strong> The Crowned One can breathe air and water.</p>

<p><strong>Divine Saturation.</strong> The Crowned One has soaked in divinely-charged water for centuries. Its body radiates faint golden light visible through its translucent skin. The crystalline crown grounds lightning into the water, and the divine warmth in its tissues keeps it from freezing. Creatures that start their turn grappled by the Crowned One take 14 (4d6) radiant damage as divine energy transfers through skin contact.</p>

<p><strong>Hold Breath.</strong> The Crowned One can hold its breath for 1 hour.</p>

<p><strong>Legendary Resistance (3/Day).</strong> If the Crowned One fails a saving throw, it can choose to succeed instead.</p>

<p><strong>Siege Mass.</strong> The Crowned One deals double damage to objects and structures.</p>

<p><strong>Stillwater Stalker.</strong> While submerged in still water, the Crowned One is invisible to creatures relying on sight unless they succeed on a DC 18 Wisdom (Perception) check, and it can take the Hide action even while observed if at least half its body is underwater.</p>

<hr>

<h3>Actions</h3>

<p><strong>Multiattack.</strong> The Crowned One makes three attacks: two with its bite and one with its tail slam. It can replace one bite attack with a use of <em>Crown Burst</em> if available.</p>

<p><strong>Bite.</strong> <em>Melee Weapon Attack:</em> +12 to hit, reach 10 ft., one target. <em>Hit:</em> 25 (4d8 + 7) piercing damage plus 7 (2d6) radiant damage. If the target is a Large or smaller creature, it is grappled (escape DC 19). The Crowned One can have up to two creatures grappled at one time.</p>

<p><strong>Tail Slam.</strong> <em>Melee Weapon Attack:</em> +12 to hit, reach 15 ft., one target. <em>Hit:</em> 23 (3d10 + 7) bludgeoning damage. If the target is in water, it must succeed on a DC 19 Strength saving throw or be knocked prone and pushed 10 feet in a direction of the Crowned One's choice.</p>

<p><strong>Drag Under.</strong> The Crowned One moves up to its swim speed, dragging all creatures it has grappled with it. Each creature dragged underwater begins suffocating if it cannot breathe water and takes 14 (4d6) bludgeoning damage from impact with submerged stonework.</p>

<p><strong>Crown Burst (Recharge 5–6).</strong> The Crowned One angles its crystalline crown and releases a 30-foot cone of refracted prismatic light. Each creature in the cone must make a DC 18 Constitution saving throw, taking 36 (8d8) radiant damage and being blinded for 1 minute on a failed save, or half as much damage and not blinded on a successful one. A blinded creature can repeat the save at the end of each of its turns to end the effect.</p>

<p><strong>Thrash (Recharge 5–6).</strong> The Crowned One violently thrashes. Each creature within 20 feet must make a DC 19 Strength saving throw, taking 35 (5d10 + 7) bludgeoning damage and being knocked prone on a failed save, or half as much damage and not prone on a successful one. The water surges: each fire-based light source within 30 feet is extinguished, and the floor within 30 feet becomes difficult terrain until the start of the Crowned One's next turn.</p>

<hr>

<h3>Reactions</h3>

<p><strong>Refractive Pulse.</strong> When a creature the Crowned One can see within 15 feet makes an attack roll against it, the crown flashes once. The attacker must succeed on a DC 17 Constitution saving throw or make the triggering attack roll with disadvantage.</p>

<hr>

<h3>Legendary Actions</h3>

<p>The Crowned One can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The Crowned One regains spent legendary actions at the start of its turn.</p>

<p><strong>Watch.</strong> The Crowned One fixes its dark eyes on a creature it can see within 60 feet. The next attack roll the Crowned One makes against that target before the start of its next turn has advantage.</p>

<p><strong>Barrel Roll (Costs 2 Actions).</strong> The Crowned One launches its bulk sideways and rolls onto a creature it can see within 20 feet, crushing the target beneath its mass. The creature must succeed on a DC 19 Dexterity saving throw, taking 27 (6d8) bludgeoning damage on a failure or half as much on a success.</p>

<p><strong>Tail Slam (Costs 3 Actions).</strong> The Crowned One makes one tail slam attack.</p>

<hr>

<h3>Lair Actions</h3>

<p>On initiative count 20 (losing initiative ties), the Crowned One took a lair action to cause one of the following effects; it could not use the same effect two rounds in a row:</p>

<ul>
<li><strong>Surge.</strong> Water level rises by two feet for 1 minute. All creatures in the water make a DC 16 Strength save or are swept 10 feet toward the deepest point. Small creatures fail automatically.</li>
<li><strong>Mineral Spike.</strong> A spike erupts from the floor or wall in a 5-foot square within 60 feet. DC 16 Dex save, 22 (4d10) piercing on a failure, half on success. Spike remains as difficult terrain providing half cover (AC 15, 30 HP).</li>
<li><strong>Prismatic Flash.</strong> Each creature within 30 feet that can see makes a DC 16 Con save or is blinded until the end of its next turn.</li>
</ul>

</div>

<h2>Loot</h2>
<ul>
<li><strong>Crown Crystal Branch</strong> (intact) — Crude divine focus, +1 to spell attack rolls for divine spells, ~1 year before the charge fades</li>
<li><strong>Crown Crystal Dust</strong> — Mixed with ink, creates divine-resonant script (text glows faintly in the presence of active divine magic)</li>
<li><strong>Alchemical Component</strong> — Crown shards worth ~500 gp to the right buyer</li>
</ul>

<h2>Aftermath</h2>

<p>The regional effects the Crowned One sustained — luminescent groundwater, divine resonance in nearby crystals, prismatic light in the flooded crypt — fade over the days after its death. The chamber will simply be a flooded crypt, dark and cold, like any other.</p>

<blockquote>
<p><em>"It cried as it died. A small wet sound from a thing that should not have been able to make one. Then the light under its skin went out, slow as a sleeping breath, and the chamber was just dark water and dead stone."</em></p>
</blockquote>'''


SMOLDERING = '''<h1>The Smoldering Remnant (Balen Bright)</h1>

<img src="images/Smoldering Remnant.webp" alt="The Smoldering Remnant" class="content-image" style="max-width: 500px;">

<h2>Overview</h2>

<p><strong>The Defiant Smith — DESTROYED</strong></p>
<p><strong>Type:</strong> Undead | <strong>Challenge:</strong> CR 13 (10,000 XP) | <strong>Status:</strong> Destroyed (Session 30)</p>

<p>The Smoldering Remnant was what was left of <strong>Balen Bright</strong>, a Bastion smith who defected from Kaedris's domain centuries ago. He had built passion-fire weapon casings for Kaedris and watched people burn from the inside with tools he had made. He escaped by deadening every emotion he had so Kaedris could not sense him leaving. He wept for three days after crossing the border. The first tears in twenty years.</p>

<p>He crawled into a coastal cave after being attacked on the road, finished forging <strong>Oathbreaker's End</strong> as penance, and died. He didn't stay dead. The heartwood sustained him as a flickering guardian bound to the forge, alternating between rage and despair.</p>

<h2>Appearance</h2>

<p>Tall, gaunt, broad-shouldered. Flickered constantly between two states like a double exposure:</p>

<ul>
<li><strong>SMOLDERING:</strong> skin of cracked black iron, molten orange bleeding through fissures, eyes like forge-coals, heat shimmer from the shoulders, wisps of flame from the hands.</li>
<li><strong>HOLLOW:</strong> ash-grey, translucent, cold; cracks dark and empty; eyes hollow pits with faint blue-white light; frost on the edges of his form.</li>
</ul>

<p>He wore the scorched remnants of a smith's leather apron, carried a spectral hammer that shifted between red-hot and frost-cold, and stood hunched with centuries of guilt.</p>

<h2>How He Died</h2>

<p>The party first encountered the Remnant in Session 23 and retreated. The forge didn't go cold.</p>

<p>In Session 30 the party returned. The Remnant had reformed, diminished — smaller, weaker, pulling itself together from embers with grinding patience. They defeated it a second time. The forge went truly dark for the first time in centuries. Teldryn claimed Oathbreaker's End and the journal.</p>

<p>The Smoldering Remnant did not reform after the second defeat. Balen Bright finally rests.</p>

<h2>D&D 5e Statistics</h2>

<div class="stat-block">

<p class="stat-block-header">The Smoldering Remnant</p>
<p><em>Large undead, neutral</em></p>

<hr>

<p><strong>Armor Class</strong> 18 (natural armor)</p>
<p><strong>Hit Points</strong> 230 (20d8 + 140)</p>
<p><strong>Speed</strong> 40 ft., fly 10 ft. (hover)</p>

<hr>

<table class="stat-table">
<thead><tr><th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th></tr></thead>
<tbody><tr><td>22 (+6)</td><td>14 (+2)</td><td>24 (+7)</td><td>12 (+1)</td><td>16 (+3)</td><td>18 (+4)</td></tr></tbody>
</table>

<hr>

<p><strong>Saving Throws</strong> Str +11, Con +12, Wis +8, Cha +9</p>
<p><strong>Skills</strong> Athletics +11, Intimidation +9, Perception +8</p>
<p><strong>Damage Resistances</strong> bludgeoning, piercing, slashing from nonmagical attacks</p>
<p><strong>Damage Vulnerabilities</strong> cold (SMOLDERING), fire (HOLLOW)</p>
<p><strong>Damage Immunities</strong> poison; fire (SMOLDERING) or cold (HOLLOW)</p>
<p><strong>Condition Immunities</strong> charmed, exhaustion, frightened, grappled, paralyzed, petrified, poisoned, prone, restrained</p>
<p><strong>Senses</strong> darkvision 120 ft., passive Perception 18</p>
<p><strong>Languages</strong> Common (fragmented, broken phrases)</p>
<p><strong>Challenge</strong> 13 (10,000 XP)</p>

<hr>

<h3>Traits</h3>

<p><strong>Flickering State.</strong> Exists between SMOLDERING and HOLLOW. Begins combat in SMOLDERING. Involuntarily shifts at HP thresholds (170, 115, 60). Each state has different immunities and abilities. In HOLLOW state, the Remnant heals hit points equal to any necrotic damage dealt to it instead of taking damage.</p>

<p><strong>Forge-Bound.</strong> Cannot willingly leave the forge chamber. If forced out, returns at the start of his next turn.</p>

<p><strong>Legendary Resistance (3/Day).</strong> On a failed save, can choose to succeed instead. When used, all creatures within 10 feet take 7 (2d6) fire or cold damage.</p>

<hr>

<h3>Actions</h3>

<p><strong>Multiattack.</strong> Three Forge Hammer attacks.</p>

<p><strong>Forge Hammer.</strong> <em>Melee Weapon Attack:</em> +11 to hit, reach 10 ft. <em>Hit:</em> 17 (2d10 + 6) bludgeoning plus 11 (2d10) fire (SMOLDERING) or 11 (2d10) cold plus 7 (2d6) necrotic (HOLLOW).</p>

<p><strong>Forge Breath (Recharge 5-6, SMOLDERING).</strong> 30-foot cone. DC 18 Dex save. 45 (10d8) fire damage, half on success. Creatures in water have disadvantage.</p>

<p><strong>Draining Grasp (Recharge 5-6, HOLLOW).</strong> One creature within 10 ft. DC 17 Cha save. 36 (8d8) necrotic, Remnant heals half. Target's Strength reduced by 1d4 until long rest.</p>

<hr>

<h3>Legendary Actions (3/round)</h3>

<p><strong>Hammer Strike (1).</strong> One Forge Hammer attack.</p>

<p><strong>Shift State (2).</strong> Voluntarily shifts between SMOLDERING and HOLLOW.</p>

<p><strong>Quench (2, SMOLDERING).</strong> Superheats water within 30 ft. DC 18 Con save. 22 (4d10) fire damage. Area lightly obscured.</p>

<p><strong>Frozen Grip (2, HOLLOW).</strong> Freezes water around up to two creatures within 30 ft. DC 17 Str save or restrained.</p>

<p><strong>Echoes of Regret (3).</strong> Psychic wave, 30 ft. DC 17 Wis save. On failure, disadvantage on all saves until next turn.</p>

</div>

<h2>Loot</h2>
<ul>
<li><strong>Oathbreaker's End</strong> (+2 Legendary warhammer, anti-Kaedris) — claimed by Teldryn</li>
<li><strong>Balen Bright's Journal</strong> — defector's account of Kaedris's passion-fire weapons — claimed by Teldryn</li>
</ul>

<h2>Balen Bright's Journal</h2>

<p>Found in a hidden bedroom adjacent to the forge chamber. Small leather-bound journal, stiffened with age. Last page signed: <strong>Balen Bright. B.B.</strong></p>

<blockquote><p><em>"Saw the designs today. Not weapons. Not tools. Something else. She wants to burn from the inside. Not cities. People. Individual people, one at a time, from the heart outward. I built the casing she asked for. My hands did that."</em></p></blockquote>

<blockquote><p><em>"I walked out. I felt nothing. I crossed the border and she did not stop me. Then I fell to my knees and I wept for three days. I had not wept in twenty years. I did not know I still could."</em></p></blockquote>

<blockquote><p><em>"Started the hammer. It has to be perfect. One chance. One weapon. Something that can break what I helped build."</em></p></blockquote>

<blockquote><p><em>"If anyone finds this — use it. Don't let her finish. Don't let my work be the last thing I made."</em></p></blockquote>

<blockquote><p><em>"...finish it... break the chains... all of them..."</em></p></blockquote>'''


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    for i, p in enumerate(data["Locations"]["items"]):
        if p["id"] == "the-basilica-of-the-unincarnate":
            data["Locations"]["items"][i]["content"] = BASILICA
            data["Locations"]["items"][i]["region"] = "Ancient Sites"
            print("Basilica: humanized")
        elif p["id"] == "the-hexwrights-tower":
            data["Locations"]["items"][i]["content"] = HEXWRIGHT
            print("Hexwright's Tower: humanized")

    for i, p in enumerate(data["Creatures"]["items"]):
        if p["id"] == "ridge-stalker":
            data["Creatures"]["items"][i]["content"] = RIDGE_STALKER
            print("Ridge-Stalker: humanized")

    for i, p in enumerate(data["Felled Foes"]["items"]):
        if p["id"] == "the-crowned-one":
            data["Felled Foes"]["items"][i]["content"] = CROWNED_ONE
            print("Crowned One: humanized")
        elif p["id"] == "the-smoldering-remnant":
            data["Felled Foes"]["items"][i]["content"] = SMOLDERING
            print("Smoldering Remnant: humanized")

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Saved.")


if __name__ == "__main__":
    main()
