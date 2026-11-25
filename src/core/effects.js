// 谜题解开、资料打开、做出选择之后的效果：
//   unlockPlace 解锁地点　login 登录电脑　flag 设标记　giveItem 给道具（item.word 会同时收录进笔记本）
//   goto 跳到某个地点（会先解锁）　ending 进入结局
import * as S from './state.js';
import { emit } from './events.js';
import { collectWord } from './notebook.js';

export function applyEffects(effects = []) {
  const later = [];
  S.update((s) => {
    for (const e of effects) {
      if (e.unlockPlace && !s.unlockedPlaces.includes(e.unlockPlace)) s.unlockedPlaces.push(e.unlockPlace);
      if (e.login && !s.loggedIn.includes(e.login)) s.loggedIn.push(e.login);
      if (e.flag && !s.flags.includes(e.flag)) s.flags.push(e.flag);
      if (e.giveItem && !s.items.some((i) => i.id === e.giveItem.id)) {
        s.items.push({ id: e.giveItem.id, name: e.giveItem.name });
        if (e.giveItem.word) later.push(() => collectWord(e.giveItem.word, e.giveItem.source ?? '道具'));
      }
      if (e.goto) {
        if (!s.unlockedPlaces.includes(e.goto)) s.unlockedPlaces.push(e.goto);
        later.push(() => emit('goto', e.goto));
      }
      if (e.ending) later.push(() => emit('ending', e.ending));
    }
  });
  later.forEach((fn) => fn());
}

export const hasItem = (id) => S.get().items.some((i) => i.id === id);
export const hasFlag = (id) => S.get().flags.includes(id);
export const isSolved = (id) => S.get().solved.includes(id);

// 条件：{ solved, flag, item }，写了几项就要全部满足
export function meets(cond) {
  if (!cond) return true;
  return (!cond.solved || isSolved(cond.solved)) && (!cond.flag || hasFlag(cond.flag)) && (!cond.item || hasItem(cond.item));
}
