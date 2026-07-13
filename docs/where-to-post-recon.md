# 发帖入口侦察清单（给浏览器插件执行）

> 用法：把下面「给插件的任务」整段贴给 Claude for Chrome（或任意浏览器 agent）。
> **插件只做侦察**：找到精确 URL + 摘录该站规则，**不要自动发帖、不要登录操作、不要提交任何内容**。
> 发布永远人工（原因见文末）。产品 = 双语英/中单挑翻后德州扑克训练器（教育、非真钱）。

---

## 给插件的任务（复制这段）

你是我的推广侦察助手。请依次访问下面每个站点，**只做两件事**：①找到"能发帖/能回答的精确页面 URL"；
②摘录该页面/板块关于"自我推广、发外链、发广告"的规则原文。**绝对不要替我发帖、回帖、登录或提交任何内容。**
最后用一张表汇总：`站点 | 精确发帖/回答 URL | 自我推广规则要点 | 结论(现在能发/先养号/仅联系编辑)`。

### 1. 2+2 论坛 — 商业软件板（现在能直接发产品帖）
- 从 `https://forumserver.twoplustwo.com/` 进入，找分类 **"Poker Software & Tools"** 下的
  **`Commercial Software`** 和 **`Commercial Marketplace`** 两个子板。
- 返回：这两个子板的**精确 URL**，以及点进去后"发新帖(New Thread)"页面的 URL；摘录板块置顶的发帖规则。
- 确认标准：该板块允许商家/个人直接发布产品广告帖。

### 2. 知乎 — 高意图问题（现在能直接回答）
- 访问 `https://www.zhihu.com/search?q=翻后%20GTO&type=content` 和
  `https://www.zhihu.com/search?q=德州扑克%20翻后%20学习&type=content`。
- 返回：**5 个赞同数高、且在问"怎么学翻后 / 哪个训练软件好 / GTO 新手入门"** 的**问题页 URL**
  （要"问题"页，不是专栏文章）。附每个问题的关注/浏览量。

### 3. Reddit — 先养号，别急着发产品
- 访问 `https://www.reddit.com/r/poker/` 和 `https://www.reddit.com/r/poker_theory/`。
- 返回：确认两个子版**确切名称**（`poker_theory` 是否带下划线）、订阅数、以及 **sidebar/规则页里
  关于 self-promotion / 发链接 / 10:1 规则的原文**。
- 顺带查是否还有活跃的 `r/PokerTheory`(无下划线)、`r/BeginnerPoker`、`r/GTO`，各返回订阅数。
- 结论标"先养号"（新号首帖发产品会被删）。

### 4. Discord — 找入口，先混后推
- 访问 `https://redchippoker.com/join-the-discord/` 和 `https://upswingpoker.com/discord/`。
- 返回：**Discord 邀请链接**；进服后（只读）找是否有 `#self-promo` / `#tools` 频道及其发帖规则。
- 结论标"先贡献 1–2 周 + 报备版主后才软推"。

### 5. 垂直媒体 — 找"投稿/联系编辑"入口（发布节点用）
- 目标站：PokerNews、PokerListings、GipsyTeam、somuchpoker、CardPlayer Lifestyle。
- 每站找 **"Contact / Submit a tip / Write for us / 编辑邮箱"** 页面 URL。
- 用途：产品上线时发 pitch 邮件求报道（新闻角度：首个中英双语·专攻单挑翻后·教育非真钱训练器）。

### 6.（可选）扩展扑克社区
- 搜 `disboard.org/servers/tag/poker`、`thehiveindex.com/topics/poker`，返回 3–5 个
  **策略/学习向**（非赌场社交向）Discord 的名称、人数、邀请链接。

**再次强调：你只找 URL 和摘录规则，不发任何东西。把结果给我，我人工发。**

---

## 为什么发布必须人工（别让插件自动发）
- **养号是真人行为**：Reddit/2+2 要先纯答题攒信誉，机器人式发帖被版主和硬核用户一眼识破，AI 水贴对"会算 MDF 的用户"是反向广告。
- **账号-域名连坐**：一旦被判自动化推广，封号 + 标记你的域名/App 名，全平台连坐，SEO 资产一起烧。
- **回评要真懂牌**：发帖后 2 小时接住手牌质疑、辩 c-bet 频率，需要你的真实判断，冒充即塌。
- 所以最优分工始终是：**插件侦察 + AI 写稿 → 你审 → 你亲手发**。
