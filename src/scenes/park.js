// park.js — walk through the community park to the school gate.
import { lerp, rndi } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';

const PW = 1500, PH = 400;

export const park = walkScene({
  id: 'park',
  title: 'Through the Park',
  next: 'fence',
  endText: 'Head to the school gate  ▶',
  build() {
    const world = createWorld({
      w: PW, h: PH, start: { x: 60, y: 260 }, speed: 108,
      solids: [
        { x: 0, y: 0, w: PW, h: 120 },
        { x: 0, y: PH - 20, w: PW, h: 20 },
        { x: 300, y: 132, w: 150, h: 70 },      // pond
        { x: 610, y: 140, w: 60, h: 22 },       // bench
      ],
    });
    const C = {
      world,
      camW: 300, camH: 280, viewSpan: 285, shadowSpan: 250,
      dad: { x: 20, y: 276 },
      dog: { x: 880, y: 262, wag: 0, mesh: null },
      steps: [
        { label: 'say hi to the dog', objective: 'Say hi to the friendly dog', x: 880, y: 262, radius: 42, hold: 0.4, toast: 'Woof! 🐶' },
        { label: 'reach the gate', objective: 'Walk to the school gate  ▶', x: 1420, y: 250, radius: 42, hold: 0.2 },
      ],
      build3d(root) {
        root.add(put(M.makeGround(PW, PH, M.C.grass, { margin: 800 }), PW / 2, PH / 2));
        root.add(put(M.makeSlab(PW, 78, M.C.path, 3), PW / 2, 250));

        for (let i = 0; i < 11; i++) root.add(put(M.makeTree(0.9 + (i % 3) * 0.16), 90 + i * 130, 60 + (i % 3) * 22));
        for (let i = 0; i < 6; i++) root.add(put(M.makeBush(0.9), 200 + i * 230, 340 + (i % 2) * 20));
        root.add(put(M.makePond(150, 76), 375, 168));
        root.add(put(M.makeBench(), 640, 150));
        root.add(put(M.makeBench(), 1080, 150));
        root.add(put(M.makeTrashCan(), 500, 300));

        // the school + its fence at the far end
        root.add(put(M.makeSchool(300, 150, 130), 1420, 40));
        root.add(put(M.makeFlagpole(), 1250, 70));
        for (let x = 1180; x < PW; x += 46) root.add(put(M.makeFence(46), x, 150));

        const dog = M.makeDog();
        put(dog, C.dog.x, C.dog.y, -Math.PI / 2);
        C.dog.mesh = dog;
        root.add(dog);

        const dad = M.makePerson(M.PAL.dad);
        put(dad, C.dad.x, C.dad.y);
        C.dadMesh = dad;
        root.add(dad);
      },
      tick(dt, t) {
        const em = world.em;
        C.dog.wag += dt * 8;
        if (C.dog.mesh) C.dog.mesh.position.y = Math.abs(Math.sin(t * 3)) * 2;
        C.dad.x = lerp(C.dad.x, em.x - 36, Math.min(1, dt * 2.6));
        C.dad.y = lerp(C.dad.y, em.y + 16, Math.min(1, dt * 2.6));
        const d = C.dadMesh;
        d.position.set(C.dad.x, 0, C.dad.y);
        d.rotation.y = Math.atan2(em.x - C.dad.x, em.y - C.dad.y);
        M.stepPerson(d, em.anim * 1.2, em.moving);
        void rndi;
      },
    };
    return C;
  },
});
