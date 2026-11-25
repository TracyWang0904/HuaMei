// 场景图里的七段数码管电子钟：显示“现在”（SVG 里每段是 clk-{位}-{a~g}，日期是 date-{位}-{a~g}）
import { nowParts } from '../core/clock.js';

const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

function setDigit(svg, prefix, n) {
  for (const s of 'abcdefg') {
    const el = svg.getElementById?.(`${prefix}-${s}`) ?? svg.querySelector(`#${prefix}-${s}`);
    if (el) el.style.display = SEG[n].includes(s) ? '' : 'none';
  }
}

export function startClock(svg) {
  if (!svg.querySelector('#clock-segments')) return;
  const two = (n) => String(n).padStart(2, '0');
  let first = true; // 第一次调用时 SVG 还没挂到页面上，不能据此判断已被移除
  const tick = () => {
    if (!first && !svg.isConnected) { clearInterval(timer); return; }
    first = false;
    const { month, day, hour, minute } = nowParts();
    const t = two(hour) + two(minute), d = two(month) + two(day);
    for (let i = 0; i < 4; i++) { setDigit(svg, `clk-${i}`, +t[i]); setDigit(svg, `date-${i}`, +d[i]); }
    const on = Math.floor(Date.now() / 1000) % 2 === 0 ? '' : 'none';
    svg.querySelector('#clk-colon-1').style.display = on;
    svg.querySelector('#clk-colon-2').style.display = on;
  };
  const timer = setInterval(tick, 500);
  tick();
}
