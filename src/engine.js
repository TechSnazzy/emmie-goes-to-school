// engine.js — canvas, input, text, loop, math. Sound lives in audio.js.
export const W = 640;
export const H = 360;

// 2D overlay canvas — used only for the title / story / end screens.
// The gameplay view underneath it is the WebGL canvas and is never drawn over.
export const canvas = document.getElementById('ui');
export const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

export function clearOverlay() { ctx.clearRect(0, 0, W, H); }

// --- input: keyboard + on-screen buttons -> logical actions ---------------
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'act', Enter: 'act', KeyJ: 'act', KeyZ: 'act', KeyE: 'act',
};
const held = new Set();
const edgeDown = new Set();

function press(a) { if (!held.has(a)) { held.add(a); edgeDown.add(a); } }
function release(a) { held.delete(a); }

window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, textarea, select, dialog')) return;
  if (e.target.closest?.('button, a') && ['Space', 'Enter'].includes(e.code)) return;
  if (e.repeat) return;
  const a = KEYMAP[e.code];
  if (a) { press(a); e.preventDefault(); }
  if (e.code === 'KeyM') toggleMusicKey();
  if (e.code === 'KeyN') toggleSfxKey();
});
window.addEventListener('keyup', (e) => {
  const a = KEYMAP[e.code];
  if (a) { if (held.has(a)) e.preventDefault(); release(a); }
});
window.addEventListener('blur', () => held.clear());

export const input = {
  down: (a) => held.has(a),
  pressed: (a) => edgeDown.has(a),
  axis: () => ({
    x: (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0),
    y: (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0),
  }),
  anyPressed: () => edgeDown.size > 0,
};
// A click counts as one edge-only "act" press: enough to advance a story
// card, but never registers as a *held* key.
const virtualHeld = [];
export function virtualPress(a) { press(a); virtualHeld.push(a); }
function endFrameInput() {
  edgeDown.clear();
  while (virtualHeld.length) release(virtualHeld.pop());
}
const viewEl = document.getElementById('view');
if (viewEl) viewEl.addEventListener('pointerdown', e => { if (e.target.tagName === 'CANVAS') virtualPress('act'); });

// Touch uses tap-to-walk like the mouse, so the old d-pad is retired.
export function initTouch() {
  const pad = document.getElementById('touch');
  if (pad) pad.remove();
}

// music / sfx toggle hooks — audio.js registers these
let musicToggleCb = () => {}, sfxToggleCb = () => {};
export function onMusicToggle(cb) { musicToggleCb = cb; }
export function onSfxToggle(cb) { sfxToggleCb = cb; }
function toggleMusicKey() { musicToggleCb(); }
function toggleSfxKey() { sfxToggleCb(); }

// --- text ----------------------------------------------------------------
export function text(str, x, y, o = {}) {
  const { size = 12, color = '#fff', align = 'left', shadow = 'rgba(0,0,0,0.55)', weight = '' } = o;
  ctx.font = `${weight} ${size}px "Baloo 2", "Trebuchet MS", system-ui, sans-serif`.trim();
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(str, x + 1.5, y + 1.5); }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}
export function textWidth(str, size = 12, weight = '') {
  ctx.font = `${weight} ${size}px "Baloo 2", "Trebuchet MS", system-ui, sans-serif`.trim();
  return ctx.measureText(str).width;
}

// --- draw helpers -------------------------------------------------------
export function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h)); }
export function rr(x, y, w, h, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
export function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
export function ellipse(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
export function shadowBlob(x, y, rx, a = 0.22) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.42, 0, 0, Math.PI * 2); ctx.fill(); }

// --- loop --------------------------------------------------------------
let last = 0;
export function startLoop(tick) {
  function frame(now) {
    const dt = Math.min(0.04, (now - last) / 1000 || 0);
    last = now;
    tick(dt);
    endFrameInput();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// --- math -------------------------------------------------------------
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const rndi = (a, b) => Math.floor(rnd(a, b));
export const chance = (p) => Math.random() < p;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const now = () => performance.now() / 1000;
