# 初始测试 + C1 合并入 C2 — 设计文档

日期:2026-06-30
状态:待评审

## 1. 背景与目标

当前第一课(C1「底池赔率与 MDF」)是 8 道纯文字计算题,体验枯燥,作为新用户的第一印象不佳。

目标:
- 把 C1 的赔率/MDF **概念**并入 C2,使 C2 成为一条完整的"赔率与防守"主线;C1 的纯文字题保留 3 道核心计算,其余弃用。
- 把 C1 改造成**初始测试(Placement Test)**:一套固定的 20 道实战题(action spot),做完给出详版评价,帮新用户摸底、定位漏洞、找到该从哪课开始;老用户可重测以**追踪进步**。

## 2. 决策摘要(已与用户确认)

| 决策 | 选择 |
|---|---|
| 抽题方式 | **固定基准卷**(同一套 20 题),保证可复现、可对比进步 |
| C1 赔率/MDF 内容 | 概念并入 C2 的 Learn;保留 **3 道**核心计算题进 C2,其余弃 |
| 评价深度 | 详版:总评 + 多维度报告 + 逐题回顾 |
| 评价实现 | **复用** stats 页现有 profile/leak/plan 卡片,只新增"主题分"和"逐题回顾" |
| 小样本处理 | 20 题样本小,措辞为"倾向",细分维度错题 <2 不下结论 |
| 逐题回顾 | 默认折叠,错题自动展开、对题收起 |
| 推荐起点 | 精准到"答错最多的具体课",而非主题首课 |
| 首次引导 | 全新用户(无进度)首次进 App 轻提示做摸底,可跳过 |
| 测试与进度 | 测试**不计入**正式课程统计/解锁;单独存最近结果 + 历史分数 |

## 3. 课程结构变更

### 3.1 C1 → 初始测试
- `courses.js`:c1 加字段 `placement: true`;`titleKey` 指向"初始测试"。
- 课程列表(`renderCourses`):c1 渲染为特殊卡片(诊断图标 + "20 题 · 5 分钟摸底"副标题 + 若有历史分则显示上次得分),点击直接 `Engine.startPlacementTest()`,**不进 learn/drill**。
- c1 不计入"完成 N/30 课"进度;`getQuestions("c1")` 返回空数组。

### 3.2 C2 吸收赔率/MDF
- 标题改为「底池赔率、MDF 与隐含赔率」,sub 相应调整。
- Learn 4 页重组:

| 页 | 内容 | 来源 |
|---|---|---|
| l1 | 底池赔率与盈亏平衡胜率 | 原 c1.l1 |
| l2 | MDF 最小防守频率(含"针对范围而非单手") | 原 c1.l2 + l3 精简 |
| l3 | 隐含赔率 & 反向隐含赔率(何时最重要) | 原 c2.l1 + l2 + l3 精简 |
| sum | 综合小结(底池赔率 → MDF → 隐含/反向隐含) | 重写 |

- `c2.concepts` 增加 `pot_odds`、`mdf`。
- **C2 drill**:在原 24 道隐含赔率 action 题**之前**插入 3 道核心计算题(从原 C1 取:底池赔率计算、面对底池下注的 MDF、面对半池下注的 MDF)。C2 题数 24 → 27。
- 原 C1 其余 5 道题弃用。

## 4. 基准卷(固定 20 题)

5 大主题 × 4 题,全部为 action spot(无纯文字题)。固定不变。

| 主题 | 覆盖课 | 初选题号(实现时校验微调) |
|---|---|---|
| 翻牌主导权 | c3 c4 c5 c6 | c3-q1(bet) c3-q2(check) c6-q1(call) c6-q7(raise) |
| 赔率与抓诈 | c2 c7 c8 | c2-q4(fold) c2-q24(bet) c7-q1(call) c7-q4(call) |
| 转牌决策 | c9 c11 c17 c18 c19 | c9-q1(bet) c9-q2(check) c11-q1(raise) c11-q3(call) |
| 河牌决策 | c10 c22 c24 | c10-q1(bet) c10-q3(check) c10-q5(call) c10-q6(fold) |
| 进阶专题 | c12–c30 | c12-q2(fold) c13-q4(bet) c20-q1(bet) c23-q1(raise) |

**选题原则**(实现时逐题校验):
- 仅选 `correct` 为单一答案的题(避免多合法答案导致评分歧义);
- 避开对抗式盲解中标记为"call/raise 都合理"的争议题(如 set 慢打类 c2-q6/q12)与四连顺临界题(c10-q8/q13);
- 覆盖 fold/check/call/bet/raise 五种动作与 flop/turn/river 三条街;
- 难度由易到难大致递增。

实现:`engine.js` 常量 `PLACEMENT_QIDS = [...20 个 "courseId:qid"...]`;`startPlacementTest()` 按此固定列表构建队列。

## 5. 测试流程(engine `testMode`,仿 `reviewMode`)

- `startPlacementTest()`:按 `PLACEMENT_QIDS` 从各课 `getQuestions` 取题,`Object.assign({}, q, { _courseId })` 装入 `testQueue`;置 `testMode=true`、`qIdx=0`、`answers=[]`;`screen="drill"`。
- `currentQuestions()`:`testMode` 时返回 `testQueue`(改一行)。
- 跑题复用现有 `grade()` / `feedbackFor()` / drill+feedback 渲染。
- `recordAnswer()`:`testMode` 与 `reviewMode` 一样**跳过**正式统计写入;另把每题 `{qid, courseId, choice, ok, leak, street}` 收集进 `this.testResults`。
- `finishPlacementTest()`:由 `testResults` 计算评价对象;写入 `store.placement`;`screen="placement-result"`。
- 退出/中途返回:测试为一次性,未完成中途退出则丢弃(重测重新开始);完成后结果持久化。

### `store.placement` 结构
```js
{
  takenAt: Date.now(),                // 浏览器环境,直接取
  score, total,                       // 20 题对几道
  byTheme: { 翻牌主导权: {h,c}, ... }, // 5 主题
  byStreet: { flop:{h,c}, turn:{h,c}, river:{h,c} },
  byLeak: { too_loose: n, ... },      // 错题按漏洞分类
  weakestCourse: "cX",                // 错最多的具体课 → 推荐起点
  results: [ {qid, courseId, choice, ok, leak, street} ... ],
  history: [ {takenAt, score} ... ]   // 历次得分,用于"上次 X → 这次 Y"
}
```

## 6. 评价页(`renderPlacementResult`,详版)

自上而下:
1. **总评**:得分 X/20 + 百分比 + 水平评级(≥85% 高手 / 60–84% 进阶 / <60% 初学);若有历史,显示"上次 X → 这次 Y"。
2. **主题分**:5 主题正确率条形图,最弱主题高亮。
3. **复用 stats 卡片**:`renderProfileCard` / `renderLeakCard` / `renderPlanCard`(基于本次测试聚合,而非全局统计)。漏洞维度错题 <2 时不渲染该条或标"样本不足"。
4. **推荐起点**:`weakestCourse` → 课程卡片 + "从这课开始"跳转按钮。
5. **逐题回顾**:20 题列表,每项 牌面+手牌 / 你的选择 / 正确答案 / ✓✗ / 一句点评(题目 `feedback`);**默认折叠,错题展开、对题收起**。
6. 底部:"重测"按钮(重新开始基准卷)、"返回课程"。

措辞遵循小样本诚实原则:用"倾向于/这次偏…",不用"你的重大漏洞"。

## 7. 首次引导(onboarding)

- 判定:`store` 无任何课程进度且无 `placement` 记录 → 视为全新用户。
- 首次进 `courses` 时弹一次性轻提示:"先花 5 分钟做个摸底?帮你定位该从哪开始。【开始测试】【以后再说】"。
- 关闭后置 `store.onboardingSeen=true`,不再弹。

## 8. 数据迁移(`_migrateStore`)

- 现有逻辑已处理"C1 被改为 8 题"的裁剪;扩展为:c1 不再是答题课 → 删除 `store.progress.c1`、`store.statsByCourse.c1`、`reviewPile` 中 `courseId==="c1"` 的条目;`coursesDoneList` 移除 c1。
- 旧的全局 `stats.totalQ/correctQ` 不回溯重算(仅停止 c1 继续累加),避免破坏历史画像。
- 新增 `store.placement` / `store.onboardingSeen` 默认值。

## 9. i18n

所有新文案双语 `reg()`:c1 卡片、测试中提示、评价页全部标签、5 主题名、水平评级词、引导提示、C2 新 Learn 文案、保留的 3 道计算题。

## 10. 题数 / 测试基线影响

- 题库总数:488 − 5(弃用的原 C1 题)= **483**;原 C1 的 3 道核心题改挂到 C2。
- 需更新:`tools/audit-all-questions.js` 与相关测试(`curriculum.test.js`、`content-*.test.js`)中"488""c1=8 题"等期望 → 483、c2=27、c1=0(测试课)。
- `npm test` 与 `npm run audit` 基线相应更新后须全绿。

## 11. 受影响文件

| 文件 | 改动 |
|---|---|
| `js/courses.js` | c1 加 `placement`;c2 concepts/标题 |
| `js/content.js` | C2 Learn 重组;迁入 3 道计算题;移除原 C1 其余题与 learn |
| `js/engine.js` | `testMode`/`testQueue`/`testResults`;`startPlacementTest`/`finishPlacementTest`;`currentQuestions`/`recordAnswer` 分支;`PLACEMENT_QIDS`;`_migrateStore` 扩展 |
| `js/app.js` | c1 特殊卡片;`placement-result` 渲染;首次引导;复用 stats 卡片;事件路由 |
| `js/coach.js` | 卡片函数支持"传入临时统计源"(本次测试)而非只读全局 store |
| `js/i18n.js` | 新文案 |
| `tools/audit-all-questions.js`、`test/*.test.js` | 题数/课结构期望更新 |

## 12. 验证标准

- `npm test` 全绿(更新期望后);`npm run audit` = 483/483。
- 手测:首次进 App 看到引导 → 做测试 20 题 → 评价页各区块正确(主题分、漏洞、推荐、逐题回顾折叠)→ 重测显示"上次→这次"。
- C2:Learn 4 页连贯,drill 前 3 道为计算题、其后为隐含赔率题;课程列表 c1 为测试卡片、不计入完成进度。
- 老用户数据:迁移后无报错,旧 c1 进度被清理,历史画像不崩。

## 13. 非目标(YAGNI)

- 不做难度自适应/IRT 评分;固定卷 + 简单阈值即可。
- 不做测试断点续做。
- 不做服务端/排行榜;纯本地 `localStorage`。
- 不改动 c3–c30 的题目内容。
