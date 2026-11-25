import { h } from '../ui/dom.js';
import { openMsgBox } from '../ui/modal.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { endings } from '../core/data.js';

// 结局：黑屏上依次出现几段文字，最后是标题卡。结局会记进存档的“已达成结局”。
export function showEnding(key, onClose) {
  const e = endings[key];
  S.update((s) => { if (!s.endings.includes(key)) s.endings.push(key); });

  const lines = h('div', { class: 'ending-lines' });
  const card = h('h1', { class: 'ending-title' }, e.title);
  const back = h('button', { type: 'button', class: 'btn', hidden: true, onclick: () => { root.remove(); onClose?.(); } }, t('ending.back'));
  const root = h('div', { class: 'ending' }, lines, card, e.terminal ? h('p', { class: 'ending-terminal' }, e.terminal) : null, back);
  document.body.append(root);

  // 逐段显示，每段间隔 2.2 秒；标题卡最后出现
  const paragraphs = e.lines ?? [];
  paragraphs.forEach((text, i) => setTimeout(() => lines.append(h('p', {}, text)), 600 + i * 2200));
  const end = 600 + paragraphs.length * 2200 + 800;
  setTimeout(() => card.classList.add('show'), end);
  setTimeout(() => {
    back.hidden = false;
    if (e.popup) openMsgBox({ title: t('ws.title'), text: e.popup, kind: 'info' });
  }, end + 1600);
}
