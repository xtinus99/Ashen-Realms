// ===== FEAT REQUIREMENTS =====
// Reads a feat's prerequisite line into checkable clauses and tests them against a character.
// Pure functions with no DOM, so the Feat Ledger can use them and scripts can test them under Node.

export const SKILLS = [
  'acrobatics', 'animal handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation',
  'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion',
  'sleight of hand', 'stealth', 'survival',
];
const INT_SKILLS = ['arcana', 'history', 'investigation', 'nature', 'religion'];
export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
export const ABILITY_NAMES = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};
const ABILITY_BY_WORD = {
  strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha',
};
const TOOL_WORDS = ["thieves' tools", "poisoner's kit", "alchemist's supplies", "cartographer's tools", 'gaming set', 'forgery kit'];

// Class defaults (the 2014 lists, which the 2024 classes mostly keep).
// weapons: 'martial' = every martial weapon; 'some' = a few martial melee weapons and the hand crossbow;
// 'some-melee' = the monk's shortsword.
export const CLASSES = {
  artificer: { label: 'Artificer', caster: 'half', castStart: 1, castAbility: 'int', armor: ['light', 'medium', 'shield'], weapons: 'simple', tools: ["thieves' tools", "tinker's tools"], heals: true, rangedCantrip: true },
  barbarian: { label: 'Barbarian', armor: ['light', 'medium', 'shield'], weapons: 'martial', extraAttack: true },
  bard: { label: 'Bard', caster: 'full', castAbility: 'cha', armor: ['light'], weapons: 'some', heals: true, extraAttackMaybe: true },
  cleric: { label: 'Cleric', caster: 'full', castAbility: 'wis', armor: ['light', 'medium', 'shield'], weapons: 'simple', heals: true },
  druid: { label: 'Druid', caster: 'full', castAbility: 'wis', armor: ['light', 'medium', 'shield'], weapons: 'simple', heals: true, rangedCantrip: true },
  fighter: { label: 'Fighter', armor: ['light', 'medium', 'heavy', 'shield'], weapons: 'martial', fightingStyle: 1, extraAttack: true },
  monk: { label: 'Monk', armor: [], weapons: 'some-melee', extraAttack: true },
  paladin: { label: 'Paladin', caster: 'half', castAbility: 'cha', armor: ['light', 'medium', 'heavy', 'shield'], weapons: 'martial', fightingStyle: 2, extraAttack: true, heals: true },
  ranger: { label: 'Ranger', caster: 'half', castAbility: 'wis', armor: ['light', 'medium', 'shield'], weapons: 'martial', fightingStyle: 2, extraAttack: true, heals: true },
  rogue: { label: 'Rogue', armor: ['light'], weapons: 'some', tools: ["thieves' tools"], sneakAttack: true },
  sorcerer: { label: 'Sorcerer', caster: 'full', castAbility: 'cha', armor: [], weapons: 'simple', rangedCantrip: true },
  warlock: { label: 'Warlock', caster: 'pact', castAbility: 'cha', armor: ['light'], weapons: 'simple', rangedCantrip: true, extraAttackMaybe: true },
  wizard: { label: 'Wizard', caster: 'full', castAbility: 'int', armor: [], weapons: 'simple', rangedCantrip: true, extraAttackMaybe: true },
};

// Subclasses that change what the class line above says.
const SUBCLASSES = [
  { match: /eldritch knight/i, casts: 3, castAbility: 'int' },
  { match: /arcane trickster/i, casts: 3, castAbility: 'int' },
  { match: /hexblade/i, armor: ['medium', 'shield'], weapons: 'martial' },
];

const INNATE_SPELL_SPECIES = /\b(tiefling|drow|aasimar|genasi|yuan-ti|triton|high elf)\b/i;
const SMALL_SPECIES = /\b(halfling|gnome|goblin|kobold)\b/i;
const SPECIES_WORDS = [
  'half-elf', 'half-orc', 'half-giant', 'wood elf', 'sea elf', 'drow elf', 'fire genasi', 'yuan-ti', 'small race',
  'small size', 'aasimar', 'bugbear', 'changeling', 'dhampir', 'dragonborn', 'drow', 'dwarf', 'eladrin', 'elf',
  'genasi', 'gnome', 'goblin', 'goliath', 'halfling', 'hobgoblin', 'human', 'kenku', 'kobold', 'leonin',
  'lizardfolk', 'minotaur', 'orc', 'satyr', 'shifter', 'tabaxi', 'thalwynn', 'tiefling', 'tortle', 'triton',
  'vampire', 'warforged',
];
const SPECIES_PATTERN = new RegExp(`\\b(${SPECIES_WORDS.map((w) => w.replace('-', '\\-')).join('|')})\\b`, 'g');

const AB_WORD = '(?:strength|dexterity|constitution|intelligence|wisdom|charisma)';
const AB_LIST = new RegExp(`(${AB_WORD}(?:(?:\\s*,\\s*or\\s+|\\s*,\\s*|\\s+or\\s+)${AB_WORD})*)\\s+(\\d+)\\+?`, 'g');

export function titleCase(words) {
  return words
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/'S\b/g, "'s")
    .replace(/(?!^)\b(Of|The|And|Or)\b/g, (m) => m.toLowerCase());
}

function joinOr(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} or ${list[list.length - 1]}`;
}

function skillList(text) {
  return SKILLS.filter((skill) => new RegExp(`\\b${skill}\\b`).test(text));
}

function toolList(text) {
  const tools = TOOL_WORDS.filter((tool) => text.includes(tool));
  if (/\b(?:with )?a tool\b/.test(text)) tools.push('*');
  return tools;
}

function skillOrToolClause(text, extraTools = []) {
  const skills = skillList(text);
  const tools = [...new Set([...toolList(text), ...extraTools])];
  const parts = [];
  if (skills.length) parts.push({ kind: 'skill', any: skills });
  if (tools.length) parts.push({ kind: 'tool', any: tools });
  if (!parts.length) return null;
  return parts.length === 1 ? parts[0] : { kind: 'or', clauses: parts };
}

// ---------- parsing ----------

export function parsePrerequisite(raw) {
  const original = String(raw || '').replace(/&quot;/g, '"').trim();
  if (!original || /^none$/i.test(original)) return [];
  let s = original.toLowerCase();
  const clauses = [];

  // Blank out a recognised span with spaces so every index still lines up with the original text.
  const take = (pattern, build) => {
    const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    s = s.replace(re, (...args) => {
      const match = args[0];
      const made = build(...args);
      if (Array.isArray(made)) clauses.push(...made);
      else if (made) clauses.push(made);
      return ' '.repeat(match.length);
    });
  };

  take(/when gaining the level 2 (paladin|ranger) "fighting style" feature/, (m, cls) => ({ kind: 'feature', name: `${cls}Style` }));
  take(/intelligence, wisdom, or charisma (\d+)\+? \(your spellcasting ability\)/, (m, n) => ({ kind: 'spellAbility', min: Number(n) }));
  take(/spellcasting ability (\d+)\+?/, (m, n) => ({ kind: 'spellAbility', min: Number(n) }));

  // Either-or pairs that cross clause types.
  take(/spellcasting, pact magic, or proficiency in (medicine|arcana)/, (m, skill) => ({
    kind: 'or', clauses: [{ kind: 'casting', need: 'feature' }, { kind: 'skill', any: [skill] }],
  }));
  take(/spellcasting or pact magic(?: feature)? or rune carver/, () => ({
    kind: 'or', clauses: [{ kind: 'casting', need: 'feature' }, { kind: 'feat', name: 'Rune Carver' }],
  }));
  take(/proficiency in medicine or the ability to cast a spell that restores hit points/, () => ({
    kind: 'or', clauses: [{ kind: 'skill', any: ['medicine'] }, { kind: 'casting', need: 'healing' }],
  }));
  take(/martial weapon proficiency or giant foundling/, () => ({
    kind: 'or', clauses: [{ kind: 'weapon', need: 'martial-any' }, { kind: 'feat', name: 'Giant Foundling' }],
  }));
  take(/warforged, or a body that has undergone metallic modification(?: \([^)]*\))?/, () => ({
    kind: 'or', clauses: [{ kind: 'species', any: ['warforged'] }, { kind: 'dm', text: 'a body with metal grafted or implanted' }],
  }));
  take(/blood that runs hot \(sun-line, fire genasi, furnace-country born\)/, () => ({
    kind: 'or', clauses: [{ kind: 'species', any: ['fire genasi'] }, { kind: 'dm', text: 'sun-line or furnace-country blood' }],
  }));
  take(/dwarf or a small race/, () => ({ kind: 'species', any: ['dwarf', 'small'] }));
  take(/proficiency in deception and either arcana or with a forgery kit/, () => [
    { kind: 'skill', any: ['deception'] },
    { kind: 'or', clauses: [{ kind: 'skill', any: ['arcana'] }, { kind: 'tool', any: ['forgery kit'] }] },
  ]);

  // Spellcasting.
  take(/spellcasting or pact magic(?: feature)?/, () => ({ kind: 'casting', need: 'feature' }));
  take(/the ability to cast spells of 2nd level or higher/, () => ({ kind: 'casting', need: 'second' }));
  take(/the ability to cast a spell of 1st level or higher(?: that deals damage)?/, () => ({ kind: 'casting', need: 'slot' }));
  take(/the ability to cast a spell that deals lightning damage/, () => ({ kind: 'casting', need: 'lightning' }));
  take(/the ability to cast a spell that deals damage/, () => ({ kind: 'casting', need: 'damage' }));
  take(/the ability to cast a spell that restores hit points/, () => ({ kind: 'casting', need: 'healing' }));
  take(/a damaging cantrip that makes a ranged spell attack/, () => ({ kind: 'casting', need: 'rangedCantrip' }));
  take(/the ability to cast a spell using wisdom or charisma/, () => ({ kind: 'casting', need: 'wisCha' }));
  take(/the ability to cast at least one spell/, () => ({ kind: 'casting', need: 'any' }));

  // Class features.
  take(/fighting style feature/, () => ({ kind: 'feature', name: 'fightingStyle' }));
  take(/sneak attack feature/, () => ({ kind: 'feature', name: 'sneakAttack' }));
  take(/extra attack or an equivalent feature/, () => ({ kind: 'feature', name: 'extraAttack' }));

  // Armour and weapons.
  take(/(light|medium|heavy) armor proficiency/, (m, type) => ({ kind: 'armor', type }));
  take(/shield proficiency|proficiency with shields/, () => ({ kind: 'armor', type: 'shield' }));
  take(/proficiency with martial melee weapons/, () => ({ kind: 'weapon', need: 'martial-melee-all' }));
  take(/proficiency with martial weapons/, () => ({ kind: 'weapon', need: 'martial-all' }));
  take(/proficiency with a martial melee weapon/, () => ({ kind: 'weapon', need: 'martial-melee' }));
  take(/proficiency with a martial ranged weapon/, () => ({ kind: 'weapon', need: 'martial-ranged' }));
  take(/proficiency with a martial weapon|martial weapon proficiency/, () => ({ kind: 'weapon', need: 'martial-any' }));
  take(/proficiency with a ranged weapon/, () => ({ kind: 'weapon', need: 'ranged' }));
  take(/a heavy melee weapon/, () => ({ kind: 'gear', text: 'a heavy melee weapon' }));

  // Skills and tools.
  take(/proficiency in at least one skill or tool|proficiency in any skill/, () => ({ kind: 'anySkillOrTool' }));
  take(/proficiency in an intelligence skill/, () => ({ kind: 'skill', any: INT_SKILLS }));
  take(/proficiency with (thieves' tools|a poisoner's kit|alchemist's supplies)/, (m, tool) => ({ kind: 'tool', any: [tool.replace(/^a /, '')] }));
  take(/proficiency (with a tool or in|in) ([^;]+)/, (m, lead, list) => skillOrToolClause(list, lead.startsWith('with') ? ['*'] : []));

  // Feats.
  take(/(familiar friend|magic initiate|strike of the giants \([a-z ]+\)) feat/, (m, name) => ({ kind: 'feat', name: titleCase(name) }));
  take(/giant foundling|rune carver/, (m) => ({ kind: 'feat', name: titleCase(m) }));

  // Level: one clause, the highest level named.
  const levels = [];
  take(/\blevel (\d+)\+?/, (m, n) => { levels.push(Number(n)); return null; });
  if (levels.length) clauses.unshift({ kind: 'level', min: Math.max(...levels) });

  // Ability scores. Two lists joined only by "or" are alternatives; otherwise each must be met.
  const abilityMatches = [...s.matchAll(AB_LIST)];
  let group = null;
  let lastEnd = -1;
  for (const match of abilityMatches) {
    const words = match[1].match(new RegExp(AB_WORD, 'g'));
    const entries = words.map((word) => ({ ab: ABILITY_BY_WORD[word], min: Number(match[2]) }));
    const gap = lastEnd >= 0 ? s.slice(lastEnd, match.index).replace(/[\s,;]+/g, ' ').trim() : null;
    if (group && gap === 'or') group.any.push(...entries);
    else {
      group = { kind: 'ability', any: entries };
      clauses.push(group);
    }
    lastEnd = match.index + match[0].length;
  }
  s = s.replace(AB_LIST, (m) => ' '.repeat(m.length));

  // Species and lineage.
  const species = [];
  s = s.replace(SPECIES_PATTERN, (m) => {
    species.push(m === 'small race' || m === 'small size' ? 'small' : m === 'drow elf' ? 'drow' : m);
    return ' '.repeat(m.length);
  });
  if (species.length) clauses.push({ kind: 'species', any: [...new Set(species)] });

  // Whatever is left is a deed or an origin the DM rules on.
  const leftover = [...original].map((ch, i) => (s[i] === ' ' && ch !== ' ' ? ' ' : ch)).join('');
  leftover.split(';').forEach((part) => {
    const text = part.replace(/\s+/g, ' ').replace(/^[\s,.]+|[\s,.]+$/g, '').replace(/^(?:or|and)\s+|\s+(?:or|and)$/gi, '').trim();
    if (/[a-z]{3}/i.test(text.replace(/\b(?:or|and|either)\b/gi, ''))) clauses.push({ kind: 'dm', text });
  });

  return clauses;
}

// ---------- characters ----------

export function classKey(classText) {
  const word = String(classText || '').toLowerCase().match(/[a-z]+/);
  return word && CLASSES[word[0]] ? word[0] : '';
}

// Everything the checks need, worked out once from what the player set.
export function buildProfile(character) {
  const ch = character || {};
  const key = CLASSES[ch.className] ? ch.className : '';
  const cls = key ? CLASSES[key] : null;
  const level = Math.max(1, Math.min(20, Number(ch.level) || 1));
  const subclass = SUBCLASSES.find((sub) => sub.match.test(ch.subclass || '')) || null;
  const species = String(ch.species || '').toLowerCase();

  let classCaster = cls?.caster ? level >= (cls.castStart || (cls.caster === 'half' ? 2 : 1)) : false;
  let castAbility = cls?.castAbility || null;
  if (subclass?.casts && level >= subclass.casts) {
    classCaster = true;
    castAbility = subclass.castAbility;
  }
  const casts = typeof ch.casts === 'boolean' ? ch.casts : classCaster;

  const armor = new Set([...(cls?.armor || []), ...(subclass?.armor || [])]);
  if (/mountain dwarf/.test(species)) ['light', 'medium'].forEach((a) => armor.add(a));
  if (/hobgoblin/.test(species)) armor.add('light');
  if (typeof ch.heavy === 'boolean') {
    if (ch.heavy) ['light', 'medium', 'heavy'].forEach((a) => armor.add(a));
    else armor.delete('heavy');
  }

  let weapons = subclass?.weapons || cls?.weapons || 'simple';
  if (typeof ch.martial === 'boolean') weapons = ch.martial ? 'martial' : (weapons === 'martial' ? 'simple' : weapons);
  const speciesMelee = /\b(dwarf|wood elf|high elf|drow|hobgoblin)\b/.test(species);
  const speciesRanged = /\b(wood elf|high elf|drow|hobgoblin)\b/.test(species);

  const abilities = {};
  ABILITY_KEYS.forEach((ab) => {
    const value = Number(ch.abilities?.[ab]);
    abilities[ab] = Number.isFinite(value) && value > 0 ? value : null;
  });

  return {
    key, cls, level, species, casts, classCaster, castAbility, armor, weapons, speciesMelee, speciesRanged, abilities,
    skills: Array.isArray(ch.skills) ? ch.skills : [],
  };
}

function speciesMatches(token, species) {
  if (!species) return false;
  if (token === 'small') return SMALL_SPECIES.test(species);
  if (token === 'elf') return /\belf\b/.test(species.replace(/half-elf|half elf/g, '')) || /shadar-kai|eladrin|drow/.test(species);
  if (token === 'half-elf') return /half-elf|half elf/.test(species);
  if (token === 'orc') return /\borc\b/.test(species);
  if (token === 'human') return /\bhuman\b/.test(species);
  if (token === 'genasi') return /genasi/.test(species);
  return species.includes(token);
}

const CASTING_LABEL = {
  feature: 'Spellcasting or Pact Magic',
  any: 'a spell you can cast',
  slot: 'spells of 1st level or higher',
  second: 'spells of 2nd level or higher',
  damage: 'a spell that deals damage',
  lightning: 'a spell that deals lightning damage',
  healing: 'a spell that restores hit points',
  rangedCantrip: 'a ranged spell attack cantrip',
  wisCha: 'a spell cast with Wisdom or Charisma',
};
const FEATURE_LABEL = {
  fightingStyle: 'the Fighting Style feature',
  paladinStyle: 'Paladins only',
  rangerStyle: 'Rangers only',
  sneakAttack: 'Sneak Attack',
  extraAttack: 'Extra Attack',
};
const WEAPON_LABEL = {
  'martial-all': 'training with martial weapons',
  'martial-melee-all': 'training with martial melee weapons',
  'martial-any': 'training with a martial weapon',
  'martial-melee': 'training with a martial melee weapon',
  'martial-ranged': 'training with a martial ranged weapon',
  ranged: 'training with a ranged weapon',
};

export function clauseLabel(clause) {
  switch (clause.kind) {
    case 'level': return `level ${clause.min}`;
    case 'ability': {
      const mins = [...new Set(clause.any.map((e) => e.min))];
      if (mins.length === 1) return `${joinOr(clause.any.map((e) => ABILITY_NAMES[e.ab]))} ${mins[0]}+`;
      return joinOr(clause.any.map((e) => `${ABILITY_NAMES[e.ab]} ${e.min}+`));
    }
    case 'spellAbility': return `spellcasting ability ${clause.min}+`;
    case 'casting': return CASTING_LABEL[clause.need];
    case 'feature': return FEATURE_LABEL[clause.name];
    case 'armor': return clause.type === 'shield' ? 'shield training' : `${clause.type} armor training`;
    case 'weapon': return WEAPON_LABEL[clause.need];
    case 'skill': return joinOr(clause.any.map((s) => titleCase(s)));
    case 'tool': return joinOr(clause.any.map((t) => (t === '*' ? 'a tool' : t)));
    case 'anySkillOrTool': return 'a skill or tool';
    case 'feat': return `the ${clause.name} feat`;
    case 'species': return joinOr(clause.any.map((s) => (s === 'small' ? 'a Small species' : titleCase(s))));
    case 'gear': return clause.text;
    case 'dm': return clause.text;
    case 'or': return joinOr(clause.clauses.map(clauseLabel));
    default: return '';
  }
}

// One clause against one character: met, unmet, unknown, or dm.
// An unmet clause that a higher level will fix carries `at`, the level that opens it.
export function checkClause(clause, p) {
  const label = clauseLabel(clause);
  const result = (state, at = null) => ({ state, label, at, later: at !== null });
  const cls = p.cls;

  switch (clause.kind) {
    case 'level':
      return p.level >= clause.min ? result('met') : result('unmet', clause.min);

    case 'ability': {
      let unknown = false;
      for (const { ab, min } of clause.any) {
        const score = p.abilities[ab];
        if (score === null) unknown = true;
        else if (score >= min) return result('met');
      }
      return unknown ? result('unknown') : result('unmet');
    }

    case 'spellAbility': {
      if (!p.castAbility) return p.casts ? result('unknown') : result('unmet');
      const score = p.abilities[p.castAbility];
      if (score === null) return result('unknown');
      return score >= clause.min ? result('met') : result('unmet');
    }

    case 'casting': {
      const classCaster = p.classCaster;
      switch (clause.need) {
        case 'feature':
          return p.casts ? result('met') : result('unmet');
        case 'any':
          if (p.casts || INNATE_SPELL_SPECIES.test(p.species)) return result('met');
          return result('unmet');
        case 'slot':
        case 'damage':
          if (classCaster) return result('met');
          return p.casts ? result('unknown') : result('unmet');
        case 'second': {
          if (!classCaster) return p.casts ? result('unknown') : result('unmet');
          const caster = cls?.caster;
          const needed = caster === 'half' ? 5 : 3;
          return p.level >= needed ? result('met') : result('unmet', needed);
        }
        case 'healing':
          if (classCaster && cls?.heals) return result('met');
          return p.casts ? result('unknown') : result('unmet');
        case 'rangedCantrip':
          if (classCaster && cls?.rangedCantrip) return result('met');
          return p.casts ? result('unknown') : result('unmet');
        case 'wisCha':
          if (classCaster && ['wis', 'cha'].includes(p.castAbility)) return result('met');
          if (p.casts || INNATE_SPELL_SPECIES.test(p.species)) return result('unknown');
          return result('unmet');
        case 'lightning':
          return p.casts ? result('unknown') : result('unmet');
        default:
          return result('unknown');
      }
    }

    case 'feature':
      switch (clause.name) {
        case 'fightingStyle':
          if (cls?.fightingStyle) return p.level >= cls.fightingStyle ? result('met') : result('unmet', cls.fightingStyle);
          return result('unmet');
        case 'paladinStyle':
          if (p.key !== 'paladin') return result('unmet');
          return p.level >= 2 ? result('met') : result('unmet', 2);
        case 'rangerStyle':
          if (p.key !== 'ranger') return result('unmet');
          return p.level >= 2 ? result('met') : result('unmet', 2);
        case 'sneakAttack':
          return p.key === 'rogue' ? result('met') : result('unmet');
        case 'extraAttack':
          if (cls?.extraAttack) return p.level >= 5 ? result('met') : result('unmet', 5);
          return cls?.extraAttackMaybe ? result('unknown') : result('unmet');
        default:
          return result('unknown');
      }

    case 'armor':
      return p.armor.has(clause.type) ? result('met') : result('unmet');

    case 'weapon': {
      const w = p.weapons;
      switch (clause.need) {
        case 'martial-all':
        case 'martial-melee-all':
          return w === 'martial' ? result('met') : result('unmet');
        case 'martial-any':
          return w !== 'simple' || p.speciesMelee || p.speciesRanged ? result('met') : result('unmet');
        case 'martial-melee':
          return w !== 'simple' || p.speciesMelee ? result('met') : result('unmet');
        case 'martial-ranged':
          return w === 'martial' || w === 'some' || p.speciesRanged ? result('met') : result('unmet');
        default:
          return result('met');
      }
    }

    case 'skill':
      if (!p.skills.length) return result('unknown');
      return clause.any.some((skill) => p.skills.includes(skill)) ? result('met') : result('unmet');

    case 'tool': {
      const classTools = cls?.tools || [];
      if (clause.any.some((tool) => (tool === '*' ? classTools.length > 0 : classTools.includes(tool)))) return result('met');
      return result('unknown');
    }

    case 'anySkillOrTool':
      return result('met');

    case 'species':
      if (!p.species) return result('unknown');
      return clause.any.some((token) => speciesMatches(token, p.species)) ? result('met') : result('unmet');

    case 'feat':
    case 'gear':
      return result('unknown');

    case 'dm':
      return result('dm');

    case 'or': {
      const parts = clause.clauses.map((c) => checkClause(c, p));
      if (parts.some((r) => r.state === 'met')) return result('met');
      if (parts.some((r) => r.state === 'unknown')) return result('unknown');
      if (parts.some((r) => r.state === 'dm')) return result('dm');
      const opens = parts.every((r) => r.later) ? Math.min(...parts.map((r) => r.at)) : null;
      return result('unmet', opens);
    }

    default:
      return result('unknown');
  }
}

// The whole prerequisite against one character.
// status: 'qualify' | 'check' (something only the player knows) | 'dm' (a deed or origin the DM rules on)
//         | 'later' (only a higher level is missing) | 'no' (something else is missing)
export function assessFeat(clauses, profile) {
  const results = clauses.map((clause) => checkClause(clause, profile));
  const unmet = results.filter((r) => r.state === 'unmet');
  const unknown = results.filter((r) => r.state === 'unknown');
  const dm = results.filter((r) => r.state === 'dm');

  if (unmet.length) {
    const onlyLevels = unmet.every((r) => r.later);
    return {
      status: onlyLevels ? 'later' : 'no',
      atLevel: onlyLevels ? Math.max(...unmet.map((r) => r.at)) : null,
      missing: unmet.map((r) => r.label),
      toCheck: unknown.map((r) => r.label),
      dm: dm.map((r) => r.label),
    };
  }
  if (dm.length) return { status: 'dm', missing: [], toCheck: unknown.map((r) => r.label), dm: dm.map((r) => r.label) };
  if (unknown.length) return { status: 'check', missing: [], toCheck: unknown.map((r) => r.label), dm: [] };
  return { status: 'qualify', missing: [], toCheck: [], dm: [] };
}
