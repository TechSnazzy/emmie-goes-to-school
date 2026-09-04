// drive.js — a gentle top-down drive to the park. You can't crash; bumping a
// car just goes "beep beep". Steer with the arrow keys.
import { W, H, ctx, rect, rr, text, clamp, rnd, chance, input } from '../engine.js';
import { state, tickProgress, setScene, setObjective, toast } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import * as S from '../sprites.js';

const ROAD_X = 150, ROAD_W = 340;
const GOAL = 100;

let t, carX, carScreenY, dist, cars, scroll, msgT, beepCd;

function reset() {
  t = 0; carX = W / 2; carScreenY = H - 90; dist = 0; cars = []; scroll = 0; msgT = 0; beepCd = 0;
  setScene('Driving to School', [{ label: 'reach the park', done: false }]);
}

export const drive = {
  id: 'drive',
  enter() { reset(); state.running = true; sfx.car(); },
  update(dt) {
    t += dt; tickProgress(dt); msgT += dt; beepCd -= dt;
    setObjective('Drive to the park — steer with ◀ ▶');
    dist += dt * (GOAL / 15);
    scroll = (scroll + dt * 150) % 48;

    const spd = 150;
    if (input.down('left')) carX -= spd * dt;
    if (input.down('right')) carX += spd * dt;
    carX = clamp(carX, ROAD_X + 24, ROAD_X + ROAD_W - 24);

    if (chance(dt * 1.1) && cars.length < 4) {
      const lane = ROAD_X + 50 + rnd(0, ROAD_W - 100);
      cars.push({ x: lane, y: -60, v: rnd(38, 70), c: ['#c94f4f', '#4f7fc9', '#e0b24d', '#5aa66a'][(Math.random() * 4) | 0] });
    }
    for (const c of cars) {
      c.y += (c.v + dist * 0.3) * dt;
      if (beepCd <= 0 && Math.abs(c.x - carX) < 34 && Math.abs(c.y - carScreenY) < 46) {
        beepCd = 1.2; sfx.beep(); toast('beep beep!', '#ffe066');
        carX += carX < c.x ? -20 : 20;
        carX = clamp(carX, ROAD_X + 24, ROAD_X + ROAD_W - 24);
      }
    }
    for (let i = cars.length - 1; i >= 0; i--) if (cars[i].y > H + 60) cars.splice(i, 1);

    if (dist >= GOAL) { toast('We are here!', '#8fe07a'); go('park'); }
  },
  draw() {
    rect(0, 0, W, H, S.PAL.grass);
    for (let i = 0; i < 12; i++) rect((i * 90 + (scroll * 3 | 0)) % W, (i * 57) % H, 3, 6, S.PAL.grassD);
    // road
    rr(ROAD_X, -10, ROAD_W, H + 20, 0, '#42474e');
    rect(ROAD_X - 6, 0, 6, H, '#dfe3e8'); rect(ROAD_X + ROAD_W, 0, 6, H, '#dfe3e8');
    for (let y = -48; y < H; y += 48) { rect(ROAD_X + ROAD_W / 3 - 3, y + scroll, 5, 26, '#f2d24d'); rect(ROAD_X + ROAD_W * 2 / 3 - 3, y + scroll, 5, 26, '#f2d24d'); }
    // roadside
    S.drawTree(ROAD_X - 60, (60 + scroll * 4) % (H + 120), 0.8);
    S.drawTree(ROAD_X + ROAD_W + 70, (200 + scroll * 4) % (H + 120), 0.9);

    for (const c of cars) S.drawCar(c.x, c.y, c.c, { dir: 'down' });
    S.drawTesla(carX, carScreenY, { dir: 'up' });
    // a little family in the windshield
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(carX - 10, carScreenY - 40, 6, 6); ctx.fillRect(carX + 4, carScreenY - 40, 6, 6);

    // progress
    rr(20, H / 2 - 70, 10, 140, 5, 'rgba(0,0,0,0.3)');
    rr(20, H / 2 - 70 + 140 * (1 - clamp(dist / GOAL, 0, 1)), 10, 8, 4, '#8fe07a');
    text('PARK', 14, H / 2 + 74, { size: 9, color: '#2a3a2a', weight: '700' });
    if (msgT < 3) text('Hold ◀ or ▶ to steer. You can\'t crash — have fun!', W / 2, H - 24, { size: 11, align: 'center', color: '#fff', weight: '700' });
  },
};
