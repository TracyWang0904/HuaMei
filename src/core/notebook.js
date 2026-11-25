// 笔记本数据：只收录词、出处和道具
import * as S from './state.js';

export const hasWord = (w) => w in S.get().notebook;

// 同一个词不管从几处点到，笔记本里只有一条，出处记第一次收录的地方
export function collectWord(word, source) {
  if (hasWord(word)) return;
  S.update((s) => { s.notebook[word] = [source]; });
}
