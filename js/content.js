/* content.js — learn slides + drill questions (courses c1–c12) */

function _r(key, en, zh) {
  reg(key, en, zh);
}

function registerContentStrings() {
  // —— C1 learn ——
  _r("c1.l1.t", "What are pot odds?", "什么是底池赔率？");
  _r("c1.l1.b", "Pot odds compare the <b>cost of a call</b> to the <b>total pot you can win</b>. If the pot is 100 and you must call 50, you are getting 150:50 = <b>3:1</b>. You need to win more than 25% of the time for a call to break even.", "底池赔率比较<b>跟注成本</b>与<b>可赢总底池</b>。底池 100、跟注 50，赔率为 150:50 = <b>3:1</b>。盈亏平衡需胜率 > 25%。");
  _r("c1.l2.t", "Minimum Defense Frequency (MDF)", "最小防守频率 MDF");
  _r("c1.l2.b", "When facing a bet, MDF tells you the <b>minimum fraction of your range</b> that must continue to prevent villain from profiting with any two cards. Formula: <b>MDF = 1 − bet/(pot + bet)</b>. Vs a pot-sized bet: MDF = 50%.", "面对下注时，MDF 是你范围中<b>必须继续的最低比例</b>，防止对手任意两张牌盈利。公式：<b>MDF = 1 − 下注/(底池+下注)</b>。面对底池下注：MDF = 50%。");
  _r("c1.l3.t", "MDF is about ranges, not single hands", "MDF 针对范围，而非单手牌");
  _r("c1.l3.b", "A single bluff-catcher might fold or call, but <b>across your whole defending range</b> you must hit MDF on average. Folding every marginal hand lets villain auto-profit.", "单手抓诈牌可弃可跟，但<b>整个防守范围</b>平均必须达到 MDF。把所有边缘牌都弃掉会让对手自动盈利。");

  _r("c1.q1.s", "Pot is 80, villain bets 40. What pot odds are you getting on a call?", "底池 80，对手下注 40。跟注的底池赔率是多少？");
  _r("c1.q1.a", "3:1 (call 40 to win 120)", "3:1（跟注 40 赢 120）");
  _r("c1.q1.b", "2:1 (call 40 to win 80)", "2:1（跟注 40 赢 80）");
  _r("c1.q1.c", "4:1", "4:1");
  _r("c1.q1.d", "1:1", "1:1");
  _r("c1.q1.fb.b", "Pot odds use the pot after villain bets: 80+40=120 vs your 40 call → 3:1.", "底池赔率 = 跟注后总底池 : 跟注 = 120 : 40 = 3:1。");

  _r("c1.q2.s", "Pot is 100, villain bets 100 (pot-sized). What is MDF?", "底池 100，对手底池下注 100。MDF 是多少？");
  _r("c1.q2.a", "50%", "50%");
  _r("c1.q2.b", "33%", "33%");
  _r("c1.q2.c", "67%", "67%");
  _r("c1.q2.d", "25%", "25%");
  _r("c1.q2.fb.b", "MDF = 1 − 100/(100+100) = 1 − 0.5 = 50%.", "MDF = 1 − 100/200 = 50%。");

  _r("c1.q3.s", "Pot is 100, villain bets 50 (half-pot). Approximate MDF?", "底池 100，对手半池下注 50。MDF 约多少？");
  _r("c1.q3.a", "67%", "67%");
  _r("c1.q3.b", "50%", "50%");
  _r("c1.q3.c", "33%", "33%");
  _r("c1.q3.d", "75%", "75%");
  _r("c1.q3.fb.a", "MDF = 1 − 50/150 ≈ 67%. Smaller bets require more defense.", "MDF = 1 − 50/150 ≈ 67%。下注越小，需防守越多。");

  _r("c1.q4.s", "You have a bluff-catcher on the river facing a pot bet. Villain is polarized. Best default action?", "河牌用抓诈牌面对底池下注，对手极化。默认最佳行动？");
  _r("c1.q4.fb.fold", "Folding always makes polarized bets automatically profitable. Defend at MDF — this hand class is a classic call.", "对极化下注总弃牌会让对手自动盈利。需按 MDF 防守 — 这类牌典型应跟注。");
  _r("c1.q4.ctx", "HU river, pot=100, facing pot bet. You hold a medium-strength bluff-catcher.", "单挑河牌，底池 100，面对底池下注。你持中等抓诈牌。");

  _r("c1.q5.s", "Pot is 60, villain bets 20. Break-even equity needed for a call?", "底池 60，对手下注 20。跟注盈亏平衡胜率？");
  _r("c1.q5.a", "20%", "20%");
  _r("c1.q5.b", "25%", "25%");
  _r("c1.q5.c", "33%", "33%");
  _r("c1.q5.d", "40%", "40%");
  _r("c1.q5.fb.b", "After villain bets, the pot is 60+20=80. You call 20, so you risk 20 to win a final pot of 100 → 20/100 = 20%.", "对手下注后底池为 60+20=80。你跟注 20，即以 20 博取最终 100 的底池 → 20/100 = 20%。");

  _r("c1.q6.s", "Why can't you fold 100% of bluff-catchers vs polarized bets?", "为何不能对极化下注 100% 弃掉抓诈牌？");
  _r("c1.q6.a", "Villain would profit betting any two cards", "对手用任意牌下注都能盈利");
  _r("c1.q6.b", "Pot odds always force a call", "底池赔率总是强制跟注");
  _r("c1.q6.c", "Bluff-catchers always beat bluffs", "抓诈牌总能赢诈唬");
  _r("c1.q6.d", "MDF only applies preflop", "MDF 仅适用于翻前");
  _r("c1.q6.fb.b", "If you never defend, villain's bluffs become automatically profitable. MDF is the minimum defend rate to stop that.", "从不防守则对手诈唬自动盈利。MDF 是阻止这一点的最低防守频率。");

  _r("c1.q7.s", "Pot 90, bet 30. MDF ≈ ?", "底池 90，下注 30。MDF ≈ ？");
  _r("c1.q7.a", "75%", "75%");
  _r("c1.q7.b", "67%", "67%");
  _r("c1.q7.c", "50%", "50%");
  _r("c1.q7.d", "80%", "80%");
  _r("c1.q7.fb.a", "MDF = 1 − 30/120 = 75%.", "MDF = 1 − 30/120 = 75%。");

  _r("c1.q8.s", "Facing a half-pot bet, do you defend more or less than vs a pot bet?", "面对半池下注，防守应多于还是少于底池下注？");
  _r("c1.q8.a", "More — MDF is higher", "更多 — MDF 更高");
  _r("c1.q8.b", "Less — MDF is lower", "更少 — MDF 更低");
  _r("c1.q8.c", "Same MDF always", "MDF 总是相同");
  _r("c1.q8.d", "Always fold", "总是弃牌");
  _r("c1.q8.fb.b", "Smaller bets need higher MDF (~67% half-pot vs 50% pot).", "下注越小 MDF 越高（半池约 67% vs 底池 50%）。");

  // C2
  _r("c2.title", "Pot Odds, MDF & Implied Odds", "底池赔率、MDF 与隐含赔率");
  _r("c2.sub", "Foundations of profitable defense", "盈利防守的基础");
  _r("c2.l1.t", "What are pot odds?", "什么是底池赔率？");
  _r("c2.l1.b", "Pot odds compare the <b>cost of a call</b> to the <b>total pot you can win</b>. If the pot is 100 and you must call 50, you are getting 150:50 = <b>3:1</b>. You need to win more than 25% of the time for a call to break even.", "底池赔率比较<b>跟注成本</b>与<b>可赢总底池</b>。底池 100、跟注 50，赔率为 150:50 = <b>3:1</b>。盈亏平衡需胜率 > 25%。");
  _r("c2.l2.t", "Minimum Defense Frequency (MDF)", "最小防守频率 MDF");
  _r("c2.l2.b", "Facing a bet, MDF is the <b>minimum fraction of your range</b> that must continue so villain can't profit by betting any two cards: <b>MDF = 1 − bet/(pot+bet)</b>. Vs a pot bet: 50%. It's a <b>range</b> rule — a single hand may fold or call, but on average you must hit MDF.", "面对下注时，MDF 是你范围中<b>必须继续的最低比例</b>，防止对手任意两张牌盈利：<b>MDF = 1 − 下注/(底池+下注)</b>。面对底池下注：50%。这是<b>范围</b>概念 — 单手牌可弃可跟，但整体平均必须达到 MDF。");
  _r("c2.l3.t", "Implied & reverse implied odds", "隐含与反向隐含赔率");
  _r("c2.l3.b", "<b>Implied odds</b> add the chips you expect to win <b>after</b> hitting — a call short on direct odds can still be right if you stack villain later. <b>Reverse implied odds</b> are the chips you lose when you hit but stay dominated (small flush vs big flush). Implied odds matter most <b>deep, on draw-heavy boards, vs players who pay off</b>.", "<b>隐含赔率</b>加上命中<b>之后</b>预期多赢的筹码 — 即使直接赔率不够，若能赢光对手，跟注仍可能正确。<b>反向隐含赔率</b>是命中但仍被压制（小同花 vs 大同花）时多输的筹码。隐含赔率在<b>深筹、听牌面、愿付钱的对手</b>时最重要。");

  _r("c2.q1.s", "You have a flush draw on the flop. Which factor most increases implied odds?", "翻牌有同花听牌。哪项最提高隐含赔率？");
  _r("c2.q1.a", "Deep effective stacks", "深有效筹码");
  _r("c2.q1.b", "Short stacks", "浅筹码");
  _r("c2.q1.c", "Dry ace-high board", "干燥 A 高面");
  _r("c2.q1.d", "Four-way pot", "四人底池");
  _r("c2.q2.s", "Small flush on a paired board — main risk?", "配对面上小同花 — 主要风险？");
  _r("c2.q2.a", "Reverse implied odds — dominated when flush hits", "反向隐含赔率 — 成花被压制");
  _r("c2.q2.b", "No implied odds exist on paired boards", "配对面无隐含赔率");
  _r("c2.q2.c", "Always has nut advantage", "总有坚果优势");
  _r("c2.q2.d", "MDF increases", "MDF 提高");

  // C3
  _r("c3.l1.t", "Range advantage", "范围优势");
  _r("c3.l1.b", "The player whose range contains <b>more strong hands</b> on this board has range advantage. They can bet more often and at higher frequency.", "范围中<b>强牌更多</b>的一方拥有范围优势，可以更频繁、更高比例下注。");
  _r("c3.l2.t", "Nut advantage", "坚果优势");
  _r("c3.l2.b", "Even with range advantage, if villain holds <b>more nutted combos</b> (sets, straights), be careful — your value bets get called by better.", "即使有范围优势，若对手<b>坚果组合更多</b>（三条、顺子），需谨慎 — 价值下注会被更好牌跟注。");
  _r("c3.l3.t", "Practical takeaway", "实战要点");
  _r("c3.l3.b", "Preflop aggressor often has range advantage on <b>high-card, dry flops</b>. Caller has advantage on <b>low, connected flops</b> that hit their calling range.", "翻前进攻者在<b>高牌干燥翻牌</b>常有范围优势。跟注者在<b>低牌连接面</b>更有优势。");

  // C4-C12 learn (compact)
  _r("c4.l1.t", "Dry boards", "干燥牌面");
  _r("c4.l1.b", "Few draws, disconnected cards (K♠7♦2♣). Favors preflop raiser. High continuation-bet frequency.", "听牌少、牌不连接（如 K72r）。利于翻前加注者，持续下注频率高。");
  _r("c4.l2.t", "Wet boards", "湿润牌面");
  _r("c4.l2.b", "Connected, flush draws (9♠8♠7♦). Favors caller's range. Check more, bet smaller.", "连接、有同花听（如 987）。利于跟注者范围，多过牌、下注更小。");
  _r("c4.l3.t", "Dynamic vs static", "动态 vs 静态");
  _r("c4.l3.b", "Dynamic boards change nuts often (draws complete). Static boards (paired, rainbow) stay stable — bet for value/protection early.", "动态面坚果常变（听牌完成）。静态面（配对、彩虹）稳定 — 尽早价值/保护下注。");

  _r("c5.l1.t", "Why continuation bet?", "为何持续下注？");
  _r("c5.l1.b", "As the preflop raiser IP, you often have range + position advantage. Continuation bets fold out equity and build pots with value.", "作为有位置翻前加注者，常有范围+位置优势。持续下注可打掉对手胜率并用价值牌建池。");
  _r("c5.l2.t", "Frequency vs size", "频率 vs 尺寸");
  _r("c5.l2.b", "On dry boards: bet often, smaller size. On wet boards: bet selectively, larger size with strong hands/draws.", "干燥面：高频小注。湿润面：选择性下注，强牌/听牌用大注。");
  _r("c5.l3.t", "When to check back", "何时过牌");
  _r("c5.l3.b", "Check medium-strength hands, give up on terrible boards for your range, and trap with very strong hands occasionally.", "中等牌力过牌，范围不利的面放弃，极强牌偶尔慢打。");

  _r("c6.l1.t", "Defending OOP", "无位置防守");
  _r("c6.l1.b", "You can't realize equity as well OOP. Defend less than IP, but still respect MDF vs small bets.", "无位置更难实现胜率。防守少于有位置，但面对小注仍需尊重 MDF。");
  _r("c6.l2.t", "Check-raise for value & bluffs", "价值与诈唬的过牌加注");
  _r("c6.l2.b", "Use check-raises on wet boards with strong hands and some draws. Forces folds and builds pots.", "湿润面用强牌和部分听牌过牌加注，逼迫弃牌并建池。");
  _r("c6.l3.t", "Fold discipline", "弃牌纪律");
  _r("c6.l3.b", "Fold the bottom of your range vs large bets on bad boards. Don't defend out of stubbornness.", "不利面上对大注弃掉范围底部，不要固执防守。");

  _r("c7.l1.t", "Polarized betting", "极化下注");
  _r("c7.l1.b", "River bets are often <b>polarized</b>: nuts + bluffs, rarely medium hands. Medium hands prefer check.", "河牌下注常<b>极化</b>：坚果+诈唬，中等牌少下注，多过牌。");
  _r("c7.l2.t", "Bluff-catching", "抓诈");
  _r("c7.l2.b", "Bluff-catchers beat bluffs but lose to value. Call at MDF frequency vs polarized bets.", "抓诈牌赢诈唬输价值。对极化下注按 MDF 频率跟注。");
  _r("c7.l3.t", "Solver spot: pot bet MDF = 50%", "Solver 局面：底池下注 MDF = 50%");
  _r("c7.l3.b", "In our HU solver spot, OOP bets pot with nuts always and mixes air. IP's bluff-catcher calls 50%.", "HU solver 局面中，OOP 坚果总是下注、空气混合。IP 抓诈牌 50% 跟注。");

  _r("c8.l1.t", "Indifference", "无差异");
  _r("c8.l1.b", "When two actions have the <b>same EV</b>, strategy is indifferent — any mix is fine. GTO uses this to balance.", "两种行动 <b>EV 相同</b> 时策略无差异 — 任意混合均可。GTO 用此平衡。");
  _r("c8.l2.t", "Nuts vs pure air", "坚果 vs 纯空气");
  _r("c8.l2.b", "If villain only folds, betting nuts is <b>not required</b> — check wins the same pot. Solver may mix arbitrarily.", "若对手只弃牌，下注坚果<b>非必须</b> — 过牌赢同样底池。Solver 可任意混合。");
  _r("c8.l3.t", "Don't overfit to frequencies", "不要过度拟合频率");
  _r("c8.l3.b", "In indifferent spots, the frequency is not a 'rule' — focus on which hands belong in each action.", "无差异局面中，频率不是「规则」 — 关注哪些牌属于哪种行动。");

  _r("c9.l1.t", "Turn barrels", "转牌第二枪");
  _r("c9.l1.b", "Barrel when: scare card favors your range, you have equity/draws, villain's flop calls are capped.", "适合开第二枪：吓人牌利于你的范围、有胜率/听牌、对手翻牌跟注范围受限。");
  _r("c9.l2.t", "Give up", "放弃");
  _r("c9.l2.b", "Check turn when: board misses your range, you have no equity, villain shows strength.", "应过牌：牌面对你不利、无胜率、对手示强。");
  _r("c9.l3.t", "Plan from the flop", "从翻牌规划");
  _r("c9.l3.b", "Before betting the flop, ask: which turns will I barrel? Which will I give up? Avoid betting flop with no plan.", "翻牌下注前先问：哪些转牌继续？哪些放弃？避免无计划下注。");

  _r("c10.l1.t", "River value", "河牌价值");
  _r("c10.l1.b", "Bet hands that beat >50% of villain's calling range. Size up vs inelastic callers (they call same with top pair or two pair).", "用能赢对手跟注范围 >50% 的牌下注。对非弹性跟注者加大尺寸（他们持顶对或两对都同样跟注）。");
  _r("c10.l2.t", "Bluff selection", "诈唬选择");
  _r("c10.l2.b", "Bluff with blockers to nuts (e.g. Ah on three-heart board). Avoid bluffing into calling stations.", "用阻断坚果的牌诈唬（如三花面持 Ah）。避免对跟注站诈唬。");
  _r("c10.l3.t", "Over-bluffing loses", "过度诈唬会亏");
  _r("c10.l3.b", "Each bluff needs enough fold equity. If villain's range is mostly strong, bluff less.", "每次诈唬需足够弃牌率。对手范围偏强时少诈唬。");

  _r("c11.l1.t", "Check-raise", "过牌加注");
  _r("c11.l1.b", "Powerful OOP line: check-raise for value with strong hands, semi-bluff with draws on wet boards.", "无位置强力线：强牌价值过牌加注，湿润面用听牌半诈唬。");
  _r("c11.l2.t", "Probe bet", "试探下注");
  _r("c11.l2.b", "When aggressor checks back flop, lead turn with hands that need protection or thin value — a 'probe'.", "翻前进攻者翻牌过牌后，用需保护或薄价值的牌在转牌领打 — 即试探下注。");
  _r("c11.l3.t", "Don't overuse", "不要滥用");
  _r("c11.l3.b", "Check-raises and probes are higher variance. Use on boards that favor your range.", "过牌加注和试探下注波动更大。在利于你范围的牌面使用。");

  _r("c12.l1.t", "SPR defined", "SPR 定义");
  _r("c12.l1.b", "<b>SPR = effective stack / pot</b>. Low SPR (<4): commit with top pair+. High SPR (>10): need stronger hands to stack off.", "<b>SPR = 有效筹码 / 底池</b>。低 SPR（<4）：顶对+可承诺。高 SPR（>10）：需更强牌全下。");
  _r("c12.l2.t", "Commitment decisions", "承诺决策");
  _r("c12.l2.b", "With SPR 2, pot-sized bets commit you. Plan stack-off ranges before betting — don't bet/fold incorrectly.", "SPR 2 时，底池下注即承诺。下注前规划全下范围 — 避免错误 bet/fold。");
  _r("c12.l3.t", "Tournament adjustment", "锦标赛调整");
  _r("c12.l3.b", "Short tournament stacks create low SPR by default — tighten stack-off requirements.", "锦标赛短筹码天然低 SPR — 收紧全下标准。");

  // Concept labels (shown in feedback "Concept" block)
  _r("concept.implied", "Implied & reverse implied odds", "隐含赔率与反向隐含赔率");
  _r("concept.range_adv", "Range & nut advantage", "范围优势与坚果优势");
  _r("concept.texture", "Board texture & sizing", "牌面纹理与下注尺寸");
  _r("concept.cbet", "Continuation betting in position", "有位置持续下注");
  _r("concept.defense", "Defending vs continuation bets", "防守持续下注");
  _r("concept.turn", "Turn barreling & planning", "转牌第二枪与规划");
  _r("concept.river", "River value & bluff selection", "河牌价值与诈唬选择");
  _r("concept.cr", "Check-raises & probe bets", "过牌加注与试探下注");
  _r("concept.spr", "SPR & commitment", "SPR 与承诺");

  // Generic feedback templates
  _r("fb.generic.fold_tight", "This folds too often — villain can exploit you by betting wider or bluffing more.", "防守过紧：弃牌过多会让对手用更宽范围下注或更频繁诈唬来剥削你。");
  _r("fb.generic.call_loose", "This call doesn't meet the required pot odds — or you're dominated when you hit.", "跟注过松：底池赔率不足，或命中后仍被压制。");
  _r("fb.generic.check_passive", "Checking gives up value or fold equity you should capture here.", "过牌会错过应有的价值或弃牌率。");
  _r("fb.generic.bet_bad", "This bet neither extracts value nor credibly represents a strong hand.", "这注既榨不到价值，也不像可信的强牌代表。");

  // Readable aliases for leak codes (shown in the feedback "Concept" block)
  _r("concept_gap", "Core concept", "核心概念");
  _r("mdf", "MDF & pot odds", "MDF 与底池赔率");
  _r("polarization", "Polarization & bluff-catching", "极化下注与抓诈");
  _r("sizing", "Bet sizing", "下注尺寸");
  _r("too_tight", "Defending too tight", "防守过紧");
  _r("too_loose", "Continuing too loose", "跟注/继续过松");
  _r("street_plan", "Multi-street plan", "多街计划");
  _r("range_blind", "Range advantage", "范围优势");
  _r("indifference", "Indifference & mixing", "无差异与混合");

  _r("spot.lbl.aa_bc", "AA bluff-catcher", "AA 抓诈牌");
  _r("spot.lbl.jj_over", "JJ overpair", "JJ 超对");
  _r("spot.lbl.set_jacks", "Set of Jacks", "J 三条");

  // —— C8 drill questions (indifference & mixed strategies) ——
  _r("c8.q2.s", "What does it mean when two actions are 'indifferent' in GTO?", "在 GTO 中两种行动「无差异」是什么意思？");
  _r("c8.q2.a", "They have equal EV, so any mix between them is fine", "它们 EV 相同，任意混合都可以");
  _r("c8.q2.b", "One action is always strictly better", "总有一种行动严格更优");
  _r("c8.q2.c", "You must always check", "必须总是过牌");
  _r("c8.q2.d", "It can only happen preflop", "只可能发生在翻前");
  _r("c8.q2.fb", "Indifference means equal EV — the solver can mix in any proportion without losing value.", "无差异即 EV 相等 — solver 可任意比例混合而不损失价值。");

  _r("c8.q3.s", "You hold the nuts on the river. Villain's range is pure air that will only fold or check — it never pays off a bet. Why might betting NOT gain over checking?", "河牌你持坚果。对手范围是纯空气，只会弃牌或过牌，绝不跟注。为何下注未必比过牌多赢？");
  _r("c8.q3.a", "Villain folds everything worse, so a bet wins the same pot a check already wins", "对手会弃掉所有更差的牌，下注赢到的底池和过牌一样");
  _r("c8.q3.b", "Betting the nuts always wins more money", "用坚果下注总能多赢钱");
  _r("c8.q3.c", "The nuts must always be bet", "坚果必须总是下注");
  _r("c8.q3.d", "You should fold the nuts", "你应该弃掉坚果");
  _r("c8.q3.fb", "If villain only folds, a bet gains nothing extra — check and bet are indifferent for the nuts here.", "若对手只弃牌，下注没有额外收益 — 此时坚果的过牌与下注无差异。");

  _r("c8.q4.s", "In a mixed strategy, why does GTO bluff at a specific frequency?", "在混合策略中，GTO 为何按特定频率诈唬？");
  _r("c8.q4.a", "To make villain's bluff-catchers exactly indifferent between calling and folding", "让对手的抓诈牌在跟注与弃牌之间恰好无差异");
  _r("c8.q4.b", "To always get called", "为了总是被跟注");
  _r("c8.q4.c", "To never get called", "为了从不被跟注");
  _r("c8.q4.d", "Frequencies are random and don't matter", "频率是随机的，无所谓");
  _r("c8.q4.fb", "The value-to-bluff ratio is set so bluff-catchers are indifferent — that's what makes the strategy unexploitable.", "价值与诈唬之比使抓诈牌无差异 — 这正是策略不可剥削的原因。");

  _r("c8.q5.s", "A solver shows a hand mixing 50% bet / 50% check. What is the best practical takeaway?", "solver 显示某手牌 50% 下注 / 50% 过牌。最实用的结论是什么？");
  _r("c8.q5.a", "Both actions have similar EV; either is fine — focus on which hands belong in each action", "两种行动 EV 相近，任选其一即可 — 重点是哪些牌属于哪种行动");
  _r("c8.q5.b", "You must bet this exact hand exactly half the time or it's a mistake", "必须恰好一半时间下注这手牌，否则就是错误");
  _r("c8.q5.c", "Checking this hand is always a mistake", "用这手牌过牌总是错误");
  _r("c8.q5.d", "Betting this hand is always a mistake", "用这手牌下注总是错误");
  _r("c8.q5.fb", "A 50/50 mix means the two actions are close in EV. Don't memorize the exact number — learn which hands mix.", "50/50 表示两种行动 EV 接近。不要死记具体数字 — 要理解哪些牌该混合。");

  _r("c8.q6.s", "Why are value bets and bluffs bet at balanced, related frequencies?", "为何价值下注与诈唬要按平衡且相关的频率进行？");
  _r("c8.q6.a", "So villain can't profitably deviate by always calling or always folding", "让对手无法通过总跟或总弃来盈利偏离");
  _r("c8.q6.b", "To confuse the dealer", "为了迷惑荷官");
  _r("c8.q6.c", "Because air is always stronger than value", "因为空气总比价值牌强");
  _r("c8.q6.d", "Balance is irrelevant in GTO", "平衡在 GTO 中无关紧要");
  _r("c8.q6.fb", "Balanced frequencies keep villain indifferent — if you bluff too much or too little, they exploit you.", "平衡频率让对手无差异 — 诈唬过多或过少都会被剥削。");

  _r("c8.q7.s", "Your opponent NEVER bluffs the river. How should you adjust away from balanced theory?", "你的对手河牌从不诈唬。相对平衡理论你该如何调整？");
  _r("c8.q7.a", "Over-fold your bluff-catchers — indifference no longer applies vs a non-bluffer", "多弃抓诈牌 — 面对从不诈唬者，无差异不再成立");
  _r("c8.q7.b", "Call even more bluff-catchers", "用更多抓诈牌跟注");
  _r("c8.q7.c", "Never fold anything", "什么都不弃");
  _r("c8.q7.d", "Always raise the river", "河牌总是加注");
  _r("c8.q7.fb", "MDF defends against a balanced bettor. Vs someone who never bluffs, exploit by folding bluff-catchers.", "MDF 是防守平衡下注者。面对从不诈唬的人，应弃掉抓诈牌进行剥削。");

  _r("c8.q8.s", "A solver bets a hand 30% and checks 70%. The 30% number is best understood as:", "solver 用某手牌 30% 下注、70% 过牌。这个 30% 最好理解为：");
  _r("c8.q8.a", "An indifference point — the exact frequency isn't a rule to memorize", "一个无差异点 — 具体频率不是要死记的规则");
  _r("c8.q8.b", "A strict law you must hit on every single hand", "一条每手牌都必须命中的严格法则");
  _r("c8.q8.c", "Proof that checking is wrong", "证明过牌是错的");
  _r("c8.q8.d", "Proof that betting is wrong", "证明下注是错的");
  _r("c8.q8.fb", "Mixed frequencies mark indifference. Understand why the hand mixes rather than trying to hit 30% exactly.", "混合频率标志无差异。要理解该牌为何混合，而非强求恰好 30%。");

  // —— C7 extra drill questions (q9–q24): polarization & bluff-catching. Answer is always "a". ——
  _r("c7.q9.s", "What is a 'polarized' betting range?", "什么是「极化」下注范围？");
  _r("c7.q9.a", "Strong value hands and bluffs, with few medium hands", "强价值牌与诈唬，几乎没有中等牌");
  _r("c7.q9.b", "Only medium-strength hands", "只有中等强度的牌");
  _r("c7.q9.c", "Only bluffs", "只有诈唬");
  _r("c7.q9.d", "A random, balanced mix of everything", "各种牌随机均匀混合");
  _r("c7.q9.fb", "Polarized = nuts/strong value + bluffs, and very few medium hands.", "极化＝坚果/强价值＋诈唬，几乎没有中等牌。");

  _r("c7.q10.s", "Against a polarized bet, what role do your medium-strength hands play?", "面对极化下注，你的中等牌起什么作用？");
  _r("c7.q10.a", "Bluff-catchers — they beat bluffs but lose to value", "抓诈牌 — 赢诈唬、输价值");
  _r("c7.q10.b", "Value raises", "价值加注");
  _r("c7.q10.c", "They should always fold", "它们应该总是弃牌");
  _r("c7.q10.d", "They are the nuts", "它们是坚果牌");
  _r("c7.q10.fb", "Vs a polar range your medium hands can only catch bluffs — they beat air, lose to value.", "面对极化范围，中等牌只能抓诈 — 赢空气、输价值。");

  _r("c7.q11.s", "Why can't you fold ALL your bluff-catchers vs a polarized bet?", "为何不能对极化下注弃掉所有抓诈牌？");
  _r("c7.q11.a", "Villain could profitably bluff with any two cards", "对手用任意两张牌诈唬都能盈利");
  _r("c7.q11.b", "Pot odds force a raise", "底池赔率强制加注");
  _r("c7.q11.c", "Bluff-catchers always win", "抓诈牌总会赢");
  _r("c7.q11.d", "Folding is against the rules", "弃牌违反规则");
  _r("c7.q11.fb", "If you over-fold, a pure bluff becomes automatically profitable. Defend enough (MDF) to stop it.", "若过度弃牌，纯诈唬就自动盈利。要按 MDF 防守足够阻止它。");

  _r("c7.q12.s", "A 'merged' (non-polarized) value range mostly contains…", "「合并型」（非极化）价值范围主要包含…");
  _r("c7.q12.a", "Value and medium hands that want calls from worse", "希望被更差牌跟注的价值与中等牌");
  _r("c7.q12.b", "Only bluffs and the nuts", "只有诈唬与坚果");
  _r("c7.q12.c", "Only air", "只有空气");
  _r("c7.q12.d", "No value hands at all", "完全没有价值牌");
  _r("c7.q12.fb", "Merged ranges bet many medium-strong hands for thin value, not just nuts + air.", "合并型范围用许多中强牌做薄价值，而不只是坚果＋空气。");

  _r("c7.q13.s", "Why do blockers matter when bluff-catching?", "抓诈唬时阻断牌为何重要？");
  _r("c7.q13.a", "Holding a card that blocks villain's value combos makes calling better", "持有阻断对手价值组合的牌会让跟注更好");
  _r("c7.q13.b", "They physically change the board", "它们会改变公共牌");
  _r("c7.q13.c", "They guarantee you win", "它们保证你赢");
  _r("c7.q13.d", "Blockers never matter", "阻断牌从不重要");
  _r("c7.q13.fb", "Blocking value combos (and unblocking bluffs) tilts a close call toward profitable.", "阻断价值组合（并不阻断诈唬）会让一个临界跟注偏向盈利。");

  _r("c7.q14.s", "When villain uses a very large bet or overbet, their range is usually…", "当对手使用很大的下注或超池下注，其范围通常…");
  _r("c7.q14.a", "More polarized — nuts or air", "更极化 — 坚果或空气");
  _r("c7.q14.b", "Full of medium hands", "满是中等牌");
  _r("c7.q14.c", "Only medium hands", "只有中等牌");
  _r("c7.q14.d", "Completely random", "完全随机");
  _r("c7.q14.fb", "Bigger sizes are used with stronger value and more bluffs — a more polarized range.", "更大尺寸用于更强价值与更多诈唬 — 范围更极化。");

  _r("c7.q15.s", "Facing a polarized pot-sized bet, MDF says defend roughly…", "面对极化的底池下注，MDF 大约要求防守…");
  _r("c7.q15.a", "About 50% of your range", "约 50% 的范围");
  _r("c7.q15.b", "100% of your range", "100% 的范围");
  _r("c7.q15.c", "About 25%", "约 25%");
  _r("c7.q15.d", "0% — always fold", "0% — 总是弃牌");
  _r("c7.q15.fb", "MDF vs a pot-sized bet = 1 − 1/2 = 50%.", "面对底池下注的 MDF = 1 − 1/2 = 50%。");

  _r("c7.q16.s", "Your bluff-catcher beats all bluffs and loses to all value. Calling is profitable when…", "你的抓诈牌赢所有诈唬、输所有价值。何时跟注盈利？");
  _r("c7.q16.a", "Villain bluffs often enough to meet the required equity", "对手诈唬频率足以达到所需胜率");
  _r("c7.q16.b", "Never, under any condition", "在任何情况下都不");
  _r("c7.q16.c", "Only if you hold the nuts", "只有当你持坚果时");
  _r("c7.q16.d", "Always, regardless of bluff frequency", "总是，无论诈唬频率");
  _r("c7.q16.fb", "A bluff-catcher's call is +EV exactly when villain's bluff frequency clears the pot-odds threshold.", "当对手诈唬频率越过底池赔率门槛，抓诈跟注即为正期望。");

  _r("c7.q17.s", "All else equal, which makes the BEST bluff-catcher?", "其他条件相同，哪种牌是最好的抓诈牌？");
  _r("c7.q17.a", "A hand that blocks villain's value combos", "阻断对手价值组合的牌");
  _r("c7.q17.b", "A hand that blocks villain's bluffs", "阻断对手诈唬的牌");
  _r("c7.q17.c", "A hand with no blockers at all", "完全没有阻断的牌");
  _r("c7.q17.d", "The weakest hand you can hold", "你能持有的最弱的牌");
  _r("c7.q17.fb", "Bluff-catch with hands that block value and unblock bluffs \u2014 that maximizes how often you beat a bet.", "用阻断价值、不阻断诈唬的牌抓诈 \u2014 这最大化你赢过下注的频率。");

  _r("c7.q18.s", "Over-folding vs a balanced polarized bettor lets them…", "面对平衡的极化下注者过度弃牌会让他们…");
  _r("c7.q18.a", "Profitably bluff more (automatic profit)", "更频繁诈唬并盈利（自动盈利）");
  _r("c7.q18.b", "Lose money over time", "长期亏钱");
  _r("c7.q18.c", "Never bluff again", "再也不诈唬");
  _r("c7.q18.d", "Fold more themselves", "他们自己更常弃牌");
  _r("c7.q18.fb", "If you defend below MDF, every bluff combo becomes automatically profitable for villain.", "若你防守低于 MDF，对手每个诈唬组合都自动盈利。");

  _r("c7.q19.s", "Calling too much vs an opponent who rarely bluffs leads to…", "面对很少诈唬的对手跟注过多会导致…");
  _r("c7.q19.a", "Paying off too many value bets", "赔付过多价值下注");
  _r("c7.q19.b", "Winning more in the long run", "长期赢更多");
  _r("c7.q19.c", "No change in results", "结果不变");
  _r("c7.q19.d", "Forcing villain to fold", "迫使对手弃牌");
  _r("c7.q19.fb", "Vs a non-bluffer, MDF doesn't apply \u2014 over-calling just pays off value. Fold more.", "面对不诈唬者 MDF 不适用 \u2014 过度跟注只是赔付价值。应多弃。");

  _r("c7.q20.s", "Why is turning a medium hand into a raise vs a polarized bet usually bad?", "为何把中等牌变成加注去对抗极化下注通常不好？");
  _r("c7.q20.a", "You fold out bluffs and only get action from value", "你赶走诈唬，只被价值牌跟/再加");
  _r("c7.q20.b", "It always wins the pot", "它总能赢下底池");
  _r("c7.q20.c", "Your medium hand is the nuts", "你的中等牌就是坚果");
  _r("c7.q20.d", "There is no downside", "没有任何坏处");
  _r("c7.q20.fb", "Raising a bluff-catcher folds out the hands you beat and isolates you against value \u2014 just call.", "用抓诈牌加注赶走你能赢的牌，只剩被价值牌针对 \u2014 应平跟。" );

  _r("c7.q21.s", "A 'capped' range means it…", "「封顶」的范围意味着它…");
  _r("c7.q21.a", "Contains no very strong hands (no nuts)", "不含很强的牌（没有坚果）");
  _r("c7.q21.b", "Is full of nutted hands", "满是坚果牌");
  _r("c7.q21.c", "Cannot bet at all", "完全不能下注");
  _r("c7.q21.d", "Only contains bluffs", "只含诈唬");
  _r("c7.q21.fb", "Capped = the top of the range is missing, so villain rarely has the nuts.", "封顶＝范围顶端缺失，所以对手很少有坚果。");

  _r("c7.q22.s", "Against a capped range, you can profitably…", "面对封顶的范围，你可以盈利地…");
  _r("c7.q22.a", "Apply pressure and bet bigger, since they lack the nuts", "施压并下更大注，因为他们没有坚果");
  _r("c7.q22.b", "Always fold to any bet", "对任何下注总是弃牌");
  _r("c7.q22.c", "Never bet yourself", "自己从不下注");
  _r("c7.q22.d", "Only ever check", "只会过牌");
  _r("c7.q22.fb", "Because a capped villain can't have the nuts, you can bluff and value-bet bigger profitably.", "由于对手（封顶）不可能有坚果，你可以更大地诈唬与价值下注。");

  _r("c7.q23.s", "On the river many of villain's draws complete. You should…", "河牌对手大量听牌命中。你应该…");
  _r("c7.q23.a", "Bluff-catch less — fewer missed bluffs remain", "少抓诈 — 落空的诈唬变少");
  _r("c7.q23.b", "Call even more", "跟注更多");
  _r("c7.q23.c", "Always call any bet", "对任何下注总是跟");
  _r("c7.q23.d", "Raise every river", "每个河牌都加注");
  _r("c7.q23.fb", "When draws get there, villain has more value and fewer bluffs \u2014 tighten your bluff-catches.", "听牌命中后对手价值更多、诈唬更少 \u2014 应收紧抓诈。");

  _r("c7.q24.s", "Why is MDF a property of your whole range, not a per-hand rule?", "为何 MDF 是整个范围的属性，而非单手规则？");
  _r("c7.q24.a", "Individual hands can fold; the range as a whole must defend enough", "单手可以弃牌；但整个范围必须防守足够");
  _r("c7.q24.b", "Every single hand must call", "每一手都必须跟注");
  _r("c7.q24.c", "Every single hand must fold", "每一手都必须弃牌");
  _r("c7.q24.d", "It only ever applies to one hand", "它只适用于某一手牌");
  _r("c7.q24.fb", "You meet MDF across your range \u2014 weak hands fold, but enough combos continue overall.", "你在整个范围上达到 MDF \u2014 弱牌弃掉，但整体有足够组合继续。");

  // —— C7/C8 solver spot questions (action drills with table UI) ——
  _r("c7.q1.s", "Solver spot (polar pot bet): river, pot=100, facing a pot-sized bet. You hold AA as a bluff-catcher vs a polarized range. Best default action?", "Solver 局面（极化底池下注）：河牌底池 100，面对底池下注。你持 AA 作抓诈牌，对手极化。默认最佳行动？");
  _r("c7.q2.s", "Solver spot (half-pot): river, pot=100, facing a 50-chip bet (~67% MDF). You hold AA as a bluff-catcher. Best default action?", "Solver 局面（半池）：河牌底池 100，面对 50 筹码下注（MDF ≈ 67%）。你持 AA 作抓诈牌。默认最佳行动？");
  _r("c7.q3.s", "Solver spot (range MDF): dry river 8-7-5-3-2, pot=100, facing a pot-sized bet. You hold JJ as a bluff-catcher. Best default action?", "Solver 局面（范围 MDF）：干燥河牌 8-7-5-3-2，底池 100，面对底池下注。你持 JJ 作抓诈牌。默认最佳行动？");
  _r("c7.q4.s", "Same solver polar spot: pot=100, pot-sized bet, AA bluff-catcher vs polarized range. Best default action?", "同一 Solver 极化局面：底池 100、底池下注、AA 抓诈牌 vs 极化范围。默认最佳行动？");
  _r("c7.q5.s", "Solver polar spot again: pot=100, pot-sized bet, AA bluff-catcher. Best default action?", "再次练习极化局面：底池 100、底池下注、AA 抓诈牌。默认最佳行动？");
  _r("c7.q6.s", "Solver polar spot: pot=100, pot-sized bet, AA bluff-catcher. Defend at MDF — best default action?", "Solver 极化局面：底池 100、底池下注、AA 抓诈牌。按 MDF 防守 — 默认最佳行动？");
  _r("c7.q7.s", "Solver polar spot: pot=100, pot-sized bet, AA bluff-catcher. Best default action?", "Solver 极化局面：底池 100、底池下注、AA 抓诈牌。默认最佳行动？");
  _r("c7.q8.s", "Final polar drill: pot=100, pot-sized bet, AA bluff-catcher. Best default action?", "极化练习最后一题：底池 100、底池下注、AA 抓诈牌。默认最佳行动？");
  _r("c8.q1.s", "Solver spot (indifference): river, pot=100, villain checks. You hold a set of jacks (the nuts); villain's range is pure air and never calls a bet. Best action?", "Solver 局面（无差异）：河牌底池 100，对手过牌。你持 J 三条（坚果）；对手范围是纯空气、从不跟注。最佳行动？");

  // —— C8 extra drill questions (q9–q24): indifference, mixing, balance, exploits. Answer is always "a". ——
  _r("c8.q9.s", "Why does a solver sometimes split the same hand between betting and checking?", "为何 solver 有时把同一手牌拆分为下注与过牌？");
  _r("c8.q9.a", "Both actions have equal EV (indifference), so mixing is optimal", "两种行动 EV 相同（无差异），所以混合最优");
  _r("c8.q9.b", "The solver is broken", "solver 出错了");
  _r("c8.q9.c", "Betting is always wrong", "下注总是错的");
  _r("c8.q9.d", "To save computation time", "为了节省计算时间");
  _r("c8.q9.fb", "When two lines tie in EV, splitting the hand between them is optimal and keeps you balanced.", "当两条线 EV 相等，把该牌拆分其中既最优又保持平衡。");

  _r("c8.q10.s", "Against an opponent who adapts, is a fully predictable pure strategy a problem?", "面对会调整的对手，完全可预测的纯策略是个问题吗？");
  _r("c8.q10.a", "Yes — a predictable strategy can be exploited by a thinking opponent", "是 — 可预测的策略会被思考型对手剥削");
  _r("c8.q10.b", "No, never", "不，从不");
  _r("c8.q10.c", "Only preflop", "仅翻前");
  _r("c8.q10.d", "Only in tournaments", "仅锦标赛");
  _r("c8.q10.fb", "Mixing exists so an adapting opponent can't read and counter your exact action.", "混合的存在是为了让会调整的对手无法读出并反制你的确切行动。");

  _r("c8.q11.s", "What makes two actions 'indifferent'?", "是什么让两种行动「无差异」？");
  _r("c8.q11.a", "They yield the same expected value", "它们产生相同的期望值");
  _r("c8.q11.b", "They use the same bet size", "它们使用相同下注尺寸");
  _r("c8.q11.c", "They are both bluffs", "它们都是诈唬");
  _r("c8.q11.d", "They both fold", "它们都弃牌");
  _r("c8.q11.fb", "Indifference simply means equal EV between the actions.", "无差异就是两种行动 EV 相等。");

  _r("c8.q12.s", "A solver gives you exact frequencies. The practical lesson is to…", "solver 给出精确频率。实用的结论是…");
  _r("c8.q12.a", "Learn which hands belong in each action, not memorize exact percentages", "学会哪些牌属于哪种行动，而非死记百分比");
  _r("c8.q12.b", "Hit every percentage exactly at the table", "在牌桌上精确命中每个百分比");
  _r("c8.q12.c", "Ignore the solver entirely", "完全忽略 solver");
  _r("c8.q12.d", "Always just bet", "总是直接下注");
  _r("c8.q12.fb", "Frequencies are EV-ties; the transferable skill is knowing which hands take which action.", "频率是 EV 相等点；可迁移的技能是知道哪些牌走哪种行动。");

  _r("c8.q13.s", "Why do mixed strategies make you hard to exploit?", "为何混合策略让你难以被剥削？");
  _r("c8.q13.a", "Opponents can't predict your action, so they can't deviate profitably", "对手无法预测你的行动，因而无法盈利偏离");
  _r("c8.q13.b", "They confuse the dealer", "它们迷惑荷官");
  _r("c8.q13.c", "They guarantee the nuts", "它们保证坚果");
  _r("c8.q13.d", "They serve no purpose", "它们毫无作用");
  _r("c8.q13.fb", "If villain can't tell value from bluff by your action, they can't exploit either way.", "若对手无法从你的行动区分价值与诈唬，就无法朝任一方向剥削。");

  _r("c8.q14.s", "You hold the nuts vs a range that will never call a bet. Betting vs checking is…", "你持坚果，面对绝不跟注的范围。下注与过牌相比…");
  _r("c8.q14.a", "Indifferent — both win the same pot", "无差异 — 都赢同样底池");
  _r("c8.q14.b", "Betting is much better", "下注好得多");
  _r("c8.q14.c", "Checking loses money", "过牌会亏钱");
  _r("c8.q14.d", "You should fold the nuts", "你应弃掉坚果");
  _r("c8.q14.fb", "If villain never calls, a bet gains nothing over a check \u2014 the actions tie.", "若对手从不跟注，下注相比过牌没有额外收益 \u2014 两者打平。");

  _r("c8.q15.s", "Balancing your value bets and bluffs aims to…", "平衡价值下注与诈唬的目的是…");
  _r("c8.q15.a", "Make villain's bluff-catchers indifferent so they can't exploit you", "让对手的抓诈牌无差异，使其无法剥削你");
  _r("c8.q15.b", "Always get called", "总是被跟注");
  _r("c8.q15.c", "Never get called", "从不被跟注");
  _r("c8.q15.d", "Only maximize folds", "只最大化弃牌");
  _r("c8.q15.fb", "Correct value:bluff ratios make calling and folding equal EV for villain \u2014 unexploitable.", "正确的价值:诈唬比让对手跟与弃 EV 相等 \u2014 不可剥削。");

  _r("c8.q16.s", "Villain folds far too much. You should deviate from balance by…", "对手弃牌过多。你应如何偏离平衡？");
  _r("c8.q16.a", "Bluffing more — abandon indifference and exploit", "多诈唬 — 放弃无差异、进行剥削");
  _r("c8.q16.b", "Bluffing less", "少诈唬");
  _r("c8.q16.c", "Only value-betting the nuts", "只用坚果价值下注");
  _r("c8.q16.d", "Never betting again", "再也不下注");
  _r("c8.q16.fb", "Against over-folders, balance is unnecessary \u2014 bluff more to profit automatically.", "面对过度弃牌者无需平衡 \u2014 多诈唬即可盈利。");

  _r("c8.q17.s", "Villain is a calling station. You should…", "对手是跟注站。你应该…");
  _r("c8.q17.a", "Bluff less and value-bet thinner / more often", "少诈唬，更多/更薄地价值下注");
  _r("c8.q17.b", "Bluff more often", "更频繁诈唬");
  _r("c8.q17.c", "Stop value-betting", "停止价值下注");
  _r("c8.q17.d", "Always check", "总是过牌");
  _r("c8.q17.fb", "Stations don't fold \u2014 drop bluffs and get thin value instead.", "跟注站不弃牌 \u2014 应去掉诈唬，转为薄价值。");

  _r("c8.q18.s", "A hand mixing 70% bet / 30% check most likely means…", "一手牌 70% 下注 / 30% 过牌很可能意味着…");
  _r("c8.q18.a", "Betting is slightly better, but checking is close in EV", "下注略好，但过牌的 EV 接近");
  _r("c8.q18.b", "Checking is a blunder", "过牌是大错");
  _r("c8.q18.c", "Betting is a blunder", "下注是大错");
  _r("c8.q18.d", "The hand is the nuts", "该牌是坚果");
  _r("c8.q18.fb", "A lopsided mix means one action edges the other, but both are close in EV.", "偏向的混合表示一种行动略胜，但两者 EV 接近。");

  _r("c8.q19.s", "Why is it usually fine to simplify a 60/40 mix into a single action?", "为何把 60/40 混合简化成单一行动通常没问题？");
  _r("c8.q19.a", "The EV difference is tiny, so picking one loses almost nothing", "EV 差异极小，选一个几乎不损失");
  _r("c8.q19.b", "Mixing is against the rules", "混合违反规则");
  _r("c8.q19.c", "Solvers are always wrong", "solver 总是错的");
  _r("c8.q19.d", "It maximizes variance", "它最大化波动");
  _r("c8.q19.fb", "Near-indifferent mixes cost almost nothing to simplify \u2014 great for live play.", "接近无差异的混合简化几乎无成本 \u2014 适合实战。");

  _r("c8.q20.s", "Indifference points exist because your EV depends on…", "无差异点存在，是因为你的 EV 取决于…");
  _r("c8.q20.a", "Villain's strategy — at equilibrium some hands tie between actions", "对手的策略 — 均衡时某些牌在行动间打平");
  _r("c8.q20.b", "The time of day", "一天中的时间");
  _r("c8.q20.c", "Your stack size alone", "仅你的筹码量");
  _r("c8.q20.d", "Nothing at all", "什么都不取决");
  _r("c8.q20.fb", "EV is relative to villain's strategy; at equilibrium some of your hands tie.", "EV 相对于对手策略；均衡时你的部分牌会打平。");

  _r("c8.q21.s", "If villain plays a fixed, known strategy, your best response is…", "若对手采用固定且已知的策略，你的最佳应对是…");
  _r("c8.q21.a", "A pure max-EV strategy — you don't need to mix", "纯粹的最大 EV 策略 — 无需混合");
  _r("c8.q21.b", "Always mixing 50/50", "总是 50/50 混合");
  _r("c8.q21.c", "Always folding", "总是弃牌");
  _r("c8.q21.d", "Always playing the nuts", "总是打坚果");
  _r("c8.q21.fb", "Against a fixed strategy, just take the highest-EV action every time \u2014 mixing is only for unexploitability.", "面对固定策略，每次取最高 EV 行动即可 \u2014 混合只为不可剥削。");

  _r("c8.q22.s", "Mixing is primarily required when…", "混合主要在以下情况需要…");
  _r("c8.q22.a", "You want to stay unexploitable vs an adapting opponent", "你想对会调整的对手保持不可剥削");
  _r("c8.q22.b", "Villain is a known weak player", "对手是已知的弱玩家");
  _r("c8.q22.c", "You hold the nuts", "你持坚果");
  _r("c8.q22.d", "Never, in any spot", "在任何局面都不需要");
  _r("c8.q22.fb", "Mixing protects you vs opponents who would otherwise read and exploit a pure strategy.", "混合保护你免受会读出并剥削纯策略的对手。");

  _r("c8.q23.s", "A balanced river betting range typically includes…", "平衡的河牌下注范围通常包含…");
  _r("c8.q23.a", "Value hands plus the right number of bluffs", "价值牌加上适量诈唬");
  _r("c8.q23.b", "Only value hands", "只有价值牌");
  _r("c8.q23.c", "Only bluffs", "只有诈唬");
  _r("c8.q23.d", "Only checks", "只有过牌");
  _r("c8.q23.fb", "Balance pairs value with a correct count of bluffs so bluff-catchers are indifferent.", "平衡是把价值与正确数量的诈唬搭配，使抓诈牌无差异。");

  _r("c8.q24.s", "The biggest practical mistake when reading solver mixes is…", "解读 solver 混合时最大的实战错误是…");
  _r("c8.q24.a", "Treating exact frequencies as rigid rules instead of EV-ties", "把精确频率当成死规则，而非 EV 相等点");
  _r("c8.q24.b", "Studying which hands bet", "研究哪些牌下注");
  _r("c8.q24.c", "Learning bet sizes", "学习下注尺寸");
  _r("c8.q24.d", "Understanding ranges", "理解范围");
  _r("c8.q24.fb", "Frequencies are indifference results \u2014 learn the why, not the exact number.", "频率是无差异的结果 \u2014 要学其原因，而非确切数字。");

  // —— Per-course summary slides (key takeaways) ——
  const SUM_T_EN = "Key takeaways";
  const SUM_T_ZH = "本课小结";
  for (let i = 1; i <= 12; i++) _r("c" + i + ".sum.t", SUM_T_EN, SUM_T_ZH);

  _r("c1.sum.b",
    "• Pot odds = call cost vs final pot; break-even equity = call/(pot+call).<br>• MDF = 1 − bet/(pot+bet) — smaller bets demand more defense.<br>• Defend your <b>range</b> to MDF so bluffs can't auto-profit; individual hands may still mix.",
    "• 底池赔率 = 跟注成本 vs 最终底池；盈亏平衡胜率 = 跟注/(底池+跟注)。<br>• MDF = 1 − 下注/(底池+下注) — 下注越小，需防守越多。<br>• 按 MDF 防守整个<b>范围</b>，使诈唬无法自动盈利；单手牌仍可混合。");

  _r("c2.sum.b",
    "• Pot odds = call cost vs final pot; break-even equity = call/(pot+call).<br>• MDF = 1 − bet/(pot+bet) — defend your <b>range</b> so bluffs can't auto-profit.<br>• Implied odds reward draws that win more later; reverse implied odds punish dominated hands.",
    "• 底池赔率 = 跟注成本 vs 最终底池；盈亏平衡胜率 = 跟注/(底池+跟注)。<br>• MDF = 1 − 下注/(底池+下注) — 按<b>范围</b>防守，使诈唬无法自动盈利。<br>• 隐含赔率奖励能赢更多的听牌；反向隐含赔率惩罚被压制的牌。");

  _r("c3.sum.b",
    "• Range advantage = more strong hands overall → bet more often.<br>• Nut advantage = more top combos → license to bet bigger.<br>• PFR is favored on high/dry flops; the caller catches up on low/connected flops.",
    "• 范围优势 = 整体强牌更多 → 下注更频繁。<br>• 坚果优势 = 顶级组合更多 → 可以下更大。<br>• 翻前加注者在高/干面占优；跟注者在低/连接面追上。");

  _r("c4.sum.b",
    "• Dry/static boards: bet often and small — equities barely move.<br>• Wet/dynamic boards: bet selectively and bigger with value & draws.<br>• Match size and frequency to how often the nuts can change.",
    "• 干燥/静态面：高频小注 — 胜率几乎不变。<br>• 湿润/动态面：选择性下注，价值与听牌用更大尺寸。<br>• 尺寸与频率要匹配坚果变化的快慢。");

  _r("c5.sum.b",
    "• As IP aggressor with range + position, c-bet small at high frequency on dry boards.<br>• Size up on wet boards with value and draws; check back medium hands.<br>• Don't auto-c-bet boards that favor the caller's range.",
    "• 作为有位置进攻者，凭范围+位置在干面可高频小注持续下注。<br>• 湿面用价值和听牌加大尺寸；中等牌过牌。<br>• 不要在利于跟注者范围的面无脑持续下注。");

  _r("c6.sum.b",
    "• OOP realizes less equity — defend a touch tighter than raw MDF.<br>• Check-raise wet boards with strong hands plus some draws.<br>• Fold the bottom of your range vs big bets on bad boards.",
    "• 无位置胜率实现更差 — 比纯 MDF 略紧防守。<br>• 湿面用强牌加部分听牌过牌加注。<br>• 不利面对大注弃掉范围底部。");

  _r("c7.sum.b",
    "• River bets polarize to nuts + bluffs; medium hands prefer to check.<br>• Call bluff-catchers up to MDF — favor those that block value and unblock bluffs.<br>• Over-folding makes polarized bets automatically profitable.",
    "• 河牌下注极化为坚果+诈唬；中等牌倾向过牌。<br>• 抓诈牌按 MDF 跟注 — 优先选阻挡价值、不挡诈唬的牌。<br>• 过度弃牌会让极化下注自动盈利。");

  _r("c8.sum.b",
    "• When lines tie in EV, GTO <b>mixes</b> to stay unexploitable.<br>• Bluffs make villain indifferent between call and fold; value sets how many bluffs you need.<br>• Switch to a pure strategy only to exploit a known leak.",
    "• 多条行动线 EV 相等时，GTO 用<b>混合</b>保持不可剥削。<br>• 诈唬让对手在跟注与弃牌间无差异；价值牌决定你需要多少诈唬。<br>• 仅为剥削已知漏洞才改用纯策略。");

  _r("c9.sum.b",
    "• Barrel turns that improve your range or add equity (overcards, fresh draws).<br>• Give up when the turn favors the caller and you hold no equity.<br>• Plan the river <b>before</b> firing the second barrel.",
    "• 在利于你范围或增加胜率（高张、新听牌）的转牌继续开第二枪。<br>• 转牌利于跟注者且你无胜率时放弃。<br>• 开第二枪<b>之前</b>先规划河牌。");

  _r("c10.sum.b",
    "• Thin value gets called by worse — size to target those hands.<br>• Pick bluffs from missed draws that block calls / unblock folds.<br>• Balance value-to-bluff to your bet size to stay unexploitable.",
    "• 薄价值会被更差的牌跟注 — 用尺寸瞄准这些牌。<br>• 用阻挡跟注、不挡弃牌的破产听牌做诈唬。<br>• 按下注尺寸平衡价值与诈唬比例以不可剥削。");

  _r("c11.sum.b",
    "• Check-raise OOP to attack capped ranges with value + semi-bluffs.<br>• Probe (lead) turns/rivers after villain checks back to seize the betting lead.<br>• Keep raises and probes balanced — don't only do it with the nuts.",
    "• 无位置过牌加注，用价值+半诈唬攻击封顶范围。<br>• 对手过牌放弃后，在转/河牌用试探下注夺回主动权。<br>• 加注与试探要平衡 — 不要只用坚果牌。");

  _r("c12.sum.b",
    "• Low SPR → commit with top pair+; high SPR → need a stronger hand to stack off.<br>• Plan stack-offs from the flop using SPR, not street by street.<br>• Don't bloat the pot with hands that can't stand a raise.",
    "• 低 SPR → 顶对+即可承诺；高 SPR → 需更强的牌才全下。<br>• 用 SPR 从翻牌起规划全下，而非逐街决定。<br>• 不要用经不起加注的牌把底池打大。");
}

registerContentStrings();

/* Learn slides per course */
const LEARN = {
  c1: [],
  c2: [
    { titleKey: "c2.l1.t", bodyKey: "c2.l1.b" },
    { titleKey: "c2.l2.t", bodyKey: "c2.l2.b" },
    { titleKey: "c2.l3.t", bodyKey: "c2.l3.b" },
    { titleKey: "c2.sum.t", bodyKey: "c2.sum.b", summary: true },
  ],
  c3: [
    { titleKey: "c3.l1.t", bodyKey: "c3.l1.b", rangeChart: ["Ah", "7d", "2c"] },
    { titleKey: "c3.l2.t", bodyKey: "c3.l2.b", rangeChart: ["6h", "5s", "4d"] },
    { titleKey: "c3.l3.t", bodyKey: "c3.l3.b", rangeChart: ["Ks", "8d", "3c"] },
    { titleKey: "c3.sum.t", bodyKey: "c3.sum.b", summary: true },
  ],
  c4: [
    { titleKey: "c4.l1.t", bodyKey: "c4.l1.b" },
    { titleKey: "c4.l2.t", bodyKey: "c4.l2.b" },
    { titleKey: "c4.l3.t", bodyKey: "c4.l3.b" },
    { titleKey: "c4.sum.t", bodyKey: "c4.sum.b", summary: true },
  ],
  c5: [
    { titleKey: "c5.l1.t", bodyKey: "c5.l1.b" },
    { titleKey: "c5.l2.t", bodyKey: "c5.l2.b" },
    { titleKey: "c5.l3.t", bodyKey: "c5.l3.b" },
    { titleKey: "c5.sum.t", bodyKey: "c5.sum.b", summary: true },
  ],
  c6: [
    { titleKey: "c6.l1.t", bodyKey: "c6.l1.b" },
    { titleKey: "c6.l2.t", bodyKey: "c6.l2.b" },
    { titleKey: "c6.l3.t", bodyKey: "c6.l3.b" },
    { titleKey: "c6.sum.t", bodyKey: "c6.sum.b", summary: true },
  ],
  c7: [
    { titleKey: "c7.l1.t", bodyKey: "c7.l1.b" },
    { titleKey: "c7.l2.t", bodyKey: "c7.l2.b" },
    { titleKey: "c7.l3.t", bodyKey: "c7.l3.b" },
    { titleKey: "c7.sum.t", bodyKey: "c7.sum.b", summary: true },
  ],
  c8: [
    { titleKey: "c8.l1.t", bodyKey: "c8.l1.b" },
    { titleKey: "c8.l2.t", bodyKey: "c8.l2.b" },
    { titleKey: "c8.l3.t", bodyKey: "c8.l3.b" },
    { titleKey: "c8.sum.t", bodyKey: "c8.sum.b", summary: true },
  ],
  c9: [
    { titleKey: "c9.l1.t", bodyKey: "c9.l1.b" },
    { titleKey: "c9.l2.t", bodyKey: "c9.l2.b" },
    { titleKey: "c9.l3.t", bodyKey: "c9.l3.b" },
    { titleKey: "c9.sum.t", bodyKey: "c9.sum.b", summary: true },
  ],
  c10: [
    { titleKey: "c10.l1.t", bodyKey: "c10.l1.b" },
    { titleKey: "c10.l2.t", bodyKey: "c10.l2.b" },
    { titleKey: "c10.l3.t", bodyKey: "c10.l3.b" },
    { titleKey: "c10.sum.t", bodyKey: "c10.sum.b", summary: true },
  ],
  c11: [
    { titleKey: "c11.l1.t", bodyKey: "c11.l1.b" },
    { titleKey: "c11.l2.t", bodyKey: "c11.l2.b" },
    { titleKey: "c11.l3.t", bodyKey: "c11.l3.b" },
    { titleKey: "c11.sum.t", bodyKey: "c11.sum.b", summary: true },
  ],
  c12: [
    { titleKey: "c12.l1.t", bodyKey: "c12.l1.b" },
    { titleKey: "c12.l2.t", bodyKey: "c12.l2.b" },
    { titleKey: "c12.l3.t", bodyKey: "c12.l3.b" },
    { titleKey: "c12.sum.t", bodyKey: "c12.sum.b", summary: true },
  ],
};

function _choice(id, stemKey, options, correct, confidence, leak, fbKey) {
  return { id, type: "choice", stemKey, options, correct: [correct], confidence, leak, feedback: { _default: { reasonKey: fbKey || "fb.generic.call_loose" } } };
}

function _action(id, stemKey, spot, correct, confidence, leak, feedback, ctxKey) {
  return {
    id,
    type: "action",
    stemKey,
    spot,
    actions: facingAllIn(spot) ? FACE_CALL : facingBet(spot) ? FACE : ACT,
    correct,
    confidence,
    leak,
    feedback,
    ctxKey,
  };
}

/* buildSpots — generate action questions with a concrete board from compact specs.
   Each spec registers its own bilingual strings, so questions stay self-contained. */
function buildSpots(courseId, concept, specs) {
  return specs.map((spec, i) => {
    const base = courseId + "-q" + (i + 1);
    reg(base + ".s", spec.s.en, spec.s.zh);
    if (spec.ctx) reg(base + ".ctx", spec.ctx.en, spec.ctx.zh);
    if (spec.lbl) reg(base + ".lbl", spec.lbl.en, spec.lbl.zh);
    const feedback = {};
    const fb = spec.fb || {};
    for (const act of Object.keys(fb)) {
      const k = base + ".fb." + act;
      reg(k, fb[act].en, fb[act].zh);
      feedback[act] = { reasonKey: k, concept: concept };
    }
    return {
      id: base,
      type: "action",
      stemKey: base + ".s",
      spot: {
        street: spec.street || "flop",
        board: spec.board,
        pot: spec.pot,
        bet: spec.bet || 0,
        hero: { pos: spec.pos, hand: spec.hand || [], labelKey: spec.lbl ? base + ".lbl" : null },
        allIn: !!spec.allIn,
        facing: spec.allIn ? "allin" : spec.bet ? "bet" : "action",
      },
      actions: spec.actions,
      correct: spec.correct,
      confidence: "reference",
      leak: spec.leak,
      feedback: feedback,
      ctxKey: spec.ctx ? base + ".ctx" : null,
    };
  });
}

const FACE = ["fold", "call", "raise"];
const FACE_CALL = ["fold", "call"];
const ACT = ["check", "bet"];

function facingBet(spot) {
  return !!spot && ((spot.bet || 0) > 0 || spot.facing === "bet" || facingAllIn(spot));
}

function facingAllIn(spot) {
  return !!spot && (spot.allIn === true || spot.facing === "allin" || spot.facing === "all-in");
}

function drillActionsForQuestion(q) {
  const spot = q.spot || {};
  const allowed = !facingBet(spot) ? ACT : facingAllIn(spot) ? FACE_CALL : FACE;
  if (q.actions && q.actions.length) {
    const filtered = q.actions.filter((a) => allowed.includes(a));
    if (filtered.length) return filtered;
  }
  return allowed;
}

const QUESTIONS = {
  c1: [], /* placement test — no drill questions */

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
    {
      s: { en: "100bb deep. Flop, villain bets 1/3 pot. You hold the nut flush draw with two overcards. Best action?", zh: "100bb 深筹。翻牌对手下注 1/3 池。你持坚果同花听+两张高张。最佳行动？" },
      lbl: { en: "A\u2660K\u2660 nut FD + overs", zh: "A\u2660K\u2660 坚果花听+高张" },
      board: ["Qs", "7s", "2h"], pot: 6, bet: 2, pos: "IP", hand: ["As", "Ks"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: {
        fold: { en: "Folding wastes massive implied odds \u2014 deep-stacked you can stack villain when the nut flush completes.", zh: "弃牌浪费巨大隐含赔率 \u2014 深筹时坚果同花命中可赢光对手。" },
      },
    },
    {
      s: { en: "Only 25bb deep on A-K-5. You have bottom pair, no draw, facing a near-pot bet. Best action?", zh: "A-K-5 面仅 25bb。你持底对、无听牌，面对接近底池的下注。最佳行动？" },
      lbl: { en: "6\u26605\u2660 bottom pair", zh: "6\u26605\u2660 底对" },
      board: ["Ac", "Kd", "5h"], pot: 6, bet: 5, pos: "IP", hand: ["6s", "5s"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "A dominated hand with no implied odds \u2014 short stacks kill implied odds. Just fold.", zh: "被压制且无隐含赔率的牌 \u2014 浅筹消灭隐含赔率，应弃牌。" },
        raise: { en: "Bluff-raising with no equity on a short stack just burns chips.", zh: "浅筹无胜率诈唬加注只会浪费筹码。" },
      },
    },
    {
      s: { en: "Deep. Two-tone J-9-4, you hold a LOW flush draw facing a big bet. What's the risk, best action?", zh: "深筹。双花 J-9-4，你持低同花听面对大注。风险与最佳行动？" },
      lbl: { en: "6\u26655\u2665 low FD", zh: "6\u26655\u2665 低花听" },
      board: ["Jh", "9h", "4c"], pot: 6, bet: 4, pos: "IP", hand: ["6h", "5h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Reverse implied odds: when your flush hits, a higher heart (A/K) often stacks you. A low draw folds here.", zh: "反向隐含赔率：你成花时常被更大同花（A/K）赢光。低同花听应弃牌。" },
        raise: { en: "Semi-bluffing a low draw into a strong range bloats the pot when dominated.", zh: "用低听牌对强范围半诈唬只会在被压制时放大底池。" },
      },
    },
    {
      s: { en: "Deep on A-9-5. You have only a gutshot (7-6 needs an 8) facing a pot-sized bet. Best action?", zh: "A-9-5 深筹。你仅有卡顺（7-6 需 8）面对底池下注。最佳行动？" },
      lbl: { en: "7\u26656\u2665 gutshot", zh: "7\u26656\u2665 卡顺听" },
      board: ["As", "9d", "5c"], pot: 6, bet: 6, pos: "IP", hand: ["7h", "6h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Even deep, a single gutshot (~4 outs) lacks the odds vs a pot bet; implied odds rarely bridge that gap.", zh: "即便深筹，单卡顺（约 4 张补牌）面对底池下注赔率不足，隐含赔率难以弥补。" },
        raise: { en: "Bluff-raising a weak gutshot vs a pot-bet range is high-variance and -EV.", zh: "用弱卡顺对底池下注范围诈唬加注，波动大且负 EV。" },
      },
    },
    {
      s: { en: "100bb deep on 9-8-2. You hold an open-ended straight draw facing a 1/3-pot bet. Best action?", zh: "9-8-2 面 100bb 深筹。你持两头顺听面对 1/3 池下注。最佳行动？" },
      lbl: { en: "J\u2665T\u2665 OESD", zh: "J\u2665T\u2665 两头顺听" },
      board: ["9s", "8d", "2c"], pot: 6, bet: 2, pos: "IP", hand: ["Jh", "Th"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: {
        fold: { en: "8 outs + overcards + a great price + deep implied odds \u2014 folding is too tight here.", zh: "8 张补牌+高张+好赔率+深隐含赔率 \u2014 防守过紧。" },
      },
    },
    {
      s: { en: "Deep on wet T-9-4. You flopped bottom set; villain bets. Best action?", zh: "湿润 T-9-4 深筹。你成底三条，对手下注。最佳行动？" },
      lbl: { en: "4\u26664\u2663 bottom set", zh: "4\u26664\u2663 底三条" },
      board: ["Th", "9h", "4s"], pot: 6, bet: 4, pos: "IP", hand: ["4d", "4c"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "Never fold a set on a wet board \u2014 you have a huge equity edge.", zh: "湿润面绝不弃三条 \u2014 你有巨大胜率优势。" },
        call: { en: "Flatting lets draws see cheap cards and misses value; raise to charge the many draws and build the pot.", zh: "只跟注让听牌便宜看牌且损失价值；应加注向众多听牌收费并建池。" },
      },
    },
    {
      s: { en: "Turn K-T-6-2. You hold second pair facing a big turn barrel. What's the concern, best action?", zh: "转牌 K-T-6-2。你持第二对面对转牌大注。顾虑与最佳行动？" },
      lbl: { en: "T\u26669\u2666 second pair", zh: "T\u26669\u2666 第二对" },
      board: ["Kd", "Tc", "6s", "2h"], pot: 12, bet: 10, pos: "IP", hand: ["Td", "9d"], street: "turn",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Reverse implied odds: second pair is often beaten and pays off the river too. Vs a big barrel, fold.", zh: "反向隐含赔率：第二对常落后且河牌还要付钱。面对大注应弃牌。" },
        raise: { en: "Raising turns a modest made hand into a bluff vs a strong range \u2014 not profitable.", zh: "加注把中等成手变成对强范围的诈唬 \u2014 无利可图。" },
      },
    },
    {
      s: { en: "Deep on 8-5-2. You hold the nut flush draw plus an ace overcard vs a half-pot bet. Best action?", zh: "8-5-2 深筹。你持坚果同花听+A 高张面对半池下注。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 nut FD + over", zh: "A\u2663K\u2663 坚果花听+高张" },
      board: ["8c", "5c", "2d"], pot: 6, bet: 3, pos: "IP", hand: ["Ac", "Kc"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: {
        fold: { en: "A nut flush draw with an overcard and strong implied odds is an easy continue \u2014 folding is too tight here.", zh: "带高张的坚果同花听+强隐含赔率，轻松继续 \u2014 防守过紧。" },
      },
    },
    {
      s: { en: "150bb deep. Flop 7-6-2 two-tone, villain bets 1/3. You hold a flush draw + open-ender. Best action?", zh: "150bb 深筹。翻牌 7-6-2 双花，对手下注 1/3。你持花听+两头顺听。最佳行动？" },
      lbl: { en: "9\u26608\u2660 FD+OESD", zh: "9\u26608\u2660 花听+顺听" },
      board: ["7s", "6s", "2d"], pot: 6, bet: 2, pos: "IP", hand: ["9s", "8s"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Folding a huge combo draw with deep stacks throws away both equity and implied odds. Continue.", zh: "深筹弃掉巨大组合听牌同时浪费胜率与隐含赔率。应继续。" } },
    },
    {
      s: { en: "Flop Q-8-3, villain bets near pot. You have only a 6-high (low) flush draw. Best action?", zh: "翻牌 Q-8-3，对手接近底池下注。你只有 6 高的小同花听。最佳行动？" },
      lbl: { en: "6\u26655\u2665 low FD", zh: "6\u26655\u2665 小花听" },
      board: ["Qh", "8h", "3c"], pot: 6, bet: 5, pos: "IP", hand: ["6h", "5h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "A 6-high flush draw is dominated \u2014 even when it completes you can lose a big pot (reverse implied odds). Fold to a big bet.", zh: "6 高同花听被压制 \u2014 即便命中也可能输大池（反向隐含赔率）。面对大注应弃。" },
        raise: { en: "Raising a weak dominated draw bloats the pot with little fold equity.", zh: "用被压制的弱听牌加注，弃牌率低却把池子做大。" },
      },
    },
    {
      s: { en: "Deep. Flop K-9-4 with two clubs, villain bets 1/3. You hold the nut flush draw. Best action?", zh: "深筹。翻牌 K-9-4 两张梅花，对手下注 1/3。你持坚果同花听。最佳行动？" },
      lbl: { en: "A\u2663Q\u2663 nut FD", zh: "A\u2663Q\u2663 坚果花听" },
      board: ["Kc", "9c", "4d"], pot: 6, bet: 2, pos: "IP", hand: ["Ac", "Qc"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Folding the nut flush draw deep wastes premium implied odds \u2014 you stack villain when it hits.", zh: "深筹弃掉坚果同花听浪费顶级隐含赔率 \u2014 命中可赢光对手。" } },
    },
    {
      s: { en: "Flop 9-8-4 (wet), villain bets. You flopped bottom set. Best action?", zh: "翻牌 9-8-4（湿润），对手下注。你翻牌成最小三条。最佳行动？" },
      lbl: { en: "4\u26664\u2660 bottom set", zh: "4\u26664\u2660 底三条" },
      board: ["9h", "8h", "4c"], pot: 6, bet: 4, pos: "IP", hand: ["4d", "4s"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        call: { en: "On a wet board raise your set for value and protection \u2014 flatting lets draws catch up cheaply.", zh: "湿润面用三条加注价值并保护 \u2014 平跟让听牌便宜追牌。" },
        fold: { en: "Never fold a set here.", zh: "这里绝不弃三条。" },
      },
    },
    {
      s: { en: "Only 40bb. Flop K-9-5, villain bets pot. You have a bare gutshot (need an 8). Best action?", zh: "仅 40bb。翻牌 K-9-5，对手底池下注。你只有卡顺听（需 8）。最佳行动？" },
      lbl: { en: "7\u26656\u2665 gutshot", zh: "7\u26656\u2665 卡顺听" },
      board: ["Kd", "9s", "5c"], pot: 6, bet: 6, pos: "IP", hand: ["7h", "6h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "A bare 4-out gutshot vs a pot bet while shallow lacks both pot odds and implied odds \u2014 fold.", zh: "浅筹面对底池下注、仅 4 张补牌的卡顺，既无底池赔率也无隐含赔率 \u2014 应弃。" },
        raise: { en: "Raising a 4-out gutshot as a bluff risks too much with little equity.", zh: "用 4 张补牌的卡顺诈唬加注，胜率低却投入过多。" },
      },
    },
    {
      s: { en: "Deep. Flop J-T-4, villain bets 1/3. You hold an open-ended straight draw. Best action?", zh: "深筹。翻牌 J-T-4，对手下注 1/3。你持两头顺听。最佳行动？" },
      lbl: { en: "9\u26668\u2666 OESD", zh: "9\u26668\u2666 两头顺听" },
      board: ["Jc", "Tc", "4h"], pot: 6, bet: 2, pos: "IP", hand: ["9d", "8d"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "8 outs plus implied odds easily continue vs a small bet. Folding is too tight.", zh: "8 张补牌加隐含赔率面对小注轻松继续。防守过紧。" } },
    },
    {
      s: { en: "Flop Q-7-2, villain bets. You flopped top set. Best action?", zh: "翻牌 Q-7-2，对手下注。你翻牌成顶三条。最佳行动？" },
      lbl: { en: "Q\u2663Q\u2665 top set", zh: "Q\u2663Q\u2665 顶三条" },
      board: ["Qd", "7s", "2c"], pot: 6, bet: 4, pos: "IP", hand: ["Qc", "Qh"],
      actions: FACE, correct: ["raise", "call"], leak: "too_tight",
      fb: { fold: { en: "Never fold top set \u2014 raise (or trap-call) to build a big pot.", zh: "绝不弃顶三条 \u2014 加注（或埋伏平跟）做大底池。" } },
    },
    {
      s: { en: "Deep. Flop T-6-3 two spades, villain bets 1/3. You hold the nut flush draw with two overcards. Best action?", zh: "深筹。翻牌 T-6-3 两张黑桃，对手下注 1/3。你持坚果同花听+两高张。最佳行动？" },
      lbl: { en: "A\u2660K\u2660 nut FD + overs", zh: "A\u2660K\u2660 坚果花听+高张" },
      board: ["Td", "6s", "3s"], pot: 6, bet: 2, pos: "IP", hand: ["As", "Ks"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Nut flush draw plus two overcards deep has big equity and implied odds \u2014 never fold.", zh: "坚果同花听加两张高张、深筹，胜率与隐含赔率都大 \u2014 绝不弃。" } },
    },
    {
      s: { en: "35bb. Flop K-9-2 two spades, villain bets big. You have a 5-high flush draw. Best action?", zh: "35bb。翻牌 K-9-2 两张黑桃，对手大注。你只有 5 高同花听。最佳行动？" },
      lbl: { en: "5\u26604\u2660 low FD", zh: "5\u26604\u2660 小花听" },
      board: ["Ks", "9s", "2d"], pot: 6, bet: 5, pos: "IP", hand: ["5s", "4s"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "A 5-high flush draw is dominated, and shallow you lack implied odds \u2014 fold to a big bet.", zh: "5 高同花听被压制，浅筹又无隐含赔率 \u2014 面对大注应弃。" },
        raise: { en: "No fold equity and a dominated draw \u2014 raising just burns chips.", zh: "无弃牌率又是被压制的听牌 \u2014 加注只会浪费筹码。" },
      },
    },
    {
      s: { en: "Flop 6-5-2, villain bets half. You hold a flush draw + open-ender (huge combo). Best action?", zh: "翻牌 6-5-2，对手半池下注。你持花听+两头顺听（巨大组合）。最佳行动？" },
      lbl: { en: "8\u26637\u2663 FD+OESD", zh: "8\u26637\u2663 花听+顺听" },
      board: ["6c", "5c", "2h"], pot: 6, bet: 3, pos: "IP", hand: ["8c", "7c"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A ~15-out combo draw is a favorite vs many made hands \u2014 never fold; raise or call.", zh: "约 15 张补牌的组合听牌对很多成手是领先的 \u2014 绝不弃；应加注或跟注。" } },
    },
    {
      s: { en: "Flop 8-5-2 (dry), villain bets. You flopped top set. Best action?", zh: "翻牌 8-5-2（干燥），对手下注。你翻牌成顶三条。最佳行动？" },
      lbl: { en: "8\u26608\u2666 top set", zh: "8\u26608\u2666 顶三条" },
      board: ["8h", "5d", "2c"], pot: 6, bet: 4, pos: "IP", hand: ["8s", "8d"],
      actions: FACE, correct: ["raise", "call"], leak: "too_tight",
      fb: { fold: { en: "Never fold a set; raise for value or trap-call on this dry board.", zh: "绝不弃三条；干燥面可加注价值或埋伏平跟。" } },
    },
    {
      s: { en: "Deep. Flop J-8-3, villain bets 1/3. You hold 9-T (open-ended: any Q or 7 makes a straight). Best action?", zh: "深筹。翻牌 J-8-3，对手下注 1/3。你持 9-T（任意 Q 或 7 成顺）。最佳行动？" },
      lbl: { en: "9\u2665T\u2665 OESD", zh: "9\u2665T\u2665 两头顺听" },
      board: ["Js", "8d", "3c"], pot: 6, bet: 2, pos: "IP", hand: ["9h", "Th"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "8 straight outs plus implied odds easily continue vs a small bet.", zh: "8 张顺子补牌加隐含赔率，面对小注轻松继续。" } },
    },
    {
      s: { en: "Flop A-K-6, villain bets big. You hold bottom pair (sixes) with no draw. Best action?", zh: "翻牌 A-K-6，对手大注。你持底对（一对 6）无听牌。最佳行动？" },
      lbl: { en: "6\u26655\u2665 bottom pair", zh: "6\u26655\u2665 底对" },
      board: ["As", "Kd", "6c"], pot: 6, bet: 5, pos: "IP", hand: ["6h", "5h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Bottom pair on an A-K-high board is dominated and pays off too often (reverse implied odds) \u2014 fold to a big bet.", zh: "A-K 高面上的底对被压制且常被诈赔（反向隐含赔率）\u2014 面对大注应弃。" },
        raise: { en: "Raising bottom pair as a bluff has no fold equity vs this strong board for villain.", zh: "用底对诈唬加注，对手在此强面上几乎不弃。" },
      },
    },
    {
      s: { en: "Deep. Flop Q-J-4 two clubs, villain bets 1/3. You hold the nut flush draw plus a Broadway gutshot. Best action?", zh: "深筹。翻牌 Q-J-4 两张梅花，对手下注 1/3。你持坚果同花听+broadway 卡顺。最佳行动？" },
      lbl: { en: "A\u2663T\u2663 nut FD + gut", zh: "A\u2663T\u2663 坚果花听+卡顺" },
      board: ["Qc", "Jd", "4c"], pot: 6, bet: 2, pos: "IP", hand: ["Ac", "Tc"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Nut flush draw plus a gutshot to Broadway (any K) is a monster draw \u2014 never fold.", zh: "坚果同花听加 broadway 卡顺（任意 K）是巨型听牌 \u2014 绝不弃。" } },
    },
    {
      s: { en: "Turn. Board K-T-6-2, villain fires a big second barrel. You hold second pair (tens). Best action?", zh: "转牌。牌面 K-T-6-2，对手开出大第二枪。你持第二对（一对 T）。最佳行动？" },
      lbl: { en: "T\u26659\u2665 second pair", zh: "T\u26659\u2665 第二对" },
      board: ["Ks", "Td", "6s", "2c"], pot: 12, bet: 10, pos: "IP", hand: ["Th", "9h"], street: "turn",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Second pair vs a big barrel is often beaten and pays off the river too (reverse implied odds) \u2014 fold.", zh: "第二对面对大开火常落后，且河牌还要赔（反向隐含赔率）\u2014 应弃。" },
        raise: { en: "Raising second pair as a bluff folds out worse and gets called by better.", zh: "用第二对诈唬加注只赶走更差、被更好牌跟注。" },
      },
    },
    {
      s: { en: "Villain checks. Flop 7-5-2, you hold top set in position. Best action?", zh: "对手过牌。翻牌 7-5-2，你有位置持顶三条。最佳行动？" },
      lbl: { en: "7\u26657\u2660 top set", zh: "7\u26657\u2660 顶三条" },
      board: ["7c", "5d", "2h"], pot: 6, bet: 0, pos: "IP", hand: ["7h", "7s"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "With top set, bet for value and to build the pot \u2014 checking wastes a street of value.", zh: "持顶三条应下注取价值并做大底池 \u2014 过牌浪费一条街的价值。" } },
    },
  ]) ],

  c3: buildSpots("c3", "concept.range_adv", [
    {
      s: { en: "You raised BTN, BB called and checks. A-high dry flop. Does your range want to bet?", zh: "你 BTN 加注，BB 跟注并过牌。A 高干燥翻牌。你的范围该下注吗？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ah", "7d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "On A-high dry boards the raiser has a big range + nut advantage \u2014 bet small at high frequency instead of checking.", zh: "A 高干燥面加注者有巨大范围+坚果优势 \u2014 应高频小注而非过牌。" } },
    },
    {
      s: { en: "BTN vs BB. Low connected 6-5-4 flop, BB checks. Best range action?", zh: "BTN 对 BB。低连接 6-5-4 翻牌，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["6h", "5s", "4d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "Low connected boards smash the caller's range (more sets, straights, two pair). You lack nut advantage \u2014 check more.", zh: "低连接面正中跟注者范围（更多三条、顺子、两对）。你无坚果优势 \u2014 应多过牌。" } },
    },
    {
      s: { en: "BTN vs BB. K-high dry K-8-3 flop, BB checks. Best range action?", zh: "BTN 对 BB。K 高干燥 K-8-3，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ks", "8d", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "K-high dry favors the raiser's range; a small bet is profitable. Checking forfeits your range advantage.", zh: "K 高干燥利于加注者范围；小注可盈利。过牌放弃范围优势。" } },
    },
    {
      s: { en: "BTN vs BB. J-T-9 with a flush draw, BB checks. Best range action?", zh: "BTN 对 BB。J-T-9 带同花听，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Jd", "Th", "9h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "J-T-9 hits the caller hard (straights, two pair, draws). Betting your whole range into nut disadvantage is a leak \u2014 check.", zh: "J-T-9 重击跟注者范围（顺子、两对、听牌）。坚果劣势下全范围下注是漏洞 \u2014 应过牌。" } },
    },
    {
      s: { en: "BTN vs BB. Paired dry 8-8-2, BB checks. Best range action?", zh: "BTN 对 BB。配对干燥 8-8-2，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["8s", "8d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "Paired dry boards barely change ranges and favor the raiser \u2014 c-bet small at high frequency.", zh: "配对干燥面几乎不改变范围且利于加注者 \u2014 应高频小注。" } },
    },
    {
      s: { en: "BTN vs BB. Q-J-T flop, BB checks. Best range action?", zh: "BTN 对 BB。Q-J-T 翻牌，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Qh", "Js", "Tc"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "Q-J-T crushes the caller (tons of straights and two pair). You're at a nut disadvantage \u2014 check at high frequency.", zh: "Q-J-T 重创跟注者（大量顺子和两对）。你处坚果劣势 \u2014 应高频过牌。" } },
    },
    {
      s: { en: "BTN vs BB. A-K-high dry A-K-4, BB checks. Best range action?", zh: "BTN 对 BB。A-K 高干燥 A-K-4，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ad", "Kc", "4h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "A-K-high dry is the raiser's best texture \u2014 huge range + nut advantage. Bet, don't check.", zh: "A-K 高干燥是加注者最佳牌面 \u2014 巨大范围+坚果优势。应下注，别过牌。" } },
    },
    {
      s: { en: "BTN vs BB. 7-6-5 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。7-6-5 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["7c", "6c", "5d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "7-6-5 two-tone favors the caller's connected hands and draws. Betting your range ignores their nut advantage \u2014 check more.", zh: "7-6-5 双花利于跟注者的连接牌与听牌。全范围下注忽视其坚果优势 \u2014 应多过牌。" } },
    },
    {
      s: { en: "BTN vs BB. A-Q-5 rainbow, BB checks. Best range action?", zh: "BTN 对 BB。A-Q-5 彩虹，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ad", "Qs", "5c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "A-Q-high dry hits the raiser's range far more (AQ, AA, QQ, Ax). Bet for range + nut advantage.", zh: "A-Q 高干燥更命中加注者范围（AQ、AA、QQ、Ax）。应下注取范围+坚果优势。" } },
    },
    {
      s: { en: "BTN vs BB. 5-4-3 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。5-4-3 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["5h", "4h", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "Low connected boards smash the caller's range (straights, two pair, sets). Check more \u2014 you lack nut advantage.", zh: "低连接面正中跟注者范围（顺子、两对、三条）。应多过牌 \u2014 你无坚果优势。" } },
    },
    {
      s: { en: "BTN vs BB. K-Q-3 rainbow, BB checks. Best range action?", zh: "BTN 对 BB。K-Q-3 彩虹，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ks", "Qd", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "Two broadway cards favor the raiser (KK, QQ, AK, KQ, AQ). Bet your range for the advantage.", zh: "两张高张利于加注者（KK、QQ、AK、KQ、AQ）。应全范围下注取优势。" } },
    },
    {
      s: { en: "BTN vs BB. 9-8-7 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。9-8-7 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["9s", "8s", "7d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "9-8-7 connected two-tone gives the caller many straights and draws. Check more \u2014 betting your whole range overplays it.", zh: "9-8-7 连接双花给跟注者大量顺子与听牌。应多过牌 \u2014 全范围下注过度。" } },
    },
    {
      s: { en: "BTN vs BB. A-A-7 paired, BB checks. Best range action?", zh: "BTN 对 BB。A-A-7 配对，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["As", "Ad", "7c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "Paired ace boards crush the caller's ability to have a strong hand. The raiser range-bets small at high frequency.", zh: "配对 A 面让跟注者很难有强牌。加注者高频小注全范围下注。" } },
    },
    {
      s: { en: "BTN vs BB. T-9-8 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。T-9-8 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Th", "9h", "8c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "T-9-8 connected favors the caller's straights and two pair. Check more rather than betting your range.", zh: "T-9-8 连接利于跟注者的顺子与两对。应多过牌而非全范围下注。" } },
    },
    {
      s: { en: "BTN vs BB. K-7-2 rainbow, BB checks. Best range action?", zh: "BTN 对 BB。K-7-2 彩虹，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Kd", "7s", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "K-high dry and disconnected is a classic raiser range-bet board \u2014 big range + nut advantage.", zh: "K 高干燥不连接是经典加注者全范围下注牌面 \u2014 巨大范围+坚果优势。" } },
    },
    {
      s: { en: "BTN vs BB. 8-7-6 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。8-7-6 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["8d", "7d", "6c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "8-7-6 connected two-tone is full of caller straights and draws. Check more \u2014 you have no nut advantage.", zh: "8-7-6 连接双花满是跟注者顺子与听牌。应多过牌 \u2014 你无坚果优势。" } },
    },
    {
      s: { en: "BTN vs BB. A-K-Q rainbow, BB checks. Best range action?", zh: "BTN 对 BB。A-K-Q 彩虹，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ac", "Kd", "Qh"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "Broadway boards favor the preflop raiser, who holds more AA/KK/QQ and AK/AQ. Small range bet.", zh: "高张面利于翻前加注者，其 AA/KK/QQ 与 AK/AQ 更多。小注全范围下注。" } },
    },
    {
      s: { en: "BTN vs BB. Q-Q-4 paired, BB checks. Best range action?", zh: "BTN 对 BB。Q-Q-4 配对，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Qc", "Qd", "4h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "Paired high boards favor the raiser \u2014 the caller rarely has trips, so range-bet small.", zh: "配对高牌面利于加注者 \u2014 跟注者很少有三条，应小注全范围下注。" } },
    },
    {
      s: { en: "BTN vs BB. 7-5-3 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。7-5-3 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["7s", "5s", "3d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "Low boards favor the caller's pairs and draws. Check more \u2014 your high-card range doesn't connect well.", zh: "低牌面利于跟注者的对子与听牌。应多过牌 \u2014 你的高张范围连接不佳。" } },
    },
    {
      s: { en: "BTN vs BB. A-J-4 rainbow, BB checks. Best range action?", zh: "BTN 对 BB。A-J-4 彩虹，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ah", "Jd", "4c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "A-high with a broadway favors the raiser (AJ, AA, JJ, Ax). Bet your range for the edge.", zh: "A 高带一张高张利于加注者（AJ、AA、JJ、Ax）。应全范围下注取优势。" } },
    },
    {
      s: { en: "BTN vs BB. 8-6-5 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。8-6-5 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["8h", "6h", "5c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "8-6-5 two-tone connects with the caller's range. Check more \u2014 you lack the nut advantage to bet everything.", zh: "8-6-5 双花与跟注者范围连接。应多过牌 \u2014 你缺乏全范围下注所需的坚果优势。" } },
    },
    {
      s: { en: "BTN vs BB. K-K-5 paired, BB checks. Best range action?", zh: "BTN 对 BB。K-K-5 配对，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["Ks", "Kd", "5c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "Paired king board favors the raiser \u2014 the caller rarely has a king. Range-bet small at high frequency.", zh: "配对 K 面利于加注者 \u2014 跟注者很少有 K。高频小注全范围下注。" } },
    },
    {
      s: { en: "BTN vs BB. 6-5-3 two-tone, BB checks. Best range action?", zh: "BTN 对 BB。6-5-3 双花，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["6h", "5h", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["check"], leak: "range_blind",
      fb: { bet: { en: "Low connected two-tone heavily favors the caller. Check more \u2014 betting your range walks into their nut advantage.", zh: "低连接双花重度利于跟注者。应多过牌 \u2014 全范围下注会撞上其坚果优势。" } },
    },
    {
      s: { en: "BTN vs BB. A-T-2 rainbow, BB checks. Best range action?", zh: "BTN 对 BB。A-T-2 彩虹，BB 过牌。范围最佳行动？" },
      lbl: { en: "Your range", zh: "你的范围" },
      board: ["As", "Td", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: [],
      actions: ACT, correct: ["bet"], leak: "range_blind",
      fb: { check: { en: "A-high dry favors the raiser's range. Range-bet small \u2014 you hold more aces and overpairs.", zh: "A 高干燥利于加注者范围。小注全范围下注 \u2014 你的 A 与超对更多。" } },
    },
  ]),

  c4: buildSpots("c4", "concept.texture", [
    {
      s: { en: "Dry K-7-2 rainbow. You're the IP raiser with a wide range. Best approach?", zh: "干燥 K-7-2 彩虹。你是有位置加注者、范围宽。最佳方式？" },
      lbl: { en: "A\u26634\u2663 (range proxy)", zh: "A\u26634\u2663（范围示例）" },
      board: ["Ks", "7d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ac", "4c"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Dry, static boards = c-bet small at high frequency. Checking your range away surrenders the flop.", zh: "干燥静态面 = 高频小注。全范围过牌是放弃翻牌。" } },
    },
    {
      s: { en: "Very wet 9-8-7 two-tone with your overpair. Best action?", zh: "非常湿润的 9-8-7 双花，你持超对。最佳行动？" },
      lbl: { en: "A\u2665A\u2666 overpair", zh: "A\u2665A\u2666 超对" },
      board: ["9s", "8s", "7d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ad"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "A vulnerable overpair on a wet board should bet (larger) to charge the many straight and flush draws \u2014 checking lets them realize equity free.", zh: "湿润面易受攻击的超对应下注（偏大）向众多顺听花听收费 \u2014 过牌让其免费实现胜率。" } },
    },
    {
      s: { en: "Static paired 8-8-2. You hold AK high as IP raiser. Best action?", zh: "静态配对 8-8-2。你持 AK 高、有位置加注。最佳行动？" },
      lbl: { en: "A\u2665K\u2666 high", zh: "A\u2665K\u2666 高张" },
      board: ["8s", "8d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Kd"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Paired static boards are great c-bet spots: a small bet folds out overcards and denies equity. Checking is worse.", zh: "配对静态面是极佳的持续下注局面：小注打掉高张、否定胜率。过牌更差。" } },
    },
    {
      s: { en: "Dynamic 6-7-8 with flush + straight draws. You flopped bottom set. Best action?", zh: "动态 6-7-8 带花听顺听。你成底三条。最佳行动？" },
      lbl: { en: "6\u26636\u2660 bottom set", zh: "6\u26636\u2660 底三条" },
      board: ["6h", "7h", "8d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["6c", "6s"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "On dynamic boards your set is strong but vulnerable \u2014 bet (often large) to charge draws and build the pot before scare cards.", zh: "动态面你的三条强但脆弱 \u2014 应下注（常偏大）向听牌收费并在吓人牌前建池。" } },
    },
    {
      s: { en: "Monotone Q-9-4 all hearts. You hold KK with no heart. Best action?", zh: "同色 Q-9-4 全红心。你持 KK 但无红心。最佳行动？" },
      lbl: { en: "K\u2663K\u2666 no heart", zh: "K\u2663K\u2666 无红心" },
      board: ["Qh", "9h", "4h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kc", "Kd"],
      actions: ACT, correct: ["check"], leak: "sizing",
      fb: { bet: { en: "On monotone boards your no-flush overpair can't bet three streets and gets raised by flushes. Check to control the pot.", zh: "同色面无花超对无法打三条街且会被同花加注。应过牌控池。" } },
    },
    {
      s: { en: "Dry K-8-3 rainbow. You have QJ with a backdoor flush draw. Best action?", zh: "干燥 K-8-3 彩虹。你持 QJ 带后门花听。最佳行动？" },
      lbl: { en: "Q\u2663J\u2663 air + BDFD", zh: "Q\u2663J\u2663 空气+后门花听" },
      board: ["Kd", "8s", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Qc", "Jc"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Dry board, range advantage, plus backdoors and overcards \u2014 a small c-bet bluff is standard. Checking is too passive.", zh: "干燥面、范围优势、加后门与高张 \u2014 小注诈唬是标准。过牌太被动。" } },
    },
    {
      s: { en: "Wet J-T-4 two-tone. You hold 99 (under both broadways). Best action?", zh: "湿润 J-T-4 双花。你持 99（低于两张大牌）。最佳行动？" },
      lbl: { en: "9\u26639\u2666 underpair", zh: "9\u26639\u2666 低对" },
      board: ["Js", "Ts", "4d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["9c", "9d"],
      actions: ACT, correct: ["check"], leak: "sizing",
      fb: { bet: { en: "A weak underpair on a wet board has little fold equity and hates getting raised \u2014 check to keep the pot small.", zh: "湿润面弱低对几无弃牌率且怕被加注 \u2014 应过牌控小底池。" } },
    },
    {
      s: { en: "Dry A-7-2 rainbow. You hold KQ with a backdoor flush draw. Best action?", zh: "干燥 A-7-2 彩虹。你持 KQ 带后门花听。最佳行动？" },
      lbl: { en: "K\u2665Q\u2665 air + BDFD", zh: "K\u2665Q\u2665 空气+后门花听" },
      board: ["Ad", "7h", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Qh"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A-high dry is the raiser's best board \u2014 c-bet small with your air and backdoors. Checking forfeits fold equity.", zh: "A 高干燥是加注者最佳牌面 \u2014 用空气和后门小注。过牌放弃弃牌率。" } },
    },
    {
      s: { en: "Dry 8-5-2 rainbow. You hold an overpair (AA). Best action?", zh: "干燥 8-5-2 彩虹。你持超对（AA）。最佳行动？" },
      lbl: { en: "A\u2660A\u2666 overpair", zh: "A\u2660A\u2666 超对" },
      board: ["8h", "5d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Ad"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "On a dry board a small value bet gets called by worse and protects \u2014 checking is too passive with an overpair.", zh: "干燥面小价值下注被更差牌跟注又能保护 \u2014 超对过牌太被动。" } },
    },
    {
      s: { en: "Wet 9-8-7 two-tone. You hold an overpair (AA). Best action?", zh: "湿润 9-8-7 双花。你持超对（AA）。最佳行动？" },
      lbl: { en: "A\u2660A\u2666 overpair", zh: "A\u2660A\u2666 超对" },
      board: ["9h", "8h", "7c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Ad"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Your overpair is vulnerable here \u2014 bet bigger to charge straights and flush draws. Checking lets them realize equity.", zh: "你的超对在此脆弱 \u2014 应下大注向顺听与花听收费。过牌让其实现胜率。" } },
    },
    {
      s: { en: "Monotone Q-8-3 (all hearts). You hold KK with no heart. Best action?", zh: "同花 Q-8-3（全红心）。你持 KK 无红心。最佳行动？" },
      lbl: { en: "K\u2660K\u2663 overpair, no FD", zh: "K\u2660K\u2663 超对、无花听" },
      board: ["Qh", "8h", "3h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ks", "Kc"],
      actions: ACT, correct: ["check"], leak: "texture",
      fb: { bet: { en: "On a monotone board with no flush, betting only folds out worse and gets raised by flushes \u2014 check.", zh: "同花面又无花，下注只赶走更差、被同花加注 \u2014 应过牌。" } },
    },
    {
      s: { en: "Paired T-T-5. You're the IP raiser with two overcards (air). Best action?", zh: "配对 T-T-5。你是有位置加注者、持两高张（空气）。最佳行动？" },
      lbl: { en: "A\u2665K\u2666 air", zh: "A\u2665K\u2666 空气" },
      board: ["Tc", "Td", "5s"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Kd"],
      actions: ACT, correct: ["bet"], leak: "texture",
      fb: { check: { en: "Paired boards favor the aggressor \u2014 a small c-bet folds out villain's air. Checking is too passive.", zh: "配对面利于加注者 \u2014 小注打掉对手空气。过牌太被动。" } },
    },
    {
      s: { en: "Dry A-K-4 rainbow. You hold top pair (aces). Best action?", zh: "干燥 A-K-4 彩虹。你持顶对（一对 A）。最佳行动？" },
      lbl: { en: "A\u2663Q\u2665 top pair", zh: "A\u2663Q\u2665 顶对" },
      board: ["As", "Kd", "4c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Qh"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Strong top pair on a dry board wants value \u2014 bet. Worse aces and Kx pay you off.", zh: "干燥面强顶对要价值 \u2014 应下注。更差的 A 与 Kx 会跟。" } },
    },
    {
      s: { en: "Wet J-T-4 two-tone. You flopped top set. Best action?", zh: "湿润 J-T-4 双花。你翻牌成顶三条。最佳行动？" },
      lbl: { en: "J\u2665J\u2663 top set", zh: "J\u2665J\u2663 顶三条" },
      board: ["Js", "Ts", "4d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Jh", "Jc"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "A set on a wet board wants a big bet for value and protection vs the many draws \u2014 don't check.", zh: "湿润面三条要下大注取价值并保护对抗众多听牌 \u2014 别过牌。" } },
    },
    {
      s: { en: "Monotone 9-6-2 (all clubs). You hold AA with no club. Best action?", zh: "同花 9-6-2（全梅花）。你持 AA 无梅花。最佳行动？" },
      lbl: { en: "A\u2665A\u2666 overpair, no FD", zh: "A\u2665A\u2666 超对、无花听" },
      board: ["9c", "6c", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ad"],
      actions: ACT, correct: ["check"], leak: "texture",
      fb: { bet: { en: "Overpair on a monotone board with no flush gains little by betting and risks a raise \u2014 check and control.", zh: "同花面无花的超对下注收益小又怕被加注 \u2014 应过牌控池。" } },
    },
    {
      s: { en: "Dry Q-6-2 rainbow. You hold top pair (QJ). Best action?", zh: "干燥 Q-6-2 彩虹。你持顶对（QJ）。最佳行动？" },
      lbl: { en: "Q\u2665J\u2663 top pair", zh: "Q\u2665J\u2663 顶对" },
      board: ["Qd", "6s", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Qh", "Jc"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Top pair on a dry board is a value bet \u2014 worse pairs and draws call. Checking forfeits value.", zh: "干燥面顶对是价值下注 \u2014 更差对子与听牌会跟。过牌损失价值。" } },
    },
    {
      s: { en: "Wet 8-7-6 two-tone. You flopped bottom set. Best action?", zh: "湿润 8-7-6 双花。你翻牌成最小三条。最佳行动？" },
      lbl: { en: "6\u26656\u2663 bottom set", zh: "6\u26656\u2663 底三条" },
      board: ["8s", "7s", "6d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["6h", "6c"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "A set on this very wet board wants a big bet \u2014 charge the straights and flush draws now.", zh: "极湿润面的三条要下大注 \u2014 现在就向顺子与花听收费。" } },
    },
    {
      s: { en: "Paired 6-6-K. You hold top pair (kings). Best action?", zh: "配对 6-6-K。你持顶对（一对 K）。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 top pair", zh: "A\u2663K\u2663 顶对" },
      board: ["6h", "6d", "Ks"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kc"],
      actions: ACT, correct: ["bet"], leak: "texture",
      fb: { check: { en: "Top pair on a paired board favors the aggressor \u2014 bet for value; villain rarely has trips.", zh: "配对面顶对利于加注者 \u2014 应价值下注；对手很少有三条。" } },
    },
    {
      s: { en: "Dry A-8-3 rainbow. You're the IP raiser with two cards below the ace (air). Best action?", zh: "干燥 A-8-3 彩虹。你是有位置加注者，两张牌都低于 A（空气）。最佳行动？" },
      lbl: { en: "K\u2665Q\u2666 air", zh: "K\u2665Q\u2666 空气" },
      board: ["Ad", "8s", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Qd"],
      actions: ACT, correct: ["bet"], leak: "texture",
      fb: { check: { en: "A-high dry favors your range \u2014 a small range c-bet folds out air and takes the pot often.", zh: "A 高干燥利于你的范围 \u2014 小注全范围持续下注，打掉空气，常拿下底池。" } },
    },
    {
      s: { en: "Monotone K-9-4 (all diamonds). You hold AA with no diamond. Best action?", zh: "同花 K-9-4（全方块）。你持 AA 无方块。最佳行动？" },
      lbl: { en: "A\u2660A\u2663 overpair, no FD", zh: "A\u2660A\u2663 超对、无花听" },
      board: ["Kd", "9d", "4d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Ac"],
      actions: ACT, correct: ["check"], leak: "texture",
      fb: { bet: { en: "On a monotone board your overpair has no flush \u2014 betting gets raised by flushes and folds out worse. Check.", zh: "同花面你的超对无花 \u2014 下注被同花加注、只赶走更差。应过牌。" } },
    },
    {
      s: { en: "Paired K-K-3. You're the IP raiser with ace-high (air). Best action?", zh: "配对 K-K-3。你是有位置加注者，A 高（空气）。最佳行动？" },
      lbl: { en: "A\u2665 5\u2665 air", zh: "A\u2665 5\u2665 空气" },
      board: ["Ks", "Kd", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "5h"],
      actions: ACT, correct: ["bet"], leak: "texture",
      fb: { check: { en: "Paired king board favors the raiser \u2014 a small range c-bet folds out villain's air. Checking is too passive.", zh: "配对 K 面利于加注者 \u2014 小注全范围持续下注，打掉对手空气。过牌太被动。" } },
    },
    {
      s: { en: "Dry 9-5-2 rainbow. You hold an overpair (TT). Best action?", zh: "干燥 9-5-2 彩虹。你持超对（TT）。最佳行动？" },
      lbl: { en: "T\u2663T\u2660 overpair", zh: "T\u2663T\u2660 超对" },
      board: ["9h", "5d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Tc", "Ts"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "An overpair on a dry board is a clear value bet \u2014 worse pairs call and you protect. Don't check.", zh: "干燥面超对是明确价值下注 \u2014 更差对子会跟且能保护。别过牌。" } },
    },
    {
      s: { en: "Wet J-T-8 two-tone. You hold an underpair (55) with no draw. Best action?", zh: "湿润 J-T-8 双花。你持垫底小对（55）无听牌。最佳行动？" },
      lbl: { en: "5\u26655\u2663 underpair", zh: "5\u26655\u2663 垫底对" },
      board: ["Js", "Ts", "8d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["5h", "5c"],
      actions: ACT, correct: ["check"], leak: "texture",
      fb: { bet: { en: "An underpair with no equity on a wet board gains nothing by betting \u2014 check and give up.", zh: "湿润面无胜率的垫底对下注毫无收益 \u2014 应过牌放弃。" } },
    },
    {
      s: { en: "Dry A-Q-7 rainbow. You hold top pair top kicker (AK). Best action?", zh: "干燥 A-Q-7 彩虹。你持顶对顶踢（AK）。最佳行动？" },
      lbl: { en: "A\u2660K\u2665 TPTK", zh: "A\u2660K\u2665 顶对顶踢" },
      board: ["Ad", "Qs", "7c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Kh"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "TPTK on a dry board is a strong value bet \u2014 worse aces and Qx pay you off. Checking wastes value.", zh: "干燥面顶对顶踢是强价值下注 \u2014 更差的 A 与 Qx 会跟。过牌浪费价值。" } },
    },
  ]),

  c5: buildSpots("c5", "concept.cbet", [
    {
      s: { en: "Dry K-7-2. You hold QJ (air) as the IP raiser; villain checks. Best action?", zh: "干燥 K-7-2。你持 QJ（空气）有位置加注，对手过牌。最佳行动？" },
      lbl: { en: "Q\u2665J\u2665 air", zh: "Q\u2665J\u2665 空气" },
      board: ["Ks", "7d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Qh", "Jh"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Your range dominates this dry board \u2014 c-bet small as a bluff with overcards/backdoors. Checking gives up too easily.", zh: "你的范围主导该干燥面 \u2014 用高张/后门小注诈唬。过牌放弃太轻易。" } },
    },
    {
      s: { en: "A-8-3 rainbow. You have top pair top kicker. Best action?", zh: "A-8-3 彩虹。你持顶对顶踢。最佳行动？" },
      lbl: { en: "A\u2665K\u2666 TPTK", zh: "A\u2665K\u2666 顶对顶踢" },
      board: ["Ad", "8c", "3h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Kd"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "TPTK on a dry board wants value \u2014 bet. Checking lets villain catch up and misses two streets of value.", zh: "干燥面 TPTK 要价值 \u2014 应下注。过牌让对手追上并损失两条街价值。" } },
    },
    {
      s: { en: "Wet 9-8-7 with your overpair KK. Best action?", zh: "湿润 9-8-7，你持超对 KK。最佳行动？" },
      lbl: { en: "K\u2663K\u2666 overpair", zh: "K\u2663K\u2666 超对" },
      board: ["9h", "8h", "7c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kc", "Kd"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "A vulnerable overpair on a wet board should bet (larger) to charge draws \u2014 checking invites free draws.", zh: "湿润面脆弱超对应下注（偏大）向听牌收费 \u2014 过牌送免费听牌。" } },
    },
    {
      s: { en: "Low connected 6-5-4. You hold AK high (air) as IP raiser. Best action?", zh: "低连接 6-5-4。你持 AK 高（空气）有位置加注。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 air", zh: "A\u2663K\u2663 空气" },
      board: ["6s", "5d", "4c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kc"],
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "This board smashes the caller's range; AK-high has no fold equity here. Check and give up \u2014 auto continuation betting is a leak.", zh: "该面正中跟注者范围；AK 高无弃牌率。应过牌放弃 \u2014 无脑持续下注是漏洞。" } },
    },
    {
      s: { en: "Monotone Q-J-4 all spades. You have AK with no spade. Best action?", zh: "同色 Q-J-4 全黑桃。你持 AK 但无黑桃。最佳行动？" },
      lbl: { en: "A\u2663K\u2666 no spade", zh: "A\u2663K\u2666 无黑桃" },
      board: ["Qs", "Js", "4s"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kd"],
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "With no spade and just overcards on a monotone board, betting bloats the pot with no equity. Check.", zh: "同色面无黑桃仅高张，下注在无胜率下放大底池。应过牌。" } },
    },
    {
      s: { en: "Dry 9-6-4. You hold QQ, an overpair. Best action?", zh: "干燥 9-6-4。你持 QQ 超对。最佳行动？" },
      lbl: { en: "Q\u2663Q\u2666 overpair", zh: "Q\u2663Q\u2666 超对" },
      board: ["9d", "6c", "4h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Qc", "Qd"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "An overpair on a dry low board is a clear value bet \u2014 bet to get called by worse pairs and draws. Checking forfeits value and protection.", zh: "干燥低面超对是明确的价值下注 \u2014 应下注让更差的对子与听牌跟注。过牌损失价值与保护。" } },
    },
    {
      s: { en: "Paired T-T-5. You hold AJ high as IP raiser. Best action?", zh: "配对 T-T-5。你持 AJ 高、有位置加注。最佳行动？" },
      lbl: { en: "A\u2665J\u2665 air", zh: "A\u2665J\u2665 空气" },
      board: ["Tc", "Td", "5s"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Jh"],
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Paired boards favor the raiser \u2014 a small c-bet with overcards folds out villain's air. Checking is too passive.", zh: "配对面利于加注者 \u2014 用高张小注打掉对手空气。过牌太被动。" } },
    },
    {
      s: { en: "Wet J-T-9. You hold 77 (under everything, no draw). Best action?", zh: "湿润 J-T-9。你持 77（垫底、无听牌）。最佳行动？" },
      lbl: { en: "7\u26637\u2666 no equity", zh: "7\u26637\u2666 无胜率" },
      board: ["Jd", "Th", "9s"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["7c", "7d"],
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "77 on this connected board has almost no equity and no fold equity vs a range that connects \u2014 check/give up.", zh: "该连接面 77 几无胜率、对命中范围也无弃牌率 \u2014 应过牌放弃。" } },
    },
    {
      s: { en: "Dry K-7-2 rainbow. You're the IP raiser with air + backdoors. Best action?", zh: "干燥 K-7-2 彩虹。你是有位置加注者，空气+后门。最佳行动？" },
      lbl: { en: "Q\u2665J\u2665 air + BD", zh: "Q\u2665J\u2665 空气+后门" },
      board: ["Ks", "7d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Qh", "Jh"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "K-high dry favors your range \u2014 a small c-bet folds out air and takes the pot. Checking is too passive.", zh: "K 高干燥利于你的范围 \u2014 小持续下注，打掉空气拿下底池。过牌太被动。" } },
    },
    {
      s: { en: "A-9-4 rainbow. You hold top pair top kicker (AK). Best action?", zh: "A-9-4 彩虹。你持顶对顶踢（AK）。最佳行动？" },
      lbl: { en: "A\u2660K\u2665 TPTK", zh: "A\u2660K\u2665 顶对顶踢" },
      board: ["Ad", "9s", "4c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Kh"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "Bet TPTK for value \u2014 worse aces and 9x pay you off. Checking forfeits a street of value.", zh: "用顶对顶踢价值下注 \u2014 更差的 A 与 9x 会跟。过牌损失一条街价值。" } },
    },
    {
      s: { en: "Low connected 6-5-4. You're the IP raiser with ace-high (air). Best action?", zh: "低连接 6-5-4。你是有位置加注者，A 高（空气）。最佳行动？" },
      lbl: { en: "A\u2663K\u2666 air", zh: "A\u2663K\u2666 空气" },
      board: ["6h", "5s", "4d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kd"],
      actions: ACT, correct: ["check"], leak: "cbet",
      fb: { bet: { en: "6-5-4 smashes the caller's range. Your ace-high air should check/give up, not auto continuation bet.", zh: "6-5-4 正中跟注者范围。你的 A 高空气应过牌放弃，而非自动持续下注。" } },
    },
    {
      s: { en: "Wet 9-8-7 two-tone. You hold an overpair (KK). Best action?", zh: "湿润 9-8-7 双花。你持超对（KK）。最佳行动？" },
      lbl: { en: "K\u2665K\u2663 overpair", zh: "K\u2665K\u2663 超对" },
      board: ["9s", "8s", "7d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Kc"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Bet (bigger) to charge the many straights and flush draws \u2014 checking lets them realize equity for free.", zh: "应（加大）下注向众多顺听与花听收费 \u2014 过牌让其免费实现胜率。" } },
    },
    {
      s: { en: "Monotone Q-J-5 (all spades). You hold AK with no spade. Best action?", zh: "同花 Q-J-5（全黑桃）。你持 AK 无黑桃。最佳行动？" },
      lbl: { en: "A\u2665K\u2666 overcards, no FD", zh: "A\u2665K\u2666 高张、无花听" },
      board: ["Qs", "Js", "5s"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Kd"],
      actions: ACT, correct: ["check"], leak: "texture",
      fb: { bet: { en: "Monotone with only overcards and no flush \u2014 betting folds out worse and runs into made flushes. Check.", zh: "同花面只有高张又无花 \u2014 下注赶走更差、撞上成花。应过牌。" } },
    },
    {
      s: { en: "Paired 8-8-3. You're the IP raiser with two overcards (air). Best action?", zh: "配对 8-8-3。你是有位置加注者，两高张（空气）。最佳行动？" },
      lbl: { en: "A\u2660K\u2665 air", zh: "A\u2660K\u2665 空气" },
      board: ["8h", "8d", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Kh"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "Paired boards favor the aggressor \u2014 a small range c-bet folds out air. Checking is too passive.", zh: "配对面利于加注者 \u2014 小注全范围持续下注，打掉空气。过牌太被动。" } },
    },
    {
      s: { en: "Dry Q-6-2 rainbow. You hold an overpair (AA). Best action?", zh: "干燥 Q-6-2 彩虹。你持超对（AA）。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair", zh: "A\u2665A\u2663 超对" },
      board: ["Qd", "6s", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ac"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "An overpair on a dry board is a clear value bet \u2014 worse Qx and pairs call. Don't check.", zh: "干燥面超对是明确价值下注 \u2014 更差的 Qx 与对子会跟。别过牌。" } },
    },
    {
      s: { en: "7-6-5 two-tone. You're the IP raiser with ace-high (air). Best action?", zh: "7-6-5 双花。你是有位置加注者，A 高（空气）。最佳行动？" },
      lbl: { en: "A\u2660K\u2666 air", zh: "A\u2660K\u2666 空气" },
      board: ["7c", "6c", "5d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Kd"],
      actions: ACT, correct: ["check"], leak: "cbet",
      fb: { bet: { en: "This connected two-tone board favors the caller \u2014 give up your ace-high rather than auto continuation betting.", zh: "该连接双花利于跟注者 \u2014 应放弃 A 高而非自动持续下注。" } },
    },
    {
      s: { en: "A-K-7 rainbow. You flopped a set of sevens. Best action?", zh: "A-K-7 彩虹。你翻牌成一对 7 的三条。最佳行动？" },
      lbl: { en: "7\u26657\u2660 set", zh: "7\u26657\u2660 三条" },
      board: ["As", "Kd", "7c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["7h", "7s"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "A set on a high board wants value \u2014 bet; Ax and Kx will pay you off. Checking wastes a big street.", zh: "高牌面三条要价值 \u2014 应下注；Ax 与 Kx 会跟。过牌浪费一条大街。" } },
    },
    {
      s: { en: "Low dry 9-5-2 rainbow. You're the IP raiser with two overcards (air). Best action?", zh: "低干燥 9-5-2 彩虹。你是有位置加注者，两高张（空气）。最佳行动？" },
      lbl: { en: "K\u2663Q\u2666 air", zh: "K\u2663Q\u2666 空气" },
      board: ["9h", "5d", "2c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kc", "Qd"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "Low dry boards still favor the raiser's overpairs \u2014 a small c-bet with overcards/backdoors is standard. Checking is too passive.", zh: "低干燥面仍利于加注者的超对 \u2014 用高张/后门小注是标准。过牌太被动。" } },
    },
    {
      s: { en: "8-7-6 two-tone. You're the IP raiser with ace-high (air). Best action?", zh: "8-7-6 双花。你是有位置加注者，A 高（空气）。最佳行动？" },
      lbl: { en: "A\u2660Q\u2666 air", zh: "A\u2660Q\u2666 空气" },
      board: ["8d", "7d", "6c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Qd"],
      actions: ACT, correct: ["check"], leak: "cbet",
      fb: { bet: { en: "Connected two-tone boards favor the caller \u2014 give up your ace-high air rather than c-betting into their range.", zh: "连接双花面利于跟注者 \u2014 应放弃 A 高空气，而非向其范围持续下注。" } },
    },
    {
      s: { en: "Dry K-Q-3 rainbow. You hold top pair (KJ). Best action?", zh: "干燥 K-Q-3 彩虹。你持顶对（KJ）。最佳行动？" },
      lbl: { en: "K\u2665J\u2663 top pair", zh: "K\u2665J\u2663 顶对" },
      board: ["Ks", "Qd", "3c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Jc"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "Top pair on a dry broadway board is a value bet \u2014 worse Kx and Qx call. Don't check.", zh: "干燥高张面顶对是价值下注 \u2014 更差的 Kx 与 Qx 会跟。别过牌。" } },
    },
    {
      s: { en: "Wet T-9-6 two-tone. You hold an overpair (AA). Best action?", zh: "湿润 T-9-6 双花。你持超对（AA）。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair", zh: "A\u2665A\u2663 超对" },
      board: ["Ts", "9s", "6d"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ac"],
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "Your overpair is vulnerable on this wet board \u2014 bet (bigger) to charge straight and flush draws. Don't check.", zh: "湿润面你的超对脆弱 \u2014 应（加大）下注向顺听与花听收费。别过牌。" } },
    },
    {
      s: { en: "Monotone 7-5-2 (all hearts). You hold KK with no heart. Best action?", zh: "同花 7-5-2（全红心）。你持 KK 无红心。最佳行动？" },
      lbl: { en: "K\u2660K\u2663 overpair, no FD", zh: "K\u2660K\u2663 超对、无花听" },
      board: ["7h", "5h", "2h"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ks", "Kc"],
      actions: ACT, correct: ["check"], leak: "texture",
      fb: { bet: { en: "On a monotone board your overpair holds no flush \u2014 betting gets raised by flushes and folds out worse. Check.", zh: "同花面你的超对无花 \u2014 下注被同花加注、只赶走更差。应过牌。" } },
    },
    {
      s: { en: "Paired Q-Q-4. You're the IP raiser with two big cards (air). Best action?", zh: "配对 Q-Q-4。你是有位置加注者，两张大牌（空气）。最佳行动？" },
      lbl: { en: "A\u2665K\u2666 air", zh: "A\u2665K\u2666 空气" },
      board: ["Qs", "Qd", "4c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Kd"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "Paired high boards favor the aggressor \u2014 a small range c-bet folds out air; villain rarely has a queen. Don't check.", zh: "配对高牌面利于加注者 \u2014 小注全范围持续下注，打掉空气；对手很少有 Q。别过牌。" } },
    },
    {
      s: { en: "Dry A-J-5 rainbow. You hold top pair top kicker (AK). Best action?", zh: "干燥 A-J-5 彩虹。你持顶对顶踢（AK）。最佳行动？" },
      lbl: { en: "A\u2660K\u2665 TPTK", zh: "A\u2660K\u2665 顶对顶踢" },
      board: ["Ad", "Js", "5c"], pot: 6, bet: 0, pos: "BTN (IP)", hand: ["As", "Kh"],
      actions: ACT, correct: ["bet"], leak: "cbet",
      fb: { check: { en: "TPTK on a dry board is a strong value bet \u2014 worse aces and Jx pay you off. Checking wastes value.", zh: "干燥面顶对顶踢是强价值下注 \u2014 更差的 A 与 Jx 会跟。过牌浪费价值。" } },
    },
  ]),

  c6: buildSpots("c6", "concept.defense", [
    {
      s: { en: "BB vs BTN. 9-7-2 rainbow, villain c-bets 1/3. You hold KQ (two overcards). Best action?", zh: "BB 对 BTN。9-7-2 彩虹，对手 1/3 池持续下注。你持 KQ（两张高张）。最佳行动？" },
      lbl: { en: "K\u2665Q\u2665 two overcards", zh: "K\u2665Q\u2665 两高张" },
      board: ["9s", "7d", "2c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Kh", "Qh"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Vs a small c-bet you must defend near MDF; KQ has two clean overcards that can make top pair and already beats villain's bluffs \u2014 folding is too tight.", zh: "面对小持续下注，需接近 MDF 防守；KQ 有两张干净高张可成顶对，且已赢对手诈唬 \u2014 防守过紧。" },
        raise: { en: "Raising turns a fine bluff-catcher into a bluff with no made hand; just call.", zh: "加注把不错的抓诈牌变成无成手的诈唬；应平跟。" },
      },
    },
    {
      s: { en: "BB vs BTN. 9-8-2 two-tone, you hold a flush draw + open-ender, villain c-bets. Best action?", zh: "BB 对 BTN。9-8-2 双花，你持花听+两头顺听，对手持续下注。最佳行动？" },
      lbl: { en: "J\u2665T\u2665 FD + OESD", zh: "J\u2665T\u2665 花听+两头顺听" },
      board: ["9h", "8h", "2c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Jh", "Th"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: {
        fold: { en: "Folding a ~15-out monster draw with tons of equity and fold equity is a major leak \u2014 raise (or at least call).", zh: "弃掉约 15 张补牌、胜率与弃牌率俱佳的超强听牌是明显漏洞 \u2014 应加注（至少跟注）。" },
      },
    },
    {
      s: { en: "BB vs BTN. K-7-2 rainbow, villain bets near pot. You hold 5-4 (no pair, no draw). Best action?", zh: "BB 对 BTN。K-7-2 彩虹，对手接近底池下注。你持 5-4（无对无听）。最佳行动？" },
      lbl: { en: "5\u26634\u2663 air", zh: "5\u26634\u2663 空气" },
      board: ["Kd", "7s", "2c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["5c", "4c"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "With no equity vs a big bet, calling just bleeds chips \u2014 this is the bottom of your range, fold.", zh: "面对大注无胜率，跟注只会流血 \u2014 这是范围底部，应弃牌。" },
        raise: { en: "Bluff-raising air with no equity into a strong betting range is spew.", zh: "无胜率用空气对强下注范围诈唬加注是乱送。" },
      },
    },
    {
      s: { en: "BB vs BTN. Q-J-4 two-tone, you hold the nut flush draw + gutshot, villain c-bets. Best action?", zh: "BB 对 BTN。Q-J-4 双花，你持坚果花听+卡顺，对手持续下注。最佳行动？" },
      lbl: { en: "A\u2660T\u2660 nut FD + gut", zh: "A\u2660T\u2660 坚果花听+卡顺" },
      board: ["Qs", "Js", "4d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["As", "Ts"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: {
        fold: { en: "A nut flush draw with a gutshot and overcard has huge equity \u2014 folding is too tight here. Call or raise as a semi-bluff.", zh: "带卡顺与高张的坚果花听胜率巨大 \u2014 防守过紧。应跟注或半诈唬加注。" },
      },
    },
    {
      s: { en: "BB vs BTN. A-K-6 rainbow, villain bets big. You hold 6-5 (bottom pair). Best action?", zh: "BB 对 BTN。A-K-6 彩虹，对手大注。你持 6-5（底对）。最佳行动？" },
      lbl: { en: "6\u26655\u2665 bottom pair", zh: "6\u26655\u2665 底对" },
      board: ["Ah", "Kd", "6c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["6h", "5h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Bottom pair vs a big bet on an ace-king board is dominated and pays off later \u2014 fold.", zh: "A-K 面底对面对大注被压制且后续要付钱 \u2014 应弃牌。" },
        raise: { en: "Raising bottom pair for value or as a bluff makes no sense vs a strong range.", zh: "用底对价值或诈唬加注对强范围毫无道理。" },
      },
    },
    {
      s: { en: "BB vs BTN. Q-8-3 rainbow, villain c-bets small. You hold top pair (QJ). Best action?", zh: "BB 对 BTN。Q-8-3 彩虹，对手小持续下注。你持顶对（QJ）。最佳行动？" },
      lbl: { en: "Q\u2665J\u2663 top pair", zh: "Q\u2665J\u2663 顶对" },
      board: ["Qd", "8s", "3c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Qh", "Jc"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Top pair is far too strong to fold vs a small c-bet \u2014 at minimum call.", zh: "顶对面对小持续下注，远不够弃牌 \u2014 至少跟注。" },
        raise: { en: "Raising top-pair-good-kicker bloats the pot and folds out worse; calling keeps villain's bluffs in.", zh: "用顶对好踢加注放大底池且赶走更差牌；跟注保留对手诈唬。" },
      },
    },
    {
      s: { en: "BB vs BTN. Wet 8-7-6, you flopped bottom set (66), villain c-bets. Best action?", zh: "BB 对 BTN。湿润 8-7-6，你成底三条（66），对手持续下注。最佳行动？" },
      lbl: { en: "6\u26606\u2666 bottom set", zh: "6\u26606\u2666 底三条" },
      board: ["8h", "7h", "6c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["6s", "6d"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "Never fold a set on a wet board.", zh: "湿润面绝不弃三条。" },
        call: { en: "On this very wet board, flatting lets draws and straights realize equity cheaply \u2014 raise for value and protection.", zh: "如此湿润面只跟注让听牌与顺子便宜实现胜率 \u2014 应加注价值并保护。" },
      },
    },
    {
      s: { en: "BB vs BTN. J-9-4 rainbow, villain c-bets small. You hold KQ (two overcards + gutshot). Best action?", zh: "BB 对 BTN。J-9-4 彩虹，对手小持续下注。你持 KQ（两高张+卡顺）。最佳行动？" },
      lbl: { en: "K\u2666Q\u2666 overs + gut", zh: "K\u2666Q\u2666 高张+卡顺" },
      board: ["Js", "9d", "4c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Kd", "Qd"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Two overcards plus a gutshot vs a small bet has enough equity to defend \u2014 folding is too tight.", zh: "两高张加卡顺面对小注有足够胜率防守 \u2014 防守过紧。" },
        raise: { en: "This is a continue, not a raise \u2014 calling realizes your equity while keeping bluffs in.", zh: "这是跟注牌而非加注 \u2014 跟注实现胜率并保留对手诈唬。" },
      },
    },
    {
      s: { en: "BB vs BTN. 8-7-3 two-tone, villain c-bets. You hold a flush draw + open-ender. Best action?", zh: "BB 对 BTN。8-7-3 双花，对手持续下注。你持花听+两头顺听。最佳行动？" },
      lbl: { en: "T\u26609\u2660 FD+OESD", zh: "T\u26609\u2660 花听+顺听" },
      board: ["8s", "7s", "3d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Ts", "9s"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A big combo draw (flush + open-ender) is a check-raise semi-bluff, never a fold.", zh: "巨大组合听牌（花+两头顺）是过牌加注半诈唬，绝不弃牌。" } },
    },
    {
      s: { en: "BB vs BTN. K-8-3 rainbow, villain c-bets 1/3. You hold top pair (KT). Best action?", zh: "BB 对 BTN。K-8-3 彩虹，对手 1/3 池持续下注。你持顶对（KT）。最佳行动？" },
      lbl: { en: "K\u2665T\u2663 top pair", zh: "K\u2665T\u2663 顶对" },
      board: ["Kd", "8s", "3c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Kh", "Tc"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Top pair is far too strong to fold vs a small c-bet.", zh: "顶对面对小持续下注，远不够弃牌。" },
        raise: { en: "Raising folds out worse and bloats the pot OOP \u2014 just call and keep villain's bluffs in.", zh: "加注赶走更差并在无位置做大底池 \u2014 应平跟，保留对手诈唬。" },
      },
    },
    {
      s: { en: "BB vs BTN. A-K-7 rainbow, villain bets big. You hold 6-high with no real draw. Best action?", zh: "BB 对 BTN。A-K-7 彩虹，对手大注。你持 6 高、无真听牌。最佳行动？" },
      lbl: { en: "6\u26655\u2665 air", zh: "6\u26655\u2665 空气" },
      board: ["As", "Kd", "7c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["6h", "5h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "6-high with no real draw on an A-K board can't continue vs a big bet \u2014 fold.", zh: "A-K 面 6 高又无真听牌，无法面对大注继续 \u2014 应弃。" },
        raise: { en: "Bluff-raising with no equity into a board that smashes villain is spew.", zh: "在正中对手的牌面上用无胜率牌诈加注是乱送。" },
      },
    },
    {
      s: { en: "BB vs BTN. Q-7-2 rainbow, villain c-bets. You flopped a set of sevens. Best action?", zh: "BB 对 BTN。Q-7-2 彩虹，对手持续下注。你翻牌成一对 7 三条。最佳行动？" },
      lbl: { en: "7\u26657\u2660 set", zh: "7\u26657\u2660 三条" },
      board: ["Qh", "7d", "2c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["7h", "7s"],
      actions: FACE, correct: ["raise"], leak: "too_tight",
      fb: {
        call: { en: "Check-raise your set for value and to start building the pot \u2014 flatting is too passive with a monster.", zh: "用三条过牌加注取价值并开始做大底池 \u2014 持怪兽牌平跟太被动。" },
        fold: { en: "Never fold a set.", zh: "绝不弃三条。" },
      },
    },
    {
      s: { en: "BB vs BTN. A-T-4 rainbow, villain bets big. You hold bottom pair (fours). Best action?", zh: "BB 对 BTN。A-T-4 彩虹，对手大注。你持底对（一对 4）。最佳行动？" },
      lbl: { en: "4\u26653\u2665 bottom pair", zh: "4\u26653\u2665 底对" },
      board: ["Ah", "Td", "4c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["4h", "3h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Bottom pair on an A-T board is dominated and pays off too often \u2014 fold to a big bet.", zh: "A-T 面底对被压制且常被诈赔 \u2014 面对大注应弃。" },
        raise: { en: "Raising bottom pair as a bluff folds out nothing better and gets called by better.", zh: "用底对诈唬加注赶不走更好牌、反被更好牌跟。" },
      },
    },
    {
      s: { en: "BB vs BTN. Q-8-3 two spades, villain c-bets. You hold the nut flush draw with two overcards. Best action?", zh: "BB 对 BTN。Q-8-3 两张黑桃，对手持续下注。你持坚果同花听+两高张。最佳行动？" },
      lbl: { en: "A\u2660K\u2660 nut FD + overs", zh: "A\u2660K\u2660 坚果花听+高张" },
      board: ["Qs", "8s", "3d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["As", "Ks"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Nut flush draw plus two overcards has huge equity \u2014 never fold; call or check-raise.", zh: "坚果同花听加两高张胜率巨大 \u2014 绝不弃；应跟注或过牌加注。" } },
    },
    {
      s: { en: "BB vs BTN. J-8-5 two-tone, villain c-bets. You flopped two pair (J8). Best action?", zh: "BB 对 BTN。J-8-5 双花，对手持续下注。你翻牌成两对（J8）。最佳行动？" },
      lbl: { en: "J\u26658\u2665 two pair", zh: "J\u26658\u2665 两对" },
      board: ["Jc", "8c", "5s"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Jh", "8h"],
      actions: FACE, correct: ["raise", "call"], leak: "too_tight",
      fb: { fold: { en: "Two pair is far too strong to fold \u2014 raise for value/protection on a draw-heavy board.", zh: "两对远不够弃牌 \u2014 在听牌多的面上加注取价值并保护。" } },
    },
    {
      s: { en: "BB vs BTN. K-Q-6 rainbow, villain bets big. You hold a bare Broadway gutshot. Best action?", zh: "BB 对 BTN。K-Q-6 彩虹，对手大注。你持单纯的 broadway 卡顺。最佳行动？" },
      lbl: { en: "J\u2660T\u2660 gutshot", zh: "J\u2660T\u2660 卡顺" },
      board: ["Kh", "Qd", "6c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["Js", "Ts"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "A bare gutshot (need an ace) has too little equity to call a big bet OOP \u2014 fold.", zh: "单纯卡顺（需一张 A）胜率太低，无位置面对大注无法跟 \u2014 应弃。" },
        raise: { en: "A 4-out gutshot lacks the equity to turn into a check-raise bluff here.", zh: "4 张补牌的卡顺没有足够胜率在此变成过牌加注诈唬。" },
      },
    },
    {
      s: { en: "BB vs BTN. 9-6-3 two clubs, villain c-bets 1/3. You hold the nut flush draw with two overcards. Best action?", zh: "BB 对 BTN。9-6-3 两张梅花，对手 1/3 池持续下注。你持坚果同花听+两高张。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 nut FD + overs", zh: "A\u2663K\u2663 坚果花听+高张" },
      board: ["9d", "6c", "3c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Ac", "Kc"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Nut flush draw plus two overcards vs a small bet is a clear continue \u2014 never fold.", zh: "坚果同花听加两高张面对小注是明确继续 \u2014 绝不弃。" } },
    },
    {
      s: { en: "BB vs BTN. A-9-5 rainbow, villain bets big. You hold bottom pair (fives). Best action?", zh: "BB 对 BTN。A-9-5 彩虹，对手大注。你持底对（一对 5）。最佳行动？" },
      lbl: { en: "5\u26654\u2665 bottom pair", zh: "5\u26654\u2665 底对" },
      board: ["Ah", "9d", "5c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["5h", "4h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Bottom pair vs a big bet on an ace-high board is dominated \u2014 fold.", zh: "A 高面底对面对大注被压制 \u2014 应弃。" },
        raise: { en: "Raising bottom pair as a bluff gets called by everything that beats you.", zh: "用底对诈唬加注会被所有领先你的牌跟注。" },
      },
    },
    {
      s: { en: "BB vs BTN. T-9-4 rainbow, villain c-bets half. You hold an open-ended straight draw. Best action?", zh: "BB 对 BTN。T-9-4 彩虹，对手半池 持续下注。你持两头顺听。最佳行动？" },
      lbl: { en: "8\u26657\u2665 OESD", zh: "8\u26657\u2665 两头顺听" },
      board: ["Td", "9s", "4c"], pot: 6, bet: 3, pos: "BB (OOP)", hand: ["8h", "7h"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "8 outs (any J or 6) easily defends vs a half-pot bet \u2014 folding is too tight.", zh: "8 张补牌（任意 J 或 6）面对半池轻松防守 \u2014 防守过紧。" } },
    },
    {
      s: { en: "BB vs BTN. Q-7-2 rainbow, villain c-bets 1/3. You hold top pair (QJ). Best action?", zh: "BB 对 BTN。Q-7-2 彩虹，对手 1/3 池持续下注。你持顶对（QJ）。最佳行动？" },
      lbl: { en: "Q\u2665J\u2663 top pair", zh: "Q\u2665J\u2663 顶对" },
      board: ["Qd", "7s", "2c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Qh", "Jc"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Top pair is far too strong to fold vs a small c-bet.", zh: "顶对面对小持续下注，远不够弃牌。" },
        raise: { en: "Raising folds out worse and bloats the pot OOP \u2014 call and keep bluffs in.", zh: "加注赶走更差并在无位置做大底池 \u2014 应平跟，保留诈唬。" },
      },
    },
    {
      s: { en: "BB vs BTN. 8-5-2 rainbow, villain c-bets. You flopped a set of fives. Best action?", zh: "BB 对 BTN。8-5-2 彩虹，对手持续下注。你翻牌成一对 5 三条。最佳行动？" },
      lbl: { en: "5\u26655\u2660 set", zh: "5\u26655\u2660 三条" },
      board: ["8h", "5d", "2c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["5h", "5s"],
      actions: FACE, correct: ["raise"], leak: "too_tight",
      fb: {
        call: { en: "Check-raise your set for value \u2014 build the pot now while villain has bluffs and second-best hands.", zh: "用三条过牌加注取价值 \u2014 趁对手有诈唬与次优牌时把底池做大。" },
        fold: { en: "Never fold a set.", zh: "绝不弃三条。" },
      },
    },
    {
      s: { en: "BB vs BTN. K-9-4 rainbow, villain bets big. You hold a bare gutshot + backdoor. Best action?", zh: "BB 对 BTN。K-9-4 彩虹，对手大注。你持单纯卡顺+后门。最佳行动？" },
      lbl: { en: "J\u2663T\u2663 gutshot", zh: "J\u2663T\u2663 卡顺" },
      board: ["Ks", "9h", "4d"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["Jc", "Tc"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "A bare gutshot (need a Q) plus a backdoor can't profitably call a big bet OOP \u2014 fold.", zh: "单纯卡顺（需一张 Q）加后门，无位置面对大注无法盈利跟注 \u2014 应弃。" },
        raise: { en: "Too little equity to turn this into a bluff-raise.", zh: "胜率太低，不足以把它变成诈唬加注。" },
      },
    },
    {
      s: { en: "BB vs BTN. 6-5-2 two spades, villain c-bets. You hold a flush draw + open-ender. Best action?", zh: "BB 对 BTN。6-5-2 两张黑桃，对手持续下注。你持花听+两头顺听。最佳行动？" },
      lbl: { en: "8\u26607\u2660 FD+OESD", zh: "8\u26607\u2660 花听+顺听" },
      board: ["6s", "5s", "2d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["8s", "7s"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A ~15-out combo draw should check-raise as a semi-bluff, never fold.", zh: "约 15 张补牌的组合听牌应过牌加注半诈唬，绝不弃。" } },
    },
    {
      s: { en: "BB vs BTN. A-6-3 rainbow, villain c-bets 1/3. You hold top pair top kicker. Best action?", zh: "BB 对 BTN。A-6-3 彩虹，对手 1/3 池持续下注。你持顶对顶踢。最佳行动？" },
      lbl: { en: "A\u2665Q\u2663 TPTK", zh: "A\u2665Q\u2663 顶对顶踢" },
      board: ["As", "6d", "3c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Ah", "Qc"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "Top pair top kicker is never a fold vs a small c-bet \u2014 continue.", zh: "顶对顶踢面对小持续下注，绝不弃 \u2014 应继续。" } },
    },
  ]),

  c7: [
    _action("c7-q1", "c7.q1.s", {
      street: "river", board: ["2c", "7d", "9h", "Js", "4s"], pot: 100, bet: 100,
      hero: { pos: "IP", hand: ["Ad", "Ac"], labelKey: "spot.lbl.aa_bc" },
      villain: { pos: "OOP", label: "Polarized" },
      facing: "bet", solverRef: "polar-pot",
    }, ["call"], "precise", "too_tight", {
      fold: { reasonKey: "c1.q4.fb.fold", concept: "mdf" },
      raise: { reasonKey: "fb.generic.bet_bad", concept: "polarization" },
    }),
    _action("c7-q2", "c7.q2.s", {
      street: "river", board: ["2c", "7d", "9h", "Js", "4s"], pot: 100, bet: 50,
      hero: { pos: "IP", hand: ["Ad", "Ac"], labelKey: "spot.lbl.aa_bc" },
      facing: "bet", solverRef: "polar-half",
    }, ["call"], "precise", "too_tight", {
      fold: { reasonKey: "c1.q3.fb.a", concept: "mdf" },
    }),
    _action("c7-q3", "c7.q3.s", {
      street: "river", board: ["8c", "7d", "5h", "3s", "2c"], pot: 100, bet: 100,
      hero: { pos: "IP", hand: ["Jd", "Jc"], labelKey: "spot.lbl.jj_over" },
      facing: "bet", solverRef: "range-mdf",
    }, ["call"], "precise", "too_tight", {
      fold: { reasonKey: "c1.q4.fb.fold", concept: "mdf" },
    }),
    ...Array.from({ length: 5 }, (_, i) =>
      _action("c7-q" + (i + 4), "c7.q" + (i + 4) + ".s", {
        street: "river", board: ["2c", "7d", "9h", "Js", "4s"], pot: 100, bet: 100,
        hero: { pos: "IP", hand: ["Ad", "Ac"], labelKey: "spot.lbl.aa_bc" },
        facing: "bet", solverRef: "polar-pot",
      }, ["call"], "precise", "too_tight", {
        fold: { reasonKey: "c1.q4.fb.fold", concept: "mdf" },
      })
    ),
    ...Array.from({ length: 16 }, (_, i) => {
      const n = i + 9;
      return _choice("c7-q" + n, "c7.q" + n + ".s", [
        { id: "a", labelKey: "c7.q" + n + ".a" },
        { id: "b", labelKey: "c7.q" + n + ".b" },
        { id: "c", labelKey: "c7.q" + n + ".c" },
        { id: "d", labelKey: "c7.q" + n + ".d" },
      ], "a", "conceptual", "mdf", "c7.q" + n + ".fb");
    }),
  ],

  c8: [
    _action("c8-q1", "c8.q1.s", {
      street: "river", board: ["2c", "7d", "9h", "Js", "4s"], pot: 100, bet: 0,
      hero: { pos: "OOP", hand: ["Jh", "Jc"], labelKey: "spot.lbl.set_jacks" },
      facing: "action", solverRef: "nuts-air",
    }, ["check", "bet"], "precise", "indifference", {
      fold: { reasonKey: "fb.generic.bet_bad", concept: "indifference" },
    }),
    _choice("c8-q2", "c8.q2.s", [
      { id: "a", labelKey: "c8.q2.a" },
      { id: "b", labelKey: "c8.q2.b" },
      { id: "c", labelKey: "c8.q2.c" },
      { id: "d", labelKey: "c8.q2.d" },
    ], "a", "conceptual", "indifference", "c8.q2.fb"),
    _choice("c8-q3", "c8.q3.s", [
      { id: "a", labelKey: "c8.q3.a" },
      { id: "b", labelKey: "c8.q3.b" },
      { id: "c", labelKey: "c8.q3.c" },
      { id: "d", labelKey: "c8.q3.d" },
    ], "a", "conceptual", "indifference", "c8.q3.fb"),
    _choice("c8-q4", "c8.q4.s", [
      { id: "a", labelKey: "c8.q4.a" },
      { id: "b", labelKey: "c8.q4.b" },
      { id: "c", labelKey: "c8.q4.c" },
      { id: "d", labelKey: "c8.q4.d" },
    ], "a", "conceptual", "indifference", "c8.q4.fb"),
    _choice("c8-q5", "c8.q5.s", [
      { id: "a", labelKey: "c8.q5.a" },
      { id: "b", labelKey: "c8.q5.b" },
      { id: "c", labelKey: "c8.q5.c" },
      { id: "d", labelKey: "c8.q5.d" },
    ], "a", "conceptual", "indifference", "c8.q5.fb"),
    _choice("c8-q6", "c8.q6.s", [
      { id: "a", labelKey: "c8.q6.a" },
      { id: "b", labelKey: "c8.q6.b" },
      { id: "c", labelKey: "c8.q6.c" },
      { id: "d", labelKey: "c8.q6.d" },
    ], "a", "conceptual", "indifference", "c8.q6.fb"),
    _choice("c8-q7", "c8.q7.s", [
      { id: "a", labelKey: "c8.q7.a" },
      { id: "b", labelKey: "c8.q7.b" },
      { id: "c", labelKey: "c8.q7.c" },
      { id: "d", labelKey: "c8.q7.d" },
    ], "a", "conceptual", "indifference", "c8.q7.fb"),
    _choice("c8-q8", "c8.q8.s", [
      { id: "a", labelKey: "c8.q8.a" },
      { id: "b", labelKey: "c8.q8.b" },
      { id: "c", labelKey: "c8.q8.c" },
      { id: "d", labelKey: "c8.q8.d" },
    ], "a", "conceptual", "indifference", "c8.q8.fb"),
    ...Array.from({ length: 16 }, (_, i) => {
      const n = i + 9;
      return _choice("c8-q" + n, "c8.q" + n + ".s", [
        { id: "a", labelKey: "c8.q" + n + ".a" },
        { id: "b", labelKey: "c8.q" + n + ".b" },
        { id: "c", labelKey: "c8.q" + n + ".c" },
        { id: "d", labelKey: "c8.q" + n + ".d" },
      ], "a", "conceptual", "indifference", "c8.q" + n + ".fb");
    }),
  ],

  c9: buildSpots("c9", "concept.turn", [
    {
      s: { en: "Turn. You c-bet flop, got called. The turn K is an overcard that favors your range, and you hold the nut flush draw with an ace overcard. Best action?", zh: "转牌。你翻牌持续下注被跟。转牌 K 是利于你范围的高张，且你持坚果同花听+A 高张。最佳行动？" },
      lbl: { en: "A\u2660Q\u2660 nut FD", zh: "A\u2660Q\u2660 坚果花听" },
      board: ["8s", "5s", "2d", "Kd"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["As", "Qs"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A scare card that hits your range plus the nut flush draw is an ideal second barrel \u2014 checking forfeits fold equity and your equity edge.", zh: "击中你范围的吓人牌加上坚果同花听是理想的第二枪 \u2014 过牌放弃弃牌率与胜率优势。" } },
    },
    {
      s: { en: "Turn. The 9 pairs the board, which mostly helps the caller, and you have pure air with no equity. Best action?", zh: "转牌。9 配对了牌面，主要帮到跟注者，而你是无胜率的纯空气。最佳行动？" },
      lbl: { en: "A\u2663K\u2666 air", zh: "A\u2663K\u2666 空气" },
      board: ["9h", "8h", "4c", "9s"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kd"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "A second barrel here folds out nothing better and gets called by all the pairs \u2014 give up and check.", zh: "这里开第二枪打不掉更好的牌，反被各种对子跟注 \u2014 应放弃过牌。" } },
    },
    {
      s: { en: "Turn adds a third heart and completes straight draws on a wet board. You hold an overpair. Best action?", zh: "转牌来第三张红心且顺子听牌成牌，牌面湿润。你持超对。最佳行动？" },
      lbl: { en: "A\u2660A\u2663 overpair", zh: "A\u2660A\u2663 超对" },
      board: ["9h", "8h", "4c", "7h"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["As", "Ac"], street: "turn",
      actions: ACT, correct: ["check"], leak: "sizing",
      fb: { bet: { en: "When the turn completes straights and brings a third flush card, your overpair is now a bluff-catcher \u2014 barreling only gets called by better. Check.", zh: "转牌成顺且出现第三张同花（同花已可能成立）时，你的超对已沦为抓诈牌 \u2014 开火只会被更好牌跟注。应过牌。" } },
    },
    {
      s: { en: "Turn pairs your queen, giving you trips on a dry board. Best action?", zh: "转牌配对你的 Q，在干燥面给你三条。最佳行动？" },
      lbl: { en: "A\u2663Q\u2663 trips", zh: "A\u2663Q\u2663 三条" },
      board: ["Qs", "8d", "3c", "Qh"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Qc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Trips with top kicker is a clear value bet \u2014 checking misses two big streets of value.", zh: "三条带顶踢是明显的价值下注 \u2014 过牌损失两条大街的价值。" } },
    },
    {
      s: { en: "Turn A is a scare card. You flopped top pair but the ace demotes you to a pair of jacks with showdown value. Best action?", zh: "转牌 A 是吓人牌。你翻牌成顶对，但这张 A 把你降为一对 J（有摊牌价值）。最佳行动？" },
      lbl: { en: "K\u2666J\u2663 pair of jacks", zh: "K\u2666J\u2663 一对 J" },
      board: ["Jh", "9d", "4c", "Ah"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Kd", "Jc"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "Barreling turns a hand with showdown value into a bluff \u2014 check to keep the pot small and realize your equity.", zh: "开火把有摊牌价值的牌变成诈唬 \u2014 应过牌控小底池并实现胜率。" } },
    },
    {
      s: { en: "Turn. You hold the nut flush draw with two overcards \u2014 a strong semi-bluff barrel candidate. Best action?", zh: "转牌。你持坚果同花听+两张高张 \u2014 强力的半诈唬开火候选。最佳行动？" },
      lbl: { en: "A\u2660K\u2660 nut FD + overs", zh: "A\u2660K\u2660 坚果花听+高张" },
      board: ["6s", "5s", "2d", "Tc"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["As", "Ks"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A nut draw with overcards has equity AND fold equity \u2014 barrel as a semi-bluff rather than checking.", zh: "坚果听牌带高张兼具胜率与弃牌率 \u2014 应作为半诈唬开火而非过牌。" } },
    },
    {
      s: { en: "Turn bricks on a low connected board that favors the caller, and you have only ace-high. Best action?", zh: "转牌在利于跟注者的低连接面上落空，你仅有 A 高。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 air", zh: "A\u2663K\u2663 空气" },
      board: ["7h", "6h", "5c", "2d"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kc"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "This board smashes the caller; barreling ace-high has no fold equity and no equity when called \u2014 check/give up.", zh: "该面正中跟注者；用 A 高开火既无弃牌率、被跟时又无胜率 \u2014 应过牌放弃。" } },
    },
    {
      s: { en: "Turn brings a second overcard (K) that favors your range; you hold a gutshot with backdoors. Best action?", zh: "转牌来了第二张高张（K）利于你的范围，你持卡顺带后门。最佳行动？" },
      lbl: { en: "Q\u2663J\u2663 gutshot + BD", zh: "Q\u2663J\u2663 卡顺+后门" },
      board: ["Ah", "8c", "3d", "Kd"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Qc", "Jc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A second barrel on a card that favors you, with a gutshot and backdoors for equity, is a profitable double-barrel \u2014 don't check.", zh: "在利于你的牌上、带卡顺与后门胜率开第二枪是有利的双开火 \u2014 别过牌。" } },
    },
    {
      s: { en: "Turn. The K is an overcard that favors your range and you hold the nut flush draw. Best action?", zh: "转牌。K 是利于你范围的高张，且你持坚果同花听。最佳行动？" },
      lbl: { en: "A\u2660T\u2660 nut FD", zh: "A\u2660T\u2660 坚果花听" },
      board: ["9s", "6s", "2d", "Kd"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["As", "Ts"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A scare card that favors you plus the nut flush draw is an ideal second barrel \u2014 don't check.", zh: "利于你的吓人牌加坚果同花听是理想的第二枪 \u2014 别过牌。" } },
    },
    {
      s: { en: "Turn brings a third diamond completing a flush; you hold an overpair with no diamond. Best action?", zh: "转牌来第三张方块完成同花；你持超对但无方块。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair, no FD", zh: "A\u2665A\u2663 超对、无花听" },
      board: ["Qd", "8d", "3c", "5d"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ac"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "With the flush in and no diamond, barreling gets called by flushes and folds out worse \u2014 check and control.", zh: "同花已成且你无方块，开火被同花跟、只赶走更差 \u2014 应过牌控池。" } },
    },
    {
      s: { en: "Turn A pairs you up to top two pair. Best action?", zh: "转牌 A 让你成顶两对。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 top two", zh: "A\u2663K\u2663 顶两对" },
      board: ["Kd", "8s", "3c", "Ad"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "You turned top two pair on a card that also favors your range \u2014 bet for value, don't check.", zh: "你在同样利于你范围的牌上成顶两对 \u2014 应价值下注，别过牌。" } },
    },
    {
      s: { en: "Turn gives you a flush draw + Broadway gutshot (combo) on a board that favors you. Best action?", zh: "转牌给你花听+broadway 卡顺（组合），且牌面利于你。最佳行动？" },
      lbl: { en: "K\u2666T\u2666 FD+gutshot", zh: "K\u2666T\u2666 花听+卡顺" },
      board: ["Qh", "7d", "2c", "Jd"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Kd", "Td"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A turned combo draw (flush + gutshot) is a premium barrel with equity and fold equity \u2014 bet.", zh: "转牌成组合听牌（花+卡顺）是兼具胜率与弃牌率的优质开火 \u2014 应下注。" } },
    },
    {
      s: { en: "Turn bricks on a low connected board that favors the caller; you hold only ace-high. Best action?", zh: "转牌在利于跟注者的低连接面落空；你仅有 A 高。最佳行动？" },
      lbl: { en: "A\u2666K\u2666 air", zh: "A\u2666K\u2666 空气" },
      board: ["7h", "6c", "5d", "2s"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ad", "Kd"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "This board favors the caller and your ace-high has no equity when called \u2014 give up and check.", zh: "该面利于跟注者，你的 A 高被跟时无胜率 \u2014 应放弃过牌。" } },
    },
    {
      s: { en: "Turn pairs the board, giving you trips with a good kicker. Best action?", zh: "转牌配对牌面，让你成三条带好踢脚。最佳行动？" },
      lbl: { en: "9\u2660T\u2663 trips", zh: "9\u2660T\u2663 三条" },
      board: ["9c", "6d", "3s", "9h"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["9s", "Tc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Trips is a clear value bet across two streets \u2014 checking misses value.", zh: "三条是横跨两条街的明确价值下注 \u2014 过牌损失价值。" } },
    },
    {
      s: { en: "Turn is a safe blank; you hold an overpair on a dry board. Best action?", zh: "转牌是安全的空白；你在干燥面持超对。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair", zh: "A\u2665A\u2663 超对" },
      board: ["8d", "5c", "2h", "3s"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ac"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "An overpair on a dry, safe turn keeps value betting \u2014 checking is too passive.", zh: "干燥安全转牌的超对应继续价值下注 \u2014 过牌太被动。" } },
    },
    {
      s: { en: "Turn brings a third spade completing a flush; you hold ace-high with no spade. Best action?", zh: "转牌来第三张黑桃完成同花；你持 A 高但无黑桃。最佳行动？" },
      lbl: { en: "A\u2665Q\u2666 air", zh: "A\u2665Q\u2666 空气" },
      board: ["Ks", "8s", "4d", "2s"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Qd"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "The flush completed and you hold no spade or showdown value \u2014 barreling just burns chips. Check.", zh: "同花已成、你无黑桃也无摊牌价值 \u2014 开火只会浪费筹码。应过牌。" } },
    },
    {
      s: { en: "Turn A gives you top pair. Best action?", zh: "转牌 A 让你成顶对。最佳行动？" },
      lbl: { en: "A\u2663T\u2663 top pair", zh: "A\u2663T\u2663 顶对" },
      board: ["9h", "5d", "2c", "Ad"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Tc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "You turned top pair on a card that favors your range \u2014 bet for value and protection.", zh: "你在利于你范围的牌上成顶对 \u2014 应价值下注并保护。" } },
    },
    {
      s: { en: "Turn A is a scare card; you hold only a pair of tens with no draw. Best action?", zh: "转牌 A 是吓人牌；你仅有一对 T、无听牌。最佳行动？" },
      lbl: { en: "T\u2665 9\u2665 pair of tens", zh: "T\u2665 9\u2665 一对 T" },
      board: ["Kd", "Tc", "5s", "As"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Th", "9h"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "The A is bad for a weak pair; barreling turns showdown value into a bluff \u2014 check.", zh: "A 对弱对子不利；开火把摊牌价值变成诈唬 \u2014 应过牌。" } },
    },
    {
      s: { en: "Turn completes your nut flush. Best action?", zh: "转牌完成你的坚果同花。最佳行动？" },
      lbl: { en: "A\u2665K\u2665 nut flush", zh: "A\u2665K\u2665 坚果同花" },
      board: ["9h", "7h", "4c", "2h"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Kh"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "You made the nut flush \u2014 bet for value across turn and river, don't slow down.", zh: "你做成坚果同花 \u2014 应在转河价值下注，别放慢。" } },
    },
    {
      s: { en: "Turn bricks; you missed and hold only queen-high air on an A-K board. Best action?", zh: "转牌落空；你在 A-K 面只剩 Q 高空气。最佳行动？" },
      lbl: { en: "Q\u2665J\u2665 air", zh: "Q\u2665J\u2665 空气" },
      board: ["As", "Kd", "7c", "4s"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Qh", "Jh"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "No equity and no fold equity vs a range that called the A-K flop \u2014 give up and check.", zh: "面对跟过 A-K 翻牌的范围，你既无胜率也无弃牌率 \u2014 应放弃过牌。" } },
    },
    {
      s: { en: "Turn K is an overcard that favors your range; you hold an open-ended straight draw. Best action?", zh: "转牌 K 是利于你范围的高张；你持两头顺听。最佳行动？" },
      lbl: { en: "J\u2663T\u2663 OESD", zh: "J\u2663T\u2663 两头顺听" },
      board: ["9d", "8s", "3c", "Kh"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Jc", "Tc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "An open-ender on a scare card that favors your range is a strong semi-bluff barrel.", zh: "在利于你范围的吓人牌上的两头顺听是强力半诈唬开火。" } },
    },
    {
      s: { en: "Turn brings a third spade and an overcard; you hold an overpair with no spade. Best action?", zh: "转牌来第三张黑桃且是高张；你持超对但无黑桃。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair, no FD", zh: "A\u2665A\u2663 超对、无花听" },
      board: ["Js", "8s", "3d", "Qs"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ac"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "A third spade plus an overcard hit the caller; your overpair should check and control the pot.", zh: "第三张黑桃加一张高张正中跟注者；你的超对应过牌控池。" } },
    },
    {
      s: { en: "Turn gives you a set. Best action?", zh: "转牌让你成三条。最佳行动？" },
      lbl: { en: "5\u26635\u2660 set", zh: "5\u26635\u2660 三条" },
      board: ["Kd", "9s", "2c", "5h"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["5c", "5s"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "You turned a set \u2014 bet for value and protection; checking lets draws and overcards see a free river.", zh: "你转牌成三条 \u2014 应价值下注并保护；过牌让听牌与高张免费看河。" } },
    },
    {
      s: { en: "Turn pairs a low card and doesn't help you; you hold queen-high air on an ace-high board. Best action?", zh: "转牌配对一张低牌、对你无帮助；你在 A 高面持 Q 高空气。最佳行动？" },
      lbl: { en: "K\u2665Q\u2665 air", zh: "K\u2665Q\u2665 空气" },
      board: ["Ah", "4d", "4s", "9c"], pot: 12, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Qh"], street: "turn",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "You have no equity and the ace-high board favors villain's calls \u2014 give up and check.", zh: "你无胜率且 A 高面利于对手跟注 \u2014 应放弃过牌。" } },
    },
  ]),

  c10: buildSpots("c10", "concept.river", [
    {
      s: { en: "River. You hold top two pair on a non-scary runout. Villain checks to you. Best action?", zh: "河牌。你在不吓人的发牌上持顶两对，对手向你过牌。最佳行动？" },
      lbl: { en: "A\u2663K\u2663 top two", zh: "A\u2663K\u2663 顶两对" },
      board: ["As", "Kd", "9c", "4h", "2s"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Ac", "Kc"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Top two pair wants value \u2014 bet to get called by worse aces, kings and draws. Checking leaves money on the table.", zh: "顶两对要价值 \u2014 应下注让更差的 A、K 与听牌跟注。过牌白白漏掉价值。" } },
    },
    {
      s: { en: "River. Your draw missed; you have jack-high with no showdown value, but your line can credibly bluff. Best action?", zh: "河牌。听牌落空，你只有 J 高、无摊牌价值，但行动线仍可可信诈唬。最佳行动？" },
      lbl: { en: "J\u2666T\u2666 missed (no SD)", zh: "J\u2666T\u2666 落空（无摊牌）" },
      board: ["Ks", "Qd", "7h", "3c", "2s"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Jd", "Td"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "With zero showdown value, checking just gives up \u2014 turn a missed draw into a bluff when the story is credible.", zh: "毫无摊牌价值时过牌等于放弃 \u2014 故事可信时应把落空听牌变成诈唬。" } },
    },
    {
      s: { en: "River. You hold middle pair \u2014 some showdown value, but worse hands won't call. Best action?", zh: "河牌。你持中对 \u2014 有些摊牌价值，但更差的牌不会跟注。最佳行动？" },
      lbl: { en: "9\u26608\u2660 middle pair", zh: "9\u26608\u2660 中对" },
      board: ["Ah", "9d", "6c", "4s", "2h"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["9s", "8s"], street: "river",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "Betting middle pair only folds out worse and gets called by better \u2014 check to realize your showdown value.", zh: "用中对下注只赶走更差牌、被更好牌跟注 \u2014 应过牌实现摊牌价值。" } },
    },
    {
      s: { en: "River. Your missed draw — only queen-high. Villain is a calling station who never folds. Best action?", zh: "河牌。同花听牌破产，仅有 Q 高。对手是从不弃牌的跟注站。最佳行动？" },
      ctx: { en: "Exploitative read: villain calls rivers far too often.", zh: "剥削性读牌：对手河牌跟注过于频繁。" },
      lbl: { en: "Q\u2665J\u2665 missed draw", zh: "Q\u2665J\u2665 破产听牌" },
      board: ["8h", "5h", "2c", "Kd", "3s"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Qh", "Jh"], street: "river",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "Bluffing requires fold equity \u2014 against a station who never folds, a missed-draw bluff just lights money on fire. Check.", zh: "诈唬需要弃牌率 \u2014 面对从不弃牌的跟注站，落空诈唬只会浪费筹码。应过牌。" } },
    },
    {
      s: { en: "River. You hold a bluff-catcher facing a pot-sized bet from a polarized range. Best action?", zh: "河牌。你持抓诈牌面对极化范围的底池下注。最佳行动？" },
      lbl: { en: "A\u2666A\u2663 bluff-catcher", zh: "A\u2666A\u2663 抓诈牌" },
      board: ["2c", "7d", "9h", "Js", "4s"], pot: 20, bet: 20, pos: "BTN (IP)", hand: ["Ad", "Ac"], street: "river",
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Vs a polarized pot bet you must defend bluff-catchers at MDF \u2014 folding lets every bluff profit automatically.", zh: "面对极化底池下注需按 MDF 防守抓诈牌 \u2014 弃牌让每个诈唬自动盈利。" },
        raise: { en: "Raising turns a bluff-catcher into a bluff that only folds out worse and gets called by better.", zh: "加注把抓诈牌变成诈唬，只赶走更差牌、被更好牌跟注。" },
      },
    },
    {
      s: { en: "River. Your draw missed and villain fires a big bet into you. Best action?", zh: "河牌。你的听牌落空，对手向你打出大注。最佳行动？" },
      lbl: { en: "J\u2665T\u2665 missed", zh: "J\u2665T\u2665 落空" },
      board: ["Kd", "Qc", "8h", "5s", "2d"], pot: 20, bet: 16, pos: "BTN (IP)", hand: ["Jh", "Th"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "You have no pair and no showdown value vs a big river bet \u2014 there is nothing to bluff-catch with. Fold.", zh: "面对河牌大注你无对无摊牌价值 \u2014 没有可抓诈的牌。应弃牌。" },
        raise: { en: "Raising with air vs a value-heavy river bet is spew.", zh: "用空气对价值偏重的河牌下注加注是乱送。" },
      },
    },
    {
      s: { en: "River. You make the nut flush. Villain checks. Best action?", zh: "河牌。你成坚果同花，对手过牌。最佳行动？" },
      lbl: { en: "A\u26655\u2665 nut flush", zh: "A\u26655\u2665 坚果同花" },
      board: ["8h", "6h", "2c", "9h", "3d"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Ah", "5h"], street: "river",
      actions: ACT, correct: ["bet"], leak: "sizing",
      fb: { check: { en: "The nuts wants maximum value \u2014 bet (and size up). Checking back the nuts misses significant value.", zh: "坚果要最大价值 \u2014 应下注（且加大尺寸）。过牌坚果是巨大的损失价值。" } },
    },
    {
      s: { en: "River fills a four-card straight on board. You hold an overpair facing a big bet. Best action?", zh: "河牌让牌面凑成四张顺子。你持超对面对大注。最佳行动？" },
      lbl: { en: "K\u2666K\u2663 overpair", zh: "K\u2666K\u2663 超对" },
      board: ["Js", "9d", "4c", "8h", "Tc"], pot: 20, bet: 18, pos: "BTN (IP)", hand: ["Kd", "Kc"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "On a four-straight board your overpair beats only bluffs, and a big bet is rarely a bluff here \u2014 fold.", zh: "四张顺子面上你的超对只赢诈唬，而大注少为诈唬 \u2014 应弃牌。" },
        raise: { en: "Raising a one-pair hand into a completed straight is throwing chips away.", zh: "用单对加注对已成顺子是白扔筹码。" },
      },
    },
    {
      s: { en: "River. You rivered a straight. Villain checks to you. Best action?", zh: "河牌。你河牌成顺。对手向你过牌。最佳行动？" },
      lbl: { en: "J\u2665T\u2665 straight", zh: "J\u2665T\u2665 顺子" },
      board: ["9c", "8d", "5s", "2h", "7h"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Jh", "Th"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "You have a straight \u2014 value bet when checked to; checking forfeits a clear river street.", zh: "你成顺 \u2014 对手过牌时应价值下注；过牌放弃明确的河牌价值。" } },
    },
    {
      s: { en: "River. You hold top pair on a dry runout. Villain checks. Best action?", zh: "河牌。在干燥发牌上你持顶对，对手过牌。最佳行动？" },
      lbl: { en: "K\u2665Q\u2663 top pair", zh: "K\u2665Q\u2663 顶对" },
      board: ["Kd", "9s", "6c", "3h", "2d"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Qc"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Top pair bets thin value on a blank river \u2014 worse Kx and pairs call. Don't check it back.", zh: "顶对在空白河牌薄价值下注 \u2014 更差的 Kx 与对子会跟。别过牌让牌。" } },
    },
    {
      s: { en: "River. Dry runout. You hold top pair facing a pot-sized bet from a polarized range. Best action?", zh: "河牌。干燥发牌。你持顶对面对极化范围的底池下注。最佳行动？" },
      lbl: { en: "Q\u2665J\u2663 top pair", zh: "Q\u2665J\u2663 顶对" },
      board: ["Qd", "9h", "5c", "4s", "2d"], pot: 20, bet: 20, pos: "BTN (IP)", hand: ["Qh", "Jc"], street: "river",
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Top pair vs a polarized range is a bluff-catcher \u2014 folding lets every busted draw win. Call.", zh: "顶对面对极化范围是抓诈牌 \u2014 弃牌让每个落空听牌得手。应跟注。" },
        raise: { en: "Raising turns a bluff-catcher into a bluff that only folds out worse.", zh: "加注把抓诈牌变成只赶走更差牌的诈唬。" },
      },
    },
    {
      s: { en: "River. Your draw missed (no showdown value) on an A-K board. Villain checks. Best action?", zh: "河牌。你的听牌落空（无摊牌价值），牌面 A-K。对手过牌。最佳行动？" },
      lbl: { en: "Q\u2666J\u2666 missed (no SD)", zh: "Q\u2666J\u2666 落空（无摊牌）" },
      board: ["As", "Kd", "9h", "7c", "2s"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Qd", "Jd"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "With zero showdown value, bet as a bluff \u2014 your line credibly reps an ace. Checking just surrenders.", zh: "毫无摊牌价值时应诈唬下注 \u2014 你的线可信地代表 A。过牌等于投降。" } },
    },
    {
      s: { en: "River puts a fourth card to a straight on board (8-9-T-J). You hold an overpair facing a big bet. Best action?", zh: "河牌使牌面出现四张顺子（8-9-T-J）。你持超对面对大注。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair", zh: "A\u2665A\u2663 超对" },
      board: ["Jh", "Td", "9s", "8c", "2h"], pot: 20, bet: 18, pos: "BTN (IP)", hand: ["Ah", "Ac"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Four to a straight is on board and a big bet is rarely a bluff \u2014 your overpair beats only bluffs. Fold.", zh: "牌面四张顺子且大注少为诈唬 \u2014 你的超对只赢诈唬。应弃。" },
        raise: { en: "Raising one pair into a board straight is spew.", zh: "用单对对牌面顺子加注是乱送。" },
      },
    },
    {
      s: { en: "River. You hold top two pair. Villain checks to you. Best action?", zh: "河牌。你持顶两对，对手向你过牌。最佳行动？" },
      lbl: { en: "A\u2665T\u2665 top two", zh: "A\u2665T\u2665 顶两对" },
      board: ["Ad", "Ts", "8c", "5h", "2d"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Th"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Top two pair wants value \u2014 bet to get called by worse aces and tens. Checking leaves value behind.", zh: "顶两对要价值 \u2014 应下注让更差的 A 与 T 跟。过牌漏掉价值。" } },
    },
    {
      s: { en: "River. Dry runout. You hold top pair facing a pot bet from a polarized range. Best action?", zh: "河牌。干燥发牌。你持顶对面对极化范围的底池下注。最佳行动？" },
      lbl: { en: "K\u2663J\u2666 top pair", zh: "K\u2663J\u2666 顶对" },
      board: ["Kh", "8d", "6c", "3s", "2h"], pot: 20, bet: 20, pos: "BTN (IP)", hand: ["Kc", "Jd"], street: "river",
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "On a dry runout top pair is a clear bluff-catcher vs a polarized bet \u2014 don't over-fold.", zh: "干燥发牌上顶对面对极化下注是明确抓诈牌 \u2014 别过度弃牌。" },
        raise: { en: "Raising a bluff-catcher only folds out worse and gets called by better.", zh: "用抓诈牌加注只赶走更差、被更好牌跟。" },
      },
    },
    {
      s: { en: "River. You're a calling station's worst nightmare \u2014 wait, villain is the station, and you hold only ace-high. Villain checks. Best action?", zh: "河牌。对手是跟注站，而你仅有 A 高。对手过牌。最佳行动？" },
      lbl: { en: "A\u2665T\u2665 ace-high", zh: "A\u2665T\u2665 A 高" },
      board: ["Qs", "Jd", "7c", "4h", "2s"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Th"], street: "river",
      actions: ACT, correct: ["check"], leak: "too_loose",
      fb: { bet: { en: "Vs a station who never folds, bluffing ace-high just loses \u2014 check and try to win at showdown.", zh: "面对从不弃牌的跟注站，用 A 高诈唬只会亏 \u2014 应过牌争取摊牌取胜。" } },
    },
    {
      s: { en: "River. You hold a full house. Villain checks to you. Best action?", zh: "河牌。你持葫芦，对手向你过牌。最佳行动？" },
      lbl: { en: "K\u2663Q\u2660 kings full", zh: "K\u2663Q\u2660 K 葫芦" },
      board: ["Kd", "Ks", "7c", "7d", "2h"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Kc", "Qs"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A full house is a max-value hand \u2014 bet for value; checking back is a huge missed street.", zh: "葫芦是最大价值牌 \u2014 应价值下注；过牌让牌损失一大条街。" } },
    },
    {
      s: { en: "River. Your draw missed (no showdown value) on an A-Q board. Villain checks. Best action?", zh: "河牌。你的听牌落空（无摊牌价值），牌面 A-Q。对手过牌。最佳行动？" },
      lbl: { en: "K\u2665J\u2665 missed (no SD)", zh: "K\u2665J\u2665 落空（无摊牌）" },
      board: ["Ac", "Qd", "8s", "5h", "3c"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Kh", "Jh"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "King-high can't win at showdown \u2014 a credible bluff repping an ace beats giving up. Bet.", zh: "K 高无法摊牌取胜 \u2014 代表 A 的可信诈唬优于放弃。应下注。" } },
    },
    {
      s: { en: "River. Three hearts and a connected board. You hold an overpair (no heart) facing a big bet. Best action?", zh: "河牌。三张红心且连接的牌面。你持超对（无红心）面对大注。最佳行动？" },
      lbl: { en: "A\u2660A\u2666 overpair", zh: "A\u2660A\u2666 超对" },
      board: ["Th", "9h", "8h", "4c", "2d"], pot: 20, bet: 18, pos: "BTN (IP)", hand: ["As", "Ad"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "With three hearts and a connected board, a big bet beats your overpair too often (flushes, straights) \u2014 fold.", zh: "三张红心加连接牌面，大注常胜过你的超对（同花、顺子）\u2014 应弃。" },
        raise: { en: "Raising one pair on this board only gets value from hands that crush you.", zh: "在此牌面用单对加注只会被压制你的牌跟。" },
      },
    },
    {
      s: { en: "River. You hold a set. Villain checks to you. Best action?", zh: "河牌。你持三条，对手向你过牌。最佳行动？" },
      lbl: { en: "9\u26639\u2660 set", zh: "9\u26639\u2660 三条" },
      board: ["9h", "5d", "2c", "Ks", "3h"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["9c", "9s"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A set is a clear value bet on the river \u2014 worse pairs and Kx pay you off. Don't check.", zh: "三条是河牌明确的价值下注 \u2014 更差对子与 Kx 会赔。别过牌。" } },
    },
    {
      s: { en: "River. Dry runout. You hold top pair facing a pot bet from a polarized range. Best action?", zh: "河牌。干燥发牌。你持顶对面对极化范围的底池下注。最佳行动？" },
      lbl: { en: "J\u2663Q\u2665 top pair", zh: "J\u2663Q\u2665 顶对" },
      board: ["Js", "8d", "5c", "3h", "2s"], pot: 20, bet: 20, pos: "BTN (IP)", hand: ["Jc", "Qh"], street: "river",
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "On a dry board top pair beats all of villain's bluffs \u2014 over-folding bluff-catchers is a leak. Call.", zh: "干燥面顶对赢对手所有诈唬 \u2014 过度弃抓诈牌是漏洞。应跟注。" },
        raise: { en: "Raising a bluff-catcher folds out worse and isolates you against value.", zh: "用抓诈牌加注赶走更差、只剩被价值牌针对。" },
      },
    },
    {
      s: { en: "River. Your gutshot missed (no showdown value). Villain checks. Best action?", zh: "河牌。卡顺听落空（无摊牌价值）。对手过牌。最佳行动？" },
      lbl: { en: "J\u2665T\u2665 missed gutshot", zh: "J\u2665T\u2665 落空卡顺" },
      board: ["Kd", "3s", "9c", "6h", "2d"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Jh", "Th"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Your missed straight draw has no showdown value \u2014 betting reps the straight and is better than checking.", zh: "你落空的顺听无摊牌价值 \u2014 下注代表顺子，优于过牌。" } },
    },
    {
      s: { en: "River blanks out. You hold an overpair. Villain checks to you. Best action?", zh: "河牌落空白。你持超对，对手向你过牌。最佳行动？" },
      lbl: { en: "A\u2665A\u2663 overpair", zh: "A\u2665A\u2663 超对" },
      board: ["9d", "6c", "3s", "7h", "2d"], pot: 20, bet: 0, pos: "BTN (IP)", hand: ["Ah", "Ac"], street: "river",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Your overpair beats most of villain's range \u2014 bet for value when checked to. Checking forfeits value.", zh: "你的超对赢对手多数范围 \u2014 对手过牌时应价值下注。过牌放弃价值。" } },
    },
    {
      s: { en: "River brings a third diamond, completing the flush on board. You hold top pair (no diamond) facing a big bet. Best action?", zh: "河牌来第三张方块，牌面成同花。你持顶对（无方块）面对大注。最佳行动？" },
      lbl: { en: "A\u2660Q\u2663 top pair", zh: "A\u2660Q\u2663 顶对" },
      board: ["Ad", "Kd", "9h", "5c", "2d"], pot: 20, bet: 18, pos: "BTN (IP)", hand: ["As", "Qc"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "The flush completed and a big bet rarely bluffs here \u2014 your one pair loses too often. Fold.", zh: "同花已成且大注在此少为诈唬 \u2014 你的单对落后过多。应弃。" },
        raise: { en: "Raising one pair into a likely flush is throwing chips away.", zh: "用单对对很可能的同花加注是白扔筹码。" },
      },
    },
  ]),

  c11: buildSpots("c11", "concept.cr", [
    {
      s: { en: "BB vs BTN. Wet 9-8-2 two-tone, you flopped bottom set, villain c-bets. Best action?", zh: "BB 对 BTN。湿润 9-8-2 双花，你成底三条，对手持续下注。最佳行动？" },
      lbl: { en: "2\u26602\u2666 bottom set", zh: "2\u26602\u2666 底三条" },
      board: ["9h", "8h", "2c"], pot: 6, bet: 3, pos: "BB (OOP)", hand: ["2s", "2d"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "Never fold a set on a wet board.", zh: "湿润面绝不弃三条。" },
        call: { en: "On this draw-heavy board, check-raise for value and protection \u2014 flatting lets draws realize equity cheaply.", zh: "在听牌密集的面上应过牌加注价值并保护 \u2014 只跟注让听牌便宜实现胜率。" },
      },
    },
    {
      s: { en: "BB vs BTN. 7-6-2 two-tone, you hold a flush draw + open-ender, villain c-bets. Best action?", zh: "BB 对 BTN。7-6-2 双花，你持花听+两头顺听，对手持续下注。最佳行动？" },
      lbl: { en: "9\u26658\u2665 FD + OESD", zh: "9\u26658\u2665 花听+两头顺听" },
      board: ["7h", "6h", "2c"], pot: 6, bet: 3, pos: "BB (OOP)", hand: ["9h", "8h"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "Folding a huge combo draw with overcards and fold equity wastes a great check-raise semi-bluff.", zh: "弃掉带高张与弃牌率的超强组合听牌，浪费了极好的过牌加注半诈唬。" },
        call: { en: "Calling is OK, but this monster draw prefers a check-raise to build the pot and add fold equity.", zh: "跟注可以，但这种超强听牌更适合过牌加注以建池并增加弃牌率。" },
      },
    },
    {
      s: { en: "BB vs BTN. Dry K-8-3, you hold top pair, villain c-bets small. Best action?", zh: "BB 对 BTN。干燥 K-8-3，你持顶对，对手小持续下注。最佳行动？" },
      lbl: { en: "K\u2665T\u2663 top pair", zh: "K\u2665T\u2663 顶对" },
      board: ["Kd", "8s", "3c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Kh", "Tc"],
      actions: FACE, correct: ["call"], leak: "too_loose",
      fb: {
        raise: { en: "Check-raising top pair on a dry board bloats the pot, folds out worse and gets called by better \u2014 just call.", zh: "干燥面用顶对过牌加注会放大底池、赶走更差牌、被更好牌跟注 \u2014 应平跟。" },
        fold: { en: "Top pair is far too strong to fold vs a small c-bet.", zh: "顶对面对小持续下注，远不够弃牌。" },
      },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. The turn pairs your king; villain (capped) almost never has an ace. Best action?", zh: "BB 对 BTN。对手翻牌过牌让牌。转牌配对你的 K；对手（范围封顶）几乎不会有 A。最佳行动？" },
      ctx: { en: "Checking back A-8-3 caps villain's range \u2014 they rarely hold an ace, so your kings are often best.", zh: "在 A-8-3 让牌封顶了对手范围 \u2014 他们很少有 A，所以你的一对 K 常常领先。" },
      lbl: { en: "K\u2665J\u2663 pair of kings", zh: "K\u2665J\u2663 一对 K" },
      board: ["As", "8d", "3c", "Kd"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["Kh", "Jc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Villain capped their range by checking back and rarely has an ace \u2014 lead (probe) the turn for value with your pair of kings.", zh: "对手让牌封顶了范围且很少有 A \u2014 应用你的一对 K 在转牌领打（试探）取价值。" } },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. Turn A is a scare card; you have air. Best action?", zh: "BB 对 BTN。对手翻牌让牌。转牌 A 是吓人牌，你是空气。最佳行动？" },
      ctx: { en: "Villain showed weakness checking back; the A favors your perceived range.", zh: "对手让牌示弱；A 利于你的可见范围。" },
      lbl: { en: "J\u2666T\u2663 air", zh: "J\u2666T\u2663 空气" },
      board: ["Qs", "7d", "2c", "Ah"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["Jd", "Tc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "A probe bluff on a scare card after villain showed weakness is high-EV \u2014 checking surrenders the pot they gave up on.", zh: "对手示弱后在吓人牌上试探诈唬是高 EV \u2014 过牌放弃了对手已让出的底池。" } },
    },
    {
      s: { en: "BB vs BTN. A-K-6 rainbow, villain bets big, you hold air. Should you check-raise as a bluff? Best action?", zh: "BB 对 BTN。A-K-6 彩虹，对手大注，你持空气。该过牌加注诈唬吗？最佳行动？" },
      lbl: { en: "5\u26654\u2665 air", zh: "5\u26654\u2665 空气" },
      board: ["Ah", "Kd", "6c"], pot: 6, bet: 5, pos: "BB (OOP)", hand: ["5h", "4h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        raise: { en: "Don't check-raise bluff every board \u2014 A-K-high smashes villain's betting range, so a bluff-raise has no fold equity. Fold.", zh: "别在每个面都过牌加注诈唬 \u2014 A-K 高正中对手下注范围，诈唬加注无弃牌率。应弃牌。" },
        call: { en: "With no pair and no draw vs a big bet, calling just bleeds chips.", zh: "面对大注无对无听，跟注只会流血。" },
      },
    },
    {
      s: { en: "BB vs BTN. Wet 8-7-6, you flopped a straight, villain c-bets. Best action?", zh: "BB 对 BTN。湿润 8-7-6，你成顺子，对手持续下注。最佳行动？" },
      lbl: { en: "9\u26605\u2660 straight", zh: "9\u26605\u2660 顺子" },
      board: ["8h", "7h", "6c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["9s", "5s"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "You flopped the straight \u2014 folding is unthinkable.", zh: "你翻牌成顺 \u2014 弃牌不可思议。" },
        call: { en: "On this soaking-wet board, check-raise for value and protection before flush/higher-straight cards arrive.", zh: "在极湿的面上应过牌加注价值并保护，抢在同花/更大顺子牌到来前。" },
      },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. Turn pairs your nine, giving you trips. Best action?", zh: "BB 对 BTN。对手翻牌让牌。转牌配对你的 9，给你三条。最佳行动？" },
      ctx: { en: "Villain's range is capped after checking back \u2014 lead for thin value.", zh: "对手让牌后范围封顶 \u2014 应领打取薄价值。" },
      lbl: { en: "9\u26638\u2663 turned trips", zh: "9\u26638\u2663 转牌成三条" },
      board: ["Kd", "9s", "4c", "9h"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["9c", "8c"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Trips against a capped range is a clear probe for value \u2014 don't check and let villain check back again.", zh: "面对封顶范围的三条是明显的价值试探 \u2014 别过牌让对手再次让牌。" } },
    },
    {
      s: { en: "BB vs BTN. 9-8-3 two spades, villain c-bets. You hold a flush draw + open-ender. Best action?", zh: "BB 对 BTN。9-8-3 两张黑桃，对手持续下注。你持花听+两头顺听。最佳行动？" },
      lbl: { en: "7\u26606\u2660 FD+OESD", zh: "7\u26606\u2660 花听+顺听" },
      board: ["9s", "8s", "3d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["7s", "6s"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A big combo draw is a textbook check-raise semi-bluff \u2014 never fold.", zh: "巨大组合听牌是教科书式的过牌加注半诈唬 \u2014 绝不弃。" } },
    },
    {
      s: { en: "BB vs BTN. T-9-4 two hearts, villain c-bets. You flopped bottom set. Best action?", zh: "BB 对 BTN。T-9-4 两张红心，对手持续下注。你翻牌成最小三条。最佳行动？" },
      lbl: { en: "4\u26664\u2660 bottom set", zh: "4\u26664\u2660 底三条" },
      board: ["Th", "9c", "4h"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["4d", "4s"],
      actions: FACE, correct: ["raise"], leak: "too_tight",
      fb: {
        call: { en: "Check-raise your set on a wet board for value and protection \u2014 don't let draws see cheap cards.", zh: "湿润面用三条过牌加注取价值并保护 \u2014 别让听牌便宜看牌。" },
        fold: { en: "Never fold a set.", zh: "绝不弃三条。" },
      },
    },
    {
      s: { en: "BB vs BTN. A-8-3 rainbow, villain c-bets 1/3. You hold top pair (aces). Best action?", zh: "BB 对 BTN。A-8-3 彩虹，对手 1/3 池持续下注。你持顶对（一对 A）。最佳行动？" },
      lbl: { en: "A\u2665T\u2663 top pair", zh: "A\u2665T\u2663 顶对" },
      board: ["Ad", "8s", "3c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Ah", "Tc"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        raise: { en: "Don't check-raise top pair vs a small c-bet \u2014 flat to keep villain's bluffs and worse aces in.", zh: "别对小持续下注用顶对过牌加注 \u2014 应平跟，保留对手诈唬与更差的 A。" },
        fold: { en: "Top pair is far too strong to fold.", zh: "顶对远不够弃牌。" },
      },
    },
    {
      s: { en: "BB vs BTN. A-K-Q rainbow, villain c-bets. You hold 6-high air. Best action?", zh: "BB 对 BTN。A-K-Q 彩虹，对手持续下注。你持 6 高空气。最佳行动？" },
      lbl: { en: "6\u26655\u2665 air", zh: "6\u26655\u2665 空气" },
      board: ["As", "Kd", "Qc"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["6h", "5h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        raise: { en: "This broadway board favors the raiser \u2014 check-raise bluffing air with no equity is spew.", zh: "该高张面利于加注者 \u2014 用无胜率空气过牌加注诈唬是乱送。" },
        call: { en: "6-high has nothing to continue with here.", zh: "6 高在此无可继续之处。" },
      },
    },
    {
      s: { en: "BB vs BTN. J-9-5 two-tone, villain c-bets. You flopped two pair (J9). Best action?", zh: "BB 对 BTN。J-9-5 双花，对手持续下注。你翻牌成两对（J9）。最佳行动？" },
      lbl: { en: "J\u26659\u2665 two pair", zh: "J\u26659\u2665 两对" },
      board: ["Js", "9s", "5c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Jh", "9h"],
      actions: FACE, correct: ["raise", "call"], leak: "too_tight",
      fb: { fold: { en: "Two pair is far too strong to fold \u2014 check-raise for value/protection on a wet board.", zh: "两对远不够弃牌 \u2014 湿润面应过牌加注取价值并保护。" } },
    },
    {
      s: { en: "BB vs BTN. K-Q-4 rainbow, villain c-bets 1/3. You hold top pair (KJ). Best action?", zh: "BB 对 BTN。K-Q-4 彩虹，对手 1/3 池持续下注。你持顶对（KJ）。最佳行动？" },
      lbl: { en: "K\u2665J\u2663 top pair", zh: "K\u2665J\u2663 顶对" },
      board: ["Kd", "Qs", "4c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Kh", "Jc"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        raise: { en: "Check-raising top pair vs a small bet bloats the pot OOP \u2014 just call.", zh: "用顶对对小注过牌加注会在无位置做大底池 \u2014 应平跟。" },
        fold: { en: "Top pair is far too strong to fold.", zh: "顶对远不够弃牌。" },
      },
    },
    {
      s: { en: "BB vs BTN. Q-8-3 two hearts, villain c-bets. You hold the nut flush draw with two overcards. Best action?", zh: "BB 对 BTN。Q-8-3 两张红心，对手持续下注。你持坚果同花听+两高张。最佳行动？" },
      lbl: { en: "A\u2665K\u2665 nut FD + overs", zh: "A\u2665K\u2665 坚果花听+高张" },
      board: ["Qh", "8h", "3d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Ah", "Kh"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "Nut flush draw plus two overcards is a premium check-raise semi-bluff \u2014 never fold.", zh: "坚果同花听加两高张是优质过牌加注半诈唬 \u2014 绝不弃。" } },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. Turn pairs your top pair holding. Best action?", zh: "BB 对 BTN。对手翻牌让牌。转牌给你顶对。最佳行动？" },
      ctx: { en: "Villain's flop check-back caps their range \u2014 they rarely have a strong hand.", zh: "对手翻牌让牌封顶了范围 \u2014 他们很少有强牌。" },
      lbl: { en: "Q\u2665J\u2663 top pair", zh: "Q\u2665J\u2663 顶对" },
      board: ["Qd", "7s", "2c", "5h"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["Qh", "Jc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Villain capped their range by checking back \u2014 lead (probe) your top pair for value.", zh: "对手让牌封顶了范围 \u2014 应用顶对领打（试探）取价值。" } },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. Turn A is a scare card; you hold air with a gutshot. Best action?", zh: "BB 对 BTN。对手翻牌让牌。转牌 A 是吓人牌；你持带卡顺的空气。最佳行动？" },
      ctx: { en: "Villain showed weakness; the A favors your perceived range.", zh: "对手示弱；A 利于你的可见范围。" },
      lbl: { en: "J\u2663T\u2663 gutshot", zh: "J\u2663T\u2663 卡顺" },
      board: ["Kd", "8s", "3c", "Ah"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["Jc", "Tc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "The A favors your range and villain is capped \u2014 probe as a bluff with your gutshot's extra equity.", zh: "A 利于你的范围且对手封顶 \u2014 用带卡顺额外胜率的牌试探诈唬。" } },
    },
    {
      s: { en: "BB vs BTN. A-K-9 two hearts, villain c-bets. You hold 5-4 air. Best action?", zh: "BB 对 BTN。A-K-9 两张红心，对手持续下注。你持 5-4 空气。最佳行动？" },
      lbl: { en: "5\u26604\u2660 air", zh: "5\u26604\u2660 空气" },
      board: ["Ah", "Kh", "9c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["5s", "4s"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        raise: { en: "A-K-high favors the raiser \u2014 check-raise bluffing with no equity just burns chips.", zh: "A-K 高利于加注者 \u2014 用无胜率牌过牌加注诈唬只会浪费筹码。" },
        call: { en: "5-high has no pair, no draw \u2014 nothing to continue with.", zh: "5 高无对无听 \u2014 没有继续的理由。" },
      },
    },
    {
      s: { en: "BB vs BTN. 9-6-3 rainbow, villain c-bets. You flopped top set. Best action?", zh: "BB 对 BTN。9-6-3 彩虹，对手持续下注。你翻牌成顶三条。最佳行动？" },
      lbl: { en: "9\u26609\u2663 top set", zh: "9\u26609\u2663 顶三条" },
      board: ["9h", "6c", "3d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["9s", "9c"],
      actions: FACE, correct: ["raise"], leak: "too_tight",
      fb: {
        call: { en: "Check-raise top set for value and to build the pot \u2014 flatting is too passive with a monster.", zh: "用顶三条过牌加注取价值并做大底池 \u2014 持怪兽牌平跟太被动。" },
        fold: { en: "Never fold a set.", zh: "绝不弃三条。" },
      },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. Turn K is an overcard; you hold a gutshot (needs a J). Best action?", zh: "BB 对 BTN。对手翻牌让牌。转牌 K 是高张；你持卡顺听（需 J 补牌）。最佳行动？" },
      ctx: { en: "Villain is capped and the K favors your range.", zh: "对手范围封顶且 K 利于你的范围。" },
      lbl: { en: "Q\u2666J\u2663 gutshot", zh: "Q\u2666J\u2663 卡顺听" },
      board: ["Tc", "7s", "2d", "Kh"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["Qd", "Jc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "The K favors your range and you have a gutshot \u2014 probe as a semi-bluff with equity.", zh: "K 利于你的范围且你持卡顺听 \u2014 应作为带胜率的半诈唬试探。" } },
    },
    {
      s: { en: "BB vs BTN. Q-9-2 rainbow, villain c-bets 1/3. You hold top pair (QT). Best action?", zh: "BB 对 BTN。Q-9-2 彩虹，对手 1/3 池持续下注。你持顶对（QT）。最佳行动？" },
      lbl: { en: "Q\u2665T\u2663 top pair", zh: "Q\u2665T\u2663 顶对" },
      board: ["Qd", "9s", "2c"], pot: 6, bet: 2, pos: "BB (OOP)", hand: ["Qh", "Tc"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        raise: { en: "Don't check-raise top pair vs a small c-bet \u2014 flat and keep villain's bluffs in.", zh: "别对小持续下注用顶对过牌加注 \u2014 应平跟，保留对手诈唬。" },
        fold: { en: "Top pair is far too strong to fold.", zh: "顶对远不够弃牌。" },
      },
    },
    {
      s: { en: "BB vs BTN. T-9-4 two spades, villain c-bets. You hold a flush draw + open-ender. Best action?", zh: "BB 对 BTN。T-9-4 两张黑桃，对手持续下注。你持花听+两头顺听。最佳行动？" },
      lbl: { en: "Q\u2660J\u2660 FD+OESD", zh: "Q\u2660J\u2660 花听+顺听" },
      board: ["Ts", "9s", "4d"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Qs", "Js"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A flush draw plus an open-ender is a clear check-raise semi-bluff \u2014 never fold.", zh: "花听加两头顺听是明确的过牌加注半诈唬 \u2014 绝不弃。" } },
    },
    {
      s: { en: "BB vs BTN. Villain checked back the flop. Turn gives you top pair. Best action?", zh: "BB 对 BTN。对手翻牌让牌。转牌给你顶对。最佳行动？" },
      ctx: { en: "Villain's check-back caps their range \u2014 your new top pair is often best.", zh: "对手让牌封顶了范围 \u2014 你新成的顶对常常领先。" },
      lbl: { en: "K\u2666Q\u2663 top pair", zh: "K\u2666Q\u2663 顶对" },
      board: ["7d", "5s", "2c", "Kh"], pot: 6, bet: 0, pos: "BB (OOP)", hand: ["Kd", "Qc"], street: "turn",
      actions: ACT, correct: ["bet"], leak: "street_plan",
      fb: { check: { en: "Villain capped their range by checking back \u2014 lead (probe) your turned top pair for value.", zh: "对手让牌封顶了范围 \u2014 应用转牌成的顶对领打（试探）取价值。" } },
    },
    {
      s: { en: "BB vs BTN. J-T-4 two hearts, villain c-bets. You hold a flush draw + open-ender. Best action?", zh: "BB 对 BTN。J-T-4 两张红心，对手持续下注。你持花听+两头顺听。最佳行动？" },
      lbl: { en: "Q\u26659\u2665 FD+OESD", zh: "Q\u26659\u2665 花听+顺听" },
      board: ["Jh", "Th", "4c"], pot: 6, bet: 4, pos: "BB (OOP)", hand: ["Qh", "9h"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A flush draw plus an open-ender is a clear check-raise semi-bluff \u2014 never fold.", zh: "花听加两头顺听是明确的过牌加注半诈唬 \u2014 绝不弃。" } },
    },
  ]),

  c12: buildSpots("c12", "concept.spr", [
    {
      s: { en: "Low SPR ~2 (3-bet pot). You flop top pair top kicker on A-7-2 and face a pot-sized bet. Best action?", zh: "低 SPR ~2（3-bet 底池）。你在 A-7-2 成顶对顶踢，面对底池下注。最佳行动？" },
      ctx: { en: "SPR 2: roughly a pot-sized bet leaves you pot-committed.", zh: "SPR 2：约一个底池下注后你已被底池套牢。" },
      lbl: { en: "A\u2665K\u2666 TPTK, SPR 2", zh: "A\u2665K\u2666 顶对顶踢，SPR 2" },
      board: ["As", "7d", "2c"], pot: 12, bet: 12, pos: "BTN (IP)", hand: ["Ah", "Kd"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "At SPR 2 TPTK is far too strong to fold \u2014 you're committed and crush villain's value range here.", zh: "SPR 2 时顶对顶踢远不够弃牌 \u2014 你已被套牢且压制对手价值范围。" },
        raise: { en: "Calling is cleaner than raising here, but the real error is folding a committed TPTK.", zh: "这里跟注比加注更干净，但真正的错误是弃掉已被套牢的顶对顶踢。" },
      },
    },
    {
      s: { en: "High SPR ~13 (single-raised, deep). You have just top pair facing a big turn bet on a wet board. Best action?", zh: "高 SPR ~13（单加注、深筹）。湿润面上你仅有顶对，面对转牌大注。最佳行动？" },
      ctx: { en: "Deep SPR: one pair rarely wants to play a huge pot.", zh: "深 SPR：单对很少想打巨大底池。" },
      lbl: { en: "A\u2665Q\u2663 top pair, SPR 13", zh: "A\u2665Q\u2663 顶对，SPR 13" },
      board: ["Qs", "Jd", "9h", "8c"], pot: 12, bet: 11, pos: "BTN (IP)", hand: ["Ah", "Qc"], street: "turn",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Deep-stacked on a connected board, one pair doesn't want to stack off \u2014 a big bet rep's straights and two pair. Fold.", zh: "深筹连接面上单对不想全下 \u2014 大注代表顺子与两对。应弃牌。" },
        raise: { en: "Raising one pair for stacks at high SPR turns your hand into a bluff vs a strong range.", zh: "高 SPR 用单对加注全下把你的牌变成对强范围的诈唬。" },
      },
    },
    {
      s: { en: "Low SPR ~1.5. You hold an overpair on 8-7-2 and villain bets. Best action?", zh: "低 SPR ~1.5。你在 8-7-2 持超对，对手下注。最佳行动？" },
      ctx: { en: "SPR 1.5: you're committed \u2014 plan to get it in.", zh: "SPR 1.5：你已被套牢 \u2014 计划全下。" },
      lbl: { en: "A\u2665A\u2666 overpair, SPR 1.5", zh: "A\u2665A\u2666 超对，SPR 1.5" },
      board: ["8h", "7h", "2c"], pot: 20, bet: 10, pos: "BTN (IP)", hand: ["Ah", "Ad"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "Folding an overpair at SPR 1.5 is far too weak \u2014 you're committed.", zh: "SPR 1.5 弃掉超对太弱 \u2014 你已被套牢。" },
        call: { en: "At this SPR just get it in \u2014 raise/jam to deny equity to the many draws rather than calling and facing tough turns.", zh: "这种 SPR 直接全下 \u2014 应加注/推注否定众多听牌的胜率，而非跟注面对难打的转牌。" },
      },
    },
    {
      s: { en: "High SPR ~10. You flop bottom set on a wet 9-8-4 board and villain bets. Best action?", zh: "高 SPR ~10。湿润 9-8-4 你成底三条，对手下注。最佳行动？" },
      ctx: { en: "Even deep, a set is strong enough to play a big pot.", zh: "即便深筹，三条也足够强去打大底池。" },
      lbl: { en: "4\u26654\u2660 bottom set, SPR 10", zh: "4\u26654\u2660 底三条，SPR 10" },
      board: ["9s", "8d", "4c"], pot: 12, bet: 8, pos: "BTN (IP)", hand: ["4h", "4s"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "A set is a premium hand \u2014 folding even at high SPR is a major leak.", zh: "三条是顶级牌 \u2014 即便高 SPR 弃牌也是明显漏洞。" },
        call: { en: "On a wet board, raise your set for value and protection \u2014 flatting lets draws and overcards see cheap cards.", zh: "湿润面用三条加注价值并保护 \u2014 只跟注让听牌与高张便宜看牌。" },
      },
    },
    {
      s: { en: "High SPR ~12, deep. Villain check-raised the flop, barreled the turn, and now bets big on the river. You hold top pair top kicker. Best action?", zh: "高 SPR ~12 且深筹。对手翻牌过牌加注、转牌继续开火、河牌再次大注。你持顶对顶踢。最佳行动？" },
      ctx: { en: "Three streets of aggression deep: one pair, even TPTK, is beaten too often to call a big river bet.", zh: "深筹连续三条街进攻：单对（即便顶对顶踢）落后过多，无法跟河牌大注。" },
      lbl: { en: "A\u2665K\u2663 TPTK, SPR 12", zh: "A\u2665K\u2663 顶对顶踢，SPR 12" },
      board: ["As", "Tc", "6h", "3d", "2s"], pot: 40, bet: 34, pos: "BTN (IP)", hand: ["Ah", "Kc"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Check-raise plus two more barrels deep reps a range full of two pair, sets and straights \u2014 your one pair is crushed. Fold.", zh: "深筹过牌加注外加两枪代表两对、三条、顺子满满的范围 \u2014 你的单对被压制。应弃牌。" },
        raise: { en: "Raising one pair into a line this strong only commits you against better hands.", zh: "用单对对如此强的下注线加注只会让你被更好牌套牢。" },
      },
    },
    {
      s: { en: "Low SPR ~3 (3-bet pot). You hold an overpair on K-Q-5 and villain jams. Best action?", zh: "低 SPR ~3（3-bet 底池）。你在 K-Q-5 持超对，对手全下。最佳行动？" },
      ctx: { en: "SPR 3 in a 3-bet pot: an overpair is at the top of your range.", zh: "3-bet 底池 SPR 3：超对位于你范围顶端。" },
      lbl: { en: "A\u2665A\u2666 overpair, SPR 3", zh: "A\u2665A\u2666 超对，SPR 3" },
      board: ["Kc", "Qd", "5h"], pot: 18, bet: 27, pos: "BTN (IP)", hand: ["Ah", "Ad"], allIn: true,
      actions: FACE_CALL, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "In a low-SPR 3-bet pot, aces are at the top of your range \u2014 folding to a jam over-folds badly.", zh: "低 SPR 的 3-bet 底池里，AA 在你范围顶端 \u2014 面对全下弃牌是严重过弃。" },
        raise: { en: "It's already all-in \u2014 calling is the action; there's nothing extra to raise.", zh: "已经全下 \u2014 跟注即可，没有可再加注的部分。" },
      },
    },
    {
      s: { en: "Low SPR ~2. You hold a flush draw + overcards and villain bets. Best action?", zh: "低 SPR ~2。你持花听+高张，对手下注。最佳行动？" },
      ctx: { en: "SPR 2 with a big draw: jamming uses fold equity + your equity.", zh: "SPR 2 持强听牌：推注同时利用弃牌率与你的胜率。" },
      lbl: { en: "Q\u2665J\u2665 FD + overs, SPR 2", zh: "Q\u2665J\u2665 花听+高张，SPR 2" },
      board: ["Th", "9h", "2c"], pot: 20, bet: 10, pos: "BTN (IP)", hand: ["Qh", "Jh"],
      actions: FACE, correct: ["raise"], leak: "street_plan",
      fb: {
        fold: { en: "Folding a huge draw at low SPR wastes both your equity and your fold equity.", zh: "低 SPR 弃掉超强听牌浪费了你的胜率与弃牌率。" },
        call: { en: "At SPR 2 with a monster draw, raise/jam \u2014 you have fold equity now plus big equity when called.", zh: "SPR 2 持超强听牌应加注/推注 \u2014 现在有弃牌率，被跟时也有大胜率。" },
      },
    },
    {
      s: { en: "High SPR ~12. You hold weak top pair on J-T-4 and face a big bet. Best action?", zh: "高 SPR ~12。你在 J-T-4 持弱顶对，面对大注。最佳行动？" },
      ctx: { en: "Deep SPR: a weak top pair can't profitably stack off.", zh: "深 SPR：弱顶对无法盈利地全下。" },
      lbl: { en: "J\u26659\u2663 weak top pair, SPR 12", zh: "J\u26659\u2663 弱顶对，SPR 12" },
      board: ["Jd", "Ts", "4c"], pot: 12, bet: 11, pos: "BTN (IP)", hand: ["Jh", "9c"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Weak top pair deep is dominated by better top pairs and pays off on later streets \u2014 fold to the big bet.", zh: "深筹弱顶对被更好顶对压制且后续街道要付钱 \u2014 面对大注应弃牌。" },
        raise: { en: "Raising a weak top pair deep just isolates yourself against better hands.", zh: "深筹用弱顶对加注只会把自己孤立在更好牌面前。" },
      },
    },
    {
      s: { en: "SPR ~2. A-7-2 rainbow, you hold top pair top kicker and villain bets pot. Best action?", zh: "SPR 约 2。A-7-2 彩虹，你持顶对顶踢，对手底池下注。最佳行动？" },
      lbl: { en: "A\u2665K\u2666 TPTK", zh: "A\u2665K\u2666 顶对顶踢" },
      board: ["As", "7d", "2c"], pot: 20, bet: 18, pos: "BB (OOP)", hand: ["Ah", "Kd"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: { fold: { en: "At SPR 2, top pair top kicker is committed \u2014 folding here is a big leak.", zh: "SPR 2 时顶对顶踢已投入 \u2014 此处弃牌是明显漏洞。" } },
    },
    {
      s: { en: "Deep (SPR ~12). Q-J-9-8 four-to-a-straight, a tight villain jams the turn. You hold an underpair (66). Best action?", zh: "深筹（SPR 约 12）。Q-J-9-8 四张顺子，紧凶对手转牌全压。你持垫底对（66）。最佳行动？" },
      lbl: { en: "6\u26656\u2663 underpair", zh: "6\u26656\u2663 垫底对" },
      board: ["Qs", "Jd", "9h", "8c"], pot: 20, bet: 20, pos: "BB (OOP)", hand: ["6h", "6c"], street: "turn", allIn: true,
      actions: FACE_CALL, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Deep, a jam into a four-straight board crushes an underpair \u2014 fold.", zh: "深筹时对四张顺子面的全压压制垫底对 \u2014 应弃。" },
        raise: { en: "Re-jamming an underpair into a made straight is spew.", zh: "用垫底对再全压对已成顺子是乱送。" },
      },
    },
    {
      s: { en: "SPR ~1.5. 8-7 two hearts, you hold an overpair and villain bets. Best action?", zh: "SPR 约 1.5。8-7 两张红心，你持超对，对手下注。最佳行动？" },
      lbl: { en: "A\u2660A\u2666 overpair", zh: "A\u2660A\u2666 超对" },
      board: ["8h", "7h", "2c"], pot: 20, bet: 14, pos: "BB (OOP)", hand: ["As", "Ad"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "At SPR 1.5 an overpair is fully committed \u2014 get it in vs the draws, never fold.", zh: "SPR 1.5 时超对已完全投入 \u2014 应对听牌全力投入，绝不弃。" } },
    },
    {
      s: { en: "Deep (SPR ~10). 9-6-2 rainbow, you flopped a set and villain bets. Best action?", zh: "深筹（SPR 约 10）。9-6-2 彩虹，你翻牌成三条，对手下注。最佳行动？" },
      lbl: { en: "6\u26656\u2663 set", zh: "6\u26656\u2663 三条" },
      board: ["9s", "6d", "2c"], pot: 12, bet: 8, pos: "BB (OOP)", hand: ["6h", "6c"],
      actions: FACE, correct: ["raise", "call"], leak: "too_tight",
      fb: { fold: { en: "A set is strong enough to commit even at high SPR \u2014 raise or call, never fold.", zh: "三条即使在高 SPR 也足以投入 \u2014 应加注或跟注，绝不弃。" } },
    },
    {
      s: { en: "SPR ~2. K-8-3 rainbow, you hold top pair top kicker and villain bets. Best action?", zh: "SPR 约 2。K-8-3 彩虹，你持顶对顶踢，对手下注。最佳行动？" },
      lbl: { en: "K\u2665Q\u2663 TPTK", zh: "K\u2665Q\u2663 顶对顶踢" },
      board: ["Kd", "8s", "3c"], pot: 20, bet: 16, pos: "BB (OOP)", hand: ["Kh", "Qc"],
      actions: FACE, correct: ["call", "raise"], leak: "too_tight",
      fb: { fold: { en: "At low SPR top pair top kicker is committed \u2014 don't fold; call or get it in.", zh: "低 SPR 顶对顶踢已投入 \u2014 别弃；应跟注或投入。" } },
    },
    {
      s: { en: "Deep (SPR ~13). J-9-4 rainbow, you hold weak top pair facing a big bet. Best action?", zh: "深筹（SPR 约 13）。J-9-4 彩虹，你持弱顶对面对大注。最佳行动？" },
      lbl: { en: "J\u2665 8\u2665 weak top pair", zh: "J\u2665 8\u2665 弱顶对" },
      board: ["Jd", "9s", "4c"], pot: 12, bet: 11, pos: "BB (OOP)", hand: ["Jh", "8h"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Deep, a weak top pair can't withstand sustained big-bet pressure \u2014 fold.", zh: "深筹时弱顶对承受不住持续的大注施压 \u2014 应弃。" },
        raise: { en: "Raising a weak one-pair hand deep just isolates you against better.", zh: "深筹用弱单对加注只会被更好牌孤立。" },
      },
    },
    {
      s: { en: "Low-SPR 3-bet pot. K-Q-5 flop, you hold aces and villain jams. Best action?", zh: "低 SPR 的 3-bet 底池。K-Q-5 翻牌，你持 AA，对手全压。最佳行动？" },
      lbl: { en: "A\u2665A\u2666 overpair", zh: "A\u2665A\u2666 超对" },
      board: ["Kc", "Qd", "5h"], pot: 24, bet: 18, pos: "BB (OOP)", hand: ["Ah", "Ad"], allIn: true,
      actions: FACE_CALL, correct: ["call"], leak: "too_tight",
      fb: { fold: { en: "In a low-SPR 3-bet pot, aces are committed vs a single pair / draw jam \u2014 call.", zh: "低 SPR 的 3-bet 底池里，AA 对单对/听牌的全压已投入 \u2014 应跟注。" } },
    },
    {
      s: { en: "SPR ~2. 7-5-2 rainbow, you hold an overpair and villain bets. Best action?", zh: "SPR 约 2。7-5-2 彩虹，你持超对，对手下注。最佳行动？" },
      lbl: { en: "Q\u2665Q\u2660 overpair", zh: "Q\u2665Q\u2660 超对" },
      board: ["7c", "5d", "2h"], pot: 20, bet: 15, pos: "BB (OOP)", hand: ["Qh", "Qs"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "A low SPR overpair on a dry board is committed \u2014 never fold.", zh: "干燥面低 SPR 超对已投入 \u2014 绝不弃。" } },
    },
    {
      s: { en: "River, deep (SPR was high). A-9-6-4-2. You hold weak top pair facing a big bet. Best action?", zh: "河牌，深筹（SPR 曾很高）。A-9-6-4-2。你持弱顶对面对大注。最佳行动？" },
      lbl: { en: "A\u2663 7\u2666 weak top pair", zh: "A\u2663 7\u2666 弱顶对" },
      board: ["Ah", "9d", "6c", "4s", "2h"], pot: 24, bet: 22, pos: "BB (OOP)", hand: ["Ac", "7d"], street: "river",
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Weak top pair is dominated by better aces \u2014 fold to big river pressure.", zh: "弱顶对被更好的 A 压制 \u2014 面对河牌大注应弃。" },
        raise: { en: "Raising a weak ace turns a bluff-catcher into a bluff that only worse folds to.", zh: "用弱 A 加注把抓诈牌变成只有更差牌会弃的诈唬。" },
      },
    },
    {
      s: { en: "SPR ~2. J-9-4 rainbow, you flopped bottom set and villain bets. Best action?", zh: "SPR 约 2。J-9-4 彩虹，你翻牌成最小三条，对手下注。最佳行动？" },
      lbl: { en: "4\u2665 4\u2660 bottom set", zh: "4\u2665 4\u2660 底三条" },
      board: ["Js", "9c", "4d"], pot: 20, bet: 15, pos: "BB (OOP)", hand: ["4h", "4s"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "Never fold a set \u2014 and at low SPR you're committed anyway. Get it in.", zh: "绝不弃三条 \u2014 而且低 SPR 你本就投入。应全力投入。" } },
    },
    {
      s: { en: "Deep (SPR ~12). K-Q-8 flop, you hold an underpair (JJ) facing a big bet. Best action?", zh: "深筹（SPR 约 12）。K-Q-8 翻牌，你持垫底对（JJ）面对大注。最佳行动？" },
      lbl: { en: "J\u2665J\u2660 underpair", zh: "J\u2665J\u2660 垫底对" },
      board: ["Kd", "Qc", "8h"], pot: 12, bet: 11, pos: "BB (OOP)", hand: ["Jh", "Js"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "JJ is an underpair to two overcards here; deep, don't stack off \u2014 fold to the big bet.", zh: "JJ 在此是两张高张下的垫底对；深筹时别投入 \u2014 面对大注应弃。" },
        raise: { en: "Raising an underpair into overcards deep is spew.", zh: "深筹用垫底对加注对高张是乱送。" },
      },
    },
    {
      s: { en: "SPR ~1.5. 9-8-3 two hearts, you hold the nut flush draw with two overcards and villain bets. Best action?", zh: "SPR 约 1.5。9-8-3 两张红心，你持坚果同花听+两高张，对手下注。最佳行动？" },
      lbl: { en: "A\u2665K\u2665 nut FD + overs", zh: "A\u2665K\u2665 坚果花听+高张" },
      board: ["9h", "8h", "3c"], pot: 20, bet: 14, pos: "BB (OOP)", hand: ["Ah", "Kh"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "At low SPR a nut flush draw with two overcards has the equity to get it in \u2014 never fold.", zh: "低 SPR 时坚果同花听加两高张有足够胜率投入 \u2014 绝不弃。" } },
    },
    {
      s: { en: "Deep (SPR ~12). A-J-6 rainbow, you hold second pair facing a big bet. Best action?", zh: "深筹（SPR 约 12）。A-J-6 彩虹，你持第二对面对大注。最佳行动？" },
      lbl: { en: "J\u2665T\u2665 second pair", zh: "J\u2665T\u2665 第二对" },
      board: ["Ad", "Jc", "6s"], pot: 12, bet: 11, pos: "BB (OOP)", hand: ["Jh", "Th"],
      actions: FACE, correct: ["fold"], leak: "too_loose",
      fb: {
        call: { en: "Second pair deep can't withstand big-bet pressure on an ace-high board \u2014 fold.", zh: "A 高面深筹时第二对承受不住大注施压 \u2014 应弃。" },
        raise: { en: "Raising second pair just gets called by better and folds out worse.", zh: "用第二对加注只被更好牌跟、赶走更差。" },
      },
    },
    {
      s: { en: "SPR ~2. T-6-2 rainbow, you hold an overpair (KK) and villain jams. Best action?", zh: "SPR 约 2。T-6-2 彩虹，你持超对（KK），对手全压。最佳行动？" },
      lbl: { en: "K\u2660K\u2663 overpair", zh: "K\u2660K\u2663 超对" },
      board: ["Td", "6c", "2s"], pot: 20, bet: 18, pos: "BB (OOP)", hand: ["Ks", "Kc"], allIn: true,
      actions: FACE_CALL, correct: ["call"], leak: "too_tight",
      fb: { fold: { en: "At SPR 2 an overpair on a dry board calls a jam \u2014 folding is too tight here.", zh: "SPR 2 时干燥面超对应跟全压 \u2014 防守过紧。" } },
    },
    {
      s: { en: "Deep (SPR ~13). A-T-6 flop, you hold top pair top kicker and villain check-raises once. Best action?", zh: "深筹（SPR 约 13）。A-T-6 翻牌，你持顶对顶踢，对手过牌加注一次。最佳行动？" },
      lbl: { en: "A\u2665K\u2660 TPTK", zh: "A\u2665K\u2660 顶对顶踢" },
      board: ["Ad", "Tc", "6h"], pot: 12, bet: 9, pos: "IP", hand: ["Ah", "Ks"],
      actions: FACE, correct: ["call"], leak: "too_tight",
      fb: {
        fold: { en: "Folding TPTK to a single flop check-raise deep is too tight \u2014 call once and reassess later streets.", zh: "深筹对单次翻牌过牌加注弃掉顶对顶踢太紧 \u2014 应跟一次并在后续街道重新评估。" },
        raise: { en: "Don't stack off one pair deep \u2014 just call and keep the pot controlled.", zh: "深筹别用单对全投 \u2014 应跟注并控制底池。" },
      },
    },
    {
      s: { en: "SPR ~2. T-9-4 two hearts, you hold a flush draw + open-ender (combo) and villain bets. Best action?", zh: "SPR 约 2。T-9-4 两张红心，你持花听+两头顺听（组合），对手下注。最佳行动？" },
      lbl: { en: "Q\u2665J\u2665 FD+OESD", zh: "Q\u2665J\u2665 花听+顺听" },
      board: ["Th", "9h", "4c"], pot: 20, bet: 14, pos: "BB (OOP)", hand: ["Qh", "Jh"],
      actions: FACE, correct: ["raise", "call"], leak: "street_plan",
      fb: { fold: { en: "At low SPR a combo draw this strong is committed by equity alone \u2014 get it in, never fold.", zh: "低 SPR 时如此强的组合听牌仅凭胜率就已投入 \u2014 应全力投入，绝不弃。" } },
    },
  ]),
};

function getLearn(courseId) {
  return LEARN[courseId] || [];
}

function getQuestions(courseId) {
  return QUESTIONS[courseId] || [];
}
