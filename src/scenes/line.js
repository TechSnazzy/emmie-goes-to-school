// line.js — line up in the schoolyard. Where Emmie ends up in line depends
// on her pace (beat her best time and she's nearer the front); the other
// kids fidget and shuffle until the teacher arrives, then everyone —
// teacher, Emmie, and the whole line — walks together into the school.
import { lerp } from '../engine.js';
import { walkScene, createWorld, put, go, toast, M } from './_kit.js';
import { sfx } from '../audio.js';
import { state, PAR } from '../state.js';

const YW = 760, YH = 400;
const LINE = { x: 540, y: 180 };
const DOOR = { x: 300, y: 95 }; // the school's front door, where everyone files in

export const line = walkScene({
  id: 'line',
  title: 'Line Up!',
  next: 'end',
  endText: '',
  endHold: 9999, // we call go(next) ourselves once the walk-into-school finishes
  build() {
    const world = createWorld({
      w: YW, h: YH, start: { x: 70, y: 320 }, speed: 112,
      solids: [{ x: 0, y: 0, w: YW, h: 110 }, { x: 0, y: YH - 16, w: YW, h: 16 }],
    });
    const C = {
      world,
      roomW: YW, roomH: YH, wallH: 150,
      camW: YW, camH: YH, shadowSpan: 610,
      teacher: { x: YW + 60, y: 150 }, greet: 0, lineKids: [],
      slot: null, departing: false, departT: 0, doneGoingNext: false,
      steps: [
        {
          label: 'get in line', objective: 'Get in line with your class!', x: LINE.x, y: LINE.y + 96, radius: 42, hold: 0.3, toast: 'You made it! 🎉',
          onDone: (c) => {
            // pace vs. best time (or PAR, if there's no best yet) decides where she slots in
            const ref = (state.best && state.best.time) || PAR;
            const ratio = state.elapsed / ref;
            c.slot = ratio < 0.92 ? 0 : ratio < 1.0 ? 1 : ratio < 1.08 ? 2 : ratio < 1.2 ? 3 : 4;
            let s = 0;
            for (const k of c.lineKids) {
              if (s === c.slot) s++;
              k.userData.slot = s; s++;
            }
          },
        },
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
          k.userData.slot = i;
          k.userData.phase = Math.random() * 10;
          C.lineKids.push(k);
          root.add(k);
        }
        const t = M.makePerson(M.PAL.teacher);
        put(t, C.teacher.x, C.teacher.y, -Math.PI / 2);
        C.teachMesh = t; root.add(t);

        const dad = M.makePerson(M.PAL.dad);
        put(dad, 30, 336);
        C.dadMesh = dad; root.add(dad);

        // parents, watching from the edge of the yard until their kids head in
        C.parents = [];
        for (const [px, py, i] of [[150, 300, 0], [690, 330, 1], [420, 372, 2]]) {
          const p = M.makeAdult(i);
          put(p, px, py, Math.atan2(LINE.x - px, LINE.y - py));
          C.parents.push(p);
          root.add(p);
        }
      },
      tick(dt, t, idx) {
        const em = world.em;
        const inLine = idx >= C.steps.length;
        const settled = C.greet > 2.4;

        for (const k of C.lineKids) {
          const fidget = inLine && !settled;
          if (!C.departing) {
            const slotY = LINE.y + k.userData.slot * 24;
            const jx = fidget ? Math.sin(t * 2.6 + k.userData.phase) * 5 : 0;
            const jz = fidget ? Math.sin(t * 1.9 + k.userData.phase * 1.3) * 4 : 0;
            k.position.x = lerp(k.position.x, LINE.x + jx, Math.min(1, dt * (fidget ? 4 : 2)));
            k.position.z = lerp(k.position.z, slotY + jz, Math.min(1, dt * (fidget ? 4 : 2)));
            M.stepPerson(k, fidget ? t * 5 + k.userData.phase : t * 2 + k.userData.phase, fidget);
          }
        }

        if (inLine) {
          C.greet += dt;
          if (!C.departing) C.teacher.x = lerp(C.teacher.x, LINE.x + 110, Math.min(1, dt * 1.6));
          if (C.greet > 0.5 && C.greet < 0.55) sfx.win();

          // Emmie slots in wherever her pace earned her
          if (!C.departing) {
            const mySlotY = LINE.y + (C.slot ?? 4) * 24;
            em.x = lerp(em.x, LINE.x, Math.min(1, dt * 3));
            em.y = lerp(em.y, mySlotY, Math.min(1, dt * 3));
            em.dir = 'up';
          }

          // once everyone's settled, say bye to Dad, then the whole line walks in together
          if (settled && !C.departing && C.greet > 3.1) {
            C.departing = true;
            em.dir = 'left';
            toast('Bye Dad! 👋'); sfx.confirm();
          }
          if (C.departing) {
            C.departT += dt;
            const p = Math.min(1, C.departT / 2.6);
            C.teacher.x = lerp(C.teacher.x, DOOR.x + 40, Math.min(1, dt * 1.8));
            C.teacher.y = lerp(C.teacher.y, DOOR.y, Math.min(1, dt * 1.8));
            em.x = lerp(em.x, DOOR.x, Math.min(1, dt * 1.8));
            em.y = lerp(em.y, DOOR.y + 8, Math.min(1, dt * 1.8));
            for (const k of C.lineKids) {
              k.position.x = lerp(k.position.x, DOOR.x, Math.min(1, dt * 1.8));
              k.position.z = lerp(k.position.z, DOOR.y + 12, Math.min(1, dt * 1.8));
              M.stepPerson(k, t * 6 + k.userData.phase, true);
            }
            if (p >= 1 && !C.doneGoingNext) { C.doneGoingNext = true; go('end'); }
          }
        }
        const tm = C.teachMesh;
        tm.position.set(C.teacher.x, 0, C.teacher.y);
        tm.rotation.y = C.departing ? Math.atan2(DOOR.x - C.teacher.x, DOOR.y - C.teacher.y) : -Math.PI / 2;
        M.stepPerson(tm, t * 6, C.departing || C.teacher.x > LINE.x + 118);

        const d = C.dadMesh;
        if (!C.departing) {
          const tx = inLine ? em.x - 60 : em.x - 36;
          d.position.x = lerp(d.position.x, tx, Math.min(1, dt * 2.4));
          d.position.z = lerp(d.position.z, em.y + 20, Math.min(1, dt * 2.4));
          d.rotation.y = Math.atan2(em.x - d.position.x, em.y - d.position.z);
        }
        M.stepPerson(d, em.anim * 1.2, em.moving && !C.departing);
      },
    };
    return C;
  },
});
