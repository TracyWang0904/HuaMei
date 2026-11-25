import { collectWord, hasWord } from '../core/notebook.js';
import { nowString } from '../core/clock.js';

export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of kids.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}

// 把资料文本渲染出来：[[词]] 变成可点击的词，{{now}} 变成“现在”的时间
export function richText(text, { source = '' } = {}) {
  const box = h('div', { class: 'rich' });
  for (const part of text.split(/(\[\[.+?\]\]|\{\{now\}\})/g)) {
    if (part.startsWith('[[')) {
      const word = part.slice(2, -2);
      box.append(h('button', {
        type: 'button',
        class: 'word' + (hasWord(word) ? ' collected' : ''),
        onclick: () => {
          collectWord(word, source);
          box.querySelectorAll('.word').forEach((b) => { if (b.textContent === word) b.classList.add('collected'); });
        },
      }, word));
    } else if (part === '{{now}}') box.append(nowString());
    else box.append(part);
  }
  return box;
}
