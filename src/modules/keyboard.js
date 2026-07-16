// ===== KEYBOARD SHORTCUTS =====
import state from './state.js';
import { openSearchModal, closeSearchModal } from './search.js';
import { toggleBookmark, showBookmarksList } from './bookmarks.js';

// Handler for showItem — set via setKeyboardHandlers from main entry
let handlers = {
  showItem: null,
};

function setKeyboardHandlers(h) {
  Object.assign(handlers, h);
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Escape must work while focus is inside search or another modal input.
    if (e.key === 'Escape') {
      closeSearchModal();
      document.getElementById('keyboard-help')?.remove();
      return;
    }

    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Ctrl/Cmd + K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }

    // J = Next article, K = Previous article
    if (e.key === 'j' || e.key === 'J') {
      e.preventDefault();
      navigateToAdjacentArticle(1);
    }
    if (e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      navigateToAdjacentArticle(-1);
    }

    // ? = Show keyboard shortcuts help
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      showKeyboardHelp();
    }

    // B = Toggle bookmark on current article
    if (e.key === 'b' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      toggleBookmark();
    }

    // Shift+B = Show bookmarks list
    if (e.key === 'B' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      showBookmarksList();
    }
  });
}

function navigateToAdjacentArticle(direction) {
  if (!state.currentCategory || !state.currentItem) return;

  const categoryData = state.data[state.currentCategory];
  if (!categoryData) return;

  const items = categoryData.items;
  const currentIndex = items.findIndex(i => i.id === state.currentItem.id);

  if (currentIndex === -1) return;

  // Calculate new index with wrap-around
  const newIndex = (currentIndex + direction + items.length) % items.length;
  const newItem = items[newIndex];

  const navItem = document.querySelector(`.nav-item[data-id="${newItem.id}"]`);
  if (handlers.showItem) {
    handlers.showItem(state.currentCategory, newItem, navItem);
  }
}

function showKeyboardHelp() {
  const existingHelp = document.getElementById('keyboard-help');
  if (existingHelp) {
    existingHelp.remove();
    return;
  }

  const helpModal = document.createElement('div');
  const previousFocus = document.activeElement;
  helpModal.id = 'keyboard-help';
  helpModal.className = 'keyboard-help-modal';
  helpModal.setAttribute('role', 'dialog');
  helpModal.setAttribute('aria-modal', 'true');
  helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
  helpModal.innerHTML = `
    <div class="keyboard-help-backdrop"></div>
    <div class="keyboard-help-content">
      <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
      <div class="keyboard-help-sections">
        <div class="keyboard-help-section">
          <h4>Navigation</h4>
          <div class="keyboard-help-list">
            <div class="keyboard-help-item">
              <kbd>J</kbd>
              <span>Next article in category</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>K</kbd>
              <span>Previous article in category</span>
            </div>
          </div>
        </div>
        <div class="keyboard-help-section">
          <h4>Search</h4>
          <div class="keyboard-help-list">
            <div class="keyboard-help-item">
              <kbd>Ctrl</kbd> + <kbd>K</kbd>
              <span>Open search</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>1</kbd> - <kbd>9</kbd>
              <span>Toggle category filters</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>0</kbd>
              <span>Clear all filters</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>&uarr;</kbd> <kbd>&darr;</kbd>
              <span>Navigate results</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>Enter</kbd>
              <span>Open selected result</span>
            </div>
          </div>
        </div>
        <div class="keyboard-help-section">
          <h4>Bookmarks</h4>
          <div class="keyboard-help-list">
            <div class="keyboard-help-item">
              <kbd>B</kbd>
              <span>Bookmark current article</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>Shift</kbd> + <kbd>B</kbd>
              <span>View all bookmarks</span>
            </div>
          </div>
        </div>
        <div class="keyboard-help-section">
          <h4>General</h4>
          <div class="keyboard-help-list">
            <div class="keyboard-help-item">
              <kbd>?</kbd>
              <span>Toggle this help</span>
            </div>
            <div class="keyboard-help-item">
              <kbd>Esc</kbd>
              <span>Close modal</span>
            </div>
          </div>
        </div>
      </div>
      <button class="keyboard-help-close" type="button">Close</button>
    </div>
  `;
  document.body.appendChild(helpModal);

  const close = () => {
    helpModal.remove();
    if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
  };
  helpModal.querySelector('.keyboard-help-close').addEventListener('click', close);
  helpModal.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  helpModal.querySelector('.keyboard-help-close').focus();

  // Close on backdrop click
  helpModal.querySelector('.keyboard-help-backdrop').addEventListener('click', () => {
    close();
  });
}

export { setupKeyboardShortcuts, setKeyboardHandlers };
