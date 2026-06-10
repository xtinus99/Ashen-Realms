"""
Regenerate the `raw` field for entries I added/modified, derived from
current `content` HTML. The `raw` field powers the related-articles
substring lookup; stale values link unrelated entries.
"""
import json
import re

PATH = r"C:\Users\khali\Documents\DND Campaign\player-site\public\data.json"

# Entries whose content I changed in this round
TARGETS = {
    "Sovereigns": [
        "karthayne-the-hollow-crown",
        "aral-vyn-the-bladed-saint",
        "kaedris-the-crimson-matron",
    ],
    "NPCs": ["galheran", "velara-ashyn"],
    "Items": ["the-vigil", "passion-seed"],
    "Locations": [
        "the-basilica-of-the-unincarnate",
        "the-hexwrights-tower",
    ],
    "Creatures": ["ridge-stalker"],
    "Felled Foes": ["the-crowned-one", "the-smoldering-remnant"],
    "Party": ["sol-raven", "fursen", "teldryn"],
}


def html_to_raw(html: str) -> str:
    """Strip HTML and the leading h1 title, leaving plain searchable text."""
    # Drop the h1 title (first one only)
    text = re.sub(r"<h1[^>]*>.*?</h1>", "", html, count=1, flags=re.DOTALL)
    # Drop image tags
    text = re.sub(r"<img[^>]*>", "", text)
    # Convert remaining tags to spaces
    text = re.sub(r"<[^>]+>", " ", text)
    # Decode common HTML entities
    text = (
        text.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
        .replace("&emsp;", " ")
    )
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated = 0
    for cat_name, ids in TARGETS.items():
        for entry_id in ids:
            for i, p in enumerate(data[cat_name]["items"]):
                if p["id"] == entry_id:
                    new_raw = html_to_raw(p["content"])
                    data[cat_name]["items"][i]["raw"] = new_raw
                    print(f"{cat_name}/{entry_id}: raw[:100]={new_raw[:100]!r}")
                    updated += 1
                    break

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\nUpdated {updated} raw fields.")


if __name__ == "__main__":
    main()
