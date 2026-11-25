import { h, richText } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { places, gameMap } from '../core/data.js';
import { openDoc } from '../ui/doc-viewer.js';
import { openModal } from '../ui/modal.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openWorkstation } from '../workstation/workstation.js';
import { startClock } from './clock-display.js';

// 场景图：assets/img/scenes/<scene>.svg，构建时作为文本打包
const sceneArt = import.meta.glob('/assets/img/scenes/*.svg', { eager: true, query: '?raw', import: 'default' });

export const isUnlocked = (placeId) => {
  const info = gameMap.floors.flatMap((f) => f.places).find((p) => p.id === placeId);
  return !!info && (info.initial || S.get().unlockedPlaces.includes(placeId));
};

// 地图：按楼层列出地点，未解锁的显示“？？？”
export function mapView(onEnter) {
  const cur = S.get().currentPlace;
  return h('div', { class: 'map' }, h('h2', {}, t('map.title')),
    gameMap.floors.map((f) => h('section', {},
      h('h3', {}, f.name),
      h('div', { class: 'places' }, f.places.map((p) => {
        const open = isUnlocked(p.id);
        return h('button', {
          type: 'button', disabled: !open, class: p.id === cur ? 'here' : '',
          onclick: () => onEnter(p.id),
        }, open ? p.name : t('map.locked'));
      })))));
}

// 场景：一张场景图（SVG 里标了 id 的物件可点）+ 描述 + 物品列表（备用入口）
export function sceneView(placeId, rerender) {
  const place = places[placeId];
  const art = buildArt(place, rerender);
  const buttons = place.hotspots.map((hs) => hotspotButton(place, hs, rerender));
  return h('div', { class: 'scene' },
    h('h2', {}, place.name),
    art ?? h('div', { class: 'scene-img' }, t('scene.placeholder', { name: place.name })),
    h('div', { class: 'paper' }, richText(place.intro, { source: place.name })),
    art
      ? h('details', { class: 'items' }, h('summary', {}, t('scene.items')), h('div', { class: 'hotspots' }, buttons))
      : h('div', { class: 'hotspots' }, buttons));
}

function buildArt(place, rerender) {
  const raw = sceneArt[`/assets/img/scenes/${place.scene}.svg`];
  if (!place.scene || !raw) return null;
  const wrap = h('div', { class: 'scene-art' });
  // 先去注释（注释里提到了 <script>），再去掉 SVG 自带的预览脚本：电子钟由游戏时钟驱动
  wrap.innerHTML = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  const svg = wrap.querySelector('svg');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  for (const hs of place.hotspots) {
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
  startClock(svg);
  return wrap;
}

const isDone = (hs) => hs.type === 'puzzle' && S.get().solved.includes(hs.puzzle.id);

function activate(place, hs, rerender) {
  if (hs.type === 'doc') openDoc(hs, `${place.id}/${hs.id}`);
  else if (hs.type === 'computer') openWorkstation(hs.computer);
  else if (hs.type === 'puzzle') {
    const m = openModal({
      title: hs.label,
      body: puzzlePanel(hs.puzzle, { onSolved: () => setTimeout(() => { m.close(); rerender(); }, 600) }),
    });
  }
}

function hotspotButton(place, hs, rerender) {
  const done = isDone(hs);
  return h('button', { type: 'button', class: 'hotspot' + (done ? ' done' : ''), onclick: () => activate(place, hs, rerender) },
    done && hs.solvedLabel ? hs.solvedLabel : hs.label);
}
