import { h } from './dom.js';
import { makeDraggable } from './drag.js';
import { t } from '../core/i18n.js';

// 非模态窗口：可以同时开好几个，点哪个哪个就在最前。模态弹窗（modal-overlay，z-index 100）始终盖在它们上面。
// kind：'win98' 千禧年风格（基地内网）｜'flat' 现代扁平（记者的电脑）
let z = 20;
export const bringToFront = (el) => { el.style.zIndex = String(Math.min(++z, 90)); };

const open = new Map();

export function openWindow({ id, title, body, kind = 'win98', className = '', width = 480, onClose }) {
  const old = id && open.get(id);
  if (old?.el.isConnected) { bringToFront(old.el); return old; }

  const close = () => { el.remove(); open.delete(id); onClose?.(); };
  const flat = kind === 'flat';
  const x = h('button', { type: 'button', class: flat ? 'fclose' : 'tb-btn', 'aria-label': t('common.close'), onclick: close }, flat ? '' : '×');
  // 记者电脑（macOS 风格）：左上角红黄绿三个圆点，黄、绿只是装饰
  const bar = flat
    ? h('div', { class: 'fbar' }, h('span', { class: 'lights' }, x, h('i', { class: 'fmin' }), h('i', { class: 'fmax' })), h('span', { class: 'title' }, title))
    : h('div', { class: 'titlebar' }, h('span', { class: 'title' }, title), x);
  const el = h('div', { class: `${kind === 'flat' ? 'fwin' : 'win98 xwin'} ${className}`, role: 'dialog', 'aria-label': title },
    bar, h('div', { class: kind === 'flat' ? 'fbody' : 'xbody' }, body));
  if (flat && id) el.dataset.wid = id;
  const n = open.size % 6;
  el.style.width = `min(${width}px, calc(100% - 24px))`;
  el.style.left = `${130 + n * 28}px`;
  el.style.top = `${40 + n * 28}px`;
  bringToFront(el);
  el.addEventListener('pointerdown', () => bringToFront(el));
  makeDraggable(el, bar);
  document.body.append(el);
  const w = { el, close };
  if (id) open.set(id, w);
  return w;
}
