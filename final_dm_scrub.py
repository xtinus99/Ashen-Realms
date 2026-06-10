"""
Final DM-leak scrub:
- Strip all Heartwood Splinter mentions (player tracks manually)
- Strip all party gold tracking from sessions
"""
import json
import re

PATH = r"C:\Users\khali\Documents\DND Campaign\player-site\public\data.json"


def scrub_party_gold(c: str) -> str:
    """Remove every 'Party Gold' line, regardless of phrasing."""
    patterns = [
        # Standalone p with bold "Party Gold..."
        r"<p><strong>Party Gold[^<]*</strong>[^<]*</p>\s*",
        # p with both bold + plain mix: <p><strong>Party Gold:</strong> ~xxxg</p>
        r"<p><strong>Party Gold:</strong>[^<]*</p>\s*",
    ]
    for pat in patterns:
        c = re.sub(pat, "", c, flags=re.IGNORECASE)
    return c


def scrub_splinter_session_32(c: str) -> str:
    """Remove the Debuff 2 block and the summary clause."""
    # 1) The whole Debuff 2 paragraph + UL
    c = re.sub(
        r"<p><strong>Debuff 2[^<]*Heartwood Splinter[^<]*</strong></p>\s*<ul>.*?</ul>\s*",
        "",
        c,
        flags=re.DOTALL,
    )
    # 2) Clause inside the summary <li> — strip "Heartwood Splinter (-15 HP max, exhaustion risk), "
    c = c.replace(
        "Stolen Fortune (no advantage), Heartwood Splinter (-15 HP max, exhaustion risk), The Ship's Call",
        "Stolen Fortune (no advantage), The Ship's Call",
    )
    return c


def scrub_splinter_session_33(c: str) -> str:
    # 1) Narrative line — drop the splinter clause but keep the rest of the paragraph
    c = c.replace(
        " He woke with the taste of heartwood rum in his mouth and the splinter in his forearm warm to the touch.",
        " He woke with the taste of heartwood rum in his mouth.",
    )
    # 2) The "long rest CON save SUCCESS" paragraph — drop entirely
    c = re.sub(
        r"<p><strong>Heartwood Splinter — long rest CON save \(DC 14\) — SUCCESS\.</strong>[^<]*</p>\s*",
        "",
        c,
    )
    # 3) Table row "First night — Heartwood Splinter"
    c = re.sub(
        r"<tr><td><strong>First night — Heartwood Splinter</strong></td><td>[^<]*</td></tr>\s*",
        "",
        c,
    )
    # 4) Party-status table debuff list — strip the splinter clause
    c = c.replace(
        "Debuffs: Stolen Fortune (no advantage), Heartwood Splinter (-15 HP max, exhaustion risk), Ship's Call",
        "Debuffs: Stolen Fortune (no advantage), Ship's Call",
    )
    return c


def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    for s in data["Sessions"]["items"]:
        sid = s["id"]
        c = s["content"]
        original = c

        # Party gold scrub: apply to every session
        c = scrub_party_gold(c)

        # Splinter scrubs: only sessions where they appear
        if sid == "session-32":
            c = scrub_splinter_session_32(c)
        elif sid == "session-33":
            c = scrub_splinter_session_33(c)

        if c != original:
            s["content"] = c
            print(f"  scrubbed: {sid}")

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Saved.")


if __name__ == "__main__":
    main()
