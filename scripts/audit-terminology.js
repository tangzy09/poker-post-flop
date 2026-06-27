/* Terminology consistency for c13–c30: stem/label must match (EN + ZH) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, getQuestions };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, getQuestions } = ctx.__out;
const t = (k) => STR.en[k] || "";
const tz = (k) => STR.zh[k] || "";

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };

function kind(text) {
  let s = text.replace(/blocker[^,\.]*/gi, "").replace(/阻断[^，。]*/g, "");
  s = s.replace(/封顶/g, "CAPPED");
  s = s.toLowerCase();
  const rules = [
    [/missed straight|破产顺|missed draw|破产听|missed fd|破产花听|missed flush draw|破产同花听|同花听牌破产/, "missed draw"],
    [/TPTK|顶对顶踢/, "TPTK"],
    [/weak top pair|弱顶对/, "weak top pair"],
    [/top set|顶三条/, "top set"],
    [/middle set|中三条/, "middle set"],
    [/bottom set|底三条/, "bottom set"],
    [/top pair|顶对/, "top pair"],
    [/middle pair|中对/, "middle pair"],
    [/second pair|第二对/, "second pair"],
    [/third pair|第三对/, "third pair"],
    [/full house|葫芦/, "full house"],
    [/quads|四条/, "quads"],
    [/two pair|两对/, "two pair"],
    [/\btrips\b|5x trips|5x 三条/, "trips"],
    [/\bset\b|三条/, "set"],
    [/overpair|超对/, "overpair"],
    [/underpair|垫底对/, "underpair"],
    [/nut straight|坚果顺/, "nut straight"],
    [/straight draw|open-ended straight|open-ender|open-ended|顺听|顺子听/, "draw"],
    [/\bstraight\b|顺子/, "straight"],
    [/nut flush draw|nut fd|坚果花听/, "draw"],
    [/flush draw|花听|同花听|FD|combo draw|组合听牌|oesd|两头顺|卡顺/, "draw"],
    [/\bair\b|空气/, "air"],
    [/ace-high|A 高/, "ace-high"],
  ];
  for (const [re, k] of rules) if (re.test(text) || re.test(s)) return k;
  return null;
}

function compatible(a, b) {
  if (!a || !b || a === b) return true;
  const groups = [
    ["TPTK", "top pair"],
    ["weak top pair", "top pair"],
    ["bottom set", "middle set", "top set", "set"],
    ["trips", "set"],
    ["missed draw", "air"],
    ["draw", "air"],
    ["ace-high", "air"],
  ];
  return groups.some((g) => g.includes(a) && g.includes(b));
}

function auditQuestion(q) {
  const issues = [];
  const enStem = t(q.stemKey);
  const zhStem = tz(q.stemKey);
  const enLbl = q.spot?.hero?.labelKey ? t(q.spot.hero.labelKey) : "";
  const zhLbl = q.spot?.hero?.labelKey ? tz(q.spot.hero.labelKey) : "";
  const pairs = [
    ["EN stem/label", kind(enStem), kind(enLbl)],
    ["ZH stem/label", kind(zhStem), kind(zhLbl)],
    ["EN/ZH stem", kind(enStem), kind(zhStem)],
    ["EN/ZH label", kind(enLbl), kind(zhLbl)],
  ];
  for (const [where, a, b] of pairs) {
    if (a && b && !compatible(a, b)) issues.push(`${where}: ${a} vs ${b}`);
  }
  const hand = q.spot?.hero?.hand || [];
  if (hand.length === 2 && hand[0][0] === hand[1][0] && /third pair|第三对/.test(enLbl + zhLbl)) {
    issues.push(`pocket pair labeled third pair`);
  }
  if (hand.length === 2 && hand[0][0] === hand[1][0] && /\btrips\b/.test(enLbl) && !/trips board|5x trips|,\s*multiway/.test(enLbl)) {
    issues.push(`pocket pair labeled trips (use set)`);
  }
  if (/full house|葫芦/.test(enLbl)) {
    const ranks = [...(q.spot?.board || []), ...hand].map((c) => RANK[c[0].toUpperCase()]);
    const freq = {};
    for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
    const counts = Object.values(freq).sort((a, b) => b - a);
    if (!(counts[0] >= 3 && counts[1] >= 2)) issues.push("full house label but hand is not full house");
  }
  return issues;
}

const all = [];
for (let i = 1; i <= 30; i++) {
  for (const q of getQuestions("c" + i)) {
    const iss = auditQuestion(q);
    if (iss.length) all.push({ id: q.id, issues: iss });
  }
}

if (all.length) {
  console.log("c1–c30 terminology:", all.length, "issues");
  for (const x of all) {
    console.log("\n" + x.id);
    for (const i of x.issues) console.log("  - " + i);
  }
  process.exit(1);
}
console.log("c1–c30 terminology: OK");
