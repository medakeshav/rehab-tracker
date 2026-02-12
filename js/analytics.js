/**
 * analytics.js — Analytics dashboard module
 *
 * Provides data calculation functions and Chart.js renderers for:
 *   - Pain trends & stats
 *   - Left/Right asymmetry tracking
 *   - Volume & exercise rep progression
 *   - Training balance (category distribution)
 *   - Adherence & compliance metrics
 */

import Chart from 'chart.js/auto';
import { workoutData, darkMode } from './state.js';
import { exercises, getExercisesForPhase, getCategoryByExerciseId } from '../exercises.js';

// ========== Chart Instances (for cleanup) ==========

/** @type {Object<string, Chart>} Active chart instances keyed by canvas ID */
const chartInstances = {};

// ========== Date Range Helpers ==========

/** Currently selected date range in days (30, 90, or Infinity) */
let currentRange = 30;

/**
 * Filter workoutData to the selected date range.
 * @returns {Array<Object>} Filtered workout entries
 */
function getFilteredWorkouts() {
    if (currentRange === Infinity) return [...workoutData];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - currentRange);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return workoutData.filter((w) => w.date >= cutoffStr);
}

// ========== Dark Mode Chart Theme ==========

/**
 * Return Chart.js color config based on dark mode state.
 */
function getChartTheme() {
    const isDark = darkMode || document.body.classList.contains('dark-mode');
    return {
        textColor: isDark ? '#e0e0e0' : '#333',
        gridColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        tooltipBg: isDark ? '#333' : '#fff',
        tooltipText: isDark ? '#e0e0e0' : '#333',
        tooltipBorder: isDark ? '#555' : '#ddd',
    };
}

/**
 * Common Chart.js defaults for dark mode support.
 */
function getChartDefaults() {
    const theme = getChartTheme();
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: { color: theme.textColor, font: { size: 12 } },
            },
            tooltip: {
                backgroundColor: theme.tooltipBg,
                titleColor: theme.tooltipText,
                bodyColor: theme.tooltipText,
                borderColor: theme.tooltipBorder,
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                ticks: { color: theme.textColor, font: { size: 10 } },
                grid: { display: false },
            },
            y: {
                ticks: { color: theme.textColor, font: { size: 10 } },
                grid: { display: false },
            },
        },
    };
}

// ========== Utility: Destroy & Recreate Chart ==========

/**
 * Destroy an existing chart and create a new one.
 * @param {string} canvasId
 * @param {Object} config - Chart.js config
 * @returns {Chart|null}
 */
function renderChart(canvasId, config) {
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const chart = new Chart(canvas, config);
    chartInstances[canvasId] = chart;
    return chart;
}

// ========================================================================
//  PAIN ANALYSIS
// ========================================================================

/**
 * Calculate daily average pain over time.
 * @returns {Array<{date: string, avgPain: number}>}
 */
function calculatePainTrend() {
    const workouts = getFilteredWorkouts();
    return workouts
        .filter((w) => w.exercises && w.exercises.length > 0)
        .map((w) => {
            const pains = w.exercises.map((e) => e.pain || 0);
            const avg = pains.reduce((s, v) => s + v, 0) / pains.length;
            return { date: w.date, avgPain: parseFloat(avg.toFixed(1)) };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Map of exercise id → average pain across all filtered workouts.
 * @returns {Array<{id: string, name: string, avgPain: number}>}
 */
function getExercisePainMap() {
    const workouts = getFilteredWorkouts();
    const painMap = {};
    const countMap = {};
    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
            if (!painMap[e.id]) {
                painMap[e.id] = 0;
                countMap[e.id] = 0;
            }
            painMap[e.id] += e.pain || 0;
            countMap[e.id]++;
        });
    });
    return Object.keys(painMap)
        .map((id) => ({
            id,
            name: painMap[id] !== undefined ? id : id,
            avgPain: parseFloat((painMap[id] / countMap[id]).toFixed(1)),
        }))
        .sort((a, b) => b.avgPain - a.avgPain);
}

/**
 * Percentage of exercises with pain ≤ 3.
 */
function getPainFreeRate() {
    const workouts = getFilteredWorkouts();
    let total = 0;
    let painFree = 0;
    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
            total++;
            if ((e.pain || 0) <= 3) painFree++;
        });
    });
    return total === 0 ? 0 : Math.round((painFree / total) * 100);
}

/**
 * Render the pain trend line chart.
 */
function renderPainTrendChart() {
    const data = calculatePainTrend();
    if (data.length === 0) return;
    const defaults = getChartDefaults();

    renderChart('painTrendChart', {
        type: 'line',
        data: {
            labels: data.map((d) => formatShortDate(d.date)),
            datasets: [
                {
                    label: 'Avg Pain',
                    data: data.map((d) => d.avgPain),
                    borderColor: '#ef5350',
                    backgroundColor: 'rgba(239,83,80,0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: data.length > 20 ? 0 : 3,
                    pointHoverRadius: 5,
                },
            ],
        },
        options: {
            ...defaults,
            scales: {
                ...defaults.scales,
                y: {
                    ...defaults.scales.y,
                    min: 0,
                    max: 10,
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Pain (0-10)',
                        color: getChartTheme().textColor,
                    },
                },
                x: {
                    ...defaults.scales.x,
                    grid: { display: false },
                },
            },
        },
    });
}

/**
 * Render pain stat cards.
 */
function renderPainStatsCards() {
    const container = document.getElementById('painStatsCards');
    if (!container) return;

    const trend = calculatePainTrend();
    const painFreeRate = getPainFreeRate();

    let currentAvg = '--';
    let weekAvg = '--';
    let trendDir = '';

    if (trend.length > 0) {
        currentAvg = trend[trend.length - 1].avgPain.toFixed(1);
    }
    if (trend.length >= 7) {
        const last7 = trend.slice(-7);
        weekAvg = (last7.reduce((s, d) => s + d.avgPain, 0) / 7).toFixed(1);
    } else if (trend.length > 0) {
        weekAvg = (trend.reduce((s, d) => s + d.avgPain, 0) / trend.length).toFixed(1);
    }

    // Trend: compare last 7 avg to prior 7 avg
    if (trend.length >= 14) {
        const recent = trend.slice(-7).reduce((s, d) => s + d.avgPain, 0) / 7;
        const prior = trend.slice(-14, -7).reduce((s, d) => s + d.avgPain, 0) / 7;
        if (recent < prior - 0.3) trendDir = '↓ Improving';
        else if (recent > prior + 0.3) trendDir = '↑ Increasing';
        else trendDir = '→ Stable';
    }

    container.innerHTML = `
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${currentAvg}</div>
            <div class="analytics-stat-label">Latest Avg</div>
        </div>
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${weekAvg}</div>
            <div class="analytics-stat-label">7-Day Avg</div>
        </div>
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${painFreeRate}%</div>
            <div class="analytics-stat-label">Pain-Free Rate</div>
        </div>
        ${
            trendDir
                ? `<div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value" style="font-size:var(--font-size-sm)">${trendDir}</div>
            <div class="analytics-stat-label">Trend</div>
        </div>`
                : ''
        }
    `;
}

// ========================================================================
//  ASYMMETRY ANALYSIS
// ========================================================================

/**
 * Calculate L/R asymmetry ratio per exercise (latest workout).
 * Ratio = rightReps / leftReps. Goal = 1.0
 * @returns {Array<{id: string, name: string, ratio: number, leftReps: number, rightReps: number}>}
 */
function calculateAsymmetryRatios() {
    const workouts = getFilteredWorkouts();
    if (workouts.length === 0) return [];

    // Use latest workout that has exercises
    const latest = [...workouts].reverse().find((w) => w.exercises && w.exercises.length > 0);
    if (!latest) return [];

    return latest.exercises
        .filter((e) => e.leftReps > 0 && e.rightReps > 0 && e.leftReps !== e.rightReps)
        .map((e) => ({
            id: e.id,
            name: e.name.replace(/^\d+[a-e]?\.\s*/, ''),
            ratio: parseFloat((e.rightReps / e.leftReps).toFixed(2)),
            leftReps: e.leftReps,
            rightReps: e.rightReps,
        }));
}

/**
 * Calculate asymmetry improvement over time.
 * @returns {{ improved: number, total: number }}
 */
function getAsymmetryImprovement() {
    const workouts = getFilteredWorkouts();
    if (workouts.length < 2) return { improved: 0, total: 0 };

    const first = workouts.find((w) => w.exercises && w.exercises.length > 0);
    const last = [...workouts].reverse().find((w) => w.exercises && w.exercises.length > 0);
    if (!first || !last || first === last) return { improved: 0, total: 0 };

    let improved = 0;
    let total = 0;

    last.exercises.forEach((le) => {
        const fe = first.exercises.find((e) => e.id === le.id);
        if (fe && fe.leftReps > 0 && fe.rightReps > 0 && le.leftReps > 0 && le.rightReps > 0) {
            const firstRatio = Math.abs(1 - fe.rightReps / fe.leftReps);
            const lastRatio = Math.abs(1 - le.rightReps / le.leftReps);
            total++;
            if (lastRatio < firstRatio) improved++;
        }
    });

    return { improved, total };
}

/**
 * Render asymmetry bar chart.
 */
function renderAsymmetryChart() {
    const data = calculateAsymmetryRatios();
    if (data.length === 0) {
        const canvas = document.getElementById('asymmetryChart');
        if (canvas)
            canvas.parentElement.innerHTML =
                '<p class="analytics-no-data">Not enough data for asymmetry analysis</p>';
        return;
    }
    const defaults = getChartDefaults();
    const theme = getChartTheme();

    renderChart('asymmetryChart', {
        type: 'bar',
        data: {
            labels: data.map((d) => d.name),
            datasets: [
                {
                    label: 'Left Reps',
                    data: data.map((d) => d.leftReps),
                    backgroundColor: 'rgba(66,133,244,0.7)',
                    borderColor: '#4285f4',
                    borderWidth: 1,
                },
                {
                    label: 'Right Reps',
                    data: data.map((d) => d.rightReps),
                    backgroundColor: 'rgba(251,188,4,0.7)',
                    borderColor: '#fbbc04',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            ...defaults,
            indexAxis: 'y',
            scales: {
                x: {
                    ...defaults.scales.x,
                    grid: { display: false },
                    title: { display: true, text: 'Reps', color: theme.textColor },
                },
                y: {
                    ...defaults.scales.y,
                    grid: { display: false },
                    ticks: { ...defaults.scales.y.ticks, font: { size: 9 } },
                },
            },
        },
    });
}

/**
 * Render asymmetry stat cards.
 */
function renderAsymmetryCards() {
    const container = document.getElementById('asymmetryCards');
    if (!container) return;

    const ratios = calculateAsymmetryRatios();
    const improvement = getAsymmetryImprovement();

    const worstAsym =
        ratios.length > 0
            ? ratios.reduce((max, r) => (Math.abs(1 - r.ratio) > Math.abs(1 - max.ratio) ? r : max))
            : null;

    const avgAsymPercent =
        ratios.length > 0
            ? Math.round(
                  (ratios.reduce((s, r) => s + Math.abs(1 - r.ratio), 0) / ratios.length) * 100
              )
            : 0;

    container.innerHTML = `
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${avgAsymPercent}%</div>
            <div class="analytics-stat-label">Avg Asymmetry</div>
        </div>
        ${
            worstAsym
                ? `<div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value" style="font-size:var(--font-size-xs)">${worstAsym.name}</div>
            <div class="analytics-stat-label">Most Imbalanced</div>
        </div>`
                : ''
        }
        ${
            improvement.total > 0
                ? `<div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${improvement.improved}/${improvement.total}</div>
            <div class="analytics-stat-label">Improved</div>
        </div>`
                : ''
        }
    `;
}

// ========================================================================
//  PROGRESSION ANALYSIS
// ========================================================================

/**
 * Get rep progression for a specific exercise over time.
 * @param {string} exerciseId
 * @returns {Array<{date: string, leftReps: number, rightReps: number}>}
 */
function getExerciseRepProgression(exerciseId) {
    const workouts = getFilteredWorkouts();
    const progression = [];
    workouts.forEach((w) => {
        const ex = (w.exercises || []).find((e) => e.id === exerciseId);
        if (ex) {
            progression.push({
                date: w.date,
                leftReps: ex.leftReps || 0,
                rightReps: ex.rightReps || 0,
            });
        }
    });
    return progression.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get total volume (reps) grouped by week.
 * @returns {Array<{week: string, volume: number}>}
 */
function getVolumeByWeek() {
    const workouts = getFilteredWorkouts();
    const weekMap = {};
    workouts.forEach((w) => {
        const weekStart = getWeekStart(w.date);
        if (!weekMap[weekStart]) weekMap[weekStart] = 0;
        (w.exercises || []).forEach((e) => {
            const sets = e.sets || 1;
            weekMap[weekStart] += ((e.leftReps || 0) + (e.rightReps || 0)) * sets;
        });
    });
    return Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, volume]) => ({ week, volume }));
}

/**
 * Render volume by week bar chart.
 */
function renderVolumeChart() {
    const data = getVolumeByWeek();
    if (data.length === 0) return;
    const defaults = getChartDefaults();
    const theme = getChartTheme();

    renderChart('volumeChart', {
        type: 'bar',
        data: {
            labels: data.map((d) => formatShortDate(d.week)),
            datasets: [
                {
                    label: 'Weekly Volume (reps)',
                    data: data.map((d) => d.volume),
                    backgroundColor: 'rgba(76,175,80,0.7)',
                    borderColor: '#4CAF50',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        },
        options: {
            ...defaults,
            scales: {
                ...defaults.scales,
                y: {
                    ...defaults.scales.y,
                    beginAtZero: true,
                    grid: { display: false },
                    title: { display: true, text: 'Total Reps', color: theme.textColor },
                },
                x: {
                    ...defaults.scales.x,
                    grid: { display: false },
                },
            },
        },
    });
}

/**
 * Populate the exercise selector dropdown.
 */
function populateExerciseSelector() {
    const select = document.getElementById('exerciseSelector');
    if (!select) return;

    // Collect all unique exercise IDs from filtered workouts
    const workouts = getFilteredWorkouts();
    const seen = new Set();
    const exerciseOptions = [];

    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
            if (!seen.has(e.id)) {
                seen.add(e.id);
                exerciseOptions.push({ id: e.id, name: e.name });
            }
        });
    });

    select.innerHTML = exerciseOptions
        .map((e) => `<option value="${e.id}">${e.name}</option>`)
        .join('');

    // Attach change listener
    select.removeEventListener('change', onExerciseSelect);
    select.addEventListener('change', onExerciseSelect);

    // Render first exercise if available
    if (exerciseOptions.length > 0) {
        renderRepProgressionChart(exerciseOptions[0].id);
    }
}

function onExerciseSelect(e) {
    renderRepProgressionChart(e.target.value);
}

/**
 * Render rep progression chart for a specific exercise.
 */
function renderRepProgressionChart(exerciseId) {
    const data = getExerciseRepProgression(exerciseId);
    if (data.length === 0) return;
    const defaults = getChartDefaults();
    const theme = getChartTheme();

    renderChart('repProgressionChart', {
        type: 'line',
        data: {
            labels: data.map((d) => formatShortDate(d.date)),
            datasets: [
                {
                    label: 'Left Reps',
                    data: data.map((d) => d.leftReps),
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66,133,244,0.1)',
                    tension: 0.3,
                    pointRadius: data.length > 20 ? 0 : 3,
                },
                {
                    label: 'Right Reps',
                    data: data.map((d) => d.rightReps),
                    borderColor: '#fbbc04',
                    backgroundColor: 'rgba(251,188,4,0.1)',
                    tension: 0.3,
                    pointRadius: data.length > 20 ? 0 : 3,
                },
            ],
        },
        options: {
            ...defaults,
            scales: {
                ...defaults.scales,
                y: {
                    ...defaults.scales.y,
                    beginAtZero: true,
                    grid: { display: false },
                    title: { display: true, text: 'Reps', color: theme.textColor },
                },
                x: {
                    ...defaults.scales.x,
                    grid: { display: false },
                },
            },
        },
    });
}

// ========================================================================
//  TRAINING BALANCE
// ========================================================================

/**
 * Get exercise count distribution by category.
 * @returns {Array<{category: string, count: number, percentage: number}>}
 */
function getCategoryDistribution() {
    const workouts = getFilteredWorkouts();
    const catMap = {};
    let total = 0;

    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
            const cat = getCategoryByExerciseId(e.id) || 'Other';
            catMap[cat] = (catMap[cat] || 0) + 1;
            total++;
        });
    });

    return Object.entries(catMap)
        .map(([category, count]) => ({
            category,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get unique exercise count (variety).
 */
function getExerciseVariety() {
    const workouts = getFilteredWorkouts();
    const ids = new Set();
    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => ids.add(e.id));
    });
    return ids.size;
}

/**
 * Render category distribution pie chart.
 */
function renderCategoryPieChart() {
    const data = getCategoryDistribution();
    if (data.length === 0) return;
    const defaults = getChartDefaults();

    const colors = [
        '#4285f4',
        '#ea4335',
        '#fbbc04',
        '#34a853',
        '#ff6d01',
        '#46bdc6',
        '#7b1fa2',
        '#c2185b',
    ];

    renderChart('categoryPieChart', {
        type: 'doughnut',
        data: {
            labels: data.map((d) => d.category),
            datasets: [
                {
                    data: data.map((d) => d.count),
                    backgroundColor: data.map((_, i) => colors[i % colors.length]),
                    borderWidth: 2,
                    borderColor: darkMode ? '#1e1e1e' : '#fff',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                ...defaults.plugins,
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getChartTheme().textColor,
                        font: { size: 11 },
                        padding: 12,
                    },
                },
            },
        },
    });
}

/**
 * Render training balance stat cards.
 */
function renderBalanceCards() {
    const container = document.getElementById('balanceCards');
    if (!container) return;

    const dist = getCategoryDistribution();
    const variety = getExerciseVariety();
    const mostTrained = dist.length > 0 ? dist[0] : null;
    const leastTrained = dist.length > 1 ? dist[dist.length - 1] : null;

    container.innerHTML = `
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${variety}</div>
            <div class="analytics-stat-label">Unique Exercises</div>
        </div>
        ${
            mostTrained
                ? `<div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value" style="font-size:var(--font-size-xs)">${mostTrained.category}</div>
            <div class="analytics-stat-label">Most Trained (${mostTrained.percentage}%)</div>
        </div>`
                : ''
        }
        ${
            leastTrained
                ? `<div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value" style="font-size:var(--font-size-xs)">${leastTrained.category}</div>
            <div class="analytics-stat-label">Least Trained (${leastTrained.percentage}%)</div>
        </div>`
                : ''
        }
    `;
}

// ========================================================================
//  ADHERENCE & COMPLIANCE
// ========================================================================

/**
 * Get compliance: % of target reps achieved.
 */
function getTargetCompliance() {
    const workouts = getFilteredWorkouts();
    const allExercises = [...exercises.phase1, ...exercises.phase2, ...exercises.phase3];
    let totalTarget = 0;
    let totalAchieved = 0;

    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
            const def = allExercises.find((ex) => ex.id === e.id);
            if (def) {
                totalTarget += (def.leftTarget || 0) + (def.rightTarget || 0);
                totalAchieved += (e.leftReps || 0) + (e.rightReps || 0);
            }
        });
    });

    return totalTarget > 0 ? Math.min(100, Math.round((totalAchieved / totalTarget) * 100)) : 0;
}

/**
 * Get completion rate: % of exercises per workout that were actually logged.
 */
function getCompletionRate() {
    const workouts = getFilteredWorkouts();
    if (workouts.length === 0) return 0;

    let totalPossible = 0;
    let totalDone = 0;

    workouts.forEach((w) => {
        const phaseExercises = getExercisesForPhase(w.phase || 1);
        totalPossible += phaseExercises.length;
        totalDone += (w.exercises || []).length;
    });

    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
}

/**
 * Get the best training day of the week.
 */
function getBestTrainingDay() {
    const workouts = getFilteredWorkouts();
    const dayMap = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    workouts.forEach((w) => {
        const [y, m, d] = w.date.split('-').map(Number);
        const day = new Date(y, m - 1, d).getDay();
        dayMap[day]++;
    });

    const maxIdx = dayMap.indexOf(Math.max(...dayMap));
    return dayMap[maxIdx] > 0 ? dayNames[maxIdx] : '--';
}

/**
 * Render adherence stat cards.
 */
function renderAdherenceCards() {
    const container = document.getElementById('adherenceCards');
    if (!container) return;

    const compliance = getTargetCompliance();
    const completionRate = getCompletionRate();
    const bestDay = getBestTrainingDay();
    const totalWorkouts = getFilteredWorkouts().length;

    container.innerHTML = `
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${compliance}%</div>
            <div class="analytics-stat-label">Rep Compliance</div>
        </div>
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${completionRate}%</div>
            <div class="analytics-stat-label">Completion Rate</div>
        </div>
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${bestDay}</div>
            <div class="analytics-stat-label">Best Day</div>
        </div>
        <div class="analytics-stat-card analytics-stat-card--small">
            <div class="analytics-stat-value">${totalWorkouts}</div>
            <div class="analytics-stat-label">Workouts</div>
        </div>
    `;
}

// ========================================================================
//  SUMMARY CARDS
// ========================================================================

/**
 * Render the top-level summary cards row.
 */
function renderSummaryCards() {
    const trend = calculatePainTrend();
    const variety = getExerciseVariety();
    const ratios = calculateAsymmetryRatios();
    const volumeData = getVolumeByWeek();

    // Average pain
    const avgPainEl = document.getElementById('summaryAvgPain');
    if (avgPainEl) {
        if (trend.length > 0) {
            const avg = (trend.reduce((s, d) => s + d.avgPain, 0) / trend.length).toFixed(1);
            avgPainEl.textContent = avg;
        } else {
            avgPainEl.textContent = '--';
        }
    }

    // Pain trend arrow
    const painTrendEl = document.getElementById('summaryPainTrend');
    if (painTrendEl && trend.length >= 14) {
        const recent = trend.slice(-7).reduce((s, d) => s + d.avgPain, 0) / 7;
        const prior = trend.slice(-14, -7).reduce((s, d) => s + d.avgPain, 0) / 7;
        if (recent < prior - 0.3) painTrendEl.textContent = '↓';
        else if (recent > prior + 0.3) painTrendEl.textContent = '↑';
        else painTrendEl.textContent = '→';
    }

    // Total volume
    const volumeEl = document.getElementById('summaryTotalVolume');
    if (volumeEl) {
        const total = volumeData.reduce((s, d) => s + d.volume, 0);
        volumeEl.textContent = total > 999 ? (total / 1000).toFixed(1) + 'k' : total;
    }

    // Asymmetry
    const asymEl = document.getElementById('summaryAsymmetry');
    if (asymEl) {
        if (ratios.length > 0) {
            const avgPercent = Math.round(
                (ratios.reduce((s, r) => s + Math.abs(1 - r.ratio), 0) / ratios.length) * 100
            );
            asymEl.textContent = avgPercent + '%';
        } else {
            asymEl.textContent = '--';
        }
    }

    // Variety
    const varietyEl = document.getElementById('summaryVariety');
    if (varietyEl) {
        varietyEl.textContent = variety;
    }
}

// ========================================================================
//  SECTION TOGGLE
// ========================================================================

/**
 * Toggle an analytics section open/closed.
 * @param {string} sectionId
 */
function toggleAnalyticsSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.toggle('analytics-section--collapsed');
}

// ========================================================================
//  DATE RANGE SELECTOR
// ========================================================================

/**
 * Set up date range buttons.
 */
function setupDateRangeSelector() {
    const buttons = document.querySelectorAll('.analytics-range-btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', function () {
            buttons.forEach((b) => b.classList.remove('active'));
            this.classList.add('active');
            const range = this.dataset.range;
            currentRange = range === 'all' ? Infinity : parseInt(range);
            renderAllAnalytics();
        });
    });
}

// ========================================================================
//  MAIN RENDER
// ========================================================================

/**
 * Render all analytics charts and cards. Called when navigating to the analytics screen.
 */
function renderAllAnalytics() {
    const workouts = getFilteredWorkouts();
    const emptyEl = document.getElementById('analyticsEmpty');
    const sections = document.querySelectorAll(
        '#analyticsScreen .analytics-section, #analyticsScreen .analytics-summary-row, #analyticsScreen .analytics-date-range'
    );

    if (workouts.length === 0) {
        // Show empty state
        if (emptyEl) emptyEl.style.display = '';
        sections.forEach((s) => (s.style.display = 'none'));
        return;
    }

    // Hide empty state, show sections
    if (emptyEl) emptyEl.style.display = 'none';
    sections.forEach((s) => (s.style.display = ''));

    // Render everything
    renderSummaryCards();
    renderPainTrendChart();
    renderPainStatsCards();
    renderAsymmetryChart();
    renderAsymmetryCards();
    renderVolumeChart();
    populateExerciseSelector();
    renderCategoryPieChart();
    renderBalanceCards();
    renderAdherenceCards();
}

/**
 * Initialize the analytics screen. Called once from app.js.
 */
function initAnalytics() {
    setupDateRangeSelector();
}

// ========================================================================
//  DATE HELPERS
// ========================================================================

/**
 * Format a YYYY-MM-DD date to short display like "Jan 5".
 */
function formatShortDate(dateStr) {
    const [, m, d] = dateStr.split('-').map(Number);
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    return `${months[m - 1]} ${d}`;
}

/**
 * Get the Monday of the week for a given date string.
 */
function getWeekStart(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
}

export { initAnalytics, renderAllAnalytics, toggleAnalyticsSection, getExercisePainMap };
