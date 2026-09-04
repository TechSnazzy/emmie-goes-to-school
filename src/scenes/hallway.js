// hallway.js — walk down the hall to Emmie's classroom cubbies.
import { W, H, rect, rr, text, rnd, rndi } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { state } from '../state.js';
import * as S from '../sprites.js';

const HW = 1400, HH = 300;
const TOP = 96, BOT = 270;

export const hallway = walkScene({
  id: 'hallway',
  title: 'Down the Hall',
  next: 'racks',
  endText: 'Almost there  ▶',
  build() {
    const world = createWorld({
      w: HW, h: HH, start: { x: 40, y: (TOP + BOT) / 2 }, speed: 104,
      solids: [
        { x: 0, y: 0, w: HW, h: TOP - 6 },
        { x: 0, y: BOT + 6, w: HW, h: HH },
        { x: 640, y: 150, w: 30, h: 26 },       // custodian cart
      ],
    });
    const kids = [];
    for (let i = 0; i < 6; i++) kids.push({ x: rnd(200, HW - 200), y: rnd(TOP + 14, BOT - 14), vx: rnd(-20, 20), vy: rnd(-14, 14), c: ['#e6883c', '#3ca0a0', '#a05ac0', '#5a8ad0'][rndi(0, 4)], anim: rnd(0, 6) });
    const C = {
      world, kids,
      steps: [
        { label: 'find your classroom', objective: 'Walk down the hall to Room 3', x: undefined, delay: 1.2 },
        { label: 'reach your cubby', objective: 'Go to your classroom cubbies  ▶', x: 1340, y: (TOP + BOT) / 2, radius: 42, hold: 0.2 },
      ],
      tick(dt) {
        for (const k of kids) {
          k.x += k.vx * dt; k.y += k.vy * dt; k.anim += dt * 6;
          if (k.x < 150 || k.x > HW - 120) k.vx *= -1;
          if (k.y < TOP + 10 || k.y > BOT - 10) k.vy *= -1;
          if (Math.random() < dt * 0.5) { k.vx = rnd(-20, 20); k.vy = rnd(-14, 14); }
          const dx = k.x - world.em.x, dy = k.y - world.em.y, d = Math.hypot(dx, dy);
          if (d < 16 && d > 0) { world.em.x -= dx / d * 24 * dt; world.em.y -= dy / d * 24 * dt; }
        }
      },
    };
    return C;
  },
  drawScene(C, t, idx) {
    const wd = C.world, SX = wd.sx, SY = wd.sy;
    const p = painter();
    p.bg(() => {
      rect(0, 0, W, H, '#e7e0cf');
      rr(SX(0), SY(TOP - 6), HW, BOT - TOP + 12, 0, '#d8cdb2');   // floor band
      for (let x = -(wd.cam.x % 40); x < W; x += 40) rect(x, SY(TOP), 1, BOT - TOP, 'rgba(0,0,0,0.05)');
      rr(SX(0), SY(-10), HW, TOP + 4, 0, '#cdbf9c');             // upper wall
    });
    p.add(TOP, () => S.drawLockers(SX(20), SY(TOP - 4), HW - 40));
    [[220, 'ROOM 1'], [520, 'ROOM 2'], [820, 'ART'], [1100, 'GYM']].forEach(([dx, lb]) => p.add(TOP + 1, () => S.drawClassDoor(SX(dx), SY(TOP - 2), lb)));
    p.add(150, () => S.drawCart(SX(655), SY(176)));
    p.add(BOT, () => S.drawTrashCan(SX(1000), SY(BOT)));
    p.add(TOP + 2, () => { rr(SX(1300), SY(TOP - 2), 80, 40, 4, '#f4f0e4'); text('ROOM 3', SX(1340), SY(TOP + 6), { size: 10, align: 'center', color: '#2a7d46', weight: '700' }); });

    for (const k of C.kids) p.add(k.y, () => S.drawKid(SX(k.x), SY(k.y), { color: k.c, dir: k.vx > 0 ? 'right' : 'left', anim: k.anim, moving: true }));
    p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving, backpack: '#7b3ff2' }));
    p.add(wd.em.y - 1, () => S.drawParentBy(state.parent, SX(wd.em.x - 24), SY(wd.em.y + 8), { dir: wd.em.dir === 'left' ? 'left' : 'right', anim: t * 3, moving: wd.em.moving }));
    p.flush();
    void idx;
  },
});
