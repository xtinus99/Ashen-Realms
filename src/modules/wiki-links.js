import state from './state.js';
import tippy from 'tippy.js';

// ===== AUTO WIKI-LINKS =====
// Build an index of all known entries for auto-linking
let wikiIndex = [];

export function buildWikiIndex() {
    wikiIndex = [];

    // Categories where first names should also be indexed
    const firstNameCategories = ['Party', 'NPCs', 'Sovereigns'];

    // First pass: collect all first names to detect duplicates
    const firstNameCount = {};
    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        if (firstNameCategories.includes(categoryName)) {
            for (const item of categoryData.items) {
                const parts = item.title.split(' ');
                if (parts.length >= 2 && parts[0] !== 'The' && parts[0].length > 2) {
                    const firstName = parts[0];
                    firstNameCount[firstName] = (firstNameCount[firstName] || 0) + 1;
                }
            }
        }
    }

    // Second pass: build the index
    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        for (const item of categoryData.items) {
            wikiIndex.push({
                title: item.title,
                id: item.id,
                category: categoryName
            });

            // For Party and NPCs, also index first name as alias (only if unique)
            if (firstNameCategories.includes(categoryName)) {
                const parts = item.title.split(' ');
                if (parts.length >= 2 && parts[0] !== 'The' && parts[0].length > 2) {
                    const firstName = parts[0];
                    // Only add if first name is unique (not shared by multiple characters)
                    if (firstName !== item.title && firstNameCount[firstName] === 1) {
                        wikiIndex.push({
                            title: firstName,
                            id: item.id,
                            category: categoryName,
                            isAlias: true,
                            fullTitle: item.title
                        });
                    }
                }
            }
        }
        // Also index subcategory items if they exist
        if (categoryData.subcategories) {
            for (const subItems of Object.values(categoryData.subcategories)) {
                for (const item of subItems) {
                    wikiIndex.push({
                        title: item.title,
                        id: item.id,
                        category: categoryName
                    });
                }
            }
        }
    }
    // Sort by title length (longest first) to match longer names before shorter ones
    // e.g., "Sol Raven" before "Sol"
    wikiIndex.sort((a, b) => b.title.length - a.title.length);
}

/**
 * Convert mentions of known entries into clickable wiki-links.
 * Processes text nodes in the article body, avoiding:
 * - The article title itself (h1)
 * - Already linked text
 * - Text inside certain elements (a, h1, h2, h3, strong in headers)
 */
export function autoLinkWikiReferences(articleBody, currentItemTitle) {
    if (!wikiIndex.length) return;

    // Elements whose text content should not be processed
    const excludeSelectors = 'a, h1, .wiki-link, .article-title, code, pre, .toc-item';

    // Create a regex pattern that matches any known title
    // We'll process each entry individually to maintain proper linking
    const walker = document.createTreeWalker(
        articleBody,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Skip if parent is an excluded element
                let parent = node.parentElement;
                while (parent && parent !== articleBody) {
                    if (parent.matches && parent.matches(excludeSelectors)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    parent = parent.parentElement;
                }
                // Skip if text is too short or just whitespace
                if (!node.textContent || node.textContent.trim().length < 3) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    // Collect all text nodes first (modifying during walk causes issues)
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    // Process each text node
    for (const textNode of textNodes) {
        let text = textNode.textContent;
        let hasMatch = false;
        const replacements = [];

        // Check each wiki entry
        for (const entry of wikiIndex) {
            // Skip self-references (check both title and fullTitle for aliases)
            if (entry.title === currentItemTitle) continue;
            if (entry.fullTitle && entry.fullTitle === currentItemTitle) continue;

            // Create a regex that matches the title as a whole word
            // Use word boundaries but also allow for possessives ('s)
            // Negative lookbehind (?<!') prevents matching after apostrophe (e.g., "Kael" in "Vor'Kael")
            const escapedTitle = entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Specific disambiguators: "The Hollow" must not match inside Sovereign titles
            // ("the Hollow Crown" = Karthayne, "the Hollow Empress" = Vor'Kael)
            const followGuard = entry.title.toLowerCase() === 'the hollow'
                ? '(?!\\s+(?:Crown|Empress))'
                : '';
            const regex = new RegExp(`(?<!')\\b(${escapedTitle})(?:'s)?\\b${followGuard}`, 'gi');

            let match;
            while ((match = regex.exec(text)) !== null) {
                // Check if this position overlaps with an existing replacement
                const start = match.index;
                const end = match.index + match[0].length;
                const overlaps = replacements.some(r =>
                    (start >= r.start && start < r.end) ||
                    (end > r.start && end <= r.end) ||
                    (start <= r.start && end >= r.end)
                );

                if (!overlaps) {
                    hasMatch = true;
                    replacements.push({
                        start: start,
                        end: end,
                        matched: match[0],
                        title: entry.fullTitle || entry.title,
                        id: entry.id,
                        category: entry.category
                    });
                }
            }
        }

        if (hasMatch && replacements.length > 0) {
            // Sort replacements by position (reverse order for safe replacement)
            replacements.sort((a, b) => b.start - a.start);

            // Build the new content
            const fragment = document.createDocumentFragment();
            let lastEnd = text.length;

            // Process in reverse order
            const parts = [];
            for (const r of replacements) {
                // Text after this replacement
                if (r.end < lastEnd) {
                    parts.unshift({ type: 'text', content: text.substring(r.end, lastEnd) });
                }
                // The wiki link
                parts.unshift({
                    type: 'link',
                    content: r.matched,
                    title: r.title,
                    id: r.id,
                    category: r.category
                });
                lastEnd = r.start;
            }
            // Text before the first replacement
            if (lastEnd > 0) {
                parts.unshift({ type: 'text', content: text.substring(0, lastEnd) });
            }

            // Create the fragment
            for (const part of parts) {
                if (part.type === 'text') {
                    fragment.appendChild(document.createTextNode(part.content));
                } else {
                    const link = document.createElement('span');
                    link.className = 'wiki-link';
                    link.dataset.target = part.title;
                    link.dataset.id = part.id;
                    link.dataset.category = part.category;
                    link.textContent = part.content;
                    fragment.appendChild(link);
                }
            }

            // Replace the text node with the fragment
            textNode.parentNode.replaceChild(fragment, textNode);
        }
    }
}

// ===== WIKI-LINK TOOLTIPS (Tippy.js) =====
export function initWikiLinkTooltips() {
    // Find all wiki-links that don't have tooltips yet
    const wikiLinks = document.querySelectorAll('.wiki-link:not([data-tippy-root])');

    wikiLinks.forEach(link => {
        const targetName = link.dataset.target;
        const category = link.dataset.category;

        // Find the item data to build tooltip content
        const itemData = findItemByTitle(targetName);
        if (!itemData) return;

        // Build tooltip content
        let tooltipContent = `<div class="wiki-tooltip">`;
        tooltipContent += `<div class="wiki-tooltip-header">`;
        tooltipContent += `<span class="wiki-tooltip-title">${itemData.title}</span>`;
        tooltipContent += `<span class="wiki-tooltip-category">${category || 'Entry'}</span>`;
        tooltipContent += `</div>`;

        // Add a preview of the description if available
        if (itemData.summary || itemData.description) {
            let preview = itemData.summary || itemData.description;
            // Strip HTML and truncate
            preview = preview.replace(/<[^>]+>/g, '').substring(0, 120);
            if (preview.length === 120) preview += '...';
            tooltipContent += `<div class="wiki-tooltip-preview">${preview}</div>`;
        }

        tooltipContent += `<div class="wiki-tooltip-hint">Click to view</div>`;
        tooltipContent += `</div>`;

        // Initialize Tippy tooltip
        tippy(link, {
            content: tooltipContent,
            allowHTML: true,
            placement: 'top',
            animation: 'shift-away',
            theme: 'ashen',
            delay: [300, 0],
            duration: [200, 150],
            interactive: false,
            appendTo: document.body
        });
    });
}

// Helper to find item data by title
export function findItemByTitle(title) {
    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        // Check main items
        const items = categoryData.items || [];
        const found = items.find(item =>
            item.title === title ||
            item.id === title ||
            (item.aliases && item.aliases.includes(title))
        );
        if (found) {
            return { ...found, category: categoryName };
        }

        // Check subcategories
        if (categoryData.subcategories) {
            for (const [subName, subData] of Object.entries(categoryData.subcategories)) {
                const subItems = subData.items || [];
                const subFound = subItems.find(item =>
                    item.title === title ||
                    item.id === title ||
                    (item.aliases && item.aliases.includes(title))
                );
                if (subFound) {
                    return { ...subFound, category: categoryName, subcategory: subName };
                }
            }
        }
    }
    return null;
}
