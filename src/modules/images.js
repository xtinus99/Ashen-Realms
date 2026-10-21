import mediumZoom from 'medium-zoom';

// Check if browser supports WebP
const supportsWebP = (() => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
})();

// Set to true once you've uploaded images/images/ and images/thumbnails/ to the server
const USE_WEBP = true;

/**
 * Convert an image path to use optimized WebP version if available.
 * Falls back to original if WebP not supported or USE_WEBP is false.
 */
export function getOptimizedImagePath(originalPath) {
  if (!originalPath) return originalPath;

  // Only process images in the images/ folder
  if (!originalPath.startsWith('images/')) {
    return originalPath;
  }

  // Check for supported extensions
  const isPng = originalPath.endsWith('.png');
  const isJpeg = originalPath.endsWith('.jpeg') || originalPath.endsWith('.jpg');

  if (!isPng && !isJpeg) {
    return originalPath;
  }

  if (USE_WEBP && supportsWebP) {
    // Convert images/Name.png or images/Name.jpeg -> images/Name.webp
    const filename = originalPath
      .replace('images/', '')
      .replace('.png', '')
      .replace('.jpeg', '')
      .replace('.jpg', '');
    return `images/${filename}.webp`;
  }

  return originalPath;
}

// Name of a picture in images/, without its extension ("images/Edra.webp" -> "Edra").
function imageStem(originalPath) {
  if (!originalPath || !originalPath.startsWith('images/')) return null;
  const match = originalPath.slice('images/'.length).match(/^(.+)\.(webp|png|jpe?g)$/i);
  return match ? match[1] : null;
}

/**
 * Card-sized copy of an entry picture (short side 480 px), made by scripts/build-thumbnails.py.
 * Used by category cards. Give the <img> a data-full attribute so a missing thumbnail
 * falls back to the full picture.
 */
export function getThumbnailPath(originalPath) {
  const stem = imageStem(originalPath);
  return stem && USE_WEBP && supportsWebP ? `thumbnails/${stem}.webp` : originalPath;
}

/**
 * 160 px square centred on the face (scripts/build-thumbnails.py), for small round
 * portraits: the sidebar, the home page party and house crests.
 */
export function getAvatarPath(originalPath) {
  const stem = imageStem(originalPath);
  return stem && USE_WEBP && supportsWebP ? `thumbnails/faces/${stem}.webp` : originalPath;
}

// Face centres ([x, y] as fractions of the picture) from scripts/build-thumbnails.py
let faceCentresPromise = null;
export function getFaceCentre(originalPath) {
  const stem = imageStem(originalPath);
  if (!stem) return Promise.resolve(null);
  faceCentresPromise ||= fetch('thumbnails/faces.json')
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => ({}));
  return faceCentresPromise.then((centres) => centres[stem] || null);
}

// Any <img data-full="..."> whose small copy is missing falls back to the full picture.
// Error events don't bubble, so listen in the capture phase.
document.addEventListener('error', (event) => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  const full = img.dataset.full;
  if (full && img.getAttribute('src') !== full) {
    img.src = full;
  }
}, true);

/**
 * Process all images in HTML content to use optimized versions and add lazy loading.
 * Called after rendering article content.
 */
export function optimizeContentImages(container) {
  const images = container.querySelectorAll('img');

  images.forEach(img => {
    // Skip images with data-no-zoom (like easter egg)
    if (img.hasAttribute('data-no-zoom')) {
      img.style.opacity = '1';
      return;
    }

    const originalSrc = img.getAttribute('src');

    // Store original for lightbox (full quality)
    img.dataset.originalSrc = originalSrc;

    // Use optimized WebP version
    const optimizedSrc = getOptimizedImagePath(originalSrc);
    img.setAttribute('src', optimizedSrc);

    // Add lazy loading for images not in viewport
    img.setAttribute('loading', 'lazy');

    // Add decoding async for non-blocking decode
    img.setAttribute('decoding', 'async');

    // Add fade-in effect when loaded
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';

    img.onload = () => {
      img.style.opacity = '1';
    };

    // If already cached/loaded
    if (img.complete) {
      img.style.opacity = '1';
    }

    markOrientation(img);
  });
}

/**
 * Tag wide pictures .is-landscape (and their .npc-portrait frame) so the CSS can give
 * them room; otherwise a landscape scene or creature shrinks to the 230-280px portrait cap.
 * Uses the width/height attributes when the build wrote them, then the real size on load.
 */
function markOrientation(img) {
  const apply = (w, h) => {
    if (!w || !h) return;
    const landscape = w > h * 1.1;
    img.classList.toggle('is-landscape', landscape);
    img.closest('.npc-portrait')?.classList.toggle('is-landscape', landscape);
    img.closest('.article-lead')?.classList.toggle('is-landscape', landscape);
  };
  apply(Number(img.getAttribute('width')), Number(img.getAttribute('height')));
  if (img.complete && img.naturalWidth) {
    apply(img.naturalWidth, img.naturalHeight);
  } else {
    img.addEventListener('load', () => apply(img.naturalWidth, img.naturalHeight), { once: true });
  }
}

// ===== IMAGE ZOOM (Medium-Zoom) =====
let mediumZoomInstance = null;

function setupImageZoom() {
  // Initialize Medium-Zoom with custom styling
  // mediumZoom returns a zoom instance we can use to attach/detach images
  mediumZoomInstance = mediumZoom({
    margin: 40,
    background: 'rgba(10, 10, 12, 0.95)',
    scrollOffset: 0
  });
}

export function attachImageZoom() {
  // Attach zoom to new images in content, excluding certain elements
  const contentBody = document.getElementById('content-body');
  if (!contentBody) return;

  // Select all images that should be zoomable
  const images = contentBody.querySelectorAll('img:not(.welcome-sigil):not([data-no-zoom]):not([data-zoom-attached])');

  images.forEach(img => {
    // Skip if is a thumbnail in entry list or bond card
    if (img.closest('.entry-portrait') || img.closest('.card-portrait')) return;

    // Mark as attached to prevent double-attachment
    img.dataset.zoomAttached = 'true';
    img.style.cursor = 'zoom-in';

    // Attach to medium-zoom instance
    if (mediumZoomInstance) {
      mediumZoomInstance.attach(img);
    }
  });
}

// Legacy function name for compatibility
export function setupLightbox() {
  setupImageZoom();
}
