import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIR = join(ROOT, 'public');
const SOURCE_PATH = join(PUBLIC_DIR, 'data.json');
const OUTPUT_DIR = join(PUBLIC_DIR, 'data', 'items');

const data = JSON.parse(await readFile(SOURCE_PATH, 'utf8'));

function slug(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripTags(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstImage(html = '') {
  // Match the closing quote against the quote that opened src. The previous
  // character class stopped at apostrophes inside valid double-quoted paths.
  const match = html.match(/<img[^>]+src=(["'])(.*?)\1/i);
  return match?.[2] || null;
}

function sessionEvents(item) {
  const raw = item.raw || '';
  const events = [];
  const death = raw.match(/(\w+(?:\s+\w+)?)\s+(?:died|was killed|fell)\b/i);
  if (death) events.push({ type: 'death', text: death[0] });
  if (/\bacquired\b|\bdiscovered\b|\bfound\b|\brevealed\b/i.test(raw)) {
    events.push({ type: 'discovery', text: 'Major discovery' });
  }
  const sovereigns = [
    'Mareatha', 'Azerach', 'Talaris', "Vor'Kael", 'Imhuran', 'Kaedris',
    'Karthayne', 'Ismara', 'Vortegas', 'Eredain', 'Ultharion', 'Nhalyra', 'Aral-Vyn'
  ];
  const sovereign = sovereigns.find((name) => raw.includes(name));
  if (sovereign) events.push({ type: 'sovereign', text: sovereign });
  return events.slice(0, 2);
}

const allItems = [];
for (const [category, categoryData] of Object.entries(data)) {
  for (const item of categoryData.items || []) allItems.push({ category, item });
  for (const items of Object.values(categoryData.subcategories || {})) {
    for (const item of items) allItems.push({ category, item });
  }
}

const uniqueItems = [];
const uniqueKeys = new Set();
for (const entry of allItems) {
  const key = `${entry.category}/${entry.item.id}`;
  if (uniqueKeys.has(key)) continue;
  uniqueKeys.add(key);
  uniqueItems.push(entry);
}

function mentionedIds(item, selfKey) {
  const haystack = ` ${item.raw || stripTags(item.content)} `.toLowerCase();
  return uniqueItems
    .filter(({ category, item: candidate }) => {
      const candidateKey = `${category}/${candidate.id}`;
      if (candidateKey === selfKey || candidate.title.length < 4) return false;
      const escaped = candidate.title.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`).test(haystack);
    })
    .map(({ category, item: candidate }) => `${category}/${candidate.id}`);
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

const detailPaths = new Map();
for (const { category, item } of uniqueItems) {
  const categorySlug = slug(category);
  const filename = `${slug(item.id)}.json`;
  const relativePath = `data/items/${categorySlug}/${filename}`;
  const outputPath = join(PUBLIC_DIR, relativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(item), 'utf8');
  detailPaths.set(`${category}/${item.id}`, relativePath.replace(/\\/g, '/'));
}

function toStub(category, item) {
  const key = `${category}/${item.id}`;
  const image = firstImage(item.contentLiving || item.content);
  return {
    id: item.id,
    title: item.title,
    frontmatter: item.frontmatter,
    frontmatterLiving: item.frontmatterLiving,
    region: item.region,
    subgroup: item.subgroup,
    era: item.era,
    unknownPortrait: item.unknownPortrait,
    image,
    dataPath: detailPaths.get(key),
    mentions: mentionedIds(item, key),
    timelineEvents: category === 'Sessions' ? sessionEvents(item) : undefined,
    hasLivingContent: Boolean(item.contentLiving),
  };
}

const index = {};
for (const [category, categoryData] of Object.entries(data)) {
  index[category] = {
    info: categoryData.info,
    items: (categoryData.items || []).map((item) => toStub(category, item)),
  };
  if (categoryData.subcategories) {
    index[category].subcategories = Object.fromEntries(
      Object.entries(categoryData.subcategories).map(([name, items]) => [
        name,
        items.map((item) => toStub(category, item)),
      ])
    );
  }
}

const searchIndex = uniqueItems.map(({ category, item }) => ({
  category,
  id: item.id,
  title: item.title,
  raw: item.raw || stripTags(item.content),
  rawLiving: item.contentLiving ? stripTags(item.contentLiving) : null,
}));

const sessions = data.Sessions?.items || [];
const latestSession = sessions
  .map((item) => ({ item, number: Number(item.title.match(/Session\s*0*(\d+)/i)?.[1] || 0) }))
  .filter(({ number }) => number >= 40)
  .sort((a, b) => b.number - a.number)[0]?.item;
const mapData = JSON.parse(await readFile(join(PUBLIC_DIR, 'map-data.json'), 'utf8'));
const currentMarker = mapData.markers.find((marker) => marker.id === mapData.partyLocation);
const campaignNow = {
  latestSession: latestSession ? {
    category: 'Sessions', id: latestSession.id, title: latestSession.title,
  } : null,
  currentLocation: currentMarker ? {
    name: currentMarker.name,
    subtitle: currentMarker.subtitle || currentMarker.description,
    category: currentMarker.link?.category || null,
    id: currentMarker.link?.id || null,
  } : null,
  party: (data.Party?.items || []).map((item) => ({
    category: 'Party', id: item.id, title: item.title, image: firstImage(item.content),
  })),
};

await Promise.all([
  writeFile(join(PUBLIC_DIR, 'data-index.json'), JSON.stringify(index), 'utf8'),
  writeFile(join(PUBLIC_DIR, 'search-index.json'), JSON.stringify(searchIndex), 'utf8'),
  writeFile(join(PUBLIC_DIR, 'campaign-now.json'), JSON.stringify(campaignNow), 'utf8'),
]);

console.log(`Built ${uniqueItems.length} entry payloads and the lightweight compendium indexes.`);
