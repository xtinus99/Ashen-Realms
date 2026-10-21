"""Build light card thumbnails and face-centred avatars for every compendium entry picture.

Outputs (WebP):
  public/thumbnails/<name>.webp         short side 480 px, for cards and lists
  public/thumbnails/faces/<name>.webp   160 x 160 square centred on the face, for the
                                        sidebar, the home page party and Bonds

An entry's picture is chosen the way scripts/build-data.mjs chooses it: a session's
cover, otherwise the first image in the entry. House crests (info.subgroupIcons) are
included too.

Face boxes come from PhotoCraft's face detector (image.detectFaces) and are kept in
scripts/face-boxes.json, so a re-run only looks at new pictures. To fix a bad crop,
edit that picture's "face" box ([x, y, width, height] in source pixels) and set
"manual": true; the script never overwrites a manual box.

Uses the PhotoCraft command line when it is installed and Pillow otherwise.
Outputs newer than their source are skipped unless --force is given.

    python scripts/build-thumbnails.py [--force] [--workers 6]
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
THUMBS = os.path.join(PUBLIC, 'thumbnails')
FACES = os.path.join(THUMBS, 'faces')
BOXES_PATH = os.path.join(ROOT, 'scripts', 'face-boxes.json')
PHOTOCRAFT = os.environ.get('PHOTOCRAFT_CLI') or shutil.which('photocraft-cli') or \
    r'C:\Program Files\PhotoCraft\photocraft-cli.exe'
HAS_PHOTOCRAFT = os.path.exists(PHOTOCRAFT)

SHORT_SIDE = 480
AVATAR = 160


def first_image(html):
    m = re.search(r'<img[^>]+src=(["\'])(.*?)\1', html or '', re.I)
    return m.group(2) if m else None


def entry_pictures():
    data = json.load(open(os.path.join(PUBLIC, 'data.json'), encoding='utf-8'))
    pics = set()
    for cat in data.values():
        if not isinstance(cat, dict):
            continue
        items = list(cat.get('items', []))
        for sub in (cat.get('subcategories') or {}).values():
            items.extend(sub)
        for item in items:
            img = item.get('cover') or first_image(item.get('contentLiving') or item.get('content'))
            if img:
                pics.add(img)
            if cat is data.get('Party'):
                img = first_image(item.get('content'))
                if img:
                    pics.add(img)
        for src in ((cat.get('info') or {}).get('subgroupIcons') or {}).values():
            pics.add(src)
    return sorted(p for p in pics if p.startswith('images/') and os.path.exists(os.path.join(PUBLIC, p)))


def image_size(path):
    from PIL import Image
    with Image.open(path) as im:
        return im.size


def detect_face(path, w, h):
    if not HAS_PHOTOCRAFT:
        return None
    out = subprocess.run([PHOTOCRAFT, 'run', path, '--cmd', 'image.detectFaces', '--params', '{"minScore":0.5}'],
                         capture_output=True, text=True, timeout=180)
    try:
        faces = json.loads(out.stdout.strip().splitlines()[-1])['result']['faces']
    except (IndexError, KeyError, ValueError):
        return None
    for f in faces:
        x, y, fw, fh = f['rect']
        # Ignore small faces in the background of a scene.
        if f['score'] >= 0.6 and fh >= 0.05 * h:
            return [round(x), round(y), round(fw), round(fh)]
    return None


def avatar_square(w, h, face):
    """Square crop (x, y, side) in source pixels."""
    if face:
        x, y, fw, fh = face
        side = max(fw, fh) * 2.4
        cx, cy = x + fw / 2, y + fh / 2 + fh * 0.12
    elif h > w * 1.05:
        # A portrait without a detected face: its subject is usually high and centred.
        side, cx, cy = w * 0.8, w / 2, w * 0.42
    else:
        side, cx, cy = min(w, h), w / 2, h / 2
    side = min(side, w, h)
    left = min(max(cx - side / 2, 0), w - side)
    top = min(max(cy - side / 2, 0), h - side)
    return round(left), round(top), round(side)


def fresh(dst, src):
    return os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)


def run_photocraft(src, dst, command, params, quality):
    out = subprocess.run([PHOTOCRAFT, 'run', src, '--cmd', command, '--params', json.dumps(params),
                          '--out', dst, '--format', 'webp', '--quality', str(quality)],
                         capture_output=True, text=True, timeout=300)
    if out.returncode != 0 or not os.path.exists(dst):
        raise RuntimeError(f'PhotoCraft failed on {src}: {out.stderr.strip()[:300]}')


def build_one(rel, box, force):
    src = os.path.join(PUBLIC, rel)
    name = os.path.basename(rel)
    thumb, face = os.path.join(THUMBS, name), os.path.join(FACES, name)
    w, h = box['size']
    done = []
    if force or not fresh(thumb, src):
        scale = min(1.0, SHORT_SIDE / min(w, h))
        tw, th = round(w * scale), round(h * scale)
        if HAS_PHOTOCRAFT:
            run_photocraft(src, thumb, 'image.imageSize', {'width': tw, 'height': th, 'resample': 'bicubicSharper'}, 80)
        else:
            from PIL import Image
            with Image.open(src) as im:
                im.convert('RGB').resize((tw, th), Image.LANCZOS).save(thumb, 'WEBP', quality=80, method=6)
        done.append('thumb')
    if force or not fresh(face, src):
        x, y, s = avatar_square(w, h, box.get('face'))
        if HAS_PHOTOCRAFT:
            run_photocraft(src, face, 'image.crop', {'x': x, 'y': y, 'width': s, 'height': s, 'targetWidth': AVATAR,
                                                     'targetHeight': AVATAR, 'resample': 'lanczos'}, 82)
        else:
            from PIL import Image
            with Image.open(src) as im:
                im.convert('RGB').crop((x, y, x + s, y + s)).resize((AVATAR, AVATAR), Image.LANCZOS) \
                    .save(face, 'WEBP', quality=82, method=6)
        done.append('face')
    return rel, done


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--force', action='store_true', help='rebuild every output')
    ap.add_argument('--workers', type=int, default=6)
    args = ap.parse_args()

    os.makedirs(FACES, exist_ok=True)
    boxes = json.load(open(BOXES_PATH, encoding='utf-8')) if os.path.exists(BOXES_PATH) else {}
    pictures = entry_pictures()
    print(f'{len(pictures)} entry pictures; PhotoCraft {"found" if HAS_PHOTOCRAFT else "not found, using Pillow"}')

    def ensure_box(rel):
        src = os.path.join(PUBLIC, rel)
        box = boxes.get(rel, {})
        size = list(image_size(src))
        if box.get('manual') and box.get('size') == size:
            return rel, box
        if box.get('size') != size or 'face' not in box:
            box = {'size': size, 'face': detect_face(src, *size)}
        return rel, box

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for rel, box in pool.map(ensure_box, pictures):
            boxes[rel] = box
    json.dump({k: boxes[k] for k in sorted(boxes)}, open(BOXES_PATH, 'w', encoding='utf-8'), indent=1)

    built = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for rel, done in pool.map(lambda r: build_one(r, boxes[r], args.force), pictures):
            if done:
                built += 1
    faces_found = sum(1 for p in pictures if boxes[p].get('face'))

    # Face centres as fractions of the picture, so the site can keep a face in view
    # when it crops a picture into a wide banner (session covers).
    centres = {}
    for rel in pictures:
        face, (w, h) = boxes[rel].get('face'), boxes[rel]['size']
        if face:
            x, y, fw, fh = face
            centres[os.path.splitext(os.path.basename(rel))[0]] = [round((x + fw / 2) / w, 3), round((y + fh / 2) / h, 3)]
    with open(os.path.join(THUMBS, 'faces.json'), 'w', encoding='utf-8') as fh:
        json.dump(centres, fh, separators=(',', ':'), sort_keys=True)
    print(f'Built outputs for {built} pictures ({faces_found} with a face box).')


if __name__ == '__main__':
    sys.exit(main())
