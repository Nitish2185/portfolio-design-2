# Nitish Narayan Singh — Portfolio

An analog, editorial portfolio built with **React**, **Three.js**, **GSAP** and **cannon-es**.
The page is one long scroll, and a single fixed WebGL canvas tells the story:

1. **Preloader**: corner brackets open, assets load by weight, the scroll ruler ticks in and a Canon F-1 spins up into frame.
2. **Hero**: the name rises line by line. The camera is drawn as a sobel line drawing, and its pentaprism and focus screen lift off in sync with their labels as you scroll.
3. **Toolkit**: the camera turns side-on and the lens explodes into its elements. Hover a ring to outline it in orange and show a skill group in the part viewer.
4. **Dive**: the lens reassembles and the camera flies into it, handing over to the full render.
5. **Experience**: a helical 35mm film strip unwinds past the experience and certification table.
6. **Selected work**: skewed project frames slide in one by one and pop up on hover (tap on mobile).
7. **Process**: a photo is "developed" through four stages (negative → inverted → positive → graded).
8. **Contact**: Kodak film boxes and rolls tumble onto a physics floor behind the footer.

Extras: Lenis smooth scrolling, a live fps / resolution / timer HUD, and a 12-column design grid overlay (press **G**).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Editing content

All copy, links and project cards live in [`src/data/profile.js`](src/data/profile.js).
Fields still containing *lorem ipsum* are placeholders waiting for real content.
Project and frame images are in `public/images/`.

## Project structure

```text
public/
  models/      Canon F-1, film box and film roll (GLB)
  textures/    film strip alpha map + baked frames, scan source image
  images/      project covers and frame placeholders
  fonts/       B612 Mono, Inter
src/
  components/  React markup for each section (HUD, hero, work cards, footer…)
  webgl/       Three.js scenes: CanonF1, FilmStrip, Scan, PhysicsFooter, Experience
  animations/  SplitText line reveals
  hooks/       useAnalogExperience: boots Lenis, ScrollTrigger and the WebGL experience
  data/        profile.js: all site content
```

## Credits

Design, interaction concept and 3D assets adapted from
[analog-editorial-portfolio](https://github.com/Jishnu09-siuu/analog-editorial-portfolio)
(itself based on [lab.chakibmzn.com/35mm](https://lab.chakibmzn.com/35mm/)).
