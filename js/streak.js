/**
 * streak.js — Streak calculation, badge logic, loss-aversion warnings, and UI rendering
 *
 * Phase 1 of the gamification system. Streak state is stored in state.js (streakData)
 * and persisted to localStorage under the key `streakData`.
 * Streak is recalculated from workoutData on every init (self-healing).
 */

import { workoutData, streakData, setStreakData } from './state.js';
import { safeSetItem, normalizeDate } from './utils.js';
import { getCategoryByExerciseId } from '../exercises.js';
import CONFIG from './config.js';

// ========== Badge Definitions ==========

/** Category metadata for muscle-group badges */
const CATEGORY_META = {
    'Foot & Ankle': { label: 'Calves & Ankles', icon: '🦵' },
    'Hip & Glute': { label: 'Glutes', icon: '🍑' },
    Core: { label: 'Core', icon: '💪' },
    Balance: { label: 'Balance', icon: '⚖️' },
    Mobility: { label: 'Mobility', icon: '🧘' },
};

/** Tier icons for muscle badges: 10=Bronze, 50=Silver, 100=Gold */
const TIER_ICONS = { 10: '🥉', 50: '🥈', 100: '🥇' };

/** Section groupings for badge sheet */
const BADGE_SECTIONS = {
    consistency: { title: '📅 Consistency', order: 1 },
    volume: { title: '📊 Volume', order: 2 },
    muscle: { title: '💪 Muscle Mastery', order: 3 },
};

const BADGES = [
    // Consistency (streak + special)
    {
        id: 'first_workout',
        name: 'First Step',
        icon: '👟',
        condition: 'first',
        section: 'consistency',
    },
    { id: 'three_day', name: 'Momentum', icon: '⚡', streakRequired: 3, section: 'consistency' },
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        icon: '🏅',
        streakRequired: 7,
        section: 'consistency',
    },
    {
        id: 'two_week',
        name: 'Two Week Champion',
        icon: '🏆',
        streakRequired: 14,
        section: 'consistency',
    },
    {
        id: 'monthly_master',
        name: 'Monthly Master',
        icon: '👑',
        streakRequired: 30,
        section: 'consistency',
    },
    {
        id: 'comeback_kid',
        name: 'Comeback Kid',
        icon: '💪',
        condition: 'comeback',
        section: 'consistency',
    },
    {
        id: 'pain_free_week',
        name: 'Pain-Free Week',
        icon: '🌟',
        condition: 'painFree',
        section: 'consistency',
    },
    // Volume (total exercise count)
    { id: 'total_10', name: 'First 10', icon: '📋', totalRequired: 10, section: 'volume' },
    { id: 'total_50', name: 'Fifty Reps', icon: '📈', totalRequired: 50, section: 'volume' },
    { id: 'total_100', name: 'Century', icon: '💯', totalRequired: 100, section: 'volume' },
    { id: 'total_200', name: 'Double Century', icon: '🏆', totalRequired: 200, section: 'volume' },
    { id: 'total_300', name: 'Legend', icon: '👑', totalRequired: 300, section: 'volume' },
    // Muscle: Calves & Ankles (10/50/100 only)
    {
        id: 'calves_10',
        name: 'Calf Starter',
        icon: '🦵',
        category: 'Foot & Ankle',
        categoryRequired: 10,
        section: 'muscle',
    },
    {
        id: 'calves_50',
        name: 'Foot Strong',
        icon: '🦵',
        category: 'Foot & Ankle',
        categoryRequired: 50,
        section: 'muscle',
    },
    {
        id: 'calves_100',
        name: 'Calf Master',
        icon: '🦵',
        category: 'Foot & Ankle',
        categoryRequired: 100,
        section: 'muscle',
    },
    // Glutes
    {
        id: 'glutes_10',
        name: 'Glute Starter',
        icon: '🍑',
        category: 'Hip & Glute',
        categoryRequired: 10,
        section: 'muscle',
    },
    {
        id: 'glutes_50',
        name: 'Glute Strong',
        icon: '🍑',
        category: 'Hip & Glute',
        categoryRequired: 50,
        section: 'muscle',
    },
    {
        id: 'glutes_100',
        name: 'Glute Master',
        icon: '🍑',
        category: 'Hip & Glute',
        categoryRequired: 100,
        section: 'muscle',
    },
    // Core
    {
        id: 'core_10',
        name: 'Core Starter',
        icon: '💪',
        category: 'Core',
        categoryRequired: 10,
        section: 'muscle',
    },
    {
        id: 'core_50',
        name: 'Core Strong',
        icon: '💪',
        category: 'Core',
        categoryRequired: 50,
        section: 'muscle',
    },
    {
        id: 'core_100',
        name: 'Core Master',
        icon: '💪',
        category: 'Core',
        categoryRequired: 100,
        section: 'muscle',
    },
    // Balance
    {
        id: 'balance_10',
        name: 'Balance Starter',
        icon: '⚖️',
        category: 'Balance',
        categoryRequired: 10,
        section: 'muscle',
    },
    {
        id: 'balance_50',
        name: 'Balance Strong',
        icon: '⚖️',
        category: 'Balance',
        categoryRequired: 50,
        section: 'muscle',
    },
    {
        id: 'balance_100',
        name: 'Balance Master',
        icon: '⚖️',
        category: 'Balance',
        categoryRequired: 100,
        section: 'muscle',
    },
    // Mobility
    {
        id: 'mobility_10',
        name: 'Mobility Starter',
        icon: '🧘',
        category: 'Mobility',
        categoryRequired: 10,
        section: 'muscle',
    },
    {
        id: 'mobility_50',
        name: 'Mobility Strong',
        icon: '🧘',
        category: 'Mobility',
        categoryRequired: 50,
        section: 'muscle',
    },
    {
        id: 'mobility_100',
        name: 'Mobility Master',
        icon: '🧘',
        category: 'Mobility',
        categoryRequired: 100,
        section: 'muscle',
    },
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
    const daysSinceLast = Math.round((todayDate - lastWorkoutDate) / (1000 * 60 * 60 * 24));
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

    const suggestedRestDays = CONFIG.REST_DAYS.SUGGESTED; // [0, 3] = Sun, Wed

    for (let i = 0; i <= 365; i++) {
        const checkDate = subtractDays(today, i);
        const isWorkout = workoutDates.has(checkDate);
        const checkDateObj = normalizeDate(checkDate);
        const isSuggestedRest = suggestedRestDays.includes(checkDateObj.getDay());

        if (isWorkout) {
            streak++;
            lastDayWasRest = false;
            lastKnownPain = getAvgPainForDate(checkDate);
            injuryGrace = lastKnownPain >= 6;
        } else {
            // Suggested rest days (Wed/Sun) are always allowed - don't break streak
            if (isSuggestedRest) {
                lastDayWasRest = true;
                continue;
            }

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
    const totalDays = Math.round((lastD - firstD) / (1000 * 60 * 60 * 24)) + 1;

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

// ========== Exercise Count Helpers ==========

/**
 * Get total number of exercise completions across all workouts.
 * Each logged exercise in a saved workout counts as 1.
 */
function getTotalExerciseCount() {
    return workoutData.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
}

/**
 * Get exercise count for a specific category (e.g. 'Foot & Ankle', 'Hip & Glute').
 */
function getCategoryExerciseCount(category) {
    let count = 0;
    workoutData.forEach((w) => {
        (w.exercises || []).forEach((ex) => {
            const cat = getCategoryByExerciseId(ex.id);
            if (cat === category) count++;
        });
    });
    return count;
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
    if (!achievements.includes('comeback_kid') && previousStreak === 0 && data.current >= 1) {
        const workoutDates = getWorkoutDateSet();
        const sortedDates = [...workoutDates].sort().reverse();
        if (sortedDates.length >= 2) {
            const latest = normalizeDate(sortedDates[0]);
            const secondLatest = normalizeDate(sortedDates[1]);
            const gap = Math.round((latest - secondLatest) / (1000 * 60 * 60 * 24));
            if (gap >= 7) {
                achievements.push('comeback_kid');
                achievementDates['comeback_kid'] = todayStr();
                newBadges.push('comeback_kid');
            }
        }
    }

    // Pain-Free Week: 7 consecutive days with avg pain <= 2
    if (!achievements.includes('pain_free_week') && workoutData.length >= 7) {
        const recentWorkouts = [...workoutData]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 7);
        if (recentWorkouts.length >= 7) {
            const allLowPain = recentWorkouts.every((w) => {
                if (!w.exercises || w.exercises.length === 0) return false;
                const avgPain =
                    w.exercises.reduce((s, e) => s + (e.pain || 0), 0) / w.exercises.length;
                return avgPain <= 2;
            });
            if (allLowPain) {
                achievements.push('pain_free_week');
                achievementDates['pain_free_week'] = todayStr();
                newBadges.push('pain_free_week');
            }
        }
    }

    // Total exercise count badges
    const totalCount = getTotalExerciseCount();
    BADGES.filter((b) => b.totalRequired).forEach((badge) => {
        if (!achievements.includes(badge.id) && totalCount >= badge.totalRequired) {
            achievements.push(badge.id);
            achievementDates[badge.id] = todayStr();
            newBadges.push(badge.id);
        }
    });

    // Category (muscle group) badges
    BADGES.filter((b) => b.category && b.categoryRequired).forEach((badge) => {
        if (!achievements.includes(badge.id)) {
            const catCount = getCategoryExerciseCount(badge.category);
            if (catCount >= badge.categoryRequired) {
                achievements.push(badge.id);
                achievementDates[badge.id] = todayStr();
                newBadges.push(badge.id);
            }
        }
    });

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
            message: 'Last rest day this week — work out tomorrow to keep your streak!',
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
    const earnedBadges = BADGES.filter((b) => streakData.achievements.includes(b.id));

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

    // Badge showcase (last 3 earned) — tappable to open full badge sheet
    const recentBadges = earnedBadges.slice(-3);
    const extraCount = earnedBadges.length - 3;
    let badgesHTML = '';
    if (recentBadges.length > 0) {
        badgesHTML = `
            <div class="streak-badges streak-badges--tappable">
                ${recentBadges.map((b) => `<span class="badge-pill">${b.icon} ${b.name}</span>`).join('')}
                ${extraCount > 0 ? `<span class="badge-pill badge-pill--more">+${extraCount} more</span>` : ''}
            </div>
        `;
    } else {
        badgesHTML = `
            <div class="streak-badges streak-badges--tappable">
                <span class="badge-pill badge-pill--more">🏆 View Badges</span>
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

    // Make badge area tappable to open full badge sheet
    const badgeArea = card.querySelector('.streak-badges--tappable');
    if (badgeArea) {
        badgeArea.addEventListener('click', showBadgeSheet);
    }
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

    // JS day-of-week for each day starting from Monday
    // Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
    const jsDayOfWeek = [1, 2, 3, 4, 5, 6, 0];
    const suggestedRestDays = CONFIG.REST_DAYS.SUGGESTED; // [0, 3] = Sun, Wed

    for (let i = 0; i < 7; i++) {
        const d = addDays(monday, i);
        const dDate = normalizeDate(d);
        const isToday = d === today;
        const isSuggestedRest = suggestedRestDays.includes(jsDayOfWeek[i]);
        let statusClass, icon;

        if (dDate > todayDate) {
            statusClass = 'week-day--future';
            icon = isSuggestedRest ? 'R' : '—';
        } else if (workoutDates.has(d)) {
            statusClass = 'week-day--done';
            icon = '✅';
        } else if (isToday) {
            statusClass = isSuggestedRest ? 'week-day--suggested-rest' : 'week-day--today';
            icon = isSuggestedRest ? 'R' : '·';
        } else {
            statusClass = isSuggestedRest ? 'week-day--suggested-rest' : 'week-day--rest';
            icon = isSuggestedRest ? 'R' : '😴';
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

// ========== Badge Detail Bottom Sheet ==========

/**
 * Get the display icon for a badge (tier progression for muscle badges).
 */
function getBadgeDisplayIcon(badge) {
    if (badge.category && badge.categoryRequired && TIER_ICONS[badge.categoryRequired]) {
        const tier = TIER_ICONS[badge.categoryRequired];
        const meta = CATEGORY_META[badge.category];
        return meta ? `${meta.icon}${tier}` : tier;
    }
    return badge.icon;
}

/**
 * Get the next locked badge per "bucket" (section + category for muscle).
 * Used to show only upcoming badges by default.
 */
function getNextLockedPerBucket(unearnedBadges) {
    const buckets = new Map(); // key → badge
    unearnedBadges.forEach((b) => {
        let key;
        if (b.section === 'consistency') key = 'consistency';
        else if (b.section === 'volume') key = 'volume';
        else if (b.category) key = `muscle:${b.category}`;
        else return;
        const existing = buckets.get(key);
        if (!existing || getBadgeSortOrder(b) < getBadgeSortOrder(existing)) {
            buckets.set(key, b);
        }
    });
    return Array.from(buckets.values());
}

/** Sort order for "next" badge (lower = sooner to earn) */
function getBadgeSortOrder(badge) {
    if (badge.streakRequired) return badge.streakRequired - streakData.current;
    if (badge.totalRequired) return badge.totalRequired - getTotalExerciseCount();
    if (badge.categoryRequired)
        return badge.categoryRequired - getCategoryExerciseCount(badge.category);
    return 999;
}

/**
 * Get a human-readable description of how to earn a badge.
 * @param {Object} badge - Badge definition
 * @returns {string} Description text
 */
function getBadgeRequirement(badge) {
    if (badge.streakRequired) {
        return `Maintain a ${badge.streakRequired}-day streak`;
    }
    if (badge.totalRequired) {
        return `${badge.totalRequired} total exercises completed`;
    }
    if (badge.category && badge.categoryRequired) {
        const meta = CATEGORY_META[badge.category];
        const label = meta ? meta.label : badge.category;
        return `${badge.categoryRequired} ${label} exercises`;
    }
    switch (badge.condition) {
        case 'first':
            return 'Complete your first workout';
        case 'comeback':
            return 'Return after a 7+ day break';
        case 'painFree':
            return '7 consecutive workouts with avg pain \u2264 2';
        default:
            return '';
    }
}

/**
 * Get progress info for an unearned badge.
 * @param {Object} badge - Badge definition
 * @returns {string} Progress text (e.g. "3 days away")
 */
function getBadgeProgress(badge) {
    if (badge.streakRequired) {
        const daysAway = badge.streakRequired - streakData.current;
        if (daysAway <= 0) return 'Ready to earn!';
        return `${daysAway} day${daysAway !== 1 ? 's' : ''} away`;
    }
    if (badge.totalRequired) {
        const count = getTotalExerciseCount();
        const away = badge.totalRequired - count;
        if (away <= 0) return 'Ready to earn!';
        return `${away} more exercises`;
    }
    if (badge.category && badge.categoryRequired) {
        const count = getCategoryExerciseCount(badge.category);
        const away = badge.categoryRequired - count;
        if (away <= 0) return 'Ready to earn!';
        return `${away} more`;
    }
    switch (badge.condition) {
        case 'first':
            return workoutData.length >= 1 ? 'Ready to earn!' : 'Save your first workout';
        case 'comeback':
            return 'Earned automatically on return';
        case 'painFree':
            return 'Keep pain levels low';
        default:
            return '';
    }
}

/** Render a single badge card (earned or locked) */
function renderBadgeCard(badge, earned) {
    const icon = getBadgeDisplayIcon(badge);
    if (earned) {
        const date = (streakData.achievementDates || {})[badge.id];
        const dateStr = date
            ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '';
        return `
        <div class="badge-card badge-card--earned">
            <div class="badge-card-icon">${icon}</div>
            <div class="badge-card-name">${badge.name}</div>
            <div class="badge-card-desc">${getBadgeRequirement(badge)}</div>
            <div class="badge-card-status">
                <span class="badge-card-check">\u2713</span>
                <span class="badge-card-date">${dateStr}</span>
            </div>
        </div>`;
    }
    const progress = getBadgeProgress(badge);
    let pct = 0;
    if (badge.streakRequired)
        pct = Math.min((streakData.current / badge.streakRequired) * 100, 100);
    else if (badge.totalRequired)
        pct = Math.min((getTotalExerciseCount() / badge.totalRequired) * 100, 100);
    else if (badge.category && badge.categoryRequired)
        pct = Math.min(
            (getCategoryExerciseCount(badge.category) / badge.categoryRequired) * 100,
            100
        );
    const progressBarHTML =
        badge.streakRequired || badge.totalRequired || (badge.category && badge.categoryRequired)
            ? `
        <div class="badge-card-progress-bar">
            <div class="badge-card-progress-fill" style="width: ${pct}%"></div>
        </div>`
            : '';
    return `
        <div class="badge-card badge-card--locked">
            <div class="badge-card-icon badge-card-icon--locked">${icon}</div>
            <div class="badge-card-name">${badge.name}</div>
            <div class="badge-card-desc">${getBadgeRequirement(badge)}</div>
            ${progressBarHTML}
            <div class="badge-card-eta">${progress}</div>
        </div>`;
}

/**
 * Show a bottom sheet with all badges — earned and unearned, grouped by section.
 */
function showBadgeSheet() {
    const existing = document.querySelector('.bottom-sheet-overlay');
    if (existing) existing.remove();

    const earned = streakData.achievements || [];
    const earnedBadges = BADGES.filter((b) => earned.includes(b.id));
    const unearnedBadges = BADGES.filter((b) => !earned.includes(b.id));
    const nextLockedOnly = getNextLockedPerBucket(unearnedBadges);
    const hasMoreLocked = unearnedBadges.length > nextLockedOnly.length;

    // Group by section: each shows earned + (next-only or all locked based on toggle)
    const sections = ['consistency', 'volume', 'muscle'];
    const sectionHTML = sections
        .map((sectionKey) => {
            const config = BADGE_SECTIONS[sectionKey];
            if (!config) return '';
            const earnedInSection = earnedBadges.filter((b) => b.section === sectionKey);
            const unearnedInSection = unearnedBadges.filter((b) => b.section === sectionKey);
            const nextInSection = nextLockedOnly.filter((b) => b.section === sectionKey);

            const earnedCards = earnedInSection.map((b) => renderBadgeCard(b, true)).join('');
            const nextLockedCards = nextInSection.map((b) => renderBadgeCard(b, false)).join('');
            const allLockedCards = unearnedInSection.map((b) => renderBadgeCard(b, false)).join('');
            const totalInSection = earnedInSection.length + unearnedInSection.length;
            const earnedCount = earnedInSection.length;
            const hasMoreInSection = unearnedInSection.length > nextInSection.length;

            if (earnedInSection.length === 0 && unearnedInSection.length === 0) return '';

            return `
            <div class="badge-sheet-section" data-section="${sectionKey}">
                <h4 class="badge-sheet-section-title">
                    ${config.title}
                    <span class="badge-sheet-count">${earnedCount}/${totalInSection}</span>
                </h4>
                <div class="badge-card-grid badge-card-grid--next">
                    ${earnedCards}
                    ${nextLockedCards}
                </div>
                ${
                    hasMoreInSection
                        ? `
                <div class="badge-card-grid badge-card-grid--all" style="display: none;">
                    ${earnedCards}
                    ${allLockedCards}
                </div>`
                        : ''
                }
            </div>`;
        })
        .filter(Boolean)
        .join('');

    const overlay = document.createElement('div');
    overlay.className = 'bottom-sheet-overlay';

    overlay.innerHTML = `
        <div class="bottom-sheet">
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-header">
                <h3>\uD83C\uDFC6 Achievements</h3>
                <p class="badge-sheet-subtitle">${earnedBadges.length}/${BADGES.length} earned</p>
            </div>
            <div class="bottom-sheet-body">
                ${sectionHTML}
                ${
                    hasMoreLocked
                        ? `
                <button type="button" class="badge-sheet-toggle" id="badgeSheetToggle">
                    Show all ${unearnedBadges.length} locked badges
                </button>`
                        : ''
                }
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) dismissBadgeSheet(overlay);
    });

    const handle = overlay.querySelector('.bottom-sheet-handle');
    if (handle) {
        handle.addEventListener('click', () => dismissBadgeSheet(overlay));
    }

    const toggleBtn = overlay.querySelector('#badgeSheetToggle');
    if (toggleBtn) {
        let isExpanded = false;
        toggleBtn.addEventListener('click', function () {
            isExpanded = !isExpanded;
            overlay.querySelectorAll('.badge-sheet-section').forEach((section) => {
                const next = section.querySelector('.badge-card-grid--next');
                const all = section.querySelector('.badge-card-grid--all');
                if (next && all) {
                    next.style.display = isExpanded ? 'none' : '';
                    all.style.display = isExpanded ? '' : 'none';
                }
            });
            toggleBtn.textContent = isExpanded
                ? 'Show next badges only'
                : `Show all ${unearnedBadges.length} locked badges`;
        });
    }
}

/**
 * Dismiss the badge bottom sheet with animation.
 * @param {HTMLElement} overlay
 */
function dismissBadgeSheet(overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
    }, 300);
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
        warning.urgency === 'recovery' ? 'streak-warning--recovery' : 'streak-warning--alert';

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
