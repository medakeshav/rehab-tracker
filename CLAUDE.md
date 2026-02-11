# Rehab Tracker — Project Reference

PCL reconstruction rehabilitation exercise tracker. Vite-powered PWA with ES modules, Tailwind CSS, offline support via vite-plugin-pwa, and localStorage persistence.

## Quick Start

```bash
npm install && npm run dev    # http://localhost:5173
npm run lint                  # ESLint check (0 errors expected)
npm run format:check          # Prettier formatting check
npm test                      # Vitest (56 tests)
npm run build                 # Production build → dist/
```

## Module Load Order & Dependencies

All files use ES module `import`/`export`. Entry point is `js/app.js` (loaded as `<script type="module">`).

```
exercises.js          — Exercise data for 3 phases (no deps)
js/utils.js           — Utilities: toast, dialog, localStorage, date helpers (imports exercises, state)
js/state.js           — Global state & localStorage persistence (imports utils, wheel-picker)
js/wheel-picker.js    — iOS-style scroll wheel picker with tap-to-activate guard (no deps)
js/navigation.js      — Screen nav, side menu, swipe-back gesture (no deps)
js/export.js          — CSV export & data clearing (imports utils, state)
js/history.js         — History tab rendering (imports utils, state)
js/progress.js        — Progress bar, celebrations, contextual messages, toggles (imports utils, state, exercises)
js/assessments.js     — Weekly/monthly form handlers (imports utils, state)
js/exercises-ui.js    — Exercise card UI: create, collapse, expand, save (imports all above)
js/app.js             — Entry point: init, event wiring, delegated actions (orchestrates all)
```

## Key Patterns

- **ES modules**: All files use `import`/`export`. No shared global scope.
- **Delegated actions**: `[data-action]` attributes routed through single click handler in `app.js`
- **Toggle pattern**: `toggleX()` + `updateXBtn()` + `safeSetItem()` (see sound, progress bar, dark mode)
- **localStorage**: Always use `safeGetItem(key, fallback)` / `safeSetItem(key, value)` from utils.js
- **Timezone-safe dates**: Use `normalizeDate(dateStr)` for YYYY-MM-DD → local midnight
- **Bilateral exercises**: `bilateral: true` flag → single "Reps" picker, stored as both left & right
- **Auto-save**: `beforeunload` + `visibilitychange` → `autoSaveDailyProgress()`
- **Dark mode**: `body.dark` class overrides CSS custom properties + explicit hardcoded colors
- **Tap-to-activate pickers**: Wheel pickers start locked (no scroll). Tap to unlock, tap again or tap outside to re-lock. Prevents accidental value changes during page scroll.
- **Contextual completion messages**: 35+ non-repeating messages based on exercise name, sets done, remaining count, and progress percentage.

## File APIs

### exercises.js

- `exercises` — Object with phase1, phase2, phase3 arrays
- `getExercisesForPhase(phase)` — Returns exercises (cumulative: Phase 2 includes Phase 1, etc.)

### js/utils.js

- `safeGetItem(key, fallback)` / `safeSetItem(key, value)` — localStorage with error handling
- `showToast(message, type)` — Notification ('success'|'error'|'info')
- `showConfirmDialog(title, message, confirmText, onConfirm, isDestructive)` — iOS-style dialog
- `normalizeDate(dateStr)` — YYYY-MM-DD → Date at local midnight
- `calculateStreak()` / `calculateCurrentWeek()` — Workout stats (use global `workoutData`)
- `updateStats()` / `selectPhase(phase)` / `updatePhaseInfo()` / `setupPainSliders()`
- `formatDate(dateString)` / `calculateAvgPain(exercisesList)`

### js/state.js — Globals

- `currentPhase` (1-3), `workoutData`, `weeklyData`, `monthlyData` — Persisted arrays
- `PROGRESS_BAR_VERSION` ('A'|'C'), `darkMode` (boolean) — Persisted settings
- `dailyProgress` — Today's completion state (auto-resets on new day)
- `captureExerciseData(id)` / `restoreExerciseData(exercise)` / `autoSaveDailyProgress()`
- `loadDailyProgress()` / `createFreshProgress()` / `saveDailyProgress()`
- `updatePainColor(element, value)` — Green (0-3), warning (4-6), danger (7-10)

### js/wheel-picker.js

- `createWheelPicker(id, min, max, step, defaultValue)` — Returns DOM element (starts locked)
- `getPickerValue(id)` / `setPickerValue(id, value)` — Read/write picker values
- `lockPicker(container)` / `unlockPicker(container)` — Control picker active state
- `WHEEL_PICKER_ITEM_HEIGHT` = 36px
- Global listeners: `pointerdown` (lock on outside tap), `scroll` capture (lock on page scroll, ignores picker-internal scroll)

### js/navigation.js

- `openMenu()` / `closeMenu()` — Side menu
- `showScreen(screenName)` / `goBack()` — Screen navigation with history stack
- `initSwipeBack()` — Edge swipe gesture (40px zone, 80px threshold)

### js/progress.js

- `updateProgressBar()` — Render Version A (sticky bar) or C (thumbnail circles)
- `checkAllComplete()` / `showCelebration()` / `hideCelebration()`
- `playCompletionSound()` / `showCompletionToast(exercise)` / `getCompletionMessage(exercise)`
- `pickFreshMessage(pool)` — Random non-repeating message selection
- `toggleSound()` / `updateSoundToggleBtn()`
- `toggleProgressBar()` / `updateProgressBarToggleBtn()`
- `toggleDarkMode()` / `applyDarkMode()` / `updateDarkModeToggleBtn()`
- `clearDailyProgress()` / `scrollToExercise(id)`

### js/exercises-ui.js

- `loadExercises()` — Render all exercise cards for current phase
- `createExerciseCard(exercise, index)` / `createCompletedCard(exercise)`
- `collapseCard(card, exercise)` / `expandCard(card, exercise)`
- `saveWorkout()` — Collect all data and save to localStorage
- `showInstructionsBottomSheet(exercise)` — Bottom sheet with exercise instructions

### js/app.js — Delegated Actions

`navigate`, `select-phase`, `toggle-sound`, `toggle-progress-bar`, `toggle-dark-mode`, `clear-progress`, `save-workout`, `history-tab`, `export-data`, `clear-all-data`

## HTML Screens (index.html)

| Screen ID            | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `homeScreen`         | Welcome card, phase selector, quick actions, stats    |
| `dailyScreen`        | Date picker, progress bar, exercise list, save button |
| `weeklyScreen`       | Weekly assessment form (stand, bridge, reach, pain)   |
| `monthlyScreen`      | Monthly assessment form (measurements, photos, phase) |
| `historyScreen`      | Tab-based history viewer (workouts, weekly, monthly)  |
| `exportScreen`       | CSV export + clear all data                           |
| `instructionsScreen` | Static how-to cards                                   |

Key element IDs: `exerciseList`, `progressBarA`, `progressBarC`, `workoutDate`, `phaseInfo`, `menuBtn`, `sideMenu`

## CSS Architecture (styles.css)

**Design tokens in `:root`**: `--primary-color` (#4472C4), `--text-dark`, `--bg-light`, `--border-color`, `--success-color`, `--danger-color`, `--warning-color`, spacing scale (`--space-xs` to `--space-3xl`), radius, shadows, z-index scale, font sizes, transitions.

**Sections**: Design Tokens → Reset → Layout → Navigation → Cards → Forms → Components → Modals → Pages → Animations → Accessibility → Dark Mode → Responsive

**Dark mode**: `body.dark` overrides all CSS custom properties + explicit rules for hardcoded colors (gradients, white backgrounds, etc.)

**Key UI components**:

- `.sets-radio-group` / `.sets-radio-btn` — Horizontal radio buttons (1-5) with green active state
- `.wheel-picker-container` / `.wheel-picker--active` — Tap-to-activate scroll pickers with locked/unlocked states
- `.wheel-picker-tap-guard` — Invisible overlay that intercepts taps when picker is locked
- `.save-section` — Sticky bottom save button (50% width, centered, gradient fade background)
- `.pain-value` — Color-coded badge: green (0-3), warning (4-6), danger (7-10)

## Exercise Data Structure

```js
{
  id, name, targetReps, leftTarget, rightTarget, sets, category,
  bilateral: false, progressionLevel: 1-5,
  instructions: { title, steps[], reps, sets, why, tips[] }
}
```

## Common Tasks

| Task             | Files to modify                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Add new exercise | `exercises.js`                                                                                        |
| Add menu toggle  | `js/state.js` (var), `js/progress.js` (toggle fn), `index.html` (button), `js/app.js` (action + init) |
| New screen       | `index.html` (HTML), `styles.css` (styles), `js/navigation.js` or new module                          |
| UI styling       | `styles.css` (+ dark mode overrides in `body.dark` section)                                           |
| New test         | `tests/*.test.js` (inline function copies, jsdom env)                                                 |

## Documentation & Maintenance Rules

- **CLAUDE.md** — Update only when structure changes (new module, new screen, new pattern). Skip for bug fixes, CSS tweaks, or changes following existing patterns.
- **README.md** — Keep minimal. Update rarely.
- **No release notes or screenshots** — Git commit messages serve as the changelog. The live app is the living demo.
- **Commit messages** — Descriptive and conventional (`feat:`, `fix:`, `refactor:`, `docs:`). These ARE the release notes.

## Infrastructure

- **Vite 5** dev server + build tool, `npm run dev` on port 5173
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **vite-plugin-pwa** with Workbox for service worker generation (autoUpdate, CacheFirst for CDN)
- **ESLint 9** flat config, `sourceType: 'module'`, browser globals registered manually
- **Prettier** for code formatting (`npm run format` / `npm run format:check`)
- **Vitest** with jsdom environment, 56 tests across 5 files
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — lint, format check, tests
- **GitHub Pages deploy** (`.github/workflows/deploy.yml`) — Vite build + deploy
