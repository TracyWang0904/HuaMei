import { t } from './core/i18n.js';
import { load, clear, exportSave, importSave } from './core/storage.js';

// A0 空壳：只验证存档导出/导入链路，游戏界面在 A1 做
const app = document.getElementById('app');
document.title = t('app.title');
app.innerHTML = `
  <h1>${t('app.title')}</h1>
  <p><button id="exp">${t('save.export')}</button>
     <button id="imp">${t('save.import')}</button>
     <button id="clr">${t('save.clear')}</button></p>
  <textarea id="box" placeholder="${t('save.import.prompt')}"></textarea>
  <p id="msg"></p>`;
const box = app.querySelector('#box');
const msg = app.querySelector('#msg');
app.querySelector('#exp').onclick = () => { box.value = exportSave(load()); box.select(); };
app.querySelector('#imp').onclick = () => {
  try { importSave(box.value); msg.textContent = t('save.import.ok'); }
  catch { msg.textContent = t('save.import.fail'); }
};
app.querySelector('#clr').onclick = () => { if (confirm(t('save.clear.confirm'))) { clear(); msg.textContent = ''; } };
