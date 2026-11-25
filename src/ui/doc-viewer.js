import { h, richText } from './dom.js';
import { openModal } from './modal.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';

export function markRead(id) {
  if (!S.get().readDocs.includes(id)) S.update((s) => s.readDocs.push(id));
}

// 纸质资料。mirror=true 的是镜像字，需要点“翻转”才读得清
export function openDoc(doc, readId) {
  markRead(readId);
  const text = richText(doc.text, { source: doc.source ?? doc.title });
  const body = h('div', { class: 'paper' + (doc.mirror ? ' mirror' : '') }, text);
  const extra = doc.mirror
    ? h('button', { type: 'button', class: 'btn', onclick: () => body.classList.toggle('mirror') }, t('doc.flip'))
    : null;
  openModal({ title: doc.title, body: [extra, body], className: 'doc' });
}
