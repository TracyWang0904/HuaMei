import { h, richText } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { places, gameMap } from '../core/data.js';
import { openDoc } from '../ui/doc-viewer.js';
import { openModal, openMsgBox } from '../ui/modal.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openWorkstation } from '../workstation/workstation.js';
import { startClock } from './clock-display.js';
import { applyEffects, hasItem, meets } from '../core/effects.js';
import { startFlicker } from './flicker.js';

// 场景图：assets/img/scenes/<scene>.svg，构建时作为文本打包
// 不急切加载：有的场景图很大（内嵌底图），进入该场景时才加载
const sceneArt = import.meta.glob('/assets/img/scenes/*.svg', { query: '?raw', import: 'default' });

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

// 场景：满屏的场景图（SVG 里标了 id 的物件可点）。没有图的地点先用占位 + 按钮。
export function sceneView(placeId, rerender) {
  const place = places[placeId];
  const load = place.scene && sceneArt[`/assets/img/scenes/${place.scene}.svg`];
  if (!load) return placeholder(place, rerender);
  const wrap = h('div', { class: 'scene-art' });
  load().then((raw) => fillArt(wrap, raw, place, rerender));
  return wrap;
}

function placeholder(place, rerender) {
  return h('div', { class: 'scene-art placeholder' },
    h('p', {}, t('scene.placeholder', { name: place.name })),
    h('div', { class: 'hotspots' }, place.hotspots.filter(visible).map((hs) => hotspotButton(place, hs, rerender))));
}

function fillArt(wrap, raw, place, rerender) {
  // 先去注释（注释里提到了 <script>），再去掉 SVG 自带的预览脚本：电子钟由游戏时钟驱动
  wrap.innerHTML = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  const svg = wrap.querySelector('svg');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  for (const hs of place.hotspots) {
    if (!visible(hs)) continue;
    for (const id of [].concat(hs.svgId ?? [])) {
      const el = svg.querySelector(`#${id}`);
      if (!el) continue;
      el.classList.add('hs');
      if (isDone(hs)) el.classList.add('done');
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', hs.label);
      el.addEventListener('click', () => activate(place, hs, rerender));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(place, hs, rerender); } });
    }
  }
  // 状态层：某个谜题解开后才显示（比如开门）
  for (const st of place.states ?? []) {
    const el = svg.querySelector(`#${st.svgId}`);
    if (el && S.get().solved.includes(st.showWhenSolved)) el.style.display = '';
  }
  startClock(svg);
  if (place.flicker) startFlicker(svg);
}

// 场景要不要重画的“指纹”：哪些热点现在可见、哪些谜题已解开、状态层是否显示。变了才重画。
export function sceneSignature(placeId) {
  const place = places[placeId];
  return JSON.stringify([
    place.hotspots.filter(visible).map((hs) => [hs.id, isDone(hs)]),
    (place.states ?? []).map((st) => S.get().solved.includes(st.showWhenSolved)),
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
      title: hs.label,
      body: puzzlePanel(hs.puzzle, {
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
