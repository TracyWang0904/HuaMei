import { h } from '../ui/dom.js';
import { openModal } from '../ui/modal.js';
import { t } from '../core/i18n.js';
import { on } from '../core/events.js';
import * as S from '../core/state.js';
import { notebookIntro } from '../core/data.js';
import { openWindow } from '../ui/window.js';

// 笔记本只显示：序章手写页、收录的词（每个词只有一条，带出处）、道具。不写解释和推测。
export function openNotebook() {
  const body = h('div', { class: 'nb' });
  const render = () => {
    const s = S.get();
    const words = Object.entries(s.notebook);
    body.replaceChildren(
      h('section', {}, h('h3', {}, notebookIntro.title), h('pre', { class: 'paper' }, notebookIntro.text)),
      h('section', {}, h('h3', {}, t('notebook.words')),
        words.length
          ? h('ul', {}, words.map(([w, srcs]) => h('li', {}, `${w}：${srcs[0]}`)))
          : h('p', { class: 'empty' }, t('notebook.empty'))),
      h('section', {}, h('h3', {}, t('notebook.items')),
        s.items.length ? h('ul', {}, s.items.map((i) => h('li', {}, i.name))) : h('p', { class: 'empty' }, t('notebook.empty'))),
    );
  };
  render();
  const off = on('state', render);
  // 记者的电脑上是“备忘录”（macOS 窗口）；进了内网，笔记本仍是千禧年风格的小窗口
  if (document.body.classList.contains('in-intranet')) openModal({ title: t('notebook.title'), body, className: 'notebook', onClose: off });
  else openWindow({ id: 'notebook', title: t('shell.app.notebook'), body, kind: 'flat', className: 'notewin', width: 520, onClose: off });
}
