// hallway.js — walk down the hall to Emmie's classroom cubbies.
import { lerp, rnd, rndi } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';

const HW = 1360, HH = 300;
const TOP = 70, BOT = 268;

export const hallway = walkScene({
  id: 'hallway',
  title: 'Down the Hall',
  next: 'racks',
  endText: 'Almost there  ▶',
  build() {
    const world = createWorld({
      w: HW, h: HH, start: { x: 60, y: (TOP + BOT) / 2 }, speed: 108,
      solids: [
        { x: 0, y: 0, w: HW, h: TOP - 10 },
        { x: 0, y: BOT + 8, w: HW, h: HH },
        { x: 640, y: 150, w: 34, h: 30 },
      ],
    });
    const kids = [];
    for (let i = 0; i < 7; i++) {
      kids.push({ x: rnd(220, HW - 180), y: rnd(TOP + 20, BOT - 20), vx: rnd(-22, 22), vy: rnd(-14, 14), i: rndi(0, 6), mesh: null });
    }
    const C = {
      world, kids,
      camW: 300, camH: 300, viewSpan: 280, shadowSpan: 250,
      sky: '#d8cdb2', groundTint: '#8a7f68',
      dad: { x: 20, y: 190 },
      steps: [
        { label: 'find your classroom', objective: 'Walk down the hall to Room 3', delay: 1.2 },
        { label: 'reach your cubby', objective: 'Go to your classroom cubbies  ▶', x: 1300, y: (TOP + BOT) / 2, radius: 44, hold: 0.2 },
      ],
      build3d(root) {
        root.add(put(M.makeGround(HW, HH, M.C.tile), HW / 2, HH / 2));
        root.add(put(M.makeWall(HW, 96, 24, M.C.wallD), HW / 2, TOP - 22));
        root.add(put(M.makeLockers(HW - 60), 30, TOP - 6));
        for (const [x, tone] of [[260, 0], [560, 1], [880, 0], [1120, 1]]) {
          root.add(put(M.makeDoorway(56, tone ? M.C.woodD : '#7d5a3a'), x, TOP - 8));
        }
        root.add(put(M.makeCart(), 656, 165));
        root.add(put(M.makeTrashCan(), 980, 240));
        root.add(put(M.makeCubbies(150), 1330, TOP + 6));

        for (const k of kids) {
          const m = M.makeKid(k.i);
          put(m, k.x, k.y);
          k.mesh = m;
          root.add(m);
        }
        const dad = M.makePerson(M.PAL.dad);
        put(dad, C.dad.x, C.dad.y);
        C.dadMesh = dad;
        root.add(dad);
      },
      tick(dt) {
        const em = world.em;
        for (const k of kids) {
          k.x += k.vx * dt; k.y += k.vy * dt;
          if (k.x < 200 || k.x > HW - 140) k.vx *= -1;
          if (k.y < TOP + 16 || k.y > BOT - 16) k.vy *= -1;
          if (Math.random() < dt * 0.4) { k.vx = rnd(-22, 22); k.vy = rnd(-14, 14); }
          const dx = k.x - em.x, dy = k.y - em.y, d = Math.hypot(dx, dy);
          if (d < 26 && d > 0) { em.x -= dx / d * 30 * dt; em.y -= dy / d * 30 * dt; }
          if (k.mesh) {
            k.mesh.position.set(k.x, 0, k.y);
            k.mesh.rotation.y = Math.atan2(k.vx, k.vy);
            M.stepPerson(k.mesh, (k.x + k.y) * 0.08, true);
          }
        }
        const d = C.dadMesh;
        d.position.x = lerp(d.position.x, em.x - 34, Math.min(1, dt * 2.6));
        d.position.z = lerp(d.position.z, em.y + 16, Math.min(1, dt * 2.6));
        d.rotation.y = Math.atan2(em.x - d.position.x, em.y - d.position.z);
        M.stepPerson(d, em.anim * 1.2, em.moving);
      },
    };
    return C;
  },
});
