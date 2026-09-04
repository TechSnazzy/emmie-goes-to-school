// sprites.js — readable 3/4 top-down art. Vector shapes with soft outlines,
// two or three shade tones each. Everything is drawn at (x, y) = ground contact
// point, building upward.
import { ctx } from './engine.js';

const OUT = 'rgba(38,26,40,0.9)';
function fillStroke(fill, lw = 2, stroke = OUT) {
  ctx.fillStyle = fill; ctx.fill();
  if (lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function rrp(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
export function oRR(x, y, w, h, r, fill, lw) { rrp(x, y, w, h, r); fillStroke(fill, lw); }
export function oCirc(x, y, r, fill, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); fillStroke(fill, lw); }
export function oEll(x, y, rx, ry, fill, lw) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); fillStroke(fill, lw); }
function poly(pts, fill, lw) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); fillStroke(fill, lw); }
function shad(x, y, rx) { ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.4, 0, 0, 7); ctx.fillStyle = 'rgba(0,0,0,0.20)'; ctx.fill(); }

export const PAL = {
  emmieHair: '#7a4a24', emmieHairD: '#5f3818',
  skin: '#ffd9b8', skinD: '#e9b78f',
  skin2: '#f1c7a0',
  hoodie: '#ff5aa8', hoodieD: '#d63f88',
  leggings: '#4b60d6', legD: '#3547a8',
  momHair: '#8a5a2c', momTop: '#e0556b', momTopD: '#b83f54',
  dadHair: '#3a2a1c', dadTop: '#3f9d6d', dadTopD: '#2e7d54',
  jeans: '#5a6b86', jeansD: '#44536b',
  cat: '#20202a', catD: '#141420', catEye: '#7CFC00',
  teslaBody: '#f2f3f6', teslaD: '#d3d6de', glass: '#2b3550',
  grass: '#7bc46b', grassD: '#5aa64f',
  path: '#d8c39a', pathD: '#c2a97c',
  wood: '#b07f4a', woodD: '#8a6038',
  wall: '#efe4d2', wallD: '#d8c8ae',
};

// ---------------------------------------------------------------------
// People
// ---------------------------------------------------------------------
export function drawPerson(x, y, o = {}) {
  const {
    dir = 'down', anim = 0, moving = false, h = 34,
    hair = PAL.emmieHair, hairD = PAL.emmieHairD, skin = PAL.skin,
    top = PAL.hoodie, topD = PAL.hoodieD, bottom = PAL.leggings, bottomD = PAL.legD,
    ponytail = false, backpack = null, wave = 0,
  } = o;
  shad(x, y + 1, h * 0.34);
  const swing = moving ? Math.sin(anim * Math.PI) * (h * 0.10) : 0;
  const headR = h * 0.21;
  const hcy = y - h + headR;
  const torsoTop = hcy + headR * 0.7;
  const torsoBot = y - h * 0.34;
  const tw = h * 0.42;
  const side = dir === 'left' ? -1 : 1;

  // backpack behind the body when facing camera / sideways
  if (backpack && dir !== 'up') {
    const bx = dir === 'down' ? x : x - side * tw * 0.5;
    oRR(bx - tw * 0.5, torsoTop - 2, tw, torsoBot - torsoTop + 6, 5, backpack);
  }

  // legs
  ctx.save();
  if (dir === 'left' || dir === 'right') {
    oRR(x - 4, torsoBot - 2, 7, y - torsoBot + swing, 3, bottom);
    oRR(x - 4, torsoBot - 2, 7, y - torsoBot - swing, 3, bottomD);
  } else {
    oRR(x - tw * 0.42, torsoBot - 2, tw * 0.4, y - torsoBot + swing, 3, bottom);
    oRR(x + tw * 0.02, torsoBot - 2, tw * 0.4, y - torsoBot - swing, 3, bottom);
  }
  ctx.restore();
  // shoes
  const shoe = '#f4f4f4';
  if (dir === 'left' || dir === 'right') { oEll(x + side * 2, y + swing, 6, 3, shoe); oEll(x - side * 1, y - swing, 6, 3, shoe); }
  else { oEll(x - tw * 0.22, y + swing, 5, 3, shoe); oEll(x + tw * 0.22, y - swing, 5, 3, shoe); }

  // torso
  oRR(x - tw / 2, torsoTop, tw, torsoBot - torsoTop + 4, 6, top);
  ctx.save(); ctx.beginPath(); rrp(x - tw / 2, torsoTop, tw, torsoBot - torsoTop + 4, 6); ctx.clip();
  ctx.fillStyle = topD; ctx.fillRect(x + (dir === 'left' ? -tw / 2 : tw / 6), torsoTop, tw / 3, torsoBot - torsoTop + 6);
  ctx.restore();

  // arms
  const armY = torsoTop + 3;
  const armH = (torsoBot - torsoTop) * 0.9;
  if (dir === 'up' || dir === 'down') {
    oRR(x - tw / 2 - 3, armY - swing * 0.6, 5, armH, 3, top);
    oRR(x + tw / 2 - 2, armY + swing * 0.6, 5, armH, 3, top);
  } else {
    oRR(x - 2, armY + Math.abs(swing) * 0.5, 5, armH, 3, topD);
  }
  if (wave) { // raised hand
    oRR(x + tw / 2 - 2, armY - armH * 0.7, 5, armH * 0.8, 3, top);
    oCirc(x + tw / 2 + 1, armY - armH * 0.7, 3.5, skin);
  }

  // head
  oCirc(x, hcy, headR, skin);
  // hair
  ctx.save(); ctx.beginPath(); ctx.arc(x, hcy, headR + 1.5, 0, 7); ctx.clip();
  if (dir === 'up') { oRR(x - headR - 2, hcy - headR - 2, headR * 2 + 4, headR * 2, 6, hair); }
  else { oRR(x - headR - 2, hcy - headR - 3, headR * 2 + 4, headR * 1.5, 6, hair); }
  ctx.restore();
  if (ponytail) {
    if (dir === 'down') oEll(x, hcy - headR - 3, 4, 6, hairD);
    else if (dir === 'up') oEll(x, hcy + headR * 0.3, 5, 9, hairD);
    else oEll(x - side * (headR + 2), hcy, 4, 7, hairD);
  }
  // face
  if (dir !== 'up') {
    const ex = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    oCirc(x - 3 + ex * 3, hcy + 1, 1.4, '#2a2030', 0);
    oCirc(x + 3 + ex * 3, hcy + 1, 1.4, '#2a2030', 0);
    ctx.beginPath(); ctx.arc(x + ex * 2, hcy + headR * 0.45, 2.4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = '#c96'; ctx.lineWidth = 1.4; ctx.stroke();
  }
}

export const drawEmmie = (x, y, o = {}) => drawPerson(x, y, { h: 32, ponytail: true, backpack: o.backpack, hair: PAL.emmieHair, hairD: PAL.emmieHairD, top: PAL.hoodie, topD: PAL.hoodieD, bottom: PAL.leggings, bottomD: PAL.legD, ...o });
export const drawMom = (x, y, o = {}) => drawPerson(x, y, { h: 44, hair: PAL.momHair, hairD: '#6a4420', top: PAL.momTop, topD: PAL.momTopD, bottom: PAL.jeans, bottomD: PAL.jeansD, ponytail: true, ...o });
export const drawDad = (x, y, o = {}) => drawPerson(x, y, { h: 48, hair: PAL.dadHair, hairD: '#241a10', top: PAL.dadTop, topD: PAL.dadTopD, bottom: PAL.jeans, bottomD: PAL.jeansD, ...o });
export const drawParentBy = (type, x, y, o = {}) => (type === 'DAD' ? drawDad : drawMom)(x, y, o);
export function drawKid(x, y, o = {}) {
  const c = o.color || '#e6883c';
  drawPerson(x, y, { h: 30, hair: '#3a2a1c', hairD: '#241a10', top: c, topD: c, bottom: '#556', bottomD: '#445', ...o });
}
export function drawTeacher(x, y, o = {}) {
  drawPerson(x, y, { h: 46, hair: '#5a3a22', hairD: '#402a18', top: '#8e6fc7', topD: '#6f52a0', bottom: '#4a4a5a', bottomD: '#3a3a48', ponytail: true, ...o });
}

// ---------------------------------------------------------------------
// Milo the cat
// ---------------------------------------------------------------------
export function drawCat(x, y, o = {}) {
  const { dir = 'down', anim = 0, moving = false, sitting = false } = o;
  shad(x, y + 1, 12);
  if (sitting) {
    oEll(x, y - 6, 9, 8, PAL.cat);
    oRR(x + 7, y - 20, 4, 16, 2, PAL.cat);           // tail up-curl
    oCirc(x, y - 15, 7, PAL.cat);                    // head
    poly([[x - 6, y - 20], [x - 2, y - 14], [x - 8, y - 13]], PAL.cat);
    poly([[x + 6, y - 20], [x + 2, y - 14], [x + 8, y - 13]], PAL.cat);
    oCirc(x - 3, y - 15, 1.5, PAL.catEye, 0);
    oCirc(x + 3, y - 15, 1.5, PAL.catEye, 0);
    return;
  }
  const bob = moving ? Math.sin(anim * Math.PI) * 1.5 : 0;
  oEll(x, y - 6 + bob, 12, 6, PAL.cat);              // body
  const hx = dir === 'left' ? x - 10 : dir === 'right' ? x + 10 : x;
  const hy = dir === 'up' ? y - 12 : y - 8;
  oCirc(hx, hy + bob, 5.5, PAL.cat);                 // head
  poly([[hx - 5, hy - 6], [hx - 1, hy - 1], [hx - 7, hy]], PAL.cat);
  poly([[hx + 5, hy - 6], [hx + 1, hy - 1], [hx + 7, hy]], PAL.cat);
  if (dir !== 'up') { oCirc(hx - 2, hy + bob, 1.2, PAL.catEye, 0); oCirc(hx + 2, hy + bob, 1.2, PAL.catEye, 0); }
  oRR(x - 14, y - 10, 5, 4, 2, PAL.cat);             // tail
}

// ---------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------
export function drawTesla(x, y, o = {}) {
  const { dir = 'down' } = o;
  shad(x, y + 2, 40);
  const vertical = dir === 'down' || dir === 'up';
  if (vertical) {
    oRR(x - 22, y - 54, 44, 54, 16, PAL.teslaBody);
    oRR(x - 18, y - 46, 36, 20, 10, PAL.glass);       // windshield area
    oRR(x - 16, y - 24, 32, 14, 8, PAL.teslaD);
    oRR(x - 24, y - 44, 5, 14, 2, '#111'); oRR(x + 19, y - 44, 5, 14, 2, '#111');
    oRR(x - 24, y - 16, 5, 14, 2, '#111'); oRR(x + 19, y - 16, 5, 14, 2, '#111');
    if (dir === 'down') { oRR(x - 16, y - 6, 8, 4, 2, '#ffe9a8'); oRR(x + 8, y - 6, 8, 4, 2, '#ffe9a8'); }
  } else {
    const s = dir === 'left' ? -1 : 1;
    oRR(x - 34, y - 24, 68, 24, 12, PAL.teslaBody);
    oRR(x - 18, y - 34, 34, 16, 8, PAL.teslaBody);
    oRR(x - 14, y - 31, 26, 12, 5, PAL.glass);
    oCirc(x - 18, y, 7, '#111'); oCirc(x + 18, y, 7, '#111');
    oRR(x + s * 30 - 4, y - 20, 6, 5, 2, '#ffe9a8');
  }
}
export function drawCar(x, y, color = '#c94f4f', o = {}) {
  const { dir = 'down' } = o;
  shad(x, y + 2, 30);
  if (dir === 'down' || dir === 'up') {
    oRR(x - 18, y - 44, 36, 44, 12, color);
    oRR(x - 14, y - 36, 28, 16, 7, PAL.glass);
    oRR(x - 13, y - 16, 26, 12, 6, color);
    oRR(x - 20, y - 36, 4, 12, 2, '#111'); oRR(x + 16, y - 36, 4, 12, 2, '#111');
    oRR(x - 20, y - 12, 4, 12, 2, '#111'); oRR(x + 16, y - 12, 4, 12, 2, '#111');
  } else {
    oRR(x - 28, y - 20, 56, 20, 10, color);
    oRR(x - 14, y - 30, 28, 14, 7, PAL.glass);
    oCirc(x - 15, y, 6, '#111'); oCirc(x + 15, y, 6, '#111');
  }
}

// ---------------------------------------------------------------------
// Nature / outdoor props
// ---------------------------------------------------------------------
export function drawTree(x, y, s = 1) {
  shad(x, y + 2, 22 * s);
  oRR(x - 5 * s, y - 26 * s, 10 * s, 28 * s, 4, PAL.wood);
  oCirc(x - 12 * s, y - 34 * s, 15 * s, PAL.grassD);
  oCirc(x + 12 * s, y - 34 * s, 15 * s, PAL.grassD);
  oCirc(x, y - 46 * s, 17 * s, PAL.grass);
  oCirc(x - 6 * s, y - 40 * s, 12 * s, PAL.grass);
  ctx.beginPath(); ctx.arc(x + 4 * s, y - 50 * s, 8 * s, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill();
}
export function drawBush(x, y, s = 1) {
  shad(x, y + 1, 16 * s);
  oCirc(x - 9 * s, y - 6 * s, 10 * s, PAL.grassD);
  oCirc(x + 9 * s, y - 6 * s, 10 * s, PAL.grassD);
  oCirc(x, y - 12 * s, 12 * s, PAL.grass);
}
export function drawBench(x, y) {
  shad(x, y + 1, 26);
  oRR(x - 24, y - 6, 48, 5, 2, PAL.wood);
  oRR(x - 24, y - 18, 48, 5, 2, PAL.woodD);
  oRR(x - 22, y - 6, 4, 8, 1, '#555'); oRR(x + 18, y - 6, 4, 8, 1, '#555');
}
export function drawPond(x, y, w = 90, h = 44) {
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 7);
  ctx.fillStyle = '#5fb6d6'; ctx.fill(); ctx.strokeStyle = '#3f96b6'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - h * 0.12, w * 0.22, h * 0.14, 0, 0, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
}
export function drawMailbox(x, y) {
  shad(x, y + 1, 8);
  oRR(x - 2, y - 22, 4, 22, 1, PAL.woodD);
  oRR(x - 8, y - 30, 16, 10, 4, '#4a7fb5');
  oRR(x + 6, y - 28, 3, 6, 1, '#c0392b');
}
export function drawCloud(x, y, s = 1) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  [[0, 0, 16], [16, 4, 13], [-15, 4, 12], [4, -8, 12]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill(); });
}
export function drawDog(x, y, o = {}) {
  const dir = o.dir || 'right'; const s = dir === 'left' ? -1 : 1;
  shad(x, y + 1, 12);
  oEll(x, y - 6, 11, 6, '#c8925a');
  oCirc(x + s * 10, y - 9, 5, '#c8925a');
  poly([[x + s * 12, y - 15], [x + s * 8, y - 9], [x + s * 15, y - 10]], '#a5763f');
  oRR(x + s * 13, y - 8, 3, 2, 1, '#3a2a1a');
  oRR(x - s * 11, y - 9, 5, 3, 2, '#c8925a');
  oRR(x - 5, y - 3, 3, 4, 1, '#a5763f'); oRR(x + 4, y - 3, 3, 4, 1, '#a5763f');
}
export function drawSquirrel(x, y) {
  shad(x, y + 1, 7);
  oEll(x, y - 4, 6, 4, '#8a6a4a');
  oCirc(x + 5, y - 7, 3.5, '#8a6a4a');
  ctx.beginPath(); ctx.moveTo(x - 5, y - 3); ctx.quadraticCurveTo(x - 14, y - 12, x - 5, y - 16);
  ctx.quadraticCurveTo(x - 2, y - 8, x - 3, y - 3); ctx.closePath(); fillStroke('#a5825c');
}
export function drawPuddle(x, y, r = 16) {
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.5, 0, 0, 7);
  ctx.fillStyle = 'rgba(120,190,225,0.85)'; ctx.fill();
  ctx.strokeStyle = 'rgba(90,160,200,0.9)'; ctx.lineWidth = 2; ctx.stroke();
}

// ---------------------------------------------------------------------
// Buildings / fences
// ---------------------------------------------------------------------
export function drawFence(x, y, len) {
  // green metal picket fence — reads clearly at a glance
  oRR(x, y - 28, len, 5, 2, '#4f7a52');            // top rail
  oRR(x, y - 8, len, 5, 2, '#4f7a52');             // bottom rail
  for (let i = 3; i < len; i += 9) {
    oRR(x + i, y - 34, 4, 34, 2, '#5c8a5f');
    ctx.fillStyle = '#7fae7f'; ctx.fillRect(x + i, y - 34, 1.5, 34);
  }
  oRR(x - 3, y - 40, 7, 40, 2, '#3f6a42');         // post
}
export function drawGate(x, y, open = 0) {
  ctx.save();
  ctx.translate(x, y - 34);
  ctx.rotate(-open * 1.1);
  oRR(0, 0, 4, 34, 1, '#7a8692');
  oRR(0, 2, 40, 6, 2, '#8d99ae');
  oRR(0, 26, 40, 6, 2, '#8d99ae');
  for (let i = 4; i < 40; i += 8) oRR(i, 2, 3, 30, 1, '#8d99ae');
  ctx.restore();
  oRR(x + 40, y - 34, 5, 34, 1, '#7a8692');
}
export function drawSchoolBuilding(x, y, w, h) {
  oRR(x, y - h, w, h, 6, '#c26b52');
  for (let ix = x + 14; ix < x + w - 16; ix += 30)
    for (let iy = y - h + 16; iy < y - 34; iy += 34) { oRR(ix, iy, 18, 20, 3, '#bfe0ee'); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(ix + 2, iy + 2, 6, 16); }
  oRR(x + w / 2 - 18, y - 34, 36, 34, 3, '#6a4a30');           // doors
  oRR(x + w / 2 - 2, y - 34, 4, 34, 0, '#4a3020');
  oRR(x - 4, y - h - 8, w + 8, 12, 3, '#9a4a38');              // roof lip
  oRR(x + w / 2 - 30, y - h - 2, 60, 16, 3, '#f4f0e4');        // sign
  ctx.fillStyle = '#c26b52'; ctx.font = '700 11px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SCHOOL', x + w / 2, y - h + 6);
}
export function drawFlagpole(x, y) {
  shad(x, y + 1, 6);
  oRR(x - 1.5, y - 60, 3, 60, 1, '#b8b8c0');
  oRR(x + 1.5, y - 60, 22, 14, 1, '#c0392b');
  oRR(x + 1.5, y - 60, 22, 5, 1, '#eee');
}

// ---------------------------------------------------------------------
// Indoor props
// ---------------------------------------------------------------------
export function drawBed(x, y, w = 70, d = 96) {
  shad(x, y + 2, w * 0.6);
  oRR(x - w / 2, y - d, w, d, 8, '#c98a8a');           // mattress (foot at y)
  oRR(x - w / 2, y - d, w, 30, 8, '#e8e8f0');          // pillow zone
  oRR(x - w / 2 + 6, y - d + 6, w - 12, 16, 6, '#fff');
  oRR(x - w / 2, y - d + 34, w, d - 34, 8, '#7aa0d6'); // blanket
  oRR(x - w / 2 - 3, y - d - 10, w + 6, 14, 4, '#8a6038'); // headboard
}
export function drawDresser(x, y, w = 60) {
  shad(x, y + 1, w * 0.6);
  oRR(x - w / 2, y - 44, w, 44, 5, PAL.wood);
  for (let r = 0; r < 3; r++) { oRR(x - w / 2 + 5, y - 40 + r * 13, w - 10, 10, 3, PAL.woodD); oCirc(x, y - 35 + r * 13, 2, '#3a2a1a'); }
}
export function drawNightstand(x, y) {
  shad(x, y + 1, 16);
  oRR(x - 12, y - 22, 24, 22, 4, PAL.wood);
  oRR(x - 6, y - 40, 12, 8, 3, '#f4d98a');            // lamp shade
  oRR(x - 1.5, y - 32, 3, 10, 1, '#9a8a6a');
}
export function drawRug(x, y, w = 100, h = 60, c = '#e0b25a') {
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 7);
  ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = '#c2933f'; ctx.lineWidth = 4; ctx.stroke();
}
export function drawWindow(x, y, w = 46) {
  oRR(x - w / 2, y - 34, w, 34, 3, '#bfe0ee');
  oRR(x - w / 2 - 3, y - 37, w + 6, 5, 2, PAL.wallD);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x, y); ctx.moveTo(x - w / 2, y - 17); ctx.lineTo(x + w / 2, y - 17); ctx.stroke();
  oRR(x - w / 2 - 5, y - 40, 6, 44, 2, '#d66'); oRR(x + w / 2 - 1, y - 40, 6, 44, 2, '#d66'); // curtains
}
export function drawDoor(x, y, w = 30, open = false, c = '#8a6038') {
  oRR(x - w / 2 - 3, y - 52, w + 6, 52, 3, PAL.wallD);
  if (open) { oRR(x - w / 2, y - 48, w, 48, 2, '#2a2a33'); }
  else { oRR(x - w / 2, y - 48, w, 48, 2, c); oCirc(x + w / 2 - 5, y - 24, 2.2, '#f4d98a'); }
}
export function drawLightSwitch(x, y, on) {
  oRR(x - 4, y - 8, 8, 14, 2, '#f0ead8');
  oRR(x - 2, y - (on ? 6 : 2), 4, 5, 1, on ? '#ffd34d' : '#9a9a9a');
}
export function drawToilet(x, y) {
  shad(x, y + 1, 16);
  oEll(x, y - 10, 12, 9, '#fbfbff');
  oRR(x - 10, y - 34, 20, 22, 5, '#fbfbff');
  oEll(x, y - 12, 9, 6, '#cfe4f0');
}
export function drawSink(x, y) {
  shad(x, y + 1, 18);
  oRR(x - 16, y - 26, 32, 26, 4, '#e8ecf2');
  oEll(x, y - 24, 11, 5, '#cfd8e2');
  oRR(x - 2, y - 34, 4, 10, 1, '#b8c0cc');
  oRR(x - 18, y - 52, 36, 20, 3, '#bfe0ee');           // mirror
}
export function drawCouch(x, y, w = 90) {
  shad(x, y + 1, w * 0.55);
  oRR(x - w / 2, y - 34, w, 34, 8, '#5f8f7a');
  oRR(x - w / 2, y - 44, w, 16, 8, '#6f9f8a');
  oRR(x - w / 2 - 6, y - 40, 12, 34, 5, '#4f7f6a');
  oRR(x + w / 2 - 6, y - 40, 12, 34, 5, '#4f7f6a');
}
export function drawTV(x, y) {
  oRR(x - 30, y - 40, 60, 36, 3, '#20242e');
  oRR(x - 27, y - 37, 54, 30, 2, '#3a5b7a');
  oRR(x - 8, y - 4, 16, 4, 1, '#20242e');
}
export function drawTable(x, y, w = 46) {
  shad(x, y + 1, w * 0.55);
  oRR(x - w / 2, y - 16, w, 8, 3, PAL.wood);
  oRR(x - w / 2 + 3, y - 8, 4, 8, 1, PAL.woodD); oRR(x + w / 2 - 7, y - 8, 4, 8, 1, PAL.woodD);
}
export function drawCoatRack(x, y) {
  oRR(x - 26, y - 44, 52, 6, 2, PAL.woodD);
  for (let i = -18; i <= 18; i += 18) oCirc(x + i, y - 34, 2.5, '#d0d0d0');
  oRR(x - 20, y - 40, 16, 22, 4, '#c0392b');           // a hanging coat
  oRR(x + 4, y - 40, 16, 20, 4, '#3f6fae');
}
export function drawBackpack(x, y, c = '#7b3ff2') {
  oRR(x - 8, y - 16, 16, 18, 5, c);
  oRR(x - 6, y - 10, 12, 8, 3, 'rgba(0,0,0,0.18)');
  oRR(x - 9, y - 15, 3, 12, 2, c); oRR(x + 6, y - 15, 3, 12, 2, c);
}
export function drawLunchbox(x, y, c = '#ff4d4d') {
  oRR(x - 8, y - 10, 16, 12, 3, c);
  oRR(x - 8, y - 12, 16, 4, 2, 'rgba(0,0,0,0.25)');
  oRR(x - 3, y - 15, 6, 4, 2, '#888');
}
export function drawCubbies(x, y, w = 130) {
  shad(x, y + 1, w * 0.55);
  oRR(x - w / 2, y - 70, w, 70, 4, PAL.wood);
  for (let cx = x - w / 2 + 6; cx < x + w / 2 - 20; cx += (w - 12) / 4) {
    oRR(cx, y - 64, (w - 12) / 4 - 4, 30, 3, '#e9dcc4');   // upper cubby
    oCirc(cx + ((w - 12) / 4 - 4) / 2, y - 30, 2.5, '#c0c0c0'); // hook
  }
  oRR(x - w / 2 + 4, y - 30, w - 8, 2, 0, PAL.woodD);
}
export function drawLunchBin(x, y) {
  shad(x, y + 1, 26);
  oRR(x - 22, y - 22, 44, 22, 4, '#3f8fd0');
  oRR(x - 22, y - 26, 44, 6, 3, '#357abb');
  ctx.fillStyle = '#fff'; ctx.font = '700 9px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('LUNCH', x, y - 11);
}
export function drawLockers(x, y, len) {
  oRR(x, y - 44, len, 44, 3, '#5f7f9a');
  for (let i = 0; i < len; i += 16) { oRR(x + i + 2, y - 42, 12, 40, 2, '#6f8faa'); oCirc(x + i + 8, y - 22, 1.6, '#2a3540'); }
}
export function drawCart(x, y) {
  shad(x, y + 1, 16);
  oRR(x - 14, y - 24, 28, 22, 4, '#9aa4ad');
  oRR(x - 14, y - 24, 28, 6, 3, '#b8c0c8');
  oRR(x - 12, y - 4, 4, 4, 1, '#333'); oRR(x + 8, y - 4, 4, 4, 1, '#333');
  oRR(x + 12, y - 30, 3, 14, 1, '#6a747d');
}
export function drawTrashCan(x, y) {
  shad(x, y + 1, 10);
  oRR(x - 8, y - 20, 16, 20, 3, '#4a6a4a');
  oRR(x - 10, y - 22, 20, 4, 2, '#3a5a3a');
}
export function drawClassDoor(x, y, label = '') {
  oRR(x - 22, y - 60, 44, 60, 4, PAL.wallD);
  oRR(x - 17, y - 54, 34, 54, 3, '#6a4a30');
  oRR(x - 12, y - 48, 24, 16, 2, '#bfe0ee');
  oCirc(x + 12, y - 26, 2, '#f4d98a');
  if (label) {
    oRR(x - 16, y - 74, 32, 12, 3, '#f4f0e4');
    ctx.fillStyle = '#2a7d46'; ctx.font = '700 9px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - 68);
  }
}
export function drawSun(x, y, r = 14) {
  ctx.save();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,211,77,0.6)'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3)); ctx.lineTo(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8)); ctx.stroke(); }
  ctx.restore();
}

// tiled ground fill — a soft checker, no harsh lines
export function ground(color, dark, cell, camX, camY, w, h) {
  ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = dark;
  const ox = -(((camX % (cell * 2)) + cell * 2) % (cell * 2));
  const oy = -(((camY % (cell * 2)) + cell * 2) % (cell * 2));
  for (let y = oy, r = 0; y < h; y += cell, r++)
    for (let x = ox + (r % 2 ? cell : 0); x < w; x += cell * 2) ctx.fillRect(x, y, cell, cell);
  ctx.restore();
}
