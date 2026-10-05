"""Publish hand-written entity pages into the local site data.

Run from any directory: python scripts/build-entities.py
Reads content/entities/<Category>/<id>.md. Each file starts with a YAML header:

    ---
    category: NPCs            # a top-level data.json category
    id: poor-tam              # stable item id (used in the URL hash)
    title: Poor Tam
    region: Ossathar          # NPCs/Locations only; added to the nav if missing
    era: living
    frontmatter: {role: ..., status: ..., location: ...}
    portrait: images/X.webp   # optional, NPC-style framed portrait
    image: images/X.webp      # optional, full-width content image
    image_alt: ...            # optional alt text for portrait/image
    unknown_portrait: true    # optional; no image, the card shows a "?"
    summary: "**Role:** ... | **Status:** ..."   # optional one-line header
    ---
    Markdown body.

An existing item with the same id is replaced; everything else in data.json is
left alone. Requires PyYAML, Markdown and Pillow. Does not touch the vault or deploy.

A file whose header says `overlay: living` does not replace anything. It gives an
existing archive entry (matched by id) a living-realm version instead: the page is
rendered into that item's `contentLiving`, its frontmatter into `frontmatterLiving`,
and the item's era becomes `both`. The archive keeps the full original record.
Use it for someone the fallen party knew whom the living party has since met.
"""
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
import json
import re

import markdown
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content' / 'entities'
DATA = ROOT / 'public' / 'data.json'
REGION_CATEGORIES = {'NPCs', 'Locations'}
TAIL_REGIONS = ['Ancient Sites', 'Deceased', 'Other']


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, text):
        self.parts.append(text)


def image_attributes(match):
    tag = match.group(0)
    src = re.search(r'src="([^"]+)"', tag).group(1)
    image_path = (ROOT / 'public' / unescape(src)).resolve()
    if not image_path.is_relative_to((ROOT / 'public').resolve()):
        raise ValueError(f'Image outside public: {src}')
    if not image_path.exists():
        raise FileNotFoundError(f'Missing image: {src}')
    if 'width=' in tag:
        return tag
    with Image.open(image_path) as im:
        width, height = im.size
    return tag[:-1] + f' width="{width}" height="{height}" loading="lazy" decoding="async">'


def inline(md_text):
    html = markdown.markdown(md_text)
    return re.sub(r'^<p>(.*)</p>$', r'\1', html.strip(), flags=re.S)


def build(path):
    text = path.read_text(encoding='utf-8')
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S)
    if not match:
        raise ValueError(f'No header in {path}')
    meta = yaml.safe_load(match.group(1))
    body = match.group(2)
    title = meta['title']
    alt = escape(meta.get('image_alt') or title, quote=True)
    parts = [f'<h1>{escape(title)}</h1>']
    if meta.get('portrait'):
        parts.append(f'<div class="npc-portrait"><img src="{escape(meta["portrait"], quote=True)}" alt="{alt}"></div>')
    if meta.get('image'):
        parts.append(f'<img src="{escape(meta["image"], quote=True)}" alt="{alt}" class="content-image">')
    if meta.get('summary'):
        parts.append(f'<p>{inline(meta["summary"])}</p>')
    parts.append(markdown.markdown(body, extensions=['tables']))
    content = '\n'.join(parts)
    content = re.sub(r'<img\b[^>]*>', image_attributes, content)
    parser = TextOnly()
    parser.feed(content)
    raw = re.sub(r'\s+', ' ', ' '.join(parser.parts)).strip()
    if meta.get('overlay') == 'living':
        return meta['category'], {
            'overlay': True,
            'id': meta['id'],
            'contentLiving': content,
            'frontmatterLiving': meta.get('frontmatter') or {},
        }
    item = {
        'id': meta['id'],
        'title': title,
        'frontmatter': meta.get('frontmatter') or {},
        'content': content,
        'raw': raw,
        'era': meta.get('era', 'living'),
    }
    if meta.get('region'):
        item['region'] = meta['region']
    if meta.get('unknown_portrait'):
        item['unknownPortrait'] = True
    return meta['category'], item


data = json.loads(DATA.read_text(encoding='utf-8'))
count = 0
for path in sorted(SOURCE.rglob('*.md')):
    if path.name.lower() == 'readme.md':
        continue
    category, item = build(path)
    if category not in data:
        raise KeyError(f'{path}: unknown category {category}')
    if item.get('overlay'):
        target = next((x for x in data[category]['items'] if x['id'] == item['id']), None)
        if target is None:
            raise KeyError(f'{path}: no existing {category} item with id {item["id"]} to overlay')
        target['era'] = 'both'
        target['contentLiving'] = item['contentLiving']
        target['frontmatterLiving'] = item['frontmatterLiving']
        count += 1
        continue
    info = data[category]['info']
    region = item.get('region')
    if category in REGION_CATEGORIES and region and info.get('regions') is not None:
        regions = info['regions']
        if region not in regions:
            tail = next((i for i, r in enumerate(regions) if r in TAIL_REGIONS), len(regions))
            regions.insert(tail, region)
    items = data[category]['items']
    existing = next((i for i, x in enumerate(items) if x['id'] == item['id']), None)
    if existing is None:
        items.append(item)
    else:
        items[existing] = item
    count += 1

for category, block in data.items():
    ids = [x['id'] for x in block.get('items', [])]
    if len(ids) != len(set(ids)):
        raise ValueError(f'Duplicate ids in {category}')
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Published {count} entity pages; everything else in data.json preserved.')
