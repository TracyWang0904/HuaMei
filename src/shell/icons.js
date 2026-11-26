// 记者电脑上的扁平图标（自绘 SVG，无外部素材）
const P = {
  browser: '<circle cx="24" cy="24" r="18" fill="#3b82f6"/><path d="M6 24h36M24 6c-7 6-7 30 0 36M24 6c7 6 7 30 0 36" stroke="#fff" stroke-width="2.4" fill="none"/>',
  chat: '<path d="M8 10h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H22l-9 7v-7H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="#22c55e"/><circle cx="16" cy="23" r="2.4" fill="#fff"/><circle cx="24" cy="23" r="2.4" fill="#fff"/><circle cx="32" cy="23" r="2.4" fill="#fff"/>',
  notebook: '<rect x="10" y="5" width="30" height="38" rx="4" fill="#f59e0b"/><rect x="14" y="5" width="3" height="38" fill="#b45309"/><path d="M21 15h14M21 22h14M21 29h9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',
  settings: '<circle cx="24" cy="24" r="7" fill="none" stroke="#64748b" stroke-width="5"/><path d="M24 4v7M24 37v7M4 24h7M37 24h7M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>',
};

export function flatIcon(name, size = 48) {
  const el = document.createElement('span');
  el.className = 'ficon';
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">${P[name]}</svg>`;
  return el;
}
