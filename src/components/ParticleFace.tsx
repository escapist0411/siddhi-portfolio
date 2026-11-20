'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import {
  gsap, MOBILE, PORTRAIT_FORMATION, PORTRAIT_SETTLE, REDUCED_MOTION,
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
    let resizeFrame: number | undefined;
    let ticking = false;
    let elapsed = 0;
    const loading = new AbortController();
    let phase = 'waiting';
    if (reduced.matches || document.documentElement.dataset.intro === 'complete') return;
    let startedAt = 0;

    const clearPointer = () => renderer?.setPointer(-1000, -1000);
    const point = (event: PointerEvent) => {
      if (renderer && !reduced.matches && !phone.matches && finePointer.matches && event.pointerType === 'mouse') {
        const box = surface.getBoundingClientRect();
        renderer.setPointer(event.clientX - box.left, event.clientY - box.top);
      }
    };

    function stopDrawing() {
      if (ticking) gsap.ticker.remove(tick);
      ticking = false;
      elapsed = 0;
    }

    function tick(_: number, delta: number) {
      elapsed += delta;
      if (phone.matches && elapsed < 25) return;
      try {
        renderer?.draw(elapsed / 1000, false);
      } catch {
        finish();
      }
      elapsed = 0;
    }

    function syncDrawing() {
      const shouldDraw = !!renderer && phase === 'forming' && !document.hidden && !reduced.matches;
      if (shouldDraw && !ticking) {
        ticking = true;
        gsap.ticker.add(tick);
      } else if (!shouldDraw) {
        stopDrawing();
      }
    }

    function form() {
      if (phase === 'complete') return;
      phase = 'forming';
      startedAt = performance.now();
      if (!reduced.matches) renderer?.form();
      syncDrawing();
    }

    function finish() {
      phase = 'complete';
      loading.abort();
      stopDrawing();
      renderer = undefined;
      readSize = undefined;
      surface.width = 0;
      surface.height = 0;
      delete surface.dataset.particles;
    }

    function resize() {
      window.cancelAnimationFrame(resizeFrame ?? 0);
      resizeFrame = window.requestAnimationFrame(() => {
        try {
          readSize?.();
        } catch {
          finish();
        }
      });
    }

    const layout = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : undefined;

    layout?.observe(container);
    layout?.observe(bounds);
    window.addEventListener('resize', resize);
    window.addEventListener(PORTRAIT_FORMATION, form);
    window.addEventListener(PORTRAIT_SETTLE, finish);
    document.addEventListener('visibilitychange', syncDrawing);
    hero.addEventListener('pointermove', point, { passive: true });
    hero.addEventListener('pointerleave', clearPointer);

    async function load() {
      try {
        const context = surface.getContext('2d', { alpha: true });
        if (!context) {
          finish();
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
        };
        readSize();

        if (phase === 'forming') {
          if (performance.now() - startedAt < 500) loaded.form();
          else loaded.settle();
        }

        syncDrawing();
      } catch {
        if (!loading.signal.aborted) finish();
      }
    }
    void load();

    return () => {
      loading.abort();
      stopDrawing();
      window.cancelAnimationFrame(resizeFrame ?? 0);
      layout?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener(PORTRAIT_FORMATION, form);
      window.removeEventListener(PORTRAIT_SETTLE, finish);
      document.removeEventListener('visibilitychange', syncDrawing);
      hero.removeEventListener('pointermove', point);
      hero.removeEventListener('pointerleave', clearPointer);
    };
  }, [src]);

  return (
    <div className="portrait-layer" ref={layer}>
      <canvas className="portrait-canvas" ref={canvas} aria-hidden="true" />
      <div className="portrait-frame" ref={frame}>
        <div className="portrait-photo-motion">
          <Image
            className="portrait-photo"
            src={src}
            alt="Portrait of Siddhi Bhogade"
            fill
            unoptimized
            preload
          />
        </div>
      </div>
    </div>
  );
}
