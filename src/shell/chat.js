import { h } from '../ui/dom.js';
import { openWindow } from '../ui/window.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { applyEffects, meets } from '../core/effects.js';
import { shell } from '../core/data.js';

export const chatUnread = () => !S.get().flags.includes('chat-read');

export function openChat() {
  let cur = shell.chat.threads[0].id;
  const list = h('div', { class: 'clist' });
  const msgs = h('div', { class: 'cmsgs' });
  const render = () => {
    list.replaceChildren(...shell.chat.threads.map((th) => h('button', {
      type: 'button', class: 'cthread' + (th.id === cur ? ' on' : ''), onclick: () => { cur = th.id; render(); },
    }, th.name)));
    const th = shell.chat.threads.find((x) => x.id === cur);
    msgs.replaceChildren(...th.messages.filter((m) => meets(m.showWhen)).map((m) => h('div', { class: 'cmsg' },
      h('span', { class: 'cfrom' }, m.from), h('span', { class: 'ctext' }, m.text))));
    msgs.scrollTop = msgs.scrollHeight;
  };
  const w = openWindow({ id: 'chat', title: t('shell.app.chat'), body: h('div', { class: 'chat' }, list, msgs), kind: 'flat', className: 'chatwin', width: 600, onClose: () => off() });
  const off = on('state', () => { if (w.el.isConnected) render(); });
  render();
  if (chatUnread()) applyEffects([{ flag: 'chat-read' }]);
}
