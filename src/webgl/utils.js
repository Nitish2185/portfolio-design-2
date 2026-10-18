import { Color } from "three";

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

// Theme colours as linear THREE.Colors, read from the CSS custom properties
// so the shaders always match the stylesheet.
export const colors = {};

const cssColorVars = {
  dark1: "--color-dark-1",
  dark2: "--color-dark-2",
  dark3: "--color-dark-3",
  light1: "--color-light-1",
  orange1: "--color-orange-1",
  orange2: "--color-orange-2",
};

export function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  for (const [name, cssVar] of Object.entries(cssColorVars)) {
    const [r, g, b] = styles
      .getPropertyValue(cssVar)
      .trim()
      .split(/\s+/)
      .map((v) => parseInt(v, 10) / 255);
    colors[name] = new Color(r, g, b).convertSRGBToLinear();
  }
}

// Breakpoint-based tuning used across the scenes (phone / tablet / desktop)
export const pickByWidth = (phone, tablet, desktop) => {
  const w = window.innerWidth;
  return w < 480 ? phone : w < 768 ? tablet : desktop;
};

// Scale a model so it matches the width of a DOM "scaler" element
export function scaleFromElement(element) {
  const { width } = element.getBoundingClientRect();
  const base = width > 0 ? (width * 100) / window.innerWidth / 40 : 0.8;
  const w = window.innerWidth;
  const factor = w < 480 ? 0.75 : w < 768 ? 0.82 : w < 1024 ? 0.85 : 0.88;
  return base * factor;
}

// Run a callback whenever an element enters / leaves the viewport
export function observeVisibility(element, callback) {
  const observer = new IntersectionObserver((entries) => callback(entries[0].isIntersecting), {
    threshold: 0,
  });
  observer.observe(element);
  return observer;
}
