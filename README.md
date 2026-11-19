# Siddhi Bhogade — Portfolio

Single-page portfolio for Siddhi Bhogade, an AI & DevOps Engineer. It presents her experience, technical skills, and selected work across machine learning, full-stack development, and deployment.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, GSAP, ScrollTrigger, Lenis, and HTML Canvas.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Run the production checks with:

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

Use a supported Node.js release (20.9 or later). Installing dependencies and fetching the Next.js fonts during builds require network access.

## Features

- A skippable cinematic intro and a responsive Canvas portrait that scatters and reforms with scroll.
- Lenis anchor navigation, active section highlights, and a page progress line.
- Scroll reveals, four alternating technology marquees with a pause control, and a project showcase with desktop parallax.
- Contact entrance, email and clipboard actions, and Back to Top. The email link and Back to Top have a small magnetic effect for desktop mouse users.
- Reduced-motion support with a static portrait, static technology rows, and immediately visible content.

Client content lives in `src/data/portfolio.ts`. The portrait uses `public/siddhi.jpg`, and the opening and section motion are managed by `Preloader.tsx` and `SectionMotion.tsx`.

## Optional assets

Add approved project screenshots using the [screenshot paths](public/images/projects/README.md). Personal GitHub and LinkedIn links can be enabled after their URLs are supplied. Social previews use text metadata. A share image and production URL can be configured once those assets are available.
