// 拖动窗口：按住标题栏拖
export function makeDraggable(win, bar) {
  bar.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('button')) return;
    ev.preventDefault();
    const fixed = getComputedStyle(win).position === 'fixed';
    const r = win.getBoundingClientRect();
    if (fixed) { // 居中用的是 inset + margin:auto，先换成明确的坐标
      win.style.inset = 'auto'; win.style.margin = '0';
      win.style.left = `${r.left}px`; win.style.top = `${r.top}px`;
    }
    const baseL = fixed ? r.left : win.offsetLeft, baseT = fixed ? r.top : win.offsetTop;
    const x0 = ev.clientX, y0 = ev.clientY;
    const move = (m) => {
      win.style.left = `${baseL + m.clientX - x0}px`;
      win.style.top = `${Math.max(0, baseT + m.clientY - y0)}px`;
    };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
}
