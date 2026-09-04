// _kit.js — shared plumbing for the walk-to-the-marker scenes, now in 3D.
import { state, tickProgress, setScene, setObjective, checkOff, toast } from '../state.js';
import { input, lerp } from '../engine.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import { createWorld, interact } from '../world.js';
import { newRoot, lookAtWorld, snapTo, setViewSpan, setRoomBounds, setShadowSpan, setSky, setLightLevel, consumeClick, projectToScreen, THREE } from '../render3d.js';
import * as M from '../models.js';

export { createWorld, interact, go, setObjective, toast, M, THREE, setLightLevel };

// Place a group in game-space.
export function put(obj, x, y, ry = 0) { obj.position.set(x, obj.position.y, y); obj.rotation.y = ry; return obj; }

/**
 * build(payload) must return:
 *   { world, root, steps, [tick(dt,t,idx)], [sync(C,t,idx)], [locked(idx,t)],
 *     [roomW, roomH, wallH] (preferred — fits the camera to the whole room,
 *     no corner clipping, responsive to any aspect ratio) or [viewSpan]
 *     (legacy, a flat world-unit span), [sky], [groundTint], [shadowSpan] }
 * Each step: { label?, objective, x, y, hold?, radius?, onDone?, toast? }
 * A step with no x/y is narration: it shows `objective` for `delay` seconds.
 */
export function walkScene({ id, title, build, next, endText = 'All done!  ▶', endHold = 0.7 }) {
  let C = null, t = 0, idx = 0, endTimer = 0, narrT = 0;
  let marker = null, pointer = null, bar = null, emmie = null, dest = null, armed = false;
  let zoomT = 0, idleT = 999; // camera starts zoomed out; clicking zooms in, 5s idle zooms back out

  return {
    id,
    enter(payload) {
      const root = newRoot();
      t = 0; idx = 0; endTimer = 0; narrT = 0; armed = false; zoomT = 0; idleT = 999;
      consumeClick();               // drop a click left over from the previous screen
      C = build(payload) || {};
      C.root = root;
      if (C.build3d) C.build3d(root);
      if (C.roomW) setRoomBounds(C.roomW, C.roomH, C.wallH || 90);
      else setViewSpan(C.viewSpan || 400);
      setShadowSpan(C.shadowSpan || 320);
      setSky(C.sky || '#bfe6f2', C.groundTint || '#6b7a5a');
      setLightLevel(C.light === undefined ? 1 : C.light);

      emmie = C.emmie || M.makeEmmie();
      C.emmie = emmie;
      root.add(emmie);

      marker = M.makeMarker(); root.add(marker);
      pointer = M.makePointer(); root.add(pointer);
      bar = M.makeProgressBar(); root.add(bar);
      dest = M.makeDestRing(); dest.visible = false; root.add(dest);

      const list = (C.steps || []).filter((s) => s.label).map((s) => ({ label: s.label, done: false }));
      setScene(title, list);
      state.running = true;
      const c = C.world.camAt();
      snapTo(c.x, c.y);
    },

    update(dt) {
      t += dt;
      tickProgress(dt);
      const steps = C.steps || [];
      const cur = steps[idx];
      const locked = (C.locked && C.locked(idx, t)) || false;

      // click / tap anywhere on the ground to walk there
      const click = consumeClick();
      if (click) { armed = true; if (!locked) C.world.moveTo(click.x, click.y); }
      if (input.anyPressed()) armed = true;

      // camera zoom: zoomed out by default, zooms in on activity, back out after 5s idle
      let camW = C.camW || 380, camH = C.camH || 300;
      if (click || input.anyPressed()) idleT = 0; else idleT += dt;
      if (C.roomW) {
        zoomT = lerp(zoomT, idleT < 5 ? 1 : 0, Math.min(1, dt * 1.6));
        const inW = Math.min(C.roomW, 320), inH = Math.min(C.roomH, 280);
        camW = lerp(C.roomW, inW, zoomT); camH = lerp(C.roomH, inH, zoomT);
        setRoomBounds(camW, camH, C.wallH || 90);
      }

      C.world.update(dt, { locked, bounds: C.bounds !== false });
      if (C.tick) C.tick(dt, t, idx);

      if (globalThis.__EMMIE_AUTOPLAY && cur && cur.x !== undefined && !locked) {
        const e = C.world.em, dx = cur.x - e.x, dy = cur.y - e.y, d = Math.hypot(dx, dy) || 1;
        const s = Math.min(d, 260 * dt);
        e.x += dx / d * s; e.y += dy / d * s;
      }

      if (cur) {
        setObjective(cur.objective || ('Go to the ' + cur.label));
        if (cur.x === undefined) {
          narrT += dt;
          if (narrT > (cur.delay || 1.4)) { if (cur.onDone) cur.onDone(C); idx++; narrT = 0; }
        } else if (cur.ready === undefined || cur.ready(C, t)) {
          const rad = cur.radius ?? 30;
          const near = Math.hypot(cur.x - C.world.em.x, cur.y - C.world.em.y) < rad + 18;
          // arriving at the marker is enough — she does the job herself
          if (near && armed) C.world.stop();
          if (interact(C.world, cur.x, cur.y, dt, { hold: cur.hold ?? 0.5, radius: rad, auto: armed })) {
            checkOff(cur.label);
            sfx.done();
            if (cur.onDone) cur.onDone(C);
            if (cur.toast) toast(cur.toast);
            idx++;
          }
        }
      } else {
        setObjective(endText);
        endTimer += dt;
        if (endTimer > endHold) go(next);
      }

      // --- 3D sync ---
      const em = C.world.em;
      if (globalThis.__dbg) globalThis.__dbg.em = { x: Math.round(em.x), y: Math.round(em.y) };
      emmie.position.set(em.x, 0, em.y);
      M.facePerson(emmie, em.dir);
      M.stepPerson(emmie, em.anim * 1.2, em.moving);

      const showMarker = !!(cur && cur.x !== undefined && (cur.ready === undefined || cur.ready(C, t)));
      if (globalThis.__dbg) globalThis.__dbg.target = showMarker ? projectToScreen(cur.x, cur.y) : null;
      marker.visible = showMarker;
      pointer.visible = showMarker;
      if (showMarker) {
        marker.position.set(cur.x, cur.my || 0, cur.y);
        const r = (cur.radius ?? 28) / 28;
        marker.scale.setScalar(r);
        marker.userData.ring.rotation.z = t * 1.6;
        marker.userData.arrow.position.y = 62 + Math.sin(t * 4) * 7;
        // pointer hovers over Emmie aiming at the target
        pointer.position.set(em.x, 62 + Math.sin(t * 5) * 3, em.y);
        pointer.rotation.y = Math.atan2(cur.x - em.x, cur.y - em.y) - Math.PI / 2;
      }
      bar.visible = em.act > 0;
      if (bar.visible) {
        bar.position.set(em.x, 74, em.y);
        bar.rotation.set(-Math.PI / 5, Math.PI / 4, 0);
        bar.userData.fg.scale.x = Math.max(0.01, em.act);
        bar.userData.fg.position.x = -22 * (1 - em.act);
      }

      const goal = C.world.em.goal;
      dest.visible = !!goal;
      if (goal) { dest.position.set(goal.x, 0, goal.y); dest.userData.ring.rotation.z = -t * 2.4; }

      if (C.sync) C.sync(C, t, idx);
      const c = C.world.camAt(camW, camH);
      lookAtWorld(c.x, c.y, Math.min(1, dt * 4));
    },
  };
}
