const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadScripts(extra) {
  const files = [
    "js/i18n.js",
    "data/solved-spots.js",
    "js/courses.js",
    "js/content.js",
    "js/content-ext.js",
    "js/table.js",
    "js/engine.js",
  ];
  let code = "";
  for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  if (extra) code += extra;
  const ctx = { window: {}, localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; } }, document: {}, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx;
}

test("30 courses defined", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES, LEARN, QUESTIONS };");
  assert.equal(ctx.__out.COURSES.length, 30);
});

test("each non-placement course has 4 learn slides and expected drill count", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES, LEARN, QUESTIONS, getLearn, getQuestions, courseDrillCount };");
  for (const c of ctx.__out.COURSES) {
    if (c.placement) {
      assert.equal(ctx.__out.getQuestions(c.id).length, 0, c.id + " placement has no drill questions");
      continue;
    }
    const slides = ctx.__out.getLearn(c.id);
    assert.equal(slides.length, 4, c.id + " learn");
    assert.equal(slides[slides.length - 1].summary, true, c.id + " last slide is summary");
    assert.equal(ctx.__out.getQuestions(c.id).length, ctx.__out.courseDrillCount(c), c.id + " questions");
  }
});

test("c1 is the placement test, c2 has 27 drill questions", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES, getQuestions };");
  const c1 = ctx.__out.COURSES.find((c) => c.id === "c1");
  assert.equal(c1.placement, true);
  assert.equal(ctx.__out.getQuestions("c1").length, 0);
  assert.equal(ctx.__out.getQuestions("c2").length, 27);
});

test("free/Pro split: c1–c12 free, c13–c30 Pro (App 内锁;web 经 isProUnlocked 恒解锁)", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES };");
  for (const c of ctx.__out.COURSES) {
    assert.equal(c.free, c.order <= 12, c.id + " free flag");
  }
});

test("solver spots present", () => {
  const ctx = loadScripts("globalThis.__out = { SOLVED_SPOTS };");
  assert.ok(ctx.__out.SOLVED_SPOTS.length >= 4);
});
