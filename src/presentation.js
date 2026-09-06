import { adventure, STICKERS, CHAPTERS, PACKS, choosePack } from './adventure.js';
import { state, toast } from './state.js';
import { go } from './router.js';
import { sfx, startMusic } from './audio.js';
import { resize } from './render3d.js';
import { VERSION } from './version.js';
const $ = id => document.getElementById(id);
const album = $('album-dialog'), pause = $('pause-dialog');
let screen = '', lastObjective = '', lastChapter = '', lastFound = '', focusBeforeDialog = null;
function paintPacks() {
  $('pack-choices').replaceChildren(...PACKS.map((pack, index) => {
    const button = document.createElement('button');
    button.className = 'pack-choice'; button.setAttribute('aria-label', pack.name);
    button.setAttribute('aria-pressed', String(adventure.pack === index)); button.style.setProperty('--pack', pack.color);
    const icon = document.createElement('span'); icon.className = 'mini-pack'; icon.setAttribute('aria-hidden','true'); button.append(icon);
    button.addEventListener('click', () => { choosePack(index); sfx.pickup(); paintPacks(); $('pack-choices').children[index].focus(); });
    return button;
  }));
}
function paintAlbum() {
  $('sticker-grid').replaceChildren(...STICKERS.map(sticker => {
    const found = adventure.album.has(sticker.id), card = document.createElement('div');
    card.className = 'sticker-card' + (found ? ' found' : '');
    const icon = document.createElement('span'); icon.className = 'sticker-icon'; icon.textContent = found ? sticker.icon : '✧';
    const name = document.createElement('b'); name.textContent = found ? sticker.name : 'A little mystery';
    const hint = document.createElement('p'); hint.textContent = found ? 'Found with love ♡' : sticker.hint;
    card.append(icon,name,hint); return card;
  }));
  $('album-footer').textContent = `${adventure.album.size} of 8 lovely memories collected · Saved on this device ♡`;
}
function showDialog(dialog) { focusBeforeDialog = document.activeElement; adventure.paused = true; window.speechSynthesis?.cancel(); dialog.showModal(); }
function openAlbum() { paintAlbum(); showDialog(album); }
function speak() {
  if (!adventure.readAloud || !state.objective || !('speechSynthesis' in window) || adventure.paused) return;
  window.speechSynthesis.cancel();
  const words = new SpeechSynthesisUtterance(state.objective.replace(/[▶↑↓]/g,''));
  words.rate = 0.87; words.pitch = 1.1; window.speechSynthesis.speak(words);
}
export function initPresentation() {
  paintPacks();
  document.querySelector('.welcome-footer').lastElementChild.title = `Version ${VERSION}`;
  document.body.dataset.version = VERSION;
  $('btn-play').addEventListener('click', () => { sfx.confirm(); startMusic(); go('bedroom'); });
  $('btn-replay').addEventListener('click', () => { sfx.confirm(); go('title'); });
  $('btn-album').addEventListener('click', openAlbum); $('btn-end-album').addEventListener('click', openAlbum);
  album.querySelector('.close-dialog').addEventListener('click', () => album.close());
  $('btn-pause').addEventListener('click', () => showDialog(pause)); $('btn-resume').addEventListener('click', () => pause.close());
  for (const dialog of [album,pause]) dialog.addEventListener('close', () => { adventure.paused = false; focusBeforeDialog?.focus(); });
  $('btn-guide').addEventListener('click', () => { adventure.guided = true; sfx.confirm(); });
  const read = $('btn-read'); if (!('speechSynthesis' in window)) read.hidden = true;
  read.addEventListener('click', () => {
    adventure.readAloud = !adventure.readAloud; read.setAttribute('aria-pressed', String(adventure.readAloud));
    read.textContent = adventure.readAloud ? '♡ Reading directions · on' : '♡ Read directions to me';
    if (adventure.readAloud) speak(); else window.speechSynthesis.cancel();
  });
  window.addEventListener('sticker-found', ({detail}) => { toast(`${detail.icon} ${detail.name} — a sticker for you!`); sfx.star(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !album.open && !pause.open && !['title','end'].includes(screen)) { e.preventDefault(); showDialog(pause); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !adventure.paused && !['title','end',''].includes(screen)) showDialog(pause); });
}
export function syncPresentation(id) {
  if (screen !== id) {
    screen = id; $('welcome').hidden = id !== 'title'; $('celebration').hidden = id !== 'end';
    $('btn-pause').hidden = ['title','end','story'].includes(id); window.speechSynthesis?.cancel();
    if (id === 'end') {
      $('end-message').textContent = adventure.found.size ? `You found ${adventure.found.size} little ${adventure.found.size === 1 ? 'wonder' : 'wonders'} along the way. What a lovely morning!` : 'You helped, you explored, and you made it to class. What a lovely morning!';
      $('end-stickers').replaceChildren(...STICKERS.filter(s=>adventure.found.has(s.id)).map(s=>{ const span=document.createElement('span'); span.textContent=s.icon; span.title=s.name; return span; }));
    }
    requestAnimationFrame(resize);
  }
  const chapter = adventure.chapter;
  if (lastChapter !== String(chapter)) {
    lastChapter = String(chapter); $('chapter-label').textContent = chapter < 0 ? 'MY MORNING' : `CHAPTER ${chapter + 1} OF 8 · ${CHAPTERS[chapter][2]}`;
    $('journey').replaceChildren(...CHAPTERS.map((c,i)=>{ const dot=document.createElement('span'); dot.className='journey-dot'+(i<chapter?' complete':i===chapter?' current':''); dot.title=c[1]; dot.setAttribute('aria-label',c[1]+(i<chapter?' complete':i===chapter?' current':'')); return dot; }));
  }
  const found = id + [...adventure.found].join(',');
  if (lastFound !== found) {
    lastFound = found; $('album-count').textContent = `${adventure.album.size}/8`;
    const sticker = STICKERS.find(s=>s.scene===id);
    $('discovery-hint').textContent = sticker && adventure.found.has(sticker.id) ? `${sticker.icon} You found ${sticker.name.toLowerCase()}!` : sticker?.hint || 'Tap a golden star to collect a sticker!';
  }
  $('btn-guide').hidden = id === 'drive';
  if (state.objective !== lastObjective) { lastObjective = state.objective; speak(); }
}
