import { h, richText } from '../ui/dom.js';
import { openWindow } from '../ui/window.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { shell } from '../core/data.js';
import { enterIntranet } from './intranet.js';

const norm = (u) => u.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/\/+$/, '');
const who = (name) => h('span', { class: 'who' }, name, h('i', { class: 'lv' }, `Lv${shell.forum.levels[name] ?? 1}`));
const keyThread = () => shell.forum.threads.find((x) => x.key);

// 记者电脑的浏览器：地址栏 + 新闻首页 + 论坛。论坛要先看过聊天才出现（有人在群里提了一句）。
// 在地址栏输入笔记本里收录的链接，整块屏幕直接切换到基地内网。
export function openBrowser() {
  let page = 'news', thread = null, bad = '';
  const view = h('div', { class: 'bpage' });
  const tabs = h('div', { class: 'btabs' });
  const addr = h('input', { type: 'text', class: 'addr', placeholder: t('shell.addr.ph'), spellcheck: 'false', autocomplete: 'off' });
  const go = () => {
    const u = norm(addr.value);
    if (u === norm(shell.intranet.linkWord)) { addr.value = ''; return enterIntranet(); }
    if (u === norm(shell.news.url)) { page = 'news'; thread = null; bad = ''; }
    else if (u === norm(shell.forum.url) && forumOpen()) { page = 'forum'; thread = null; bad = ''; }
    else { page = 'error'; bad = addr.value.trim(); }
    render();
  };
  addr.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  const bar = h('div', { class: 'abar' }, addr, h('button', { type: 'button', class: 'abtn', onclick: go }, t('shell.addr.go')));
  const body = h('div', {}, bar, tabs, view);

  const forumOpen = () => S.get().flags.includes('chat-read');
  const gone = () => S.get().flags.includes('post-gone');
  const tabBtn = (id, label) => h('button', {
    type: 'button', class: 'btab' + (page === id ? ' on' : ''),
    onclick: () => { page = id; thread = null; bad = ''; render(); },
  }, label);

  const render = () => {
    if (!forumOpen() && page === 'forum') page = 'news';
    tabs.replaceChildren(tabBtn('news', shell.news.site), forumOpen() ? tabBtn('forum', shell.forum.site) : null);
    if (page !== 'error') addr.value = page === 'news' ? shell.news.url : shell.forum.url;
    view.replaceChildren(page === 'error' ? errorPage() : page === 'news' ? newsPage() : thread ? threadPage() : forumPage());
  };

  const errorPage = () => h('div', { class: 'gone' }, h('h2', {}, t('shell.addr.err')), h('p', {}, t('shell.addr.err2', { url: bad })));

  const newsPage = () => h('article', {},
    h('h2', {}, richText(shell.news.headline, { source: t('shell.src.news') })),
    h('div', { class: 'ptext' }, richText(shell.news.body, { source: t('shell.src.news') })),
    h('h3', {}, t('shell.more')),
    h('ul', {}, shell.news.others.map((x) => h('li', {}, x))));

  // 那个热帖整串消失：不只是浣花溪上的回复，连楼主的帖子和列表里的条目都没了
  const forumPage = () => h('div', {},
    h('h2', {}, shell.forum.site),
    h('ul', { class: 'threads' }, shell.forum.threads.filter((x) => !(x.key && gone())).map((x) => h('li', {},
      x.key ? h('button', { type: 'button', class: 'tlink', onclick: () => { thread = x.id; render(); } }, x.title) : h('span', {}, x.title),
      h('span', { class: 'meta' }, who(x.author), ` · ${x.replies}`)))));

  const threadPage = () => {
    const back = h('button', { type: 'button', class: 'tlink', onclick: () => { thread = null; render(); } }, `‹ ${t('shell.back')}`);
    const th = shell.forum.threads.find((x) => x.id === thread);
    if (!th?.key) return h('div', {}, back, h('p', {}, t('shell.thread.empty')));
    if (gone()) return h('div', {}, back, h('p', { class: 'gone' }, th.gone));
    return h('div', {}, back,
      h('h2', {}, th.title),
      h('p', { class: 'meta' }, who(th.author), ` · ${th.time}`),
      h('div', { class: 'ptext' }, richText(th.text, { source: t('shell.src.forum') })),
      h('ul', { class: 'replies' }, th.posts.map((r) => h('li', {},
        h('div', { class: 'meta' }, `${r.floor} 楼 · `, who(r.author)),
        h('div', { class: 'ptext' }, richText(r.text, { source: t('shell.src.forum') }))))));
  };

  const w = openWindow({ id: 'browser', title: t('shell.app.browser'), body, kind: 'flat', className: 'browser', width: 700, onClose: () => off() });
  const off = on('state', () => { if (w.el.isConnected) render(); });
  render();
}
