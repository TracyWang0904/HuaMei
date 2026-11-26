// “现在”：JT188.10.17 深夜，随游戏进行走动（真实 1 分钟 = 游戏 1 分钟）
import { get } from './state.js';

const START_MIN = 21 * 60 + 40; // 21:40，记者打开电脑的时间
const pad = (n) => String(n).padStart(2, '0');

export function nowParts() {
  const started = get().startedAt ?? Date.now();
  const total = START_MIN + Math.floor((Date.now() - started) / 60000);
  const m = total % 1440;
  return { month: 10, day: 17 + Math.floor(total / 1440), hour: Math.floor(m / 60), minute: m % 60 };
}

export function nowString() {
  const { day, hour, minute } = nowParts();
  return `JT188.10.${pad(day)}  ${pad(hour)}:${pad(minute)}`;
}
