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

/**
 * Get thumbnail path for an image (used in category cards, search results)
 */
export function getThumbnailPath(originalPath) {
  if (!originalPath) return originalPath;

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
    const filename = originalPath
      .replace('images/', '')
      .replace('.png', '')
      .replace('.jpeg', '')
      .replace('.jpg', '');
    return `thumbnails/${filename}.webp`;
  }

  return originalPath;
}

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
  });
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
