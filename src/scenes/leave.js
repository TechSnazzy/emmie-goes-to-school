// leave.js — through the house, grab the lunchbox, out to the white Tesla.
import { lerp } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';

const LW = 1120, LH = 380;
const HOUSE_X = 620;

export const leave = walkScene({
  id: 'leave',
  title: 'Out the Door',
  next: 'drive',
  endText: 'Buckle up — off to school!  ▶',
  build() {
    const world = createWorld({
      w: LW, h: LH, start: { x: 90, y: 250 }, speed: 104,
      solids: [
        { x: 0, y: 0, w: LW, h: 18 },
        { x: 0, y: 0, w: 18, h: LH },
        { x: 0, y: LH - 14, w: LW, h: 14 },
        { x: 60, y: 150, w: 46, h: 100 },        // couch
        { x: 240, y: 22, w: 110, h: 40 },        // kitchen counter
        { x: 470, y: 40, w: 30, h: 60 },         // tv unit
        { x: HOUSE_X, y: 0, w: 22, h: 150 },     // wall stub by the front door
        { x: HOUSE_X, y: 250, w: 22, h: 130 },
        { x: 930, y: 130, w: 110, h: 110 },      // the car
      ],
    });
    const C = {
      world,
      camW: 300, camH: 300, viewSpan: 285, shadowSpan: 250,
      dad: { x: 40, y: 268 },
      steps: [
        { label: 'lunchbox', objective: 'Grab your lunchbox from the kitchen', x: 296, y: 96, my: 34, radius: 32, hold: 0.5, toast: 'Lunchbox!', onDone: (c) => { c.lunch.visible = false; c.hasLunch = true; } },
        { label: 'get in the car', objective: 'Climb into the white Tesla', x: 900, y: 190, radius: 36, hold: 0.4, toast: 'Ready!' },
      ],
      build3d(root) {
        // house floor + walls
        root.add(put(M.makeGround(HOUSE_X, LH, M.C.wood), HOUSE_X / 2, LH / 2));
        root.add(put(M.makeWall(HOUSE_X, 84, 16, M.C.wall), HOUSE_X / 2, 8));
        root.add(put(M.makeWall(16, 84, LH, M.C.wallD), 8, LH / 2));
        root.add(put(M.makeWall(20, 84, 150, M.C.wall), HOUSE_X + 10, 74));
        root.add(put(M.makeWall(20, 84, 130, M.C.wall), HOUSE_X + 10, 315));
        root.add(put(M.makeDoorway(52), HOUSE_X + 10, 200, Math.PI / 2));

        // outside: lawn + driveway
        root.add(put(M.makeGround(LW - HOUSE_X, LH, M.C.grass, { margin: 500 }), HOUSE_X + (LW - HOUSE_X) / 2, LH / 2));
        root.add(put(M.makeSlab(340, 210, '#b9bec6', 3), 900, 190));

        root.add(put(M.makeWindow(), 140, 12));
        root.add(put(M.makeCouch(), 84, 200, Math.PI / 2));
        root.add(put(M.makeTV(), 486, 70, -Math.PI / 2));
        root.add(put(M.makeTable(80, 46), 300, 250));
        root.add(put(M.makeCounter(120), 296, 42));
        root.add(put(M.makeRug(180, 120, '#c98fb0'), 240, 210));

        const lunch = put(M.makeLunchbox(), 296, 44);
        lunch.position.y = 34;
        C.lunch = lunch;
        root.add(lunch);

        root.add(put(M.makeTree(1.1), 720, 60));
        root.add(put(M.makeTree(0.9), 1060, 300));
        root.add(put(M.makeBush(), 700, 300));
        root.add(put(M.makeMailbox(), 1080, 120));

        const car = M.makeCar(M.C.car, { tesla: true });
        put(car, 980, 185, Math.PI / 2);
        root.add(car);

        const dad = M.makePerson(M.PAL.dad);
        put(dad, C.dad.x, C.dad.y);
        C.dadMesh = dad;
        root.add(dad);
      },
      tick(dt) {
        const em = world.em;
        C.dad.x = lerp(C.dad.x, em.x - 34, Math.min(1, dt * 2.6));
        C.dad.y = lerp(C.dad.y, em.y + 16, Math.min(1, dt * 2.6));
        const d = C.dadMesh;
        const mv = Math.hypot(em.x - 34 - C.dad.x, em.y + 16 - C.dad.y) > 3;
        d.position.set(C.dad.x, 0, C.dad.y);
        d.rotation.y = Math.atan2(em.x - C.dad.x, em.y - C.dad.y);
        M.stepPerson(d, em.anim * 1.2, mv || em.moving);
        if (C.hasLunch && C.emmie.userData.pack) C.emmie.userData.pack.visible = true;
      },
    };
    return C;
  },
});
