// bedroom.js — 6:50 AM. Mom helps Emmie wake up and get ready. Milo says hi.
import { rnd, dist } from '../engine.js';
import { walkScene, createWorld, put, M, THREE, setLightLevel } from './_kit.js';
import { sfx } from '../audio.js';

const RW = 560, RH = 360;
const DOOR = { x: 528, y: 52 };

export const bedroom = walkScene({
  id: 'bedroom',
  title: 'Getting Ready',
  next: 'leave',
  endText: 'Out the door to the car  ▶',
  build() {
    const world = createWorld({
      w: RW, h: RH, start: { x: 290, y: 132 }, speed: 96,
      solids: [
        { x: 0, y: 0, w: RW, h: 18 },                 // back wall
        { x: 0, y: 0, w: 18, h: RH },                 // left wall
        { x: 250, y: 56, w: 80, h: 108 },             // bed
        { x: 186, y: 112, w: 38, h: 36 },             // nightstand
        { x: 408, y: 20, w: 64, h: 36 },              // dresser
        { x: 34, y: 34, w: 44, h: 44 },               // toilet
        { x: 104, y: 30, w: 44, h: 36 },              // sink
      ],
    });

    const milo = { x: 320, y: 300, dir: 'up', tx: 320, ty: 260, pause: 0, mesh: null, anim: 0 };
    const C = {
      world, milo, lightOn: false,
      camW: 900, camH: 900, viewSpan: 380, shadowSpan: 330, light: 0.5,
      sky: '#3b3050', groundTint: '#4a3f58',
      locked: (idx) => idx === 0,
      steps: [
        {
          label: 'wake up', objective: 'Say good morning to Mom',
          x: 290, y: 132, my: 34, radius: 46, hold: 0.5, toast: 'Good morning!',
          onDone: (c) => { c.world.em.x = 290; c.world.em.y = 196; },
        },
        { label: 'turn on the light', objective: 'Turn on the light by the door', x: 480, y: 58, radius: 32, toast: 'Let there be light!', onDone: (c) => { c.lightOn = true; c.applyLight(); } },
        { label: 'get dressed', objective: 'Get dressed at the dresser', x: 440, y: 92, radius: 34, hold: 0.7, toast: 'All dressed!' },
        { label: 'go potty', objective: 'Go potty in the bathroom', x: 56, y: 108, radius: 32, hold: 0.6, toast: 'Good job!' },
        { label: 'brush teeth', objective: 'Brush your teeth at the sink', x: 126, y: 100, radius: 32, hold: 0.9, toast: 'Sparkly clean!' },
        { label: 'shoes + coat', objective: 'Put on your shoes and coat', x: 62, y: 266, radius: 34, hold: 0.7, toast: 'Cozy!' },
        { objective: 'Out the door to the car  ▶', x: DOOR.x, y: DOOR.y, radius: 36, hold: 0.2 },
      ],

      build3d(root) {
        // floor + the two far walls (iso leaves the near sides open)
        root.add(put(M.makeGround(RW, RH, M.C.wood), RW / 2, RH / 2));
        root.add(put(M.makeSlab(150, 130, M.C.tile, 2), 84, 78));         // bathroom tiles
        root.add(put(M.makeWall(RW, 82, 16, M.C.wall), RW / 2, 8));
        root.add(put(M.makeWall(16, 82, RH, M.C.wallD), 8, RH / 2));

        root.add(put(M.makeWindow(), 340, 12));
        root.add(put(M.makeBed(), 290, 110));
        root.add(put(M.makeNightstand(), 205, 130));
        root.add(put(M.makeDresser(), 440, 40));
        root.add(put(M.makeRug(180, 110), 320, 268));
        root.add(put(M.makeToilet(), 56, 58));
        root.add(put(M.makeSink(), 126, 50, Math.PI));
        root.add(put(M.makeDoorway(46), DOOR.x, 8));
        root.add(put(M.makeCoatRack(), 26, 266, Math.PI / 2));
        root.add(put(M.makeBackpack(), 52, 288, 0.4));

        // light switch — a small plate that lights up
        const sw = M.box(9, 13, 3, '#efe7d8', 480, 34, 17);
        const nub = M.box(5, 5, 2, '#8d8698', 480, 40, 19);
        C.switchNub = nub;
        root.add(sw, nub);

        // a warm lamp that turns on with the light
        const lamp = new THREE.PointLight('#ffdca8', 0, 620, 1.4);
        lamp.position.set(280, 190, 190);
        C.lamp = lamp;
        root.add(lamp);

        // Mom, by the bed
        const mom = M.makePerson(M.PAL.mom);
        put(mom, 214, 178, Math.PI / 2);
        C.mom = mom;
        root.add(mom);

        // Milo
        const cat = M.makeCat();
        put(cat, milo.x, milo.y);
        milo.mesh = cat;
        root.add(cat);

        // sleeping Emmie stand-in (hidden once she gets up)
        const lump = M.box(46, 14, 52, '#5b7fd4', 290, 20, 118);
        const head = M.box(20, 16, 18, M.C.skin, 290, 20, 152);
        const hair = M.box(21, 8, 19, M.C.hairBrown, 290, 34, 152);
        C.sleep = new THREE.Group(); C.sleep.add(lump, head, hair);
        root.add(C.sleep);
      },

      applyLight() {
        if (C.lamp) C.lamp.intensity = 0.9;
        if (C.switchNub) C.switchNub.material = M.MAT('#ffd23f');
        setLightLevel(1);
      },

      tick(dt, t, idx) {
        C.sleep.visible = idx === 0;
        C.emmie.visible = idx > 0;

        const m = milo;
        m.pause -= dt;
        m.anim += dt;
        if (m.pause <= 0) {
          const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy);
          if (d < 5) { m.tx = rnd(60, RW - 60); m.ty = rnd(200, RH - 30); m.pause = rnd(0.6, 1.8); }
          else {
            m.x += dx / d * 40 * dt; m.y += dy / d * 40 * dt;
            if (m.mesh) m.mesh.rotation.y = Math.atan2(dx, dy);
          }
        }
        if (m.mesh) {
          m.mesh.position.set(m.x, Math.abs(Math.sin(m.anim * 7)) * 1.5, m.y);
        }
        if (dist(m.x, m.y, world.em.x, world.em.y) < 34) {
          m._t = (m._t || 0) + dt;
          if (m._t > 0.8) { m._t = 0; sfx.purr(); }
        }
      },
    };
    return C;
  },
});
