let enabled = false;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initSmoothScroll() {
  enabled = !prefersReducedMotion();
  document.documentElement.classList.toggle('smooth-scroll', enabled);
}

export function destroySmoothScroll() {
  enabled = false;
  document.documentElement.classList.remove('smooth-scroll');
}

export function scrollBehavior() {
  return enabled ? 'smooth' : 'auto';
}
