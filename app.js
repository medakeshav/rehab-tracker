// Rehab Tracker App - Main JavaScript

// State Management
let currentPhase = parseInt(localStorage.getItem('currentPhase')) || 1;
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || [];
let weeklyData = JSON.parse(localStorage.getItem('weeklyData')) || [];
let monthlyData = JSON.parse(localStorage.getItem('monthlyData')) || [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateStats();
});

function initializeApp() {
    // Set current date
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentDate').textContent = today;
    
    // Set workout date to today
    document.getElementById('workoutDate').valueAsDate = new Date();
    
    // Load current phase
    updatePhaseInfo();
    loadExercises();
}

function setupEventListeners() {
    // Menu functionality
    document.getElementById('menuBtn').addEventListener('click', openMenu);
    document.getElementById('closeMenuBtn').addEventListener('click', closeMenu);
    
    // Overlay click
    document.addEventListener('click', function(e) {
        const sideMenu = document.getElementById('sideMenu');
        const menuBtn = document.getElementById('menuBtn');
        if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Pain slider listeners
    setupPainSliders();
    
    // Form submissions
    document.getElementById('weeklyForm').addEventListener('submit', saveWeeklyAssessment);
    document.getElementById('monthlyForm').addEventListener('submit', saveMonthlyAssessment);
    
    // Set default week and month numbers
    const currentWeek = calculateCurrentWeek();
    document.getElementById('weekNumber').value = currentWeek;
    document.getElementById('monthNumber').value = Math.ceil(currentWeek / 4);
    
    // Set today's date for assessments
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('weeklyDate').value = today;
    document.getElementById('monthlyDate').value = today;
}

function setupPainSliders() {
    const sliders = ['kneePain', 'backPain', 'footPain'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const display = document.getElementById(id + 'Value');
        if (slider && display) {
            slider.addEventListener('input', function() {
                display.textContent = this.value;
            });
        }
    });
}

// Navigation Functions
function openMenu() {
    document.getElementById('sideMenu').classList.add('active');
}

function closeMenu() {
    document.getElementById('sideMenu').classList.remove('active');
}

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Special actions for certain screens
    if (screenName === 'history') {
        loadHistory('workouts');
    }
    
    closeMenu();
}

// Phase Management
function selectPhase(phase) {
    currentPhase = phase;
    localStorage.setItem('currentPhase', phase);
    updatePhaseInfo();
    loadExercises();
    showScreen('daily');
    showToast('Phase ' + phase + ' selected!', 'success');
}

function updatePhaseInfo() {
    const phaseNames = {
        1: 'Phase 1: Foundation (Weeks 1-8)',
        2: 'Phase 2: Functional Strength (Weeks 9-20)',
        3: 'Phase 3: Advanced (Week 21+)'
    };
    document.getElementById('currentPhaseText').textContent = phaseNames[currentPhase];
}

// Exercise Loading
function loadExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    
    const phaseExercises = getExercisesForPhase(currentPhase);
    
    phaseExercises.forEach((exercise, index) => {
        const card = createExerciseCard(exercise, index);
        exerciseList.appendChild(card);
    });
}

function createExerciseCard(exercise, index) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    
    // Add progression note if applicable
    let progressionNote = '';
    if (exercise.progressionLevel) {
        const progressionTexts = {
            1: '🟢 Start here - easiest level',
            2: '🟡 Progress when Level 1 feels easy',
            3: '🟠 Intermediate - adds challenge',
            4: '🔴 Advanced - no support',
            5: '⚫ Expert - most challenging'
        };
        progressionNote = `<div style="background: var(--bg-light); padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; font-size: 13px; color: var(--text-dark);">${progressionTexts[exercise.progressionLevel]}</div>`;
    }
    
    card.innerHTML = `
        ${progressionNote}
        <div class="exercise-header">
            <div class="exercise-name">${exercise.name}</div>
            <div class="exercise-actions">
                <button class="info-btn" id="info_${exercise.id}" title="View Instructions">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                        <path d="M10 14V10M10 6H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div class="exercise-target">${exercise.targetReps} × ${exercise.sets}</div>
            </div>
        </div>
        <div class="exercise-inputs">
            <div class="input-group">
                <label>Left Leg Reps:</label>
                <input type="number" id="left_${exercise.id}" min="0" placeholder="${exercise.leftTarget}" inputmode="numeric">
            </div>
            <div class="input-group">
                <label>Right Leg Reps:</label>
                <input type="number" id="right_${exercise.id}" min="0" placeholder="${exercise.rightTarget}" inputmode="numeric">
            </div>
        </div>
        <div class="input-group">
            <label>Sets Completed:</label>
            <input type="number" id="sets_${exercise.id}" min="0" max="${exercise.sets}" placeholder="${exercise.sets}" inputmode="numeric">
        </div>
        <div class="pain-section">
            <label>
                Pain Level (0-10): 
                <span class="pain-value" id="pain_value_${exercise.id}">0</span>
            </label>
            <div style="padding: 15px 5px;">
                <input type="range" class="pain-slider" id="pain_${exercise.id}" 
                       min="0" max="10" value="0" step="1">
            </div>
        </div>
        <textarea class="notes-input" id="notes_${exercise.id}" 
                  placeholder="Notes (optional)..."></textarea>
    `;
    
    // Add pain slider listener with scroll protection
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    
    let isSliding = false;
    
    // Start sliding only on deliberate touch/click
    painSlider.addEventListener('touchstart', function(e) {
        isSliding = true;
        e.stopPropagation();
    }, { passive: false });
    
    painSlider.addEventListener('mousedown', function(e) {
        isSliding = true;
        e.stopPropagation();
    });
    
    // Update value during slide
    painSlider.addEventListener('input', function() {
        if (isSliding) {
            painValue.textContent = this.value;
            updatePainColor(painValue, this.value);
        }
    });
    
    // Change event for final value
    painSlider.addEventListener('change', function() {
        painValue.textContent = this.value;
        updatePainColor(painValue, this.value);
        isSliding = false;
    });
    
    // Reset sliding state
    painSlider.addEventListener('touchend', function() {
        isSliding = false;
    });
    
    painSlider.addEventListener('mouseup', function() {
        isSliding = false;
    });
    
    // Add info button listener
    const infoBtn = card.querySelector(`#info_${exercise.id}`);
    if (exercise.instructions && infoBtn) {
        infoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showInstructions(exercise);
        });
    }
    
    return card;
}

function updatePainColor(element, value) {
    if (value >= 7) {
        element.style.background = 'var(--danger-color)';
    } else if (value >= 4) {
        element.style.background = 'var(--warning-color)';
    } else {
        element.style.background = 'var(--primary-color)';
    }
}

// Close instructions modal and restore scroll
function closeInstructionsModal(el) {
    const modal = el.closest('.instructions-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
}

// Show Exercise Instructions Modal
function showInstructions(exercise) {
    if (!exercise.instructions) {
        showToast('No instructions available', 'info');
        return;
    }
    
    const instr = exercise.instructions;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'instructions-modal';
    modal.innerHTML = `
        <div class="instructions-content">
            <div class="instructions-header">
                <h2>${instr.title}</h2>
                <button class="close-btn" onclick="closeInstructionsModal(this)">×</button>
            </div>
            <div class="instructions-body">
                <div class="instructions-section">
                    <h3>📋 How to Perform:</h3>
                    <ol class="steps-list">
                        ${instr.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="instructions-section">
                    <h3>🎯 Target:</h3>
                    <p><strong>Reps:</strong> ${instr.reps}</p>
                    <p><strong>Sets:</strong> ${instr.sets}</p>
                </div>
                
                <div class="instructions-section why-section">
                    <h3>💡 Why This Exercise:</h3>
                    <p>${instr.why}</p>
                </div>
                
                <div class="instructions-section tips-section">
                    <h3>✅ Pro Tips:</h3>
                    <ul class="tips-list">
                        ${instr.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="instructions-footer">
                <button class="btn btn-primary" onclick="closeInstructionsModal(this)">Got It!</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Save Workout
function saveWorkout() {
    const date = document.getElementById('workoutDate').value;
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }
    
    const phaseExercises = getExercisesForPhase(currentPhase);
    const workout = {
        date: date,
        phase: currentPhase,
        exercises: []
    };
    
    let hasData = false;
    phaseExercises.forEach(exercise => {
        const leftReps = document.getElementById(`left_${exercise.id}`).value;
        const rightReps = document.getElementById(`right_${exercise.id}`).value;
        const sets = document.getElementById(`sets_${exercise.id}`).value;
        const pain = document.getElementById(`pain_${exercise.id}`).value;
        const notes = document.getElementById(`notes_${exercise.id}`).value;
        
        if (leftReps || rightReps || sets || pain > 0 || notes) {
            hasData = true;
            workout.exercises.push({
                id: exercise.id,
                name: exercise.name,
                leftReps: parseInt(leftReps) || 0,
                rightReps: parseInt(rightReps) || 0,
                sets: parseInt(sets) || 0,
                pain: parseInt(pain) || 0,
                notes: notes
            });
        }
    });
    
    if (!hasData) {
        showToast('Please enter at least some data', 'error');
        return;
    }
    
    // Save to storage
    workoutData.push(workout);
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
    
    showToast('✓ Workout saved successfully!', 'success');
    
    // Clear form
    setTimeout(() => {
        loadExercises();
        updateStats();
    }, 1000);
}

// Weekly Assessment
function saveWeeklyAssessment(e) {
    e.preventDefault();
    
    const assessment = {
        week: document.getElementById('weekNumber').value,
        date: document.getElementById('weeklyDate').value,
        standLeft: document.getElementById('standLeft').value,
        standRight: document.getElementById('standRight').value,
        bridgeLeft: document.getElementById('bridgeLeft').value,
        bridgeRight: document.getElementById('bridgeRight').value,
        reachLeft: document.getElementById('reachLeft').value,
        reachRight: document.getElementById('reachRight').value,
        kneePain: document.getElementById('kneePain').value,
        backPain: document.getElementById('backPain').value,
        footPain: document.getElementById('footPain').value,
        notes: document.getElementById('weeklyNotes').value
    };
    
    weeklyData.push(assessment);
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
    
    showToast('✓ Weekly assessment saved!', 'success');
    
    setTimeout(() => {
        document.getElementById('weeklyForm').reset();
        document.getElementById('weekNumber').value = calculateCurrentWeek() + 1;
        showScreen('home');
    }, 1500);
}

// Monthly Assessment
function saveMonthlyAssessment(e) {
    e.preventDefault();
    
    const assessment = {
        month: document.getElementById('monthNumber').value,
        date: document.getElementById('monthlyDate').value,
        calfRight: document.getElementById('calfRight').value,
        calfLeft: document.getElementById('calfLeft').value,
        thighRight: document.getElementById('thighRight').value,
        thighLeft: document.getElementById('thighLeft').value,
        photosTaken: document.getElementById('photosTaken').checked,
        videoTaken: document.getElementById('videoTaken').checked,
        phase: document.getElementById('monthlyPhase').value,
        readyNextPhase: document.getElementById('readyNextPhase').checked,
        notes: document.getElementById('monthlyNotes').value
    };
    
    monthlyData.push(assessment);
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));
    
    showToast('✓ Monthly assessment saved!', 'success');
    
    setTimeout(() => {
        document.getElementById('monthlyForm').reset();
        document.getElementById('monthNumber').value = Math.ceil(calculateCurrentWeek() / 4) + 1;
        showScreen('home');
    }, 1500);
}

// History Management
function showHistoryTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadHistory(tab);
}

function loadHistory(type) {
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = '';
    
    let data = [];
    switch(type) {
        case 'workouts':
            data = workoutData.slice().reverse();
            break;
        case 'weekly':
            data = weeklyData.slice().reverse();
            break;
        case 'monthly':
            data = monthlyData.slice().reverse();
            break;
    }
    
    if (data.length === 0) {
        historyContent.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No data yet. Start tracking!</p>';
        return;
    }
    
    data.forEach(item => {
        const card = createHistoryCard(item, type);
        historyContent.appendChild(card);
    });
}

function createHistoryCard(item, type) {
    const card = document.createElement('div');
    card.className = 'history-item';
    
    if (type === 'workouts') {
        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">${formatDate(item.date)}</div>
                <div class="history-phase">Phase ${item.phase}</div>
            </div>
            <div class="history-details">
                Exercises completed: ${item.exercises.length}<br>
                Average pain: ${calculateAvgPain(item.exercises)}
            </div>
        `;
    } else if (type === 'weekly') {
        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">Week ${item.week} - ${formatDate(item.date)}</div>
            </div>
            <div class="history-details">
                Balance: L ${item.standLeft}s / R ${item.standRight}s<br>
                Bridges: L ${item.bridgeLeft} / R ${item.bridgeRight}<br>
                Pain: Knee ${item.kneePain}, Back ${item.backPain}, Foot ${item.footPain}
            </div>
        `;
    } else if (type === 'monthly') {
        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">Month ${item.month} - ${formatDate(item.date)}</div>
            </div>
            <div class="history-details">
                Calf: L ${item.calfLeft}cm / R ${item.calfRight}cm<br>
                Thigh: L ${item.thighLeft}cm / R ${item.thighRight}cm<br>
                Phase: ${item.phase} ${item.readyNextPhase ? '✓ Ready for next' : ''}
            </div>
        `;
    }
    
    return card;
}

// Export Data
function exportAllData() {
    if (workoutData.length === 0 && weeklyData.length === 0 && monthlyData.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    // Export workouts
    if (workoutData.length > 0) {
        exportWorkoutsCSV();
    }
    
    // Export weekly assessments
    if (weeklyData.length > 0) {
        exportWeeklyCSV();
    }
    
    // Export monthly assessments
    if (monthlyData.length > 0) {
        exportMonthlyCSV();
    }
    
    showToast('✓ Data exported successfully!', 'success');
}

function exportWorkoutsCSV() {
    let csv = 'Date,Phase,Exercise,Left Reps,Right Reps,Sets,Pain Level,Notes\n';
    
    workoutData.forEach(workout => {
        workout.exercises.forEach(ex => {
            csv += `${workout.date},${workout.phase},"${ex.name}",${ex.leftReps},${ex.rightReps},${ex.sets},${ex.pain},"${ex.notes}"\n`;
        });
    });
    
    downloadCSV(csv, 'rehab_workouts.csv');
}

function exportWeeklyCSV() {
    let csv = 'Week,Date,Stand Left,Stand Right,Bridge Left,Bridge Right,Reach Left,Reach Right,Knee Pain,Back Pain,Foot Pain,Notes\n';
    
    weeklyData.forEach(week => {
        csv += `${week.week},${week.date},${week.standLeft},${week.standRight},${week.bridgeLeft},${week.bridgeRight},${week.reachLeft},${week.reachRight},${week.kneePain},${week.backPain},${week.footPain},"${week.notes}"\n`;
    });
    
    downloadCSV(csv, 'rehab_weekly_assessments.csv');
}

function exportMonthlyCSV() {
    let csv = 'Month,Date,Calf Right,Calf Left,Thigh Right,Thigh Left,Photos,Video,Phase,Ready Next Phase,Notes\n';
    
    monthlyData.forEach(month => {
        csv += `${month.month},${month.date},${month.calfRight},${month.calfLeft},${month.thighRight},${month.thighLeft},${month.photosTaken},${month.videoTaken},${month.phase},${month.readyNextPhase},"${month.notes}"\n`;
    });
    
    downloadCSV(csv, 'rehab_monthly_assessments.csv');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Clear Data
function clearAllData() {
    if (confirm('⚠️ This will delete ALL your data. This cannot be undone. Are you absolutely sure?')) {
        if (confirm('Really? This will permanently delete all workouts, assessments, and progress. Last chance to cancel!')) {
            localStorage.clear();
            workoutData = [];
            weeklyData = [];
            monthlyData = [];
            currentPhase = 1;
            showToast('All data cleared', 'success');
            updateStats();
            showScreen('home');
        }
    }
}

// Statistics
function updateStats() {
    document.getElementById('totalWorkouts').textContent = workoutData.length;
    document.getElementById('currentStreak').textContent = calculateStreak();
    document.getElementById('currentWeek').textContent = calculateCurrentWeek();
}

function calculateStreak() {
    if (workoutData.length === 0) return 0;
    
    const sortedDates = workoutData
        .map(w => new Date(w.date))
        .sort((a, b) => b - a);
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWorkout = sortedDates[0];
    lastWorkout.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0;
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function calculateCurrentWeek() {
    if (workoutData.length === 0) return 1;
    
    const firstWorkout = new Date(workoutData[0].date);
    const today = new Date();
    const daysDiff = Math.floor((today - firstWorkout) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateAvgPain(exercises) {
    if (exercises.length === 0) return '0/10';
    const total = exercises.reduce((sum, ex) => sum + ex.pain, 0);
    const avg = (total / exercises.length).toFixed(1);
    return `${avg}/10`;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
