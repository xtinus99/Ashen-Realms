import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;
let lenisRafId = null;

export function initSmoothScroll() {
  if (lenisInstance) return;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    prevent: (node) => {
      // Allow native scrolling for elements with data-lenis-prevent
      return node.closest('[data-lenis-prevent]') !== null;
    }
  });

  function raf(time) {
    if (lenisInstance) {
      lenisInstance.raf(time);
      lenisRafId = requestAnimationFrame(raf);
    }
  }

  lenisRafId = requestAnimationFrame(raf);

  // Integrate with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    if (lenisInstance) lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

export function destroySmoothScroll() {
  if (lenisRafId) {
    cancelAnimationFrame(lenisRafId);
    lenisRafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  // Remove any Lenis classes from html
  document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
}
