/* range-chart.js — C3 range + equity visualization (HU BTN open vs BB call) */
const RC_RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const RC_RIDX = {};
RC_RANKS.forEach((r, i) => {
  RC_RIDX[r] = i;
});
const RC_RX = "[2-9TJQKA]";

// HU 100bb reference ranges (same as pokerPreFlop PACKS cash 2-player).
const HU_BTN_OPEN =
  "22+, A2s+, K2s+, Q2s+, J3s+, T5s+, 95s+, 84s+, 74s+, 63s+, 53s+, 43s, A2o+, K2o+, Q5o+, J7o+, T7o+, 97o+, 86o+, 76o, 65o";
const HU_BB_CALL =
  "22-66, A2s-A8s, K2s-K8s, Q2s-QTs, J2s-JTs, T5s-T9s, 95s+, 85s+, 74s+, 64s+, 53s+, A2o-A9o, K2o-KJo, Q5o+, J7o+, T7o+, 97o+, 87o, 76o, 65o";

const RC_SAMPLES = 12000;

function expandRange(str) {
  const out = new Set();
  if (!str) return out;
  str.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((tok) => {
      let m;
      if ((m = tok.match(new RegExp("^(" + RC_RX + ")\\1\\+$")))) {
        for (let i = RC_RIDX[m[1]]; i >= 0; i--) out.add(RC_RANKS[i] + RC_RANKS[i]);
      } else if ((m = tok.match(new RegExp("^(" + RC_RX + ")\\1-(" + RC_RX + ")\\2$")))) {
        let a = RC_RIDX[m[1]],
          b = RC_RIDX[m[2]],
          lo = Math.min(a, b),
          hi = Math.max(a, b);
        for (let i = lo; i <= hi; i++) out.add(RC_RANKS[i] + RC_RANKS[i]);
      } else if ((m = tok.match(new RegExp("^(" + RC_RX + ")\\1$")))) {
        out.add(m[1] + m[1]);
      } else if ((m = tok.match(new RegExp("^(" + RC_RX + ")(" + RC_RX + ")([so])\\+$")))) {
        let f = RC_RIDX[m[1]],
          s = RC_RIDX[m[2]],
          suf = m[3];
        for (let i = s; i > f; i--) out.add(RC_RANKS[f] + RC_RANKS[i] + suf);
      } else if ((m = tok.match(new RegExp("^(" + RC_RX + ")(" + RC_RX + ")([so])-(" + RC_RX + ")(" + RC_RX + ")\\3$")))) {
        let f = RC_RIDX[m[1]],
          s1 = RC_RIDX[m[2]],
          s2 = RC_RIDX[m[5]],
          suf = m[3],
          lo = Math.min(s1, s2),
          hi = Math.max(s1, s2);
        for (let i = lo; i <= hi; i++) if (i > f) out.add(RC_RANKS[f] + RC_RANKS[i] + suf);
      } else if ((m = tok.match(new RegExp("^(" + RC_RX + ")(" + RC_RX + ")([so])$")))) {
        let a = RC_RIDX[m[1]],
          b = RC_RIDX[m[2]],
          hi = Math.min(a, b),
          lo = Math.max(a, b);
        out.add(RC_RANKS[hi] + RC_RANKS[lo] + m[3]);
      }
    });
  return out;
}

const _BTN_SET = expandRange(HU_BTN_OPEN);
const _BB_SET = expandRange(HU_BB_CALL);
const _BTN_LABELS = [..._BTN_SET];
const _BB_LABELS = [..._BB_SET];

function rcHandLabel(r, c) {
  if (r === c) return RC_RANKS[r] + RC_RANKS[c];
  return r < c ? RC_RANKS[r] + RC_RANKS[c] + "s" : RC_RANKS[c] + RC_RANKS[r] + "o";
}

function boardToInts(board) {
  return (board || []).map((c) => parseCard(c[0] + c[1].toLowerCase()));
}

function boardSeed(board) {
  let h = 0xc3;
  for (const c of board || []) {
    h = (h * 31 + c.charCodeAt(0)) | 0;
    h = (h * 31 + c.charCodeAt(1)) | 0;
  }
  return h >>> 0;
}

function computeHuEquity(board) {
  const ints = boardToInts(board);
  if (ints.length < 3) return null;
  const rng = mulberry32(boardSeed(board));
  return rangeEquityBoard(_BTN_LABELS, _BB_LABELS, ints, RC_SAMPLES, rng);
}

function eqBar(name, pct, color) {
  return (
    '<div class="eq-bar">' +
    '<div class="eq-bar-head"><span>' +
    name +
    '</span><span class="eq-pct">' +
    pct.toFixed(1) +
    "%</span></div>" +
    '<div class="eq-track"><i style="width:' +
    pct.toFixed(1) +
    "%;background:" +
    color +
    '"></i></div></div>'
  );
}

function renderRangeMatrix(btnSet, bbSet) {
  let hdr = '<div class="rm-corner"></div>';
  for (let c = 0; c < 13; c++) hdr += '<div class="rm-lbl">' + RC_RANKS[c] + "</div>";
  let rows = hdr;
  for (let r = 0; r < 13; r++) {
    rows += '<div class="rm-lbl rm-row">' + RC_RANKS[r] + "</div>";
    for (let c = 0; c < 13; c++) {
      const lbl = rcHandLabel(r, c);
      const inBtn = btnSet.has(lbl);
      const inBb = bbSet.has(lbl);
      let cls = "rm-cell";
      if (inBtn && inBb) cls += " both";
      else if (inBtn) cls += " btn";
      else if (inBb) cls += " bb";
      rows += '<div class="' + cls + '" title="' + lbl + '">' + (r === c ? RC_RANKS[r] : "") + "</div>";
    }
  }
  return '<div class="range-matrix">' + rows + "</div>";
}

function boardTextureHint(board) {
  const ranks = (board || []).map((c) => RC_RIDX[c[0].toUpperCase()]).sort((a, b) => a - b);
  if (ranks.length < 3) return t("range.hintNeutral");
  const hi = ranks[0];
  const lo = ranks[ranks.length - 1];
  const span = lo - hi;
  const suits = board.map((c) => c[1].toLowerCase());
  const flushDraw = new Set(suits).size < suits.length;
  const paired = ranks[0] === ranks[1] || ranks[1] === ranks[2];
  const lowBoard = hi >= RC_RIDX["8"];
  const connected =
    span <= 4 &&
    ((ranks[1] - ranks[0] <= 2) || (ranks[2] - ranks[1] <= 2));

  if (hi <= RC_RIDX["T"] && span >= 4 && !flushDraw && !paired) return t("range.hintDryHigh");
  if (paired && span >= 4) return t("range.hintPairedDry");
  if (lowBoard && connected) return t("range.hintLowConnected");
  if (connected && flushDraw) return t("range.hintWet");
  if (connected) return t("range.hintConnected");
  return t("range.hintNeutral");
}

function renderRangeChart(container, board) {
  if (!container || !board || board.length < 3) return;
  container.innerHTML =
    '<div class="range-chart">' +
    '<p class="range-chart-note">' +
    t("range.note") +
    "</p>" +
    '<div class="range-chart-loading">' +
    t("range.computing") +
    "</div></div>";

  setTimeout(function () {
    const eq = computeHuEquity(board);
    if (eq == null) {
      container.innerHTML = '<p class="muted">' + t("range.error") + "</p>";
      return;
    }
    const btnPct = eq * 100;
    const bbPct = 100 - btnPct;
    const edge = btnPct - bbPct;
    const lead =
      Math.abs(edge) >= 2
        ? edge > 0
          ? t("range.edgeBtn", { pct: edge.toFixed(1) })
          : t("range.edgeBb", { pct: Math.abs(edge).toFixed(1) })
        : boardTextureHint(board);

    container.innerHTML =
      '<div class="range-chart">' +
      '<p class="range-chart-note">' +
      t("range.note") +
      "</p>" +
      '<div class="eq-bars">' +
      eqBar(t("range.btn"), btnPct, "var(--gold)") +
      eqBar(t("range.bb"), bbPct, "var(--call)") +
      "</div>" +
      '<p class="range-edge-lbl">' +
      lead +
      "</p>" +
      renderRangeMatrix(_BTN_SET, _BB_SET) +
      '<div class="range-legend">' +
      '<span><i class="lg btn"></i>' +
      t("range.legendBtn") +
      "</span>" +
      '<span><i class="lg bb"></i>' +
      t("range.legendBb") +
      "</span>" +
      '<span><i class="lg both"></i>' +
      t("range.legendBoth") +
      "</span>" +
      "</div></div>";
  }, 16);
}
