import { h } from '../ui/dom.js';
import { openWindow } from '../ui/window.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { applyEffects, meets } from '../core/effects.js';
import { shell } from '../core/data.js';

export const chatUnread = () => !S.get().flags.includes('chat-read');

const HUES = [212, 28, 140, 275, 340, 190, 52];
const avatar = (name, cls = '') => {
  const hue = HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
  return h('span', { class: `cav ${cls}`, style: `--hue:${hue}` }, [...name][0]);
};

// 记者电脑的“信息”：macOS 深色样式——左边会话列表，右边气泡
export function openChat(thread) {
  let cur = typeof thread === 'string' ? thread : shell.chat.threads[0].id;
  const list = h('div', { class: 'clist' });
  const head = h('div', { class: 'chead' });
  const msgs = h('div', { class: 'cmsgs' });
  const visible = (th) => th.messages.filter((m) => meets(m.showWhen));
  const render = () => {
    list.replaceChildren(h('div', { class: 'csearch' }, h('span', {}, '⌕'), t('shell.chat.search')),
      ...shell.chat.threads.map((th) => {
        const last = visible(th).at(-1);
        return h('button', { type: 'button', class: 'cthread' + (th.id === cur ? ' on' : ''), onclick: () => { cur = th.id; render(); } },
          avatar(th.name), h('span', { class: 'cinfo' }, h('b', {}, th.name), h('span', {}, last ? last.text : '')));
      }));
    const th = shell.chat.threads.find((x) => x.id === cur);
    const ms = visible(th);
    const group = new Set(ms.map((m) => m.from)).size > 1;
    head.replaceChildren(avatar(th.name, 'big'), h('span', { class: 'cpill' }, th.name));
    msgs.replaceChildren(...ms.map((m) => h('div', { class: 'cmsg' }, group ? h('span', { class: 'cfrom' }, m.from) : null, h('span', { class: 'ctext' }, m.text))));
    msgs.scrollTop = msgs.scrollHeight;
  };
  const main = h('div', { class: 'cmain' }, head, msgs, h('div', { class: 'cinput' }, h('span', { class: 'cplus' }, '+'), h('span', { class: 'cfield' }, t('shell.chat.input'))));
  const w = openWindow({ id: 'chat', title: t('shell.app.chat'), body: h('div', { class: 'chat' }, list, main), kind: 'flat', className: 'chatwin', width: 780, onClose: () => off() });
  const off = on('state', () => { if (w.el.isConnected) render(); });
  render();
  if (chatUnread()) applyEffects([{ flag: 'chat-read' }]);
}
