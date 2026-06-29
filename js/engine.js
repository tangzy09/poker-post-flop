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
    const c1Len = getQuestions("c1").length;
    const c1Ids = new Set(getQuestions("c1").map((q) => q.id));
    this.store.reviewPile = (this.store.reviewPile || []).filter((r) => r.courseId !== "c1" || c1Ids.has(r.qid));
    const p1 = this.store.progress.c1;
    if (p1 && ((p1.total || 0) > c1Len || (p1.qDone || 0) > c1Len)) {
      p1.qDone = Math.min(p1.qDone || 0, c1Len);
      p1.correct = Math.min(p1.correct || 0, p1.qDone);
      p1.total = c1Len;
      p1.completed = !!p1.completed || p1.qDone >= c1Len;
      const s1 = this.store.statsByCourse.c1;
      if (s1 && (s1.h || 0) > c1Len) {
        const oldH = s1.h || 0;
        const oldC = s1.c || 0;
        const newH = Math.min(oldH, c1Len);
        const newC = Math.min(oldC, newH);
        this.store.stats.totalQ = Math.max(0, (this.store.stats.totalQ || 0) - (oldH - newH));
        this.store.stats.correctQ = Math.max(0, (this.store.stats.correctQ || 0) - (oldC - newC));
        s1.h = newH;
        s1.c = newC;
      }
    }
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

  feedbackFor(question, choice) {
    const fb = (question.feedback && (question.feedback[choice] || question.feedback._default)) || {};
    const conceptRaw = fb.concept || question.leak || "concept";
    return {
      reason: fb.reasonKey ? t(fb.reasonKey) : t("fb.generic.call_loose"),
      concept: tConcept(conceptRaw),
      ctx: question.ctxKey ? t(question.ctxKey) : "",
    };
  },

  recordAnswer(question, choice, result) {
    this.answers.push({ qid: question.id, choice, ok: result.ok });
    const cid = this.questionCourseId(question);

    if (this.testMode) {
      this.testResults.push({
        qid: question.id, courseId: question._courseId || cid, theme: question._theme,
        choice, ok: result.ok,
        leak: normalizeLeak(question.leak), street: question.spot?.street || "flop",
      });
      this.save();
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
