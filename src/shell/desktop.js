import { h } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { applyEffects } from '../core/effects.js';
import { hasWord } from '../core/notebook.js';
import { shell } from '../core/data.js';
import { nowString } from '../core/clock.js';
import { flatIcon } from './icons.js';
import { openBrowser } from './browser.js';
import { openChat, chatUnread } from './chat.js';
import { openNotebook } from '../notebook/notebook-ui.js';
import { openSavePanel } from '../ui/save-panel.js';

// 记者的电脑桌面（现代扁平风）：四个应用——浏览器、聊天、笔记本、设置
export function startDesktop(app) {
  const apps = [
    { id: 'browser', icon: 'browser', run: openBrowser },
    { id: 'chat', icon: 'chat', run: openChat },
    { id: 'notebook', icon: 'notebook', run: openNotebook },
    { id: 'settings', icon: 'settings', run: () => openSavePanel(() => location.reload()) },
  ];
  const badge = () => h('i', { class: 'badge', hidden: !chatUnread() });
  const badges = [];
  const button = (a, cls) => {
    const b = h('button', { type: 'button', class: cls, onclick: () => a.run() }, flatIcon(a.icon, cls === 'ficon-btn' ? 48 : 22), h('span', {}, t(`shell.app.${a.id}`)));
    if (a.id === 'chat') { const d = badge(); badges.push(d); b.append(d); }
    return b;
  };
  const clock = h('span', { class: 'fclock' });
  const tick = () => { clock.textContent = nowString(); };
  tick(); setInterval(tick, 5000);
  const taskbar = h('div', { class: 'ftask' }, apps.map((a) => button(a, 'ftask-btn')), h('span', { class: 'sp' }), clock);
  app.append(h('div', { class: 'rdesk' }, h('div', { class: 'ficons' }, apps.map((a) => button(a, 'ficon-btn')))), taskbar);
  on('state', () => badges.forEach((b) => { b.hidden = !chatUnread(); }));

  watchPost();
}

const keyThread = () => shell.forum.threads.find((x) => x.key);

// 三个词都收录进笔记本之后，帖子自己消失
function watchPost() {
  const check = () => {
    const s = S.get();
    if (s.flags.includes('post-gone')) return;
    if (keyThread().requiredWords.every(hasWord)) setTimeout(() => applyEffects([{ flag: 'post-gone' }]), 1500);
  };
  let armed = false;
  on('state', () => { if (!armed && !S.get().flags.includes('post-gone') && keyThread().requiredWords.every(hasWord)) { armed = true; check(); } });
  check();
}
