// 谜题解开后的效果：解锁地点、登录电脑、给道具、设标记
import * as S from './state.js';

export function applyEffects(effects = []) {
  S.update((s) => {
    for (const e of effects) {
      if (e.unlockPlace && !s.unlockedPlaces.includes(e.unlockPlace)) s.unlockedPlaces.push(e.unlockPlace);
      if (e.login && !s.loggedIn.includes(e.login)) s.loggedIn.push(e.login);
      if (e.flag && !s.flags.includes(e.flag)) s.flags.push(e.flag);
      if (e.giveItem && !s.items.some((i) => i.id === e.giveItem.id)) s.items.push(e.giveItem);
    }
  });
}
