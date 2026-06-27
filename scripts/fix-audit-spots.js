/* One-off fixes for content-audit spot claim mismatches in courses-ext-data.js */
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "courses-ext-data.js");
let s = fs.readFileSync(file, "utf8");

const fixes = [
  // c13-q3: real FD + gutshot
  [
    '["Qh", "7h", "2c"], 6, 2, "BB (OOP)", ["9h", "8h"]',
    '["Th", "9h", "2c"], 6, 2, "BB (OOP)", ["8h", "7h"]',
  ],
  // c14-q1: Ah blocker, no missed-FD label
  [
    '"Q\\u2665J\\u2665 missed FD, Ah blocker", "Q\\u2665J\\u2665 花听破产，Ah 阻断", ["Kh", "7h", "3h", "2d", "9c"], 18, 0, "BTN (IP)", ["Qd", "Jc"]',
    '"Ah blocker, air", "Ah 阻断，空气", ["Kh", "7h", "3h", "2d", "9c"], 18, 0, "BTN (IP)", ["Ah", "Qd"]',
  ],
  // c15-q3: real combo draw
  [
    '"9\\u26658\\u2665 FD + OESD", "9\\u26658\\u2665 花听+顺听", ["Th", "9d", "4c", "2s"], 24, 18, "BB (OOP)", ["9h", "8h"]',
    '"T\\u26657\\u2665 FD + OESD", "T\\u26657\\u2665 花听+顺听", ["9h", "8h", "4c", "2s"], 24, 18, "BB (OOP)", ["Th", "7h"]',
  ],
  // c15-q8: nut FD (4 spades)
  [
    '"A\\u2660T\\u2660 nut FD", "A\\u2660T\\u2660 坚果花听", ["Js", "Th", "4d"], 14, 10, "BB (OOP)", ["As", "Ts"]',
    '"A\\u2660K\\u2660 nut FD", "A\\u2660K\\u2660 坚果花听", ["Js", "Ts", "4s"], 14, 10, "BB (OOP)", ["As", "Ks"]',
  ],
  // c16-q9: set not top pair
  [
    '"7\\u26657\\u2663 top pair, 3bp", "7\\u26657\\u2663 顶对，3bp", ["7h", "5d", "2c", "As"], 22, 22, "BTN (IP)", ["7c", "7s"]',
    '"7\\u26657\\u2663 set, 3bp", "7\\u26657\\u2663 三条，3bp", ["7h", "5d", "2c", "As"], 22, 22, "BTN (IP)", ["7c", "7s"]',
  ],
  // c18-q4: nut FD only (drop gutshot)
  [
    '"A\\u2660Q\\u2660 nut FD + gut", "A\\u2660Q\\u2660 坚果花听+卡顺", ["Th", "9h", "4c", "2d"], 16, 11, "BB (OOP)", ["As", "Qs"]',
    '"A\\u2660K\\u2660 nut FD", "A\\u2660K\\u2660 坚果花听", ["9h", "8h", "4c", "2d"], 16, 11, "BB (OOP)", ["Ah", "Kh"]',
  ],
  // c18-q11: real OESD (+ FD)
  [
    '"7\\u26656\\u2665 FD + OESD", "7\\u26656\\u2665 花听+顺听", ["Qh", "Jh", "Td", "2c"], 16, 11, "BB (OOP)", ["7h", "6h"]',
    '"6\\u26655\\u2665 FD + OESD", "6\\u26655\\u2665 花听+顺听", ["9s", "8d", "7c", "2h"], 16, 11, "BB (OOP)", ["6h", "5h"]',
  ],
  // c19-q8: middle pair not top pair
  [
    '"9\\u26658\\u2663 top pair", "9\\u26658\\u2663 顶对", ["9h", "5d", "3c", "Ks"], 8, 0, "BTN (IP)", ["9c", "8h"]',
    '"9\\u26658\\u2663 middle pair", "9\\u26658\\u2663 中对", ["9h", "5d", "3c", "Ks"], 8, 0, "BTN (IP)", ["9c", "8h"]',
  ],
  // c20-q10: air not missed FD
  [
    '"Q\\u2665J\\u2665 missed FD", "Q\\u2665J\\u2665 破产花听", ["Kh", "7h", "3h", "2d", "9c"], 36, 54, "BB (OOP)", ["Qc", "Js"]',
    '"Q\\u2663J\\u2660 air", "Q\\u2663J\\u2660 空气", ["Kh", "7h", "3h", "2d", "9c"], 36, 54, "BB (OOP)", ["Qc", "Js"]',
  ],
  // c21-q5: middle pair
  [
    '"9\\u26658\\u2663 top pair", "9\\u26658\\u2663 顶对", ["9h", "5d", "3c", "Ks"], 6, 0, "BB (OOP)", ["9c", "8h"]',
    '"9\\u26658\\u2663 middle pair", "9\\u26658\\u2663 中对", ["9h", "5d", "3c", "Ks"], 6, 0, "BB (OOP)", ["9c", "8h"]',
  ],
  // c21-q9: set not top pair
  [
    '"7\\u26657\\u2663 top pair", "7\\u26657\\u2663 顶对", ["7h", "5d", "2c", "Ts"], 6, 0, "BB (OOP)", ["7c", "7s"]',
    '"7\\u26657\\u2663 set", "7\\u26657\\u2663 三条", ["7h", "5d", "2c", "Ts"], 6, 0, "BB (OOP)", ["7c", "7s"]',
  ],
  // c22-q12: second pair
  [
    '"8\\u26657\\u2663 top pair", "8\\u26657\\u2663 顶对", ["8h", "5d", "3c", "2s", "Kh"], 14, 0, "BTN (IP)", ["8c", "7h"]',
    '"8\\u26657\\u2663 second pair", "8\\u26657\\u2663 第二对", ["8h", "5d", "3c", "2s", "Kh"], 14, 0, "BTN (IP)", ["8c", "7h"]',
  ],
  // c23-q3: nut FD
  [
    '"A\\u2660Q\\u2660 FD", "A\\u2660Q\\u2660 花听", ["Th", "9h", "4c", "2d"], 18, 12, "BB (OOP)", ["As", "Qs"]',
    '"A\\u2660K\\u2660 nut FD", "A\\u2660K\\u2660 坚果花听", ["9h", "8h", "4c", "2d"], 18, 12, "BB (OOP)", ["Ah", "Kh"]',
  ],
  // c23-q9: 4 hearts
  [
    '"8\\u26657\\u2665 pair + FD", "8\\u26657\\u2665 对子+花听", ["8h", "5h", "2c"], 6, 4, "BB (OOP)", ["8c", "7h"]',
    '"8\\u26657\\u2665 pair + FD", "8\\u26657\\u2665 对子+花听", ["8h", "5h", "2h"], 6, 4, "BB (OOP)", ["8c", "7h"]',
  ],
  // c23-q10: OESD
  [
    '"Q\\u2665J\\u2663 OESD", "Q\\u2665J\\u2663 两头顺听", ["Jh", "Td", "4c", "2s"], 18, 12, "BTN (IP)", ["Qh", "Jc"]',
    '"J\\u2665T\\u2665 OESD", "J\\u2665T\\u2665 两头顺听", ["9s", "8d", "2c", "5h"], 18, 12, "BTN (IP)", ["Jh", "Th"]',
  ],
  // c24-q5: no flush draw claim
  [
    '"Q\\u2665J\\u2663 missed, Kh blocker", "Q\\u2665J\\u2663 破产，Kh 阻断", ["Ah", "9h", "4h", "2d", "7c"], 24, 12, "BB (OOP)", ["Qc", "Js"]',
    '"Q\\u2663J\\u2660 air", "Q\\u2663J\\u2660 空气", ["Ah", "9h", "4h", "2d", "7c"], 24, 12, "BB (OOP)", ["Qc", "Js"]',
  ],
  // c28-q10: nut FD flop
  [
    '"A\\u2660Q\\u2660 nut FD", "A\\u2660Q\\u2660 坚果花听", ["Jh", "9h", "4c"], 6, 4, "BB (OOP)", ["As", "Qs"]',
    '"A\\u2660K\\u2660 nut FD", "A\\u2660K\\u2660 坚果花听", ["Jh", "9h", "4h"], 6, 4, "BB (OOP)", ["As", "Ks"]',
  ],
];

for (const [from, to] of fixes) {
  if (!s.includes(from)) {
    console.error("MISSING:", from.slice(0, 60));
    process.exit(1);
  }
  s = s.replace(from, to);
}
fs.writeFileSync(file, s, "utf8");
console.log("Applied", fixes.length, "fixes");
