/* engine.js — course flow, grading, persistence */
const STORE_KEY = "pokerPostFlop_v1";
const STORE_KEY_LEGACY = "postflopCoach_v1";
const MASTER_STREAK = 2;

const Engine = {
  screen: "courses",
  courseId: null,
  learnIdx: 0,
  qIdx: 0,
  answers: [],
  reviewMode: false,
  reviewQueue: [],

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
    if (!this.store.leaks) this.store.leaks = {};
    (this.store.reviewPile || []).forEach((r) => {
      if (!r.wrong) r.wrong = 1;
    });
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
      leaks: {},
    };
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
      concept: t(conceptRaw),
      ctx: question.ctxKey ? t(question.ctxKey) : "",
    };
  },

  recordAnswer(question, choice, result) {
    this.answers.push({ qid: question.id, choice, ok: result.ok });
    this.store.stats.totalQ++;
    if (result.ok) this.store.stats.correctQ++;

    const cid = this.courseId || question._courseId;
    if (cid) {
      if (!this.store.statsByCourse[cid]) this.store.statsByCourse[cid] = { h: 0, c: 0 };
      this.store.statsByCourse[cid].h++;
      if (result.ok) this.store.statsByCourse[cid].c++;
    }
    const street = question.spot?.street || (question.type === "choice" ? "concept" : "flop");
    if (!this.store.statsByStreet[street]) this.store.statsByStreet[street] = { h: 0, c: 0 };
    this.store.statsByStreet[street].h++;
    if (result.ok) this.store.statsByStreet[street].c++;

    if (!result.ok) {
      this.addMistake(question, choice);
      if (!this.reviewMode) {
        const existing = this.store.reviewPile.find((r) => r.qid === question.id && r.courseId === cid);
        if (existing) {
          existing.streak = 0;
          existing.choice = choice;
          existing.wrong = (existing.wrong || 1) + 1;
        } else {
          this.store.reviewPile.push({
            courseId: cid,
            qid: question.id,
            choice,
            streak: 0,
            wrong: 1,
            leak: question.leak,
          });
        }
      }
    }
    const leak = question.leak || "other";
    if (!result.ok) {
      this.store.leaks[leak] = (this.store.leaks[leak] || 0) + 1;
    }
    this.save();
  },

  addMistake(question, choice) {
    /* recorded in reviewPile */
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

  startReview(filter) {
    this.reviewFilter = filter || null;
    const pile = this.store.reviewPile.filter((r) => {
      if (filter?.courseId && r.courseId !== filter.courseId) return false;
      if (filter?.leak && r.leak !== filter.leak) return false;
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
    this.screen = "drill";
  },

  onReviewCorrect(rec) {
    rec.streak = (rec.streak || 0) + 1;
    if (rec.streak >= MASTER_STREAK) {
      this.store.reviewPile = this.store.reviewPile.filter((r) => !(r.qid === rec.qid && r.courseId === rec.courseId));
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
