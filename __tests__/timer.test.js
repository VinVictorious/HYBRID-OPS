import {
  formatTime,
  createTimerState,
  startTimer,
  stopTimer,
  resetTimer,
  setCountdownTime,
} from '../src/utils/timer.js';

describe('timer utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('formatTime formats seconds into mm:ss', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
  });

  test('startTimer increments stopwatch', () => {
    const state = createTimerState(0, true);
    const interval = startTimer(state);
    jest.advanceTimersByTime(3000);
    expect(state.time).toBe(3);
    stopTimer(state, interval);
  });

  test('countdown timer decrements and stops at zero', () => {
    const state = createTimerState(5, false);
    const onComplete = jest.fn();
    const interval = startTimer(state, undefined, onComplete);
    jest.advanceTimersByTime(6000);
    expect(state.time).toBe(0);
    expect(onComplete).toHaveBeenCalled();
    stopTimer(state, interval);
  });

  test('resetTimer resets based on mode', () => {
    const state = createTimerState(10, true);
    const interval = startTimer(state);
    jest.advanceTimersByTime(3000);
    resetTimer(state, true);
    expect(state.time).toBe(0);
    stopTimer(state, interval);

    const countdown = createTimerState();
    setCountdownTime(countdown, 1);
    const int2 = startTimer(countdown);
    jest.advanceTimersByTime(3000);
    resetTimer(countdown, false);
    expect(countdown.time).toBe(60);
    stopTimer(countdown, int2);
  });
});
