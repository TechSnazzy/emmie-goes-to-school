// Saved keepsakes are separate from the original game's speed records.
export const STICKERS = [
  { id: 'milo', icon: '🐈‍⬛', name: 'Milo magic', hint: 'A little sparkle on the bedroom rug.', scene: 'bedroom', x: 352, y: 280 },
  { id: 'love', icon: '💌', name: 'Made with love', hint: 'Look beside the living-room rug.', scene: 'leave', x: 380, y: 290 },
  { id: 'road', icon: '🚗', name: 'Road trip', hint: 'Ride with Dad to the park.', scene: 'drive' },
  { id: 'butterfly', icon: '🦋', name: 'Little explorer', hint: 'A sparkle beside the park bench.', scene: 'park', x: 650, y: 280 },
  { id: 'puppy', icon: '🐶', name: 'Puppy pal', hint: 'Find the puppy by the school gate.', scene: 'fence', x: 190, y: 320 },
  { id: 'art', icon: '🎨', name: 'Color collector', hint: 'Look for a sparkle in the hallway.', scene: 'hallway', x: 430, y: 240 },
  { id: 'pack', icon: '🎒', name: 'Ready for anything', hint: 'Something sparkles near the cubbies.', scene: 'racks', x: 270, y: 200 },
  { id: 'sun', icon: '🌈', name: 'Hello, sunshine!', hint: 'One last discovery in the schoolyard.', scene: 'line', x: 390, y: 300 },
];
export const CHAPTERS = [
  ['bedroom', 'Home', '🏡'], ['leave', 'Let’s go', '💌'], ['drive', 'The ride', '🚗'],
  ['park', 'The park', '🌳'], ['fence', 'Hello!', '🐶'], ['hallway', 'School', '🏫'],
  ['racks', 'My things', '🎒'], ['line', 'My class', '🌈'],
];
export const PACKS = [
  { name: 'Berry pink', color: '#ee6ca5', light: '#ffacd0' },
  { name: 'Lilac dream', color: '#9b79df', light: '#d3b9ff' },
  { name: 'Ocean mint', color: '#45bbaa', light: '#9ae9d5' },
];
let saved = {};
try { saved = JSON.parse(localStorage.getItem('emmie_adventure_v1')) || {}; } catch {}
export const adventure = {
  pack: Number.isInteger(saved.pack) && PACKS[saved.pack] ? saved.pack : 0,
  album: new Set(Array.isArray(saved.album) ? saved.album.filter(id => STICKERS.some(s => s.id === id)) : []),
  visits: Number.isSafeInteger(saved.visits) && saved.visits > 0 ? saved.visits : 0,
  found: new Set(), chapter: -1, fraction: 0, paused: false, guided: false, readAloud: false,
};
function save() {
  try { localStorage.setItem('emmie_adventure_v1', JSON.stringify({pack: adventure.pack, album: [...adventure.album], visits: adventure.visits})); } catch {}
}
export function choosePack(index) {
  if (!PACKS[index]) return;
  adventure.pack = index; save();
  window.dispatchEvent(new CustomEvent('pack-changed'));
}
export function resetAdventure() {
  adventure.found.clear(); adventure.chapter = -1; adventure.fraction = 0; adventure.guided = false;
}
export function chapterProgress(id, fraction = 0) {
  adventure.chapter = CHAPTERS.findIndex(c => c[0] === id);
  adventure.fraction = Math.max(0, Math.min(1, fraction));
}
export function collectSticker(id) {
  if (adventure.found.has(id)) return false;
  const sticker = STICKERS.find(s => s.id === id);
  if (!sticker) return false;
  adventure.found.add(id); adventure.album.add(id); save();
  window.dispatchEvent(new CustomEvent('sticker-found', {detail: sticker}));
  return true;
}
export function completeAdventure() { adventure.visits++; save(); }
