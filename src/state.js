// state.js — global run state, the morning clock, HUD, toasts, scene plumbing.
import { W, H, text, textWidth, rect, sfx, music, input } from './engine.js';

// --- the morning clock (minutes since midnight) -------------------------
export const START = 6 * 60 + 50;       // 6:50 AM  alarm
export const OUT_DOOR = 7 * 60 + 20;    // 7:20 AM  ideally out the door
export const FENCE_OPEN = 7 * 60 + 35;  // 7:35 AM  staff unlocks the gate
export const FIRST_BELL = 7 * 60 + 47;  // 7:47 AM  line-up bell
export const CLASS = 7 * 60 + 50;       // 7:50 AM  DEADLINE

export function fmtClock(m) {
  m = Math.floor(m);
  let h = Math.floor(m / 60), mm = m % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${mm < 10 ? '0' : ''}${mm} ${ap}`;
}

const BEST_KEY = 'emmie_goes_to_school_best';
function loadBest() {
  try { const v = localStorage.getItem(BEST_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function saveBest(v) { try { localStorage.setItem(BEST_KEY, JSON.stringify(v)); } catch {} }

export const state = {
  parent: 'DAD',
  clock: START,
  running: false,        // is the clock ticking right now?
  ended: false,
  best: loadBest(),      // { spareMin, stars }
};

export function resetRun() {
  state.clock = START;
  state.running = false;
  state.ended = false;
  toasts.length = 0;
}

export function tickClock(dt, ratePerSec) {
  if (state.running && !state.ended) {
    state.clock += dt * ratePerSec;
    music.set((state.clock - START) / (CLASS - START));
  }
}

// Add lost minutes with a floating note. Returns true if this made her late.
export function penalty(mins, note) {
  state.clock += mins;
  addToast(note || `+${mins} MIN`, '#ff5a5a');
  sfx.error();
  return state.clock >= CLASS;
}
export function bonusNote(note) { addToast(note, '#7CFC00'); }

export function isLate() { return state.clock >= CLASS; }

export function finishRun(win) {
  if (state.ended) return;
  state.ended = true;
  state.running = false;
  const spare = Math.round(CLASS - state.clock);
  if (win) {
    const stars = spare >= 8 ? 3 : spare >= 4 ? 2 : 1;
    if (!state.best || spare > state.best.spareMin) { state.best = { spareMin: spare, stars }; saveBest(state.best); }
  }
}

// --- toasts ------------------------------------------------------------
const toasts = [];
export function addToast(msg, color = '#fff') { toasts.push({ msg, color, t: 0, life: 1.6, y: 0 }); }
export function updateToasts(dt) {
  for (const k of toasts) { k.t += dt; k.y -= dt * 14; }
  for (let i = toasts.length - 1; i >= 0; i--) if (toasts[i].t > toasts[i].life) toasts.splice(i, 1);
}
export function drawToasts() {
  let base = 78;
  for (const k of toasts) {
    const a = 1 - k.t / k.life;
    text(k.msg, W / 2, base + k.y, { size: 10, align: 'center', color: k.color });
    void a;
    base += 14;
  }
}

// --- scene manager ---------------------------------------------------
let current = null;
let next = null;
let wipe = 0;          // 0..1 out, then 1..0 in
let wiping = false;
export function setScene(scene, payload) {
  if (wiping) return;
  next = { scene, payload };
  wiping = true;
  wipe = 0;
}
export function currentScene() { return current; }

export function updateSceneManager(dt) {
  if (wiping) {
    if (!next) { // wiping back in
      wipe -= dt * 3.5;
      if (wipe <= 0) { wipe = 0; wiping = false; }
    } else {
      wipe += dt * 3.5;
      if (wipe >= 1) {
        current = next.scene;
        const p = next.payload; next = null;
        if (current.enter) current.enter(p);
      }
    }
  }
}
export function drawWipe() {
  if (wipe <= 0) return;
  const h = Math.ceil(H * wipe);
  rect(0, 0, W, h, '#000');
  rect(0, H - h, W, h, '#000');
}

// --- shared HUD (drawn above every gameplay scene) --------------------
export function drawHUD({ label = '', hint = '' } = {}) {
  rect(0, 0, W, 16, 'rgba(0,0,0,0.55)');
  rect(0, 16, W, 1, '#333');
  const late = state.clock >= FIRST_BELL;
  text(fmtClock(state.clock), 6, 4, { size: 8, color: late ? '#ff5a5a' : '#ffe066' });
  if (label) text(label, W / 2, 4, { size: 8, align: 'center', color: '#9ad' });
  const bell = state.clock >= FIRST_BELL ? 'BELL!' : `bell ${fmtClock(FIRST_BELL).replace(' AM', '')}`;
  text(bell, W - 6, 4, { size: 8, align: 'right', color: state.clock >= FIRST_BELL ? '#ff5a5a' : '#888' });
  if (hint) text(hint, W / 2, H - 12, { size: 7, align: 'center', color: '#cfd8e3' });
}

// --- a simple story/cutscene scene builder --------------------------
export function makeStory(pages, onDone) {
  let i = 0, blink = 0;
  return {
    id: 'story',
    enter() { i = 0; blink = 0; },
    update(dt) {
      blink += dt;
      if (input.pressed('act') || input.pressed('start')) {
        sfx.select();
        i++;
        if (i >= pages.length) onDone();
      }
    },
    draw() {
      rect(0, 0, W, H, '#0b0f1a');
      for (let s = 0; s < 40; s++) rect((s * 71) % W, (s * 43) % H, 1, 1, '#1b2740');
      const p = pages[i] || pages[pages.length - 1];
      const lines = (Array.isArray(p) ? p : [p]).map((l) => (typeof l === 'function' ? l() : l));
      let y = H / 2 - lines.length * 8;
      for (const ln of lines) { text(ln, W / 2, y, { size: 10, align: 'center', color: '#dfe7f5' }); y += 18; }
      if (blink % 1 < 0.6) text('▶ PRESS', W / 2, H - 30, { size: 8, align: 'center', color: '#7CFC00' });
    },
  };
}

export { textWidth };
