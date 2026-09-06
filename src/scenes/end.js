// end.js — you always make it. Stars for how speedy the morning was.
import { W, H, text, input, rnd, rndi, clamp } from '../engine.js';
import { state, finishRun, starsFor } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import { newRoot, snapTo, lookAtWorld, setRoomBounds, setShadowSpan, setSky, setLightLevel } from '../render3d.js';
import * as M from '../models.js';
import { decorate, rainbow } from '../delight.js';
import { setViewSpan } from '../render3d.js';

let t = 0, stars = 3, shown = 0, cast = null, confetti = [];
let delight;

export const end = {
  id: 'end',
  screen: true,
  enter() {
    t = 0; shown = 0;
    finishRun();
    stars = 3;
    const root = newRoot();
    setRoomBounds(460, 340, 130); setShadowSpan(380); setSky('#ffdca8', '#6b7a5a'); setLightLevel(1, '#fff0d8');

    root.add(M.makeGround(800, 700, M.C.blacktop, { thick: 30, margin: 700 }));
    const school = M.makeSchool(420, 130, 120); school.position.set(0, 0, -230); root.add(school);
    const emmie = M.makeEmmie(); emmie.position.set(-30, 0, 40); emmie.rotation.y = 0.2;
    const dad = M.makePerson(M.PAL.dad); dad.position.set(34, 0, 34); dad.rotation.y = -0.3;
    const teach = M.makePerson(M.PAL.teacher); teach.position.set(4, 0, -60); teach.rotation.y = Math.PI;
    root.add(emmie, dad, teach);
    for (let i = 0; i < 3; i++) { const k = M.makeKid(i); k.position.set(-120 + i * 40, 0, -30); k.rotation.y = Math.PI; root.add(k); }
    cast = { emmie, dad, teach };
    delight = decorate(root, 'end');
    rainbow(root,-50,-130,185);

    confetti = [];
    for (let i = 0; i < 70; i++) {
      const c = M.box(6, 6, 6, ['#ff5ea0', '#ffd23f', '#8fe07a', '#5a8ad0', '#a05ac0'][rndi(0, 5)], 0, 0, 0);
      c.position.set(rnd(-260, 260), rnd(60, 420), rnd(-180, 180));
      c.castShadow = false;
      root.add(c);
      confetti.push({ m: c, v: rnd(50, 120), s: rnd(-3, 3) });
    }
    snapTo(0, -10);
    sfx.win();
  },
  update(dt) {
    t += dt;
    M.stepPerson(cast.emmie, t * 5, true);
    M.stepPerson(cast.dad, t * 4, true);
    cast.teach.userData.armR.rotation.x = -2.2 + Math.sin(t * 6) * 0.4;
    for (const c of confetti) {
      c.m.position.y -= c.v * dt;
      c.m.rotation.x += dt * 3; c.m.rotation.y += dt * 2;
      if (c.m.position.y < 0) c.m.position.y = rnd(300, 460);
    }
    const mobile = matchMedia('(max-width:720px), (max-width:1100px) and (orientation:portrait)').matches;
    const host = document.getElementById('view');
    setViewSpan(mobile ? 600*host.clientHeight/host.clientWidth : 540);
    lookAtWorld(mobile ? -230 : -145, mobile ? -230 : 145, Math.min(1, dt * 3));
    delight.update(dt,t);
    const target = Math.min(3, Math.floor(t / 0.6));
    if (target > shown && shown < stars) { shown++; sfx.star(); }
  },
  draw() {
    return; // Crisp, responsive DOM celebration lives in presentation.js.
    text('EMMIE MADE IT TO CLASS!', W / 2, 22, { size: 25, align: 'center', color: '#ff4d97', weight: '800' });
    for (let i = 0; i < 3; i++) {
      const lit = i < shown, x = W / 2 + (i - 1) * 58;
      text('★', x, 56, { size: 40, align: 'center', color: lit ? '#ffd23f' : 'rgba(90,80,60,0.35)', weight: '800' });
    }
    const msg = stars === 3 ? 'A super speedy morning!' : stars === 2 ? 'Nice work — a calm morning!' : 'You made it! A little quicker next time.';
    text(msg, W / 2, 106, { size: 15, align: 'center', color: '#3a2a3a', weight: '800' });
    text(`morning took ${Math.round(state.elapsed)} seconds`, W / 2, 128, { size: 12, align: 'center', color: '#5a4a44', weight: '600' });
    if (state.best) text(`best: ${'★'.repeat(state.best.stars)}${'☆'.repeat(3 - state.best.stars)}  (${state.best.time}s)`, W / 2, 146, { size: 12, align: 'center', color: '#7a5a2a', weight: '700' });
    if (t > 1.2 && (t * 2 | 0) % 2) text('click to play again', W / 2, H - 28, { size: 15, align: 'center', color: '#1f6b3a', weight: '800' });
    void clamp;
  },
};
