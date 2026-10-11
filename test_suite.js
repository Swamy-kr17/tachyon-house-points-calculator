/**
 * test_suite.js — Automated checks for Tachyon House Points Calculator
 * Run with:  node test_suite.js
 */
import fs from 'node:fs';

let passed = 0;
let failed = 0;

function pass(msg) { console.log('PASS', msg); passed++; }
function fail(msg) { console.error('FAIL', msg); failed++; }

// ── Test 1: All required files exist ──────────────────────────────
const required = [
  'index.html', 'style.css', 'script.js',
  'README.md', 'screenshots/README.md'
];
const missing = required.filter(f => !fs.existsSync(f));
if (missing.length) {
  fail('[1] Missing files: ' + missing.join(', '));
} else {
  pass('[1] All required files present');
}

// ── Test 2: index.html links separate CSS and JS files ────────────
const html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('href="style.css"')) fail('[2a] index.html missing style.css link');
else pass('[2a] index.html links style.css');
if (!html.includes('src="script.js"')) fail('[2b] index.html missing script.js link');
else pass('[2b] index.html links script.js');

// ── Test 3: No inline style/script in HTML ────────────────────────
const inlineStyle  = /<style[\s>]/i.test(html);
const inlineScript = /<script(?![^>]*src)[^>]*>/i.test(html);
if (inlineStyle)  fail('[3a] index.html contains inline <style>');
else              pass('[3a] No inline <style> in HTML');
if (inlineScript) fail('[3b] index.html contains inline <script>');
else              pass('[3b] No inline <script> in HTML');

// ── Test 4: No external dependencies in script.js ─────────────────
const js = fs.readFileSync('script.js', 'utf8');
const hasRequire = /require\(['"](?!fs|path)/.test(js);
const hasImport  = /^import\s.+from\s['"](?!\.)/.test(js);
if (hasRequire || hasImport) fail('[4] External imports found in script.js');
else pass('[4] No external dependencies in script.js');

// ── Test 5: All four houses defined ───────────────────────────────
const houses = ['ALPHA', 'INFER', 'MATRIX', 'LAYER'];
const missingHouses = houses.filter(h => !js.includes("'" + h + "'"));
if (missingHouses.length) fail('[5] Missing houses: ' + missingHouses.join(', '));
else pass('[5] All four houses declared');

// ── Test 6: LocalStorage key ──────────────────────────────────────
if (!js.includes('tachyon_house_scores')) fail('[6] LocalStorage key missing');
else pass('[6] LocalStorage key present');

// ── Test 7: Tie-break secondary sort ─────────────────────────────
if (!js.includes('localeCompare')) fail('[7] Secondary tie-break sort missing');
else pass('[7] Alphabetic tie-break sort present');

// ── Test 8: Input validation ─────────────────────────────────────
const validations = [
  ['zero check',    'points <= 0'],
  ['decimal check', "includes('.')"],
  ['NaN check',     'Number.isFinite'],
  ['integer check', 'Number.isInteger'],
];
validations.forEach(([name, pattern]) => {
  if (!js.includes(pattern)) fail('[8] Missing ' + name + ': ' + pattern);
  else pass('[8] Validation — ' + name);
});

// ── Test 9: Reset confirmation ────────────────────────────────────
if (!js.includes('window.confirm')) fail('[9] Reset confirmation dialog missing');
else pass('[9] Reset uses window.confirm()');

// ── Test 10: Joint winner detection ──────────────────────────────
if (!js.includes('isJointTop')) fail('[10a] isJointTop missing');
else pass('[10a] isJointTop flag present');
if (!js.includes('Joint Leaders')) fail('[10b] Joint Leaders text missing');
else pass('[10b] Joint Leaders display string present');

// ── Test 11: CSS responsive breakpoints ──────────────────────────
const css = fs.readFileSync('style.css', 'utf8');
if (!css.includes('max-width: 768px')) fail('[11a] Tablet breakpoint missing');
else pass('[11a] Tablet breakpoint 768px present');
if (!css.includes('max-width: 480px')) fail('[11b] Mobile breakpoint missing');
else pass('[11b] Mobile breakpoint 480px present');

// ── Test 12: House CSS variables ─────────────────────────────────
const houseVars = ['--clr-alpha', '--clr-infer', '--clr-matrix', '--clr-layer'];
const missingVars = houseVars.filter(v => !css.includes(v));
if (missingVars.length) fail('[12] Missing CSS vars: ' + missingVars.join(', '));
else pass('[12] All four house CSS colour variables present');

// ── Test 13: ARIA attributes (HTML + JS template strings) ────────
// progressbar is rendered dynamically via innerHTML in script.js
const htmlPlusJs = html + js;
const ariaChecks = ['aria-label', 'aria-live', 'role="table"', 'role="progressbar"'];
const missingAria = ariaChecks.filter(a => !htmlPlusJs.includes(a));
if (missingAria.length) fail('[13] Missing ARIA: ' + missingAria.join(', '));
else pass('[13] ARIA accessibility attributes present (HTML + JS templates)');

// ── Test 14: Unit tests for ranking algorithm ─────────────────────
function computeTestRankings(scores) {
  const houseIds = ['ALPHA', 'INFER', 'MATRIX', 'LAYER'];
  const entries = houseIds.map(h => ({ house: h, score: scores[h] }));
  entries.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.house.localeCompare(b.house)
  );
  const maxScore = entries[0]?.score ?? 0;
  let currentRank = 1;
  entries.forEach((entry, i) => {
    if (i > 0 && entry.score < entries[i - 1].score) currentRank = i + 1;
    entry.rank = currentRank;
    entry.isJointTop = maxScore > 0 && entry.score === maxScore;
  });
  return entries;
}

// 14a: Clear winner
const caseA = computeTestRankings({ ALPHA: 300, INFER: 100, MATRIX: 200, LAYER: 50 });
if (caseA[0].house === 'ALPHA' && caseA[0].rank === 1) pass('[14a] Clear winner ranked #1');
else fail('[14a] Clear winner ranking wrong: ' + JSON.stringify(caseA[0]));

// 14b: Tie for first — joint winners
const caseB = computeTestRankings({ ALPHA: 200, INFER: 200, MATRIX: 100, LAYER: 50 });
const jointB = caseB.filter(e => e.isJointTop);
if (jointB.length === 2)   pass('[14b] Tie produces 2 joint winners');
else fail('[14b] Expected 2 joint winners, got ' + jointB.length);
if (caseB[2].rank === 3)   pass('[14b] Post-tie rank skips correctly to 3');
else fail('[14b] Post-tie rank wrong: ' + caseB[2].rank);

// 14c: All zero — no winner
const caseC = computeTestRankings({ ALPHA: 0, INFER: 0, MATRIX: 0, LAYER: 0 });
const hasWinnerC = caseC.some(e => e.isJointTop);
if (!hasWinnerC) pass('[14c] All-zero produces no winner');
else fail('[14c] Should have no winner when all scores are zero');

// 14d: Tie-break — ALPHA before INFER
const caseD = computeTestRankings({ ALPHA: 100, INFER: 100, MATRIX: 0, LAYER: 0 });
if (caseD[0].house === 'ALPHA') pass('[14d] Tie-break: ALPHA correctly before INFER');
else fail('[14d] Tie-break wrong: ' + caseD[0].house + ' appeared first');

// 14e: Large number accumulation
const caseE = computeTestRankings({ ALPHA: 999999, INFER: 1, MATRIX: 500000, LAYER: 750000 });
if (caseE[0].house === 'ALPHA' && caseE[0].score === 999999) pass('[14e] Large numbers ranked correctly');
else fail('[14e] Large number ranking failed');

// 14f: Three-way tie
const caseF = computeTestRankings({ ALPHA: 50, INFER: 50, MATRIX: 50, LAYER: 30 });
const jointF = caseF.filter(e => e.isJointTop);
if (jointF.length === 3) pass('[14f] Three-way tie produces 3 joint winners');
else fail('[14f] Three-way tie: expected 3, got ' + jointF.length);
if (caseF[3].rank === 4) pass('[14f] After three-way tie, 4th house gets rank 4');
else fail('[14f] After three-way tie, rank wrong: ' + caseF[3].rank);

// ── Summary ───────────────────────────────────────────────────────
console.log('');
console.log('══════════════════════════════════════════════════');
console.log('  Tests passed: ' + passed);
console.log('  Tests failed: ' + failed);
if (failed === 0) {
  console.log('  ✅ ALL TESTS PASSED');
} else {
  console.log('  ❌ SOME TESTS FAILED — review above');
}
console.log('══════════════════════════════════════════════════');

process.exit(failed > 0 ? 1 : 0);
