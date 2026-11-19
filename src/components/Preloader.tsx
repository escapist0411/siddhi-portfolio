'use client';

import { useEffect, useRef } from 'react';
import {
  gsap, MOBILE, PORTRAIT_FORMATION, PORTRAIT_SETTLE, REDUCED_MOTION,
  ScrollTrigger, setupSmoothScroll,
} from '@/lib/animations';

const letters = [
  { text: 'S', x: -48, y: 24, rotate: -7 },
  { text: 'I', x: -21, y: -33, rotate: 5 },
  { text: 'D', x: -11, y: 28, rotate: -4 },
  { text: 'D', x: 15, y: -22, rotate: 6 },
  { text: 'H', x: 25, y: 29, rotate: -5 },
  { text: 'I', x: 42, y: -26, rotate: 7 },
];

export default function Preloader() {
  const screen = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const overlay = screen.current;
    const skipButton = skip.current;
    if (!overlay || !skipButton) return;

    const root = document.documentElement;
    const content = document.querySelector<HTMLElement>('[data-intro-content]');
    const title = document.getElementById('hero-title');
    const hero = document.getElementById('home');
    const portrait = document.querySelector<HTMLElement>('.portrait-layer');
    const navbar = document.querySelector<HTMLElement>('.navbar');
    const identity = document.querySelector<HTMLElement>('.hero-identity');
    const point = overlay.querySelector('.intro-point');
    const backdrop = overlay.querySelector('.intro-backdrop');
    const name = overlay.querySelector('.intro-name');
    const chromeLetters = overlay.querySelectorAll('.intro-letter');
    const details = hero?.querySelectorAll('[data-intro-detail]') ?? [];
    const reduced = window.matchMedia(REDUCED_MOTION);
    const mobile = window.matchMedia(MOBILE).matches;
    const previousInert = content?.inert ?? false;
    let smoothScroll: ReturnType<typeof setupSmoothScroll> | undefined;
    let intro: gsap.Context | undefined;
    let parallax: gsap.Context | undefined;
    let watchdog: number | undefined;
    let running = false;

    function releaseIntro() {
      window.clearTimeout(watchdog);
      try {
        intro?.revert();
      } finally {
        intro = undefined;
        running = false;
        if (content) content.inert = previousInert;
        smoothScroll?.start();
      }
    }

    function finishIntro(settle = false) {
      const returnFocus = document.activeElement === skipButton;
      root.dataset.intro = 'complete';
      try {
        releaseIntro();
      } finally {
        if (settle) window.dispatchEvent(new Event(PORTRAIT_SETTLE));
        if (returnFocus) title?.focus({ preventScroll: true });
      }
      ScrollTrigger.refresh();
    }

    function syncMotion() {
      if (reduced.matches) {
        finishIntro(true);
        parallax?.revert();
        parallax = undefined;
        smoothScroll?.destroy();
        smoothScroll = undefined;
        return;
      }

      try {
        gsap.registerPlugin(ScrollTrigger);
        smoothScroll ??= setupSmoothScroll();
        if (!parallax && hero) {
          parallax = gsap.context(() => {
            gsap.to('.hero-title-motion', {
              y: () => -Math.min(54, hero.clientHeight * 0.06),
              ease: 'none',
              scrollTrigger: {
                trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true,
              },
            });
          }, hero);
        }
      } catch {
        finishIntro(true);
      }
    }

    function startIntro() {
      if (root.dataset.intro === 'complete' || reduced.matches) return;
      if (!content || !title || !portrait || !navbar || !identity || !point || !backdrop || !name || window.scrollY > 4 ||
          (location.hash && location.hash !== '#home')) {
        finishIntro(true);
        return;
      }

      running = true;
      root.dataset.intro = 'running';
      content.inert = true;
      // Independent of the timeline so a failure can never trap scroll or focus.
      watchdog = window.setTimeout(() => finishIntro(true), mobile ? 5350 : 7200);
      try {
        smoothScroll?.stop();
        intro = gsap.context(() => {});
        intro.add(() => {
          const timeline = gsap.timeline({ onComplete: () => finishIntro() });

          timeline
            .set([portrait, identity, navbar, ...details], { opacity: 0 }, 0)
            .set(title, { clipPath: 'inset(0 100% 0 0)', filter: 'blur(8px)', opacity: 0 }, 0)
            .set(point, { scale: 0.35, opacity: 0 }, 0)
            .set(chromeLetters, {
              x: (i: number) => letters[i].x * (mobile ? 0.6 : 1),
              y: (i: number) => letters[i].y,
              rotation: (i: number) => letters[i].rotate,
              filter: 'blur(12px)', opacity: 0,
            }, 0)
            .to(point, { scale: 1.45, opacity: 1, duration: 0.53, ease: 'power2.out' }, 0.1)
            .to(point, { scale: 0.7, opacity: 0, duration: 0.42, ease: 'power2.inOut' }, 0.65)
            .to(chromeLetters, {
              x: 0, y: 0, rotation: 0, filter: 'blur(0px)', opacity: 1,
              duration: 1.03, stagger: 0.069, ease: 'power3.out',
            }, 0.71)
            .to(name, { '--sweep': '225%', duration: 0.75, ease: 'power2.inOut' }, 2.07)
            .to(name, { scale: 1.07, y: -22, opacity: 0, filter: 'blur(11px)', duration: 0.77, ease: 'power2.in' }, 2.86)
            .call(() => window.dispatchEvent(new Event(PORTRAIT_FORMATION)), [], 3.12)
            .to(backdrop, { opacity: 0, duration: 0.62, ease: 'power2.inOut' }, 3.16)
            .to(portrait, { opacity: 1, duration: 0.76 }, 3.35)
            .to(title, {
              clipPath: 'inset(-12% -4% -12% -4%)', filter: 'blur(0px)', opacity: 1,
              duration: 1.48, ease: 'power3.out',
            }, 3.29)
            .fromTo(identity, { y: 16 }, { y: 0, opacity: 1, duration: 0.72, ease: 'power3.out' }, 4.79)
            .to(details, { opacity: 1, duration: 0.58 }, 5.09)
            .fromTo(navbar, { y: -9 }, { y: 0, opacity: 1, duration: 0.56, ease: 'power2.out' }, 5.55);
          timeline.timeScale(mobile ? 1.3 : 1);
        });
      } catch {
        finishIntro(true);
      }
    }

    const skipIntro = () => finishIntro(true);
    const restorePage = (event: PageTransitionEvent) => {
      if (event.persisted && running) finishIntro(true);
    };
    syncMotion();
    // A scheduled start lets Strict Mode clean up its rehearsal before it can start the intro.
    const frame = window.requestAnimationFrame(startIntro);
    reduced.addEventListener('change', syncMotion);
    skipButton.addEventListener('click', skipIntro);
    window.addEventListener('pageshow', restorePage);

    return () => {
      window.cancelAnimationFrame(frame);
      reduced.removeEventListener('change', syncMotion);
      skipButton.removeEventListener('click', skipIntro);
      window.removeEventListener('pageshow', restorePage);
      if (running) delete root.dataset.intro;
      try {
        releaseIntro();
      } finally {
        try {
          parallax?.revert();
        } finally {
          smoothScroll?.destroy();
        }
      }
    };
  }, []);

  return (
    <div className="intro-screen" ref={screen}>
      <div className="intro-backdrop" aria-hidden="true">
        <span className="intro-point" />
        <div className="intro-name">
          {letters.map(({ text }, i) => (
            <span key={i} className="intro-letter chrome-text">{text}</span>
          ))}
        </div>
      </div>
      <button className="intro-skip eyebrow" type="button" ref={skip}>Skip intro</button>
      <noscript><style>{'.intro-screen { display: none !important; }'}</style></noscript>
    </div>
  );
}
