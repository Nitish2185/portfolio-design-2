import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { qs, qsa } from "../webgl/utils";

gsap.registerPlugin(SplitText);

// Split into lines and wrap each line so it can slide up from behind a mask
function splitIntoMaskedLines(element) {
  const split = new SplitText(element, { type: "lines" });
  const lines = split.lines.map((line) => {
    line.style.overflow = "hidden";
    const inner = document.createElement("div");
    inner.innerHTML = line.textContent;
    line.innerHTML = "";
    line.appendChild(inner);
    return inner;
  });
  return { split, lines };
}

class TextReveal {
  constructor(element) {
    this.element = element;
    this.lines = [];
    this.splits = [];
    this.observerOptions = { root: qs("#scroll-container") };
    if (element.dataset.animationThreshold) {
      this.observerOptions.rootMargin = element.dataset.animationThreshold;
    }
    this.setup();
  }

  setup() {}
  onVisible() {}
  onResize() {}

  observe() {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) this.onVisible();
    }, this.observerOptions);
    this.observer.observe(this.element);
  }

  destroy() {
    this.observer?.disconnect();
    this.splits.forEach((s) => s.revert());
  }
}

// The big name: lines rise with an expo ease after a short delay, once
class TitleReveal extends TextReveal {
  setup() {
    const { split, lines } = splitIntoMaskedLines(this.element);
    this.splits.push(split);
    this.lines = lines;
    gsap.set(this.lines, { yPercent: 100 });
  }

  onVisible() {
    gsap.to(this.lines, {
      yPercent: 0,
      stagger: 0.12,
      ease: "expo.out",
      duration: 0.7,
      delay: 0.3,
      onComplete: () => this.observer.unobserve(this.element),
    });
  }
}

// Body copy: each <p> inside is split and revealed line by line
class ParagraphReveal extends TextReveal {
  played = false;

  setup() {
    qsa("p", this.element).forEach((p) => {
      const { split, lines } = splitIntoMaskedLines(p);
      this.splits.push(split);
      this.lines.push(...lines);
    });
    gsap.set(this.lines, { yPercent: 100 });
  }

  onResize() {
    this.splits.forEach((s) => s.revert());
    this.splits = [];
    this.lines = [];
    if (!this.played) this.setup();
  }

  onVisible() {
    this.played = true;
    gsap.to(this.lines, { yPercent: 0, stagger: 0.05, duration: 0.6 });
  }
}

export function createTextReveals() {
  return qsa("[data-animation]").map((element) =>
    element.dataset.animation === "title" ? new TitleReveal(element) : new ParagraphReveal(element),
  );
}
