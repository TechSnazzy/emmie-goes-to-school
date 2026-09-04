// bedroom.js — 6:50 AM. Wake up and get ready. Milo the cat comes to say hi.
import { W, H, ctx, rect, rr, text, clamp, rnd, dist } from '../engine.js';
import { walkScene, createWorld, painter } from './_kit.js';
import { sfx } from '../audio.js';
import * as S from '../sprites.js';

const RW = 600, RH = 340;
const DOOR = { x: 300, y: 316 };

export const bedroom = walkScene({
  id: 'bedroom',
  title: 'Getting Ready',
  next: 'leave',
  endText: 'Go out the door to the car  ▶',
  build() {
    const world = createWorld({
      w: RW, h: RH, start: { x: 150, y: 176 }, speed: 92,
      solids: [
        { x: 0, y: 0, w: RW, h: 66 },           // back wall
        { x: 90, y: 92, w: 122, h: 60 },        // bed
        { x: 226, y: 134, w: 26, h: 30 },       // nightstand
        { x: 252, y: 62, w: 86, h: 32 },        // dresser
        { x: 486, y: 100, w: 28, h: 26 },       // toilet
        { x: 526, y: 156, w: 38, h: 32 },       // sink
        { x: 0, y: 0, w: 24, h: RH }, { x: RW - 12, y: 0, w: 12, h: RH },
        { x: 0, y: RH - 8, w: RW, h: 8 },
      ],
    });
    const milo = { x: 300, y: 300, dir: 'up', anim: 0, tx: 300, ty: 260, pauseT: 0 };
    const hearts = [];
    const C = {
      world, milo, hearts, lightOn: false,
      locked: (idx) => idx === 0,
      steps: [
        { label: 'wake up', objective: 'Say good morning — press Z in bed', x: 150, y: 152, radius: 42, hold: 0.5,
          toast: 'Good morning!', onDone: (c) => { c.world.em.x = 150; c.world.em.y = 216; } },
        { label: 'turn on the light', objective: 'Turn on the light by the door', x: 356, y: 300, radius: 30,
          toast: 'Let there be light!', onDone: (c) => { c.lightOn = true; } },
        { label: 'get dressed', objective: 'Get dressed at the dresser', x: 295, y: 104, radius: 34, hold: 0.7, toast: 'All dressed!' },
        { label: 'go potty', objective: 'Go potty in the bathroom', x: 500, y: 140, radius: 30, hold: 0.6, toast: 'Good job!' },
        { label: 'brush teeth', objective: 'Brush your teeth at the sink', x: 545, y: 202, radius: 30, hold: 0.9, toast: 'Sparkly clean!' },
        { label: 'shoes + hoodie', objective: 'Put on your shoes and hoodie by the door', x: 250, y: 302, radius: 30, hold: 0.7, toast: 'Cozy!' },
        { objective: 'Go out the door to the car  ▶', x: DOOR.x, y: DOOR.y, radius: 34, hold: 0.2 },
      ],
      tick(dt) {
        const m = milo;
        m.anim += dt * 8;
        m.pauseT -= dt;
        if (m.pauseT <= 0) {
          const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy);
          if (d < 4) { m.tx = rnd(60, RW - 60); m.ty = rnd(180, RH - 30); m.pauseT = rnd(0.6, 1.8); }
          else { m.x += dx / d * 34 * dt; m.y += dy / d * 34 * dt; m.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
        }
        if (dist(m.x, m.y, world.em.x, world.em.y) < 26) {
          if (!m._petT || m._petT > 0.7) { m._petT = 0; sfx.purr(); hearts.push({ x: m.x, y: m.y - 16, t: 0 }); }
          m._petT = (m._petT || 0) + dt;
        }
        for (let i = hearts.length - 1; i >= 0; i--) { hearts[i].t += dt; hearts[i].y -= dt * 18; if (hearts[i].t > 1.2) hearts.splice(i, 1); }
      },
    };
    return C;
  },
  drawScene(C, t, idx) {
    const { world: wd, milo } = C;
    const SX = wd.sx, SY = wd.sy;
    const p = painter();

    p.bg(() => {
      rect(0, 0, W, H, '#2a2436');
      // floor
      rr(SX(20), SY(20), RW - 32, RH - 28, 6, '#b98a63');
      for (let x = 40; x < RW - 20; x += 34) rect(SX(x), SY(72), 1, RH - 100, 'rgba(0,0,0,0.06)');
      // back wall
      rr(SX(20), SY(-6), RW - 32, 78, 4, S.PAL.wall);
      rr(SX(20), SY(64), RW - 32, 8, 0, S.PAL.wallD);
      // rug
      S.drawRug(SX(230), SY(250), 150, 84);
    });

    p.add(60, () => S.drawWindow(SX(150), SY(66), 60));
    p.add(61, () => { // bathroom nook floor
      rr(SX(452), SY(-6), 148, 150, 4, '#dfe8ea');
      rr(SX(452), SY(136), 148, 8, 0, '#c6d2d4');
      for (let tx = 456; tx < 596; tx += 20) for (let ty = 0; ty < 130; ty += 20) rr(SX(tx), SY(ty), 18, 18, 2, 'rgba(255,255,255,0.35)');
      text('bathroom', SX(486), SY(118), { size: 9, align: 'left', color: '#9ab4b8', weight: '700' });
    });
    p.add(95, () => S.drawDresser(SX(295), SY(96)));
    p.add(120, () => S.drawToilet(SX(500), SY(122)));
    p.add(150, () => S.drawBed(SX(150), SY(158), 128, 96));
    p.add(150, () => S.drawNightstand(SX(238), SY(150)));
    p.add(178, () => S.drawSink(SX(545), SY(180)));
    p.add(300, () => { S.drawDoor(SX(DOOR.x), SY(DOOR.y + 4), 40, idx >= C.steps.length - 1); S.drawLightSwitch(SX(356), SY(292), C.lightOn); });
    p.add(298, () => { rr(SX(224), SY(292), 52, 16, 4, '#7a5a3a'); S.drawBackpack(SX(250), SY(300)); }); // shoe/coat mat by door

    // Mom is right by the bed helping Emmie wake up
    p.add(196, () => S.drawMom(SX(96), SY(196), { dir: 'right', anim: t * 2, moving: false }));

    // Milo
    p.add(milo.y, () => S.drawCat(SX(milo.x), SY(milo.y), { dir: milo.dir, anim: milo.anim, moving: milo.pauseT <= 0 }));

    // Emmie
    if (idx === 0) {
      p.add(150.5, () => {
        S.drawSleeper(SX(150), SY(150));
        text('z', SX(170), SY(138) - (t * 6 % 14), { size: 12, color: '#fff', weight: '700' });
      });
    } else {
      p.add(wd.em.y, () => S.drawEmmie(SX(wd.em.x), SY(wd.em.y), { dir: wd.em.dir, anim: wd.em.anim, moving: wd.em.moving, backpack: idx >= C.steps.length - 1 ? '#7b3ff2' : null }));
    }

    p.flush();

    for (const h of C.hearts) { ctx.globalAlpha = clamp(1.2 - h.t, 0, 1); text('♥', SX(h.x), SY(h.y), { size: 12, align: 'center', color: '#ff6ea8' }); ctx.globalAlpha = 1; }

    // dim until the light is on
    if (!C.lightOn) { ctx.fillStyle = 'rgba(24,20,44,0.5)'; ctx.fillRect(0, 0, W, H); }
    if (idx === 0) text('Milo the cat is here too!', W / 2, H - 64, { size: 11, align: 'center', color: '#ffe066', weight: '700' });
  },
});
