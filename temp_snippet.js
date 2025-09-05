    }
    renderProgram();
};

const renderProgram = () => {
    if (!currentProgramData.length) return;
    
    let html = '';
    currentProgramData.forEach((phase, phaseIndex) => {
        html += `<section class="mb-8 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h2 class="text-2xl font-bold mb-4 text-lime-400 font-display uppercase tracking-wider text-glow">${phase.phase}</h2>`;
        
        phase.weeks.forEach((week) => {
            const weekId = `w${week.week}`;
            const isOpen = openWeeks.has(weekId);
            const completedDays = week.days.filter(day => completionStatus[`${week.week}_${day.day}`]).length;
            const progressPercentage = (completedDays / week.days.length) * 100;
            
            html += `<div class="mb-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <button onclick="toggleWeekExpansion('${weekId}')" class="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors rounded-lg">
                    <div>
                        <h3 class="font-semibold text-lime-300 font-display text-lg">Week ${week.week === 0 ? 'Baseline' : week.week}</h3>
                        <div class="mt-2 w-full bg-gray-600 rounded-full h-2">
                            <div class="bg-lime-500 h-2 rounded-full transition-all duration-300" style="width: ${progressPercentage}%"></div>
                        </div>
                        <p class="text-sm text-gray-400 mt-1">${completedDays}/${week.days.length} days complete</p>
                    </div>
                    <svg class="h-6 w-6 text-lime-400 chevron-icon ${isOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                ${isOpen ? `<div class="px-4 pb-4 space-y-3">
                    ${week.days.map(day => {
                        const dayId = `${week.week}_${day.day}`;
                        const isCompleted = completionStatus[dayId];
                        const isToolsOpen = openTools.has(dayId);
                        const timerState = workoutDetails[dayId]?.timer || { time: 0, running: false, isStopwatch: true, initialTime: 0 };
                        const notes = workoutDetails[dayId]?.notes || '';
                        
                        const isWorkoutStarted = workoutDetails[dayId]?.workoutStarted || false;
                        
                        return `<div class="bg-gray-700/50 rounded-lg border-l-4 ${isCompleted ? 'border-lime-500 completed-card' : 'border-gray-600'} p-4 relative" data-day-id="${dayId}">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex items-center space-x-3">
                                    <div class="text-lime-400 flex-shrink-0">${icons[day.icon]}</div>
                                    <div>
                                        <h4 class="font-bold text-white font-display">${day.day.toUpperCase()}</h4>
                                        <p class="text-sm text-lime-300 font-medium">${day.focus}</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-2">
                                    ${!isWorkoutStarted ? `
                                        <button onclick="toggleToolsExpansion('${dayId}')" class="p-2 bg-gray-600/50 hover:bg-gray-500/50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                    ` : ''}
                                    <button onclick="toggleDayCompletion('${dayId}')" class="px-3 py-1 rounded text-sm font-medium transition-colors ${isCompleted ? 'bg-lime-600 text-black' : 'bg-gray-600 text-gray-200 hover:bg-lime-500 hover:text-black'}">
                                        ${isCompleted ? '✓ COMPLETE' : 'MARK DONE'}
                                    </button>
                                </div>
                            </div>
                            
                            ${isCompleted ? `
                                <div class="w-full p-4 bg-lime-600 text-black font-bold text-xl font-display uppercase tracking-widest rounded-lg text-center">COMPLETED</div>
                            ` : (!isWorkoutStarted ? `
                                <div class="text-gray-300 text-sm font-mono mb-3 leading-relaxed">${renderClickableExercises(day.details)}</div>
                                <button onclick="startWorkout('${dayId}')" class="w-full p-4 bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black font-bold text-xl font-display uppercase tracking-widest rounded-lg transition-colors">START WORKOUT</button>
                            ` : `
                                <button onclick="startWorkout('${dayId}')" class="w-full p-4 bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black font-bold text-xl font-display uppercase tracking-widest rounded-lg transition-colors">RESUME WORKOUT</button>
                            `)}
                            ${(!isWorkoutStarted && isToolsOpen) ? `
                            <div class="border-t border-gray-600 pt-3 mt-3 space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Stopwatch -->
                                    <div class="bg-gray-800/50 p-3 rounded-lg">
                                        <h5 class="text-xs font-semibold text-gray-400 uppercase mb-2">Stopwatch</h5>
                                        <div class="text-2xl font-mono text-lime-400 mb-2" id="stopwatch-${dayId}">${formatTime(timerState.isStopwatch ? timerState.time : 0)}</div>
                                        <div class="flex space-x-2">
                                            <button id="timer-start-${dayId}" onclick="startTimer('${dayId}', true)" class="px-2 py-1 bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black rounded text-xs transition-colors" ${timerState.running ? 'style="display: none"' : ''}><img src="icons/play.png" alt="" class="btn-icon"/>Start</button>
                                            <button id="timer-stop-${dayId}" onclick="stopTimer('${dayId}')" class="px-2 py-1 bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded text-xs transition-colors" ${!timerState.running ? 'style="display: none"' : ''}><img src="icons/stop.png" alt="" class="btn-icon"/>Stop</button>
                                            <button onclick="resetTimer('${dayId}', true)" class="px-2 py-1 bg-transparent border-2 border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white rounded text-xs transition-colors"><img src="icons/reset.png" alt="" class="btn-icon"/>Reset</button>
                                        </div>
                                    </div>
                                    <!-- Countdown -->
                                    <div class="bg-gray-800/50 p-3 rounded-lg">
                                        <h5 class="text-xs font-semibold text-gray-400 uppercase mb-2">Countdown</h5>
                                        <div class="text-2xl font-mono text-lime-400 mb-2" id="countdown-${dayId}">${formatTime(!timerState.isStopwatch ? timerState.time : 0)}</div>
                                        <div class="flex space-x-2">
                                            <button onclick="setCountdownTime('${dayId}')" class="px-2 py-1 bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black rounded text-xs transition-colors"><img src="icons/countdown.png" alt="" class="btn-icon"/>Set</button>
                                            <button onclick="startTimer('${dayId}', false)" class="px-2 py-1 bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black rounded text-xs transition-colors"><img src="icons/play.png" alt="" class="btn-icon"/>Start</button>
                                            <button onclick="resetTimer('${dayId}', false)" class="px-2 py-1 bg-transparent border-2 border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white rounded text-xs transition-colors"><img src="icons/reset.png" alt="" class="btn-icon"/>Reset</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 1RM Calculator -->
                                <div class="bg-gray-800/50 p-3 rounded-lg">
                                    <h5 class="text-xs font-semibold text-gray-400 uppercase mb-2">1-Rep Max Calculator</h5>
                                    <div class="grid grid-cols-2 gap-2 mb-2">
                                        <input type="number" id="weight-1rm-${dayId}" placeholder="Weight (${weightUnit})" class="w-full bg-gray-700 text-white text-center text-sm py-2 rounded border-none outline-none focus:bg-gray-600">
                                        <input type="number" id="reps-1rm-${dayId}" placeholder="Reps" class="w-full bg-gray-700 text-white text-center text-sm py-2 rounded border-none outline-none focus:bg-gray-600">
                                    </div>
                                    <button onclick="calculate1RM('${dayId}')" class="w-full px-2 py-1 bg-transparent border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black rounded text-xs transition-colors">Calculate</button>
                                    <p id="result-1rm-${dayId}" class="text-center text-lime-400 font-bold mt-2 h-4"></p>
                                </div>

                                <!-- Weight Unit Selector -->
                                <div>
                                    <h5 class="text-xs font-semibold text-gray-400 uppercase mb-2">Weight Unit</h5>
                                    <div class="flex space-x-2">
                                        <button onclick="selectWeightUnit('lbs')" class="px-4 py-2 rounded text-xs transition-colors ${weightUnit === 'lbs' ? 'bg-lime-500 text-black' : 'bg-gray-600 text-white hover:bg-gray-700'}">LBS</button>
                                        <button onclick="selectWeightUnit('kg')" class="px-4 py-2 rounded text-xs transition-colors ${weightUnit === 'kg' ? 'bg-lime-500 text-black' : 'bg-gray-600 text-white hover:bg-gray-700'}">KG</button>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>`;
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
