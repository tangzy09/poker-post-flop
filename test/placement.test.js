const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");

function load() {
  const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js", "js/coach.js"];
  let code = ""; for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  code += "globalThis.__out = { Engine, getQuestions, PLACEMENT_SPEC };";
  const ctx = { window: {}, localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; } }, document: { documentElement: {} }, console };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(code, ctx);
  return ctx.__out;
}

test("PLACEMENT_SPEC has 20 valid, single-answer action questions, 4 per action", () => {
  const { getQuestions, PLACEMENT_SPEC } = load();
  assert.equal(PLACEMENT_SPEC.length, 20);
  const byCourse = {};
  for (let i = 1; i <= 30; i++) for (const q of getQuestions("c" + i)) byCourse[q.id] = q;
  const actCount = {};
  for (const spec of PLACEMENT_SPEC) {
    const q = byCourse[spec.qid];
    assert.ok(q, spec.qid + " exists");
    assert.equal(q.type, "action", spec.qid + " is action");
    assert.equal((q.correct || []).length, 1, spec.qid + " single answer");
    assert.ok(spec.theme && spec.courseId, spec.qid + " has theme+courseId");
    actCount[q.correct[0]] = (actCount[q.correct[0]] || 0) + 1;
  }
  for (const a of ["fold", "check", "call", "bet", "raise"]) assert.equal(actCount[a], 4, a + " count");
});

test("startPlacementTest builds a 20-question test queue without polluting stats", () => {
  const { Engine } = load();
  Engine.store = { progress: {}, reviewPile: [], stats: { totalQ: 0, correctQ: 0, coursesDone: 0 }, statsByCourse: {}, statsByStreet: {}, placement: null };
  Engine.save = function () {};
  Engine.startPlacementTest(() => 0.5);
  assert.equal(Engine.testMode, true);
  assert.equal(Engine.testQueue.length, 20);
  assert.equal(Engine.screen, "drill");
  assert.equal(Engine.currentQuestions().length, 20);
  assert.ok(Engine.testQueue[0]._courseId && Engine.testQueue[0]._theme);
  const q = Engine.currentQuestions()[0];
  Engine.recordAnswer(q, (q.correct || ["fold"])[0], { ok: true });
  assert.equal(Engine.store.stats.totalQ, 0, "totalQ untouched in testMode");
  assert.equal(Engine.testResults.length, 1, "testResults recorded");
});

test("finishPlacementTest aggregates score, themes, leaks and builds placement record", () => {
  const { Engine } = load();
  Engine.store = { progress: {}, reviewPile: [], stats: { totalQ: 0, correctQ: 0, coursesDone: 0 }, statsByCourse: {}, statsByStreet: {}, placement: null };
  Engine.save = function () {};
  Engine.startPlacementTest(() => 0);
  for (const q of Engine.currentQuestions()) {
    const right = (q.correct || ["fold"])[0];
    const choice = q._theme === "advanced" ? otherAction(right) : right;
    Engine.recordAnswer(q, choice, { ok: choice === right });
  }
  Engine.finishPlacementTest(1234);
  const p = Engine.store.placement;
  assert.equal(p.total, 20);
  assert.equal(p.score, 16);
  assert.equal(p.byTheme.advanced.c, 0);
  assert.equal(p.byTheme.advanced.h, 4);
  assert.equal(p.weakestTheme, "advanced");
  assert.equal(p.startCourse, "c13");
  assert.equal(Engine.screen, "placement-result");
  assert.ok(Array.isArray(p.history) && p.history.length === 1);
});

function otherAction(a) { return a === "fold" ? "call" : "fold"; }

test("migration clears old c1 course data; pseudo-store reflects test results", () => {
  const { Engine } = load();
  Engine.store = {
    progress: { c1: { qDone: 8, completed: true, total: 8 }, c5: { qDone: 2 } },
    reviewPile: [{ courseId: "c1", qid: "c1-q4", leak: "too_tight" }, { courseId: "c5", qid: "c5-q1", leak: "too_loose" }],
    stats: { totalQ: 10, correctQ: 5, coursesDone: 1, coursesDoneList: ["c1", "c5"] },
    statsByCourse: { c1: { h: 8, c: 4 }, c5: { h: 2, c: 1 } },
    statsByStreet: {},
  };
  Engine.save = function () {};
  Engine._migrateStore();
  assert.equal(Engine.store.progress.c1, undefined, "c1 progress removed");
  assert.equal(Engine.store.statsByCourse.c1, undefined, "c1 stats removed");
  assert.equal(Engine.store.reviewPile.find((r) => r.courseId === "c1"), undefined, "c1 review removed");
  assert.ok(!Engine.store.stats.coursesDoneList.includes("c1"), "c1 not in doneList");

  const ps = Engine.placementPseudoStore([
    { qid: "c3-q1", courseId: "c3", theme: "flop", choice: "check", ok: false, leak: "too_tight", street: "flop" },
    { qid: "c3-q2", courseId: "c3", theme: "flop", choice: "check", ok: true, leak: "other", street: "flop" },
  ]);
  assert.equal(ps.statsByCourse.c3.h, 2);
  assert.equal(ps.statsByCourse.c3.c, 1);
  assert.equal(ps.statsByStreet.flop.h, 2);
  assert.equal(ps.reviewPile.length, 1, "only wrong answers in pseudo reviewPile");
  assert.equal(ps.reviewPile[0].qid, "c3-q1");
});
