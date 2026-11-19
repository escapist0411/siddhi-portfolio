'use client';

import { useEffect, useRef } from 'react';
import {
  gsap, MOBILE, PORTRAIT_FORMATION, PORTRAIT_REFORM, PORTRAIT_SETTLE, REDUCED_MOTION, ScrollTrigger,
} from '@/lib/animations';
import { createPortraitRenderer, samplePortrait } from '@/lib/particles';

export default function ParticleFace({ src }: { src: string }) {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasElement = canvas.current;
    const layerElement = layer.current;
    const frameElement = frame.current;
    const hero = layerElement?.closest('section');
    if (!canvasElement || !layerElement || !frameElement || !hero) return;
    const surface = canvasElement;
    const container = layerElement;
    const bounds = frameElement;

    const reduced = window.matchMedia(REDUCED_MOTION);
    const phone = window.matchMedia(MOBILE);
    const tablet = window.matchMedia('(max-width: 1024px)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let renderer: ReturnType<typeof createPortraitRenderer> | undefined;
    let readSize: (() => void) | undefined;
    let scroller: gsap.core.Tween | undefined;
    let resizeFrame: number | undefined;
    let visible = true;
    let ticking = false;
    let elapsed = 0;
    const loading = new AbortController();
    let phase = document.documentElement.dataset.intro === 'complete' ? 'settled' : 'waiting';
    let startedAt = 0;

    const clearPointer = () => renderer?.setPointer(-1000, -1000);
    const point = (event: PointerEvent) => {
      if (!reduced.matches && !phone.matches && finePointer.matches && event.pointerType === 'mouse') {
        const box = surface.getBoundingClientRect();
        renderer?.setPointer(event.clientX - box.left, event.clientY - box.top);
      }
    };

    function stopDrawing() {
      if (ticking) gsap.ticker.remove(tick);
      ticking = false;
      elapsed = 0;
    }

    function fallback() {
      stopDrawing();
      scroller?.scrollTrigger?.kill();
      scroller?.kill();
      scroller = undefined;
      renderer = undefined;
      delete surface.dataset.particles;
      container.dataset.portrait = 'fallback';
    }

    function tick(_: number, delta: number) {
      elapsed += delta;
      if (phone.matches && elapsed < 25) return;
      try {
        renderer?.draw(elapsed / 1000, false);
      } catch {
        fallback();
      }
      elapsed = 0;
    }

    function syncDrawing() {
      const shouldDraw = !!renderer && phase !== 'waiting' && visible && !document.hidden && !reduced.matches;
      if (shouldDraw && !ticking) {
        ticking = true;
        gsap.ticker.add(tick);
      } else if (!shouldDraw) {
        stopDrawing();
      }
    }

    function syncMotion() {
      if (!renderer) return;
      try {
        if (reduced.matches) {
          scroller?.scrollTrigger?.kill();
          scroller?.kill();
          scroller = undefined;
          renderer.setScatter(0);
          renderer.settle();
          renderer.draw(0, true);
          clearPointer();
        } else if (!scroller) {
          const scrub = { progress: 0 };
          gsap.registerPlugin(ScrollTrigger);
          scroller = gsap.to(scrub, {
            progress: 1,
            ease: 'none',
            onUpdate: () => renderer?.setScatter(scrub.progress),
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
          });
        }
        syncDrawing();
      } catch {
        fallback();
      }
    }

    function form() {
      phase = 'forming';
      startedAt = performance.now();
      if (!reduced.matches) renderer?.form();
      syncDrawing();
    }

    function settle() {
      phase = 'settled';
      renderer?.settle();
      syncDrawing();
    }

    function resize() {
      window.cancelAnimationFrame(resizeFrame ?? 0);
      resizeFrame = window.requestAnimationFrame(() => {
        try {
          readSize?.();
        } catch {
          fallback();
        }
      });
    }

    const intersection = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) clearPointer();
      syncDrawing();
    }) : undefined;
    const layout = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : undefined;

    intersection?.observe(hero);
    layout?.observe(container);
    layout?.observe(bounds);
    window.addEventListener('resize', resize);
    window.addEventListener(PORTRAIT_FORMATION, form);
    window.addEventListener(PORTRAIT_SETTLE, settle);
    const reform = () => renderer?.reform();
    window.addEventListener(PORTRAIT_REFORM, reform);
    document.addEventListener('visibilitychange', syncDrawing);
    hero.addEventListener('pointermove', point, { passive: true });
    hero.addEventListener('pointerleave', clearPointer);
    reduced.addEventListener('change', syncMotion);

    async function load() {
      try {
        const context = surface.getContext('2d', { alpha: true });
        if (!context) {
          fallback();
          return;
        }
        const samples = await samplePortrait(src, loading.signal);
        if (loading.signal.aborted) return;
        const loaded = createPortraitRenderer(surface, context, samples);
        renderer = loaded;
        readSize = () => {
          if (!renderer) return;
          const viewport = surface.getBoundingClientRect();
          const fit = bounds.getBoundingClientRect();
          const screen = phone.matches ? 'mobile' : tablet.matches ? 'tablet' : 'desktop';
          renderer.resize({
            width: viewport.width,
            height: viewport.height,
            dpr: Math.min(window.devicePixelRatio || 1, screen === 'mobile' ? 1.35 : 1.75),
            frame: {
              left: fit.left - viewport.left, top: fit.top - viewport.top,
              width: fit.width, height: fit.height,
            },
            screen,
          });
          if (reduced.matches) renderer.draw(0, true);
        };
        readSize();

        const introComplete = document.documentElement.dataset.intro === 'complete';
        if (reduced.matches || introComplete || phase === 'settled') settle();
        else if (phase === 'forming' && performance.now() - startedAt < 500) loaded.form();
        else if (phase === 'forming') settle();

        container.dataset.portrait = 'ready';
        syncMotion();
      } catch {
        if (!loading.signal.aborted) fallback();
      }
    }
    void load();

    return () => {
      loading.abort();
      stopDrawing();
      scroller?.scrollTrigger?.kill();
      scroller?.kill();
      window.cancelAnimationFrame(resizeFrame ?? 0);
      layout?.disconnect();
      intersection?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener(PORTRAIT_FORMATION, form);
      window.removeEventListener(PORTRAIT_SETTLE, settle);
      window.removeEventListener(PORTRAIT_REFORM, reform);
      document.removeEventListener('visibilitychange', syncDrawing);
      hero.removeEventListener('pointermove', point);
      hero.removeEventListener('pointerleave', clearPointer);
      reduced.removeEventListener('change', syncMotion);
    };
  }, [src]);

  return (
    <div className="portrait-layer" ref={layer} data-portrait="pending" aria-hidden="true">
      <div className="portrait-frame" ref={frame} />
      <canvas className="portrait-canvas" ref={canvas} />
    </div>
  );
}
