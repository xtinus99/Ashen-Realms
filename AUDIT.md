# The Ashen Realms Player Compendium — Full Audit

**Date:** 2026-04-07
**Scope:** UX, DM workflow, features, architecture, performance, and prioritized action plan

---

## 1. Executive Summary

The Ashen Realms Player Compendium is an impressive, atmospheric campaign wiki with strong visual design, rich features (wiki-links, search, bookmarks, bonds tracker, spell database, interactive map, ambient audio), and good mobile support. The dark fantasy aesthetic is cohesive and immersive.

However, the site has reached the limits of its vanilla JS architecture. At **4,380 lines of app.js**, **6,875 lines of CSS**, and **~21K lines of JSON data** loaded at startup, the monolith makes changes risky, the DM content pipeline is fragile with 23+ scattered Python scripts, and the lack of component boundaries means every new feature increases coupling.

**The recommendation is a migration to Astro** — preserving the existing design system while gaining component isolation, build-time data processing, and incremental adoption.

---

## 2. UX & Player Experience

### What Works Well
- **Visual identity is outstanding.** The dark fantasy shrine aesthetic (god rays, ash particles, gold/blood color palette, IM Fell English + Spectral fonts) creates genuine atmosphere. Players feel like they're opening a forbidden tome.
- **Wiki-links with Tippy tooltips** — hovering over a character name shows a preview without leaving the page. This is the killer feature for a campaign wiki.
- **Search (Ctrl+K)** — modal search with category filter chips and keyboard navigation (1-9 to toggle categories, arrow keys, Enter) is well-designed and fast.
- **Bonds & Standing** — the reputation tracker with animated progress bars, tier visualization, history entries, and likes/dislikes is a polished mini-app. The RPG-style reputation tiers (Hostile → Kindred) are thematically perfect.
- **Spell Compendium** — 669 spells with class/level/school/source filters, collapsible level sections, and detailed spell cards. The Ashen Realms custom spell tagging is a nice touch.
- **Session navigation** — prev/next buttons and swipe gestures for mobile session browsing.
- **Ambient audio** — 6 atmospheric tracks with volume persistence, prev/next, and autoplay-policy-compliant behavior.
- **Bookmarks** — localStorage-based bookmarking with keyboard shortcut (B) and list view (Shift+B).
- **Reading progress bar** — subtle gold bar at top.
- **Back-to-top button** — appears after 300px scroll.

### UX Issues

#### Critical
1. **No "last updated" or "what's new" indicator.** Players have no way to know what changed since their last visit. After a session, they don't know which articles were updated. This is the #1 player-facing gap.
2. **Content loads entirely at startup.** `data.json` (1.5MB+) plus `relationships-data.json` (2.7K lines) and `spells-data.json` (16.7K lines) all fetched on first load. On slow connections, players see nothing until everything downloads.

#### Moderate
3. **TOC + image layout breaks on some articles.** The `toc-image-wrapper` flexbox puts the TOC and first image side by side, but when articles have no image or very small images, the layout looks unbalanced.
4. **Related Articles section has no visual hierarchy.** It's a flat list of links grouped by category — no thumbnails, no preview text, no visual weight to distinguish important connections from incidental name-mentions.
5. **Category overview cards have inconsistent thumbnails.** Some entries have images, some don't. Cards without thumbnails are visually lighter and create a ragged grid.
6. **Session timeline is barebones.** The regex-based event extraction (`/\bdied\b|\bdeath\b/`) catches very few events. Most timeline entries have no events shown, making the timeline feel empty.
7. **Audio controls are always visible in the top bar** even though most players won't use them on every visit. They crowd the breadcrumb on smaller screens.
8. **The sidebar is 420px wide** — generous on 1920px screens, but on 1366px laptops it consumes ~31% of the viewport, leaving limited content width.

#### Minor
9. **Notification system is inline-styled** (line 2410) instead of using CSS classes. The fadeIn/fadeOut animations are injected via a `<style>` tag into `<head>` on every page load.
10. **Footer quotes rotate every 30 seconds** but the sidebar is often scrolled past the footer, so players rarely see them.
11. **The "I will hit you" quote** in the footerQuotes array is fun but may confuse new players who don't know it's an inside joke.
12. **Search result limit is hardcoded to 15.** With 100+ entries, players may not find what they need if their query is broad.
13. **No loading state for images.** Images fade in (opacity 0→1) but there's no skeleton placeholder, so the layout shifts as images load.

---

## 3. DM Content Workflow (Vault → Site)

### Current Pipeline
```
Obsidian Vault (markdown)
    → 23+ Python scripts (generate_player_site.py, rebuild_all.py, site_utils.py, etc.)
    → data.json / spells-data.json / relationships-data.json / map-data.json
    → GitHub Pages deployment (manual git push)
```

### What Works
- `site_utils.py` has robust DM content filtering (79+ regex patterns for stripping GM Notes, stat blocks, combat tactics, secrets, etc.)
- `parse-spells.js` cleanly converts vault spell markdown to structured JSON
- The pipeline preserves frontmatter metadata for the site's tag system

### Problems

#### Critical
1. **No single build command.** There's no `npm run build` or unified script. The DM must know which of 23 Python scripts to run for which content type. `rebuild_all.py` handles NPCs/Locations/Creatures/Sovereigns but not Sessions, Items, Spells, Relationships, or Map data.
2. **No incremental builds.** Every run reprocesses everything. There's no diffing or file-watching — change one NPC and rebuild the entire data.json.
3. **Manual deployment.** After running scripts, the DM must manually `git add/commit/push` the player-site directory.
4. **Two versions of the generator exist** (`generate_player_site.py` vs `generate_player_site_v2.py`) with no clear indication of which is canonical.

#### Moderate
5. **Relationships data is hand-maintained JSON.** Unlike the rest of the content which is derived from vault markdown, `relationships-data.json` (2,676 lines) must be manually edited. No script generates it from vault content.
6. **Map data is hand-maintained.** `map-data.json` coordinates and descriptions are manually kept in sync with vault locations.
7. **No validation.** Nothing checks if a vault file references an image that doesn't exist in `player-site/images/`, or if a wiki-link target has been renamed.
8. **Image pipeline is manual.** Images must be manually converted to WebP, placed in both `images/` and `thumbnails/`, and named to match the entry title.

#### Minor
9. **Cache busting uses `?v=` query params** bumped manually (currently `app.js?v=75`, `style.css?v=97`). Easy to forget after a change.
10. **Service worker cache version** (`ashen-realms-v69`) must be manually bumped to invalidate caches.

---

## 4. Architecture Analysis

### Current State
| Aspect | Detail |
|--------|--------|
| Framework | None (vanilla JS) |
| app.js | 4,380 lines, single file, all functionality |
| style.css | 6,875 lines, single file, all styles |
| index.html | 175 lines, single page |
| Data loading | All JSON fetched at startup (~20MB total) |
| Routing | Hash-based (`#Category/item-id`) |
| State | Global variables (`currentItem`, `currentCategory`, etc.) |
| Templating | String concatenation with innerHTML |
| Build tooling | None — raw files served directly |
| Libraries | GSAP, Leaflet, Lenis, Tippy, tsParticles, Medium-Zoom, Lucide |
| Hosting | GitHub Pages (static) |

### Architectural Issues

#### Critical
1. **The monolithic app.js is the single biggest risk.** At 4,380 lines with no module boundaries, every change can break unrelated features. The Spell Compendium alone is ~400 lines interleaved with the Bonds tracker (~400 lines), the map system (~200 lines), the wiki-link system (~200 lines), search (~300 lines), and so on.
2. **innerHTML templating with string concatenation** is an XSS vector and makes the code fragile. Typos in template strings are invisible until runtime. There's no syntax highlighting, no type checking, no component reuse.
3. **All data loaded at startup.** A player visiting to check one NPC must download 1.5MB of data.json + 16K lines of spells + 2.7K lines of relationships. Code-splitting and lazy loading would dramatically improve perceived performance.
4. **No build step means no optimization.** No minification, no tree-shaking, no dead code elimination, no CSS purging. The 174KB app.js and 155KB CSS are served as-is.

#### Moderate
5. **Global state everywhere.** 15+ global variables (`data`, `currentItem`, `currentCategory`, `spellsData`, `relationshipData`, `selectedSpell`, `selectedEntry`, `wikiIndex`, etc.) make reasoning about state difficult.
6. **`lucide.createIcons()` is called ~20 times** throughout the code after every DOM update. This re-scans the entire DOM for `data-lucide` attributes. A component-based approach would scope icon rendering.
7. **The Spell Compendium re-renders the entire view on every filter change** (`renderSpellsView()`), including rebuilding the full DOM for 669 spell cards. The event delegation optimization helps, but the DOM churn is unnecessary.
8. **CSS has significant dead code.** Styles for `.border-glow`, `.corner-flourish`, `.ember-container`, `.smoke-layer`, `.ash-container` elements that don't exist in the HTML. The `smoke-3`, `smoke-4`, disabled ash particles (`.a7` through `.a15`) are styled but hidden.

### Framework Recommendation: Astro

**Why Astro is the right fit:**

1. **Static-first with islands of interactivity.** Most of the compendium is static content (articles, spell data, NPC profiles). Only search, audio player, and map need client-side JS. Astro's island architecture renders the static parts at build time and hydrates only the interactive components.

2. **Content Collections.** Astro can read the vault markdown directly, apply the DM content filtering at build time, and generate pages. This eliminates the entire Python script pipeline.

3. **Component isolation.** Each feature becomes its own component: `<SpellCompendium />`, `<BondsTracker />`, `<WorldMap />`, `<SearchModal />`, `<AudioPlayer />`. Changes to one don't risk breaking others.

4. **Built-in optimizations.** Image optimization (astro:assets), CSS scoping, minification, code splitting — all automatic.

5. **Preserves the design.** The existing CSS design tokens, fonts, and visual identity transfer directly. No redesign needed.

6. **GitHub Pages compatible.** Astro outputs static files, same deployment target.

7. **Incremental adoption.** You can start by wrapping the existing app.js in an Astro layout and gradually extract components. No big-bang rewrite required.

**Migration path:**
```
Phase 1: Astro scaffold + existing app.js as a single island (works immediately)
Phase 2: Extract data pipeline (Content Collections replace Python scripts)
Phase 3: Extract components (Search, Audio, Spells, Bonds → Preact islands)
Phase 4: Per-page generation (each article becomes a static page, eliminates data.json)
```

**Alternative considered: plain Vite + vanilla JS.** This would add build tooling (minification, code splitting) without a framework change. It's a lighter lift but doesn't solve the component isolation or data pipeline problems. It's a valid intermediate step if the Astro migration feels too large.

---

## 5. Missing Features & Improvements

### High Value
1. **"What's New" / changelog for players.** Show which articles were added or modified since a configurable date (or since the player's last visit via localStorage). This is the most-requested implicit feature — players need to know what to read after a session.
2. **Dark/light mode toggle.** The site is dark-only. While the dark aesthetic is core to the brand, a reading mode with higher contrast (warm parchment background, dark text) would help extended reading sessions.
3. **Article print/export.** Players can't easily print an article or save it as PDF for offline reference during sessions.
4. **Session recap summaries.** Short TL;DR at the top of each session article so players can quickly catch up without reading the full write-up.
5. **Sovereign domain pages.** Each Sovereign has articles, but there's no visual page showing their domain on the map, their associated NPCs, locations, and items in one place.

### Medium Value
6. **Full-text search highlighting.** When arriving at an article from search, highlight the matched terms in the article body.
7. **Recently viewed articles.** A "Recent" section in the sidebar or welcome page showing the last 5-10 articles the player visited.
8. **Keyboard navigation improvements.** Home key to go to welcome, number keys to jump to categories.
9. **Mobile sidebar improvements.** The sidebar overlay has no swipe-to-close gesture and no backdrop blur.
10. **Image gallery view.** A page showing all art in the compendium as a gallery grid with lightbox.
11. **NPC relationship graph improvements.** The current SVG force-directed graph is functional but basic. Labeled edges (ally/enemy/patron), zoom/pan, and filtering would make it much more useful.
12. **Faction pages.** Group NPCs and locations by faction/allegiance for a political overview.

### Low Value (Nice-to-Have)
13. **Reading time estimates** on articles.
14. **Text-to-speech** for article content (browser API).
15. **Session calendar/timeline visualization** (beyond the basic timeline currently shown).
16. **Custom themes** (different color schemes per Sovereign domain).
17. **PWA improvements** — offline indicator, background sync for data updates.

---

## 6. Performance Analysis

### Current Performance Characteristics
- **Initial load:** ~20MB total (data.json + spells + relationships + images + fonts + vendor JS). On a 10Mbps connection, this is 16+ seconds.
- **app.js (174KB):** Parsed and executed synchronously after DOM load. All 4,380 lines are evaluated even if the player only visits the welcome page.
- **style.css (155KB):** All 6,875 lines loaded upfront. Significant dead CSS.
- **Vendor JS (~500KB+ estimated):** GSAP, Leaflet, Lenis, Tippy, tsParticles, Medium-Zoom, Lucide — all loaded via `defer` scripts even if unused.
- **Fonts (10 TTF files):** TTF format is larger than WOFF2. The `font-display: swap` is correct but WOFF2 would reduce payload by ~50%.

### Optimization Opportunities
1. **Lazy-load data.** Load `spells-data.json` only when the Spell Compendium is opened. Load `relationships-data.json` only when Bonds is opened. This alone could cut initial load by ~85%.
2. **Convert fonts to WOFF2.** TTF → WOFF2 typically reduces font size by 50-70%.
3. **Lazy-load vendor JS.** Leaflet is only needed for the map. tsParticles is decorative. Medium-Zoom is only needed on article pages. Load these on demand.
4. **Purge unused CSS.** Estimated 20-30% of style.css is dead code (disabled particles, unused corner flourishes, commented-out features).
5. **Image lazy loading is already implemented** — good.
6. **WebP images are already used** — good.
7. **Service worker caching strategy is solid** — network-first for dynamic content, cache-first for static assets.

---

## 7. Code Quality Notes

### Positive
- Consistent coding style throughout
- Good use of CSS custom properties (design tokens)
- Accessibility attributes on buttons (`aria-label`)
- Semantic HTML structure
- Thoughtful scroll performance optimizations (animation pausing, `will-change`, `contain`)
- Event delegation on spell list (performance optimization for 669 items)
- Pre-rendered SVG icons in spell detail to avoid `lucide.createIcons()` calls

### Concerns
- **XSS via innerHTML.** Article content from data.json is inserted via innerHTML without sanitization. If the build pipeline ever includes user-contributed content, this is dangerous.
- **onclick in HTML strings.** Multiple instances of `onclick="openCategory('${name}')"` in template strings — mixes JS and HTML, fragile with special characters in names.
- **No error boundaries.** If any function throws during initialization (line 252-293), the entire app breaks silently.
- **Memory leaks potential.** Tippy instances and Medium-Zoom attachments are created on every article navigation but never explicitly destroyed. Over many navigations, this could accumulate.
- **The `escapeRegex` function (line 2784) has a double-escaped backslash** that may cause incorrect regex escaping.

---

## 8. Prioritized Action Plan

### Tier 1: Quick Wins (1-2 days each, high impact, no architecture change)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | **Add "What's New" section** to welcome page — track article modification dates in data.json, show recently changed entries | Highest player value | Low |
| 2 | **Lazy-load spells and relationships data** — fetch on first access instead of startup | Cuts initial load ~85% | Low |
| 3 | **Convert fonts from TTF to WOFF2** | Reduces font payload ~50% | Trivial |
| 4 | **Unify build script** — create a single `build.py` that runs all necessary steps and bumps cache versions | Biggest DM workflow win | Low |
| 5 | **Clean up dead CSS** — remove disabled particles, unused corner flourishes, commented-out features | Reduces CSS ~20% | Low |

### Tier 2: Medium Efforts (3-5 days each, significant improvement)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 6 | **Add Vite as build tool** (without framework change) — enables minification, code splitting, CSS purging, font optimization | Performance + DX | Medium |
| 7 | **Split app.js into ES modules** — separate audio, search, spells, bonds, map, wiki-links into individual files, import from main | Maintainability | Medium |
| 8 | **Add reading mode** — light parchment theme toggle for extended reading | Player comfort | Medium |
| 9 | **Automate image pipeline** — script to convert images to WebP + generate thumbnails | DM workflow | Medium |
| 10 | **Add validation to build pipeline** — check for broken image references, missing wiki-link targets, orphaned entries | Content quality | Medium |

### Tier 3: Strategic Investment (1-2 weeks, transformational)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 11 | **Migrate to Astro** — scaffold project, Content Collections for vault data, extract interactive islands | Architecture | High |
| 12 | **Per-article pages** (post-Astro) — each entry becomes its own route, eliminating the need to load all data upfront | Performance | High |
| 13 | **Automated deployment** — GitHub Action that runs build on vault changes and deploys | DM workflow | Medium |
| 14 | **Sovereign domain hub pages** — visual dashboard per Sovereign showing their NPCs, locations, items, and map region | Player experience | Medium |

### Recommended Sequence
```
Start here:  1 → 2 → 3 → 4 → 5  (Quick wins, do all of these first)
Then:        6 → 7              (Build tooling + modularization)
Then:        11 → 12 → 13      (Astro migration when ready)
Parallel:    8, 9, 10, 14      (Can be done at any point)
```

---

## 9. File Inventory

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `app.js` | 4,380 | 174KB | All frontend logic |
| `style.css` | 6,875 | 155KB | All styles |
| `index.html` | 175 | 8KB | Single page shell |
| `data.json` | 1,539 | ~1.5MB | Main compendium content |
| `spells-data.json` | 16,706 | ~600KB | Spell database |
| `relationships-data.json` | 2,676 | ~100KB | Bonds & standing data |
| `map-data.json` | 168 | ~6KB | Map markers |
| `map-embed.html` | 247 | ~8KB | Leaflet map iframe |
| `sw.js` | 170 | ~5KB | Service worker |
| `serve.js` | 43 | ~1KB | Dev server |
| `parse-spells.js` | ~200 | ~7KB | Spell parser |

**Build scripts (../):**: 23 Python files, ~2,500 lines total

---

*This audit covers the full codebase as of 2026-04-07. All recommendations preserve the existing dark fantasy aesthetic and are designed for incremental adoption — no big-bang rewrites required.*
