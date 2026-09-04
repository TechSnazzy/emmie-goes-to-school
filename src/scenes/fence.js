// fence.js — the school gate is locked until ~7:35 when a staff member unlocks it.
// While you wait, keep Emmie from wandering off to play with a friend.
import { W, H, rect, text, sfx, input, clamp } from '../engine.js';
import { state, tickClock, isLate, penalty, FENCE_OPEN, fmtClock } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawFence, drawSchoolWall, shadow } from '../sprites.js';

const RATE_WAIT = 0.95;         // clock moves briskly while waiting
const RATE_WALK = 0.5;
const SPOT = 150;               // where Emmie should wait
const GATE_X = 300;

let em, phase, staffX, unlockT, msg, friendWave, strayCd;

function reset() {
  em = { x: SPOT, f: 1, drift: 0, walk: 0 };
  phase = state.clock >= FENCE_OPEN ? 'unlocking' : 'wait';
  staffX = W + 30;
  unlockT = 0;
  friendWave = 0;
  strayCd = 0;
  msg = phase === 'wait' ? 'Gate is locked. Tap  ▶  to stay with your grown-up.' : 'Someone is coming to open the gate...';
}

export const fence = {
  id: 'fence',
  enter() { reset(); state.running = true; },
  update(dt) {
    friendWave += dt * 4;
    strayCd -= dt;

    if (phase === 'wait') {
      tickClock(dt, RATE_WAIT);
      // Emmie drifts toward the friend on the left; player pulls her back
      em.drift += dt * 10;
      if (input.pressed('right') || input.pressed('act')) { em.drift -= 7; sfx.move(); }
      em.drift = clamp(em.drift, 0, 40);
      em.x = SPOT - em.drift;
      em.f = (input.down('right') || input.down('act')) ? 1 : -1;
      em.walk += dt * 8;
      if (em.drift >= 40 && strayCd <= 0) {
        strayCd = 3;
        if (penalty(2, 'WANDERED OFF  +2 MIN')) return go('end', { win: false, reason: 'Off playing with a friend when the bell rang.' });
        em.drift = 12;
        msg = 'Come back! Stay by your grown-up.';
      }
      if (state.clock >= FENCE_OPEN) { phase = 'unlocking'; staffX = W + 30; msg = 'The gate is opening!'; }
    } else if (phase === 'unlocking') {
      tickClock(dt, RATE_WALK);
      staffX += (GATE_X + 26 - staffX) * Math.min(1, dt * 2.2);
      if (staffX < GATE_X + 34) {
        unlockT += dt;
        if (Math.random() < dt * 6) sfx.tick();
        if (unlockT > 1.2) { phase = 'open'; sfx.good(); msg = 'Walk through!  ▶'; }
      }
    } else if (phase === 'open') {
      tickClock(dt, RATE_WALK);
      const mv = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
      em.x = clamp(em.x + mv * 74 * dt, 40, W + 10);
      if (mv) { em.f = mv > 0 ? 1 : -1; em.walk += dt * 10; sfx.step(); }
      if (em.x > GATE_X + 30) return go('hallway');
    }

    if (isLate()) return go('end', { win: false, reason: 'Still outside the gate when class started.' });
  },
  draw() {
    rect(0, 0, W, H, '#a9d3e8');
    rect(0, H - 40, W, 40, '#7a8a5a');                       // grass strip
    rect(GATE_X + 40, 30, W - GATE_X - 40, H - 70, undefined);
    drawSchoolWall(GATE_X + 44, 40, W - GATE_X - 44, H - 80);
    text('SCHOOL', GATE_X + 90, 52, { size: 8, color: '#fff' });
    // sidewalk
    rect(0, H - 30, W, 12, '#b9bec4');
    // fence + gate
    for (let x = 0; x < GATE_X; x += 44) drawFence(x, H - 30, 40, false);
    drawFence(GATE_X, H - 30, 40, phase === 'open');
    if (phase !== 'open') { rect(GATE_X + 2, H - 68, 40, 40, '#8d99ae'); rect(GATE_X + 18, H - 50, 6, 8, phase === 'unlocking' ? '#ffe066' : '#444'); }

    // friend on the left (playground)
    const fx = 24 + Math.sin(friendWave) * 2;
    drawEmmie(fx, H - 30, { facing: 1, frame: (friendWave | 0) % 2, hoodie: '#4caf50' });
    if (phase === 'wait') text('come play!', fx, H - 58, { size: 6, align: 'center', color: '#2a6' });

    // staff member
    if (phase === 'unlocking' || phase === 'open') {
      shadow(staffX, H - 22);
      drawParent(staffX, H - 42, { type: 'MOM', facing: -1, frame: (unlockT * 6 | 0) % 2 });
      rect(staffX - 8, H - 50, 6, 4, '#ffe066'); // hi-vis vest hint
    }

    shadow(em.x + 22, H - 22);
    drawParent(em.x + 22, H - 42, { type: state.parent, facing: -1, frame: 0 });
    shadow(em.x, H - 22);
    drawEmmie(em.x, H - 30, { facing: em.f, frame: (em.walk | 0) % 2 });

    text('GATE OPENS ~' + fmtClock(FENCE_OPEN).replace(' AM', ''), W / 2, 24, { size: 7, align: 'center', color: '#0a4a63' });
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
