/* engine-review.test.js — review mode + stats correctness */
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
  };
}

test("review wrong answer resets SRS box and makes record due now", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => 1000000;
  const rec = { courseId: "c2", qid: "c2-q1", choice: "fold", box: 2, due: 9999999, wrong: 2, leak: "too_tight" };
  Engine.store.reviewPile = [rec];
  Engine.reviewMode = true;
  Engine.courseId = "c2";
  const q = { id: "c2-q1", type: "action", correct: ["call"], leak: "too_tight", _courseId: "c2", _rec: rec };
  Engine.recordAnswer(q, "fold", { ok: false });
  assert.equal(rec.box, 0);
  assert.equal(rec.due, 1000000);
  assert.equal(rec.wrong, 3);
});

test("review mode does not increment drill stats", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const rec = { courseId: "c5", qid: "c5-q1", streak: 0, wrong: 1, leak: "cbet" };
  Engine.store.reviewPile = [rec];
  Engine.reviewMode = true;
  Engine.courseId = "c5";
  const q = { id: "c5-q1", type: "action", correct: ["bet"], spot: { street: "flop" }, _courseId: "c5", _rec: rec };
  Engine.recordAnswer(q, "check", { ok: false });
  assert.equal(Engine.store.stats.totalQ, 0);
  assert.equal(Engine.store.statsByCourse.c5, undefined);
  assert.equal(Engine.store.statsByStreet.flop, undefined);
});

test("drill stats use question course id in cross-course review queue", () => {
  const { Engine, getQuestions } = loadEngine();
  Engine.store = freshStore();
  Engine.reviewMode = false;
  Engine.courseId = "c2";
  const q9 = getQuestions("c9")[0];
  const q = Object.assign({}, q9, { _courseId: "c9" });
  Engine.recordAnswer(q, "check", { ok: true });
  assert.ok(Engine.store.statsByCourse.c9);
  assert.equal(Engine.store.statsByCourse.c2, undefined);
});

test("startReview matches missing leak as other", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [
    { courseId: "c3", qid: "c3-q1", wrong: 1, streak: 0, leak: "range_blind" },
    { courseId: "c4", qid: "c4-q1", wrong: 1, streak: 0 },
  ];
  Engine._migrateStore();
  Engine.startReview({ courseId: "c4", leak: "other" });
  assert.equal(Engine.reviewQueue.length, 1);
  assert.equal(Engine.reviewQueue[0].id, "c4-q1");
});

test("finishReviewSession shows summary and keeps reviewReturnTo", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.courseId = "c1";
  Engine.reviewMode = true;
  Engine.reviewReturnTo = "stats";
  Engine.answers = [
    { qid: "c2-q1", ok: true },
    { qid: "c2-q2", ok: false },
    { qid: "c2-q3", ok: true },
  ];
  Engine.reviewSessionMastered = 1;
  Engine.finishReviewSession();
  assert.equal(Engine.getProgress("c1").completed, false);
  assert.equal(Engine.screen, "review-over");
  assert.equal(Engine.reviewReturnTo, "stats");
  assert.equal(Engine.reviewSummary.correct, 2);
  assert.equal(Engine.reviewSummary.total, 3);
  assert.equal(Engine.reviewSummary.pct, 67);
  assert.equal(Engine.reviewSummary.mastered, 1);
  Engine.exitReviewFlow();
  assert.equal(Engine.screen, "stats");
  assert.equal(Engine.reviewSummary, null);
});

test("onReviewCorrect advances SRS box and schedules next due", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => 1000000;
  const rec = { courseId: "c2", qid: "c2-q1", box: 0, due: 0, wrong: 1 };
  Engine.store.reviewPile = [rec];
  Engine.reviewSessionMastered = 0;
  Engine.onReviewCorrect(rec);
  assert.equal(rec.box, 1);
  assert.equal(rec.due, 1000000 + 1 * 864e5); // 盒 1 → +1 天
  assert.equal(Engine.store.reviewPile.length, 1);
  Engine.onReviewCorrect(rec);
  assert.equal(rec.box, 2);
  assert.equal(rec.due, 1000000 + 3 * 864e5); // 盒 2 → +3 天
});

test("onReviewCorrect graduates record at final box (mastered)", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => 1000000;
  const rec = { courseId: "c2", qid: "c2-q1", box: 3, due: 0, wrong: 1 };
  Engine.store.reviewPile = [rec];
  Engine.reviewSessionMastered = 0;
  Engine.onReviewCorrect(rec);
  assert.equal(Engine.store.reviewPile.length, 0);
  assert.equal(Engine.reviewSessionMastered, 1);
});

test("startReview with no filter only queues due records", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => 1000000;
  Engine.store.reviewPile = [
    { courseId: "c2", qid: "c2-q1", box: 0, due: 0, wrong: 1, leak: "too_tight" },       // 到期
    { courseId: "c3", qid: "c3-q1", box: 1, due: 9999999, wrong: 1, leak: "cbet" },      // 未到期
  ];
  Engine.screen = "courses";
  Engine.startReview();
  assert.equal(Engine.reviewQueue.length, 1);
  assert.equal(Engine.reviewQueue[0].id, "c2-q1");
});

test("startReview with all:true ignores due scheduling", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => 1000000;
  Engine.store.reviewPile = [
    { courseId: "c2", qid: "c2-q1", box: 0, due: 0, wrong: 1, leak: "too_tight" },
    { courseId: "c3", qid: "c3-q1", box: 1, due: 9999999, wrong: 1, leak: "cbet" },
  ];
  Engine.screen = "courses";
  Engine.startReview({ all: true });
  assert.equal(Engine.reviewQueue.length, 2);
});

test("startReview defensively clears test mode (drill-leak from placement feedback)", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.testMode = true;
  Engine.testQueue = [{ id: "x" }];
  Engine.store.reviewPile = [{ courseId: "c2", qid: "c2-q1", box: 0, due: 0, wrong: 1, leak: "too_tight" }];
  Engine.screen = "courses";
  Engine.startReview({ leak: "too_tight" });
  assert.equal(Engine.testMode, false);
  assert.equal(Engine.testQueue.length, 0);
  assert.equal(Engine.reviewMode, true);
  assert.equal(Engine.currentQuestions()[0].id, "c2-q1"); // 不再被 testQueue 劫持
});

test("dueReviewCount and nextDueAt reflect scheduling", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine._now = () => 1000000;
  Engine.store.reviewPile = [
    { courseId: "c2", qid: "c2-q1", box: 0, due: 500, wrong: 1 },
    { courseId: "c3", qid: "c3-q1", box: 1, due: 2000000, wrong: 1 },
    { courseId: "c4", qid: "c4-q1", box: 2, due: 3000000, wrong: 1 },
  ];
  assert.equal(Engine.dueReviewCount(), 1);
  assert.equal(Engine.nextDueAt(), 2000000);
});

test("startReview returns to review screen when launched from review", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [{ courseId: "c2", qid: "c2-q1", wrong: 1, streak: 0, leak: "too_tight" }];
  Engine.screen = "review";
  Engine.startReview({ courseId: "c2" });
  assert.equal(Engine.reviewReturnTo, "review");
  assert.equal(Engine.reviewMode, true);
});

test("startReview empty filter keeps reviewReturnTo for review-empty back", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [{ courseId: "c2", qid: "c2-q1", wrong: 1, streak: 0, leak: "too_tight" }];
  Engine.screen = "stats";
  Engine.startReview({ courseId: "c99" });
  assert.equal(Engine.screen, "review-empty");
  assert.equal(Engine.reviewReturnTo, "stats");
  assert.equal(Engine.reviewMode, false);
});

test("exitReviewFlow returns to reviewReturnTo from review-empty", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.screen = "review-empty";
  Engine.reviewReturnTo = "stats";
  Engine.reviewFilter = { courseId: "c1" };
  Engine.exitReviewFlow();
  assert.equal(Engine.screen, "stats");
  assert.equal(Engine.reviewReturnTo, null);
  assert.equal(Engine.reviewFilter, null);
});

test("exitReviewFlow returns to review when cancelled mid review drill", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.reviewMode = true;
  Engine.screen = "drill";
  Engine.reviewReturnTo = "review";
  Engine.reviewQueue = [{}];
  Engine.exitReviewFlow();
  assert.equal(Engine.screen, "review");
  assert.equal(Engine.reviewMode, false);
  assert.equal(Engine.reviewQueue.length, 0);
});

test("removeFromPile removes matching record", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const rec = { courseId: "c2", qid: "c2-q1", wrong: 1 };
  Engine.store.reviewPile = [rec, { courseId: "c5", qid: "c5-q1", wrong: 1 }];
  Engine.removeFromPile(rec);
  assert.equal(Engine.store.reviewPile.length, 1);
  assert.equal(Engine.store.reviewPile[0].courseId, "c5");
});

test("_migrateStore removes old c1 course data (c1 is now the placement test)", () => {
  const { Engine } = loadEngine();
  Engine.store = {
    progress: { c1: { qDone: 8, total: 8, completed: true }, c5: { qDone: 2 } },
    reviewPile: [{ courseId: "c1", qid: "c1-q4", leak: "too_tight" }, { courseId: "c5", qid: "c5-q2", leak: "too_loose" }],
    stats: { totalQ: 10, correctQ: 5, coursesDone: 1, coursesDoneList: ["c1", "c5"] },
    statsByCourse: { c1: { h: 8, c: 4 }, c5: { h: 2, c: 1 } },
    statsByStreet: {},
  };
  Engine.save = function () {};
  Engine._migrateStore();
  assert.equal(Engine.store.progress.c1, undefined);
  assert.equal(Engine.store.statsByCourse.c1, undefined);
  assert.equal(Engine.store.reviewPile.filter((r) => r.courseId === "c1").length, 0);
  assert.ok(!Engine.store.stats.coursesDoneList.includes("c1"));
});

test("_migrateStore upgrades legacy streak records to SRS box/due", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [
    { courseId: "c2", qid: "c2-q1", streak: 1, wrong: 2, leak: "too_tight" },
    { courseId: "c3", qid: "c3-q1", streak: 0, wrong: 1, leak: "cbet" },
  ];
  Engine.save = function () {};
  Engine._migrateStore();
  const [a, b] = Engine.store.reviewPile;
  assert.equal(a.box, 1);
  assert.equal(a.due, 0); // 迁移后全部立即到期
  assert.equal(a.streak, undefined);
  assert.equal(b.box, 0);
  assert.ok(Engine.store.daily);
  assert.ok(Engine.store.statsByLeak);
});

test("_migrateStore backfills statsByCourse from completed progress", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.progress.c5 = { learnDone: true, qDone: 24, correct: 18, total: 24, completed: true };
  Engine._migrateStore();
  assert.equal(Engine.store.statsByCourse.c5.h, 24);
  assert.equal(Engine.store.statsByCourse.c5.c, 18);
});
