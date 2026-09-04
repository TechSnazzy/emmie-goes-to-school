// drive.js — a gentle drive to the park. You can't crash; a bump just beeps.
import { input, clamp, rnd, rndi, chance } from '../engine.js';
import { state, tickProgress, setScene, setObjective, toast } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import { newRoot, snapTo, lookAtWorld, setViewSpan, setShadowSpan, setSky, setLightLevel, pointerState, THREE } from '../render3d.js';
import * as M from '../models.js';

const ROAD_W = 260;
const LENGTH = 2600;           // world units of road
const SPEED = LENGTH / 15;     // ~15 second drive

let car, cars, root, dist, x, t, beepCd, msgT;

export const drive = {
  id: 'drive',
  enter() {
    root = newRoot();
    t = 0; dist = 0; x = 0; beepCd = 0; msgT = 0; cars = [];
    setViewSpan(330); setShadowSpan(300); setSky('#bfe6f2', '#6b7a5a'); setLightLevel(1);
    setScene('Driving to School', [{ label: 'reach the park', done: false }]);
    state.running = true;
    sfx.car();

    // ground + road running along -Z
    root.add(M.box(1600, 12, LENGTH + 600, M.C.grass, 0, -12, -LENGTH / 2));
    root.add(M.box(ROAD_W, 4, LENGTH + 600, M.C.road, 0, 0, -LENGTH / 2));
    root.add(M.box(6, 5, LENGTH + 600, '#e6e3ec', -ROAD_W / 2 + 4, 0, -LENGTH / 2));
    root.add(M.box(6, 5, LENGTH + 600, '#e6e3ec', ROAD_W / 2 - 4, 0, -LENGTH / 2));
    for (let z = 60; z > -LENGTH - 200; z -= 70) {
      root.add(M.box(6, 5, 34, M.C.line, -ROAD_W / 6, 0, z));
      root.add(M.box(6, 5, 34, M.C.line, ROAD_W / 6, 0, z));
    }
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
    t += dt; tickProgress(dt); beepCd -= dt; msgT += dt;
    setObjective('Drive to the park — click or drag to steer');
    dist += SPEED * dt;
    const z = -dist;

    let steer = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
    const ptr = pointerState();
    if (!steer && ptr.down && ptr.world) {
      const want = clamp(ptr.world.x, -ROAD_W / 2 + 26, ROAD_W / 2 - 26);
      steer = Math.abs(want - x) < 4 ? 0 : Math.sign(want - x);
    }
    x = clamp(x + steer * 150 * dt, -ROAD_W / 2 + 26, ROAD_W / 2 - 26);
    car.position.set(x, 0, z);
    car.rotation.z = -steer * 0.05;

    // traffic ahead, drifting toward us
    if (chance(dt * 1.3) && cars.length < 5) {
      const m = M.makeCar([M.C.coral, '#4f7fc9', M.C.yellow, '#5aa66a', '#a06ac8'][rndi(0, 5)]);
      const lane = rnd(-ROAD_W / 2 + 34, ROAD_W / 2 - 34);
      m.position.set(lane, 0, z - 620);
      m.rotation.y = Math.PI;
      root.add(m);
      cars.push({ m, v: rnd(50, 95) });
    }
    for (let i = cars.length - 1; i >= 0; i--) {
      const c = cars[i];
      c.m.position.z += (SPEED * 0.55 + c.v) * dt;
      if (beepCd <= 0 && Math.abs(c.m.position.x - x) < 46 && Math.abs(c.m.position.z - z) < 92) {
        beepCd = 1.3; sfx.beep(); toast('beep beep!');
        x = clamp(x + (x < c.m.position.x ? -34 : 34), -ROAD_W / 2 + 26, ROAD_W / 2 - 26);
      }
      if (c.m.position.z > z + 260) { root.remove(c.m); cars.splice(i, 1); }
    }

    lookAtWorld(x * 0.35, z, Math.min(1, dt * 5));
    if (dist >= LENGTH) { toast('We are here!'); go('park'); }
  },

  draw() { /* no 2D overlay — the panel + top bar carry the UI */ },
};

function place(obj, px, pz) { obj.position.x = px; obj.position.z = pz; return obj; }
void THREE;
