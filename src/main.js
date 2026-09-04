// main.js — wire scenes together and run the loop.
import { startLoop, initTouch, clearOverlay } from './engine.js';
import { settings, toggleMusic, toggleSfx } from './audio.js';
import {
  state, makeStory, updateSceneManager, currentScene,
  goScene, drawFade, syncHUD, updateToasts, setScreenMode,
} from './state.js';
import { render } from './render3d.js';
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
  ['Click where Emmie should go.', 'She walks there all by herself.'],
  ['A yellow ring shows the next job —', 'click it and she does the rest.'],
  ['Mom helps Emmie get ready,', 'then Dad walks her to school.'],
], () => go('bedroom'));

[['title', title], ['intro', intro], ['bedroom', bedroom], ['leave', leave], ['drive', drive],
['park', park], ['fence', fence], ['hallway', hallway], ['racks', racks], ['line', line], ['end', end]]
  .forEach(([n, s]) => register(n, s));

function wireButton(id, get, set) {
  const el = document.getElementById(id);
  if (!el) return;
  const paint = () => { el.textContent = el.dataset.icon + (get() ? '' : ' off'); el.classList.toggle('off', !get()); };
  el.addEventListener('click', () => { set(); paint(); });
  paint();
}
wireButton('btn-music', () => settings.music, toggleMusic);
wireButton('btn-sfx', () => settings.sfx, toggleSfx);

// dev helper: ?scene=park jumps straight in, &auto autoplays
const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
if (params.has('auto')) globalThis.__EMMIE_AUTOPLAY = true;
const startAt = params.get('scene');
if (startAt && startAt !== 'title') go(startAt); else goScene(title);

startLoop((dt) => {
  updateSceneManager(dt);
  const s = currentScene();
  window.__dbg.frames++; window.__dbg.scene = (s && s.id) || '';
  if (s && s.update) s.update(dt);
  updateToasts(dt);
  syncHUD();
  setScreenMode(!!(s && s.screen));

  render();
  clearOverlay();
  if (s && s.draw) s.draw();
  drawFade();
});

void state;
