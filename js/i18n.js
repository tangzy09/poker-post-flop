/* i18n — English default + 中文. Loads FIRST. */
const I18N_DEFAULT = "en";

const LANG_KEY = "pokerPostFlopLang";
const LANG_KEY_LEGACY = "postflopLang";

function _readLang() {
  try {
    const legacy = localStorage.getItem(LANG_KEY_LEGACY);
    if (legacy && !localStorage.getItem(LANG_KEY)) localStorage.setItem(LANG_KEY, legacy);
    const s = localStorage.getItem(LANG_KEY);
    return s === "zh" || s === "en" ? s : I18N_DEFAULT;
  } catch (e) {
    return I18N_DEFAULT;
  }
}

let LANG = _readLang();

function curLang() {
  return LANG;
}

const STR = { en: {}, zh: {} };

function reg(key, en, zh) {
  STR.en[key] = en;
  STR.zh[key] = zh || en;
}

function t(key, vars) {
  let s = (STR[LANG] && STR[LANG][key]) || STR.en[key] || key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    }
  }
  return s;
}

function hasKey(key) {
  return !!(STR[LANG] && STR[LANG][key]) || !!STR.en[key];
}

function tConcept(key) {
  if (!key) return "";
  if (hasKey(key)) return t(key);
  if (hasKey("concept." + key)) return t("concept." + key);
  if (hasKey("leak." + key)) return t("leak." + key);
  return key;
}

function setLang(lang) {
  if (lang !== "en" && lang !== "zh") return;
  LANG = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {}
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  if (typeof onLangChange === "function") onLangChange();
}

// —— App shell ——
reg("app.title", "Poker Post-Flop", "扑克翻后");
reg("app.subtitle", "30-lesson HU post-flop trainer", "30 课单挑翻后训练");
reg("nav.courses", "Courses", "课程");
reg("nav.review", "Review", "复习");
reg("nav.stats", "Stats", "统计");

reg("lang.toggle", "中文", "EN");

reg("course.free", "Free", "免费");
reg("course.pro", "Pro", "专业版");
reg("course.lessons", "{n} lessons", "{n} 节课");
reg("course.questions", "{n} questions", "{n} 道题");
reg("course.progress", "{done}/{total} done", "已完成 {done}/{total}");
reg("course.accuracy", "{pct}% accuracy", "准确率 {pct}%");
reg("course.locked", "Pro course — unlock coming soon", "专业版课程 — 即将解锁");
reg("course.start", "Start course", "开始课程");
reg("course.continue", "Continue", "继续");
reg("course.reviewLearn", "Review lessons", "重新上课");
reg("course.practice", "Practice", "做题");
reg("course.completed", "Completed", "已完成");

reg("learn.title", "Learn", "原理");
reg("learn.next", "Next", "下一页");
reg("learn.startDrill", "Start drill", "开始做题");
reg("learn.backToLearn", "Review lessons", "重新上课");
reg("learn.slide", "{n} / {total}", "第 {n} / {total} 页");

reg("range.note", "HU · BTN open vs BB call · equity on this board (~12k sims)", "单挑 · BTN 开池 vs BB 跟注 · 此牌面权益（约 1.2 万次模拟）");
reg("range.computing", "Calculating equity…", "正在计算权益…");
reg("range.error", "Could not compute equity for this board.", "无法计算此牌面权益。");
reg("range.btn", "BTN (raiser)", "BTN（加注者）");
reg("range.bb", "BB (caller)", "BB（跟注者）");
reg("range.even", "Roughly even range equity", "范围权益大致持平");
reg("range.edgeBtn", "Range advantage: BTN +{pct}%", "范围优势：BTN +{pct}%");
reg("range.edgeBb", "Range advantage: BB +{pct}%", "范围优势：BB +{pct}%");
reg("range.legendBtn", "Raiser", "加注范围");
reg("range.legendBb", "Caller", "跟注范围");
reg("range.legendBoth", "Overlap", "重叠");
reg("range.hintDryHigh", "Dry high board → raiser has range + nut advantage (bet often)", "高牌干燥面 → 加注者有范围+坚果优势（宜高频下注）");
reg("range.hintPairedDry", "Paired dry board → favors the preflop raiser", "配对干燥面 → 利于翻前加注者");
reg("range.hintLowConnected", "Low connected board → favors the caller (sets / straights)", "低牌连接面 → 利于跟注者（三条/顺子）");
reg("range.hintConnected", "Connected board → caller connects more (check / bet selectively)", "连接面 → 跟注者中牌更多（宜过牌/选择性下注）");
reg("range.hintWet", "Wet board → caller has more draws and made hands", "湿润面 → 跟注者听牌和成牌更多");
reg("range.hintNeutral", "Board is fairly neutral — use combo-level nut advantage", "牌面较中性 — 看具体组合的坚果优势");

reg("drill.title", "Drill", "练习");
reg("drill.q", "Question {n} / {total}", "第 {n} / {total} 题");
reg("drill.concept", "Concept", "概念");
reg("drill.confidence.precise", "Solver-exact", "Solver 精确解");
reg("drill.confidence.reference", "Reference line", "参考线");
reg("drill.confidence.conceptual", "Concept drill", "概念练习");

reg("action.fold", "Fold", "弃牌");
reg("action.check", "Check", "过牌");
reg("action.call", "Call", "跟注");
reg("action.bet", "Bet", "下注");
reg("action.raise", "Raise", "加注");

reg("felt.pot", "Pot", "底池");
reg("felt.toAct", "To act", "行动方");
reg("felt.you", "YOU", "你");
reg("felt.villain", "Villain", "对手");
reg("felt.ip", "IP", "有位置");
reg("felt.oop", "OOP", "无位置");
reg("felt.street.flop", "Flop", "翻牌");
reg("felt.street.turn", "Turn", "转牌");
reg("felt.street.river", "River", "河牌");
reg("felt.street.preflop", "Preflop", "翻前");
reg("felt.street.concept", "Concept", "概念");
reg("coach.qNum", "Q{n}", "第 {n} 题");

reg("grade.best", "Correct", "答对了");
reg("grade.good", "Acceptable", "可接受");
reg("grade.wrong", "Incorrect", "不对");

reg("fb.whyWrong", "Why this doesn't work", "为何不对");
reg("fb.correct", "Recommended line", "推荐行动");
reg("fb.concept", "Key idea", "相关概念");
reg("fb.context", "Spot context", "局面背景");
reg("fb.reviewConcept", "Review lesson", "回顾原理");
reg("fb.next", "Next question", "下一题");
reg("fb.finish", "See results", "查看结果");

reg("over.title", "Course complete", "课程完成");
reg("over.score", "Score: {n}", "得分 {n}");
reg("over.accuracy", "Accuracy: {pct}%", "准确率 {pct}%");
reg("over.review", "Review mistakes", "复习错题");
reg("over.back", "Back to courses", "返回课程");

reg("review.empty", "No mistakes to review", "暂无错题");
reg("review.count", "{n} to review", "待复习 {n}");

reg("stats.title", "Your stats", "你的统计");
reg("stats.coursesDone", "Courses completed", "已完成课程");
reg("stats.totalQ", "Questions answered", "答题总数");
reg("stats.overallAcc", "Overall accuracy", "总准确率");
reg("stats.profileTitle", "Profile", "个人画像");
reg("stats.planTitle", "Training plan", "训练计划");
reg("stats.leaksTitle", "Your leaks", "你的漏洞");
reg("stats.vsRef", "vs reference lines", "vs 参考线");

reg("leak.too_tight", "Defending too tight", "防守过紧");
reg("leak.too_loose", "Continuing too loose", "跟注/继续过松");
reg("leak.sizing", "Bet sizing", "下注尺寸");
reg("leak.range_blind", "Missed range advantage", "忽视范围优势");
reg("leak.street_plan", "Multi-street plan", "多街计划");
reg("leak.concept_gap", "Concept gap", "概念缺口");
reg("leak.texture", "Board texture", "牌面结构");
reg("leak.cbet", "C-bet timing", "持续下注时机");
reg("leak.indifference", "Indifference / mixing", "无差异 / 混合");
reg("leak.mdf", "MDF / defense frequency", "MDF / 防守频率");
reg("leak.other", "Other", "其他");

reg("leakDesc.too_tight", "Folding or checking when you should continue", "该继续时弃牌或过牌");
reg("leakDesc.too_loose", "Calling or betting when you should fold", "该弃牌时跟注或下注");
reg("leakDesc.sizing", "Bet size too big or too small for the spot", "下注尺寸与局面不匹配");
reg("leakDesc.range_blind", "Missing who has range or nut advantage", "没看清范围/坚果优势归属");
reg("leakDesc.street_plan", "Turn/river plan breaks down", "转牌/河牌多街计划断裂");
reg("leakDesc.concept_gap", "Core concept not yet solid", "核心概念尚未稳固");
reg("leakDesc.texture", "Misread dry vs wet boards", "干燥/湿润牌面误读");
reg("leakDesc.cbet", "Auto c-bet or give up at wrong times", "持续下注时机错误");
reg("leakDesc.indifference", "Mixing / indifference mistakes", "混合 / 无差异决策失误");
reg("leakDesc.mdf", "Defense frequency vs bet size", "防守频率与下注尺寸");
reg("leakDesc.other", "Miscellaneous decision errors", "其他决策失误");

reg("leak.top", "Biggest leak: <b style=\"color:{c}\">{name}</b> ({n} misses · vs reference lines)", "最大漏洞：<b style=\"color:{c}\">{name}</b>（{n} 次失误 · vs 参考线）");
reg("leak.worstQs", "Most-missed questions", "最常错的题");
reg("leak.empty", "No leak data yet — missed questions are collected here automatically.", "还没有漏洞数据——训练里答错的题会自动收进来。");
reg("leak.drill", "Drill", "去练");

reg("prof.empty", "Answer {need}+ questions to generate your profile.", "练够 {need} 题后这里生成你的画像。");
reg("prof.style", "Defense style", "防守倾向");
reg("prof.pending", "Need more data", "样本不足");
reg("prof.balanced", "Fairly balanced", "较均衡");
reg("prof.tight", "Tends tight ({p}% of defend leaks)", "偏紧（防守类失误 {p}%）");
reg("prof.loose", "Tends loose ({p}% of defend leaks)", "偏松（继续类失误 {p}%）");
reg("prof.acc", "Accuracy", "准确率");
reg("prof.cum", "{n} questions total", "累计 {n} 题");
reg("prof.best", "Strongest course", "最强课程");
reg("prof.worst", "Weakest course", "最弱课程");
reg("prof.stWeak", "Weakest street", "最弱街道");
reg("prof.stStrong", "Strongest street", "最强街道");
reg("prof.st.flop", "Flop", "翻牌");
reg("prof.st.turn", "Turn", "转牌");
reg("prof.st.river", "River", "河牌");
reg("prof.st.concept", "Concept MCQ", "概念选择");
reg("prof.note", "Based on reference training lines — not solver-exact.", "基于参考训练线 — 非 solver 精确解。");

reg("plan.empty", "No items yet — mistakes build your plan automatically.", "还没有计划项——错题会自动生成训练计划。");
reg("plan.head", "Ranked by misses + low course accuracy (top 5):", "按失误次数 + 课准确率低排序（前 5）：");
reg("plan.acc", "{p}% acc · ", "{p}% 准确 · ");
reg("plan.errs", "{n} in review pile", "复习堆 {n} 题");
reg("plan.drill", "Drill", "去练");

reg("stats.courseAccTitle", "Accuracy by course", "各课准确率");
reg("stats.noCourseData", "No per-course stats yet — answer questions in any lesson.", "还没有按课统计数据——先做任意课的题目。");
reg("stats.barPct", "{p}% · {h} Q", "{p}% · {h} 题");

reg("review.title", "Review pile", "复习堆");
reg("review.subtitle", "Grouped by course — drill a group or remove mastered items.", "按课程分组 — 可分组练习或移除已掌握的题。");
reg("review.all", "Review all ({n})", "全部复习 ({n})");
reg("review.drillGroup", "Drill ({n})", "练本课 ({n})");
reg("review.pileEmpty", "Your review pile is empty — missed questions land here automatically.", "错题堆是空的——训练里答错的题会自动收进来。");
reg("review.chipMaster", "streak {s}/{m}", "连对 {s}/{m}");
reg("review.remove", "Remove from pile", "从复习堆移除");
reg("review.openPile", "Open review pile", "打开复习堆");
reg("review.emptyFilter", "No matching mistakes in your review pile.", "复习堆里没有符合条件的错题。");
reg("review.over.title", "Review session complete", "复习完成");
reg("review.over.score", "This session: {n} / {total} correct", "本次 {n} / {total} 答对");
reg("review.over.remaining", "{n} left in review pile", "复习堆还剩 {n} 题");
reg("review.over.cleared", "Review pile cleared — nice work!", "复习堆已清空，干得漂亮！");
reg("review.over.mastered", "{n} mastered ({m} correct in a row)", "{n} 题已掌握（连对 {m} 次）");
reg("review.over.done", "Done", "完成");

// —— 12 courses ——
reg("c1.title", "Placement Test", "初始测试");
reg("c1.sub", "20 questions · 5-min skill check", "20 题 · 5 分钟摸底");
reg("c2.title", "Implied & Reverse Implied Odds", "隐含赔率与反向隐含赔率");
reg("c2.sub", "Future streets change the math", "未来街道如何改变计算");
reg("c3.title", "Range & Nut Advantage", "范围优势与坚果优势");
reg("c3.sub", "Who should bet and why", "谁更该下注，为什么");
reg("c4.title", "Board Textures", "牌面纹理");
reg("c4.sub", "Dry vs wet boards change strategy", "干燥与湿润牌面的策略差异");
reg("c5.title", "C-bet as IP Aggressor", "有位置持续下注");
reg("c5.sub", "When and how to c-bet in position", "何时、如何在有位置持续下注");
reg("c6.title", "Defending vs C-bets", "防守持续下注");
reg("c6.sub", "OOP defense: check-call, check-raise, fold", "无位置防守：过牌-跟注、过牌-加注、弃牌");
reg("c7.title", "Polarization & Bluff-catching", "极化下注与抓诈");
reg("c7.sub", "Solver-backed MDF in polarized spots", "极化局面的 MDF（Solver 验证）");
reg("c8.title", "Indifference & Mixed Strategies", "无差异与混合策略");
reg("c8.sub", "When multiple lines tie in EV", "多条行动线 EV 相同时");
reg("c9.title", "Turn: Barrel or Give Up", "转牌：第二枪还是放弃");
reg("c9.sub", "Planning the second barrel", "转牌第二枪的规划");
reg("c10.title", "River Value & Bluff Selection", "河牌价值与诈唬选择");
reg("c10.sub", "Sizing value, picking bluffs", "价值下注尺寸与诈唬选择");
reg("c11.title", "Check-raise & Probe Bets", "过牌加注与试探下注");
reg("c11.sub", "OOP aggression and delayed c-bets", "无位置进攻与延迟持续下注");
reg("c12.title", "SPR & Commitment", "SPR 与承诺");
reg("c12.sub", "Stack-to-pot ratio and stack-off decisions", "筹码底池比与全下决策");
reg("c13.title", "Bet Sizing", "下注尺寸");
reg("c13.sub", "Small vs big bets and MDF", "小注、大注与 MDF");
reg("c14.title", "Blockers", "阻断牌");
reg("c14.sub", "Which bluffs to fire and which to skip", "哪些诈唬该打、哪些该弃");
reg("c15.title", "Facing Raises", "面对加注");
reg("c15.sub", "Fold, call, or re-raise when raised", "被加注时弃牌、跟注还是再加注");
reg("c16.title", "3-Bet Pot Postflop", "3-bet 底池翻后");
reg("c16.sub", "Narrower ranges and lower SPR", "更窄范围与更低 SPR");
reg("c17.title", "Pot Control", "底池控制");
reg("c17.sub", "Don't bloat pots with medium hands", "中等牌力别把底池打太大");
reg("c18.title", "Turn Defense", "转牌防守");
reg("c18.sub", "Facing the second barrel", "面对转牌第二枪");
reg("c19.title", "Float & Delayed Aggression", "漂牌与延迟进攻");
reg("c19.sub", "Call flop, attack when they check turn", "翻牌跟注、转牌对手过牌后进攻");
reg("c20.title", "Overbetting", "超池下注");
reg("c20.sub", "When to bet bigger than the pot", "何时下注超过底池");
reg("c21.title", "Donk Betting", "领先下注");
reg("c21.sub", "Leading OOP into the preflop raiser", "无位置领先于翻前加注者");
reg("c22.title", "Thin Value", "薄价值");
reg("c22.sub", "Marginal hands that still want a bet", "边缘牌何时仍该下注");
reg("c23.title", "Draws & Semi-bluff Raises", "听牌与半诈唬加注");
reg("c23.sub", "Raise with equity and fold equity", "用胜率与弃牌率加注");
reg("c24.title", "River Defense Deep", "河牌防守");
reg("c24.sub", "Triple barrels, overbets, and polarized lines", "三枪、超池与极化线");
reg("c25.title", "Multiway Pots", "多人底池");
reg("c25.sub", "Tighter bluffs, stronger continues", "少诈唬、强牌才继续");
reg("c26.title", "Exploitative Adjustments", "剥削调整");
reg("c26.sub", "When to deviate from baseline GTO", "何时偏离基准 GTO");
reg("c27.title", "Tournament Postflop", "锦标赛翻后");
reg("c27.sub", "Short stacks, bubbles, and ICM pressure", "短筹、bubble 与 ICM 压力");
reg("c28.title", "Multi-Street Planning", "多街计划");
reg("c28.sub", "Plan flop through river before you bet", "下注前先规划到河牌");
reg("c29.title", "Special Boards", "特殊牌面");
reg("c29.sub", "Paired, monotone, and four-straight textures", "配对、同色、四顺纹理");
reg("c30.title", "Capstone Drills", "综合实战");
reg("c30.sub", "Mixed advanced spots across concepts", "跨概念混合进阶局面");

// —— Placement test ——
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
reg("placement.youChose", "You chose", "你选了");

// —— Placement themes ——
reg("theme.flop", "Flop initiative", "翻牌主导权");
reg("theme.odds", "Odds & bluff-catching", "赔率与抓诈");
reg("theme.turn", "Turn decisions", "转牌决策");
reg("theme.river", "River decisions", "河牌决策");
reg("theme.advanced", "Advanced spots", "进阶专题");

// —— Navigation ——
reg("course.back", "Back", "返回");

function applyI18n(root) {
  root = root || document;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  if (typeof document !== "undefined" && document) {
    document.title = t("app.title");
  }
}
