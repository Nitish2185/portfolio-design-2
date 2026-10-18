import gsap from "gsap";
import {
  DoubleSide,
  HalfFloatType,
  Mesh,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { lensParts } from "../data/profile";
import {
  cameraFragmentShader,
  cameraVertexShader,
  outlineFragmentShader,
  outlineVertexShader,
} from "./shaders";
import { colors, observeVisibility, pickByWidth, qs, qsa, scaleFromElement } from "./utils";

const LENS_PARTS = new Set(Object.keys(lensParts));
const TOP_COVER_PARTS = new Set([
  "pentaprism",
  "focus_screen",
  "focus_screen_box",
  "eyepiece_ring",
  "rubber_eyepiece_ring",
]);

// Where each lens element ends up along X once the lens is exploded
const LENS_EXPLODED_X = {
  lense: 7.5,
  front_ring: 7,
  name_ring: 6.3,
  rubber_ring: 5.5,
  focusing_ring: 4,
  preset_aperture_ring: 3,
  mount_ring: 2,
};

const pixelSize = () => {
  const ratio = Math.ceil(Math.min(2, window.devicePixelRatio));
  return { width: window.innerWidth * ratio, height: window.innerHeight * ratio };
};

/**
 * The Canon F-1 drawn as a sobel line drawing. While scrolling the hero, its
 * top cover parts follow the DOM labels upward; further down the lens
 * explodes into its elements, which can be hovered to show a skill group in
 * the part viewer. At the end of the section the camera flies into the lens.
 */
export default class CanonF1 {
  constructor({ scene, sizes, renderer, camera, composer, loader }) {
    this.scene = scene;
    this.sizes = sizes;
    this.renderer = renderer;
    this.camera = camera;
    this.composer = composer;
    this.loader = loader;

    this.section = qs("#section-camera");
    this.viewerElement = qs("#part-viewer");
    this.viewerContainer = qs("#part-viewer-container");
    this.partName = qs("#part-viewer-name");
    this.partDescription = qs("#part-viewer-description");
    this.scalerElement = qs("#camera-scaler");
    this.ctaText = qs("[data-camera-cta-text]");

    this.modelScale = 1;
    this.modelChildren = [];
    this.meshNames = {}; // mesh uuid -> part name
    this.topCover = {};
    this.lens = {};
    this.lensStartPositions = {};
    this.topCoverScrollData = [];

    this.hoverableParts = false;
    this.userAlreadyHovered = false;
    this.selectedMeshName = "";
    this.targetedMesh = null;
    this.targetRotationZ = 0;

    this.setupPostprocessing();
    this.createRenderTargets();
    this.loadModel();
  }

  loadModel() {
    this.loader.loadGltf("/models/canon-f1.glb", "canon-f1", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          this.registerPart(child);

          const partName = child.parent?.name !== "Scene" ? child.parent?.name : child.name;
          child.material = new ShaderMaterial({
            vertexShader: cameraVertexShader,
            fragmentShader: cameraFragmentShader,
            uniforms: { uColor: new Uniform(child.material.color) },
            side: DoubleSide,
          });
          this.modelChildren.push(child);
          this.meshNames[child.uuid] = partName;
        } else if (child.isGroup && child.name !== "Scene") {
          this.registerPart(child);
        }
      });

      this.model = gltf.scene;
      this.model.renderOrder = 0;
      this.model.rotation.x = 0.455;
      this.model.position.z = -1.167;
      this.scaleModel();
      this.setupTopCoverRemoval();
      observeVisibility(this.section, (visible) => (this.visible = visible));
      this.scene.add(this.model);
    });
  }

  registerPart(object) {
    if (TOP_COVER_PARTS.has(object.name)) this.topCover[object.name] = object;
    if (LENS_PARTS.has(object.name)) {
      this.lens[object.name] = object;
      this.lensStartPositions[object.name] = object.position.clone();
    }
  }

  scaleModel() {
    if (!this.model) return;
    this.modelScale = scaleFromElement(this.scalerElement);
    this.model.scale.setScalar(this.modelScale);
  }

  setupModelForPreloaderAnimation() {
    this.model.position.set(0, -this.sizes.height * 0.5, 0);
    this.model.rotation.y = Math.PI * 1.3;
  }

  animateInModel(timeline, duration = 0.8, delay = 0) {
    timeline.fromTo(
      this.model.position,
      { y: () => -this.sizes.height * 0.5 },
      { y: 0, duration, delay, ease: "power2.out" },
      "<0.2",
    );
    timeline.fromTo(
      this.model.rotation,
      { y: Math.PI * 1.3 },
      { y: 5.125, duration, delay, ease: "power2.out" },
      "<",
    );
  }

  setupPostprocessing() {
    this.outlinePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        tDiffuse1: { value: null },
        tDiffuse2: { value: null },
        resolution: { value: new Vector2() },
        uYprogress: { value: 0 },
        uBackgroundColor: { value: colors.dark1 },
        uSelectionColor: { value: colors.orange1 },
      },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
    });
    const ratio = Math.min(window.devicePixelRatio, 2);
    this.outlinePass.uniforms.resolution.value.set(
      window.innerWidth * ratio,
      window.innerHeight * ratio,
    );
    this.composer.addPass(this.outlinePass);
  }

  createRenderTargets() {
    const { width, height } = pixelSize();
    const options = {
      format: RGBAFormat,
      type: HalfFloatType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    };
    this.renderTargetA = new WebGLRenderTarget(width, height, options);
    this.renderTargetB = new WebGLRenderTarget(width, height, options);
  }

  onResize(sizes) {
    this.sizes = sizes;
    const { width, height } = pixelSize();
    this.outlinePass.uniforms.resolution.value.set(width, height);
    this.renderTargetA.setSize(width, height);
    this.renderTargetB.setSize(width, height);
    this.setTargetPartPosition();
    this.scaleModel();
  }

  // Called from the raycaster on every mouse move
  onSelectMesh(uuid, auto) {
    if (this.hoverableParts && uuid && LENS_PARTS.has(this.meshNames[uuid]) && !auto) {
      this.userAlreadyHovered = true;
    }
    // Keep the auto-selected part until the user actually hovers the lens
    if (!auto && !this.userAlreadyHovered) return;

    if (!this.hoverableParts || !uuid) {
      this.clearViewer();
      return;
    }

    const name = this.meshNames[uuid];
    if (!LENS_PARTS.has(name)) {
      this.clearViewer();
      return;
    }

    this.selectedMeshName = name;
    const part = lensParts[name];
    this.partName.innerText = `${name === "lense" ? "lens" : name.replaceAll("_", " ")} — ${part.title}`;
    this.partDescription.innerText = part.description;

    if (this.targetedMesh?.name !== name) {
      if (this.targetedMesh) this.scene.remove(this.targetedMesh);
      this.targetedMesh = this.lens[name].clone(true);
      this.targetedMesh.children?.forEach((c) => (c.visible = true));
      this.targetedMesh.visible = true;
      this.setTargetPartPosition();
      this.scene.add(this.targetedMesh);
    }
  }

  // Place the cloned part in the middle of the #part-viewer box
  setTargetPartPosition() {
    if (!this.targetedMesh) return;
    const { left, top, width, height } = this.viewerElement.getBoundingClientRect();
    const w = (width * this.sizes.width) / window.innerWidth;
    const h = (height * this.sizes.height) / window.innerHeight;
    const x = (left * this.sizes.width) / window.innerWidth - this.sizes.width / 2 + w / 2;
    const y = (-top * this.sizes.height) / window.innerHeight - h / 2 + this.sizes.height / 2;

    if (this.targetedMesh.children.length > 0) {
      this.targetedMesh.traverse((child) => {
        if (child instanceof Mesh) {
          child.position.set(0, 0, 0);
          child.rotation.set(0, 0, 0);
          child.updateMatrixWorld(true);
        }
      });
    }
    this.targetedMesh.position.set(x, y, 0);
    this.targetedMesh.rotation.set(Math.PI / 2, 0, this.targetRotationZ);
    this.targetedMesh.scale.setScalar(1.1 * this.modelScale);
    this.targetedMesh.updateMatrixWorld(true);
  }

  clearViewer() {
    this.selectedMeshName = "";
    if (this.targetedMesh) {
      this.scene.remove(this.targetedMesh);
      this.targetedMesh = null;
      this.partName.innerText = "";
      this.partDescription.innerText = "";
    }
  }

  autoSelectMesh() {
    const uuid = Object.keys(this.meshNames).find((id) => this.meshNames[id] === "rubber_ring");
    this.onSelectMesh(uuid, true);
  }

  showPartViewer() {
    this.hoverableParts = true;
    this.autoSelectMesh();
    this.viewerContainer.classList.add("visible");
    this.ctaText.classList.add("visible");
  }

  hidePartViewer() {
    this.hoverableParts = false;
    this.userAlreadyHovered = false;
    this.selectedMeshName = "";
    this.viewerContainer.classList.remove("visible");
    this.clearViewer();
    this.ctaText.classList.remove("visible");
  }

  // Top cover parts rise with their DOM labels, never dropping below their resting height
  onScroll() {
    this.topCoverScrollData.forEach((data) => {
      const { top, height } = data.element.getBoundingClientRect();
      const y = (-top * this.sizes.height) / (window.innerHeight * this.modelScale);
      const h = (height * this.sizes.height) / (window.innerHeight * this.modelScale);
      const target = y - h / 2 + this.sizes.height / this.modelScale / 2 - data.offsetY;

      data.element.classList.toggle("visible", target >= data.initialY);
      data.mesh.position.y = Math.max(target, data.initialY);
    });
  }

  setupTopCoverRemoval() {
    const section = qs("[data-top-cover-parts-section]");
    qsa("[data-top-cover-part]", section).forEach((element) => {
      const name = element.getAttribute("data-top-cover-part");
      const mesh = this.topCover[name];
      this.topCoverScrollData.push({ mesh, element, initialY: mesh.position.y, offsetY: 0 });

      // The eyepiece rings travel with the pentaprism
      if (name === "pentaprism") {
        for (const ring of ["eyepiece_ring", "rubber_eyepiece_ring"]) {
          const ringMesh = this.topCover[ring];
          this.topCoverScrollData.push({
            mesh: ringMesh,
            element,
            initialY: ringMesh.position.y,
            offsetY: mesh.position.y - ringMesh.position.y,
          });
        }
      }
    });
  }

  setupScrollTriggers() {
    const mask = qs("#camera-section-mask");
    gsap.set(mask, { opacity: 0, autoAlpha: 1 });

    // End of section: hand over from outlines to the full render behind a fade
    const handover = gsap.timeline({
      scrollTrigger: { trigger: this.section, start: "bottom bottom", end: "99% top", scrub: true },
    });
    handover.to(this.outlinePass.uniforms.uYprogress, { value: 1 });
    handover.to(mask, { opacity: 1 }, "<");
    handover.call(() => gsap.set(mask, { opacity: 0 }));

    // Turn the camera side-on and explode the lens
    const explode = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: "top top",
        end: () => window.innerHeight * 3 + " center",
        scrub: true,
        onLeave: () => this.showPartViewer(),
        onEnterBack: () => this.hidePartViewer(),
      },
    });
    const targetX = pickByWidth(0.6, 0.7, 1);
    const targetZ = pickByWidth(-4, -3.5, -3);
    const spread = pickByWidth(0.55, 0.75, 1);

    explode.to(this.model.rotation, { y: 3.931 + Math.PI * 2, duration: 1 }, 0);
    explode.to(this.model.position, { z: targetZ, y: 1, x: targetX, duration: 1 }, 0);
    for (const name in this.lens) {
      const start = this.lensStartPositions[name];
      const x = start.x + (LENS_EXPLODED_X[name] - start.x) * spread;
      explode.to(this.lens[name].position, { x, delay: 0.5, duration: 0.5 }, 0);
    }

    // Reassemble and dive into the lens
    const dive = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: () => window.innerHeight * 4 + " center",
        end: "bottom top",
        scrub: true,
        onEnter: () => this.hidePartViewer(),
        onLeaveBack: () => this.showPartViewer(),
      },
    });
    for (const name in this.lens) {
      dive.to(this.lens[name].position, { x: this.lensStartPositions[name].x, duration: 0.2 }, 0);
    }
    dive.to(this.model.rotation, { y: Math.PI * 2 + Math.PI / 4 + 3.931, x: Math.PI * 0.5 }, 0);
    dive.to(this.model.position, { y: 0, z: 7, x: 0 }, 0);
  }

  /**
   * Two offscreen passes feed the outline shader: A holds everything except
   * the hovered part, B only the hovered part (+ its clone in the viewer).
   */
  render() {
    if (!this.visible) return;
    const isSelected = (mesh) => this.meshNames[mesh.uuid] === this.selectedMeshName;
    const setViewerVisible = (visible) =>
      this.targetedMesh?.children.forEach((c) => (c.visible = visible));

    this.modelChildren.forEach((m) => (m.visible = !isSelected(m)));
    setViewerVisible(false);
    this.renderer.setRenderTarget(this.renderTargetA);
    this.renderer.render(this.scene, this.camera);

    this.modelChildren.forEach((m) => (m.visible = isSelected(m)));
    setViewerVisible(true);
    this.renderer.setRenderTarget(this.renderTargetB);
    this.renderer.render(this.scene, this.camera);

    this.modelChildren.forEach((m) => (m.visible = false));
    if (this.targetedMesh) {
      this.targetRotationZ += 0.025;
      this.targetedMesh.rotation.z = this.targetRotationZ;
    }

    this.outlinePass.uniforms.tDiffuse1.value = this.renderTargetA.texture;
    this.outlinePass.uniforms.tDiffuse2.value = this.renderTargetB.texture;
    this.renderer.setRenderTarget(null);
  }
}
