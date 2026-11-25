import { h, richText } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import * as S from '../core/state.js';
import { places, gameMap } from '../core/data.js';
import { openDoc } from '../ui/doc-viewer.js';
import { openModal } from '../ui/modal.js';
import { puzzlePanel } from '../puzzle/puzzle-panel.js';
import { openWorkstation } from '../workstation/workstation.js';

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

// 场景：一段描述 + 可点击的资料、物品、电脑、门禁
export function sceneView(placeId, rerender) {
  const place = places[placeId];
  return h('div', { class: 'scene' },
    h('h2', {}, place.name),
    h('div', { class: 'scene-img' }, t('scene.placeholder', { name: place.name })),
    h('div', { class: 'paper' }, richText(place.intro, { source: place.name })),
    h('div', { class: 'hotspots' }, place.hotspots.map((hs) => hotspot(place, hs, rerender))));
}

function hotspot(place, hs, rerender) {
  const solved = hs.type === 'puzzle' && S.get().solved.includes(hs.puzzle.id);
  const label = solved && hs.solvedLabel ? hs.solvedLabel : hs.label;
  const click = () => {
    if (hs.type === 'doc') openDoc(hs, `${place.id}/${hs.id}`);
    else if (hs.type === 'computer') openWorkstation(hs.computer);
    else if (hs.type === 'puzzle') {
      const m = openModal({
        title: hs.label,
        body: puzzlePanel(hs.puzzle, { onSolved: () => setTimeout(() => { m.close(); rerender(); }, 600) }),
      });
    }
  };
  return h('button', { type: 'button', class: 'hotspot' + (solved ? ' done' : ''), onclick: click }, label);
}
