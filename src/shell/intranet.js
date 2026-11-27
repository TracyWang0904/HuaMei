import { h } from '../ui/dom.js';
import { openModal } from '../ui/modal.js';
import { openWindow } from '../ui/window.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { nowString } from '../core/clock.js';
import { places, shell } from '../core/data.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { portalList, terminalBody } from '../intranet/terminal.js';
import { openNotebook } from '../notebook/notebook-ui.js';

// 在浏览器里输入内网链接后，整块屏幕换成 BN内网：先是黑底绿字的接入页，登录后是千禧年桌面 + 门户。
// 记者的桌面、浏览器、聊天都被盖住；底部只留“笔记本”和“断开连接”。
let layer = null;
const loggedIn = () => S.get().solved.includes(shell.intranet.login.id);

export function enterIntranet() {
  if (layer?.isConnected) return;
  document.body.classList.add('in-intranet');
  layer = h('div', { class: 'intranet' });
  document.body.append(layer);
  render();
}

export function leaveIntranet() {
  layer?.remove(); layer = null;
  document.body.classList.remove('in-intranet');
}

function render() {
  if (!layer) return;
  const clock = h('span', { class: 'tray' }, nowString());
  const bar = h('div', { class: 'ibar' },
    h('button', { type: 'button', class: 'btn', onclick: openNotebook }, t('shell.intranet.nb')),
    h('span', { class: 'sp' }),
    h('button', { type: 'button', class: 'btn', onclick: leaveIntranet }, t('shell.intranet.leave')),
    clock);
  layer.className = 'intranet ' + (loggedIn() ? 'desk' : 'login');
  layer.replaceChildren(loggedIn() ? portal() : loginPage(), bar);
}

function loginPage() {
  return h('div', { class: 'ilogin' },
    h('p', { class: 'ititle' }, t('shell.intranet.title')),
    puzzlePanel(shell.intranet.login, { terminal: true, onSolved: () => setTimeout(render, 700) }));
}

// BN内网门户：终端列表，有权限的才能点
function portal() {
  const body = h('div', { class: 'portal' });
  const draw = () => body.replaceChildren(portalList(connect));
  const off = on('state', () => { if (body.isConnected) draw(); else off(); });
  draw();
  return h('div', { class: 'win98 iportal' },
    h('div', { class: 'titlebar' }, h('span', { class: 'title' }, t('shell.portal.title'))),
    h('div', { class: 'xbody' }, body));
}

// 接入终端：弹一个小窗口“正在接入……”，然后切到该终端
export function connect(placeId) {
  if (!layer) enterIntranet();
  const name = places[placeId].name;
  const m = openModal({ title: t('shell.portal.title'), className: 'msgbox', closable: false,
    body: h('div', { class: 'msg-row' }, h('p', {}, t('shell.connecting', { name }))) });
  setTimeout(() => { m.close(); openTerminal(placeId); }, 700);
}

export function openTerminal(placeId) {
  openWindow({ id: `term-${placeId}`, title: t('shell.term.title', { name: places[placeId].name }), body: terminalBody(placeId), width: 460 });
}
