// sprites.js — all procedural pixel art. Everything is drawn from rectangles so
// there are no image assets to load.
import { ctx, rect } from './engine.js';

const P = (x, y, w, h, c) => rect(x, y, w, h, c);

export const PALETTE = {
  emmieHair: '#6b3d1f',
  emmieHairHi: '#8a5326',
  emmieSkin: '#ffd9b8',
  emmieHoodie: '#ff5aa8',   // pink hoodie
  emmieHoodieHi: '#ff88c2',
  emmiePants: '#3a5bd9',
  dadShirt: '#2e8b57',
  dadHair: '#3b2a1a',
  momShirt: '#c0392b',
  momHair: '#5a3a22',
  parentSkin: '#f0c49a',
  jeans: '#33415c',
  cat: '#181818',
  catHi: '#2c2c2c',
  catEye: '#7CFC00',
  teslaBody: '#f4f4f6',
  teslaGlass: '#25304a',
  teslaShadow: '#c9c9d4',
};

// facing: 1 = right, -1 = left. frame toggles a walk cycle.
export function drawEmmie(x, y, { facing = 1, frame = 0, hoodie = PALETTE.emmieHoodie, sleeping = false } = {}) {
  x |= 0; y |= 0;
  const f = facing;
  if (sleeping) {
    // lying down under a blanket
    P(x - 10, y + 4, 22, 6, '#b7c7e6');
    P(x - 10, y + 2, 8, 4, PALETTE.emmieSkin);
    P(x - 12, y, 6, 6, PALETTE.emmieHair);
    P(x + 8, y - 2, 3, 3, '#fff'); // Zzz
    return;
  }
  const legSwing = frame ? 2 : -2;
  // legs
  P(x - 3, y + 8, 3, 6, PALETTE.emmiePants);
  P(x + 1, y + 8, 3, 6, PALETTE.emmiePants);
  P(x - 3 + (frame ? -1 : 0), y + 13, 4, 2, '#e8e8e8'); // shoes
  P(x + 1 + (frame ? 0 : 1), y + 13, 4, 2, '#e8e8e8');
  // body / hoodie
  P(x - 4, y, 9, 9, hoodie);
  P(x - 4, y, 9, 2, '#00000022');
  // arms
  P(x - 6, y + 1, 2, 6, hoodie);
  P(x + 5, y + 1, 2, 6, hoodie);
  P(x - 6, y + 6, 2, 2, PALETTE.emmieSkin);
  P(x + 5, y + 6, 2, 2, PALETTE.emmieSkin);
  // head
  P(x - 3, y - 7, 7, 7, PALETTE.emmieSkin);
  // hair + ponytail
  P(x - 4, y - 8, 9, 3, PALETTE.emmieHair);
  P(x - 4, y - 7, 2, 5, PALETTE.emmieHair);
  P(x + 3, y - 7, 2, 5, PALETTE.emmieHair);
  P(x - 6 * f - (f > 0 ? 0 : -8), y - 6, 2, 6, PALETTE.emmieHairHi); // ponytail trailing behind
  // eyes
  P(x + (f > 0 ? 1 : -1), y - 4, 1, 2, '#222');
}

export function drawParent(x, y, { type = 'DAD', facing = 1, frame = 0 } = {}) {
  x |= 0; y |= 0;
  const shirt = type === 'DAD' ? PALETTE.dadShirt : PALETTE.momShirt;
  const hair = type === 'DAD' ? PALETTE.dadHair : PALETTE.momHair;
  const tall = type === 'DAD' ? 2 : 0;
  // legs
  P(x - 4, y + 11, 4, 8 + tall, PALETTE.jeans);
  P(x + 1, y + 11, 4, 8 + tall, PALETTE.jeans);
  P(x - 5, y + 18 + tall, 5, 2, '#3a2a1a');
  P(x + 1, y + 18 + tall, 5, 2, '#3a2a1a');
  // torso
  P(x - 5, y, 11, 12 + tall, shirt);
  P(x - 7, y + 1, 2, 9, shirt);
  P(x + 6, y + 1, 2, 9, shirt);
  P(x - 7, y + 9, 2, 3, PALETTE.parentSkin);
  P(x + 6, y + 9, 2, 3, PALETTE.parentSkin);
  // head
  P(x - 4, y - 8, 9, 8, PALETTE.parentSkin);
  P(x - 5, y - 10, 11, 4, hair);
  if (type === 'MOM') { P(x - 6, y - 6, 2, 8, hair); P(x + 5, y - 6, 2, 8, hair); }
  P(x + (facing > 0 ? 2 : -2), y - 5, 1, 2, '#222');
}

export function drawCat(x, y, { frame = 0, sitting = false, facing = 1 } = {}) {
  x |= 0; y |= 0;
  if (sitting) {
    P(x - 5, y + 2, 10, 8, PALETTE.cat);         // body
    P(x - 5, y - 6, 7, 9, PALETTE.cat);          // head/chest
    P(x - 5, y - 9, 2, 3, PALETTE.cat);          // ears
    P(x - 1, y - 9, 2, 3, PALETTE.cat);
    P(x + 4, y - 2, 2, 10, PALETTE.cat);         // tail curl
    P(x + 4, y + 8, 3, 2, PALETTE.cat);
    P(x - 4, y - 3, 1, 1, PALETTE.catEye);
    P(x - 1, y - 3, 1, 1, PALETTE.catEye);
    return;
  }
  const bob = frame ? 1 : 0;
  P(x - 7, y + bob, 14, 6, PALETTE.cat);          // body
  P(x + 6 * facing, y - 4 + bob, 5, 6, PALETTE.cat); // head
  P(x + 6 * facing, y - 7 + bob, 2, 3, PALETTE.cat); // ear
  P(x + 9 * facing, y - 7 + bob, 2, 3, PALETTE.cat);
  P(x + 8 * facing, y - 2 + bob, 1, 1, PALETTE.catEye);
  P(x - 9 * facing, y - 2, 3, 2, PALETTE.cat);    // tail
  P(x - 5, y + 6 + bob, 2, 3, PALETTE.cat);       // legs
  P(x + 2, y + 6 + (frame ? 0 : 1), 2, 3, PALETTE.cat);
}

export function drawTesla(x, y, { facing = 1 } = {}) {
  x |= 0; y |= 0;
  P(x - 26, y + 4, 52, 12, PALETTE.teslaBody);      // lower body
  P(x - 16, y - 8, 34, 14, PALETTE.teslaBody);      // cabin
  P(x - 13, y - 6, 12, 9, PALETTE.teslaGlass);      // windows
  P(x + 2, y - 6, 12, 9, PALETTE.teslaGlass);
  P(x - 26, y + 14, 52, 3, PALETTE.teslaShadow);
  P(x - 18, y + 14, 8, 6, '#111');                  // wheels
  P(x + 10, y + 14, 8, 6, '#111');
  P(x - 17, y + 15, 6, 4, '#444');
  P(x + 11, y + 15, 6, 4, '#444');
  P(x + (facing > 0 ? 24 : -26), y + 6, 2, 4, '#ffdf6b'); // headlight
}

// --- environment props ---------------------------------------------------
export function drawTree(x, y, s = 1) {
  x |= 0; y |= 0;
  P(x - 3 * s, y - 10 * s, 6 * s, 12 * s, '#5b3a1e');
  P(x - 14 * s, y - 26 * s, 28 * s, 20 * s, '#2f7d32');
  P(x - 10 * s, y - 34 * s, 20 * s, 12 * s, '#3a9440');
  P(x - 6 * s, y - 40 * s, 12 * s, 10 * s, '#43a047');
}
export function drawBench(x, y) {
  x |= 0; y |= 0;
  P(x, y, 26, 3, '#8a5a2b');
  P(x, y - 8, 26, 3, '#a06a35');
  P(x + 2, y, 3, 8, '#5b3a1e');
  P(x + 21, y, 3, 8, '#5b3a1e');
}
export function drawFence(x, y, h = 34, open = false) {
  x |= 0; y |= 0;
  // posts
  P(x, y - h, 4, h, '#8d99ae');
  if (!open) {
    for (let i = 6; i < 40; i += 8) P(x + i, y - h, 3, h, '#8d99ae');
    P(x, y - h + 6, 44, 3, '#8d99ae');
    P(x, y - 6, 44, 3, '#8d99ae');
  } else {
    P(x + 40, y - h, 4, h, '#8d99ae'); // swung-open gate leaf hinted at edge
  }
}
export function drawSchoolWall(x, y, w, h) {
  P(x, y, w, h, '#c98a5b');
  for (let i = 0; i < h; i += 6) P(x, y + i, w, 1, '#00000018');
  for (let i = 0; i < w; i += 12) P(x + i, y, 1, h, '#00000018');
}
export function drawBackpackRack(x, y) {
  x |= 0; y |= 0;
  P(x, y, 60, 4, '#7a5c3a');
  for (let i = 6; i < 60; i += 12) { P(x + i, y + 4, 2, 3, '#b0b0b0'); P(x + i - 1, y + 6, 4, 2, '#b0b0b0'); }
}
export function drawBackpack(x, y, c = '#7b2ff7') {
  x |= 0; y |= 0;
  P(x, y, 10, 12, c);
  P(x + 1, y + 3, 8, 5, '#00000030');
  P(x - 1, y + 1, 2, 8, c);
  P(x + 9, y + 1, 2, 8, c);
}
export function drawLunchbox(x, y, c = '#ff3b3b') {
  x |= 0; y |= 0;
  P(x, y, 9, 7, c);
  P(x, y - 2, 9, 2, '#00000040');
  P(x + 3, y - 4, 3, 3, '#888');
}
export function drawLunchRack(x, y) {
  x |= 0; y |= 0;
  P(x, y, 40, 16, '#9aa0a6');
  P(x, y, 40, 2, '#c2c6cc');
  for (let i = 4; i < 40; i += 10) P(x + i, y + 2, 1, 12, '#6b6f75');
  P(x, y + 8, 40, 1, '#6b6f75');
}

// Round shadow under a character
export function shadow(x, y, w = 12) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}
