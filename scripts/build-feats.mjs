import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_OFFICIAL = 'C:/Users/khali/Documents/5etools-v2.23.0/data/feats.json';
const DEFAULT_ASHEN = 'C:/Users/khali/Documents/DND Campaign/DND Campaign/08 - Tables and References/Feats of the Ashen Realms.md';

const RULESET_2024_SOURCES = new Set(['XPHB', 'FRHoF', 'EFA', 'ABH', 'LFL']);
const ABILITY_NAMES = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};
const CATEGORY_NAMES = {
  G: 'General',
  O: 'Origin',
  EB: 'Epic Boon',
  D: 'Dragonmark',
  FS: 'Fighting Style',
  'FS:P': 'Fighting Style',
  'FS:R': 'Fighting Style',
};

function getArg(name, fallback) {
  const direct = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (direct) return direct.slice(name.length + 3);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const officialPath = path.resolve(getArg('official', process.env.FIVEETOOLS_FEATS_PATH || DEFAULT_OFFICIAL));
const ashenPath = path.resolve(getArg('ashen', process.env.ASHEN_FEATS_PATH || DEFAULT_ASHEN));
const outputPath = path.resolve(getArg('output', path.join(ROOT_DIR, 'public', 'feats-data.json')));

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(value) {
  return String(value)
    .replace(/\([^)]*\)/g, (part) => part.toLowerCase())
    .split(/([\s-]+)/)
    .map((part) => (/^[\s-]+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

function render5eTag(tag, payload) {
  const parts = payload.split('|');
  const rawLabel = parts[0] || '';
  const label = escapeHtml(rawLabel);

  switch (tag.toLowerCase()) {
    case 'b':
      return `<strong>${label}</strong>`;
    case 'i':
    case 'italic':
      return `<em>${label}</em>`;
    case 'dice':
    case 'damage':
    case 'scaledice':
    case 'd20':
      return `<code class="feat-dice">${label}</code>`;
    case 'dc':
      return `DC ${label}`;
    case 'chance':
      return `${label}%`;
    default:
      return label;
  }
}

function render5eText(value = '') {
  const text = String(value);
  const tagPattern = /\{@([a-zA-Z0-9]+)\s+([^{}]+)\}/g;
  let html = '';
  let cursor = 0;
  let match;

  while ((match = tagPattern.exec(text))) {
    html += escapeHtml(text.slice(cursor, match.index));
    html += render5eTag(match[1], match[2]);
    cursor = match.index + match[0].length;
  }

  return html + escapeHtml(text.slice(cursor));
}

function renderInlineEntries(entries) {
  const values = Array.isArray(entries) ? entries : [entries];
  return values.map((entry) => {
    if (typeof entry === 'string' || typeof entry === 'number') return render5eText(entry);
    if (!entry || typeof entry !== 'object') return '';
    if (entry.type === 'item') {
      const name = entry.name ? `<strong>${render5eText(entry.name)}</strong> ` : '';
      return `${name}${renderInlineEntries(entry.entries || [])}`;
    }
    return renderInlineEntries(entry.entries || []);
  }).filter(Boolean).join(' ');
}

function render5eBlock(entry) {
  if (typeof entry === 'string' || typeof entry === 'number') {
    return `<p>${render5eText(entry)}</p>`;
  }
  if (!entry || typeof entry !== 'object') return '';

  if (entry.type === 'list') {
    const className = entry.style ? ` feat-list-${slugify(entry.style)}` : '';
    const items = (entry.items || []).map((item) => {
      if (item?.type === 'item') {
        const label = item.name ? `<strong>${render5eText(item.name)}</strong> ` : '';
        return `<li>${label}${renderInlineEntries(item.entries || [])}</li>`;
      }
      return `<li>${renderInlineEntries(item)}</li>`;
    }).join('');
    return `<ul class="feat-rule-list${className}">${items}</ul>`;
  }

  if (entry.type === 'table') {
    const caption = entry.caption ? `<caption>${render5eText(entry.caption)}</caption>` : '';
    const head = entry.colLabels?.length
      ? `<thead><tr>${entry.colLabels.map((label) => `<th scope="col">${render5eText(label)}</th>`).join('')}</tr></thead>`
      : '';
    const body = `<tbody>${(entry.rows || []).map((row) => (
      `<tr>${row.map((cell) => `<td>${renderInlineEntries(cell)}</td>`).join('')}</tr>`
    )).join('')}</tbody>`;
    return `<div class="feat-table-wrap"><table>${caption}${head}${body}</table></div>`;
  }

  const name = entry.name ? `<h3>${render5eText(entry.name)}</h3>` : '';
  const content = render5eBlocks(entry.entries || []);
  const className = entry.type === 'inset' ? ' feat-rule-inset' : '';
  return `<section class="feat-rule-section${className}">${name}${content}</section>`;
}

function render5eBlocks(entries) {
  return (Array.isArray(entries) ? entries : [entries]).map(render5eBlock).join('');
}

function joinChoices(values, conjunction = 'or') {
  const clean = values.filter(Boolean);
  if (clean.length < 2) return clean[0] || '';
  if (clean.length === 2) return `${clean[0]} ${conjunction} ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}, ${conjunction} ${clean.at(-1)}`;
}

function formatFeatReference(reference) {
  const parts = String(reference).split('|');
  return titleCase(parts[2] || parts[0]);
}

function formatLevel(level) {
  if (typeof level === 'number') return `Level ${level}`;
  if (!level || typeof level !== 'object') return '';
  const className = level.class?.name;
  return className ? `${className} level ${level.level}` : `Level ${level.level}`;
}

function formatAbilityRequirement(values) {
  return joinChoices((values || []).map((choice) => {
    const requirements = Object.entries(choice).map(([ability, score]) => `${ABILITY_NAMES[ability] || ability} ${score}+`);
    return joinChoices(requirements, 'and');
  }));
}

function formatRace(race) {
  if (race.displayEntry) return render5eText(race.displayEntry).replace(/<[^>]+>/g, '');
  const subrace = race.subrace ? `${titleCase(race.subrace)} ` : '';
  return `${subrace}${titleCase(race.name)}`;
}

function formatProficiency(proficiency) {
  if (proficiency.weapon === 'martial' || proficiency.weaponGroup === 'martial') return 'Martial weapon proficiency';
  if (proficiency.weapon) return `${titleCase(proficiency.weapon)} weapon proficiency`;
  if (proficiency.armor === 'shield') return 'Shield proficiency';
  if (proficiency.armor) return `${titleCase(proficiency.armor)} armor proficiency`;
  return '';
}

function formatPrerequisiteOption(option) {
  const parts = [];

  if (option.level) parts.push(formatLevel(option.level));
  if (option.ability) parts.push(formatAbilityRequirement(option.ability));
  if (option.race) parts.push(joinChoices(option.race.map(formatRace)));
  if (option.background) {
    parts.push(joinChoices(option.background.map((background) => background.name || render5eText(background.displayEntry).replace(/<[^>]+>/g, ''))));
  }
  if (option.feat) parts.push(`${joinChoices(option.feat.map(formatFeatReference))} feat`);
  if (option.featCategory) {
    const categories = option.featCategory.map((category) => CATEGORY_NAMES[category] || category);
    parts.push(`${joinChoices(categories)} feat`);
  }
  if (option.exclusiveFeatCategory) {
    const categories = option.exclusiveFeatCategory.map((category) => CATEGORY_NAMES[category] || category);
    parts.push(`No other ${joinChoices(categories)} feat`);
  }
  if (option.feature) parts.push(`${joinChoices(option.feature)} feature`);
  if (option.proficiency) parts.push(joinChoices(option.proficiency.map(formatProficiency)));
  if (option.spellcasting || option.spellcasting2020 || option.spellcastingFeature) parts.push('Spellcasting or Pact Magic feature');
  if (option.campaign) parts.push(`${joinChoices(option.campaign)} campaign`);
  if (option.otherSummary?.entry) parts.push(render5eText(option.otherSummary.entry).replace(/<[^>]+>/g, ''));
  if (option.other) parts.push(option.other);

  return parts.filter(Boolean).join(', ');
}

function formatPrerequisites(prerequisites) {
  if (!prerequisites?.length) return 'None';
  return prerequisites.map(formatPrerequisiteOption).filter(Boolean).join(' or ');
}

function extractLevel(prerequisites) {
  const levels = (prerequisites || [])
    .map((option) => typeof option.level === 'number' ? option.level : option.level?.level)
    .filter(Number.isFinite);
  return levels.length ? Math.min(...levels) : null;
}

function formatAbilityIncrease(abilityOptions) {
  if (!abilityOptions?.length) return null;
  const visible = abilityOptions.filter((option) => !option.hidden);
  const options = visible.length ? visible : abilityOptions.slice(0, 1);

  const formatted = options.map((option) => {
    if (option.choose) {
      if (option.choose.entry) return option.choose.entry;
      const names = option.choose.from.map((ability) => ABILITY_NAMES[ability] || ability);
      const amount = option.choose.amount || 1;
      const count = option.choose.count || 1;
      const maximum = option.max || 20;
      if (count > 1) return `Increase ${count} abilities chosen from ${joinChoices(names)} by 1 (maximum ${maximum}).`;
      return `Increase ${joinChoices(names)} by ${amount} (maximum ${maximum}).`;
    }

    const entries = Object.entries(option).filter(([key]) => ABILITY_NAMES[key]);
    if (!entries.length) return '';
    const maximum = option.max || 20;
    return `${joinChoices(entries.map(([ability, amount]) => `${ABILITY_NAMES[ability]} by ${amount}`))} (maximum ${maximum}).`;
  }).filter(Boolean);

  return joinChoices(formatted);
}

function stripHtml(value) {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeOfficialFeat(feat, sourceMeta) {
  const ruleset = RULESET_2024_SOURCES.has(feat.source) ? '2024' : '2014';
  const category = CATEGORY_NAMES[feat.category] || (ruleset === '2014' ? 'Legacy Feat' : 'General');
  const prerequisite = formatPrerequisites(feat.prerequisite);
  const abilityIncrease = formatAbilityIncrease(feat.ability);
  const bodyHtml = render5eBlocks(feat.entries || []);
  const meta = sourceMeta.get(feat.source);
  const sourceName = meta?.name || feat.source;
  const campaigns = (feat.prerequisite || []).flatMap((option) => option.campaign || []);
  const reprintedAs = (feat.reprintedAs || []).map(formatFeatReference);
  const id = `${slugify(feat.name)}-${feat.source.toLowerCase()}`;

  return {
    id,
    name: feat.name,
    ruleset,
    rulesetLabel: `${ruleset} Rules`,
    source: feat.source,
    sourceName,
    published: meta?.published || null,
    page: feat.page || null,
    category,
    prerequisite,
    level: extractLevel(feat.prerequisite),
    abilityIncrease,
    repeatable: Boolean(feat.repeatable),
    campaign: campaigns.length ? joinChoices([...new Set(campaigns)]) : null,
    reprintedAs,
    bodyHtml,
    searchText: [feat.name, ruleset, sourceName, feat.source, category, prerequisite, abilityIncrease, stripHtml(bodyHtml)].filter(Boolean).join(' ').toLowerCase(),
  };
}

function renderMarkdownInline(value = '') {
  const codeTokens = [];
  let html = escapeHtml(value).replace(/`([^`]+)`/g, (_match, code) => {
    const token = `@@CODE${codeTokens.length}@@`;
    codeTokens.push(`<code class="feat-dice">${code}</code>`);
    return token;
  });

  html = html
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, label) => escapeHtml(label || target))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  codeTokens.forEach((token, index) => {
    html = html.replace(`@@CODE${index}@@`, token);
  });
  return html;
}

function renderAshenMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let paragraph = [];
  let listType = null;
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p>${renderMarkdownInline(paragraph.join(' '))}</p>`;
    paragraph = [];
  };
  const flushList = () => {
    if (!listItems.length) return;
    const tag = listType === 'ordered' ? 'ol' : 'ul';
    html += `<${tag} class="feat-rule-list">${listItems.map((item) => `<li>${renderMarkdownInline(item)}</li>`).join('')}</${tag}>`;
    listItems = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === '---') {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^- /.test(line)) {
      flushParagraph();
      if (listType && listType !== 'unordered') flushList();
      listType = 'unordered';
      listItems.push(line.slice(2));
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushParagraph();
      if (listType && listType !== 'ordered') flushList();
      listType = 'ordered';
      listItems.push(line.replace(/^\d+\. /, ''));
      continue;
    }
    if (/^> /.test(line)) {
      flushParagraph();
      flushList();
      html += `<blockquote>${renderMarkdownInline(line.slice(2))}</blockquote>`;
      continue;
    }
    if (listType) flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html;
}

function categoryForAshen(section, subsection) {
  if (/Epic Boons/i.test(section)) return 'Epic Boon';
  if (/Epic Feats/i.test(section)) return 'Epic';
  if (/Sideways/i.test(subsection) || /Sideways/i.test(section)) return 'Sideways';
  if (/Lineage/i.test(subsection)) return 'Lineage';
  if (/General|Review Pass/i.test(subsection)) return 'General';
  if (/Open Feats/i.test(section)) return 'Open';
  if (/Earned Feats/i.test(section)) return 'Earned';
  return 'General';
}

function normalizeAshenPrerequisite(value, category) {
  if (category === 'Epic Boon') return 'Level 19';
  if (!value) return 'None';
  const normalized = value.trim().replace(/^none$/i, 'None');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function extractAshenLevel(prerequisite, category) {
  if (category === 'Epic Boon') return 19;
  const match = prerequisite.match(/level\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function parseAshenFeats(markdown) {
  const lines = markdown.split(/\r?\n/);
  const feats = [];
  let section = '';
  let subsection = '';
  let current = null;
  let stopped = false;

  const finalize = () => {
    if (!current) return;
    const category = categoryForAshen(current.section, current.subsection);
    const rawBody = current.lines.join('\n').trim();
    const bodyLines = rawBody.split(/\r?\n/);
    let prerequisiteValue = '';

    if (bodyLines[0]?.match(/^\*Prerequisites?:\s*(.+)\*$/i)) {
      prerequisiteValue = bodyLines.shift().match(/^\*Prerequisites?:\s*(.+)\*$/i)[1];
    }

    const prerequisite = normalizeAshenPrerequisite(prerequisiteValue, category);
    const bodyMarkdown = bodyLines.join('\n').trim();
    const bodyHtml = renderAshenMarkdown(bodyMarkdown);
    const id = `${slugify(current.name)}-ashen`;

    feats.push({
      id,
      name: current.name,
      ruleset: 'ashen',
      rulesetLabel: 'Ashen Realms',
      source: 'AR',
      sourceName: 'Feats of the Ashen Realms',
      published: '2026-07-19',
      page: null,
      category,
      prerequisite,
      level: extractAshenLevel(prerequisite, category),
      abilityIncrease: category === 'Epic Boon' ? 'Increase one ability score by 1, to a maximum of 30.' : null,
      repeatable: false,
      campaign: 'Ashen Realms',
      reprintedAs: [],
      bodyHtml,
      searchText: [current.name, 'Ashen Realms', category, prerequisite, stripHtml(bodyHtml)].filter(Boolean).join(' ').toLowerCase(),
    });
    current = null;
  };

  for (const line of lines) {
    if (line.startsWith('## GM Notes')) {
      finalize();
      stopped = true;
      break;
    }
    if (line.startsWith('## ')) {
      finalize();
      section = line.slice(3).trim();
      subsection = '';
      continue;
    }
    if (line.startsWith('### ')) {
      finalize();
      subsection = line.slice(4).trim();
      continue;
    }
    if (line.startsWith('#### ')) {
      finalize();
      current = { name: line.slice(5).trim(), section, subsection, lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }

  if (!stopped) finalize();
  return feats;
}

const [officialRaw, ashenRaw] = await Promise.all([
  readFile(officialPath, 'utf8'),
  readFile(ashenPath, 'utf8'),
]);

const officialDirectory = path.dirname(officialPath);
const [booksRaw, adventuresRaw] = await Promise.all([
  readFile(path.join(officialDirectory, 'books.json'), 'utf8'),
  readFile(path.join(officialDirectory, 'adventures.json'), 'utf8'),
]);

const sourceMeta = new Map();
for (const entry of [...(JSON.parse(booksRaw).book || []), ...(JSON.parse(adventuresRaw).adventure || [])]) {
  sourceMeta.set(entry.id || entry.source, {
    name: entry.name,
    published: entry.published || null,
  });
}

const officialFeats = JSON.parse(officialRaw).feat.map((feat) => normalizeOfficialFeat(feat, sourceMeta));
const ashenFeats = parseAshenFeats(ashenRaw);
const feats = [...ashenFeats, ...officialFeats].sort((a, b) => (
  a.name.localeCompare(b.name) || a.ruleset.localeCompare(b.ruleset) || a.source.localeCompare(b.source)
));

const duplicateIds = feats.map((feat) => feat.id).filter((id, index, values) => values.indexOf(id) !== index);
if (duplicateIds.length) throw new Error(`Duplicate feat IDs: ${[...new Set(duplicateIds)].join(', ')}`);
if (officialFeats.length !== 265) throw new Error(`Expected 265 official feats, found ${officialFeats.length}`);
if (ashenFeats.length !== 162) throw new Error(`Expected 162 Ashen Realms feats and boons, found ${ashenFeats.length}`);

const counts = {
  total: feats.length,
  ashen: feats.filter((feat) => feat.ruleset === 'ashen').length,
  '2024': feats.filter((feat) => feat.ruleset === '2024').length,
  '2014': feats.filter((feat) => feat.ruleset === '2014').length,
};

const payload = {
  meta: {
    title: 'Feat Compendium',
    generated: new Date().toISOString(),
    counts,
    sources: [...new Set(feats.map((feat) => feat.source))].length,
    note: 'Official entries are normalized from the local 5etools corpus. Ashen Realms entries are the finalized campaign catalogue.',
  },
  feats,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload)}\n`, 'utf8');

console.log(`Wrote ${counts.total} feats to ${outputPath}`);
console.log(`Ashen Realms: ${counts.ashen} | 2024: ${counts['2024']} | 2014: ${counts['2014']}`);
