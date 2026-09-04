// audio.js — a calm morning theme + soft interaction sounds.
// Two independent toggles (music / sfx), both remembered in localStorage.
import { onMusicToggle, onSfxToggle } from './engine.js';

let actx = null;
let master = null;
let musicBus = null;
let sfxBus = null;

function load(key, dflt) {
  try { const v = localStorage.getItem(key); return v === null ? dflt : v === '1'; } catch { return dflt; }
}
function save(key, on) { try { localStorage.setItem(key, on ? '1' : '0'); } catch {} }

export const settings = {
  music: load('emmie_music', true),
  sfx: load('emmie_sfx', true),
};

function ensure() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
  actx = new (window.AudioContext || window.webkitAudioContext)();
  master = actx.createGain(); master.gain.value = 0.8; master.connect(actx.destination);
  musicBus = actx.createGain(); musicBus.gain.value = settings.music ? 0.9 : 0; musicBus.connect(master);
  sfxBus = actx.createGain(); sfxBus.gain.value = settings.sfx ? 0.9 : 0; sfxBus.connect(master);
}
function unlock() { ensure(); if (settings.music) startMusic(); }
window.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);
window.addEventListener('touchstart', unlock);

// --- soft synth voice -------------------------------------------------
function voice(freq, dur, { type = 'sine', vol = 0.2, bus = sfxBus, attack = 0.01, glideTo = null, delay = 0 } = {}) {
  if (!actx || !bus) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, glideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.05);
}

// --- sound effects (gentle, mallet-ish) -----------------------------
export const sfx = {
  step() { voice(70, 0.05, { type: 'sine', vol: 0.05 }); },
  walkTip() { voice(520, 0.05, { type: 'sine', vol: 0.03 }); },
  hover() { voice(660, 0.08, { type: 'sine', vol: 0.05 }); },
  confirm() { voice(660, 0.09, { type: 'sine', vol: 0.12 }); voice(990, 0.12, { type: 'sine', vol: 0.1, delay: 0.07 }); },
  pickup() { voice(500, 0.08, { type: 'triangle', vol: 0.12, glideTo: 900 }); },
  task() { voice(740, 0.14, { type: 'sine', vol: 0.09 }); },
  done() { [523, 659, 784, 1047].forEach((f, i) => voice(f, 0.18, { type: 'sine', vol: 0.11, delay: i * 0.07 })); },
  soft() { voice(300, 0.12, { type: 'sine', vol: 0.06, glideTo: 240 }); },
  purr() { for (let i = 0; i < 5; i++) voice(90 + (i % 2) * 12, 0.12, { type: 'triangle', vol: 0.05, delay: i * 0.1 }); },
  knock() { voice(180, 0.09, { type: 'triangle', vol: 0.12, glideTo: 120 }); voice(160, 0.09, { type: 'triangle', vol: 0.1, delay: 0.14 }); },
  car() { voice(60, 0.5, { type: 'sawtooth', vol: 0.04, glideTo: 90 }); },
  beep() { voice(660, 0.1, { type: 'square', vol: 0.05 }); },
  star() { voice(880, 0.12, { type: 'sine', vol: 0.12 }); voice(1320, 0.16, { type: 'sine', vol: 0.1, delay: 0.09 }); },
  win() { [523, 587, 659, 784, 880, 1047].forEach((f, i) => voice(f, 0.24, { type: 'sine', vol: 0.12, delay: i * 0.12 })); },
  alarm() {
    for (let i = 0; i < 4; i++) {
      voice(880, 0.12, { type: 'square', vol: 0.11, delay: i * 0.32 });
      voice(700, 0.12, { type: 'square', vol: 0.09, delay: i * 0.32 + 0.16 });
    }
  },
  flush() {
    voice(260, 0.55, { type: 'sawtooth', vol: 0.055, glideTo: 85 });
    voice(340, 0.4, { type: 'sine', vol: 0.035, glideTo: 130, delay: 0.06 });
  },
  water() { voice(1400, 0.7, { type: 'sawtooth', vol: 0.018, glideTo: 1000 }); },
  honk() { voice(220, 0.22, { type: 'sawtooth', vol: 0.1 }); voice(220, 0.22, { type: 'sawtooth', vol: 0.08, delay: 0.26 }); },
  siren() {
    for (let i = 0; i < 3; i++) {
      voice(880, 0.3, { type: 'sine', vol: 0.09, glideTo: 660, delay: i * 0.6 });
      voice(660, 0.3, { type: 'sine', vol: 0.09, glideTo: 880, delay: i * 0.6 + 0.3 });
    }
  },
};

// --- the calm theme -------------------------------------------------
// I - vi - IV - V in C, slow, with a soft arpeggio and a low root.
const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
const PROG = [
  [60, 64, 67, 71],   // Cmaj7
  [57, 60, 64, 67],   // Am7
  [53, 57, 60, 64],   // Fmaj7
  [55, 59, 62, 67],   // G
];
let musicTimer = null;
let step = 0;
const CHORD_LEN = 2.4;   // seconds

function playChord() {
  if (!actx || !musicBus) return;
  const notes = PROG[step % PROG.length];
  // pad
  for (const n of notes) voice(N(n), CHORD_LEN * 1.05, { type: 'sine', vol: 0.035, bus: musicBus, attack: 0.5 });
  // low root
  voice(N(notes[0] - 12), CHORD_LEN * 1.05, { type: 'triangle', vol: 0.05, bus: musicBus, attack: 0.4 });
  // gentle arpeggio over the bar
  const arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12];
  arp.forEach((n, i) => voice(N(n), 0.5, { type: 'sine', vol: 0.045, bus: musicBus, attack: 0.02, delay: i * (CHORD_LEN / arp.length) }));
  step++;
  musicTimer = setTimeout(playChord, CHORD_LEN * 1000);
}

export function startMusic() {
  ensure();
  if (!settings.music || musicTimer) return;
  step = 0;
  playChord();
}
export function stopMusic() { clearTimeout(musicTimer); musicTimer = null; }

export function toggleMusic() {
  settings.music = !settings.music;
  save('emmie_music', settings.music);
  ensure();
  if (musicBus) musicBus.gain.setTargetAtTime(settings.music ? 0.9 : 0, actx.currentTime, 0.1);
  if (settings.music) startMusic(); else stopMusic();
  sfx.confirm();
  return settings.music;
}
export function toggleSfx() {
  settings.sfx = !settings.sfx;
  save('emmie_sfx', settings.sfx);
  ensure();
  if (sfxBus) sfxBus.gain.setTargetAtTime(settings.sfx ? 0.9 : 0, actx.currentTime, 0.05);
  if (settings.sfx) sfx.confirm();
  return settings.sfx;
}

onMusicToggle(toggleMusic);
onSfxToggle(toggleSfx);
