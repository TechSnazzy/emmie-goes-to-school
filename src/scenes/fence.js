// fence.js — the gate is closed. Wait for a grown-up to open it, then walk through.
import { lerp } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';
import { sfx } from '../audio.js';

const GW = 760, GH = 400;
const GATE = { x: 400, y: 210 };

export const fence = walkScene({
  id: 'fence',
  title: 'The School Gate',
  next: 'hallway',
  endText: 'Into the school  ▶',
  build() {
    const world = createWorld({
      w: GW, h: GH, start: { x: 90, y: 300 }, speed: 104,
      solids: [
        { x: 0, y: 0, w: GW, h: 150 },
        { x: 0, y: GH - 16, w: GW, h: 16 },
        { x: 150, y: 196, w: 210, h: 12 },        // the closed gate rail
        { x: 440, y: 196, w: GW, h: 12 },
        { x: 0, y: 196, w: 150, h: 12 },
      ],
    });
    const C = {
      world,
      roomW: GW, roomH: GH, wallH: 170,
      camW: GW, camH: GH, shadowSpan: 610,
      staff: { x: GW + 60, y: 168 }, gateOpen: 0,
      puppy: { x: 180, y: 330 },
      locked: (idx) => idx === 0 && C.gateOpen < 0.92,
      steps: [
        {
          label: 'wait for the gate', objective: 'The gate is locked — wait for a grown-up',
          delay: 3.4,
          onDone: () => world.setSolids([
            { x: 0, y: 0, w: GW, h: 150 }, { x: 0, y: GH - 16, w: GW, h: 16 },
            { x: 440, y: 196, w: GW, h: 12 }, { x: 0, y: 196, w: 150, h: 12 },
          ]),
        },
        { label: 'walk through', objective: 'Walk through the open gate  ▶', x: GATE.x, y: 150, radius: 40, hold: 0.2, toast: 'Good morning!' },
      ],
      build3d(root) {
        root.add(put(M.makeGround(GW, GH, M.C.grass, { margin: 800 }), GW / 2, GH / 2));
        root.add(put(M.makeSlab(GW, 74, '#c9c6cf', 3), GW / 2, 268));
        root.add(put(M.makeSlab(320, 130, M.C.blacktop, 3), GATE.x, 110));

        root.add(put(M.makeSchool(430, 170, 150), 330, 40));
        root.add(put(M.makeFlagpole(), 70, 90));
        root.add(put(M.makeBush(), 620, 120));
        root.add(put(M.makeBush(0.8), 120, 130));

        for (let x = -10; x < 150; x += 46) root.add(put(M.makeFence(46), x, 200));
        for (let x = 444; x < GW + 40; x += 46) root.add(put(M.makeFence(46), x, 200));
        const gate = M.makeGate();
        put(gate, 154, 200);
        C.gate = gate;
        root.add(gate);

        const dog = M.makeDog();
        put(dog, C.puppy.x, C.puppy.y, Math.PI / 2);
        dog.scale.setScalar(0.7);
        C.puppyMesh = dog;
        root.add(dog);

        const teach = M.makePerson(M.PAL.teacher);
        put(teach, C.staff.x, C.staff.y);
        C.staffMesh = teach;
        root.add(teach);

        const dad = M.makePerson(M.PAL.dad);
        put(dad, 54, 316);
        C.dadMesh = dad;
        root.add(dad);
      },
      tick(dt, t, idx) {
        const em = world.em;
        if (idx === 0) {
          C.staff.x = lerp(C.staff.x, GATE.x + 90, Math.min(1, dt * 1.5));
          if (C.staff.x < GATE.x + 150) {
            const before = C.gateOpen;
            C.gateOpen = Math.min(1, C.gateOpen + dt * 0.85);
            if (before === 0) sfx.knock();
          }
        } else {
          C.staff.x = lerp(C.staff.x, GATE.x + 120, Math.min(1, dt * 1.2));
        }
        if (C.gate) C.gate.userData.leaf.rotation.y = -C.gateOpen * 1.7;
        const s = C.staffMesh;
        s.position.set(C.staff.x, 0, C.staff.y);
        s.rotation.y = -Math.PI / 2;
        M.stepPerson(s, t * 6, C.staff.x > GATE.x + 155);

        const d = C.dadMesh;
        const tx = em.x - 36, ty = em.y + 18;
        d.position.x = lerp(d.position.x, tx, Math.min(1, dt * 2.6));
        d.position.z = lerp(d.position.z, ty, Math.min(1, dt * 2.6));
        d.rotation.y = Math.atan2(em.x - d.position.x, em.y - d.position.z);
        M.stepPerson(d, em.anim * 1.2, em.moving);
      },
    };
    return C;
  },
});
