import { h } from './dom.js';
import { openModal } from './modal.js';
import { t } from '../core/i18n.js';
import { exportSave, importSave, clear } from '../core/storage.js';
import * as S from '../core/state.js';

export function openSavePanel(onChanged) {
  const box = h('textarea', { placeholder: t('save.import.prompt') });
  const msg = h('p', { class: 'msg' });
  const body = [
    h('div', { class: 'btn-row' },
      h('button', { type: 'button', class: 'btn', onclick: () => { box.value = exportSave(S.get()); box.select(); } }, t('save.export')),
      h('button', { type: 'button', class: 'btn', onclick: () => {
        try { importSave(box.value); S.reload(); msg.textContent = t('save.import.ok'); onChanged(); } catch { msg.textContent = t('save.import.fail'); }
      } }, t('save.import')),
      h('button', { type: 'button', class: 'btn', onclick: () => {
        if (confirm(t('save.clear.confirm'))) { clear(); S.reload(); onChanged(); msg.textContent = ''; }
      } }, t('save.clear'))),
    box, msg,
  ];
  openModal({ title: t('nav.settings'), body });
}
