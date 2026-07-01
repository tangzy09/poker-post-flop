---
name: gen-poker-drills
description: Use when adding, expanding, or regenerating poker drill questions in this HU post-flop trainer — new courses, more questions per course, new action spots, or any change to the C13–C30 bank (scripts/courses-ext-data.js) or C1–C12 bank (js/content.js). Triggers on requests like "生成题目/加题/扩课/出题" for the question bank.
---

# 生成扑克训练题（生成 → 机械质检 → 盲解验证）

## 核心原则

**题库不能错。** 每道题的 `correct` 必须唯一、无争议，并经过两道独立把关:机械质检(脚本)+ 对抗性盲解(独立 agent 隐藏答案重解再比对)。

**不要让 agent 裸生成题目。** 实战中 agent 初稿有系统性错误:非法 leak 值、HU 不存在的位置(CO/MP)、board 与 hand 重复牌、牌力定性错(把 set 当中对)、街数与 board 长度不符。**自己设计**每题(像 C13 那样零返工),再用脚本+盲解兜底。

## 硬约束(违反必错)

- **HU 只有两个位置**: `BTN (IP)` 和 `BB (OOP)`。**绝不用 CO/MP/UTG/SB**。
- **leak 白名单(仅这 11 个)**: `too_tight, too_loose, sizing, range_blind, street_plan, concept_gap, texture, cbet, indifference, mdf, other`。
- **动作集由 `bet` 决定**(见 `scripts/gen-content-ext.js`):
  - `bet === 0` → `ACT` = `[check, bet]`(对手过牌/你先行动)
  - `bet > 0` 且非全压 → `FACE` = `[fold, call, raise]`
  - `bet > 0` 且 `allIn:true` → `FACE_CALL` = `[fold, call]`
  - `correct` 必须取自对应动作集。
- **无重复牌**: board + hand 所有牌两两不同(注意同点不同花，如 `9♠`(board) vs `9♥`(hand) 合法)。
- **双语**: 所有面向用户字符串走 `{ en, zh }` / `fb(en, zh)`，绝不硬编码英文。
- **街数 = board 长度**: flop=3、turn=4、river=5。turn/river 题在 mk 末尾加 `{ street: "turn" }` / `{ street: "river" }`；全压加 `{ allIn: true }`(可与 street 合并)。

## 每课 12 题的设计规则

1. **动作分布按主题均衡**——不是死板各 3 道，而是反映主题:防守课 call/fold 多、控池课 check 多、短码课 call/raise/fold 均衡、超池课 fold 多。避免单一动作压倒(如某 agent 初稿 call×7)。
2. **每题选无争议 spot**——避开 GTO solver 的**混合频率区**(边缘顶对 call/fold 摇摆、听牌 raise/call 摇摆、第二对薄价值 bet/check 摇摆)。摇摆题没有唯一正确答案，不该进题库。
3. **牌型定性准确**(按 board card 点数**降序**):顶对=配最高 board 牌；第二对=第二高；第三对=第三高；超对=口袋对 > 最高 board 牌；欠对=口袋对 < 最高 board 牌；set=口袋对配到 board 同点。
4. **听牌定性**: OESD=持 4 张连续(两头听)；gutshot=缺中间一张(4 outs)。**3 张连续(如 8-9-T)不是听牌**——成顺还需补 2 张。同花听=board+hand 共 4 张同花。
5. **feedback 只对非 correct 动作写**(correct=call → fbMap 写 `{fold, raise}`)。

`mk()` 签名:`mk(en_stem, zh_stem, en_label, zh_label, [board], pot, bet, "pos", [hand], [correct], "leak", {fbMap}, {extra})`。

## 完整流程

1. **设计** 12 题(遵守上面全部规则)。
2. **插入** `scripts/courses-ext-data.js` 对应课的 `]),` 之前(锚点用 `]),\n\n  /* ── cNN+1: ... ── */`)。
3. **改 drillCount**: `js/courses.js` 该课 `drillCount: 12` → `24`。
4. **生成**: `node scripts/gen-content-ext.js`。
5. **机械质检**(全绿才继续):
   ```bash
   npm test                        # 44 项:重复牌/牌型/术语/纹理/draw-type/结构
   npm run audit                   # 期望 699/699(或新总数)
   node scripts/audit-stem-spot.js # 题干文字 vs 牌面/手牌
   node tools/label-check.js       # 牌力标签体检:重算成牌/听牌 vs 文案(应 0 矛盾)
   node tools/verify-feedback.js   # 计算式反馈数学:逐题核对 explain 印的不等式(应 0 假)
   node tools/audit-made-hands.js  # 语义补充:强成手(顺/花/葫芦)误标为弱/fold
   ```
   **`label-check.js` 和 `verify-feedback.js` 是项目权威质检**(独立于 npm test):前者重算每题成牌/听牌对照文案声明,后者验证 `js/explain.js` 为新题自动生成的计算式反馈(outs/胜率/赔率/MDF)每个不等式为真。新出的 action 题会自动触发 explain 反馈,**必须过 verify-feedback**,否则会印出假数学。
6. **盲解**(对抗性验证):
   ```bash
   node tools/gen-solve-input.js cNN   # 写 .solve/cNN.solve.txt(已隐藏答案)
   ```
   派**独立 general-purpose agent(sonnet)** 读该 txt，按该课主题的 GTO 逻辑独立判断，写 `.solve/cNN.verdict.json`(`{"cNN-q1":{"best":[...],"also":[...],"conf":"高/中/低"}}`)。prompt 里说明该课主题的判断基线，强调"绝不假设题目预设答案正确"。
7. **比对**: `SOLVE_DIR=.solve node tools/compare-verdict.js`(或按题手动比对 `best` 是否包含 `correct`)。目标:新题(q13–q24)全部一致。
8. **消歧**: 分歧题几乎都是 solver 混合区。**改到答案唯一**(见下)，再复跑 5–7。

## 消歧手法(实战验证)

| 分歧类型 | 修法 |
|---|---|
| nut 听牌面对**中注**(2/3) raise vs call | 面对**小注**→改 call 明确;面对**中/大注**→改 raise 明确 |
| 边缘顶对**协调板** check-raise fold vs call | board 改 **broadway/干板** 让 fold(或 call)唯一 |
| 第二对 OOP 面对 2/3 call vs fold | 注尺寸改 **1/3**(MDF 要求防守→call 明确) |
| 两对面对 turn 加注 call vs raise | 干板→call(抓诈);湿板要保护→raise |

## 已知陷阱(本次真实踩过)

- **3 连 ≠ 顺听**:`A♥T♥` on `K-9-4-8`，8-9-T 只是 3 连，不是 OESD。要 OESD 需板凑成 `9-8-4-J`(8-9-T-J 四连)。审计脚本 `content-audit` 会抓 draw-type 误标。
- **中文"三条街"撞术语**:"三条"=set(trips)，与"超对"同题触发术语审计冲突 → 改用**"三街"**。
- **"ace-high" + "gutshot" 同题冲突**:术语审计报 `ace-high vs draw` → label/stem 只保留一个(留 gutshot)。
- **monotone/flush 声明只看 flop 前 3 张**:turn 补第 3 张同花的题，别在 stem 写"three spades / flush board"(会被当 flop texture 误报)→ 用"a flush is now possible"。
- **口袋对配 board 同点 = set**:`77` on `A-J-8-5-2`? 若 board 有 7 就是 set，无 7 才是欠对。
- **`.btn` 类名冲突**:范围矩阵格子/图例禁用 CSS 类 `btn`，用 `rng-open/rng-call/rng-both`(见 AGENTS.md)。

## 工具清单

| 工具 | 作用 |
|---|---|
| `node scripts/gen-content-ext.js` | C13–C30 源数据 → `js/content-ext.js` |
| `node tools/label-check.js` | 牌力标签体检:成牌/听牌重算 vs 文案(项目权威) |
| `node tools/verify-feedback.js` | 计算式反馈数学全量验证(项目权威) |
| `node tools/gen-solve-input.js cNN` | 生成答案隐藏的盲解输入 → `.solve/cNN.solve.txt` |
| `node tools/compare-verdict.js` | 比对盲解 verdict vs 题目 correct(`SOLVE_DIR` 指定目录) |
| `node tools/audit-made-hands.js` | 语义质检:强成手误标为弱/fold(补充 label-check) |

## 红旗——出现即停

- 用了 CO/MP/UTG 位置
- leak 不在 11 个白名单里
- board+hand 有重复牌
- 说 "OESD/两头顺听" 但实际只有 3 连或 gutshot
- 盲解 `best` 不含题目 `correct`、且信心为"高"→ 题目很可能错，别硬留
- 某题 call/raise/fold 明显摇摆 → 换成无争议 spot，不进题库
