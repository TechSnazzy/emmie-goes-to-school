// hallway.js — walk through the school to Emmie's classroom. Weave past the
// morning crowd, a supply cart, and wet-floor puddles.
import { W, H, rect, text, sfx, input, clamp, rnd, rndi } from '../engine.js';
import { state, tickClock, isLate, penalty } from '../state.js';
import { go } from '../router.js';
import { drawEmmie, drawParent, shadow } from '../sprites.js';

const RATE = 0.4;
const WORLD_W = 940;
const TOP = 60, BOT = H - 24;          // walkable band

let em, par, kids, puddles, cart, slipCd, msg;

function reset() {
  em = { x: 24, y: (TOP + BOT) / 2, f: 1, walk: 0, slow: 0 };
  par = { x: 6, y: em.y };
  kids = [];
  for (let i = 0; i < 9; i++) {
    kids.push({ x: rnd(140, WORLD_W - 120), y: rnd(TOP + 6, BOT - 6), vx: rnd(-24, 24), vy: rnd(-16, 16), c: ['#e67e22', '#16a085', '#8e44ad', '#2980b9', '#c0392b'][rndi(0, 5)] });
  }
  puddles = [{ x: 320, y: TOP + 18 }, { x: 560, y: BOT - 22 }, { x: 740, y: (TOP + BOT) / 2 }];
  cart = { x: 470, y: (TOP + BOT) / 2, vy: 20 };
  slipCd = 0;
  msg = 'Get to the classroom door  ▶   (mind the wet floor)';
}

export const hallway = {
  id: 'hallway',
  enter() { reset(); state.running = true; },
  update(dt) {
    tickClock(dt, RATE);
    slipCd -= dt;
    em.slow = Math.max(0, em.slow - dt);

    const sp = em.slow > 0 ? 34 : 78;
    let mvx = (input.down('right') ? 1 : 0) - (input.down('left') ? 1 : 0);
    let mvy = (input.down('down') ? 1 : 0) - (input.down('up') ? 1 : 0);
    em.x = clamp(em.x + mvx * sp * dt, 12, WORLD_W - 20);
    em.y = clamp(em.y + mvy * sp * dt, TOP + 4, BOT - 4);
    if (mvx) em.f = mvx > 0 ? 1 : -1;
    if (mvx || mvy) { em.walk += dt * 10; if (Math.random() < dt * 6) sfx.step(); } else em.walk = 0;
    par.x += (clamp(em.x - 16, 6, WORLD_W) - par.x) * Math.min(1, dt * 3);
    par.y += (em.y - par.y) * Math.min(1, dt * 3);

    // kids wander + bump
    for (const k of kids) {
      k.x += k.vx * dt; k.y += k.vy * dt;
      if (k.x < 120 || k.x > WORLD_W - 20) k.vx *= -1;
      if (k.y < TOP + 4 || k.y > BOT - 4) k.vy *= -1;
      if (rnd() < dt) { k.vx = rnd(-24, 24); k.vy = rnd(-16, 16); }
      if (Math.hypot(k.x - em.x, k.y - em.y) < 12) {
        const a = Math.atan2(em.y - k.y, em.x - k.x);
        em.x += Math.cos(a) * 30 * dt; em.y += Math.sin(a) * 30 * dt;
        if (em.slow <= 0) { sfx.bump(); em.slow = 0.35; }
      }
    }
    // cart
    cart.y += cart.vy * dt;
    if (cart.y < TOP + 12 || cart.y > BOT - 12) cart.vy *= -1;
    if (Math.abs(cart.x - em.x) < 16 && Math.abs(cart.y - em.y) < 14) {
      em.x += (em.x < cart.x ? -1 : 1) * 40 * dt;
      if (em.slow <= 0) { sfx.bump(); em.slow = 0.4; msg = 'Excuse me, cart coming through!'; }
    }
    // puddles
    for (const p of puddles) {
      if (slipCd <= 0 && Math.hypot(p.x - em.x, p.y - em.y) < 12) {
        slipCd = 2; em.slow = 0.6; sfx.error();
        if (penalty(1, 'SLIPPED  +1 MIN')) return go('end', { win: false, reason: 'One slip too many in the hallway.' });
        msg = 'Whoa — slow down on the wet floor!';
      }
    }

    if (isLate()) return go('end', { win: false, reason: 'Lost in the hallway when class started.' });
    if (em.x >= WORLD_W - 24) return go('racks');
  },
  draw() {
    const camX = clamp(em.x - W / 2, 0, WORLD_W - W);
    rect(0, 0, W, H, '#d8d2c0');
    rect(0, 0, W, TOP - 6, '#b7b09a');                 // upper wall
    rect(0, TOP - 6, W, 3, '#8a8470');
    rect(0, BOT, W, H - BOT, '#9a9482');
    // floor tiles
    for (let x = -(camX % 32); x < W; x += 32) rect(x, TOP - 3, 1, BOT - TOP + 3, '#00000012');
    for (let y = TOP; y < BOT; y += 24) rect(0, y, W, 1, '#00000010');
    // lockers on upper wall
    for (let x = -(camX % 24); x < W; x += 24) { rect(x + 2, 10, 20, 40, '#7c8a99'); rect(x + 4, 12, 16, 8, '#65727f'); }
    // door numbers along the way
    for (const dx of [200, 400, 600]) { const sxp = dx - camX; if (sxp > -20 && sxp < W) { rect(sxp, TOP - 6, 24, 6, '#5b3a1e'); } }
    // classroom at the end
    const endS = (WORLD_W - 14) - camX;
    rect(endS - 18, TOP - 8, 26, BOT - TOP + 8, '#5b3a1e');
    rect(endS - 14, TOP + 2, 18, 26, '#9aa7d6');
    text('EMMIE\'S', endS - 5, 8, { size: 6, align: 'center', color: '#2a2' });
    text('CLASS', endS - 5, 16, { size: 6, align: 'center', color: '#2a2' });

    for (const p of puddles) { const x = p.x - camX; rect(x - 8, p.y - 4, 16, 8, '#7fc9e8'); rect(x + 6, p.y - 12, 8, 12, '#f1c40f'); rect(x + 6, p.y - 12, 8, 4, '#000'); }
    for (const k of kids) { const x = k.x - camX; if (x < -20 || x > W + 20) continue; shadow(x, k.y + 8, 7); drawEmmie(x, k.y, { facing: k.vx > 0 ? 1 : -1, frame: (k.x / 6 | 0) % 2, hoodie: k.c }); }

    const cx = cart.x - camX;
    shadow(cx, cart.y + 8, 12);
    rect(cx - 10, cart.y - 8, 20, 16, '#95a5a6'); rect(cx - 10, cart.y - 8, 20, 4, '#bdc3c7');
    rect(cx - 9, cart.y + 8, 3, 3, '#333'); rect(cx + 6, cart.y + 8, 3, 3, '#333');

    shadow(par.x - camX, par.y + 10);
    drawParent(par.x - camX, par.y - 6, { type: state.parent, facing: em.f, frame: (em.walk | 0) % 2 });
    shadow(em.x - camX, em.y + 8);
    drawEmmie(em.x - camX, em.y - 6, { facing: em.f, frame: (em.walk | 0) % 2 });
    if (em.slow > 0) text('!', em.x - camX, em.y - 22, { size: 6, align: 'center', color: '#ff5a5a' });

    rect(8, 20, W - 16, 4, '#000');
    rect(8, 20, (W - 16) * clamp(em.x / (WORLD_W - 24), 0, 1), 4, '#7CFC00');
    if (msg) text(msg, W / 2, H - 12, { size: 7, align: 'center', color: '#ffe066' });
  },
};
