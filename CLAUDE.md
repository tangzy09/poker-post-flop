# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作时提供指引。

双语（EN / 中文）单挑翻后扑克训练器：30 课、488 道训练题，以**纯静态站点**形式提供（网页端无打包器、无构建步骤）。同时通过 Capacitor 打包成 Android 应用。

硬性规则（i18n、术语、类名冲突）见 **[AGENTS.md](AGENTS.md)**；VS Code 工作流见 **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**；题库格式见 **[docs/CONTENT.md](docs/CONTENT.md)**。本文件是精简总览。

## 常用命令

```bash
npx serve . -l 3456              # 本地运行 → http://127.0.0.1:3456（无需 install）
npm test                         # ~39 个 node:test 测试 —— 改动 js/、scripts/、test/ 后必跑
npm run audit                    # 488 题全量审计 → tools/audit-report.json
node --test test/i18n.test.js    # 单独跑某个测试文件
node scripts/gen-content-ext.js  # 改完 C13–C30 源数据后重新生成 js/content-ext.js
node scripts/audit-stem-spot.js  # 检查题干文字与牌面/手牌是否一致
powershell -File tools/deploy-ec2.ps1   # 部署到 EC2（仅在用户要求时）
```

基线预期：测试全绿，审计 **488/488**。VS Code 任务与这些命令对应（Terminal → Run Task → serve / test / audit）。

## 架构

由 `index.html` 按依赖顺序加载的纯全局作用域脚本（无模块 / import）。**加载顺序很重要**：`i18n → solved-spots → courses → content → content-ext → equity → range-chart → table → engine → coach → app`。

数据流：
```
courses.js（30 课元数据）
   → content.js（C1–C12）+ content-ext.js（C13–C30）   [LEARN 原理页 + QUESTIONS]
   → engine.js（learnIdx/qIdx、评分、复习堆、localStorage）
   → app.js（渲染各 Screen）+ table.js（牌桌 spot）+ i18n.js（t()）
```

每课 = 4 页 Learn（3 原理 + 1 summary）→ 再进入 Drill。题目分两类：`_choice()`（选择题）或由 `buildSpots()` 生成的 action spot（board/hand/pot/actions/correct/feedback）。

关键边界：
- **`js/engine.js`** —— 进度的唯一真相源。持久化到 `localStorage` 键 `pokerPostFlop_v1`（会从旧键 `postflopCoach_v1` 迁移）。包含版本迁移逻辑 —— 尤其 C1 被改为 8 题，所以 `_migrateStore()` 会裁剪旧的 C1 进度/复习记录。改 store 结构时要谨慎。
- **`js/coach.js`** —— 从 engine 的 `statsByCourse` / `statsByStreet` 派生统计、漏洞分析、训练计划。
- **`js/i18n.js`** —— `reg(key, en, zh)` + `t(key, {n})`。渲染时 `applyI18n(document)` 会更新 `data-i18n` 属性和 `document.title`。

## 两套内容系统（关键）

- **C1–C12**：直接编辑 **`js/content.js`**（字符串用 `_r()` 注册，题目用 `_choice()` / `buildSpots()`）。
- **C13–C30**：编辑 **`scripts/courses-ext-data.js`**，然后运行 `node scripts/gen-content-ext.js`。**不要**手改 `js/content-ext.js` 的大段内容 —— 它是生成产物，会被覆盖。

## 不显而易见的坑

- **所有面向用户的字符串必须双语** —— 通过 `reg()` / `_r()` / 内联 `{ en, zh }`；绝不硬编码英文。Hero 手牌标签用 `labelKey`，不要硬编码 `label`。
- **范围矩阵格子和图例色块绝不用 CSS 类 `btn`**（与全局 `.btn` 冲突）。改用 `rng-open` / `rng-call` / `rng-both`。
- **`www/`** 是 Capacitor 的生成副本（`npm run build:www`）—— 不要手改。
- **缓存破坏**：`index.html` 的 script 标签带 `?v=<git-hash>`；`tools/deploy-ec2.ps1` / `stamp-version.js` 负责打戳。不打戳手机端会看到旧版。
- 调试解锁：`localStorage.setItem('pokerPostFlopPro','1')`（解锁全部课程）、`localStorage.setItem('pokerPostFlopLang','zh')`（切语言）、`localStorage.removeItem('pokerPostFlop_v1')`（清进度）。
- **未经用户明确要求，不要 commit、push 或部署。**

## 部署

- **EC2（主站）**：`powershell -File tools/deploy-ec2.ps1` → https://post-flop-coach.ai-speeds.com/（需 SSH 密钥）。
- **GitHub Pages**：push 到 `main` 触发 `.github/workflows/pages.yml`（先跑测试，再发布 `index.html` + `js/` + `data/`）。
