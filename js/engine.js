/* engine.js — course flow, grading, persistence */
const STORE_KEY = "pokerPostFlop_v1";
const STORE_KEY_LEGACY = "postflopCoach_v1";
/* 间隔重复(Leitner 盒):答对升盒,盒 n 的下次到期间隔 = SRS_INTERVALS[n];到 SRS_GRADUATE 移出(掌握)。答错回盒 0(立即到期)。 */
const SRS_INTERVALS = [0, 1, 3, 7].map((d) => d * 864e5);
const SRS_GRADUATE = 4;
const DAILY_SIZE = 10;
const GRADE_RANK = { S: 4, A: 3, B: 2, C: 1 };

/* 确定性组卷:同一天生成同一套每日训练题 */
function hashStr(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PLACEMENT_SPEC = [
  { theme: "flop", courseId: "c3", qid: "c3-q1" },
  { theme: "flop", courseId: "c3", qid: "c3-q2" },
  { theme: "flop", courseId: "c6", qid: "c6-q1" },
  { theme: "flop", courseId: "c6", qid: "c6-q3" },
  { theme: "odds", courseId: "c2", qid: "c2-q24" },
  { theme: "odds", courseId: "c7", qid: "c7-q1" },
  { theme: "odds", courseId: "c7", qid: "c7-q3" },
  { theme: "odds", courseId: "c2", qid: "c2-q4" },
  { theme: "turn", courseId: "c9", qid: "c9-q1" },
  { theme: "turn", courseId: "c9", qid: "c9-q2" },
  { theme: "turn", courseId: "c11", qid: "c11-q1" },
  { theme: "turn", courseId: "c18", qid: "c18-q3" },
  { theme: "river", courseId: "c10", qid: "c10-q3" },
  { theme: "river", courseId: "c10", qid: "c10-q5" },
  { theme: "river", courseId: "c10", qid: "c10-q6" },
  { theme: "river", courseId: "c24", qid: "c24-q12" },
  { theme: "advanced", courseId: "c20", qid: "c20-q1" },
  { theme: "advanced", courseId: "c25", qid: "c25-q1" },
  { theme: "advanced", courseId: "c12", qid: "c12-q2" },
  { theme: "advanced", courseId: "c23", qid: "c23-q1" },
];

function normalizeLeak(leak) {
  return leak || "other";
}

const Engine = {
  screen: "courses",
  courseId: null,
  learnIdx: 0,
  qIdx: 0,
  answers: [],
  reviewMode: false,
  reviewQueue: [],
  testMode: false,
  testQueue: [],
  testResults: [],
  dailyMode: false,
  dailyQueue: [],
  combo: 0,
  maxCombo: 0,
  sessionScore: 0,

  /* 可在测试中覆写的时钟 */
  _now() {
    return Date.now();
  },
  _dateStrAt(ms) {
    const d = new Date(ms);
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  },
  _todayStr() {
    return this._dateStrAt(this._now());
  },
  _resetScore() {
    this.combo = 0;
    this.maxCombo = 0;
    this.sessionScore = 0;
  },

  load() {
    try {
      const legacy = localStorage.getItem(STORE_KEY_LEGACY);
      if (legacy && !localStorage.getItem(STORE_KEY)) localStorage.setItem(STORE_KEY, legacy);
      const raw = localStorage.getItem(STORE_KEY);
      this.store = raw ? JSON.parse(raw) : this._defaultStore();
      this._migrateStore();
    } catch (e) {
      this.store = this._defaultStore();
    }
  },

  _migrateStore() {
    // 顶层字段兜底必须最先做:老版本/手改过的存档缺任一字段都会让下面的迁移抛
    // TypeError,而 load() 的 catch 会用默认 store 覆盖 —— 用户全部进度静默清零。
    if (!this.store.progress) this.store.progress = {};
    if (!this.store.stats) this.store.stats = { totalQ: 0, correctQ: 0, coursesDone: 0 };
    if (!this.store.reviewPile) this.store.reviewPile = [];
    if (!this.store.statsByCourse) this.store.statsByCourse = {};
    if (!this.store.statsByStreet) this.store.statsByStreet = {};
    if (!this.store.statsByLeak) this.store.statsByLeak = {};
    if (!this.store.trend) this.store.trend = [];
    if (this.store.seenIntro === undefined) {
      // 老用户(已有进度/摸底记录)不补弹新手引导
      this.store.seenIntro = Object.keys(this.store.progress || {}).length > 0 || !!this.store.placement;
    }
    if (!this.store.daily) this.store.daily = { lastDone: null, streakDays: 0, bestStreak: 0, history: {}, session: null };
    (this.store.reviewPile || []).forEach((r) => {
      if (!r.wrong) r.wrong = 1;
      r.leak = normalizeLeak(r.leak);
      // 旧版按连对次数掌握(streak);升级为 SRS 盒:旧 streak 映射为盒号,全部立即到期一次
      if (r.box === undefined) {
        r.box = Math.min(r.streak || 0, SRS_GRADUATE - 1);
        r.due = 0;
        delete r.streak;
      }
    });
    delete this.store.leaks;
    for (const c of COURSES) {
      const p = this.store.progress[c.id];
      if (p && p.total && !(this.store.statsByCourse[c.id] && this.store.statsByCourse[c.id].h)) {
        this.store.statsByCourse[c.id] = { h: p.total, c: p.correct || 0 };
      }
    }
    // c1 改造为初始测试:清理旧的 c1 答题课数据
    delete this.store.progress.c1;
    delete this.store.statsByCourse.c1;
    this.store.reviewPile = (this.store.reviewPile || []).filter((r) => r.courseId !== "c1");
    if (this.store.stats.coursesDoneList) {
      this.store.stats.coursesDoneList = this.store.stats.coursesDoneList.filter((c) => c !== "c1");
      this.store.stats.coursesDone = this.store.stats.coursesDoneList.length;
    }
    if (this.store.placement === undefined) this.store.placement = null;
    if (this.store.onboardingSeen === undefined) this.store.onboardingSeen = false;
  },

  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.store));
      this._saveWarned = false;
    } catch (e) {
      // 存储满/隐私模式:进度写不进去,再静默用户会以为答了都算数 —— 提示一次
      if (!this._saveWarned) {
        this._saveWarned = true;
        try {
          if (typeof alert === "function") alert(t("err.saveFailed"));
        } catch (e2) {}
      }
    }
  },

  _defaultStore() {
    return {
      progress: {},
      reviewPile: [],
      stats: { totalQ: 0, correctQ: 0, coursesDone: 0 },
      statsByCourse: {},
      statsByStreet: {},
      statsByLeak: {},
      trend: [],
      placement: null,
      onboardingSeen: false,
      seenIntro: false,
      daily: { lastDone: null, streakDays: 0, bestStreak: 0, history: {}, session: null },
    };
  },

  /* —— SRS 到期查询 —— */
  dueReviewItems() {
    const now = this._now();
    return this.store.reviewPile.filter((r) => (r.due || 0) <= now);
  },
  dueReviewCount() {
    return this.dueReviewItems().length;
  },
  nextDueAt() {
    const now = this._now();
    const later = this.store.reviewPile.map((r) => r.due || 0).filter((d) => d > now);
    return later.length ? Math.min(...later) : null;
  },

  questionCourseId(question) {
    return question._courseId || this.courseId;
  },

  getProgress(courseId) {
    return this.store.progress[courseId] || { learnDone: false, qDone: 0, correct: 0, total: 0, completed: false };
  },

  setProgress(courseId, patch) {
    this.store.progress[courseId] = Object.assign(this.getProgress(courseId), patch);
    this.save();
  },

  startCourse(courseId, mode) {
    this.courseId = courseId;
    this.learnIdx = 0;
    this.qIdx = 0;
    this.answers = [];
    this.reviewMode = false;
    this.testMode = false;
    this.testQueue = [];
    this.dailyMode = false;
    this.dailyQueue = [];
    this._resetScore();
    const p = this.getProgress(courseId);
    if (mode === "learn") {
      this.screen = "learn";
      return;
    }
    if (mode === "drill") {
      this.screen = "drill";
      // 钳制:旧版存档可能带 completed:false 且 qDone>0(甚至超过缩水后的题数)
      this.qIdx = p.completed ? 0 : Math.min(p.qDone || 0, Math.max(0, getQuestions(courseId).length - 1));
      return;
    }
    // First visit: start with lessons.
    this.screen = "learn";
  },

  currentQuestions() {
    if (this.testMode) return this.testQueue;
    if (this.dailyMode) return this.dailyQueue;
    if (this.reviewMode) return this.reviewQueue;
    return getQuestions(this.courseId);
  },

  grade(question, choice) {
    const correct = question.correct || [];
    const ok = correct.includes(choice);
    return { ok, grade: ok ? "best" : "wrong" };
  },

  feedbackFor(question, choice, ok) {
    const fb = (question.feedback && (question.feedback[choice] || question.feedback._default)) || {};
    const conceptRaw = fb.concept || question.leak || "concept";
    const computed = (typeof explainFeedback === "function") ? explainFeedback(question, choice, ok) : null;
    const fallback = fb.reasonKey ? t(fb.reasonKey) : (ok ? t("fb.generic.ok") : t("fb.generic.call_loose"));
    return {
      reason: computed || fallback,
      concept: tConcept(conceptRaw),
      ctx: question.ctxKey ? t(question.ctxKey) : "",
      ok: ok,
    };
  },

  recordAnswer(question, choice, result) {
    this.answers.push({ qid: question.id, choice, ok: result.ok });
    const cid = this.questionCourseId(question);

    if (this.testMode) {
      this.testResults.push({
        qid: question.id, courseId: question._courseId || cid, theme: question._theme,
        choice, ok: result.ok, correct: question.correct,
        leak: normalizeLeak(question.leak), street: question.spot?.street || "flop",
      });
      return;
    }

    if (!this.reviewMode) {
      this.store.stats.totalQ++;
      if (result.ok) this.store.stats.correctQ++;
      if (cid) {
        if (!this.store.statsByCourse[cid]) this.store.statsByCourse[cid] = { h: 0, c: 0 };
        this.store.statsByCourse[cid].h++;
        if (result.ok) this.store.statsByCourse[cid].c++;
      }
      const street = question.spot?.street || (question.type === "choice" ? "concept" : "flop");
      if (!this.store.statsByStreet[street]) this.store.statsByStreet[street] = { h: 0, c: 0 };
      this.store.statsByStreet[street].h++;
      if (result.ok) this.store.statsByStreet[street].c++;
      if (!this.store.statsByLeak) this.store.statsByLeak = {};
      this._tally(this.store.statsByLeak, normalizeLeak(question.leak), result.ok);
      // 按天记录准确率趋势(正常训练+每日;复习/测试不计),保留最近 180 天
      const dk = this._todayStr();
      if (!this.store.trend) this.store.trend = [];
      let te = this.store.trend[this.store.trend.length - 1];
      if (!te || te.d !== dk) {
        te = { d: dk, h: 0, c: 0 };
        this.store.trend.push(te);
        if (this.store.trend.length > 180) this.store.trend.shift();
      }
      te.h++;
      if (result.ok) te.c++;
    }

    // 连击计分:答对 10 + 连击加成(最多 +5);答错清零连击
    if (result.ok) {
      this.combo = (this.combo || 0) + 1;
      this.maxCombo = Math.max(this.maxCombo || 0, this.combo);
      this.sessionScore = (this.sessionScore || 0) + 10 + Math.min(this.combo - 1, 5);
    } else {
      this.combo = 0;
    }

    if (!result.ok) {
      if (question._rec) {
        // 复习/每日队列里的错题:回盒 0,立即到期
        question._rec.box = 0;
        question._rec.due = this._now();
        question._rec.choice = choice;
        question._rec.wrong = (question._rec.wrong || 1) + 1;
        question._rec.leak = normalizeLeak(question.leak || question._rec.leak);
      } else if (!this.reviewMode && cid) {
        const existing = this.store.reviewPile.find((r) => r.qid === question.id && r.courseId === cid);
        if (existing) {
          existing.box = 0;
          existing.due = this._now();
          existing.choice = choice;
          existing.wrong = (existing.wrong || 1) + 1;
          existing.leak = normalizeLeak(question.leak || existing.leak);
        } else {
          this.store.reviewPile.push({
            courseId: cid,
            qid: question.id,
            choice,
            box: 0,
            due: this._now(),
            wrong: 1,
            leak: normalizeLeak(question.leak),
          });
        }
      }
    }

    // 每日训练:持久化会话,刷新后可续答
    if (this.dailyMode && this.store.daily && this.store.daily.session) {
      this.store.daily.session.answers = this.answers.slice();
    }
    this.save();
  },

  finishLearn() {
    this.setProgress(this.courseId, { learnDone: true });
    this.screen = "drill";
    this.qIdx = 0;
  },

  gradeLetter(correct, total) {
    const pct = total ? correct / total : 0;
    return pct >= 1 ? "S" : pct >= 0.9 ? "A" : pct >= 0.75 ? "B" : "C";
  },

  finishDrill() {
    if (this.screen === "over") return; // 重入守卫:重复触发会用空 answers 把成绩覆盖成 0
    const qs = getQuestions(this.courseId);
    const correct = this.answers.filter((a) => a.ok).length;
    const grade = this.gradeLetter(correct, qs.length);
    const prevGrade = this.getProgress(this.courseId).grade;
    this.drillSummary = { score: this.sessionScore || 0, maxCombo: this.maxCombo || 0, grade };
    this.setProgress(this.courseId, {
      qDone: qs.length,
      correct,
      total: qs.length,
      completed: true,
      // 课程卡上展示历史最佳评级
      grade: prevGrade && GRADE_RANK[prevGrade] >= GRADE_RANK[grade] ? prevGrade : grade,
    });
    if (!this.store.stats.coursesDoneList) this.store.stats.coursesDoneList = [];
    if (!this.store.stats.coursesDoneList.includes(this.courseId)) {
      this.store.stats.coursesDoneList.push(this.courseId);
      this.store.stats.coursesDone = this.store.stats.coursesDoneList.length;
    }
    this.screen = "over";
    this.save();
  },

  startPlacementTest(rng) {
    const rand = rng || Math.random;
    const queue = PLACEMENT_SPEC.map((s) => {
      const q = getQuestions(s.courseId).find((x) => x.id === s.qid);
      return q ? Object.assign({}, q, { _courseId: s.courseId, _theme: s.theme }) : null;
    }).filter(Boolean);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    this.testQueue = queue;
    this.testResults = [];
    this.testMode = true;
    this.reviewMode = false;
    this.dailyMode = false;
    this.dailyQueue = [];
    this._resetScore();
    this.courseId = "c1";
    this.qIdx = 0;
    this.answers = [];
    this.screen = "drill";
    this.save();
  },

  _placementStartCourse: { flop: "c3", odds: "c2", turn: "c9", river: "c10", advanced: "c13" },

  _tally(map, key, ok) {
    const m = (map[key] = map[key] || { h: 0, c: 0 });
    m.h++;
    if (ok) m.c++;
  },

  finishPlacementTest(takenAt) {
    if (!this.testMode) return; // 重入守卫
    const res = this.testResults;
    const total = res.length;
    const score = res.filter((r) => r.ok).length;
    const byTheme = {}, byLeak = {};
    for (const r of res) {
      this._tally(byTheme, r.theme, r.ok);
      if (!r.ok) byLeak[r.leak] = (byLeak[r.leak] || 0) + 1;
    }
    let weakestTheme = null, worst = 2;
    for (const t of Object.keys(byTheme)) {
      const acc = byTheme[t].c / byTheme[t].h;
      if (acc < worst) { worst = acc; weakestTheme = t; }
    }
    const prev = (this.store.placement && this.store.placement.history) || [];
    this.store.placement = {
      takenAt: takenAt || 0,
      score, total,
      byTheme, byLeak,
      weakestTheme,
      startCourse: this._placementStartCourse[weakestTheme] || "c2",
      results: res.slice(),
      history: prev.concat([{ takenAt: takenAt || 0, score }]),
    };
    this.testMode = false;
    this.testQueue = [];
    this.screen = "placement-result";
    this.save();
  },

  placementPseudoStore(results) {
    const statsByCourse = {}, statsByStreet = {}, reviewPile = [];
    for (const r of results) {
      this._tally(statsByCourse, r.courseId, r.ok);
      this._tally(statsByStreet, r.street, r.ok);
      if (!r.ok) reviewPile.push({ courseId: r.courseId, qid: r.qid, leak: r.leak, choice: r.choice, box: 0, due: 0, wrong: 1 });
    }
    return { statsByCourse, statsByStreet, reviewPile, stats: { totalQ: results.length, correctQ: results.filter((x) => x.ok).length, coursesDone: 0 }, progress: {} };
  },

  /* —— 每日训练 —— */
  _dailyPool() {
    return COURSES.filter((c) => !c.placement && (typeof canAccessCourse !== "function" || canAccessCourse(c)));
  },

  buildDailySet(dateStr) {
    const rng = mulberry32(hashStr(dateStr));
    const picked = [];
    const seen = new Set();
    const add = (q, courseId, rec) => {
      if (!q || seen.has(courseId + "|" + q.id)) return false;
      seen.add(courseId + "|" + q.id);
      picked.push(Object.assign({}, q, { _courseId: courseId }, rec ? { _rec: rec } : {}));
      return true;
    };
    // 1) 到期复习题优先(最多 4 道,先到期先出)
    const due = this.dueReviewItems()
      .slice()
      .sort((a, b) => (a.due || 0) - (b.due || 0) || (a.qid < b.qid ? -1 : 1));
    for (const r of due) {
      if (picked.length >= 4) break;
      const q = getQuestions(r.courseId).find((x) => x.id === r.qid);
      add(q, r.courseId, r);
    }
    // 2) 弱项课(样本 ≥8、准确率最低的 2 门课,各抽 2 道)
    const pool = this._dailyPool();
    const weak = pool
      .filter((c) => {
        const s = this.store.statsByCourse[c.id];
        return s && s.h >= 8;
      })
      .sort((a, b) => {
        const sa = this.store.statsByCourse[a.id], sb = this.store.statsByCourse[b.id];
        return sa.c / sa.h - sb.c / sb.h;
      })
      .slice(0, 2);
    for (const c of weak) {
      const qs = getQuestions(c.id);
      let got = 0, tries = 0;
      while (got < 2 && tries++ < 40 && qs.length) {
        if (add(qs[Math.floor(rng() * qs.length)], c.id)) got++;
      }
    }
    // 3) 随机补满
    let guard = 0;
    while (picked.length < DAILY_SIZE && guard++ < 400) {
      const c = pool[Math.floor(rng() * pool.length)];
      const qs = getQuestions(c.id);
      if (!qs.length) continue;
      add(qs[Math.floor(rng() * qs.length)], c.id);
    }
    return picked;
  },

  startDaily() {
    const today = this._todayStr();
    const yesterday = this._dateStrAt(this._now() - 864e5);
    const d = this.store.daily;
    // 昨晚开卷答了一部分、跨午夜回来:继续旧卷(完成时记到开卷日),不静默弃卷
    const resumable =
      d.session && d.session.qids &&
      (d.session.date === today ||
        (d.session.date === yesterday && (d.session.answers || []).length > 0));
    let queue;
    if (resumable) {
      // 当日已有会话:按记录的题目列表重建,支持刷新续答
      queue = d.session.qids
        .map((k) => {
          const i = k.indexOf("|");
          const cid = k.slice(0, i), qid = k.slice(i + 1);
          const q = getQuestions(cid).find((x) => x.id === qid);
          if (!q) return null;
          const rec = this.store.reviewPile.find((r) => r.courseId === cid && r.qid === qid);
          return Object.assign({}, q, { _courseId: cid }, rec ? { _rec: rec } : {});
        })
        .filter(Boolean);
    } else {
      queue = this.buildDailySet(today);
      d.session = { date: today, qids: queue.map((q) => q._courseId + "|" + q.id), answers: [] };
    }
    this.dailyMode = true;
    this.reviewMode = false;
    this.testMode = false;
    this.dailyQueue = queue;
    this.answers = ((d.session && d.session.answers) || []).slice();
    this.qIdx = this.answers.length;
    // 续答时按已答记录重算连击与得分
    this._resetScore();
    for (const a of this.answers) {
      if (a.ok) {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.sessionScore += 10 + Math.min(this.combo - 1, 5);
      } else this.combo = 0;
    }
    this.courseId = queue[0] ? queue[0]._courseId : null;
    if (!queue.length) {
      // 空队列(题库变更的极端情况):不结算、不计打卡,回课程页
      this.dailyMode = false;
      this.store.daily.session = null;
      this.screen = "courses";
      this.save();
      return;
    }
    if (this.qIdx >= queue.length) {
      this.finishDaily();
      return;
    }
    this.screen = "drill";
    this.save();
  },

  finishDaily() {
    if (!this.dailyMode) return; // 重入守卫
    const d = this.store.daily;
    // 成绩与打卡锚定「开卷日」:23:55 开卷 00:05 答完仍算开卷那天,streak 不被跨午夜冤枉清零
    const day = (d.session && d.session.date) || this._todayStr();
    const correct = this.answers.filter((a) => a.ok).length;
    const total = this.answers.length;
    d.history[day] = { c: correct, t: total };
    if (d.lastDone !== day) {
      // day 的前一天(用正午锚点解析,避开时区/夏令时边界)
      const dayBefore = this._dateStrAt(new Date(day + "T12:00:00").getTime() - 864e5);
      d.streakDays = d.lastDone === dayBefore ? (d.streakDays || 0) + 1 : 1;
      d.bestStreak = Math.max(d.bestStreak || 0, d.streakDays);
      d.lastDone = day;
    }
    // 历史只留最近 60 天
    const keys = Object.keys(d.history).sort();
    while (keys.length > 60) delete d.history[keys.shift()];
    d.session = null;
    this.dailySummary = {
      correct,
      total,
      pct: total ? Math.round((correct / total) * 100) : 0,
      score: this.sessionScore || 0,
      maxCombo: this.maxCombo || 0,
      streakDays: d.streakDays,
      bestStreak: d.bestStreak,
    };
    this.dailyMode = false;
    this.dailyQueue = [];
    this.qIdx = 0;
    this.answers = [];
    this.screen = "daily-over";
    this.save();
  },

  dailyStatus() {
    const d = this.store.daily || {};
    const today = this._todayStr();
    const yesterday = this._dateStrAt(this._now() - 864e5);
    // 断签展示:昨天和今天都没做 → 连续天数归零
    let streak = d.streakDays || 0;
    if (d.lastDone !== today && d.lastDone !== yesterday) streak = 0;
    // 进行中的会话:今天的,或昨晚未答完的(可续,见 startDaily)
    const sess =
      d.session && (d.session.date === today || (d.session.date === yesterday && (d.session.answers || []).length > 0))
        ? d.session
        : null;
    return {
      doneToday: d.lastDone === today,
      streakDays: streak,
      bestStreak: d.bestStreak || 0,
      answered: sess ? (sess.answers || []).length : 0,
      size: DAILY_SIZE,
      todayScore: (d.history || {})[today] || null,
    };
  },

  startReview(filter) {
    this.reviewFilter = filter || null;
    if (this.screen === "stats") this.reviewReturnTo = "stats";
    else if (this.screen === "review") this.reviewReturnTo = "review";
    else this.reviewReturnTo = "courses";
    const wantLeak = filter?.leak ? normalizeLeak(filter.leak) : null;
    // 默认(无筛选)只复习到期题;定向筛选(某课/某漏洞)或 {all:true} 不受排程限制
    const dueOnly = !filter || (!filter.all && !filter.courseId && !filter.leak);
    const now = this._now();
    const pile = this.store.reviewPile.filter((r) => {
      if (filter?.courseId && r.courseId !== filter.courseId) return false;
      if (wantLeak && normalizeLeak(r.leak) !== wantLeak) return false;
      if (dueOnly && (r.due || 0) > now) return false;
      return true;
    });
    this.reviewQueue = pile
      .map((r) => {
        const q = getQuestions(r.courseId).find((x) => x.id === r.qid);
        return q ? Object.assign({}, q, { _courseId: r.courseId, _rec: r }) : null;
      })
      .filter(Boolean);
    if (!this.reviewQueue.length) {
      this.screen = "review-empty";
      return;
    }
    this.reviewMode = true;
    this.dailyMode = false;
    this.dailyQueue = [];
    this.testMode = false;
    this.testQueue = [];
    this._resetScore();
    this.courseId = this.reviewQueue[0]._courseId;
    this.qIdx = 0;
    this.answers = [];
    this.reviewSummary = null;
    this.reviewSessionMastered = 0;
    this.screen = "drill";
  },

  finishReviewSession() {
    if (!this.reviewMode) return; // 重入守卫
    const correct = this.answers.filter((a) => a.ok).length;
    const total = this.answers.length;
    this.reviewSummary = {
      correct,
      total,
      pct: total ? Math.round((correct / total) * 100) : 0,
      remaining: this.store.reviewPile.length,
      mastered: this.reviewSessionMastered || 0,
    };
    this.reviewMode = false;
    this.reviewQueue = [];
    this.qIdx = 0;
    this.answers = [];
    this.screen = "review-over";
    this.save();
  },

  exitReviewFlow() {
    const returnTo = this.reviewReturnTo || "courses";
    this.reviewMode = false;
    this.reviewQueue = [];
    this.reviewFilter = null;
    this.reviewReturnTo = null;
    this.reviewSummary = null;
    this.reviewSessionMastered = 0;
    this.qIdx = 0;
    this.answers = [];
    this.screen = returnTo;
    this.save();
  },

  finishReview() {
    this.finishReviewSession();
  },

  removeFromPile(rec) {
    this.store.reviewPile = this.store.reviewPile.filter(
      (r) => !(r.qid === rec.qid && r.courseId === rec.courseId)
    );
    this.save();
  },

  onReviewCorrect(rec) {
    rec.box = (rec.box || 0) + 1;
    if (rec.box >= SRS_GRADUATE) {
      this.store.reviewPile = this.store.reviewPile.filter((r) => !(r.qid === rec.qid && r.courseId === rec.courseId));
      this.reviewSessionMastered = (this.reviewSessionMastered || 0) + 1;
    } else {
      rec.due = this._now() + SRS_INTERVALS[rec.box];
    }
    this.save();
  },

  accuracy(courseId) {
    const p = this.getProgress(courseId);
    if (!p.total) return null;
    return Math.round((p.correct / p.total) * 100);
  },

  overallAccuracy() {
    const s = this.store.stats;
    if (!s.totalQ) return 0;
    return Math.round((s.correctQ / s.totalQ) * 100);
  },
};

Engine.load();
