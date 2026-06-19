/* app.js — UI boot & screens */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

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
    case "stats":
      root.innerHTML = renderStats();
      break;
    default:
      root.innerHTML = renderCourses();
  }

  applyI18n(root);
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
        '<div class="cc-actions">' +
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
    '<button class="btn primary" data-action="' + (isLast ? "finish-learn" : "next-learn") + '">' +
    (isLast ? t("learn.startDrill") : t("learn.next")) +
    "</button></section>"
  );
}

function renderDrill() {
  const qs = Engine.currentQuestions();
  const q = qs[Engine.qIdx];
  if (!q) {
    Engine.finishDrill();
    render();
    return "";
  }

  const course = courseById(Engine.courseId);
  const p = Engine.getProgress(Engine.courseId);
  let body = "";

  if (q.spot) {
    body += '<div id="spot-mount" class="spot-mount"></div>';
    if (Engine.courseId === "c3" && q.spot.board && q.spot.board.length >= 3) {
      body += '<div id="range-chart-mount" class="range-chart-mount"></div>';
    }
  }

  body += '<p class="q-stem">' + t(q.stemKey) + "</p>";
  if (q.confidence && q.confidence !== "reference") {
    body += '<span class="conf-chip ' + q.confidence + '">' + t("drill.confidence." + q.confidence) + "</span>";
  }

  if (q.type === "choice") {
    body += '<div class="choice-grid">';
    q.options.forEach((opt) => {
      body += '<button class="choice-btn" data-choice="' + opt.id + '">' + t(opt.labelKey) + "</button>";
    });
    body += "</div>";
  } else {
    const acts = q.actions && q.actions.length ? q.actions : ["fold", "check", "call", "bet"];
    body += '<div class="action-grid">';
    acts.forEach((act) => {
      body += '<button class="act-btn a-' + act + '" data-choice="' + act + '">' + t("action." + act) + "</button>";
    });
    body += "</div>";
  }

  const learnBtn =
    !Engine.reviewMode && p.learnDone
      ? '<button class="btn secondary drill-learn-btn" data-action="start-learn" data-id="' + Engine.courseId + '">' + t("learn.backToLearn") + "</button>"
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
    '<button class="btn primary" data-action="next-q">' +
    (Engine.qIdx + 1 >= Engine.currentQuestions().length ? t("fb.finish") : t("fb.next")) +
    "</button></section>"
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
    (mistakes
      ? '<button class="btn secondary" data-action="review-mistakes">' + t("over.review") + "</button>"
      : "") +
    '<button class="btn secondary" data-action="start-learn" data-id="' + Engine.courseId + '">' + t("course.reviewLearn") + "</button>" +
    '<button class="btn primary" data-action="back-courses">' + t("over.back") + "</button></section>"
  );
}

function renderReviewEmpty() {
  return (
    '<section class="screen">' +
    "<h2>" + t("review.empty") + "</h2>" +
    '<button class="btn primary" data-action="back-courses">' + t("over.back") + "</button></section>"
  );
}

function renderStats() {
  const s = Engine.store.stats;
  const leaks = Object.entries(Engine.store.leaks || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => '<li><span>' + (t("leak." + k) || k) + "</span><b>" + v + "</b></li>")
    .join("");

  return (
    '<section class="screen stats-screen">' +
    "<h2>" + t("stats.title") + "</h2>" +
    '<ul class="stat-list">' +
    "<li><span>" + t("stats.coursesDone") + "</span><b>" + (s.coursesDone || 0) + " / 12</b></li>" +
    "<li><span>" + t("stats.totalQ") + "</span><b>" + (s.totalQ || 0) + "</b></li>" +
    "<li><span>" + t("stats.overallAcc") + "</span><b>" + Engine.overallAccuracy() + "%</b></li>" +
    "</ul>" +
    (leaks ? "<h3>Leaks</h3><ul class='stat-list'>" + leaks + "</ul>" : "") +
    '<button class="btn primary" data-action="back-courses">' + t("over.back") + "</button></section>"
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
      if (nav === "review") Engine.startReview();
      else if (nav === "stats") Engine.screen = "stats";
      else Engine.screen = "courses";
      render();
    };
  });
  $$("[data-choice]").forEach((el) => {
    el.onclick = () => submitChoice(el.getAttribute("data-choice"));
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
    } else if (Engine.screen === "drill" && Engine.courseId === "c3") {
      const q = Engine.currentQuestions()[Engine.qIdx];
      board = q && q.spot && q.spot.board;
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
      Engine.startCourse(el.getAttribute("data-id"), "drill");
      break;
    case "next-learn":
      Engine.learnIdx++;
      break;
    case "finish-learn":
      Engine.finishLearn();
      break;
    case "back-courses":
      Engine.screen = "courses";
      Engine.reviewMode = false;
      _pendingFeedback = null;
      break;
    case "next-q":
      _pendingFeedback = null;
      Engine.qIdx++;
      if (Engine.qIdx >= Engine.currentQuestions().length) {
        if (Engine.reviewMode) Engine.screen = "courses";
        else Engine.finishDrill();
      } else Engine.screen = "drill";
      break;
    case "review-mistakes":
      Engine.startReview();
      break;
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
