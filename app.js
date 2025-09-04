// HYBRID OPS - 8 Week Training Program
// Progressive Web App for Hybrid Fitness Training

// Global variables
let deferredPrompt;
let activeWorkoutDayId = null;
let sessionStartTime = null;
let sessionTimer = null;
let currentView = 'home';

// Program data structure
const programs = {
    hybridAthlete: {
        beginner: {
            name: "Hybrid Athlete - Beginner",
            description: "Build a foundation of strength and endurance",
            weeks: 8,
            workouts: generateHybridAthleteProgram('beginner')
        },
        intermediate: {
            name: "Hybrid Athlete - Intermediate", 
            description: "Develop well-rounded fitness capabilities",
            weeks: 8,
            workouts: generateHybridAthleteProgram('intermediate')
        },
        advanced: {
            name: "Hybrid Athlete - Advanced",
            description: "Elite hybrid performance training",
            weeks: 8,
            workouts: generateHybridAthleteProgram('advanced')
        }
    },
    tacticalAthlete: {
        beginner: {
            name: "Tactical Athlete - Beginner",
            description: "Functional fitness for demanding roles",
            weeks: 8,
            workouts: generateTacticalAthleteProgram('beginner')
        },
        intermediate: {
            name: "Tactical Athlete - Intermediate",
            description: "Advanced tactical fitness preparation", 
            weeks: 8,
            workouts: generateTacticalAthleteProgram('intermediate')
        },
        advanced: {
            name: "Tactical Athlete - Advanced",
            description: "Elite tactical performance training",
            weeks: 8,
            workouts: generateTacticalAthleteProgram('advanced')
        }
    },
    forceTestPrep: {
        beginner: {
            name: "Force Test Prep - Beginner",
            description: "Prepare for fitness test requirements",
            weeks: 8,
            workouts: generateForceTestPrepProgram('beginner')
        },
        intermediate: {
            name: "Force Test Prep - Intermediate",
            description: "Optimize test performance capabilities",
            weeks: 8,
            workouts: generateForceTestPrepProgram('intermediate')
        },
        advanced: {
            name: "Force Test Prep - Advanced", 
            description: "Peak performance for fitness testing",
            weeks: 8,
            workouts: generateForceTestPrepProgram('advanced')
        }
    }
};

// Exercise library with detailed instructions
const exerciseLibrary = {
    // Strength exercises
    'Push-ups': {
        category: 'Strength',
        primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
        instructions: [
            'Start in a plank position with hands slightly wider than shoulders',
            'Lower your body until chest nearly touches the floor',
            'Push back up to starting position',
            'Keep your body in a straight line throughout'
        ],
        tips: [
            'Engage your core throughout the movement',
            'Don\'t let your hips sag or pike up',
            'Control the descent - don\'t drop down quickly'
        ]
    },
    'Pull-ups': {
        category: 'Strength',
        primaryMuscles: ['Lats', 'Biceps', 'Rhomboids'],
        instructions: [
            'Hang from a pull-up bar with palms facing away',
            'Pull your body up until chin clears the bar',
            'Lower yourself with control to full arm extension',
            'Repeat for desired reps'
        ],
        tips: [
            'Engage lats by pulling shoulder blades down and back',
            'Avoid swinging or using momentum',
            'Focus on controlled movement both up and down'
        ]
    },
    'Squats': {
        category: 'Strength',
        primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
        instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body by bending at hips and knees',
            'Descend until thighs are parallel to floor',
            'Drive through heels to return to starting position'
        ],
        tips: [
            'Keep your chest up and core engaged',
            'Don\'t let knees cave inward',
            'Weight should be on your heels, not toes'
        ]
    },
    'Burpees': {
        category: 'Conditioning',
        primaryMuscles: ['Full Body'],
        instructions: [
            'Start standing, then squat down and place hands on floor',
            'Jump feet back into plank position',
            'Perform a push-up (optional)',
            'Jump feet back to squat position',
            'Explode up with arms overhead'
        ],
        tips: [
            'Maintain good form even when fatigued',
            'Land softly when jumping back',
            'Keep core tight throughout movement'
        ]
    },
    'Mountain Climbers': {
        category: 'Conditioning',
        primaryMuscles: ['Core', 'Shoulders', 'Legs'],
        instructions: [
            'Start in plank position',
            'Bring right knee toward chest',
            'Quickly switch legs, bringing left knee to chest',
            'Continue alternating legs rapidly'
        ],
        tips: [
            'Keep hips level - don\'t let them pike up',
            'Maintain plank position with shoulders over wrists',
            'Focus on quick, controlled movements'
        ]
    },
    'Plank': {
        category: 'Core',
        primaryMuscles: ['Core', 'Shoulders'],
        instructions: [
            'Start in push-up position',
            'Lower to forearms, keeping body straight',
            'Hold position with core engaged',
            'Breathe normally while maintaining form'
        ],
        tips: [
            'Don\'t let hips sag or pike up',
            'Engage glutes and core muscles',
            'Keep head in neutral position'
        ]
    },
    'Running': {
        category: 'Cardio',
        primaryMuscles: ['Legs', 'Cardiovascular System'],
        instructions: [
            'Maintain upright posture with slight forward lean',
            'Land on midfoot, not heel',
            'Keep arms relaxed at 90-degree angle',
            'Maintain steady breathing rhythm'
        ],
        tips: [
            'Start with comfortable pace and build gradually',
            'Focus on cadence around 180 steps per minute',
            'Stay hydrated, especially on longer runs'
        ]
    }
};

// Welcome messages for typewriter effect
const welcomeMessages = [
    "Welcome to HYBRID OPS. Your 8-week transformation begins now.",
    "Elite training protocols await. Are you ready to push your limits?",
    "Strength. Endurance. Mobility. The complete hybrid athlete package.",
    "Your mission: Become the most capable version of yourself.",
    "8 weeks. 3 pillars. Unlimited potential."
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupPWA();
    setupNavigation();
    setupOnboarding();
});

function initializeApp() {
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    
    if (goal && difficulty) {
        showAppContent();
        loadProgram(goal, difficulty);
    } else {
        showWelcomeScreen();
    }
}

function showWelcomeScreen() {
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('goal-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('app-content').classList.add('hidden');
    document.getElementById('bottom-nav').classList.add('hidden');
    
    // Typewriter effect for welcome message
    const welcomeNote = document.getElementById('welcome-note');
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    typewriterEffect(welcomeNote, randomMessage, 50);
    
    // Add event listener for get started button
    const getStartedBtn = document.getElementById('get-started-button');
    getStartedBtn.addEventListener('click', showGoalScreen);
}

function typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    element.classList.add('typewriter-cursor');
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('typewriter-cursor');
        }
    }
    
    type();
}

function showGoalScreen() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('goal-selection').classList.remove('hidden');
}

function selectGoal(goal) {
    localStorage.setItem('hybridGoal', goal);
    showDifficultyScreen();
}

function showDifficultyScreen() {
    document.getElementById('goal-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.remove('hidden');
}

function selectDifficulty(difficulty) {
    localStorage.setItem('hybridDifficulty', difficulty);
    const goal = localStorage.getItem('hybridGoal');
    showAppContent();
    loadProgram(goal, difficulty);
}

function showAppContent() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('goal-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');
}

function loadProgram(goal, difficulty) {
    const program = programs[goal][difficulty];
    document.getElementById('program-subtitle').textContent = program.name;
    
    // Show loading state
    document.getElementById('program-loading').classList.remove('hidden');
    document.getElementById('program-container').classList.add('hidden');
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        renderProgram(program);
        updateOverallProgress();
        
        // Hide loading state
        document.getElementById('program-loading').classList.add('hidden');
        document.getElementById('program-container').classList.remove('hidden');
        
        // Show onboarding for first-time users
        if (!localStorage.getItem('onboardingCompleted')) {
            showOnboarding();
        }
    }, 1500);
}

function renderProgram(program) {
    const container = document.getElementById('program-container');
    container.innerHTML = '';
    
    for (let week = 1; week <= program.weeks; week++) {
        const weekData = program.workouts[`week${week}`];
        const weekElement = createWeekElement(week, weekData);
        container.appendChild(weekElement);
    }
}

function createWeekElement(weekNumber, weekData) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'mb-8 fade-in-delay';
    
    const weekProgress = calculateWeekProgress(weekNumber);
    const isWeekComplete = weekProgress === 100;
    
    weekDiv.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-200 font-display tracking-wider">WEEK ${weekNumber}</h3>
            <span class="text-sm text-gray-400">${weekProgress}% Complete</span>
        </div>
        <div class="w-full bg-black/50 rounded-full h-2 mb-4 border border-gray-700">
            <div class="bg-lime-400 h-full rounded-full transition-all duration-500 ease-in-out ${weekProgress === 100 ? 'progress-bar-glow' : ''}" style="width: ${weekProgress}%;"></div>
        </div>
        <div class="space-y-3" id="week-${weekNumber}-workouts"></div>
    `;
    
    const workoutsContainer = weekDiv.querySelector(`#week-${weekNumber}-workouts`);
    
    Object.entries(weekData).forEach(([day, workout]) => {
        const dayElement = createWorkoutDayElement(weekNumber, day, workout);
        workoutsContainer.appendChild(dayElement);
    });
    
    return weekDiv;
}

function createWorkoutDayElement(week, day, workout) {
    const dayId = `week${week}_${day}`;
    const isCompleted = isWorkoutCompleted(dayId);
    const workoutData = getWorkoutData(dayId);
    
    const dayDiv = document.createElement('div');
    dayDiv.className = `workout-card p-4 bg-gray-800/50 border-l-4 ${isCompleted ? 'completed-card border-l-green-400' : 'border-l-lime-500'} rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-700/50`;
    
    dayDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex-1">
                <div class="flex items-center space-x-3">
                    <h4 class="font-semibold text-white font-display tracking-wider">${day.toUpperCase()}</h4>
                    ${isCompleted ? '<span class="text-green-400 text-sm">✓ COMPLETE</span>' : ''}
                </div>
                <p class="text-sm text-gray-400 mt-1">${workout.type}</p>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${workout.exercises.slice(0, 3).map(ex => `<span class="text-xs bg-gray-700 px-2 py-1 rounded">${ex.name}</span>`).join('')}
                    ${workout.exercises.length > 3 ? `<span class="text-xs text-gray-500">+${workout.exercises.length - 3} more</span>` : ''}
                </div>
                ${workoutData && workoutData.notes ? `<p class="text-xs text-gray-500 mt-2 italic">"${workoutData.notes}"</p>` : ''}
            </div>
            <div class="flex items-center space-x-2">
                ${isCompleted ? 
                    `<button onclick="viewWorkoutSummary('${dayId}')" class="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">View</button>` :
                    `<button onclick="startWorkout('${dayId}')" class="text-xs bg-lime-500 hover:bg-lime-600 text-black px-3 py-1 rounded font-bold">Start</button>`
                }
                <button onclick="toggleWorkoutDetails('${dayId}')" class="text-gray-400 hover:text-white">
                    <svg class="w-5 h-5 chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div id="details-${dayId}" class="hidden mt-4 pt-4 border-t border-gray-700">
            <div class="space-y-2">
                ${workout.exercises.map(exercise => `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-300">${exercise.name}</span>
                        <span class="text-gray-400">${formatExerciseDetails(exercise)}</span>
                        <button onclick="showExerciseInfo('${exercise.name}')" class="text-lime-400 hover:text-lime-300 text-xs">Info</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return dayDiv;
}

function formatExerciseDetails(exercise) {
    if (exercise.sets && exercise.reps) {
        return `${exercise.sets} × ${exercise.reps}`;
    } else if (exercise.duration) {
        return exercise.duration;
    } else if (exercise.distance) {
        return exercise.distance;
    }
    return '';
}

function toggleWorkoutDetails(dayId) {
    const details = document.getElementById(`details-${dayId}`);
    const chevron = details.previousElementSibling.querySelector('.chevron-icon');
    
    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        chevron.classList.add('rotate-180');
    } else {
        details.classList.add('hidden');
        chevron.classList.remove('rotate-180');
    }
}

function startWorkout(dayId) {
    activeWorkoutDayId = dayId;
    const [week, day] = dayId.split('_');
    const weekNum = parseInt(week.replace('week', ''));
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const workout = programs[goal][difficulty].workouts[week][day];
    
    // Initialize workout session
    sessionStartTime = Date.now();
    document.getElementById('workout-session').classList.remove('hidden');
    document.getElementById('session-exercises').innerHTML = '';
    
    // Load existing notes
    const workoutData = getWorkoutData(dayId);
    document.getElementById('session-notes').value = workoutData?.notes || '';
    
    // Start session timer
    startSessionTimer();
    
    // Render exercises
    workout.exercises.forEach((exercise, index) => {
        const exerciseElement = createSessionExerciseElement(exercise, index, dayId);
        document.getElementById('session-exercises').appendChild(exerciseElement);
    });
}

function createSessionExerciseElement(exercise, index, dayId) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3';
    
    const workoutData = getWorkoutData(dayId);
    const exerciseData = workoutData?.exercises?.[index] || {};
    
    let exerciseContent = `
        <div class="flex items-center justify-between">
            <h4 class="font-semibold text-white">${exercise.name}</h4>
            <button onclick="showExerciseInfo('${exercise.name}')" class="text-lime-400 hover:text-lime-300 text-sm">Info</button>
        </div>
        <p class="text-sm text-gray-400">${formatExerciseDetails(exercise)}</p>
    `;
    
    if (exercise.sets && exercise.reps) {
        // Strength exercise with sets and reps
        exerciseContent += '<div class="space-y-2">';
        for (let set = 1; set <= exercise.sets; set++) {
            const setData = exerciseData.sets?.[set - 1] || {};
            exerciseContent += `
                <div class="flex items-center space-x-3 text-sm">
                    <span class="w-12 text-gray-400">Set ${set}:</span>
                    <input type="number" placeholder="Reps" value="${setData.reps || ''}" 
                           onchange="updateExerciseData('${dayId}', ${index}, ${set - 1}, 'reps', this.value)"
                           class="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center">
                    <span class="text-gray-400">×</span>
                    <input type="number" placeholder="Weight" value="${setData.weight || ''}" 
                           onchange="updateExerciseData('${dayId}', ${index}, ${set - 1}, 'weight', this.value)"
                           class="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center">
                    <span class="text-gray-400">lbs</span>
                </div>
            `;
        }
        exerciseContent += '</div>';
    } else if (exercise.duration) {
        // Time-based exercise
        exerciseContent += `
            <div class="flex items-center space-x-3 text-sm">
                <span class="text-gray-400">Completed:</span>
                <input type="checkbox" ${exerciseData.completed ? 'checked' : ''} 
                       onchange="updateExerciseData('${dayId}', ${index}, 0, 'completed', this.checked)"
                       class="w-4 h-4 text-lime-500 bg-gray-700 border-gray-600 rounded focus:ring-lime-500">
                <input type="text" placeholder="Notes" value="${exerciseData.notes || ''}" 
                       onchange="updateExerciseData('${dayId}', ${index}, 0, 'notes', this.value)"
                       class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1">
            </div>
        `;
    } else if (exercise.distance) {
        // Distance-based exercise
        exerciseContent += `
            <div class="flex items-center space-x-3 text-sm">
                <span class="text-gray-400">Time:</span>
                <input type="text" placeholder="mm:ss" value="${exerciseData.time || ''}" 
                       onchange="updateExerciseData('${dayId}', ${index}, 0, 'time', this.value)"
                       class="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center">
                <input type="text" placeholder="Notes" value="${exerciseData.notes || ''}" 
                       onchange="updateExerciseData('${dayId}', ${index}, 0, 'notes', this.value)"
                       class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1">
            </div>
        `;
    }
    
    exerciseDiv.innerHTML = exerciseContent;
    return exerciseDiv;
}

function updateExerciseData(dayId, exerciseIndex, setIndex, field, value) {
    let workoutData = getWorkoutData(dayId) || { exercises: [] };
    
    if (!workoutData.exercises[exerciseIndex]) {
        workoutData.exercises[exerciseIndex] = {};
    }
    
    const exercise = workoutData.exercises[exerciseIndex];
    
    if (field === 'completed' || field === 'notes' || field === 'time') {
        exercise[field] = value;
    } else {
        // Handle sets data
        if (!exercise.sets) exercise.sets = [];
        if (!exercise.sets[setIndex]) exercise.sets[setIndex] = {};
        exercise.sets[setIndex][field] = value;
    }
    
    saveWorkoutData(dayId, workoutData);
}

function updateNotes(dayId, notes) {
    let workoutData = getWorkoutData(dayId) || {};
    workoutData.notes = notes;
    saveWorkoutData(dayId, workoutData);
}

function startSessionTimer() {
    sessionTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('session-timer').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function closeWorkoutSession() {
    document.getElementById('workout-session').classList.add('hidden');
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
    activeWorkoutDayId = null;
    sessionStartTime = null;
}

function finishWorkout(dayId) {
    // Mark workout as completed
    let workoutData = getWorkoutData(dayId) || {};
    workoutData.completed = true;
    workoutData.completedAt = new Date().toISOString();
    workoutData.duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    saveWorkoutData(dayId, workoutData);
    
    // Close session
    closeWorkoutSession();
    
    // Show completion toast
    showWorkoutCompleteToast(dayId);
    
    // Refresh the program display
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const program = programs[goal][difficulty];
    renderProgram(program);
    updateOverallProgress();
    
    // Check if week is complete for debrief
    const weekNum = parseInt(dayId.split('_')[0].replace('week', ''));
    if (isWeekComplete(weekNum)) {
        setTimeout(() => showWeeklyDebrief(weekNum), 1000);
    }
}

function showWorkoutCompleteToast(dayId) {
    const toast = document.getElementById('workout-complete-modal');
    const text = document.getElementById('workout-complete-text');
    
    const [week, day] = dayId.split('_');
    text.textContent = `${day.charAt(0).toUpperCase() + day.slice(1)} workout completed!`;
    
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

function viewWorkoutSummary(dayId) {
    // This could open a modal with workout summary
    // For now, just toggle the details
    toggleWorkoutDetails(dayId);
}

function showExerciseInfo(exerciseName) {
    const exercise = exerciseLibrary[exerciseName];
    if (!exercise) return;
    
    const modal = document.getElementById('exercise-modal');
    const content = document.getElementById('exercise-modal-content');
    
    content.innerHTML = `
        <h3 class="text-2xl font-bold text-lime-400 mb-4 font-display">${exerciseName}</h3>
        <div class="mb-4">
            <span class="inline-block bg-lime-500/20 text-lime-400 px-3 py-1 rounded-full text-sm font-semibold mb-2">${exercise.category}</span>
            <p class="text-gray-400 text-sm">Primary muscles: ${exercise.primaryMuscles.join(', ')}</p>
        </div>
        
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-white mb-3">Instructions</h4>
            <ol class="space-y-2">
                ${exercise.instructions.map(instruction => `<li class="text-gray-300">${instruction}</li>`).join('')}
            </ol>
        </div>
        
        <div>
            <h4 class="text-lg font-semibold text-white mb-3">Tips</h4>
            <ul class="space-y-2">
                ${exercise.tips.map(tip => `<li class="text-gray-300">${tip}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeExerciseModal() {
    document.getElementById('exercise-modal').classList.add('hidden');
}

function isWeekComplete(weekNum) {
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const weekData = programs[goal][difficulty].workouts[`week${weekNum}`];
    
    return Object.keys(weekData).every(day => {
        const dayId = `week${weekNum}_${day}`;
        return isWorkoutCompleted(dayId);
    });
}

function showWeeklyDebrief(weekNum) {
    const modal = document.getElementById('debrief-modal');
    document.getElementById('debrief-week-number').textContent = weekNum;
    
    // Calculate week stats
    const stats = calculateWeekStats(weekNum);
    document.getElementById('debrief-workouts').textContent = stats.workouts;
    document.getElementById('debrief-reps').textContent = stats.reps;
    document.getElementById('debrief-volume').textContent = `${stats.volume} lbs`;
    document.getElementById('debrief-distance').textContent = `${stats.distance} km`;
    
    modal.classList.remove('hidden');
}

function closeDebriefModal() {
    document.getElementById('debrief-modal').classList.add('hidden');
}

function calculateWeekStats(weekNum) {
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const weekData = programs[goal][difficulty].workouts[`week${weekNum}`];
    
    let workouts = 0;
    let reps = 0;
    let volume = 0;
    let distance = 0;
    
    Object.keys(weekData).forEach(day => {
        const dayId = `week${weekNum}_${day}`;
        if (isWorkoutCompleted(dayId)) {
            workouts++;
            const workoutData = getWorkoutData(dayId);
            
            if (workoutData?.exercises) {
                workoutData.exercises.forEach(exercise => {
                    if (exercise.sets) {
                        exercise.sets.forEach(set => {
                            if (set.reps) reps += parseInt(set.reps) || 0;
                            if (set.weight && set.reps) {
                                volume += (parseInt(set.weight) || 0) * (parseInt(set.reps) || 0);
                            }
                        });
                    }
                });
            }
        }
    });
    
    return { workouts, reps, volume, distance };
}

function calculateWeekProgress(weekNum) {
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const weekData = programs[goal][difficulty].workouts[`week${weekNum}`];
    
    const totalWorkouts = Object.keys(weekData).length;
    const completedWorkouts = Object.keys(weekData).filter(day => {
        const dayId = `week${weekNum}_${day}`;
        return isWorkoutCompleted(dayId);
    }).length;
    
    return Math.round((completedWorkouts / totalWorkouts) * 100);
}

function updateOverallProgress() {
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const program = programs[goal][difficulty];
    
    let totalWorkouts = 0;
    let completedWorkouts = 0;
    
    for (let week = 1; week <= program.weeks; week++) {
        const weekData = program.workouts[`week${week}`];
        totalWorkouts += Object.keys(weekData).length;
        
        Object.keys(weekData).forEach(day => {
            const dayId = `week${week}_${day}`;
            if (isWorkoutCompleted(dayId)) {
                completedWorkouts++;
            }
        });
    }
    
    const progress = Math.round((completedWorkouts / totalWorkouts) * 100);
    document.getElementById('overall-progress-bar').style.width = `${progress}%`;
    document.getElementById('overall-progress-text').textContent = `${progress}% Complete`;
    
    if (progress === 100) {
        document.getElementById('overall-progress-bar').classList.add('progress-bar-glow');
    }
}

function isWorkoutCompleted(dayId) {
    const data = localStorage.getItem(`hybridData_${dayId}`);
    return data ? JSON.parse(data).completed : false;
}

function getWorkoutData(dayId) {
    const data = localStorage.getItem(`hybridData_${dayId}`);
    return data ? JSON.parse(data) : null;
}

function saveWorkoutData(dayId, data) {
    localStorage.setItem(`hybridData_${dayId}`, JSON.stringify(data));
}

// Navigation functions
function setupNavigation() {
    // Tab switching
    document.querySelectorAll('[data-view]').forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(view).classList.remove('hidden');
    
    // Update tab states
    document.querySelectorAll('[data-view]').forEach(tab => {
        tab.classList.remove('text-lime-400');
        tab.classList.add('text-gray-400');
    });
    
    document.querySelector(`[data-view="${view}"]`).classList.remove('text-gray-400');
    document.querySelector(`[data-view="${view}"]`).classList.add('text-lime-400');
    
    currentView = view;
    
    // Load view-specific content
    if (view === 'analytics') {
        loadAnalytics();
    }
}

// Analytics functions
function loadAnalytics() {
    const hasWorkoutData = Object.keys(localStorage).some(key => 
        key.startsWith('hybridData_') && JSON.parse(localStorage.getItem(key)).completed
    );
    
    if (!hasWorkoutData) {
        document.getElementById('analytics-empty-message').classList.remove('hidden');
        document.getElementById('analytics-content').classList.add('hidden');
        return;
    }
    
    document.getElementById('analytics-empty-message').classList.add('hidden');
    document.getElementById('analytics-content').classList.remove('hidden');
    
    populateExerciseSelect();
    renderProgressChart();
    renderWorkoutsChart();
    renderVolumeChart();
    renderDistanceChart();
}

function populateExerciseSelect() {
    const select = document.getElementById('chart-exercise-select');
    const exercises = new Set();
    
    // Collect all exercises from completed workouts
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hybridData_')) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.completed && data.exercises) {
                data.exercises.forEach((exercise, index) => {
                    if (exercise.sets && exercise.sets.length > 0) {
                        const dayId = key.replace('hybridData_', '');
                        const [week, day] = dayId.split('_');
                        const weekNum = parseInt(week.replace('week', ''));
                        const goal = localStorage.getItem('hybridGoal');
                        const difficulty = localStorage.getItem('hybridDifficulty');
                        const workout = programs[goal][difficulty].workouts[week][day];
                        const exerciseName = workout.exercises[index].name;
                        exercises.add(exerciseName);
                    }
                });
            }
        }
    });
    
    select.innerHTML = '<option value="">Select an exercise...</option>';
    Array.from(exercises).sort().forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        option.textContent = exercise;
        select.appendChild(option);
    });
    
    select.addEventListener('change', renderProgressChart);
}

function renderProgressChart() {
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');
    const selectedExercise = document.getElementById('chart-exercise-select').value;
    
    if (!selectedExercise) {
        // Clear chart
        if (window.progressChart) {
            window.progressChart.destroy();
        }
        return;
    }
    
    const data = getExerciseProgressData(selectedExercise);
    
    if (window.progressChart) {
        window.progressChart.destroy();
    }
    
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Max Weight (lbs)',
                data: data.weights,
                borderColor: '#A3E635',
                backgroundColor: 'rgba(163, 230, 53, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${selectedExercise} Progress`,
                    color: '#A3E635'
                },
                legend: {
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

function getExerciseProgressData(exerciseName) {
    const data = { labels: [], weights: [] };
    
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hybridData_')) {
            const workoutData = JSON.parse(localStorage.getItem(key));
            if (workoutData.completed && workoutData.exercises) {
                const dayId = key.replace('hybridData_', '');
                const [week, day] = dayId.split('_');
                const weekNum = parseInt(week.replace('week', ''));
                const goal = localStorage.getItem('hybridGoal');
                const difficulty = localStorage.getItem('hybridDifficulty');
                const workout = programs[goal][difficulty].workouts[week][day];
                
                workout.exercises.forEach((exercise, index) => {
                    if (exercise.name === exerciseName && workoutData.exercises[index]?.sets) {
                        const maxWeight = Math.max(...workoutData.exercises[index].sets
                            .filter(set => set.weight)
                            .map(set => parseInt(set.weight) || 0));
                        
                        if (maxWeight > 0) {
                            data.labels.push(`W${weekNum} ${day.charAt(0).toUpperCase()}`);
                            data.weights.push(maxWeight);
                        }
                    }
                });
            }
        }
    });
    
    return data;
}

function renderWorkoutsChart() {
    const canvas = document.getElementById('workouts-chart');
    const ctx = canvas.getContext('2d');
    
    const data = getWorkoutsPerWeekData();
    
    if (window.workoutsChart) {
        window.workoutsChart.destroy();
    }
    
    window.workoutsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Workouts Completed',
                data: data.workouts,
                backgroundColor: '#A3E635',
                borderColor: '#84CC16',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Workouts Per Week',
                    color: '#A3E635'
                },
                legend: {
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            }
        }
    });
}

function getWorkoutsPerWeekData() {
    const data = { labels: [], workouts: [] };
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const program = programs[goal][difficulty];
    
    for (let week = 1; week <= program.weeks; week++) {
        const weekData = program.workouts[`week${week}`];
        let completedWorkouts = 0;
        
        Object.keys(weekData).forEach(day => {
            const dayId = `week${week}_${day}`;
            if (isWorkoutCompleted(dayId)) {
                completedWorkouts++;
            }
        });
        
        data.labels.push(`Week ${week}`);
        data.workouts.push(completedWorkouts);
    }
    
    return data;
}

function renderVolumeChart() {
    const canvas = document.getElementById('volume-chart');
    const ctx = canvas.getContext('2d');
    
    const data = getVolumePerWeekData();
    
    if (window.volumeChart) {
        window.volumeChart.destroy();
    }
    
    window.volumeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Total Volume (lbs)',
                data: data.volume,
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Training Volume Per Week',
                    color: '#A3E635'
                },
                legend: {
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            }
        }
    });
}

function getVolumePerWeekData() {
    const data = { labels: [], volume: [] };
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const program = programs[goal][difficulty];
    
    for (let week = 1; week <= program.weeks; week++) {
        const stats = calculateWeekStats(week);
        data.labels.push(`Week ${week}`);
        data.volume.push(stats.volume);
    }
    
    return data;
}

function renderDistanceChart() {
    const canvas = document.getElementById('distance-chart');
    const ctx = canvas.getContext('2d');
    
    const data = getDistancePerWeekData();
    
    if (window.distanceChart) {
        window.distanceChart.destroy();
    }
    
    window.distanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Total Distance (km)',
                data: data.distance,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Running Distance Per Week',
                    color: '#A3E635'
                },
                legend: {
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            }
        }
    });
}

function getDistancePerWeekData() {
    const data = { labels: [], distance: [] };
    const goal = localStorage.getItem('hybridGoal');
    const difficulty = localStorage.getItem('hybridDifficulty');
    const program = programs[goal][difficulty];
    
    for (let week = 1; week <= program.weeks; week++) {
        const stats = calculateWeekStats(week);
        data.labels.push(`Week ${week}`);
        data.distance.push(stats.distance);
    }
    
    return data;
}

// PWA Setup
function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
    
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('install-app-btn').classList.remove('hidden');
        document.getElementById('install-instructions').classList.add('hidden');
    });
    
    // Show iOS install instructions
    if (isIOS() && !isInStandaloneMode()) {
        document.getElementById('ios-pwa-prompt').classList.remove('hidden');
        document.getElementById('ios-pwa-dismiss').addEventListener('click', () => {
            document.getElementById('ios-pwa-prompt').classList.add('hidden');
        });
    }
}

function triggerInstallPrompt() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

// Onboarding system
function setupOnboarding() {
    const onboardingSteps = [
        {
            title: "Welcome to HYBRID OPS",
            content: "This is your 8-week training program. Let's walk through the key features."
        },
        {
            title: "Weekly Progress",
            content: "Track your progress through each week. Green bars show completed workouts."
        },
        {
            title: "Starting Workouts",
            content: "Click 'Start' on any workout to begin your session. You can log weights, reps, and notes."
        },
        {
            title: "Exercise Information",
            content: "Tap 'Info' next to any exercise to see detailed instructions and tips."
        },
        {
            title: "Analytics",
            content: "View your progress charts and statistics in the Analytics tab."
        }
    ];
    
    let currentStep = 0;
    
    function showOnboardingStep(step) {
        const modal = document.getElementById('onboarding-modal');
        const content = document.getElementById('onboarding-content');
        const backBtn = document.getElementById('onboarding-back');
        const nextBtn = document.getElementById('onboarding-next');
        const skipBtn = document.getElementById('onboarding-skip');
        
        content.innerHTML = `
            <h3 class="text-xl font-bold text-lime-400 mb-4">${onboardingSteps[step].title}</h3>
            <p class="text-gray-300 mb-4">${onboardingSteps[step].content}</p>
            <div class="flex justify-center space-x-2 mb-4">
                ${onboardingSteps.map((_, i) => 
                    `<div class="w-2 h-2 rounded-full ${i === step ? 'bg-lime-400' : 'bg-gray-600'}"></div>`
                ).join('')}
            </div>
        `;
        
        backBtn.disabled = step === 0;
        nextBtn.textContent = step === onboardingSteps.length - 1 ? 'Finish' : 'Next';
        
        backBtn.onclick = () => {
            if (step > 0) {
                currentStep--;
                showOnboardingStep(currentStep);
            }
        };
        
        nextBtn.onclick = () => {
            if (step < onboardingSteps.length - 1) {
                currentStep++;
                showOnboardingStep(currentStep);
            } else {
                completeOnboarding();
            }
        };
        
        skipBtn.onclick = completeOnboarding;
        
        modal.classList.remove('hidden');
    }
    
    function completeOnboarding() {
        document.getElementById('onboarding-modal').classList.add('hidden');
        localStorage.setItem('onboardingCompleted', 'true');
    }
    
    window.showOnboarding = () => {
        currentStep = 0;
        showOnboardingStep(0);
    };
}

// Program generation functions
function generateHybridAthleteProgram(difficulty) {
    const baseProgram = {
        week1: {
            monday: {
                type: "Upper Body Strength",
                exercises: [
                    { name: "Push-ups", sets: difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5, reps: difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 12 : 15 },
                    { name: "Pull-ups", sets: difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5, reps: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 8 : 12 },
                    { name: "Plank", duration: difficulty === 'beginner' ? "30s" : difficulty === 'intermediate' ? "45s" : "60s" }
                ]
            },
            wednesday: {
                type: "Lower Body Strength",
                exercises: [
                    { name: "Squats", sets: difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5, reps: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20 },
                    { name: "Burpees", sets: 3, reps: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 8 : 12 }
                ]
            },
            friday: {
                type: "Cardio & Conditioning",
                exercises: [
                    { name: "Running", distance: difficulty === 'beginner' ? "2km" : difficulty === 'intermediate' ? "3km" : "5km" },
                    { name: "Mountain Climbers", duration: difficulty === 'beginner' ? "30s" : difficulty === 'intermediate' ? "45s" : "60s" }
                ]
            }
        }
    };
    
    // Generate all 8 weeks with progressive overload
    const program = {};
    for (let week = 1; week <= 8; week++) {
        program[`week${week}`] = JSON.parse(JSON.stringify(baseProgram.week1));
        
        // Apply progressive overload
        Object.values(program[`week${week}`]).forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.sets && exercise.reps) {
                    exercise.reps += Math.floor((week - 1) * 0.5);
                }
            });
        });
    }
    
    return program;
}

function generateTacticalAthleteProgram(difficulty) {
    const baseProgram = {
        week1: {
            monday: {
                type: "Functional Strength",
                exercises: [
                    { name: "Push-ups", sets: difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 5 : 6, reps: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20 },
                    { name: "Pull-ups", sets: difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5, reps: difficulty === 'beginner' ? 6 : difficulty === 'intermediate' ? 10 : 15 },
                    { name: "Burpees", sets: 3, reps: difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 12 : 16 }
                ]
            },
            tuesday: {
                type: "Endurance",
                exercises: [
                    { name: "Running", distance: difficulty === 'beginner' ? "3km" : difficulty === 'intermediate' ? "5km" : "8km" },
                    { name: "Mountain Climbers", duration: difficulty === 'beginner' ? "45s" : difficulty === 'intermediate' ? "60s" : "90s" }
                ]
            },
            thursday: {
                type: "Power & Agility",
                exercises: [
                    { name: "Squats", sets: difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 5 : 6, reps: difficulty === 'beginner' ? 12 : difficulty === 'intermediate' ? 18 : 25 },
                    { name: "Burpees", sets: 4, reps: difficulty === 'beginner' ? 6 : difficulty === 'intermediate' ? 10 : 15 },
                    { name: "Plank", duration: difficulty === 'beginner' ? "45s" : difficulty === 'intermediate' ? "60s" : "90s" }
                ]
            },
            saturday: {
                type: "Long Endurance",
                exercises: [
                    { name: "Running", distance: difficulty === 'beginner' ? "5km" : difficulty === 'intermediate' ? "8km" : "12km" }
                ]
            }
        }
    };
    
    const program = {};
    for (let week = 1; week <= 8; week++) {
        program[`week${week}`] = JSON.parse(JSON.stringify(baseProgram.week1));
        
        Object.values(program[`week${week}`]).forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.sets && exercise.reps) {
                    exercise.reps += Math.floor((week - 1) * 0.7);
                }
            });
        });
    }
    
    return program;
}

function generateForceTestPrepProgram(difficulty) {
    const baseProgram = {
        week1: {
            monday: {
                type: "Push-up Focus",
                exercises: [
                    { name: "Push-ups", sets: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 6 : 8, reps: difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 12 : 18 },
                    { name: "Plank", duration: difficulty === 'beginner' ? "60s" : difficulty === 'intermediate' ? "90s" : "120s" }
                ]
            },
            tuesday: {
                type: "Running Focus",
                exercises: [
                    { name: "Running", distance: difficulty === 'beginner' ? "2.4km" : difficulty === 'intermediate' ? "2.4km" : "2.4km" }
                ]
            },
            wednesday: {
                type: "Sit-up Focus",
                exercises: [
                    { name: "Squats", sets: difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 5 : 6, reps: difficulty === 'beginner' ? 15 : difficulty === 'intermediate' ? 20 : 30 },
                    { name: "Plank", duration: difficulty === 'beginner' ? "45s" : difficulty === 'intermediate' ? "75s" : "105s" }
                ]
            },
            friday: {
                type: "Test Simulation",
                exercises: [
                    { name: "Push-ups", sets: 1, reps: "max" },
                    { name: "Running", distance: "2.4km" },
                    { name: "Squats", sets: 1, reps: "max" }
                ]
            }
        }
    };
    
    const program = {};
    for (let week = 1; week <= 8; week++) {
        program[`week${week}`] = JSON.parse(JSON.stringify(baseProgram.week1));
        
        Object.values(program[`week${week}`]).forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.sets && exercise.reps && exercise.reps !== "max") {
                    exercise.reps += Math.floor((week - 1) * 1);
                }
            });
        });
    }
    
    return program;
}

// Make functions globally available for HTML onclick handlers
window.showGoalScreen = showGoalScreen;
window.selectGoal = selectGoal;
window.selectDifficulty = selectDifficulty;
window.toggleWorkoutDetails = toggleWorkoutDetails;
window.startWorkout = startWorkout;
window.closeWorkoutSession = closeWorkoutSession;
window.finishWorkout = finishWorkout;
window.viewWorkoutSummary = viewWorkoutSummary;
window.showExerciseInfo = showExerciseInfo;
window.closeExerciseModal = closeExerciseModal;
window.closeDebriefModal = closeDebriefModal;
window.updateExerciseData = updateExerciseData;
window.updateNotes = updateNotes;
window.switchView = switchView;
window.triggerInstallPrompt = triggerInstallPrompt;