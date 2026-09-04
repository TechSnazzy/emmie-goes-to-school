// drive.js — a gentle drive to the park. You can't crash; a bump just beeps.
// Two real lanes: ours drives the same way we do (pass or get passed),
// the far lane comes toward us on its own side. Speed is up to you —
// coast too slow and someone behind gives a friendly honk; floor it and
// you'll hear a siren.
import { input, clamp, lerp, rnd, rndi, chance } from '../engine.js';
import { state, tickProgress, setScene, setObjective, toast } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import { newRoot, snapTo, lookAtWorld, setRoomBounds, setShadowSpan, setSky, setLightLevel, pointerState, THREE } from '../render3d.js';
import * as M from '../models.js';

const ROAD_W = 260;
const LENGTH = 4200;              // world units of road
const CRUISE_SPEED = 110;         // the "comfortable" pace — ~38s at cruise
const MIN_SPEED = 40, MAX_SPEED = 210;
const ACCEL = 90;                 // units/s^2 while gas/brake is held
const DRIFT = 0.8;                // how eagerly speed eases back to cruise

let car, cars, root, dist, x, t, beepCd, msgT, playerSpeed, slowT, fastT, honkCd, sirenCd;

export const drive = {
  id: 'drive',
  enter() {
    root = newRoot();
    t = 0; dist = 0; x = 0; beepCd = 0; msgT = 0; cars = [];
    playerSpeed = CRUISE_SPEED; slowT = 0; fastT = 0; honkCd = 0; sirenCd = 0;
    setRoomBounds(400, 260, 90); setShadowSpan(320); setSky('#bfe6f2', '#6b7a5a'); setLightLevel(1);
    setScene('Driving to School', [{ label: 'reach the park', done: false }]);
    state.running = true;
    sfx.car();

    // ground + road running along -Z
    root.add(M.box(1600, 12, LENGTH + 600, M.C.grass, 0, -12, -LENGTH / 2));
    root.add(M.box(ROAD_W, 4, LENGTH + 600, M.C.road, 0, 0, -LENGTH / 2));
    root.add(M.box(6, 5, LENGTH + 600, '#e6e3ec', -ROAD_W / 2 + 4, 0, -LENGTH / 2));
    root.add(M.box(6, 5, LENGTH + 600, '#e6e3ec', ROAD_W / 2 - 4, 0, -LENGTH / 2));
    // solid centre line — the two lanes are real now
    for (let z = 60; z > -LENGTH - 200; z -= 40) root.add(M.box(5, 5, 22, M.C.line, 0, 0, z));
    for (let z = 0; z > -LENGTH - 200; z -= 150) {
      root.add(place(M.makeTree(0.9 + Math.random() * 0.4), -ROAD_W / 2 - rnd(60, 150), z));
      root.add(place(M.makeTree(0.9 + Math.random() * 0.4), ROAD_W / 2 + rnd(60, 150), z - 70));
      if (chance(0.4)) root.add(place(M.makeBush(), -ROAD_W / 2 - 40, z - 40));
    }

    car = M.makeCar(M.C.car, { tesla: true });
    root.add(car);
    snapTo(0, 0);
  },

  update(dt) {
    t += dt; tickProgress(dt); beepCd -= dt; msgT += dt; honkCd -= dt; sirenCd -= dt;
    setObjective('Drive to the park — steer, and ↑/↓ (or drag) to speed up or slow down');
    const z0 = -dist;

    // --- speed: keyboard up/down, or drag forward/back of the car ---
    const gas = input.down('up') ? 1 : input.down('down') ? -1 : 0;
    const ptr = pointerState();
    let speedWant = 0;
    if (!gas && ptr.down && ptr.world) {
      const aheadBy = z0 - ptr.world.y; // positive = dragging ahead of the car
      if (Math.abs(aheadBy) > 40) speedWant = Math.sign(aheadBy);
    }
    const throttle = gas || speedWant;
    if (throttle) playerSpeed = clamp(playerSpeed + throttle * ACCEL * dt, MIN_SPEED, MAX_SPEED);
    else playerSpeed = lerp(playerSpeed, CRUISE_SPEED, Math.min(1, dt * DRIFT));

    dist += playerSpeed * dt;
    const z = -dist;

    // --- steering: keyboard left/right, or drag toward the pointer ---
    let steer = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
    if (!steer && ptr.down && ptr.world) {
      const want = clamp(ptr.world.x, -ROAD_W / 2 + 26, ROAD_W / 2 - 26);
      steer = Math.abs(want - x) < 4 ? 0 : Math.sign(want - x);
    }
    x = clamp(x + steer * 150 * dt, -ROAD_W / 2 + 26, ROAD_W / 2 - 26);
    car.position.set(x, 0, z);
    car.rotation.z = -steer * 0.05;

    // --- too slow / too fast feedback ---
    if (playerSpeed < CRUISE_SPEED * 0.55) { slowT += dt; fastT = 0; }
    else if (playerSpeed > CRUISE_SPEED * 1.7) { fastT += dt; slowT = 0; }
    else { slowT = 0; fastT = 0; }
    if (slowT > 1.6 && honkCd <= 0) {
      sfx.honk(); toast('Beep! You can go a little faster.'); honkCd = 3; slowT = 0;
    }
    if (fastT > 1.2 && sirenCd <= 0) {
      sfx.siren(); toast('Whoop whoop! Slow down a bit.'); sirenCd = 4.5; fastT = 0;
      spawnPolice(z);
    }

    // --- traffic: right half drives with us, left half comes toward us ---
    if (chance(dt * 1.1) && cars.length < 7) {
      const oncoming = Math.random() < 0.5;
      const m = M.makeCar([M.C.coral, '#4f7fc9', M.C.yellow, '#5aa66a', '#a06ac8'][rndi(0, 5)]);
      if (oncoming) {
        const lane = rnd(-ROAD_W / 2 + 34, -14);
        m.position.set(lane, 0, z - 620);
        m.rotation.y = Math.PI;
        cars.push({ m, oncoming: true, v: rnd(50, 95) });
      } else {
        const lane = rnd(14, ROAD_W / 2 - 34);
        m.position.set(lane, 0, z - rnd(200, 560));
        cars.push({ m, oncoming: false, v: rnd(-45, 55) }); // some slower than cruise, some faster
      }
      root.add(m);
    }
    for (let i = cars.length - 1; i >= 0; i--) {
      const c = cars[i];
      if (c.oncoming) c.m.position.z += (CRUISE_SPEED * 0.55 + c.v) * dt;
      else c.m.position.z -= (CRUISE_SPEED + c.v) * dt;
      if (c.police) { c.blinkT += dt; c.beacon.visible = Math.floor(c.blinkT * 6) % 2 === 0; }
      if (beepCd <= 0 && Math.abs(c.m.position.x - x) < 46 && Math.abs(c.m.position.z - z) < 92) {
        beepCd = 1.3; sfx.beep(); toast('beep beep!');
        x = clamp(x + (x < c.m.position.x ? -34 : 34), -ROAD_W / 2 + 26, ROAD_W / 2 - 26);
      }
      if (c.m.position.z > z + 260 || c.m.position.z < z - 520) { root.remove(c.m); cars.splice(i, 1); }
    }

    lookAtWorld(x * 0.35, z, Math.min(1, dt * 5));
    if (dist >= LENGTH) { toast('We are here!'); go('park'); }
  },

  draw() { /* no 2D overlay — the panel + top bar carry the UI */ },
};

function spawnPolice(z) {
  const m = M.makeCar('#1c1c22'); // black & white cruiser with a blinking red beacon
  m.add(M.box(46, 3, 30, '#f6f4f0', 0, 17, -10));
  m.add(M.box(14, 4, 10, '#26262c', 0, 30, 0));
  const beacon = M.box(6, 3, 6, '#ff3b30', -5, 33, 0);
  m.add(beacon);
  const lane = clamp(x + rnd(-20, 20), 14, ROAD_W / 2 - 34);
  m.position.set(lane, 0, z + 200);
  root.add(m);
  cars.push({ m, oncoming: false, v: 140, police: true, beacon, blinkT: 0 }); // catches up, then blows past
}

function place(obj, px, pz) { obj.position.x = px; obj.position.z = pz; return obj; }
void THREE;
