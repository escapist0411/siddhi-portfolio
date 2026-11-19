import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export { gsap, ScrollTrigger };

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
export const MOBILE = '(max-width: 680px)';
export const PORTRAIT_FORMATION = 'portfolio:portrait-formation';
export const PORTRAIT_SETTLE = 'portfolio:portrait-settle';
export const PORTRAIT_REFORM = 'portfolio:reform-particles';

export function setupSmoothScroll() {
  const root = document.documentElement;
  const lenis = new Lenis({ autoRaf: false, lerp: 0.105, syncTouch: false });
  const tick = (seconds: number) => lenis.raf(seconds * 1000);
  const unsubscribe = lenis.on('scroll', ScrollTrigger.update);

  function syncAnchor() {
    root.dataset.anchor = location.hash.slice(1);
  }

  function followAnchor(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || lenis.isStopped) return;
    const link = event.target instanceof Element && event.target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#main') return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    if (location.hash !== hash) history.pushState(history.state, '', hash);
    syncAnchor();

    // Match native anchor focus behavior without jumping ahead of the animation.
    const focusTarget = target.querySelector<HTMLElement>('h1, h2') ?? target;
    if (!focusTarget.hasAttribute('tabindex')) focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
    lenis.scrollTo(target);
  }

  gsap.ticker.add(tick);
  syncAnchor();
  document.addEventListener('click', followAnchor);
  window.addEventListener('popstate', syncAnchor);
  window.addEventListener('hashchange', syncAnchor);
  return {
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    destroy() {
      window.removeEventListener('hashchange', syncAnchor);
      window.removeEventListener('popstate', syncAnchor);
      document.removeEventListener('click', followAnchor);
      delete root.dataset.anchor;
      gsap.ticker.remove(tick);
      unsubscribe();
      lenis.destroy();
    },
  };
}
