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
reg("app.subtitle", "12-lesson HU post-flop trainer", "12 课单挑翻后训练");
reg("nav.courses", "Courses", "课程");
reg("nav.review", "Review", "复习");
reg("nav.stats", "Stats", "统计");
reg("nav.table", "Table", "牌桌");

reg("table.title", "Table view", "牌桌视图");
reg("table.hint", "Switch the player count to see positions and chips change.", "切换人数，观察位置与筹码的变化。");
reg("table.players", "{n}-handed", "{n} 人桌");
reg("table.caption", "Preflop · you are on the BTN. Blinds are posted and an early position opens; folded players are dimmed.", "翻前 · 你在按钮位(BTN)。盲注已下、前位开池；已弃牌的玩家变暗。");
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
reg("course.completed", "Completed", "已完成");

reg("learn.title", "Learn", "原理");
reg("learn.next", "Next", "下一页");
reg("learn.startDrill", "Start drill", "开始做题");
reg("learn.slide", "{n} / {total}", "第 {n} / {total} 页");

reg("drill.title", "Drill", "练习");
reg("drill.q", "Question {n} / {total}", "第 {n} / {total} 题");
reg("drill.concept", "Concept", "概念");
reg("drill.confidence.precise", "Solver-exact", "Solver 精确");
reg("drill.confidence.reference", "Reference", "参考解");
reg("drill.confidence.conceptual", "Concept", "概念题");

reg("action.fold", "Fold", "弃牌");
reg("action.check", "Check", "过牌");
reg("action.call", "Call", "跟注");
reg("action.bet", "Bet", "下注");
reg("action.raise", "Raise", "加注");

reg("felt.pot", "Pot", "底池");
reg("felt.toAct", "To act", "行动方");
reg("felt.you", "YOU", "你");
reg("felt.villain", "Villain", "对手");

reg("grade.best", "Correct", "正确");
reg("grade.good", "Acceptable", "可接受");
reg("grade.wrong", "Incorrect", "错误");

reg("fb.whyWrong", "Why this is wrong", "错在哪里");
reg("fb.correct", "Correct answer", "正确答案");
reg("fb.concept", "Concept", "相关概念");
reg("fb.context", "Spot context", "局面说明");
reg("fb.reviewConcept", "Review concept", "回顾原理");
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

reg("leak.too_tight", "Too tight", "太紧");
reg("leak.too_loose", "Too loose", "太松");
reg("leak.sizing", "Sizing mistake", "尺寸错误");
reg("leak.range_blind", "Ignored range advantage", "忽略范围优势");
reg("leak.street_plan", "Street planning", "街道规划");
reg("leak.concept_gap", "Concept gap", "概念薄弱");

// —— 12 courses ——
reg("c1.title", "Pot Odds & MDF", "底池赔率与 MDF");
reg("c1.sub", "Foundation: when a call is profitable", "基础：何时跟注有利可图");
reg("c2.title", "Implied & Reverse Implied Odds", "隐含赔率与反向隐含赔率");
reg("c2.sub", "Future streets change the math", "未来街道如何改变计算");
reg("c3.title", "Range & Nut Advantage", "范围优势与坚果优势");
reg("c3.sub", "Who should bet and why", "谁更该下注，为什么");
reg("c4.title", "Board Textures", "牌面纹理");
reg("c4.sub", "Dry vs wet boards change strategy", "干燥与湿润牌面的策略差异");
reg("c5.title", "C-bet as IP Aggressor", "有位置持续下注");
reg("c5.sub", "When and how to c-bet in position", "何时、如何在有位置 c-bet");
reg("c6.title", "Defending vs C-bets", "防守持续下注");
reg("c6.sub", "OOP defense: check-call, check-raise, fold", "无位置防守：跟注、过牌加注、弃牌");
reg("c7.title", "Polarization & Bluff-catching", "极化与抓诈");
reg("c7.sub", "Solver-backed MDF in polarized spots", "Solver 验证的极化局面 MDF");
reg("c8.title", "Indifference & Mixed Strategies", "无差异与混合策略");
reg("c8.sub", "When multiple lines tie in EV", "多条行动线 EV 相同时");
reg("c9.title", "Turn: Barrel or Give Up", "转牌：继续开火还是放弃");
reg("c9.sub", "Planning the second barrel", "第二枪的规划");
reg("c10.title", "River Value & Bluff Selection", "河牌价值与诈唬选择");
reg("c10.sub", "Sizing value, picking bluffs", "价值下注尺寸与诈唬选择");
reg("c11.title", "Check-raise & Probe Bets", "过牌加注与试探下注");
reg("c11.sub", "OOP aggression and delayed c-bets", "无位置进攻与延迟 c-bet");
reg("c12.title", "SPR & Commitment", "SPR 与承诺");
reg("c12.sub", "Stack-to-pot ratio and stack-off decisions", "筹码底池比与全下决策");

function applyI18n(root) {
  root = root || document;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
}
