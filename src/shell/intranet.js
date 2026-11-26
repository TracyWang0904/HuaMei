import { h } from '../ui/dom.js';
import { openModal } from '../ui/modal.js';
import { openWindow } from '../ui/window.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { on } from '../core/events.js';
import { places, shell } from '../core/data.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { portalList, terminalBody } from '../intranet/terminal.js';

// 内网登录：用论坛帖子里的账号和密码。登录过一次，之后点“链接”直接进门户。
export function openIntranetLogin() {
  if (S.get().solved.includes(shell.intranet.login.id)) return openPortal();
  const m = openModal({
    title: t('shell.intranet.title'), className: 'terminal',
    body: puzzlePanel(shell.intranet.login, { terminal: true, onSolved: () => setTimeout(() => { m.close(); openPortal(); }, 700) }),
  });
}

// BN内网门户：终端列表，有权限的才能点
export function openPortal() {
  const body = h('div', { class: 'portal' });
  const render = () => body.replaceChildren(portalList(connect));
  const w = openWindow({ id: 'portal', title: t('shell.portal.title'), body, width: 420, onClose: () => off() });
  const off = on('state', () => { if (w.el.isConnected) render(); });
  render();
}

// 接入终端：弹一个小窗口“正在接入……”，然后切到该终端
export function connect(placeId) {
  const name = places[placeId].name;
  const m = openModal({ title: t('shell.portal.title'), className: 'msgbox', closable: false,
    body: h('div', { class: 'msg-row' }, h('p', {}, t('shell.connecting', { name }))) });
  setTimeout(() => { m.close(); openTerminal(placeId); }, 700);
}

export function openTerminal(placeId) {
  openWindow({ id: `term-${placeId}`, title: t('shell.term.title', { name: places[placeId].name }), body: terminalBody(placeId), width: 460 });
}
