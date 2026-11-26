import { h } from '../ui/dom.js';
import { openModal } from '../ui/modal.js';
import { t } from '../core/i18n.js';
import { on } from '../core/events.js';
import * as S from '../core/state.js';
import { notebookIntro, shell } from '../core/data.js';
import { emit } from '../core/events.js';

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
          ? h('ul', {}, words.map(([w, srcs]) => h('li', {}, `${w}：${srcs[0]}`, w === shell.intranet.linkWord
            ? h('button', { type: 'button', class: 'btn tiny', onclick: () => emit('open-intranet') }, t('notebook.open')) : null)))
          : h('p', { class: 'empty' }, t('notebook.empty'))),
      h('section', {}, h('h3', {}, t('notebook.items')),
        s.items.length ? h('ul', {}, s.items.map((i) => h('li', {}, i.name))) : h('p', { class: 'empty' }, t('notebook.empty'))),
    );
  };
  render();
  const off = on('state', render);
  openModal({ title: t('notebook.title'), body, className: 'notebook', onClose: off });
}
