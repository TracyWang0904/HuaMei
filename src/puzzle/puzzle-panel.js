import { h } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { openMsgBox } from '../ui/modal.js';
import { t } from '../core/i18n.js';
import { checkAnswer, hashAnswer } from '../core/hash.js';
import { applyEffects } from '../core/effects.js';
import * as S from '../core/state.js';

// 通用的谜题面板（像 Windows 的登录框）。
// 输入类：{ id, prompt?, passwordHint?, fields:[{key,label,maxLength,numeric,answerHash}], traps?, onSolve }
//   每个输入框的哈希 id 是 `${puzzle.id}.${field.key}`
//   traps：[{ answerHash, message }]，输入了某个特定的错误答案时给出专门的提示（比如第七章先试 1127）
//   passwordHint 在 trapHint 为 true 的谜题里，要先触发 trap 才显示
// 排序类：{ id, type:'sort', items:[{key,text}]（按打乱后的顺序写）, answerHash }，哈希的内容是按正确顺序连起来的 key
export function puzzlePanel(puzzle, { onSolved } = {}) {
  const root = h('div', { class: 'puzzle' });

  function renderSolved() {
    root.replaceChildren(h('div', { class: 'msg-row' }, icon('check', 32), h('p', {}, t('puzzle.solved'))));
  }
  if (S.get().solved.includes(puzzle.id)) { renderSolved(); return root; }

  const succeed = () => {
    S.update((s) => { if (!s.solved.includes(puzzle.id)) s.solved.push(puzzle.id); });
    applyEffects(puzzle.onSolve);
    renderSolved();
    onSolved?.();
  };
  const fail = (text) => openMsgBox({ title: t('ws.title'), text, kind: 'error' });

  return puzzle.type === 'sort' ? sortPanel(puzzle, root, succeed, fail) : inputPanel(puzzle, root, succeed, fail);
}

function inputPanel(puzzle, root, succeed, fail) {
  const inputs = puzzle.fields.map((f) => h('input', {
    type: 'text', name: f.key, maxlength: f.maxLength, autocomplete: 'off', autocapitalize: 'off',
    spellcheck: 'false', inputmode: f.numeric ? 'numeric' : 'text', placeholder: f.placeholder ?? '',
  }));

  const hintLine = h('p', {});
  const showHint = () => {
    const visible = puzzle.passwordHint && (!puzzle.trapHint || S.get().flags.includes(`trap:${puzzle.id}`));
    hintLine.textContent = visible ? t('puzzle.pwHint', { hint: puzzle.passwordHint }) : '';
    hintLine.hidden = !visible;
  };
  showHint();

  const form = h('form', {
    onsubmit: async (e) => {
      e.preventDefault();
      for (const trap of puzzle.traps ?? []) {
        const hit = await Promise.all(puzzle.fields.map(async (f, i) => (await hashAnswer(`${puzzle.id}.trap`, inputs[i].value)) === trap.answerHash));
        if (hit.every(Boolean)) {
          S.update((s) => { const k = `trap:${puzzle.id}`; if (!s.flags.includes(k)) s.flags.push(k); });
          showHint();
          return fail(trap.message);
        }
      }
      const results = await Promise.all(puzzle.fields.map((f, i) => checkAnswer(`${puzzle.id}.${f.key}`, inputs[i].value, f.answerHash)));
      if (!results.every(Boolean)) return fail(t('puzzle.wrong'));
      succeed();
    },
  },
  puzzle.fields.map((f, i) => h('label', { class: 'field' }, h('span', {}, f.label ?? ''), inputs[i])),
  h('div', { class: 'btn-row' }, h('button', { type: 'submit', class: 'btn default' }, t('puzzle.submit'))));

  root.append(h('div', { class: 'login-row' }, icon('key', 32), h('div', { class: 'login-main' }, ...[
    puzzle.prompt ? h('p', {}, puzzle.prompt) : null, hintLine, form,
  ].filter(Boolean))));
  setTimeout(() => inputs[0]?.focus(), 0);
  return root;
}

function sortPanel(puzzle, root, succeed, fail) {
  const order = puzzle.items.map((x) => x.key);
  const list = h('ol', { class: 'sort-list' });
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= order.length) return; [order[i], order[j]] = [order[j], order[i]]; draw(); };
  const draw = () => {
    list.replaceChildren(...order.map((key, i) => {
      const it = puzzle.items.find((x) => x.key === key);
      return h('li', {},
        h('span', { class: 'sort-text' }, it.text),
        h('span', { class: 'sort-btns' },
          h('button', { type: 'button', class: 'btn', disabled: i === 0, 'aria-label': t('puzzle.up'), onclick: () => move(i, -1) }, '↑'),
          h('button', { type: 'button', class: 'btn', disabled: i === order.length - 1, 'aria-label': t('puzzle.down'), onclick: () => move(i, 1) }, '↓')));
    }));
  };
  draw();
  root.append(...[
    puzzle.prompt ? h('p', {}, puzzle.prompt) : null, list,
    h('div', { class: 'btn-row' }, h('button', {
      type: 'button', class: 'btn default',
      onclick: async () => { (await checkAnswer(`${puzzle.id}.main`, order.join(''), puzzle.answerHash)) ? succeed() : fail(t('puzzle.wrong')); },
    }, t('puzzle.submit'))),
  ].filter(Boolean));
  return root;
}
