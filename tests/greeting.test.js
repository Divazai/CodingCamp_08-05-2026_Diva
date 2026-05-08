// Feature: personal-dashboard — Greeting widget tests
// Properties 1, 2, 3

const fc = require('fast-check');
const { formatTime, formatDate, getGreeting } = require('../js/app.js');

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

// Feature: personal-dashboard, Property 1: Time formatting is always valid HH:MM:SS
test('Property 1: formatTime always returns a valid HH:MM:SS string', () => {
  // Validates: Requirements 1.1
  fc.assert(
    fc.property(fc.date(), (date) => {
      const result = formatTime(date);

      // Must match HH:MM:SS pattern
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      const [hh, mm, ss] = result.split(':').map(Number);

      // HH must be 00-23
      expect(hh).toBeGreaterThanOrEqual(0);
      expect(hh).toBeLessThanOrEqual(23);

      // MM must be 00-59
      expect(mm).toBeGreaterThanOrEqual(0);
      expect(mm).toBeLessThanOrEqual(59);

      // SS must be 00-59
      expect(ss).toBeGreaterThanOrEqual(0);
      expect(ss).toBeLessThanOrEqual(59);

      // Values must match the actual date
      expect(hh).toBe(date.getHours());
      expect(mm).toBe(date.getMinutes());
      expect(ss).toBe(date.getSeconds());
    }),
    { numRuns: 1000 }
  );
});

// Feature: personal-dashboard, Property 2: Date formatting always contains weekday, month, day, and year
test('Property 2: formatDate always contains weekday, month name, day number, and 4-digit year', () => {
  // Validates: Requirements 1.2
  fc.assert(
    fc.property(fc.date(), (date) => {
      const result = formatDate(date);

      // Must contain a valid English weekday
      const expectedWeekday = WEEKDAYS[date.getDay()];
      expect(result).toContain(expectedWeekday);

      // Must contain a valid English month name
      const expectedMonth = MONTHS[date.getMonth()];
      expect(result).toContain(expectedMonth);

      // Must contain the correct day-of-month number
      const expectedDay = date.getDate();
      expect(result).toContain(String(expectedDay));

      // Must contain the correct 4-digit year
      const expectedYear = date.getFullYear();
      expect(result).toContain(String(expectedYear));
    }),
    { numRuns: 1000 }
  );
});

// Feature: personal-dashboard, Property 3: Greeting is determined solely by hour
test('Property 3: getGreeting returns exactly one of three strings with correct hour-range boundaries', () => {
  // Validates: Requirements 1.3, 1.4, 1.5
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
      const result = getGreeting(hour);

      // Must be exactly one of the three valid greetings
      const validGreetings = ['Good Morning', 'Good Afternoon', 'Good Evening'];
      expect(validGreetings).toContain(result);

      // Correct boundary: hours 5-11 → Good Morning
      if (hour >= 5 && hour <= 11) {
        expect(result).toBe('Good Morning');
      }

      // Correct boundary: hours 12-17 → Good Afternoon
      if (hour >= 12 && hour <= 17) {
        expect(result).toBe('Good Afternoon');
      }

      // Correct boundary: hours 18-23 and 0-4 → Good Evening
      if (hour >= 18 || hour <= 4) {
        expect(result).toBe('Good Evening');
      }
    }),
    { numRuns: 1000 }
  );
});
