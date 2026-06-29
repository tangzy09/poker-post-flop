# 初始测试 + C1 合并入 C2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把第一课改造成"初始测试"(固定 20 题基准卷、即时反馈、详版评价),并把原 C1 的底池赔率/MDF 概念合并进 C2。

**Architecture:** 纯静态全局作用域 JS(无构建)。新增引擎 `testMode`(仿现有 `reviewMode`)跑一条固定题队列,复用 drill→feedback 渲染做即时反馈;评价页用从 `testResults` 现场构造的"伪 store"喂给现有 coach 卡片函数。C1 的 learn 概念并入 C2,3 道计算题挂到 C2 drill 最前。

**Tech Stack:** 原生 JS、`node:test` + `vm`(测试)、localStorage 持久化。

设计依据:`docs/superpowers/specs/2026-06-30-placement-test-design.md`。

**通用约定:**
- 本地跑测试:`npm test`;跑题库审计:`npm run audit`。
- 改 `js/`、`scripts/`、`test/` 后必跑 `npm test`。
- 所有面向用户字符串必须双语,用 `_r(key, en, zh)`(content.js)或 `reg(key, en, zh)`(i18n.js)。
- 提交信息以 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` 结尾。

---

## Task 1: courses.js — c1 标记为测试、c2 吸收概念

**Files:**
- Modify: `js/courses.js:3-4`
- Test: `test/curriculum.test.js`

- [ ] **Step 1: 更新课程元数据**

把 `js/courses.js` 第 3-4 行(c1、c2 定义)改为:

```js
  { id: "c1", order: 1, free: true, placement: true, drillCount: 0, titleKey: "c1.title", subKey: "c1.sub", concepts: [] },
  { id: "c2", order: 2, free: true, drillCount: 27, titleKey: "c2.title", subKey: "c2.sub", concepts: ["pot_odds", "mdf", "implied_odds", "reverse_implied"] },
```

- [ ] **Step 2: 更新 curriculum 测试以容纳测试课**

`test/curriculum.test.js` 的 "each course has 4 learn slides ... and expected drill count" 测试会对 c1 失败(c1 现在 0 题、无 learn)。把该 test(第 34-42 行)替换为:

```js
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
```

- [ ] **Step 3: 跑测试(预期失败)**

Run: `node --test test/curriculum.test.js`
Expected: FAIL — c2 还是 24 题、c1 仍有 8 题(Task 2 才改内容)。这是预期的,Task 2 完成后转绿。

- [ ] **Step 4: 提交**

```bash
git add js/courses.js test/curriculum.test.js
git commit -m "feat(courses): mark c1 as placement, c2 absorbs pot-odds/mdf concepts"
```

---

## Task 2: content.js — C2 learn 重组、3 道计算题挂 C2、清空 C1 题

**Files:**
- Modify: `js/content.js`(registerContentStrings 内 c2 learn 文案;LEARN.c1/c2;QUESTIONS.c1/c2)
- Test: `test/curriculum.test.js`(Task 1 已写好断言)

- [ ] **Step 1: 重写 C2 的 learn 文案**

在 `js/content.js` 的 `registerContentStrings()` 里,找到 c2 的 learn `_r` 注册(`_r("c2.l1.t", ...)` 等),替换为整合后的 4 页文案。同时新增 c2 标题/副标题:

```js
  _r("c2.title", "Pot Odds, MDF & Implied Odds", "底池赔率、MDF 与隐含赔率");
  _r("c2.sub", "Foundations of profitable defense", "盈利防守的基础");
  _r("c2.l1.t", "What are pot odds?", "什么是底池赔率？");
  _r("c2.l1.b", "Pot odds compare the <b>cost of a call</b> to the <b>total pot you can win</b>. If the pot is 100 and you must call 50, you are getting 150:50 = <b>3:1</b>. You need to win more than 25% of the time for a call to break even.", "底池赔率比较<b>跟注成本</b>与<b>可赢总底池</b>。底池 100、跟注 50，赔率为 150:50 = <b>3:1</b>。盈亏平衡需胜率 > 25%。");
  _r("c2.l2.t", "Minimum Defense Frequency (MDF)", "最小防守频率 MDF");
  _r("c2.l2.b", "Facing a bet, MDF is the <b>minimum fraction of your range</b> that must continue so villain can't profit by betting any two cards: <b>MDF = 1 − bet/(pot+bet)</b>. Vs a pot bet: 50%. It's a <b>range</b> rule — a single hand may fold or call, but on average you must hit MDF.", "面对下注时，MDF 是你范围中<b>必须继续的最低比例</b>，防止对手任意两张牌盈利：<b>MDF = 1 − 下注/(底池+下注)</b>。面对底池下注：50%。这是<b>范围</b>概念 — 单手牌可弃可跟，但整体平均必须达到 MDF。");
  _r("c2.l3.t", "Implied & reverse implied odds", "隐含与反向隐含赔率");
  _r("c2.l3.b", "<b>Implied odds</b> add the chips you expect to win <b>after</b> hitting — a call short on direct odds can still be right if you stack villain later. <b>Reverse implied odds</b> are the chips you lose when you hit but stay dominated (small flush vs big flush). Implied odds matter most <b>deep, on draw-heavy boards, vs players who pay off</b>.", "<b>隐含赔率</b>加上命中<b>之后</b>预期多赢的筹码 — 即使直接赔率不够，若能赢光对手，跟注仍可能正确。<b>反向隐含赔率</b>是命中但仍被压制（小同花 vs 大同花）时多输的筹码。隐含赔率在<b>深筹、听牌面、愿付钱的对手</b>时最重要。");
  _r("c2.sum.t", "Key takeaways", "本课小结");
  _r("c2.sum.b", "• Pot odds = call cost vs final pot; break-even equity = call/(pot+call).<br>• MDF = 1 − bet/(pot+bet) — defend your <b>range</b> so bluffs can't auto-profit.<br>• Implied odds reward draws that win more later; reverse implied odds punish dominated hands.", "• 底池赔率 = 跟注成本 vs 最终底池；盈亏平衡胜率 = 跟注/(底池+跟注)。<br>• MDF = 1 − 下注/(底池+下注) — 按<b>范围</b>防守，使诈唬无法自动盈利。<br>• 隐含赔率奖励能赢更多的听牌；反向隐含赔率惩罚被压制的牌。");
```

注:原 c2.l1/l2/l3 文案(隐含/反向/何时)被上面覆盖;原 c1.l* 文案保留无害(不再被引用),不必删。c1.q1/q2/q3 的文案**必须保留**(下面计算题要用)。

- [ ] **Step 2: 让 LEARN.c1 为空、LEARN.c2 用新页**

`js/content.js` 第 536-548 行,把 `LEARN` 的 c1、c2 改为:

```js
const LEARN = {
  c1: [],
  c2: [
    { titleKey: "c2.l1.t", bodyKey: "c2.l1.b" },
    { titleKey: "c2.l2.t", bodyKey: "c2.l2.b" },
    { titleKey: "c2.l3.t", bodyKey: "c2.l3.b" },
    { titleKey: "c2.sum.t", bodyKey: "c2.sum.b", summary: true },
  ],
```

(c2 的 4 个 titleKey/bodyKey 不变,但现在指向 Step 1 重写后的文案。)

- [ ] **Step 3: 清空 QUESTIONS.c1,把 3 道计算题挂到 C2 最前**

`js/content.js` 第 691-743 行的 `c1: [ ... ]`(8 道题)替换为空数组,并把原 c1-q1/q2/q3 三道计算题重命名挂到 c2 前面。

把 `c1: [ ...8 题... ],` 整段替换为:

```js
  c1: [],

  c2: [
    _choice("c2-q1c", "c1.q1.s", [
      { id: "a", labelKey: "c1.q1.a" },
      { id: "b", labelKey: "c1.q1.b" },
      { id: "c", labelKey: "c1.q1.c" },
      { id: "d", labelKey: "c1.q1.d" },
    ], "a", "conceptual", "concept_gap", "c1.q1.fb.b"),
    _choice("c2-q2c", "c1.q2.s", [
      { id: "a", labelKey: "c1.q2.a" },
      { id: "b", labelKey: "c1.q2.b" },
      { id: "c", labelKey: "c1.q2.c" },
      { id: "d", labelKey: "c1.q2.d" },
    ], "a", "conceptual", "concept_gap", "c1.q2.fb.b"),
    _choice("c2-q3c", "c1.q3.s", [
      { id: "a", labelKey: "c1.q3.a" },
      { id: "b", labelKey: "c1.q3.b" },
      { id: "c", labelKey: "c1.q3.c" },
      { id: "d", labelKey: "c1.q3.d" },
    ], "a", "conceptual", "sizing", "c1.q3.fb.a"),
    ...buildSpots("c2", "concept.implied", [
```

并把原来 `c2: buildSpots("c2", "concept.implied", [` 这一行(第 745 行)删掉(已被上面合并)。文件里 c2 的 `buildSpots(...)` 调用的结尾 `]),` 之后需要再加一个 `]` 来闭合新的 `c2: [ ... ]` 外层数组。

> 实现提示:原结构是 `c2: buildSpots("c2", ..., [ /*specs*/ ]),`。新结构是 `c2: [ _choice×3, ...buildSpots("c2", ..., [ /*specs*/ ]) ],`。即在 specs 数组的闭合 `])` 后面、原本的逗号前,补一个 `]` 闭合外层 `c2: [`。务必用编辑器括号配对确认。

- [ ] **Step 4: 重新生成 content-ext(无关 c1/c2,但保持流程)与跑测试**

Run: `node --test test/curriculum.test.js`
Expected: PASS — c1=0 题、c2=27 题、c2 有 4 learn 页且末页是 summary。

- [ ] **Step 5: 跑全量审计确认题库自洽**

Run: `npm run audit`
Expected: 题库总数变为 483(488 − 原 c1 的 5 道弃用题;3 道计算题现挂 c2),无结构/数学错误。
若审计脚本硬编码了 488 或 c1=8,见 Task 8 先行修正后再跑;此处只需确认无"重复牌/牌面描述"类错误。

- [ ] **Step 6: 提交**

```bash
git add js/content.js
git commit -m "feat(content): merge pot-odds/MDF into C2, move 3 calc questions to C2, empty C1"
```

---

## Task 3: engine.js — PLACEMENT_SPEC 与 testMode 跑题

**Files:**
- Modify: `js/engine.js`(顶部加常量;Engine 对象加状态与方法;`currentQuestions`/`recordAnswer` 加分支)
- Test: `test/placement.test.js`(新建)

- [ ] **Step 1: 写失败测试 — 基准卷规格正确**

新建 `test/placement.test.js`:

```js
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
```

- [ ] **Step 2: 跑测试(预期失败)**

Run: `node --test test/placement.test.js`
Expected: FAIL — `PLACEMENT_SPEC is not defined`。

- [ ] **Step 3: 加 PLACEMENT_SPEC 常量**

在 `js/engine.js` 顶部(`const STORE_KEY` 附近)加:

```js
const PLACEMENT_SPEC = [
  { theme: "flop", courseId: "c3", qid: "c3-q1" },
  { theme: "flop", courseId: "c3", qid: "c3-q2" },
  { theme: "flop", courseId: "c6", qid: "c6-q1" },
  { theme: "flop", courseId: "c6", qid: "c6-q3" },
  { theme: "odds", courseId: "c2", qid: "c2-q24" },
  { theme: "odds", courseId: "c7", qid: "c7-q1" },
  { theme: "odds", courseId: "c7", qid: "c7-q3" },
  { theme: "odds", courseId: "c2", qid: "c2-q4" },
  { theme: "turn", courseId: "c9", qid: "c9-q1" },
  { theme: "turn", courseId: "c9", qid: "c9-q2" },
  { theme: "turn", courseId: "c11", qid: "c11-q1" },
  { theme: "turn", courseId: "c18", qid: "c18-q3" },
  { theme: "river", courseId: "c10", qid: "c10-q3" },
  { theme: "river", courseId: "c10", qid: "c10-q5" },
  { theme: "river", courseId: "c10", qid: "c10-q6" },
  { theme: "river", courseId: "c24", qid: "c24-q12" },
  { theme: "advanced", courseId: "c20", qid: "c20-q1" },
  { theme: "advanced", courseId: "c25", qid: "c25-q1" },
  { theme: "advanced", courseId: "c12", qid: "c12-q2" },
  { theme: "advanced", courseId: "c23", qid: "c23-q1" },
];
```

(theme 用稳定的英文 key;界面显示名在 i18n,见 Task 7。主题→入门课映射:flop→c3、odds→c2、turn→c9、river→c10、advanced→c13,见 Task 5。)

并在文件末尾的导出/全局暴露处确保 `PLACEMENT_SPEC` 可被测试取到(本项目脚本是全局作用域,顶层 `const` 即为 vm 上下文全局,无需额外 export)。

- [ ] **Step 4: 跑测试(预期通过)**

Run: `node --test test/placement.test.js`
Expected: PASS。

- [ ] **Step 5: 写失败测试 — startPlacementTest 建 20 题队列、即时反馈、隔离统计**

在 `test/placement.test.js` 追加:

```js
test("startPlacementTest builds a 20-question test queue without polluting stats", () => {
  const { Engine } = load();
  Engine.store = { progress: {}, reviewPile: [], stats: { totalQ: 0, correctQ: 0, coursesDone: 0 }, statsByCourse: {}, statsByStreet: {}, placement: null };
  Engine.save = function () {};
  Engine.startPlacementTest(() => 0.5); // 注入确定性 rng
  assert.equal(Engine.testMode, true);
  assert.equal(Engine.testQueue.length, 20);
  assert.equal(Engine.screen, "drill");
  assert.equal(Engine.currentQuestions().length, 20);
  // 每题带来源标记
  assert.ok(Engine.testQueue[0]._courseId && Engine.testQueue[0]._theme);
  // 答一题不污染正式统计
  const q = Engine.currentQuestions()[0];
  Engine.recordAnswer(q, (q.correct || ["fold"])[0], { ok: true });
  assert.equal(Engine.store.stats.totalQ, 0, "totalQ untouched in testMode");
  assert.equal(Engine.testResults.length, 1, "testResults recorded");
});
```

- [ ] **Step 6: 跑测试(预期失败)**

Run: `node --test test/placement.test.js`
Expected: FAIL — `Engine.startPlacementTest is not a function`。

- [ ] **Step 7: 实现 testMode 状态、startPlacementTest、shuffle、currentQuestions/recordAnswer 分支**

在 `js/engine.js` 的 `Engine` 对象里:

(a) 顶部状态字段(与 `reviewMode: false` 并列)加:
```js
  testMode: false,
  testQueue: [],
  testResults: [],
```

(b) `currentQuestions()`(第 117-120 行)改为:
```js
  currentQuestions() {
    if (this.testMode) return this.testQueue;
    if (this.reviewMode) return this.reviewQueue;
    return getQuestions(this.courseId);
  },
```

(c) `recordAnswer()`(第 138 行起)在 `this.answers.push(...)` 之后、统计写入之前,加 testMode 收集 + 隔离。把开头改为:
```js
  recordAnswer(question, choice, result) {
    this.answers.push({ qid: question.id, choice, ok: result.ok });
    const cid = this.questionCourseId(question);

    if (this.testMode) {
      this.testResults.push({
        qid: question.id, courseId: question._courseId || cid, theme: question._theme,
        choice, ok: result.ok,
        leak: normalizeLeak(question.leak), street: question.spot?.street || "flop",
      });
      this.save();
      return; // 不写正式统计、不进 reviewPile
    }

    if (!this.reviewMode) {
```
(其余 recordAnswer 主体不变。)

(d) 新增方法(放在 `startReview` 附近):
```js
  startPlacementTest(rng) {
    const rand = rng || Math.random;
    const queue = PLACEMENT_SPEC.map((s) => {
      const q = getQuestions(s.courseId).find((x) => x.id === s.qid);
      return q ? Object.assign({}, q, { _courseId: s.courseId, _theme: s.theme }) : null;
    }).filter(Boolean);
    // Fisher–Yates 打乱出现顺序
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    this.testQueue = queue;
    this.testResults = [];
    this.testMode = true;
    this.reviewMode = false;
    this.courseId = "c1";
    this.qIdx = 0;
    this.answers = [];
    this.screen = "drill";
    this.save();
  },
```

- [ ] **Step 8: 跑测试(预期通过)**

Run: `node --test test/placement.test.js`
Expected: PASS（两个 test 都过）。

- [ ] **Step 9: 跑全量测试确认未回归**

Run: `npm test`
Expected: 全绿(除 Task 8 待修的题数基线外;若 audit 相关测试红,Task 8 处理)。

- [ ] **Step 10: 提交**

```bash
git add js/engine.js test/placement.test.js
git commit -m "feat(engine): add placement testMode with shuffled 20-Q baseline queue"
```

---

## Task 4: engine.js — 评价聚合 finishPlacementTest

**Files:**
- Modify: `js/engine.js`(新增 `finishPlacementTest`、评价聚合、伪 store 构造)
- Test: `test/placement.test.js`

- [ ] **Step 1: 写失败测试 — 评价聚合正确**

在 `test/placement.test.js` 追加:

```js
test("finishPlacementTest aggregates score, themes, leaks and builds placement record", () => {
  const { Engine } = load();
  Engine.store = { progress: {}, reviewPile: [], stats: { totalQ: 0, correctQ: 0, coursesDone: 0 }, statsByCourse: {}, statsByStreet: {}, placement: null };
  Engine.save = function () {};
  Engine.startPlacementTest(() => 0); // 不打乱
  for (const q of Engine.currentQuestions()) {
    const right = (q.correct || ["fold"])[0];
    // 故意答错全部 "advanced" 主题题,其余答对
    const choice = q._theme === "advanced" ? otherAction(right) : right;
    Engine.recordAnswer(q, choice, { ok: choice === right });
  }
  Engine.finishPlacementTest(1234);
  const p = Engine.store.placement;
  assert.equal(p.total, 20);
  assert.equal(p.score, 16);                 // 4 道 advanced 全错
  assert.equal(p.byTheme.advanced.c, 0);
  assert.equal(p.byTheme.advanced.h, 4);
  assert.equal(p.weakestTheme, "advanced");
  assert.equal(p.startCourse, "c13");        // advanced 的入门课
  assert.equal(Engine.screen, "placement-result");
  assert.ok(Array.isArray(p.history) && p.history.length === 1);
});

function otherAction(a) { return a === "fold" ? "call" : "fold"; }
```

- [ ] **Step 2: 跑测试(预期失败)**

Run: `node --test test/placement.test.js`
Expected: FAIL — `Engine.finishPlacementTest is not a function`。

- [ ] **Step 3: 实现 finishPlacementTest + 主题→入门课映射**

在 `js/engine.js` 加:

```js
  _placementStartCourse: { flop: "c3", odds: "c2", turn: "c9", river: "c10", advanced: "c13" },

  finishPlacementTest(takenAt) {
    const res = this.testResults;
    const total = res.length;
    const score = res.filter((r) => r.ok).length;
    const byTheme = {}, byStreet = {}, byLeak = {};
    for (const r of res) {
      (byTheme[r.theme] = byTheme[r.theme] || { h: 0, c: 0 }).h++;
      if (r.ok) byTheme[r.theme].c++;
      (byStreet[r.street] = byStreet[r.street] || { h: 0, c: 0 }).h++;
      if (r.ok) byStreet[r.street].c++;
      if (!r.ok) byLeak[r.leak] = (byLeak[r.leak] || 0) + 1;
    }
    // 最弱主题 = 正确率最低(并列取错题多者)
    let weakestTheme = null, worst = 2;
    for (const t of Object.keys(byTheme)) {
      const acc = byTheme[t].c / byTheme[t].h;
      if (acc < worst) { worst = acc; weakestTheme = t; }
    }
    const prev = (this.store.placement && this.store.placement.history) || [];
    this.store.placement = {
      takenAt: takenAt || 0,
      score, total,
      byTheme, byStreet, byLeak,
      weakestTheme,
      startCourse: this._placementStartCourse[weakestTheme] || "c2",
      results: res.slice(),
      history: prev.concat([{ takenAt: takenAt || 0, score }]),
    };
    this.testMode = false;
    this.testQueue = [];
    this.screen = "placement-result";
    this.save();
  },
```

- [ ] **Step 4: 跑测试(预期通过)**

Run: `node --test test/placement.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add js/engine.js test/placement.test.js
git commit -m "feat(engine): finishPlacementTest aggregates themes/leaks and recommends start course"
```

---

## Task 5: engine.js — 迁移与伪 store 构造

**Files:**
- Modify: `js/engine.js`(`_migrateStore` 扩展;`_defaultStore` 加字段;新增 `placementPseudoStore`)
- Test: `test/placement.test.js`

- [ ] **Step 1: 写失败测试 — 迁移清理 c1、伪 store 形态正确**

在 `test/placement.test.js` 追加:

```js
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

  // 伪 store
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
```

- [ ] **Step 2: 跑测试(预期失败)**

Run: `node --test test/placement.test.js`
Expected: FAIL — c1 数据未清理 / `placementPseudoStore` 未定义。

- [ ] **Step 3: 扩展 _migrateStore、_defaultStore,新增 placementPseudoStore**

(a) 在 `_migrateStore()` 末尾(`return` 前)加 c1 清理与新字段默认:
```js
    // c1 改造为初始测试:清理旧的 c1 答题课数据
    delete this.store.progress.c1;
    delete this.store.statsByCourse.c1;
    this.store.reviewPile = (this.store.reviewPile || []).filter((r) => r.courseId !== "c1");
    if (this.store.stats.coursesDoneList) {
      this.store.stats.coursesDoneList = this.store.stats.coursesDoneList.filter((c) => c !== "c1");
      this.store.stats.coursesDone = this.store.stats.coursesDoneList.length;
    }
    if (this.store.placement === undefined) this.store.placement = null;
    if (this.store.onboardingSeen === undefined) this.store.onboardingSeen = false;
```

(b) `_defaultStore()` 返回对象里加 `placement: null, onboardingSeen: false`(若该函数存在;名称以代码为准,通常是 `_defaultStore`)。

(c) 新增方法:
```js
  placementPseudoStore(results) {
    const statsByCourse = {}, statsByStreet = {}, reviewPile = [];
    for (const r of results) {
      (statsByCourse[r.courseId] = statsByCourse[r.courseId] || { h: 0, c: 0 }).h++;
      if (r.ok) statsByCourse[r.courseId].c++;
      (statsByStreet[r.street] = statsByStreet[r.street] || { h: 0, c: 0 }).h++;
      if (r.ok) statsByStreet[r.street].c++;
      if (!r.ok) reviewPile.push({ courseId: r.courseId, qid: r.qid, leak: r.leak, choice: r.choice, streak: 0, wrong: 1 });
    }
    return { statsByCourse, statsByStreet, reviewPile, stats: { totalQ: results.length, correctQ: results.filter((x) => x.ok).length, coursesDone: 0 }, progress: {} };
  },
```

- [ ] **Step 4: 跑测试(预期通过)**

Run: `node --test test/placement.test.js`
Expected: PASS。

- [ ] **Step 5: 跑全量测试**

Run: `npm test`
Expected: 全绿(题数基线相关见 Task 8)。

- [ ] **Step 6: 提交**

```bash
git add js/engine.js test/placement.test.js
git commit -m "feat(engine): migrate away old C1 data; pseudo-store for placement evaluation"
```

---

## Task 6: coach.js — 卡片函数接受可选 store 参数

**Files:**
- Modify: `js/app.js`(`renderProfileCard`/`renderLeakCard`/`renderPlanCard` 等加可选 store 参数)
- 说明:`Coach.*` 已接受 store 参数,无需改 coach.js。

- [ ] **Step 1: 给 app.js 的卡片渲染函数加可选 store 参数**

`js/app.js` 中,把直接读 `Engine.store` 的卡片函数改成接收参数(默认仍是 `Engine.store`),保证 stats 页行为不变。逐个修改:

第 321 行:
```js
function renderProfileCard(store) {
  store = store || Engine.store;
  const p = Coach.buildProfile(store);
```
第 348-382 行 `renderLeakCard`:函数签名改 `function renderLeakCard(store) { store = store || Engine.store;`,并把内部所有 `Engine.store` 换成 `store`(`Coach.aggregateLeaks(store)`、`Coach.topMissed(store, 5)`)。
第 403 行 `renderPlanCard`:同理,`function renderPlanCard(store) { store = store || Engine.store;`,内部 `Coach.buildPlan(store)`。

- [ ] **Step 2: 手测 stats 页未回归**

Run: `npx serve . -l 3456`,浏览器开 http://127.0.0.1:3456,在控制台 `localStorage.setItem('pokerPostFlopPro','1')` 解锁,做几题后进"统计"页。
Expected: 画像/漏洞/计划三卡片照常显示(传 undefined → 默认 Engine.store)。

- [ ] **Step 3: 提交**

```bash
git add js/app.js
git commit -m "refactor(app): card renderers accept optional store (default Engine.store)"
```

---

## Task 7: i18n.js — 新文案

**Files:**
- Modify: `js/i18n.js`(新增所有 placement 相关 key)
- Test: `test/i18n.test.js`(若有"无缺失 key"校验则自动覆盖)

- [ ] **Step 1: 注册所有新文案**

在 `js/i18n.js` 适当处加:

```js
reg("c1.title", "Placement Test", "初始测试");
reg("c1.sub", "20 questions · 5-min skill check", "20 题 · 5 分钟摸底");
reg("placement.start", "Start test", "开始测试");
reg("placement.later", "Maybe later", "以后再说");
reg("placement.onboard", "New here? Take a 5-minute placement test to see where to start.", "新来的？花 5 分钟做个摸底，看看该从哪开始。");
reg("placement.progress", "Question {n} of 20", "第 {n} / 20 题");
reg("placement.resultTitle", "Your placement result", "你的摸底结果");
reg("placement.scoreLine", "{c} / {t} correct", "答对 {c} / {t}");
reg("placement.lastTime", "Last time {a} → this time {b}", "上次 {a} → 这次 {b}");
reg("placement.level.expert", "Strong — you have a solid post-flop base", "高手 — 翻后基础扎实");
reg("placement.level.inter", "Intermediate — a few clear gaps to close", "进阶 — 有几处明显漏洞");
reg("placement.level.beginner", "Beginner — start from the fundamentals", "初学 — 从基础开始");
reg("placement.byTheme", "By topic", "各主题表现");
reg("placement.review", "Question review", "逐题回顾");
reg("placement.addToReview", "Add my misses to review", "把错题加入复习");
reg("placement.retake", "Retake test", "重测");
reg("placement.startHere", "Start systematic study from this course", "从这课开始系统学习");
reg("placement.smallSample", "Small sample — treat as a rough signal", "样本较小，仅作大致参考");
reg("theme.flop", "Flop initiative", "翻牌主导权");
reg("theme.odds", "Odds & bluff-catching", "赔率与抓诈");
reg("theme.turn", "Turn decisions", "转牌决策");
reg("theme.river", "River decisions", "河牌决策");
reg("theme.advanced", "Advanced spots", "进阶专题");
reg("placement.youChose", "You chose", "你选了");
// course.back:先 `grep -n "\"course.back\"" js/i18n.js`;若未注册再加下一行(已注册则跳过,避免重复)
reg("course.back", "Back", "返回");
```

(若 `t()` 的占位符语法不是 `{n}`/`{c}`,以 `js/i18n.js` 现有用法为准——参考 `t("course.questions", { n: 24 })`,占位符是 `{n}` 形式,上面保持一致。)

- [ ] **Step 2: 跑测试**

Run: `npm test`
Expected: i18n 测试绿;若有"所有 reg 双语非空"校验,确认通过。

- [ ] **Step 3: 提交**

```bash
git add js/i18n.js
git commit -m "feat(i18n): placement test, themes, result-page strings (bilingual)"
```

---

## Task 8: 审计/测试基线 + 题数更新

**Files:**
- Modify: `tools/audit-all-questions.js`(若硬编码 488/c1=8)
- Modify: 任何断言 488 或 c1 题数的测试

- [ ] **Step 1: 找出硬编码的题数/课结构期望**

Run: `grep -rn "488\|c1.*8\|getQuestions(\"c1\")" tools/ test/`
逐个核对:把"总题数 488"改为 483;把"c1 = 8 题"改为"c1 = 0(测试课)";c2 = 27。

- [ ] **Step 2: 跑全量审计**

Run: `npm run audit`
Expected: `全部 483 题... 校验通过`(数字以脚本输出为准,无错误)。

- [ ] **Step 3: 跑全量测试**

Run: `npm test`
Expected: 全绿。

- [ ] **Step 4: 提交**

```bash
git add tools/ test/
git commit -m "chore: update question-count baselines to 483 (c1 placement, c2=27)"
```

---

## Task 9: app.js — c1 测试卡片、首次引导、事件路由

**Files:**
- Modify: `js/app.js`(`renderCourses` c1 特殊卡片;事件路由 `start-placement`/`onboarding`;首次引导提示)

- [ ] **Step 1: c1 渲染为测试卡片**

在 `renderCourses()`(第 78 行)生成课程卡片的循环里,对 `course.placement === true` 的课特殊渲染:不显示常规进度,显示诊断副标题与(若有)上次得分,点击触发 `data-nav="start-placement"`。示例(插入循环体顶部):

```js
    if (c.placement) {
      const p = Engine.store.placement;
      const last = p ? ` · ${t("placement.scoreLine", { c: p.score, t: p.total })}` : "";
      html += `<button class="course-card placement-card" data-action="start-placement">
        <div class="course-title">🎯 ${t(c.titleKey)}</div>
        <div class="course-sub">${t(c.subKey)}${last}</div>
      </button>`;
      continue;
    }
```
(事件走 `data-action`,见 Step 2;`course-card`/`course-title`/`course-sub` 沿用 `renderCourses` 现有卡片的类名与结构,实现时对齐。`placement-card` 样式在 Task 10 Step 4 的 index.html 加。)

- [ ] **Step 2: 事件路由(handleAction)+ next-q 收尾 + 首次引导**

事件统一走 `handleAction(action, el)`(`js/app.js` 第 625 行起的 `switch (action)`),末尾已有统一 `render()`(第 688 行),因此 case 内只改 Engine 状态、**不要**手动调 `render()`。在该 switch 里加三个 case:

```js
    case "start-placement":
      resetChoiceShuffle();
      Engine.startPlacementTest();
      break;
    case "onboard-start":
      Engine.store.onboardingSeen = true; Engine.save();
      resetChoiceShuffle();
      Engine.startPlacementTest();
      break;
    case "onboard-dismiss":
      Engine.store.onboardingSeen = true; Engine.save();
      Engine.screen = "courses";
      break;
```

同一 `handleAction` 的 `case "next-q":`(第 655-662 行)要让测试模式收尾到评价页。把该 case 改为:
```js
    case "next-q":
      _pendingFeedback = null;
      Engine.qIdx++;
      if (Engine.qIdx >= Engine.currentQuestions().length) {
        if (Engine.testMode) Engine.finishPlacementTest(Date.now());
        else if (Engine.reviewMode) Engine.finishReviewSession();
        else Engine.finishDrill();
      } else Engine.screen = "drill";
      break;
```

在 `renderCourses()` 顶部(拼接课程卡片之前的 `html` 起始处),对全新用户插入一次性引导条(按钮用 `data-action`):
```js
  const noProgress = Object.keys(Engine.store.progress || {}).length === 0;
  if (!Engine.store.onboardingSeen && noProgress && !Engine.store.placement) {
    html += `<div class="onboard-banner">${t("placement.onboard")}
      <button class="btn" data-action="onboard-start">${t("placement.start")}</button>
      <button data-action="onboard-dismiss">${t("placement.later")}</button></div>`;
  }
```

- [ ] **Step 3: drill 进度文案在测试中显示 "第 n/20 题"**

在 `renderDrill()`(第 162 行)里,若 `Engine.testMode`,题号区显示 `t("placement.progress", { n: Engine.qIdx + 1 })`,而非课程进度。(以现有 renderDrill 进度 DOM 为准对齐。)

- [ ] **Step 4: 手测**

Run: `npx serve . -l 3456`;新开隐身窗或控制台 `localStorage.removeItem('pokerPostFlop_v1')` 清进度后刷新。
Expected:课程页顶部出现引导条;c1 是 🎯 测试卡片;点击进入答题,题号显示"第 1/20 题",每题即时反馈。

- [ ] **Step 5: 提交**

```bash
git add js/app.js index.html
git commit -m "feat(app): placement card, first-visit onboarding, test progress label"
```

---

## Task 10: app.js — 评价页 renderPlacementResult

**Files:**
- Modify: `js/app.js`(新增 `placement-result` 分支与 `renderPlacementResult`;事件 `add-misses`/`retake`)
- Modify: `index.html`(评价页/折叠的少量样式)

- [ ] **Step 1: 在 render() 注册新 screen**

`render()` 的 `switch (Engine.screen)`(第 42 行)加(与其它 case 一致,`root.innerHTML = renderXxx()`):
```js
    case "placement-result":
      root.innerHTML = renderPlacementResult();
      break;
```

- [ ] **Step 2: 实现 renderPlacementResult**

新增函数(复用卡片传伪 store):

```js
function renderPlacementResult() {
  const p = Engine.store.placement;
  const ps = Engine.placementPseudoStore(p.results);
  const pct = Math.round((p.score / p.total) * 100);
  const level = pct >= 85 ? "expert" : pct >= 60 ? "inter" : "beginner";
  let html = `<div class="screen result">`;
  html += `<h2>${t("placement.resultTitle")}</h2>`;
  html += `<div class="big-score">${t("placement.scoreLine", { c: p.score, t: p.total })} · ${pct}%</div>`;
  html += `<div class="level">${t("placement.level." + level)}</div>`;
  if (p.history.length > 1) {
    const prev = p.history[p.history.length - 2].score;
    html += `<div class="trend">${t("placement.lastTime", { a: prev, b: p.score })}</div>`;
  }
  // 主题分
  html += `<h3>${t("placement.byTheme")}</h3><div class="theme-bars">`;
  for (const th of ["flop", "odds", "turn", "river", "advanced"]) {
    const d = p.byTheme[th] || { h: 0, c: 0 };
    const a = d.h ? Math.round((d.c / d.h) * 100) : 0;
    const weak = th === p.weakestTheme ? " weak" : "";
    html += `<div class="theme-bar${weak}"><span>${t("theme." + th)}</span><b>${d.c}/${d.h}</b></div>`;
  }
  html += `</div>`;
  // 复用统计卡片(传伪 store)
  html += renderProfileCard(ps);
  html += renderLeakCard(ps);
  html += renderPlanCard(ps);
  html += `<div class="note">${t("placement.smallSample")}</div>`;
  // 推荐起点(复用现有 start-course 动作 + data-id 跳课)
  const sc = Engine.store.placement.startCourse;
  const scTitle = t(courseById(sc).titleKey);
  html += `<button class="btn" data-action="start-course" data-id="${sc}">${t("placement.startHere")}: ${scTitle}</button>`;
  // 逐题回顾(折叠,错题展开)
  html += `<h3>${t("placement.review")}</h3>`;
  for (const r of p.results) {
    const open = r.ok ? "" : " open";
    const mark = r.ok ? "✓" : "✗";
    html += `<details class="q-review${open}"><summary>${mark} ${r.qid} — ${t("theme." + r.theme)}</summary>
      <div>${t("placement.youChose")}: ${r.choice}</div></details>`;
  }
  html += `<div class="result-actions">
    <button class="btn" data-action="add-misses">${t("placement.addToReview")}</button>
    <button data-action="start-placement">${t("placement.retake")}</button>
    <button data-action="back-courses">${t("course.back")}</button>
  </div></div>`;
  return html; // renderXxx 统一返回字符串,由 render() 写入 root.innerHTML
}
```
(`courseById` 是 courses.js 全局函数;`btn` 类名沿用现有按钮。Task 7 需补 `reg("placement.youChose","You chose","你选了")`;`course.back` 若未注册则一并补 `reg("course.back","Back","返回")`。)

- [ ] **Step 3: 事件 add-misses(handleAction)**

`handleAction` 的 switch 里加(末尾统一 `render()`,case 内**不**手动调):
```js
    case "add-misses": {
      const ps = Engine.placementPseudoStore(Engine.store.placement.results);
      for (const r of ps.reviewPile) {
        if (!Engine.store.reviewPile.find((x) => x.qid === r.qid && x.courseId === r.courseId)) {
          Engine.store.reviewPile.push(r);
        }
      }
      Engine.save();
      break;
    }
```
其余按钮复用现有动作:"重测" = Task 9 已加的 `start-placement`;"返回" = 现有 `back-courses`;推荐起点 = 现有 `start-course`(带 `data-id`)。无需新增 goto-course。

- [ ] **Step 4: index.html 加最小样式**

在 `index.html` 的 `<style>` 里加(类名与上面一致):
```css
.placement-card { border-left: 3px solid #6eb5ff; }
.onboard-banner { background:#1b2536; padding:12px; border-radius:8px; margin-bottom:12px; }
.theme-bar { display:flex; justify-content:space-between; padding:4px 0; }
.theme-bar.weak { color:#d23b46; font-weight:bold; }
.q-review summary { cursor:pointer; padding:4px 0; }
.big-score { font-size:1.6em; font-weight:bold; }
```

- [ ] **Step 5: 手测完整流程**

Run: `npx serve . -l 3456`;清进度后刷新 → 引导 → 做完 20 题 → 评价页:
Expected:分数+评级+(重测后)趋势;主题分最弱高亮;画像/漏洞/计划卡片显示;推荐起点按钮跳对应课;逐题回顾错题展开;"加入复习"后进复习堆;"重测"重新打乱开始。

- [ ] **Step 6: 提交**

```bash
git add js/app.js index.html
git commit -m "feat(app): detailed placement-result page (theme bars, reused cards, review, recommend)"
```

---

## Task 11: 最终验收

- [ ] **Step 1: 全量测试 + 审计**

Run: `npm test && npm run audit`
Expected:测试全绿;审计 483/483。

- [ ] **Step 2: 端到端手测清单**

- 全新用户(清 `pokerPostFlop_v1`):课程页见引导 → c1 测试卡片。
- 做完 20 题即时反馈 → 评价页五区块齐全。
- 重测:题序变化;评价页显示"上次→这次"。
- C2:点开课,Learn 4 页连贯,drill 前 3 道是计算题、之后是隐含赔率实战题。
- 老用户(导入一份含旧 c1 进度的 `pokerPostFlop_v1`):刷新后无报错,统计页/复习正常,c1 不再显示为已完成课程。

- [ ] **Step 3: 不提交/不部署**(等用户确认后再按需提交部署)

---

## 自审记录(spec 覆盖核对)

- §3.1 C1→测试:Task 1(placement 标记)+ Task 9(测试卡片)+ Task 3(startPlacementTest)✓
- §3.2 C2 合并:Task 1(元数据)+ Task 2(learn 重组、3 计算题、空 c1)✓
- §4 基准卷锁定 + 动作均衡:Task 3(PLACEMENT_SPEC + 测试断言)✓
- §5 testMode/即时反馈/打乱/错题收集:Task 3 ✓
- §6 评价页(总评/主题/伪 store 卡片/推荐/逐题折叠/加入复习/重测):Task 4 + Task 10 ✓
- §7 首次引导:Task 9 ✓
- §8 迁移:Task 5 ✓
- §9 i18n:Task 7(+ Task 10 补 youChose)✓
- §10 题数基线:Task 8 ✓
- §11 受影响文件:全部覆盖 ✓
- §13 非目标:无断点续做、无随机卷、无服务端 —— 未引入 ✓
