// title.js — attract screen + choose who walks Emmie to school.
import { W, H, ctx, rect, text, sfx, music, input, clamp } from '../engine.js';
import { state, resetRun } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, drawCat, drawTree, PALETTE } from '../sprites.js';

let t = 0;
let sel = 0; // 0 = DAD, 1 = MOM
const options = ['DAD', 'MOM'];

export const title = {
  id: 'title',
  enter() {
    t = 0;
    resetRun();
    music.stop();
  },
  update(dt) {
    t += dt;
    if (input.pressed('left')) { sel = 0; sfx.move(); }
    if (input.pressed('right')) { sel = 1; sfx.move(); }
    if (input.pressed('act') || input.pressed('start')) {
      state.parent = options[sel];
      sfx.select();
      music.start();
      go('intro');
    }
  },
  draw() {
    // sky gradient-ish
    rect(0, 0, W, H, '#1a1030');
    for (let i = 0; i < 60; i++) {
      const x = (i * 97 + 13) % W, y = (i * 53) % (H * 0.7);
      rect(x, y, 1, 1, i % 5 ? '#3a2a5a' : '#ffe066');
    }
    rect(0, H - 60, W, 60, '#20303a');
    rect(0, H - 60, W, 3, '#2f7d32');
    drawTree(60, H - 58, 1);
    drawTree(W - 70, H - 54, 1.1);

    // title
    const bob = Math.sin(t * 2) * 2;
    text('EMMIE', W / 2, 34 + bob, { size: 26, align: 'center', color: '#ff5aa8' });
    text('GOES TO SCHOOL', W / 2, 68 + bob, { size: 13, align: 'center', color: '#ffe066' });
    text('a very important morning', W / 2, 90, { size: 7, align: 'center', color: '#99aadd' });

    // characters on the "ground"
    const gy = H - 62;
    drawEmmie(W / 2 - 26, gy, { facing: 1, frame: (t * 6 | 0) % 2 });
    drawParent(W / 2 + 20, gy, { type: options[sel], facing: -1, frame: (t * 5 | 0) % 2 });
    drawCat(W / 2 + 70, gy + 6, { sitting: true });

    // who walks with Emmie?
    text('WHO WALKS WITH EMMIE?', W / 2, 120, { size: 8, align: 'center', color: '#cfd8e3' });
    for (let i = 0; i < 2; i++) {
      const x = W / 2 + (i === 0 ? -60 : 60);
      const on = sel === i;
      rect(x - 34, 134, 68, 20, on ? '#ff5aa8' : '#2a2140');
      rect(x - 34, 134, 68, 2, on ? '#ffa8d4' : '#3a3055');
      text(options[i], x, 139, { size: 9, align: 'center', color: on ? '#fff' : '#8a8' });
    }
    text('◀ ▶  choose      PRESS  start', W / 2, 162, { size: 7, align: 'center', color: '#8899aa' });

    if (state.best) {
      text(`BEST: ${'★'.repeat(state.best.stars)}  ${state.best.spareMin} MIN TO SPARE`,
        W / 2, H - 16, { size: 7, align: 'center', color: '#7CFC00' });
    }
    if ((t * 2 | 0) % 2) text('PRESS  Z / ENTER  TO START', W / 2, H - 30, { size: 8, align: 'center', color: '#fff' });

    void ctx; void clamp; void PALETTE;
  },
};
