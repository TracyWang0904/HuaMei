import { h, richText } from '../ui/dom.js';
import { icon, appIcon } from '../ui/icons.js';
import { makeDraggable } from '../ui/drag.js';
import { t } from '../core/i18n.js';
import { nowParts } from '../core/clock.js';
import * as S from '../core/state.js';
import { applyEffects } from '../core/effects.js';
import { computers, resolveApp } from '../core/data.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openNotebook } from '../notebook/notebook-ui.js';
import { markRead } from '../ui/doc-viewer.js';

// BN内网工作站：点开电脑后弹出一个小窗口，里面是登录框 → 桌面（图标、可拖动窗口、开始菜单）
export function openWorkstation(computerId) {
  const comp = computers[computerId];
  const existing = document.querySelector(`.ws[data-comp="${computerId}"]`);
  if (existing) { existing.remove(); }

  const body = h('div', { class: 'ws-body' });
  const close = () => { win.remove(); clearInterval(timer); };
  const bar = h('div', { class: 'titlebar' },
    h('span', { class: 'title' }, `${t('ws.title')} - ${comp.name}`),
    h('button', { type: 'button', class: 'tb-btn', 'aria-label': t('ws.exit'), onclick: close }, '×'));
  const win = h('div', { class: 'win98 ws', 'data-comp': computerId }, bar, body);
  makeDraggable(win, bar);
  document.body.append(win);

  const clock = h('span', { class: 'tray' });
  const tick = () => {
    if (!win.isConnected) { clearInterval(timer); return; }
    const { hour, minute } = nowParts();
    clock.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };
  const timer = setInterval(tick, 5000);
  tick();

  const needLogin = () => comp.login && !S.get().loggedIn.includes(comp.id);

  function render() {
    body.replaceChildren(needLogin() ? loginView() : desktopView());
  }

  function loginView() {
    const dlg = h('div', { class: 'win98 login-dlg' },
      h('div', { class: 'titlebar' }, h('span', { class: 'title' }, t('ws.title'))),
      h('div', { class: 'win-content' },
        comp.owner ? h('p', {}, t('ws.owner', { name: comp.owner })) : null,
        puzzlePanel(comp.login, { onSolved: () => { applyEffects([{ login: comp.id }]); setTimeout(render, 500); } })));
    return h('div', { class: 'desktop' }, h('div', { class: 'center-fill' }, dlg));
  }

  function desktopView() {
    const apps = comp.apps.map(resolveApp);
    const windows = h('div', { class: 'windows' });
    let z = 1, count = 0;

    const openApp = (app) => {
      if (app.special === 'notebook') return openNotebook();
      const existingWin = windows.querySelector(`[data-app="${app.id}"]`);
      if (existingWin) { existingWin.style.zIndex = ++z; return; }
      const w = appWindow(app, comp);
      w.dataset.app = app.id;
      w.style.left = `${24 + (count % 6) * 28}px`;
      w.style.top = `${16 + (count % 6) * 28}px`;
      w.style.zIndex = ++z;
      count++;
      w.addEventListener('pointerdown', () => { w.style.zIndex = ++z; });
      windows.append(w);
    };

    const icons = h('div', { class: 'icons' }, apps.map((a) =>
      h('button', { type: 'button', class: 'dicon', onclick: () => openApp(a) }, icon(appIcon(a), 32), h('span', {}, a.name))));

    const menu = h('div', { class: 'start-menu', hidden: true },
      h('div', { class: 'banner' }, h('span', {}, 'BN内网')),
      h('ul', {},
        apps.map((a) => h('li', {}, h('button', { type: 'button', onclick: () => { menu.hidden = true; openApp(a); } }, icon(appIcon(a), 24), a.name))),
        h('li', { class: 'sep' }),
        h('li', {}, h('button', { type: 'button', onclick: close }, icon('computer', 24), t('ws.exit')))));
    const startBtn = h('button', { type: 'button', class: 'btn start', onclick: () => { menu.hidden = !menu.hidden; } }, icon('flag', 16), t('ws.start'));
    const taskbar = h('div', { class: 'taskbar' }, startBtn, h('span', { class: 'sp' }), clock, menu);
    // 点开始菜单以外的地方收起菜单
    windows.addEventListener('pointerdown', () => { menu.hidden = true; });

    return h('div', { class: 'desktop-wrap' }, h('div', { class: 'desktop' }, icons, windows), taskbar);
  }

  render();
  return { close };
}

function appWindow(app, comp) {
  const entries = app.entries ?? [];
  const view = h('div', { class: 'entry' });
  let current;
  const show = (e, btn) => {
    markRead(`${comp.id}/${app.id}/${e.id}`);
    current?.classList.remove('sel'); current = btn; btn?.classList.add('sel');
    view.replaceChildren(
      e.title ? h('h3', {}, e.title) : null,
      richText(e.text, { source: e.source ?? app.name }));
  };
  const btns = entries.map((e) => h('button', { type: 'button', onclick: (ev) => show(e, ev.currentTarget) }, e.title ?? e.id));
  const list = entries.length > 1 ? h('div', { class: 'entry-list' }, btns) : null;
  if (entries[0]) show(entries[0], btns[0]);

  const bar = h('div', { class: 'titlebar' }, icon(appIcon(app), 16), h('span', { class: 'title' }, app.name),
    h('button', { type: 'button', class: 'tb-btn', onclick: () => win.remove() }, '×'));
  const win = h('div', { class: 'win98 appwin' }, bar, h('div', { class: 'appwin-body' }, list, view));
  makeDraggable(win, bar);
  return win;
}
