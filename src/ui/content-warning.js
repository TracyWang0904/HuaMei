import { h } from './dom.js';
import { openModal } from './modal.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';

export function ensureContentAck(then) {
  if (S.get().contentAck) return then();
  const m = openModal({
    title: t('warn.title'),
    body: [h('p', {}, t('warn.body')),
      h('button', { type: 'button', onclick: () => { S.update((s) => { s.contentAck = true; }); m.close(); } }, t('warn.confirm'))],
    onClose: () => { if (S.get().contentAck) then(); },
  });
  m.el.querySelector('header button').remove(); // 必须点“确认”才能进入
}
