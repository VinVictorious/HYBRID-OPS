import {
    formatTime,
    createTimerState,
    startTimer as startTimerUtil,
    stopTimer as stopTimerUtil,
    resetTimer as resetTimerUtil,
    setCountdownTime as setCountdownTimeUtil,
} from './src/utils/timer.js';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(r => console.log('ServiceWorker registration successful.'))
        .catch(e => console.log('ServiceWorker registration failed:', e));
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    updateInstallAvailabilityUI();
});

function triggerInstallPrompt() {
    // Kept for Settings page button; will only show prompt if available
    if (!deferredPrompt) {
        updateInstallAvailabilityUI();
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
        console.log(`User choice: ${choice.outcome}`);
        deferredPrompt = null;
        updateInstallAvailabilityUI();
    });
}

function updateInstallAvailabilityUI() {
    const settingsBtn = document.getElementById('install-app-btn');
    const settingsInstructions = document.getElementById('install-instructions');
    const onboardBtn = document.getElementById('onboarding-install-btn');
    const onboardInstructions = document.getElementById('onboarding-install-instructions');
    const installPageBtn = document.getElementById('install-page-prompt-btn');
    const installPageInstructions = document.getElementById('install-page-instructions');

    const hasPrompt = !!deferredPrompt;

    if (settingsBtn) settingsBtn.classList.toggle('hidden', !hasPrompt);
    if (settingsInstructions) settingsInstructions.classList.toggle('hidden', hasPrompt);
    if (onboardBtn) onboardBtn.classList.toggle('hidden', !hasPrompt);
    if (onboardInstructions) onboardInstructions.classList.toggle('hidden', hasPrompt);
    if (installPageBtn) installPageBtn.classList.toggle('hidden', !hasPrompt);
    if (installPageInstructions) installPageInstructions.classList.toggle('hidden', hasPrompt);

    // Render platform-specific guidance when prompt is not available
    if (!hasPrompt) {
      renderPlatformInstructions(document.getElementById('onboarding-install-instructions'));
      renderPlatformInstructions(document.getElementById('install-platform-instructions'));
    }
}

function isAppInstalled() {
  try {
    return (
      window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
    ) || window.navigator.standalone === true || (document.referrer || '').startsWith('android-app://');
  } catch (_) {
    return false;
  }
}

function updateInstalledBanner() {
  const banner = document.getElementById('install-page-installed');
  const btn = document.getElementById('install-page-prompt-btn');
  const instructions = document.getElementById('install-page-instructions');
  const installed = isAppInstalled();
  if (banner) banner.classList.toggle('hidden', !installed);
  if (btn) btn.classList.toggle('hidden', installed);
  if (instructions) instructions.classList.toggle('hidden', installed);
}

// --- Platform detection and tailored instructions ---
function detectPlatform() {
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isEdge = /edg\//.test(ua);
  const isChrome = /chrome\//.test(ua) && !isEdge && !/crios|fxios/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|edg/.test(ua);

  if (isIOS && isSafari) return 'ios-safari';
  if (isAndroid && /cr|chrome/.test(ua)) return 'android-chrome';
  if (isEdge) return 'desktop-edge';
  if (isChrome) return 'desktop-chrome';
  return 'other';
}

function instructionHTMLFor(platform) {
  const appName = 'HYBRID OPS';
  const domain = location.hostname || 'hybrid-ops.app';
  const card = `
    <div class="bg-gray-900/60 border border-gray-700 rounded-lg p-4 mb-3 flex items-center space-x-3">
      <img src="icons/app-icon-192.png" alt="App" class="w-8 h-8 rounded"/>
      <div>
        <div class="text-white font-semibold">${appName}</div>
        <div class="text-gray-400 text-xs">${domain}</div>
      </div>
    </div>`;

  if (platform === 'ios-safari') {
    return `${card}
      <ol class="list-decimal ml-5 space-y-2 text-gray-300">
        <li>Tap <img src="icons/share.svg" alt="Share" class="inline w-5 h-5 align-text-bottom"/> in the Safari toolbar.</li>
        <li>Scroll and select <span class="px-2 py-0.5 border border-gray-500 rounded text-gray-200">Add to Home Screen</span>.</li>
        <li>Find <span class="font-semibold">${appName}</span> on your Home Screen <img src="icons/home.svg" alt="Home" class="inline w-5 h-5 align-text-bottom"/>.</li>
      </ol>`;
  }
  if (platform === 'android-chrome') {
    return `${card}
      <ol class="list-decimal ml-5 space-y-2 text-gray-300">
        <li>Tap the menu <img src="icons/menu.svg" alt="Menu" class="inline w-5 h-5 align-text-bottom"/> in the top-right.</li>
        <li>Choose <span class="px-2 py-0.5 border border-gray-500 rounded text-gray-200">Install app</span> or <span class="px-2 py-0.5 border border-gray-500 rounded text-gray-200">Add to Home screen</span>.</li>
        <li>Confirm, then launch from your Home Screen <img src="icons/home.svg" alt="Home" class="inline w-5 h-5 align-text-bottom"/>.</li>
      </ol>`;
  }
  if (platform === 'desktop-chrome' || platform === 'desktop-edge') {
    return `${card}
      <ol class="list-decimal ml-5 space-y-2 text-gray-300">
        <li>Click the <span class="px-2 py-0.5 border border-gray-500 rounded text-gray-200">Install</span> icon near the address bar.</li>
        <li>Confirm <span class="px-2 py-0.5 border border-gray-500 rounded text-gray-200">Install</span>.</li>
        <li>Launch ${appName} from your apps list.</li>
      </ol>`;
  }
  return `${card}
    <p class="text-gray-300">Use your browser's menu to install or add to Home Screen.</p>`;
}

function renderPlatformInstructions(container) {
  if (!container) return;
  const platform = detectPlatform();
  container.innerHTML = instructionHTMLFor(platform);
}

const icons = {
    strength: `<img src="icons/strength.png" alt="Strength" class="program-icon"/>`,
    run: `<img src="icons/run.png" alt="Run" class="program-icon"/>`,
    circuit: `<img src="icons/circuit.png" alt="Circuit" class="program-icon"/>`,
    mobility: `<img src="icons/mobility.png" alt="Mobility" class="program-icon"/>`,
    recovery: `<img src="icons/recovery.png" alt="Recovery" class="program-icon"/>`,
    test: `<img src="icons/test.png" alt="Test" class="program-icon"/>`
};

const completionMessages = [
    "Mission complete! Excellent work.",
    "Workout complete—stay relentless.",
    "Great job! Training session accomplished.",
    "You crushed it. Keep the momentum.",
    "Workout done. Victory in sight."
];

const baselinePhase = {
    phase: "Baseline Assessment",
    weeks: [{
        week: 0,
        days: [{
            day: "Start",
            focus: "Baseline Fitness Test",
            details: "This initial assessment establishes your starting fitness level. It provides a crucial benchmark to measure your progress against throughout the program. Give it your all.<br><br>Perform each test with max effort:<br>- Max Push-ups in 2 minutes<br>- Max Sit-ups in 2 minutes<br>- 1.5 Mile Run for time",
            icon: "test"
        }]
    }]
};

const hybridAthleteProgram = {
    getIntermediate: () => [
        baselinePhase,
        { phase: "Mission 1: Foundation", weeks: [ { week: 1, days: [ { day: "Mon", focus: "Strength Push", details: "Bench Press: 5x5<br>Overhead Press (OHP): 4x6<br>Dips: 3x10-12<br>Lateral Raises: 3x15<br>Tricep Pushdowns: 3x12", icon: "strength" }, { day: "Tue", focus: "Run (Easy)", details: "3-5km conversational pace.", icon: "run" }, { day: "Wed", focus: "Strength Pull", details: "Deadlift: 5x5<br>Pull-ups: 4x8<br>Barbell Rows: 3x10<br>Face Pulls: 3x15<br>Bicep Curls: 3x12", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching, foam rolling.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit", details: "3 Rounds:<br>- 15 Push-ups<br>- 10 Burpees<br>- 20 Air Squats<br>- 60s Plank<br>- 50 Jumping Jacks", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "8-10km steady pace.", icon: "run" }, { day: "Sun", focus: "Active Recovery", details: "30-45 min walk.", icon: "recovery" } ] }, { week: 2, days: [ { day: "Mon", focus: "Strength Push", details: "Bench Press: 5x5<br>Overhead Press (OHP): 4x6<br>Dips: 3x12-15<br>Lateral Raises: 3x15<br>Tricep Pushdowns: 3x12", icon: "strength" }, { day: "Tue", focus: "Run (Easy)", details: "4-5km conversational pace.", icon: "run" }, { day: "Wed", focus: "Strength Pull", details: "Deadlift: 5x5<br>Pull-ups: 4x8-10<br>Barbell Rows: 3x10<br>Face Pulls: 3x15<br>Bicep Curls: 3x12", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching, foam rolling.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit", details: "3 Rounds (faster):<br>- 15 Push-ups<br>- 10 Burpees<br>- 20 Air Squats<br>- 60s Plank<br>- 50 Jumping Jacks", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "8-10km steady pace.", icon: "run" }, { day: "Sun", focus: "Active Recovery", details: "30-45 min walk.", icon: "recovery" } ] } ] },
        { phase: "Mission 2: Intensification", weeks: [ { week: 3, days: [ { day: "Mon", focus: "Strength Push", details: "Bench Press: 4x6-8<br>Incline DB Press: 4x8<br>OHP: 4x8<br>Cable Flyes: 3x12<br>Skull Crushers: 3x10", icon: "strength" }, { day: "Tue", focus: "Run (Intervals)", details: "1km Warm-up<br>6x400m sprints<br>1km Cool-down", icon: "run" }, { day: "Wed", focus: "Strength Pull", details: "Deadlift: 4x6-8<br>Weighted Pull-ups: 4x6<br>T-Bar Rows: 4x10<br>Lat Pulldowns: 3x12<br>Hammer Curls: 3x10", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit", details: "4 Rounds:<br>- 10 DB Thrusters<br>- 15 KB Swings<br>- 10 Box Jumps<br>- 40 Mountain Climbers<br>- 20 Russian Twists", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "10-12km steady pace.", icon: "run" }, { day: "Sun", focus: "Active Recovery", details: "30-45 min walk.", icon: "recovery" } ] }, { week: 4, days: [ { day: "Mon", focus: "Strength Push", details: "Bench Press: 4x6-8<br>Incline DB Press: 4x8<br>OHP: 4x8<br>Cable Flyes: 3x12<br>Skull Crushers: 3x10", icon: "strength" }, { day: "Tue", focus: "Run (Intervals)", details: "1km Warm-up<br>8x400m sprints<br>1km Cool-down", icon: "run" }, { day: "Wed", focus: "Strength Pull", details: "Deadlift: 4x6-8<br>Weighted Pull-ups: 4x6<br>T-Bar Rows: 4x10<br>Lat Pulldowns: 3x12<br>Hammer Curls: 3x10", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit", details: "4 Rounds (faster):<br>- 10 DB Thrusters<br>- 15 KB Swings<br>- 10 Box Jumps<br>- 40 Mountain Climbers<br>- 20 Russian Twists", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "10-12km steady pace.", icon: "run" }, { day: "Sun", focus: "Active Recovery", details: "30-45 min walk.", icon: "recovery" } ] } ] },
        { phase: "Mission 3: Performance", weeks: [ { week: 5, days: [ { day: "Mon", focus: "Strength Push", details: "Bench Press: 3x8-10<br>OHP: 3x10<br>DB Flyes: 3x12<br>Arnold Press: 3x12<br>Rope Tricep Extensions: 3x15", icon: "strength" }, { day: "Tue", focus: "Run (Tempo)", details: "1km Warm-up<br>3km Tempo<br>1km Cool-down", icon: "run" }, { day: "Wed", focus: "Strength Pull", details: "Deadlift: 3x8-10<br>Pull-ups: 3xMax<br>Seated Rows: 3x12<br>Single Arm DB Rows: 3x10/arm<br>Preacher Curls: 3x12", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit", details: "AMRAP 15 mins:<br>- 5 Burpees<br>- 10 Wall Balls<br>- 15 Sit-ups<br>- 20 Double Unders<br>- 250m Row", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "12-15km steady pace.", icon: "run" }, { day: "Sun", focus: "Active Recovery", details: "30-45 min walk.", icon: "recovery" } ] }, { week: 6, days: [ { day: "Mon", focus: "Strength Push", details: "Bench Press: 3x8-10<br>OHP: 3x10<br>DB Flyes: 3x12<br>Arnold Press: 3x12<br>Rope Tricep Extensions: 3x15", icon: "strength" }, { day: "Tue", focus: "Run (Tempo)", details: "1km Warm-up<br>4km Tempo<br>1km Cool-down", icon: "run" }, { day: "Wed", focus: "Strength Pull", details: "Deadlift: 3x8-10<br>Pull-ups: 3xMax<br>Seated Rows: 3x12<br>Single Arm DB Rows: 3x10/arm<br>Preacher Curls: 3x12", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit", details: "AMRAP 15 mins:<br>Beat last score!", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "12-15km steady pace.", icon: "run" }, { day: "Sun", focus: "Active Recovery", details: "30-45 min walk.", icon: "recovery" } ] } ] },
        { phase: "Mission 4: Final Test", weeks: [ { week: 7, days: [ { day: "Mon", focus: "Strength (Deload)", details: "All lifts @ 60% weight", icon: "strength" }, { day: "Tue", focus: "Run (Deload)", details: "3km Easy Run", icon: "run" }, { day: "Wed", focus: "Strength (Deload)", details: "Light Lat Pulldowns: 3x15<br>Light Bicep Curls: 3x15<br>Band Pull-aparts: 3x20<br>Hanging Knee Raises: 3x15<br>Back Extensions: 3x15", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Rest", details: "Complete rest.", icon: "mobility" }, { day: "Sat", focus: "Rest", details: "Complete rest.", icon: "mobility" }, { day: "Sun", focus: "Active Recovery", details: "Light walk.", icon: "recovery" } ] }, { week: 8, days: [ { day: "Mon", focus: "Strength (Test)", details: "Test 1-Rep Max: Bench & OHP<br>Test Max Reps: Dips", icon: "test" }, { day: "Tue", focus: "Run (Test)", details: "Test fastest 5km time", icon: "test" }, { day: "Wed", focus: "Strength (Test)", details: "Test 1-Rep Max: Deadlift<br>Test Max Reps: Pull-ups", icon: "test" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Hybrid Circuit (Test)", details: "Week 1 Circuit for time:<br>- 15 Push-ups<br>- 10 Burpees<br>- 20 Air Squats<br>- 60s Plank<br>- 50 Jumping Jacks", icon: "test" }, { day: "Sat", focus: "Long Run (Test)", details: "10km Run for time", icon: "test" }, { day: "Sun", focus: "Mission Accomplished", details: "Mandatory Rest.", icon: "recovery" } ] } ] }
    ],
    getBeginner: function() { return JSON.parse(JSON.stringify(this.getIntermediate())).map(phase => {
        phase.weeks.forEach(week => {
            week.days.forEach(day => {
                if (day.focus.includes("Strength")) { day.details = day.details.replace(/5x5/g, '3x8-10').replace(/4x6/g, '3x10').replace(/3x10-12/g, '3xMax (Knee Push-ups)').replace(/4x8/g, '3x10 (Lat Pulldowns)'); } 
                else if (day.focus.includes("Run")) { day.details = day.details.replace(/3-5km/g, '2-3km').replace(/8-10km/g, '5km').replace(/10-12km/g, '6-7km').replace(/12-15km/g, '8km').replace(/6x400m/g, '4x400m').replace(/8x400m/g, '6x400m'); } 
                else if (day.focus.includes("Circuit")) { day.details = day.details.replace(/15 Push-ups/g, '10 Incline Push-ups').replace(/10 Burpees/g, '5 Burpees'); }
            });
        });
        return phase;
    })},
    getAdvanced: function() { return JSON.parse(JSON.stringify(this.getIntermediate())).map(phase => {
        phase.weeks.forEach(week => {
            week.days.forEach(day => {
                if (day.focus.includes("Strength")) { day.details = day.details.replace(/5x5/g, '5x5 (Heavy)').replace(/4x6/g, '5x5').replace(/Dips/g, 'Weighted Dips'); } 
                else if (day.focus.includes("Run")) { day.details = day.details.replace(/3-5km/g, '5-7km').replace(/8-10km/g, '12-15km').replace(/10-12km/g, '15km').replace(/12-15km/g, '18-20km').replace(/6x400m/g, '8x400m').replace(/8x400m/g, '10x400m'); } 
                else if (day.focus.includes("Circuit")) { day.details = day.details.replace(/3 Rounds/g, '5 Rounds').replace(/15 Push-ups/g, '20 Push-ups').replace(/10 Burpees/g, '15 Burpees'); }
            });
        });
        return phase;
    })}
};

const tacticalAthleteProgram = {
    getIntermediate: () => [
        baselinePhase,
        // This will be a 12 week program
        { phase: "Phase 1: Foundational Strength", weeks: [ { week: 1, days: [ { day: "Mon", focus: "Strength", details: "Back Squat: 4x8<br>Shoulder Press: 4x8<br>Upright Row: 3x10", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "3km Run", icon: "run" }, { day: "Wed", focus: "Strength", details: "Deadlift: 4x8<br>Kettlebell Swing: 4x15<br>Rope Climb: 3 attempts", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Work Capacity", details: "Body Weight Squat: 3x20<br>Box Jumps: 3x10", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "5km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 2, days: [ { day: "Mon", focus: "Strength", details: "Back Squat: 4x8<br>Shoulder Press: 4x8<br>Upright Row: 3x10", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "3km Run", icon: "run" }, { day: "Wed", focus: "Strength", details: "Deadlift: 4x8<br>Kettlebell Swing: 4x15<br>Rope Climb: 3 attempts", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Work Capacity", details: "Body Weight Squat: 3x25<br>Box Jumps: 3x12", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "5km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 3, days: [ { day: "Mon", focus: "Strength", details: "Back Squat: 5x5<br>Shoulder Press: 5x5<br>Upright Row: 3x12", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "4km Run", icon: "run" }, { day: "Wed", focus: "Strength", details: "Deadlift: 5x5<br>Kettlebell Swing: 4x20<br>Rope Climb: 4 attempts", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Work Capacity", details: "Body Weight Squat: 3x30<br>Box Jumps: 3x15", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "6km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 4, days: [ { day: "Mon", focus: "Strength", details: "Back Squat: 5x5<br>Shoulder Press: 5x5<br>Upright Row: 3x12", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "4km Run", icon: "run" }, { day: "Wed", focus: "Strength", details: "Deadlift: 5x5<br>Kettlebell Swing: 4x20<br>Rope Climb: 4 attempts", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Work Capacity", details: "Body Weight Squat: 3xMax<br>Box Jumps: 3xMax", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "6km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] } ] },
        { phase: "Phase 2: Strength & Power", weeks: [ { week: 5, days: [ { day: "Mon", focus: "Strength", details: "Front Squat: 4x6<br>Push Press: 4x6<br>Romanian Deadlift: 3x8", icon: "strength" }, { day: "Tue", focus: "Intervals", details: "8x400m sprints", icon: "run" }, { day: "Wed", focus: "Power", details: "Hang Clean High Pull: 5x3<br>Thruster: 4x8", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "SAQ", details: "Speed, Agility, Quickness Drills", icon: "circuit" }, { day: "Sat", focus: "Tempo Run", details: "4km Tempo Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 6, days: [ { day: "Mon", focus: "Strength", details: "Front Squat: 4x6<br>Push Press: 4x6<br>Romanian Deadlift: 3x8", icon: "strength" }, { day: "Tue", focus: "Intervals", details: "8x400m sprints", icon: "run" }, { day: "Wed", focus: "Power", details: "Hang Clean High Pull: 5x3<br>Thruster: 4x8", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "SAQ", details: "Speed, Agility, Quickness Drills", icon: "circuit" }, { day: "Sat", focus: "Tempo Run", details: "4km Tempo Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 7, days: [ { day: "Mon", focus: "Strength", details: "Front Squat: 5x4<br>Push Press: 5x4<br>Romanian Deadlift: 3x10", icon: "strength" }, { day: "Tue", focus: "Intervals", details: "10x400m sprints", icon: "run" }, { day: "Wed", focus: "Power", details: "Hang Clean High Pull: 5x3<br>Thruster: 4x10", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "SAQ", details: "Speed, Agility, Quickness Drills", icon: "circuit" }, { day: "Sat", focus: "Tempo Run", details: "5km Tempo Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 8, days: [ { day: "Mon", focus: "Strength", details: "Front Squat: 5x4<br>Push Press: 5x4<br>Romanian Deadlift: 3x10", icon: "strength" }, { day: "Tue", focus: "Intervals", details: "10x400m sprints", icon: "run" }, { day: "Wed", focus: "Power", details: "Hang Clean High Pull: 5x3<br>Thruster: 4x10", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "SAQ", details: "Speed, Agility, Quickness Drills", icon: "circuit" }, { day: "Sat", focus: "Tempo Run", details: "5km Tempo Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] } ] },
        { phase: "Phase 3: Peak Performance", weeks: [ { week: 9, days: [ { day: "Mon", focus: "Power", details: "Overhead Squat: 3x5<br>Power Hang Clean: 5x3", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "Hill Sprints: 8 reps", icon: "run" }, { day: "Wed", focus: "Strength", details: "Sumo Deadlift: 3x5<br>Clean High Pull: 4x3", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Explosiveness", details: "Drop Squat: 3x5<br>Box Jumps: 5x5", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "8km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 10, days: [ { day: "Mon", focus: "Power", details: "Overhead Squat: 3x5<br>Power Hang Clean: 5x3", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "Hill Sprints: 8 reps", icon: "run" }, { day: "Wed", focus: "Strength", details: "Sumo Deadlift: 3x5<br>Clean High Pull: 4x3", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Explosiveness", details: "Drop Squat: 3x5<br>Box Jumps: 5x5", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "8km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 11, days: [ { day: "Mon", focus: "Power", details: "Overhead Squat: 3x3<br>Power Hang Clean: 5x2", icon: "strength" }, { day: "Tue", focus: "Conditioning", details: "Hill Sprints: 10 reps", icon: "run" }, { day: "Wed", focus: "Strength", details: "Sumo Deadlift: 3x3<br>Clean High Pull: 4x2", icon: "strength" }, { day: "Thu", focus: "Rest / Mobility", details: "Full body stretching.", icon: "mobility" }, { day: "Fri", focus: "Explosiveness", details: "Drop Squat: 3x3<br>Box Jumps: 5x3", icon: "circuit" }, { day: "Sat", focus: "Long Run", details: "10km Run", icon: "run" }, { day: "Sun", focus: "Recovery", details: "Active recovery walk.", icon: "recovery" } ] }, { week: 12, days: [ { day: "Mon", focus: "Deload", details: "Light mobility work", icon: "mobility" }, { day: "Tue", focus: "Deload", details: "2km Easy Run", icon: "run" }, { day: "Wed", focus: "Deload", details: "Light Bodyweight Circuit", icon: "circuit" }, { day: "Thu", focus: "Rest", details: "Complete rest.", icon: "recovery" }, { day: "Fri", focus: "Test Day 1", details: "Test Max Back Squat<br>Test Max Deadlift", icon: "test" }, { day: "Sat", focus: "Test Day 2", details: "Test Max 5km Run<br>Test Max Box Jumps in 1 min", icon: "test" }, { day: "Sun", focus: "Mission Accomplished", details: "Mandatory Rest.", icon: "recovery" } ] } ] }
    ],
    getBeginner: function() { return JSON.parse(JSON.stringify(this.getIntermediate())).map(phase => {
        phase.weeks.forEach(week => {
            week.days.forEach(day => {
                if (day.details.includes("5x5")) { day.details = day.details.replace(/5x5/g, '3x8'); }
                if (day.details.includes("4x6")) { day.details = day.details.replace(/4x6/g, '3x10'); }
                if (day.details.includes("5x3")) { day.details = day.details.replace(/5x3/g, '3x5'); }
            });
        });
        return phase;
    })},
    getAdvanced: function() { return JSON.parse(JSON.stringify(this.getIntermediate())).map(phase => {
        phase.weeks.forEach(week => {
            week.days.forEach(day => {
                if (day.details.includes("5x5")) { day.details = day.details.replace(/5x5/g, '5x5 (Heavy)'); }
                if (day.details.includes("4x6")) { day.details = day.details.replace(/4x6/g, '5x5'); }
                if (day.details.includes("5x3")) { day.details = day.details.replace(/5x3/g, '6x2 (Explosive)'); }
            });
        });
        return phase;
    })}
};

const forceTestPrepProgram = {
    getIntermediate: () => [
        baselinePhase,
        { phase: "Phase 1: Foundation Building", weeks: [ 
            { week: 1, days: [ 
                { day: "Mon", focus: "20m Rushes Prep", details: "3 Rounds:<br>- 5 Hand Release Burpees<br>- 10 Mountain Lunges<br>- 10s Sprint / 20s Rest x3", icon: "circuit" }, 
                { day: "Tue", focus: "Strength & Easy Run", details: "Barbell Squats: 3x8-10<br>Romanian Deadlifts: 3x10<br>Followed by:<br>2km Easy Run", icon: "strength" }, 
                { day: "Wed", focus: "Sandbag Lift Prep", details: "3 Rounds:<br>- 5 Sandbag Deadlifts<br>- 10 Sandbag Front Squats<br>- 15 Sandbag Cleans", icon: "strength" }, 
                { day: "Thu", focus: "Tempo Run", details: "1km Warm-up<br>2km @ Tempo Pace<br>1km Cool-down", icon: "run" }, 
                { day: "Fri", focus: "Shuttle & Drag Prep", details: "4 Rounds:<br>- 40m Farmers Walk<br>- 10m Fwd/Bwd Sprint", icon: "circuit" }, 
                { day: "Sat", focus: "Long Run", details: "5km Steady Pace", icon: "run" }, 
                { day: "Sun", focus: "Recovery", details: "Active recovery walk and mobility.", icon: "recovery" } 
            ] },
            { week: 2, days: [ 
                { day: "Mon", focus: "20m Rushes Prep", details: "3 Rounds:<br>- 6 Hand Release Burpees<br>- 12 Mountain Lunges<br>- 10s Sprint / 20s Rest x4", icon: "circuit" }, 
                { day: "Tue", focus: "Strength & Easy Run", details: "Barbell Squats: 4x6-8<br>Romanian Deadlifts: 3x12<br>Followed by:<br>3km Easy Run", icon: "strength" }, 
                { day: "Wed", focus: "Sandbag Lift Prep", details: "3 Rounds:<br>- 6 Sandbag Deadlifts<br>- 12 Sandbag Front Squats<br>- 18 Sandbag Cleans", icon: "strength" }, 
                { day: "Thu", focus: "Interval Run", details: "1km Warm-up<br>4x400m Sprints<br>1km Cool-down", icon: "run" }, 
                { day: "Fri", focus: "Shuttle & Drag Prep", details: "5 Rounds:<br>- 40m Farmers Walk<br>- 10m Fwd/Bwd Sprint", icon: "circuit" }, 
                { day: "Sat", focus: "Long Run", details: "5km Steady Pace", icon: "run" }, 
                { day: "Sun", focus: "Recovery", details: "Active recovery walk and mobility.", icon: "recovery" } 
            ] } 
        ] },
        { phase: "Phase 2: Building Capacity", weeks: [ 
            { week: 3, days: [ 
                { day: "Mon", focus: "20m Rushes Simulation", details: "4 Rounds:<br>- 7 Hand Release Burpees<br>- 15 Mountain Lunges<br>- 10s Sprint / 20s Rest x5", icon: "test" }, 
                { day: "Tue", focus: "Strength & Easy Run", details: "Barbell Squats: 5x5<br>Good Mornings: 3x10<br>Followed by:<br>3km Easy Run", icon: "strength" }, 
                { day: "Wed", focus: "Sandbag Lift Simulation", details: "4 Rounds:<br>- 7 Sandbag Deadlifts<br>- 12 Sandbag Front Squats<br>- 15 Sandbag Cleans", icon: "test" }, 
                { day: "Thu", focus: "Tempo Run", details: "1km Warm-up<br>3km @ Tempo Pace<br>1km Cool-down", icon: "run" }, 
                { day: "Fri", focus: "Shuttle & Drag Simulation", details: "6 Rounds for Time:<br>- 40m Farmers Walk<br>- 10m Fwd/Bwd Sprint", icon: "test" }, 
                { day: "Sat", focus: "Long Run", details: "6km Steady Pace", icon: "run" }, 
                { day: "Sun", focus: "Recovery", details: "Active recovery walk and mobility.", icon: "recovery" } 
            ] },
            { week: 4, days: [ 
                { day: "Mon", focus: "20m Rushes Simulation", details: "5 Rounds:<br>- 7 Hand Release Burpees<br>- 20 Mountain Lunges<br>- 10s Sprint / 20s Rest x5", icon: "test" }, 
                { day: "Tue", focus: "Strength & Easy Run", details: "Barbell Squats: 5x5 (Heavier)<br>Good Mornings: 3x12<br>Followed by:<br>4km Easy Run", icon: "strength" }, 
                { day: "Wed", focus: "Sandbag Lift Simulation", details: "5 Rounds:<br>- 5 Sandbag Deadlifts<br>- 10 Sandbag Front Squats<br>- 15 Sandbag Cleans (Faster)", icon: "test" }, 
                { day: "Thu", focus: "Interval Run", details: "1km Warm-up<br>6x400m Sprints<br>1km Cool-down", icon: "run" }, 
                { day: "Fri", focus: "Shuttle & Drag Simulation", details: "8 Rounds for Time:<br>- 40m Farmers Walk<br>- 10m Fwd/Bwd Sprint", icon: "test" }, 
                { day: "Sat", focus: "Long Run", details: "7km Steady Pace", icon: "run" }, 
                { day: "Sun", focus: "Recovery", details: "Active recovery walk and mobility.", icon: "recovery" } 
            ] } 
        ] },
        { phase: "Phase 3: Performance Peaking", weeks: [ 
            { week: 5, days: [ 
                { day: "Mon", focus: "Full Test Simulation", details: "Perform all 4 FORCE evaluation events back-to-back. Record times.", icon: "test" }, 
                { day: "Tue", focus: "Strength", details: "Front Squats: 3x5<br>Kettlebell Swings: 5x20", icon: "strength" }, 
                { day: "Wed", focus: "Active Recovery Run", details: "3km Easy Run & mobility.", icon: "recovery" }, 
                { day: "Thu", focus: "Tempo Run", details: "1km Warm-up<br>4km @ Tempo Pace<br>1km Cool-down", icon: "run" }, 
                { day: "Fri", focus: "Full Test Simulation", details: "Perform all 4 FORCE evaluation events back-to-back. Beat previous times.", icon: "test" }, 
                { day: "Sat", focus: "Long Run", details: "8km Steady Pace", icon: "run" }, 
                { day: "Sun", focus: "Recovery", details: "Active recovery walk and mobility.", icon: "recovery" } 
            ] },
            { week: 6, days: [ 
                { day: "Mon", focus: "Component Practice", details: "Practice your weakest event for 20-30 minutes.", icon: "circuit" }, 
                { day: "Tue", focus: "Strength", details: "Overhead Squats: 3x8<br>Pull-ups: 3xMax", icon: "strength" }, 
                { day: "Wed", focus: "Active Recovery Run", details: "3-4km Easy Run & mobility.", icon: "recovery" }, 
                { day: "Thu", focus: "Interval Run", details: "1km Warm-up<br>8x400m Sprints<br>1km Cool-down", icon: "run" }, 
                { day: "Fri", focus: "Component Practice", details: "Practice your second weakest event for 20-30 minutes.", icon: "circuit" }, 
                { day: "Sat", focus: "Long Run", details: "8km Steady Pace", icon: "run" }, 
                { day: "Sun", focus: "Recovery", details: "Active recovery walk and mobility.", icon: "recovery" } 
            ] } 
        ] },
        { phase: "Phase 4: Taper & Test", weeks: [ 
            { week: 7, days: [ 
                { day: "Mon", focus: "Light Skill Work", details: "Light practice of all 4 events. Low intensity.", icon: "mobility" }, 
                { day: "Tue", focus: "Easy Run", details: "3km Easy Run", icon: "run" }, 
                { day: "Wed", focus: "Light Mobility", details: "Full body stretching.", icon: "mobility" }, 
                { day: "Thu", focus: "Rest", details: "Complete rest.", icon: "recovery" }, 
                { day: "Fri", focus: "Easy Run", details: "2km Easy Run, very light", icon: "run" }, 
                { day: "Sat", focus: "MOCK TEST DAY", details: "Perform the full FORCE Evaluation. Give it your all.", icon: "test" }, 
                { day: "Sun", focus: "Mission Accomplished", details: "Mandatory Rest.", icon: "recovery" } 
            ] },
            { week: 8, days: [ 
                { day: "Mon", focus: "Post-Test Recovery", details: "Active recovery walk.", icon: "recovery" },
                { day: "Tue", focus: "Post-Test Recovery", details: "Light stretching and mobility.", icon: "mobility" },
                { day: "Wed", focus: "Post-Test Recovery", details: "Active recovery walk.", icon: "recovery" },
                { day: "Thu", focus: "Post-Test Recovery", details: "Light stretching and mobility.", icon: "mobility" },
                { day: "Fri", focus: "Post-Test Recovery", details: "Active recovery walk.", icon: "recovery" },
                { day: "Sat", focus: "Post-Test Recovery", details: "Light stretching and mobility.", icon: "mobility" },
                { day: "Sun", focus: "Program Complete", details: "Congratulations!", icon: "test" }
            ] } 
        ] }
    ],
    getBeginner: function() { return JSON.parse(JSON.stringify(this.getIntermediate())).map(phase => {
        phase.weeks.forEach(week => { week.days.forEach(day => { if (day.details.includes("3 Rounds")) { day.details = day.details.replace(/3 Rounds/g, '2 Rounds'); } if (day.details.includes("5 Rounds")) { day.details = day.details.replace(/5 Rounds/g, '3 Rounds'); } if (day.focus.includes("Run")) { day.details = day.details.replace(/5km/g, '3km').replace(/6km/g, '4km').replace(/8km/g, '5km'); } }); });
        return phase;
    })},
    getAdvanced: function() { return JSON.parse(JSON.stringify(this.getIntermediate())).map(phase => {
        phase.weeks.forEach(week => { week.days.forEach(day => { if (day.details.includes("3 Rounds")) { day.details = day.details.replace(/3 Rounds/g, '4 Rounds'); } if (day.details.includes("5 Rounds")) { day.details = day.details.replace(/5 Rounds/g, '6 Rounds'); } if (day.focus.includes("Run")) { day.details = day.details.replace(/5km/g, '7km').replace(/6km/g, '8km').replace(/8km/g, '10km'); } }); });
        return phase;
    })}
};

const exerciseLibrary = {
    'Bench Press': {
        description: 'A foundational upper-body exercise that primarily targets the pectoral muscles, as well as the anterior deltoids and triceps.',
        cues: [
            'Lie flat on the bench with your feet firmly on the floor.',
            'Grip the bar slightly wider than shoulder-width.',
            'Lower the bar to your mid-chest, keeping your elbows tucked at a 45-degree angle.',
            'Press the bar back up explosively to the starting position.'
        ],
        mistakes: [
            'Bouncing the bar off your chest.',
            'Flaring your elbows out too wide.',
            'Lifting your hips off the bench during the press.'
        ]
    },
    'Deadlift': {
        description: 'A full-body strength exercise that involves lifting a loaded barbell off the floor from a bent-over position.',
        cues: [
            'Stand with your mid-foot under the barbell.',
            'Hinge at your hips and grip the bar just outside your shins.',
            'Keep your back straight, chest up, and shoulders back.',
            'Drive through your heels to lift the weight, keeping the bar close to your body.'
        ],
        mistakes: [
            'Rounding your lower back.',
            'Jerking the weight off the floor.',
            'Letting the bar drift away from your body.'
        ]
    },
    'Back Squat': {
        description: 'A fundamental lower-body exercise that targets the quadriceps, hamstrings, glutes, and core.',
        cues: [
            'Place the barbell across your upper back, not on your neck.',
            'Stand with your feet shoulder-width apart, toes pointed slightly out.',
            'Initiate the movement by hinging at your hips and then bending your knees.',
            'Keep your chest up and your core braced as you lower into the squat.',
            'Drive through your heels to return to the starting position.'
        ],
        mistakes: [
            'Letting your knees collapse inward.',
            'Leaning too far forward.',
            'Not squatting to at least parallel depth.'
        ]
    },
     'Overhead Press (OHP)': {
        description: 'A key upper-body strength exercise that targets the shoulders (deltoids), triceps, and upper chest.',
        cues: [
            'Grip the bar just outside shoulder-width, with the bar resting on your upper chest.',
            'Keep your core tight and glutes squeezed to create a stable base.',
            'Press the bar directly overhead in a straight line.',
            'Slightly move your head back to clear a path for the bar, then press your head "through the window" at the top.',
            'Lower the bar under control to the starting position.'
        ],
        mistakes: [
            'Using your legs to push the weight (turning it into a push press).',
            'Arching your lower back excessively.',
            'Pressing the bar out in front of you instead of straight up.'
        ]
    },
    'Shoulder Press': {
        description: 'A key upper-body strength exercise that targets the shoulders (deltoids), triceps, and upper chest. Can be performed with a barbell or dumbbells.',
        cues: [
            'Sit or stand with the weight at shoulder height, palms facing forward.',
            'Keep your core tight and maintain a neutral spine.',
            'Press the weight directly overhead until your arms are fully extended.',
            'Lower the weight under control to the starting position.'
        ],
        mistakes: [
            'Arching your lower back excessively.',
            'Not using a full range of motion.',
            'Pressing the weight forward instead of straight up.'
        ]
    },
    'Pull-ups': {
        description: 'A challenging upper-body exercise that primarily targets the latissimus dorsi (lats) and biceps.',
        cues: [
            'Grip the bar with your hands slightly wider than shoulder-width, palms facing away.',
            'Start from a dead hang with your arms fully extended.',
            'Engage your lats and pull your chest towards the bar.',
            'Focus on driving your elbows down and back.',
            'Lower yourself back down with control.'
        ],
        mistakes: [
            'Using momentum (kipping) instead of strict strength.',
            'Not using a full range of motion.',
            'Shrugging your shoulders up towards your ears.'
        ]
    },
    'Dips': {
        description: 'A compound bodyweight exercise that targets the triceps, chest, and shoulders.',
        cues: [
            'Grip the parallel bars with your palms facing inward.',
            'Start with your arms locked out and your body straight.',
            'Lower your body by bending your elbows until they are at a 90-degree angle.',
            'Keep your chest up and your shoulders down.',
            'Press back up to the starting position.'
        ],
        mistakes: [
            'Going too low and stressing your shoulder joints.',
            'Flaring your elbows out too wide.',
            'Not keeping your core engaged.'
        ]
    },
    'Barbell Rows': {
        description: 'A classic back-building exercise that targets the lats, rhomboids, and traps.',
        cues: [
            'Hinge at your hips with a slight bend in your knees, keeping your back straight.',
            'Grip the bar with your hands slightly wider than shoulder-width.',
            'Pull the barbell up towards your lower chest / upper abdomen.',
            'Squeeze your shoulder blades together at the top of the movement.',
            'Lower the bar with control.'
        ],
        mistakes: [
            'Using momentum and yanking the weight up.',
            'Rounding your lower back.',
            'Standing too upright.'
        ]
    },
    'Kettlebell Swing': {
        description: 'A dynamic, explosive exercise that targets the entire posterior chain, including the glutes, hamstrings, and lower back.',
        cues: [
            'Start with the kettlebell slightly in front of you on the floor.',
            'Hinge at your hips to grab the kettlebell with both hands.',
            'Hike the kettlebell back between your legs.',
            'Explosively drive your hips forward to propel the kettlebell up to chest height.',
            'Let the kettlebell swing back down naturally, controlling the descent.'
        ],
        mistakes: [
            'Squatting the weight up instead of using a hip hinge.',
            'Using your arms to lift the kettlebell.',
            'Letting the kettlebell pull you forward.'
        ]
    },
    'Front Squat': {
        description: 'A squat variation that places the barbell across the front of the shoulders, emphasizing the quadriceps and core stability.',
        cues: [
            'Rack the barbell across your front deltoids with either a clean grip or a "bodybuilder" style cross-arm grip.',
            'Keep your elbows high and your chest up throughout the movement.',
            'Descend into a full squat, maintaining an upright torso.',
            'Drive through your heels to return to the starting position.'
        ],
        mistakes: [
            'Letting your elbows drop, which causes the bar to roll forward.',
            'Rounding your upper back.',
            'Not reaching full depth.'
        ]
    },
    'Romanian Deadlift': {
        description: 'A hinge movement that primarily targets the hamstrings and glutes, with less emphasis on the lower back than a conventional deadlift.',
        cues: [
            'Start from a standing position, holding the barbell at hip level.',
            'Initiate the movement by pushing your hips back, keeping your legs relatively straight (a slight bend is okay).',
            'Lower the bar by hinging at the hips, keeping your back flat.',
            'Squeeze your glutes to return to the starting position.'
        ],
        mistakes: [
            'Bending your knees too much, turning it into a squat.',
            'Rounding your back.',
            'Letting the bar drift away from your legs.'
        ]
    },
    'Push Press': {
        description: 'An explosive overhead pressing variation that uses leg drive to help move the weight.',
        cues: [
            'Start with the barbell in the front rack position, just like an overhead press.',
            'Perform a shallow dip by bending your knees and hips slightly.',
            'Explosively drive up with your legs and press the bar overhead simultaneously.',
            'Lock out your arms at the top.',
            'Lower the bar under control to the starting position.'
        ],
        mistakes: [
            'Dipping too deep.',
            'Pressing the bar forward instead of straight up.',
            'Not fully locking out your arms at the top.'
        ]
    },
    'Thruster': {
        description: 'A full-body compound movement that combines a front squat with a push press in one fluid motion.',
        cues: [
            'Start with the barbell in the front rack position.',
            'Descend into a full front squat.',
            'As you drive out of the bottom of the squat, use the momentum to press the bar overhead.',
            'The movement should be continuous and explosive.',
            'Lower the bar back to the front rack position to begin the next rep.'
        ],
        mistakes: [
            'Pausing between the squat and the press.',
            'Not reaching full depth in the squat.',
            'Losing core tightness.'
        ]
    },
    'Incline DB Press': {
        description: 'A dumbbell press variation performed on an incline bench to target the upper portion of the pectoral muscles.',
        cues: [
            'Set the bench to a 30-45 degree angle.',
            'Lie back and start with the dumbbells at your chest, palms facing forward.',
            'Press the dumbbells up and slightly inward until your arms are fully extended.',
            'Lower the dumbbells with control to the starting position.'
        ],
        mistakes: [
            'Using too steep of an incline, which turns the movement into a shoulder press.',
            'Flaring your elbows out too wide.',
            'Not using a full range of motion.'
        ]
    },
    'Sandbag Lifts': {
        description: 'A general category for lifting heavy, awkward sandbags, which builds functional and grip strength. This includes deadlifts, cleans, and front squats.',
        cues: [
            'Keep your back straight and lift with your legs, especially on deadlifts and cleans.',
            'For cleans, use explosive hip drive to get the bag to the rack position.',
            'For front squats, keep your elbows high to create a stable shelf for the bag.',
            'Brace your core throughout all movements to protect your spine.'
        ],
        mistakes: [
            'Rounding your back to lift the bag.',
            'Trying to muscle the bag up with your arms instead of using your hips.',
            'Losing your balance due to the shifting weight.'
        ]
    },
    'Tricep Pushdowns': {
        description: 'An isolation exercise using a cable machine to target the triceps.',
        cues: [
            'Stand upright with your core braced.',
            'Grip the bar or rope with an overhand grip.',
            'Keep your elbows pinned to your sides.',
            'Extend your arms fully, squeezing your triceps at the bottom.'
        ],
        mistakes: [
            'Letting elbows flare out.',
            'Using momentum by rocking the body.',
            'Not using a full range of motion.'
        ]
    },
    'Lateral Raises': {
        description: 'An isolation exercise for the medial (side) deltoids, which helps create broader shoulders.',
        cues: [
            'Stand with dumbbells at your sides, palms facing in.',
            'Raise the dumbbells out to your sides with a slight bend in your elbows.',
            'Lift until your arms are parallel to the floor.',
            'Lower the weight with control.'
        ],
        mistakes: [
            'Using momentum to swing the weights up.',
            'Lifting the weights too high.',
            'Shrugging your traps.'
        ]
    },
     'Face Pulls': {
        description: 'A great accessory exercise for shoulder health and upper back development.',
        cues: [
            'Set a cable to face height with a rope attachment.',
            'Grip the rope with an overhand grip.',
            'Pull the rope towards your face, aiming to get your hands by your ears.',
            'Focus on externally rotating your shoulders and squeezing your rear delts.'
        ],
        mistakes: [
            'Using too much weight and turning it into a row.',
            'Not focusing on the external rotation.',
            'Pulling the rope to your chin or neck.'
        ]
    },
    'Bicep Curls': {
        description: 'The classic isolation exercise for building the biceps.',
        cues: [
            'Stand with a dumbbell in each hand, palms facing forward.',
            'Keep your elbows pinned to your sides.',
            'Curl the weights up towards your shoulders.',
            'Squeeze your biceps at the top.',
            'Lower the weight with control.'
        ],
        mistakes: [
            'Swinging the weights and using momentum.',
            'Not using a full range of motion.',
            'Letting your elbows drift forward.'
        ]
    },
    'Hand Release Burpees': {
        description: 'A burpee variation that ensures a full chest-to-ground position, increasing the difficulty and building explosive power.',
        cues: [
            'Start standing, then drop into a squat with your hands on the floor.',
            'Kick your feet back into a plank position and lower your entire body to the ground.',
            'Lift your hands off the ground briefly.',
            'Push back up to a plank, jump your feet forward, and explosively jump up.'
        ],
        mistakes: [
            'Not touching your chest fully to the ground.',
            'Snaking your body up instead of a clean push-up.',
            'Landing flat-footed on the jump.'
        ]
    },
    'Barbell Squats': {
        description: 'A fundamental lower-body exercise that targets the quadriceps, hamstrings, glutes, and core. Can be performed with the barbell on the upper back (Back Squat) or front of the shoulders (Front Squat).',
         cues: [
            'Place the barbell across your upper back, not on your neck.',
            'Stand with your feet shoulder-width apart, toes pointed slightly out.',
            'Initiate the movement by hinging at your hips and then bending your knees.',
            'Keep your chest up and your core braced as you lower into the squat.',
            'Drive through your heels to return to the starting position.'
        ],
        mistakes: [
            'Letting your knees collapse inward.',
            'Leaning too far forward.',
            'Not squatting to at least parallel depth.'
        ]
    },
    'Sandbag Deadlifts': {
        description: 'Lifting a sandbag from the floor. Builds raw, functional strength and grip.',
        cues: [
            'Address the bag with a wide stance.',
            'Hinge at the hips, keeping your back straight.',
            'Grip the bag firmly and drive through your legs to lift.',
            'Keep the bag close to your body.'
        ],
        mistakes: [
            'Rounding your lower back.',
            'Lifting with your arms instead of your legs and hips.'
        ]
    },
    'Sandbag Front Squats': {
        description: 'Squatting with a sandbag held in the front rack position. Great for core and upper back strength.',
        cues: [
            'Clean the sandbag to your shoulders, creating a stable shelf with your arms.',
            'Keep your elbows high and chest up.',
            'Squat to full depth, maintaining an upright torso.',
            'Drive up explosively.'
        ],
        mistakes: [
            'Letting your elbows drop.',
            'Rounding your back.'
        ]
    },
    'Sandbag Cleans': {
        description: 'An explosive movement to lift a sandbag from the floor to the shoulders.',
        cues: [
            'Start like a deadlift.',
            'Explosively extend your hips, knees, and ankles (triple extension).',
            'Use the momentum to pull the bag upward.',
            'Quickly drop under the bag and catch it in the front rack position.'
        ],
        mistakes: [
            'Trying to curl the bag up with your arms.',
            'Not using your hips explosively enough.'
        ]
    },
     'Farmers Walk': {
        description: 'A simple yet highly effective exercise for building grip strength, core stability, and work capacity.',
        cues: [
            'Pick up a heavy dumbbell or kettlebell in each hand.',
            'Stand up straight with your shoulders back and core braced.',
            'Walk for a set distance or time, taking short, quick steps.',
            'Maintain an upright posture throughout.'
        ],
        mistakes: [
            'Leaning forward or to one side.',
            'Using a weight that is too light to be challenging.',
            'Shrugging your shoulders.'
        ]
    }
    
    // Add more exercises here as needed
};

const programs = {
    hybridAthlete: hybridAthleteProgram,
    tacticalAthlete: tacticalAthleteProgram,
    forceTestPrep: forceTestPrepProgram,
};

const programContainer = document.getElementById('program-container');
const difficultySelectionScreen = document.getElementById('difficulty-selection');
const appContent = document.getElementById('app-content');
const goalSelectionScreen = document.getElementById('goal-selection');
const bottomNav = document.getElementById('bottom-nav');
let progressChart = null;
let workoutsChart = null;
let volumeChart = null;
let distanceChart = null;

let completionStatus = {};
let workoutDetails = {};
let openWeeks = new Set();
let openTools = new Set();
let timerIntervals = {};
let workoutTimers = {};
let weightUnit = 'lbs';

let currentGoal = null;
let currentDifficulty = null;
let currentProgramData = [];
let activeWorkoutDayId = null;
// Onboarding state
const totalOnboardingSteps = 3;
let pendingGoal = null;
let pendingDifficulty = null;

const saveData = () => {
    localStorage.setItem(`hybridData_${currentGoal}_${currentDifficulty}`, JSON.stringify({
        completion: completionStatus,
        details: workoutDetails,
        unit: weightUnit
    }));
};

const loadData = () => {
    const data = JSON.parse(localStorage.getItem(`hybridData_${currentGoal}_${currentDifficulty}`));
    completionStatus = data?.completion || {};
    workoutDetails = data?.details || {};
    weightUnit = data?.unit || 'lbs';
};

window.selectDifficulty = (level) => {
    localStorage.setItem('hybridDifficulty', level);
    currentDifficulty = level;
    difficultySelectionScreen.classList.add('hidden');
    // Show dedicated install page as next onboarding step
    const installScreen = document.getElementById('install-screen');
    if (installScreen) {
        installScreen.classList.remove('hidden');
        // Ensure bottom nav stays hidden during onboarding
        bottomNav.classList.add('hidden');
        updateInstallAvailabilityUI();
        showOnboardingProgress(true);
        setOnboardingStep(3);
    } else {
        // Fallback: proceed to app if install screen missing
        initializeApp();
        switchView('home');
        bottomNav.classList.remove('hidden');
    }
};

window.selectWeightUnit = (unit) => {
    weightUnit = unit;
    saveData();
    renderProgram();
};

const updateOverallProgress = () => {
    if (!currentDifficulty) return;
    const totalDays = currentProgramData.reduce((acc, phase) => acc + phase.weeks.reduce((wAcc, week) => wAcc + week.days.length, 0), 0);
    const completedDays = Object.values(completionStatus).filter(status => status).length;
    const percentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    document.getElementById('overall-progress-bar').style.width = `${percentage}%`;
    document.getElementById('overall-progress-text').textContent = `[ ${completedDays}/${totalDays} MISSIONS COMPLETE ] - ${Math.round(percentage)}%`;
};

window.toggleDayCompletion = (dayId) => {
    completionStatus[dayId] = !completionStatus[dayId];
    saveData();

    const card = document.querySelector(`[data-day-id="${dayId}"]`);
    if (card && completionStatus[dayId]) {
        card.classList.add('complete-glow');
        
        // Check if week is complete after the animation
        setTimeout(() => {
            card.classList.remove('complete-glow');
            if (isWeekComplete(dayId)) {
                showWeeklyDebrief(dayId.split('_')[0]);
            }
            renderProgram();
        }, 500);
    } else {
        renderProgram();
    }
};

const updateNotes = (dayId, text) => {
    if (!workoutDetails[dayId]) workoutDetails[dayId] = {};
    workoutDetails[dayId].notes = text;
    saveData();
};

window.startWorkout = (dayId) => {
    if (!workoutDetails[dayId]) workoutDetails[dayId] = {};

    if (!workoutDetails[dayId].workoutStarted) {
        workoutDetails[dayId].workoutStarted = true;
        workoutDetails[dayId].startTime = new Date().toISOString();

        // Initialize exercises if not exists
        if (!workoutDetails[dayId].exercises) {
            const dayData = getCurrentDayData(dayId);
            workoutDetails[dayId].exercises = parseExercises(dayData.details);
        }
    }

    saveData();
    renderProgram();
    openWorkoutSession(dayId);
};

const openWorkoutSession = (dayId) => {
    activeWorkoutDayId = dayId;
    const modal = document.getElementById('workout-session');
    const timerEl = document.getElementById('session-timer');
    if (timerEl) timerEl.id = `workout-timer-${dayId}`;
    const notesEl = document.getElementById('session-notes');
    if (notesEl) notesEl.value = workoutDetails[dayId]?.notes || '';
    const exercisesEl = document.getElementById('session-exercises');
    if (exercisesEl) exercisesEl.innerHTML = renderExercises(dayId);
    modal.classList.remove('hidden');
    startWorkoutTimer(dayId);
};

window.closeWorkoutSession = () => {
    const modal = document.getElementById('workout-session');
    modal.classList.add('hidden');
    const timerEl = document.getElementById(`workout-timer-${activeWorkoutDayId}`);
    if (timerEl) timerEl.id = 'session-timer';
    activeWorkoutDayId = null;
};

const refreshWorkoutSession = () => {
    if (!activeWorkoutDayId) return;
    const exercisesEl = document.getElementById('session-exercises');
    if (exercisesEl) exercisesEl.innerHTML = renderExercises(activeWorkoutDayId);
};

const getCurrentDayData = (dayId) => {
    const [weekNum, dayName] = dayId.split('_');
    for (const phase of currentProgramData) {
        for (const week of phase.weeks) {
            if (week.week === parseInt(weekNum)) {
                return week.days.find(day => day.day === dayName);
            }
        }
    }
    return null;
};

const getPreviousWorkoutData = (currentDayId, exerciseName) => {
    const [weekNumStr, dayName] = currentDayId.split('_');
    const weekNum = parseInt(weekNumStr);

    if (weekNum < 1) { // Baseline week is 0
         return null;
    }
    if (weekNum === 1){ // First real week looks at baseline
        const prevDayId = `0_Start`;
        const prevWorkoutDetails = workoutDetails[prevDayId];
        if (!prevWorkoutDetails || !prevWorkoutDetails.exercises) return null;
        const prevExercise = prevWorkoutDetails.exercises.find(ex => ex.name === exerciseName);
        return prevExercise ? prevExercise.sets : null;
    }


    const prevWeekNum = weekNum - 1;
    const prevDayId = `${prevWeekNum}_${dayName}`;

    const prevWorkoutDetails = workoutDetails[prevDayId];
    if (!prevWorkoutDetails || !prevWorkoutDetails.exercises) {
        return null;
    }

    const prevExercise = prevWorkoutDetails.exercises.find(ex => ex.name === exerciseName);
    return prevExercise ? prevExercise.sets : null;
};

const parseExercises = (details) => {
    const exercises = [];
    const lines = details.split('<br>');
    
    lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine && !cleanLine.includes('Rounds') && !cleanLine.startsWith('-') && !cleanLine.includes('Followed by')) {
            const colonIndex = cleanLine.indexOf(':');
            if (colonIndex > 0) {
                const name = cleanLine.substring(0, colonIndex).trim();
                const description = cleanLine.substring(colonIndex + 1).trim();
                
                exercises.push({
                    name: name,
                    description: description,
                    sets: parseSetInfo(description)
                });
            } else {
                 // Handle cases like "1.5 Mile Run for time"
                 exercises.push({
                    name: cleanLine,
                    description: "Log your time/reps",
                    sets: [{ reps: '', weight: '', completed: false}]
                 });
            }
        }
    });
    
    return exercises;
};

const parseSetInfo = (description) => {
    const sets = [];
    const setMatch = description.match(/(\d+)x(\d+)/);
    
    if (setMatch) {
        const numSets = parseInt(setMatch[1]);
        const reps = parseInt(setMatch[2]);
        
        for (let i = 0; i < numSets; i++) {
            sets.push({
                reps: reps,
                weight: '',
                completed: false
            });
        }
    } else {
        // Default to 1 set for non-standard formats (like tests)
        sets.push({
            reps: '',
            weight: '',
            completed: false
        });
    }
    
    return sets;
};

const updateSet = (dayId, exerciseIndex, setIndex, field, value) => {
    if (!workoutDetails[dayId] || !workoutDetails[dayId].exercises) return;
    
    workoutDetails[dayId].exercises[exerciseIndex].sets[setIndex][field] = value;
    saveData();
};

window.toggleSetCompletion = (dayId, exerciseIndex, setIndex) => {
    if (!workoutDetails[dayId] || !workoutDetails[dayId].exercises) return;

    const set = workoutDetails[dayId].exercises[exerciseIndex].sets[setIndex];
    set.completed = !set.completed;
    saveData();
    renderProgram();
    if (activeWorkoutDayId === dayId) refreshWorkoutSession();
};

window.addSet = (dayId, exerciseIndex) => {
    if (!workoutDetails[dayId] || !workoutDetails[dayId].exercises) return;

    workoutDetails[dayId].exercises[exerciseIndex].sets.push({
        reps: '',
        weight: '',
        completed: false
    });
    saveData();
    renderProgram();
    if (activeWorkoutDayId === dayId) refreshWorkoutSession();
};

window.finishWorkout = (dayId = activeWorkoutDayId) => {
    if (!dayId) return;
    if (!workoutDetails[dayId]) workoutDetails[dayId] = {};
    workoutDetails[dayId].workoutStarted = false;
    workoutDetails[dayId].startTime = null;
    workoutDetails[dayId].endTime = new Date().toISOString();
    completionStatus[dayId] = true;
    
    // Clear workout timer
    if (workoutTimers[dayId]) {
        clearInterval(workoutTimers[dayId]);
        delete workoutTimers[dayId];
    }
    // Stop any tool timers for this day as well
    if (timerIntervals[dayId]) {
        clearInterval(timerIntervals[dayId]);
        delete timerIntervals[dayId];
    }
    // Optionally collapse tools panel
    if (openTools.has(dayId)) {
        openTools.delete(dayId);
    }
    
    saveData();
    renderProgram();
    closeWorkoutSession();
    showWorkoutCompleteMessage();
};

// --- Onboarding: Install step actions ---
window.installAppNow = () => {
    // Prefer showing the browser prompt when available
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            updateInstallAvailabilityUI();
            skipInstall();
        });
    } else {
        // No prompt available; just advance and user can install later from Settings
        skipInstall();
    }
};

window.skipInstall = () => {
    const installScreen = document.getElementById('install-screen');
    if (installScreen) installScreen.classList.add('hidden');
    // Mark onboarding complete so deep links and settings pages return to app
    localStorage.setItem('hasSeenOnboarding','true');
    initializeApp();
    switchView('home');
    bottomNav.classList.remove('hidden');
    showOnboardingProgress(false);
};

const showWorkoutCompleteMessage = (message) => {
    const modal = document.getElementById('workout-complete-modal');
    const textEl = document.getElementById('workout-complete-text');
    const msg = message || completionMessages[Math.floor(Math.random() * completionMessages.length)];
    textEl.textContent = msg;
    modal.classList.remove('hidden');
    modal.classList.add('show');
    setTimeout(() => {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }, 3000);
};

const renderClickableExercises = (details) => {
     const lines = details.split('<br>');
     return lines.map(line => {
        const cleanLine = line.trim();
        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex > 0) {
            const name = cleanLine.substring(0, colonIndex).trim();
            const setsReps = cleanLine.substring(colonIndex + 1).trim();
            return `<p class="mb-1"><button onclick="openExerciseModal('${name}')" class="text-left hover:text-lime-400 transition-colors underline">${name}</button>: ${setsReps}</p>`;
        }
        return `<p class="mb-1">${cleanLine}</p>`;
     }).join('');
};

const renderExercises = (dayId) => {
    const exercises = workoutDetails[dayId]?.exercises || [];
    if (!exercises.length) return '';
    
    return exercises.map((exercise, exerciseIndex) => {
        const previousSets = getPreviousWorkoutData(dayId, exercise.name);
        const [weekNumStr] = dayId.split('_');
        const weekNum = parseInt(weekNumStr);

        return `
        <div class="bg-gray-800/50 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-between mb-3">
                <button onclick="openExerciseModal('${exercise.name}')" class="text-left">
                     <h4 class="text-white font-semibold text-lg font-display hover:text-lime-400 transition-colors">${exercise.name}</h4>
                </button>
            </div>
            
            <!-- Mobile-optimized layout -->
            <div class="space-y-3">
                ${exercise.sets.map((set, setIndex) => {
                    const prevSetData = previousSets ? previousSets[setIndex] : null;
                    let prevText = '';
                    if (weekNum > 0) { // Show previous data from baseline onwards
                        prevText = prevSetData && (prevSetData.weight || prevSetData.reps) ? `Previous: ${prevSetData.weight || ''} ${prevSetData.weight ? weightUnit : ''} × ${prevSetData.reps}` : '';
                    }
                    return `
                    <div class="bg-gray-700/50 rounded-lg p-3">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 ${set.completed ? 'bg-lime-600 text-black' : 'bg-gray-600 text-gray-300'} rounded-full flex items-center justify-center font-bold text-sm">
                                    ${setIndex + 1}
                                </div>
                                <div class="text-xs text-gray-400 min-h-[1em]">
                                    ${prevText}
                                </div>
                            </div>
                            <button 
                                onclick="toggleSetCompletion('${dayId}', ${exerciseIndex}, ${setIndex})"
                                class="w-10 h-10 rounded-full border-2 ${set.completed ? 'bg-lime-500 border-lime-500' : 'border-gray-500 hover:border-lime-500'} flex items-center justify-center transition-colors touch-manipulation"
                            >
                                ${set.completed ? '<svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                            </button>
                        </div>
                        
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-400 mb-2 font-medium">Score / Weight (LBS)</label>
                            <input
                                type="number"
                                step="0.5"
                                value="${set.weight}"
                                onchange="updateSet('${dayId}', ${exerciseIndex}, ${setIndex}, 'weight', this.value)"
                                class="w-full bg-gray-800 text-white text-center text-lg py-3 rounded-lg border border-gray-600 focus:border-lime-500 focus:outline-none"
                                placeholder="Weight"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-2 font-medium">Reps</label>
                            <input
                                type="number"
                                value="${set.reps}"
                                onchange="updateSet('${dayId}', ${exerciseIndex}, ${setIndex}, 'reps', this.value)"
                                class="w-full bg-gray-800 text-white text-center text-lg py-3 rounded-lg border border-gray-600 focus:border-lime-500 focus:outline-none"
                                placeholder="Reps"
                            />
                        </div>
                    </div>
                    </div>
                `}).join('')}
            </div>
            
            <button 
                onclick="addSet('${dayId}', ${exerciseIndex})" 
                class="w-full mt-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border-2 border-dashed border-gray-500 hover:border-lime-500 text-lime-400 hover:text-lime-300 text-sm font-medium rounded-lg transition-colors touch-manipulation"
            >
                + ADD SET
            </button>
        </div>
    `}).join('');
};

const startWorkoutTimer = (dayId) => {
    const workout = workoutDetails[dayId];
    if (!workout || !workout.startTime) return;
    
    const startTime = new Date(workout.startTime).getTime();
    
    const updateTimer = () => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        const timerDisplay = document.getElementById(`workout-timer-${dayId}`);
        if (timerDisplay) {
            timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        }
    };
    
    // Clear any existing interval
    if (workoutTimers[dayId]) {
        clearInterval(workoutTimers[dayId]);
    }
    
    // Update immediately and then every second
    updateTimer();
    workoutTimers[dayId] = setInterval(updateTimer, 1000);
};

// Timer Functions
window.startTimer = (dayId, isStopwatch) => {
    clearInterval(timerIntervals[dayId]);
    if (!workoutDetails[dayId]) workoutDetails[dayId] = {};
    const timerState = workoutDetails[dayId].timer || createTimerState(0, isStopwatch);
    timerState.isStopwatch = isStopwatch;

    const displayId = isStopwatch ? `stopwatch-${dayId}` : `countdown-${dayId}`;
    const display = document.getElementById(displayId);

    timerIntervals[dayId] = startTimerUtil(timerState, (time) => {
        if (display) display.textContent = formatTime(time);
        workoutDetails[dayId].timer = timerState;
    }, () => {
        window.stopTimer(dayId);
    });
    updateTimerButtons(dayId);
};

window.stopTimer = (dayId) => {
    const timerState = workoutDetails[dayId]?.timer;
    if (timerState) {
        stopTimerUtil(timerState, timerIntervals[dayId]);
    } else {
        clearInterval(timerIntervals[dayId]);
    }
    saveData();
    updateTimerButtons(dayId);
};

window.resetTimer = (dayId, isStopwatch) => {
    clearInterval(timerIntervals[dayId]);
    if (!workoutDetails[dayId]) workoutDetails[dayId] = {};
    const timerState = workoutDetails[dayId].timer || createTimerState(0, isStopwatch);
    resetTimerUtil(timerState, isStopwatch);

    const displayId = isStopwatch ? `stopwatch-${dayId}` : `countdown-${dayId}`;
    const display = document.getElementById(displayId);
    if (display) display.textContent = formatTime(timerState.time);

    workoutDetails[dayId].timer = timerState;
    saveData();
    updateTimerButtons(dayId);
};

window.setCountdownTime = (dayId) => {
    const minutes = parseInt(prompt('Enter countdown minutes:', '5') || '0');
    if (minutes >= 0) {
        if (!workoutDetails[dayId]) workoutDetails[dayId] = {};
        const timerState = workoutDetails[dayId].timer || createTimerState();
        setCountdownTimeUtil(timerState, minutes);

        const display = document.getElementById(`countdown-${dayId}`);
        if (display) display.textContent = formatTime(timerState.time);

        workoutDetails[dayId].timer = timerState;
        saveData();
    }
};

const updateTimerButtons = (dayId) => {
    const timerState = workoutDetails[dayId]?.timer;
    const startBtn = document.getElementById(`timer-start-${dayId}`);
    const stopBtn = document.getElementById(`timer-stop-${dayId}`);
    
    if (startBtn && stopBtn) {
        if (timerState?.running) {
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
        } else {
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
        }
    }
};

window.toggleWeekExpansion = (weekId) => {
    if (openWeeks.has(weekId)) {
        openWeeks.delete(weekId);
    } else {
        openWeeks.add(weekId);
    }
    renderProgram();
};

window.toggleToolsExpansion = (dayId) => {
    if (openTools.has(dayId)) {
        openTools.delete(dayId);
    } else {
        openTools.add(dayId);
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
    const goal = document.getElementById('goal-selection');
    if (difficulty) difficulty.classList.add('hidden');
    if (goal) goal.classList.remove('hidden');
    bottomNav.classList.add('hidden');
    showOnboardingProgress(true);
    setOnboardingStep(1);
    // Preselect saved goal
    const savedGoal = localStorage.getItem('hybridGoal');
    const nextBtn = document.getElementById('goal-next-btn');
    if (savedGoal) {
        const el = document.getElementById(`goal-${savedGoal}`);
        if (el) chooseGoal(savedGoal, el);
        if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('cta-strobe'); }
    } else {
        if (nextBtn) { nextBtn.disabled = true; nextBtn.classList.remove('cta-strobe'); }
    }
};

window.backToDifficulty = () => {
    const install = document.getElementById('install-screen');
    const difficulty = document.getElementById('difficulty-selection');
    if (install) install.classList.add('hidden');
    if (difficulty) difficulty.classList.remove('hidden');
    bottomNav.classList.add('hidden');
    showOnboardingProgress(true);
    setOnboardingStep(2);
    // Preselect saved difficulty
    const savedDiff = localStorage.getItem('hybridDifficulty');
    const nextBtn = document.getElementById('difficulty-next-btn');
    if (savedDiff) {
        const el = document.getElementById(`difficulty-${savedDiff}`);
        if (el) chooseDifficulty(savedDiff, el);
        if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('cta-strobe'); }
    } else {
        if (nextBtn) { nextBtn.disabled = true; nextBtn.classList.remove('cta-strobe'); }
    }
};

// --- Onboarding progress helpers ---
function showOnboardingProgress(show) {
    const cont = document.getElementById('onboarding-progress');
    if (cont) cont.classList.toggle('hidden', !show);
}

function setOnboardingStep(step) {
    const bar = document.getElementById('onboarding-progress-bar');
    const text = document.getElementById('onboarding-progress-text');
    const stepLabel = document.getElementById('onboarding-step-label');
    const pct = Math.round((step / totalOnboardingSteps) * 100);
    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `${pct}% Complete`;
    if (stepLabel) stepLabel.textContent = `Step ${step} of ${totalOnboardingSteps}`;
}

function highlightSelection(containerId, selectedEl) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const cards = container.querySelectorAll('.workout-card');
    cards.forEach(card => card.classList.remove('border-lime-500', 'bg-lime-500/10'));
    if (selectedEl) {
        selectedEl.classList.add('border-lime-500', 'bg-lime-500/10');
    }
}

window.chooseGoal = (goal, el) => {
    pendingGoal = goal;
    highlightSelection('goal-selection', el);
    const nextBtn = document.getElementById('goal-next-btn');
    if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('cta-strobe'); }
};

window.confirmGoalSelection = () => {
    if (!pendingGoal) return;
    // Persist and move to next step
    selectGoal(pendingGoal);
    showOnboardingProgress(true);
    setOnboardingStep(2);
    // Reset difficulty next state
    const nextBtn = document.getElementById('difficulty-next-btn');
    if (nextBtn) nextBtn.disabled = !pendingDifficulty;
    // Stop strobing on previous Next
    const goalNext = document.getElementById('goal-next-btn');
    if (goalNext) goalNext.classList.remove('cta-strobe');
};

window.chooseDifficulty = (level, el) => {
    pendingDifficulty = level;
    highlightSelection('difficulty-selection', el);
    const nextBtn = document.getElementById('difficulty-next-btn');
    if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('cta-strobe'); }
};

window.confirmDifficultySelection = () => {
    if (!pendingDifficulty) return;
    selectDifficulty(pendingDifficulty);
    setOnboardingStep(3);
    const diffNext = document.getElementById('difficulty-next-btn');
    if (diffNext) diffNext.classList.remove('cta-strobe');
};

window.selectGoal = (goal) => {
    localStorage.setItem('hybridGoal', goal);
    currentGoal = goal;
    document.getElementById('goal-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.remove('hidden');
};

const initializeApp = () => {
    bottomNav.classList.add('hidden');
    const savedGoal = localStorage.getItem('hybridGoal');
    const savedDifficulty = localStorage.getItem('hybridDifficulty');
    
    if (savedGoal && savedDifficulty) {
        const difficultyMethod = 'get' + savedDifficulty.charAt(0).toUpperCase() + savedDifficulty.slice(1);
        if (programs[savedGoal] && typeof programs[savedGoal][difficultyMethod] === 'function') {
            currentGoal = savedGoal;
            currentDifficulty = savedDifficulty;
            currentProgramData = programs[currentGoal][difficultyMethod]();
            
            const programLength = currentProgramData.reduce((acc, phase) => acc + phase.weeks.length, 0);
            document.getElementById('program-subtitle').textContent = `${programLength -1}-Week Training Program`; // Subtract 1 for baseline week

            loadData();
            
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('goal-selection').classList.add('hidden');
            difficultySelectionScreen.classList.add('hidden');
            appContent.classList.remove('hidden');
            renderProgram();
            return; // Exit function to prevent showing welcome screen
        }
    } 
    
    // If any part of the setup is missing, show the welcome screen
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('goal-selection').classList.add('hidden');
    difficultySelectionScreen.classList.add('hidden');
    appContent.classList.add('hidden');
    showWelcomeMessage();
};

// --- Chart Functions ---
const getSelectedTimeFilter = () => document.getElementById('analytics-time-filter')?.value || 'overall';

const getCurrentWeekNumber = () => {
    const weeks = Object.keys(workoutDetails).map(id => parseInt(id.split('_')[0]));
    if (weeks.length === 0) return 1;
    return Math.max(...weeks);
};

const getFilteredWorkoutDetails = () => {
    const filter = getSelectedTimeFilter();
    if (filter === 'week') {
        const currentWeek = getCurrentWeekNumber();
        return Object.fromEntries(Object.entries(workoutDetails).filter(([dayId]) => parseInt(dayId.split('_')[0]) === currentWeek));
    }
    return workoutDetails;
};

const populateExerciseSelect = () => {
    const select = document.getElementById('chart-exercise-select');
    select.innerHTML = ''; // Clear old options

    const trackedExercises = new Set();
    const details = getFilteredWorkoutDetails();
    Object.values(details).forEach(day => {
        if (day.exercises) {
            day.exercises.forEach(ex => {
                 // Only track exercises with sets/reps or specific test names
                if(ex.description !== "Log your time/reps" && ex.name.toLowerCase().includes('press') || ex.name.toLowerCase().includes('squat') || ex.name.toLowerCase().includes('deadlift') || ex.name.toLowerCase().includes('pull-up')){
                     trackedExercises.add(ex.name);
                } else if (ex.description === "Log your time/reps"){
                     trackedExercises.add(ex.name);
                }
            });
        }
    });
    const emptyMessage = document.getElementById('analytics-empty-message');
    const analyticsContent = document.getElementById('analytics-content');
    if (trackedExercises.size === 0) {
        emptyMessage.classList.remove('hidden');
        analyticsContent.classList.add('hidden');
        return;
    } else {
        emptyMessage.classList.add('hidden');
        analyticsContent.classList.remove('hidden');
    }

    trackedExercises.forEach(exName => {
        const option = document.createElement('option');
        option.value = exName;
        option.textContent = exName;
        select.appendChild(option);
    });

    // Automatically render chart for the first exercise
    if (trackedExercises.size > 0) {
        renderChart(trackedExercises.values().next().value);
    }

    select.onchange = (e) => renderChart(e.target.value);
};

const getChartData = (exerciseName) => {
    const labels = [];
    const data = [];

    // Sort workoutDetails by week and day
    const details = getFilteredWorkoutDetails();
    const sortedDays = Object.keys(details).sort((a, b) => {
        const [weekA, dayA] = a.split('_');
        const [weekB, dayB] = b.split('_');
        if (parseInt(weekA) !== parseInt(weekB)) {
            return parseInt(weekA) - parseInt(weekB);
        }
        const dayOrder = ["Start", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
    });

    sortedDays.forEach(dayId => {
        const workout = details[dayId];
        if (workout.exercises) {
            const exercise = workout.exercises.find(ex => ex.name === exerciseName);
            if (exercise) {
                const [weekNum] = dayId.split('_');
                labels.push(`Week ${weekNum}`);
                
                // For lifts, find max weight. For tests, find reps/time.
                if(exercise.description === "Log your time/reps"){
                     // Assuming time is in 'weight' field as mm:ss and reps in 'reps'
                     const score = exercise.sets[0].reps || (exercise.sets[0].weight ? timeStringToSeconds(exercise.sets[0].weight) : 0);
                     data.push(score);
                } else {
                    const maxWeight = exercise.sets.reduce((max, set) => {
                        const weight = parseFloat(set.weight);
                        return !isNaN(weight) && weight > max ? weight : max;
                    }, 0);
                    data.push(maxWeight);
                }
            }
        }
    });
    
    return { labels, data };
};

const timeStringToSeconds = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return parseFloat(timeStr) || 0; // It might just be a rep count
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

const renderChart = (exerciseName) => {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const { labels, data } = getChartData(exerciseName);

    const isTimeBased = exerciseName.toLowerCase().includes('run');

    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: isTimeBased ? `Time (seconds)` : `Heaviest Weight (${weightUnit})`,
                data: data,
                borderColor: '#A3E635',
                backgroundColor: 'rgba(163, 230, 53, 0.2)',
                tension: 0.1,
                fill: true,
                pointBackgroundColor: '#A3E635',
                pointBorderColor: '#fff',
                pointHoverRadius: 7,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            }
        }
    });
};

const calculateWeeklyTotals = () => {
    const filter = getSelectedTimeFilter();
    let weeks = currentProgramData.flatMap(p => p.weeks).map(w => w.week);
    if (filter === 'week') {
        const currentWeek = getCurrentWeekNumber();
        weeks = weeks.filter(w => w === currentWeek);
    }

    return weeks.map(weekNum => {
        const weekData = currentProgramData.flatMap(p => p.weeks).find(w => w.week === parseInt(weekNum));
        let weekWorkouts = 0;
        let weekVolume = 0;
        let weekDistance = 0;

        if (weekData) {
            weekData.days.forEach(day => {
                const dayId = `${weekNum}_${day.day}`;
                if (completionStatus[dayId]) {
                    weekWorkouts++;
                    const details = workoutDetails[dayId];
                    if (details && details.exercises) {
                        details.exercises.forEach(ex => {
                            ex.sets.forEach(set => {
                                if (set.completed && set.reps && set.weight) {
                                    const reps = parseInt(set.reps) || 0;
                                    const weight = parseFloat(set.weight) || 0;
                                    weekVolume += reps * weight;
                                }
                            });
                        });
                    }
                    if (day.focus.toLowerCase().includes('run')) {
                        const match = day.details.match(/(\d+)(-| - | to )?(\d+)?km/);
                        if (match) {
                            weekDistance += parseFloat(match[1]);
                        }
                    }
                }
            });
        }

        return { week: weekNum, workouts: weekWorkouts, volume: weekVolume, distance: weekDistance };
    });
};

const renderWorkoutsChart = (labels, data) => {
    const ctx = document.getElementById('workouts-chart').getContext('2d');
    if (workoutsChart) {
        workoutsChart.destroy();
    }
    workoutsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Workouts Completed',
                data,
                backgroundColor: 'rgba(163, 230, 53, 0.5)',
                borderColor: '#A3E635',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#D1D5DB' }
                }
            }
        }
    });
};

const renderVolumeChart = (labels, data) => {
    const ctx = document.getElementById('volume-chart').getContext('2d');
    if (volumeChart) {
        volumeChart.destroy();
    }
    volumeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `Total Volume (${weightUnit})`,
                data,
                borderColor: '#A3E635',
                backgroundColor: 'rgba(163, 230, 53, 0.2)',
                tension: 0.1,
                fill: true,
                pointBackgroundColor: '#A3E635',
                pointBorderColor: '#fff',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#D1D5DB' }
                }
            }
        }
    });
};

const renderDistanceChart = (labels, data) => {
    const ctx = document.getElementById('distance-chart').getContext('2d');
    if (distanceChart) {
        distanceChart.destroy();
    }
    distanceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Distance (km)',
                data,
                backgroundColor: labels.map(() => 'rgba(163, 230, 53, 0.5)'),
                borderColor: '#A3E635',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#D1D5DB' }
                }
            }
        }
    });
};

const updateDeltaIndicator = (elementId, data, formatter) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (data.length < 2) {
        el.textContent = '';
        return;
    }
    const delta = data[data.length - 1] - data[data.length - 2];
    const sign = delta >= 0 ? '+' : '';
    el.textContent = `${sign}${formatter(delta)} vs last week`;
};

const renderWeeklyCharts = () => {
    const totals = calculateWeeklyTotals();
    const labels = totals.map(t => `Week ${t.week}`);
    const workouts = totals.map(t => t.workouts);
    const volume = totals.map(t => t.volume);
    const distance = totals.map(t => t.distance);

    renderWorkoutsChart(labels, workouts);
    renderVolumeChart(labels, volume);
    renderDistanceChart(labels, distance);

    updateDeltaIndicator('workouts-delta', workouts, d => `${d} workouts`);
    updateDeltaIndicator('volume-delta', volume, d => `${d.toLocaleString()} ${weightUnit}`);
    updateDeltaIndicator('distance-delta', distance, d => `${d.toFixed(1)} km`);
};

window.calculate1RM = (dayId) => {
    const weightInput = document.getElementById(`weight-1rm-${dayId}`);
    const repsInput = document.getElementById(`reps-1rm-${dayId}`);
    const resultEl = document.getElementById(`result-1rm-${dayId}`);

    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value);

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
        resultEl.textContent = 'Enter valid weight & reps.';
        return;
    }
    
    // Epley Formula
    const oneRepMax = Math.round(weight * (1 + (reps / 30)));
    
    resultEl.textContent = `Est. 1RM: ${oneRepMax} ${weightUnit}`;
};

// --- Debrief Functions ---
const isWeekComplete = (dayId) => {
    const [weekNumStr] = dayId.split('_');
    const weekNum = parseInt(weekNumStr);
    
    const weekData = currentProgramData.flatMap(p => p.weeks).find(w => w.week === weekNum);
    if (!weekData) return false;

    for(const day of weekData.days){
        const currentDayId = `${weekNum}_${day.day}`;
        if(!completionStatus[currentDayId]){
            return false;
        }
    }
    return true;
};

const showWeeklyDebrief = (weekNum) => {
    const weekData = currentProgramData.flatMap(p => p.weeks).find(w => w.week === parseInt(weekNum));
    if (!weekData) return;

    let totalWorkouts = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let totalDistance = 0;

    weekData.days.forEach(day => {
        const dayId = `${weekNum}_${day.day}`;
        if (completionStatus[dayId]) {
            totalWorkouts++;
            const details = workoutDetails[dayId];
            if (details && details.exercises) {
                details.exercises.forEach(ex => {
                    ex.sets.forEach(set => {
                        if (set.completed && set.reps && set.weight) {
                            const reps = parseInt(set.reps) || 0;
                            const weight = parseFloat(set.weight) || 0;
                            totalReps += reps;
                            totalVolume += reps * weight;
                        } else if (set.completed && set.reps) {
                            totalReps += parseInt(set.reps) || 0;
                        }
                    });
                });
            }
            if(day.focus.toLowerCase().includes('run')){
                const match = day.details.match(/(\d+)(-| - | to )?(\d+)?km/);
                if(match){
                    totalDistance += parseFloat(match[1]);
                }
            }
        }
    });
    
    document.getElementById('debrief-week-number').textContent = weekNum;
    document.getElementById('debrief-workouts').textContent = totalWorkouts;
    document.getElementById('debrief-reps').textContent = totalReps.toLocaleString();
    document.getElementById('debrief-volume').textContent = `${totalVolume.toLocaleString()} ${weightUnit}`;
    document.getElementById('debrief-distance').textContent = `${totalDistance.toFixed(1)} km`;

    document.getElementById('debrief-modal').classList.remove('hidden');
};

window.closeDebriefModal = () => {
     document.getElementById('debrief-modal').classList.add('hidden');
};

// --- Exercise Library Functions ---
window.openExerciseModal = (exerciseName) => {
    const exercise = exerciseLibrary[exerciseName];
    const modalContent = document.getElementById('exercise-modal-content');
    
    if (exercise) {
         modalContent.innerHTML = `
            <h2 class="text-2xl font-bold text-lime-400 mb-4 font-display uppercase tracking-wider text-glow">${exerciseName}</h2>
            <p class="text-gray-400 mb-6">${exercise.description}</p>
            
            <h3 class="font-bold text-lime-300 mb-2 font-display">Key Cues:</h3>
            <ul class="text-gray-300 mb-6">${exercise.cues.map(cue => `<li>${cue}</li>`).join('')}</ul>
            
            <h3 class="font-bold text-red-400 mb-2 font-display">Common Mistakes:</h3>
            <ul class="text-gray-300">${exercise.mistakes.map(mistake => `<li>${mistake}</li>`).join('')}</ul>
        `;
    } else {
        modalContent.innerHTML = `<h2 class="text-2xl font-bold text-lime-400 mb-4 font-display uppercase tracking-wider text-glow">${exerciseName}</h2> <p class="text-gray-400">No technique guide available for this exercise yet.</p>`;
    }
    
    document.getElementById('exercise-modal').classList.remove('hidden');
};

window.closeExerciseModal = () => {
    document.getElementById('exercise-modal').classList.add('hidden');
};

// --- PWA Install Prompt ---
const iosPrompt = document.getElementById('ios-pwa-prompt');
const iosPromptDismiss = document.getElementById('ios-pwa-dismiss');

function checkIosInstallPrompt() {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isStandalone = window.navigator.standalone === true;
  const isSafari = isIOS && /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  const dismissed = localStorage.getItem('iosPwaPromptDismissed');

  if (isIOS && isSafari && !isStandalone && !dismissed) {
    iosPrompt.classList.remove('hidden');
  }
}

function dismissIosInstallPrompt() {
  iosPrompt.classList.add('hidden');
  localStorage.setItem('iosPwaPromptDismissed', 'true');
}

if (iosPromptDismiss) {
  iosPromptDismiss.addEventListener('click', dismissIosInstallPrompt);
}

// --- Onboarding Walkthrough ---
function promptInstallAfterOnboarding() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      console.log(`User choice: ${choice.outcome}`);
      if (choice.outcome === 'dismissed') {
        const banner = document.getElementById('post-onboarding-install');
        if (banner) banner.classList.remove('hidden');
      }
      deferredPrompt = null;
    });
  } else {
    const banner = document.getElementById('post-onboarding-install');
    if (banner) banner.classList.remove('hidden');
  }

  const dismiss = document.getElementById('post-onboarding-install-dismiss');
  if (dismiss) {
    dismiss.addEventListener('click', () => {
      const banner = document.getElementById('post-onboarding-install');
      if (banner) banner.classList.add('hidden');
    }, { once: true });
  }
}

function finishOnboarding() {
  localStorage.setItem('hasSeenOnboarding','true');
  initializeApp();
  switchView('home');
  // Removed automatic install prompts at startup
  showOnboardingProgress(false);
}

function startOnboarding() {
  // Prepare onboarding screens; show Welcome by default
  const welcome = document.getElementById('welcome-screen');
  const goal = document.getElementById('goal-selection');
  const difficulty = document.getElementById('difficulty-selection');
  const install = document.getElementById('install-screen');
  if (goal) goal.classList.add('hidden');
  if (difficulty) difficulty.classList.add('hidden');
  if (install) install.classList.add('hidden');
  if (welcome) welcome.classList.remove('hidden');
  bottomNav.classList.add('hidden');
  showOnboardingProgress(false);
  // Ensure welcome note types in when onboarding starts
  showWelcomeMessage();
}

// Switch between main views
function switchView(viewId) {
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    section.classList.toggle('hidden', section.id !== viewId);
  });

  const tabs = document.querySelectorAll('nav button');
  tabs.forEach(tab => {
    const isActive = tab.dataset.view === viewId;
    tab.classList.toggle('active', isActive);
    tab.classList.toggle('text-lime-400', isActive);
    tab.classList.toggle('text-gray-400', !isActive);
    tab.classList.toggle('font-display', isActive);
    tab.classList.toggle('font-bold', isActive);
    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
    const img = tab.querySelector('img.nav-img');
    if (img) img.classList.toggle('active', isActive);
  });

  if (viewId === 'analytics') {
    populateExerciseSelect();
    renderWeeklyCharts();
  } else if (viewId === 'home') {
    // Hide onboarding progress when landing on home
    showOnboardingProgress(false);
  }
}

window.switchView = switchView;

// Initialize the app or onboarding when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const bottom = document.getElementById('bottom-nav');
  if (bottom) {
    const hasOnboarded = localStorage.getItem('hasSeenOnboarding') === 'true'
      || (!!localStorage.getItem('hybridGoal') && !!localStorage.getItem('hybridDifficulty'));
    if (hasOnboarded) {
      initializeApp();
      // checkIosInstallPrompt(); // Avoid auto prompting at startup
    } else {
      startOnboarding();
    }
    const initialView = (location.hash && location.hash.substring(1)) || 'home';
    switchView(initialView);

    const timeFilter = document.getElementById('analytics-time-filter');
    if (timeFilter) {
      timeFilter.addEventListener('change', () => {
        populateExerciseSelect();
        renderWeeklyCharts();
      });
    }

    // Tap bounce micro-interaction for nav icons
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        const img = btn.querySelector('img.nav-img');
        if (!img) return;
        img.classList.add('nav-bounce');
        img.addEventListener('animationend', () => img.classList.remove('nav-bounce'), { once: true });
      });
    });
  }

  // Wire up install page prompt button if present
  const installPromptBtn = document.getElementById('install-page-prompt-btn');
  if (installPromptBtn) {
    installPromptBtn.addEventListener('click', () => triggerInstallPrompt());
    updateInstallAvailabilityUI();
    updateInstalledBanner();
  }
});

// Update UI if app becomes installed during this session
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  updateInstallAvailabilityUI();
  updateInstalledBanner();
});
