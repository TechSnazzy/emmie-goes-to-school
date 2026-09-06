// state.js — morning progress (no fail state), objectives, DOM HUD, scene manager.
import { W, H, ctx, rect, text, input, clamp, circle } from './engine.js';
import { sfx } from './audio.js';
import { adventure, resetAdventure, completeAdventure } from './adventure.js';

export const state = {
  elapsed: 0,
  running: false,
  ended: false,
  objective: '',
  checklist: [],
  sceneTitle: '',
};

export function resetRun() {
  resetAdventure();
  state.elapsed = 0; state.running = false; state.ended = false;
  state.objective = ''; state.checklist = []; state.sceneTitle = '';
}
export function tickProgress(dt) { if (state.running && !state.ended) state.elapsed += dt; }
export function progress01() { return state.ended ? 1 : clamp((adventure.chapter + adventure.fraction) / 8, 0, 1); }
export function finishRun() {
  if (state.ended) return;
  state.ended = true; state.running = false;
  completeAdventure();
}

// --- DOM HUD ------------------------------------------------------
const $obj = document.getElementById('obj');
const $fill = document.getElementById('sunfill');
const $title = document.getElementById('panel-title');
const $list = document.getElementById('panel-list');
const $toast = document.getElementById('toast');
let listSig = '';

export function setScene(title, checklist) {
  state.sceneTitle = title;
  state.checklist = checklist || [];
  listSig = '';
}
export function setObjective(txt) { state.objective = txt; }
export function checkOff(label) {
  const c = state.checklist.find((x) => x.label === label);
  if (c && !c.done) { c.done = true; sfx.task(); listSig = ''; }
}

export function syncHUD() {
  if ($obj.textContent !== state.objective) $obj.textContent = state.objective;
  const p = progress01();
  $fill.style.width = (p * 100).toFixed(1) + '%';
  $fill.style.background = '#9abda0';
  const sig = state.sceneTitle + '|' + state.checklist.map((c) => c.label + (c.done ? '1' : '0')).join(',');
  if (sig !== listSig) {
    listSig = sig;
    $title.textContent = state.sceneTitle || '';
    $list.innerHTML = '';
    let active = false;
    for (const c of state.checklist) {
      const li = document.createElement('li');
      li.textContent = c.label;
      if (c.done) li.className = 'done';
      else if (!active) { li.className = 'active'; active = true; }
      $list.appendChild(li);
    }
  }
}
export function setScreenMode(on) { document.body.classList.toggle('screen', !!on); }

// --- toast --------------------------------------------------------
let toastT = 0;
export function toast(msg) { $toast.textContent = msg; $toast.classList.add('show'); toastT = 1.8; }
export function updateToasts(dt) {
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $toast.classList.remove('show'); }
}

// --- scene manager (soft fade on the 2D overlay) -----------------
let current = null, next = null, fade = 0, fading = false;
export function goScene(scene, payload) {
  // A child can press Play as soon as it appears, even during the fade-in.
  if (fading && next) return;
  next = { scene, payload }; fading = true;
}
export function currentScene() { return current; }
export function updateSceneManager(dt) {
  if (!fading) return;
  if (next) {
    fade += dt * 3;
    if (fade >= 1) {
      if (current && current.leave) current.leave();
      current = next.scene;
      const p = next.payload; next = null;
      if (current.enter) current.enter(p);
    }
  } else {
    fade -= dt * 3;
    if (fade <= 0) { fade = 0; fading = false; }
  }
}
export function drawFade() {
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(fade, 0, 1); rect(0, 0, W, H, '#1b1526'); ctx.restore();
}

// --- story screens (drawn on the 2D overlay) ---------------------
export function makeStory(pages, onDone) {
  let i = 0, t = 0;
  return {
    id: 'story',
    screen: true,
    enter() { i = 0; t = 0; },
    update(dt) {
      t += dt;
      if (input.pressed('act')) { sfx.confirm(); i++; if (i >= pages.length) onDone(); }
    },
    draw() {
      rect(0, 0, W, H, '#142338');
      for (let s = 0; s < 46; s++) circle((s * 97 + 20) % W, (s * 61) % (H - 40), s % 7 ? 1 : 1.6, s % 7 ? '#1e3350' : '#ffe9a8');
      const p = pages[i] || pages[pages.length - 1];
      const lines = (Array.isArray(p) ? p : [p]).map((l) => (typeof l === 'function' ? l() : l));
      let y = H / 2 - lines.length * 13;
      lines.forEach((ln, k) => { text(ln, W / 2, y, { size: k === 0 ? 20 : 14, align: 'center', color: k === 0 ? '#ffd23f' : '#dfe7f5', weight: k === 0 ? '800' : '600' }); y += 26; });
      if (t % 1 < 0.6) text('click to continue  ▶', W / 2, H - 44, { size: 12, align: 'center', color: '#8fe07a', weight: '700' });
    },
  };
}
