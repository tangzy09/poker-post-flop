/* feedback.js — 站内一页式意见反馈 + 就地纠错(「这题有问题?」)。
   设计依据见全局 skill `app-ratings-feedback`:
   - 不用 mailto(安卓/国内大量无邮件客户端,跳出即流失,内容无结构无诊断)
   - 诊断静默打包(版本/平台/语言/题号/牌面/订阅态/最近报错),用户只写一句话
   - 表单内绝不问「你喜欢这个 app 吗 / 会给几星」(Google 明禁的前置问题)
   - 提交失败入本地队列,下次启动重发;对用户一律显示「已收到」,别把网络问题变成第二次挫败
   类名一律 fbk- 前缀 + 内联样式,绝不用 .btn(与全局 .btn 冲突,见 CLAUDE.md)。 */

const FEEDBACK_ENDPOINT = "https://post-flop-coach.ai-speeds.com/api/feedback";
const FEEDBACK_QUEUE_KEY = "pokerPostFlopFbQueue";

reg("fbk.entry", "Send feedback", "意见反馈");
reg("fbk.title", "Send feedback", "意见反馈");
reg("fbk.desc", "Bugs, wrong answers, ideas — all read by a human.", "报 bug、指错、提建议 —— 每条都有人看。");
reg("fbk.reportTitle", "Something wrong with this hand?", "这道题有问题?");
reg("fbk.reportDesc", "The board, your answer and our verdict are attached automatically.", "牌面、你的选择和判定结果会自动附上。");
reg("fbk.placeholder", "What happened? One line is enough.", "说一句就行,发生了什么?");
reg("fbk.cat.bug", "Bug", "程序问题");
reg("fbk.cat.content", "Wrong content", "题目/讲解有误");
reg("fbk.cat.idea", "Idea", "功能建议");
reg("fbk.cat.other", "Other", "其他");
reg("fbk.send", "Send", "发送");
reg("fbk.cancel", "Cancel", "取消");
reg("fbk.empty", "Write a line first.", "先写一句吧。");
reg("fbk.thanks", "Got it — thank you.", "收到了,谢谢。");

/* 最近一次运行时报错:既是禁火区信号(刚崩过别求好评),也是反馈诊断字段 */
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    window.__lastError = { msg: String(e.message || ""), at: Date.now() };
  });
  window.addEventListener("unhandledrejection", (e) => {
    window.__lastError = { msg: "unhandled: " + String((e.reason && e.reason.message) || e.reason || ""), at: Date.now() };
  });
}

var Feedback = (function () {
  function appVersion() {
    // 版本戳来自 index.html 的 ?v=<git-hash>(deploy 时打),没有就是本地开发
    const s = document.querySelector('script[src*="app.js"]');
    const m = s && s.getAttribute("src").match(/[?&]v=([^&]+)/);
    return (m && m[1]) || "dev";
  }

  function diagnostics(extra) {
    const st = (typeof Engine !== "undefined" && Engine.store) || {};
    return Object.assign(
      {
        app: "poker-post-flop",
        version: appVersion(),
        platform: (typeof CAP !== "undefined" && CAP.native() && CAP.cap().getPlatform && CAP.cap().getPlatform()) || "web",
        ua: navigator.userAgent,
        lang: typeof curLang === "function" ? curLang() : "en",
        screen: window.innerWidth + "x" + window.innerHeight,
        online: navigator.onLine,
        pro: !!st.proEntitled,
        coursesDone: (st.stats && st.stats.coursesDone) || 0,
        lastError: window.__lastError || null,
      },
      extra || {}
    );
  }

  /* 题目快照:纠错反馈的价值全在这里 —— 收上来就能直接喂 npm run audit / tools/verify-feedback.js */
  function questionSnapshot(q, choice, ok) {
    if (!q) return {};
    const spot = q.spot || {};
    const hero = spot.hero || {};
    return {
      qid: q.id || null,
      courseId: q._courseId || (typeof Engine !== "undefined" ? Engine.courseId : null) || null,
      board: spot.board || null,
      hand: hero.hand || null, // 手牌在 spot.hero.hand,不是 spot.hand(见 js/table.js)
      heroPos: hero.pos || null,
      street: spot.street || null,
      pot: spot.pot != null ? spot.pot : null,
      correct: q.correct || (q.options && q.answer) || null,
      chose: choice != null ? String(choice) : null,
      verdict: ok === undefined ? null : ok ? "correct" : "wrong",
      mode: typeof Engine !== "undefined" ? (Engine.testMode ? "placement" : Engine.reviewMode ? "review" : Engine.dailyMode ? "daily" : "drill") : null,
    };
  }

  function queue(payload) {
    try {
      const q = JSON.parse(localStorage.getItem(FEEDBACK_QUEUE_KEY) || "[]");
      q.push(payload);
      localStorage.setItem(FEEDBACK_QUEUE_KEY, JSON.stringify(q.slice(-20)));
    } catch (e) {}
  }

  async function post(payload) {
    const r = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("http " + r.status);
    return true;
  }

  async function submit(text, category, context) {
    const payload = { text: String(text || "").trim().slice(0, 2000), category: category || "other", diag: diagnostics(context), ts: Date.now() };
    if (!payload.text) return { ok: false };
    try {
      await post(payload);
      return { ok: true };
    } catch (e) {
      queue(payload); // 网络/端点挂了:存下来下次重发,用户侧仍显示「已收到」
      return { ok: true, queued: true };
    }
  }

  /* 启动时重发离线队列(静默,失败就留着) */
  async function flushQueue() {
    let q;
    try {
      q = JSON.parse(localStorage.getItem(FEEDBACK_QUEUE_KEY) || "[]");
    } catch (e) {
      return;
    }
    if (!q.length || !navigator.onLine) return;
    const left = [];
    for (const p of q) {
      try {
        await post(p);
      } catch (e) {
        left.push(p);
      }
    }
    localStorage.setItem(FEEDBACK_QUEUE_KEY, JSON.stringify(left));
  }

  /* ---------- 表单弹层 ---------- */
  const S = {
    ov: "position:fixed;inset:0;z-index:210;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);padding:20px",
    card: "max-width:380px;width:100%;background:var(--panel,#161d18);border:1px solid var(--line,#28332a);border-radius:18px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.5)",
    title: "font-weight:700;font-size:18px;color:var(--ink,#f1f5ee);margin:0 0 4px",
    desc: "color:var(--muted,#8fa79a);font-size:12.5px;margin:0 0 12px;line-height:1.5",
    cats: "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px",
    chip: "appearance:none;cursor:pointer;font-family:inherit;font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid var(--line,#28332a);background:transparent;color:var(--muted,#8fa79a)",
    chipOn: "appearance:none;cursor:pointer;font-family:inherit;font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid var(--gold,#e8c66a);background:rgba(232,198,106,.12);color:var(--gold,#e8c66a)",
    ta: "width:100%;box-sizing:border-box;min-height:96px;resize:vertical;font-family:inherit;font-size:14px;line-height:1.5;color:var(--ink,#f1f5ee);background:var(--felt2,#0a201a);border:1px solid var(--line,#28332a);border-radius:12px;padding:10px",
    send: "appearance:none;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:15px;color:#16110a;background:linear-gradient(180deg,var(--gold,#e8c66a),var(--gold2,#b8902f));width:100%;padding:12px;border-radius:12px;margin-top:12px",
    cancel: "appearance:none;border:0;cursor:pointer;font-family:inherit;font-size:13px;color:var(--muted,#8fa79a);background:transparent;width:100%;padding:9px;margin-top:2px",
    err: "color:var(--wrong,#e0544f);font-size:12.5px;margin-top:8px;text-align:center",
    ok: "text-align:center;color:var(--best,#34b074);font-weight:700;font-size:16px;padding:18px 0",
  };

  const CATS = ["bug", "content", "idea", "other"];

  /** openForm({ category, context, title, desc }) —— context 会并进 diag,一起发走 */
  function openForm(opts) {
    opts = opts || {};
    const old = document.getElementById("fbk-ov");
    if (old) old.remove();

    let cat = opts.category || "other";
    const el = document.createElement("div");
    el.id = "fbk-ov";
    el.style.cssText = S.ov;

    const chips = () =>
      CATS.map(
        (c) => '<button style="' + (c === cat ? S.chipOn : S.chip) + '" data-fbk-cat="' + c + '">' + t("fbk.cat." + c) + "</button>"
      ).join("");

    const paint = () => {
      el.innerHTML =
        '<div style="' + S.card + '" role="dialog" aria-modal="true">' +
        '<h3 style="' + S.title + '">' + (opts.title || t("fbk.title")) + "</h3>" +
        '<p style="' + S.desc + '">' + (opts.desc || t("fbk.desc")) + "</p>" +
        '<div style="' + S.cats + '">' + chips() + "</div>" +
        '<textarea style="' + S.ta + '" data-fbk-text placeholder="' + t("fbk.placeholder") + '"></textarea>' +
        '<button style="' + S.send + '" data-fbk="send">' + t("fbk.send") + "</button>" +
        '<button style="' + S.cancel + '" data-fbk="cancel">' + t("fbk.cancel") + "</button>" +
        "</div>";
      bind();
    };

    const bind = () => {
      const ta = el.querySelector("[data-fbk-text]");
      el.querySelectorAll("[data-fbk-cat]").forEach((b) => {
        b.onclick = () => {
          const keep = ta ? ta.value : "";
          cat = b.getAttribute("data-fbk-cat");
          paint();
          const ta2 = el.querySelector("[data-fbk-text]");
          if (ta2) { ta2.value = keep; ta2.focus(); }
        };
      });
      el.querySelectorAll("[data-fbk]").forEach((b) => {
        const k = b.getAttribute("data-fbk");
        b.onclick = async () => {
          if (k === "cancel") return el.remove();
          const text = (ta && ta.value) || "";
          if (!text.trim()) {
            let e = el.querySelector(".fbk-err");
            if (!e) { e = document.createElement("div"); e.className = "fbk-err"; e.style.cssText = S.err; el.firstChild.appendChild(e); }
            e.textContent = t("fbk.empty");
            return;
          }
          b.disabled = true;
          await submit(text, cat, opts.context);
          el.firstChild.innerHTML = '<div style="' + S.ok + '">✓ ' + t("fbk.thanks") + "</div>";
          setTimeout(() => el.remove(), 1400);
        };
      });
    };

    el.addEventListener("click", (e) => { if (e.target === el) el.remove(); }); // 点遮罩关闭
    document.body.appendChild(el);
    paint();
    const ta = el.querySelector("[data-fbk-text]");
    if (ta) ta.focus();
  }

  /* 就地纠错:反馈屏那个不起眼的小链接。懂牌的人发现题错了,不给他渠道他就去写 1 星。 */
  function reportQuestion(q, choice, ok) {
    openForm({
      category: "content",
      context: { question: questionSnapshot(q, choice, ok) },
      title: t("fbk.reportTitle"),
      desc: t("fbk.reportDesc"),
    });
  }

  return { submit, flushQueue, openForm, reportQuestion, diagnostics, questionSnapshot };
})();

if (typeof window !== "undefined") window.Feedback = Feedback;
