// world.js — movement, collision and camera targeting in game-space (x, y).
// The 3D renderer maps (x, y) -> (x, 0, y).
import { input, clamp, dist } from './engine.js';
import { sfx } from './audio.js';

export function createWorld({ w, h, start, solids = [], speed = 96, pad = 10 }) {
  const em = { x: start.x, y: start.y, dir: 'down', moving: false, anim: 0, speed, act: 0 };
  let stepT = 0;

  function blocked(nx, ny) {
    const bx = nx - 9, by = ny - 8, bw = 18, bh = 12;
    for (const s of solids) {
      if (bx < s.x + s.w && bx + bw > s.x && by < s.y + s.h && by + bh > s.y) return true;
    }
    return false;
  }

  function update(dt, opts = {}) {
    const { locked = false, bounds = true } = opts;
    let vx = 0, vy = 0;
    if (!locked) {
      const a = input.axis();
      vx = a.x; vy = a.y;
      if (vx && vy) { vx *= 0.7071; vy *= 0.7071; }
    }
    em.moving = (vx !== 0 || vy !== 0);
    if (em.moving) {
      if (Math.abs(vx) > Math.abs(vy)) em.dir = vx > 0 ? 'right' : 'left';
      else em.dir = vy > 0 ? 'down' : 'up';
      const s = em.speed * dt;
      const nx = em.x + vx * s;
      if (!blocked(nx, em.y)) em.x = nx;
      const ny = em.y + vy * s;
      if (!blocked(em.x, ny)) em.y = ny;
      if (bounds) { em.x = clamp(em.x, pad, w - pad); em.y = clamp(em.y, pad, h - pad); }
      em.anim += dt * 9;
      stepT += dt;
      if (stepT > 0.28) { stepT = 0; sfx.step(); }
    } else {
      em.anim += dt * 2;
    }
  }

  function faceToward(x, y) {
    const dx = x - em.x, dy = y - em.y;
    if (Math.abs(dx) > Math.abs(dy)) em.dir = dx > 0 ? 'right' : 'left';
    else em.dir = dy > 0 ? 'down' : 'up';
  }

  // where the isometric camera should sit: follow, but don't run off the map
  function camAt(viewW = 380, viewH = 300) {
    const cx = w > viewW ? clamp(em.x, viewW / 2, w - viewW / 2) : w / 2;
    const cy = h > viewH ? clamp(em.y, viewH / 2, h - viewH / 2) : h / 2;
    return { x: cx, y: cy };
  }

  return { em, update, faceToward, camAt, w, h, setSolids: (s) => { solids = s; } };
}

// "walk to the spot and hold Z". world.em.act holds the 0..1 fill.
export function interact(world, x, y, dt, { radius = 30, hold = 0.5 } = {}) {
  const near = dist(world.em.x, world.em.y, x, y) < radius + 18;
  if (near && input.down('act')) {
    world.faceToward(x, y);
    world.em.act = Math.min(1, (world.em.act || 0) + dt / hold);
    if (world.em.act >= 1) { world.em.act = 0; return true; }
  } else {
    world.em.act = Math.max(0, (world.em.act || 0) - dt * 3);
  }
  return false;
}
