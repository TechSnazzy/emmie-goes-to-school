// line.js — the final dash. Get in line before the 7:50 bell. Then the teacher
// comes out to say good morning.
import { W, H, rect, text, sfx, input, clamp, rnd, rndi } from '../engine.js';
import { state, tickClock, isLate, FIRST_BELL } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawSchoolWall, shadow } from '../sprites.js';

const RATE = 0.55;
const TOP = 70, BOT = H - 20;
const LINE_X = W - 60;

let em, kids, lineKids, phase, teacherX, bannerT, msg, bellRung;

function reset() {
  em = { x: 20, y: (TOP + BOT) / 2, f: 1, walk: 0 };
  kids = [];
  for (let i = 0; i < 5; i++) kids.push({ x: rnd(90, LINE_X - 30), y: rnd(TOP + 6, BOT - 6), vy: rnd(-40, 40), c: ['#e67e22', '#16a085', '#8e44ad', '#2980b9'][rndi(0, 4)] });
  lineKids = 4;
  phase = 'run';
  teacherX = W + 20;
  bannerT = 0;
  bellRung = state.clock >= FIRST_BELL;
  msg = 'RUN!  ▶  Get in line before 7:50!';
}

export const line = {
  id: 'line',
  enter() { reset(); state.running = true; },
  update(dt) {
    if (phase === 'run') {
      tickClock(dt, RATE);
      if (!bellRung && state.clock >= FIRST_BELL) { bellRung = true; sfx.bell(); }
      let mvx = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
      let mvy = (input.down('down') ? 1 : 0) - (input.down('up') ? 1 : 0);
      em.x = clamp(em.x + mvx * 96 * dt, 10, LINE_X);
      em.y = clamp(em.y + mvy * 96 * dt, TOP + 4, BOT - 4);
      if (mvx) em.f = mvx > 0 ? 1 : -1;
      if (mvx || mvy) { em.walk += dt * 12; if (Math.random() < dt * 8) sfx.step(); } else em.walk = 0;

      for (const k of kids) {
        k.y += k.vy * dt;
        if (k.y < TOP + 4 || k.y > BOT - 4) k.vy *= -1;
        if (Math.hypot(k.x - em.x, k.y - em.y) < 12) {
          const a = Math.atan2(em.y - k.y, em.x - k.x);
          em.x += Math.cos(a) * 44 * dt; em.y += Math.sin(a) * 44 * dt;
          sfx.bump();
        }
      }
      if (em.x >= LINE_X - 2) { phase = 'inline'; sfx.good(); state.running = false; msg = 'Made it! Here comes the teacher...'; }
      if (isLate()) return go('end', { win: false, reason: 'The 7:50 bell rang before Emmie reached the line.' });
    } else if (phase === 'inline') {
      teacherX += (LINE_X - 40 - teacherX) * Math.min(1, dt * 2);
      bannerT += dt;
      if (bannerT > 1.6) { phase = 'greet'; bannerT = 0; sfx.win(); }
    } else if (phase === 'greet') {
      bannerT += dt;
      if (bannerT > 2 || input.pressed('act')) return go('end', { win: true });
    }
  },
  draw() {
    rect(0, 0, W, H, '#aacbe0');
    drawSchoolWall(0, 0, W, TOP - 8);
    rect(0, TOP - 8, W, 3, '#8a6a48');
    rect(0, BOT, W, H - BOT, '#7fae5a');                // grass
    rect(0, BOT - 2, W, 3, '#6c9a4c');
    // blacktop
    rect(0, TOP - 5, W, BOT - TOP + 3, '#6f6f77');
    // the line markings
    for (let i = 0; i < 6; i++) rect(LINE_X + 6, TOP + 6 + i * 18, 10, 3, '#f1c40f');
    text('LINE UP HERE', LINE_X + 2, TOP - 4, { size: 6, align: 'center', color: '#ffe' });

    // kids already lined up
    for (let i = 0; i < lineKids; i++) drawEmmie(LINE_X + 10, TOP + 14 + i * 18, { facing: -1, frame: (bannerT * 6 + i | 0) % 2, hoodie: ['#e67e22', '#16a085', '#8e44ad', '#2980b9'][i % 4] });
    if (phase !== 'run') drawEmmie(LINE_X + 10, TOP + 14 + lineKids * 18, { facing: -1, frame: 0 });

    // milling kids
    for (const k of kids) { if (phase !== 'run') break; shadow(k.x, k.y + 8, 7); drawEmmie(k.x, k.y, { facing: k.vy > 0 ? 1 : -1, frame: (k.y / 6 | 0) % 2, hoodie: k.c }); }

    // teacher
    if (phase !== 'run') { shadow(teacherX, TOP + 40); drawParent(teacherX, TOP + 20, { type: 'MOM', facing: 1, frame: (bannerT * 6 | 0) % 2 }); }

    // parent + Emmie
    const showEm = phase === 'run';
    shadow(em.x - 16, em.y + 8);
    drawParent(em.x - 16, em.y - 8, { type: state.parent, facing: em.f, frame: (em.walk | 0) % 2 });
    if (showEm) { shadow(em.x, em.y + 8); drawEmmie(em.x, em.y - 6, { facing: em.f, frame: (em.walk | 0) % 2 }); }

    if (phase === 'greet') {
      rect(0, H / 2 - 16, W, 32, 'rgba(0,0,0,0.6)');
      text('"Good morning, Emmie!"', W / 2, H / 2 - 6, { size: 9, align: 'center', color: '#7CFC00' });
    }
    if (bellRung && phase === 'run' && (state.clock * 5 | 0) % 2) text('▶▶ BELL! ◀◀', W / 2, TOP + 6, { size: 9, align: 'center', color: '#ff3b3b' });
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
