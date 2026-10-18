import {
  Clock,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import AssetLoader from "./AssetLoader";
import CanonF1 from "./CanonF1";
import FilmStrip from "./FilmStrip";
import PhysicsFooter from "./PhysicsFooter";
import Scan from "./Scan";
import WorkCardsScroll from "./WorkCardsScroll";

/**
 * Owns the renderer, camera and post-processing and wires every scene to
 * scroll, resize and mouse input. One fixed canvas renders the whole page.
 */
export default class Experience {
  constructor({ canvas, onAssetsLoaded, onRevealStart, onUnblocked }) {
    this.canvas = canvas;
    this.time = 0;
    this.cameraNarrowed = false;
    this.clock = new Clock();
    this.scene = new Scene();
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 10;
    this.scene.add(this.camera);

    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.updateSizes();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.loader = new AssetLoader({
      onAllLoaded: () => {
        onAssetsLoaded?.();
        this.loader.outro(this.canonF1, onUnblocked);
      },
      onRevealStart,
    });

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("resize", this.onResize);

    this.createScenes();
  }

  async createScenes() {
    await this.loader.intro();
    const shared = { scene: this.scene, sizes: this.sizes, loader: this.loader };

    this.canonF1 = new CanonF1({
      ...shared,
      renderer: this.renderer,
      camera: this.camera,
      composer: this.composer,
    });
    this.filmStrip = new FilmStrip(shared);
    this.workCards = new WorkCardsScroll({
      onLeave: () => this.setFooterLens(true),
      onEnterBack: () => this.setFooterLens(false),
    });
    this.scan = new Scan(shared);
    this.physicsFooter = new PhysicsFooter(shared);
  }

  // Visible frustum size at z=0 in world units
  updateSizes() {
    const fov = this.camera.fov * (Math.PI / 180);
    const height = this.camera.position.z * Math.tan(fov / 2) * 2;
    this.sizes = { width: height * this.camera.aspect, height };
  }

  // A long, narrow lens flattens the perspective on the film box pile
  setFooterLens(narrow) {
    if (this.cameraNarrowed === narrow) return;
    this.cameraNarrowed = narrow;
    this.camera.fov = narrow ? 10 : 45;
    this.camera.position.z = narrow ? 40 : 10;
    this.camera.updateProjectionMatrix();
    this.updateSizes();
    this.scan.setSizes(this.sizes);
    this.physicsFooter.onResize(this.sizes);
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.raycaster.intersectObjects(this.scene.children)[0];
    if (hit && "material" in hit.object) this.canonF1?.onSelectMesh(hit.object.uuid);
    else this.canonF1?.onSelectMesh();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.updateSizes();
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.canonF1?.onResize(this.sizes);
    this.scan?.onResize(this.sizes);
    this.filmStrip?.onResize();
    this.physicsFooter?.onResize(this.sizes);
  }

  onScroll() {
    this.canonF1?.onScroll();
    this.scan?.onScroll();
    this.physicsFooter?.onScroll();
  }

  render() {
    const elapsed = this.clock.getElapsedTime();
    const delta = elapsed - this.time;
    this.time = elapsed;

    this.canonF1?.render();
    this.physicsFooter?.render(delta);
    this.composer.render();
  }

  destroy() {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
