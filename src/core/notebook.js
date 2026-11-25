// 笔记本数据：只收录词、出处和道具
import * as S from './state.js';

export const hasWord = (w) => w in S.get().notebook;

export function collectWord(word, source) {
  S.update((s) => {
    const list = s.notebook[word] ?? (s.notebook[word] = []);
    if (!list.includes(source)) list.push(source);
  });
}
