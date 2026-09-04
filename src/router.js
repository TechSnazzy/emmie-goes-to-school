// router.js — indirection so scene modules never import one another.
import { setScene } from './state.js';

export const scenes = {};
export function register(name, scene) { scenes[name] = scene; }
export function go(name, payload) {
  const s = scenes[name];
  if (!s) throw new Error('unknown scene: ' + name);
  setScene(s, payload);
}
