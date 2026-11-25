// 千禧年风格的小图标（16×16 格子，放大到 32px，边缘不做抗锯齿）
const S = {
  doc: '<path d="M3.5 1.5h7l3 3v10h-10z" fill="#fff" stroke="#000"/><path d="M10.5 1.5v3h3" fill="#c0c0c0" stroke="#000"/><path d="M5 7.5h6M5 9.5h6M5 11.5h4" stroke="#000080"/>',
  folder: '<path d="M1.5 4.5h5l1 1.5h7v8h-13z" fill="#ffff80" stroke="#000"/><path d="M2 7.5h12" stroke="#fff"/>',
  mail: '<rect x="1.5" y="3.5" width="13" height="9" fill="#fff" stroke="#000"/><path d="M1.5 3.5l6.5 5 6.5-5" fill="none" stroke="#000"/>',
  computer: '<rect x="2.5" y="1.5" width="11" height="8" fill="#c0c0c0" stroke="#000"/><rect x="4" y="3" width="8" height="5" fill="#000080"/><rect x="5.5" y="11.5" width="5" height="2" fill="#c0c0c0" stroke="#000"/><path d="M3 14.5h10" stroke="#000"/>',
  key: '<circle cx="5" cy="6" r="3" fill="#ffd700" stroke="#000"/><path d="M7 8l6 6M10 11l2-2M12 13l1.5-1.5" stroke="#806000"/>',
  trash: '<path d="M4.5 4.5h7l-.8 10h-5.4z" fill="#c0c0c0" stroke="#000"/><path d="M3 3.5h10M6.5 3.5v-1.5h3v1.5" stroke="#000" fill="none"/><path d="M7 6.5v6M9 6.5v6" stroke="#008000"/>',
  globe: '<circle cx="8" cy="8" r="6.5" fill="#0000ff" stroke="#000"/><path d="M4 5c2-2 4 0 5-1 2 0 3 2 2 4-1 2-3 1-4 3-2 0-3-2-3-6z" fill="#00a000"/>',
  sun: '<circle cx="8" cy="8" r="3.5" fill="#ffff00" stroke="#000"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13" stroke="#000"/>',
  book: '<path d="M2.5 2.5h10v12h-10z" fill="#800000" stroke="#000"/><path d="M4.5 2.5v12" stroke="#000"/><path d="M6 5.5h5M6 7.5h5" stroke="#fff"/>',
  error: '<circle cx="8" cy="8" r="7" fill="#f00" stroke="#800000"/><path d="M5 5l6 6M11 5l-6 6" stroke="#fff" stroke-width="2"/>',
  warning: '<path d="M8 1.5l7 12.5H1z" fill="#ff0" stroke="#000"/><path d="M8 6v4" stroke="#000" stroke-width="1.6"/><rect x="7.2" y="11" width="1.6" height="1.6" fill="#000"/>',
  info: '<circle cx="8" cy="8" r="7" fill="#0000c0" stroke="#000"/><rect x="7.2" y="3.5" width="1.6" height="1.6" fill="#fff"/><path d="M8 7v5" stroke="#fff" stroke-width="1.6"/>',
  flag: '<rect x="1" y="2" width="6" height="5.5" fill="#f00"/><rect x="8" y="2" width="6" height="5.5" fill="#0a0"/><rect x="1" y="8.5" width="6" height="5.5" fill="#00f"/><rect x="8" y="8.5" width="6" height="5.5" fill="#fc0"/>',
};

// 应用 id → 图标；没有登记的用文档图标
const BY_APP = { news: 'globe', weather: 'sun', tasks: 'doc', base: 'computer', access: 'key', mail: 'mail', recycle: 'trash', notebook: 'book' };
export const appIcon = (app) => app.icon ?? BY_APP[app.id] ?? 'doc';

export function icon(name, size = 32) {
  const el = document.createElement('span');
  el.className = 'ico';
  el.style.width = el.style.height = `${size}px`;
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" fill="none">${S[name] ?? S.doc}</svg>`;
  return el;
}
