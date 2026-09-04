// bedroom.js — 6:50 AM. The alarm goes off, Mom checks in, then she helps
// Emmie get ready. Milo says hi.
import { rnd, dist } from '../engine.js';
import { walkScene, createWorld, put, M, THREE, setLightLevel } from './_kit.js';
import { sfx } from '../audio.js';

const RW = 560, RH = 360;
const DOOR = { x: 528, y: 52 };
const MOM_HOME = { x: 214, y: 178 };
const MOM_ENTRY = { x: DOOR.x, y: DOOR.y + 10 };

// steps[0..WAKE_IDX-1] are the wordless intro beat (alarm → stir → Mom walks
// in); steps[WAKE_IDX] is the original "wake up" marker. Both `locked` and
// the sleeping-stand-in visibility key off this.
const WAKE_IDX = 3;

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
        { x: 186, y: 62, w: 38, h: 36 },              // nightstand (by the headboard)
        { x: 353, y: 20, w: 64, h: 36 },              // dresser
        { x: 34, y: 34, w: 44, h: 44 },               // toilet
        { x: 104, y: 30, w: 44, h: 36 },              // sink
      ],
    });

    const milo = { x: 320, y: 300, dir: 'up', tx: 320, ty: 260, pause: 0, mesh: null, anim: 0 };
    const C = {
      world, milo, lightOn: false,
      roomW: RW, roomH: RH, wallH: 82,
      camW: RW, camH: RH, shadowSpan: 480, light: 0.5,
      sky: '#3b3050', groundTint: '#4a3f58',
      alarmRinging: true, stirring: false, momWalking: false, momT: 0, brushing: false,
      locked: (idx) => idx <= WAKE_IDX,
      steps: [
        // --- wordless intro: alarm rings, Emmie stirs, Mom comes to check ---
        { objective: 'Beep beep beep!', delay: 1.6, onDone: (c) => { c.alarmRinging = false; c.stirring = true; sfx.soft(); } },
        { objective: 'Mmm... five more minutes...', delay: 0.8, onDone: (c) => { c.stirring = false; c.momWalking = true; c.momT = 0; } },
        { objective: 'Mom comes to check on you', delay: 1.5, onDone: (c) => {
          c.momWalking = false;
          c.mom.position.set(MOM_HOME.x, 0, MOM_HOME.y);
          c.mom.rotation.y = Math.PI / 2;
          M.stepPerson(c.mom, 0, false);
        } },

        {
          label: 'wake up', objective: 'Say good morning to Mom',
          x: 290, y: 132, my: 34, radius: 46, hold: 0.5, toast: 'Good morning!',
          onDone: (c) => { c.world.em.x = 290; c.world.em.y = 196; },
        },
        { label: 'turn on the light', objective: 'Turn on the light by the door', x: 480, y: 58, radius: 32, toast: 'Let there be light!', onDone: (c) => { c.lightOn = true; c.applyLight(); } },
        { label: 'get dressed', objective: 'Get dressed at the dresser', x: 385, y: 92, radius: 34, hold: 0.7, toast: 'All dressed!' },

        // --- potty: walk in, a moment of privacy, flush, walk back out ---
        {
          label: 'go potty', objective: 'Go potty in the bathroom',
          x: 56, y: 108, radius: 32, hold: 0.3, toast: 'Good job!',
          onDone: (c) => { c.world.moveTo(56, 82); },
        },
        { objective: 'Just a moment…', delay: 1.3 },
        { objective: 'Just a moment…', delay: 0.5, onDone: (c) => { sfx.flush(); c.world.moveTo(56, 108); } },

        // --- brush teeth: water on, scrub, water off ---
        {
          label: 'brush teeth', objective: 'Brush your teeth at the sink',
          x: 126, y: 100, radius: 32, hold: 0.3, toast: 'Sparkly clean!',
          onDone: (c) => { c.water.visible = true; c.brushing = true; sfx.water(); },
        },
        { objective: 'Brushing… scrub scrub!', delay: 1.8 },
        { objective: 'Brushing… scrub scrub!', delay: 0.3, onDone: (c) => { c.water.visible = false; c.brushing = false; } },

        { label: 'shoes + coat', objective: 'Put on your shoes and coat', x: 62, y: 266, radius: 34, hold: 0.7, toast: 'Cozy!' },
        { label: 'bye Mom', objective: 'Say goodbye to Mom', x: MOM_HOME.x, y: MOM_HOME.y + 30, radius: 40, hold: 0.4, toast: 'Bye Mom, love you!' },
        { objective: 'Out the door to the car  ▶', x: DOOR.x, y: DOOR.y, radius: 36, hold: 0.2 },
      ],

      build3d(root) {
        // floor + the two far walls (iso leaves the near sides open)
        root.add(put(M.makeGround(RW, RH, M.C.wood), RW / 2, RH / 2));
        root.add(put(M.makeSlab(150, 130, M.C.tile, 2), 84, 78));         // bathroom tiles
        root.add(put(M.makeWall(RW, 82, 16, M.C.wall), RW / 2, 8));
        root.add(put(M.makeWall(16, 82, RH, M.C.wallD), 8, RH / 2));

        root.add(put(M.makeWindow(), 340, 12));
        root.add(put(M.makeBed(), 290, 110, Math.PI));                    // head to the wall
        root.add(put(M.makeNightstand(), 205, 80));
        root.add(put(M.makeDresser(), 385, 40));
        root.add(put(M.makeRug(180, 110), 320, 268));
        root.add(put(M.makeToilet(), 56, 58));
        root.add(put(M.makeSink(), 126, 50, Math.PI));
        root.add(put(M.makeDoorway(46), DOOR.x, 8));
        root.add(put(M.makeCoatRack(), 26, 266, Math.PI / 2));
        root.add(put(M.makeBackpack(), 52, 288, 0.4));

        // a low privacy screen between the toilet and the sink
        root.add(put(M.box(6, 32, 50, M.C.wallD, 0, 0, 0), 90, 54));

        // the alarm clock, on the nightstand
        const alarm = M.makeAlarmClock();
        alarm.position.y = 22;
        put(alarm, 198, 84, -Math.PI / 2);
        C.alarm = alarm;
        root.add(alarm);
        sfx.alarm();

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

        // running tap water at the sink, hidden until she turns it on
        const water = M.box(1.8, 9, 1.8, '#bfe4f2', 126, 27, 57, { transparent: true, opacity: 0.75 });
        water.castShadow = false;
        water.visible = false;
        C.water = water;
        root.add(water);

        // a little toothbrush, hidden until she's brushing
        const brush = new THREE.Group();
        brush.add(M.box(2, 2, 9, '#3fb0c0', 0, 0, -4));
        brush.add(M.box(2.6, 2.2, 3.4, '#f6f4f0', 0, 0, -9.5));
        brush.visible = false;
        C.brush = brush;
        root.add(brush);

        // Mom — hidden until she walks in after the alarm
        const mom = M.makePerson(M.PAL.mom);
        put(mom, MOM_ENTRY.x, MOM_ENTRY.y, Math.PI / 2);
        mom.visible = false;
        C.mom = mom;
        root.add(mom);

        // Milo
        const cat = M.makeCat();
        put(cat, milo.x, milo.y);
        milo.mesh = cat;
        root.add(cat);

        // sleeping Emmie stand-in (hidden once she gets up); mirrored to sit
        // under the pillow end of the (now flipped) bed
        const lump = M.box(46, 14, 52, '#5b7fd4', 290, 20, 102);
        const head = M.box(20, 16, 18, M.C.skin, 290, 20, 68);
        const hair = M.box(21, 8, 19, M.C.hairBrown, 290, 34, 68);
        C.sleep = new THREE.Group(); C.sleep.add(lump, head, hair);
        root.add(C.sleep);
      },

      applyLight() {
        if (C.lamp) C.lamp.intensity = 0.9;
        if (C.switchNub) C.switchNub.material = M.MAT('#ffd23f');
        setLightLevel(1);
      },

      sync(C, t, idx) {
        if (C.brushing) {
          const u = C.emmie.userData;
          if (u && u.armR) {
            u.armR.rotation.x = -2.0 + Math.sin(t * 15) * 0.3;
            u.armR.rotation.z = -0.25;
          }
          const dirOff = { down: [0, 14], up: [0, -14], left: [-14, 0], right: [14, 0] }[C.world.em.dir] || [0, -14];
          C.brush.visible = true;
          C.brush.position.set(C.emmie.position.x + dirOff[0], 46, C.emmie.position.z + dirOff[1]);
          C.brush.rotation.y = C.emmie.rotation.y;
        } else {
          C.brush.visible = false;
        }
      },

      tick(dt, t, idx) {
        C.sleep.visible = idx <= WAKE_IDX;
        C.emmie.visible = idx > WAKE_IDX;

        // sleepy stir just before Mom comes in
        C.sleep.rotation.y = C.stirring ? Math.sin(t * 16) * 0.06 : 0;

        // alarm clock ringing
        if (C.alarm) {
          const s = C.alarmRinging ? 1 + Math.sin(t * 26) * 0.18 : 1;
          C.alarm.scale.setScalar(s);
        }

        // Mom's walk from the door to her spot by the bed
        C.mom.visible = idx >= 2;
        if (C.momWalking) {
          C.momT = Math.min(1, C.momT + dt / 1.4);
          const nx = MOM_ENTRY.x + (MOM_HOME.x - MOM_ENTRY.x) * C.momT;
          const ny = MOM_ENTRY.y + (MOM_HOME.y - MOM_ENTRY.y) * C.momT;
          C.mom.position.set(nx, 0, ny);
          C.mom.rotation.y = Math.atan2(MOM_HOME.x - nx, MOM_HOME.y - ny);
          M.stepPerson(C.mom, t * 8, true);
        }

        // running tap water
        if (C.water.visible) C.water.scale.y = 0.85 + Math.sin(t * 30) * 0.15;

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
