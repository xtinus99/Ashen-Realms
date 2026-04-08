import state from './state.js';
import { refreshIcons } from './icons.js';
import { showNotification } from './ui.js';

// Callbacks injected from main.js to avoid circular imports
let handlers = {};

export function setBookmarkHandlers(h) {
  handlers = h;
}

export function getBookmarks() {
  const saved = localStorage.getItem('bookmarks');
  return saved ? JSON.parse(saved) : [];
}

function saveBookmarks(bookmarks) {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

export function isBookmarked(categoryName, itemId) {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.category === categoryName && b.id === itemId);
}

export function toggleBookmark() {
  if (!state.currentItem || !state.currentCategory) {
    showNotification('Navigate to an article to bookmark it');
    return;
  }

  const bookmarks = getBookmarks();
  const existingIndex = bookmarks.findIndex(
    b => b.category === state.currentCategory && b.id === state.currentItem.id
  );

  const bookmarkBtn = document.getElementById('bookmark-btn');

  if (existingIndex >= 0) {
    // Remove bookmark
    bookmarks.splice(existingIndex, 1);
    bookmarkBtn.classList.remove('bookmarked');
    showNotification('Bookmark removed');
  } else {
    // Add bookmark
    bookmarks.push({
      category: state.currentCategory,
      id: state.currentItem.id,
      title: state.currentItem.title,
      timestamp: Date.now()
    });
    bookmarkBtn.classList.add('bookmarked');
    showNotification('Article bookmarked!');
  }

  saveBookmarks(bookmarks);
}

export function updateBookmarkButton() {
  const bookmarkBtn = document.getElementById('bookmark-btn');
  if (!bookmarkBtn) return;

  if (state.currentItem && state.currentCategory && isBookmarked(state.currentCategory, state.currentItem.id)) {
    bookmarkBtn.classList.add('bookmarked');
  } else {
    bookmarkBtn.classList.remove('bookmarked');
  }
}

export function showBookmarksList() {
  const bookmarks = getBookmarks();

  // Remove existing modal if present
  const existing = document.getElementById('bookmarks-modal');
  if (existing) {
    existing.remove();
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'bookmarks-modal';
  modal.className = 'bookmarks-modal';

  let bookmarksHtml = '';
  if (bookmarks.length === 0) {
    bookmarksHtml = '<p class="bookmarks-empty">No bookmarks yet. Press <kbd>B</kbd> on any article to bookmark it.</p>';
  } else {
    bookmarksHtml = '<ul class="bookmarks-list">';
    for (const bookmark of bookmarks) {
      const categoryInfo = state.data[bookmark.category]?.info;
      const icon = categoryInfo?.icon || 'file-text';
      bookmarksHtml += `
        <li class="bookmarks-item" data-category="${bookmark.category}" data-id="${bookmark.id}">
          <i data-lucide="${icon}"></i>
          <div class="bookmarks-item-info">
            <span class="bookmarks-item-title">${bookmark.title}</span>
            <span class="bookmarks-item-category">${bookmark.category}</span>
          </div>
          <button class="bookmarks-remove" data-category="${bookmark.category}" data-id="${bookmark.id}" title="Remove bookmark">
            <i data-lucide="x"></i>
          </button>
        </li>
      `;
    }
    bookmarksHtml += '</ul>';
  }

  modal.innerHTML = `
    <div class="bookmarks-modal-backdrop"></div>
    <div class="bookmarks-modal-content">
      <div class="bookmarks-modal-header">
        <h3><i data-lucide="bookmark"></i> Bookmarks</h3>
        <button class="bookmarks-modal-close" aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="bookmarks-modal-body">
        ${bookmarksHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  refreshIcons();

  // Close handlers
  modal.querySelector('.bookmarks-modal-backdrop').addEventListener('click', () => modal.remove());
  modal.querySelector('.bookmarks-modal-close').addEventListener('click', () => modal.remove());

  // Navigate to bookmark on click
  modal.querySelectorAll('.bookmarks-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.bookmarks-remove')) return;
      const category = item.dataset.category;
      const id = item.dataset.id;
      const categoryData = state.data[category];
      if (categoryData) {
        const itemData = categoryData.items.find(i => i.id === id);
        if (itemData) {
          const navItem = document.querySelector(`.nav-item[data-id="${id}"]`);
          handlers.showItem(category, itemData, navItem);
          modal.remove();
        }
      }
    });
  });

  // Remove bookmark button
  modal.querySelectorAll('.bookmarks-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const category = btn.dataset.category;
      const id = btn.dataset.id;
      const bookmarks = getBookmarks();
      const index = bookmarks.findIndex(b => b.category === category && b.id === id);
      if (index !== -1) {
        bookmarks.splice(index, 1);
        saveBookmarks(bookmarks);
        btn.closest('.bookmarks-item').remove();
        updateBookmarkButton();
        if (bookmarks.length === 0) {
          modal.querySelector('.bookmarks-modal-body').innerHTML =
            '<p class="bookmarks-empty">No bookmarks yet. Press <kbd>B</kbd> on any article to bookmark it.</p>';
        }
      }
    });
  });
}
