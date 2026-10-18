import gsap from "gsap";
import { qs, qsa } from "./utils";

/**
 * Slides the skewed project frames in one by one, then their captions,
 * while #section-film-layers is pinned. Leaving the section switches the
 * WebGL camera to the narrow lens used by the physics footer.
 */
export default class WorkCardsScroll {
  constructor({ onLeave, onEnterBack }) {
    this.section = qs("#section-film-layers");
    const images = qsa("[data-layer-image]");
    const texts = qsa("[data-layer-text]");

    const markShown = (shown) => this.section.classList.toggle("layers-all-shown", shown);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onLeave: () => {
          markShown(true);
          onLeave();
        },
        onEnterBack: () => {
          markShown(true);
          onEnterBack();
        },
        onLeaveBack: () => markShown(false),
        // Hover pop-ups are enabled only once every card has landed
        onUpdate: (self) => markShown(self.progress >= 0.82),
      },
    });
    tl.fromTo(images, { opacity: 0, xPercent: -100 }, { opacity: 1, stagger: 1, xPercent: 0, duration: 2 });
    tl.fromTo(texts, { opacity: 0 }, { opacity: 1, stagger: 1, duration: 1 });
  }
}
