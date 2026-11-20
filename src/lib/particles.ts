export const PORTRAIT_SETTINGS = {
  sampleWidth: 320,
  cropTop: 0.078,
  cropBottom: 0.91,
  backgroundStart: 184,
  backgroundEnd: 215,
  contrastDistance: 3,
  sampleStep: 2,
  minSampleWeight: 0.075,
  mask: {
    // Center x/y and radii as fractions of the cropped image.
    head: [0.5, 0.36, 0.46, 0.41],
    torso: [0.5, 0.86, 0.56, 0.43],
    face: [0.485, 0.325, 0.205, 0.23],
  },
  density: { desktop: 6500, tablet: 4200, mobile: 3600 },
} as const;

type ParticlePoints = {
  x: Float32Array;
  y: Float32Array;
  shade: Float32Array;
  emphasis: Float32Array;
};

type PortraitSamples = ParticlePoints & { aspect: number; mobile: ParticlePoints };

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(min: number, max: number, value: number) {
  const t = clamp((value - min) / (max - min));
  return t * t * (3 - 2 * t);
}

function oval(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return 1 - smoothstep(0.72, 1.07, nx * nx + ny * ny);
}

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export async function samplePortrait(src: string, signal: AbortSignal): Promise<PortraitSamples> {
  const image = new Image();
  image.src = src;
  await image.decode();
  signal.throwIfAborted();

  const { sampleWidth: width, cropTop, cropBottom, sampleStep: step, contrastDistance: d } = PORTRAIT_SETTINGS;
  const cropY = image.naturalHeight * cropTop;
  const cropHeight = image.naturalHeight * (cropBottom - cropTop);
  const height = Math.round(width * cropHeight / image.naturalWidth);
  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;

  const context = source.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Portrait sampling requires a 2D canvas');
  context.drawImage(image, 0, cropY, image.naturalWidth, cropHeight, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  const lum = new Float32Array(width * height);
  for (let i = 0; i < lum.length; i++) {
    const pixel = i * 4;
    lum[i] = 0.2126 * data[pixel] + 0.7152 * data[pixel + 1] + 0.0722 * data[pixel + 2];
  }

  const random = seededRandom(2026);
  const candidates: { x: number; y: number; shade: number; emphasis: number; rank: number; mobileRank: number; mobileShade: number }[] = [];
  for (let py = d; py < height - d - step; py += step) {
    for (let px = d; px < width - d - step; px += step) {
      const x = px + Math.floor(random() * step);
      const y = py + Math.floor(random() * step);
      const u = x / width;
      const v = y / height;
      const i = y * width + x;
      const light = lum[i];
      const contrast = clamp((
        Math.abs(lum[i - d] - lum[i + d]) +
        Math.abs(lum[i - d * width] - lum[i + d * width])
      ) / 92);
      const head = oval(u, v, ...PORTRAIT_SETTINGS.mask.head);
      const torso = oval(u, v, ...PORTRAIT_SETTINGS.mask.torso);
      const face = oval(u, v, ...PORTRAIT_SETTINGS.mask.face);
      const mask = Math.max(head, torso * 0.78);
      const backdrop = 1 - smoothstep(PORTRAIT_SETTINGS.backgroundStart, PORTRAIT_SETTINGS.backgroundEnd, light);
      const fade = 1 - smoothstep(0.71, 0.99, v);
      const faceLight = smoothstep(55, 160, light);
      const faceShadow = face * (1 - smoothstep(42, 112, light));
      const weight = mask * fade * (0.36 + contrast * 0.42 + face * (0.32 + faceLight * 0.21)) *
        Math.max(backdrop, face * 0.76);
      if (weight < PORTRAIT_SETTINGS.minSampleWeight) continue;

      const sampleX = (x + random() * 0.9) / width;
      const sampleY = (y + random() * 0.9) / height;
      const shade = clamp((0.14 + (light / 255) ** 0.8 * 0.67 + contrast * 0.24 * (1 - faceShadow * 0.78) +
        face * faceLight * 0.29 - faceShadow * 0.16) * fade);
      const rank = -Math.log(1 - random()) / weight;
      const facialMidtone = smoothstep(45, 105, light) * (1 - smoothstep(165, 190, light));
      // Reweight accepted pixels only, keeping the same light-wall and corner rejection.
      const mobileWeight = (0.68 + head * 0.52 + face * (1.3 + facialMidtone * 0.65 + contrast * 0.6)) *
        (1 - smoothstep(0.59, 0.93, v) * 0.65);
      candidates.push({
        x: sampleX,
        y: sampleY,
        shade,
        emphasis: Math.max(face, head * 0.58 + contrast * 0.17),
        rank,
        mobileRank: rank / mobileWeight,
        mobileShade: shade + face * facialMidtone * Math.min(0.065, (1 - shade) * 0.2),
      });
    }
  }

  function pack(points: typeof candidates, mobile: boolean): ParticlePoints {
    return {
      x: Float32Array.from(points, point => point.x),
      y: Float32Array.from(points, point => point.y),
      shade: Float32Array.from(points, point => mobile ? point.mobileShade : point.shade),
      emphasis: Float32Array.from(points, point => point.emphasis),
    };
  }

  const selected = candidates.sort((a, b) => a.rank - b.rank).slice(0, PORTRAIT_SETTINGS.density.desktop);
  if (selected.length < 300) throw new Error('Not enough portrait detail to render');
  const mobile = candidates.sort((a, b) => a.mobileRank - b.mobileRank).slice(0, PORTRAIT_SETTINGS.density.mobile);
  return { aspect: width / height, ...pack(selected, false), mobile: pack(mobile, true) };
}

type PortraitFrame = { left: number; top: number; width: number; height: number };
type ScreenSize = keyof typeof PORTRAIT_SETTINGS.density;
type PortraitSize = {
  width: number;
  height: number;
  dpr: number;
  frame: PortraitFrame;
  screen: ScreenSize;
};

export function createPortraitRenderer(
  canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, source: PortraitSamples,
) {
  const capacity = source.x.length;
  const random = seededRandom(617);
  const arrays = () => new Float32Array(capacity);
  const homeX = arrays();
  const homeY = arrays();
  const x = arrays();
  const y = arrays();
  const vx = arrays();
  const vy = arrays();
  const originX = arrays();
  const originY = arrays();
  const scatterX = arrays();
  const scatterY = arrays();
  const phase = arrays();
  const baseDelay = new Float64Array(capacity);
  const baseRadius = new Float64Array(capacity);
  const delay = arrays();
  const radius = arrays();
  let points: ParticlePoints = source;
  let width = 0, height = 0, count = 0;
  let screen: ScreenSize = 'desktop';
  let dpr = 1;
  let clock = 0, formationTime = 0, scatter = 0, displayedScatter = 0;
  let mode: 'waiting' | 'forming' | 'settled' = 'waiting';
  let pointerX = -1000, pointerY = -1000;

  for (let i = 0; i < capacity; i++) {
    const angle = random() * Math.PI * 2;
    const reach = 0.29 + random() * 0.42;
    originX[i] = Math.cos(angle) * reach;
    originY[i] = Math.sin(angle) * reach;
    scatterX[i] = Math.cos(angle) * (0.29 + random() * 0.89);
    scatterY[i] = i % 31 === 0 ? 0.55 + random() * 0.3 : Math.sin(angle) * 0.56 - 0.32;
    phase[i] = random() * Math.PI * 2;
    baseDelay[i] = random() * 0.36;
    baseRadius[i] = 0.38 + random() * 0.62;
  }

  function resetPositions() {
    const originReach = screen === 'mobile' ? 0.72 : 1;
    for (let i = 0; i < count; i++) {
      x[i] = mode === 'settled' ? homeX[i] : homeX[i] + originX[i] * width * originReach;
      y[i] = mode === 'settled' ? homeY[i] : homeY[i] + originY[i] * height * originReach;
      vx[i] = 0;
      vy[i] = 0;
    }
  }

  function resize(size: PortraitSize) {
    const { frame } = size;
    width = size.width;
    height = size.height;
    screen = size.screen;
    dpr = size.dpr;
    const bufferWidth = Math.max(1, Math.round(width * dpr));
    const bufferHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth;
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = screen === 'mobile';
    points = mobile ? source.mobile : source;
    count = Math.min(points.x.length, PORTRAIT_SETTINGS.density[screen]);
    canvas.dataset.particles = String(count);
    const fitWidth = Math.min(frame.width, frame.height * source.aspect) * (mobile ? 1.16 : 1);
    const fitHeight = fitWidth / source.aspect;
    const left = frame.left + (frame.width - fitWidth) / 2;
    const top = frame.top + (mobile ? Math.max(0, frame.height - fitHeight) : frame.height - fitHeight) * 0.26;

    for (let i = 0; i < count; i++) {
      homeX[i] = left + points.x[i] * fitWidth;
      homeY[i] = top + points.y[i] * fitHeight;
      delay[i] = (1 - points.emphasis[i]) * 0.46 + baseDelay[i];
      radius[i] = baseRadius[i] * (0.84 + points.shade[i] * 0.32);
    }
    resetPositions();
  }

  function draw(delta: number, reduced: boolean) {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    if (mode === 'waiting') return;

    const dt = clamp(delta, 0, 0.05);
    const step = dt * 60;
    clock += dt;
    formationTime += dt;
    if (mode === 'forming' && formationTime > (screen === 'mobile' ? 1.7 : 2.15)) mode = 'settled';
    const forming = mode === 'forming';
    const mobile = screen === 'mobile';
    const timelineScale = mobile ? 0.72 : 1;
    const scrollProgress = reduced ? 0 : displayedScatter;
    const distance = smoothstep(0.025, 1, scrollProgress);
    const leave = 1 - smoothstep(0.19, 0.91, scrollProgress);
    const residue = 1 - smoothstep(0.68, 1, scrollProgress);
    const shimmer = (clock % 5.25 - 3.55) * 1.45 - 0.25;
    const motion = reduced ? 0 : 1;
    const stiffness = forming ? 0.046 : 0.052;
    const damping = (forming ? 0.85 : 0.82) ** step;
    const reachX = Math.min(width * 0.24, 310);
    const reachY = height * 0.35;
    let accentInk = false;
    context.fillStyle = '#dce5f0';

    // Substeps preserve the spring response on slower frames and short resize pauses.
    const substeps = Math.max(1, Math.ceil(step));
    const springStep = step / substeps;
    const springDamping = damping ** (1 / substeps);

    for (let i = 0; i < count; i++) {
      const age = formationTime - delay[i] * timelineScale;
      if (forming && age <= 0) continue;
      const nearBoundary = i % 31 === 0;
      const fade = nearBoundary ? Math.max(leave, 0.22 * residue) : leave;
      if (fade < 0.008) continue;
      const targetX = homeX[i] + scatterX[i] * reachX * distance;
      const targetY = homeY[i] + scatterY[i] * reachY * distance;

      if (!reduced) {
        const drift = clock * (forming ? 3.2 : 1.23) + phase[i];
        const curl = forming ? 8 * Math.max(0, 1 - age * 0.74) : 0.52;
        let tx = targetX + Math.sin(drift) * curl;
        let ty = targetY + Math.cos(drift * 0.83) * curl;
        const dx = x[i] - pointerX;
        const dy = y[i] - pointerY;
        const squared = dx * dx + dy * dy;
        if (!forming && distance < 0.2 && squared > 0.01 && squared < 96 * 96) {
          const pointerDistance = Math.sqrt(squared);
          const push = (1 - pointerDistance / 96) ** 1.6 * 23;
          tx += dx * push / pointerDistance;
          ty += dy * push / pointerDistance;
        }

        if (!forming && distance > 0.012) {
          // The scrub owns the layout during the exit, so travel is reversible at any scroll speed.
          x[i] = tx;
          y[i] = ty;
          vx[i] = 0;
          vy[i] = 0;
        } else {
          for (let substep = 0; substep < substeps; substep++) {
            vx[i] = (vx[i] + (tx - x[i]) * stiffness * springStep) * springDamping;
            vy[i] = (vy[i] + (ty - y[i]) * stiffness * springStep) * springDamping;
            x[i] += vx[i] * springStep;
            y[i] += vy[i] * springStep;
          }
        }
      }

      const px = reduced ? targetX : x[i];
      const py = reduced ? targetY : y[i];
      if (px < -2 || px > width + 2 || py < -2 || py > height + 2) continue;
      const entrance = forming ? smoothstep(0, 0.5, age) : 1;
      const diagonal = points.x[i] * 0.62 + points.y[i] * 0.58;
      const wave = Math.max(0, 1 - Math.abs(diagonal - shimmer) * 11);
      const breathe = motion * (Math.sin(clock * 1.37 + phase[i]) * 0.025 + wave * (mobile ? 0.07 : 0.13));
      context.globalAlpha = clamp((points.shade[i] * 1.14 + breathe) * fade * entrance);
      const accent = i % 167 === 0 && points.shade[i] > 0.26;
      if (accent !== accentInk) {
        context.fillStyle = accent ? '#ff794c' : '#dce5f0';
        accentInk = accent;
      }
      const r = radius[i] * (mobile ? 0.80 : 1.03);
      context.fillRect(px - r, py - r, r * 2, r * 2);
    }
    context.globalAlpha = 1;

    // An explicit reform eases toward zero. Regular scroll updates set the scrub directly.
    displayedScatter += (scatter - displayedScatter) * Math.min(1, step * 0.13);
  }

  return {
    resize,
    draw,
    form() { mode = 'forming'; formationTime = 0; resetPositions(); },
    settle() { mode = 'settled'; resetPositions(); },
    setScatter(progress: number) { scatter = progress; displayedScatter = progress; },
    reform() { scatter = 0; },
    setPointer(px: number, py: number) { pointerX = px; pointerY = py; },
  };
}
