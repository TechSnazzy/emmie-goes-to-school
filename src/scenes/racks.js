// racks.js — outside the classroom: backpack on the hook, lunchbox in the bin.
import { W, H, rect, text, sfx, input, clamp } from '../engine.js';
import { state, tickClock, isLate, FIRST_BELL } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawBackpackRack, drawBackpack, drawLunchRack, drawLunchbox, drawSchoolWall, shadow } from '../sprites.js';

const RATE = 0.4;
const GROUND = H - 26;
const HOOK_X = 90;
const BIN_X = W - 96;
const HOLD = 0.9;

let em, step, prog, bellRung, msg;

function reset() {
  em = { x: W / 2, f: -1, walk: 0 };
  step = 'pack';       // pack -> takeout -> lunch -> done
  prog = 0;
  bellRung = state.clock >= FIRST_BELL;
  msg = 'Walk to the hooks and hold  Z  to hang your backpack';
}

const target = () => (step === 'lunch' ? BIN_X : HOOK_X);

export const racks = {
  id: 'racks',
  enter() { reset(); state.running = true; },
  update(dt) {
    tickClock(dt, RATE);
    if (!bellRung && state.clock >= FIRST_BELL) { bellRung = true; sfx.bell(); msg = 'FIRST BELL! Hurry — then get in line.'; }

    const mv = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
    em.x = clamp(em.x + mv * 74 * dt, 30, W - 30);
    if (mv) { em.f = mv > 0 ? 1 : -1; em.walk += dt * 10; if (Math.random() < dt * 6) sfx.step(); } else em.walk = 0;

    const atTarget = step !== 'takeout' && Math.abs(em.x - target()) < 12;
    const canAct = step === 'takeout' || atTarget;

    if (canAct && input.down('act')) {
      prog += dt / HOLD;
      if (Math.random() < dt * 5) sfx.tick();
      if (step === 'pack') msg = 'hanging up backpack...';
      else if (step === 'takeout') msg = 'taking out lunchbox...';
      else msg = 'lunchbox into the bin...';
      if (prog >= 1) {
        prog = 0; sfx.good();
        if (step === 'pack') { step = 'takeout'; msg = 'Now take your lunchbox out — hold  Z'; }
        else if (step === 'takeout') { step = 'lunch'; msg = 'Carry it to the lunch bin  ▶  and hold  Z'; }
        else { step = 'done'; }
      }
    } else if (step !== 'takeout' && !atTarget) {
      prog = Math.max(0, prog - dt);
      msg = step === 'pack' ? 'Go to the backpack hooks  ◀' : 'Go to the lunchbox bin  ▶';
    } else if (step === 'takeout') {
      msg = 'Hold  Z  to take out your lunchbox';
    }

    if (isLate()) return go('end', { win: false, reason: 'Still sorting the backpack when class started.' });
    if (step === 'done') return go('line');
  },
  draw() {
    rect(0, 0, W, H, '#c7c0ae');
    drawSchoolWall(0, 0, W, GROUND - 4);
    rect(0, GROUND - 4, W, H - GROUND + 4, '#9a9482');
    rect(0, GROUND - 4, W, 2, '#7a7460');

    drawBackpackRack(HOOK_X - 30, 44);
    if (step !== 'pack') drawBackpack(HOOK_X - 6, 50);
    drawLunchRack(BIN_X - 20, GROUND - 22);
    if (step === 'done') drawLunchbox(BIN_X - 4, GROUND - 20);

    // classroom door in the middle
    rect(W / 2 - 12, 30, 24, GROUND - 34, '#5b3a1e');
    rect(W / 2 - 8, 40, 16, 22, '#9aa7d6');
    text('ROOM 3', W / 2, 20, { size: 6, align: 'center', color: '#3a2' });

    shadow(em.x - 18, GROUND);
    drawParent(em.x - 18, GROUND - 16, { type: state.parent, facing: 1, frame: 0 });
    shadow(em.x, GROUND);
    drawEmmie(em.x, GROUND - 6, { facing: em.f, frame: (em.walk | 0) % 2 });
    // carried stuff
    if (step === 'pack') drawBackpack(em.x - 5 + em.f * 8, GROUND - 20);
    if (step === 'lunch') drawLunchbox(em.x - 4 + em.f * 8, GROUND - 14);

    if (prog > 0) {
      rect(em.x - 16, GROUND - 34, 32, 4, '#000');
      rect(em.x - 16, GROUND - 34, 32 * clamp(prog, 0, 1), 4, '#7CFC00');
    }

    // step tracker
    const steps = [['backpack', step !== 'pack'], ['lunchbox out', step === 'lunch' || step === 'done'], ['lunch bin', step === 'done']];
    let x = 8;
    for (const [name, done] of steps) { text((done ? '☑' : '☐') + name, x, 20, { size: 6, color: done ? '#7CFC00' : '#556' }); x += 96; }

    if (bellRung && (state.clock * 4 | 0) % 2) text('▶ FIRST BELL ◀', W / 2, GROUND - 50, { size: 8, align: 'center', color: '#ff5a5a' });
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
