import { h } from './ui/dom.js';
import { t } from './core/i18n.js';
import * as S from './core/state.js';
import { gameMap } from './core/data.js';
import { mapView, sceneView, isUnlocked } from './scene/scene.js';
import { openNotebook } from './notebook/notebook-ui.js';
import { openSavePanel } from './ui/save-panel.js';
import { ensureContentAck } from './ui/content-warning.js';

const app = document.getElementById('app');
document.title = t('app.title');

const main = h('main', {});
let mode = 'scene'; // 'scene' | 'map'

function currentPlace() {
  const cur = S.get().currentPlace;
  if (cur && isUnlocked(cur)) return cur;
  return gameMap.floors.flatMap((f) => f.places).find((p) => p.initial).id;
}

function render() {
  if (mode === 'map') {
    main.replaceChildren(mapView((id) => { S.update((s) => { s.currentPlace = id; }); mode = 'scene'; render(); }));
  } else {
    main.replaceChildren(sceneView(currentPlace(), render));
  }
}

app.append(
  h('header', { class: 'topbar' },
    h('strong', {}, t('app.title')),
    h('span', { class: 'sp' }),
    h('button', { type: 'button', onclick: () => { mode = mode === 'map' ? 'scene' : 'map'; render(); } }, t('nav.map')),
    h('button', { type: 'button', onclick: openNotebook }, t('nav.notebook')),
    h('button', { type: 'button', onclick: () => openSavePanel(() => { mode = 'scene'; render(); }) }, t('nav.save'))),
  main);

ensureContentAck(() => {
  if (!S.get().startedAt) S.update((s) => { s.startedAt = Date.now(); });
  render();
});
