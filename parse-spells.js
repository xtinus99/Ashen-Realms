const fs = require('fs');
const path = require('path');

const SPELL_LISTS_DIR = path.join(__dirname, '..', 'DND Campaign', '09 - Tables and References', 'Spell Lists');

const CLASSES = ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
const LEVELS = ['Cantrips', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level'];
const LEVEL_FILES = {
    'Cantrips': 'Cantrips.md',
    '1st Level': '1st Level.md',
    '2nd Level': '2nd Level.md',
    '3rd Level': '3rd Level.md',
    '4th Level': '4th Level.md',
    '5th Level': '5th Level.md',
    '6th Level': '6th Level.md',
    '7th Level': '7th Level.md',
    '8th Level': '8th Level.md',
    '9th Level': '9th Level.md'
};

function parseSpellFile(content, className, level) {
    const spells = [];
    const spellBlocks = content.split(/^---$/m).filter(block => block.trim());

    for (const block of spellBlocks) {
        const lines = block.trim().split('\n');
        const spell = parseSpellBlock(lines, className, level);
        if (spell) {
            spells.push(spell);
        }
    }

    return spells;
}

function parseSpellBlock(lines, className, level) {
    let name = '';
    let school = '';
    let castingTime = '';
    let range = '';
    let components = '';
    let duration = '';
    let description = [];
    let higherLevels = '';
    let ashenRealms = '';
    let classes = [];
    let ritual = false;
    let concentration = false;

    let inDescription = false;
    let inHigherLevels = false;
    let inAshenRealms = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines at start
        if (!name && !line) continue;

        // Get spell name from ## header
        if (line.startsWith('## ')) {
            name = line.substring(3).trim();
            // Skip non-spell sections
            if (name === 'Related' || name === 'Notes' || name === 'References') {
                return null;
            }
            continue;
        }

        // Skip if no name yet
        if (!name) continue;

        // Parse school from italic line or **School:** line
        if (line.startsWith('*') && !line.startsWith('**') && line.endsWith('*')) {
            const schoolLine = line.slice(1, -1);
            school = schoolLine.replace(/\s*cantrip\s*/i, '').replace(/\s*\(\d+\w+\s+Level.*?\)/i, '').trim();
            if (schoolLine.toLowerCase().includes('ritual')) {
                ritual = true;
            }
            continue;
        }

        if (line.startsWith('**School:**')) {
            const schoolMatch = line.match(/\*\*School:\*\*\s*(.+)/);
            if (schoolMatch) {
                school = schoolMatch[1].replace(/\s*\(\d+\w+\s+Level.*?\)/i, '').trim();
                if (line.toLowerCase().includes('ritual')) {
                    ritual = true;
                }
            }
            continue;
        }

        // Parse other fields
        if (line.startsWith('**Casting Time:**')) {
            castingTime = line.replace('**Casting Time:**', '').trim();
            continue;
        }

        if (line.startsWith('**Range:**')) {
            range = line.replace('**Range:**', '').trim();
            continue;
        }

        if (line.startsWith('**Components:**')) {
            components = line.replace('**Components:**', '').trim();
            continue;
        }

        if (line.startsWith('**Duration:**')) {
            duration = line.replace('**Duration:**', '').trim();
            if (duration.toLowerCase().includes('concentration')) {
                concentration = true;
            }
            continue;
        }

        if (line.startsWith('**Classes:**')) {
            const classLine = line.replace('**Classes:**', '').trim();
            classes = classLine.split(',').map(c => c.trim()).filter(c => c);
            continue;
        }

        // Higher levels
        if (line.startsWith('**At Higher Levels:**') || line.startsWith('**At Higher Levels.**')) {
            inHigherLevels = true;
            inDescription = false;
            inAshenRealms = false;
            higherLevels = line.replace(/\*\*At Higher Levels[.:]\*\*/, '').trim();
            continue;
        }

        // Ashen Realms notes
        if (line.startsWith('**Ashen Realms') || line.startsWith('*Ashen Realms')) {
            inAshenRealms = true;
            inDescription = false;
            inHigherLevels = false;
            ashenRealms = line.replace(/\*?\*?Ashen Realms[^:]*:\*?\*?/, '').trim();
            continue;
        }

        // If we have basic fields, start collecting description
        if (castingTime && range && components && duration && line && !inHigherLevels && !inAshenRealms) {
            inDescription = true;
        }

        if (inHigherLevels && line && !line.startsWith('**')) {
            higherLevels += ' ' + line;
            continue;
        }

        if (inAshenRealms && line && !line.startsWith('**')) {
            ashenRealms += ' ' + line;
            continue;
        }

        if (inDescription && line && !line.startsWith('**Classes:**')) {
            description.push(line);
        }
    }

    if (!name) return null;

    // Capitalize school properly
    if (school) {
        school = school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
    }

    // Add the source class if not in classes list
    if (classes.length === 0) {
        classes = [className];
    }

    // Determine if it's an Ashen Realms spell
    const isAshenRealms = name.includes('Flesh') || name.includes('Void') ||
                          name.includes('Remnant') || name.includes('Sovereign') ||
                          name.includes('Barrier') || name.includes('Ancestral') ||
                          name.includes('Harmonic') || name.includes('Resonant') ||
                          ashenRealms.length > 0;

    return {
        name: name,
        class: className,
        level: level,
        school: school || 'Unknown',
        castingTime: castingTime,
        range: range,
        components: components,
        duration: duration,
        description: description.join('\n\n').trim(),
        higherLevels: higherLevels.trim(),
        ashenRealms: ashenRealms.trim(),
        ritual: ritual,
        concentration: concentration,
        source: isAshenRealms ? 'ashen' : 'standard',
        classes: classes
    };
}

function main() {
    const result = {
        classes: {},
        allSpells: []
    };

    const spellMap = new Map();

    // Process each class
    for (const className of CLASSES) {
        const classDir = path.join(SPELL_LISTS_DIR, className);

        if (!fs.existsSync(classDir)) {
            console.log(`Skipping ${className} - directory not found`);
            continue;
        }

        result.classes[className] = {
            name: className,
            levels: {}
        };

        // Process each level
        for (const level of LEVELS) {
            const fileName = LEVEL_FILES[level];
            const filePath = path.join(classDir, fileName);

            if (!fs.existsSync(filePath)) {
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const spells = parseSpellFile(content, className, level);

            // Add spell names to class level
            result.classes[className].levels[level] = spells.map(s => s.name);

            // Add spells to map (dedup by name)
            for (const spell of spells) {
                if (!spellMap.has(spell.name)) {
                    spellMap.set(spell.name, spell);
                } else {
                    // Merge classes
                    const existing = spellMap.get(spell.name);
                    if (!existing.classes.includes(className)) {
                        existing.classes.push(className);
                    }
                }
            }
        }
    }

    // Convert map to array
    result.allSpells = Array.from(spellMap.values());

    // Sort spells alphabetically
    result.allSpells.sort((a, b) => a.name.localeCompare(b.name));

    // Write output
    const outputPath = path.join(__dirname, 'spells-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`Parsed ${result.allSpells.length} unique spells`);
    console.log(`Output written to ${outputPath}`);
}

main();
