# Siddhi Bhogade — Portfolio

Phase 1: a static, cinematic portfolio foundation for an AI & DevOps Engineer.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Lucide React. GSAP (including its ScrollTrigger plugin) and Lenis are installed for later phases and intentionally not initialized. Display typography uses Syne, body text Inter, and editorial italics Instrument Serif through `next/font/google`; fonts are self-hosted by Next.js after the initial build fetch.

## Development

```sh
npm install
npm run dev
```

Open the Local URL printed by Next.js (normally http://localhost:3000).

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

The lockfile pins the installed dependency versions. Next.js requires a supported Node.js version (20.9 or later). An internet connection is needed for dependency installation and the initial Google font fetch during builds.

## Architecture

- `src/app/layout.tsx`: fonts, metadata and global styles.
- `src/app/page.tsx`: the six semantic page sections.
- `src/app/globals.css`: responsive layout, color/type tokens, chrome text, glass styling, focus and reduced-motion support.
- `src/components/`: Navbar, Hero, About, Services, Projects, Play, Contact.
- `src/components/ui/SectionLabel.tsx`: shared technical section label.
- `src/data/portfolio.ts`: editable client copy, experience, technologies, projects and contact configuration.
- `public/images/projects/README.md`: intended screenshot filenames and replacement instructions.

Navigation anchors map directly to `home`, `about`, `services`, `projects`, `play`, and `contact`. Mobile navigation uses an accessible disclosure button. Only Navbar and Contact need client-side React state.

## Design system

Near-black `#050505`, near-white type, neutral grays, orange `#ff6a3d` for editorial emphasis and actions, red `#e5322d` for micro accents. `.chrome-text` provides restrained metallic typography; `.glass` provides the shared translucent surface. `.eyebrow`, `.editorial`, `.section-title`, and `.body-copy` provide reusable typography. Layouts use fluid sizes and responsive grids without hiding horizontal overflow.

## Phase boundaries

Advanced motion, Lenis smooth scrolling, GSAP/ScrollTrigger sequences, a particle portrait, a preloader, a custom cursor and the Breakout game belong to later phases. None is implemented in Phase 1. Native CSS smooth anchor scrolling respects reduced motion. Services use CSS hover treatments only.

Future integration hooks: `.nav-progress > span`, `[data-future-canvas="portrait"]`, `[data-marquee-row]` / `.stack-track`, and `[data-future-canvas="breakout"]`. The current game visual is explicitly labeled a static preview, not an interactive game. Project media are original CSS concept compositions, not project screenshots.

## Required client data before deployment

- Supply approved GitHub and LinkedIn URLs and replace disabled social buttons with links. No URLs are invented.
- Supply a portrait for the later particle phase.
- Supply approved project screenshots at the paths documented in `public/images/projects/README.md`; swap the CSS media for actual images with appropriate alt text. Those paths are metadata only and cause no missing image requests today.
- Research accuracy values are supplied results: 97.06% validation, reported 100% test accuracy; no benchmark or production claims are made.

This phase is intended for local review and has not been deployed.

## Phase 1 verification

- ESLint, TypeScript and production build passed.
- Development server served `/` successfully (HTTP 200).
- Chrome responsive review: no document horizontal overflow at 320, 390, 768, 1440 and 1920 CSS pixels, measured after fonts loaded.
- Confirmed all six section IDs; mobile menu opens, anchor selection closes it and navigates to Contact.
- Browser console showed no application runtime errors. Temporary layout instrumentation was removed after review.
- Project screenshot paths are not requested until real assets are integrated.
