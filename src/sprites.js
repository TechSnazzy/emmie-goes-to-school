// sprites.js — hand-authored pixel-art. Character sprites are strings (one char
// per pixel) blitted at PX screen-pixels per art-pixel. Props keep strict pixel
// discipline: integer coords, fillRect blocks only, dark outline, top-left light.
import { ctx } from './engine.js';

export const PX = 3;         // screen pixels per art pixel
const R = Math.round;

// --- cohesive palette --------------------------------------------
export const COL = {
  ink: '#1c1221', ink2: '#2e2437',
  white: '#f4f2f0', gray: '#9a97a8', gray2: '#5c5870',
  skin: '#ffcf9e', skinS: '#e79f74', skinD: '#b96b4c',
  brown: '#8a4f2b', brownS: '#5f3117', brownH: '#a9713f',
  dark: '#3a2a22', darkS: '#241812',
  pink: '#ff5ea0', pinkS: '#d43d81', pinkH: '#ffa6cf',
  blue: '#4a6bd8', blueS: '#33489f', blueH: '#7b95e8',
  coral: '#f0574f', coralS: '#c0343c', coralH: '#ff8a7a',
  green: '#3fa068', greenS: '#2b7a4c', greenH: '#5fc084',
  jean: '#465b86', jeanS: '#334268',
  purple: '#8a63c8', purpleS: '#6746a0', purpleH: '#a988de',
  shoe: '#efeae2', shoeS: '#b7b2ab',
  catA: '#33313f', catB: '#17151f', eye: '#9bf24d',
  dogA: '#cf9459', dogB: '#9c6738',
  wood: '#c08347', woodS: '#8a5a2c', woodH: '#d8a066',
  wall: '#f1e4cf', wallS: '#d8c4a5',
  metal: '#aeb4bd', metalS: '#7d8590', metalH: '#d5dae0',
  grass: '#7cc36a', grassS: '#5fa850', grassH: '#9bd989',
  leaf: '#4f9d48', leafS: '#3c7d3a', leafH: '#74c065',
  path: '#e0c79a', pathS: '#c3a877',
  water: '#5cb6d6', waterS: '#3f96b6', waterH: '#9fdcec',
  road: '#54525e', line: '#f2cf5b',
  sky: '#bfe6f2',
  teslaA: '#f4f5f8', teslaS: '#c9ccd4', glass: '#33405e',
  brick: '#c56a4f', brickS: '#9c4d3a',
  sun: '#ffd23f', sunS: '#ffb43f',
  red: '#e5484d', yellow: '#ffd23f',
};
// back-compat aliases for scene code
COL.grassD = COL.grassS; COL.pathD = COL.pathS; COL.wallD = COL.wallS;
COL.emmieHair = COL.brown; COL.leafD = COL.leafS;
export const PAL = COL;
export const PALETTE = COL;

// --- blitter ----------------------------------------------------
export function blit(rows, x, y, palette, { flip = false, px = PX } = {}) {
  x = R(x); y = R(y);
  const w = rows[0].length;
  for (let r = 0; r < rows.length; r++) {
    const line = rows[r];
    for (let c = 0; c < w; c++) {
      const ch = flip ? line[w - 1 - c] : line[c];
      const col = palette[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x + c * px, y + r * px, px, px);
    }
  }
}
function shadow(cx, cy, rw) {
  ctx.fillStyle = 'rgba(20,10,25,0.16)';
  const w = R(rw);
  ctx.fillRect(R(cx - w), R(cy - w * 0.18), w * 2, R(w * 0.36));
  ctx.fillRect(R(cx - w * 0.7), R(cy - w * 0.30), R(w * 1.4), R(w * 0.6));
}
function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(R(x), R(y), R(w) || PX, R(h) || PX); }

// ================================================================
// CHARACTERS  (14 art-px wide)
// slots: o outline | K skin k shade | H hair h shade | A top a shade Q top-hi
//        L legs | F foot | E eye | M mouth | W white
// ================================================================
const KID_HEAD_DOWN = [
  '...oooooooo...',
  '..oHHHHHHHHo..',
  '.oHHHHHHHHHHo.',
  '.oHHKKKKKKHHo.',
  '.oHKKKKKKKKHo.',
  '.oHKEKKKKEKho.',
  '.oHKbKKKKbKho.',
  '.oHKKKMMKKKho.',
  '..oKKKKKKKho..',
];
const KID_HEAD_SIDE = [
  '....oooooo....',
  '..ooHHHHHHo...',
  '.oHHHHHHHHHo..',
  '.oHHHHKKKKho..',
  '.oHHHKKKKKho..',
  '.oHHKKEKKKho..',
  '.oHHKKbKKho...',
  '.oHHKKMKho....',
  '..oHKKKKho....',
];
const KID_HEAD_UP = [
  '...oooooooo...',
  '..oHHHHHHHHo..',
  '.oHHHHHHHHHHo.',
  '.oHHHHHHHHHHo.',
  '.oHHHHHHHHHHo.',
  '.oHHHHHHHHhho.',
  '.oHHHHHHHHhho.',
  '.oHHHHHHHHhho.',
  '..oHHHHHHHho..',
];
const KID_TORSO_DOWN = ['...oooooooo...', '..oAAAAAAAAo..', '.oQAAAAAAAAao.', '.oQAAAAAAAAao.', '..oAAAAAAAao..'];
const KID_TORSO_SIDE = ['...oooooo.....', '..oAAAAAAo....', '.oQAAAAAAAo...', '.oQAAAAAAao...', '..oAAAAAAo....'];
const KID_TORSO_UP = ['...oooooooo...', '..oAAAAAAAAo..', '.oaAAAAAAAAao.', '.oaAAAAAAAAao.', '..oAAAAAAAao..'];
const LEGS = {
  down0: ['..oLLo..oLLo..', '..oLLo..oLLo..', '..oFFo..oFFo..'],
  down1: ['..oLLo..oLLo..', '..oLLo..oLLo..', '.oFFo....oFFo.'],
  side0: ['...oLLoo......', '...oLLoo......', '...oFFFo......'],
  side1: ['..oLo..oLo....', '..oLo..oLo....', '.oFFo.oFFo....'],
};
const ADULT_TORSO_DOWN = ['...oooooooo...', '..oAAAAAAAAo..', '.oQAAAAAAAAao.', 'oQAAAAAAAAAao', 'oQAAAAAAAAAao', 'oaAAAAAAAAAao', 'oaAAAAAAAAAao', '.oAAAAAAAAAo.', '..oAAAAAAAao..'];
const ADULT_TORSO_SIDE = ['...oooooo.....', '..oAAAAAAo....', '.oQAAAAAAAo...', '.oQAAAAAAAAo..', '.oQAAAAAAAAo..', '.oaAAAAAAAao.', '.oaAAAAAAAao.', '..oAAAAAAAo...', '..oAAAAAAo....'];
const ADULT_TORSO_UP = ['...oooooooo...', '..oAAAAAAAAo..', '.oaAAAAAAAAao.', 'oaAAAAAAAAAao', 'oaAAAAAAAAAao', 'oaAAAAAAAAAao', 'oaAAAAAAAAAao', '.oAAAAAAAAAo.', '..oAAAAAAAao..'];
const ALEGS = {
  down0: ['..oLLo..oLLo..', '..oLLo..oLLo..', '..oLLo..oLLo..', '..oLLo..oLLo..', '..oFFo..oFFo..'],
  down1: ['..oLLo..oLLo..', '..oLLo..oLLo..', '..oLLo..oLLo..', '..oLLo..oLLo..', '.oFFo....oFFo.'],
  side0: ['...oLLoo......', '...oLLoo......', '...oLLoo......', '...oLLoo......', '...oFFFo......'],
  side1: ['..oLo..oLo....', '..oLo..oLo....', '..oLo..oLo....', '..oLo..oLo....', '.oFFo.oFFo....'],
};

function cpal(o) {
  return {
    '.': null, o: COL.ink, W: COL.white, E: COL.ink, M: '#a8534a', b: '#ffab97',
    K: COL.skin, k: COL.skinS, F: COL.shoe,
    H: o.hair, h: o.hairS, A: o.top, a: o.topS, Q: o.topH, L: o.legs,
  };
}
function compose(kind, dir, frame) {
  const side = dir === 'left' || dir === 'right';
  const key = side ? 'side' : dir;
  if (kind === 'kid') {
    const head = { down: KID_HEAD_DOWN, up: KID_HEAD_UP, side: KID_HEAD_SIDE }[key];
    const torso = { down: KID_TORSO_DOWN, up: KID_TORSO_UP, side: KID_TORSO_SIDE }[key];
    const legs = LEGS[(side ? 'side' : 'down') + (frame & 1)];
    return [...head, ...torso, ...legs];
  }
  const head = { down: KID_HEAD_DOWN, up: KID_HEAD_UP, side: KID_HEAD_SIDE }[key];
  const torso = { down: ADULT_TORSO_DOWN, up: ADULT_TORSO_UP, side: ADULT_TORSO_SIDE }[key];
  const legs = ALEGS[(side ? 'side' : 'down') + (frame & 1)];
  return [...head, ...torso, ...legs];
}

function drawChar(kind, cx, cy, o) {
  const dir = o.dir || 'down';
  const frame = o.moving ? ((o.frame ?? Math.floor(o.anim || 0)) & 1) : 0;
  const rows = compose(kind, dir, frame);
  const w = 14 * PX, h = rows.length * PX;
  const bob = o.moving && (frame & 1) ? PX : 0;
  shadow(cx, cy, w * 0.32);
  blit(rows, cx - w / 2, cy - h - bob, cpal(o.p), { flip: dir === 'left' });
}

const P_EMMIE = { hair: COL.brown, hairS: COL.brownS, top: COL.pink, topS: COL.pinkS, topH: COL.pinkH, legs: COL.blue };
const P_MOM = { hair: COL.brown, hairS: COL.brownS, top: COL.coral, topS: COL.coralS, topH: COL.coralH, legs: COL.jean };
const P_DAD = { hair: COL.dark, hairS: COL.darkS, top: COL.green, topS: COL.greenS, topH: COL.greenH, legs: COL.jean };
const P_TEACH = { hair: COL.brownH, hairS: COL.brown, top: COL.purple, topS: COL.purpleS, topH: COL.purpleH, legs: COL.gray2 };
const KID_TOPS = [COL.coral, COL.green, COL.purple, COL.yellow, '#3fb0c0', COL.pink];

function ponytail(cx, cy, dir, rowsH, c) {
  const y = cy - rowsH * PX;
  ctx.fillStyle = c;
  if (dir === 'down') ctx.fillRect(R(cx - PX), R(y + PX), PX * 2, PX * 4);
  else if (dir === 'up') ctx.fillRect(R(cx - PX * 1.5), R(y + PX * 4), PX * 3, PX * 5);
  else { const s = dir === 'left' ? -1 : 1; ctx.fillRect(R(cx + s * 4 * PX), R(y + PX * 3), PX * 2, PX * 5); }
}
function sideHair(cx, cy, dir, rowsH, c, len) {
  if (dir === 'up') return;
  const y = cy - rowsH * PX;
  ctx.fillStyle = c;
  ctx.fillRect(R(cx - 6 * PX), R(y + 3 * PX), PX * 2, PX * len);
  ctx.fillRect(R(cx + 4 * PX), R(y + 3 * PX), PX * 2, PX * len);
}

export function drawEmmie(cx, cy, o = {}) {
  const dir = o.dir || 'down';
  const rowsH = 17;
  ponytail(cx, cy, dir, rowsH, COL.brownS);
  drawChar('kid', cx, cy, { ...o, p: P_EMMIE });
  if (o.backpack) drawBackpackOn(cx, cy, dir, o.backpack);
}
export function drawKid(cx, cy, o = {}) {
  const p = { ...P_MOM, hair: COL.dark, hairS: COL.darkS, top: o.color || KID_TOPS[(o.tint | 0) % KID_TOPS.length], topS: COL.ink2, topH: o.color || KID_TOPS[(o.tint | 0) % KID_TOPS.length], legs: COL.gray2 };
  drawChar('kid', cx, cy, { ...o, p });
}
export function drawMom(cx, cy, o = {}) {
  sideHair(cx, cy, o.dir || "down", 23, COL.brownS, 6);
  drawChar('adult', cx, cy, { ...o, p: P_MOM });
}
export function drawDad(cx, cy, o = {}) { drawChar('adult', cx, cy, { ...o, p: P_DAD }); }
export function drawTeacher(cx, cy, o = {}) {
  sideHair(cx, cy, o.dir || "down", 23, COL.brown, 7);
  drawChar('adult', cx, cy, { ...o, p: P_TEACH });
}
export const drawParentBy = (_t, cx, cy, o) => drawDad(cx, cy, o);

// ---- Milo the cat / dog ---------------------------------------
const CATPAL = { '.': null, o: COL.catB, C: COL.catA, y: COL.eye };
const CAT_SIT = [
  '..o....o..',
  '.oCo..oCo.',
  '.oCCCCCCo.',
  '.oCyCCyCo.',
  '.oCCCCCCo.',
  'ooCCCCCCoo',
  'oCCCCCCCCo',
  'oCCCCCCCCo',
  'oCCCCCCCCoo',
  '.oCCCCCCoCo',
  '.oooooooooo',
];
const CAT_SIDE = [
  '..........',
  'oo......oo',
  'oCo....oCo',
  'oCCooooCCCo',
  'oCCCCCCCCCo',
  'oyCCCCCCCCo',
  '.oCCCCCCCo',
  '.o.oo.oo.o',
];
const CAT_DOWN = [
  '.o......o.',
  'oCo....oCo',
  'oCyo..oyCo',
  'oCCCCCCCCo',
  '.oCCCCCCo.',
  '.oCCCCCCo.',
  'ooCCCCCCoo',
  'oCCCCCCCCo',
  '.oo....oo.',
];
export function drawCat(cx, cy, o = {}) {
  const dir = o.dir || 'down';
  const rows = o.sitting ? CAT_SIT : (dir === 'left' || dir === 'right') ? CAT_SIDE : CAT_DOWN;
  const w = rows[0].length * PX;
  shadow(cx, cy, w * 0.42);
  blit(rows, cx - w / 2, cy - rows.length * PX, CATPAL, { flip: dir === 'left' });
}
const DOG_SIDE = [
  '..........o.o.',
  '.o.......oUoUo',
  'oUoooo..oUUUUo',
  'oUUUUooooUUUno',
  'oUUUUUUUUUUUUo',
  'oUUUUUUUUUUUo.',
  'o.Uo.oUo.Uo.o',
  '.o.o..o.o.o...',
];
export function drawDog(cx, cy, o = {}) {
  const rows = DOG_SIDE, w = rows[0].length * PX;
  shadow(cx, cy, w * 0.42);
  blit(rows, cx - w / 2, cy - rows.length * PX, { '.': null, o: COL.ink, U: COL.dogA, n: COL.ink }, { flip: (o.dir || 'right') === 'left' });
}
export function drawSleeper(cx, cy) {
  // Emmie's head poking out from under the blanket, eyes closed
  px(cx - 7 * PX, cy - 5 * PX, 14 * PX, 4 * PX, COL.blueH);   // blanket edge
  px(cx - 5 * PX, cy - 8 * PX, 10 * PX, 4 * PX, COL.brown);   // hair
  px(cx - 4 * PX, cy - 5 * PX, 8 * PX, 3 * PX, COL.skin);     // face
  px(cx - 2 * PX, cy - 4 * PX, PX, PX, COL.ink);
  px(cx + 1 * PX, cy - 4 * PX, PX, PX, COL.ink);
}
export function drawSquirrel(cx, cy) {
  blit(['.oo..', 'oUUo.', 'oUUUo', 'oUUUoo', 'oo.oU', '.ooo.'], cx - 7, cy - 18, { '.': null, o: COL.ink, U: '#a97a4e' });
}

// ================================================================
// PROPS — pixel discipline: outline, one light dir, hard steps
// ================================================================
function box(x, y, w, h, fill, { top, hi, out = COL.ink } = {}) {
  x = R(x); y = R(y); w = R(w); h = R(h);
  ctx.fillStyle = out; ctx.fillRect(x - PX, y - PX, w + PX * 2, h + PX * 2);
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
  if (top) { ctx.fillStyle = top; ctx.fillRect(x, y, w, PX); }
  if (hi) { ctx.fillStyle = hi; ctx.fillRect(x, y, PX, h); }
}
function disc(cx, cy, r, c) {
  r = R(r); ctx.fillStyle = c;
  for (let yy = -r; yy < r; yy += PX) {
    const ww = Math.sqrt(Math.max(0, r * r - yy * yy));
    ctx.fillRect(R(cx - ww), R(cy + yy), R(ww * 2) || PX, PX);
  }
}

// nature
export function drawTree(cx, cy, s = 1) {
  const t = PX * s;
  shadow(cx, cy, 10 * t);
  box(cx - 2 * t, cy - 9 * t, 4 * t, 9 * t, COL.wood, { hi: COL.woodH });
  for (const [dx, dy, r] of [[-4, -13, 6.6], [4, -13, 6.6], [0, -18, 7.6]]) disc(cx + dx * t, cy + dy * t, (r + 0.8) * t, COL.ink);
  for (const [dx, dy, r] of [[-4, -13, 6], [4, -13, 6], [0, -18, 7]]) disc(cx + dx * t, cy + dy * t, r * t, COL.leafS);
  disc(cx - 2 * t, cy - 15 * t, 5 * t, COL.leaf);
  disc(cx + 1.5 * t, cy - 19 * t, 3 * t, COL.leafH);
}
export function drawBush(cx, cy, s = 1) {
  const t = PX * s; shadow(cx, cy, 8 * t);
  for (const [dx, dy, r] of [[-4, -3, 5.6], [4, -3, 5.6], [0, -6, 6.6]]) disc(cx + dx * t, cy + dy * t, r * t, COL.ink);
  disc(cx - 4 * t, cy - 3 * t, 5 * t, COL.leafS);
  disc(cx + 4 * t, cy - 3 * t, 5 * t, COL.leafS);
  disc(cx, cy - 6 * t, 6 * t, COL.leaf);
  px(cx - 4 * t, cy - 8 * t, PX, PX, COL.leafH);
}
export function drawBench(cx, cy) {
  shadow(cx, cy, 26);
  box(cx - 24, cy - 6, 48, 5, COL.wood, { top: COL.woodH });
  box(cx - 24, cy - 17, 48, 5, COL.woodS);
  px(cx - 20, cy - 6, PX, 9, COL.ink); px(cx + 17, cy - 6, PX, 9, COL.ink);
}
export function drawPond(cx, cy, w = 90, h = 44) {
  w = R(w / 2 / PX) * PX * 2; h = R(h / 2 / PX) * PX * 2;
  // rounded pixel blob: rows get narrower toward top/bottom
  for (let step = -1; step <= 1; step += 2) {
    const col = step < 0 ? COL.waterS : COL.water;
    void col;
  }
  const rows = h / PX;
  for (let i = 0; i < rows; i++) {
    const ny = (i / (rows - 1)) * 2 - 1;           // -1..1
    const cut = Math.round((1 - Math.sqrt(1 - Math.min(1, ny * ny))) * (w * 0.42) / PX) * PX;
    const y = cy - h / 2 + i * PX;
    ctx.fillStyle = COL.waterS; ctx.fillRect(R(cx - w / 2 + cut - PX), R(y), R(w - cut * 2 + PX * 2), PX);
    ctx.fillStyle = i < 2 || i > rows - 3 ? COL.waterS : COL.water;
    ctx.fillRect(R(cx - w / 2 + cut), R(y), R(w - cut * 2), PX);
  }
  px(cx - w * 0.28, cy - h * 0.22, w * 0.3, PX, COL.waterH);
  px(cx - w * 0.1, cy + h * 0.05, w * 0.2, PX, COL.waterH);
}
export function drawPuddle(cx, cy, r = 16) {
  px(cx - r, cy - r * 0.4, r * 2, r * 0.8, COL.waterS);
  px(cx - r * 0.6, cy - r * 0.2, r * 0.5, PX, COL.waterH);
}
export function drawMailbox(cx, cy) {
  shadow(cx, cy, 8);
  px(cx - PX, cy - 22, PX * 2, 22, COL.woodS);
  box(cx - 9, cy - 32, 18, 11, COL.blue, { hi: COL.blueH });
  px(cx + 5, cy - 30, PX * 2, PX * 2, COL.red);
}
export function drawCloud(cx, cy, s = 1) {
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  for (const [dx, dy, r] of [[-12, 3, 8], [0, 0, 11], [12, 3, 8], [4, -6, 7]]) {
    const rr = R(r * s); ctx.fillRect(R(cx + dx * s - rr), R(cy + dy * s - rr / 2), rr * 2, rr);
  }
}
export function drawSun(cx, cy, r = 14) {
  r = R(r);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; px(cx + Math.cos(a) * (r + 3) - PX, cy + Math.sin(a) * (r + 3) - PX, PX * 2, PX * 2, COL.sunS); }
  disc(cx, cy, r, COL.sun);
  px(cx - r * 0.4, cy - r * 0.4, PX * 2, PX * 2, '#fff3b0');
}
export function drawFlagpole(cx, cy) {
  shadow(cx, cy, 6);
  px(cx - PX, cy - 58, PX * 2, 58, COL.metalS);
  box(cx + PX, cy - 58, 20, 12, COL.red);
  px(cx + PX, cy - 58, 20, PX, COL.white);
}

// fences / gate / school
export function drawFence(x, y, len) {
  x = R(x); y = R(y); len = R(len);
  px(x, y - 26, len, PX, COL.metalS);
  px(x, y - 10, len, PX, COL.metalS);
  for (let i = 0; i < len; i += PX * 3) px(x + i, y - 34, PX, 34, COL.metal);
  px(x - PX, y - 40, PX * 2, 40, COL.metalS);
}
export function drawGate(cx, y, open = 0) {
  ctx.save(); ctx.translate(R(cx), R(y - 34)); ctx.rotate(-open * 1.1);
  px(0, PX, 40, PX, COL.metal); px(0, 28, 40, PX, COL.metal);
  for (let i = 0; i < 42; i += PX * 3) px(i, 0, PX, 34, COL.metal);
  ctx.restore();
  px(cx - PX, y - 40, PX * 2, 40, COL.metalS);
  px(cx + 40, y - 40, PX * 2, 40, COL.metalS);
}
const midx = (x, w) => R(x + w / 2);
export function drawSchoolBuilding(x, y, w, h) {
  x = R(x); y = R(y); w = R(w); h = R(h);
  ctx.fillStyle = COL.ink; ctx.fillRect(x - PX, y - h - PX, w + PX * 2, h + PX * 2);
  ctx.fillStyle = COL.brick; ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = COL.brickS;
  for (let yy = y - h + PX * 3; yy < y; yy += PX * 3) ctx.fillRect(x, yy, w, PX);
  ctx.fillStyle = COL.ink2; ctx.fillRect(x - PX * 2, y - h - PX * 3, w + PX * 4, PX * 3);
  for (let wx = x + PX * 5; wx < x + w - PX * 9; wx += PX * 10)
    for (let wy = y - h + PX * 6; wy < y - PX * 13; wy += PX * 12) {
      px(wx, wy, PX * 6, PX * 7, COL.ink);
      px(wx + PX, wy + PX, PX * 4, PX * 5, '#bfe0ee');
      px(wx + PX, wy + PX, PX * 2, PX * 5, '#e0f1f8');
    }
  px(midx(x, w) - PX * 6, y - PX * 12, PX * 12, PX * 12, COL.ink);
  px(midx(x, w) - PX * 5, y - PX * 11, PX * 10, PX * 11, COL.woodS);
  px(midx(x, w) - PX, y - PX * 11, PX * 2, PX * 11, COL.ink);
  px(midx(x, w) - PX * 10, y - h - PX * 7, PX * 20, PX * 5, COL.wall);
  ctx.fillStyle = COL.brickS; ctx.font = `700 ${PX * 3.3}px "Baloo 2",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SCHOOL', midx(x, w), y - h - PX * 4.5);
}

// indoor furniture
export function drawBed(cx, cy, w = 70, d = 96) {
  w = R(w); d = R(d);
  shadow(cx, cy, w * 0.55);
  box(cx - w / 2, cy - d, w, d, COL.blue, { top: COL.blueH });
  px(cx - w / 2, cy - d, w, R(d * 0.3), COL.wall);
  px(cx - w / 2 + PX * 2, cy - d + PX * 2, w - PX * 4, R(d * 0.3) - PX * 4, COL.white);
  px(cx - w / 2, cy - d - PX * 3, w, PX * 4, COL.woodS);
  for (let i = PX * 4; i < w - PX * 2; i += PX * 6) px(cx - w / 2 + i, cy - d * 0.55, PX, d * 0.5, COL.blueS);
}
export function drawDresser(cx, cy, w = 58) {
  w = R(w); shadow(cx, cy, w * 0.55);
  box(cx - w / 2, cy - 42, w, 42, COL.wood, { top: COL.woodH });
  for (let r = 0; r < 3; r++) { px(cx - w / 2 + PX * 2, cy - 38 + r * PX * 4, w - PX * 4, PX * 3, COL.woodS); px(cx - PX, cy - 37 + r * PX * 4, PX * 2, PX, COL.ink); }
}
export function drawNightstand(cx, cy) {
  shadow(cx, cy, 14);
  box(cx - 11, cy - 20, 22, 20, COL.wood, { top: COL.woodH });
  box(cx - 6, cy - 33, 12, 9, COL.yellow);
  px(cx - PX, cy - 24, PX * 2, PX * 3, COL.metalS);
}
export function drawRug(cx, cy, w = 100, h = 58, c = COL.coral) {
  w = R(w / 2) * 2; h = R(h / 2) * 2;
  px(cx - w / 2, cy - h / 2, w, h, COL.coralS);
  px(cx - w / 2 + PX, cy - h / 2 + PX, w - PX * 2, h - PX * 2, c);
  px(cx - w / 2 + PX * 3, cy - h / 2 + PX * 3, w - PX * 6, h - PX * 6, COL.coralS);
  px(cx - w / 2 + PX * 5, cy - h / 2 + PX * 5, w - PX * 10, h - PX * 10, c);
}
export function drawWindow(cx, cy, w = 44) {
  w = R(w);
  box(cx - w / 2, cy - 30, w, 30, '#bfe0ee', { top: COL.wallS });
  px(cx - w / 2, cy - 30, w, PX, COL.wood); px(cx - PX, cy - 30, PX * 2, 30, COL.wood); px(cx - w / 2, cy - 16, w, PX, COL.wood);
  px(cx - w / 2 + PX, cy - 28, w * 0.35, PX * 3, '#e8f4fa');
}
export function drawDoor(cx, cy, w = 30, open = false) {
  w = R(w);
  box(cx - w / 2, cy - 46, w, 46, open ? COL.ink2 : COL.woodS, { top: COL.wood });
  if (!open) px(cx + w / 2 - PX * 2, cy - 24, PX * 2, PX * 2, COL.yellow);
}
export function drawLightSwitch(cx, cy, on) {
  box(cx - 4, cy - 7, 8, 12, COL.wall);
  px(cx - PX / 2, cy - (on ? 5 : 1), PX, PX * 2, on ? COL.sun : COL.gray2);
}
export function drawToilet(cx, cy) {
  shadow(cx, cy, 14);
  box(cx - 11, cy - 12, 22, 12, COL.white, { top: '#fff' });
  box(cx - 8, cy - 30, 16, 20, COL.white);
  px(cx - 7, cy - 12, 14, PX * 2, '#cfe4f0');
}
export function drawSink(cx, cy) {
  shadow(cx, cy, 16);
  box(cx - 15, cy - 20, 30, 20, COL.white, { top: '#fff' });
  px(cx - 10, cy - 18, 20, PX * 3, '#cfe4f0');
  px(cx - PX, cy - 26, PX * 2, PX * 3, COL.metalS);
  box(cx - 16, cy - 44, 32, 16, '#bfe0ee', { hi: '#e8f4fa' });
}
export function drawCouch(cx, cy, w = 88) {
  w = R(w); shadow(cx, cy, w * 0.55);
  box(cx - w / 2, cy - 30, w, 30, COL.green, { top: COL.greenH });
  box(cx - w / 2, cy - 40, w, 14, COL.greenS);
  box(cx - w / 2 - PX * 2, cy - 36, PX * 4, 30, COL.greenS);
  box(cx + w / 2 - PX * 2, cy - 36, PX * 4, 30, COL.greenS);
}
export function drawTV(cx, cy) {
  box(cx - 28, cy - 36, 56, 32, COL.ink2, { top: COL.gray2 });
  px(cx - 24, cy - 32, 48, 24, '#3a5b7a');
  px(cx - 22, cy - 30, 16, 8, '#5f8ea0');
  px(cx - PX * 2, cy - 4, PX * 4, PX * 2, COL.ink2);
}
export function drawTable(cx, cy, w = 44) {
  w = R(w); shadow(cx, cy, w * 0.5);
  box(cx - w / 2, cy - 14, w, 7, COL.wood, { top: COL.woodH });
  px(cx - w / 2 + PX, cy - 7, PX * 2, PX * 3, COL.woodS); px(cx + w / 2 - PX * 3, cy - 7, PX * 2, PX * 3, COL.woodS);
}
export function drawCoatRack(cx, cy) {
  px(cx - 24, cy - 42, 48, PX * 2, COL.woodS);
  for (let i = -16; i <= 16; i += 16) px(cx + i - PX / 2, cy - 38, PX, PX * 3, COL.metalS);
  box(cx - 20, cy - 38, 15, 22, COL.red);
  box(cx + 3, cy - 38, 15, 20, COL.blue);
}
export function drawBackpack(cx, cy, c = COL.purple) {
  box(cx - 8, cy - 16, 16, 18, c, { hi: COL.purpleH });
  px(cx - 5, cy - 9, 10, PX * 3, COL.ink2);
  px(cx - 8, cy - 15, PX, 12, c); px(cx + 6, cy - 15, PX, 12, c);
}
function drawBackpackOn(cx, cy, dir, c) {
  // kid torso top sits ~10 art-px above the feet; pack rides on the shoulders
  const y = cy - 11 * PX;
  if (dir === 'up') {                    // full pack facing us
    px(cx - 4 * PX, y - PX, 8 * PX, 8 * PX, COL.ink);
    px(cx - 3 * PX, y, 6 * PX, 6 * PX, c);
    px(cx - 3 * PX, y, 6 * PX, PX, COL.purpleH);
    px(cx - PX, y + 2 * PX, 2 * PX, 2 * PX, COL.ink2);
    return;
  }
  if (dir === 'down') {                  // just straps on the chest
    px(cx - 3 * PX, y, PX, 6 * PX, c);
    px(cx + 2 * PX, y, PX, 6 * PX, c);
    return;
  }
  const s = dir === 'left' ? 1 : -1;     // a bump peeking behind the back
  px(cx + s * 3 * PX, y - PX, 3 * PX, 7 * PX, COL.ink);
  px(cx + s * 3 * PX + (s > 0 ? 0 : PX), y, 2 * PX, 5 * PX, c);
}
export function drawLunchbox(cx, cy, c = COL.red) {
  box(cx - 8, cy - 10, 16, 11, c, { hi: COL.coralH });
  px(cx - 8, cy - 12, 16, PX, COL.ink2);
  px(cx - PX, cy - 15, PX * 2, PX, COL.metalS);
}
export function drawCubbies(cx, cy, w = 130) {
  w = R(w); shadow(cx, cy, w * 0.5);
  box(cx - w / 2, cy - 64, w, 64, COL.wood, { top: COL.woodH });
  const cell = R((w - PX * 4) / 4);
  for (let i = 0; i < 4; i++) {
    const bx = cx - w / 2 + PX * 2 + i * cell;
    px(bx, cy - 60, cell - PX * 2, PX * 9, COL.woodS);
    px(bx + cell / 2 - PX / 2, cy - 30, PX, PX * 2, COL.metalS);
  }
  px(cx - w / 2 + PX * 2, cy - 28, w - PX * 4, PX, COL.woodS);
}
export function drawLunchBin(cx, cy) {
  shadow(cx, cy, 24);
  box(cx - 22, cy - 20, 44, 20, COL.blue, { top: COL.blueH });
  px(cx - 22, cy - 24, 44, PX * 2, COL.blueS);
  ctx.fillStyle = COL.white; ctx.font = `700 ${PX * 3}px "Baloo 2",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('LUNCH', cx, cy - 10);
}
export function drawLockers(x, y, len) {
  x = R(x); y = R(y); len = R(len);
  box(x, y - 42, len, 42, COL.metalS, { top: COL.metalH });
  for (let i = 0; i < len; i += PX * 5) { px(x + i + PX, y - 40, PX * 3, PX * 12, COL.metal); px(x + i + PX * 2, y - 26, PX, PX, COL.ink); }
}
export function drawCart(cx, cy) {
  shadow(cx, cy, 14);
  box(cx - 13, cy - 22, 26, 20, COL.metal, { top: COL.metalH });
  px(cx - 11, cy - 4, PX * 2, PX * 2, COL.ink); px(cx + 7, cy - 4, PX * 2, PX * 2, COL.ink);
  px(cx + 12, cy - 28, PX, PX * 8, COL.metalS);
}
export function drawTrashCan(cx, cy) {
  shadow(cx, cy, 9);
  box(cx - 8, cy - 18, 16, 18, COL.greenS, { top: COL.green });
  px(cx - 10, cy - 20, 20, PX, COL.ink2);
}
export function drawClassDoor(cx, cy, label = '') {
  box(cx - 18, cy - 54, 36, 54, COL.woodS, { top: COL.wood });
  px(cx - 12, cy - 48, 24, 16, '#bfe0ee');
  px(cx + 11, cy - 26, PX * 2, PX * 2, COL.yellow);
  if (label) {
    px(cx - 17, cy - 68, 34, 12, COL.wall);
    ctx.fillStyle = COL.greenS; ctx.font = `700 ${PX * 2.6}px "Baloo 2",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy - 62);
  }
}

// vehicles
export function drawTesla(cx, cy, o = {}) {
  const dir = o.dir || 'down';
  shadow(cx, cy, 34);
  if (dir === 'down' || dir === 'up') {
    const rear = dir === 'up';
    box(cx - 20, cy - 54, 40, 54, COL.teslaA, { top: COL.teslaS });
    px(cx - 17, cy - 50, 34, PX, COL.teslaS);                       // roof edge
    px(cx - 15, cy - (rear ? 46 : 48), 30, PX * 5, COL.glass);      // far window
    px(cx - 14, cy - 20, 28, PX * 4, COL.glass);                    // near window
    // wheels
    px(cx - 23, cy - 46, PX * 2, PX * 5, COL.ink); px(cx + 19, cy - 46, PX * 2, PX * 5, COL.ink);
    px(cx - 23, cy - 16, PX * 2, PX * 5, COL.ink); px(cx + 19, cy - 16, PX * 2, PX * 5, COL.ink);
    if (rear) {                                                     // red tail-lights + bumper
      px(cx - 17, cy - PX * 3, PX * 4, PX * 2, COL.red);
      px(cx + 5, cy - PX * 3, PX * 4, PX * 2, COL.red);
      px(cx - 18, cy - PX, PX * 12, PX, COL.teslaS);
    } else {                                                        // headlights
      px(cx - 16, cy - PX * 2, PX * 4, PX * 2, '#fff6c8');
      px(cx + 4, cy - PX * 2, PX * 4, PX * 2, '#fff6c8');
    }
  } else {
    const s = dir === 'left' ? -1 : 1;
    box(cx - 32, cy - 22, 64, 22, COL.teslaA, { top: COL.teslaS });
    box(cx - 16, cy - 32, 32, 12, COL.teslaA);
    px(cx - 13, cy - 30, 26, PX * 3, COL.glass);
    px(cx - 17, cy - PX * 2, PX * 5, PX * 5, COL.ink); px(cx + 12, cy - PX * 2, PX * 5, PX * 5, COL.ink);
    px(cx + s * 28, cy - 16, PX * 2, PX * 3, COL.yellow);
  }
}
export function drawCar(cx, cy, color = COL.coral, o = {}) {
  const dir = o.dir || 'down';
  shadow(cx, cy, 26);
  if (dir === 'down' || dir === 'up') {
    box(cx - 16, cy - 42, 32, 42, color, { top: COL.white });
    px(cx - 12, cy - 36, 24, PX * 5, COL.glass);
    px(cx - 11, cy - 14, 22, PX * 4, COL.glass);
    px(cx - 19, cy - 34, PX * 2, PX * 4, COL.ink); px(cx + 15, cy - 34, PX * 2, PX * 4, COL.ink);
    px(cx - 19, cy - 12, PX * 2, PX * 4, COL.ink); px(cx + 15, cy - 12, PX * 2, PX * 4, COL.ink);
  } else {
    box(cx - 26, cy - 20, 52, 20, color);
    px(cx - 12, cy - 28, 24, PX * 3, COL.glass);
    px(cx - 14, cy - PX * 2, PX * 5, PX * 5, COL.ink); px(cx + 9, cy - PX * 2, PX * 5, PX * 5, COL.ink);
  }
}

// ground tiles
export function ground(kind, camX, camY, w, h) {
  const T = PX * 8;
  const base = { grass: COL.grass, wood: COL.wood, tile: COL.wall, road: COL.road, blacktop: COL.metalS, sand: COL.path, sidewalk: '#c9c6cf' }[kind] || COL.grass;
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  const ox = -(((camX % T) + T) % T), oy = -(((camY % T) + T) % T);
  for (let ty = oy, gy = Math.floor(camY / T); ty < h; ty += T, gy++)
    for (let tx = ox, gx = Math.floor(camX / T); tx < w; tx += T, gx++) {
      const alt = (gx + gy) & 1;
      if (kind === 'grass') {
        if (alt) { ctx.fillStyle = 'rgba(60,125,58,0.16)'; ctx.fillRect(tx, ty, T, T); }
        ctx.fillStyle = COL.grassH;
        ctx.fillRect(tx + PX * 2, ty + PX * 3, PX, PX);
        ctx.fillRect(tx + PX * 5, ty + PX * 6, PX, PX);
        ctx.fillStyle = COL.grassS;
        ctx.fillRect(tx + PX * 6, ty + PX * 2, PX, PX * 2);
        ctx.fillRect(tx + PX, ty + PX * 6, PX, PX * 2);
      } else if (kind === 'wood') {
        ctx.fillStyle = COL.woodS; ctx.fillRect(tx, ty + T - PX, T, PX);
        if (alt) { ctx.fillStyle = COL.woodH; ctx.fillRect(tx, ty, T, PX); }
        ctx.fillStyle = COL.woodS; ctx.fillRect(tx + (alt ? T / 2 : 0), ty, PX, T);
      } else if (kind === 'tile') {
        ctx.fillStyle = alt ? COL.wallS : COL.wall; ctx.fillRect(tx, ty, T, T);
        ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(tx, ty, T, PX); ctx.fillRect(tx, ty, PX, T);
      } else if (kind === 'blacktop' || kind === 'sidewalk' || kind === 'road') {
        if (alt) { ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(tx, ty, T, T); }
        ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(tx, ty, T, PX);
      } else if (kind === 'sand') {
        ctx.fillStyle = COL.pathS; ctx.fillRect(tx + PX * 2, ty + PX * 4, PX, PX); ctx.fillRect(tx + PX * 6, ty + PX, PX, PX);
      }
    }
}

// legacy shims
export function oRR(x, y, w, h, r, c) { px(x, y, w, h, c); }
export function oCirc(x, y, r, c) { disc(x, y, r, c); }
export function oEll(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.fillRect(R(x - rx), R(y - ry), R(rx * 2), R(ry * 2)); }
