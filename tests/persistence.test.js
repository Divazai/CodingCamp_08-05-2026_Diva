// Feature: personal-dashboard — Persistence tests
// Properties 11, 15

const fc = require('fast-check');

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock;

const { loadState, saveTasks, saveLinks, state } = require('../js/app.js');

// Arbitraries
const taskArb = fc.record({
  id: fc.uuid(),
  text: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  done: fc.boolean(),
});

const linkArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  url: fc.webUrl(),
});

// Property 11: Persistence round-trip preserves tasks and links
// Validates: Requirements 3.8, 4.5, 5.3
test('Property 11: persistence round-trip preserves tasks and links', () => {
  fc.assert(
    fc.property(fc.array(taskArb), fc.array(linkArb), (tasks, links) => {
      // Set state and persist
      state.tasks = tasks;
      state.links = links;
      saveTasks();
      saveLinks();

      // Load back and verify deep equality
      const loaded = loadState();
      expect(loaded.tasks).toEqual(tasks);
      expect(loaded.links).toEqual(links);
    })
  );
});

// Property 15: Malformed or absent localStorage data always falls back to empty arrays
// Validates: Requirements 5.4
test('Property 15: malformed or absent localStorage data always falls back to empty arrays', () => {
  fc.assert(
    fc.property(
      fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
      fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
      (rawTasks, rawLinks) => {
        // Set raw (potentially malformed) values in localStorage
        if (rawTasks === undefined) {
          localStorage.removeItem('pd_tasks');
        } else if (rawTasks === null) {
          localStorage.setItem('pd_tasks', 'null');
        } else {
          localStorage.setItem('pd_tasks', rawTasks);
        }

        if (rawLinks === undefined) {
          localStorage.removeItem('pd_links');
        } else if (rawLinks === null) {
          localStorage.setItem('pd_links', 'null');
        } else {
          localStorage.setItem('pd_links', rawLinks);
        }

        // loadState must not throw and must return arrays
        let result;
        expect(() => {
          result = loadState();
        }).not.toThrow();

        expect(Array.isArray(result.tasks)).toBe(true);
        expect(Array.isArray(result.links)).toBe(true);
      }
    )
  );
});
