/* Emit "answer-hidden" solving inputs (no correct, no feedback) for given courses. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "..");
const OUT = process.env.SOLVE_DIR || path.join(root, ".solve");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = ""; for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, COURSES, getQuestions };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx; vm.createContext(ctx); vm.runInContext(code, ctx);
const { STR, COURSES, getQuestions } = ctx.__out;
const en = (k) => STR.en[k] || "", zh = (k) => STR.zh[k] || "";
fs.mkdirSync(OUT, { recursive: true });

const targets = process.argv.slice(2);
for (const id of targets) {
  const course = COURSES.find((c) => c.id === id) || {};
  let s = `# ${id}  "${en(id + ".title")}" / "${zh(id + ".title")}"  concept="${(course.concepts || course.concept || "")}"\n`;
  s += `# 每题给出:你认为的最优动作(可多个并列), 理由(1-2句), 置信度(高/中/低)。先独立判断,不要假设题目给的答案就是对的。\n\n`;
  for (const q of getQuestions(id)) {
    if (q.type !== "action") continue;
    const sp = q.spot || {};
    s += `[${q.id}]\n`;
    s += `  STEM: ${en(q.stemKey)}\n`;
    if (q.ctxKey) s += `  CTX: ${en(q.ctxKey)}\n`;
    const lk = sp.hero?.labelKey; if (lk) s += `  你的牌型描述: ${en(lk)}\n`;
    s += `  牌面 board=[${(sp.board || []).join(" ")}]  你的手牌=[${(sp.hero?.hand || []).join(" ")}]\n`;
    s += `  底池=${sp.pot}  对手下注=${sp.bet}${sp.bet ? "" : " (无人下注/对手过牌)"}  位置=${sp.hero?.pos}  街=${sp.street}${sp.allIn ? "  (全压)" : ""}\n`;
    s += `  可选动作: ${(q.actions || []).join(", ")}\n\n`;
  }
  fs.writeFileSync(path.join(OUT, id + ".solve.txt"), s);
  console.log("wrote", id, "->", path.join(OUT, id + ".solve.txt"));
}
