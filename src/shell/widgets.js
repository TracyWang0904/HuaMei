import { h } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import { shell } from '../core/data.js';
import { nowParts } from '../core/clock.js';
import { glyph } from './deskicons.js';

const raw = (s) => { const e = document.createElement('span'); e.innerHTML = s; return e.firstElementChild; };

// 记者桌面左侧的三个小组件：天气、电量、日程（内容在 data/shell.json 的 desktop 里）
export function widgets() {
  const d = shell.desktop;
  const w = d.weather;
  const weather = h('section', { class: 'widget w-weather' },
    h('div', { class: 'w-row' }, h('div', {}, h('b', { class: 'w-place' }, w.place), h('div', { class: 'w-temp' }, `${w.temp}°`)),
      h('div', { class: 'w-cond' }, h('div', {}, w.cond), h('div', {}, `${t('shell.w.high')}${w.hi}° ${t('shell.w.low')}${w.lo}°`))),
    h('div', { class: 'w-hours' }, w.hours.map((x) => h('div', { class: 'w-hour' }, h('span', {}, x.h), raw(glyph(x.i, 26)), h('b', {}, `${x.t}°`)))));

  const battery = h('section', { class: 'widget w-battery' }, d.battery.map((b) => {
    const r = 26, c = 2 * Math.PI * r;
    const ring = raw(`<svg viewBox="0 0 64 64" width="66" height="66"><circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5"/>${b.pct ? `<circle cx="32" cy="32" r="${r}" fill="none" stroke="#34d399" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(c * b.pct / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 32 32)"/>` : ''}</svg>`);
    return h('div', { class: 'w-bat' }, h('div', { class: 'w-ring' }, ring, b.icon === 'none' ? '' : h('span', { class: 'w-bicon' }, raw(glyph(b.icon, 26)))), h('b', {}, b.pct ? `${b.pct}%` : ''));
  }));

  const { day } = nowParts();
  const cal = h('section', { class: 'widget w-cal' },
    h('div', { class: 'w-day' }, h('div', {}, h('b', {}, String(day)), h('span', {}, '十月')), h('div', { class: 'w-free' }, t('shell.w.free'))),
    h('div', { class: 'w-events' }, h('div', { class: 'w-date' }, `JT188.10.${day + 1}`), d.calendar.upNext.map((e) => h('div', { class: 'w-ev', style: `--c:${e.c}` }, h('b', {}, e.t), h('span', {}, e.time))), ));
  return h('div', { class: 'widgets' }, weather, battery, cal);
}
