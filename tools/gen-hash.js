// 用法：npm run hash -- <谜题id> <答案>
// 输出该答案的加盐哈希，填进对应数据文件的 answerHash 字段。
import { hashAnswer } from '../src/core/hash.js';

const [id, answer] = process.argv.slice(2);
if (!id || answer === undefined) {
  console.error('用法：npm run hash -- <谜题id> <答案>');
  process.exit(1);
}
console.log(await hashAnswer(id, answer));
