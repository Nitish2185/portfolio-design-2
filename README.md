# Nitish Narayan Singh — Portfolio

Personal portfolio built with **React + Vite**, **Tailwind CSS v4**, **GSAP / ScrollTrigger**, **Lenis**, **framer-motion** and **Three.js**.
The design and motion follow [jishnumondal.vercel.app](https://jishnumondal.vercel.app/).

## What moves

| Section | Animation |
| --- | --- |
| Loader | Counter runs 0 → 100 while the bar fills, then the name and counter lift away and the screen slides up |
| Menu | "Dive In" toggle rolls its label, the plus spins into ×, colour layers and the panel slide in, items rise with numbering |
| Hero | WebGL ghost-cursor smoke trail (bloom + grain), variable-font **TextPressure** name, glow and dust parallax, timed intro, fade on scroll |
| Buttons | Magnetic pull toward the cursor with a springy release |
| Philosophy | Scroll-to-expand media: rounded, blurred window opens to full bleed, statement fades up |
| Projects | Per-character title reveal; glass cards rise, copy slides in from the side, screenshots scale up |
| Experience | Hover states (static, as on the reference) |
| Contact | Glass cards rise in with a staggered ease; form with loading / success / error states |
| Global | Lenis smooth scroll, top scroll-progress bar, film-grain noise overlay |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Editing content

All copy and links are in [`src/data/profile.js`](src/data/profile.js). The philosophy statement is still lorem ipsum.
Images live in `public/images` (philosophy backdrop, currently a placeholder) and `public/projects` (project covers).

## Contact form

By default the form opens the visitor's email app with the message prefilled.
To receive messages directly, deploy an endpoint that accepts `POST` JSON `{ name, email, message }`
and returns `{ "success": true }`, then set it at build time:

```bash
VITE_CONTACT_ENDPOINT=https://your-endpoint.example.com/contact npm run build
```
