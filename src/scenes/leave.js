// leave.js — get out the door: grab the backpack + lunchbox, into the Tesla.
import { W, H, rect, text, sfx, input, clamp } from '../engine.js';
import { state, tickClock, isLate, OUT_DOOR, fmtClock } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawTesla, drawBackpack, drawLunchbox, shadow } from '../sprites.js';

const RATE = 0.5;
const GROUND = H - 46;

let em, par, items, carX, boarded, msg;

function reset() {
  em = { x: 40, f: 1, walk: 0 };
  par = { x: 18 };
  items = [
    { key: 'pack', x: 120, got: false },
    { key: 'lunch', x: 175, got: false },
  ];
  carX = W - 70;
  boarded = 0;
  msg = 'Grab your backpack and lunchbox!';
}

export const leave = {
  id: 'leave',
  enter() { reset(); state.running = true; },
  update(dt) {
    tickClock(dt, RATE);
    if (boarded > 0) {
      boarded += dt;
      if (boarded > 1.1) go('drive');
      return;
    }
    const mv = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
    em.x = clamp(em.x + mv * 70 * dt, 20, carX - 12);
    par.x += ((em.x - 22) - par.x) * Math.min(1, dt * 3);
    if (mv) { em.f = mv > 0 ? 1 : -1; em.walk += dt * 10; sfx.step(); } else em.walk = 0;

    for (const it of items) {
      if (!it.got && Math.abs(em.x - it.x) < 10) {
        it.got = true; sfx.pickup();
        msg = it.key === 'pack' ? 'Backpack — check!' : 'Lunchbox — check!';
      }
    }
    const haveAll = items.every((i) => i.got);
    if (!haveAll && em.x > carX - 40) msg = 'Don\'t forget your ' + (items.find((i) => !i.got).key === 'pack' ? 'backpack' : 'lunchbox') + '!';

    if (haveAll && Math.abs(em.x - (carX - 12)) < 8) {
      if (input.pressed('act')) { boarded = 0.001; sfx.select(); sfx.engine(); msg = 'Buckled up. Let\'s go!'; }
      else msg = 'Press  Z  to get in the Tesla';
    }

    if (isLate()) return go('end', { win: false, reason: 'Never made it out the front door in time.' });
  },
  draw() {
    rect(0, 0, W, H, '#8fc7e8');
    rect(0, GROUND + 10, W, H, '#6b6f75');           // driveway
    rect(0, GROUND + 8, W, 3, '#4d5155');
    // house on the left
    rect(0, 40, 90, GROUND - 30, '#d9c9a3');
    rect(0, 24, 100, 22, '#8a3b3b');                  // roof
    rect(58, GROUND - 34, 22, 34, '#5b3a1e');         // door
    rect(74, GROUND - 20, 3, 3, '#ffe066');
    rect(20, 70, 20, 18, '#7aa0c8');                  // window
    // items on the ground
    for (const it of items) {
      if (it.got) continue;
      if (it.key === 'pack') drawBackpack(it.x - 5, GROUND - 6);
      else drawLunchbox(it.x - 4, GROUND - 2);
    }
    // car
    shadow(carX, GROUND + 12, 30);
    drawTesla(carX, GROUND - 8, { facing: 1 });

    shadow(par.x, GROUND + 10);
    drawParent(par.x, GROUND - 12, { type: state.parent, facing: em.f, frame: (em.walk | 0) % 2 });
    if (boarded === 0) {
      shadow(em.x, GROUND + 8);
      drawEmmie(em.x, GROUND - 8, { facing: em.f, frame: (em.walk | 0) % 2 });
      // carried items
      if (items[0].got) drawBackpack(em.x - 5 - em.f * 8, GROUND - 20);
      if (items[1].got) drawLunchbox(em.x - 4 + em.f * 8, GROUND - 12);
    }

    text('OUT THE DOOR BY ' + fmtClock(OUT_DOOR).replace(' AM', ''), W / 2, 24, { size: 7, align: 'center', color: '#08324a' });
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
