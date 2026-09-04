// title.js — friendly attract screen.
import { W, H, ctx, text } from '../engine.js';
import { input } from '../engine.js';
import { sfx, startMusic } from '../audio.js';
import { resetRun } from '../state.js';
import { go } from '../router.js';
import * as S from '../sprites.js';

let t = 0;

export const title = {
  id: 'title',
  enter() { t = 0; resetRun(); },
  update(dt) {
    t += dt;
    if (input.pressed('act')) { sfx.confirm(); startMusic(); go('intro'); }
  },
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffd9a0'); g.addColorStop(0.55, '#ffc0cb'); g.addColorStop(1, '#a7d8ea');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    S.drawSun(80, 64 + Math.sin(t) * 3, 22);
    S.drawCloud(210, 52, 1); S.drawCloud(W - 120, 96, 0.9);

    // hill
    ctx.fillStyle = S.COL.grass;
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H - 70);
    ctx.quadraticCurveTo(W / 2, H - 118, W, H - 66); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = S.COL.grassS; ctx.fillRect(0, H - 26, W, 3);
    S.drawTree(66, H - 40, 1.1); S.drawTree(W - 64, H - 34, 1.2);

    text('EMMIE', W / 2, 42, { size: 44, align: 'center', color: '#ff4d97', weight: '700' });
    text('GOES TO SCHOOL', W / 2, 88, { size: 19, align: 'center', color: '#fff', weight: '700' });
    text("It's a big morning. Help Emmie get to class!", W / 2, 120, { size: 12, align: 'center', color: '#3a2a3a', weight: '600' });

    // family on the hill
    const gy = H - 26, f = Math.floor(t * 5);
    S.drawMom(W / 2 - 70, gy, { dir: 'right', anim: f, moving: true });
    S.drawEmmie(W / 2 - 20, gy, { dir: 'right', anim: f, moving: true, backpack: S.COL.purple });
    S.drawDad(W / 2 + 34, gy, { dir: 'left', anim: f, moving: true });
    S.drawCat(W / 2 + 84, gy + 4, { sitting: true });

    text('◀ ▶ / WASD to walk        Z to do things', W / 2, 156, { size: 11, align: 'center', color: '#3a2a3a' });
    if (t % 1.1 < 0.72) text('press  Z  to start', W / 2, 180, { size: 16, align: 'center', color: '#2a7d46', weight: '700' });
  },
};
