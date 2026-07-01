/* daily-scoring.test.js — 每日训练(组卷/打卡/续答) + 连击计分 + S/A/B/C 评级 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadEngine() {
  const files = [
    "js/i18n.js",
    "data/solved-spots.js",
    "js/courses.js",
    "js/content.js",
    "js/content-ext.js",
    "js/table.js",
    "js/engine.js",
    "js/coach.js",
  ];
  let code = "";
  for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  code += "globalThis.__out = { Engine, getQuestions, COURSES };";
  const ctx = {
    window: {},
    localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; } },
    document: { documentElement: {} },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.__out;
}

function freshStore() {
  return {
    progress: {},
    reviewPile: [],
    stats: { totalQ: 0, correctQ: 0, coursesDone: 0 },
    statsByCourse: {},
    statsByStreet: {},
    statsByLeak: {},
    daily: { lastDone: null, streakDays: 0, bestStreak: 0, history: {}, session: null },
  };
}

// 固定本地时间,避免时区/夏令时影响日期字符串
const DAY1 = new Date(2026, 0, 5, 12).getTime();
const DAY = 864e5;

/* —— 每日训练:组卷 —— */

test("buildDailySet is deterministic per date and has no duplicates", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const a = Engine.buildDailySet("2026-01-05").map((q) => q._courseId + "|" + q.id);
  const b = Engine.buildDailySet("2026-01-05").map((q) => q._courseId + "|" + q.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, 10);
  assert.equal(new Set(a).size, 10);
  const c = Engine.buildDailySet("2026-01-06").map((q) => q._courseId + "|" + q.id);
  assert.notDeepEqual(a, c);
});

test("buildDailySet puts due review items first with _rec attached", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => DAY1;
  Engine.store.reviewPile = [
    { courseId: "c2", qid: "c2-q1", box: 0, due: 0, wrong: 1, leak: "too_tight" },
    { courseId: "c3", qid: "c3-q1", box: 1, due: DAY1 + DAY, wrong: 1, leak: "cbet" }, // 未到期,不该进卷
  ];
  const set = Engine.buildDailySet("2026-01-05");
  assert.equal(set[0].id, "c2-q1");
  assert.ok(set[0]._rec);
  assert.ok(!set.some((q) => q.id === "c3-q1"));
});

test("buildDailySet favors weakest courses with enough sample", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.statsByCourse = {
    c5: { h: 20, c: 4 },   // 20% — 最弱
    c6: { h: 20, c: 18 },  // 90%
  };
  const set = Engine.buildDailySet("2026-01-05");
  assert.ok(set.filter((q) => q._courseId === "c5").length >= 2);
});

/* —— 每日训练:开始/续答/完成 —— */

test("startDaily builds session and finishDaily records streak", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine._now = () => DAY1;
  Engine.startDaily();
  assert.equal(Engine.dailyMode, true);
  assert.equal(Engine.screen, "drill");
  assert.equal(Engine.dailyQueue.length, 10);
  assert.equal(Engine.store.daily.session.qids.length, 10);
  // 模拟答完 10 题(7 对 3 错)
  Engine.answers = Engine.dailyQueue.map((q, i) => ({ qid: q.id, choice: "x", ok: i < 7 }));
  Engine.finishDaily();
  assert.equal(Engine.screen, "daily-over");
  assert.equal(Engine.dailyMode, false);
  assert.equal(Engine.store.daily.streakDays, 1);
  assert.equal(Engine.store.daily.lastDone, Engine._dateStrAt(DAY1));
  const h = Engine.store.daily.history[Engine._dateStrAt(DAY1)];
  assert.equal(h.c, 7);
  assert.equal(h.t, 10);
  assert.equal(Engine.store.daily.session, null);
});

test("daily streak increments on consecutive days and resets after a gap", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  const doDaily = (now) => {
    Engine._now = () => now;
    Engine.startDaily();
    Engine.answers = Engine.dailyQueue.map((q) => ({ qid: q.id, choice: "x", ok: true }));
    Engine.finishDaily();
  };
  doDaily(DAY1);
  assert.equal(Engine.store.daily.streakDays, 1);
  doDaily(DAY1 + DAY);
  assert.equal(Engine.store.daily.streakDays, 2);
  doDaily(DAY1 + 2 * DAY);
  assert.equal(Engine.store.daily.streakDays, 3);
  assert.equal(Engine.store.daily.bestStreak, 3);
  doDaily(DAY1 + 5 * DAY); // 跳 2 天 → 断签重置
  assert.equal(Engine.store.daily.streakDays, 1);
  assert.equal(Engine.store.daily.bestStreak, 3);
});

test("startDaily resumes today's session at the next unanswered question", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine._now = () => DAY1;
  Engine.startDaily();
  const qids = Engine.store.daily.session.qids.slice();
  // 答 3 题后"刷新"
  const q0 = Engine.dailyQueue[0];
  Engine.recordAnswer(q0, (q0.correct || [])[0], { ok: true });
  const q1 = Engine.dailyQueue[1];
  Engine.recordAnswer(q1, "x", { ok: false });
  const q2 = Engine.dailyQueue[2];
  Engine.recordAnswer(q2, (q2.correct || [])[0], { ok: true });
  Engine.dailyMode = false;
  Engine.dailyQueue = [];
  Engine.answers = [];
  Engine.startDaily();
  assert.equal(Engine.qIdx, 3);
  assert.deepEqual(Engine.store.daily.session.qids, qids); // 同一套题
  assert.equal(Engine.dailyQueue.length, 10);
});

test("dailyStatus reports doneToday and zeroes streak display after a gap", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine._now = () => DAY1;
  Engine.startDaily();
  Engine.answers = Engine.dailyQueue.map((q) => ({ qid: q.id, choice: "x", ok: true }));
  Engine.finishDaily();
  assert.equal(Engine.dailyStatus().doneToday, true);
  assert.equal(Engine.dailyStatus().streakDays, 1);
  Engine._now = () => DAY1 + DAY; // 第二天还没做:连续天数仍显示(可续)
  assert.equal(Engine.dailyStatus().doneToday, false);
  assert.equal(Engine.dailyStatus().streakDays, 1);
  Engine._now = () => DAY1 + 3 * DAY; // 断签 → 显示归零
  assert.equal(Engine.dailyStatus().streakDays, 0);
});

test("daily answers feed global stats and wrong ones enter the review pile", () => {
  const { Engine, getQuestions } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine._now = () => DAY1;
  Engine.startDaily();
  const q = Engine.dailyQueue.find((x) => !x._rec);
  Engine.recordAnswer(q, "x", { ok: false });
  assert.equal(Engine.store.stats.totalQ, 1);
  const rec = Engine.store.reviewPile.find((r) => r.qid === q.id && r.courseId === q._courseId);
  assert.ok(rec);
  assert.equal(rec.box, 0);
  assert.equal(rec.due, DAY1);
});

/* —— 连击计分 —— */

test("combo scoring: 10 base + streak bonus capped at +5, wrong resets combo", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine._now = () => DAY1;
  Engine.reviewMode = false;
  Engine.testMode = false;
  Engine.dailyMode = false;
  Engine.courseId = "c2";
  Engine._resetScore();
  const mk = (i) => ({ id: "c2-qx" + i, type: "action", correct: ["call"], leak: "cbet", spot: { street: "flop" }, _courseId: "c2" });
  // 连对 7 题:10+11+12+13+14+15+15 = 90(加成封顶 +5)
  for (let i = 0; i < 7; i++) Engine.recordAnswer(mk(i), "call", { ok: true });
  assert.equal(Engine.sessionScore, 90);
  assert.equal(Engine.maxCombo, 7);
  Engine.recordAnswer(mk(7), "fold", { ok: false }); // 答错:清连击,不加分
  assert.equal(Engine.combo, 0);
  assert.equal(Engine.sessionScore, 90);
  Engine.recordAnswer(mk(8), "call", { ok: true }); // 重新起步 = 10
  assert.equal(Engine.sessionScore, 100);
  assert.equal(Engine.maxCombo, 7);
});

test("statsByLeak tallies per-leak accuracy", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine.courseId = "c2";
  const q = { id: "c2-qy", type: "action", correct: ["call"], leak: "mdf", spot: { street: "turn" }, _courseId: "c2" };
  Engine.recordAnswer(q, "call", { ok: true });
  Engine.recordAnswer(q, "fold", { ok: false });
  assert.equal(Engine.store.statsByLeak.mdf.h, 2);
  assert.equal(Engine.store.statsByLeak.mdf.c, 1);
});

/* —— S/A/B/C 评级 —— */

test("gradeLetter thresholds: S=100%, A>=90%, B>=75%, C otherwise", () => {
  const { Engine } = loadEngine();
  assert.equal(Engine.gradeLetter(24, 24), "S");
  assert.equal(Engine.gradeLetter(22, 24), "A");
  assert.equal(Engine.gradeLetter(18, 24), "B");
  assert.equal(Engine.gradeLetter(17, 24), "C");
});

test("finishDrill stores best grade and session drillSummary", () => {
  const { Engine, getQuestions } = loadEngine();
  Engine.store = freshStore();
  Engine.save = function () {};
  Engine.courseId = "c2";
  const total = getQuestions("c2").length;
  // 第一次:全对 → S
  Engine.answers = Array.from({ length: total }, (_, i) => ({ qid: "q" + i, ok: true }));
  Engine.finishDrill();
  assert.equal(Engine.drillSummary.grade, "S");
  assert.equal(Engine.getProgress("c2").grade, "S");
  // 第二次:76% → B,但课程保留历史最佳 S
  Engine.answers = Array.from({ length: total }, (_, i) => ({ qid: "q" + i, ok: i < Math.ceil(total * 0.76) }));
  Engine.screen = "drill";
  Engine.finishDrill();
  assert.equal(Engine.drillSummary.grade, "B");
  assert.equal(Engine.getProgress("c2").grade, "S");
});
