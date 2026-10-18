import * as CANNON from "cannon-es";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from "three";
import { colors, observeVisibility, pickByWidth, qs } from "./utils";

const FILM_BOX = { width: 1.85, height: 2.88, depth: 1.95 };
const FILM_ROLL = {
  radius: 0.62,
  mainCylinderHeight: 2.3,
  radialSegments: 32,
  stemHeight: 2.05,
  stemWidth: 0.15,
  stemDepth: 0.5,
  stemAngle: Math.PI / 6.5,
  stemYoffset: -0.125,
};

/**
 * Keeps a Three mesh in sync with a cannon body. Physics runs with the ground
 * at y=0; the mesh is shifted by the ground's current (scrolling) height.
 */
class PhysicsObject {
  constructor({ mesh, body, world, scene, addToScene = true, yOffset, sleeping = false }) {
    this.mesh = mesh;
    this.body = body;
    this.sleeping = sleeping;

    body.position.copy(mesh.position);
    body.quaternion.copy(mesh.quaternion);
    mesh.position.y += yOffset;

    // Boxes that drop in later wait, hidden, above the screen
    if (sleeping) {
      body.sleep();
      mesh.visible = false;
    }
    if (addToScene) scene.add(mesh);
    world.addBody(body);
  }

  update(groundY) {
    this.mesh.position.set(this.body.position.x, this.body.position.y + groundY, this.body.position.z);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

function createFilmBox({ world, scene, model, material, position, rotation, yOffset, sleeping }) {
  const sf = pickByWidth(0.6, 0.78, 1);
  const mesh = model.clone();
  mesh.position.copy(position);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);

  const body = new CANNON.Body({
    mass: 60,
    shape: new CANNON.Box(
      new CANNON.Vec3((FILM_BOX.width * sf) / 2, (FILM_BOX.height * sf) / 2, (FILM_BOX.depth * sf) / 2),
    ),
    material,
  });
  return new PhysicsObject({ mesh, body, world, scene, yOffset, sleeping });
}

// A canister (cylinder) locked to its protruding spool stem (box)
function createFilmRoll({ world, scene, model, material, position, rotation, yOffset }) {
  const sf = pickByWidth(0.6, 0.78, 1);
  const o = Object.fromEntries(
    Object.entries(FILM_ROLL).map(([k, v]) => [k, k === "stemAngle" || k === "radialSegments" ? v : v * sf]),
  );

  const mesh = model.clone();
  mesh.position.copy(position);
  const q = new Quaternion();
  if (rotation.x) q.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), rotation.x));
  if (rotation.y) q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), rotation.y));
  if (rotation.z) q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), rotation.z));
  mesh.quaternion.copy(q);

  const stemOffset = new Vector3(
    -Math.cos(o.stemAngle) * o.radius,
    o.stemYoffset,
    -Math.sin(o.stemAngle) * o.radius,
  );
  const stemMesh = new Mesh(
    new BoxGeometry(o.stemWidth, o.stemHeight, o.stemDepth),
    new MeshStandardMaterial({ color: colors.dark3 }),
  );
  stemMesh.position.copy(mesh.position).add(stemOffset.clone().applyQuaternion(q));
  stemMesh.quaternion.copy(q);

  const canisterBody = new CANNON.Body({
    mass: 10,
    shape: new CANNON.Cylinder(o.radius, o.radius, o.mainCylinderHeight, o.radialSegments),
    material,
  });
  const stemBody = new CANNON.Body({
    mass: 70,
    shape: new CANNON.Box(new CANNON.Vec3(o.stemWidth * 0.5, o.stemHeight * 0.5, o.stemDepth * 0.5)),
    material,
  });
  // Lock in the un-rotated layout; both bodies then receive the same rotation
  stemBody.position.set(stemOffset.x, stemOffset.y, stemOffset.z);
  world.addConstraint(new CANNON.LockConstraint(canisterBody, stemBody, { maxForce: 1e3 }));

  return [
    new PhysicsObject({ mesh, body: canisterBody, world, scene, yOffset }),
    new PhysicsObject({ mesh: stemMesh, body: stemBody, world, scene, addToScene: false, yOffset }),
  ];
}

/**
 * Kodak film boxes and rolls piled on a ground plane that scrolls with the
 * footer. Three more boxes drop in from above once the footer comes into view.
 */
export default class PhysicsFooter {
  constructor({ scene, sizes, loader }) {
    this.scene = scene;
    this.sizes = sizes;
    this.section = qs("#footer");
    this.objects = [];
    this.physicsActive = false;
    this.fallingActive = false;

    scene.add(new AmbientLight(0xffffff, 2));
    const light = new DirectionalLight(0xffffff, 2);
    light.position.set(0, 2, 2);
    scene.add(light);

    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

    this.groundMaterial = new CANNON.Material("wood");
    this.plasticMaterial = new CANNON.Material("plastic");
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.groundMaterial, this.plasticMaterial, {
        friction: 0.8,
        restitution: 0.1,
        contactEquationRelaxation: 1.5,
        frictionEquationRelaxation: 1,
      }),
    );

    this.ground = new Mesh(new PlaneGeometry(20, 10), new MeshBasicMaterial({ color: colors.dark1 }));
    this.ground.rotation.x = -Math.PI / 2;
    scene.add(this.ground);
    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: this.groundMaterial });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
    this.updateGroundPosition();

    observeVisibility(this.section, (visible) => {
      if (visible) this.physicsActive = true;
    });
    this.loadModels(loader);
  }

  loadModels(loader) {
    const scale = 50 * pickByWidth(0.6, 0.78, 1);
    const prepare = (gltf) => {
      const model = gltf.scene.children[0];
      model.position.set(0, 0, 0);
      model.scale.setScalar(scale);
      return model;
    };
    loader.loadGltf("/models/film-box.glb", "film-box", (gltf) => this.createBoxes(prepare(gltf)));
    loader.loadGltf("/models/film-roll.glb", "film-roll", (gltf) => this.createRolls(prepare(gltf)));
  }

  createBoxes(model) {
    const xf = pickByWidth(0.2, 0.42, 1);
    const sf = pickByWidth(0.6, 0.78, 1);
    const h = this.sizes.height;
    const layout = [
      // dropped in from above when the footer appears
      { position: [-1 * xf, h + FILM_BOX.height * sf, -3], rotation: [Math.PI / 2.1, -Math.PI / 1.5, 0], sleeping: true },
      { position: [3.5 * xf, h * 1.25 + FILM_BOX.height * sf, -3], rotation: [Math.PI / 2, Math.PI / 3, 1.5], sleeping: true },
      { position: [-4.3 * xf, h * 1.5 + FILM_BOX.height * sf, -4], rotation: [Math.PI / 2.4, Math.PI / 3, 0], sleeping: true },
      // resting on the ground from the start
      { position: [2 * xf, FILM_BOX.width * sf * 0.5, -2], rotation: [0, -Math.PI / 3, Math.PI / 2] },
      { position: [4 * xf, FILM_BOX.height * sf * 0.5, -4], rotation: [0, Math.PI / 3, 0] },
      { position: [5.5 * xf, FILM_BOX.width * sf * 0.5, -2.4], rotation: [0, Math.PI / 4, Math.PI / 2] },
      { position: [-6 * xf, FILM_BOX.width * sf * 0.5, -3], rotation: [Math.PI, -Math.PI / 2.8, Math.PI / 2] },
    ];
    for (const { position, rotation, sleeping } of layout) {
      this.objects.push(
        createFilmBox({
          world: this.world,
          scene: this.scene,
          model,
          material: this.plasticMaterial,
          position: new Vector3(...position),
          rotation: new Vector3(...rotation),
          yOffset: this.ground.position.y,
          sleeping,
        }),
      );
    }
  }

  createRolls(model) {
    const xf = pickByWidth(0.2, 0.42, 1);
    const sf = pickByWidth(0.6, 0.78, 1);
    const layout = [
      { position: [-2.7 * xf, FILM_ROLL.radius * sf, -3], rotation: [Math.PI / 2, 0, Math.PI / 2] },
      { position: [-0.5 * xf, FILM_ROLL.mainCylinderHeight * sf * 0.5, -2], rotation: [0, (5 * Math.PI) / 2, 0] },
    ];
    for (const { position, rotation } of layout) {
      this.objects.push(
        ...createFilmRoll({
          world: this.world,
          scene: this.scene,
          model,
          material: this.plasticMaterial,
          position: new Vector3(...position),
          rotation: new Vector3(...rotation),
          yOffset: this.ground.position.y,
        }),
      );
    }
  }

  // Ground sits at the vertical middle of the footer, in world units
  updateGroundPosition() {
    const { top, height } = this.section.getBoundingClientRect();
    this.ground.position.y = (-(top + height * 0.5) * this.sizes.height) / window.innerHeight;
    return top;
  }

  onScroll() {
    const top = this.updateGroundPosition();
    if (top <= window.innerHeight * 0.85) this.fallingActive = true;
  }

  onResize(sizes) {
    this.sizes = sizes;
  }

  render(delta) {
    for (const object of this.objects) {
      if (this.fallingActive && object.sleeping) {
        object.sleeping = false;
        object.body.wakeUp();
        object.mesh.visible = true;
      }
      object.update(this.ground.position.y);
    }
    if (this.physicsActive) this.world.step(1 / 60, delta, 3);
  }
}
