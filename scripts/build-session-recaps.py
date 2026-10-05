"""Publish the hand-edited Markdown recaps into the local site data.

Run from any directory: python scripts/build-session-recaps.py
Publishes every content/sessions/session-NN.md.
Requires Markdown and Pillow. Does not modify the campaign vault or deploy.
"""
from pathlib import Path
from html import unescape
from html.parser import HTMLParser
import json
import re

import markdown
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content' / 'sessions'
DATA = ROOT / 'public' / 'data.json'


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
    with Image.open(image_path) as im:
        width, height = im.size
    return tag[:-1] + f' width="{width}" height="{height}" loading="lazy" decoding="async">'


data = json.loads(DATA.read_text(encoding='utf-8'))
sessions = data['Sessions']['items']
numbers = sorted(int(p.stem.split('-')[1]) for p in SOURCE.glob('session-*.md'))
for number in numbers:
    path = SOURCE / f'session-{number}.md'
    md = path.read_text(encoding='utf-8')
    # An optional "<!-- cover: images/X.webp -->" line picks the session's cover image
    # (cards and nav thumbnails); without it, the cover is the recap's first image.
    cover_match = re.search(r'^<!--\s*cover:\s*(.+?)\s*-->[ \t]*\n?', md, re.M)
    cover = None
    if cover_match:
        cover = cover_match.group(1).strip()
        if not (ROOT / 'public' / cover).exists():
            raise FileNotFoundError(f'session-{number}: missing cover image {cover}')
        md = md[:cover_match.start()] + md[cover_match.end():]
    title = re.search(r'^# Session \d+ — (.+)$', md, re.M).group(1)
    content = markdown.markdown(md, extensions=['tables'])
    content = re.sub(r'<img\b[^>]*>', image_attributes, content)
    text_parser = TextOnly()
    text_parser.feed(content)
    raw = re.sub(r'\s+', ' ', ' '.join(text_parser.parts)).strip()
    item = next((x for x in sessions if x['id'] == f'session-{number}'), None)
    if item is None:
        item = {'id': f'session-{number}'}
        sessions.append(item)
    item.update(title=f'Session {number}: {title}', content=content, raw=raw)
    if cover:
        item['cover'] = cover
    else:
        item.pop('cover', None)
    item.setdefault('frontmatter', {}).update(session=str(number), type='Session Log')

ids = [item['id'] for item in sessions]
if len(ids) != len(set(ids)):
    raise ValueError('Duplicate session IDs')
DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Updated Sessions {numbers[0]}–{numbers[-1]}; all other categories and earlier sessions preserved.')
