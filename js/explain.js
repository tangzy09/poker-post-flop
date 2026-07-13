/* explain.js — computed, bilingual feedback for both correct and wrong answers.
   Reuses a self-contained hand evaluator to inject real numbers (outs / equity /
   pot odds / MDF). Returns a string in the current language, or null to let
   engine.feedbackFor fall back to the hand-written reasonKey text.
   Loads after i18n.js; uses globals curLang()/t(). */
(function () {
  var RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
  /* 措辞全部走 i18n 模板(t("fb.*", {vars})) —— 旧的 L(zh,en) 直接拼字符串在德/日语下拼不出通顺句,
     已整段移除。数字与不等式仍在本文件算,只把结果填进模板占位符。 */

  function rset(cards) { var s = new Set(cards.map(function (c) { return RANK[c[0]]; })); if (s.has(14)) s.add(1); return s; }
  function hasStr(set) { for (var lo = 1; lo <= 10; lo++) { var ok = true; for (var r = lo; r < lo + 5; r++) if (!set.has(r)) { ok = false; break; } if (ok) return true; } return false; }
  function straightOutRanks(all) {
    var b = rset(all); if (hasStr(b)) return null; var out = [];
    for (var r = 2; r <= 14; r++) { if (b.has(r)) continue; var s = new Set(b); s.add(r); if (r === 14) s.add(1); if (hasStr(s)) out.push(r); }
    return out;
  }
  function evalSpot(board, hand) {
    var all = board.concat(hand), rc = {}, sc = {}, i;
    for (i = 0; i < all.length; i++) { rc[all[i][0]] = (rc[all[i][0]] || 0) + 1; sc[all[i][1]] = (sc[all[i][1]] || 0) + 1; }
    var trips = Object.keys(rc).filter(function (r) { return rc[r] === 3; });
    var quads = Object.keys(rc).filter(function (r) { return rc[r] === 4; });
    var pairs = Object.keys(rc).filter(function (r) { return rc[r] === 2; });
    var flush = Object.keys(sc).find(function (s) { return sc[s] >= 5; });
    var str = hasStr(rset(all)), cat = "high";
    if (quads.length) cat = "quads";
    else if (trips.length && (pairs.length || trips.length > 1)) cat = "full house";
    else if (flush) cat = "flush"; else if (str) cat = "straight"; else if (trips.length) cat = "trips";
    else if (pairs.length >= 2) cat = "two pair"; else if (pairs.length === 1) cat = "pair";
    var fd = null, nut = false;
    if (!flush) Object.keys(sc).forEach(function (s) {
      if (sc[s] === 4 && board.filter(function (c) { return c[1] === s; }).length >= 2) {
        fd = s; nut = hand.some(function (c) { return c[0] === "A" && c[1] === s; });
      }
    });
    var isSet = hand.length === 2 && hand[0][0] === hand[1][0] && trips.indexOf(hand[0][0]) >= 0;
    return { cat: isSet ? "set" : cat, fd: fd, nut: nut, sRanks: straightOutRanks(all), rc: rc };
  }

  var TOCOME = { flop: 2, turn: 1, river: 0 };
  function drawTags(ev) {
    var o = 0, tags = [];
    if (ev.fd) { o += 9; tags.push((ev.nut ? t("fb.draw.nut") : "") + t("fb.draw.flushdraw") + "(9)"); }
    if (ev.sRanks && ev.sRanks.length) {
      var so = 0;
      ev.sRanks.forEach(function (r) {
        var rk = Object.keys(RANK).find(function (k) { return RANK[k] === r; }) || String(r);
        var cards = 4 - (ev.rc[rk] || 0); if (ev.fd) cards -= 1;
        so += Math.max(cards, 0);
      });
      tags.push((so >= 7 ? t("fb.draw.openender") : t("fb.draw.gutshot")) + "(" + so + ")");
      o += so;
    }
    return { outs: o, tags: tags };
  }
  function eq(outs, toCome) { return toCome >= 2 ? Math.min(outs * 4, 90) : outs * 2; }
  function potOdds(pot, bet) { return { need: Math.round((bet / (pot + 2 * bet)) * 100), ratio: +((pot + bet) / bet).toFixed(1) }; }
  function mdf(pot, bet) { return Math.round((1 - bet / (pot + bet)) * 100); }

  var ACT = { fold: 1, call: 1, raise: 1, bet: 1, check: 1, jam: 1 };
  function actName(a) { return ACT[a] ? t("fb.act." + a) : a; }
  function rec(q) { return q.correct.map(actName).join("/"); }
  // 牌型 → i18n key(值里有空格,单独映射)
  var CAT = {
    set: "set", "two pair": "twopair", trips: "trips", straight: "straight", flush: "flush",
    "full house": "fullhouse", quads: "quads", pair: "pair", high: "high",
  };
  function catName(c) { return CAT[c] ? t("fb.cat." + CAT[c]) : c; }
  var STRONG = { set: 1, trips: 1, "two pair": 1, straight: 1, flush: 1, "full house": 1, quads: 1 };

  function tag(ok) { return ok ? "✓ " : "✗ "; }

  // ---- CHOICE (concept / math) ----
  function explainChoice(q, choice, ok) {
    // ⚠ 必须从**英文源**解析底池/下注数字,不能用 t()(= 当前语言)。题干一旦翻成 ja/de/es,
    // 下面两条正则全部失配 → 计算式反馈(底池赔率 + MDF)会**静默消失**,还不报错。
    // tEn() 拿的是 STR.en,恒在、与界面语言无关。中文正则留作兜底(英文源理论上不会命中它)。
    var stem = (typeof tEn === "function" && tEn(q.stemKey)) || t(q.stemKey);
    var m = stem.match(/[Pp]ot (?:is )?(\d+)[^\d]*?bets?\s*(\d+)/) || stem.match(/底池\s*(\d+)[^\d]*?下注\s*(\d+)/);
    var corrLbl = t(q.options.find(function (o) { return o.id === q.correct[0]; }).labelKey);
    if (m) {
      var pot = +m[1], bet = +m[2], od = potOdds(pot, bet), d = mdf(pot, bet);
      var calc = t("fb.choice.calc", {
        pot: pot, bet: bet, total: pot + bet, ratio: od.ratio, need: od.need, mdf: d,
      });
      if (ok) return tag(true) + calc + " " + t("fb.choice.right", { ans: corrLbl });
      var picked = t(q.options.find(function (o) { return o.id === choice; }).labelKey);
      return tag(false) + t("fb.choice.picked", { picked: picked }) + " " + calc + " " + t("fb.choice.answer", { ans: corrLbl });
    }
    // non-math concept MCQ: affirm on correct (fills the gap); defer to reasonKey on wrong
    if (ok) return tag(true) + t("fb.choice.correct", { ans: corrLbl });
    return null;
  }

  // ---- ACTION (post-flop board+hand) ----
  function explainAction(q, choice, ok) {
    var s = q.spot; if (!s) return null;
    var b = (s.board || []).filter(Boolean), hero = s.hero || {}, h = (hero.hand || []).filter(Boolean);
    if (h.length < 2 || b.length < 3) return null; // range / malformed → fallback
    var ev = evalSpot(b, h), toCome = TOCOME[s.street || "flop"];
    var foldRight = q.correct.indexOf("fold") >= 0;
    var valueRight = q.correct.indexOf("bet") >= 0 || q.correct.indexOf("raise") >= 0;
    var hasDraw = (ev.fd || (ev.sRanks && ev.sRanks.length)) && !STRONG[ev.cat];

    // 1) draw spot facing a bet — compare ONE-card equity (rule of 2) to the price.
    //    Borderline draws are decided by implied / reverse-implied odds, not raw odds,
    //    so never assert a false "eq > need" / "eq < need" inequality.
    if (toCome > 0 && hasDraw) {
      var d = drawTags(ev);
      var oneCard = Math.min(d.outs * 2 + (d.outs >= 9 ? 1 : 0), 59); // ≈ one-card hit %
      var od = s.bet ? potOdds(s.pot, s.bet) : null;
      // 已成对子 + 听牌:如实说明摊牌价值,并标注 outs 仅计听牌(不编对子改进的具体数字)
      var hasPair = ev.cat === "pair";
      // 四种组合各自是完整句(有无对子 × 有无面对下注),不做片段拼接 —— 见 i18n.js 的模板铁律
      var headKey = "fb.draw.head" + (hasPair ? ".pair" : "") + (od ? ".facing" : "");
      var head = t(headKey, {
        tags: d.tags.join(" + "), outs: d.outs, pct: oneCard,
        bet: s.bet, pot: s.pot, need: od ? od.need : "", ratio: od ? od.ratio : "",
      });
      var clears = od && oneCard >= od.need;
      var tailKey;
      if (!od) tailKey = "fb.draw.tail.nobet";
      else if (foldRight && !clears) tailKey = "fb.draw.tail.short";
      else if (foldRight) tailKey = "fb.draw.tail.reverse";
      else if (clears) tailKey = "fb.draw.tail.clears";
      else tailKey = "fb.draw.tail.implied";
      var tail = t(tailKey + (ok ? ".ok" : ".wrong"), {
        pct: oneCard, need: od ? od.need : "", rec: rec(q),
      });
      return tag(ok) + head + " " + tail;
    }

    // 2) river bluff-catch — MDF
    if ((s.street === "river" || s.street === "turn") && s.bet && q.correct.indexOf("call") >= 0 && (ev.cat === "pair" || ev.cat === "two pair")) {
      var D = mdf(s.pot, s.bet), need = potOdds(s.pot, s.bet).need;
      var bc = t("fb.bluffcatch.base", {
        cat: catName(ev.cat), bet: s.bet, total: s.pot + s.bet, mdf: D, need: need,
      });
      if (ok && choice === "call") return tag(true) + bc + " " + t("fb.bluffcatch.call");
      if (choice === "fold") return tag(false) + bc + " " + t("fb.bluffcatch.fold");
      if (choice === "raise") return tag(false) + bc + " " + t("fb.bluffcatch.raise");
    }

    // 3) strong made hand
    if (STRONG[ev.cat]) {
      var c = catName(ev.cat);
      if (valueRight) {
        if (ok) return tag(true) + t("fb.strong.value.ok", { cat: c, rec: rec(q) });
        return tag(false) + t("fb.strong.value.wrong", { cat: c, rec: rec(q) });
      }
      if (ok) return tag(true) + t("fb.strong.line.ok", { cat: c, rec: rec(q) });
      return null; // unusual; defer to reasonKey
    }

    // 4) weak made / air facing a bet, fold is right — pot-odds insufficient
    if (foldRight && s.bet && (ev.cat === "pair" || ev.cat === "high")) {
      var od2 = potOdds(s.pot, s.bet), cw = catName(ev.cat);
      var v = { cat: cw, bet: s.bet, need: od2.need, rec: rec(q) };
      if (ok) return tag(true) + t("fb.weak.ok", v);
      return tag(false) + t("fb.weak.wrong", v);
    }

    // 5) correct but not specifically computed → light affirm; wrong → defer
    if (ok) return tag(true) + t("fb.generic.ok", { rec: rec(q) });
    return null;
  }

  function explainFeedback(q, choice, ok) {
    try {
      if (!q) return null;
      if (q.type === "choice") return explainChoice(q, choice, ok);
      if (q.type === "action") return explainAction(q, choice, ok);
    } catch (e) { /* never break feedback */ }
    return null;
  }

  if (typeof window !== "undefined") window.explainFeedback = explainFeedback;
  if (typeof module !== "undefined" && module.exports) module.exports = { explainFeedback: explainFeedback };
})();
