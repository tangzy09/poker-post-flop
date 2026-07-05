# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作时提供指引。

双语（EN / 中文）单挑翻后扑克训练器：30 课（C1 为初始测试）、699 道训练题，以**纯静态站点**形式提供（网页端无打包器、无构建步骤）。同时通过 Capacitor 打包成 Android 应用。

硬性规则（i18n、术语、类名冲突）见 **[AGENTS.md](AGENTS.md)**；VS Code 工作流见 **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**；题库格式见 **[docs/CONTENT.md](docs/CONTENT.md)**；**产品定位、商业化模型与红线见 [PRODUCT.md](PRODUCT.md)**（要点：web 仅测试期免费,正式上线后付费只在 App、web 收费内容引导跳 App 下载——加功能/改文案前先读它）。本文件是精简总览。

## 常用命令

```bash
npx serve . -l 3456              # 本地运行 → http://127.0.0.1:3456（无需 install）
npm test                         # ~64 个 node:test 测试 —— 改动 js/、scripts/、test/ 后必跑
npm run audit                    # 699 题全量审计 → tools/audit-report.json
node --test test/i18n.test.js    # 单独跑某个测试文件
node scripts/gen-content-ext.js  # 改完 C13–C30 源数据后重新生成 js/content-ext.js
node scripts/audit-stem-spot.js  # 检查题干文字与牌面/手牌是否一致
node tools/label-check.js        # 牌力标签体检：重算成牌/听牌 vs 文案声明
node tools/verify-feedback.js    # 计算式反馈数学全量验证（每个不等式核对真假）
node tools/gen-seo-pages.js      # 题库/文案变更后重新生成 courses/ 静态课程页 + sitemap
node tools/gen-seo-block.js      # 重新生成 index.html 里的 SEO 静态内容块
node tools/embed-fonts.js        # 字体集变更时重新内嵌 Space Grotesk（去 CDN）
powershell -File tools/deploy-ec2.ps1   # 部署到 EC2（仅在用户要求时）
```

基线预期：测试全绿，审计 **699/699**。VS Code 任务与这些命令对应（Terminal → Run Task → serve / test / audit）。

## 架构

由 `index.html` 按依赖顺序加载的纯全局作用域脚本（无模块 / import）。**加载顺序很重要**：`i18n → solved-spots → courses → content → content-ext → equity → range-chart → table → explain → engine → coach → cap → purchases → app`。

数据流：
```
courses.js（30 课元数据）
   → content.js（C1–C12）+ content-ext.js（C13–C30）   [LEARN 原理页 + QUESTIONS]
   → engine.js（learnIdx/qIdx、评分、复习堆、localStorage）
   → app.js（渲染各 Screen）+ table.js（牌桌 spot）+ i18n.js（t()）
```

每课 = 4 页 Learn（3 原理 + 1 summary）→ 再进入 Drill。题目分两类：`_choice()`（选择题）或由 `buildSpots()` 生成的 action spot（board/hand/pot/actions/correct/feedback）。

关键边界：
- **`js/engine.js`** —— 进度的唯一真相源。持久化到 `localStorage` 键 `pokerPostFlop_v1`（会从旧键 `postflopCoach_v1` 迁移）。`_migrateStore()` 含版本迁移：C1 改为初始测试后裁剪旧 C1 数据；复习堆已从「连对 N 次」升级为 **SRS Leitner 盒**（`box`/`due` 字段，间隔 1/3/7 天，盒 4 毕业），旧 `streak` 记录自动迁移。还管理**每日训练**（`store.daily`：确定性组卷、连续天数、会话续答）、**连击计分**（`sessionScore`/`maxCombo`）与 **S/A/B/C 课程评级**（`progress[cid].grade` 保留历史最佳）、`statsByLeak` 按漏洞统计、`store.trend` 按天准确率（180 天，复习/测试不计）、`seenIntro` 新手引导标记（迁移时老用户自动置 true）。改 store 结构时要谨慎。**`startReview` 会防御性清 `testMode`**（反馈屏「专练这类」可能在任何模式下触发）。
- **`js/coach.js`** —— 从 engine 的 `statsByCourse` / `statsByStreet` 派生统计、漏洞分析、训练计划。
- **`js/i18n.js`** —— `reg(key, en, zh)` + `t(key, {n})`。渲染时 `applyI18n(document)` 会更新 `data-i18n` 属性和 `document.title`。
- **`js/explain.js`** —— 计算式反馈引擎。`engine.feedbackFor(q, choice, ok)` 优先调它，从 board+hand 算出 outs / 胜率（面对下注用单张 ×2）/ 底池赔率 / MDF，对**答对和答错都**生成双语讲解；算不出时回退到题目自带的 `reasonKey`。反馈屏（`app.js renderFeedback`）答错显示「为何不对」、答对显示「为什么对」。靠隐含/反向隐含赔率定夺的局面只给措辞、不印不等式，避免假数学。

## 两套内容系统（关键）

- **C1–C12**：直接编辑 **`js/content.js`**（字符串用 `_r()` 注册，题目用 `_choice()` / `buildSpots()`）。
- **C13–C30**：编辑 **`scripts/courses-ext-data.js`**，然后运行 `node scripts/gen-content-ext.js`。**不要**手改 `js/content-ext.js` 的大段内容 —— 它是生成产物，会被覆盖。

## 不显而易见的坑

- **所有面向用户的字符串必须双语** —— 通过 `reg()` / `_r()` / 内联 `{ en, zh }`；绝不硬编码英文。Hero 手牌标签用 `labelKey`，不要硬编码 `label`。
- **范围矩阵格子和图例色块绝不用 CSS 类 `btn`**（与全局 `.btn` 冲突）。改用 `rng-open` / `rng-call` / `rng-both`。
- **`www/`** 是 Capacitor 的生成副本（`npm run build:www`）—— 不要手改。
- **缓存破坏**：`index.html` 的 script 标签带 `?v=<git-hash>`（全部 `defer` 加载，stamp 正则不受影响）；`tools/deploy-ec2.ps1` / `stamp-version.js` 负责打戳。不打戳手机端会看到旧版。
- **SEO 静态块**：`index.html` 的 `#screens` 里有 `<!--SEO-->…<!--/SEO-->` 静态内容块（爬虫/百度可读），`render()` 首帧覆写 —— **不要手改**，由 `tools/gen-seo-block.js` 生成。
- **课程页 slug 定版**：`tools/seo-slugs.js` 里的 URL slug **发布后不可更改**（外链/收录会断）；课程改名只改标题不改 slug。`courses/` 是 `gen-seo-pages.js` 的生成产物（29 课 × en/zh + sitemap.xml + robots.txt），改题库/Learn 文案后需重跑。
- **字体已内嵌**（base64 Space Grotesk latin，`tools/embed-fonts.js` 再生）—— **不要**再加 Google Fonts CDN `<link>`（大陆被墙）；中文走系统字体回退。
- **门控**：`isProUnlocked()`（courses.js）——web 恒 true（测试期,见 PRODUCT.md）;原生 App 读 `Engine.store.proEntitled`（js/purchases.js 的 RevenueCat 适配层写入,js/cap.js 为桥接 helper,与 pokerPreFlop 同构）。旧 `pokerPostFlopPro` localStorage 钩子已废弃。
- 调试：`localStorage.setItem('pokerPostFlopLang','zh')`（切语言）、`localStorage.removeItem('pokerPostFlop_v1')`（清进度）。
- **未经用户明确要求，不要 commit、push 或部署。**

## 品牌共享 token(与 pokerPreFlop 对齐,勿单边改)

两站(翻前/翻后训练营)共用同一套品牌视觉,以下 token 两边 `:root` 保持一致:
`--felt #0c2a22` `--felt2 #0a201a` `--panel #161d18` `--line #28332a` `--ink #f1f5ee` `--muted #8fa79a` `--gold #e8c66a` `--gold2 #b8902f` `--call/--best #34b074` `--raise/--wrong #e0544f` `--fold #5b6f63` `--card-r 10px`;字体 = 内嵌 Space Grotesk(latin)+ 中文系统回退。改任一 token 需两仓同步。内容宽度是**有意的差异**(本站 520px / 翻前 430px),不必对齐。

## 部署

- **EC2（唯一发布通道）**：`powershell -File tools/deploy-ec2.ps1` → https://post-flop-coach.ai-speeds.com/（需 SSH 密钥）。上传清单：`index.html`、`privacy.html`、`robots.txt`、`sitemap.xml`、`og-image.png`、GSC 验证文件、`js/`、`data/`、`courses/`。
- **GitHub Pages 未启用**（镜像 404；本地 `.github/` 保持**未跟踪** —— push 的 PAT 无 `workflow` scope，入库会导致整个 push 被拒）。
- **SEO**：主站已提交 Google Search Console（HTML 文件验证，在部署清单内）；sitemap 59 URL。
