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
