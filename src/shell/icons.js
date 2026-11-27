// 记者电脑上的应用图标：macOS 系统图标（合成后的 SVG，见 tools/build-mac-icons.mjs 与 LICENSES.md）
const FILE = { browser: 'safari', chat: 'messages', notebook: 'notes', settings: 'settings' };
const file = (n) => FILE[n] ?? n;

export function flatIcon(name, size = 48) {
  const el = document.createElement('span');
  el.className = 'ficon';
  const img = document.createElement('img');
  img.src = `/assets/img/mac/${file(name)}.svg`;
  img.width = img.height = size;
  img.alt = '';
  img.draggable = false;
  el.append(img);
  return el;
}
