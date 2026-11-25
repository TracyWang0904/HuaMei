// “现在”：JT188.10.17 深夜，随游戏进行走动（真实 1 分钟 = 游戏 1 分钟）
import { get } from './state.js';

const START_MIN = 23 * 60 + 40; // 23:40，探险家笔记本第一页的时间
const pad = (n) => String(n).padStart(2, '0');

export function nowString() {
  const started = get().startedAt ?? Date.now();
  const total = START_MIN + Math.floor((Date.now() - started) / 60000);
  const day = 17 + Math.floor(total / 1440);
  const m = total % 1440;
  return `JT188.10.${pad(day)}  ${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}
