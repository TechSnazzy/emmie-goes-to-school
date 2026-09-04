// drive.js — drive the white Model Y to the park. Dodge morning traffic.
import { W, H, rect, text, sfx, input, clamp, rnd, rndi, chance } from '../engine.js';
import { state, tickClock, isLate, penalty } from '../state.js';
import { go } from '../router.js';
import { drawTesla, shadow } from '../sprites.js';

const RATE = 0.5;
const GOAL = 100;                       // "distance" to the park
const ROAD_X = 96, ROAD_W = 288;
const LANES = [ROAD_X + 48, ROAD_X + 144, ROAD_X + 240];

let carX, carLane, cars, dist, dashes, hitCd, shake, msg;

function reset() {
  carLane = 1;
  carX = LANES[1];
  cars = [];
  dist = 0;
  dashes = 0;
  hitCd = 0;
  shake = 0;
  msg = '◀ ▶  change lanes';
}

export const drive = {
  id: 'drive',
  enter() { reset(); state.running = true; sfx.engine(); },
  update(dt) {
    tickClock(dt, RATE);
    dist += dt * (GOAL / 19);           // ~19s clean run
    dashes += dt * 220;
    hitCd -= dt; shake *= 0.9;

    if (input.pressed('left') && carLane > 0) { carLane--; sfx.move(); }
    if (input.pressed('right') && carLane < 2) { carLane++; sfx.move(); }
    carX += (LANES[carLane] - carX) * Math.min(1, dt * 12);

    // spawn traffic
    if (chance(dt * 1.6)) {
      const lane = rndi(0, 3);
      if (!cars.some((c) => c.lane === lane && c.y < 30)) {
        cars.push({ lane, x: LANES[lane], y: -40, vy: rnd(70, 130), c: ['#c0392b', '#2980b9', '#f1c40f', '#7f8c8d', '#27ae60'][rndi(0, 5)] });
      }
    }
    const carY = H - 44;
    for (const c of cars) {
      c.y += (c.vy + dist * 0.4) * dt;
      if (hitCd <= 0 && Math.abs(c.x - carX) < 24 && Math.abs(c.y - carY) < 28) {
        hitCd = 1.1; shake = 6;
        sfx.bump();
        if (penalty(2, 'FENDER BENDER  +2 MIN')) return go('end', { win: false, reason: 'Stuck in traffic after a bump. Class had started.' });
        msg = 'watch the other cars!';
      }
    }
    for (let i = cars.length - 1; i >= 0; i--) if (cars[i].y > H + 40) cars.splice(i, 1);

    if (isLate()) return go('end', { win: false, reason: 'Still driving when the school bell rang.' });
    if (dist >= GOAL) return go('park');
  },
  draw() {
    rect(0, 0, W, H, '#3a4a3a');
    // grass texture
    for (let i = 0; i < 40; i++) rect((i * 53) % W, (i * 71 + (dist * 6 | 0)) % H, 2, 4, '#33422f');
    const sx = shake ? rnd(-shake, shake) : 0;
    rect(ROAD_X + sx, 0, ROAD_W, H, '#3b3b42');
    rect(ROAD_X + sx, 0, 3, H, '#e8e8e8');
    rect(ROAD_X + ROAD_W - 3 + sx, 0, 3, H, '#e8e8e8');
    for (const cx of [ROAD_X + 96, ROAD_X + 192]) {
      for (let y = -40; y < H; y += 40) rect(cx + sx, y + (dashes % 40), 3, 20, '#f1c40f');
    }

    for (const c of cars) {
      shadow(c.x + sx, c.y + 16, 16);
      rect(c.x - 12 + sx, c.y - 16, 24, 34, c.c);
      rect(c.x - 9 + sx, c.y - 10, 18, 10, '#243');
      rect(c.x - 9 + sx, c.y + 6, 18, 6, '#111');
      rect(c.x - 11 + sx, c.y - 16, 22, 3, '#111');
    }

    const carY = H - 44;
    shadow(carX + sx, carY + 18, 20);
    if (hitCd > 0 && (hitCd * 12 | 0) % 2) { /* blink */ } else drawTesla(carX + sx, carY, { facing: 1 });

    // progress
    rect(8, 22, 10, H - 44, '#000');
    rect(8, 22 + (H - 44) * (1 - clamp(dist / GOAL, 0, 1)), 10, 4, '#7CFC00');
    text('PARK', 6, H - 20, { size: 6, color: '#7CFC00' });
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
