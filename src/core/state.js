// 内存中的当前存档；所有改动走 update()，自动落盘并广播 'state'
import { load, save } from './storage.js';
import { emit } from './events.js';

let state = load();

export const get = () => state;

export function update(fn) {
  fn(state);
  save(state);
  emit('state', state);
}

export function reload() {
  state = load();
  emit('state', state);
}
