/**
 * streak.js — Streak calculation, badge logic, loss-aversion warnings, and UI rendering
 *
 * Phase 1 of the gamification system. Streak state is stored in state.js (streakData)
 * and persisted to localStorage under the key `streakData`.
 * Streak is recalculated from workoutData on every init (self-healing).
 */

import { workoutData, streakData, setStreakData } from './state.js';
import { safeSetItem, normalizeDate } from './utils.js';

// ========== Badge Definitions ==========

const BADGES = [
    { id: 'first_workout', name: 'First Step', icon: '👟', condition: 'first' },
    { id: 'three_day', name: 'Momentum', icon: '⚡', streakRequired: 3 },
    { id: 'week_warrior', name: 'Week Warrior', icon: '🏅', streakRequired: 7 },
    { id: 'two_week', name: 'Two Week Champion', icon: '🏆', streakRequired: 14 },
    { id: 'monthly_master', name: 'Monthly Master', icon: '👑', streakRequired: 30 },
    { id: 'comeback_kid', name: 'Comeback Kid', icon: '💪', condition: 'comeback' },
    { id: 'pain_free_week', name: 'Pain-Free Week', icon: '🌟', condition: 'painFree' },
];

// ========== Date Helpers ==========

/**
 * Format a Date object as YYYY-MM-DD using local timezone.
 * Unlike toISOString().split('T')[0] which returns the UTC date,
 * this always returns the local calendar date.
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
function toLocalDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Get YYYY-MM-DD string for today in local timezone */
function todayStr() {
    return toLocalDateStr(new Date());
}

/** Get the ISO week start (Monday) for a given date string */
function weekStartOf(dateStr) {
    const d = normalizeDate(dateStr);
    const dow = (d.getDay() + 6) % 7; // 0=Mon
    d.setDate(d.getDate() - dow);
    return toLocalDateStr(d);
}

/** Subtract N days from a YYYY-MM-DD string, return new YYYY-MM-DD */
function subtractDays(dateStr, n) {
    const d = normalizeDate(dateStr);
    d.setDate(d.getDate() - n);
    return toLocalDateStr(d);
}

/** Add N days to a YYYY-MM-DD string, return new YYYY-MM-DD */
function addDays(dateStr, n) {
    const d = normalizeDate(dateStr);
    d.setDate(d.getDate() + n);
    return toLocalDateStr(d);
}

// ========== Streak Calculation (Rest-Day-Aware) ==========

/**
 * Build a Set of all workout dates (YYYY-MM-DD strings) from workoutData.
 */
function getWorkoutDateSet() {
    const dates = new Set();
    workoutData.forEach((w) => {
        if (w.date) dates.add(w.date);
    });
    return dates;
}

/**
 * Get the average pain for a specific workout date.
 * Returns 0 if no pain data found.
 */
function getAvgPainForDate(dateStr) {
    const workout = workoutData.find((w) => w.date === dateStr);
    if (!workout || !workout.exercises || workout.exercises.length === 0) return 0;
    const total = workout.exercises.reduce((sum, ex) => sum + (ex.pain || 0), 0);
    return total / workout.exercises.length;
}

/**
 * Count rest days in the same Mon-Sun week as the given date,
 * considering only days up to and including that date.
 */
function countRestDaysInWeek(dateStr, workoutDates) {
    const ws = weekStartOf(dateStr);
    let restCount = 0;
    const target = normalizeDate(dateStr);

    for (let i = 0; i < 7; i++) {
        const d = addDays(ws, i);
        const dDate = normalizeDate(d);
        if (dDate > target) break;
        if (!workoutDates.has(d)) restCount++;
    }
    return restCount;
}

/**
 * Calculate the current streak, walking backwards from today.
 *
 * Rules:
 * - A workout day extends the streak.
 * - A rest day (no workout) is allowed if:
 *   - Max 2 rest days in the current Mon-Sun week.
 *   - Rest days must NOT be consecutive (e.g. Tue+Wed off = streak broken).
 *   - Exception: if the most recent saved workout had average pain >= 6,
 *     allow consecutive rest (injury grace).
 * - If a gap violates those rules, the streak ends.
 *
 * @returns {{ current: number, longest: number, lastWorkoutDate: string|null, lastWorkoutAvgPain: number, previousStreak: number }}
 */
function calculateStreakFromData() {
    const workoutDates = getWorkoutDateSet();
    if (workoutDates.size === 0) {
        return {
            current: 0,
            longest: 0,
            lastWorkoutDate: null,
            lastWorkoutAvgPain: 0,
            previousStreak: 0,
        };
    }

    // Sort all dates descending
    const sortedDates = [...workoutDates].sort().reverse();
    const mostRecentDate = sortedDates[0];
    const mostRecentPain = getAvgPainForDate(mostRecentDate);

    const today = todayStr();
    const todayDate = normalizeDate(today);
    const lastWorkoutDate = normalizeDate(mostRecentDate);

    // If last workout was more than 2 days ago (and no injury grace), streak is 0
    const daysSinceLast = Math.round(
        (todayDate - lastWorkoutDate) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLast > 2 && mostRecentPain < 6) {
        return {
            current: 0,
            longest: calculateLongestStreak(workoutDates),
            lastWorkoutDate: mostRecentDate,
            lastWorkoutAvgPain: mostRecentPain,
            previousStreak: 0,
        };
    }

    // Walk backwards from today
    let streak = 0;
    let lastDayWasRest = false;
    let lastKnownPain = mostRecentPain;
    let injuryGrace = mostRecentPain >= 6;

    for (let i = 0; i <= 365; i++) {
        const checkDate = subtractDays(today, i);
        const isWorkout = workoutDates.has(checkDate);

        if (isWorkout) {
            streak++;
            lastDayWasRest = false;
            lastKnownPain = getAvgPainForDate(checkDate);
            injuryGrace = lastKnownPain >= 6;
        } else {
            // Consecutive rest rule (unless injury grace)
            if (lastDayWasRest && !injuryGrace) {
                break;
            }

            // Max 2 rest days per week rule
            const weekRest = countRestDaysInWeek(checkDate, workoutDates);
            if (weekRest > 2 && !injuryGrace) {
                break;
            }

            // No workout found yet after walking >2 days
            if (streak === 0 && i > 2 && !injuryGrace) {
                break;
            }

            lastDayWasRest = true;
        }
    }

    const longest = calculateLongestStreak(workoutDates);

    return {
        current: streak,
        longest: Math.max(longest, streak),
        lastWorkoutDate: mostRecentDate,
        lastWorkoutAvgPain: mostRecentPain,
        previousStreak: streakData.current || 0,
    };
}

/**
 * Calculate the longest streak ever from all workout data.
 * Uses the same rest-day-aware rules.
 */
function calculateLongestStreak(workoutDates) {
    if (workoutDates.size === 0) return 0;

    const sortedDates = [...workoutDates].sort();
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    const firstD = normalizeDate(firstDate);
    const lastD = normalizeDate(lastDate);
    const totalDays =
        Math.round((lastD - firstD) / (1000 * 60 * 60 * 24)) + 1;

    let longestStreak = 0;
    let currentRun = 0;
    let lastDayWasRest = false;
    let lastKnownPain = 0;

    for (let i = 0; i < totalDays; i++) {
        const checkDate = addDays(firstDate, i);
        const isWorkout = workoutDates.has(checkDate);

        if (isWorkout) {
            currentRun++;
            lastDayWasRest = false;
            lastKnownPain = getAvgPainForDate(checkDate);
        } else {
            const injuryGrace = lastKnownPain >= 6;

            if (lastDayWasRest && !injuryGrace) {
                longestStreak = Math.max(longestStreak, currentRun);
                currentRun = 0;
                lastDayWasRest = false;
                continue;
            }

            const weekRest = countRestDaysInWeek(checkDate, workoutDates);
            if (weekRest > 2 && !injuryGrace) {
                longestStreak = Math.max(longestStreak, currentRun);
                currentRun = 0;
                lastDayWasRest = false;
                continue;
            }

            lastDayWasRest = true;
        }
    }

    return Math.max(longestStreak, currentRun);
}

// ========== Badge Checking ==========

/**
 * Check and award badges based on current streak data.
 * @param {Object} data - Current streak data (mutated in-place)
 * @param {number} previousStreak - The streak value before this update
 * @returns {string[]} Array of newly earned badge IDs
 */
function checkBadges(data, previousStreak) {
    const newBadges = [];
    const achievements = data.achievements || [];
    const achievementDates = data.achievementDates || {};

    // First Workout
    if (!achievements.includes('first_workout') && workoutData.length >= 1) {
        achievements.push('first_workout');
        achievementDates['first_workout'] = todayStr();
        newBadges.push('first_workout');
    }

    // Streak-based badges
    BADGES.filter((b) => b.streakRequired).forEach((badge) => {
        if (!achievements.includes(badge.id) && data.current >= badge.streakRequired) {
            achievements.push(badge.id);
            achievementDates[badge.id] = todayStr();
            newBadges.push(badge.id);
        }
    });

    // Comeback Kid: restarted after 7+ day break
    if (
        !achievements.includes('comeback_kid') &&
        previousStreak === 0 &&
        data.current >= 1
    ) {
        const workoutDates = getWorkoutDateSet();
        const sortedDates = [...workoutDates].sort().reverse();
        if (sortedDates.length >= 2) {
            const latest = normalizeDate(sortedDates[0]);
            const secondLatest = normalizeDate(sortedDates[1]);
            const gap = Math.round(
                (latest - secondLatest) / (1000 * 60 * 60 * 24)
            );
            if (gap >= 7) {
                achievements.push('comeback_kid');
                achievementDates['comeback_kid'] = todayStr();
                newBadges.push('comeback_kid');
            }
        }
    }

    // Pain-Free Week: 7 consecutive days with avg pain <= 2
    if (
        !achievements.includes('pain_free_week') &&
        workoutData.length >= 7
    ) {
        const recentWorkouts = [...workoutData]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 7);
        if (recentWorkouts.length >= 7) {
            const allLowPain = recentWorkouts.every((w) => {
                if (!w.exercises || w.exercises.length === 0) return false;
                const avgPain =
                    w.exercises.reduce((s, e) => s + (e.pain || 0), 0) /
                    w.exercises.length;
                return avgPain <= 2;
            });
            if (allLowPain) {
                achievements.push('pain_free_week');
                achievementDates['pain_free_week'] = todayStr();
                newBadges.push('pain_free_week');
            }
        }
    }

    data.achievements = achievements;
    data.achievementDates = achievementDates;
    return newBadges;
}

// ========== Loss-Aversion Warnings ==========

/**
 * Get a streak warning message if applicable.
 * @returns {{ message: string, urgency: 'alert'|'recovery' }|null}
 */
function getStreakWarning() {
    if (streakData.current <= 0) return null;

    const now = new Date();
    const hour = now.getHours();
    const today = todayStr();
    const workoutDates = getWorkoutDateSet();
    const workedOutToday = workoutDates.has(today);

    // If last workout had high pain, show recovery message (no pressure)
    if (streakData.lastWorkoutAvgPain >= 6) {
        return {
            message: 'Recovery day — your streak is safe. Listen to your body.',
            urgency: 'recovery',
        };
    }

    // If already worked out today, no warning needed
    if (workedOutToday) return null;

    // Check if tomorrow would be a 2nd consecutive rest day
    const yesterday = subtractDays(today, 1);
    if (!workoutDates.has(yesterday)) {
        return {
            message:
                'Last rest day this week — work out tomorrow to keep your streak!',
            urgency: 'alert',
        };
    }

    // After 6pm warning
    if (hour >= 18) {
        const hoursLeft = 24 - hour;
        return {
            message: `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left to keep your ${streakData.current}-day streak alive!`,
            urgency: 'alert',
        };
    }

    return null;
}

// ========== Streak UI Rendering ==========

/**
 * Get the flame CSS class for the streak tier.
 * @param {number} streak
 * @param {boolean} isRecovery
 * @returns {string} CSS class name
 */
function getFlameClass(streak, isRecovery) {
    if (isRecovery) return 'streak-flame--recovery';
    if (streak >= 30) return 'streak-flame--epic';
    if (streak >= 14) return 'streak-flame--large';
    if (streak >= 7) return 'streak-flame--medium';
    if (streak >= 1) return 'streak-flame--small';
    return 'streak-flame--none';
}

/**
 * Build the inner HTML for the CSS flame (ember particles).
 * The actual flame shape is rendered via ::before and ::after pseudo-elements.
 * @returns {string} HTML for ember spans
 */
function getFlameInnerHTML() {
    return '<span class="ember"></span><span class="ember"></span><span class="ember"></span><span class="ember"></span>';
}

/**
 * Get the next badge the user is working toward.
 * @returns {{ badge: Object, daysAway: number }|null}
 */
function getNextBadge() {
    const streakBadges = BADGES.filter((b) => b.streakRequired).sort(
        (a, b) => a.streakRequired - b.streakRequired
    );
    for (const badge of streakBadges) {
        if (!streakData.achievements.includes(badge.id)) {
            return {
                badge,
                daysAway: badge.streakRequired - streakData.current,
            };
        }
    }
    return null;
}

/**
 * Render the streak card on the home screen.
 * Populates #streakCard.
 */
function renderStreakCard() {
    const card = document.getElementById('streakCard');
    if (!card) return;

    const current = streakData.current;
    const best = streakData.longest;
    const isRecovery = streakData.lastWorkoutAvgPain >= 6;
    const flameClass = getFlameClass(current, isRecovery);
    const flameInner = getFlameInnerHTML();
    const nextBadge = getNextBadge();
    const earnedBadges = BADGES.filter((b) =>
        streakData.achievements.includes(b.id)
    );

    // Progress bar to next badge
    let progressHTML = '';
    if (nextBadge && nextBadge.daysAway > 0) {
        const total = nextBadge.badge.streakRequired;
        const progress = Math.min((current / total) * 100, 100);
        progressHTML = `
            <div class="streak-progress">
                <div class="streak-progress-bar">
                    <div class="streak-progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="streak-progress-label">Next: ${nextBadge.badge.name} in ${nextBadge.daysAway}d</span>
            </div>
        `;
    } else if (!nextBadge && earnedBadges.length > 0) {
        progressHTML = `
            <div class="streak-progress">
                <div class="streak-progress-bar">
                    <div class="streak-progress-fill" style="width: 100%"></div>
                </div>
                <span class="streak-progress-label">All streak badges earned!</span>
            </div>
        `;
    }

    // This-week calendar row
    const weekHTML = renderWeekRow();

    // Badge showcase (last 3 earned)
    const recentBadges = earnedBadges.slice(-3);
    const extraCount = earnedBadges.length - 3;
    let badgesHTML = '';
    if (recentBadges.length > 0) {
        badgesHTML = `
            <div class="streak-badges">
                ${recentBadges.map((b) => `<span class="badge-pill">${b.icon} ${b.name}</span>`).join('')}
                ${extraCount > 0 ? `<span class="badge-pill badge-pill--more">+${extraCount} more</span>` : ''}
            </div>
        `;
    }

    card.innerHTML = `
        <div class="streak-header">
            <div class="streak-flame-wrap">
                <span class="streak-flame ${flameClass}">${flameInner}</span>
                <span class="streak-count">${current}-Day Streak</span>
            </div>
            <div class="streak-best">Best: ${best} day${best !== 1 ? 's' : ''}</div>
        </div>
        ${progressHTML}
        ${weekHTML}
        ${badgesHTML}
    `;
}

/**
 * Render the Mon-Sun week row showing workout/rest/missed/future status.
 * @returns {string} HTML string
 */
function renderWeekRow() {
    const today = todayStr();
    const todayDate = normalizeDate(today);
    const workoutDates = getWorkoutDateSet();

    // Find Monday of this week
    const dayIdx = (todayDate.getDay() + 6) % 7; // 0=Mon
    const monday = subtractDays(today, dayIdx);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let cells = '';

    for (let i = 0; i < 7; i++) {
        const d = addDays(monday, i);
        const dDate = normalizeDate(d);
        const isToday = d === today;
        let statusClass, icon;

        if (dDate > todayDate) {
            statusClass = 'week-day--future';
            icon = '—';
        } else if (workoutDates.has(d)) {
            statusClass = 'week-day--done';
            icon = '✅';
        } else if (isToday) {
            statusClass = 'week-day--today';
            icon = '·';
        } else {
            statusClass = 'week-day--rest';
            icon = '😴';
        }

        const currentClass = isToday ? ' week-day--current' : '';

        cells += `
            <div class="week-day ${statusClass}${currentClass}">
                <span class="week-day-label">${dayNames[i]}</span>
                <span class="week-day-icon">${icon}</span>
            </div>
        `;
    }

    return `<div class="streak-week-row">${cells}</div>`;
}

/**
 * Render the warning banner above the streak card.
 */
function renderWarningBanner() {
    const banner = document.getElementById('streakWarning');
    if (!banner) return;

    const warning = getStreakWarning();
    if (!warning) {
        banner.style.display = 'none';
        banner.innerHTML = '';
        return;
    }

    const colorClass =
        warning.urgency === 'recovery'
            ? 'streak-warning--recovery'
            : 'streak-warning--alert';

    banner.style.display = 'flex';
    banner.className = `streak-warning ${colorClass}`;
    banner.innerHTML = `
        <span class="streak-warning-text">${warning.message}</span>
        <button class="streak-warning-dismiss" aria-label="Dismiss">&times;</button>
    `;

    const dismissBtn = banner.querySelector('.streak-warning-dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            banner.style.display = 'none';
        });
    }
}

// ========== Badge Unlock Toast ==========

/**
 * Show a badge unlock animation/toast.
 * @param {string} badgeId - The badge that was earned
 */
function showBadgeUnlockToast(badgeId) {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return;

    // Remove any existing badge toast
    const existing = document.querySelector('.badge-unlock-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'badge-unlock-toast';
    toast.innerHTML = `
        <span class="badge-unlock-icon">${badge.icon}</span>
        <div>
            <div class="badge-unlock-title">Achievement Unlocked!</div>
            <div class="badge-unlock-name">${badge.name}</div>
        </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ========== Persist Helper ==========

/** Save current streakData to localStorage */
function persistStreak() {
    safeSetItem('streakData', streakData);
}

// ========== Public API ==========

/**
 * Initialize streak system. Call on app load.
 * Recalculates streak from workoutData (self-healing).
 */
function initStreak() {
    const result = calculateStreakFromData();

    const updated = {
        ...streakData,
        current: result.current,
        longest: Math.max(result.longest, streakData.longest || 0),
        lastWorkoutDate: result.lastWorkoutDate,
        lastWorkoutAvgPain: result.lastWorkoutAvgPain,
    };

    // Check badges without showing toasts (init-time)
    checkBadges(updated, result.previousStreak);

    setStreakData(updated);
    persistStreak();
    renderStreakCard();
    renderWarningBanner();
}

/**
 * Called after a workout is saved. Updates streak, checks badges,
 * shows badge unlock toasts if new badges earned.
 */
function onWorkoutSaved() {
    const previousStreak = streakData.current;
    const result = calculateStreakFromData();

    const updated = {
        ...streakData,
        current: result.current,
        longest: Math.max(result.longest, streakData.longest || 0),
        lastWorkoutDate: result.lastWorkoutDate,
        lastWorkoutAvgPain: result.lastWorkoutAvgPain,
    };

    const newBadges = checkBadges(updated, previousStreak);

    setStreakData(updated);
    persistStreak();
    renderStreakCard();
    renderWarningBanner();

    // Show badge unlock toasts with staggered timing
    newBadges.forEach((badgeId, index) => {
        setTimeout(() => showBadgeUnlockToast(badgeId), 500 + index * 3500);
    });
}

/**
 * Check if a streak reminder should be shown (called on DOMContentLoaded).
 */
function checkStreakReminder() {
    renderWarningBanner();
}

/**
 * Get the current streak count (for updateStats in utils.js).
 * @returns {number}
 */
function getCurrentStreak() {
    return streakData.current;
}

export {
    initStreak,
    onWorkoutSaved,
    checkStreakReminder,
    getCurrentStreak,
    renderStreakCard,
    renderWarningBanner,
    getStreakWarning,
    BADGES,
};
