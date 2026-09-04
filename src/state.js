// state.js — morning progress (no fail state), objectives + HUD, scene manager.
import { W, H, ctx, rect, rr, text, input, clamp, circle } from './engine.js';
import { sfx } from './audio.js';
import { drawSun } from './sprites.js';

// --- progress: fills as the morning goes; NEVER causes a loss --------
const PAR = 165;            // seconds of play for a calm, unhurried run
export const state = {
  parent: 'DAD',
  elapsed: 0,
  running: false,
  ended: false,
  best: loadBest(),
  objective: '',
  checklist: [],
  sceneTitle: '',
};

function loadBest() { try { const v = localStorage.getItem('emmie_best_v2'); return v ? JSON.parse(v) : null; } catch { return null; } }
function saveBest() { try { localStorage.setItem('emmie_best_v2', JSON.stringify(state.best)); } catch {} }

export function resetRun() {
  state.elapsed = 0; state.running = false; state.ended = false;
  state.objective = ''; state.checklist = []; state.sceneTitle = '';
  toasts.length = 0;
}
export function tickProgress(dt) { if (state.running && !state.ended) state.elapsed += dt; }
export function progress01() { return clamp(state.elapsed / (PAR * 1.7), 0, 1); }
export function starsFor(sec) { return sec <= PAR * 0.85 ? 3 : sec <= PAR * 1.25 ? 2 : 1; }
export function finishRun() {
  if (state.ended) return;
  state.ended = true; state.running = false;
  const s = starsFor(state.elapsed);
  const t = Math.round(state.elapsed);
  if (!state.best || s > state.best.stars || (s === state.best.stars && t < state.best.time)) {
    state.best = { stars: s, time: t }; saveBest();
  }
}

// --- objectives ----------------------------------------------------
export function setScene(title, checklist) { state.sceneTitle = title; state.checklist = checklist || []; }
export function setObjective(txt) { state.objective = txt; }
export function checkOff(label) {
  const c = state.checklist.find((x) => x.label === label);
  if (c && !c.done) { c.done = true; sfx.task(); }
}
export function allChecked() { return state.checklist.length > 0 && state.checklist.every((c) => c.done); }

// --- toasts (little celebratory pop-ups) --------------------------
const toasts = [];
export function toast(msg, color = '#fff') { toasts.push({ msg, color, t: 0 }); }
export function updateToasts(dt) { for (let i = toasts.length - 1; i >= 0; i--) { toasts[i].t += dt; if (toasts[i].t > 1.8) toasts.splice(i, 1); } }
export function drawToasts() {
  let y = 96;
  for (const k of toasts) {
    ctx.save(); ctx.globalAlpha = clamp(1.8 - k.t, 0, 1);
    text(k.msg, W / 2, y - k.t * 12, { size: 15, align: 'center', color: k.color, weight: '700' });
    ctx.restore();
    y += 22;
  }
}

// --- scene manager (with a soft fade) ----------------------------
let current = null, next = null, fade = 0, fading = false;
export function goScene(scene, payload) {
  if (fading) return;
  next = { scene, payload }; fading = true; fade = 0;
}
export function currentScene() { return current; }
export function updateSceneManager(dt) {
  if (!fading) return;
  if (next) {
    fade += dt * 3;
    if (fade >= 1) { current = next.scene; const p = next.payload; next = null; if (current.enter) current.enter(p); }
  } else {
    fade -= dt * 3;
    if (fade <= 0) { fade = 0; fading = false; }
  }
}
export function drawFade() {
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(fade, 0, 1); rect(0, 0, W, H, '#1b1526'); ctx.restore();
}

// --- shared HUD -------------------------------------------------
export function drawHUD() {
  // top-left: sun + morning bar
  rr(8, 8, 170, 26, 9, 'rgba(18,14,26,0.72)');
  const p = progress01();
  drawSun(23, 21, 8);
  rr(36, 14, 134, 10, 5, 'rgba(0,0,0,0.4)');
  rr(38, 16, 130 * p, 6, 3, p < 0.7 ? '#8fe07a' : p < 0.9 ? '#ffd34d' : '#ff9a6b');
  text('morning', 38, 25, { size: 8, color: '#cbd3de' });

  // checklist, top-right (under the HTML sound buttons)
  const rows = state.checklist.length;
  if (rows) {
    const w = 150, x = W - w - 8, h = 20 + rows * 15;
    rr(x, 44, w, h, 9, 'rgba(18,14,26,0.72)');
    text(state.sceneTitle, x + 10, 50, { size: 10, color: '#9cd', weight: '700' });
    let y = 66;
    for (const c of state.checklist) {
      text((c.done ? '● ' : '○ ') + c.label, x + 10, y, { size: 10, color: c.done ? '#8fe07a' : '#e6e0d4' });
      y += 15;
    }
  }

  // objective banner, top-center
  if (state.objective) {
    const w = Math.min(340, 34 + state.objective.length * 8);
    rr(W / 2 - w / 2, 8, w, 28, 14, 'rgba(28,22,38,0.88)');
    text(state.objective, W / 2, 14, { size: 13, align: 'center', color: '#ffe066', weight: '700' });
  }
}

// --- a friendly story/cutscene builder ------------------------
export function makeStory(pages, onDone) {
  let i = 0, t = 0;
  return {
    id: 'story',
    enter() { i = 0; t = 0; },
    update(dt) {
      t += dt;
      if (input.pressed('act')) { sfx.confirm(); i++; if (i >= pages.length) onDone(); }
    },
    draw() {
      rect(0, 0, W, H, '#122033');
      for (let s = 0; s < 46; s++) circle((s * 97 + 20) % W, (s * 61) % (H - 40), s % 7 ? 1 : 1.6, s % 7 ? '#1e3350' : '#ffe9a8');
      const p = pages[i] || pages[pages.length - 1];
      const lines = (Array.isArray(p) ? p : [p]).map((l) => (typeof l === 'function' ? l() : l));
      let y = H / 2 - lines.length * 13;
      lines.forEach((ln, k) => { text(ln, W / 2, y, { size: k === 0 ? 20 : 14, align: 'center', color: k === 0 ? '#ffe066' : '#dfe7f5', weight: k === 0 ? '700' : '' }); y += 26; });
      if (t % 1 < 0.6) text('press  Z  ▶', W / 2, H - 44, { size: 12, align: 'center', color: '#8fe07a' });
    },
  };
}
