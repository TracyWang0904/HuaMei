// 存档层：业务代码只通过这里读写，不直接碰 localStorage。
// 以后换成桌面文件或 Steam 云存档，只改下面的 backend。
const KEY = 'huamei.save';
const VERSION = 1;

export function defaultSave() {
  return {
    version: VERSION,
    contentAck: false,
    startedAt: null,   // 开始游戏的真实时间戳，用来推算“现在”
    currentPlace: null,
    unlockedPlaces: [],
    solved: [],        // 已解开的谜题 id
    hintLevels: {},    // { 谜题id: 已看到的提示级数 }
    flags: [],
    loggedIn: [],
    readDocs: [],
    notebook: {},      // { 词: [出处, ...] }
    items: [],         // [{ id, name }]
    endings: [],
  };
}

// 网页版 backend；localStorage 不可用时退化为内存
const memory = new Map();
const backend = {
  get(k) { try { return localStorage.getItem(k); } catch { return memory.get(k) ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { memory.set(k, v); } },
  del(k) { try { localStorage.removeItem(k); } catch { memory.delete(k); } },
};

export function load() {
  const raw = backend.get(KEY);
  if (!raw) return defaultSave();
  try { return migrate(JSON.parse(raw)); } catch { return defaultSave(); }
}

export function save(state) { backend.set(KEY, JSON.stringify(state)); }
export function clear() { backend.del(KEY); }

function migrate(s) {
  // 以后改存档格式时在这里按 s.version 升级
  return { ...defaultSave(), ...s, version: VERSION };
}

// —— 导出 / 导入：方便换设备或发给朋友 ——
const PREFIX = 'HUAMEI1:';

export function exportSave(state = load()) {
  const json = JSON.stringify(state);
  return PREFIX + btoa(unescape(encodeURIComponent(json)));
}

export function importSave(text) {
  const s = String(text).trim();
  if (!s.startsWith(PREFIX)) throw new Error('bad prefix');
  const obj = JSON.parse(decodeURIComponent(escape(atob(s.slice(PREFIX.length)))));
  if (typeof obj !== 'object' || obj === null || !('version' in obj)) throw new Error('bad shape');
  const state = migrate(obj);
  save(state);
  return state;
}
