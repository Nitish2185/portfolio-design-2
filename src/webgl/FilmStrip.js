import gsap from "gsap";
import {
  CustomBlending,
  DoubleSide,
  MaxEquation,
  Mesh,
  OneMinusSrcAlphaFactor,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  SrcAlphaFactor,
  Uniform,
  Vector2,
} from "three";
import { filmFragmentShader, filmVertexShader } from "./shaders";
import { colors, qs, scaleFromElement } from "./utils";

const FRAME_COUNT = 5; // frames baked into film-texture.png
const REPEAT_FACTOR = 6;

/**
 * A strip of 35mm film coiled into a helix that rises through the
 * experience section, unwinding as it goes.
 */
export default class FilmStrip {
  constructor({ scene, sizes, loader }) {
    this.scene = scene;
    this.sizes = sizes;
    this.loader = loader;
    this.section = qs("#section-film");
    this.scalerElement = qs("#film-scaler");
    this.meshScale = 1;
    this.timelineProgress = 0;

    this.geometry = new PlaneGeometry(FRAME_COUNT * 2 * REPEAT_FACTOR, 2, 100, 10);
    this.createMaterial();
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.renderOrder = 1;
    this.scene.add(this.mesh);

    this.updateScale();
    this.mesh.position.set(0, -0.5 * this.sizes.height - this.getTotalHeight() * 0.6, 0);
    this.setupScroll();
  }

  createMaterial() {
    this.material = new ShaderMaterial({
      vertexShader: filmVertexShader,
      fragmentShader: filmFragmentShader,
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: CustomBlending,
      blendEquation: MaxEquation,
      blendSrc: SrcAlphaFactor,
      blendDst: OneMinusSrcAlphaFactor,
      uniforms: {
        uPlaneWidth: new Uniform(this.geometry.parameters.width),
        uRadius: new Uniform(2),
        uXZfreq: new Uniform(3.525),
        uYfreq: new Uniform(2.155),
        uOffset: new Uniform(0),
        uAlphaMap: new Uniform(
          this.loader.loadTexture("/textures/alpha-map.jpg", "film-alpha-map", (texture) => {
            texture.wrapS = RepeatWrapping;
            const { width, height } = texture.image;
            this.material.uniforms.uAlphaMapResolution.value = new Vector2(width, height);
          }),
        ),
        uImages: new Uniform(
          this.loader.loadTexture("/textures/film-texture.png", "film-image-texture", (texture) => {
            texture.wrapS = RepeatWrapping;
          }),
        ),
        uRepeatFactor: new Uniform(REPEAT_FACTOR),
        uImagesCount: new Uniform(FRAME_COUNT * REPEAT_FACTOR),
        uAlphaMapResolution: new Uniform(new Vector2()),
        uFilmColor: new Uniform(colors.orange1),
      },
    });
  }

  getTotalHeight() {
    return (
      this.geometry.parameters.height * this.meshScale +
      2 * Math.PI * this.material.uniforms.uYfreq.value
    );
  }

  // Off-screen below the viewport (start) or above it (end)
  edgeY(direction) {
    return (
      direction *
      (0.5 * this.sizes.height * this.meshScale +
        this.getTotalHeight() * Math.max(0.6 * this.meshScale, 0.5))
    );
  }

  updateScale() {
    this.meshScale = scaleFromElement(this.scalerElement);
    this.mesh.scale.setScalar(this.meshScale);
  }

  onResize() {
    this.updateScale();
    if (this.timelineProgress <= 0) gsap.set(this.mesh.position, { y: this.edgeY(-1) });
    else if (this.timelineProgress >= 1) gsap.set(this.mesh.position, { y: this.edgeY(1) });
  }

  setupScroll() {
    const mask = qs("#camera-section-mask");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > 0) gsap.set(mask, { opacity: 0 });
        },
      },
    });
    tl.to(this, { timelineProgress: 1, duration: 1 }, 0);
    tl.to(mask, { opacity: 0, duration: 0.1 }, 0);
    tl.fromTo(
      this.mesh.position,
      { y: () => this.edgeY(-1) },
      { y: () => this.edgeY(1), duration: 1 },
      0,
    );
    tl.to(this.material.uniforms.uOffset, { value: 10, duration: 1 }, 0);
  }
}
