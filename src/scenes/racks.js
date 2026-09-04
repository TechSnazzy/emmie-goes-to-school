// racks.js — hang the backpack on the hook, put the lunchbox in the bin.
import { W, H, rect, rr, text } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { state } from '../state.js';
import * as S from '../sprites.js';

const RW = 600, RH = 320;

export const racks = walkScene({
  id: 'racks',
  title: 'Backpack & Lunchbox',
  next: 'line',
  endText: 'Time to line up  ▶',
  build() {
    const world = createWorld({
      w: RW, h: RH, start: { x: 300, y: 250 }, speed: 96,
      solids: [
        { x: 0, y: 0, w: RW, h: 120 },
        { x: 0, y: RH - 8, w: RW, h: 8 },
        { x: 0, y: 0, w: 16, h: RH }, { x: RW - 16, y: 0, w: 16, h: RH },
      ],
    });
    const C = {
      world, hasPack: true, hasLunch: true,
      steps: [
        { label: 'hang up backpack', objective: 'Hang your backpack on your hook', x: 150, y: 168, radius: 34, hold: 0.7, toast: 'Backpack away!', onDone: (c) => { c.hasPack = false; } },
        { label: 'lunchbox in the bin', objective: 'Put your lunchbox in the lunch bin', x: 450, y: 210, radius: 32, hold: 0.7, toast: 'Lunchbox in!', onDone: (c) => { c.hasLunch = false; } },
      ],
    };
    return C;
  },
  drawScene(C, t, idx) {
    const wd = C.world, SX = wd.sx, SY = wd.sy;
    const p = painter();
    p.bg(() => {
      rect(0, 0, W, H, '#e7e0cf');
      rr(SX(8), SY(110), RW - 16, RH - 118, 6, '#d8cdb2');
      rr(SX(8), SY(-6), RW - 16, 118, 4, S.PAL.wall);
      rr(SX(8), SY(104), RW - 16, 8, 0, S.PAL.wallD);
    });
    p.add(120, () => { S.drawCubbies(SX(150), SY(120), 150); if (C.hasPack === false) S.drawBackpack(SX(150), SY(96)); });
    p.add(122, () => S.drawClassDoor(SX(300), SY(114), 'ROOM 3'));
    p.add(210, () => { S.drawLunchBin(SX(450), SY(216)); if (C.hasLunch === false) S.drawLunchbox(SX(450), SY(198)); });
    p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving, backpack: C.hasPack ? '#7b3ff2' : null }));
    if (C.hasLunch) p.add(wd.em.y + 0.1, () => S.drawLunchbox(SX(wd.em.x + (wd.em.dir === 'left' ? -12 : 12)), SY(wd.em.y - 6)));
    p.add(wd.em.y - 1, () => S.drawParentBy(state.parent, SX(wd.em.x - 24), SY(wd.em.y + 10), { dir: 'down', anim: t * 2, moving: false }));
    p.flush();
    void idx;
  },
});
