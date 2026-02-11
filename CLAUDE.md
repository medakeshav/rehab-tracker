# Rehab Tracker — Project Reference

PCL reconstruction rehabilitation exercise tracker. Vanilla JS PWA with service worker offline support and localStorage persistence.

## Quick Start

```bash
npm install && npm run serve   # http://localhost:8080
npm run lint                   # ESLint check (0 errors expected)
npm test                       # Vitest (56 tests)
```

## Module Load Order & Dependencies

```
exercises.js          — Exercise data for 3 phases (no deps)
js/utils.js           — Utilities: toast, dialog, localStorage, date helpers (no deps)
js/state.js           — Global state & localStorage persistence (uses utils, exercises, wheel-picker)
js/wheel-picker.js    — iOS-style scroll wheel picker component (no deps)
js/navigation.js      — Screen nav, side menu, swipe-back gesture (no deps)
js/export.js          — CSV export & data clearing (uses utils, state globals)
js/history.js         — History tab rendering (uses utils, state globals)
js/progress.js        — Progress bar, celebrations, sound/theme toggles (uses utils, state, exercises)
js/assessments.js     — Weekly/monthly form handlers (uses utils, state globals)
js/exercises-ui.js    — Exercise card UI: create, collapse, expand, save (uses all above)
js/app.js             — Entry point: init, event wiring, delegated actions (orchestrates all)
```

All files share browser global scope. Cross-module functions registered in `eslint.config.js` globals.

## Key Patterns

- **Delegated actions**: `[data-action]` attributes routed through single click handler in `app.js`
- **Toggle pattern**: `toggleX()` + `updateXBtn()` + `safeSetItem()` (see sound, progress bar, dark mode)
- **localStorage**: Always use `safeGetItem(key, fallback)` / `safeSetItem(key, value)` from utils.js
- **Timezone-safe dates**: Use `normalizeDate(dateStr)` for YYYY-MM-DD → local midnight
- **Bilateral exercises**: `bilateral: true` flag → single "Reps" picker, stored as both left & right
- **Auto-save**: `beforeunload` + `visibilitychange` → `autoSaveDailyProgress()`
- **Dark mode**: `body.dark-mode` class overrides CSS custom properties + explicit hardcoded colors

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

### js/wheel-picker.js
- `createWheelPicker(id, min, max, step, defaultValue)` — Returns DOM element
- `getPickerValue(id)` / `setPickerValue(id, value)` — Read/write picker values
- `WHEEL_PICKER_ITEM_HEIGHT` = 36px

### js/navigation.js
- `openMenu()` / `closeMenu()` — Side menu
- `showScreen(screenName)` / `goBack()` — Screen navigation with history stack
- `initSwipeBack()` — Edge swipe gesture (40px zone, 80px threshold)

### js/progress.js
- `updateProgressBar()` — Render Version A (sticky bar) or C (thumbnail circles)
- `checkAllComplete()` / `showCelebration()` / `hideCelebration()`
- `playCompletionSound()` / `showCompletionToast()` / `getCompletionMessage()`
- `toggleSound()` / `updateSoundToggleBtn()`
- `toggleProgressBar()` / `updateProgressBarToggleBtn()`
- `toggleDarkMode()` / `applyDarkMode()` / `updateDarkModeToggleBtn()`
- `clearDailyProgress()` / `scrollToExercise(id)`

### js/exercises-ui.js
- `loadExercises()` — Render all exercise cards for current phase
- `createExerciseCard(exercise, index)` / `createCompletedCard(exercise)`
- `collapseCard(card, exercise)` / `expandCard(card, exercise)`
- `saveWorkout()` — Collect all data and save to localStorage
- `showInstructions(exercise)` — Full-screen instruction modal

### js/app.js — Delegated Actions
`navigate`, `select-phase`, `toggle-sound`, `toggle-progress-bar`, `toggle-dark-mode`, `clear-progress`, `save-workout`, `history-tab`, `export-data`, `clear-all-data`

## HTML Screens (index.html)

| Screen ID | Purpose |
|-----------|---------|
| `homeScreen` | Welcome card, phase selector, quick actions, stats |
| `dailyScreen` | Date picker, progress bar, exercise list, save button |
| `weeklyScreen` | Weekly assessment form (stand, bridge, reach, pain) |
| `monthlyScreen` | Monthly assessment form (measurements, photos, phase) |
| `historyScreen` | Tab-based history viewer (workouts, weekly, monthly) |
| `exportScreen` | CSV export + clear all data |
| `instructionsScreen` | Static how-to cards |

Key element IDs: `exerciseList`, `progressBarA`, `progressBarC`, `workoutDate`, `phaseInfo`, `menuBtn`, `sideMenu`

## CSS Architecture (styles.css)

**Design tokens in `:root`**: `--primary-color` (#4472C4), `--text-dark`, `--bg-light`, `--border-color`, `--success-color`, `--danger-color`, `--warning-color`, spacing scale (`--space-xs` to `--space-3xl`), radius, shadows, z-index scale, font sizes, transitions.

**Sections**: Design Tokens → Reset → Layout → Navigation → Cards → Forms → Components → Modals → Pages → Animations → Accessibility → Dark Mode → Responsive

**Dark mode**: `body.dark-mode` overrides all CSS custom properties + explicit rules for hardcoded colors (gradients, white backgrounds, etc.)

## Exercise Data Structure

```js
{ id, name, targetReps, leftTarget, rightTarget, sets, category,
  bilateral: false, progressionLevel: 1-5, instructions: { title, steps[], reps, sets, why, tips[] } }
```

## Common Tasks

| Task | Files to modify |
|------|----------------|
| Add new exercise | `exercises.js` |
| Add menu toggle | `js/state.js` (var), `js/progress.js` (toggle fn), `index.html` (button), `js/app.js` (action + init), `eslint.config.js` (globals) |
| New screen | `index.html` (HTML), `styles.css` (styles), `js/navigation.js` or new module |
| UI styling | `styles.css` (+ dark mode overrides in `body.dark-mode` section) |
| New test | `tests/*.test.js` (inline function copies, jsdom env) |
| Cache update | `sw.js` (bump version number) |

## Infrastructure

- **ESLint 9** flat config, script sourceType, cross-module globals registered manually
- **Vitest** with jsdom environment, 56 tests across 5 files
- **Service Worker** v13, network-first strategy, skipWaiting
- **No build step** — files served directly
