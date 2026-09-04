// racks.js — hang the backpack on the hook, put the lunchbox in the bin.
import { lerp } from '../engine.js';
import { walkScene, createWorld, put, M } from './_kit.js';

const RW = 600, RH = 340;

export const racks = walkScene({
  id: 'racks',
  title: 'Backpack & Lunchbox',
  next: 'line',
  endText: 'Time to line up  ▶',
  build() {
    const world = createWorld({
      w: RW, h: RH, start: { x: 300, y: 250 }, speed: 100,
      solids: [
        { x: 0, y: 0, w: RW, h: 60 },
        { x: 0, y: 0, w: 16, h: RH }, { x: RW - 16, y: 0, w: 16, h: RH },
        { x: 0, y: RH - 14, w: RW, h: 14 },
      ],
    });
    const C = {
      world,
      roomW: RW, roomH: RH, wallH: 96,
      camW: RW, camH: RH, shadowSpan: 495,
      sky: '#e7dcc6', groundTint: '#8a7f68',
      steps: [
        {
          label: 'hang up backpack', objective: 'Hang your backpack on your hook',
          x: 150, y: 118, radius: 36, hold: 0.7, toast: 'Backpack away!',
          onDone: (c) => { if (c.emmie.userData.pack) c.emmie.userData.pack.visible = false; c.hungPack.visible = true; },
        },
        {
          label: 'lunchbox in the bin', objective: 'Put your lunchbox in the lunch bin',
          x: 452, y: 168, radius: 34, hold: 0.7, toast: 'Lunchbox in!',
          onDone: (c) => { c.carried.visible = false; c.inBin.visible = true; },
        },
      ],
      build3d(root) {
        root.add(put(M.makeGround(RW, RH, M.C.tile), RW / 2, RH / 2));
        root.add(put(M.makeWall(RW, 96, 22, M.C.wallD), RW / 2, 12));
        root.add(put(M.makeCubbies(170), 150, 44));
        root.add(put(M.makeDoorway(60), 300, 14));
        root.add(put(M.makeLunchBin(), 452, 120));
        root.add(put(M.makeBench(), 540, 250, Math.PI / 2));

        const hung = put(M.makeBackpack(), 150, 60);
        hung.position.y = 30; hung.visible = false;
        C.hungPack = hung; root.add(hung);

        const inBin = put(M.makeLunchbox(), 452, 118);
        inBin.position.y = 22; inBin.visible = false;
        C.inBin = inBin; root.add(inBin);

        const carried = put(M.makeLunchbox(), 300, 250);
        carried.scale.setScalar(0.85);
        C.carried = carried; root.add(carried);

        const dad = M.makePerson(M.PAL.dad);
        put(dad, 250, 280);
        C.dadMesh = dad; root.add(dad);
      },
      tick(dt) {
        const em = world.em;
        if (C.carried.visible) {
          const a = { down: 0, up: Math.PI, right: Math.PI / 2, left: -Math.PI / 2 }[em.dir] || 0;
          C.carried.position.set(em.x + Math.sin(a) * 20, 26, em.y + Math.cos(a) * 20);
        }
        const d = C.dadMesh;
        d.position.x = lerp(d.position.x, em.x - 40, Math.min(1, dt * 2.2));
        d.position.z = lerp(d.position.z, em.y + 24, Math.min(1, dt * 2.2));
        d.rotation.y = Math.atan2(em.x - d.position.x, em.y - d.position.z);
        M.stepPerson(d, em.anim, em.moving);
      },
    };
    return C;
  },
});
