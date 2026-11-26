// 数据加载：data/ 下的 JSON 在构建时打包进来，完全离线
const mods = import.meta.glob('/data/**/*.json', { eager: true, import: 'default' });

const under = (dir) => Object.entries(mods).filter(([p]) => p.startsWith(dir)).map(([, v]) => v);
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));

export const places = byId(under('/data/locations/'));
export const sharedApps = byId(under('/data/computers/shared/'));
export const computers = byId(
  Object.entries(mods)
    .filter(([p]) => p.startsWith('/data/computers/') && !p.startsWith('/data/computers/shared/'))
    .map(([, v]) => v),
);
export const gameMap = mods['/data/map.json'];
export const notebookIntro = mods['/data/notebook.json'];
export const endings = mods['/data/endings.json'];
export const shell = mods['/data/shell.json'];

// 应用可以直接内联，也可以用 { "shared": "<id>" } 引用共用应用（新闻、天气等）
export const resolveApp = (a) => (a.shared ? sharedApps[a.shared] : a);
