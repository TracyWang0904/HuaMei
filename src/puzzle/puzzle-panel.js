import { h } from '../ui/dom.js';
import { t } from '../core/i18n.js';
import { checkAnswer } from '../core/hash.js';
import { applyEffects } from '../core/effects.js';
import * as S from '../core/state.js';

// 通用的密码输入面板。
// puzzle: { id, prompt?, passwordHint?, fields:[{key,label,maxLength,numeric,answerHash}], hints:[提示1,提示2], onSolve:[效果] }
// 每个输入框的哈希 id 是 `${puzzle.id}.${field.key}`
export function puzzlePanel(puzzle, { onSolved } = {}) {
  const root = h('div', { class: 'puzzle' });

  function renderSolved() {
    root.replaceChildren(h('p', { class: 'ok' }, t('puzzle.solved')));
  }
  if (S.get().solved.includes(puzzle.id)) { renderSolved(); return root; }

  const msg = h('p', { class: 'msg', 'aria-live': 'polite' });
  const hintBox = h('div', { class: 'hints' });
  const inputs = puzzle.fields.map((f) => h('input', {
    type: 'text', name: f.key, maxlength: f.maxLength, autocomplete: 'off', autocapitalize: 'off',
    spellcheck: 'false', inputmode: f.numeric ? 'numeric' : 'text', placeholder: f.placeholder ?? '',
  }));

  const showHints = () => {
    const n = S.get().hintLevels[puzzle.id] ?? 0;
    hintBox.replaceChildren(...(puzzle.hints ?? []).slice(0, n).map((x, i) => h('p', { class: 'hint' }, `${t('puzzle.hint')} ${i + 1}：${x}`)));
  };
  const hintBtn = h('button', {
    type: 'button',
    onclick: () => {
      const n = S.get().hintLevels[puzzle.id] ?? 0;
      if (n >= (puzzle.hints ?? []).length) return;
      S.update((s) => { s.hintLevels[puzzle.id] = n + 1; });
      showHints();
    },
  }, t('puzzle.hint'));

  const form = h('form', {
    onsubmit: async (e) => {
      e.preventDefault();
      const results = await Promise.all(puzzle.fields.map((f, i) => checkAnswer(`${puzzle.id}.${f.key}`, inputs[i].value, f.answerHash)));
      if (!results.every(Boolean)) { msg.textContent = t('puzzle.wrong'); return; }
      S.update((s) => { if (!s.solved.includes(puzzle.id)) s.solved.push(puzzle.id); });
      applyEffects(puzzle.onSolve);
      renderSolved();
      onSolved?.();
    },
  },
  puzzle.fields.map((f, i) => h('label', {}, h('span', {}, f.label ?? ''), inputs[i])),
  h('div', { class: 'row' }, h('button', { type: 'submit' }, t('puzzle.submit')), hintBtn));

  root.append(...[
    puzzle.prompt ? h('p', { class: 'prompt' }, puzzle.prompt) : null,
    puzzle.passwordHint ? h('p', { class: 'pwhint' }, t('puzzle.pwHint', { hint: puzzle.passwordHint })) : null,
    form, msg, hintBox,
  ].filter(Boolean));
  showHints();
  return root;
}
