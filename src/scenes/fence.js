// fence.js — the school gate is closed. Wait for a grown-up to open it, then
// walk through. (Pet the puppy while you wait!)
import { W, H, rect, rr, text, lerp } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { sfx } from '../audio.js';
import { state } from '../state.js';
import * as S from '../sprites.js';

const GW = 720, GH = 340;
const GATE = { x: 380, y: 210 };

export const fence = walkScene({
  id: 'fence',
  title: 'The School Gate',
  next: 'hallway',
  endText: 'Into the school  ▶',
  build() {
    const world = createWorld({
      w: GW, h: GH, start: { x: 60, y: 250 }, speed: 100,
      solids: [
        { x: 0, y: 0, w: GW, h: 150 },
        { x: 0, y: 322, w: GW, h: 18 },
        { x: 150, y: 176, w: 210, h: 8 },       // closed gate rail (removed when open)
        { x: 420, y: 150, w: GW, h: 60 },       // fence right of gate
      ],
    });
    const C = {
      world, staff: { x: GW + 40, y: 150 }, gateOpen: 0, puppy: { x: 120, y: 285, wag: 0, pet: 0 },
      locked: (idx) => idx === 0 && C.gateOpen < 0.9,
      steps: [
        {
          label: 'wait for the gate', objective: 'The gate is locked — wait for a grown-up',
          x: undefined, delay: 3.2,
          onDone: () => { world.setSolids([{ x: 0, y: 0, w: GW, h: 150 }, { x: 0, y: 322, w: GW, h: 18 }, { x: 420, y: 150, w: GW, h: 60 }]); },
        },
        { label: 'walk through', objective: 'Walk through the open gate  ▶', x: GATE.x, y: 250, radius: 40, hold: 0.2, toast: 'Good morning!' },
      ],
      tick(dt, t, idx) {
        C.puppy.wag += dt * 12;
        if (C.puppy.pet > 0) C.puppy.pet -= dt;
        if (Math.hypot(C.puppy.x - world.em.x, C.puppy.y - world.em.y) < 26 && (!C._pT || C._pT > 0.7)) { C._pT = 0; C.puppy.pet = 1; sfx.purr(); }
        C._pT = (C._pT || 0) + dt;
        // staff walks over and opens the gate during step 0
        if (idx === 0) {
          C.staff.x = lerp(C.staff.x, GATE.x + 60, Math.min(1, dt * 1.4));
          if (C.staff.x < GATE.x + 90) { C.gateOpen = Math.min(1, C.gateOpen + dt * 1.1); if (C.gateOpen > 0.02 && C.gateOpen < 0.1) sfx.knock(); }
        } else {
          C.staff.x = lerp(C.staff.x, GATE.x + 100, Math.min(1, dt * 1.2));
        }
      },
    };
    return C;
  },
  drawScene(C, t, idx) {
    const wd = C.world, SX = wd.sx, SY = wd.sy;
    const p = painter();
    p.bg(() => {
      rect(0, 0, W, H, '#bfe3f2');
      S.ground(S.PAL.grass, S.PAL.grassD, 40, wd.cam.x, wd.cam.y, W, H);
      rr(SX(-20), SY(228), GW + 40, 60, 0, '#c3c8cc');    // sidewalk to gate
    });
    p.add(120, () => { S.drawSchoolBuilding(SX(120), SY(150), 460, 120); });
    p.add(118, () => S.drawFlagpole(SX(70), SY(150)));
    p.add(150, () => { for (let fx = -10; fx < 150; fx += 44) S.drawFence(SX(fx), SY(184), 44); });
    p.add(150, () => { for (let fx = 420; fx < GW + 20; fx += 44) S.drawFence(SX(fx), SY(184), 44); });
    p.add(151, () => S.drawGate(SX(GATE.x - 40), SY(184), C.gateOpen));
    p.add(150, () => S.drawBush(SX(300), SY(150)));
    p.add(C.puppy.y, () => S.drawDog(SX(C.puppy.x), SY(C.puppy.y), { dir: 'right' }));
    p.add(C.staff.y + 40, () => S.drawTeacher(SX(C.staff.x), SY(C.staff.y + 40), { dir: 'left', anim: t * 4, moving: idx === 0 && C.staff.x > GATE.x + 62 }));
    p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving, backpack: '#7b3ff2' }));
    p.add(wd.em.y - 1, () => S.drawParentBy(state.parent, SX(wd.em.x - 26), SY(wd.em.y + 8), { dir: 'right', anim: t * 3, moving: wd.em.moving }));
    p.flush();

    if (C.puppy.pet > 0) text('♥', SX(C.puppy.x), SY(C.puppy.y - 22 - (1 - C.puppy.pet) * 12), { size: 12, align: 'center', color: '#ff6ea8' });
    if (idx === 0) text('Pet the puppy while you wait 🐶', W / 2, H - 26, { size: 11, align: 'center', color: '#2a3a4a', weight: '700' });
  },
});
