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
import { widgets } from './widgets.js';
import { deskIcon, APPLE, STATUS } from './deskicons.js';

// 记者的电脑桌面（macOS 风格）：透明菜单栏、左侧小组件、右侧桌面文件、底部 Dock。
// 能用的只有四个应用——浏览器（Safari）、聊天（信息）、笔记本（备忘录）、设置；Dock 里其余图标和桌面文件只是装饰。
export function startDesktop(app) {
  const real = [
    { id: 'browser', icon: 'browser', run: openBrowser },
    { id: 'chat', icon: 'chat', run: openChat },
    { id: 'notebook', icon: 'notebook', run: openNotebook },
    { id: 'settings', icon: 'settings', run: () => openSavePanel(() => location.reload()) },
  ];
  const byId = Object.fromEntries(real.map((a) => [a.id, a]));
  // [应用 id 或装饰名, 图标文件]
  const order = [['finder', 'finder'], ['launchpad', 'launchpad'], ['browser'], ['chat'], ['mail', 'mail'], ['photos', 'photos'], ['facetime', 'facetime'], ['notebook'],
    ['calendar', 'calendar'], ['contacts', 'contacts'], ['reminders', 'reminders'], ['music', 'music'], ['numbers', 'numbers'], ['pages', 'pages'], ['keynote', 'keynote'],
    ['appstore', 'appstore'], ['settings'], ['|'], ['trash', 'trash']];
  const badges = [];
  const front = h('b', { class: 'mb-app' }, t('shell.mac.finder'));
  const name = (id) => t(byId[id] ? `shell.app.${id}` : `shell.dock.${id}`);
  const dock = h('div', { class: 'dock' }, order.map(([id, file]) => {
    if (id === '|') return h('i', { class: 'dock-sep' });
    const a = byId[id];
    const b = h('button', { type: 'button', class: 'dock-btn' + (a ? '' : ' fake'), 'data-app': id, 'aria-label': name(id),
      onclick: () => { if (!a) return; front.textContent = name(id); a.run(); } },
      a ? flatIcon(a.icon, 52) : flatIcon(file, 52), h('span', { class: 'dock-tip' }, name(id)), h('i', { class: 'dock-dot' }));
    if (id === 'chat') { const d = h('i', { class: 'badge', hidden: !chatUnread() }); badges.push(d); b.append(d); }
    return b;
  }));
  // 开着窗口的应用，图标下面亮一个小点
  const refreshDots = () => dock.querySelectorAll('.dock-btn').forEach((b) => b.classList.toggle('running', !!document.querySelector(`.fwin[data-wid="${b.dataset.app}"]`)));
  new MutationObserver(refreshDots).observe(document.body, { childList: true });

  const clock = h('span', { class: 'fclock' });
  const tick = () => { clock.textContent = nowString(); };
  tick(); setInterval(tick, 5000);
  const icon = (html) => { const e = document.createElement('span'); e.className = 'mb-ico'; e.innerHTML = html; return e; };
  const menubar = h('div', { class: 'menubar' }, icon(APPLE), front, ['file', 'edit', 'view', 'go', 'window', 'help'].map((k) => h('span', { class: 'mb-item' }, t(`shell.mac.${k}`))),
    h('span', { class: 'sp' }), icon(STATUS.battery), icon(STATUS.search), icon(STATUS.wifi), icon(STATUS.control), clock);

  const files = h('div', { class: 'dfiles' }, shell.desktop.items.map((it) => {
    const f = h('button', { type: 'button', class: 'dfile', onclick: (e) => { document.querySelectorAll('.dfile.sel').forEach((x) => x.classList.remove('sel')); f.classList.add('sel'); e.stopPropagation(); } });
    f.innerHTML = `${deskIcon(it.k, 54)}<span></span>`;
    f.lastChild.textContent = it.n;
    return f;
  }));
  const desk = h('div', { class: 'rdesk', onclick: () => document.querySelectorAll('.dfile.sel').forEach((x) => x.classList.remove('sel')) }, widgets(), files);
  app.append(desk, menubar, dock);
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
