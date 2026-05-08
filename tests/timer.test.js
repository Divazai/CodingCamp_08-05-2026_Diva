// Feature: personal-dashboard — Timer widget tests
// Properties 4, 5

const fc = require('fast-check');
const { formatTimerDisplay, startTimer, stopTimer, resetTimer, tickTimer, timer } = require('../js/app.js');

// ─── Property 4: Timer display is always valid MM:SS ─────────────────────────
// Feature: personal-dashboard, Property 4: Timer display is always valid MM:SS
test('Property 4: formatTimerDisplay always produces valid MM:SS', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 1500 }), (seconds) => {
      const result = formatTimerDisplay(seconds);
      // Must match MM:SS pattern
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      // The represented time must equal the input
      const [mm, ss] = result.split(':').map(Number);
      expect(mm * 60 + ss).toBe(seconds);
    })
  );
});

// ─── Property 5: Timer reset always restores initial state ───────────────────
// Feature: personal-dashboard, Property 5: Timer reset always restores initial state
test('Property 5: resetTimer always restores remaining=1500 and running=false', () => {
  fc.assert(
    fc.property(
      fc.record({ remaining: fc.integer({ min: 0, max: 1500 }), running: fc.boolean() }),
      ({ remaining, running }) => {
        // Set timer to arbitrary state
        timer.remaining = remaining;
        timer.running = running;
        if (running) {
          // Simulate a running interval
          timer.intervalId = setInterval(() => {}, 100000);
        }
        resetTimer();
        expect(timer.remaining).toBe(1500);
        expect(timer.running).toBe(false);
      }
    )
  );
});

// ─── Unit tests (Task 5.3) ────────────────────────────────────────────────────

test('Timer initialises to 1500 seconds with running === false (Requirement 2.1)', () => {
  // Reset to known initial state first
  resetTimer();
  expect(timer.remaining).toBe(1500);
  expect(timer.running).toBe(false);
});

test('tickTimer decrements remaining by 1 (Requirement 2.2)', () => {
  resetTimer();
  const before = timer.remaining;
  tickTimer();
  expect(timer.remaining).toBe(before - 1);
  // Clean up any interval
  stopTimer();
});

test('stopTimer sets running === false and preserves remaining (Requirement 2.4)', () => {
  resetTimer();
  startTimer();
  expect(timer.running).toBe(true);
  const remainingBeforeStop = timer.remaining;
  stopTimer();
  expect(timer.running).toBe(false);
  expect(timer.remaining).toBe(remainingBeforeStop);
});

test('Timer stops at 0 and does not go negative (Requirement 2.6)', () => {
  resetTimer();
  timer.remaining = 1;
  tickTimer();
  expect(timer.remaining).toBe(0);
  expect(timer.running).toBe(false);
  // Calling tickTimer again should not go negative
  tickTimer();
  expect(timer.remaining).toBe(0);
});
