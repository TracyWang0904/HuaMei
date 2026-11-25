// 灯光闪烁：在场景图最上面盖一层黑色，隔几秒让它短暂变暗再恢复，像接触不良的日光灯。
// 每次的闪法随机（单闪或连闪），总时长不到 0.6 秒，不会连续频闪。
const NS = 'http://www.w3.org/2000/svg';

const PATTERNS = [
  // [时间点, 遮罩不透明度]，时间点是占总时长的比例
  { dur: 380, frames: [[0, 0], [0.12, 0.55], [0.3, 0.05], [0.45, 0.65], [1, 0]] },     // 连闪两下
  { dur: 520, frames: [[0, 0], [0.08, 0.7], [0.55, 0.6], [0.7, 0.2], [1, 0]] },        // 灭一下再缓缓亮回来
  { dur: 260, frames: [[0, 0], [0.2, 0.5], [1, 0]] },                                 // 轻轻一闪
];

export function startFlicker(svg, { minGap = 3500, maxGap = 9000 } = {}) {
  const vb = svg.viewBox.baseVal;
  const veil = document.createElementNS(NS, 'rect');
  veil.setAttribute('x', vb.x); veil.setAttribute('y', vb.y);
  veil.setAttribute('width', vb.width); veil.setAttribute('height', vb.height);
  veil.setAttribute('fill', '#000');
  veil.setAttribute('opacity', '0');
  veil.setAttribute('pointer-events', 'none');
  veil.id = 'flicker-veil';
  svg.append(veil);

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches; // 系统要求减少动效时只轻闪一下
  let first = true;
  const once = () => {
    if (!first && !svg.isConnected) return; // 换场景后停止
    first = false;
    const p = calm ? PATTERNS[2] : PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    veil.animate(p.frames.map(([offset, opacity]) => ({ offset, opacity })), { duration: p.dur, easing: 'linear' });
    setTimeout(once, minGap + Math.random() * (maxGap - minGap));
  };
  setTimeout(once, 1500 + Math.random() * 1500); // 进场景后很快就闪第一次
}
