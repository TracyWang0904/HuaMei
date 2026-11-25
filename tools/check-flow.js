// 流程检查：假设玩家知道所有答案，看从序章出发能不能走通整个游戏——
// 每个地点都能到、每台电脑都能登录、道具拿得到、三个结局都触发得了。
// 答案不写在这里（源码里不能有明文答案），只检查“解开之后会发生什么”。
import { readdirSync, readFileSync } from 'node:fs';

const root = new URL('../data/', import.meta.url).pathname;
const load = (dir) => Object.fromEntries(readdirSync(root + dir).filter((f) => f.endsWith('.json')).map((f) => { const d = JSON.parse(readFileSync(root + dir + '/' + f, 'utf8')); return [d.id, d]; }));
const places = load('locations'), computers = load('computers'), shared = load('computers/shared');
const map = JSON.parse(readFileSync(root + 'map.json', 'utf8'));
const endings = JSON.parse(readFileSync(root + 'endings.json', 'utf8'));

const st = { unlocked: new Set(map.floors.flatMap((f) => f.places).filter((p) => p.initial).map((p) => p.id)), items: new Set(), solved: new Set(), flags: new Set(), loggedIn: new Set(), endings: new Set() };
const meets = (c) => !c || ((!c.solved || st.solved.has(c.solved)) && (!c.flag || st.flags.has(c.flag)) && (!c.item || st.items.has(c.item)));
let changed = false;
const add = (set, v) => { if (!set.has(v)) { set.add(v); changed = true; } };
const apply = (effects = []) => {
  for (const e of effects) {
    if (e.unlockPlace) add(st.unlocked, e.unlockPlace);
    if (e.login) add(st.loggedIn, e.login);
    if (e.flag) add(st.flags, e.flag);
    if (e.giveItem) add(st.items, e.giveItem.id);
    if (e.goto) add(st.unlocked, e.goto);
    if (e.ending) add(st.endings, e.ending);
  }
};
const solve = (pz) => { if (pz && !st.solved.has(pz.id)) { add(st.solved, pz.id); apply(pz.onSolve); } };

function useComputer(id) {
  const c = computers[id];
  if (c.login) { solve(c.login); apply([{ login: id }]); }
  for (const a of c.apps) {
    const app = a.shared ? shared[a.shared] : a;
    for (const e of app.entries ?? []) {
      if (e.lock) solve(e.lock);
      for (const act of e.actions ?? []) { apply(act.effects); add(st.flags, `act:${act.id}`); }
    }
  }
}

function visit(place) {
  for (const hs of place.hotspots) {
    if (!meets(hs.showWhen) || (hs.hideWhen && meets(hs.hideWhen))) continue;
    if (hs.requiresItem && !st.items.has(hs.requiresItem.id)) continue;
    if (hs.type === 'doc') apply(hs.onOpen);
    else if (hs.type === 'computer') useComputer(hs.computer);
    else if (hs.type === 'goto') apply(hs.effects);
    else if (hs.type === 'puzzle') solve(hs.puzzle);
    else if (hs.type === 'choice') for (const o of hs.options) if (meets(o.showWhen)) apply(o.effects);
  }
}

// 反复走，直到不再有新东西
do { changed = false; for (const id of [...st.unlocked]) visit(places[id]); } while (changed);

let bad = 0;
const check = (ok, msg) => { if (!ok) { bad++; console.error('✗', msg); } };
const all = map.floors.flatMap((f) => f.places);
for (const p of all) check(st.unlocked.has(p.id), `地点走不到：${p.id}`);
for (const id of Object.keys(computers)) if (id !== 'phone') check(!computers[id].login || st.loggedIn.has(id), `电脑登录不了：${id}`);
for (const k of Object.keys(endings)) check(st.endings.has(k), `结局触发不了：${k}`);
for (const id of ['jq-card-old', 'commander-card', 'recorder']) check(st.items.has(id), `道具拿不到：${id}`);

// 引用的 id 必须存在
const walk = (v, f) => { f(v); if (Array.isArray(v)) v.forEach((x) => walk(x, f)); else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x, f)); };
for (const d of [...Object.values(places), ...Object.values(computers)]) walk(d, (o) => {
  if (o?.unlockPlace) check(places[o.unlockPlace], `${d.id} 解锁了不存在的地点 ${o.unlockPlace}`);
  if (o?.goto) check(places[o.goto], `${d.id} 跳去不存在的地点 ${o.goto}`);
  if (o?.ending) check(endings[o.ending], `${d.id} 触发了不存在的结局 ${o.ending}`);
  if (o?.computer) check(computers[o.computer], `${d.id} 引用了不存在的电脑 ${o.computer}`);
  if (o?.shared) check(shared[o.shared], `${d.id} 引用了不存在的共用应用 ${o.shared}`);
});
for (const p of all) check(places[p.id], `地图里的地点没有数据文件：${p.id}`);

console.log(bad ? `流程检查：${bad} 个问题` : `流程检查通过：${all.length} 个地点都能到，${st.endings.size} 个结局都能触发`);
process.exit(bad ? 1 : 0);
