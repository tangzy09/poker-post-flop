/* table.js — poker table rendering (supports 2 to 9 seats) */
const SUIT_SYM = { c: "♣", d: "♦", h: "♥", s: "♠" };
const SUIT_CLS = { c: "blk", d: "red", h: "red", s: "blk" };

function parseCard(str) {
  if (!str || str.length < 2) return null;
  const rank = str[0].toUpperCase();
  const suit = str[1].toLowerCase();
  return { rank, suit, sym: SUIT_SYM[suit] || "?", cls: SUIT_CLS[suit] || "blk" };
}

function cardHtml(card, flip, extra) {
  const c = typeof card === "string" ? parseCard(card) : card;
  if (!c) return "";
  const cls = "card" + (flip ? " flip" : "") + (extra ? " " + extra : "");
  return (
    '<div class="' + cls + '">' +
    '<div class="back"></div>' +
    '<div class="face ' + c.cls + '">' +
    '<span class="rk">' + c.rank + "</span>" +
    '<span class="pip-c">' + c.sym + "</span>" +
    '<span class="rk br">' + c.rank + "</span>" +
    "</div></div>"
  );
}

function backCardHtml(extra) {
  return '<div class="card' + (extra ? " " + extra : "") + '"><div class="back"></div></div>';
}

// Chip stack with an amount label. Empty string when amount is 0/undefined.
function chipStackHtml(amount, side) {
  if (!amount) return "";
  const n = Math.min(4, Math.max(1, Math.round(amount / 4)));
  let discs = "";
  for (let i = 0; i < n; i++) discs += '<span class="disc" style="bottom:' + i * 4 + 'px"></span>';
  return (
    '<span class="chip-stack ' + (side || "") + '">' +
    '<span class="discs">' + discs + "</span>" +
    '<span class="chip-amt">' + amount + "</span>" +
    "</span>"
  );
}

// Derive a short position name from a raw label like "BTN (IP)", "BB (OOP)", "IP".
function posName(raw, isIP) {
  const s = (raw || "").toUpperCase();
  if (s.indexOf("BTN") >= 0) return "BTN";
  if (s.indexOf("SB") >= 0) return "SB";
  if (s.indexOf("BB") >= 0) return "BB";
  if (s.indexOf("CO") >= 0) return "CO";
  if (s.indexOf("UTG") >= 0) return "UTG";
  // Heads-up default: the in-position player holds the button.
  return isIP ? "BTN" : "BB";
}

function seatBadge(posLabel, isIP, withDealer) {
  return (
    '<span class="seat-badge ' + (isIP ? "ip" : "oop") + '">' +
    '<span class="pos-name">' + posLabel + "</span>" +
    (isIP != null ? '<span class="pos-rel">' + (isIP ? "IP" : "OOP") + "</span>" : "") +
    (withDealer ? '<span class="dealer">D</span>' : "") +
    "</span>"
  );
}

// Non-hero seat: round avatar with position, optional face-down cards / dealer / stack.
function _opponentSeatHtml(p, left, top) {
  const style = "left:" + left.toFixed(1) + "%;top:" + top.toFixed(1) + "%;";
  return (
    '<div class="pseat' + (p.folded ? " folded" : "") + '" style="' + style + '">' +
    (p.back && !p.folded ? '<div class="seat-cards">' + backCardHtml("sm") + backCardHtml("sm") + "</div>" : "") +
    '<div class="avatar' + (p.dealer ? " has-d" : "") + '"><span class="av-pos">' + p.pos + "</span></div>" +
    (p.dealer ? '<span class="seat-d">D</span>' : "") +
    (p.stack != null ? '<span class="av-stack">' + p.stack + " bb</span>" : "") +
    "</div>"
  );
}

function _heroSeatHtml(p, heroLabel) {
  const hand = (p.hand || []).map((c) => cardHtml(c, true, "mid")).join("");
  return (
    '<div class="pseat hero" style="left:50%;bottom:8px;">' +
    '<div class="seat-cards big">' + hand + "</div>" +
    seatBadge(p.pos, p.ip, p.dealer) +
    (heroLabel ? '<span class="hand-lbl">' + heroLabel + "</span>" : "") +
    (p.stack != null ? '<span class="av-stack">' + p.stack + " bb</span>" : "") +
    "</div>"
  );
}

function _betHtml(bet, left, top) {
  return '<div class="bet-spot" style="left:' + left.toFixed(1) + "%;top:" + top.toFixed(1) + '%;">' + chipStackHtml(bet) + "</div>";
}

/* renderTable — draws a model:
   { board:[], street:"FLOP", pot:n, heroLabel:"", players:[ {hero, pos, ip, dealer, bet, stack, hand, back, folded} ] }
   The hero sits anchored at the bottom; opponents spread across the top arc. */
function renderTable(m, container) {
  if (!m || !container) return;
  const opps = m.players.filter((p) => !p.hero);
  const hero = m.players.find((p) => p.hero);
  const parts = [];

  const RX = 44, RY = 40, BRX = 24, BRY = 23;
  opps.forEach((p, j) => {
    const angDeg = opps.length === 1 ? 270 : 180 + j * (180 / (opps.length - 1));
    const a = (angDeg * Math.PI) / 180;
    const left = 50 + RX * Math.cos(a);
    const top = 50 + RY * Math.sin(a);
    parts.push(_opponentSeatHtml(p, left, top));
    if (p.bet) parts.push(_betHtml(p.bet, 50 + BRX * Math.cos(a), 50 + BRY * Math.sin(a)));
  });

  if (hero) {
    parts.push(_heroSeatHtml(hero, m.heroLabel));
    if (hero.bet) parts.push(_betHtml(hero.bet, 50, 70));
  }

  const board = (m.board || []).map((c) => cardHtml(c, true, "mini")).join("");
  const potHtml = m.pot
    ? '<div class="tbl-pot">' + chipStackHtml(m.pot, "pot") + '<span class="pot-lbl">' + t("felt.pot") + " " + m.pot + "</span></div>"
    : "";

  container.innerHTML =
    '<div class="poker-table' + (opps.length > 1 ? " multiway" : "") + '">' +
    parts.join("") +
    '<div class="tbl-center">' +
    potHtml +
    (board ? '<div class="tbl-board">' + board + "</div>" : "") +
    (m.street ? '<div class="street-tag">' + m.street + "</div>" : "") +
    "</div></div>";
}

// Build a heads-up model from a drill spot and render it.
function renderSpot(spot, container) {
  if (!spot || !container) return;
  const hero = spot.hero || {};
  const heroIP = !/OOP/.test(hero.pos || "");
  const model = {
    board: spot.board || [],
    street: (spot.street || "flop").toUpperCase(),
    pot: spot.pot != null ? spot.pot : 0,
    heroLabel: hero.labelKey ? t(hero.labelKey) : hero.label || "",
    players: [
      { hero: true, pos: posName(hero.pos, heroIP), ip: heroIP, dealer: heroIP, hand: hero.hand || [] },
      { pos: posName("", !heroIP), ip: !heroIP, dealer: !heroIP, back: true, bet: spot.bet || 0 },
    ],
  };
  renderTable(model, container);
}

/* Demo models for the Table view — preflop snapshots at different table sizes.
   Opponents are ordered left→right across the top; blinds flank the hero. */
const _DEMO = {
  2: [{ pos: "BB", bet: 2, stack: 100, back: true }],
  3: [
    { pos: "SB", bet: 1, stack: 96, back: true },
    { pos: "BB", bet: 2, stack: 120, back: true },
  ],
  6: [
    { pos: "SB", bet: 1, stack: 80, back: true },
    { pos: "UTG", bet: 6, stack: 100, back: true },
    { pos: "MP", stack: 75, folded: true },
    { pos: "CO", stack: 140, folded: true },
    { pos: "BB", bet: 2, stack: 130, back: true },
  ],
  9: [
    { pos: "SB", bet: 1, stack: 88, back: true },
    { pos: "UTG", bet: 6, stack: 100, back: true },
    { pos: "UTG1", stack: 70, folded: true },
    { pos: "MP", stack: 120, folded: true },
    { pos: "LJ", stack: 95, folded: true },
    { pos: "HJ", stack: 60, folded: true },
    { pos: "CO", bet: 6, stack: 150, back: true },
    { pos: "BB", bet: 2, stack: 130, back: true },
  ],
};

function demoTableModel(n) {
  const opps = (_DEMO[n] || _DEMO[6]).map((o) => ({ ...o, dealer: false }));
  const hero = { hero: true, ip: true, dealer: true, pos: "BTN", stack: 100, hand: ["Ah", "Kh"] };
  return { board: [], street: "PREFLOP", pot: 0, heroLabel: "A♥K♥", players: [hero, ...opps] };
}

function renderDemoTable(n, container) {
  renderTable(demoTableModel(n), container);
}
