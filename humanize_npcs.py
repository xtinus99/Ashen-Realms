# -*- coding: utf-8 -*-
import json
DATA = "public/data.json"
data = json.load(open(DATA, encoding="utf-8"))

N = {
"tarrin-vander": """<h2>Who He Is</h2>
<p>The younger of Lord Theron Vander&rsquo;s two children, nineteen years old, slight and ink-stained, with a scholar&rsquo;s stoop and the over-corrected posture of someone told to stand up straight his whole life. He holds no formal duties in the house and never wanted any; what he wants is books. He has been a regular at the Docent&rsquo;s Archive for years, and he is one of the very few people in Crownfall who can read Brancalic on sight, well enough to translate it for a fee, which is rarer in the city than it sounds.</p>
<h2>The One Who Read the Boxes</h2>
<p>Tarrin is the only Vander in three generations to actually go through the family&rsquo;s old papers, and he had pieced together more of the truth than anyone living. He knew there was a gap in the family register around the move to Crownfall, three or four ancestors who must have existed but were never named, and a founder&rsquo;s letter forbidding the family from ever going west. He carried it alone for years, waiting on something he could not have put a name to, until three strangers turned up at his father&rsquo;s door with an iron-flower crest and a dead woman&rsquo;s name.</p>
<h2>West, With the Party</h2>
<p>Lord Theron sent him to Twin Reach with the trio instead of his sister, the scholar over the heir. His blood opened the sealed vault door where the family&rsquo;s old line had ended a hundred and eighty years before. Inside, he read the recovered records book before anyone else could, and its contents are in his head now whether or not it is ever opened again. He carried the household&rsquo;s dead home with him, and the remains of the never-born child found in the dark, meaning to lay all of them to rest properly and with their names.</p>
<blockquote><p>&ldquo;There&rsquo;s a gap in our register, around the move. Three or four people who must have existed. Even families that lose people name them. I&rsquo;ve wondered about that for years.&rdquo;</p></blockquote>
<h2>Manner</h2>
<p>Quiet, careful with his words, a little soft in company. He doesn&rsquo;t argue so much as ask questions back, and when he is pressed he reaches for a document rather than an opinion, because a document is where he feels surest of himself. His elder sister is the better scholar of the two. He knows it, and tries harder anyway.</p>""",

"lord-theron-vander": """<h2>Who He Is</h2>
<p>The head of House Vander, a minor Crownfall line six generations into the city, respectable but not rich and nowhere near the Ten Coinholders. He is in his late forties, with a neat greying beard and the iron-flower crest pinned at his breast more out of principle than pride. A measured, tired-courteous man, he has spent his life keeping the family from sliding any further down the ladder.</p>
<h2>The Story He Grew Up With</h2>
<p>Theron inherited a clean, tender version of the family&rsquo;s origin. Long ago the Vanders died in a war at a western waystation, a four-year-old boy was saved by his nanny and brought to Crownfall, and from him the whole line descends. With the story came an oath, six generations unbroken: they do not go west. And with it came a vague sense that the family had once been larger and richer than the modest house he runs today.</p>
<h2>What the Party Brought Him</h2>
<p>The trio arrived with proof the story was incomplete. They had an iron-flower crest recovered from the waystation itself, the name Mara, and an account of his own ancestor named aloud in the ruins. He heard them out and asked for evidence, and once he could not pretend the crest was not his, he authorised the recovery and sent his son Tarrin west in his place. What came back from that vault rewrote the gentle story he was raised on, and he was not the same man after it.</p>
<blockquote><p>&ldquo;My ancestor was a child when his family died. That&rsquo;s the story I grew up with. If you&rsquo;re telling me there is more to it, and you have proof, then we should sit down.&rdquo;</p></blockquote>""",

"iselle-vander": """<h2>Who She Is</h2>
<p>Lord Theron&rsquo;s elder child and heir, twenty-two, and by every practical measure the one who actually runs House Vander. She has kept the family&rsquo;s accounts and correspondence since she was eighteen. Sharp and plainspoken, she is quick to notice when she is being managed, learned Brancalic properly at the Archive, and reads a room without seeming to. Her father holds the title; she holds the ledgers.</p>
<h2>Standing on House Grounds</h2>
<p>When the trio&rsquo;s business carried her father&rsquo;s household west, it was her younger brother Tarrin who went and Iselle who stayed to keep the house. The party dealt mostly with Theron and Tarrin, and knew Iselle largely by reputation: the harder, more practical Vander mind, the one who would have asked who sent them and what the sender wanted before her father had finished being polite.</p>
<blockquote><p>&ldquo;My family doesn&rsquo;t have western holdings worth recovering. Not on paper, anyway. So if you&rsquo;re telling me there&rsquo;s a sealed Vander vault three days west, I have two questions: who sent you, and what do they want out of it?&rdquo;</p></blockquote>""",

"halric-vander": """<h2>The Son Who Bled in the Dark</h2>
<p>Mara Vander&rsquo;s eldest child and the heir-in-waiting of the old, pre-Crownfall Vander line. When a raiding-war reached the family&rsquo;s western waystation a hundred and eighty years ago, Halric, barely out of his teens, took a deep wound and fled down the sunken stair to the family vault. He bled out there alone, behind a sealed adamantine door, and his grief and rage did not rest with him. His bones lay curled against the chamber wall for a hundred and eighty years.</p>
<h2>The Stand</h2>
<p>When Tarrin&rsquo;s blood opened that door, Halric rose: a spectral knight in a ruined iron-flower breastplate, sword and shield of cold light, the death-wound still open at his side, a century and a half of fury in a face no older than the living kinsman who had freed him. He froze at the sight of a Vander, half-knowing the blood. The party never got the chance to reach him with a name; the fight was already on, and they put him down, and his bones dropped back to the wall.</p>
<p>He was the &ldquo;brother&rdquo; the little apparition in the ruins kept asking after, the half-sibling she never met, whose shape the haunting had given her. He fell the same hour she had asked Farkas after him.</p>
<h2>What He Left</h2>
<p>A masterwork Vander Heritage Longsword with the iron flower worked into its cross-guard, an Iron-Flower Shield bearing the family arms, and a breastplate too far rotted to wear. Tarrin claimed all of it, to lay Halric&rsquo;s bones and the rest of the household dead to rest properly, with their names.</p>""",

"mara-vander": """<h2>The Mother in the Corridor</h2>
<p>A young noblewoman of House Vander, not yet thirty, who died at the Twin Reach waystation the night a raiding-war reached it, a hundred and eighty years ago. The party never met her in life. They met her in the ruin&rsquo;s residue: a figure walking the corridor in total dissociation, barefoot, her hair undone, a vacant smile on her face, carrying a small wrapped bundle as though it were laundry.</p>
<h2>The Secret She Carried</h2>
<p>Mara had been hiding a pregnancy from the household. Not her young son, who was openly hers, but a second, secret child whose father was never named. It came to term in the chaos of the family&rsquo;s flight to the waystation, and in the privacy of the family vault she gave it up to the dark. The wrapped bundle the party found sealed in that vault was that child. A few hours later the raiders came, and Mara died with almost everyone else.</p>
<p>For a hundred and eighty years House Vander did not even remember her name, only a gap in the register where she should have been. The party carried it back to her descendants. To the living Vanders, Mara was new information.</p>""",

"aldous-vander": """<h2>The Grandfather at the Door</h2>
<p>The patriarch of House Vander in the years before Crownfall: Mara&rsquo;s father, an old man by the standards of his day, &ldquo;Grandpapa&rdquo; to the household&rsquo;s children. The family then held a western estate and a waystation on the old Sprawl-trade road, and Aldous had spent decades of his life compiling the family&rsquo;s trade-and-lineage register, the very book that was sealed inside the vault.</p>
<h2>The Last Night</h2>
<p>On the night the household fled to the waystation, Aldous discovered what his daughter meant to do. The party saw the confrontation replayed in the ruins: a translucent, colour-leached old man in the main hall, gesturing in fury at a daughter who would not look at him.</p>
<blockquote><p>&ldquo;You can&rsquo;t keep doing this, Mara. The Vander line will not bear it.&rdquo;</p></blockquote>
<p>It was the moment that gave the party the family&rsquo;s name. Aldous died in the raid a few hours later, defending the household, and his afterimage still lingers by the eastern doorpost where he fell.</p>""",

"joran-vander": """<h2>The Boy Who Was Saved</h2>
<p>Joran was four years old the night his family died at the Twin Reach waystation. His nanny, Brenna, smuggled him out a side passage as the raiders came in and walked him to Crownfall over the days that followed, where distant Vander cousins took him in. He grew up, married, and fathered the line that runs down to Lord Theron and his children today. Of everyone in the household that night, Joran alone survived, and every living Vander&rsquo;s blood opens the vault door because of it.</p>
<h2>The One Expedition</h2>
<p>At twenty-three he led a single expedition west, six men with him, to find the waystation and bury his family. He found it, the iron-flower crest still legible under the moss, and went down to the sealed door. He did not open it. That night the ruin&rsquo;s residue played for him: his mother and her bundle, a small girl asking if he was the brother she had been waiting for, his grandfather shouting Mara&rsquo;s name. He lost two of his men to the household&rsquo;s shades and took a wound that left his arm trembling for the rest of his life.</p>
<h2>The Oath</h2>
<p>He came home a changed man and never spoke of the trip in any detail. He left a single letter to his eldest son, setting down the prohibition and the names of the two men he had lost and nothing more, and he made his children swear never to go west. They swore. The oath held for six generations, through two more failed defiances that ended in a suicide and a haunted retreat, until the party finally gave House Vander a reason the founder never had: that the haunting could be survived, and the dead brought home.</p>
<blockquote><p>&ldquo;The family died there. The family stays dead. You will not go west. None of you will ever go west. I have looked, and what is there is not for us.&rdquo;</p></blockquote>""",

"delvin": """<h2>Bring My Son Back</h2>
<p>A career household guard, late forties, about ten years in Lord Theron Vander&rsquo;s service. He wears plate with the iron flower etched at the breast, carries a longsword and a cased heavy crossbow, and has the flat soldier&rsquo;s gaze that reads a room once and then watches the exits. When Theron sent his son Tarrin west to the Twin Reach vault with the trio, Delvin went as the boy&rsquo;s escort. His standing order was four words, bring my son back, and as far as Delvin is concerned that is the whole of his job.</p>
<h2>The Twin Reach Run</h2>
<p>He met the party at the West Gate at dawn, read them once, and got on with it. He kept the flanks on the road, let them set the pace, and put himself between Tarrin and every sign of trouble. When the distant boom of the falling Hexwright&rsquo;s Tower rolled in, he waved it off: &ldquo;a long way off, young master. Not our road.&rdquo; At the vault he held the corridor with Tarrin rather than make the family&rsquo;s business his own, but when the wraith dropped both Anvil and Ratsby, it was Delvin who kept them breathing, stabilising both with Tarrin&rsquo;s healing supplies. He brought the young master home. That was the job, and he did it.</p>""",

"naya-selvik": """<h2>The Veilwalker</h2>
<p>The head of House Selvik, the Veilwalkers, the Coinholder house that runs salvage and expeditions into the deep Unclaimed. Naya has been farther out there than almost anyone alive, and it shows. She is wiry and weather-beaten, two fingers lost to frostbite in some time-locked zone, older in the face than her years. She took her first expedition at sixteen and led the worst of them at forty; the survivors of that one do not talk about it, and neither does she. She drinks but never seems drunk, speaks rarely, and is listened to when she does.</p>
<h2>The Hand Behind the Contracts</h2>
<p>The party have never had to sit across from her, but every Selvik job traces back to her desk. It was Naya who put Korven Strake on Ratsby, and Naya whose long game set the Twin Reach contract in motion. She trusts almost no one and interferes with her operators almost never. When House Selvik wants something it commits, and it does not forget a debt or a runner.</p>""",

"steward-mavris": """<h2>The Face of the Contract</h2>
<p>House Selvik&rsquo;s contracts steward: a warm, talkative man in his mid-fifties, dressed in the house&rsquo;s black-and-grey, working behind a ledger-hung desk with a pot of tea always going. He was the face the party dealt with for the Twin Reach job. Friendly, unhurried, genuinely good company, and an absolute master of telling you a great deal while disclosing nothing the house would rather keep. The withholding is buried under the chat.</p>
<h2>What He Wasn&rsquo;t Saying</h2>
<p>Mavris knew from the start what the sealed vault really held: a Conquest-era trade-and-lineage records book House Selvik had been quietly chasing for decades, ever since their surveyors matched an iron-flower boundary stone to House Vander a hundred years ago. He handed over the contract terms cleanly, three hundred gold and a thirty-percent share of salvage, and let the party find out the rest for themselves. When they came back having learned it, the Vander name, the family records, Selvik&rsquo;s commercial interest, he did not pretend otherwise. The lie was a passive one, and he does not double down once it is exposed.</p>
<blockquote><p>&ldquo;The contract specifies recovery of a sealed item from a pre-Conquest waystation. It specifies the gold and the salvage share. It does not specify how. That is the operator&rsquo;s matter.&rdquo;</p></blockquote>""",

"korven-strake": """<h2>The Last Walk</h2>
<p>House Selvik&rsquo;s premier urban recovery operator, the man they send when a thief or a runner has gone to ground inside the city. He is wiry and built for walking rather than fighting, and the Unclaimed has marked him: a time-stretched left cheek that pulls his face into a permanent half-grin, a shadow-burn at one temple, and a left eye that blinks a half-beat out of rhythm with the right, which you cannot stop noticing once you have. He does not run. He walks, and he covers more ground than anyone because he never stops. He has not failed a city recovery in fourteen years.</p>
<h2>He Reads the Gait</h2>
<p>A target can change clothes, dye hair, mask his scent, but Korven hunts the way a person walks, and that is far harder to fake. It is how he found Ratsby. Hired on the 12th of Hathren to recover the goblin and the coin he had lifted from Salvager&rsquo;s Square, Korven ran him down at the Common Cup and closed the contract with his streak intact. Ratsby was held, and Anvil bailed him out. There is no active hunt now and no mark on him, but Korven knows Ratsby&rsquo;s gait is on file, and Anvil is still owed the bail.</p>
<h2>Manner</h2>
<p>Sparse, cold, never cruel and never in a hurry. With small prey he turns theatrical, sitting down uninvited, giving the asymmetric grin, naming your alias and your take and offering to buy you a drink while you decide. With anything he reckons genuinely dangerous the grin vanishes, and that is the tell worth watching. If the grin disappears, you have just been reclassified.</p>""",

"mor": """<h2>Who She Is</h2>
<p>A wiry goblin woman in her late twenties, sharp-eyed and faintly amused, with a thin scar across the bridge of her nose and a small bone hairpin holding back her cropped dark hair. She is an Ashford refugee who fled the burning city and was scooped up by Crownfall&rsquo;s slave market on her second day; Madame Veshra Coil bought and freed her on the third. She stays at the Silken Refuge by choice.</p>
<h2>Manner</h2>
<p>Biting humour in a Crownfall street-cadence with a goblin lilt, teasing without cruelty, with a soft spot for small-folk who rarely see one of their own in a place like the Refuge. She reads a person like a question she has already answered. She will not talk about Ashford, and her grin goes quiet when she is actually enjoying herself. Ratsby found her good company.</p>""",

"veil": """<h2>Who She Is</h2>
<p>An air genasi of apparent late twenties, with crystal-pale skin that carries the barest blue undertone, long white-silver hair that drifts upward and sideways even in still air, eyes the colour of a clear winter sky, and faint pale-blue patterns traced along her temples and collarbones like cloud-script. Before the Silken Refuge she was kept as a &ldquo;weather instrument&rdquo; in some Sovereign-adjacent court. Madame Veshra got her out of it, and the precise how is left unspoken.</p>
<h2>Manner</h2>
<p>Quiet, contemplative, half-otherworldly, she speaks in a soft voice the room seems to lean toward. People who come to her wanting to feel rare tend to leave saying they were the rare thing. Farkas spent his first real night in Crownfall in her company.</p>""",

"vex": """<h2>Who She Is</h2>
<p>A drow of apparent thirties, with obsidian skin, stark white hair cropped short and practical, pale lavender eyes that glow faintly in the dark, and sharp angular features. She fled the politics of the underdark only to be taken by surface slavers who figured an exotic dark elf would fetch a premium. She did, and Madame Veshra outbid everyone. She stays out of fierce loyalty to the one person who treated her as a person rather than a curiosity.</p>
<h2>Manner</h2>
<p>Sharp, sardonic, and entirely unbothered. She speaks in short declarative sentences, deadpan, her lavender eyes tracking the whole room without her head moving. She reads a client in about three seconds and tells him so. She enjoys reminding surface-dwellers she is not as tame as they assume, and she does not perform a warmth she does not feel. She handles the ones who want something with an edge to it, on terms she sets and a stop-word that ends everything the instant it is spoken.</p>
<blockquote><p>&ldquo;You&rsquo;re new. You&rsquo;re nervous. Don&rsquo;t pretend otherwise. Pretending is more work than you came here for.&rdquo;</p></blockquote>""",
}

items = data["NPCs"]["items"]
done = []
for eid, prose in N.items():
    e = next(x for x in items if x["id"] == eid)
    c = e["content"]
    e["content"] = c[:c.index("</p>") + 4] + "\n\n" + prose
    done.append(eid)

json.dump(data, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
d2 = json.load(open(DATA, encoding="utf-8"))
moji = sum(1 for e in d2["NPCs"]["items"] if e["id"] in N for ch in e["content"] if (0x80 <= ord(ch) <= 0x9F) or ch in "âÃ")
print(f"humanized {len(done)} NPCs: {done}")
print(f"mojibake in those entries: {moji}")
