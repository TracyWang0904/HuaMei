// 数据校验：JSON 能解析、[[词]] 标记配对、数据里不出现明文答案字段
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../data', import.meta.url).pathname;
let errors = 0;
const fail = (f, m) => { errors++; console.error(`✗ ${relative(root, f)}：${m}`); };

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.json')) check(p);
  }
}

function check(file) {
  let data;
  const raw = readFileSync(file, 'utf8');
  try { data = JSON.parse(raw); } catch (e) { return fail(file, `JSON 解析失败：${e.message}`); }
  (function visit(v, path) {
    if (typeof v === 'string') {
      const open = (v.match(/\[\[/g) || []).length, close = (v.match(/\]\]/g) || []).length;
      if (open !== close) fail(file, `${path} 的 [[ ]] 不配对`);
    } else if (Array.isArray(v)) v.forEach((x, i) => visit(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (k === 'answer') fail(file, `${path}.answer 不允许存明文答案，请用 answerHash`);
        visit(x, `${path}.${k}`);
      }
    }
  })(data, '$');
  if (raw.includes('TODO')) console.warn(`! ${relative(root, file)} 含 TODO`);
}

walk(root);
console.log(errors ? `共 ${errors} 个问题` : '数据校验通过');
process.exit(errors ? 1 : 0);
