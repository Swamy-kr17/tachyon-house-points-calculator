# Tachyon House Points Calculator

> Third-Year Technical Team Assessment

A fully client-side, zero-dependency web application that tracks and ranks house points for Tachyon's four houses: **ALPHA**, **INFER**, **MATRIX**, and **LAYER**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Setup Instructions](#setup-instructions)
4. [How to Use](#how-to-use)
5. [Ranking Algorithm](#ranking-algorithm)
6. [Technical Design](#technical-design)
7. [Tests Performed](#tests-performed)
8. [Sample Output](#sample-output)
9. [Publishing to GitHub](#publishing-to-github)

---

## Project Overview

| Feature | Detail |
|---|---|
| Technology | HTML5, CSS3, Vanilla JavaScript |
| Persistence | Browser `localStorage` |
| Dependencies | **None** — no frameworks, no npm, no CDN |
| Entry point | `index.html` (open directly in any modern browser) |
| Theme | Dark futuristic dashboard |

---

## File Structure

```
tachyon-house-points/
├── index.html          # Application markup (semantic HTML5)
├── style.css           # Dark futuristic stylesheet (CSS custom properties, responsive)
├── script.js           # Application logic (rankings, persistence, validation)
├── README.md           # This file
└── screenshots/
    └── README.md       # Instructions for capturing screenshots
```

---

## Setup Instructions

### Option 1 — Open directly (quickest)

1. Download or clone this repository.
2. Double-click `index.html` — it opens in your default browser.
3. No server, no build step, no installation required.

### Option 2 — Serve with a local HTTP server (recommended for development)

Using Python (built into most systems):

```bash
# Python 3
python -m http.server 8080

# Then open http://localhost:8080 in your browser
```

Using Node.js `serve`:

```bash
npx serve .
```

Using VS Code **Live Server** extension:

1. Install the *Live Server* extension.
2. Right-click `index.html` → **Open with Live Server**.

---

## How to Use

1. **Select a house** from the dropdown (ALPHA, INFER, MATRIX, or LAYER).
2. **Enter the points** to award — must be a positive whole number.
3. Click **Add Points**. The scorecards, leaderboard, and winner banner update instantly.
4. Click **Reset All Scores** to clear everything (a confirmation dialog appears).
5. Refresh the page — your scores are saved in `localStorage` and will be restored.

---

## Ranking Algorithm

### Step-by-step

1. **Build entries** — Create an array of `{ house, score }` pairs from the current state.

2. **Primary sort — descending score**
   ```
   entries.sort((a, b) => b.score - a.score)
   ```

3. **Secondary sort — ascending house name (tie-break)**
   When two houses have equal scores, they are ordered alphabetically (A → Z) so the display order is always deterministic and predictable.
   ```
   entries.sort((a, b) =>
     b.score !== a.score
       ? b.score - a.score
       : a.house.localeCompare(b.house)
   )
   ```

4. **Assign ranks** — Houses that share a score receive the same rank number. The next distinct score group skips the intervening rank numbers (standard competition ranking / "1224" ranking).

   | Score | House  | Rank |
   |-------|--------|------|
   | 300   | MATRIX | 1    |
   | 200   | ALPHA  | 2    |
   | 200   | LAYER  | 2    |
   | 100   | INFER  | 4    |

5. **Identify winner(s)** — Any house whose score equals the maximum score **and** whose score is greater than zero is marked as a joint top-position holder. If only one such house exists, it is the sole winner. If multiple exist, they are displayed as **Joint Leaders**.

6. **All-zero edge case** — When every house has 0 points, no winner is declared and a prompt to start adding points is shown instead.

### Complexity

The sort runs in **O(n log n)** time where *n = 4* (constant), so the algorithm is effectively O(1) for this application.

---

## Technical Design

### State management

A single `state` object holds all scores. Every user action mutates `state`, persists it to `localStorage`, then calls `render()`. `render()` is a pure function of `state` — calling it twice produces the same DOM output.

### LocalStorage persistence

- **Key:** `tachyon_house_scores`
- **Format:** JSON object `{ "ALPHA": 0, "INFER": 0, "MATRIX": 0, "LAYER": 0 }`
- On startup, the saved value is validated (must have all four keys, all non-negative numbers). Corrupt data is discarded and zeroes are used instead.

### Input validation

| Check | Result |
|---|---|
| Empty house | Rejected — "Please select a house" |
| Empty points | Rejected — "Please enter a points value" |
| Contains decimal point (e.g. `1.5`) | Rejected — string-level check before `Number()` conversion |
| Zero | Rejected — must be > 0 |
| Negative | Rejected |
| Non-numeric | Rejected |
| > 1,000,000 | Rejected — reasonable upper cap |
| Valid positive whole number | Accepted ✅ |

### Accessibility

- All form controls have `<label>` elements.
- Live regions (`aria-live="polite"`) on the leaderboard and winner section.
- `role="table"` on the leaderboard with `scope` attributes on headers.
- `role="progressbar"` with `aria-valuenow/min/max` on progress bars.
- All interactive elements are keyboard-navigable.
- High-contrast colour ratios throughout.

---

## Tests Performed

The following scenarios were manually tested by opening `index.html` in Google Chrome and Microsoft Edge:

| # | Scenario | Method | Result |
|---|---|---|---|
| 1 | All scores start at zero | Fresh page load (no localStorage) | ✅ All scorecards show 0 |
| 2 | Adding points updates correct house | Selected ALPHA, entered 150, clicked Add | ✅ ALPHA = 150, others = 0 |
| 3 | Repeated additions accumulate | Added 150 to ALPHA twice | ✅ ALPHA = 300 |
| 4 | Rankings update on score change | Added 400 to INFER after ALPHA = 300 | ✅ INFER rank 1, ALPHA rank 2 |
| 5 | Ties for first place | Set ALPHA = 200, INFER = 200 | ✅ Both shown as Joint Leaders |
| 6 | Invalid input — empty house | Left house unselected, entered 50 | ✅ Error toast, red border on select |
| 7 | Invalid input — zero | Selected MATRIX, entered 0 | ✅ Error toast, red border on input |
| 8 | Invalid input — negative | Selected LAYER, entered -10 | ✅ Rejected |
| 9 | Invalid input — decimal | Selected ALPHA, entered 1.5 | ✅ Rejected |
| 10 | Invalid input — text | Selected ALPHA, entered "abc" | ✅ Rejected |
| 11 | Scores survive page refresh | Added points, refreshed (F5) | ✅ Scores restored from localStorage |
| 12 | Reset clears all scores | Clicked Reset, confirmed | ✅ All houses return to 0 |
| 13 | Reset — cancel | Clicked Reset, dismissed dialog | ✅ Scores unchanged |
| 14 | Desktop layout | Chrome 1920×1080 | ✅ Four-column scorecard grid |
| 15 | Tablet layout | DevTools 768px | ✅ Two-column grid, single-column form |
| 16 | Mobile layout | DevTools 375px | ✅ Two-column scorecard, stacked form |

---

## Sample Output

```
══════════════════════════════════════════════
  ⚡ TACHYON   House Points Calculator
══════════════════════════════════════════════

 House Scorecards
 ┌───────────┬───────────┬───────────┬───────────┐
 │  #2 ALPHA │  #1 INFER │  #3 MATRIX│  #2 LAYER │
 │  🔱        │  🧠        │  🔮        │  🌊        │
 │   200 pts │   400 pts │   100 pts │   200 pts │
 └───────────┴───────────┴───────────┴───────────┘

 Live Leaderboard
 ┌──────┬────────┬──────────┬──────────────────┐
 │ Rank │ House  │  Points  │ Progress         │
 ├──────┼────────┼──────────┼──────────────────┤
 │  🥇1 │ INFER  │    400   │ ████████████████ │
 │  🥈2 │ ALPHA  │    200   │ ████████         │
 │  🥈2 │ LAYER  │    200   │ ████████         │
 │  🥉4 │ MATRIX │    100   │ ████             │
 └──────┴────────┴──────────┴──────────────────┘

 🏆 Current Leader
    🧠 INFER
    400 points
══════════════════════════════════════════════
```

---

## Publishing to GitHub

> ⚠️ Do not push to GitHub without approval. Follow these exact steps when ready.

### Prerequisites

- [Git](https://git-scm.com/downloads) installed.
- A [GitHub](https://github.com) account.

### Step-by-step

```bash
# 1. Navigate to the project folder
cd path/to/tachyon-house-points

# 2. Initialise a Git repository (if not already done)
git init

# 3. Stage all files
git add .

# 4. Create the initial commit
git commit -m "feat: initial release — Tachyon House Points Calculator"

# 5. On GitHub, create a new empty repository named e.g. "tachyon-house-points"
#    (do NOT initialise it with a README on GitHub)

# 6. Add the remote origin
git remote add origin https://github.com/YOUR_USERNAME/tachyon-house-points.git

# 7. Push
git branch -M main
git push -u origin main
```

### Enable GitHub Pages (optional — serves the app publicly)

1. Go to the repository on GitHub.
2. **Settings → Pages → Source → Deploy from branch**.
3. Select `main` branch and `/ (root)` folder, then click **Save**.
4. After ~60 seconds, the app will be live at  
   `https://YOUR_USERNAME.github.io/tachyon-house-points/`

---

*Built with HTML5 · CSS3 · Vanilla JavaScript · No external dependencies*
