/**
 * script.js — TACHYON House Competition Command Center
 *
 * Architecture:
 *  - STATE object is the single source of truth.
 *  - STATE is persisted to / loaded from LocalStorage.
 *  - All DOM updates are driven by render() which reads STATE.
 *  - Hash-based routing for multi-view navigation.
 *  - No external dependencies.
 */

'use strict';

/* ================================================================
   CONSTANTS
   ================================================================ */

const STORAGE_KEY = 'tachyon_house_scores';
const STATE_KEY   = 'tachyon_state';
const THEME_KEY   = 'tachyon_theme';

const THEMES = [
  'sunset-glow',
  'tech-blue',
  'championship-gold',
  'minimal-slate',
  'cyberpunk',
  'stealth'
];

/**
 * House metadata.
 * SVGs are clean inline vector insignias with zero external network requests.
 */
const HOUSES = [
  {
    id: 'ALPHA',
    label: 'ALPHA',
    tagline: 'Precision Kinetic Strike',
    motto: 'Strike First. Never Yield.',
    lore: 'Frontline operatives forged in tactical coordination. Masters of rapid kinetic action, discipline, and persistent offensive focus.',
    icon: '⚔',
    svgPath: `<svg class="faction-insignia" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="alpha-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff3366"/>
          <stop offset="100%" stop-color="#b80028"/>
        </linearGradient>
      </defs>
      <!-- Beveled Tactical Hexagon Crest -->
      <polygon points="18,2 32,9 32,27 18,34 4,27 4,9" stroke="url(#alpha-grad)" stroke-width="2" fill="rgba(255, 51, 102, 0.12)"/>
      <polygon points="18,6 28,11.5 28,24.5 18,30 8,24.5 8,11.5" stroke="#ff3366" stroke-width="0.8" opacity="0.4" fill="none"/>
      <!-- Dual Kinetic Blades forming an Iconic A -->
      <path d="M18 7 L9 26 H13.5 L15.5 21 H20.5 L22.5 26 H27 Z" fill="url(#alpha-grad)"/>
      <!-- Inner Precision Core Star -->
      <polygon points="18,12 19.8,16.5 16.2,16.5" fill="#ffffff"/>
      <circle cx="18" cy="18" r="1.6" fill="#ffe0e6"/>
      <line x1="14" y1="21" x2="22" y2="21" stroke="#ffffff" stroke-width="1.2"/>
    </svg>`,
  },
  {
    id: 'INFER',
    label: 'INFER',
    tagline: 'Cybernetic Neural Net',
    motto: 'Predict. Adapt. Overclock.',
    lore: 'Algorithmic tacticians running high-precision analytical protocols. Specializing in strategic calculation, adaptability, and technological innovation.',
    icon: '◈',
    svgPath: `<svg class="faction-insignia" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="infer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f0ff"/>
          <stop offset="100%" stop-color="#0077b6"/>
        </linearGradient>
      </defs>
      <!-- Orbital Radar Ring with Calibrated Ticks -->
      <circle cx="18" cy="18" r="15" stroke="url(#infer-grad)" stroke-width="1.8" stroke-dasharray="6 3" fill="rgba(0, 240, 255, 0.1)"/>
      <circle cx="18" cy="18" r="10.5" stroke="#00f0ff" stroke-width="1" opacity="0.65"/>
      <!-- 4-Way Targeting Matrix Reticle -->
      <line x1="18" y1="2" x2="18" y2="8" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
      <line x1="18" y1="28" x2="18" y2="34" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
      <line x1="2" y1="18" x2="8" y2="18" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
      <line x1="28" y1="18" x2="34" y2="18" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
      <!-- Central Quantum Core -->
      <polygon points="18,10 24.5,18 18,26 11.5,18" fill="url(#infer-grad)"/>
      <circle cx="18" cy="18" r="3.2" fill="#ffffff"/>
      <circle cx="18" cy="18" r="1.5" fill="#0077b6"/>
    </svg>`,
  },
  {
    id: 'MATRIX',
    label: 'MATRIX',
    tagline: 'Quantum Matrix',
    motto: 'Bend Reality. Rewrite Code.',
    lore: 'Visionary operatives applying creative computation and lateral thinking. Known for ingenious problem-solving and rapid structural execution.',
    icon: '⬡',
    svgPath: `<svg class="faction-insignia" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="matrix-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d946ef"/>
          <stop offset="60%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#6b21a8"/>
        </linearGradient>
      </defs>
      <!-- Isometric Tesseract Hypercube Lattice -->
      <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" stroke="url(#matrix-grad)" stroke-width="2" fill="rgba(168, 85, 247, 0.12)"/>
      <line x1="18" y1="2" x2="18" y2="18" stroke="#d946ef" stroke-width="1.5"/>
      <line x1="32" y1="10" x2="18" y2="18" stroke="#d946ef" stroke-width="1.5"/>
      <line x1="4" y1="10" x2="18" y2="18" stroke="#d946ef" stroke-width="1.5"/>
      <line x1="18" y1="18" x2="18" y2="34" stroke="#a855f7" stroke-width="1.5"/>
      <!-- Internal Quantum Crystal Prism -->
      <polygon points="18,7 26,12 18,17 10,12" fill="url(#matrix-grad)" opacity="0.6"/>
      <polygon points="18,17 26,12 26,22 18,27" fill="#6b21a8" opacity="0.45"/>
      <polygon points="18,17 10,12 10,22 18,27" fill="#a855f7" opacity="0.55"/>
      <circle cx="18" cy="18" r="3.2" fill="#fdf4ff"/>
    </svg>`,
  },
  {
    id: 'LAYER',
    label: 'LAYER',
    tagline: 'Adaptive Biosphere Nexus',
    motto: 'Endure. Expand. Dominate.',
    lore: 'Adaptive environmental specialists with relentless endurance and regenerative team dynamics. Excelling in consistency and tournament longevity.',
    icon: '◉',
    svgPath: `<svg class="faction-insignia" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="layer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00ff9d"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <!-- Concentric Bio-Synthetic Shield Shell -->
      <path d="M18 2 C27 2 33 8 33 19 C33 27 25 33 18 34 C11 33 3 27 3 19 C3 8 9 2 18 2 Z" stroke="url(#layer-grad)" stroke-width="2" fill="rgba(0, 255, 157, 0.1)"/>
      <!-- Multi-tiered Harmonic Bio-Shield Arcs -->
      <path d="M7 13 Q18 7 29 13" stroke="url(#layer-grad)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M7 18 Q18 12 29 18" stroke="url(#layer-grad)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9 23 Q18 17 27 23" stroke="url(#layer-grad)" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Living Core Seed -->
      <circle cx="18" cy="27" r="3" fill="#00ff9d"/>
      <circle cx="18" cy="27" r="1.2" fill="#ffffff"/>
    </svg>`,
  },
];

const CHAMPION_TROPHY_SVG = `<svg class="cv-trophy-hero-svg" viewBox="0 0 340 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="25%" stop-color="#fde047"/>
      <stop offset="55%" stop-color="#f59e0b"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="trophy-plat" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="trophy-glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="rgba(250, 204, 21, 0.35)"/>
      <stop offset="70%" stop-color="rgba(250, 204, 21, 0.08)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <!-- Ambient Radiant Trophy Glow Backdrop -->
  <circle cx="170" cy="150" r="120" fill="url(#trophy-glow)"/>
  <ellipse cx="170" cy="140" rx="135" ry="32" stroke="rgba(250, 204, 21, 0.3)" stroke-width="1.2" stroke-dasharray="10 5"/>

  <!-- Left Sculpted Wing Handle -->
  <path d="M100 115 C45 115 45 195 105 215 L115 200 C72 185 70 135 110 135 Z" fill="url(#trophy-gold)" stroke="#fde047" stroke-width="1.6"/>

  <!-- Right Sculpted Wing Handle -->
  <path d="M240 115 C295 115 295 195 235 215 L225 200 C268 185 270 135 230 135 Z" fill="url(#trophy-gold)" stroke="#fde047" stroke-width="1.6"/>

  <!-- Main Luxury Chalice Cup -->
  <path d="M102 90 L238 90 L224 195 C224 235 192 255 170 255 C148 255 116 235 116 195 Z" fill="url(#trophy-gold)" stroke="#ffffff" stroke-width="1.6"/>

  <!-- Cup Rim Bevel & Specular Highlight -->
  <ellipse cx="170" cy="90" rx="68" ry="14" fill="#fde047" stroke="#ffffff" stroke-width="1.2"/>
  <ellipse cx="170" cy="90" rx="58" ry="10" fill="#78350f" opacity="0.6"/>

  <!-- Championship Star Crest on Cup Face -->
  <circle cx="170" cy="148" r="24" fill="#ffffff" opacity="0.95"/>
  <polygon points="170,130 175,143 189,143 178,152 182,165 170,157 158,165 162,152 151,143 165,143" fill="#f59e0b"/>

  <!-- Sculpted Chalice Stem -->
  <rect x="157" y="255" width="26" height="38" rx="3" fill="url(#trophy-gold)" stroke="#fde047" stroke-width="1"/>
  <ellipse cx="170" cy="265" rx="18" ry="4" fill="#ffffff" opacity="0.7"/>

  <!-- Multi-Tier Obsidian & Brushed Gold Pedestal -->
  <polygon points="125,293 215,293 235,340 105,340" fill="#141824" stroke="#f59e0b" stroke-width="2"/>
  <rect x="110" y="340" width="120" height="18" rx="4" fill="url(#trophy-gold)" stroke="#ffffff" stroke-width="1"/>

  <!-- Engraved Champion Plaque -->
  <rect x="126" y="306" width="88" height="22" rx="3" fill="rgba(253, 224, 71, 0.12)" stroke="#fde047" stroke-width="1"/>
  <text x="170" y="321" text-anchor="middle" fill="#fde047" font-family="sans-serif" font-size="10" font-weight="900" letter-spacing="1.5">TACHYON</text>

  <!-- Sparkle Accents -->
  <polygon points="80,95 83,101 89,101 84,105 86,111 80,107 74,111 76,105 71,101 77,101" fill="#fffbeb"/>
  <polygon points="260,85 262,90 267,90 263,93 264,98 260,95 256,98 257,93 253,90 258,90" fill="#fffbeb"/>
</svg>`;

const VIEWS = ['overview','houses','add-points','leaderboard','champion'];

/* ================================================================
   STATE
   ================================================================ */

let state = {
  scores: {},
  candidates: {},
  history: [],
  lastChampion: null,
  theme: 'sunset-glow',
};

let currentView = 'overview';
let currentHouseDetail = null;
let txCounter = 0;

/* ================================================================
   UTILITY
   ================================================================ */

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ================================================================
   LOCAL STORAGE HELPERS
   ================================================================ */

/** Load persisted scores from LocalStorage; returns null if absent/corrupt. */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const valid = HOUSES.every(h =>
      Object.prototype.hasOwnProperty.call(parsed, h.id) &&
      typeof parsed[h.id] === 'number' &&
      Number.isFinite(parsed[h.id]) &&
      parsed[h.id] >= 0
    );
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

/** Load full state. Tries STATE_KEY first, falls back to legacy STORAGE_KEY. */
function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.scores) {
        const ok = HOUSES.every(h =>
          Object.prototype.hasOwnProperty.call(p.scores, h.id) &&
          typeof p.scores[h.id] === 'number' &&
          Number.isFinite(p.scores[h.id]) &&
          p.scores[h.id] >= 0
        );
        if (ok) {
          state.scores = p.scores;
          HOUSES.forEach(h => {
            state.candidates[h.id] = Array.isArray(p.candidates?.[h.id])
              ? p.candidates[h.id].filter(c => c && typeof c.name === 'string' && typeof c.usn === 'string')
              : [];
          });
          state.history = Array.isArray(p.history)
            ? p.history.filter(t => t && typeof t.house === 'string' && typeof t.type === 'string')
            : [];
          return true;
        }
      }
    }
  } catch { /* fall through */ }

  const legacy = loadFromStorage();
  if (legacy) {
    state.scores = legacy;
    HOUSES.forEach(h => { state.candidates[h.id] = []; });
    state.history = [];
    return true;
  }
  return false;
}

/** Persist current scores to LocalStorage (legacy key). */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.scores));
  } catch (err) {
    console.warn('LocalStorage write failed:', err);
  }
}

/** Persist full state. */
function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      scores: state.scores,
      candidates: state.candidates,
      history: state.history,
    }));
    saveToStorage();
  } catch (err) {
    console.warn('LocalStorage write failed:', err);
  }
}

/* ================================================================
   RANKING ALGORITHM
   ================================================================
   1. Convert scores object into an array of { house, score } pairs.
   2. Sort descending by score.
   3. For equal scores, sort ascending by house name (localeCompare).
   4. Assign rank numbers; houses sharing same score share rank.
   5. "Joint winners" = all houses whose score equals highest score
      AND that score > 0.
   ================================================================ */

function computeRankings() {
  const entries = HOUSES.map(h => ({
    house: h.id,
    score: state.scores[h.id],
  }));

  entries.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : a.house.localeCompare(b.house)
  );

  const maxScore = entries[0]?.score ?? 0;

  let currentRank = 1;
  entries.forEach((entry, i) => {
    if (i > 0 && entry.score < entries[i - 1].score) {
      currentRank = i + 1;
    }
    entry.rank = currentRank;
    entry.isJointTop = maxScore > 0 && entry.score === maxScore;
  });

  return entries;
}

/* ================================================================
   CANDIDATE MANAGEMENT
   ================================================================ */

function addCandidate(houseId, name, usn) {
  name = (name || '').trim();
  usn  = (usn  || '').trim();
  if (!name) return { success: false, error: 'Candidate name is required.' };
  if (!usn)  return { success: false, error: 'USN is required.' };
  const usnLower = usn.toLowerCase();
  for (const h of HOUSES) {
    if (state.candidates[h.id].some(c => c.usn.toLowerCase() === usnLower)) {
      return { success: false, error: `USN "${usn}" is already assigned.` };
    }
  }
  state.candidates[houseId].push({ name, usn });
  saveState();
  return { success: true };
}

function editCandidate(houseId, index, name, usn) {
  name = (name || '').trim();
  usn  = (usn  || '').trim();
  if (!name) return { success: false, error: 'Candidate name is required.' };
  if (!usn)  return { success: false, error: 'USN is required.' };
  const usnLower = usn.toLowerCase();
  for (const h of HOUSES) {
    for (let i = 0; i < state.candidates[h.id].length; i++) {
      if (h.id === houseId && i === index) continue;
      if (state.candidates[h.id][i].usn.toLowerCase() === usnLower) {
        return { success: false, error: `USN "${usn}" is already assigned.` };
      }
    }
  }
  state.candidates[houseId][index] = { name, usn };
  saveState();
  return { success: true };
}

function removeCandidate(houseId, index) {
  state.candidates[houseId].splice(index, 1);
  saveState();
}

/* ================================================================
   TRANSACTION HISTORY
   ================================================================ */

function addTransaction(house, type, amount, previous, newScore, reason) {
  txCounter++;
  const tx = {
    id: 'TX-' + Date.now() + '-' + txCounter,
    house, type, amount, previous, newScore,
    reason: reason || '',
    timestamp: new Date().toISOString(),
  };
  state.history.unshift(tx);
  if (state.history.length > 100) state.history.length = 100;
  return tx;
}

/* ================================================================
   HASH-BASED ROUTER
   ================================================================ */

function getViewFromHash() {
  const hash = window.location.hash.replace('#', '') || 'overview';
  const m = hash.match(/^house-([A-Z]+)$/);
  if (m && HOUSES.some(h => h.id === m[1])) return { view: 'house-detail', houseId: m[1] };
  if (VIEWS.includes(hash)) return { view: hash, houseId: null };
  return { view: 'overview', houseId: null };
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function showView(viewId, houseId) {
  currentView = viewId;
  currentHouseDetail = houseId || null;

  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.add('view-hidden');
    el.setAttribute('aria-hidden', 'true');
  });

  const targetId = viewId === 'house-detail' ? 'view-house-detail' : 'view-' + viewId;
  const target = document.getElementById(targetId);
  if (target) {
    target.classList.remove('view-hidden');
    target.setAttribute('aria-hidden', 'false');
  }

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    const lv = link.getAttribute('data-view');
    if (lv === viewId || (viewId === 'house-detail' && lv === 'houses')) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (href === '#' + viewId || (viewId === 'house-detail' && href === '#houses')) {
      link.classList.add('active');
    }
  });

  if (viewId === 'house-detail' && houseId) renderHouseDetail(houseId);
  window.scrollTo(0, 0);
}

function handleHashChange() {
  const { view, houseId } = getViewFromHash();
  showView(view, houseId);
  render();
}

/* ================================================================
   DOM UPDATES — OVERVIEW STATS CARDS
   ================================================================ */

function updateStats(rankings) {
  const total = HOUSES.reduce((sum, h) => sum + state.scores[h.id], 0);
  const svTotal = document.getElementById('sv-total');
  if (svTotal) svTotal.textContent = total.toLocaleString();

  const svHouses = document.getElementById('sv-houses');
  if (svHouses) svHouses.textContent = String(HOUSES.length);

  const maxScore = rankings[0]?.score ?? 0;

  const svLeader = document.getElementById('sv-leader');
  if (svLeader) {
    if (maxScore === 0) {
      svLeader.textContent = '—';
    } else {
      const leaders = rankings.filter(r => r.isJointTop);
      svLeader.textContent = leaders.length === 1
        ? leaders[0].house
        : leaders.map(l => l.house).join(' / ');
    }
  }

  const svMargin = document.getElementById('sv-margin');
  if (svMargin) {
    if (maxScore === 0 || rankings.length < 2) {
      svMargin.textContent = '—';
    } else {
      const leaders = rankings.filter(r => r.isJointTop);
      if (leaders.length > 1) {
        const nextAfterTie = rankings.find(r => !r.isJointTop);
        const gap = nextAfterTie ? maxScore - nextAfterTie.score : 0;
        svMargin.textContent = gap > 0 ? `+${gap.toLocaleString()}` : 'Tied';
      } else {
        const second = rankings.find(r => r.rank === 2);
        const margin = second ? maxScore - second.score : 0;
        svMargin.textContent = margin > 0 ? `+${margin.toLocaleString()}` : 'Tied';
      }
    }
  }

  // Update Hero Showcase Cards (Card 1: Champion/Leader, Card 2: 2nd place house)
  const heroCard1Name = document.getElementById('hero-card1-name');
  const heroCard1Badge = document.getElementById('hero-card1-badge');
  const heroCard1Pts = document.getElementById('hero-card1-pts');
  const heroCard1Bar = document.getElementById('hero-card1-bar');
  const heroCard2Name = document.getElementById('hero-card2-name');
  const heroCard2Badge = document.getElementById('hero-card2-badge');
  const heroCard2Pts = document.getElementById('hero-card2-pts');
  const heroCard2Bar = document.getElementById('hero-card2-bar');

  if (rankings && rankings.length >= 2) {
    const first = rankings[0];
    const second = rankings[1];
    if (heroCard1Name) heroCard1Name.textContent = first.house;
    if (heroCard1Badge) heroCard1Badge.textContent = 'CHAMPION';
    if (heroCard1Pts) heroCard1Pts.textContent = maxScore > 0 ? `${first.score.toLocaleString()} PTS • RANK #1` : 'RANK #1 • ACTIVE';
    if (heroCard1Bar) {
      const pct1 = total > 0 ? Math.min(155, Math.max(20, Math.round((first.score / total) * 155))) : 125;
      heroCard1Bar.setAttribute('width', String(pct1));
    }

    if (heroCard2Name) heroCard2Name.textContent = second.house;
    if (heroCard2Badge) heroCard2Badge.textContent = '2ND PLACE';
    if (heroCard2Pts) heroCard2Pts.textContent = second.score > 0 ? `${second.score.toLocaleString()} PTS • 2ND PLACE` : 'RUNNER UP';
    if (heroCard2Bar) {
      const pct2 = total > 0 ? Math.min(140, Math.max(15, Math.round((second.score / total) * 140))) : 95;
      heroCard2Bar.setAttribute('width', String(pct2));
    }
  }
}

/* ================================================================
   OVERVIEW — HOUSE PREVIEW CARDS
   ================================================================ */

function renderOverviewCards(rankings) {
  const grid = document.getElementById('overview-houses-grid');
  if (!grid) return;
  const rankMap = {};
  rankings.forEach(r => { rankMap[r.house] = r; });
  const maxScore = rankings[0]?.score ?? 0;

  grid.innerHTML = '';
  HOUSES.forEach((h, idx) => {
    const e = rankMap[h.id];
    const pct = maxScore > 0 && e.score > 0 ? Math.max(1, Math.round((e.score / maxScore) * 100)) : 0;
    const card = document.createElement('article');
    card.className = 'overview-house-card scorecard' + (e.isJointTop ? ' is-leader' : '');
    card.setAttribute('data-house', h.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${h.label}: ${e.score} points, Rank #${e.rank}`);
    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-emblem" aria-hidden="true">${h.svgPath}</div>
        <div class="card-header-meta">
          <span class="card-num-badge">0${idx + 1}</span>
          <span class="ohc-rank rank-${e.rank <= 3 ? e.rank : 'other'}">#${e.rank}</span>
        </div>
      </div>
      <div class="card-body-meta">
        <div class="card-house-name">${h.label}</div>
        <div class="card-house-tagline">${h.tagline}</div>
        <div class="card-house-motto">"${h.motto}"</div>
      </div>
      <div class="card-points-label">Total Score</div>
      <div class="ohc-score">${e.score.toLocaleString()} <span class="ohc-unit">PTS</span></div>
      <div class="card-bar-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${h.label} score progress">
        <div class="card-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="card-footer-meta">
        <span class="ohc-candidates">${(state.candidates[h.id]?.length || 0)} candidates</span>
        <span class="ohc-cta">View Details →</span>
      </div>
    `;
    card.addEventListener('click', () => navigateTo('house-' + h.id));
    card.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); navigateTo('house-' + h.id); }
    });
    grid.appendChild(card);
  });
}

function renderOverviewLeaderboard(rankings) {
  const c = document.getElementById('overview-leaderboard-preview');
  if (!c) return;
  const maxScore = rankings[0]?.score ?? 0;
  let html = '';
  rankings.forEach(entry => {
    const pct = maxScore > 0 ? Math.round((entry.score / maxScore) * 100) : 0;
    html += `
      <div class="olb-row${entry.isJointTop ? ' olb-leader' : ''}" data-house="${entry.house}">
        <span class="olb-rank">#${entry.rank}</span>
        <span class="olb-house">${entry.house}</span>
        <span class="olb-score">${entry.score.toLocaleString()}</span>
        <div class="olb-bar"><div class="olb-bar-fill" data-house="${entry.house}" style="width:${pct}%"></div></div>
      </div>`;
  });
  c.innerHTML = html;
}

function getOverviewTrophySvg(variant = 'champion') {
  const isMuted = variant === 'empty';
  return `<div class="ocp-trophy-wrap ${isMuted ? 'ocp-trophy-empty' : ''}" aria-hidden="true">
    <svg class="ocp-trophy-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ocp-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="25%" stop-color="#fde047"/>
          <stop offset="55%" stop-color="#f59e0b"/>
          <stop offset="85%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <radialGradient id="ocp-glow-radial" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="var(--accent-glow-str)"/>
          <stop offset="70%" stop-color="var(--accent-glow)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <!-- Neon Ambient Aura -->
      <circle cx="50" cy="44" r="38" fill="url(#ocp-glow-radial)"/>
      <ellipse cx="50" cy="42" rx="42" ry="12" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.6"/>

      <!-- Wing Handles -->
      <path d="M30 30 C13 30 11 55 29 63 L32 58 C19 53 20 38 32 37 Z" fill="url(#ocp-gold-grad)" stroke="var(--accent-bright)" stroke-width="1.2"/>
      <path d="M70 30 C87 30 89 55 71 63 L68 58 C81 53 80 38 68 37 Z" fill="url(#ocp-gold-grad)" stroke="var(--accent-bright)" stroke-width="1.2"/>

      <!-- Main Chalice Cup -->
      <path d="M30 20 H70 V42 C70 55 60 64 50 64 C40 64 30 55 30 42 Z" fill="url(#ocp-gold-grad)"/>

      <!-- Top Rim Lip & Specular Shine -->
      <ellipse cx="50" cy="20" rx="20" ry="4.5" fill="#fef08a" stroke="#ffffff" stroke-width="0.8"/>
      <ellipse cx="50" cy="20" rx="16" ry="3" fill="#78350f" opacity="0.35"/>
      <path d="M34 24 C38 40 42 54 46 60 C43 58 36 48 33 32 Z" fill="#ffffff" opacity="0.45"/>

      <!-- Center Star Crest with Neon Core -->
      <circle cx="50" cy="42" r="8" fill="rgba(0, 0, 0, 0.25)"/>
      <path d="M50 34 L52.4 39.8 H58.6 L53.6 43.4 L55.5 49.2 L50 45.4 L44.5 49.2 L46.4 43.4 L41.4 39.8 H47.6 Z" fill="#ffffff"/>
      <circle cx="50" cy="42" r="2" fill="var(--accent-bright)"/>

      <!-- Stem -->
      <path d="M46 64 H54 V72 C54 75 58 76 60 77 H40 C42 76 46 75 46 72 Z" fill="url(#ocp-gold-grad)"/>

      <!-- Pedestal Base -->
      <path d="M36 77 H64 L67 82 H33 Z" fill="url(#ocp-gold-grad)" stroke="var(--accent-bright)" stroke-width="0.8"/>
      <rect x="28" y="82" width="44" height="9" rx="2" fill="#0b1020" stroke="var(--accent)" stroke-width="1.4"/>
      <rect x="34" y="85" width="32" height="3" rx="1" fill="var(--accent-bright)"/>

      <!-- Neon Horizon Underglow Beam -->
      <line x1="22" y1="94" x2="78" y2="94" stroke="var(--accent-bright)" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="50" cy="94" rx="28" ry="3" fill="url(#ocp-glow-radial)"/>
    </svg>
  </div>`;
}

function renderOverviewChampion(rankings) {
  const c = document.getElementById('overview-champion-preview');
  if (!c) return;
  const maxScore = rankings[0]?.score ?? 0;
  if (maxScore === 0) {
    c.innerHTML = `<div class="ocp-empty">${getOverviewTrophySvg('empty')}<p>No champion yet. Award points to crown a winner.</p></div>`;
    return;
  }
  const winners = rankings.filter(r => r.isJointTop);
  if (winners.length === 1) {
    const w = winners[0], house = HOUSES.find(h => h.id === w.house);
    c.innerHTML = `<div class="ocp-winner">${getOverviewTrophySvg('champion')}<span class="ocp-label">CURRENT CHAMPION</span><span class="ocp-name">${house.icon} ${w.house}</span><span class="ocp-pts">${w.score.toLocaleString()} points</span></div>`;
  } else {
    const names = winners.map(w => { const h = HOUSES.find(x => x.id === w.house); return `${h.icon} ${w.house}`; }).join(' & ');
    c.innerHTML = `<div class="ocp-tied">${getOverviewTrophySvg('joint')}<span class="ocp-label">JOINT LEADERS</span><span class="ocp-name">${names}</span><span class="ocp-pts">${winners[0].score.toLocaleString()} pts each</span></div>`;
  }
}

/* ================================================================
   SCORECARDS (Houses view)
   ================================================================ */

function initScorecards() {
  const grid = document.getElementById('scorecards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  HOUSES.forEach((h, idx) => {
    const card = document.createElement('article');
    card.className = 'scorecard';
    card.setAttribute('data-house', h.id);
    card.setAttribute('aria-label', `${h.label} house scorecard`);
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-emblem" aria-hidden="true">${h.svgPath}</div>
        <div class="card-header-meta">
          <span class="card-num-badge">0${idx + 1}</span>
          <span class="card-rank-badge" id="rank-badge-${h.id}" aria-label="${h.label} rank">—</span>
        </div>
      </div>
      <div class="card-body-meta">
        <div class="card-house-name" aria-hidden="true">${h.label}</div>
        <div class="card-house-tagline">${h.tagline}</div>
        <div class="card-house-motto">"${h.motto}"</div>
      </div>
      <div class="card-label">Total Points</div>
      <div class="card-score" id="card-score-${h.id}" aria-label="${h.label} score">0</div>
      <div class="card-bar-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="${h.label} score share">
        <div class="card-bar-fill" id="card-bar-${h.id}" style="width:0%"></div>
      </div>
      <div class="card-meta">
        <span class="card-candidates">${(state.candidates[h.id]?.length || 0)} candidates</span>
        <span class="card-roster-cta">Manage Candidates →</span>
      </div>
      <div class="card-winner-badge" id="winner-badge-${h.id}" aria-label="${h.label} is leading">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden="true">
          <path d="M5.5 0.5L6.8 3.7H10.2L7.5 5.8L8.5 9L5.5 7L2.5 9L3.5 5.8L0.8 3.7H4.2Z"/>
        </svg>
        HOUSE LEADER
      </div>
    `;

    card.addEventListener('click', () => navigateTo('house-' + h.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo('house-' + h.id); }
    });
    grid.appendChild(card);
  });
}

function updateScorecards(rankings) {
  const rankMap = {};
  rankings.forEach(r => { rankMap[r.house] = r; });
  const maxScore = rankings[0]?.score ?? 0;

  HOUSES.forEach(h => {
    const card    = document.querySelector(`.scorecard[data-house="${h.id}"]`);
    const scoreEl = document.getElementById(`card-score-${h.id}`);
    const badgeEl = document.getElementById(`rank-badge-${h.id}`);
    const barEl   = document.getElementById(`card-bar-${h.id}`);
    if (!card || !scoreEl || !badgeEl || !barEl) return;

    const entry    = rankMap[h.id];
    const newScore = entry.score;

    const oldText = scoreEl.textContent;
    scoreEl.textContent = newScore.toLocaleString();
    if (oldText !== String(newScore) && oldText !== newScore.toLocaleString()) {
      scoreEl.classList.remove('bump');
      void scoreEl.offsetWidth;
      scoreEl.classList.add('bump');
      scoreEl.addEventListener('transitionend', () => scoreEl.classList.remove('bump'), { once: true });
    }

    const pct = maxScore > 0 ? Math.max(1, Math.round((newScore / maxScore) * 100)) : 0;
    const effectivePct = newScore === 0 ? 0 : pct;
    barEl.style.width = `${effectivePct}%`;
    const barTrack = barEl.closest('.card-bar-track');
    if (barTrack) barTrack.setAttribute('aria-valuenow', effectivePct);

    badgeEl.textContent = `#${entry.rank}`;
    badgeEl.className = 'card-rank-badge';
    if (entry.rank === 1) badgeEl.classList.add('rank-1');
    else if (entry.rank === 2) badgeEl.classList.add('rank-2');
    else if (entry.rank === 3) badgeEl.classList.add('rank-3');

    if (entry.isJointTop) card.classList.add('is-winner');
    else card.classList.remove('is-winner');

    const candEl = card.querySelector('.card-candidates');
    if (candEl) candEl.textContent = `${(state.candidates[h.id]?.length || 0)} candidates`;
  });
}

/* ================================================================
   HOUSE DETAIL VIEW
   ================================================================ */

function renderHouseDetail(houseId) {
  const container = document.getElementById('view-house-detail');
  if (!container) return;
  const house = HOUSES.find(h => h.id === houseId);
  if (!house) return;
  const rankings = computeRankings();
  const entry = rankings.find(r => r.house === houseId);
  const cands = state.candidates[houseId] || [];

  let candHtml;
  if (cands.length === 0) {
    candHtml = `<div class="hd-empty-state"><p>No candidates registered yet.</p>
      <p class="hd-empty-hint">Use the form below to register candidates for ${house.label}.</p></div>`;
  } else {
    candHtml = `<table class="hd-candidate-table" role="table" aria-label="${house.label} candidates">
      <thead><tr><th>#</th><th>Name</th><th>USN</th><th>Actions</th></tr></thead>
      <tbody>${cands.map((c, i) => `<tr><td>${i + 1}</td><td><strong>${escapeHtml(c.name)}</strong></td><td><code>${escapeHtml(c.usn)}</code></td>
        <td class="hd-actions"><button class="btn-sm btn-edit" data-house="${houseId}" data-idx="${i}" aria-label="Edit candidate ${escapeHtml(c.name)}">Edit</button>
        <button class="btn-sm btn-delete" data-house="${houseId}" data-idx="${i}" aria-label="Delete candidate ${escapeHtml(c.name)}">Delete</button></td></tr>`).join('')}</tbody></table>`;
  }

  const addForm = `
    <div class="hd-add-form panel">
      <div class="panel-header"><h3 class="section-label">Add Candidate to ${house.label}</h3></div>
      <form id="candidate-form" class="hd-form" novalidate>
        <div class="form-group"><label for="cand-name" class="form-label">Candidate Name</label><input type="text" id="cand-name" class="form-input" placeholder="e.g. Alex Morgan" required /></div>
        <div class="form-group"><label for="cand-usn" class="form-label">USN (University Seat Number)</label><input type="text" id="cand-usn" class="form-input" placeholder="e.g. 1MS23CS001" required /></div>
        <button type="submit" class="btn btn-primary">Add Candidate</button>
      </form>
    </div>`;

  container.innerHTML = `
    <div class="hd-back"><button class="btn btn-ghost" id="hd-back-btn" aria-label="Back to Houses">← Back to Houses</button></div>
    <div class="hd-hero" data-house="${houseId}">
      <div class="hd-emblem-badge" aria-hidden="true">${house.svgPath}</div>
      <div class="hd-info">
        <div class="hd-badge-row"><span class="hd-badge">${house.tagline}</span></div>
        <h2 class="hd-name">${house.label}</h2>
        <p class="hd-tagline">"${house.motto}"</p>
        <p class="hd-lore">${house.lore}</p>
        <div class="hd-stats">
          <div class="hd-stat-card"><span class="hd-stat-val">${entry.score.toLocaleString()}</span><span class="hd-stat-lbl">POINTS</span></div>
          <div class="hd-stat-card"><span class="hd-stat-val">#${entry.rank}</span><span class="hd-stat-lbl">CURRENT RANK</span></div>
          <div class="hd-stat-card"><span class="hd-stat-val">${cands.length}</span><span class="hd-stat-lbl">CANDIDATES</span></div>
        </div>
      </div>
    </div>
    <div class="hd-candidates-section panel">
      <div class="panel-header"><h3 class="section-label">Registered Candidates (${cands.length})</h3></div>
      ${candHtml}
    </div>
    ${addForm}`;

  document.getElementById('hd-back-btn')?.addEventListener('click', () => navigateTo('houses'));

  const form = document.getElementById('candidate-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = addCandidate(houseId, document.getElementById('cand-name').value, document.getElementById('cand-usn').value);
    if (r.success) {
      showToast(`Candidate registered for ${house.label}!`, 'success');
      renderHouseDetail(houseId);
      render();
    } else {
      showToast('⚠️ ' + r.error, 'error');
    }
  });

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const c = state.candidates[houseId][idx];
      if (!c) return;
      const newName = prompt('Edit candidate name:', c.name);
      if (newName === null) return;
      const newUsn = prompt('Edit USN:', c.usn);
      if (newUsn === null) return;
      const r = editCandidate(houseId, idx, newName, newUsn);
      if (r.success) {
        showToast('Candidate updated.', 'success');
        renderHouseDetail(houseId);
        render();
      } else {
        showToast('⚠️ ' + r.error, 'error');
      }
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const c = state.candidates[houseId][idx];
      if (!c) return;
      if (!window.confirm(`Delete candidate "${c.name}" (${c.usn})?\n\nThis cannot be undone.`)) return;
      removeCandidate(houseId, idx);
      showToast('Candidate removed.', 'warning');
      renderHouseDetail(houseId);
      render();
    });
  });
}

/* ================================================================
   LEADERBOARD (Table for tests and full visual esports bracket)
   ================================================================ */

function updateLeaderboard(rankings) {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  const maxScore = rankings[0]?.score ?? 0;
  tbody.innerHTML = '';

  rankings.forEach(entry => {
    const tr = document.createElement('tr');
    if (entry.rank === 1 && entry.score > 0) tr.classList.add('rank-first');
    let medalClass = '';
    if (entry.rank === 1) medalClass = 'gold';
    else if (entry.rank === 2) medalClass = 'silver';
    else if (entry.rank === 3) medalClass = 'bronze';
    const pct = maxScore > 0 ? Math.round((entry.score / maxScore) * 100) : 0;

    tr.innerHTML = `
      <td style="text-align:center"><span class="rank-medal ${medalClass}" aria-label="Rank ${entry.rank}">#${entry.rank}</span></td>
      <td><div class="house-name-cell"><span class="house-dot" data-house="${entry.house}" aria-hidden="true"></span><span class="house-label" data-house="${entry.house}">${entry.house}</span></div></td>
      <td><span class="points-cell">${entry.score.toLocaleString()}</span></td>
      <td><div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${entry.house} score progress"><div class="progress-fill" data-house="${entry.house}" style="width: ${pct}%"></div></div></td>`;
    tbody.appendChild(tr);
  });
}

/* ================================================================
   FULL LEADERBOARD VIEW
   ================================================================ */

function renderFullLeaderboard(rankings) {
  const c = document.getElementById('full-leaderboard-body');
  if (!c) return;
  const maxScore = rankings[0]?.score ?? 0;
  const totalPts = HOUSES.reduce((sum, h) => sum + state.scores[h.id], 0);

  if (maxScore === 0) {
    c.innerHTML = `
      <div class="flb-empty panel">
        <div class="flb-empty-icon" aria-hidden="true">🏆</div>
        <h3 class="flb-empty-title">COMPETITION STANDBY</h3>
        <p class="flb-empty-text">No points awarded yet. All four houses stand at zero. Award points to begin tournament standings.</p>
        <button class="btn btn-primary" onclick="navigateTo('add-points')">Award Points</button>
      </div>`;
    return;
  }

  let html = '';
  const leaders = rankings.filter(r => r.isJointTop);
  if (leaders.length === 1) {
    const l = leaders[0], house = HOUSES.find(h => h.id === l.house);
    const second = rankings.find(r => r.rank === 2);
    const margin = second ? l.score - second.score : 0;
    html += `
      <div class="flb-featured-card" data-house="${l.house}">
        <div class="flb-featured-info">
          <div class="flb-featured-tag">[CURRENT LEADER]</div>
          <div class="flb-featured-name-row">
            <div class="flb-featured-emblem" aria-hidden="true">${house.svgPath}</div>
            <h2 class="flb-featured-name">${l.house}</h2>
            <span class="flb-featured-badge">RANK #1</span>
          </div>
          <div class="flb-featured-score">${l.score.toLocaleString()} <span class="flb-unit">POINTS</span></div>
          <div class="flb-featured-meta">
            <span>LEAD MARGIN: ${margin > 0 ? '+' + margin.toLocaleString() + ' PTS' : 'TIED'}</span>
            <span>&bull;</span>
            <span>${house.tagline}</span>
          </div>
        </div>
      </div>`;
  } else if (leaders.length > 1) {
    const names = leaders.map(l => l.house).join(' &amp; ');
    html += `
      <div class="flb-featured-card flb-tied" data-house="ALPHA">
        <div class="flb-featured-info">
          <div class="flb-featured-tag">[JOINT LEADERS &mdash; TIE]</div>
          <h2 class="flb-featured-name">${names}</h2>
          <div class="flb-featured-score">${leaders[0].score.toLocaleString()} <span class="flb-unit">PTS EACH</span></div>
          <div class="flb-featured-meta">
            <span>JOINT LEADERS &mdash; EQUAL SCORE</span>
          </div>
        </div>
      </div>`;
  }

  html += '<div class="flb-tournament-bracket">';
  rankings.forEach(entry => {
    const house = HOUSES.find(h => h.id === entry.house);
    const pct = maxScore > 0 ? Math.round((entry.score / maxScore) * 100) : 0;
    const sharePct = totalPts > 0 ? Math.round((entry.score / totalPts) * 100) : 0;
    let rankTitle = 'HOUSE';
    let rankClass = 'rank-other';
    if (entry.rank === 1) { rankTitle = 'LEADER'; rankClass = 'rank-1'; }
    else if (entry.rank === 2) { rankTitle = '2ND PLACE'; rankClass = 'rank-2'; }
    else if (entry.rank === 3) { rankTitle = '3RD PLACE'; rankClass = 'rank-3'; }

    html += `
      <div class="flb-card-row${entry.isJointTop ? ' flb-leader' : ''}" data-house="${entry.house}" onclick="navigateTo('house-${entry.house}')">
        <div class="flb-rank-col">
          <span class="flb-rank-badge ${rankClass}">#${entry.rank}</span>
          <span class="flb-rank-title">${rankTitle}</span>
        </div>
        <div class="flb-house-col">
          <div class="flb-house-header">
            <span class="flb-insignia" aria-hidden="true">${house.svgPath}</span>
            <span class="flb-house-name">${entry.house}</span>
            <span class="flb-house-motto">"${house.motto}"</span>
          </div>
          <div class="flb-bar-container">
            <div class="flb-bar-track">
              <div class="flb-bar-fill" data-house="${entry.house}" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="flb-score-col">
          <span class="flb-score-num">${entry.score.toLocaleString()}</span>
          <span class="flb-score-share">${sharePct}% OF TOTAL</span>
        </div>
      </div>`;
  });
  html += '</div>';
  c.innerHTML = html;
}

/* ================================================================
   WINNER / CHAMPION SECTION (legacy panel for test compat)
   ================================================================ */

function updateWinner(rankings) {
  const section = document.getElementById('winner-inner');
  if (!section) return;
  const maxScore = rankings[0]?.score ?? 0;

  if (maxScore === 0) {
    section.innerHTML = `<div class="champion-zero"><span class="champion-zero-icon" aria-hidden="true">🏁</span>
      <p class="champion-zero-text">No points awarded yet.<br>Add points to crown a champion.</p></div>`;
    return;
  }

  const winners = rankings.filter(r => r.isJointTop);
  if (winners.length === 1) {
    const w = winners[0], house = HOUSES.find(h => h.id === w.house);
    section.innerHTML = `<div class="champion-active"><span class="champion-trophy" aria-hidden="true">🏆</span>
      <div class="champion-label">Current Champion</div>
      <div class="champion-name" aria-label="Winning house: ${w.house}">${house.icon} ${w.house}</div>
      <div class="champion-meta"><span class="champion-pts">${w.score.toLocaleString()} points</span><span class="champion-rank">RANK #${w.rank}</span></div></div>`;
  } else {
    const chips = winners.map(w => { const h = HOUSES.find(hx => hx.id === w.house); return `<span class="joint-winner-chip">${h.icon} ${w.house}</span>`; }).join('');
    section.innerHTML = `<div class="champion-joint"><span class="champion-trophy" aria-hidden="true">🤝</span>
      <div class="joint-label">Joint Leaders — Tie!</div>
      <div class="joint-winner-chips" aria-label="Joint winning houses">${chips}</div>
      <span class="joint-pts">${winners[0].score.toLocaleString()} points each</span></div>`;
  }
}

/* ================================================================
   FULL CHAMPION VIEW
   ================================================================ */

function renderChampionView(rankings) {
  const c = document.getElementById('champion-view-content');
  if (!c) return;
  const maxScore = rankings[0]?.score ?? 0;

  if (maxScore === 0) {
    c.innerHTML = `
      <div class="cv-empty panel">
        <div class="cv-trophy-empty-icon" aria-hidden="true">🏆</div>
        <h2 class="cv-empty-title">CHAMPIONSHIP STANDBY</h2>
        <p class="cv-empty-text">No champion has been crowned yet. All houses sit at 0 points. Award points in the competition to initiate championship rankings.</p>
        <button class="btn btn-primary" id="cv-award-btn">Award Points</button>
      </div>`;
    c.querySelector('#cv-award-btn')?.addEventListener('click', () => navigateTo('add-points'));
    state.lastChampion = null;
    return;
  }

  const winners = rankings.filter(r => r.isJointTop);
  const newChamp = winners.map(w => w.house).join(',');
  const isNew = state.lastChampion !== null && state.lastChampion !== newChamp;

  if (winners.length === 1) {
    const w = winners[0], house = HOUSES.find(h => h.id === w.house);
    const next = rankings.find(r => !r.isJointTop);
    const margin = next ? w.score - next.score : 0;
    const candCount = state.candidates[w.house]?.length || 0;

    c.innerHTML = `
      <div class="cv-champion-stage${isNew ? ' cv-celebrate' : ''}" data-house="${w.house}">
        <div class="cv-stage-backdrop" aria-hidden="true">
          <div class="cv-radial-aura"></div>
        </div>
        <div class="cv-trophy-column">
          ${CHAMPION_TROPHY_SVG}
          <div class="cv-trophy-label">OFFICIAL HOUSE CHAMPION</div>
        </div>
        <div class="cv-details-column">
          <div class="cv-badge-row">
            <span class="cv-badge-victor">🏆 HOUSE SUPREMACY</span>
            <span class="cv-badge-style">${house.tagline}</span>
          </div>
          <div class="cv-name-row">
            <div class="cv-emblem-wrap" aria-hidden="true">${house.svgPath}</div>
            <h2 class="cv-house-name">${w.house}</h2>
          </div>
          <p class="cv-motto">"${house.motto}"</p>
          <div class="cv-telemetry-grid">
            <div class="cv-telemetry-box">
              <span class="cv-box-val">${w.score.toLocaleString()}</span>
              <span class="cv-box-lbl">CHAMPION POINTS</span>
            </div>
            <div class="cv-telemetry-box">
              <span class="cv-box-val">#${w.rank}</span>
              <span class="cv-box-lbl">FINAL RANK</span>
            </div>
            <div class="cv-telemetry-box">
              <span class="cv-box-val">${margin > 0 ? '+' + margin.toLocaleString() : 'CLEAR'}</span>
              <span class="cv-box-lbl">LEAD MARGIN</span>
            </div>
            <div class="cv-telemetry-box">
              <span class="cv-box-val">${candCount}</span>
              <span class="cv-box-lbl">CANDIDATES</span>
            </div>
          </div>
          <div class="cv-actions">
            <button class="btn btn-primary" onclick="navigateTo('house-${w.house}')">View House Roster</button>
            <button class="btn btn-ghost" onclick="navigateTo('leaderboard')">Full Leaderboard</button>
          </div>
        </div>
      </div>`;
  } else {
    const jointCards = winners.map(w => {
      const house = HOUSES.find(h => h.id === w.house);
      return `
        <div class="cv-joint-card" data-house="${w.house}">
          <div class="cv-joint-emblem" aria-hidden="true">${house.svgPath}</div>
          <span class="cv-joint-name">${w.house}</span>
          <span class="cv-joint-score">${w.score.toLocaleString()} PTS</span>
        </div>`;
    }).join('');

    c.innerHTML = `
      <div class="cv-champion-stage cv-joint-stage${isNew ? ' cv-celebrate' : ''}">
        <div class="cv-stage-backdrop" aria-hidden="true"><div class="cv-radial-aura"></div></div>
        <div class="cv-joint-header">
          <div class="cv-badge-victor">🤝 JOINT LEADERS — TIE</div>
          <h2 class="cv-house-name">${winners[0].score.toLocaleString()} POINTS EACH</h2>
          <p class="cv-motto">Both houses share the top rank. Full score equality across all metrics.</p>
        </div>
        <div class="cv-joint-grid">${jointCards}</div>
      </div>`;
  }

  state.lastChampion = newChamp;
  if (isNew) {
    setTimeout(() => {
      const el = c.querySelector('.cv-celebrate');
      if (el) el.classList.remove('cv-celebrate');
    }, 3000);
  }
}

/* ================================================================
   ADD POINTS VIEW — Score Preview + History
   ================================================================ */

function updateAddPointsView(rankings) {
  const preview = document.getElementById('ap-score-preview');
  const selectEl = document.getElementById('house-select');
  if (preview && selectEl) {
    const sel = selectEl.value;
    if (sel && state.scores[sel] !== undefined) {
      const entry = rankings.find(r => r.house === sel);
      preview.innerHTML = `
        <span class="ap-preview-house" data-house="${sel}">${sel}</span>
        <span class="ap-preview-score">${state.scores[sel].toLocaleString()} pts</span>
        <span class="ap-preview-rank">Rank #${entry?.rank || '—'}</span>`;
    } else {
      preview.innerHTML = '<span class="ap-preview-hint">Select a house to view current points &amp; rank</span>';
    }
  }
  renderRecentHistory();
}

function renderRecentHistory() {
  const c = document.getElementById('ap-history');
  if (!c) return;
  const recent = state.history.slice(0, 10);
  if (recent.length === 0) {
    c.innerHTML = '<p class="ap-history-empty">No transactions yet.</p>';
    return;
  }
  let html = '<div class="ap-history-list">';
  recent.forEach(tx => {
    const isD = tx.type === 'deduct';
    const sign = isD ? '−' : '+';
    const cls = isD ? 'tx-deduct' : 'tx-add';
    const time = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    html += `
      <div class="ap-tx ${cls}" data-house="${tx.house}">
        <div class="ap-tx-main">
          <span class="ap-tx-sign">${sign}${tx.amount.toLocaleString()}</span>
          <span class="ap-tx-house">${tx.house}</span>
          ${tx.reason ? `<span class="ap-tx-reason">${escapeHtml(tx.reason)}</span>` : ''}
        </div>
        <div class="ap-tx-detail">
          <span>${tx.previous.toLocaleString()} → ${tx.newScore.toLocaleString()}</span>
          <span class="ap-tx-time">${time}</span>
        </div>
      </div>`;
  });
  html += '</div>';
  c.innerHTML = html;
}

/* ================================================================
   MASTER RENDER
   ================================================================ */

function render() {
  const rankings = computeRankings();
  updateStats(rankings);
  updateScorecards(rankings);
  updateLeaderboard(rankings);
  updateWinner(rankings);

  if (currentView === 'overview') {
    renderOverviewCards(rankings);
    renderOverviewLeaderboard(rankings);
    renderOverviewChampion(rankings);
  }
  if (currentView === 'leaderboard') renderFullLeaderboard(rankings);
  if (currentView === 'champion') renderChampionView(rankings);
  if (currentView === 'add-points') updateAddPointsView(rankings);
  if (currentView === 'house-detail' && currentHouseDetail) renderHouseDetail(currentHouseDetail);
}

/* ================================================================
   TOAST NOTIFICATIONS
   ================================================================ */

let toastTimer = null;

function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, duration);
}

/* ================================================================
   INPUT VALIDATION
   ================================================================ */

function validateForm(house, rawPoints) {
  const houseEl  = document.getElementById('house-select');
  const pointsEl = document.getElementById('points-input');

  if (houseEl) houseEl.classList.remove('is-invalid');
  if (pointsEl) pointsEl.classList.remove('is-invalid');

  if (!house) {
    if (houseEl) houseEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Please select a house.' };
  }

  if (rawPoints === '' || rawPoints === null || rawPoints === undefined) {
    if (pointsEl) pointsEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Please enter a points value.' };
  }

  if (String(rawPoints).includes('.')) {
    if (pointsEl) pointsEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Points must be a whole number, not a decimal.' };
  }

  const points = Number(rawPoints);

  if (!Number.isFinite(points)) {
    if (pointsEl) pointsEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Points must be a valid number.' };
  }

  if (!Number.isInteger(points)) {
    if (pointsEl) pointsEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Points must be a whole number (no decimals).' };
  }

  if (points <= 0) {
    if (pointsEl) pointsEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Points must be a positive number greater than zero.' };
  }

  if (points > 1_000_000) {
    if (pointsEl) pointsEl.classList.add('is-invalid');
    return { valid: false, error: '⚠️ Points cannot exceed 1,000,000 per entry.' };
  }

  return { valid: true, house, points };
}

/* ================================================================
   EVENT HANDLERS
   ================================================================ */

function handleAddPoints(e) {
  e.preventDefault();
  const houseEl  = document.getElementById('house-select');
  const pointsEl = document.getElementById('points-input');
  const reasonEl = document.getElementById('points-reason');
  const house     = houseEl.value.trim();
  const rawPoints = pointsEl.value.trim();
  const reason    = reasonEl ? reasonEl.value.trim() : '';
  const result = validateForm(house, rawPoints);

  if (!result.valid) { showToast(result.error, 'error'); return; }

  const previous = state.scores[result.house];
  const newScore = previous + result.points;
  state.scores[result.house] = newScore;
  addTransaction(result.house, 'add', result.points, previous, newScore, reason);
  saveState();
  render();

  const houseObj = HOUSES.find(h => h.id === result.house);
  showToast(`+${result.points.toLocaleString()} pts → ${houseObj.icon} ${result.house}  |  Total: ${newScore.toLocaleString()}`, 'success', 3500);
  pointsEl.value = '';
  if (reasonEl) reasonEl.value = '';
  pointsEl.focus();
}

function handleDeductPoints() {
  const houseEl  = document.getElementById('house-select');
  const pointsEl = document.getElementById('points-input');
  const reasonEl = document.getElementById('points-reason');
  const house     = houseEl.value.trim();
  const rawPoints = pointsEl.value.trim();
  const reason    = reasonEl ? reasonEl.value.trim() : '';
  const result = validateForm(house, rawPoints);

  if (!result.valid) { showToast(result.error, 'error'); return; }

  const currentScore = state.scores[result.house];
  if (result.points > currentScore) {
    showToast(`⚠️ Cannot deduct ${result.points} from ${result.house} (current: ${currentScore}). Would result in negative score.`, 'error', 4000);
    return;
  }

  if (!window.confirm(`Deduct ${result.points} points from ${result.house}?\n\nCurrent: ${currentScore}\nAfter: ${currentScore - result.points}${reason ? '\nReason: ' + reason : ''}`)) return;

  const previous = currentScore;
  const newScore = currentScore - result.points;
  state.scores[result.house] = newScore;
  addTransaction(result.house, 'deduct', result.points, previous, newScore, reason);
  saveState();
  render();

  const houseObj = HOUSES.find(h => h.id === result.house);
  showToast(`−${result.points.toLocaleString()} pts from ${houseObj.icon} ${result.house}  |  Total: ${newScore.toLocaleString()}`, 'warning', 3500);
  pointsEl.value = '';
  if (reasonEl) reasonEl.value = '';
  pointsEl.focus();
}

function handleReset() {
  const confirmed = window.confirm('⚠️ Reset All Scores?\n\nThis will set every house back to zero and cannot be undone.');
  if (!confirmed) return;
  HOUSES.forEach(h => {
    if (state.scores[h.id] > 0) addTransaction(h.id, 'deduct', state.scores[h.id], state.scores[h.id], 0, 'Full reset');
    state.scores[h.id] = 0;
  });
  saveState();
  render();
  showToast('All scores have been reset to zero.', 'warning', 4000);
}

function handleLoadDemo() {
  if (!window.confirm('Load Demo Data?\n\nThis will set sample scores for screenshots. You can reset afterwards.')) return;
  state.scores = { ALPHA: 350, INFER: 520, MATRIX: 280, LAYER: 410 };
  addTransaction('ALPHA', 'add', 350, 0, 350, 'Demo data');
  addTransaction('INFER', 'add', 520, 0, 520, 'Demo data');
  addTransaction('MATRIX', 'add', 280, 0, 280, 'Demo data');
  addTransaction('LAYER', 'add', 410, 0, 410, 'Demo data');
  saveState();
  render();
  showToast('Demo data loaded. Use Reset to clear.', 'success', 3000);
}

/* ================================================================
   NAVIGATION — SIDEBAR & MOBILE HAMBURGER
   ================================================================ */

function initNav() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute('data-view'));
    });
  });

  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('is-open');
      menu.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
    });

    menu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        burger.classList.remove('is-open');
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        const href = link.getAttribute('href') || '';
        navigateTo(href.replace('#', ''));
      });
    });
  }

  const houseSelect = document.getElementById('house-select');
  if (houseSelect) {
    houseSelect.addEventListener('change', function () {
      this.classList.remove('is-invalid');
      updateAddPointsView(computeRankings());
    });
  }
}

/* ================================================================
   VISUAL THEMES
   ================================================================ */

function initTheme() {
  let savedTheme = 'sunset-glow';
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || 'sunset-glow';
    if (!THEMES.includes(savedTheme)) {
      savedTheme = 'sunset-glow';
    }
  } catch {
    savedTheme = 'sunset-glow';
  }
  setTheme(savedTheme, false);
}

function setTheme(themeName, showNotification = true) {
  // Map backwards compatible or legacy names
  if (themeName === 'cyberpunk') themeName = 'sunset-glow';
  if (themeName === 'stealth') themeName = 'minimal-slate';

  if (!THEMES.includes(themeName)) themeName = 'sunset-glow';
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  try {
    localStorage.setItem(THEME_KEY, themeName);
  } catch (err) {
    console.warn('Could not save theme to LocalStorage:', err);
  }

  const indicator = document.getElementById('theme-indicator');
  if (indicator) {
    const formatted = themeName === 'championship-gold' ? 'Luxe' :
                      themeName === 'tech-blue' ? 'Tech Blue' :
                      themeName === 'minimal-slate' ? 'Slate' : 'Sunset';
    indicator.textContent = `Theme: ${formatted}`;
  }

  document.querySelectorAll('#theme-options .theme-card').forEach(card => {
    const t = card.getAttribute('data-theme');
    const isCur = t === themeName || (t === 'sunset-glow' && themeName === 'cyberpunk');
    card.classList.toggle('active', isCur);
    card.setAttribute('aria-pressed', String(isCur));
  });

  if (showNotification) {
    const titles = {
      'sunset-glow': 'Sunset Glow (Reference Design)',
      'tech-blue': 'Tech Blue (Modern UI)',
      'championship-gold': 'Championship Gold',
      'minimal-slate': 'Minimal Slate'
    };
    showToast(`Theme set to ${titles[themeName] || themeName}`, 'success', 2200);
  }
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.remove('view-hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('view-hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function initThemeListeners() {
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', openSettingsModal);

  const mobileThemeBtn = document.getElementById('mobile-theme-btn');
  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', openSettingsModal);

  const mobileMenuThemeBtn = document.getElementById('mobile-menu-theme-btn');
  if (mobileMenuThemeBtn) {
    mobileMenuThemeBtn.addEventListener('click', () => {
      const burger = document.getElementById('nav-burger');
      const menu   = document.getElementById('mobile-menu');
      if (burger && menu) {
        burger.classList.remove('is-open');
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      }
      openSettingsModal();
    });
  }

  const closeBtn = document.getElementById('settings-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);

  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSettingsModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettingsModal();
  });

  document.querySelectorAll('#theme-options .theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const t = card.getAttribute('data-theme');
      if (t) {
        setTheme(t, true);
        closeSettingsModal();
      }
    });
  });
}

/* ================================================================
   INITIALISATION
   ================================================================ */

function init() {
  initTheme();
  initThemeListeners();

  const loaded = loadState();
  if (!loaded) {
    HOUSES.forEach(h => { state.scores[h.id] = 0; });
    HOUSES.forEach(h => { state.candidates[h.id] = []; });
    state.history = [];
  }

  initScorecards();
  initNav();

  window.addEventListener('hashchange', handleHashChange);
  const { view, houseId } = getViewFromHash();
  showView(view, houseId);

  render();

  const pointsForm = document.getElementById('points-form');
  if (pointsForm) pointsForm.addEventListener('submit', handleAddPoints);

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', handleReset);

  const deductBtn = document.getElementById('deduct-btn');
  if (deductBtn) {
    deductBtn.style.display = '';
    deductBtn.addEventListener('click', handleDeductPoints);
  }

  const demoBtn = document.getElementById('demo-btn');
  if (demoBtn) demoBtn.addEventListener('click', handleLoadDemo);

  const pointsInput = document.getElementById('points-input');
  if (pointsInput) pointsInput.addEventListener('input', function () { this.classList.remove('is-invalid'); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
