// bedroom.js — 6:50 AM. Wake up and get ready: light, dressed, potty, teeth,
// shoes + hoodie. Milo the cat keeps saying hello.
import { W, H, ctx, rect, text, sfx, input, clamp, rnd } from '../engine.js';
import { state, tickClock, isLate, penalty } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawCat, shadow, PALETTE } from '../sprites.js';

const RATE = 0.5;            // game-minutes per real second
const TASK_TIME = 1.15;      // seconds of holding ACT per task

const FLOOR = { x: 24, y: 40, w: W - 48, h: H - 78 };

let em, parent, milo, tasks, lightOn, alarmT, doneCount, msg, msgT;

function reset() {
  em = { x: W / 2, y: H - 60, f: 1, walk: 0 };
  parent = { x: 60, y: 62 };
  milo = { x: -20, y: FLOOR.y + 20, f: 1, vx: 22, vy: 0, pause: 0, in: false };
  lightOn = false;
  alarmT = 0;
  doneCount = 0;
  msg = 'Alarm! Press  Z  to turn on the light';
  msgT = 0;
  tasks = [
    { key: 'LIGHT', x: FLOOR.x + 6, y: FLOOR.y + 4, w: 16, h: 16, prog: 0, done: false, label: 'lights' },
    { key: 'DRESS', x: FLOOR.x + FLOOR.w - 60, y: FLOOR.y + 6, w: 44, h: 24, prog: 0, done: false, label: 'get dressed' },
    { key: 'POTTY', x: FLOOR.x + FLOOR.w - 26, y: FLOOR.y + FLOOR.h - 40, w: 24, h: 30, prog: 0, done: false, label: 'go potty' },
    { key: 'TEETH', x: FLOOR.x + 6, y: FLOOR.y + FLOOR.h - 34, w: 26, h: 24, prog: 0, done: false, label: 'brush teeth' },
    { key: 'SHOES', x: W / 2 - 16, y: FLOOR.y + FLOOR.h - 12, w: 32, h: 14, prog: 0, done: false, label: 'shoes + hoodie' },
  ];
}

function say(t) { msg = t; msgT = 0; }
function centerIn(a, r) { return a.x > r.x && a.x < r.x + r.w && a.y > r.y - 4 && a.y < r.y + r.h + 4; }

export const bedroom = {
  id: 'bedroom',
  enter() { reset(); state.running = true; },
  update(dt) {
    tickClock(dt, RATE);
    alarmT += dt; msgT += dt;

    if (!lightOn) {
      if (input.pressed('act') || input.pressed('start')) {
        lightOn = true; sfx.select();
        tasks[0].done = true; doneCount = 1;
        say('Mom turns on the light. Milo comes to say hi!');
      } else {
        if (alarmT % 1 < 0.5 && alarmT < 6) sfx.tick();
        return;
      }
    }

    // --- movement ---
    let mvx = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
    let mvy = (input.down('down') ? 1 : 0) - (input.down('up') ? 1 : 0);
    const sp = 62;
    em.x = clamp(em.x + mvx * sp * dt, FLOOR.x + 4, FLOOR.x + FLOOR.w - 4);
    em.y = clamp(em.y + mvy * sp * dt, FLOOR.y + 4, FLOOR.y + FLOOR.h - 2);
    if (mvx) em.f = mvx > 0 ? 1 : -1;
    if (mvx || mvy) { em.walk += dt * 10; sfx.step(); } else em.walk = 0;

    // --- Milo wanders and greets ---
    if (!milo.in && lightOn) { milo.in = true; }
    if (milo.in) {
      milo.pause -= dt;
      if (milo.pause <= 0) {
        milo.x += milo.vx * dt;
        milo.y += milo.vy * dt;
        if (milo.x < FLOOR.x + 6 || milo.x > FLOOR.x + FLOOR.w - 6) { milo.vx *= -1; milo.f *= -1; }
        if (milo.y < FLOOR.y + 8 || milo.y > FLOOR.y + FLOOR.h - 6) milo.vy *= -1;
        if (rnd() < dt * 0.4) { milo.vy = rnd(-18, 18); milo.pause = rnd(0.3, 1.1); }
        // drift toward Emmie sometimes
        if (rnd() < dt * 0.3) { milo.vx = Math.sign(em.x - milo.x) * 24; milo.f = Math.sign(milo.vx) || 1; }
      }
    }
    const nearMilo = milo.in && Math.hypot(milo.x - em.x, milo.y - em.y) < 14;

    // --- tasks ---
    let onTask = null;
    for (const t of tasks) {
      if (t.done || t.key === 'LIGHT') continue;
      if (centerIn(em, t)) { onTask = t; break; }
    }
    if (onTask && input.down('act')) {
      if (nearMilo) {
        say('Milo is in the way! ("meow")');
        if (Math.random() < dt * 2) sfx.meow();
      } else {
        onTask.prog += dt / TASK_TIME;
        if (Math.random() < dt * 4) sfx.tick();
        say('...' + onTask.label + '...');
        if (onTask.prog >= 1) {
          onTask.done = true; doneCount++;
          sfx.good();
          say(onTask.label + ' — done!');
        }
      }
    } else if (onTask) {
      say('Hold  Z  to ' + onTask.label);
    } else if (nearMilo && lightOn) {
      say('Milo: "meow!" (pet him quick and keep going)');
    }

    if (isLate()) return go('end', { win: false, reason: 'Still getting ready when the last bell rang.' });
    if (doneCount >= tasks.length) {
      go('leave');
    }
  },
  draw() {
    // walls / floor
    rect(0, 0, W, H, '#241c33');
    rect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h, lightOn ? '#6b5a44' : '#2c2536');
    rect(FLOOR.x, FLOOR.y, FLOOR.w, 4, '#00000030');
    // rug
    rect(W / 2 - 40, FLOOR.y + FLOOR.h / 2 - 16, 80, 32, lightOn ? '#b5546e' : '#4a3348');

    // bed (top-left area)
    rect(FLOOR.x + 30, FLOOR.y + 6, 40, 26, '#7aa0c8');
    rect(FLOOR.x + 30, FLOOR.y + 6, 12, 26, '#eaeaea');

    // dresser (get dressed) top-right
    const d = tasks[1];
    rect(d.x, d.y, d.w, d.h, d.done ? '#8a5a2b' : '#a06a35');
    rect(d.x + 4, d.y + 6, d.w - 8, 4, '#5b3a1e');
    rect(d.x + 4, d.y + 14, d.w - 8, 4, '#5b3a1e');

    // bathroom door (potty)
    const p = tasks[2];
    rect(p.x, p.y, p.w, p.h, '#3c3550');
    rect(p.x + 2, p.y + 2, p.w - 4, p.h - 2, p.done ? '#5aa06a' : '#9aa7d6');
    text('WC', p.x + p.w / 2, p.y + p.h / 2 - 3, { size: 6, align: 'center', color: '#222' });

    // sink (teeth)
    const s = tasks[3];
    rect(s.x, s.y + 8, s.w, s.h - 8, '#d8dee9');
    rect(s.x + 4, s.y, 4, 10, '#b8c0cc');

    // door + shoes/hoodie mat
    const sh = tasks[4];
    rect(sh.x - 4, sh.y - 2, sh.w + 8, sh.h + 2, '#3a2f22');
    rect(sh.x, FLOOR.y, 4, FLOOR.h, '#1c1730');
    // light switch
    rect(tasks[0].x + 4, tasks[0].y + 4, 6, 10, lightOn ? '#ffe066' : '#555');

    shadow(parent.x, parent.y + 20);
    drawParent(parent.x, parent.y, { type: state.parent, facing: 1, frame: (state.clock * 3 | 0) % 2 });

    if (milo.in) { shadow(milo.x, milo.y + 8, 8); drawCat(milo.x, milo.y, { frame: (state.clock * 6 | 0) % 2, facing: milo.f }); }

    shadow(em.x, em.y + 14);
    drawEmmie(em.x, em.y - 2, { facing: em.f, frame: (em.walk | 0) % 2, sleeping: false });

    // progress ring for current task
    for (const t of tasks) {
      if (t.prog > 0 && !t.done) {
        rect(t.x, t.y - 6, t.w, 3, '#000');
        rect(t.x, t.y - 6, t.w * clamp(t.prog, 0, 1), 3, '#7CFC00');
      }
    }

    // dark overlay before the light
    if (!lightOn) {
      ctx.fillStyle = 'rgba(4,2,12,0.82)';
      ctx.fillRect(0, 0, W, H);
      text('6:50 AM', W / 2, H / 2 - 20, { size: 14, align: 'center', color: '#ffe066' });
      text('BEEP  BEEP  BEEP', W / 2, H / 2 + 4, { size: 9, align: 'center', color: (state.clock * 4 | 0) % 2 ? '#ff5a5a' : '#661' });
      text('press  Z  — turn on the light', W / 2, H / 2 + 26, { size: 7, align: 'center', color: '#cfd8e3' });
    }

    // checklist
    let cy = 20;
    for (const t of tasks) {
      text((t.done ? '☑ ' : '☐ ') + t.label, 6, cy, { size: 6, color: t.done ? '#7CFC00' : '#cfd8e3' });
      cy += 9;
    }
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
    void PALETTE;
  },
};
