// _kit.js — shared plumbing for the walk-to-the-marker scenes, now in 3D.
import { state, tickProgress, setScene, setObjective, checkOff, toast } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import { createWorld, interact } from '../world.js';
import { newRoot, lookAtWorld, snapTo, setViewSpan, setShadowSpan, setSky, setLightLevel, THREE } from '../render3d.js';
import * as M from '../models.js';

export { createWorld, interact, go, setObjective, toast, M, THREE, setLightLevel };

// Place a group in game-space.
export function put(obj, x, y, ry = 0) { obj.position.set(x, obj.position.y, y); obj.rotation.y = ry; return obj; }

/**
 * build(payload) must return:
 *   { world, root, steps, [tick(dt,t,idx)], [sync(C,t,idx)], [locked(idx,t)],
 *     [viewSpan], [sky], [groundTint], [shadowSpan] }
 * Each step: { label?, objective, x, y, hold?, radius?, onDone?, toast? }
 * A step with no x/y is narration: it shows `objective` for `delay` seconds.
 */
export function walkScene({ id, title, build, next, endText = 'All done!  ▶', endHold = 0.7 }) {
  let C = null, t = 0, idx = 0, endTimer = 0, narrT = 0;
  let marker = null, pointer = null, bar = null, emmie = null;

  return {
    id,
    enter(payload) {
      const root = newRoot();
      t = 0; idx = 0; endTimer = 0; narrT = 0;
      C = build(payload) || {};
      C.root = root;
      if (C.build3d) C.build3d(root);
      setViewSpan(C.viewSpan || 400);
      setShadowSpan(C.shadowSpan || 320);
      setSky(C.sky || '#bfe6f2', C.groundTint || '#6b7a5a');
      setLightLevel(C.light === undefined ? 1 : C.light);

      emmie = C.emmie || M.makeEmmie();
      C.emmie = emmie;
      root.add(emmie);

      marker = M.makeMarker(); root.add(marker);
      pointer = M.makePointer(); root.add(pointer);
      bar = M.makeProgressBar(); root.add(bar);

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
          if (interact(C.world, cur.x, cur.y, dt, { hold: cur.hold ?? 0.5, radius: cur.radius ?? 30 })) {
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

      if (C.sync) C.sync(C, t, idx);
      const c = C.world.camAt(C.camW || 380, C.camH || 300);
      lookAtWorld(c.x, c.y, Math.min(1, dt * 4));
    },
  };
}
