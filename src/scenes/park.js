// park.js — run through the community park to the school fence.
// Emmie runs on her own: JUMP (up/space) over things, DUCK (down) under things.
import { W, H, rect, text, sfx, input, clamp, rnd, chance } from '../engine.js';
import { state, tickClock, isLate, penalty } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawTree, drawBench, shadow } from '../sprites.js';

const RATE = 0.4;
const GOAL = 1000;
const GROUND = H - 34;
const RUN = 118;                  // world px/sec

let dist, em, obs, spawnAt, hitCd, msg, parLag;

function reset() {
  dist = 0;
  em = { y: GROUND, vy: 0, jump: false, duck: false, run: 0 };
  obs = [];
  spawnAt = 220;
  hitCd = 0;
  parLag = 46;
  msg = 'JUMP  = up / space     DUCK = down';
}

const KINDS = {
  puddle: { type: 'low', w: 26, h: 6, c: '#3aa0d8' },
  dog: { type: 'low', w: 22, h: 14, c: '#8a5a2b' },
  scooter: { type: 'low', w: 20, h: 18, c: '#e8506e' },
  frisbee: { type: 'high', w: 16, h: 6, c: '#f1c40f' },
  branch: { type: 'high', w: 30, h: 8, c: '#5b3a1e' },
};

export const park = {
  id: 'park',
  enter() { reset(); state.running = true; },
  update(dt) {
    tickClock(dt, RATE);
    dist += RUN * dt;
    em.run += dt * 12;
    hitCd -= dt;

    // jump / duck
    const onGround = em.y >= GROUND - 0.5;
    if (onGround && !em.duck && (input.pressed('up') || input.pressed('start'))) { em.vy = -210; sfx.jump(); }
    em.duck = onGround && input.down('down');
    em.vy += 620 * dt;
    em.y = clamp(em.y + em.vy * dt, 40, GROUND);
    if (em.y >= GROUND) { if (em.vy > 60) sfx.land(); em.vy = 0; }

    // spawn
    if (dist > spawnAt) {
      const keys = Object.keys(KINDS);
      const k = keys[(Math.random() * keys.length) | 0];
      obs.push({ k, x: W + 20, hit: false, ...KINDS[k] });
      spawnAt = dist + rnd(150, 260);
    }
    // move + collide
    const exH = em.duck ? 8 : 18;
    const emTop = em.y - exH;
    for (const o of obs) {
      o.x -= RUN * dt;
      const oy = o.type === 'high' ? GROUND - 24 : GROUND - o.h;
      if (!o.hit && hitCd <= 0 && o.x < 34 + 8 && o.x + o.w > 34 - 6) {
        const overlap = o.type === 'high'
          ? emTop < oy + o.h                     // must duck
          : em.y > oy - 2;                        // must jump (feet above obstacle top)
        if (overlap) {
          o.hit = true; hitCd = 0.8; sfx.bump();
          msg = o.type === 'high' ? 'DUCK under those!' : 'JUMP over that!';
          if (penalty(o.k === 'puddle' ? 1 : 2, (o.k.toUpperCase()) + `  +${o.k === 'puddle' ? 1 : 2} MIN`))
            return go('end', { win: false, reason: 'Tripped up in the park once too often.' });
        }
      }
    }
    for (let i = obs.length - 1; i >= 0; i--) if (obs[i].x < -40) obs.splice(i, 1);

    if (isLate()) return go('end', { win: false, reason: 'Still in the park when class started.' });
    if (dist >= GOAL) return go('fence');
  },
  draw() {
    rect(0, 0, W, H, '#bfe3f2');
    rect(0, GROUND + 6, W, H, '#4a9d4f');            // grass
    rect(0, GROUND + 6, W, 3, '#3c8a41');
    // parallax trees / benches
    const scroll = (dist * 0.6) % 160;
    for (let i = -1; i < 5; i++) drawTree(i * 160 - scroll + 60, GROUND + 6, 0.8);
    const s2 = dist % 320;
    drawBench(((260 - s2) % 640 + 640) % 640 - 40, GROUND - 8);
    // path
    rect(0, GROUND - 2, W, 8, '#c9a26b');

    for (const o of obs) {
      const oy = o.type === 'high' ? GROUND - 24 : GROUND - o.h;
      if (o.type === 'high') {
        rect(o.x, oy, o.w, o.h, o.c);
        if (o.k === 'frisbee') rect(o.x + 2, oy + 1, o.w - 4, 2, '#fff');
      } else {
        shadow(o.x + o.w / 2, GROUND + 6, o.w / 2);
        rect(o.x, oy, o.w, o.h, o.c);
        if (o.k === 'dog') { rect(o.x + o.w - 4, oy - 4, 4, 5, o.c); rect(o.x - 3, oy + 2, 3, 2, o.c); }
        if (o.k === 'scooter') { rect(o.x, GROUND - 3, 3, 3, '#333'); rect(o.x + o.w - 3, GROUND - 3, 3, 3, '#333'); }
      }
    }

    // parent trailing
    shadow(34 - parLag, GROUND + 6);
    drawParent(34 - parLag, GROUND - 12, { type: state.parent, facing: 1, frame: (em.run | 0) % 2 });
    // Emmie
    shadow(34, GROUND + 6);
    drawEmmie(34, em.y - (em.duck ? 4 : 8), { facing: 1, frame: (em.run | 0) % 2 });
    if (em.duck) text('!', 34, em.y - 20, { size: 6, align: 'center', color: '#fff' });

    rect(8, 20, W - 16, 4, '#000');
    rect(8, 20, (W - 16) * clamp(dist / GOAL, 0, 1), 4, '#7CFC00');
    text('SCHOOL FENCE ▶', W - 8, 26, { size: 6, align: 'right', color: '#0a5' });
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
