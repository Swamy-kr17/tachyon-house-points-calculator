'use strict';
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const css  = fs.readFileSync('style.css', 'utf8');
const js   = fs.readFileSync('script.js', 'utf8');

let p = 0, f = 0;
const pass = m => { console.log('PASS', m); p++; };
const fail = m => { console.error('FAIL', m); f++; };

// ── NAV ──────────────────────────────────────────────────────────
['nav-header','nav-brand','nav-wordmark','nav-links','nav-burger','mobile-menu'].forEach(id => {
  if (html.includes(id)) pass('Nav: ' + id);
  else fail('Nav missing: ' + id);
});

// ── HERO ─────────────────────────────────────────────────────────
['hero','hero-headline','hero-eyebrow'].forEach(cls => {
  if (html.includes(cls)) pass('Hero: ' + cls);
  else fail('Hero missing: ' + cls);
});

// ── STATS GRID ───────────────────────────────────────────────────
['stats-grid','sv-total','sv-houses','sv-leader','sv-margin'].forEach(id => {
  if (html.includes(id)) pass('Stats: ' + id);
  else fail('Stats missing: ' + id);
});

// ── BOTTOM GRID ──────────────────────────────────────────────────
['bottom-grid','add-panel','leaderboard-panel','champion-panel'].forEach(cls => {
  if (html.includes(cls)) pass('Layout: ' + cls);
  else fail('Layout missing: ' + cls);
});

// ── JS functions ─────────────────────────────────────────────────
if (js.includes('updateStats')) pass('updateStats() present');
else fail('updateStats() missing');

if (js.includes('initNav')) pass('initNav() present');
else fail('initNav() missing');

['champion-zero','champion-active','champion-joint'].forEach(cls => {
  if (js.includes(cls)) pass('Champion state: ' + cls);
  else fail('Champion state missing: ' + cls);
});

// ── HOUSE COLOURS ────────────────────────────────────────────────
[['--alpha','#e84040'],['--infer','#00c8f0'],['--matrix','#8b5cf6'],['--layer','#10b981']].forEach(([v,c]) => {
  if (css.includes(v) && css.includes(c)) pass('House var ' + v + ': ' + c);
  else fail('House var missing/wrong: ' + v + ' (expected ' + c + ')');
});

// ── CSS STRUCTURE ────────────────────────────────────────────────
if (css.includes('bottom-grid')) pass('CSS .bottom-grid present');
else fail('CSS .bottom-grid missing');

if (css.includes('position: sticky')) pass('Sticky nav present');
else fail('Sticky nav missing');

if (css.includes('backdrop-filter')) pass('backdrop-filter present');
else fail('backdrop-filter missing');

if (css.includes('hero-grid')) pass('CSS .hero-grid present');
else fail('CSS .hero-grid missing');

if (css.includes('prefers-reduced-motion')) pass('prefers-reduced-motion present');
else fail('prefers-reduced-motion missing');

// ── BREAKPOINTS ──────────────────────────────────────────────────
['768px','480px','380px','1100px'].forEach(bp => {
  if (css.includes('max-width: ' + bp) || css.includes('min-width: ' + bp))
    pass('Breakpoint ' + bp);
  else fail('Breakpoint missing: ' + bp);
});

// ── NO EXTERNAL IMAGE URLS ───────────────────────────────────────
const externalImg = /<img[^>]+src=["']https?:\/\//.test(html);
if (externalImg) fail('External image URL found in HTML');
else pass('No external image URLs in HTML');

// ── NO HARDCODED SCORES ──────────────────────────────────────────
const hardcoded = /textContent\s*=\s*["'][0-9]+["']/.test(js);
if (hardcoded) fail('Hardcoded score found in script.js');
else pass('No hardcoded scores in script.js');

// ── SUMMARY ──────────────────────────────────────────────────────
console.log('');
console.log('══════════════════════════════════════════');
console.log('  Redesign checks:  PASS=' + p + '  FAIL=' + f);
if (f === 0) console.log('  ALL REDESIGN CHECKS PASSED');
else         console.log('  FAILURES — see above');
console.log('══════════════════════════════════════════');
process.exit(f > 0 ? 1 : 0);
