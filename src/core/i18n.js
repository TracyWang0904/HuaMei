// 语言包：UI 文字都从这里取。以后加英文版只需新增 data/i18n/en.json 并在 LOCALES 登记。
import zhCN from '../../data/i18n/zh-CN.json';

const LOCALES = { 'zh-CN': zhCN };
let current = 'zh-CN';

export function setLocale(code) {
  if (!LOCALES[code]) throw new Error(`未知语言：${code}`);
  current = code;
}

export function t(key, params = {}) {
  const text = LOCALES[current][key] ?? LOCALES['zh-CN'][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
}
