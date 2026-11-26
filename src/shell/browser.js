import { h, richText } from '../ui/dom.js';
import { openWindow } from '../ui/window.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { shell } from '../core/data.js';

// 记者电脑的浏览器：新闻首页 + 论坛。论坛要先看过聊天才出现（有人在群里提了一句）。
export function openBrowser() {
  let tab = 'news', thread = null;
  const page = h('div', { class: 'bpage' });
  const tabs = h('div', { class: 'btabs' });
  const body = h('div', {}, tabs, page);

  const render = () => {
    const f = S.get().flags;
    const forumOpen = f.includes('chat-read');
    if (!forumOpen && tab !== 'news') tab = 'news';
    tabs.replaceChildren(
      tabBtn('news', shell.news.site),
      forumOpen ? tabBtn('forum', shell.forum.site) : null);
    page.replaceChildren(tab === 'news' ? newsPage() : thread ? threadPage() : forumPage());
  };
  const tabBtn = (id, label) => h('button', {
    type: 'button', class: 'btab' + (tab === id ? ' on' : ''),
    onclick: () => { tab = id; thread = null; render(); },
  }, label);

  const gone = () => S.get().flags.includes('post-gone');

  const newsPage = () => h('article', {},
    h('h2', {}, richText(shell.news.headline, { source: t('shell.src.news') })),
    h('div', { class: 'ptext' }, richText(shell.news.body, { source: t('shell.src.news') })),
    h('h3', {}, t('shell.more')),
    h('ul', {}, shell.news.others.map((x) => h('li', {}, x))));

  const forumPage = () => h('div', {},
    h('h2', {}, shell.forum.site),
    h('ul', { class: 'threads' }, shell.forum.threads.filter((x) => !(x.key && gone())).map((x) => h('li', {},
      h('button', { type: 'button', class: 'tlink', onclick: () => { thread = x.id; render(); } }, x.title),
      h('span', { class: 'meta' }, `${x.author} · ${x.replies}`)))));

  const threadPage = () => {
    const back = h('button', { type: 'button', class: 'tlink', onclick: () => { thread = null; render(); } }, `‹ ${t('shell.back')}`);
    const key = shell.forum.threads.find((x) => x.id === thread);
    if (!key?.key) return h('div', {}, back, h('p', {}, t('shell.thread.empty')));
    if (gone()) return h('div', {}, back, h('p', { class: 'gone' }, shell.forum.post.gone));
    const p = shell.forum.post;
    return h('div', {}, back,
      h('h2', {}, p.title),
      h('p', { class: 'meta' }, `${p.author} · ${p.time}`),
      h('div', { class: 'ptext' }, richText(p.text, { source: t('shell.src.forum') })),
      h('ul', { class: 'replies' }, p.replies.map((r) => h('li', {}, `${r.floor} 楼：${r.text}`))));
  };

  const w = openWindow({ id: 'browser', title: t('shell.app.browser'), body, kind: 'flat', className: 'browser', width: 640, onClose: () => off() });
  const off = on('state', () => { if (w.el.isConnected) render(); });
  render();
}
