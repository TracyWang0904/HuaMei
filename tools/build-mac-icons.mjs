// 把 Apple Icon Composer 的 .icon 文件夹（icon.json + 分层 SVG）合成一张完整的 SVG 图标。
// 用法：node tools/build-mac-icons.mjs <图标仓库里 Application Icons 目录> <输出目录>
// 只做近似：背景渐变 + 圆角方块 + 图层位置/缩放/不透明度/混合模式/阴影，不含玻璃折射和高光。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';

const [src, out] = process.argv.slice(2);
const ICONS = {
  'CoreServices/Finder': 'finder', Apps: 'launchpad', Safari: 'safari', Messages: 'messages', Mail: 'mail', Photos: 'photos', FaceTime: 'facetime',
  Notes: 'notes', Calendar: 'calendar', Contacts: 'contacts', Reminders: 'reminders', 'System Settings': 'settings', 'App Store': 'appstore', Music: 'music',
  'Numbers Creator Studio': 'numbers', 'Pages Creator Studio': 'pages', 'Keynote Creator Studio': 'keynote',
};

const color = (c) => {
  const [kind, v] = c.split(':'); const n = v.split(',').map(Number);
  const hex = (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0');
  return '#' + (kind === 'gray' ? hex(n[0]).repeat(3) : hex(n[0]) + hex(n[1]) + hex(n[2]));
};

function layerSvg(text, prefix) {
  const inner = text.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const ids = [...inner.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  let s = inner;
  for (const id of ids) s = s.split(`id="${id}"`).join(`id="${prefix}${id}"`).split(`#${id})`).join(`#${prefix}${id})`).split(`"#${id}"`).join(`"#${prefix}${id}"`);
  return s;
}

mkdirSync(out, { recursive: true });
for (const [name, slug] of Object.entries(ICONS)) {
  const dir = `${src}/${name}.icon`; void basename;
  const j = JSON.parse(readFileSync(`${dir}/icon.json`, 'utf8'));
  const [c1, c2] = (j.fill['linear-gradient'] ?? ['gray:1,1', 'gray:0.92,1']).map(color);
  const val = (o, k) => o[k] ?? o[`${k}-specializations`]?.find((x) => !x.appearance)?.value;
  let body = '', gi = 0;
  const defs = [`<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`,
    '<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".42" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>',
    '<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient>',
    '<linearGradient id="rim2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>',
    '<clipPath id="sq"><rect width="1024" height="1024" rx="228"/></clipPath>',
    '<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity="0.28"/></filter>'];
  for (const g of [...j.groups].reverse()) {
    if (g.hidden) continue;
    let layers = '';
    for (const l of [...g.layers].reverse()) {
      if (l.hidden) continue;
      const file = l['image-name'];
      const raw = file.endsWith('.png') ? null : readFileSync(`${dir}/Assets/${file}`, 'utf8');
      const svg = raw ?? `<svg viewBox="0 0 1024 1024"><image href="data:image/png;base64,${readFileSync(`${dir}/Assets/${file}`).toString('base64')}" width="1024" height="1024"/></svg>`;
      const pos = l.position ?? {};
      const s = pos.scale ?? 1, [tx, ty] = pos['translation-in-points'] ?? [0, 0];
      const op = val(l, 'opacity') ?? 1;
      const bm = l['blend-mode'] && l['blend-mode'] !== 'normal' ? `;mix-blend-mode:${l['blend-mode']}` : '';
      layers += `<g transform="translate(${tx} ${ty}) translate(512 512) scale(${s}) translate(-512 -512)" opacity="${op}" style="isolation:auto${bm}">${layerSvg(svg, `g${gi}-`)}</g>`;
      gi++;
    }
    const shadow = g.shadow?.kind && g.shadow.kind !== 'none' ? ' filter="url(#sh)"' : '';
    const gop = val(g, 'opacity') ?? 1;
    const gbm = g['blend-mode'] && g['blend-mode'] !== 'normal' ? ` style="mix-blend-mode:${g['blend-mode']}"` : '';
    body += `<g${shadow} opacity="${gop}"${gbm}>${layers}</g>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs>${defs.join('')}</defs><g clip-path="url(#sq)"><rect width="1024" height="1024" fill="url(#bg)"/>${body}<rect width="1024" height="1024" fill="url(#sheen)"/></g><rect x="3" y="3" width="1018" height="1018" rx="226" fill="none" stroke="url(#rim)" stroke-width="6"/><rect x="9" y="9" width="1006" height="1006" rx="220" fill="none" stroke="url(#rim2)" stroke-width="8" clip-path="url(#sq)"/></svg>\n`;
  writeFileSync(`${out}/${slug}.svg`, svg);
  console.log(slug, svg.length);
}
