import { h, richText } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { applyEffects } from '../core/effects.js';
import { computers, resolveApp } from '../core/data.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openNotebook } from '../notebook/notebook-ui.js';
import { markRead } from '../ui/doc-viewer.js';

// BN内网工作站：锁屏登录 → 桌面（图标、可拖动窗口、开始菜单）
export function openWorkstation(computerId) {
  const comp = computers[computerId];
  const root = h('div', { class: 'ws' });
  document.body.append(root);
  const close = () => root.remove();

  const header = h('header', { class: 'ws-bar' },
    h('strong', {}, `${t('ws.title')} · ${comp.name}`),
    h('span', { class: 'sp' }),
    h('button', { type: 'button', onclick: openNotebook }, t('nav.notebook')),
    h('button', { type: 'button', onclick: close }, t('ws.exit')));

  const needLogin = () => comp.login && !S.get().loggedIn.includes(comp.id);

  function render() {
    root.replaceChildren(header, needLogin() ? loginView() : desktopView());
  }

  function loginView() {
    const puzzle = comp.login;
    return h('div', { class: 'login' },
      h('h2', {}, t('ws.title')),
      comp.owner ? h('p', {}, t('ws.owner', { name: comp.owner })) : null,
      puzzlePanel(puzzle, { onSolved: () => { applyEffects([{ login: comp.id }]); setTimeout(render, 400); } }));
  }

  function desktopView() {
    const apps = comp.apps.map(resolveApp);
    const windows = h('div', { class: 'windows' });
    let z = 1, count = 0;

    const openApp = (app) => {
      if (app.special === 'notebook') return openNotebook();
      const existing = windows.querySelector(`[data-app="${app.id}"]`);
      if (existing) { existing.style.zIndex = ++z; return; }
      const win = appWindow(app, comp);
      win.dataset.app = app.id;
      win.style.left = `${24 + (count % 6) * 28}px`;
      win.style.top = `${16 + (count % 6) * 28}px`;
      win.style.zIndex = ++z;
      count++;
      win.addEventListener('pointerdown', () => { win.style.zIndex = ++z; });
      windows.append(win);
    };

    const icons = h('div', { class: 'icons' }, apps.map((a) =>
      h('button', { type: 'button', class: 'icon', onclick: () => openApp(a) }, h('span', { class: 'glyph' }, '▣'), a.name)));

    const menu = h('ul', { class: 'start-menu', hidden: true },
      apps.map((a) => h('li', {}, h('button', { type: 'button', onclick: () => { menu.hidden = true; openApp(a); } }, a.name))),
      h('li', {}, h('button', { type: 'button', onclick: close }, t('ws.exit'))));
    const taskbar = h('footer', { class: 'taskbar' },
      h('button', { type: 'button', onclick: () => { menu.hidden = !menu.hidden; } }, t('ws.start')), menu);

    return h('div', { class: 'desktop' }, icons, windows, taskbar);
  }

  render();
  return { close };
}

function appWindow(app, comp) {
  const entries = app.entries ?? [];
  const view = h('div', { class: 'entry' });
  const show = (e) => {
    markRead(`${comp.id}/${app.id}/${e.id}`);
    view.replaceChildren(
      e.title ? h('h3', {}, e.title) : null,
      h('div', { class: 'paper' }, richText(e.text, { source: e.source ?? app.name })));
  };
  const list = entries.length > 1
    ? h('ul', { class: 'entry-list' }, entries.map((e) => h('li', {}, h('button', { type: 'button', onclick: () => show(e) }, e.title ?? e.id))))
    : null;
  if (entries[0]) show(entries[0]);

  const bar = h('div', { class: 'win-bar' }, h('span', {}, app.name), h('button', { type: 'button', onclick: () => win.remove() }, '×'));
  const win = h('div', { class: 'win' }, bar, h('div', { class: 'win-body' }, list, view));

  // 拖动窗口（手机上 CSS 把窗口改成全屏，拖动无效）
  bar.addEventListener('pointerdown', (ev) => {
    if (ev.target.tagName === 'BUTTON') return;
    const dx = ev.clientX - win.offsetLeft, dy = ev.clientY - win.offsetTop;
    const move = (m) => { win.style.left = `${m.clientX - dx}px`; win.style.top = `${Math.max(0, m.clientY - dy)}px`; };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
  return win;
}
