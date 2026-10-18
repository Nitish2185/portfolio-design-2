import gsap from "gsap";
import { TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { qs, qsa } from "./utils";

// Approximate file sizes (KB) so the percentage advances by weight, not count
const ASSET_SIZES = {
  "canon-f1": 709,
  "film-roll": 370,
  "film-box": 317,
  "film-alpha-map": 15,
  "film-image-texture": 134,
  "scan-image-texture": 70,
};
const TOTAL_ASSETS = Object.keys(ASSET_SIZES).length;
const TOTAL_SIZE = Object.values(ASSET_SIZES).reduce((a, b) => a + b, 0);

/**
 * Loads every model / texture the scenes need, drives the preloader
 * percentage, and plays the intro / outro timelines around it.
 */
export default class AssetLoader {
  constructor({ onAllLoaded, onRevealStart }) {
    this.element = qs("#preloader");
    this.counter = qs("[data-preloader-count]");
    this.center = qs("[data-preloader-center]");
    this.scrollContainer = qs("[data-scrollable-content]");
    this.onAllLoaded = onAllLoaded;
    this.onRevealStart = onRevealStart;

    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new TextureLoader();
    this.loadedAssets = 0;
    this.loadedKbs = 0;
  }

  loadGltf(url, id, onLoad) {
    this.gltfLoader.load(url, (gltf) => {
      onLoad(gltf);
      this.onAssetLoaded(id);
    });
  }

  loadTexture(url, id, onLoad) {
    return this.textureLoader.load(url, (texture) => {
      onLoad?.(texture);
      this.onAssetLoaded(id);
    });
  }

  onAssetLoaded(id) {
    this.loadedAssets++;
    this.loadedKbs += ASSET_SIZES[id];
    this.counter.textContent = `${Math.floor((this.loadedKbs / TOTAL_SIZE) * 100)}%`;
    if (this.loadedAssets === TOTAL_ASSETS) this.onAllLoaded();
  }

  // Brackets open up and the counter fades in before loading begins
  intro() {
    return new Promise((resolve) => {
      const tl = gsap.timeline({ delay: 0.5 });
      tl.to(this.center, { height: "6vmax" });
      tl.to(this.counter, { opacity: 1 });
      tl.call(resolve);
    });
  }

  // Scroll ruler ticks in, the camera spins up into frame and the curtain lifts
  outro(canonF1) {
    const pins = qsa("[data-scroller-pin]");
    const cursor = qs("#scroller-cursor");

    canonF1.setupModelForPreloaderAnimation();
    gsap.set([pins, cursor], { opacity: 0, autoAlpha: 1 });

    const tl = gsap.timeline({ delay: 0.7 });
    tl.to([this.center, this.counter], { delay: 0.4, opacity: 0 });
    tl.to(pins, { opacity: 1, stagger: 0.012, duration: 0.045 }, "<0.3");
    canonF1.animateInModel(tl, 0.9);
    tl.to(this.element, { opacity: 0, duration: 0.6, onStart: this.onRevealStart }, "<");
    tl.to(cursor, { opacity: 1, duration: 0.3 });
    tl.call(() => {
      this.element.style.pointerEvents = "none";
      this.scrollContainer.classList.remove("blocked");
      canonF1.setupScrollTriggers();
    });
  }
}
