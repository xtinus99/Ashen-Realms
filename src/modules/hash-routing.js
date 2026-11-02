import state from './state.js';

// Realms other than the present carry their name in the hash: #archive/..., #eve/...
const REALM_PREFIXES = ['archive', 'eve'];

export function updateHash(category = null, itemId = null) {
  const realm = REALM_PREFIXES.includes(state.currentRealm) ? state.currentRealm : '';
  const prefix = realm ? `${realm}/` : '';
  if (category && itemId) {
    window.location.hash = `${prefix}${encodeURIComponent(category)}/${encodeURIComponent(itemId)}`;
  } else if (category) {
    window.location.hash = `${prefix}${encodeURIComponent(category)}`;
  } else if (realm) {
    window.location.hash = realm;
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}

// restoreFromHash needs callbacks for showRelationships, showSpells, showFeats, showItem,
// openCategory, showWelcome, showNotFound, restoreScrollPosition.
// These are injected from main.js to avoid circular imports.

let handlers = {};

export function setHashHandlers(h) {
  handlers = h;
}

export async function restoreFromHash() {
  let hash = window.location.hash.slice(1);
  if (!hash) return false;

  // Handle the Archive of the Dead realm
  if (hash === 'archive') {
    if (state.currentRealm !== 'archive' && handlers.enterArchiveSilent) handlers.enterArchiveSilent();
    if (handlers.showArchiveLanding) handlers.showArchiveLanding();
    return true;
  }
  // Handle the eve (Behind the Seam)
  if (hash === 'eve') {
    if (state.currentRealm !== 'eve' && handlers.enterEveSilent) handlers.enterEveSilent();
    if (handlers.showEveLanding) handlers.showEveLanding();
    return true;
  }
  if (hash.startsWith('archive/')) {
    if (state.currentRealm !== 'archive' && handlers.enterArchiveSilent) handlers.enterArchiveSilent();
    hash = hash.slice('archive/'.length);
  } else if (hash.startsWith('eve/')) {
    if (state.currentRealm !== 'eve' && handlers.enterEveSilent) handlers.enterEveSilent();
    hash = hash.slice('eve/'.length);
  } else if (state.currentRealm && state.currentRealm !== 'living' && handlers.enterLivingSilent) {
    // A plain hash belongs to the present (Back from a realm landed on "Lost in the Ash" before)
    handlers.enterLivingSilent();
  }

  // Handle bonds page
  if (hash === 'bonds') {
    await handlers.showRelationships();
    return true;
  }

  // Handle spells page
  if (hash === 'spells') {
    await handlers.showSpells();
    return true;
  }

  // Handle feats page
  if (hash === 'feats') {
    await handlers.showFeats();
    return true;
  }

  const parts = hash.split('/').map(decodeURIComponent);
  const categoryName = parts[0];
  const itemId = parts[1];

  // Category not found
  if (!state.data[categoryName]) {
    handlers.showNotFound(categoryName);
    return true;
  }

  if (itemId) {
    // Search in main items
    let item = state.data[categoryName].items.find(i => i.id === itemId);

    // If not found, search in subcategories
    if (!item && state.data[categoryName].subcategories) {
      for (const subItems of Object.values(state.data[categoryName].subcategories)) {
        item = subItems.find(i => i.id === itemId);
        if (item) break;
      }
    }

    if (item) {
      const navItem = document.querySelector(`.nav-item[data-id="${itemId}"]`);
      await handlers.showItem(categoryName, item, navItem, true, true); // skip hash update, skip scroll to top
      // Restore scroll position after content loads
      handlers.restoreScrollPosition();
      return true;
    } else {
      // Item not found in category
      handlers.showNotFound(itemId);
      return true;
    }
  } else {
    handlers.openCategory(categoryName, true, true); // skip hash update, skip scroll to top
    // Restore scroll position after content loads
    handlers.restoreScrollPosition();
    return true;
  }
}
