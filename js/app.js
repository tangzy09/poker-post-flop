/* app.js — UI boot & screens */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let _choiceOrderKey = null;
let _choiceOrderOpts = null;
let _choiceShuffleEpoch = 0;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resetChoiceShuffle() {
  _choiceShuffleEpoch++;
  _choiceOrderKey = null;
}

function displayChoiceOptions(q) {
  const key =
    _choiceShuffleEpoch +
    "|" +
    (Engine.reviewMode ? "r" : Engine.courseId || "") +
    "|" +
    Engine.qIdx +
    "|" +
    q.id;
  if (_choiceOrderKey !== key) {
    _choiceOrderKey = key;
    _choiceOrderOpts = shuffleArray(q.options.slice());
  }
  return _choiceOrderOpts;
}

function render() {
  const root = $("#screens");
  if (!root) return;

  switch (Engine.screen) {
    case "courses":
      root.innerHTML = renderCourses();
      break;
    case "learn":
      root.innerHTML = renderLearn();
      break;
    case "drill":
      root.innerHTML = renderDrill();
      break;
    case "feedback":
      root.innerHTML = renderFeedback();
      break;
    case "over":
      root.innerHTML = renderOver();
      break;
    case "review-empty":
      root.innerHTML = renderReviewEmpty();
      break;
    case "review":
      root.innerHTML = renderReviewDetail();
      break;
    case "review-over":
      root.innerHTML = renderReviewOver();
      break;
    case "stats":
      root.innerHTML = renderStats();
      break;
    case "placement-result":
      root.innerHTML = renderPlacementResult();
      break;
    case "daily-over":
      root.innerHTML = renderDailyOver();
      break;
    default:
      root.innerHTML = renderCourses();
  }

  applyI18n(document);
  bindEvents();
}

function renderDailyCard() {
  const ds = Engine.dailyStatus();
  const flame = ds.streakDays > 0 ? ' <span class="daily-flame">🔥 ' + t("daily.streak", { n: ds.streakDays }) + "</span>" : "";
  let sub, btn;
  if (ds.doneToday) {
    const sc = ds.todayScore;
    sub = t("daily.doneLine", { c: sc ? sc.c : 0, t: sc ? sc.t : ds.size });
    btn = '<button class="btn secondary" data-action="start-daily">' + t("daily.retake") + "</button>";
  } else if (ds.answered > 0) {
    sub = t("daily.progressLine", { a: ds.answered, s: ds.size });
    btn = '<button class="btn primary" data-action="start-daily">' + t("daily.continue") + "</button>";
  } else {
    sub = t("daily.cardSub", { n: ds.size });
    btn = '<button class="btn primary" data-action="start-daily">' + t("daily.start") + "</button>";
  }
  return (
    '<article class="course-card daily-card' + (ds.doneToday ? " done" : "") + '">' +
    '<div class="cc-head"><span class="badge daily-badge">📅 ' + t("daily.badge") + "</span>" +
    (ds.doneToday ? '<span class="badge done-badge">' + t("daily.doneBadge") + "</span>" : "") +
    "</div>" +
    "<h3>" + t("daily.title") + flame + "</h3>" +
    '<p class="cc-sub">' + sub + "</p>" +
    btn +
    "</article>"
  );
}

function renderCourses() {
  const noProgress = Object.keys(Engine.store.progress || {}).length === 0;
  let cards = "";
  if (!Engine.store.onboardingSeen && noProgress && !Engine.store.placement) {
    cards += `<div class="onboard-banner">${t("placement.onboard")}
      <button class="btn" data-action="onboard-start">${t("placement.start")}</button>
      <button data-action="onboard-dismiss">${t("placement.later")}</button></div>`;
  }
  cards += renderDailyCard();
  COURSES.forEach((c) => {
    if (c.placement) {
      const p = Engine.store.placement;
      const last = p ? " · " + t("placement.scoreLine", { c: p.score, t: p.total }) : "";
      cards += `<button class="course-card placement-card" data-action="start-placement">
        <div class="course-title">🎯 ${t(c.titleKey)}</div>
        <div class="course-sub">${t(c.subKey)}${last}</div>
      </button>`;
      return;
    }
    const p = Engine.getProgress(c.id);
    const qs = getQuestions(c.id).length;
    const locked = !canAccessCourse(c);
    const acc = Engine.accuracy(c.id);
    const badge = c.free ? t("course.free") : t("course.pro");
    const badgeCls = c.free ? "free" : "pro";
    let actions;
    if (locked) {
      actions = '<p class="cc-lock">' + t("course.locked") + "</p>";
    } else if (p.learnDone) {
      actions =
        '<div class="btn-row">' +
        '<button class="btn secondary" data-action="start-learn" data-id="' + c.id + '">' + t("course.reviewLearn") + "</button>" +
        '<button class="btn primary" data-action="start-drill" data-id="' + c.id + '">' + t("course.practice") + "</button>" +
        "</div>";
    } else {
      actions = '<button class="btn primary" data-action="start-course" data-id="' + c.id + '">' + t("course.start") + "</button>";
    }

    cards += (
      '<article class="course-card' + (locked ? " locked" : "") + (p.completed ? " done" : "") + '">' +
      '<div class="cc-head">' +
      '<span class="cc-num">' + c.order + "</span>" +
      '<span class="badge ' + badgeCls + '">' + badge + "</span>" +
      (p.completed ? '<span class="badge done-badge">' + t("course.completed") + "</span>" : "") +
      (p.grade ? '<span class="badge grade-badge grade-' + p.grade + '">' + p.grade + "</span>" : "") +
      "</div>" +
      "<h3>" + t(c.titleKey) + "</h3>" +
      '<p class="cc-sub">' + t(c.subKey) + "</p>" +
      '<p class="cc-meta">' + t("course.questions", { n: qs }) +
      (acc != null ? " · " + t("course.accuracy", { pct: acc }) : "") +
      "</p>" +
      actions +
      "</article>"
    );
  });

  const dueN = Engine.dueReviewCount();
  return (
    '<section class="screen courses-screen">' +
    '<header class="page-head">' +
    "<h2>" + t("nav.courses") + "</h2>" +
    '<p class="muted">' + t("app.subtitle") + "</p>" +
    "</header>" +
    '<div class="course-grid">' + cards + "</div>" +
    bottomNav("courses", dueN) +
    "</section>"
  );
}

function bottomNav(active, reviewN) {
  const tab = (id, label, extra) =>
    '<button class="nav-btn' + (id === active ? " active" : "") + '" data-nav="' + id + '">' + label + (extra || "") + "</button>";
  return (
    '<nav class="bottom-nav">' +
    tab("courses", t("nav.courses")) +
    tab("review", t("nav.review"), reviewN ? ' <span class="pill">' + reviewN + "</span>" : "") +
    tab("stats", t("nav.stats")) +
    "</nav>"
  );
}

function renderLearn() {
  const slides = getLearn(Engine.courseId);
  const slide = slides[Engine.learnIdx];
  const course = courseById(Engine.courseId);
  const isLast = Engine.learnIdx >= slides.length - 1;

  return (
    '<section class="screen learn-screen">' +
    '<button class="back-btn" data-action="back-courses">←</button>' +
    '<p class="eyebrow">' + t(course.titleKey) + " · " + t("learn.title") + "</p>" +
    "<h2>" + t(slide.titleKey) + "</h2>" +
    '<div class="learn-body' + (slide.summary ? " learn-summary" : "") + '">' + t(slide.bodyKey) + "</div>" +
    (slide.rangeChart ? '<div id="range-chart-mount" class="range-chart-mount"></div>' : "") +
    '<p class="slide-pager">' + t("learn.slide", { n: Engine.learnIdx + 1, total: slides.length }) + "</p>" +
    '<div class="btn-stack">' +
    '<button class="btn primary" data-action="' + (isLast ? "finish-learn" : "next-learn") + '">' +
    (isLast ? t("learn.startDrill") : t("learn.next")) +
    "</button></div></section>"
  );
}

function renderDrill() {
  const qs = Engine.currentQuestions();
  const q = qs[Engine.qIdx];
  if (!q) {
    if (Engine.testMode) Engine.finishPlacementTest(Date.now());
    else if (Engine.dailyMode) Engine.finishDaily();
    else if (Engine.reviewMode) Engine.finishReviewSession();
    else Engine.finishDrill();
    render();
    return "";
  }

  const drillCourseId = q._courseId || Engine.courseId;
  const course = courseById(drillCourseId);
  const p = Engine.getProgress(drillCourseId);
  let body = "";

  if (q.spot) {
    body += '<div id="spot-mount" class="spot-mount"></div>';
    if (drillCourseId === "c3" && q.spot.board && q.spot.board.length >= 3) {
      body += '<div id="range-chart-mount" class="range-chart-mount"></div>';
    }
  }

  body += '<p class="q-stem">' + t(q.stemKey) + "</p>";
  if (q.confidence && q.confidence !== "reference") {
    body += '<span class="conf-chip ' + q.confidence + '">' + t("drill.confidence." + q.confidence) + "</span>";
  }

  if (q.type === "choice") {
    body += '<div class="choice-grid">';
    displayChoiceOptions(q).forEach((opt) => {
      body += '<button class="choice-btn" data-choice="' + opt.id + '">' + t(opt.labelKey) + "</button>";
    });
    body += "</div>";
  } else {
    const acts = drillActionsForQuestion(q);
    body += '<div class="action-grid">';
    acts.forEach((act) => {
      body += '<button class="act-btn a-' + act + '" data-choice="' + act + '">' + t("action." + act) + "</button>";
    });
    body += "</div>";
  }

  const learnBtn =
    !Engine.reviewMode && p.learnDone
      ? '<div class="btn-stack drill-actions"><button class="btn secondary" data-action="start-learn" data-id="' + drillCourseId + '">' + t("learn.backToLearn") + "</button></div>"
      : "";

  const progressLabel = Engine.testMode
    ? t("placement.progress", { n: Engine.qIdx + 1 })
    : t("drill.q", { n: Engine.qIdx + 1, total: qs.length });

  return (
    '<section class="screen drill-screen">' +
    '<button class="back-btn" data-action="back-courses">←</button>' +
    '<p class="eyebrow">' + (Engine.testMode ? t("c1.title") : Engine.dailyMode ? t("daily.title") : t(course.titleKey)) + " · " + t("drill.title") + "</p>" +
    '<p class="q-pager">' + progressLabel + "</p>" +
    body +
    learnBtn +
    "</section>"
  );
}

let _pendingFeedback = null;

function renderFeedback() {
  const fb = _pendingFeedback;
  if (!fb) return renderDrill();

  // Resolve translatable text at render time so it follows live language changes.
  const correct = correctLabel(fb.question);
  const detail = Engine.feedbackFor(fb.question, fb.choice, fb.result.ok);

  return (
    '<section class="screen feedback-screen">' +
    '<div class="fb-grade ' + fb.result.grade + '">' + t("grade." + fb.result.grade) + "</div>" +
    '<p class="fb-correct">' + t("fb.correct") + ": <b>" + correct + "</b></p>" +
    '<div class="fb-block"><h4>' + t(fb.result.ok ? "fb.whyRight" : "fb.whyWrong") + "</h4><p>" + detail.reason + "</p></div>" +
    '<div class="fb-block"><h4>' + t("fb.concept") + "</h4><p>" + detail.concept + "</p></div>" +
    (detail.ctx ? '<div class="fb-block"><h4>' + t("fb.context") + "</h4><p>" + detail.ctx + "</p></div>" : "") +
    '<div class="btn-stack">' +
    '<button class="btn primary" data-action="next-q">' +
    (Engine.qIdx + 1 >= Engine.currentQuestions().length ? t("fb.finish") : t("fb.next")) +
    "</button></div></section>"
  );
}

function renderOver() {
  const correct = Engine.answers.filter((a) => a.ok).length;
  const total = Engine.answers.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const mistakes = Engine.answers.filter((a) => !a.ok).length;
  const sum = Engine.drillSummary || {};
  const gradeBadge = sum.grade ? '<div class="grade-hero grade-' + sum.grade + '">' + sum.grade + "</div>" : "";
  const scoreLine = sum.score
    ? '<p class="muted">' + t("over.points", { n: sum.score }) +
      (sum.maxCombo > 1 ? " · " + t("over.combo", { n: sum.maxCombo }) : "") + "</p>"
    : "";

  return (
    '<section class="screen over-screen">' +
    "<h2>" + t("over.title") + "</h2>" +
    gradeBadge +
    '<p class="big-score">' + t("over.accuracy", { pct }) + "</p>" +
    '<p class="muted">' + t("over.score", { n: correct }) + " / " + total + "</p>" +
    scoreLine +
    '<div class="btn-stack">' +
    (mistakes
      ? '<button class="btn secondary" data-action="review-mistakes">' + t("over.review") + "</button>"
      : "") +
    '<button class="btn secondary" data-action="start-learn" data-id="' + Engine.courseId + '">' + t("course.reviewLearn") + "</button>" +
    '<button class="btn primary" data-action="back-courses">' + t("over.back") + "</button>" +
    "</div></section>"
  );
}

function renderDailyOver() {
  const s = Engine.dailySummary || { correct: 0, total: 0, pct: 0, score: 0, maxCombo: 0, streakDays: 0, bestStreak: 0 };
  const comboTxt = s.maxCombo > 1 ? " · " + t("over.combo", { n: s.maxCombo }) : "";
  return (
    '<section class="screen over-screen daily-over">' +
    "<h2>📅 " + t("daily.over.title") + "</h2>" +
    '<p class="big-score">' + t("over.accuracy", { pct: s.pct }) + "</p>" +
    '<p class="muted">' + t("over.score", { n: s.correct }) + " / " + s.total + "</p>" +
    (s.score ? '<p class="muted">' + t("over.points", { n: s.score }) + comboTxt + "</p>" : "") +
    '<p class="daily-flame big-flame">🔥 ' + t("daily.streak", { n: s.streakDays }) + "</p>" +
    (s.bestStreak > s.streakDays ? '<p class="muted">' + t("daily.best", { n: s.bestStreak }) + "</p>" : "") +
    '<div class="btn-stack">' +
    '<button class="btn primary" data-action="back-courses">' + t("over.back") + "</button>" +
    "</div></section>"
  );
}

function renderReviewOver() {
  const s = Engine.reviewSummary || { correct: 0, total: 0, pct: 0, remaining: 0, mastered: 0 };
  const remainingLine = s.remaining
    ? '<p class="muted">' + t("review.over.remaining", { n: s.remaining }) + "</p>"
    : '<p class="muted review-cleared">' + t("review.over.cleared") + "</p>";
  const masteredLine =
    s.mastered > 0
      ? '<p class="muted">' + t("review.over.mastered", { n: s.mastered }) + "</p>"
      : "";

  return (
    '<section class="screen over-screen">' +
    "<h2>" + t("review.over.title") + "</h2>" +
    '<p class="big-score">' + t("over.accuracy", { pct: s.pct }) + "</p>" +
    '<p class="muted">' + t("review.over.score", { n: s.correct, total: s.total }) + "</p>" +
    masteredLine +
    remainingLine +
    '<div class="btn-stack">' +
    '<button class="btn primary" data-action="review-done">' + t("review.over.done") + "</button></div></section>"
  );
}

function fmtWait(ms) {
  if (ms <= 0) return t("review.wait.hours", { n: 1 });
  const days = Math.floor(ms / 864e5);
  if (days >= 1) return t("review.wait.days", { n: days });
  return t("review.wait.hours", { n: Math.max(1, Math.ceil(ms / 36e5)) });
}

function renderReviewEmpty() {
  let msg;
  if (Engine.reviewFilter) msg = t("review.emptyFilter");
  else if (Engine.store.reviewPile.length) {
    // 有错题但都未到期:显示下次到期时间
    const next = Engine.nextDueAt();
    msg = next ? t("review.emptyDue", { when: fmtWait(next - Engine._now()) }) : t("review.empty");
  } else msg = t("review.empty");
  return (
    '<section class="screen">' +
    "<h2>" + msg + "</h2>" +
    '<div class="btn-stack">' +
    '<button class="btn primary" data-action="back-courses">' + t("over.back") + "</button></div></section>"
  );
}

function profRow(label, value, detail, color) {
  return (
    '<div class="prof-row">' +
    '<span class="prof-k">' + label + "</span>" +
    '<b' + (color ? ' style="color:' + color + '"' : "") + ">" + value + "</b>" +
    (detail ? '<span class="prof-d">' + detail + "</span>" : "") +
    "</div>"
  );
}

function leakDrillBtn(courseId, leak) {
  return (
    '<button type="button" class="btn btn-sm outline leak-drill" data-drill="1" data-drill-course="' +
    courseId +
    '" data-drill-leak="' +
    (leak || "") +
    '">' +
    t("leak.drill") +
    "</button>"
  );
}

function renderProfileCard(store) {
  store = store || Engine.store;
  const p = Coach.buildProfile(store);
  if (!p.ready) {
    return '<p class="coach-note">' + t("prof.empty", { need: p.need }) + "</p>";
  }
  let styleText = t("prof.balanced");
  let styleColor = p.styleColor;
  if (p.styleKey === "profTight") {
    styleText = t("prof.tight", { p: p.tightPct });
    styleColor = "#34b074";
  } else if (p.styleKey === "profLoose") {
    styleText = t("prof.loose", { p: p.loosePct });
    styleColor = "#d23b46";
  } else if (p.styleKey === "profPending") {
    styleText = t("prof.pending");
    styleColor = "var(--muted)";
  }
  let html = profRow(t("prof.style"), styleText, "", styleColor);
  html += profRow(t("prof.acc"), p.acc + "%", t("prof.cum", { n: p.totalQ }));
  if (p.best) html += profRow(t("prof.best"), t(p.best.titleKey), p.best.acc + "%", "var(--best)");
  if (p.worst) html += profRow(t("prof.worst"), t(p.worst.titleKey), p.worst.acc + "%", "var(--wrong)");
  if (p.weakStreet) html += profRow(t("prof.stWeak"), t("prof.st." + p.weakStreet.street), p.weakStreet.acc + "%", "var(--wrong)");
  if (p.strongStreet) html += profRow(t("prof.stStrong"), t("prof.st." + p.strongStreet.street), p.strongStreet.acc + "%", "var(--best)");
  html += '<p class="coach-note">' + t("prof.note") + "</p>";
  return html;
}

function renderLeakCard(store) {
  store = store || Engine.store;
  const agg = Coach.aggregateLeaks(store);
  if (!agg.total) {
    return '<p class="coach-note">' + t("leak.empty") + "</p>";
  }
  const topMeta = Coach.leakMeta(agg.topKey);
  const topName = Coach.leakLabel(agg.topKey);
  let html =
    '<p class="coach-note">' +
    t("leak.top", { c: topMeta.color, name: topName, n: agg.total }) +
    "</p>";
  const max = Math.max(...agg.order.map((k) => agg.counts[k]), 1);
  html += agg.order
    .map((k) => {
      const meta = Coach.leakMeta(k);
      const pct = Math.round((agg.counts[k] / max) * 100);
      const desc = t(meta.descKey);
      return (
        '<div class="leak-row">' +
        '<span class="leak-lab">' +
        Coach.leakLabel(k) +
        (desc ? '<span class="leak-desc">' + desc + "</span>" : "") +
        "</span>" +
        '<span class="leak-trk"><i style="width:' +
        pct +
        "%;background:" +
        meta.color +
        '"></i></span>' +
        '<span class="leak-n">' +
        agg.counts[k] +
        "</span></div>"
      );
    })
    .join("");
  const missed = Coach.topMissed(store, 5);
  if (missed.length) {
    html += '<div class="leak-sub">' + t("leak.worstQs") + "</div>";
    html += missed
      .map((r) => {
        return (
          '<div class="leak-hand">' +
          '<span class="leak-qid">' +
          Coach.questionTitle(r.courseId, r.qid) +
          '</span><span class="leak-x">×' +
          (r.wrong || 1) +
          "</span>" +
          leakDrillBtn(r.courseId, r.leak) +
          "</div>"
        );
      })
      .join("");
  }
  return html;
}

function renderPlanCard(store) {
  store = store || Engine.store;
  const plan = Coach.buildPlan(store);
  if (!plan.ready) {
    return '<p class="coach-note">' + t("plan.empty") + "</p>";
  }
  let html = '<p class="coach-note">' + t("plan.head") + "</p>";
  plan.items.forEach((item, i) => {
    const course = courseById(item.courseId);
    const accTxt = item.acc != null ? t("plan.acc", { p: item.acc }) : "";
    html +=
      '<div class="leak-hand">' +
      '<span class="plan-rank">' +
      (i + 1) +
      "</span>" +
      '<span class="plan-sp">' +
      (course ? t(course.titleKey) : item.courseId) +
      " · " +
      Coach.leakLabel(item.leak) +
      '<br><span class="plan-meta">' +
      accTxt +
      t("plan.errs", { n: item.items }) +
      "</span></span>" +
      leakDrillBtn(item.courseId, item.leak) +
      "</div>";
  });
  return html;
}

function renderCourseBars() {
  const rows = Coach.courseBarRows(Engine.store);
  if (!rows.length) {
    return '<p class="coach-note">' + t("stats.noCourseData") + "</p>";
  }
  return rows
    .map((r) => {
      const label = t(r.titleKey);
      return (
        '<div class="sbar">' +
        '<span class="sbar-nm" title="' + label + '">' + label + "</span>" +
        '<span class="sbar-trk"><span class="sbar-fil" style="width:' + r.pct + '%"></span></span>' +
        '<span class="sbar-pct">' + t("stats.barPct", { p: r.pct, h: r.h }) + "</span>" +
        "</div>"
      );
    })
    .join("");
}

function renderLeakHeatmap() {
  const m = Engine.store.statsByLeak || {};
  const rows = Object.keys(m)
    .filter((k) => m[k].h >= 3) // 样本太少不显示
    .map((k) => ({ k, h: m[k].h, acc: Math.round((m[k].c / m[k].h) * 100) }))
    .sort((a, b) => a.acc - b.acc);
  if (!rows.length) return '<p class="coach-note">' + t("heat.empty") + "</p>";
  return rows
    .map((r) => {
      // 热图着色:≥80% 绿 / ≥60% 金 / 其余红
      const color = r.acc >= 80 ? "var(--call)" : r.acc >= 60 ? "var(--gold)" : "var(--wrong)";
      return (
        '<div class="sbar">' +
        '<span class="sbar-nm">' + Coach.leakLabel(r.k) + "</span>" +
        '<span class="sbar-trk"><span class="sbar-fil" style="width:' + r.acc + "%;background:" + color + '"></span></span>' +
        '<span class="sbar-pct">' + t("stats.barPct", { p: r.acc, h: r.h }) + "</span>" +
        "</div>"
      );
    })
    .join("");
}

function renderReviewDetail() {
  const pile = Engine.store.reviewPile;
  const reviewN = pile.length;
  const dueN = Engine.dueReviewCount();
  const now = Engine._now();
  let body = "";

  if (!reviewN) {
    body = '<p class="coach-note">' + t("review.pileEmpty") + "</p>";
  } else {
    body = Coach.reviewByCourse(Engine.store)
      .map((g) => {
        const title = t(g.titleKey);
        const chips = g.items
          .map((r) => {
            const qLabel = Coach.questionTitle(r.courseId, r.qid).split(" · ").pop() || r.qid;
            // SRS 状态:到期(可复习) / 已排程(显示等待时长 + 盒进度)
            const srs =
              (r.due || 0) <= now
                ? ' <span class="rv-due">' + t("review.chipDue") + "</span>"
                : ' <span class="rv-wait">' + t("review.chipWait", { when: fmtWait(r.due - now) }) + "</span>";
            const boxDots =
              r.box > 0
                ? ' <span class="rv-box" title="' + t("review.boxTitle", { b: r.box, m: SRS_GRADUATE }) + '">' +
                  "●".repeat(r.box) + "○".repeat(Math.max(0, SRS_GRADUATE - r.box)) + "</span>"
                : "";
            return (
              '<span class="rv-chip">' +
              qLabel +
              (r.wrong > 1 ? ' <span class="rv-wn">×' + r.wrong + "</span>" : "") +
              srs +
              boxDots +
              ' <button type="button" class="rv-del" data-action="review-remove" data-course="' +
              r.courseId +
              '" data-qid="' +
              r.qid +
              '" aria-label="' + t("review.remove") + '">✕</button></span>'
            );
          })
          .join("");
        return (
          '<div class="rv-group">' +
          '<div class="rv-head"><b>' +
          title +
          '</b><button type="button" class="btn btn-sm success rv-mini" data-action="review-drill-course" data-id="' +
          g.courseId +
          '">' +
          t("review.drillGroup", { n: g.items.length }) +
          "</button></div>" +
          '<div class="rv-chips">' +
          chips +
          "</div></div>"
        );
      })
      .join("");
  }

  const dueBtn =
    '<button type="button" class="btn success review-all-btn"' +
    (dueN ? "" : " disabled") +
    ' data-action="review-due">' +
    t("review.dueBtn", { n: dueN }) +
    "</button>";
  const allBtn =
    reviewN && reviewN > dueN
      ? '<button type="button" class="btn secondary review-all-btn" data-action="review-all">' +
        t("review.all", { n: reviewN }) +
        "</button>"
      : "";

  return (
    '<section class="screen review-screen">' +
    "<h2>" + t("review.title") + "</h2>" +
    '<p class="muted review-sub">' + t("review.subtitle") + "</p>" +
    (reviewN ? '<p class="muted review-count">' + t("review.headCount", { due: dueN, total: reviewN }) + "</p>" : "") +
    body +
    '<div class="review-actions">' + dueBtn + allBtn + "</div>" +
    bottomNav("review", dueN) +
    "</section>"
  );
}

function renderPlacementResult() {
  const p = Engine.store.placement;
  const ps = Engine.placementPseudoStore(p.results);
  const pct = Math.round((p.score / p.total) * 100);
  const level = pct >= 85 ? "expert" : pct >= 60 ? "inter" : "beginner";
  let html = `<div class="screen result">`;
  html += `<h2>${t("placement.resultTitle")}</h2>`;
  html += `<div class="big-score">${t("placement.scoreLine", { c: p.score, t: p.total })} · ${pct}%</div>`;
  html += `<div class="level">${t("placement.level." + level)}</div>`;
  if (p.history.length > 1) {
    const prev = p.history[p.history.length - 2].score;
    html += `<div class="trend">${t("placement.lastTime", { a: prev, b: p.score })}</div>`;
  }
  html += `<h3>${t("placement.byTheme")}</h3><div class="theme-bars">`;
  for (const th of ["flop", "odds", "turn", "river", "advanced"]) {
    const d = p.byTheme[th] || { h: 0, c: 0 };
    const weak = th === p.weakestTheme ? " weak" : "";
    html += `<div class="theme-bar${weak}"><span>${t("theme." + th)}</span><b>${d.c}/${d.h}</b></div>`;
  }
  html += `</div>`;
  html += renderProfileCard(ps);
  html += renderLeakCard(ps);
  html += renderPlanCard(ps);
  html += `<div class="note">${t("placement.smallSample")}</div>`;
  const sc = p.startCourse;
  const scTitle = t(courseById(sc).titleKey);
  html += `<button class="btn" data-action="start-course" data-id="${sc}">${t("placement.startHere", { title: scTitle })}</button>`;
  html += `<h3>${t("placement.review")}</h3>`;
  for (const r of p.results) {
    const open = r.ok ? "" : " open";
    const mark = r.ok ? "✓" : "✗";
    const correct = (r.correct || []).map((a) => t("action." + a)).join(" / ");
    html += `<details class="q-review${open}"><summary>${mark} ${r.qid} — ${t("theme." + r.theme)}</summary>
      <div>${t("placement.youChose")}${t("action." + r.choice)} · ${t("placement.correctAns")}${correct}</div></details>`;
  }
  html += `<div class="result-actions">
    <button class="btn" data-action="add-misses">${t("placement.addToReview")}</button>
    <button data-action="start-placement">${t("placement.retake")}</button>
    <button data-action="back-courses">${t("course.back")}</button>
  </div></div>`;
  return html;
}

function renderStats() {
  const s = Engine.store.stats;
  const reviewN = Engine.dueReviewCount();

  return (
    '<section class="screen stats-screen">' +
    "<h2>" + t("stats.title") + "</h2>" +
    '<div class="stat-tiles">' +
    '<div class="stat-tile"><div class="v">' +
    (s.coursesDone || 0) +
    "/" +
    COURSES.filter((c) => !c.placement).length +
    '</div><div class="k">' +
    t("stats.coursesDone") +
    "</div></div>" +
    '<div class="stat-tile"><div class="v">' +
    (s.totalQ || 0) +
    '</div><div class="k">' +
    t("stats.totalQ") +
    "</div></div>" +
    '<div class="stat-tile"><div class="v">' +
    Engine.overallAccuracy() +
    '%</div><div class="k">' +
    t("stats.overallAcc") +
    "</div></div>" +
    "</div>" +
    '<article class="coach-card"><h3>' +
    t("stats.courseAccTitle") +
    "</h3>" +
    renderCourseBars() +
    "</article>" +
    '<article class="coach-card"><h3>' +
    t("stats.leakHeatTitle") +
    "</h3>" +
    renderLeakHeatmap() +
    "</article>" +
    '<article class="coach-card"><h3>' +
    t("stats.profileTitle") +
    "</h3>" +
    renderProfileCard() +
    "</article>" +
    '<article class="coach-card"><h3>' +
    t("stats.planTitle") +
    "</h3>" +
    renderPlanCard() +
    "</article>" +
    '<article class="coach-card"><h3>' +
    t("stats.leaksTitle") +
    "</h3>" +
    renderLeakCard() +
    "</article>" +
    bottomNav("stats", reviewN) +
    "</section>"
  );
}

function correctLabel(q) {
  if (q.type === "choice") {
    const id = q.correct[0];
    const opt = q.options.find((o) => o.id === id);
    return opt ? t(opt.labelKey) : id;
  }
  return q.correct.map((a) => t("action." + a)).join(" / ");
}

function bindEvents() {
  $$("[data-action]").forEach((el) => {
    el.onclick = () => handleAction(el.getAttribute("data-action"), el);
  });
  $$("[data-nav]").forEach((el) => {
    el.onclick = () => {
      const nav = el.getAttribute("data-nav");
      if (nav === "review") Engine.screen = "review";
      else if (nav === "stats") Engine.screen = "stats";
      else Engine.screen = "courses";
      render();
    };
  });
  $$("[data-choice]").forEach((el) => {
    el.onclick = () => submitChoice(el.getAttribute("data-choice"));
  });
  $$("[data-drill]").forEach((el) => {
    el.onclick = () => {
      const courseId = el.getAttribute("data-drill-course");
      const leak = el.getAttribute("data-drill-leak");
      resetChoiceShuffle();
      Engine.startReview({ courseId, leak: leak || undefined });
      render();
    };
  });

  const spotMount = $("#spot-mount");
  if (spotMount) {
    const qs = Engine.currentQuestions();
    const q = qs[Engine.qIdx];
    if (q && q.spot) renderSpot(q.spot, spotMount);
  }

  const rangeMount = $("#range-chart-mount");
  if (rangeMount) {
    let board = null;
    if (Engine.screen === "learn") {
      const slides = getLearn(Engine.courseId);
      board = slides[Engine.learnIdx] && slides[Engine.learnIdx].rangeChart;
    } else if (Engine.screen === "drill") {
      const q = Engine.currentQuestions()[Engine.qIdx];
      const drillCourseId = (q && q._courseId) || Engine.courseId;
      board = q && q.spot && q.spot.board;
      if (drillCourseId !== "c3") board = null;
    }
    if (board) renderRangeChart(rangeMount, board);
  }
}

function handleAction(action, el) {
  switch (action) {
    case "start-course":
      Engine.startCourse(el.getAttribute("data-id"));
      break;
    case "start-learn":
      Engine.startCourse(el.getAttribute("data-id"), "learn");
      break;
    case "start-drill":
      resetChoiceShuffle();
      Engine.startCourse(el.getAttribute("data-id"), "drill");
      break;
    case "next-learn":
      Engine.learnIdx++;
      break;
    case "finish-learn":
      resetChoiceShuffle();
      Engine.finishLearn();
      break;
    case "start-placement":
      resetChoiceShuffle();
      Engine.startPlacementTest();
      break;
    case "start-daily":
      resetChoiceShuffle();
      Engine.startDaily();
      break;
    case "onboard-start":
      Engine.store.onboardingSeen = true; Engine.save();
      resetChoiceShuffle();
      Engine.startPlacementTest();
      break;
    case "onboard-dismiss":
      Engine.store.onboardingSeen = true; Engine.save();
      Engine.screen = "courses";
      break;
    case "back-courses":
      _pendingFeedback = null;
      if (Engine.testMode) {
        if (!confirm(t("placement.abandon"))) break;
        Engine.testMode = false;
        Engine.testQueue = [];
        Engine.testResults = [];
        Engine.screen = "courses";
        break;
      }
      if (Engine.dailyMode) {
        // 每日训练中途退出:会话已持久化,回来可续答
        Engine.dailyMode = false;
        Engine.dailyQueue = [];
        Engine.screen = "courses";
        break;
      }
      if (Engine.reviewMode || Engine.screen === "review-empty") {
        Engine.exitReviewFlow();
      } else {
        Engine.screen = "courses";
        Engine.reviewMode = false;
        Engine.reviewFilter = null;
        Engine.reviewReturnTo = null;
      }
      break;
    case "next-q":
      _pendingFeedback = null;
      Engine.qIdx++;
      if (Engine.qIdx >= Engine.currentQuestions().length) {
        if (Engine.testMode) Engine.finishPlacementTest(Date.now());
        else if (Engine.dailyMode) Engine.finishDaily();
        else if (Engine.reviewMode) Engine.finishReviewSession();
        else Engine.finishDrill();
      } else Engine.screen = "drill";
      break;
    case "review-done":
      Engine.exitReviewFlow();
      break;
    case "review-mistakes":
      resetChoiceShuffle();
      Engine.startReview({ courseId: Engine.courseId });
      break;
    case "review-due":
      if (Engine.dueReviewCount()) {
        resetChoiceShuffle();
        Engine.startReview();
      }
      break;
    case "review-all":
      if (Engine.store.reviewPile.length) {
        resetChoiceShuffle();
        Engine.startReview({ all: true });
      }
      break;
    case "review-drill-course":
      resetChoiceShuffle();
      Engine.startReview({ courseId: el.getAttribute("data-id") });
      break;
    case "review-remove": {
      const courseId = el.getAttribute("data-course");
      const qid = el.getAttribute("data-qid");
      const rec = Engine.store.reviewPile.find((r) => r.courseId === courseId && r.qid === qid);
      if (rec) Engine.removeFromPile(rec);
      break;
    }
    case "add-misses": {
      const ps = Engine.placementPseudoStore(Engine.store.placement.results);
      for (const r of ps.reviewPile) {
        if (!Engine.store.reviewPile.find((x) => x.qid === r.qid && x.courseId === r.courseId)) {
          Engine.store.reviewPile.push(r);
        }
      }
      Engine.save();
      break;
    }
  }
  render();
}

function submitChoice(choice) {
  const qs = Engine.currentQuestions();
  const q = qs[Engine.qIdx];
  const result = Engine.grade(q, choice);
  Engine.recordAnswer(q, choice, result);

  // 复习模式或每日训练里的复习题:答对推进 SRS 盒
  if (q._rec && result.ok) {
    Engine.onReviewCorrect(q._rec);
  }

  _pendingFeedback = { question: q, choice, result };
  Engine.screen = "feedback";
  render();
}

function syncLangButtons() {
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  const enBtn = $("#lang-en");
  const zhBtn = $("#lang-zh");
  if (enBtn) {
    enBtn.classList.toggle("active", LANG === "en");
    enBtn.onclick = () => setLang("en");
  }
  if (zhBtn) {
    zhBtn.classList.toggle("active", LANG === "zh");
    zhBtn.onclick = () => setLang("zh");
  }
}

function onLangChange() {
  syncLangButtons();
  render();
}

function boot() {
  syncLangButtons();
  render();
}

document.addEventListener("DOMContentLoaded", boot);

/* Dev: unlock all courses in console with localStorage.setItem('pokerPostFlopPro','1') */
window.unlockPro = function () {
  localStorage.setItem("pokerPostFlopPro", "1");
  render();
};
