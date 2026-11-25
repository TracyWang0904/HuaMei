// 答案校验：源码里不出现明文，只存加盐 SHA-256。
// 浏览器与 Node（tools/gen-hash.js）共用这一份实现。
const SALT = 'huamei:v1';

export function normalize(input) {
  return String(input).normalize('NFKC').replace(/\s+/g, '').toUpperCase();
}

export async function hashAnswer(puzzleId, input) {
  const data = new TextEncoder().encode(`${SALT}:${puzzleId}:${normalize(input)}`);
  const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function checkAnswer(puzzleId, input, expectedHash) {
  return (await hashAnswer(puzzleId, input)) === expectedHash;
}
