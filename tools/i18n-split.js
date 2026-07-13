/* 把 _i18n/src.json 切成若干批次,供并行翻译。按 key 类型分批 —— 同类内容一起翻,术语更一致。
   用法: node tools/i18n-split.js */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "_i18n");
const src = JSON.parse(fs.readFileSync(path.join(DIR, "src.json"), "utf8"));
const keys = Object.keys(src);

const pick = (re) => keys.filter((k) => re.test(k));
const isStem = (k) => /\.s$/.test(k);
const isFb = (k) => /\.fb\./.test(k);
const isLearn = (k) => /\.(l1|l2|l3|sum)\.(t|b)$/.test(k);
const isLbl = (k) => /lbl/.test(k);
const isOpt = (k) => /\.(a|b|c|d)$/.test(k);
const isTpl = (k) => /^fb\./.test(k);

const used = new Set();
const take = (arr) => {
  arr.forEach((k) => used.add(k));
  return arr;
};

const groups = [];
// 1) 反馈模板 + 所有 UI(= 剩下的一切) —— 这批定义术语基调,优先翻
const tpl = take(pick(/^fb\./));
const learn = take(keys.filter(isLearn));
const lbl = take(keys.filter(isLbl));
const opt = take(keys.filter((k) => isOpt(k) && !used.has(k)));
const stem = take(keys.filter((k) => isStem(k) && !used.has(k)));
const fb = take(keys.filter((k) => isFb(k) && !used.has(k)));
const ui = keys.filter((k) => !used.has(k));

const chunk = (arr, n) => {
  const out = [];
  const size = Math.ceil(arr.length / n);
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

groups.push({ name: "ui", keys: [...tpl, ...ui] }); // 模板 + UI 一起(术语基准)
groups.push({ name: "learn", keys: learn });
chunk(lbl, 2).forEach((c, i) => groups.push({ name: "lbl" + (i + 1), keys: c }));
groups.push({ name: "opt", keys: opt });
chunk(stem, 2).forEach((c, i) => groups.push({ name: "stem" + (i + 1), keys: c }));
chunk(fb, 3).forEach((c, i) => groups.push({ name: "fb" + (i + 1), keys: c }));

const outDir = path.join(DIR, "batches");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

let total = 0;
for (const g of groups) {
  const o = {};
  g.keys.forEach((k) => (o[k] = src[k]));
  const chars = g.keys.reduce((a, k) => a + src[k].length, 0);
  fs.writeFileSync(path.join(outDir, g.name + ".json"), JSON.stringify(o, null, 1));
  console.log(String(g.keys.length).padStart(5) + " 条 / " + String(chars).padStart(7) + " 字符  → " + g.name + ".json");
  total += g.keys.length;
}
console.log("---");
console.log("共 " + groups.length + " 批 / " + total + " 条(源 " + keys.length + " 条" + (total === keys.length ? " ✔ 无遗漏" : " ✖ 对不上!") + ")");
