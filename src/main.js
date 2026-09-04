// main.js — boot the game: register scenes, wire the loop, draw the shared HUD.
import { W, H, ctx, startLoop, text } from './engine.js';
import {
  state, fmtClock, drawHUD, drawToasts, updateToasts,
  updateSceneManager, currentScene, setScene, drawWipe, makeStory, START,
} from './state.js';
import { register, scenes, go } from './router.js';

import { title } from './scenes/title.js';
import { bedroom } from './scenes/bedroom.js';
import { leave } from './scenes/leave.js';
import { drive } from './scenes/drive.js';
import { park } from './scenes/park.js';
import { fence } from './scenes/fence.js';
import { hallway } from './scenes/hallway.js';
import { racks } from './scenes/racks.js';
import { line } from './scenes/line.js';
import { end } from './scenes/end.js';

// --- narrative intro -------------------------------------------------
const intro = makeStory([
  ['MONDAY MORNING', fmtClock(START)],
  ["Emmie has to be in line", 'by 7:50 or she is LATE.'],
  ['The gate opens at 7:35.', 'The first bell rings at 7:47.'],
  ['Wake up, get ready, and', 'get to class on time!'],
  [() => `Today ${state.parent} walks with Emmie.`],
], () => go('bedroom'));

register('title', title);
register('intro', intro);
register('bedroom', bedroom);
register('leave', leave);
register('drive', drive);
register('park', park);
register('fence', fence);
register('hallway', hallway);
register('racks', racks);
register('line', line);
register('end', end);

const GAMEPLAY = new Set(['bedroom', 'leave', 'drive', 'park', 'fence', 'hallway', 'racks', 'line']);
const HINTS = {
  bedroom: 'Arrows move · hold Z to do a task',
  leave: 'Arrows walk · Z to act',
  drive: 'Arrows change lanes',
  park: 'Up/Space JUMP · Down DUCK',
  fence: 'Tap Right to stay put',
  hallway: 'Arrows move · avoid the wet floor',
  racks: 'Arrows walk · hold Z',
  line: 'Arrows run to the line',
};

// CRT scanline + vignette overlay drawn every frame
function crt() {
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

setScene(title);

startLoop((dt) => {
  updateSceneManager(dt);
  const s = currentScene();
  if (s && s.update) s.update(dt);
  updateToasts(dt);

  ctx.clearRect(0, 0, W, H);
  if (s && s.draw) s.draw();
  if (s && GAMEPLAY.has(s.id)) {
    drawHUD({ label: s.id.toUpperCase(), hint: HINTS[s.id] || '' });
    drawToasts();
  }
  drawWipe();
  crt();
});

// tiny boot splash until the first frame paints
text('LOADING...', W / 2, H / 2, { size: 10, align: 'center', color: '#fff' });
void scenes;
