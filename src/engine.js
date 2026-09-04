// engine.js — tiny retro engine: scaled pixel canvas, input, audio, text, loop.
// No dependencies. Internal resolution is fixed; everything is nearest-neighbour scaled.

export const W = 480;
export const H = 270;

export const canvas = document.getElementById('screen');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ---------------------------------------------------------------------------
// Scaling: keep the internal 480x270 buffer, letterbox to the window.
// ---------------------------------------------------------------------------
function resize() {
  const wrap = canvas.parentElement;
  const scale = Math.max(1, Math.floor(Math.min(wrap.clientWidth / W, wrap.clientHeight / H)));
  canvas.style.width = W * scale + 'px';
  canvas.style.height = H * scale + 'px';
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------------------
// Input — keyboard + on-screen touch buttons, mapped to logical actions.
// ---------------------------------------------------------------------------
const ACTIONS = ['left', 'right', 'up', 'down', 'act', 'start'];
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up', Space: 'up',      // Space doubles as jump
  ArrowDown: 'down', KeyS: 'down',
  KeyJ: 'act', KeyZ: 'act', KeyE: 'act', Enter: 'act',
};
const START_KEYS = new Set(['Enter', 'Space', 'KeyJ', 'KeyZ']);

const held = new Set();
const edgeDown = new Set();
const edgeUp = new Set();

function press(action) { if (!held.has(action)) { held.add(action); edgeDown.add(action); } }
function release(action) { if (held.has(action)) { held.delete(action); edgeUp.add(action); } }

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const a = KEYMAP[e.code];
  if (a) { press(a); e.preventDefault(); }
  if (START_KEYS.has(e.code)) { press('start'); }
  if (e.code === 'KeyM') toggleMute();
});
window.addEventListener('keyup', (e) => {
  const a = KEYMAP[e.code];
  if (a) { release(a); e.preventDefault(); }
  if (START_KEYS.has(e.code)) release('start');
});
window.addEventListener('blur', () => { held.clear(); });

export const input = {
  down: (a) => held.has(a),
  pressed: (a) => edgeDown.has(a),
  released: (a) => edgeUp.has(a),
  anyPressed: () => edgeDown.size > 0,
};
function endFrameInput() { edgeDown.clear(); edgeUp.clear(); }

// Touch controls (created lazily, shown only on touch devices)
function buildTouch() {
  if (!('ontouchstart' in window)) return;
  const pad = document.getElementById('touch');
  if (!pad) return;
  pad.hidden = false;
  const bind = (id, action) => {
    const el = document.getElementById(id);
    if (!el) return;
    const on = (e) => { e.preventDefault(); press(action); press('start'); };
    const off = (e) => { e.preventDefault(); release(action); release('start'); };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
  };
  bind('t-left', 'left'); bind('t-right', 'right');
  bind('t-up', 'up'); bind('t-down', 'down');
  bind('t-act', 'act'); bind('t-jump', 'up');
}
buildTouch();

// ---------------------------------------------------------------------------
// Audio — minimal WebAudio bleeper + a tension bassline.
// ---------------------------------------------------------------------------
let actx = null;
let muted = false;
let masterGain = null;

function audioReady() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = actx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
}
window.addEventListener('pointerdown', audioReady, { once: false });
window.addEventListener('keydown', audioReady, { once: false });

function toggleMute() {
  muted = !muted;
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.9;
}
export const audio = { toggleMute, get muted() { return muted; } };

function tone(freq, dur, { type = 'square', vol = 0.18, slideTo = null, delay = 0 } = {}) {
  if (!actx || muted) return;
  const t0 = actx.currentTime + delay;
  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(masterGain);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}
function noise(dur, { vol = 0.15, delay = 0 } = {}) {
  if (!actx || muted) return;
  const t0 = actx.currentTime + delay;
  const n = Math.floor(actx.sampleRate * dur);
  const buf = actx.createBuffer(1, n, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = actx.createBufferSource();
  const g = actx.createGain();
  g.gain.value = vol;
  src.buffer = buf; src.connect(g); g.connect(masterGain);
  src.start(t0);
}

export const sfx = {
  select: () => tone(660, 0.08, { vol: 0.16 }),
  move: () => tone(300, 0.04, { vol: 0.08, type: 'triangle' }),
  step: () => tone(140, 0.05, { vol: 0.06, type: 'square' }),
  jump: () => tone(420, 0.18, { slideTo: 820, vol: 0.16, type: 'square' }),
  land: () => tone(180, 0.06, { vol: 0.12, type: 'triangle' }),
  pickup: () => { tone(700, 0.06); tone(1050, 0.08, { delay: 0.06 }); },
  good: () => { tone(660, 0.08); tone(880, 0.08, { delay: 0.08 }); tone(1320, 0.12, { delay: 0.16 }); },
  error: () => tone(200, 0.18, { slideTo: 90, type: 'sawtooth', vol: 0.18 }),
  bump: () => noise(0.08, { vol: 0.12 }),
  alarm: () => { tone(880, 0.09, { type: 'square', vol: 0.14 }); tone(880, 0.09, { type: 'square', vol: 0.14, delay: 0.16 }); },
  meow: () => tone(500, 0.22, { slideTo: 760, type: 'sawtooth', vol: 0.12 }),
  engine: () => tone(70, 0.3, { slideTo: 120, type: 'sawtooth', vol: 0.06 }),
  bell: () => { for (let i = 0; i < 6; i++) tone(1200, 0.12, { vol: 0.13, delay: i * 0.14 }); },
  tick: () => tone(1000, 0.02, { vol: 0.05 }),
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, { delay: i * 0.12, vol: 0.16, type: 'square' })); },
  lose: () => { [400, 340, 280, 180].forEach((f, i) => tone(f, 0.22, { delay: i * 0.16, vol: 0.18, type: 'sawtooth' })); },
};

// Bassline whose tempo rises with `tension` (0..1). Call music.set(tension) / music.stop().
let musicTimer = null;
let tension = 0;
const BASS = [131, 131, 165, 196];
let bassStep = 0;
function musicTick() {
  audioReady();
  tone(BASS[bassStep % BASS.length], 0.12, { type: 'triangle', vol: 0.05 });
  if (bassStep % 2 === 0) noise(0.03, { vol: 0.04 });
  bassStep++;
  const interval = 460 - tension * 260; // ms
  musicTimer = setTimeout(musicTick, interval);
}
export const music = {
  start() { if (!musicTimer) musicTick(); },
  stop() { clearTimeout(musicTimer); musicTimer = null; },
  set(t) { tension = Math.max(0, Math.min(1, t)); },
};

// ---------------------------------------------------------------------------
// Pixel text. Uses a bitmap font family with a monospace fallback.
// ---------------------------------------------------------------------------
export function text(str, x, y, { size = 8, color = '#fff', align = 'left', shadow = '#000' } = {}) {
  ctx.font = `${size}px "Press Start 2P", "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(str, x + 1, y + 1); }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}
export function textWidth(str, size = 8) {
  ctx.font = `${size}px "Press Start 2P", "Courier New", monospace`;
  return ctx.measureText(str).width;
}

// ---------------------------------------------------------------------------
// Draw helpers
// ---------------------------------------------------------------------------
export function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }
export function clear(color) { rect(0, 0, W, H, color); }

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------
let last = 0;
export function startLoop(tick) {
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    tick(dt);
    endFrameInput();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Small deterministic-ish RNG helpers
export const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const rndi = (a, b) => Math.floor(rnd(a, b));
export const chance = (p) => Math.random() < p;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
