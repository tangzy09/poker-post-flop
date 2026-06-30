# 题库与 i18n 指南

## 规模

| 范围 | 课数 | 每课 drill | 合计 |
|------|------|------------|------|
| C1（初始测试） | 1 | — | 0 |
| C2 | 1 | 27 | 27 |
| C3–C12 | 10 | 24 | 240 |
| C13–C30 | 18 | 24 | 432 |
| **合计** | **30** | — | **699** |

> C1 是**初始测试**（placement test）：从 C2–C30 抽 20 道实战题（action spot），做完给出评价，自身不新增题目。原 C1 的赔率/MDF 概念已并入 C2（故 C2 = 27 题）。

每课 **4 页 Learn**（3 原理 + 1 summary）→ 再进入 Drill。

## 两套内容文件

### C1–C12：`js/content.js`

- 顶部 `registerContentStrings()`：`_r(key, en, zh)` 注册所有字符串
- `LEARN`：原理 slide 的 `titleKey` / `bodyKey`
- `QUESTIONS`：选择题 `_choice()` 或行动题 `_action()` / `buildSpots()`

**直接编辑此文件**，改完跑 `npm test`。

### C13–C30：`scripts/courses-ext-data.js` → `js/content-ext.js`

1. 编辑 `scripts/courses-ext-data.js`（learn 四段 + 24 个 spot）
2. 运行：

```bash
node scripts/gen-content-ext.js
npm test
npm run audit
```

**不要**手改 `content-ext.js` 大段（会被生成覆盖）。

## 添加一道 action spot（C1–C12 示例）

在对应课程的 `buildSpots("c5", "concept.cbet", [ ... ])` 里加 spec：

```javascript
{
  s: { en: "English stem…", zh: "中文题干…" },
  lbl: { en: "AhKd TPTK", zh: "AhKd 顶对顶踢" },
  board: ["Td", "9c", "4h"],
  pot: 12,
  bet: 0,
  pos: "BTN (IP)",
  hand: ["Ah", "Kd"],
  actions: ACT,           // 或 FACE / FACE_CALL
  correct: ["bet"],
  leak: "street_plan",
  fb: {
    check: { en: "…", zh: "…" },
    fold: { en: "…", zh: "…" },
  },
},
```

`buildSpots` 会自动 `reg()` 双语 key 并生成 `stemKey`、`feedback`、`spot`。

### Spot 字段

| 字段 | 说明 |
|------|------|
| `board` | 3/4/5 张，与 `street` 一致 |
| `hand` | Hero 两张，不得与 board 重复 |
| `pos` | 含 `IP` / `OOP`，牌桌会解析 BTN/BB |
| `bet` | 0 = 无人下注，用 `ACT`；>0 用 `FACE` |
| `allIn` | true 时仅 fold/call |
| `leak` | 统计漏洞分类，见 `i18n.js` 的 `leak.*` |
| `correct` | 可多个合法答案，如 `["call","raise"]` |

## 添加选择题

```javascript
_choice("c1-q9", "c1.q9.s", [
  { id: "a", labelKey: "c1.q9.a" },
  { id: "b", labelKey: "c1.q9.b" },
  // ...
], "a", "conceptual", "concept_gap", "c1.q9.fb.b"),
```

并在 `registerContentStrings()` 里注册 `c1.q9.s`、`c1.q9.a`… 及 feedback key。

## i18n 规则

### UI 壳：`js/i18n.js`

```javascript
reg("key.name", "English", "中文");
// 使用
t("key.name");
t("course.questions", { n: 24 });
```

### 课程内容：`content.js` 里 `_r()` 或 `buildSpots` 内联 `{ en, zh }`

### 静态 HTML：`index.html`

```html
<h1 data-i18n="app.title">…</h1>
```

由 `applyI18n(document)` 在 `render()` 时刷新（含 `document.title`）。

### 注意

- 范围图、图例类名 **不要用** `btn`（与全局 `.btn` 冲突）
- 手牌标签用 `labelKey`，不要硬编码 `label: "AA bluff-catcher"`
- 扑克缩写可保留：BTN、BB、MDF、SPR、Solver
- 中文术语统一：
  - weak top pair → **弱顶对**
  - missed draw → **破产听牌**
  - capped villain → **对手（封顶）**

## 反馈引擎（`js/explain.js`）

答题后 `engine.feedbackFor(q, choice, ok)` 先调 `explainFeedback`：从 board+hand 算出成牌/听牌、outs、胜率（**面对下注用单张 ×2**）、底池赔率、MDF，对**答对和答错都**生成双语讲解；算不出（如纯范围题）则回退到题目自带的 `fb` / `reasonKey`。反馈屏答对显示「为什么对」、答错显示「为何不对」。

- 写题时 `fb` 仍要写好 —— 它既是回退兜底，也用于 explain 覆盖不到的局面。
- 靠隐含 / 反向隐含赔率定夺的局面，explain 只给措辞、**不硬断「+EV/−EV」**，避免印出假数学。

## 质量检查清单

改内容后按顺序：

```bash
node scripts/gen-content-ext.js   # 仅当改了 C13–C30 源数据
npm test                          # 必须全绿（当前 44 tests）
npm run audit                     # 期望 699/699
node scripts/audit-stem-spot.js   # 题干 vs 牌面
node tools/label-check.js         # 牌力标签：重算成牌/听牌 vs 文案（成顺标听牌、三条标两对、四条标葫芦…）
node tools/verify-feedback.js     # 计算式反馈：逐题核对 explain 印出的每个不等式真假（应 0 假）
```

测试覆盖：重复牌、听牌类型、label 与牌力、solver 牌面、learn key 注册、stem 与 spot 一致等。两个 `tools/*` 体检脚本独立于 `npm test`，是改内容后揪牌力/答案/反馈错误的最后一道关。

## C3 范围图

Learn slide 加 `rangeChart: ["Ah", "7d", "2c"]`（至少 3 张牌）。

渲染：`js/range-chart.js` + `js/equity.js`，样式在 `index.html` 的 `.range-*`。

## Solver 参考

`data/solved-spots.js` — C7/C8 等题可设 `solverRef`，审计会核对 board 一致。
