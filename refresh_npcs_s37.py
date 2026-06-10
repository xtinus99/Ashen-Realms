"""
Refresh existing player-site NPC pages with current vault content (post-S37).

For each NPC: read the vault file, apply the DM filter (strip Quick Reference,
DM-Side sections, callouts, etc.), convert to HTML, replace data.json content.
Preserve existing region/frontmatter on the data.json entry.
"""

import json
import re
from pathlib import Path

# Reuse the filter + converter from add_session_37_content
import sys
sys.path.insert(0, str(Path(__file__).parent))
from add_session_37_content import filter_dm_lines, md_to_html

VAULT = Path("C:/Users/khali/Documents/DND Campaign/DND Campaign")
DATA_JSON = Path("C:/Users/khali/Documents/DND Campaign/player-site/public/data.json")

# (id_in_datajson, vault_path_relative_to_VAULT, image_stem)
TARGETS = [
    ("senna",         "03 - NPCs/Crownfall/Senna.md",                   "Senna"),
    ("sister-varen",  "03 - NPCs/Veinspire/Sister Varen.md",            "Sister Varen"),
    ("the-dealer",    "03 - NPCs/Crownfall/The Dealer (Green Door).md", "The Dealer"),
    ("vela-thorne",   "03 - NPCs/Veinspire/Vela Thorne.md",             "Vela Thorne"),
    ("veshra-coil",   "03 - NPCs/Crownfall/Veshra Coil.md",             "Veshra Coil"),
    ("captain-hael",  "03 - NPCs/Crownfall/Captain Hael.md",            "Captain Hael"),
    ("the-docent",    "03 - NPCs/Crownfall/The Docent.md",              "The Docent"),
    ("seraphine-vale","03 - NPCs/Veinspire/Seraphine Vale.md",          "Seraphine - Returned"),
]


def render_content(vault_path: Path, image_stem: str) -> str:
    md = vault_path.read_text(encoding="utf-8")
    # Strip YAML frontmatter
    if md.startswith("---\n"):
        end = md.find("\n---\n", 4)
        if end != -1:
            md = md[end + 5:]
    md = filter_dm_lines(md)
    html = md_to_html(md)

    # Inject the npc-portrait image after the h1
    tag = f'\n<div class="npc-portrait"><img src="images/{image_stem}.webp" alt="{image_stem}"></div>\n'
    if image_stem and not re.search(rf'images/{re.escape(image_stem)}\.webp', html):
        html = re.sub(r"(<h1>[^<]+</h1>)", r"\1" + tag, html, count=1)

    return html


def main():
    with DATA_JSON.open("r", encoding="utf-8") as f:
        data = json.load(f)

    npcs_list = data["NPCs"]["items"]
    by_id = {item["id"]: item for item in npcs_list}

    for eid, vault_rel, image_stem in TARGETS:
        if eid not in by_id:
            print(f"  ! NOT FOUND in data.json: {eid}")
            continue
        vault_path = VAULT / vault_rel
        if not vault_path.exists():
            print(f"  ! MISSING vault file: {vault_path}")
            continue

        new_content = render_content(vault_path, image_stem)
        old_entry = by_id[eid]
        # Preserve region, frontmatter, id, title — replace only content
        old_entry["content"] = new_content
        print(f"  Refreshed [{eid}] ({len(new_content)} chars)")

    with DATA_JSON.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nWrote {DATA_JSON}")


if __name__ == "__main__":
    main()
