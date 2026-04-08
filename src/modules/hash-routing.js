import state from './state.js';

export function updateHash(category = null, itemId = null) {
  if (category && itemId) {
    window.location.hash = `${encodeURIComponent(category)}/${encodeURIComponent(itemId)}`;
  } else if (category) {
    window.location.hash = encodeURIComponent(category);
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}

// restoreFromHash needs callbacks for showRelationships, showSpells, showItem,
// openCategory, showWelcome, showNotFound, restoreScrollPosition.
// These are injected from main.js to avoid circular imports.

let handlers = {};

export function setHashHandlers(h) {
  handlers = h;
}

export function restoreFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return false;

  // Handle bonds page
  if (hash === 'bonds') {
    handlers.showRelationships();
    return true;
  }

  // Handle spells page
  if (hash === 'spells') {
    handlers.showSpells();
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
      handlers.showItem(categoryName, item, navItem, true, true); // skip hash update, skip scroll to top
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
