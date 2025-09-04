export const formatTime = (time) => {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const createTimerState = (time = 0, isStopwatch = true) => ({
  time,
  running: false,
  isStopwatch,
  initialTime: time,
});

export const startTimer = (timerState, onTick, onComplete) => {
  timerState.running = true;
  const interval = setInterval(() => {
    if (timerState.isStopwatch) {
      timerState.time++;
    } else if (timerState.time > 0) {
      timerState.time--;
      if (timerState.time === 0 && onComplete) {
        onComplete();
      }
    } else if (onComplete) {
      onComplete();
    }
    if (onTick) onTick(timerState.time);
  }, 1000);
  return interval;
};

export const stopTimer = (timerState, interval) => {
  clearInterval(interval);
  timerState.running = false;
};

export const resetTimer = (timerState, isStopwatch = timerState.isStopwatch) => {
  timerState.time = isStopwatch ? 0 : timerState.initialTime;
  timerState.running = false;
};

export const setCountdownTime = (timerState, minutes) => {
  timerState.time = minutes * 60;
  timerState.initialTime = timerState.time;
  timerState.isStopwatch = false;
};
