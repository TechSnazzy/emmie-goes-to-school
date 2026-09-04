// _kit.js — shared plumbing for the walk-to-the-marker scenes.
import { W, H, ctx, rect, clamp } from '../engine.js';
import { state, tickProgress, setScene, setObjective, checkOff, toast } from '../state.js';
import { sfx } from '../audio.js';
import { go } from '../router.js';
import { createWorld, interact, drawTarget, drawPointer, actProgress } from '../world.js';

// y-sorted draw list so characters and props overlap correctly in 3/4 view.
export function painter() {
  const items = [];
  return {
    add(y, fn) { items.push({ y, fn }); },
    bg(fn) { items.push({ y: -1e9, fn }); },
    flush() { items.sort((a, b) => a.y - b.y); for (const it of items) it.fn(); items.length = 0; },
  };
}

// Build a scene from a list of steps. Each step:
//   { label, objective, x, y, hold?, radius?, onDone?(ctx), toast? }
// A step with no x/y is narration-only and auto-advances after `delay` (default 1.4s)
// while showing its `objective` text.
export function walkScene({ id, title, build, drawScene, next, endText = 'All done!  Head on  ▶', endHold = 0.7 }) {
  let C = null, t = 0, idx = 0, endTimer = 0, narrT = 0;

  function reset(payload) {
    C = build(payload) || {};
    t = 0; idx = 0; endTimer = 0; narrT = 0;
    const list = (C.steps || []).filter((s) => s.label).map((s) => ({ label: s.label, done: false }));
    setScene(title, list);
  }

  return {
    id,
    enter(p) { reset(p); state.running = true; },
    update(dt) {
      t += dt;
      tickProgress(dt);
      const steps = C.steps || [];
      const cur = steps[idx];
      const locked = (C.locked && C.locked(idx, t)) || false;
      C.world.update(dt, { locked, bounds: C.bounds !== false });
      if (C.tick) C.tick(dt, t, idx);

      // test aid: walk straight to the current target (never set in normal play)
      if (globalThis.__EMMIE_AUTOPLAY && cur && cur.x !== undefined && !locked) {
        const e = C.world.em, dx = cur.x - e.x, dy = cur.y - e.y, d = Math.hypot(dx, dy) || 1;
        const s = Math.min(d, 220 * dt);
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
            if (cur.toast) toast(cur.toast, '#8fe07a');
            idx++;
          }
        }
      } else {
        setObjective(endText);
        endTimer += dt;
        if (endTimer > endHold) go(next);
      }
    },
    draw() {
      const steps = C.steps || [];
      const cur = steps[idx];
      drawScene(C, t, idx);
      // guidance on top
      if (cur && cur.x !== undefined && (cur.ready === undefined || cur.ready(C, t))) {
        drawTarget(C.world, cur.x, cur.y, t, { radius: cur.radius ?? 28 });
        actProgress(C.world, cur.x, cur.y);
        drawPointer(C.world, cur.x, cur.y, t);
      }
    },
    get ctx() { return C; },
  };
}

export { createWorld, interact, drawTarget, drawPointer, actProgress, go, setObjective, toast, clamp, painter as _p };
