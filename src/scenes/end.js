// end.js — you always make it. Celebrate with stars for how speedy the morning was.
import { W, H, ctx, rect, rr, text, input, rnd, clamp } from '../engine.js';
import { state, finishRun, starsFor } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import * as S from '../sprites.js';

let t = 0, stars = 3, confetti = [], shown = 0;

export const end = {
  id: 'end',
  enter() {
    t = 0; shown = 0;
    finishRun();
    stars = starsFor(state.elapsed);
    confetti = [];
    for (let i = 0; i < 90; i++) confetti.push({ x: rnd(0, W), y: rnd(-H, 0), v: rnd(40, 110), c: ['#ff5aa8', '#ffd34d', '#8fe07a', '#5a8ad0', '#a05ac0'][(Math.random() * 5) | 0], w: rnd(4, 8) });
    sfx.win();
  },
  update(dt) {
    t += dt;
    for (const c of confetti) { c.y += c.v * dt; c.x += Math.sin((c.y + c.x) * 0.05) * 12 * dt; if (c.y > H + 10) c.y = -10; }
    const target = Math.min(3, Math.floor(t / 0.6));
    if (target > shown && shown < stars) { shown++; sfx.star(); }
    if (t > 1.2 && input.pressed('act')) { sfx.confirm(); go('title'); }
  },
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffe1a8'); g.addColorStop(1, '#bfe3f2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const c of confetti) { ctx.fillStyle = c.c; ctx.fillRect(c.x, c.y, c.w, c.w); }

    S.drawSun(W / 2, 70, 26);
    text('EMMIE MADE IT TO CLASS!', W / 2, 118, { size: 22, align: 'center', color: '#ff4d97', weight: '700' });

    // stars
    for (let i = 0; i < 3; i++) {
      const lit = i < shown;
      const x = W / 2 + (i - 1) * 62;
      const pop = lit ? clamp((t - (i + 1) * 0.6) * 6, 0, 1) : 0.55;
      ctx.save(); ctx.translate(x, 168); ctx.scale(0.7 + pop * 0.6, 0.7 + pop * 0.6);
      text('★', 0, -18, { size: 40, align: 'center', color: lit ? '#ffd34d' : 'rgba(120,110,90,0.4)', weight: '700' });
      ctx.restore();
    }

    const msg = stars === 3 ? 'A super speedy morning!' : stars === 2 ? 'Nice work — a calm morning!' : 'You made it! Try to be a little quicker next time.';
    text(msg, W / 2, 210, { size: 13, align: 'center', color: '#3a2a3a', weight: '700' });
    text(`morning took ${Math.round(state.elapsed)} seconds`, W / 2, 234, { size: 10, align: 'center', color: '#6a5a4a' });
    if (state.best) text(`best: ${'★'.repeat(state.best.stars)}${'☆'.repeat(3 - state.best.stars)}  (${state.best.time}s)`, W / 2, 252, { size: 10, align: 'center', color: '#7a5a2a', weight: '700' });

    const gy = H - 26;
    S.drawEmmie(W / 2 - 18, gy, { dir: 'down', anim: t * 5, moving: true });
    S.drawParentBy(state.parent, W / 2 + 16, gy, { dir: 'down', anim: t * 4, moving: true });

    if (t > 1.2 && (t * 2 | 0) % 2) text('press  Z  to play again', W / 2, 280, { size: 13, align: 'center', color: '#2a7d46', weight: '700' });
  },
};
