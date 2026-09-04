// line.js — line up in the schoolyard. The teacher comes out to say hello.
import { W, H, rect, rr, text, lerp, rndi } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { sfx } from '../audio.js';
import { state } from '../state.js';
import * as S from '../sprites.js';

const YW = 720, YH = 320;
const LINE = { x: 540, y: 150 };

export const line = walkScene({
  id: 'line',
  title: 'Line Up!',
  next: 'end',
  endText: '',
  endHold: 3.2,
  build() {
    const world = createWorld({
      w: YW, h: YH, start: { x: 40, y: 250 }, speed: 108,
      solids: [{ x: 0, y: 0, w: YW, h: 90 }, { x: 0, y: YH - 8, w: YW, h: 8 }],
    });
    const C = {
      world, teacher: { x: YW + 30, y: 110 }, greet: 0,
      steps: [
        { label: 'get in line', objective: 'Get in line with your class!', x: LINE.x, y: LINE.y + 40, radius: 40, hold: 0.3, toast: 'You made it! 🎉', onDone: () => { sfx.confirm(); } },
      ],
      tick(dt, t, idx) {
        if (idx >= C.steps.length) {
          C.greet += dt;
          C.teacher.x = lerp(C.teacher.x, LINE.x + 70, Math.min(1, dt * 1.6));
          if (C.greet > 0.6 && C.greet < 0.7) sfx.win();
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
      S.ground('blacktop', wd.cam.x, wd.cam.y, W, H);   // blacktop
      rr(SX(-20), SY(84), YW + 40, 8, 0, S.PAL.grassD);
      // painted line markings
      for (let i = 0; i < 7; i++) rr(SX(LINE.x + 26), SY(LINE.y - 10 + i * 22), 14, 4, 2, '#f2d24d');
      text('LINE UP', SX(LINE.x + 33), SY(LINE.y - 34), { size: 10, align: 'center', color: '#f2d24d', weight: '700' });
    });
    p.add(84, () => S.drawSchoolBuilding(SX(110), SY(90), 430, 74));
    p.add(83, () => S.drawFlagpole(SX(74), SY(90)));
    p.add(60, () => S.drawCloud(SX(260), SY(46), 1));
    // kids already in line
    for (let i = 0; i < 4; i++) p.add(LINE.y + i * 20, () => S.drawKid(SX(LINE.x), SY(LINE.y + i * 20), { color: ['#e6883c', '#3ca0a0', '#a05ac0', '#5a8ad0'][i], dir: 'up', anim: t * 3 + i, moving: false }));
    if (idx >= C.steps.length) p.add(LINE.y + 80, () => S.drawEmmie(SX(LINE.x), SY(LINE.y + 80), { dir: 'up', anim: 0, moving: false, backpack: null }));
    else {
      p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving }));
      p.add(wd.em.y - 1, () => S.drawParentBy(state.parent, SX(wd.em.x - 24), SY(wd.em.y + 8), { dir: 'right', anim: t * 3, moving: wd.em.moving }));
    }
    p.add(C.teacher.y + 44, () => S.drawTeacher(SX(C.teacher.x), SY(C.teacher.y + 44), { dir: 'left', anim: t * 4, moving: idx >= C.steps.length && C.teacher.x > LINE.x + 74 }));
    p.flush();

    if (idx >= C.steps.length && C.greet > 0.5) {
      const bx = W / 2;
      rr(bx - 150, 60, 300, 40, 12, 'rgba(28,22,38,0.85)');
      text('"Good morning, Emmie!"', bx, 70, { size: 15, align: 'center', color: '#8fe07a', weight: '700' });
    }
  },
});
