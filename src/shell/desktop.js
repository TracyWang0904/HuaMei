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

// 记者的电脑桌面（macOS 风格）：顶部菜单栏 + 底部 Dock，四个应用——浏览器、聊天、笔记本、设置
export function startDesktop(app) {
  const apps = [
    { id: 'browser', icon: 'browser', run: openBrowser },
    { id: 'chat', icon: 'chat', run: openChat },
    { id: 'notebook', icon: 'notebook', run: openNotebook },
    { id: 'settings', icon: 'settings', run: () => openSavePanel(() => location.reload()) },
  ];
  const badges = [];
  const front = h('b', { class: 'mb-app' }, t('shell.mac.finder'));
  const dock = h('div', { class: 'dock' }, apps.map((a) => {
    const b = h('button', { type: 'button', class: 'dock-btn', 'data-app': a.id, 'aria-label': t(`shell.app.${a.id}`), onclick: () => { front.textContent = t(`shell.app.${a.id}`); a.run(); } },
      flatIcon(a.icon, 56), h('span', { class: 'dock-tip' }, t(`shell.app.${a.id}`)), h('i', { class: 'dock-dot' }));
    if (a.id === 'chat') { const d = h('i', { class: 'badge', hidden: !chatUnread() }); badges.push(d); b.append(d); }
    return b;
  }));
  // 开着窗口的应用，图标下面亮一个小点
  const refreshDots = () => dock.querySelectorAll('.dock-btn').forEach((b) => b.classList.toggle('running', !!document.querySelector(`.fwin[data-wid="${b.dataset.app}"]`)));
  new MutationObserver(refreshDots).observe(document.body, { childList: true });

  const clock = h('span', { class: 'fclock' });
  const tick = () => { clock.textContent = nowString(); };
  tick(); setInterval(tick, 5000);
  const menubar = h('div', { class: 'menubar' }, front, ['file', 'edit', 'view', 'window', 'help'].map((k) => h('span', { class: 'mb-item' }, t(`shell.mac.${k}`))), h('span', { class: 'sp' }), clock);
  app.append(h('div', { class: 'rdesk' }), menubar, dock);
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
