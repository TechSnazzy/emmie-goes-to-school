// world.js — shared 3/4 top-down movement, camera, collision, and the
// on-screen guidance (glowing target + pointing arrow) used by every scene.
import { W, H, ctx, input, clamp, circle, text, dist, rr } from './engine.js';
import { sfx } from './audio.js';

export function createWorld({ w, h, start, solids = [], speed = 96 }) {
  const em = { x: start.x, y: start.y, dir: 'down', moving: false, anim: 0, speed, act: 0 };
  const cam = { x: 0, y: 0 };

  function collideAxis(nx, ny) {
    // feet box
    const bx = nx - 8, by = ny - 7, bw = 16, bh = 8;
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
      const step = em.speed * dt;
      let nx = em.x + vx * step;
      if (!collideAxis(nx, em.y)) em.x = nx;
      let ny = em.y + vy * step;
      if (!collideAxis(em.x, ny)) em.y = ny;
      if (bounds) { em.x = clamp(em.x, 10, w - 10); em.y = clamp(em.y, 16, h - 6); }
      em.anim += dt * 9;
      if ((em.anim | 0) % 2 === 0 && Math.random() < 0.25) sfx.step();
    } else {
      em.anim = 0;
    }

    // camera: follow, clamp, or center a small world
    const tx = w > W ? clamp(em.x - W / 2, 0, w - W) : -(W - w) / 2;
    const ty = h > H ? clamp(em.y - H / 2 - 24, 0, h - H) : -(H - h) / 2;
    cam.x += (tx - cam.x) * Math.min(1, dt * 6);
    cam.y += (ty - cam.y) * Math.min(1, dt * 6);
  }

  const sx = (x) => x - cam.x;
  const sy = (y) => y - cam.y;

  function faceToward(x, y) {
    const dx = x - em.x, dy = y - em.y;
    if (Math.abs(dx) > Math.abs(dy)) em.dir = dx > 0 ? 'right' : 'left';
    else em.dir = dy > 0 ? 'down' : 'up';
  }

  return { em, cam, update, sx, sy, w, h, faceToward, setSolids: (s) => { solids = s; } };
}

// --- guidance -------------------------------------------------------
// A soft glowing ring at a world point, plus a "Z" bubble when Emmie is close.
export function drawTarget(world, x, y, t, { active = true, radius = 26 } = {}) {
  const px = world.sx(x), py = world.sy(y);
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  if (!active) return;
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.35 * pulse;
  circle(px, py, radius + pulse * 6, 'rgba(255,224,120,0.25)');
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = '#ffe066';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // down-chevron above
  ctx.fillStyle = '#ffe066';
  const yy = py - radius - 14 - pulse * 4;
  ctx.beginPath();
  ctx.moveTo(px - 8, yy); ctx.lineTo(px + 8, yy); ctx.lineTo(px, yy + 10); ctx.closePath(); ctx.fill();

  if (dist(world.em.x, world.em.y, x, y) < radius + 20) {
    rr(px - 16, py - radius - 42, 32, 24, 8, '#20242e');
    text('Z', px, py - radius - 38, { size: 15, align: 'center', color: '#ffe066', weight: '700' });
  }
}

// Bouncing arrow next to Emmie pointing at the target; edge marker if off-screen.
export function drawPointer(world, x, y, t) {
  const ex = world.sx(world.em.x), ey = world.sy(world.em.y) - 44;
  const ang = Math.atan2(y - world.em.y, x - world.em.x);
  const bob = Math.sin(t * 5) * 3;
  const ax = ex + Math.cos(ang) * 20, ay = ey + Math.sin(ang) * 20 + bob;
  ctx.save();
  ctx.translate(ax, ay); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(255,224,120,0.95)';
  ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
  ctx.restore();

  const onX = world.sx(x), onY = world.sy(y);
  if (onX < 8 || onX > W - 8 || onY < 24 || onY > H - 8) {
    const cx = clamp(onX, 16, W - 16), cy = clamp(onY, 32, H - 16);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -9); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// Standard "walk to the spot and press Z" interaction. Returns true once done.
// `world.em.act` holds the current fill fraction (0..1) for drawing.
export function interact(world, x, y, dt, { radius = 30, hold = 0.5 } = {}) {
  const near = dist(world.em.x, world.em.y, x, y) < radius + 16;
  if (near && input.down('act')) {
    world.faceToward(x, y);
    world.em.act = Math.min(1, (world.em.act || 0) + dt / hold);
    if (world.em.act >= 1) { world.em.act = 0; return true; }
  } else {
    world.em.act = Math.max(0, (world.em.act || 0) - dt * 3);
  }
  return false;
}

export function actProgress(world, x, y) {
  if (!world.em.act) return;
  const px = world.sx(x), py = world.sy(y);
  rr(px - 22, py - 46, 44, 7, 3, '#000');
  rr(px - 21, py - 45, 42 * clamp(world.em.act, 0, 1), 5, 2, '#7CFC00');
}
