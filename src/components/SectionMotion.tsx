'use client';

import { useEffect } from 'react';
import { gsap, MOBILE, REDUCED_MOTION, ScrollTrigger } from '@/lib/animations';

function alignInitialFragment(main: HTMLElement) {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (entry && entry.type !== 'navigate') return;

  const hash = location.hash;
  const section = Array.from(main.children).find(element => element.id === hash.slice(1));
  if (!section || section.id === 'home') return;

  // ScrollTrigger can interrupt the native fragment jump during the first refresh.
  const frame = requestAnimationFrame(() => {
    if (location.hash !== hash || window.scrollY > 16) return;
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
    ScrollTrigger.update();
  });
  return () => cancelAnimationFrame(frame);
}

function trackNavigation() {
  const navbar = document.querySelector<HTMLElement>('.navbar');
  const progress = navbar?.querySelector<HTMLElement>('.nav-progress span');
  if (!navbar || !progress) return;

  const links = Array.from(navbar.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]'));
  const items = links.flatMap(link => {
    const section = document.getElementById(link.hash.slice(1));
    return section ? [{ link, section, top: 0 }] : [];
  });
  let current: HTMLAnchorElement | undefined;
  const scale = gsap.quickSetter(progress, 'scaleX');
  let offset = 0;

  function sync(trigger: ScrollTrigger) {
    scale(trigger.progress);
    const position = trigger.scroll() + offset + 2;
    // The last section can be shorter than the viewport.
    const active = trigger.progress >= 0.999 && trigger.end > 1
      ? items.at(-1)
      : items.findLast(item => item.top <= position) ?? items[0];
    if (active?.link === current) return;
    current?.removeAttribute('aria-current');
    current = active?.link;
    current?.setAttribute('aria-current', 'location');
  }

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: sync,
    onRefresh(self) {
      const scroll = self.scroll();
      offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || navbar!.offsetHeight;
      for (const item of items) item.top = item.section.getBoundingClientRect().top + scroll;
      sync(self);
    },
  });
  navbar.dataset.scrollTracking = '';
  return () => {
    trigger.kill();
    current?.removeAttribute('aria-current');
    progress.style.removeProperty('transform');
    delete navbar.dataset.scrollTracking;
  };
}

function bindMagneticLinks(main: HTMLElement) {
  const remove = Array.from(main.querySelectorAll<HTMLElement>('[data-magnetic]'), link => {
    const x = gsap.quickTo(link, 'x', { duration: 0.35, ease: 'power3.out' });
    const y = gsap.quickTo(link, 'y', { duration: 0.35, ease: 'power3.out' });
    const reset = () => { x(0); y(0); };

    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || link.matches(':focus-visible')) return;
      const bounds = link.getBoundingClientRect();
      const dx = (event.clientX - bounds.left - bounds.width / 2) * 0.16;
      const dy = (event.clientY - bounds.top - bounds.height / 2) * 0.3;
      const limit = Math.max(1, Math.hypot(dx, dy) / 8);
      x(dx / limit);
      y(dy / limit);
    }

    link.addEventListener('pointermove', move);
    link.addEventListener('pointerleave', reset);
    link.addEventListener('focus', reset);
    return () => {
      link.removeEventListener('pointermove', move);
      link.removeEventListener('pointerleave', reset);
      link.removeEventListener('focus', reset);
    };
  });
  return () => remove.forEach(cleanup => cleanup());
}

function revealSections(main: HTMLElement, compact: boolean) {
  const about = main.querySelector<HTMLElement>('#about');
  const services = main.querySelector<HTMLElement>('#services');
  const projects = main.querySelector<HTMLElement>('#projects');
  const stack = about?.querySelector<HTMLElement>('.stack');
  if (!about || !services || !projects || !stack) return;
  stack.setAttribute('data-marquee-enabled', '');

  const groups: { trigger: Element; timeline: gsap.core.Timeline }[] = [];
  const endMask = 'inset(-14% -4% -14% -4%)';

  function reveal(trigger: Element, start = 'top 89%') {
    const timeline = gsap.timeline({
      defaults: { duration: compact ? 0.52 : 0.78, ease: 'power3.out' },
      scrollTrigger: { trigger, start, once: true },
    });
    groups.push({ trigger, timeline });
    return timeline;
  }

  function heading(section: HTMLElement, start?: string) {
    const label = section.querySelector('.section-label');
    const title = section.querySelector('h2');
    const dot = label?.querySelector('.status-dot');
    const timeline = reveal(section, start);
    timeline
      .from(label, { opacity: 0, y: 12 }, 0)
      .fromTo(title, { clipPath: 'inset(0 -4% 100% -4%)', y: 13 }, { clipPath: endMask, y: 0 }, 0.13);
    if (dot) timeline.from(dot, { scale: 0.55, opacity: 0, duration: 0.4 }, 0);
    return timeline;
  }

  heading(about, 'top 76%')
    .from(about.querySelector('.about-aside'), { opacity: 0, y: 17 }, 0.27)
    .from(about.querySelector('.biography'), { opacity: 0, y: compact ? 24 : 42 }, 0.2)
    .from(about.querySelectorAll('.bio-detail'), { opacity: 0, y: 12, stagger: 0.075 }, 0.35);

  heading(services);
  const serviceList = services.querySelector('.service-list');
  if (serviceList) {
    reveal(serviceList, 'top 92%').from(serviceList.children, {
      opacity: 0, y: compact ? 21 : 36, stagger: compact ? 0.05 : 0.085,
    });
  }

  heading(projects);
  projects.querySelectorAll<HTMLElement>('.project').forEach(article => {
    const media = article.querySelector('.project-media');
    const visual = article.querySelector('.media-viewport');
    reveal(article, 'top 91%')
      .fromTo(media, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)' }, 0)
      .from(article.querySelector('.project-copy'), { opacity: 0, y: compact ? 19 : 33 }, 0.16)
      .from(article.querySelector('.project-index'), { x: compact ? -5 : -12, opacity: 0 }, 0.21)
      .from(article.querySelectorAll('.project-tags li'), { opacity: 0, y: 8, stagger: 0.055 }, 0.37);

    if (!compact && media && visual) {
      gsap.fromTo(visual, { y: -18 }, {
        y: 18,
        ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  const contact = main.querySelector('#contact');
  if (contact) {
    reveal(contact, 'top 88%')
      .from(contact.querySelector('.availability'), { opacity: 0, y: 12, duration: 0.5 }, 0)
      .fromTo(contact.querySelector('h2'), { clipPath: 'inset(0 -4% 100% -4%)' }, { clipPath: endMask, duration: 0.73 }, 0.1)
      .from(contact.querySelector('.contact-copy'), { opacity: 0, y: 16, duration: 0.55 }, 0.23)
      .from(contact.querySelectorAll('.contact-actions > *'), { opacity: 0, duration: 0.5, stagger: 0.08 }, 0.35)
      .from(contact.querySelector('.contact-card'), { opacity: 0, y: compact ? 18 : 30, duration: 0.65 }, 0.21);
  }

  const observer = typeof IntersectionObserver === 'undefined' ? undefined
    : new IntersectionObserver(([entry]) => stack.toggleAttribute('data-in-view', entry.isIntersecting));
  stack.toggleAttribute('data-in-view', !observer);
  observer?.observe(stack);
  let focusFrame = 0;

  function revealFocusedLink(event: FocusEvent) {
    if (!(event.target instanceof HTMLElement) || !event.target.matches('a[href], button')) return;
    const target = event.target;
    const group = groups.find(({ trigger }) => trigger.contains(target));
    if (!group) return;
    group.timeline.progress(1);
    if (!target.matches(':focus-visible')) return;

    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(() => {
      // Tabbing can focus a link before the clipped panel has painted.
      if (document.activeElement === target) target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    });
  }
  main.addEventListener('focusin', revealFocusedLink);

  return () => {
    cancelAnimationFrame(focusFrame);
    observer?.disconnect();
    stack.removeAttribute('data-in-view');
    stack.removeAttribute('data-marquee-enabled');
    main.removeEventListener('focusin', revealFocusedLink);
  };
}

export default function SectionMotion() {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ always: 'all', compact: MOBILE, reduced: REDUCED_MOTION }, context => {
      if (context.conditions?.reduced) return;
      return revealSections(main, !!context.conditions?.compact);
    }, main);
    media.add('(hover: hover) and (pointer: fine) and (min-width: 681px) and (prefers-reduced-motion: no-preference)',
      () => bindMagneticLinks(main), main);
    const stopNavigation = trackNavigation();
    const cancelFragment = alignInitialFragment(main);

    return () => {
      cancelFragment?.();
      media.revert();
      stopNavigation?.();
    };
  }, []);

  return null;
}
