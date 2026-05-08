// Feature: personal-dashboard — To-do list tests
// Properties 6, 7, 8, 9, 10, 12

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

const { addTask, editTask, toggleTask, deleteTask, validateTaskInput, renderTasks, state } = require('../js/app.js');

// Arbitrary for a valid task object
const taskArb = fc.record({
  id: fc.uuid(),
  text: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  done: fc.boolean(),
});

// Helper to reset state before each property run
function resetState(tasks) {
  state.tasks = tasks.map(t => ({ ...t }));
}

// Property 6: Adding a valid task always grows the list by one
// Validates: Requirements 3.1
test('Property 6: adding a valid task always grows the list by one', () => {
  fc.assert(
    fc.property(
      fc.array(taskArb),
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
      (tasks, description) => {
        resetState(tasks);
        const before = state.tasks.length;
        addTask(description);
        expect(state.tasks.length).toBe(before + 1);
        const added = state.tasks[state.tasks.length - 1];
        expect(added.text).toBe(description.trim());
        expect(added.done).toBe(false);
      }
    )
  );
});

// Property 7: Whitespace-only input is always rejected (task side)
// Validates: Requirements 3.2
test('Property 7: whitespace-only input is always rejected', () => {
  fc.assert(
    fc.property(
      fc.array(taskArb),
      fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
      (tasks, whitespace) => {
        resetState(tasks);
        const before = state.tasks.length;
        expect(validateTaskInput(whitespace)).toBe(false);
        addTask(whitespace);
        expect(state.tasks.length).toBe(before);
      }
    )
  );
});

// Property 8: Editing a task with valid input always updates its text
// Validates: Requirements 3.4
test('Property 8: editing a task with valid input always updates its text', () => {
  fc.assert(
    fc.property(
      fc.array(taskArb, { minLength: 1 }),
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
      fc.integer({ min: 0 }),
      (tasks, newText, indexSeed) => {
        resetState(tasks);
        const index = indexSeed % tasks.length;
        const targetId = state.tasks[index].id;
        const originalDone = state.tasks[index].done;
        const othersBefore = state.tasks.filter(t => t.id !== targetId).map(t => ({ ...t }));

        editTask(targetId, newText);

        const updated = state.tasks.find(t => t.id === targetId);
        expect(updated).toBeDefined();
        expect(updated.text).toBe(newText.trim());
        // done state is preserved
        expect(updated.done).toBe(originalDone);
        // all other tasks are unchanged
        const othersAfter = state.tasks.filter(t => t.id !== targetId);
        expect(othersAfter).toEqual(othersBefore);
      }
    )
  );
});

// Property 9: Toggling a task twice restores its original state
// Validates: Requirements 3.6
test('Property 9: toggling a task twice restores its original state', () => {
  fc.assert(
    fc.property(
      fc.record({ id: fc.uuid(), text: fc.string(), done: fc.boolean() }),
      (task) => {
        state.tasks = [{ ...task }];
        const originalDone = task.done;
        toggleTask(task.id);
        toggleTask(task.id);
        expect(state.tasks[0].done).toBe(originalDone);
      }
    )
  );
});

// Property 10: Deleting a task removes exactly that task
// Validates: Requirements 3.7
test('Property 10: deleting a task removes exactly that task', () => {
  fc.assert(
    fc.property(
      fc.array(taskArb, { minLength: 1 }),
      fc.integer({ min: 0 }),
      (tasks, indexSeed) => {
        resetState(tasks);
        const index = indexSeed % tasks.length;
        const targetId = state.tasks[index].id;
        const before = state.tasks.length;
        const othersBefore = state.tasks.filter(t => t.id !== targetId).map(t => ({ ...t }));

        deleteTask(targetId);

        expect(state.tasks.length).toBe(before - 1);
        expect(state.tasks.find(t => t.id === targetId)).toBeUndefined();
        expect(state.tasks).toEqual(othersBefore);
      }
    )
  );
});

// Property 12: Completed tasks are visually distinguished
// Validates: Requirements 3.9
// We test the logic by using a minimal document mock that records created elements.
test('Property 12: completed tasks have the done CSS class, incomplete tasks do not', () => {
  fc.assert(
    fc.property(
      fc.array(taskArb),
      (tasks) => {
        // Build a minimal DOM mock that captures the rendered output
        const createdItems = [];

        const makeMockElement = (tag) => {
          const el = {
            _tag: tag,
            _children: [],
            _attrs: {},
            _listeners: {},
            className: '',
            textContent: '',
            type: '',
            checked: false,
            innerHTML: '',
            style: {},
            setAttribute(k, v) { this._attrs[k] = v; },
            getAttribute(k) { return this._attrs[k]; },
            addEventListener(ev, fn) { this._listeners[ev] = fn; },
            appendChild(child) { this._children.push(child); },
            replaceChild() {},
          };
          return el;
        };

        const mockList = makeMockElement('ul');
        mockList.innerHTML = '';

        const savedDocument = global.document;
        global.document = {
          getElementById(id) {
            if (id === 'task-list') return mockList;
            return null;
          },
          createElement(tag) {
            const el = makeMockElement(tag);
            if (tag === 'li') createdItems.push(el);
            return el;
          },
        };

        // Override appendChild on mockList to track children
        mockList.appendChild = (child) => { mockList._children.push(child); };

        resetState(tasks);
        renderTasks();

        // Restore document
        global.document = savedDocument;

        // Verify each li's span has the correct class
        expect(createdItems.length).toBe(tasks.length);
        createdItems.forEach((li, i) => {
          const task = tasks[i];
          // Find the span child (task-text span)
          const span = li._children.find(c => c._tag === 'span');
          expect(span).toBeDefined();
          if (task.done) {
            expect(span.className).toContain('done');
          } else {
            expect(span.className).not.toContain('done');
          }
        });
      }
    )
  );
});
