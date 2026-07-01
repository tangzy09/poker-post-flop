/* Compare agent blind-solve verdicts vs actual correct answers; emit divergences. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "..");
const SOLVE = process.env.SOLVE_DIR || path.join(root, ".solve");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = ""; for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, getQuestions };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx; vm.createContext(ctx); vm.runInContext(code, ctx);
const { STR, getQuestions } = ctx.__out;
const en = (k) => STR.en[k] || "";

// actual answers
const actual = {};
for (let i = 1; i <= 30; i++) for (const q of getQuestions("c" + i)) {
  if (q.type === "action") actual[q.id] = { correct: q.correct || [], lbl: en(q.spot?.hero?.labelKey), board: (q.spot?.board||[]).join(" "), hand: (q.spot?.hero?.hand||[]).join(" ") };
}

// load verdicts
const verdicts = {};
let missing = [];
for (let i = 1; i <= 30; i++) {
  const f = path.join(SOLVE, `c${i}.verdict.json`);
  if (!fs.existsSync(f)) { missing.push("c" + i); continue; }
  try { Object.assign(verdicts, JSON.parse(fs.readFileSync(f, "utf8").replace(/^﻿/, ""))); }
  catch (e) { console.log("PARSE FAIL c" + i + ": " + e.message); }
}
if (missing.length) console.log("MISSING verdict files: " + missing.join(",") + "\n");

const setEq = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const inter = (a, b) => a.filter((x) => b.includes(x));

const div = { A: [], B: [], C: [] };
let agree = 0, total = 0;
for (const id of Object.keys(actual)) {
  const v = verdicts[id];
  if (!v) continue;
  total++;
  const correct = actual[id].correct;
  const best = v.best || [], also = v.also || [], all = [...new Set([...best, ...also])];
  if (setEq(correct, best) || (inter(correct, best).length === best.length && inter(best, correct).length === best.length)) { agree++; continue; }
  const line = `[${id}] conf=${v.conf} | 题目correct=[${correct.join("/")}] agent best=[${best.join("/")}] also=[${also.join("/")}] | ${actual[id].lbl} board=${actual[id].board} hand=${actual[id].hand} | ${v.note||""}`;
  if (inter(correct, all).length === 0) div.A.push(line);          // 完全不相交:最严重
  else if (inter(best, correct).length === 0) div.B.push(line);     // agent最优不在题目答案
  else div.C.push(line);                                            // 部分重叠(完整性/细节)
}

console.log(`对比 ${total} 题(有 verdict 的 action 题),agent best 与题目答案完全一致 ${agree} 题。\n`);
console.log(`=== A类 硬冲突(agent 主张与题目答案毫无交集 — 最可能题错): ${div.A.length} ===`);
div.A.forEach((x) => console.log("  " + x));
console.log(`\n=== B类 agent最优动作不在题目答案(题目可能偏紧/错): ${div.B.length} ===`);
div.B.sort((a)=>a.includes("conf=高")?-1:1).forEach((x) => console.log("  " + x));
console.log(`\n=== C类 部分重叠(答案完整性/路线选择): ${div.C.length} ===`);
div.C.forEach((x) => console.log("  " + x));
