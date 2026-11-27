// 桌面上的文件夹与文件图标（自绘 SVG，装饰用，无外部素材）
const folder = '<defs><linearGradient id="fa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ec8ff"/><stop offset="1" stop-color="#2d8cf0"/></linearGradient><linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eb4ff"/><stop offset="1" stop-color="#1f74e0"/></linearGradient></defs><path d="M6 14a6 6 0 0 1 6-6h13l6 6h21a6 6 0 0 1 6 6v6H6z" fill="#2f86e8"/><rect x="6" y="18" width="52" height="34" rx="6" fill="url(#fb)"/><rect x="6.5" y="18.5" width="51" height="33" rx="5.5" fill="none" stroke="#fff" stroke-opacity=".45"/>';
const page = (badge, color) => `<path d="M14 4h26l12 12v42a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#fff" stroke="#d4d4d8"/><path d="M40 4v9a3 3 0 0 0 3 3h9z" fill="#e4e4e7"/><path d="M18 26h28M18 32h28M18 38h20" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round"/>${badge ? `<rect x="18" y="44" width="26" height="10" rx="3" fill="${color}"/><text x="31" y="52" font-size="7.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif">${badge}</text>` : ''}`;
const zip = '<path d="M14 4h26l12 12v42a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#f1f1f3" stroke="#d4d4d8"/><path d="M28 4h6v6h-6zM28 14h6v6h-6zM28 24h6v6h-6z" fill="#a1a1aa"/><rect x="26" y="34" width="10" height="12" rx="3" fill="#71717a"/>';
const KIND = { folder, doc: page('DOCX', '#2b6cd9'), pdf: page('PDF', '#e5484d'), zip };

export function deskIcon(kind, size = 56) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${KIND[kind] ?? KIND.doc}</svg>`;
}

// 小组件和菜单栏用的小图标
export const GLYPH = {
  cloud: '<path d="M8 22a6 6 0 0 1 1-12 9 9 0 0 1 17 2 5 5 0 0 1-1 10z" fill="#e8ecf6"/>',
  moon: '<path d="M22 9a8 8 0 1 0 5 13 7 7 0 0 1-5-13z" fill="#e8ecf6"/>',
  cloudmoon: '<path d="M21 5a6 6 0 1 0 5 9 5 5 0 0 1-5-9z" fill="#e8ecf6"/><path d="M8 26a5 5 0 0 1 1-10 7 7 0 0 1 13 1 4 4 0 0 1-1 9z" fill="#c9d0e6"/>',
  laptop: '<rect x="9" y="9" width="22" height="15" rx="2" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M5 28h30" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  buds: '<path d="M12 10a4 4 0 0 1 4 4v10a2 2 0 0 1-4 0v-3a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4zM28 10a4 4 0 0 0-4 4v10a2 2 0 0 0 4 0v-3a4 4 0 0 0 4-4v-3a4 4 0 0 0-4-4z" fill="#fff"/>',
  phone: '<rect x="12" y="6" width="16" height="28" rx="4" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M18 30h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
};
export const glyph = (name, size = 28, vb = 34) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="${size}" height="${size}">${GLYPH[name] ?? ''}</svg>`;

export const APPLE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M16.4 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3.1-1.7-1.3-.1-2.5.8-3.2.8s-1.7-.7-2.8-.7c-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1 1-.04 1.5-.7 2.7-.7s1.6.7 2.8.7c1.1 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.2-2.4 0 0-2.2-.8-2.2-3.4zM14.3 6.5c.6-.7 1-1.7.9-2.6-.8 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.3z"/></svg>';
export const STATUS = {
  wifi: '<svg viewBox="0 0 20 16" width="17" height="14"><path d="M1.5 5.5a12 12 0 0 1 17 0M4.5 8.8a7.6 7.6 0 0 1 11 0M7.4 12a3.4 3.4 0 0 1 5.2 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="14" r="1.3" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 10.5l3.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  control: '<svg viewBox="0 0 18 14" width="16" height="13"><rect x="1" y="1" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="3.5" r="1.7" fill="currentColor"/><rect x="1" y="8" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="10.5" r="1.7" fill="currentColor"/></svg>',
  battery: '<svg viewBox="0 0 26 13" width="24" height="12"><rect x="1" y="1" width="21" height="11" rx="3.4" fill="none" stroke="currentColor" stroke-opacity=".7" stroke-width="1.2"/><rect x="2.6" y="2.6" width="18" height="7.8" rx="2" fill="currentColor"/><path d="M23.5 4.5v4" stroke="currentColor" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/></svg>',
};
