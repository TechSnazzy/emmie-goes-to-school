// line.js — line up in the schoolyard. The teacher comes out to say hello.
import { lerp } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';
import { sfx } from '../audio.js';

const YW = 760, YH = 400;
const LINE = { x: 540, y: 180 };

export const line = walkScene({
  id: 'line',
  title: 'Line Up!',
  next: 'end',
  endText: '',
  endHold: 3.4,
  build() {
    const world = createWorld({
      w: YW, h: YH, start: { x: 70, y: 320 }, speed: 112,
      solids: [{ x: 0, y: 0, w: YW, h: 110 }, { x: 0, y: YH - 16, w: YW, h: 16 }],
    });
    const C = {
      world,
      camW: 320, camH: 300, viewSpan: 300, shadowSpan: 270,
      teacher: { x: YW + 60, y: 150 }, greet: 0, lineKids: [],
      steps: [
        { label: 'get in line', objective: 'Get in line with your class!', x: LINE.x, y: LINE.y + 96, radius: 42, hold: 0.3, toast: 'You made it! 🎉' },
      ],
      build3d(root) {
        root.add(put(M.makeGround(YW, YH, M.C.blacktop, { margin: 800 }), YW / 2, YH / 2));
        root.add(put(M.makeSlab(YW, 60, M.C.grass, 4), YW / 2, 130));
        root.add(put(M.makeSchool(480, 150, 130), 300, 50));
        root.add(put(M.makeFlagpole(), 74, 120));
        root.add(put(M.makeBush(), 640, 140));
        // painted line
        for (let i = 0; i < 7; i++) root.add(put(M.makeSlab(30, 8, M.C.line, 2), LINE.x + 40, LINE.y - 10 + i * 24));

        for (let i = 0; i < 4; i++) {
          const k = M.makeKid(i);
          put(k, LINE.x, LINE.y + i * 24, Math.PI);
          C.lineKids.push(k);
          root.add(k);
        }
        const t = M.makePerson(M.PAL.teacher);
        put(t, C.teacher.x, C.teacher.y, -Math.PI / 2);
        C.teachMesh = t; root.add(t);

        const dad = M.makePerson(M.PAL.dad);
        put(dad, 30, 336);
        C.dadMesh = dad; root.add(dad);
      },
      tick(dt, t, idx) {
        const em = world.em;
        C.lineKids.forEach((k, i) => M.stepPerson(k, t * 2 + i, false));
        if (idx >= C.steps.length) {
          C.greet += dt;
          C.teacher.x = lerp(C.teacher.x, LINE.x + 110, Math.min(1, dt * 1.6));
          if (C.greet > 0.5 && C.greet < 0.55) sfx.win();
          // Emmie slots into the back of the line
          em.x = lerp(em.x, LINE.x, Math.min(1, dt * 3));
          em.y = lerp(em.y, LINE.y + 96, Math.min(1, dt * 3));
          em.dir = 'up';
        }
        const tm = C.teachMesh;
        tm.position.set(C.teacher.x, 0, C.teacher.y);
        tm.rotation.y = -Math.PI / 2;
        M.stepPerson(tm, t * 6, C.teacher.x > LINE.x + 118);

        const d = C.dadMesh;
        const tx = idx >= C.steps.length ? em.x - 60 : em.x - 36;
        d.position.x = lerp(d.position.x, tx, Math.min(1, dt * 2.4));
        d.position.z = lerp(d.position.z, em.y + 20, Math.min(1, dt * 2.4));
        d.rotation.y = Math.atan2(em.x - d.position.x, em.y - d.position.z);
        M.stepPerson(d, em.anim * 1.2, em.moving);
      },
    };
    return C;
  },
});
