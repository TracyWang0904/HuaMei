import { h, richText } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { places, gameMap } from '../core/data.js';
import { openDoc } from '../ui/doc-viewer.js';
import { openModal, openMsgBox } from '../ui/modal.js';
import { on } from '../core/events.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openWorkstation } from '../workstation/workstation.js';
import { applyEffects, hasItem, meets } from '../core/effects.js';

export const isUnlocked = (placeId) => {
  const info = gameMap.floors.flatMap((f) => f.places).find((p) => p.id === placeId);
  return !!info && (info.initial || S.get().unlockedPlaces.includes(placeId));
};

// 门户的终端列表：按楼层列出，没有权限的显示“？？？”
export function portalList(onEnter) {
  return h('div', { class: 'map' },
    gameMap.floors.map((f) => h('section', {},
      h('h3', {}, f.name),
      h('div', { class: 'places' }, f.places.filter((p) => !p.hidden || isUnlocked(p.id)).map((p) => {
        const open = isUnlocked(p.id);
        return h('button', {
          type: 'button', disabled: !open, class: 'btn',
          onclick: () => onEnter(p.id),
        }, open ? p.name : t('portal.locked'));
      })))));
}

// 终端页：一个地点的“共享盘”（原来的现场资料）和工作站入口。内容变了（解开谜题、拿到凭证）就自己重画。
export function terminalBody(placeId) {
  const place = places[placeId];
  const root = h('div', { class: 'term-page' });
  let sig = '', attached = false;
  const render = () => {
    sig = signature(place);
    const list = place.hotspots.filter(visible);
    root.replaceChildren(h('div', { class: 'hotspots' }, list.map((hs) => hotspotButton(place, hs, render))));
  };
  render();
  const off = on('state', () => {
    if (root.isConnected) attached = true;
    else if (attached) return off();
    if (attached && signature(place) !== sig) render();
  });
  return root;
}

// 哪些热点现在可见、哪些谜题已解开、有哪些凭证：变了才重画
const signature = (place) => JSON.stringify([
  place.hotspots.filter(visible).map((hs) => [hs.id, isDone(hs)]),
  S.get().items.map((i) => i.id),
]);

// 热点何时显示：showWhen 满足、且 hideWhen 不满足
const visible = (hs) => meets(hs.showWhen) && !(hs.hideWhen && meets(hs.hideWhen));

const isDone = (hs) => hs.type === 'puzzle' && S.get().solved.includes(hs.puzzle.id);

// 点击热点。type：doc 资料｜computer 电脑｜puzzle 谜题（可带 revealDoc：解开后打开的资料）｜choice 选择｜goto 去别处
function activate(place, hs, rerender) {
  if (hs.requiresItem && !hasItem(hs.requiresItem.id)) {
    return openMsgBox({ title: hs.label, text: hs.requiresItem.message, kind: 'info' });
  }
  if (hs.type === 'doc') openDoc(hs, `${place.id}/${hs.id}`);
  else if (hs.type === 'computer') openWorkstation(hs.computer);
  else if (hs.type === 'goto') applyEffects(hs.effects);
  else if (hs.type === 'choice') openChoice(hs, rerender);
  else if (hs.type === 'puzzle') {
    if (S.get().solved.includes(hs.puzzle.id) && hs.revealDoc) return openDoc(hs.revealDoc, `${place.id}/${hs.id}`);
    const m = openModal({
      title: hs.label, className: hs.terminal ? 'terminal' : '',
      body: puzzlePanel(hs.puzzle, {
        terminal: !!hs.terminal,
        onSolved: () => setTimeout(() => { m.close(); rerender(); if (hs.revealDoc) openDoc(hs.revealDoc, `${place.id}/${hs.id}`); }, 600),
      }),
    });
  }
}

// 选择：一句话 + 若干选项，每个选项有一组效果
function openChoice(hs, rerender) {
  const m = openModal({
    title: hs.label, className: 'msgbox',
    body: [h('div', { class: 'msg-row' }, h('p', {}, hs.text ?? '')),
      h('div', { class: 'btn-row center' }, hs.options.filter((o) => meets(o.showWhen)).map((o) => h('button', {
        type: 'button', class: 'btn',
        onclick: () => { m.close(); applyEffects(o.effects); rerender(); },
      }, o.label)))],
  });
}

function hotspotButton(place, hs, rerender) {
  const done = isDone(hs);
  return h('button', { type: 'button', class: 'btn hotspot' + (done ? ' done' : ''), onclick: () => activate(place, hs, rerender) },
    done && hs.solvedLabel ? hs.solvedLabel : hs.label);
}
