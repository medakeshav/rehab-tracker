# Rehab Tracker — Project Reference

PCL reconstruction rehabilitation exercise tracker. Vite-powered PWA with ES modules, Tailwind CSS, offline support via vite-plugin-pwa, and localStorage persistence.

## Quick Start

```bash
npm install && npm run dev    # http://localhost:5173
npm run lint                  # ESLint check (0 errors expected)
npm run format:check          # Prettier formatting check
npm test                      # Vitest (481 tests, 22 test files)
npm test -- --coverage        # Coverage report (target: 80%+, currently ~82%)
npm run build                 # Production build → dist/
```

## Module Load Order & Dependencies

All files use ES module `import`/`export`. Entry point is `js/app.js` (loaded as `<script type="module">`).

```
exercises.js          — Exercise data for 3 phases (no deps)
js/config.js          — Centralized constants: timeouts, thresholds, defaults (no deps)
js/dom-helpers.js     — Safe DOM utilities: h(), clearElement(), text(), fragment() (no deps)
js/utils.js           — Utilities: toast, dialog, localStorage, date helpers (imports exercises, state)
js/state.js           — Global state & localStorage persistence (imports utils, config, wheel-picker)
js/wheel-picker.js    — iOS-style scroll wheel picker with tap-to-activate guard (no deps)
js/navigation.js      — Screen nav, side menu, swipe-back gesture (no deps)
js/export.js          — CSV export with RFC 4180 escaping & data clearing (imports utils, state)
js/history.js         — History tab rendering (imports utils, state)
js/progress.js        — Progress bar, celebrations, contextual messages, toggles (imports utils, state, exercises)
js/assessments.js     — Weekly/monthly form handlers (imports utils, state, navigation)
js/streak.js          — Streak calculation, badge system, loss-aversion warnings, UI (imports state, utils, exercises)
js/exercises-ui.js    — Exercise card UI: create, collapse, expand, save (imports all above)
js/analytics.js       — Chart.js analytics dashboard (imports state, utils, exercises)
js/app.js             — Entry point: init, event wiring, delegated actions (orchestrates all)
```

## Key Patterns

- **ES modules**: All files use `import`/`export`. No shared global scope.
- **Delegated actions**: `[data-action]` attributes routed through single click handler in `app.js`
- **Toggle pattern**: `toggleX()` + `updateXBtn()` + `safeSetItem()` (see sound, progress bar, dark mode)
- **localStorage**: Always use `safeGetItem(key, fallback)` / `safeSetItem(key, value)` from utils.js
- **Constants**: All magic numbers → `CONFIG` object in `js/config.js`
- **Safe DOM**: Use `h()` from dom-helpers.js instead of `innerHTML` for new code
- **CSV escaping**: Always use `escapeCSV()` for user data in exports
- **Timezone-safe dates**: Use `normalizeDate(dateStr)` for YYYY-MM-DD → local midnight
- **Bilateral exercises**: `bilateral: true` flag → single "Reps" picker, stored as both left & right
- **Auto-save**: `beforeunload` + `visibilitychange` → `autoSaveDailyProgress()`
- **Dark mode**: `body.dark` class overrides CSS custom properties + explicit hardcoded colors
- **Tap-to-activate pickers**: Wheel pickers start locked (no scroll). Tap to unlock, tap again or tap outside to re-lock.
- **Contextual completion messages**: 35+ non-repeating messages based on exercise name, sets done, remaining count, and progress percentage.
- **Callback registration**: Modules use `setOnX(fn)` pattern to avoid circular imports (e.g. `setLoadExercises`, `setOnHistoryScreen`)

## File APIs

### exercises.js

- `exercises` — Object with phase1, phase2, phase3 arrays
- `getExercisesForPhase(phase)` — Returns exercises (cumulative: Phase 2 includes Phase 1, etc.)
- `getVisibleExercisesForPhase(phase)` — Returns exercises with grouped balance exercises collapsed

### js/config.js

- `CONFIG` — Central configuration object with sections: TIMEOUTS, AUDIO, PAIN, STREAK, BADGES, UI, CONFETTI, PROGRESS, ANALYTICS, DEFAULTS, CSV, DATE

### js/dom-helpers.js

- `h(tag, attrsOrText, ...children)` — Create elements safely (XSS-free)
- `clearElement(el)` / `replaceContent(el, ...children)` / `text(str)` / `fragment(...children)` / `setAttributes(el, attrs)`

### js/utils.js

- `safeGetItem(key, fallback)` / `safeSetItem(key, value)` — localStorage with error handling
- `showToast(message, type)` — Notification ('success'|'error'|'info')
- `showConfirmDialog(title, message, confirmText, onConfirm, isDestructive)` — iOS-style dialog
- `normalizeDate(dateStr)` — YYYY-MM-DD → Date at local midnight
- `calculateStreak()` / `calculateCurrentWeek()` — Workout stats
- `updateStats()` / `selectPhase(phase)` / `updatePhaseInfo()` / `setupPainSliders()`
- `formatDate(dateString)` / `calculateAvgPain(exercisesList)`

### js/state.js — Globals

- `currentPhase` (1-3), `workoutData`, `weeklyData`, `monthlyData` — Persisted arrays
- `PROGRESS_BAR_VERSION` ('A'|'C'), `darkMode` (boolean), `balanceLevel` (1-5) — Persisted settings
- `streakData` — Streak tracking (recalculated from workoutData on init)
- `dailyProgress` — Today's completion state (auto-resets on new day)
- `captureExerciseData(id)` / `restoreExerciseData(exercise)` / `autoSaveDailyProgress()`
- `loadDailyProgress()` / `createFreshProgress()` / `saveDailyProgress()`
- `updatePainColor(element, value)` — Green (0-3), warning (4-6), danger (7-10)
- State setters: `setCurrentPhase`, `setWorkoutData`, `setWeeklyData`, `setMonthlyData`, etc.

### js/wheel-picker.js

- `createWheelPicker(id, min, max, step, defaultValue)` — Returns DOM element (starts locked)
- `getPickerValue(id)` / `setPickerValue(id, value)` — Read/write picker values
- `lockPicker(container)` / `unlockPicker(container)` — Control picker active state
- `WHEEL_PICKER_ITEM_HEIGHT` = 36px

### js/navigation.js

- `openMenu()` / `closeMenu()` — Side menu
- `showScreen(screenName, useSlideBack)` / `goBack()` — Screen navigation with history stack
- `initSwipeBack()` — Edge swipe gesture (100px threshold)
- `setOnHistoryScreen(fn)` / `setOnAnalyticsScreen(fn)` — Callback registration

### js/progress.js

- `updateProgressBar()` — Render Version A (sticky bar) or C (thumbnail circles)
- `checkAllComplete()` / `showCelebration()` / `hideCelebration()`
- `playCompletionSound()` / `showCompletionToast(exercise)` / `getCompletionMessage(exercise)`
- `pickFreshMessage(pool)` — Random non-repeating message selection
- `toggleSound()` / `toggleProgressBar()` / `toggleDarkMode()` — Each with `updateXBtn()` pair
- `applyDarkMode()` / `clearDailyProgress()` / `scrollToExercise(id)`

### js/streak.js

- `BADGES` — Array of 27 badge definitions (consistency, volume, muscle mastery)
- `initStreak()` — Recalculate streak from workoutData (self-healing), check badges
- `onWorkoutSaved()` — Update streak, check badges, show unlock toasts
- `renderStreakCard()` — Home screen streak display with week row and badges
- `getStreakWarning()` — Loss-aversion warnings for streak maintenance
- `renderWarningBanner()` / `checkStreakReminder()` / `getCurrentStreak()`

### js/export.js

- `exportAllData()` — Download workouts, weekly, monthly as CSV files
- `clearAllData()` — Destructive confirmation → localStorage.clear()
- Internal: `escapeCSV(value)` — RFC 4180 compliant CSV escaping

### js/exercises-ui.js

- `loadExercises()` — Render all exercise cards for current phase
- `createExerciseCard(exercise, index)` / `createCompletedCard(exercise)`
- `createGroupedExerciseCard(groupItem)` / `createCompletedGroupCard(groupItem)`
- `collapseCard(card, exercise)` / `expandCard(card, exercise)`
- `switchBalanceLevel(card, groupItem, newLevel)` — Balance progression
- `saveWorkout()` — Collect all data and save to localStorage
- `showInstructionsBottomSheet(exercise)` — Bottom sheet with exercise instructions

### js/app.js — Delegated Actions

`navigate`, `select-phase`, `toggle-sound`, `toggle-progress-bar`, `toggle-dark-mode`, `clear-progress`, `save-workout`, `history-tab`, `export-data`, `clear-all-data`, `toggle-analytics-section`

## HTML Screens (index.html)

| Screen ID            | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `homeScreen`         | Welcome card, phase selector, quick actions, stats, streak card |
| `dailyScreen`        | Date picker, progress bar, exercise list, save button |
| `weeklyScreen`       | Weekly assessment form (stand, bridge, reach, pain)   |
| `monthlyScreen`      | Monthly assessment form (measurements, photos, phase) |
| `historyScreen`      | Tab-based history viewer (workouts, weekly, monthly)  |
| `analyticsScreen`    | Chart.js analytics dashboard                          |
| `exportScreen`       | CSV export + clear all data                           |
| `instructionsScreen` | Static how-to cards                                   |

Key element IDs: `exerciseList`, `progressBarA`, `progressBarC`, `workoutDate`, `phaseInfo`, `menuBtn`, `sideMenu`, `streakCard`, `streakWarning`

## CSS Architecture (styles.css)

**Design tokens in `:root`**: `--primary-color` (#4472C4), `--text-dark`, `--bg-light`, `--border-color`, `--success-color`, `--danger-color`, `--warning-color`, spacing scale (`--space-xs` to `--space-3xl`), radius, shadows, z-index scale, font sizes, transitions.

**Dark mode**: `body.dark` overrides all CSS custom properties + explicit rules for hardcoded colors

**Key UI components**:

- `.sets-radio-group` / `.sets-radio-btn` — Horizontal radio buttons (1-5)
- `.wheel-picker-container` / `.wheel-picker--active` — Tap-to-activate scroll pickers
- `.wheel-picker-tap-guard` — Invisible overlay that intercepts taps when picker is locked
- `.save-section` — Sticky bottom save button
- `.pain-value` — Color-coded badge: green (0-3), warning (4-6), danger (7-10)
- `.streak-flame` — CSS-only animated flame with tiers (none/small/medium/large/epic/recovery)

## Exercise Data Structure

```js
{
  id, name, targetReps, leftTarget, rightTarget, sets, category,
  bilateral: false, progressionLevel: 1-5, group: 'groupName',
  instructions: { title, steps[], reps, sets, why, tips[] }
}
```

## Testing

- **Framework**: Vitest 2 + jsdom, 481 tests across 22 files
- **Coverage**: 82% statements via @vitest/coverage-v8 (see `vite.config.js` for scope)
- **Two patterns**: Pure function tests (inline reimplementations) and integration tests (real imports + `vi.mock()`)
- **Coverage scope**: `js/**/*.js` + `exercises.js`, excludes `js/app.js` (orchestrator, no exports) and `js/analytics.js` (charts)
- **See**: `.cursor/rules/testing-patterns.mdc` for detailed mocking strategies and test inventory

## Common Tasks

| Task             | Files to modify                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Add new exercise | `exercises.js`                                                                                        |
| Add menu toggle  | `js/state.js` (var), `js/progress.js` (toggle fn), `index.html` (button), `js/app.js` (action + init) |
| New screen       | `index.html` (HTML), `styles.css` (styles), `js/navigation.js` or new module                          |
| UI styling       | `styles.css` (+ dark mode overrides in `body.dark` section)                                           |
| New test         | `tests/*-integration.test.js` (import real module, mock deps with `vi.mock()`)                        |
| Add constant     | `js/config.js` → appropriate section of `CONFIG` object                                               |

## Documentation & Maintenance Rules

- **CLAUDE.md** — Update only when structure changes (new module, new screen, new pattern). Skip for bug fixes, CSS tweaks, or changes following existing patterns.
- **Cursor Rules** — `.cursor/rules/project-overview.mdc` (always loaded) and `.cursor/rules/testing-patterns.mdc` (loaded when editing tests). Update when conventions change.
- **README.md** — Keep minimal. Update rarely.
- **No release notes or screenshots** — Git commit messages serve as the changelog.
- **Commit messages** — Descriptive and conventional (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).

## Infrastructure

- **Vite 5** dev server + build tool, `npm run dev` on port 5173
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **vite-plugin-pwa** with Workbox for service worker generation (autoUpdate, CacheFirst for CDN)
- **ESLint 9** flat config, `sourceType: 'module'`, browser globals registered manually
- **Prettier** for code formatting (`npm run format` / `npm run format:check`)
- **Vitest 2** with jsdom environment, @vitest/coverage-v8 for coverage
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — lint, format check, tests
- **GitHub Pages deploy** (`.github/workflows/deploy.yml`) — Vite build + deploy

## Remaining Architectural Work (Optional)

See `REFACTORING-GUIDE.md` for detailed plans on:
- Splitting `js/streak.js` (1,212 lines → 3 files: badges, streak-calc, streak-ui)
- Splitting `js/exercises-ui.js` (916 lines → 4 files: card, save, instructions, manager)
- Consolidating dark mode CSS (94 `body.dark` selectors → CSS variable overrides)
- Replacing remaining `innerHTML` usage with `h()` helper (6 files)
