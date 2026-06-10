# -*- coding: utf-8 -*-
import json, os, re, html

VAULT = r"C:\Users\khali\Documents\DND Campaign\DND Campaign"
DATA = "public/data.json"

def norm(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    for a, b in [('“','"'),('”','"'),('‘',"'"),('’',"'"),('—','-'),('–','-')]:
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip().lower()

# Build a normalized corpus of the whole vault
corpus = []
for root, _d, files in os.walk(VAULT):
    for f in files:
        if f.endswith(".md"):
            try: corpus.append(norm(open(os.path.join(root, f), encoding="utf-8").read()))
            except Exception: pass
CORPUS = " \n ".join(corpus)

# Entries I authored/added this session
MINE = {
 "tarrin-vander","lord-theron-vander","iselle-vander","halric-vander","mara-vander",
 "aldous-vander","joran-vander","delvin","naya-selvik","steward-mavris","korven-strake",
 "mor","veil","vex","twin-reach","the-threshold","the-common-cup","the-roll",
 "the-skyfathers-reckoning","brancalic","the-thing-in-the-tower",
}
data = json.load(open(DATA, encoding="utf-8"))
def walk():
    for cat, cd in data.items():
        for it in cd.get("items", []): yield cat, it
        for arr in (cd.get("subcategories") or {}).values():
            for it in arr: yield cat, it

def found(qn):
    # try a few fragments of the quote against the corpus
    if len(qn) < 12: return qn in CORPUS
    for start in (0, len(qn)//3, len(qn)//2):
        frag = qn[start:start+28]
        if len(frag) >= 12 and frag in CORPUS:
            return True
    return False

print("=== BLOCKQUOTES in my-added entries ===\n")
for cat, it in walk():
    if it.get("id") not in MINE: continue
    for m in re.finditer(r'<blockquote>(.*?)</blockquote>', it.get("content",""), re.S):
        raw = m.group(1)
        qn = norm(raw)
        # strip a leading attribution-only? keep whole
        verdict = "VAULT-SOURCED" if found(qn) else ">>> NOT IN VAULT (check)"
        disp = re.sub(r'<[^>]+>',' ', raw); disp = html.unescape(disp); disp = re.sub(r'\s+',' ',disp).strip()
        print(f"[{it.get('title')}] {verdict}\n    {disp[:130]}\n")
