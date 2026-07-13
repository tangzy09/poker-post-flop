/* i18n — N 语显示层,最先加载。English 是默认与**唯一回退**语言。
   en / zh **内联在本文件**(reg 的第 2、3 参数)→ 同步可用,setLang('en'|'zh') 立即生效。
   其余语言(ja/de/es)是 **js/locales/<code>.js 懒加载**:文件调 I18N_REGISTER(code,{T:{key:译文}})
   注册自己。用**动态 <script> 注入**而非 fetch —— Capacitor 的 file:// 下 fetch 取不到本地文件,
   app 必须离线可跑。
   ⚠ 缺键一律回落**英文**,绝不回落中文:否则德语用户屏幕上会蹦出中文。
   **加一种语言 = 只碰 3 处**:I18N_SUPPORTED + I18N_NATIVE + js/locales/<code>.js
   (还要同步 codemagic.yaml 的 CFBundleLocalizations —— 那是 App Store「语言」栏的唯一来源。) */
const I18N_DEFAULT = "en";
/* 只列**真正发货**的语言:翻译覆盖率以此为准,没译完别提前加进来 */
const I18N_SUPPORTED = ["en", "zh", "ja", "de", "es"];
const I18N_NATIVE = { en: "English", zh: "中文", ja: "日本語", de: "Deutsch", es: "Español" };
const _I18N_INLINE = { en: 1, zh: 1 }; // 内联 = 同步可用,无需加载

const LANG_KEY = "pokerPostFlopLang";
const LANG_KEY_LEGACY = "postflopLang";

/* 懒加载语言的译文表:code → { key: 译文 };js/locales/<code>.js 调本函数注册 */
const LOCALES = Object.create(null);
function I18N_REGISTER(code, data) {
  try {
    LOCALES[code] = (data && data.T) || {};
  } catch (e) {}
}

function _readLang() {
  try {
    const legacy = localStorage.getItem(LANG_KEY_LEGACY);
    if (legacy && !localStorage.getItem(LANG_KEY)) localStorage.setItem(LANG_KEY, legacy);
    const s = localStorage.getItem(LANG_KEY);
    if (s && I18N_SUPPORTED.indexOf(s) >= 0) return s;
  } catch (e) {}
  // 没存过 → 按设备语言猜(前缀表从 SUPPORTED 派生,别手写第二张)
  try {
    const pref = {};
    I18N_SUPPORTED.forEach((l) => {
      const p = l.split("-")[0];
      if (!(p in pref)) pref[p] = l;
    });
    const navs =
      typeof navigator !== "undefined" && navigator.languages && navigator.languages.length
        ? navigator.languages
        : [(typeof navigator !== "undefined" && navigator.language) || ""];
    for (let i = 0; i < navs.length; i++) {
      const p = String(navs[i]).toLowerCase().split("-")[0];
      if (pref[p]) return pref[p];
    }
  } catch (e) {}
  return I18N_DEFAULT;
}

const _i18nWant = _readLang();
/* 非内联语言此刻还没加载 → 先以英文起步(同步可用),locale 到位后由 setLang 切过去。
   走的仍是 setLang 那条唯一路径(别写第二条:两条路径=两份 bug)。 */
let LANG = _I18N_INLINE[_i18nWant] ? _i18nWant : I18N_DEFAULT;

function curLang() {
  return LANG;
}

const STR = { en: {}, zh: {} };

function reg(key, en, zh) {
  STR.en[key] = en;
  STR.zh[key] = zh || en;
}

/* 取词优先级:懒加载语言 → 内联(en/zh) → **英文兜底** → key 本身(并告警一次) */
function _lookup(key) {
  const L = LOCALES[LANG];
  if (L && L[key] !== undefined && L[key] !== "") return L[key];
  const S = STR[LANG];
  if (S && S[key] !== undefined) return S[key];
  return STR.en[key];
}

const _tMissWarned = {};
function t(key, vars) {
  let s = _lookup(key);
  if (s === undefined) {
    s = key; // 缺 key 回退为 key 本身,但控制台警告一次,避免新枚举忘 reg() 静默露 key
    if (!_tMissWarned[key] && typeof console !== "undefined") {
      _tMissWarned[key] = 1;
      console.warn("[i18n] missing key:", key);
    }
  }
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    }
  }
  return s;
}

function hasKey(key) {
  return _lookup(key) !== undefined;
}

function tConcept(key) {
  if (!key) return "";
  if (hasKey(key)) return t(key);
  if (hasKey("concept." + key)) return t("concept." + key);
  if (hasKey("leak." + key)) return t("leak." + key);
  return key;
}

/* 英文源串:给 explain.js 这类**需要解析题干数字**的地方用。
   ⚠ 绝不能拿 t() 的结果去跑正则 —— 题干翻成德语后正则就不匹配了,计算式反馈会静默消失。 */
function tEn(key) {
  return STR.en[key];
}

function _hasDOM() {
  return typeof document !== "undefined" && !!document.createElement;
}
/* locale 文件与 js/ 同级;生成的分语言静态页若在子目录,注入 window.__I18N_BASE 覆盖 */
function _localeBase() {
  try {
    if (typeof window !== "undefined" && window.__I18N_BASE) return window.__I18N_BASE;
  } catch (e) {}
  return "js/locales/";
}
/* 懒加载文件没有静态 <script> 标签 → stamp-version.js 打不到戳 → 手机端会吃旧缓存。
   自己从已打戳的 script 上把 ?v=<hash> 抠出来带上。 */
function _verSuffix() {
  try {
    const s = document.querySelector('script[src*="js/i18n.js?v="], script[src*="js/engine.js?v="]');
    const m = s && s.getAttribute("src").match(/\?v=([\w.-]+)/);
    return m ? "?v=" + m[1] : "";
  } catch (e) {
    return "";
  }
}

/* 唯一的 locale 加载入口:内联/已加载 → 同步回调;其余 → 动态 <script>。
   加载失败绝不白屏,只是留在当前语言。 */
function ensureLocale(code, cb) {
  if (_I18N_INLINE[code] || LOCALES[code]) return cb(true);
  if (I18N_SUPPORTED.indexOf(code) < 0) return cb(false);
  if (!_hasDOM()) return cb(false); // Node 测试 VM:不注入脚本
  const s = document.createElement("script");
  s.src = _localeBase() + code + ".js" + _verSuffix();
  s.onload = function () {
    cb(!!LOCALES[code]);
  };
  s.onerror = function () {
    cb(false);
  };
  document.head.appendChild(s);
}

function setLang(lang) {
  if (I18N_SUPPORTED.indexOf(lang) < 0) return;
  ensureLocale(lang, function (ok) {
    if (!ok) return; // 加载失败 → 留在当前语言,不白屏
    LANG = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
    try {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    } catch (e) {}
    if (typeof onLangChange === "function") onLangChange();
  });
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
reg("course.locked", "🔒 Pro — tap to unlock", "🔒 专业版 — 点击解锁");
reg("course.start", "Start course", "开始课程");
reg("course.continue", "Continue", "继续");
reg("course.reviewLearn", "Review lessons", "重新上课");
reg("course.practice", "Practice", "做题");
reg("course.completed", "Completed", "已完成");

// ——— 付费墙(Pro) ———
reg("paywall.title", "Unlock PostFlop Pro", "解锁 PostFlop 专业版");
reg("paywall.whyDefault", "Unlock every lesson and the full drill bank.", "解锁全部课程与完整题库。");
reg("paywall.whyCourse", "This lesson is part of Pro.", "本课属于专业版。");
// 卖点(一行一条,\n 分隔)
reg(
  "paywall.pitch",
  "Full lesson track + all 699 drills unlocked\nLeak heat-map, profile & training plan\n180-day accuracy trend & grade history\nSpaced-repetition review, forever",
  "全部课程 + 699 道题全解锁\n漏洞热图、画像与个性化训练计划\n180 天准确率趋势与评级历史\n间隔重复复习，永久保留"
);
reg("paywall.year", "Go Pro — Yearly", "升级年度会员");
reg("paywall.yearTrial", "Start {d}-day free trial", "开始 {d} 天免费试用");
reg("paywall.yearDyn", "Go Pro — {p}/yr", "升级年度会员 — {p}/年");
reg("paywall.yearNote", "{p}/year · cancel anytime", "{p}/年 · 随时取消");
reg("paywall.yearTrialNote", "then {p}/year, cancel anytime", "之后 {p}/年，随时取消");
reg("paywall.sub", "Monthly", "按月订阅");
reg("paywall.subNote", "{p}/month", "{p}/月");
reg("paywall.restore", "Restore purchase", "恢复购买");
reg("paywall.close", "Maybe later", "以后再说");
reg("paywall.foot", "Auto-renews until cancelled. Manage in the store.", "自动续订至取消，可在商店随时管理。");
reg("paywall.terms", "Terms of Use (EULA)", "使用条款 (EULA)");
reg("paywall.privacy", "Privacy Policy", "隐私政策");
// 首屏常驻 Pro 入口(苹果 2.1(b):内购必须显眼可达)
reg("pro.badge", "Pro", "专业版");
reg("pro.cardTitle", "Unlock PostFlop Pro", "解锁 PostFlop 专业版");
reg("pro.cardSub", "Lessons 13–30, the full drill bank, leak analysis and training plans.", "第 13–30 课、完整题库、漏洞分析与训练计划。");
reg("pro.cardCta", "See plans & pricing →", "查看订阅方案 →");
reg("paywall.unlocked", "Pro unlocked 🎉", "已解锁专业版 🎉");
reg("paywall.buyFail", "Purchase failed — please try again.", "购买失败 — 请重试。");
reg("paywall.noPurchase", "No purchase found to restore.", "没有可恢复的购买。");
// web(未来收费触点):引导下载 App
reg("paywall.webTitle", "Get Pro in the app", "在 App 里解锁专业版");
reg("paywall.webDesc", "Pro subscriptions are available in the iOS and Android app.", "专业版订阅在 iOS 与安卓 App 内提供。");
reg("paywall.webCta", "Download the app", "下载 App");

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
reg("fb.whyRight", "Why it's right", "为什么对");
reg("fb.generic.ok", "Correct — that's the best line here.", "正确 —— 这是该局面的最佳选择。");
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
reg("review.remove", "Remove from pile", "从复习堆移除");
reg("review.openPile", "Open review pile", "打开复习堆");
reg("review.emptyFilter", "No matching mistakes in your review pile.", "复习堆里没有符合条件的错题。");
reg("review.over.title", "Review session complete", "复习完成");
reg("review.over.score", "This session: {n} / {total} correct", "本次 {n} / {total} 答对");
reg("review.over.remaining", "{n} left in review pile", "复习堆还剩 {n} 题");
reg("review.over.cleared", "Review pile cleared — nice work!", "复习堆已清空，干得漂亮！");
reg("review.over.mastered", "{n} mastered", "{n} 题已掌握");
reg("review.over.done", "Done", "完成");
/* 间隔重复(SRS) */
reg("review.dueBtn", "Review due ({n})", "复习到期 ({n})");
reg("review.headCount", "{due} due · {total} total", "{due} 到期 · 共 {total} 题");
reg("review.chipDue", "due", "到期");
reg("review.chipWait", "in {when}", "{when}后");
reg("review.wait.days", "{n}d", "{n} 天");
reg("review.wait.hours", "{n}h", "{n} 小时");
reg("review.boxTitle", "Spaced-repetition level {b}/{m}", "间隔重复等级 {b}/{m}");
reg("review.emptyDue", "No reviews due — next in {when}. Spacing them out helps them stick.", "暂无到期复习 — 下次 {when}后到期。拉开间隔更利于记牢。");
/* 每日训练 */
reg("daily.badge", "Daily", "每日");
reg("daily.title", "Daily training", "今日训练");
reg("daily.cardSub", "{n} hands picked for you: due reviews + weak spots + fresh spots.", "为你挑选 {n} 道：到期复习 + 弱项 + 新题。");
reg("daily.start", "Start today's set", "开始今日训练");
reg("daily.continue", "Continue", "继续");
reg("daily.retake", "Practice again", "再练一遍");
reg("daily.progressLine", "In progress: {a}/{s} answered", "进行中：已答 {a}/{s}");
reg("daily.doneLine", "Done today: {c}/{t} correct", "今日已完成：{c}/{t} 答对");
reg("daily.doneBadge", "Done today", "今日已完成");
reg("daily.streak", "{n}-day streak", "连续 {n} 天");
reg("daily.best", "Best streak: {n} days", "最佳纪录 {n} 天");
reg("daily.over.title", "Daily training complete", "今日训练完成");
reg("share.btn", "Share result", "分享成绩");
reg("share.title", "Daily Training", "今日训练");
reg("share.brand", "Postflop Coach · free HU postflop trainer", "翻后训练营 · 免费单挑翻后训练");
/* 计分与评级 */
reg("over.points", "Points: {n}", "积分 {n}");
reg("over.combo", "Best combo ×{n}", "最高连击 ×{n}");
/* 漏洞热图 */
reg("stats.leakHeatTitle", "Accuracy by leak type", "按漏洞类型准确率");
reg("heat.empty", "Answer more questions to build your leak heatmap (needs 3+ hands per leak type).", "多答题即可生成漏洞热图（每类漏洞需 3 手以上样本）。");
/* 课程页 */
reg("courses.progressLine", "{done}/{total} courses completed", "已完成 {done}/{total} 课");
reg("placement.badge", "Placement", "摸底");
/* 准确率趋势 */
reg("trend.title", "Accuracy trend", "准确率趋势");
reg("trend.empty", "No trend data yet — normal training records daily accuracy.", "还没有趋势数据 — 正常训练会按天记录准确率。");
reg("trend.note", "{n} days tracked · latest {acc}% ({h} hands)", "共记录 {n} 天 · 最近一天 {acc}%（{h} 手）");
reg("trend.hands", "hands", "手数");
reg("trend.tip", "{date} · {acc}% · {h} hands", "{date} · {acc}% · {h} 手");
reg("trend.max", "max", "峰值");
reg("err.saveFailed", "Storage is full or unavailable — your progress is NOT being saved. Free up space or exit private browsing.", "存储已满或不可用 —— 进度当前无法保存。请清理空间或退出无痕模式。");
/* 反馈闭环 */
reg("fb.vs.ref", "Reference", "参考");
reg("fb.vs.you", "You", "你");
reg("fb.leakLine", "Your leak: {name} · ×{n}", "你的毛病：{name} · 第 {n} 次");
reg("fb.leakFirst", "Leak type: {name}", "漏洞类型：{name}");
reg("fb.drillLeak", "Drill this leak →", "专练这类 →");
/* 新手引导 */
reg("intro.t1", "Train your post-flop game", "练翻牌后的决策");
reg("intro.b1", "30 lessons, 699 real spots — from pot odds and MDF all the way to overbets, ICM and a capstone. Every answer is verified.", "30 课、699 道实战题 — 从赔率与 MDF 一路到超池、ICM 与综合大考。每道答案都经过验证。");
reg("intro.t2", "Learn, drill, and review on schedule", "边学边练，按期复习");
reg("intro.b2", "Each lesson: short theory, then drills with computed feedback. Misses return on a 1/3/7-day schedule, and a 10-hand daily set keeps your streak alive.", "每课先讲原理再进题；答错的题按 1/3/7 天到期回归，每天 10 题保持手感和连续打卡。");
reg("intro.t3", "Start with a 5-minute placement test", "从 5 分钟摸底开始");
reg("intro.b3", "20 questions to find your level and weakest street — then jump in exactly where you should.", "20 道题测出你的水平与最弱街道，然后从最该练的地方开始。");
reg("intro.skip", "Skip", "跳过");
reg("intro.next", "Next", "下一步");
reg("intro.browse", "Browse courses", "先逛逛");
reg("intro.goPlacement", "Take the test", "去摸底");
/* 姐妹站互链 */
reg("cross.title", "Sharpen your preflop game too", "翻前也要练？");
reg("cross.sub", "Preflop Camp — GTO preflop trainer with solved Nash push/fold (same maker).", "翻前训练营 — 含自算 Nash 推弃真 EV 的翻前 GTO 训练器（同一作者）。");
reg("cross.go", "Open Preflop Camp ↗", "去翻前训练营 ↗");

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
reg("placement.startHere", "Start here: {title}", "从这课开始：{title}");
reg("placement.smallSample", "Small sample — treat as a rough signal", "样本较小，仅作大致参考");
reg("placement.youChose", "You chose: ", "你选了：");
reg("placement.abandon", "Abandon the test? Your progress will be lost.", "放弃测试？当前进度会丢失。");
reg("placement.correctAns", "Correct: ", "正确答案：");

// —— Placement themes ——
reg("theme.flop", "Flop initiative", "翻牌主导权");
reg("theme.odds", "Odds & bluff-catching", "赔率与抓诈");
reg("theme.turn", "Turn decisions", "转牌决策");
reg("theme.river", "River decisions", "河牌决策");
reg("theme.advanced", "Advanced spots", "进阶专题");

// —— Navigation ——
reg("course.back", "Back", "返回");

/* —— 计算式反馈(explain.js)的模板 ——
   ⚠ 铁律:**每个 key 必须是一个完整句子**,绝不能是句子片段。
   explain.js 以前是 L(zh, en) 直接拼字符串("你的牌是"+tags+"，约"+outs+"个 outs…"),
   那种拼法在德语(动词后置)和日语(助词/语序)下**根本拼不出通顺句**。
   改成整句模板 + {占位符} 后,译者可以自由重排语序。
   占位符含义:{tags}听牌标签 {outs}出张数 {pct}命中率 {pot}底池 {bet}下注 {total}下注后底池
              {need}所需胜率 {ratio}赔率 {mdf}MDF {rec}正确动作 {cat}牌型 {ans}正确选项 {picked}所选选项
   ⚠ 数字与不等号由代码算好后填入,**译文里不要改数值、不要动 ≥ < − 这些符号的含义**。 */

// 动作词
reg("fb.act.fold", "fold", "弃牌");
reg("fb.act.call", "call", "跟注");
reg("fb.act.raise", "raise", "加注");
reg("fb.act.bet", "bet", "下注");
reg("fb.act.check", "check", "过牌");
reg("fb.act.jam", "jam", "全下");
// 牌型词
reg("fb.cat.set", "a set", "三条(set)");
reg("fb.cat.twopair", "two pair", "两对");
reg("fb.cat.trips", "trips", "三条");
reg("fb.cat.straight", "a straight", "顺子");
reg("fb.cat.flush", "a flush", "同花");
reg("fb.cat.fullhouse", "a full house", "葫芦");
reg("fb.cat.quads", "quads", "四条");
reg("fb.cat.pair", "one pair", "一对");
reg("fb.cat.high", "high card", "高牌");
// 听牌词
// ⚠ 坚果同花听是**独立词条**,不能写成 "nut" + "flush draw" 前缀拼接:
//    西语形容词后置(proyecto de color máximo),前缀拼出来是 "nut proyecto de color" —— 不通顺。
//    与整句模板同理:凡是要拼的地方,都让译者拿到完整词/句自行组织语序。
reg("fb.draw.flushdraw", "flush draw", "同花听");
reg("fb.draw.nutflushdraw", "nut flush draw", "坚果同花听");
reg("fb.draw.openender", "open-ender", "两头顺听");
reg("fb.draw.gutshot", "gutshot", "卡顺");

// 选择题:计算式讲解
reg(
  "fb.choice.calc",
  "After the bet the pot is {pot}+{bet}={total}; calling {bet} → {total}:{bet} = {ratio}:1 (needs {need}% equity); defender MDF = 1−{bet}/{total} = {mdf}%.",
  "下注后底池 {pot}+{bet}={total}，跟 {bet} → {total}:{bet} = {ratio}:1（需胜率 {need}%）；防守方 MDF = 1−{bet}/{total} = {mdf}%。"
);
reg("fb.choice.right", "“{ans}” is right.", "「{ans}」正确。");
reg("fb.choice.correct", "“{ans}” is correct.", "「{ans}」正确。");
reg("fb.choice.picked", "You picked “{picked}”.", "你选了「{picked}」。");
reg("fb.choice.answer", "The answer is “{ans}”.", "按此应选「{ans}」。");

// 听牌局面:开头(四种组合各自成句,避免片段拼接)
reg(
  "fb.draw.head",
  "You hold {tags} — about {outs} outs (≈{pct}% to hit on one card).",
  "你的牌是 {tags}，约 {outs} 个 outs（一张牌≈{pct}% 命中）。"
);
reg(
  "fb.draw.head.pair",
  "You hold {tags} — about {outs} outs (≈{pct}% to hit on one card); you also hold a pair for showdown value (outs count the draw only — you are stronger than the raw number).",
  "你的牌是 {tags}，约 {outs} 个 outs（一张牌≈{pct}% 命中）；另持一对有摊牌价值（outs 仅计听牌，实际更强）。"
);
reg(
  "fb.draw.head.facing",
  "You hold {tags} — about {outs} outs (≈{pct}% to hit on one card), and facing {bet} into {pot} you need {need}% ({ratio}:1).",
  "你的牌是 {tags}，约 {outs} 个 outs（一张牌≈{pct}% 命中），面对 {bet} 注（底池 {pot}）需 {need}%（{ratio}:1）。"
);
reg(
  "fb.draw.head.pair.facing",
  "You hold {tags} — about {outs} outs (≈{pct}% to hit on one card); you also hold a pair for showdown value (outs count the draw only — you are stronger than the raw number). Facing {bet} into {pot} you need {need}% ({ratio}:1).",
  "你的牌是 {tags}，约 {outs} 个 outs（一张牌≈{pct}% 命中）；另持一对有摊牌价值（outs 仅计听牌，实际更强）。面对 {bet} 注（底池 {pot}）需 {need}%（{ratio}:1）。"
);
// 听牌局面:结论(每条都是独立完整句)
reg(
  "fb.draw.tail.nobet.ok",
  "Betting a strong draw (semi-bluff) combines fold equity with your outs — {rec} is right.",
  "带强听牌主动下注（半诈唬）兼具弃牌率与命中价值 —— {rec} 正确。"
);
reg(
  "fb.draw.tail.nobet.wrong",
  "This is a semi-bluff spot — the answer is {rec}.",
  "这是半诈唬下注/继续的好局面 —— 正确是 {rec}。"
);
reg(
  "fb.draw.tail.short.ok",
  "{pct}% < the {need}% needed, so folding is right ({rec}).",
  "{pct}% < 所需 {need}%，价格不够，弃牌正确（{rec}）。"
);
reg(
  "fb.draw.tail.short.wrong",
  "{pct}% < the {need}% needed, so calling is −EV — the answer is {rec}.",
  "{pct}% < 所需 {need}%，价格不够，跟注是 −EV —— 正确是 {rec}。"
);
reg(
  "fb.draw.tail.reverse.ok",
  "The raw odds are there, but a weak/dominated draw loses a big pot when it hits (reverse implied odds) or is out of position vs a big bet — folding is right ({rec}).",
  "原始赔率虽够，但这类弱/被压制的同花听命中常输大池（反向隐含赔率）或无位置面对大注 —— 弃牌正确（{rec}）。"
);
reg(
  "fb.draw.tail.reverse.wrong",
  "The raw odds are there, but a weak/dominated draw loses a big pot when it hits (reverse implied odds) or is out of position vs a big bet — the answer is {rec}.",
  "原始赔率虽够，但这类弱/被压制的同花听命中常输大池（反向隐含赔率）或无位置面对大注 —— 正确是 {rec}。"
);
reg(
  "fb.draw.tail.clears.ok",
  "{pct}% ≥ the {need}% needed, so continuing is clearly +EV ({rec}).",
  "{pct}% ≥ 所需 {need}%，继续是明确 +EV（{rec}）。"
);
reg(
  "fb.draw.tail.clears.wrong",
  "{pct}% ≥ the {need}% needed, so folding spills a +EV continue — the answer is {rec}.",
  "{pct}% ≥ 所需 {need}%，弃牌丢掉 +EV 的继续 —— 正确是 {rec}。"
);
reg(
  "fb.draw.tail.implied.ok",
  "The one-card {pct}% is short of {need}%, but implied odds plus semi-bluff fold equity favour continuing — {rec} is right.",
  "单张 {pct}% 虽不足 {need}%，但靠隐含赔率与半诈唬弃牌率 —— 继续（{rec}）。"
);
reg(
  "fb.draw.tail.implied.wrong",
  "The one-card {pct}% is short of {need}%, but implied odds plus semi-bluff fold equity favour continuing — the answer is {rec}.",
  "单张 {pct}% 虽不足 {need}%，但靠隐含赔率与半诈唬弃牌率 —— 正确是 {rec}。"
);

// 抓诈(MDF)
reg(
  "fb.bluffcatch.base",
  "You hold {cat} as a bluff-catcher; vs a polarized bet, MDF = 1−{bet}/{total} = {mdf}%, and you only need ~{need}% to call.",
  "你持{cat}作抓诈牌；对方下注极化，MDF = 1−{bet}/{total} = {mdf}%，只需约 {need}% 胜率即可跟。"
);
reg("fb.bluffcatch.call", "Calling is right.", "跟注正确。");
reg("fb.bluffcatch.fold", "Folding lets every bluff auto-profit — call.", "弃牌让对手诈唬自动盈利 —— 应跟。");
reg(
  "fb.bluffcatch.raise",
  "Raising turns a bluff-catcher into a bluff that only folds out worse — call.",
  "加注把抓诈牌变诈唬，只赶走更差 —— 应跟。"
);

// 强成牌
reg(
  "fb.strong.value.ok",
  "You have {cat} — {rec} for value and protection, charging worse hands and draws.",
  "你成{cat}，{rec}取价值并保护，向更差的牌与听牌收费。"
);
reg(
  "fb.strong.value.wrong",
  "You have {cat}; the passive line forfeits value and protection — the answer is {rec}.",
  "你成{cat}，被动打法损失价值与保护 —— 正确是 {rec}。"
);
reg(
  "fb.strong.line.ok",
  "You have {cat} — {rec} is the best line on this texture.",
  "你成{cat}，{rec} 是这手牌在该牌面的最佳线。"
);

// 弱成牌/空气面对下注
reg(
  "fb.weak.ok",
  "You only have {cat}; vs {bet} you need ~{need}%, but you mostly beat only bluffs and stay dominated when you improve → folding is right ({rec}).",
  "你只有{cat}，面对 {bet} 注需约 {need}% 胜率，而你基本只赢诈唬、命中也常被压制 → 弃牌正确（{rec}）。"
);
reg(
  "fb.weak.wrong",
  "You only have {cat}; vs {bet} you need ~{need}%, but you mostly beat only bluffs and stay dominated when you improve, so calling bleeds chips — the answer is {rec}.",
  "你只有{cat}，面对 {bet} 注需约 {need}% 胜率，而你基本只赢诈唬、命中也常被压制，跟注长期赔付 —— 正确是 {rec}。"
);
reg("fb.generic.ok", "{rec} is the best choice here.", "{rec} 是该局面的最佳选择。");

function applyI18n(root) {
  root = root || document;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  if (typeof document !== "undefined" && document) {
    document.title = t("app.title");
  }
}

/* boot:检测到的语言若是懒加载语言(ja/de/es),此刻还停在英文 —— 触发一次 setLang 把它切过去。
   走的是 setLang → ensureLocale 那条唯一路径;加载完 onLangChange() 会重绘。
   目前 SUPPORTED=['en','zh'] 全内联,本行 dormant;locale 文件落地并把语言加进 SUPPORTED 即生效。 */
try {
  if (_i18nWant !== LANG) setLang(_i18nWant);
} catch (e) {}
