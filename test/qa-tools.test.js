/* qa-tools.test.js — 把两个内容质检工具收编进 npm test:
   - tools/verify-feedback.js:explain.js 计算式反馈的每个不等式必须为真(此前 explain 零测试覆盖)
   - tools/label-check.js:牌力标签 vs 重算成牌/听牌
   工具发现矛盾时以非零码退出;这里断言干净退出。 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.join(__dirname, "..");

function runTool(rel) {
  // 抛出即失败(非零退出);返回 stdout 供断言
  return execFileSync(process.execPath, [path.join(root, rel)], { encoding: "utf8", timeout: 120000 });
}

test("verify-feedback: computed-feedback math has zero false inequalities", () => {
  const out = runTool("tools/verify-feedback.js");
  assert.match(out, /未发现算式与答案的矛盾/);
});

test("label-check: hand-strength labels match recomputed made hands/draws", () => {
  const out = runTool("tools/label-check.js");
  assert.match(out, /未发现牌力标签与实际牌力的矛盾/);
});
