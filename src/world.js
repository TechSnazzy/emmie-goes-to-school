// world.js — movement, collision, click-to-walk pathfinding and camera
// targeting, all in game-space (x, y). The renderer maps (x, y) -> (x, 0, y).
import { input, clamp, dist } from './engine.js';
import { sfx } from './audio.js';

const CELL = 16;                          // pathfinding grid resolution
const HW = 9, HT = 8, BW = 18, BH = 12;   // walker footprint

export function createWorld({ w, h, start, solids = [], speed = 96, pad = 10 }) {
  const em = {
    x: start.x, y: start.y, dir: 'down', moving: false, anim: 0, speed,
    act: 0, goal: null, path: null, stuckT: 0,
  };
  let stepT = 0;
  let gw = 0, gh = 0, grid = null;

  // --- collision ----------------------------------------------------
  function blocked(nx, ny) {
    const bx = nx - HW, by = ny - HT;
    for (const s of solids) {
      if (bx < s.x + s.w && bx + BW > s.x && by < s.y + s.h && by + BH > s.y) return true;
    }
    return false;
  }

  // --- navigation grid ----------------------------------------------
  function rebuildGrid() {
    gw = Math.max(1, Math.ceil(w / CELL));
    gh = Math.max(1, Math.ceil(h / CELL));
    grid = new Uint8Array(gw * gh);
    for (let cy = 0; cy < gh; cy++) {
      for (let cx = 0; cx < gw; cx++) {
        const wx = cx * CELL + CELL / 2, wy = cy * CELL + CELL / 2;
        const outside = wx < pad || wx > w - pad || wy < pad || wy > h - pad;
        grid[cy * gw + cx] = outside || blocked(wx, wy) ? 1 : 0;
      }
    }
  }
  rebuildGrid();

  const cellIndex = (x, y) => {
    const cx = clamp(Math.floor(x / CELL), 0, gw - 1);
    const cy = clamp(Math.floor(y / CELL), 0, gh - 1);
    return cy * gw + cx;
  };
  const cellCentre = (i) => ({ x: (i % gw) * CELL + CELL / 2, y: Math.floor(i / gw) * CELL + CELL / 2 });

  function nearestFree(i) {
    if (!grid[i]) return i;
    const sx = i % gw, sy = Math.floor(i / gw);
    for (let r = 1; r < 14; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const nx = sx + dx, ny = sy + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
          const ni = ny * gw + nx;
          if (!grid[ni]) return ni;
        }
      }
    }
    return -1;
  }

  function lineClear(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.ceil(d / 6));
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      if (blocked(ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
    }
    return true;
  }

  // drop waypoints we can simply walk straight past
  function smooth(pts) {
    if (pts.length < 3) return pts.slice(1);
    const out = [];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      while (j > i + 1 && !lineClear(pts[i].x, pts[i].y, pts[j].x, pts[j].y)) j--;
      out.push(pts[j]);
      i = j;
    }
    return out;
  }

  const NEIGH = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  function findPath(sx, sy, gx, gy) {
    const startI = cellIndex(sx, sy);
    const goalI = nearestFree(cellIndex(gx, gy));
    if (goalI < 0) return null;
    if (startI === goalI) return [{ x: gx, y: gy }];

    const N = gw * gh;
    const came = new Int32Array(N).fill(-1);
    const gScore = new Float32Array(N).fill(Infinity);
    const fScore = new Float32Array(N).fill(Infinity);
    const inOpen = new Uint8Array(N);
    const gcx = goalI % gw, gcy = Math.floor(goalI / gw);
    const heur = (i) => Math.hypot((i % gw) - gcx, Math.floor(i / gw) - gcy);

    gScore[startI] = 0; fScore[startI] = heur(startI);
    const open = [startI]; inOpen[startI] = 1;
    let guard = 0;

    while (open.length && guard++ < 40000) {
      let best = 0;
      for (let k = 1; k < open.length; k++) if (fScore[open[k]] < fScore[open[best]]) best = k;
      const cur = open.splice(best, 1)[0];
      inOpen[cur] = 0;
      if (cur === goalI) {
        const pts = [];
        for (let i = cur; i !== -1; i = came[i]) pts.push(cellCentre(i));
        pts.reverse();
        pts[pts.length - 1] = { x: gx, y: gy };
        return smooth(pts);
      }
      const cx = cur % gw, cy = Math.floor(cur / gw);
      for (const [dx, dy] of NEIGH) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const ni = ny * gw + nx;
        if (grid[ni]) continue;
        if (dx && dy && (grid[cy * gw + nx] || grid[ny * gw + cx])) continue;   // no corner cutting
        const t = gScore[cur] + (dx && dy ? 1.4142 : 1);
        if (t < gScore[ni]) {
          came[ni] = cur; gScore[ni] = t; fScore[ni] = t + heur(ni);
          if (!inOpen[ni]) { open.push(ni); inOpen[ni] = 1; }
        }
      }
    }
    return null;
  }

  function moveTo(x, y) {
    const gx = clamp(x, pad, w - pad), gy = clamp(y, pad, h - pad);
    em.goal = { x: gx, y: gy };
    em.stuckT = 0;
    em.path = lineClear(em.x, em.y, gx, gy)
      ? [{ x: gx, y: gy }]
      : findPath(em.x, em.y, gx, gy);
    if (!em.path || !em.path.length) em.path = [{ x: gx, y: gy }];   // fall back to steering
  }
  function stop() { em.goal = null; em.path = null; }

  // --- per-frame -----------------------------------------------------
  function update(dt, opts = {}) {
    const { locked = false, bounds = true } = opts;
    let vx = 0, vy = 0, usingPath = false;

    if (locked) {
      stop();
    } else {
      const a = input.axis();
      if (a.x || a.y) {
        stop();                                   // keyboard still works and takes over
        vx = a.x; vy = a.y;
        if (vx && vy) { vx *= 0.7071; vy *= 0.7071; }
      } else if (em.path && em.path.length) {
        const wp = em.path[0];
        const dx = wp.x - em.x, dy = wp.y - em.y, d = Math.hypot(dx, dy);
        if (d < 8) {
          em.path.shift();
          if (!em.path.length) stop();
        } else { vx = dx / d; vy = dy / d; usingPath = true; }
      }
    }

    em.moving = (vx !== 0 || vy !== 0);
    const px = em.x, py = em.y;

    if (em.moving) {
      if (Math.abs(vx) > Math.abs(vy)) em.dir = vx > 0 ? 'right' : 'left';
      else em.dir = vy > 0 ? 'down' : 'up';
      const s = em.speed * dt;
      // If we somehow started inside a solid, let every move through until we
      // are clear — otherwise the walker is trapped with no way out.
      const stuck = blocked(em.x, em.y);
      const nx = em.x + vx * s;
      if (stuck || !blocked(nx, em.y)) em.x = nx;
      const ny = em.y + vy * s;
      if (stuck || !blocked(em.x, ny)) em.y = ny;
      if (bounds) { em.x = clamp(em.x, pad, w - pad); em.y = clamp(em.y, pad, h - pad); }

      if (usingPath) {
        if (Math.hypot(em.x - px, em.y - py) < em.speed * dt * 0.3) {
          em.stuckT += dt;
          if (em.stuckT > 0.5) { stop(); em.stuckT = 0; }   // give up rather than grind
        } else em.stuckT = 0;
      }

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

  return {
    em, update, faceToward, camAt, moveTo, stop, w, h,
    setSolids: (s) => { solids = s; rebuildGrid(); },
  };
}

// "arrive at the spot and do the job". world.em.act holds the 0..1 fill.
export function interact(world, x, y, dt, { radius = 30, hold = 0.5, auto = false } = {}) {
  const near = dist(world.em.x, world.em.y, x, y) < radius + 18;
  if (near && (auto || input.down('act'))) {
    world.faceToward(x, y);
    world.em.act = Math.min(1, (world.em.act || 0) + dt / hold);
    if (world.em.act >= 1) { world.em.act = 0; return true; }
  } else {
    world.em.act = Math.max(0, (world.em.act || 0) - dt * 3);
  }
  return false;
}
