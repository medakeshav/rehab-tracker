# Rehab Exercise Tracker

A mobile-optimized Progressive Web App for tracking PCL reconstruction rehabilitation exercises, assessments, and progress.

## Features

- **Daily Workout Logging** — Track exercises with left/right leg reps, sets (1-5 radio buttons), and pain levels (0-10 slider)
- **iOS-Style Wheel Pickers** — Tap-to-activate number pickers that won't trigger accidentally during page scroll
- **Contextual Encouragement** — 35+ motivational messages based on exercise name, sets completed, and remaining exercises
- **Weekly & Monthly Assessments** — Monitor balance, strength, measurements, and pain progress
- **History & Analytics** — View all past workouts and assessments
- **Data Export** — Export all data as CSV files for backup
- **Installable PWA** — Add to homescreen and use like a native app
- **Offline First** — Works completely offline, data stored locally
- **Phase-Based** — Tailored for 3 rehabilitation phases (cumulative exercises)
- **Dark Mode** — Toggle via hamburger menu

## Getting Started

### Prerequisites

- Node.js (v18+)

### Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
```

### Other Commands

```bash
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier auto-format
npm run format:check # Prettier check (used in CI)
npm test             # Run tests (Vitest, 56 tests)
npm run test:watch   # Run tests in watch mode
```

### Deployment

The app deploys automatically via GitHub Actions:

- **CI** (`.github/workflows/ci.yml`) — Runs lint, format check, and tests on every push
- **Deploy** (`.github/workflows/deploy.yml`) — Runs `npm run build` and deploys the `dist/` output to GitHub Pages

**Required:** In your repo, go to **Settings → Pages** and set **Source** to **GitHub Actions** (not "Deploy from a branch"). The workflow builds with Vite using base path `/rehab-tracker/`.

Your app will be available at: `https://[your-username].github.io/rehab-tracker`

## Installing on Your Phone

### iPhone (Safari)

1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)

1. Open the app URL in Chrome
2. Tap the menu (three dots) in the top right
3. Tap "Add to Home screen"
4. Tap "Add"

## Using the App

### Daily Workout

1. Select your current phase from home screen
2. Go to "Daily Workout"
3. For each exercise:
    - Tap the wheel picker to unlock it, scroll to set reps, tap again to lock
    - Select sets completed (1-5 buttons)
    - Set pain level (0-10 slider — green for 0-3, warning for 4-6, red for 7+)
    - Tap "Mark Complete" — get a contextual encouragement message
4. Click "Save Workout"

### Weekly Assessment (Every Sunday)

1. Go to "Weekly Assessment"
2. Complete all tests: single-leg balance, bridges, reaches, pain levels
3. Add notes and save

### Monthly Assessment (End of Month)

1. Go to "Monthly Assessment"
2. Measure calf and thigh circumference (both legs)
3. Check photos/video taken, note phase and readiness
4. Add progress notes and save

### Exporting Data

1. Go to Menu → Export Data
2. Click "Download CSV Files"
3. Three CSV files will download: workouts, weekly assessments, monthly assessments

## Tech Stack

- **Vite 5** — Dev server and build tool
- **Tailwind CSS 4** — Utility-first CSS
- **vite-plugin-pwa** — Service worker generation with Workbox
- **ESLint 9** — Linting (flat config, ES modules)
- **Prettier** — Code formatting
- **Vitest** — Unit tests (jsdom environment)
- **GitHub Actions** — CI/CD pipeline

## Exercise Phases

| Phase | Period     | Focus                                                   |
| ----- | ---------- | ------------------------------------------------------- |
| 1     | Weeks 1-8  | 15 exercises: foot/ankle, hip/glute, core, mobility     |
| 2     | Weeks 9-20 | Phase 1 + 6 new: single-leg strength, dynamic stability |
| 3     | Week 21+   | Phase 2 + 3 power/plyometric exercises                  |

## Data Privacy

- All data is stored locally on your device
- Nothing is sent to any server
- No tracking or analytics
- You own your data completely
- Regular exports recommended for backup

---

Built for PCL reconstruction rehabilitation recovery.
