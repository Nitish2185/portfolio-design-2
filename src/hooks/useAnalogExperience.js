import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createTextReveals } from "../animations/TextReveal";
import Experience from "../webgl/Experience";
import { qs, readThemeColors } from "../webgl/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Boots the page once the DOM is mounted: smooth scrolling inside
 * #scroll-container, ScrollTrigger synced to it, the WebGL experience and
 * the text reveals (prepared when assets finish, armed as the curtain lifts).
 */
export default function useAnalogExperience() {
  useEffect(() => {
    const wrapper = qs("#scroll-container");
    const content = qs("#scroll-content");
    const cursor = qs("#scroller-cursor");
    const scrollable = qs("[data-scrollable-content]");
    let textReveals = [];
    let frame;

    readThemeColors();
    ScrollTrigger.defaults({ scroller: wrapper });

    const lenis = new Lenis({ wrapper, content });
    lenis.scrollTo(0, { immediate: true });

    const experience = new Experience({
      canvas: qs("#webgl"),
      onAssetsLoaded: () => {
        textReveals = createTextReveals();
      },
      onRevealStart: () => textReveals.forEach((t) => t.observe()),
      onUnblocked: () => {
        lenis.resize();
        ScrollTrigger.refresh();
      },
    });

    lenis.on("scroll", (e) => {
      experience.onScroll();
      const progress = e.scroll / (e.dimensions.scrollHeight - e.dimensions.height);
      if (progress) cursor.style.left = `${progress * 100}%`;
    });

    const onResize = () => textReveals.forEach((t) => t.onResize());
    window.addEventListener("resize", onResize);

    const tick = (time) => {
      lenis.raf(time);
      ScrollTrigger.update();
      experience.render();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      textReveals.forEach((t) => t.destroy());
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      experience.destroy();
      scrollable.classList.add("blocked");
    };
  }, []);
}
