                    }).join('')}
                </div>` : ''}
            </div>`;
        });
        
        html += '</section>';
    });
    
    programContainer.innerHTML = html;
    updateOverallProgress();
    
    // Restore timer states
    Object.keys(timerIntervals).forEach(dayId => {
        const timerState = workoutDetails[dayId]?.timer;
        if (timerState?.running) {
            clearInterval(timerIntervals[dayId]);
            startTimer(dayId, timerState.isStopwatch);
        } else {
            updateTimerButtons(dayId);
        }
    });
    
    // Start workout timers for active workouts
    Object.keys(workoutDetails).forEach(dayId => {
        const workout = workoutDetails[dayId];
        if (workout?.workoutStarted && workout.startTime) {
            startWorkoutTimer(dayId);
        }
    });
    bottomNav.classList.remove('hidden');
};

const showWelcomeMessage = () => {
    const messages = [
        "Welcome to HYBRID OPS. Your transformation begins now.",
        "Ready to push beyond your limits? Let's forge unbreakable strength.",
        "One mission. Unlimited potential. Begin your evolution.",
        "Welcome to the hybrid path. Where strength meets endurance, legends are born."
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const welcomeNote = document.getElementById('welcome-note');
    
    if (welcomeNote) {
        let i = 0;
        const speed = 50; // Typing speed in milliseconds
        welcomeNote.innerHTML = ''; // Clear previous message
        
        const type = () => {
            if (i < message.length) {
                welcomeNote.innerHTML += message.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                welcomeNote.classList.add('typewriter-cursor');
            }
        };
        
        // Delay the typewriter effect until after the pillar animation
        setTimeout(type, 1700);
    }
};

window.showGoalScreen = () => {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('goal-selection').classList.remove('hidden');
    showOnboardingProgress(true);
    setOnboardingStep(1);
    // Reset selection state
    pendingGoal = null;
    const nextBtn = document.getElementById('goal-next-btn');
    if (nextBtn) { nextBtn.disabled = true; nextBtn.classList.remove('cta-strobe'); }
    // Preselect previously chosen goal, if any
    const savedGoal = localStorage.getItem('hybridGoal');
    if (savedGoal) {
        const el = document.getElementById(`goal-${savedGoal}`);
        if (el) chooseGoal(savedGoal, el);
    }
};

// Onboarding Back buttons
// Onboarding Back buttons
window.backToWelcome = () => {
    const hasSetup = !!(localStorage.getItem('hybridGoal') && localStorage.getItem('hybridDifficulty'));
    const goal = document.getElementById('goal-selection');
    if (goal) goal.classList.add('hidden');
    if (hasSetup) {
        // Go to app home when setup is complete
        document.getElementById('welcome-screen')?.classList.add('hidden');
        document.getElementById('difficulty-selection')?.classList.add('hidden');
        document.getElementById('install-screen')?.classList.add('hidden');
        appContent.classList.remove('hidden');
        bottomNav.classList.remove('hidden');
        switchView('home');
        showOnboardingProgress(false);
    } else {
        // Return to intro and re-run welcome note
        const welcome = document.getElementById('welcome-screen');
        if (welcome) welcome.classList.remove('hidden');
        bottomNav.classList.add('hidden');
        showOnboardingProgress(false);
        showWelcomeMessage();
    }
};

window.backToGoalSelection = () => {
    const difficulty = document.getElementById('difficulty-selection');
