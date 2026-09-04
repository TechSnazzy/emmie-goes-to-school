// render3d.js — isometric low-poly renderer.
// World coordinates from the game logic map straight through: (x, y) -> (x, 0, y).
import * as THREE from '../vendor/three.module.js';

export { THREE };

export const canvas = document.getElementById('view3d');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

export const scene = new THREE.Scene();
scene.background = new THREE.Color('#bfe6f2');
scene.fog = new THREE.Fog('#bfe6f2', 900, 1800);

// --- true isometric: orthographic camera at 45 deg yaw / 35.26 deg pitch ----
const ISO = new THREE.Vector3(1, Math.SQRT2, 1).normalize();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
let viewSpan = 420;                       // world units across the short axis
const camTarget = new THREE.Vector3(0, 0, 0);

export function setViewSpan(v) { viewSpan = v; resize(); }
export function lookAtWorld(x, y, lerp = 1) {
  camTarget.x += (x - camTarget.x) * lerp;
  camTarget.z += (y - camTarget.z) * lerp;
  syncCamera();
}
export function snapTo(x, y) { camTarget.set(x, 0, y); syncCamera(); }
function syncCamera() {
  camera.position.copy(camTarget).addScaledVector(ISO, 1200);
  camera.lookAt(camTarget);
  sun.position.copy(camTarget).add(sunOffset);
  sun.target.position.copy(camTarget);
  sun.target.updateMatrixWorld();
}

// --- lights ---------------------------------------------------------------
const hemi = new THREE.HemisphereLight('#dff1ff', '#6b7a5a', 1.15);
scene.add(hemi);
export const sun = new THREE.DirectionalLight('#fff6e0', 1.75);
const sunOffset = new THREE.Vector3(-260, 460, 200);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 1400;
sun.shadow.bias = -0.0012;
sun.shadow.normalBias = 1.2;
scene.add(sun);
scene.add(sun.target);
export function setShadowSpan(s) {
  const c = sun.shadow.camera;
  c.left = -s; c.right = s; c.top = s; c.bottom = -s;
  c.updateProjectionMatrix();
}
setShadowSpan(340);

export function setSky(colour, groundTint) {
  scene.background = new THREE.Color(colour);
  scene.fog.color = new THREE.Color(colour);
  if (groundTint) hemi.groundColor = new THREE.Color(groundTint);
}
// daylight (1) down to a dim room before the light goes on
export function setLightLevel(level = 1, skyTint) {
  hemi.intensity = 0.45 + 0.70 * level;
  sun.intensity = 0.35 + 1.40 * level;
  if (skyTint) hemi.color = new THREE.Color(skyTint);
}

// --- sizing ---------------------------------------------------------------
function resize() {
  const host = canvas.parentElement;
  const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
  renderer.setSize(w, h, false);
  const aspect = w / h;
  const halfH = viewSpan / 2, halfW = halfH * aspect;
  camera.left = -halfW; camera.right = halfW;
  camera.top = halfH; camera.bottom = -halfH;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
export { resize };

// --- pointer picking: screen -> the ground plane --------------------------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();
let pendingClick = null;
let pointerDown = false;
let pointerWorld = null;

function toWorld(ev) {
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
  return { x: hitPoint.x, y: hitPoint.z };
}
canvas.style.touchAction = 'none';
canvas.addEventListener('pointerdown', (e) => {
  pointerDown = true;
  canvas.setPointerCapture?.(e.pointerId);
  const w = toWorld(e);
  if (w) { pendingClick = w; pointerWorld = w; }
});
canvas.addEventListener('pointermove', (e) => {
  if (!pointerDown) return;
  const w = toWorld(e);
  if (w) pointerWorld = w;
});
const releasePointer = () => { pointerDown = false; };
window.addEventListener('pointerup', releasePointer);
window.addEventListener('pointercancel', releasePointer);

/** Returns {x,y} once per click, then clears it. */
export function consumeClick() { const c = pendingClick; pendingClick = null; return c; }
/** Live pointer state, for drag-steering. */
export function pointerState() { return { down: pointerDown, world: pointerWorld }; }

// --- the swappable scene root --------------------------------------------
let root = new THREE.Group();
scene.add(root);
export function newRoot() {
  scene.remove(root);
  disposeTree(root);
  root = new THREE.Group();
  scene.add(root);
  return root;
}
export function currentRoot() { return root; }
function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
  });
}

/** World ground point -> page pixel coords (used by the automated tests). */
const projV = new THREE.Vector3();
export function projectToScreen(x, y) {
  projV.set(x, 0, y).project(camera);
  const r = canvas.getBoundingClientRect();
  return { x: r.left + (projV.x * 0.5 + 0.5) * r.width, y: r.top + (-projV.y * 0.5 + 0.5) * r.height };
}

export function render() { renderer.render(scene, camera); }
resize();
