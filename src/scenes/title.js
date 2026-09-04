// title.js — a little 3D diorama with the title drawn over it.
import { W, H, text, rr, input } from '../engine.js';
import { sfx, startMusic } from '../audio.js';
import { resetRun, state } from '../state.js';
import { go } from '../router.js';
import { newRoot, snapTo, lookAtWorld, setViewSpan, setShadowSpan, setSky, setLightLevel } from '../render3d.js';
import * as M from '../models.js';

let t = 0, cast = null;

export const title = {
  id: 'title',
  screen: true,
  enter() {
    t = 0;
    resetRun();
    const root = newRoot();
    setViewSpan(440); setShadowSpan(300); setSky('#8fd6ef', '#6b7a5a'); setLightLevel(1, '#ffe6d0');

    root.add(M.makeGround(740, 560, M.C.grass, { thick: 46, margin: 0 }));
    for (const [x, z, s] of [[-230, -140, 1.3], [240, -110, 1.1], [-250, 120, 1.0], [270, 150, 1.2]]) {
      const tr = M.makeTree(s); tr.position.set(x, 0, z); root.add(tr);
    }
    for (const [x, z] of [[-120, 130], [150, 150]]) { const b = M.makeBush(); b.position.set(x, 0, z); root.add(b); }

    const mom = M.makePerson(M.PAL.mom); mom.position.set(-86, 0, 60); mom.rotation.y = 0.5;
    const emmie = M.makeEmmie(); emmie.position.set(-10, 0, 78); emmie.rotation.y = 0.1;
    const dad = M.makePerson(M.PAL.dad); dad.position.set(70, 0, 56); dad.rotation.y = -0.5;
    const cat = M.makeCat(); cat.position.set(132, 0, 96); cat.rotation.y = -0.7;
    root.add(mom, emmie, dad, cat);
    cast = { mom, emmie, dad, cat };
    snapTo(0, -10);
  },
  update(dt) {
    t += dt;
    for (const k of ['mom', 'emmie', 'dad']) M.stepPerson(cast[k], t * 2.4, true);
    cast.cat.position.y = Math.abs(Math.sin(t * 2)) * 2;
    lookAtWorld(Math.sin(t * 0.25) * 20, -10, Math.min(1, dt * 2));
    if (input.pressed('act')) { sfx.confirm(); startMusic(); go('intro'); }
  },
  draw() {
    text('EMMIE', W / 2, 26, { size: 46, align: 'center', color: '#ff4d97', weight: '800' });
    text('GOES TO SCHOOL', W / 2, 74, { size: 20, align: 'center', color: '#fff', weight: '800' });
    text("It's a big morning. Help Emmie get to class!", W / 2, 104, { size: 13, align: 'center', color: '#40243a', weight: '700' });
    rr(W / 2 - 150, H - 62, 300, 52, 14, 'rgba(26,20,36,0.72)');
    text('Arrow keys / WASD to walk   ·   Z to do things', W / 2, H - 56, { size: 12, align: 'center', color: '#cfc6da', weight: '700' });
    if (t % 1.15 < 0.75) text('press  Z  to start', W / 2, H - 36, { size: 17, align: 'center', color: '#8fe07a', weight: '800' });
    if (state.best) text(`best: ${'★'.repeat(state.best.stars)}${'☆'.repeat(3 - state.best.stars)}`, 14, 12, { size: 13, color: '#7a4a1a', weight: '800' });
  },
};
