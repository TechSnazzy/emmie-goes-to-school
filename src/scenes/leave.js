// leave.js — through the house, grab the lunchbox, out to the white Tesla.
import { W, H, rect, rr, text, lerp } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { state } from '../state.js';
import * as S from '../sprites.js';

const LW = 1180, LH = 340;

export const leave = walkScene({
  id: 'leave',
  title: 'Out the Door',
  next: 'drive',
  endText: 'Buckle up — off to school!  ▶',
  build() {
    const world = createWorld({
      w: LW, h: LH, start: { x: 70, y: 230 }, speed: 100,
      solids: [
        { x: 0, y: 0, w: LW, h: 92 },              // back wall / house edge
        { x: 40, y: 150, w: 120, h: 46 },          // couch
        { x: 250, y: 96, w: 130, h: 30 },          // kitchen counter
        { x: 0, y: LH - 8, w: 700, h: 8 },         // house bottom wall
        { x: 640, y: 96, w: 20, h: 180 },          // doorway post
        { x: 0, y: 0, w: 16, h: LH },
        { x: 760, y: LH - 8, w: LW, h: 8 },
        { x: 980, y: 150, w: 90, h: 40 },          // the Tesla
      ],
    });
    const C = {
      world,
      parent: { x: 40, y: 240 },
      steps: [
        { label: 'lunchbox', objective: 'Grab your lunchbox from the kitchen', x: 315, y: 132, radius: 30, hold: 0.5, toast: 'Lunchbox!', onDone: (c) => { c.hasLunch = true; } },
        { label: 'get in the car', objective: 'Climb into the white Tesla', x: 1000, y: 196, radius: 34, hold: 0.4, toast: 'Ready!' },
      ],
      tick(dt) {
        C.parent.x = lerp(C.parent.x, world.em.x - 26, Math.min(1, dt * 3));
        C.parent.y = lerp(C.parent.y, world.em.y + 6, Math.min(1, dt * 3));
      },
    };
    return C;
  },
  drawScene(C, t, idx) {
    const wd = C.world, SX = wd.sx, SY = wd.sy;
    const p = painter();
    p.bg(() => {
      rect(0, 0, W, H, '#9ec9e8');
      // house interior
      rr(SX(-4), SY(-6), 704, LH, 4, S.PAL.wall);
      rr(SX(-4), SY(84), 704, 8, 0, S.PAL.wallD);
      rr(SX(20), SY(96), 620, LH - 108, 6, '#c79c72');
      // driveway
      rr(SX(700), SY(60), LW - 700, LH - 60, 4, '#8f9498');
      rr(SX(700), SY(54), LW - 700, 8, 2, S.PAL.grassD);
      for (let gx = 720; gx < LW; gx += 60) rect(SX(gx), SY(80), 2, LH - 100, 'rgba(255,255,255,0.4)');
      // lawn strip
      rr(SX(660), SY(300), LW, 60, 0, S.PAL.grass);
    });
    p.add(90, () => S.drawWindow(SX(120), SY(88), 54));
    p.add(126, () => { S.drawTable(SX(315), SY(126), 120); if (!C.hasLunch) S.drawLunchbox(SX(330), SY(122)); });
    p.add(150, () => S.drawTV(SX(500), SY(150)));
    p.add(196, () => S.drawCouch(SX(100), SY(196)));
    p.add(150, () => S.drawTable(SX(300), SY(224), 50));
    p.add(130, () => S.drawDoor(SX(650), SY(150), 40, true));
    p.add(70, () => S.drawTree(SX(760), SY(84), 1.0));
    p.add(72, () => S.drawMailbox(SX(1120), SY(300)));
    p.add(190, () => S.drawTesla(SX(1000), SY(200), { dir: 'left' }));
    p.add(C.parent.y, () => S.drawParentBy(state.parent, SX(C.parent.x), SY(C.parent.y), { dir: 'right', anim: t * 5, moving: true }));
    p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving, backpack: '#7b3ff2' }));
    p.flush();
    text('☀ It is 7:20 — time to go!', W / 2, H - 26, { size: 11, align: 'center', color: '#2a3a4a', weight: '700' });
    void idx;
  },
});
