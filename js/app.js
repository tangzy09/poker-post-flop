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
    default:
      root.innerHTML = renderCourses();
  }

  applyI18n(document);
  bindEvents();
}

function renderCourses() {
  const cards = COURSES.map((c) => {
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

    return (
      '<article class="course-card' + (locked ? " locked" : "") + (p.completed ? " done" : "") + '">' +
      '<div class="cc-head">' +
      '<span class="cc-num">' + c.order + "</span>" +
      '<span class="badge ' + badgeCls + '">' + badge + "</span>" +
      (p.completed ? '<span class="badge done-badge">' + t("course.completed") + "</span>" : "") +
      "</div>" +
      "<h3>" + t(c.titleKey) + "</h3>" +
      '<p class="cc-sub">' + t(c.subKey) + "</p>" +
      '<p class="cc-meta">' + t("course.questions", { n: qs }) +
      (acc != null ? " · " + t("course.accuracy", { pct: acc }) : "") +
      "</p>" +
      actions +
      "</article>"
    );
  }).join("");

  const reviewN = Engine.store.reviewPile.length;
  return (
    '<section class="screen courses-screen">' +
    '<header class="page-head">' +
    "<h2>" + t("nav.courses") + "</h2>" +
    '<p class="muted">' + t("app.subtitle") + "</p>" +
    "</header>" +
    '<div class="course-grid">' + cards + "</div>" +
    bottomNav("courses", reviewN) +
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
    if (Engine.reviewMode) Engine.finishReviewSession();
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

  return (
    '<section class="screen drill-screen">' +
    '<button class="back-btn" data-action="back-courses">←</button>' +
    '<p class="eyebrow">' + t(course.titleKey) + " · " + t("drill.title") + "</p>" +
    '<p class="q-pager">' + t("drill.q", { n: Engine.qIdx + 1, total: qs.length }) + "</p>" +
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
  const detail = Engine.feedbackFor(fb.question, fb.choice);

  return (
    '<section class="screen feedback-screen">' +
    '<div class="fb-grade ' + fb.result.grade + '">' + t("grade." + fb.result.grade) + "</div>" +
    '<p class="fb-correct">' + t("fb.correct") + ": <b>" + correct + "</b></p>" +
    (!fb.result.ok
      ? '<div class="fb-block"><h4>' + t("fb.whyWrong") + "</h4><p>" + detail.reason + "</p></div>" +
        '<div class="fb-block"><h4>' + t("fb.concept") + "</h4><p>" + detail.concept + "</p></div>" +
        (detail.ctx ? '<div class="fb-block"><h4>' + t("fb.context") + "</h4><p>" + detail.ctx + "</p></div>" : "")
      : "") +
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

  return (
    '<section class="screen over-screen">' +
    "<h2>" + t("over.title") + "</h2>" +
    '<p class="big-score">' + t("over.accuracy", { pct }) + "</p>" +
    '<p class="muted">' + t("over.score", { n: correct }) + " / " + total + "</p>" +
    '<div class="btn-stack">' +
    (mistakes
      ? '<button class="btn secondary" data-action="review-mistakes">' + t("over.review") + "</button>"
      : "") +
    '<button class="btn secondary" data-action="start-learn" data-id="' + Engine.courseId + '">' + t("course.reviewLearn") + "</button>" +
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
      ? '<p class="muted">' + t("review.over.mastered", { n: s.mastered, m: MASTER_STREAK }) + "</p>"
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

function renderReviewEmpty() {
  const msg = Engine.reviewFilter ? t("review.emptyFilter") : t("review.empty");
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

function renderReviewDetail() {
  const pile = Engine.store.reviewPile;
  const reviewN = pile.length;
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
            const streak =
              r.streak > 0
                ? ' <span class="rv-st">' + t("review.chipMaster", { s: r.streak, m: MASTER_STREAK }) + "</span>"
                : "";
            return (
              '<span class="rv-chip">' +
              qLabel +
              (r.wrong > 1 ? ' <span class="rv-wn">×' + r.wrong + "</span>" : "") +
              streak +
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

  const allBtn =
    '<button type="button" class="btn success review-all-btn"' +
    (reviewN ? "" : " disabled") +
    ' data-action="review-all">' +
    t("review.all", { n: reviewN }) +
    "</button>";

  return (
    '<section class="screen review-screen">' +
    "<h2>" + t("review.title") + "</h2>" +
    '<p class="muted review-sub">' + t("review.subtitle") + "</p>" +
    body +
    '<div class="review-actions">' + allBtn + "</div>" +
    bottomNav("review", reviewN) +
    "</section>"
  );
}

function renderStats() {
  const s = Engine.store.stats;
  const reviewN = Engine.store.reviewPile.length;

  return (
    '<section class="screen stats-screen">' +
    "<h2>" + t("stats.title") + "</h2>" +
    '<div class="stat-tiles">' +
    '<div class="stat-tile"><div class="v">' +
    (s.coursesDone || 0) +
    "/" +
    COURSES.length +
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
    case "back-courses":
      _pendingFeedback = null;
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
        if (Engine.reviewMode) Engine.finishReviewSession();
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
    case "review-all":
      if (Engine.store.reviewPile.length) {
        resetChoiceShuffle();
        Engine.startReview();
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
  }
  render();
}

function submitChoice(choice) {
  const qs = Engine.currentQuestions();
  const q = qs[Engine.qIdx];
  const result = Engine.grade(q, choice);
  Engine.recordAnswer(q, choice, result);

  if (Engine.reviewMode && q._rec && result.ok) {
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
