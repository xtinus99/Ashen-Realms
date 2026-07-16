import state from './state.js';
import { refreshIcons } from './icons.js';

// ===== CALLBACK HANDLERS =====
// Injected from main.js to avoid circular imports
let handlers = {};

export function setUiHandlers(h) {
  handlers = h;
}

// ===== DYNAMIC FOOTER QUOTES =====
export const footerQuotes = [
  "The Maker is dead. The Sovereigns reign.",
  "In ash we are born, in ash we return.",
  "Even gods can bleed.",
  "Thirteen thrones built on the corpse of divinity.",
  "The void whispers secrets to those who listen.",
  "Walk softly in the realm of fallen divinity.",
  "Something ancient stirs in the ash and bone.",
  "Between shadow and flame, truth awaits.",
  "Every sovereign casts a long shadow.",
  "The faithful pray. The wise prepare.",
  "Blood remembers what flesh forgets.",
  "In the silence between heartbeats, they listen.",
  "All roads lead to ruin. Choose yours carefully.",
  "The dead do not stay buried in these lands.",
  "Power has a price. Divinity demands more.",
  "What was torn asunder seeks to be whole.",
  "Trust is a currency spent only once.",
  "The throne room echoes with the screams of gods.",
  "Some doors, once opened, cannot be closed.",
  "Memory is the cruelest wound.",
  "They divided a god. They became monsters.",
  "Hope is the last lie we tell ourselves.",
  "The Usurpation was not the end. It was the beginning.",
  "I will hit you."
];

export function setupDynamicQuotes() {
  const quoteElement = document.querySelector('.footer-quote em');
  if (!quoteElement) return;

  // Set initial random quote
  const randomQuote = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
  quoteElement.textContent = `"${randomQuote}"`;

  // Rotate quotes every 30 seconds
  setInterval(() => {
    const newQuote = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
    quoteElement.style.opacity = '0';
    setTimeout(() => {
      quoteElement.textContent = `"${newQuote}"`;
      quoteElement.style.opacity = '1';
    }, 300);
  }, 30000);
}

// ===== NOTIFICATIONS =====
export function showNotification(message, duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--stone);
    color: var(--bone);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-normal);
    font-family: var(--font-ui);
    font-size: 0.9rem;
    z-index: 1000;
    animation: fadeInUp 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOutDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// ===== MOBILE MENU =====
export function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ===== SWIPE GESTURES FOR MOBILE =====
export function setupSwipeGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const minSwipeDistance = 80;
  const maxVerticalDistance = 100;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    // Only handle swipes for Sessions
    if (state.currentCategory !== 'Sessions' || !state.currentItem) return;

    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // Ignore if vertical movement is too large (user is scrolling)
    if (deltaY > maxVerticalDistance) return;

    // Ignore if horizontal movement is too small
    if (Math.abs(deltaX) < minSwipeDistance) return;

    const sessions = state.data['Sessions']?.items || [];
    const currentIndex = sessions.findIndex(s => s.id === state.currentItem.id);
    if (currentIndex === -1) return;

    if (deltaX > 0) {
      // Swipe right = previous session
      if (currentIndex > 0) {
        const prevSession = sessions[currentIndex - 1];
        const navItem = document.querySelector(`.nav-item[data-id="${prevSession.id}"]`);
        handlers.showItem('Sessions', prevSession, navItem);
        showSwipeIndicator('left');
      }
    } else {
      // Swipe left = next session
      if (currentIndex < sessions.length - 1) {
        const nextSession = sessions[currentIndex + 1];
        const navItem = document.querySelector(`.nav-item[data-id="${nextSession.id}"]`);
        handlers.showItem('Sessions', nextSession, navItem);
        showSwipeIndicator('right');
      }
    }
  }
}

function showSwipeIndicator(direction) {
  // Remove existing indicator
  const existing = document.querySelector('.swipe-indicator');
  if (existing) existing.remove();

  const indicator = document.createElement('div');
  indicator.className = `swipe-indicator ${direction}`;
  indicator.innerHTML = direction === 'left'
    ? '<i data-lucide="chevron-left"></i>'
    : '<i data-lucide="chevron-right"></i>';
  document.body.appendChild(indicator);

  refreshIcons();

  // Remove after animation
  setTimeout(() => indicator.remove(), 500);
}

// ===== LOADING SKELETON =====
export function showLoadingSkeleton() {
  document.getElementById('content-body').innerHTML = `
    <div class="article skeleton-container">
      <header class="article-header">
        <div class="skeleton skeleton-header"></div>
        <div class="skeleton-meta">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
        </div>
      </header>
      <div class="article-body">
        <div class="skeleton-paragraph">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-paragraph">
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
      </div>
    </div>
  `;
}

// ===== 404 NOT FOUND PAGE =====
export function showNotFound(searchTerm = '') {
  state.currentItem = null;
  state.currentCategory = null;

  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">Not Found</span>
  `;

  document.getElementById('content-body').innerHTML = `
    <div class="not-found-container">
      <i data-lucide="ghost" class="not-found-icon"></i>
      <h1 class="not-found-title">Lost in the Ash</h1>
      <p class="not-found-message">
        ${searchTerm
          ? `The entry "${searchTerm}" could not be found in the chronicles. Perhaps it has been consumed by the void.`
          : `This page seems to have faded from existence. The knowledge you seek may lie elsewhere.`
        }
      </p>
      <div class="not-found-actions">
        <button class="not-found-btn" onclick="showWelcome()">
          <i data-lucide="home"></i>
          Return Home
        </button>
        <button class="not-found-btn" onclick="goToRandomArticle()">
          <i data-lucide="shuffle"></i>
          Random Article
        </button>
        <button class="not-found-btn" onclick="openSearchModal()">
          <i data-lucide="search"></i>
          Search
        </button>
      </div>
    </div>
  `;

  refreshIcons();
}

// ===== SCROLL POSITION PERSISTENCE =====
let scrollSaveTimeout = null;

export function saveScrollPosition() {
  const hash = window.location.hash;
  if (hash) {
    localStorage.setItem('scrollPosition_' + hash, window.scrollY);
  }
}

export function restoreScrollPosition() {
  const hash = window.location.hash;
  if (hash) {
    const savedPosition = localStorage.getItem('scrollPosition_' + hash);
    if (savedPosition !== null) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }, 50);
    }
  }
}

// ===== BACK TO TOP BUTTON =====
export function setupBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  const progressBar = document.getElementById('reading-progress');

  // Throttle scroll handler for better performance
  let ticking = false;
  let scrollTimeout = null;

  // Show/hide button and update progress based on scroll position
  window.addEventListener('scroll', () => {
    // Pause animations during scroll for better performance
    document.body.classList.add('is-scrolling');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 150);

    // Save scroll position (debounced)
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(saveScrollPosition, 200);

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Back to top button visibility
        if (backToTopBtn) {
          if (scrollY > 300) {
            backToTopBtn.classList.add('visible');
          } else {
            backToTopBtn.classList.remove('visible');
          }
        }

        // Reading progress indicator
        if (progressBar) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
          progressBar.style.width = `${Math.min(100, progress)}%`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Scroll to top when clicked
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ===== TOGGLE REGION (for category HTML onclick handlers) =====
export function toggleRegion(button) {
  const section = button.closest('.region-section');
  section.classList.toggle('open');
}

// ===== RANDOM ARTICLE =====
export function goToRandomArticle() {
  // Gather all items from all categories
  const allItems = [];
  for (const [categoryName, categoryData] of Object.entries(state.data)) {
    for (const item of categoryData.items) {
      allItems.push({ category: categoryName, item: item });
    }
  }

  if (allItems.length === 0) return;

  // Pick a random item
  const randomIndex = Math.floor(Math.random() * allItems.length);
  const { category, item } = allItems[randomIndex];

  // Navigate to it
  const navItem = document.querySelector(`.nav-item[data-id="${item.id}"]`);
  handlers.showItem(category, item, navItem);
}

// ===== TOP BAR ACTIONS =====
export function setupTopBarActions(toggleBookmark) {
  const randomBtn = document.getElementById('random-article-btn');
  const copyBtn = document.getElementById('copy-link-btn');
  const bookmarkBtn = document.getElementById('bookmark-btn');

  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      goToRandomArticle();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyCurrentLink(copyBtn);
    });
  }

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      toggleBookmark();
    });
  }
}

function copyCurrentLink(btn) {
  const url = window.location.href;

  navigator.clipboard.writeText(url).then(() => {
    btn.classList.add('copied');
    let icon = btn.querySelector('svg');
    if (icon) {
      icon.setAttribute('data-lucide', 'check');
      refreshIcons();
    }

    setTimeout(() => {
      btn.classList.remove('copied');
      icon = btn.querySelector('svg');
      if (icon) {
        icon.setAttribute('data-lucide', 'link');
        refreshIcons();
      }
    }, 2000);

    showNotification('Link copied to clipboard!');
  }).catch(() => {
    showNotification('Failed to copy link');
  });
}

// ===== LOGO CLICK =====
export function setupLogoClick() {
  const sigil = document.getElementById('sigil-icon');

  // Only sigil click navigates home (with divine glow pulse animation)
  if (sigil) {
    sigil.style.cursor = 'pointer';
    sigil.addEventListener('click', (e) => {
      e.stopPropagation();
      sigil.classList.add('divine-pulse');
      // Remove class after animation completes
      setTimeout(() => {
        sigil.classList.remove('divine-pulse');
      }, 600);
      // Navigate home
      handlers.showWelcome();
      // Close mobile sidebar if open
      document.getElementById('sidebar').classList.remove('open');
    });
  }
}

// ===== ANIMATIONS (CSS keyframes for notifications) =====
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes fadeOutDown {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, 20px); }
  }
`;
document.head.appendChild(style);

// ===== EXPOSE TO WINDOW FOR INLINE ONCLICK HANDLERS =====
window.toggleRegion = toggleRegion;
window.goToRandomArticle = goToRandomArticle;
