# 开发指南（VS Code + Claude）

面向在 **VS Code** 里打开本项目、用 **Claude** 辅助开发的日常流程说明。

## 1. 打开项目

```powershell
cd C:\Users\tangz\poker-post-flop
code .
```

推荐安装 VS Code 扩展（见 `.vscode/extensions.json`）：

- **Live Server** 或直接用终端 `npx serve`
- **Claude**（Anthropic 官方或你习惯的 Claude 插件）

## 2. 技术栈（无构建）

| 项 | 说明 |
|----|------|
| 前端 | 纯静态 HTML + 原生 JS（无 React/Vue） |
| 样式 | 全部在 `index.html` 的 `<style>` 内 |
| 数据 | `js/content.js` + `js/content-ext.js` 题库 |
| 持久化 | 浏览器 `localStorage`（`js/engine.js`） |
| 测试 | Node.js 内置 `node:test` |
| 部署 | SCP 到 EC2 静态目录 |

**不需要** `npm install` 即可跑网页（除非做 Capacitor 安卓包）。

## 3. 本地运行

```powershell
# 推荐端口（与之前 Cursor 会话一致）
npx serve . -l 3456
```

浏览器打开：http://127.0.0.1:3456/

VS Code 也可用任务：**Terminal → Run Task → serve**（见 `.vscode/tasks.json`）。

### 调试技巧

- 控制台解锁全部课程：`localStorage.setItem('pokerPostFlopPro','1')` 后刷新
- 切语言：`localStorage.setItem('pokerPostFlopLang','zh')` 或点页面右上角
- 清进度：`localStorage.removeItem('pokerPostFlop_v1')`

## 4. 常用命令

| 命令 | 作用 |
|------|------|
| `npm test` | **64** 项结构/内容/引擎测试，改题库或 i18n 后必跑 |
| `npm run audit` | 699 题全量审计，输出 `tools/audit-report.json` |
| `node scripts/gen-content-ext.js` | 改 C13–C30 源数据后重新生成 `js/content-ext.js` |
| `node scripts/audit-stem-spot.js` | 题干文字 vs 牌面/手牌一致性 |
| `node tools/label-check.js` | 牌力标签体检：重算成牌/听牌 vs 文案声明 |
| `node tools/verify-feedback.js` | 计算式反馈数学全量验证（逐题核对不等式真假） |
| `node tools/gen-seo-pages.js` | 重新生成 `courses/` 静态课程页（29×en/zh）+ sitemap + robots |
| `node tools/gen-seo-block.js` | 重新生成 `index.html` 内 `<!--SEO-->` 静态内容块 |
| `node tools/embed-fonts.js` | 字体集变更时重新 base64 内嵌 Space Grotesk |
| `powershell -File tools/deploy-ec2.ps1` | 打版本戳 + 上传 EC2（需 SSH 密钥） |

## 5. 代码结构（改哪里）

```
index.html          页面壳 + 全部 CSS（按钮、牌桌、范围图样式）
js/
  i18n.js           UI 文案 reg() / t() / applyI18n()
  courses.js        30 课元数据（id、free、drillCount、titleKey）
  content.js        C1–C12 原理页 + 题目（主题库，手改）
  content-ext.js    C13–C30（由 scripts 生成，勿手改大段）
  engine.js         进度、评分、复习堆、localStorage 迁移
  explain.js        计算式反馈引擎（outs/胜率/赔率/MDF，对错都有）
  app.js            各 Screen 渲染与事件
  coach.js          统计、漏洞、训练计划
  table.js          牌桌 / spot 渲染
  equity.js         权益计算（C3 范围图）
  range-chart.js    C3 范围 + 权益可视化
data/solved-spots.js  C7/C8 solver 参考 spot
scripts/
  courses-ext-data.js   C13–C30 源数据（改课从这里）
  gen-content-ext.js    生成 content-ext.js
test/               自动化测试（与改动的文件一起跑）
tools/
  deploy-ec2.ps1    EC2 部署
  stamp-version.js    index.html 脚本 ?v=git-hash 缓存破坏
  label-check.js    牌力标签体检（成牌/听牌 vs 文案）
  verify-feedback.js  计算式反馈数学全量验证
```

### 数据流（简图）

```
courses.js (元数据)
     ↓
content.js / content-ext.js (LEARN + QUESTIONS)
     ↓
engine.js (learnIdx / qIdx / grade / store)
     ↓
app.js (render) + table.js (spot) + i18n.js (t)
```

## 6. 用 Claude 协作的建议

1. **先说明改什么**：UI / 某一课内容 / 统计逻辑 / 部署，避免一次改太多文件。
2. **引用文件路径**：例如「改 `js/content.js` 里 c5 的 buildSpots」。
3. **改完必跑测试**：让 Claude 执行 `npm test`；动题库再跑 `npm run audit`。
4. **读项目约定**：根目录 `AGENTS.md` 给 AI 的硬性规则（术语、i18n、类名冲突等）。
5. **内容细则**：见 [CONTENT.md](./CONTENT.md)。

### 给 Claude 的示例提示

```
在 C5 加一道翻牌持续下注 spot：board Td9c4h，Hero BTN IP 持 AhKd，
半池 cbet，正确 action 是 bet。中英文题干都要，跑 npm test。
```

```
修复中文模式下顶栏仍显示英文 — 检查 i18n.js applyI18n 作用域。
```

## 7. 部署

| 环境 | 方式 |
|------|------|
| **EC2（主站）** | `powershell -File tools/deploy-ec2.ps1` → https://post-flop-coach.ai-speeds.com/ |
| GitHub Pages | **未启用**（镜像 404）—— EC2 是唯一发布通道 |

部署脚本会：

1. 用当前 git short hash 写入 `index.html` 里 `?v=`
2. 上传 `index.html`、`robots.txt`、`sitemap.xml`、`og-image.png`、GSC 验证文件、`js/`、`data/`、`courses/` 到 EC2

手机端若看到旧版：**硬刷新**或清缓存（依赖 `?v=` 戳）。

## 8. 已知坑

| 问题 | 说明 |
|------|------|
| CSS 类名 `btn` | 全局按钮样式；范围矩阵勿用 `btn` 作颜色类（已改为 `rng-open` 等） |
| `applyI18n` | 必须作用在 `document` 上，否则顶栏 `data-i18n` 不更新 |
| C13–C30 | 改 `scripts/courses-ext-data.js` 后必须 `node scripts/gen-content-ext.js` |
| C1 | 已改造为**初始测试**（20 题基准卷，无自有题库）；`engine.js` 会迁移旧 c1 进度 |
| 复习堆 | SRS Leitner 盒（`box`/`due`，间隔 1/3/7 天）；默认只复习**到期**题，旧 `streak` 记录自动迁移 |
| 每日训练 | 按本地日期做种子的确定性组卷（同一天同一套题）；会话存在 `store.daily.session` 支持续答 |
| SEO 静态块 | `#screens` 内 `<!--SEO-->` 块由 `gen-seo-block.js` 生成、`render()` 首帧覆写 —— 勿手改 |
| 课程页 slug | `tools/seo-slugs.js` **发布后不可改**（收录/外链会断）；`courses/` 是生成产物 |
| 字体 | 已 base64 内嵌（大陆可用/离线），**勿**再加 Google Fonts CDN；script 全部 `defer` |
| GitHub Pages | **未启用**（镜像 404）；`.github/` 保持未跟踪 —— push 的 PAT 无 `workflow` scope，入库会拒推 |

## 9. 文档索引

| 文件 | 内容 |
|------|------|
| [README.md](../README.md) | 项目概览、线上地址 |
| [CONTENT.md](./CONTENT.md) | 题库、双语、术语规范 |
| [AGENTS.md](../AGENTS.md) | AI 助手开发约定 |
