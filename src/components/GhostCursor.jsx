import { useEffect, useMemo, useRef, useState } from "react";
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  MathUtils,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Domain-warped fbm "smoke" around the cursor and each point of its trail
const fragmentShader = /* glsl */ `
  uniform float iTime;
  uniform vec3  iResolution;
  uniform vec2  iMouse;
  uniform vec2  iPrevMouse[MAX_TRAIL_LENGTH];
  uniform float iOpacity;
  uniform float iScale;
  uniform vec3  iBaseColor;
  uniform float iBrightness;
  uniform float iEdgeIntensity;
  varying vec2  vUv;

  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f *= f * (3. - 2. * f);
    return mix(mix(hash(i + vec2(0.,0.)), hash(i + vec2(1.,0.)), f.x),
               mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for(int i=0;i<5;i++){
      v += a * noise(p);
      p = m * p * 2.0;
      a *= 0.5;
    }
    return v;
  }
  vec3 tint1(vec3 base){ return mix(base, vec3(1.0), 0.15); }
  vec3 tint2(vec3 base){ return mix(base, vec3(0.8, 0.9, 1.0), 0.25); }

  vec4 blob(vec2 p, vec2 mousePos, float intensity, float activity) {
    vec2 q = vec2(fbm(p * iScale + iTime * 0.1), fbm(p * iScale + vec2(5.2,1.3) + iTime * 0.1));
    vec2 r = vec2(fbm(p * iScale + q * 1.5 + iTime * 0.15), fbm(p * iScale + q * 1.5 + vec2(8.3,2.8) + iTime * 0.15));

    float smoke = fbm(p * iScale + r * 0.8);
    float radius = 0.5 + 0.3 * (1.0 / iScale);
    float distFactor = 1.0 - smoothstep(0.0, radius * activity, length(p - mousePos));
    float alpha = pow(smoke, 2.5) * distFactor;

    vec3 c1 = tint1(iBaseColor);
    vec3 c2 = tint2(iBaseColor);
    vec3 color = mix(c1, c2, sin(iTime * 0.5) * 0.5 + 0.5);

    return vec4(color * alpha * intensity, alpha * intensity);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy / iResolution.xy * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
    vec2 mouse = (iMouse * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);

    vec3 colorAcc = vec3(0.0);
    float alphaAcc = 0.0;

    vec4 b = blob(uv, mouse, 1.0, iOpacity);
    colorAcc += b.rgb;
    alphaAcc += b.a;

    for (int i = 0; i < MAX_TRAIL_LENGTH; i++) {
      vec2 pm = (iPrevMouse[i] * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
      float t = 1.0 - float(i) / float(MAX_TRAIL_LENGTH);
      t = pow(t, 2.0);
      if (t > 0.01) {
        vec4 bt = blob(uv, pm, t * 0.8, iOpacity);
        colorAcc += bt.rgb;
        alphaAcc += bt.a;
      }
    }

    colorAcc *= iBrightness;

    vec2 uv01 = gl_FragCoord.xy / iResolution.xy;
    float edgeDist = min(min(uv01.x, 1.0 - uv01.x), min(uv01.y, 1.0 - uv01.y));
    float distFromEdge = clamp(edgeDist * 2.0, 0.0, 1.0);
    float k = clamp(iEdgeIntensity, 0.0, 1.0);
    float edgeMask = mix(1.0 - k, 1.0, distFromEdge);

    float outAlpha = clamp(alphaAcc * iOpacity * edgeMask, 0.0, 1.0);
    gl_FragColor = vec4(colorAcc, outAlpha);
  }
`;

const passVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Film grain over the bloomed result
const filmGrainShader = (intensity) => ({
  uniforms: { tDiffuse: { value: null }, iTime: { value: 0 }, intensity: { value: intensity } },
  vertexShader: passVertex,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float iTime;
    uniform float intensity;
    varying vec2 vUv;

    float hash1(float n){ return fract(sin(n)*43758.5453); }

    void main(){
      vec4 color = texture2D(tDiffuse, vUv);
      float n = hash1(vUv.x*1000.0 + vUv.y*2000.0 + iTime) * 2.0 - 1.0;
      color.rgb += n * intensity * color.rgb;
      gl_FragColor = color;
    }
  `,
});

// Un-premultiply so the canvas blends correctly with mix-blend-mode
const unpremultiplyShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: passVertex,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float a = max(c.a, 1e-5);
      vec3 straight = c.rgb / a;
      gl_FragColor = vec4(clamp(straight, 0.0, 1.0), c.a);
    }
  `,
};

/**
 * Glowing smoke that follows the pointer across its parent element, with a
 * fading trail, bloom and grain. Desktop + fine pointer only. After the
 * pointer stops (or leaves) the smoke drifts on inertia and fades out.
 */
export default function GhostCursor({
  className = "",
  style = {},
  trailLength = 50,
  inertia = 0.5,
  grainIntensity = 0.05,
  bloomStrength = 0.1,
  bloomRadius = 1,
  bloomThreshold = 0.025,
  brightness = 1,
  color = "#FC6B2F",
  mixBlendMode = "screen",
  edgeIntensity = 0,
  maxDevicePixelRatio = 0.5,
  targetPixels,
  fadeDelayMs,
  fadeDurationMs,
  zIndex = 10,
}) {
  const containerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () =>
      setEnabled(window.innerWidth >= 1024 && window.matchMedia("(pointer: fine)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isTouch = useMemo(() => "ontouchstart" in window || navigator.maxTouchPoints > 0, []);
  const pixelBudget = targetPixels ?? (isTouch ? 9e5 : 13e5);
  const fadeDelay = fadeDelayMs ?? (isTouch ? 500 : 1000);
  const fadeDuration = fadeDurationMs ?? (isTouch ? 1000 : 1500);

  useEffect(() => {
    const container = containerRef.current;
    const host = container?.parentElement;
    if (!container || !host || !enabled) return;

    let alive = true;
    const prevPosition = host.style.position;
    if (!prevPosition || prevPosition === "static") host.style.position = "relative";

    const renderer = new WebGLRenderer({
      antialias: !isTouch,
      alpha: true,
      depth: false,
      stencil: false,
      powerPreference: isTouch ? "low-power" : "high-performance",
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.mixBlendMode = mixBlendMode;
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const maxTrail = Math.max(1, Math.floor(trailLength));
    const trail = Array.from({ length: maxTrail }, () => new Vector2(0.5, 0.5));
    let head = 0;

    const base = new Color(color);
    const material = new ShaderMaterial({
      defines: { MAX_TRAIL_LENGTH: maxTrail },
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vector3(1, 1, 1) },
        iMouse: { value: new Vector2(0.5, 0.5) },
        iPrevMouse: { value: trail.map((v) => v.clone()) },
        iOpacity: { value: 1 },
        iScale: { value: 1 },
        iBaseColor: { value: new Vector3(base.r, base.g, base.b) },
        iBrightness: { value: brightness },
        iEdgeIntensity: { value: edgeIntensity },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    scene.add(new Mesh(geometry, material));

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new Vector2(1, 1), bloomStrength, bloomRadius, bloomThreshold);
    composer.addPass(bloom);
    const grain = new ShaderPass(filmGrainShader(grainIntensity));
    composer.addPass(grain);
    composer.addPass(new ShaderPass(unpremultiplyShader));

    let ready = false;
    const resize = () => {
      if (!alive) return;
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w <= 0 || h <= 0) {
        ready = false;
        return;
      }
      // Keep the pixel count within budget: the smoke is soft, so low resolution is fine
      const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
      const pixels = w * h * dpr * dpr;
      const ratio = dpr * (pixels <= pixelBudget ? 1 : Math.max(0.5, Math.min(1, Math.sqrt(pixelBudget / Math.max(1, pixels)))));
      renderer.setPixelRatio(ratio);
      renderer.setSize(w, h, false);
      composer.setPixelRatio?.(ratio);
      composer.setSize(w, h);
      const rw = Math.max(1, Math.floor(w * ratio));
      const rh = Math.max(1, Math.floor(h * ratio));
      material.uniforms.iResolution.value.set(rw, rh, 1);
      material.uniforms.iScale.value = Math.max(0.5, Math.min(2, Math.min(Math.max(1, w), Math.max(1, h)) / 600));
      bloom.setSize(rw, rh);
      ready = true;
    };
    resize();
    const resizeObserver = new ResizeObserver(() => alive && resize());
    resizeObserver.observe(host);
    resizeObserver.observe(container);

    const target = new Vector2(0.5, 0.5);
    const velocity = new Vector2(0, 0);
    let opacity = 1;
    let lastMove = performance.now();
    let pointerActive = false;
    let running = false;
    let frame = null;
    const start = performance.now();

    const tick = () => {
      if (!alive) return;
      if (!ready) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      const time = (now - start) / 1000;
      const mouse = material.uniforms.iMouse.value;

      if (pointerActive) {
        velocity.set(target.x - mouse.x, target.y - mouse.y);
        mouse.copy(target);
        opacity = 1;
      } else {
        velocity.multiplyScalar(inertia);
        if (velocity.lengthSq() > 1e-6) mouse.add(velocity);
        const idle = now - lastMove;
        if (idle > fadeDelay) opacity = Math.max(0, 1 - Math.min(1, (idle - fadeDelay) / fadeDuration));
      }

      head = (head + 1) % maxTrail;
      trail[head].copy(mouse);
      const prev = material.uniforms.iPrevMouse.value;
      for (let i = 0; i < maxTrail; i++) prev[i].copy(trail[(head - i + maxTrail) % maxTrail]);

      material.uniforms.iOpacity.value = opacity;
      material.uniforms.iTime.value = time;
      grain.uniforms.iTime.value = time;
      composer.render();

      // Sleep once fully faded; the next pointer event wakes the loop
      if (!pointerActive && opacity <= 0.001) {
        running = false;
        frame = null;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    const setPointer = (x, y) => {
      const rect = host.getBoundingClientRect();
      target.set(
        MathUtils.clamp((x - rect.left) / Math.max(1, rect.width), 0, 1),
        MathUtils.clamp(1 - (y - rect.top) / Math.max(1, rect.height), 0, 1),
      );
      pointerActive = true;
      lastMove = performance.now();
      wake();
    };
    const onPointer = (e) => setPointer(e.clientX, e.clientY);
    const onTouch = (e) => e.touches?.length && setPointer(e.touches[0].clientX, e.touches[0].clientY);
    const onRelease = () => {
      pointerActive = false;
      lastMove = performance.now();
      wake();
    };

    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerenter", onPointer, { passive: true });
    host.addEventListener("pointerleave", onRelease, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchend", onRelease, { passive: true });
    window.addEventListener("touchcancel", onRelease, { passive: true });
    wake();

    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerenter", onPointer);
      host.removeEventListener("pointerleave", onRelease);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchend", onRelease);
      window.removeEventListener("touchcancel", onRelease);
      resizeObserver.disconnect();
      scene.clear();
      geometry.dispose();
      material.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      if (!prevPosition || prevPosition === "static") host.style.position = prevPosition;
    };
  }, [
    enabled,
    trailLength,
    inertia,
    grainIntensity,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    pixelBudget,
    fadeDelay,
    fadeDuration,
    isTouch,
    color,
    brightness,
    mixBlendMode,
    edgeIntensity,
    maxDevicePixelRatio,
  ]);

  if (!enabled) return null;
  return <div ref={containerRef} className={`ghost-cursor ${className}`} style={{ zIndex, ...style }} />;
}
