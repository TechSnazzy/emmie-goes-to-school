// main.js — wire scenes together and run the loop.
import { W, H, ctx, startLoop, initTouch } from './engine.js';
import { settings, toggleMusic, toggleSfx } from './audio.js';
import {
  state, resetRun, makeStory, updateSceneManager, currentScene,
  goScene, drawFade, drawHUD, drawToasts, updateToasts,
} from './state.js';
import { register, go } from './router.js';

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

window.__dbg = { frames: 0, scene: '' };

initTouch();

const intro = makeStory([
  ['Emmie Goes to School', "It's 6:50 in the morning."],
  ['Walk with the ARROW KEYS.', 'Press  Z  at the glowing spot.'],
  ['A yellow arrow always points', 'to the next thing to do.'],
  ['Mom helps Emmie get ready,', 'then Dad walks her to school.'],
], () => go('bedroom'));

[['title', title], ['intro', intro], ['bedroom', bedroom], ['leave', leave], ['drive', drive],
['park', park], ['fence', fence], ['hallway', hallway], ['racks', racks], ['line', line], ['end', end]]
  .forEach(([n, s]) => register(n, s));

const NO_HUD = new Set(['title', 'story', 'end']);

// music / sfx buttons in the page
function wireButton(id, get, set) {
  const el = document.getElementById(id);
  if (!el) return;
  const paint = () => { el.textContent = el.dataset.icon + (get() ? '' : ' off'); el.classList.toggle('off', !get()); };
  el.addEventListener('click', () => { set(); paint(); });
  paint();
}
wireButton('btn-music', () => settings.music, toggleMusic);
wireButton('btn-sfx', () => settings.sfx, toggleSfx);

// dev helper: ?scene=bedroom jumps straight in; add &auto to autoplay
const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const startAt = params.get('scene');
if (params.has('auto')) globalThis.__EMMIE_AUTOPLAY = true;
if (startAt && startAt !== 'title') { state.parent = params.get('parent') === 'MOM' ? 'MOM' : 'DAD'; go(startAt); }
else goScene(title);

startLoop((dt) => {
  updateSceneManager(dt);
  const s = currentScene();
  window.__dbg.frames++; window.__dbg.scene = s && s.id || '';
  if (s && s.update) s.update(dt);
  updateToasts(dt);

  ctx.clearRect(0, 0, W, H);
  if (s && s.draw) s.draw();
  if (s && !NO_HUD.has(s.id)) drawHUD();
  drawToasts();
  drawFade();
});

void resetRun;
