import { h, richText } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { places, gameMap } from '../core/data.js';
import { openDoc } from '../ui/doc-viewer.js';
import { openModal, openMsgBox } from '../ui/modal.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openWorkstation } from '../workstation/workstation.js';
import { applyEffects, hasItem, meets } from '../core/effects.js';

export const isUnlocked = (placeId) => {
  const info = gameMap.floors.flatMap((f) => f.places).find((p) => p.id === placeId);
  return !!info && (info.initial || S.get().unlockedPlaces.includes(placeId));
};

// 地图：按楼层列出地点，未解锁的显示“？？？”
export function mapView(onEnter) {
  const cur = S.get().currentPlace;
  return h('div', { class: 'map' },
    gameMap.floors.map((f) => h('section', {},
      h('h3', {}, f.name),
      h('div', { class: 'places' }, f.places.filter((p) => !p.hidden || isUnlocked(p.id)).map((p) => {
        const open = isUnlocked(p.id);
        return h('button', {
          type: 'button', disabled: !open, class: 'btn' + (p.id === cur ? ' default' : ''),
          onclick: () => onEnter(p.id),
        }, open ? p.name : t('map.locked'));
      })))));
}

// 场景（过渡版）：只列出热点按钮；新版会换成“终端页”
export function sceneView(placeId, rerender) {
  return placeholder(places[placeId], rerender);
}

function placeholder(place, rerender) {
  return h('div', { class: 'scene-art placeholder' },
    h('p', {}, t('scene.placeholder', { name: place.name })),
    h('div', { class: 'hotspots' }, place.hotspots.filter(visible).map((hs) => hotspotButton(place, hs, rerender))));
}

// 场景要不要重画的“指纹”：哪些热点现在可见、哪些谜题已解开、状态层是否显示。变了才重画。
export function sceneSignature(placeId) {
  const place = places[placeId];
  return JSON.stringify([
    place.hotspots.filter(visible).map((hs) => [hs.id, isDone(hs)]),
    S.get().items.map((i) => i.id),
  ]);
}

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
