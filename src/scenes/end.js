// A joyful welcome, with three keepsake stars for every completed morning.
import { rnd, rndi } from '../engine.js';
import { finishRun } from '../state.js';
import { sfx } from '../audio.js';
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
    const mobile = matchMedia('(max-width:720px), (max-width:1100px) and (orientation:portrait)').matches && !matchMedia('(max-height:450px) and (min-width:560px)').matches;
    const host = document.getElementById('view');
    setViewSpan(mobile ? 600*host.clientHeight/host.clientWidth : 540);
    lookAtWorld(mobile ? -230 : -145, mobile ? -230 : 145, Math.min(1, dt * 3));
    delight.update(dt,t);
    const target = Math.min(3, Math.floor(t / 0.6));
    if (target > shown && shown < stars) { shown++; sfx.star(); }
  },
};
