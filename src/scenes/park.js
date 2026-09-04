// park.js — walk through the community park to the school gate.
import { W, H, rect, rr, text, dist } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { sfx } from '../audio.js';
import { state } from '../state.js';
import * as S from '../sprites.js';

const PW = 1500, PH = 340;

export const park = walkScene({
  id: 'park',
  title: 'Through the Park',
  next: 'fence',
  endText: 'Head to the school gate  ▶',
  build() {
    const world = createWorld({
      w: PW, h: PH, start: { x: 40, y: 250 }, speed: 104,
      solids: [
        { x: 0, y: 0, w: PW, h: 120 },            // top hedge / off-path
        { x: 0, y: 320, w: PW, h: 20 },
        { x: 260, y: 150, w: 120, h: 54 },        // pond
        { x: 520, y: 132, w: 44, h: 20 },         // bench
        { x: 1180, y: 120, w: 40, h: 40 },        // tree by the gate
      ],
    });
    const dog = { x: 780, y: 260, dir: 'left', anim: 0, tx: 780, wag: 0, pet: 0 };
    const C = {
      world, dog,
      parent: { x: 10, y: 262 },
      steps: [
        { label: 'say hi to the dog', objective: 'Say hi to the friendly dog', x: 780, y: 250, radius: 40, hold: 0.4, toast: 'Woof! 🐶', onDone: () => { dog.pet = 1.2; } },
        { label: 'reach the gate', objective: 'Walk to the school gate  ▶', x: 1400, y: 240, radius: 40, hold: 0.2 },
      ],
      tick(dt, t) {
        dog.anim += dt * 6; dog.wag += dt * 12;
        dog.x += Math.sin(t * 0.7) * 6 * dt;
        if (dog.pet > 0) { dog.pet -= dt; if (Math.random() < dt * 3) sfx.step(); }
        C.parent.x += ((world.em.x - 30) - C.parent.x) * Math.min(1, dt * 3);
        C.parent.y += ((world.em.y + 8) - C.parent.y) * Math.min(1, dt * 3);
        void dist;
      },
    };
    return C;
  },
  drawScene(C, t) {
    const wd = C.world, SX = wd.sx, SY = wd.sy;
    const p = painter();
    p.bg(() => {
      rect(0, 0, W, H, '#bfe3f2');
      S.ground(S.PAL.grass, S.PAL.grassD, 40, wd.cam.x, wd.cam.y, W, H);
      // winding path
      rr(SX(-20), SY(206), PW + 40, 70, 20, S.PAL.path);
      rr(SX(-20), SY(214), PW + 40, 8, 0, S.PAL.pathD);
    });
    // background scenery
    for (let i = 0; i < 10; i++) p.add(90 + i, () => S.drawTree(SX(120 + i * 150), SY(96 + (i % 3) * 6), 0.9 + (i % 3) * 0.1));
    p.add(150, () => S.drawPond(SX(320), SY(176), 130, 60));
    p.add(140, () => S.drawBench(SX(542), SY(150)));
    p.add(150, () => S.drawBush(SX(430), SY(150)));
    p.add(150, () => S.drawSquirrel(SX(600 + Math.sin(t) * 10), SY(200)));
    p.add(60, () => S.drawCloud(SX(300), SY(50), 1.1));
    p.add(60, () => S.drawCloud(SX(900), SY(70), 0.9));
    // the gate / school in the distance
    p.add(110, () => { S.drawSchoolBuilding(SX(1360), SY(150), 130, 96); S.drawFlagpole(SX(1330), SY(150)); });
    p.add(240, () => { for (let fx = 1180; fx < 1460; fx += 44) S.drawFence(SX(fx), SY(258), 44); });

    p.add(C.dog.y, () => S.drawDog(SX(C.dog.x), SY(C.dog.y), { dir: 'left' }));
    p.add(C.parent.y, () => S.drawParentBy(state.parent, SX(C.parent.x), SY(C.parent.y), { dir: 'right', anim: t * 5, moving: true }));
    p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving, backpack: '#7b3ff2' }));
    p.flush();

    if (C.dog.pet > 0) text('♥', SX(C.dog.x), SY(C.dog.y - 24 - (1.2 - C.dog.pet) * 14), { size: 13, align: 'center', color: '#ff6ea8' });
  },
});
