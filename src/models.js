// models.js — low-poly model library. Everything is built from boxes and a few
// low-segment cylinders/cones so it reads as chunky flat-shaded 3D.
// World coords map (x, y) -> (x, 0, y); +y in game space is +z in 3D.
import { THREE } from './render3d.js';

export const C = {
  ink: '#3a2f45',
  skin: '#ffcf9e', skinD: '#e2a377',
  hairBrown: '#8a4f2b', hairDark: '#33251c', hairSandy: '#b98a4e',
  pink: '#ff69ad', coral: '#f2635a', green: '#43a86f', purple: '#8f68cf',
  teal: '#3fb0c0', yellow: '#ffd34d', orange: '#f0913c',
  jean: '#4d6390', denim: '#3c4f76', navy: '#3b4a86',
  shoe: '#f2eee6', white: '#f6f4f0',
  wood: '#c08347', woodD: '#8a5a2c', woodL: '#d9a86e',
  wall: '#f3e7d3', wallD: '#dcc9a8',
  metal: '#b7bcc4', metalD: '#8b929c',
  grass: '#7cc46b', grassD: '#5fa851',
  leaf: '#57a84e', leafD: '#3f8340',
  path: '#e2caa0', road: '#5a5866', line: '#f2cf5b',
  water: '#5cb6d6',
  brick: '#c96f52', brickD: '#a1543d',
  car: '#f4f5f8', glass: '#3d4a6b',
  cat: '#2e2c3a', catEye: '#a5f25a',
  dog: '#cf9459',
  blacktop: '#7e8590',
  tile: '#eae3d4',
};

const matCache = new Map();
export function MAT(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial({ color, ...o }));
  return matCache.get(key);
}
// A box whose BOTTOM sits at y.
export function box(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MAT(color, o));
  m.position.set(x, y + h / 2, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function cyl(r, h, color, x = 0, y = 0, z = 0, seg = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), MAT(color, { flatShading: true }));
  m.position.set(x, y + h / 2, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function cone(r, h, color, x = 0, y = 0, z = 0, seg = 7) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), MAT(color, { flatShading: true }));
  m.position.set(x, y + h / 2, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function group(...kids) { const g = new THREE.Group(); kids.forEach((k) => k && g.add(k)); return g; }

// ===================================================================
// PEOPLE — Crossy-Road-ish blocks with swinging limbs
// ===================================================================
export function makePerson(pal, { kid = false } = {}) {
  const s = kid ? 1 : 1.3;
  const legH = 15 * s, bodyH = 19 * s, headH = 15 * s;
  const bodyW = 16 * s, bodyD = 10 * s;
  const g = new THREE.Group();
  const hipY = legH;

  const mkLimb = (dx, py, w, h, d, colour, footColour) => {
    const p = new THREE.Group();
    p.position.set(dx, py, 0);
    p.add(box(w, h, d, colour, 0, -h, 0));
    if (footColour) p.add(box(w + 1.4, 3.4 * s, d + 3 * s, footColour, 0, -h, 1.4 * s));
    return p;
  };
  const legL = mkLimb(-4.4 * s, hipY, 6 * s, legH, 6.6 * s, pal.legs, pal.shoe || C.shoe);
  const legR = mkLimb(4.4 * s, hipY, 6 * s, legH, 6.6 * s, pal.legs, pal.shoe || C.shoe);
  const armL = mkLimb(-(bodyW / 2 + 2.2 * s), hipY + bodyH - 2 * s, 4.4 * s, bodyH * 0.78, 5 * s, pal.top);
  const armR = mkLimb(bodyW / 2 + 2.2 * s, hipY + bodyH - 2 * s, 4.4 * s, bodyH * 0.78, 5 * s, pal.top);
  armL.add(box(4.6 * s, 3.4 * s, 5.2 * s, C.skin, 0, -bodyH * 0.78, 0));
  armR.add(box(4.6 * s, 3.4 * s, 5.2 * s, C.skin, 0, -bodyH * 0.78, 0));
  g.add(legL, legR, armL, armR);

  // torso (+ a lighter chest panel so it isn't one flat slab)
  g.add(box(bodyW, bodyH, bodyD, pal.top, 0, hipY, 0));
  g.add(box(bodyW * 0.55, bodyH * 0.5, 1.2, pal.topL || pal.top, 0, hipY + bodyH * 0.28, bodyD / 2));

  // head
  const headY = hipY + bodyH;
  const headW = 14.5 * s, headD = 12.5 * s;
  g.add(box(headW, headH, headD, C.skin, 0, headY, 0));
  // hair: cap + back
  g.add(box(headW + 0.8, headH * 0.42, headD + 0.8, pal.hair, 0, headY + headH * 0.62, 0));
  g.add(box(headW + 0.8, headH * 0.66, 2.2, pal.hair, 0, headY + headH * 0.08, -headD / 2 - 0.6));
  if (pal.longHair) {
    g.add(box(2.4, headH * 0.95, headD * 0.75, pal.hair, -(headW / 2 + 0.6), headY - headH * 0.15, 0));
    g.add(box(2.4, headH * 0.95, headD * 0.75, pal.hair, headW / 2 + 0.6, headY - headH * 0.15, 0));
  }
  if (pal.ponytail) {
    const t = box(4.6, 9 * s, 4.6, pal.hair, 0, headY + headH * 0.05, -headD / 2 - 2.4);
    t.rotation.x = 0.45;
    g.add(t);
  }
  // face on the +Z side
  const eye = (dx) => box(2.2, 2.4, 1, C.ink, dx, headY + headH * 0.42, headD / 2 + 0.1);
  g.add(eye(-3.2), eye(3.2));
  g.add(box(3.4, 1.1, 1, '#c4736a', 0, headY + headH * 0.2, headD / 2 + 0.1));

  g.userData = { legL, legR, armL, armR, s, height: hipY + bodyH + headH * 1.4 };
  return g;
}

export function stepPerson(g, phase, moving) {
  const u = g.userData; if (!u) return;
  const a = moving ? Math.sin(phase) * 0.75 : 0;
  u.legL.rotation.x = a; u.legR.rotation.x = -a;
  u.armL.rotation.x = -a * 0.8; u.armR.rotation.x = a * 0.8;
  g.position.y = moving ? Math.abs(Math.sin(phase)) * 1.6 : 0;
}
const DIRY = { down: 0, up: Math.PI, right: Math.PI / 2, left: -Math.PI / 2 };
export function facePerson(g, dir) { g.rotation.y = DIRY[dir] ?? 0; }

export const PAL = {
  emmie: { top: C.pink, topL: '#ff9ac9', legs: C.navy, hair: C.hairBrown, ponytail: true },
  mom: { top: C.coral, topL: '#ff8f83', legs: C.jean, hair: C.hairBrown, longHair: true },
  dad: { top: C.green, topL: '#63c48d', legs: C.denim, hair: C.hairDark },
  teacher: { top: C.purple, topL: '#ab8ce0', legs: '#5a5a6e', hair: C.hairSandy, longHair: true },
};
export const KID_TOPS = [C.orange, C.teal, C.purple, C.yellow, C.coral, '#7fc24a'];
export function makeKid(i = 0) {
  return makePerson({ top: KID_TOPS[i % KID_TOPS.length], legs: '#5a6070', hair: i % 2 ? C.hairDark : C.hairBrown }, { kid: true });
}
export function makeEmmie() {
  const g = makePerson(PAL.emmie, { kid: true });
  const pack = box(13, 15, 6, C.purple, 0, 22, -7);
  pack.name = 'backpack';
  g.add(pack);
  g.userData.pack = pack;
  return g;
}

// ===================================================================
// ANIMALS
// ===================================================================
export function makeCat() {
  const g = new THREE.Group();
  g.add(box(9, 8, 18, C.cat, 0, 5, 0));                 // body
  g.add(box(9.5, 9, 8.5, C.cat, 0, 9, 10));             // head
  g.add(box(2.6, 3.4, 2, C.cat, -3, 17.5, 9));          // ears
  g.add(box(2.6, 3.4, 2, C.cat, 3, 17.5, 9));
  g.add(box(1.6, 1.6, 1, C.catEye, -2.4, 14, 14.3));
  g.add(box(1.6, 1.6, 1, C.catEye, 2.4, 14, 14.3));
  for (const [dx, dz] of [[-3, 6], [3, 6], [-3, -6], [3, -6]]) g.add(box(2.8, 5, 2.8, C.cat, dx, 0, dz));
  const tail = box(2.6, 12, 2.6, C.cat, 0, 8, -9);
  tail.rotation.x = -0.5; g.add(tail);
  g.userData.height = 20;
  return g;
}
export function makeDog() {
  const g = new THREE.Group();
  g.add(box(11, 11, 22, C.dog, 0, 8, 0));
  g.add(box(10, 10, 10, C.dog, 0, 12, 14));
  g.add(box(5, 4, 5, '#e8b884', 0, 12, 19));
  g.add(box(2, 1.6, 1, C.ink, 0, 14.4, 21.6));
  g.add(box(3, 5, 1.6, C.dog, -4.4, 19, 12));
  g.add(box(3, 5, 1.6, C.dog, 4.4, 19, 12));
  for (const [dx, dz] of [[-4, 8], [4, 8], [-4, -7], [4, -7]]) g.add(box(3.4, 8, 3.4, C.dog, dx, 0, dz));
  const tail = box(2.6, 10, 2.6, C.dog, 0, 14, -11); tail.rotation.x = 0.7; g.add(tail);
  return g;
}

// ===================================================================
// SCENERY
// ===================================================================
export function makeGround(w, d, colour, { thick = 12, margin = 0 } = {}) {
  const m = box(w + margin, thick, d + margin, colour, 0, -thick, 0);
  m.receiveShadow = true; m.castShadow = false;
  return m;
}
export function makeSlab(w, d, colour, h = 1.5) {
  const m = box(w, h, d, colour, 0, 0, 0);
  m.receiveShadow = true; m.castShadow = false;
  return m;
}
export function makeWall(w, h, d, colour) { return box(w, h, d, colour, 0, 0, 0); }

export function makeTree(s = 1) {
  const g = new THREE.Group();
  g.add(cyl(4.5 * s, 26 * s, C.wood, 0, 0, 0, 6));
  const a = cone(20 * s, 26 * s, C.leafD, 0, 20 * s, 0, 7);
  const b = cone(16 * s, 22 * s, C.leaf, 0, 34 * s, 0, 7);
  const c = cone(10 * s, 16 * s, '#6fbe5e', 0, 48 * s, 0, 7);
  g.add(a, b, c);
  return g;
}
export function makeBush(s = 1) {
  const g = new THREE.Group();
  g.add(box(20 * s, 14 * s, 18 * s, C.leafD, 0, 0, 0));
  g.add(box(14 * s, 10 * s, 13 * s, C.leaf, 2 * s, 10 * s, 0));
  return g;
}
export function makeBench() {
  const g = new THREE.Group();
  g.add(box(52, 4, 16, C.wood, 0, 14, 0));
  g.add(box(52, 14, 4, C.woodD, 0, 18, -7));
  g.add(box(4, 14, 14, C.metalD, -22, 0, 0));
  g.add(box(4, 14, 14, C.metalD, 22, 0, 0));
  return g;
}
export function makePond(w, d) {
  const g = new THREE.Group();
  g.add(box(w + 10, 4, d + 10, '#8fbf6a', 0, 0, 0));
  const water = box(w, 3, d, C.water, 0, 1.5, 0);
  water.castShadow = false;
  g.add(water);
  return g;
}
export function makeFence(len, { colour = C.metal } = {}) {
  const g = new THREE.Group();
  g.add(box(len, 3, 3, colour, len / 2, 26, 0));
  g.add(box(len, 3, 3, colour, len / 2, 10, 0));
  for (let i = 2; i < len; i += 9) g.add(box(2.6, 34, 2.6, colour, i, 0, 0));
  g.add(box(5, 40, 5, C.metalD, 0, 0, 0));
  return g;
}
export function makeGate() {
  const g = new THREE.Group();
  const leaf = new THREE.Group();
  leaf.add(box(44, 3, 3, C.metal, 22, 26, 0));
  leaf.add(box(44, 3, 3, C.metal, 22, 10, 0));
  for (let i = 3; i < 44; i += 9) leaf.add(box(2.6, 34, 2.6, C.metal, i, 0, 0));
  g.add(leaf);
  g.add(box(5, 42, 5, C.metalD, 0, 0, 0));
  g.userData.leaf = leaf;
  return g;
}
export function makeSchool(w, h, d) {
  const g = new THREE.Group();
  g.add(box(w, h, d, C.brick, 0, 0, 0));
  g.add(box(w + 10, 8, d + 10, C.brickD, 0, h, 0));
  // windows on the +Z face
  const rows = Math.max(1, Math.floor(h / 42));
  for (let r = 0; r < rows; r++)
    for (let x = -w / 2 + 26; x < w / 2 - 20; x += 34)
      g.add(box(20, 22, 2, '#bfe4f2', x, 22 + r * 42, d / 2 + 0.5));
  // doors
  g.add(box(38, 40, 3, C.woodD, 0, 0, d / 2 + 0.6));
  g.add(box(2, 40, 4, C.ink, 0, 0, d / 2 + 1));
  // sign
  g.add(box(76, 16, 3, C.wall, 0, h + 8, d / 2 - 2));
  return g;
}
export function makeFlagpole() {
  const g = new THREE.Group();
  g.add(cyl(2, 88, C.metal, 0, 0, 0, 6));
  g.add(box(26, 16, 1.5, C.coral, 14, 70, 0));
  return g;
}

// --- indoor -------------------------------------------------------
export function makeBed() {
  const g = new THREE.Group();
  g.add(box(66, 12, 104, C.woodD, 0, 0, 0));
  g.add(box(62, 8, 96, '#e9e4dc', 0, 12, 0));           // mattress
  g.add(box(62, 9, 62, '#5b7fd4', 0, 20, -14));         // blanket
  g.add(box(50, 8, 22, C.white, 0, 20, 36));            // pillow
  g.add(box(70, 34, 8, C.wood, 0, 0, -54));             // headboard
  return g;
}
export function makeDresser() {
  const g = new THREE.Group();
  g.add(box(58, 44, 26, C.wood, 0, 0, 0));
  for (let i = 0; i < 3; i++) {
    g.add(box(48, 10, 2, C.woodD, 0, 6 + i * 13, 13.5));
    g.add(box(6, 2.4, 2, C.metalD, 0, 10 + i * 13, 15));
  }
  return g;
}
export function makeNightstand() {
  const g = new THREE.Group();
  g.add(box(24, 22, 22, C.wood, 0, 0, 0));
  g.add(cyl(2.4, 10, C.metalD, 0, 22, 0, 6));
  g.add(cone(9, 12, C.yellow, 0, 32, 0, 7));
  return g;
}
export function makeRug(w, d, colour = C.coral) {
  const g = new THREE.Group();
  const a = box(w, 1.2, d, colour, 0, 0, 0); a.castShadow = false; g.add(a);
  const b = box(w * 0.7, 1.4, d * 0.62, '#ffb3a0', 0, 1.2, 0); b.castShadow = false; g.add(b);
  return g;
}
export function makeWindow() {
  const g = new THREE.Group();
  g.add(box(56, 44, 4, C.wood, 0, 0, 0));
  g.add(box(48, 36, 2, '#bfe4f2', 0, 4, 2));
  g.add(box(2, 36, 3, C.wood, 0, 4, 2.6));
  return g;
}
export function makeDoorway(w = 40, colour = C.woodD) {
  const g = new THREE.Group();
  g.add(box(w + 10, 60, 6, C.wallD, 0, 0, 0));
  g.add(box(w, 52, 4, colour, 0, 0, 1.5));
  g.add(box(4, 4, 3, C.yellow, w / 2 - 7, 24, 3.5));
  return g;
}
export function makeToilet() {
  const g = new THREE.Group();
  g.add(box(22, 16, 26, C.white, 0, 0, 0));
  g.add(box(20, 26, 10, C.white, 0, 0, -14));
  g.add(box(18, 3, 20, '#cfe4f0', 0, 16, 2));
  return g;
}
export function makeSink() {
  const g = new THREE.Group();
  g.add(box(34, 26, 22, C.white, 0, 0, 0));
  g.add(box(26, 3, 15, '#cfe4f0', 0, 26, 2));
  g.add(cyl(1.8, 10, C.metal, 0, 26, -7, 6));
  g.add(box(34, 26, 3, '#bfe4f2', 0, 38, -12));         // mirror
  return g;
}
export function makeCouch() {
  const g = new THREE.Group();
  g.add(box(92, 20, 34, C.green, 0, 0, 0));
  g.add(box(92, 26, 10, '#379260', 0, 20, -12));
  g.add(box(10, 30, 34, '#379260', -41, 0, 0));
  g.add(box(10, 30, 34, '#379260', 41, 0, 0));
  return g;
}
export function makeTV() {
  const g = new THREE.Group();
  g.add(box(12, 4, 20, C.ink, 0, 0, 0));
  g.add(box(60, 36, 5, C.ink, 0, 4, 0));
  g.add(box(54, 30, 2, '#4a6f92', 0, 7, 3));
  return g;
}
export function makeTable(w = 48, d = 30) {
  const g = new THREE.Group();
  g.add(box(w, 5, d, C.wood, 0, 20, 0));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    g.add(box(4, 20, 4, C.woodD, dx * (w / 2 - 4), 0, dz * (d / 2 - 4)));
  return g;
}
export function makeCounter(w = 90) {
  const g = new THREE.Group();
  g.add(box(w, 30, 30, C.wall, 0, 0, 0));
  g.add(box(w + 4, 4, 34, C.woodL, 0, 30, 0));
  return g;
}
export function makeBackpack(colour = C.purple) {
  const g = new THREE.Group();
  g.add(box(18, 20, 10, colour, 0, 0, 0));
  g.add(box(12, 6, 2, '#6746a0', 0, 4, 5.5));
  return g;
}
export function makeLunchbox(colour = C.coral) {
  const g = new THREE.Group();
  g.add(box(16, 12, 11, colour, 0, 0, 0));
  g.add(box(16, 3, 11, '#b8443c', 0, 12, 0));
  g.add(box(5, 2, 2, C.metal, 0, 15, 0));
  return g;
}
export function makeCubbies(w = 140) {
  const g = new THREE.Group();
  g.add(box(w, 66, 26, C.wood, 0, 0, 0));
  const cell = (w - 8) / 4;
  for (let i = 0; i < 4; i++) {
    const x = -w / 2 + 4 + cell * (i + 0.5);
    g.add(box(cell - 6, 24, 3, '#e7d7bb', x, 36, 13));      // upper cubby
    g.add(box(3, 3, 6, C.metal, x, 24, 14));                // hook
  }
  g.add(box(w, 3, 28, C.woodD, 0, 30, 0));
  return g;
}
export function makeLunchBin() {
  const g = new THREE.Group();
  g.add(box(46, 22, 30, '#3f8fd0', 0, 0, 0));
  g.add(box(50, 4, 34, '#2f6fa8', 0, 22, 0));
  return g;
}
export function makeLockers(len) {
  const g = new THREE.Group();
  g.add(box(len, 46, 18, C.metalD, len / 2, 0, 0));
  for (let i = 4; i < len - 4; i += 18) {
    g.add(box(15, 42, 2, C.metal, i, 2, 9.5));
    g.add(box(2, 2, 2, C.ink, i + 5, 22, 11));
  }
  return g;
}
export function makeCart() {
  const g = new THREE.Group();
  g.add(box(28, 22, 22, C.metal, 0, 8, 0));
  g.add(box(30, 4, 24, C.metalD, 0, 30, 0));
  g.add(box(2, 22, 2, C.metalD, 13, 30, -10));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(cyl(4, 4, C.ink, dx * 11, 0, dz * 8, 6));
  return g;
}
export function makeTrashCan() {
  const g = new THREE.Group();
  g.add(cyl(11, 24, '#3f7a4a', 0, 0, 0, 8));
  g.add(cyl(12, 3, '#2f5f3a', 0, 24, 0, 8));
  return g;
}
export function makeCoatRack() {
  const g = new THREE.Group();
  g.add(box(6, 62, 6, C.woodD, 0, 0, -20));
  g.add(box(6, 62, 6, C.woodD, 0, 0, 20));
  g.add(box(6, 6, 52, C.wood, 0, 62, 0));
  g.add(box(14, 26, 12, C.coral, 0, 30, -12));
  g.add(box(14, 24, 12, '#4a7fb5', 0, 32, 10));
  g.add(box(30, 3, 46, C.woodD, 0, 0, 0));
  return g;
}
export function makeMailbox() {
  const g = new THREE.Group();
  g.add(box(5, 30, 5, C.woodD, 0, 0, 0));
  g.add(box(16, 14, 22, '#4a7fb5', 0, 30, 0));
  g.add(box(2, 8, 2, C.coral, 9, 34, 0));
  return g;
}

// --- vehicles -----------------------------------------------------
export function makeCar(colour = C.car, { tesla = false } = {}) {
  const g = new THREE.Group();
  const w = 44, len = tesla ? 96 : 84;
  g.add(box(w, 20, len, colour, 0, 8, 0));
  g.add(box(w - 6, 18, len * 0.52, colour, 0, 28, -2));
  g.add(box(w - 9, 13, len * 0.5, C.glass, 0, 30, -2));
  for (const [dx, dz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]])
    g.add(cyl(9, 7, C.ink, dx * (w / 2 - 2), 0, dz * (len / 2 - 20), 8));
  g.add(box(11, 5, 2, '#fff3c4', -12, 12, len / 2));
  g.add(box(11, 5, 2, '#fff3c4', 12, 12, len / 2));
  g.add(box(11, 5, 2, C.coral, -12, 12, -len / 2));
  g.add(box(11, 5, 2, C.coral, 12, 12, -len / 2));
  return g;
}

// --- gameplay markers --------------------------------------------
export function makeMarker() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(26, 3.5, 6, 24),
    new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.95 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 2;
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(26, 24),
    new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.22 }),
  );
  disc.rotation.x = -Math.PI / 2; disc.position.y = 1.2;
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(9, 16, 6),
    new THREE.MeshBasicMaterial({ color: '#ffd23f' }),
  );
  arrow.rotation.x = Math.PI;
  arrow.position.y = 66;
  g.add(ring, disc, arrow);
  g.userData = { ring, arrow, disc };
  return g;
}
export function makePointer() {
  const m = new THREE.Mesh(
    new THREE.ConeGeometry(7, 18, 6),
    new THREE.MeshBasicMaterial({ color: '#ffd23f' }),
  );
  m.rotation.z = -Math.PI / 2;      // point along +X, then yaw to aim
  const g = new THREE.Group();
  g.add(m);
  return g;
}
export function makeProgressBar() {
  const g = new THREE.Group();
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(46, 8), new THREE.MeshBasicMaterial({ color: '#20182c' }));
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(44, 6), new THREE.MeshBasicMaterial({ color: '#8fe07a' }));
  fg.position.z = 0.4;
  g.add(bg, fg);
  g.userData = { fg };
  return g;
}
