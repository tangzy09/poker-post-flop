/* engine.js — course flow, grading, persistence */
const STORE_KEY = "pokerPostFlop_v1";
const STORE_KEY_LEGACY = "postflopCoach_v1";
const MASTER_STREAK = 2;

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
    if (!this.store.statsByCourse) this.store.statsByCourse = {};
    if (!this.store.statsByStreet) this.store.statsByStreet = {};
    (this.store.reviewPile || []).forEach((r) => {
      if (!r.wrong) r.wrong = 1;
      r.leak = normalizeLeak(r.leak);
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
    } catch (e) {}
  },

  _defaultStore() {
    return {
      progress: {},
      reviewPile: [],
      stats: { totalQ: 0, correctQ: 0, coursesDone: 0 },
      statsByCourse: {},
      statsByStreet: {},
      placement: null,
      onboardingSeen: false,
    };
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
    const p = this.getProgress(courseId);
    if (mode === "learn") {
      this.screen = "learn";
      return;
    }
    if (mode === "drill") {
      this.screen = "drill";
      this.qIdx = p.completed ? 0 : p.qDone || 0;
      return;
    }
    // First visit: start with lessons.
    this.screen = "learn";
  },

  currentQuestions() {
    if (this.testMode) return this.testQueue;
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
    }

    if (!result.ok) {
      if (this.reviewMode && question._rec) {
        question._rec.streak = 0;
        question._rec.choice = choice;
        question._rec.wrong = (question._rec.wrong || 1) + 1;
      } else if (!this.reviewMode && cid) {
        const existing = this.store.reviewPile.find((r) => r.qid === question.id && r.courseId === cid);
        if (existing) {
          existing.streak = 0;
          existing.choice = choice;
          existing.wrong = (existing.wrong || 1) + 1;
          existing.leak = normalizeLeak(question.leak || existing.leak);
        } else {
          this.store.reviewPile.push({
            courseId: cid,
            qid: question.id,
            choice,
            streak: 0,
            wrong: 1,
            leak: normalizeLeak(question.leak),
          });
        }
      }
    }
    this.save();
  },

  finishLearn() {
    this.setProgress(this.courseId, { learnDone: true });
    this.screen = "drill";
    this.qIdx = 0;
  },

  finishDrill() {
    const qs = getQuestions(this.courseId);
    const correct = this.answers.filter((a) => a.ok).length;
    this.setProgress(this.courseId, {
      qDone: qs.length,
      correct,
      total: qs.length,
      completed: true,
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
      if (!r.ok) reviewPile.push({ courseId: r.courseId, qid: r.qid, leak: r.leak, choice: r.choice, streak: 0, wrong: 1 });
    }
    return { statsByCourse, statsByStreet, reviewPile, stats: { totalQ: results.length, correctQ: results.filter((x) => x.ok).length, coursesDone: 0 }, progress: {} };
  },

  startReview(filter) {
    this.reviewFilter = filter || null;
    if (this.screen === "stats") this.reviewReturnTo = "stats";
    else if (this.screen === "review") this.reviewReturnTo = "review";
    else this.reviewReturnTo = "courses";
    const wantLeak = filter?.leak ? normalizeLeak(filter.leak) : null;
    const pile = this.store.reviewPile.filter((r) => {
      if (filter?.courseId && r.courseId !== filter.courseId) return false;
      if (wantLeak && normalizeLeak(r.leak) !== wantLeak) return false;
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
    this.courseId = this.reviewQueue[0]._courseId;
    this.qIdx = 0;
    this.answers = [];
    this.reviewSummary = null;
    this.reviewSessionMastered = 0;
    this.screen = "drill";
  },

  finishReviewSession() {
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
    rec.streak = (rec.streak || 0) + 1;
    if (rec.streak >= MASTER_STREAK) {
      this.store.reviewPile = this.store.reviewPile.filter((r) => !(r.qid === rec.qid && r.courseId === rec.courseId));
      this.reviewSessionMastered = (this.reviewSessionMastered || 0) + 1;
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
