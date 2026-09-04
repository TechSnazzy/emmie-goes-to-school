// end.js — win / lose screen.
import { W, H, rect, text, sfx, music, input } from '../engine.js';
import { state, fmtClock, CLASS, finishRun } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent } from '../sprites.js';

let t = 0;
let win = false;
let reason = '';

export const end = {
  id: 'end',
  enter(p) {
    t = 0;
    win = !!(p && p.win);
    reason = (p && p.reason) || '';
    finishRun(win);
    music.stop();
    win ? sfx.win() : sfx.lose();
  },
  update(dt) {
    t += dt;
    if (t > 0.7 && (input.pressed('act') || input.pressed('start'))) {
      sfx.select();
      go('title');
    }
  },
  draw() {
    rect(0, 0, W, H, win ? '#10241a' : '#241014');
    for (let i = 0; i < 50; i++) rect((i * 83) % W, (i * 47 + (t * 20 | 0)) % H, 1, 1, win ? '#1d4030' : '#402028');

    const spare = Math.round(CLASS - state.clock);
    if (win) {
      text('EMMIE MADE IT!', W / 2, 40, { size: 18, align: 'center', color: '#7CFC00' });
      text(`in line at ${fmtClock(state.clock)}`, W / 2, 66, { size: 9, align: 'center', color: '#dfe7f5' });
      text(`${spare} MINUTE${spare === 1 ? '' : 'S'} TO SPARE`, W / 2, 84, { size: 9, align: 'center', color: '#ffe066' });
      const stars = state.best ? state.best.stars : 1;
      text('★'.repeat(stars) + '☆'.repeat(3 - stars), W / 2, 104, { size: 16, align: 'center', color: '#ffe066' });
      text('The teacher says: "Good morning, Emmie!"', W / 2, 130, { size: 7, align: 'center', color: '#9ad' });
      const gy = H - 40;
      drawEmmie(W / 2 - 14, gy, { facing: 1, frame: (t * 6 | 0) % 2 });
      drawParent(W / 2 + 16, gy, { type: state.parent, facing: -1, frame: 0 });
    } else {
      text('LATE FOR CLASS', W / 2, 44, { size: 17, align: 'center', color: '#ff5a5a' });
      text(reason || 'The bell already rang.', W / 2, 72, { size: 8, align: 'center', color: '#dfe7f5' });
      text(`clock: ${fmtClock(Math.max(state.clock, CLASS))}`, W / 2, 92, { size: 8, align: 'center', color: '#ffb3b3' });
      text('Tomorrow is a new morning. Try again!', W / 2, 118, { size: 7, align: 'center', color: '#9ad' });
    }

    if (state.best) text(`BEST: ${'★'.repeat(state.best.stars)}  ${state.best.spareMin} MIN`, W / 2, H - 60, { size: 7, align: 'center', color: '#7CFC00' });
    if ((t * 2 | 0) % 2 && t > 0.7) text('PRESS  Z / ENTER', W / 2, H - 22, { size: 8, align: 'center', color: '#fff' });
  },
};
