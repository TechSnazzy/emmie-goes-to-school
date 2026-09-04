// title.js — friendly attract screen + choose Dad or Mom.
import { W, H, ctx, rect, rr, text, input, clamp } from '../engine.js';
import { sfx, startMusic } from '../audio.js';
import { state, resetRun } from '../state.js';
import { go } from '../router.js';
import * as S from '../sprites.js';

let t = 0, sel = 0;
const opts = ['DAD', 'MOM'];

export const title = {
  id: 'title',
  enter() { t = 0; resetRun(); },
  update(dt) {
    t += dt;
    if (input.pressed('left') && sel !== 0) { sel = 0; sfx.hover(); }
    if (input.pressed('right') && sel !== 1) { sel = 1; sfx.hover(); }
    if (input.pressed('act')) {
      state.parent = opts[sel];
      sfx.confirm(); startMusic();
      go('intro');
    }
  },
  draw() {
    // sunrise sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffd9a0'); g.addColorStop(0.5, '#ffc0cb'); g.addColorStop(1, '#9ec9e8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    S.drawSun(78, 66 + Math.sin(t) * 3, 22);
    S.drawCloud(200, 54, 1.0); S.drawCloud(W - 120, 96, 0.9);

    // grassy hill
    ctx.beginPath(); ctx.ellipse(W / 2, H + 96, W * 0.85, 150, 0, 0, 7);
    ctx.fillStyle = S.PAL.grass; ctx.fill();
    S.drawTree(70, H - 40, 1.1); S.drawTree(W - 70, H - 34, 1.2);

    // title
    text('EMMIE', W / 2, 40, { size: 44, align: 'center', color: '#ff4d97', weight: '700' });
    text('GOES TO SCHOOL', W / 2, 86, { size: 19, align: 'center', color: '#fff', weight: '700' });

    // choose parent
    text('Who walks with Emmie today?', W / 2, 120, { size: 13, align: 'center', color: '#3a2a3a', weight: '700' });
    for (let i = 0; i < 2; i++) {
      const x = W / 2 + (i ? 66 : -66), on = sel === i;
      rr(x - 52, 136, 104, 32, 12, on ? '#ff4d97' : 'rgba(255,255,255,0.78)');
      text(i ? 'MOM' : 'DAD', x, 143, { size: 15, align: 'center', color: on ? '#fff' : '#7a5a6a', weight: '700' });
    }
    text('◀ ▶  choose', W / 2, 176, { size: 10, align: 'center', color: '#3a2a3a' });
    if (t % 1.1 < 0.7) text('press  Z  to start', W / 2, 196, { size: 15, align: 'center', color: '#2a7d46', weight: '700' });
    if (state.best) text(`best:  ${'★'.repeat(state.best.stars)}${'☆'.repeat(3 - state.best.stars)}`, W / 2, 218, { size: 11, align: 'center', color: '#7a5a2a', weight: '700' });

    // characters down on the hill, clear of all text
    const gy = H - 30;
    S.drawEmmie(W / 2 - 34, gy, { dir: 'right', anim: t * 6, moving: true, backpack: '#7b3ff2' });
    S.drawParentBy(opts[sel], W / 2 + 10, gy, { dir: 'left', anim: t * 5, moving: true });
    S.drawCat(W / 2 + 66, gy + 6, { sitting: true });
    void clamp;
  },
};
