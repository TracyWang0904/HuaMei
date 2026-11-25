import { h } from './dom.js';
import { icon } from './icons.js';
import { makeDraggable } from './drag.js';
import { t } from '../core/i18n.js';

// 千禧年风格的小窗口：蓝色标题栏、灰色窗体，可拖动
export function openModal({ title, body, onClose, className = '', closable = true }) {
  const overlay = h('div', { class: 'modal-overlay' });
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = (e) => { if (closable && e.key === 'Escape' && overlay === [...document.querySelectorAll('.modal-overlay')].pop()) close(); };
  const bar = h('div', { class: 'titlebar' }, h('span', { class: 'title' }, title),
    closable ? h('button', { type: 'button', class: 'tb-btn', 'aria-label': t('common.close'), onclick: close }, '×') : null);
  const win = h('div', { class: `win98 modal-win ${className}`, role: 'dialog', 'aria-label': title },
    bar, h('div', { class: 'win-content' }, body));
  overlay.append(win);
  makeDraggable(win, bar);
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  return { close, el: overlay };
}

// 消息框：图标 + 一句话 + 确定（像 Windows 的错误提示）
export function openMsgBox({ title, text, kind = 'info', okLabel = t('common.ok'), closable = true, onOk }) {
  let m;
  const ok = h('button', { type: 'button', class: 'btn default', onclick: () => { m.close(); onOk?.(); } }, okLabel);
  m = openModal({
    title, closable, className: 'msgbox',
    body: [h('div', { class: 'msg-row' }, icon(kind, 32), h('p', {}, text)), h('div', { class: 'btn-row center' }, ok)],
  });
  ok.focus();
  return m;
}
