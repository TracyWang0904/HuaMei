import { h } from './dom.js';
import { t } from '../core/i18n.js';

export function openModal({ title, body, onClose, className = '' }) {
  const overlay = h('div', { class: 'modal-overlay' });
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = (e) => { if (e.key === 'Escape' && overlay === [...document.querySelectorAll('.modal-overlay')].pop()) close(); };
  overlay.append(h('div', { class: `modal ${className}`, role: 'dialog', 'aria-label': title },
    h('header', {}, h('h2', {}, title), h('button', { type: 'button', onclick: close }, t('common.close'))),
    h('div', { class: 'modal-body' }, body)));
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  return { close, el: overlay };
}
