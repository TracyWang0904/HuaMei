import { h, richText } from './ui/dom.js';
import { t } from './core/i18n.js';
import * as S from './core/state.js';
import { gameMap, places } from './core/data.js';
import { mapView, sceneView, isUnlocked } from './scene/scene.js';
import { openNotebook } from './notebook/notebook-ui.js';
import { openSavePanel } from './ui/save-panel.js';
import { openModal } from './ui/modal.js';
import { ensureContentAck } from './ui/content-warning.js';

// 沉浸式：场景图铺满整个窗口，笔记本、地图、设置只是角落里的小按钮
const app = document.getElementById('app');
document.title = t('app.title');

const stage = h('main', { class: 'stage' });
const caption = h('div', { class: 'caption', hidden: true });
let captionTimer;
const placeName = h('button', { type: 'button', class: 'hud-btn hud-name', onclick: () => { caption.hidden = !caption.hidden; } });

function currentPlace() {
  const cur = S.get().currentPlace;
  if (cur && isUnlocked(cur)) return cur;
  return gameMap.floors.flatMap((f) => f.places).find((p) => p.initial).id;
}

// 换场景：淡出再淡入；同一场景内刷新（比如开了门）不做动画
function show({ fade = false } = {}) {
  const build = () => {
    const id = currentPlace();
    const place = places[id];
    stage.replaceChildren(sceneView(id, () => show()));
    placeName.textContent = place.name;
    caption.replaceChildren(
      h('button', { type: 'button', class: 'caption-close', onclick: () => { caption.hidden = true; } }, '×'),
      richText(place.intro, { source: place.name }));
    caption.hidden = false;
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => { caption.hidden = true; }, 8000); // 描述放在顶部，8 秒后自动收起，不挡场景
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
  const m = openModal({ title: t('map.title'), body: mapView((id) => { m.close(); go(id); }) });
}

app.append(
  stage,
  h('div', { class: 'hud hud-left' }, placeName),
  h('div', { class: 'hud hud-right' },
    h('button', { type: 'button', class: 'hud-btn', onclick: openMap }, t('nav.map')),
    h('button', { type: 'button', class: 'hud-btn', onclick: openNotebook }, t('nav.notebook')),
    h('button', { type: 'button', class: 'hud-btn', 'aria-label': t('nav.settings'), onclick: () => openSavePanel(() => show({ fade: true })) }, '⚙')),
  caption);

ensureContentAck(() => {
  if (!S.get().startedAt) S.update((s) => { s.startedAt = Date.now(); });
  show();
});
