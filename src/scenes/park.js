// park.js — a longer walk through the community park to the school gate.
// Other families are out walking too — some faster than us, some slower,
// and we can't walk through them. The dog runs over to say hi partway
// through, and a squirrel darts by near the far end.
import { lerp, rnd, rndi, clamp } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';

const PW = 1700, PH = 400;
const DOG_STEP = 1; // index of the "say hi to the dog" step below

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
    const families = [
      { x: 500, y: 210, vx: 46, ai: 0, ki: 0 },   // slower than us — we'll pass them
      { x: 900, y: 300, vx: 150, ai: 1, ki: 1 },  // faster — passes us
      { x: 1200, y: 220, vx: -60, ai: 2, ki: 2 }, // heading back the other way
      { x: 700, y: 330, vx: -50, ai: 3, ki: 3 },
    ];
    const C = {
      world, families,
      roomW: 300, roomH: PH, wallH: 110,
      camW: 300, camH: 280, shadowSpan: 370,
      dad: { x: 20, y: 276 },
      dog: { x: 780, y: 270, tx: 780, ty: 270, pause: 0, mesh: null },
      squirrel: { x: 1260, y: 230, tx: 1260, ty: 230, pause: 0, mesh: null },
      steps: [
        { label: 'wave hello', objective: 'A family waves — wave back!', x: 340, y: 250, radius: 40, hold: 0.4, toast: 'Hi there! 👋' },
        { label: 'say hi to the dog', objective: 'Say hi to the friendly dog', x: 780, y: 270, radius: 46, hold: 0.4, toast: 'Woof! 🐶' },
        { label: 'spot the squirrel', objective: 'A squirrel scurries by', x: 1260, y: 230, radius: 44, hold: 0.3, toast: 'A squirrel! 🐿️' },
        { label: 'reach the gate', objective: 'Walk to the school gate  ▶', x: 1620, y: 250, radius: 42, hold: 0.2 },
      ],
      build3d(root) {
        root.add(put(M.makeGround(PW, PH, M.C.grass, { margin: 800 }), PW / 2, PH / 2));
        root.add(put(M.makeSlab(PW, 78, M.C.path, 3), PW / 2, 250));

        for (let i = 0; i < 13; i++) root.add(put(M.makeTree(0.9 + (i % 3) * 0.16), 90 + i * 130, 60 + (i % 3) * 22));
        for (let i = 0; i < 7; i++) root.add(put(M.makeBush(0.9), 200 + i * 230, 340 + (i % 2) * 20));
        root.add(put(M.makePond(150, 76), 375, 168));
        root.add(put(M.makeBench(), 640, 150));
        root.add(put(M.makeBench(), 1080, 150));
        root.add(put(M.makeTrashCan(), 500, 300));

        // the school + its fence at the far end
        root.add(put(M.makeSchool(300, 150, 130), PW - 80, 40));
        root.add(put(M.makeFlagpole(), PW - 250, 70));
        for (let x = PW - 320; x < PW; x += 46) root.add(put(M.makeFence(46), x, 150));

        const dog = M.makeDog();
        put(dog, C.dog.x, C.dog.y, -Math.PI / 2);
        C.dog.mesh = dog;
        root.add(dog);

        const squirrel = M.makeSquirrel();
        put(squirrel, C.squirrel.x, C.squirrel.y);
        C.squirrel.mesh = squirrel;
        root.add(squirrel);

        for (const f of families) {
          const adult = M.makeAdult(f.ai);
          const kid = M.makeKid(f.ki);
          put(adult, f.x, f.y);
          put(kid, f.x, f.y);
          f.adultMesh = adult; f.kidMesh = kid;
          root.add(adult, kid);
        }

        const dad = M.makePerson(M.PAL.dad);
        put(dad, C.dad.x, C.dad.y);
        C.dadMesh = dad;
        root.add(dad);
      },
      tick(dt, t, idx) {
        const em = world.em;

        // --- other families out walking: real obstacles, some faster/slower ---
        for (const f of families) {
          f.x += f.vx * dt;
          if (f.vx > 0 && f.x > PW + 60) f.x = -60;
          if (f.vx < 0 && f.x < -60) f.x = PW + 60;
          const facing = f.vx >= 0 ? Math.PI / 2 : -Math.PI / 2;
          const kidOff = f.vx >= 0 ? -14 : 14;
          if (f.adultMesh) {
            f.adultMesh.position.set(f.x, 0, f.y);
            f.adultMesh.rotation.y = facing;
            M.stepPerson(f.adultMesh, t * 6 + f.ai, true);
          }
          if (f.kidMesh) {
            f.kidMesh.position.set(f.x + kidOff, 0, f.y + 8);
            f.kidMesh.rotation.y = facing;
            M.stepPerson(f.kidMesh, t * 7 + f.ki, true);
          }
          for (const [px, py, r] of [[f.x, f.y, 28], [f.x + kidOff, f.y + 8, 22]]) {
            const dx = px - em.x, dy = py - em.y, d = Math.hypot(dx, dy);
            if (d < r && d > 0) { em.x -= dx / d * 32 * dt; em.y -= dy / d * 32 * dt; }
          }
        }

        // --- the dog: idle-wanders, then runs to intercept once it's "her" step ---
        const dog = C.dog;
        if (idx === DOG_STEP) {
          const dx = em.x - dog.x, dy = em.y - dog.y, d = Math.hypot(dx, dy) || 1;
          if (d > 46) { dog.x += dx / d * 160 * dt; dog.y += dy / d * 160 * dt; }
          C.steps[DOG_STEP].x = dog.x; C.steps[DOG_STEP].y = dog.y;
          if (dog.mesh) dog.mesh.rotation.y = Math.atan2(dx, dy);
        } else {
          dog.pause -= dt;
          const dx = dog.tx - dog.x, dy = dog.ty - dog.y, d = Math.hypot(dx, dy);
          if (d < 6 && dog.pause <= 0) { dog.tx = clamp(dog.x + rnd(-80, 80), 60, PW - 60); dog.ty = clamp(dog.y + rnd(-30, 30), 150, 340); dog.pause = rnd(0.8, 2); }
          if (d > 4) { dog.x += dx / d * 40 * dt; dog.y += dy / d * 40 * dt; if (dog.mesh) dog.mesh.rotation.y = Math.atan2(dx, dy); }
        }
        if (dog.mesh) dog.mesh.position.set(dog.x, Math.abs(Math.sin(t * 8)) * 2, dog.y);

        // --- the squirrel: tight, skittish idle wander near its tree ---
        const sq = C.squirrel;
        sq.pause -= dt;
        const sdx = sq.tx - sq.x, sdy = sq.ty - sq.y, sd = Math.hypot(sdx, sdy);
        if (sd < 4 && sq.pause <= 0) { sq.tx = clamp(1260 + rnd(-60, 60), 1200, PW - 60); sq.ty = clamp(230 + rnd(-40, 40), 170, 320); sq.pause = rnd(0.5, 1.4); }
        if (sd > 3) { sq.x += sdx / sd * 90 * dt; sq.y += sdy / sd * 90 * dt; if (sq.mesh) sq.mesh.rotation.y = Math.atan2(sdx, sdy); }
        if (sq.mesh) sq.mesh.position.set(sq.x, 0, sq.y);

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
