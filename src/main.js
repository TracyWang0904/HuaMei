import { h } from './ui/dom.js';
import { t } from './core/i18n.js';
import * as S from './core/state.js';
import { gameMap } from './core/data.js';
import { mapView, sceneView, sceneSignature, isUnlocked } from './scene/scene.js';
import { openNotebook } from './notebook/notebook-ui.js';
import { openSavePanel } from './ui/save-panel.js';
import { openModal } from './ui/modal.js';
import { ensureContentAck } from './ui/content-warning.js';
import { on } from './core/events.js';
import { showEnding } from './ending/ending.js';

// 沉浸式：场景图铺满整个窗口，笔记本、地图、设置只是角落里的小按钮，没有任何文字提示盖在画面上
const app = document.getElementById('app');
document.title = t('app.title');

const stage = h('main', { class: 'stage' });

function currentPlace() {
  const cur = S.get().currentPlace;
  if (cur && isUnlocked(cur)) return cur;
  return gameMap.floors.flatMap((f) => f.places).find((p) => p.initial).id;
}

// 换场景：淡出再淡入；同一场景内刷新（比如开了门）不做动画
let shownSig = null;
function show({ fade = false } = {}) {
  const build = () => {
    shownSig = sceneSignature(currentPlace());
    stage.replaceChildren(sceneView(currentPlace(), () => show()));
    stage.classList.remove('out');
  };
  if (!fade) return build();
  stage.classList.add('out');
  setTimeout(build, 220);
}

function go(id) {
  S.update((s) => { s.currentPlace = id; });
  show({ fade: true });
}

function openMap() {
  const m = openModal({ title: t('map.title'), body: mapView((id) => { m.close(); go(id); }), className: 'map-win' });
}

app.append(
  stage,
  h('div', { class: 'hud' },
    h('button', { type: 'button', class: 'btn', onclick: openMap }, t('nav.map')),
    h('button', { type: 'button', class: 'btn', onclick: openNotebook }, t('nav.notebook')),
    h('button', { type: 'button', class: 'btn', 'aria-label': t('nav.settings'), onclick: () => openSavePanel(() => show({ fade: true })) }, t('nav.settings'))));

// 游戏状态变了、场景里该出现或消失的东西变了（比如解开谜题后出现了新的电梯），就重画场景
on('state', () => { if (shownSig && sceneSignature(currentPlace()) !== shownSig) show(); });

// 效果里的 goto / ending
on('goto', (id) => go(id));
on('ending', (key) => showEnding(key, () => show({ fade: true })));

ensureContentAck(() => {
  if (!S.get().startedAt) S.update((s) => { s.startedAt = Date.now(); });
  show();
});
