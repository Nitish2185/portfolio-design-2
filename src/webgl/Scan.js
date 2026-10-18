import gsap from "gsap";
import { Mesh, PlaneGeometry, SRGBColorSpace, ShaderMaterial } from "three";
import { scanFragmentShader, scanVertexShader } from "./shaders";
import { colors, observeVisibility, qs } from "./utils";

/**
 * A photo plane glued to #scan-element. As the section scrolls it grows to
 * full size while the data mask retracts, then the shader wipes through the
 * four development stages named by the sticky labels.
 */
export default class Scan {
  constructor({ scene, sizes, loader }) {
    this.scene = scene;
    this.sizes = sizes;
    this.section = qs("#section-scan");
    this.element = qs("#scan-element");
    this.elementMask = qs("#scan-data-mask");

    this.material = new ShaderMaterial({
      vertexShader: scanVertexShader,
      fragmentShader: scanFragmentShader,
      uniforms: {
        uTexture: {
          value: loader.loadTexture("/textures/scan-image.jpg", "scan-image-texture", (texture) => {
            texture.colorSpace = SRGBColorSpace;
          }),
        },
        uProgress: { value: 0 },
        uFilmColor: { value: colors.orange1 },
      },
    });
    this.mesh = new Mesh(new PlaneGeometry(1, 1), this.material);
    this.scene.add(this.mesh);

    observeVisibility(this.section, (visible) => (this.isVisible = visible));
    this.syncWithElement();
    this.setupScroll();
    this.trackElement();
  }

  // Match the plane's size and position (in world units) to the DOM placeholder
  syncWithElement() {
    const { left, top, width, height } = this.element.getBoundingClientRect();
    this.meshDimensions = {
      width: (width * this.sizes.width) / window.innerWidth,
      height: (height * this.sizes.height) / window.innerHeight,
    };
    this.mesh.scale.x = this.meshDimensions.width;
    this.mesh.scale.y = this.meshDimensions.height;
    this.mesh.position.x =
      (left * this.sizes.width) / window.innerWidth -
      this.sizes.width / 2 +
      this.meshDimensions.width / 2;
    this.setYFromTop(top);
  }

  setYFromTop(top) {
    this.mesh.position.y =
      (-top * this.sizes.height) / window.innerHeight -
      this.meshDimensions.height / 2 +
      this.sizes.height / 2;
  }

  // The element is scaled by GSAP every frame, so keep re-measuring while visible
  trackElement() {
    if (this.isVisible) this.syncWithElement();
    requestAnimationFrame(() => this.trackElement());
  }

  setupScroll() {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: this.section, start: "top top", end: "bottom bottom", scrub: true },
    });
    tl.fromTo(this.element, { scale: 4 / 6 }, { scale: 1, duration: 0.2, ease: "linear" });
    tl.to(this.elementMask, { scaleY: 0, duration: 0.2, ease: "linear" }, "<");
    tl.to(this.material.uniforms.uProgress, { value: 1, duration: 0.8, ease: "linear" });
  }

  setSizes(sizes) {
    this.sizes = sizes;
  }

  onResize(sizes) {
    this.sizes = sizes;
    this.onScroll();
  }

  onScroll() {
    if (!this.isVisible) return;
    this.setYFromTop(this.element.getBoundingClientRect().top);
  }
}
