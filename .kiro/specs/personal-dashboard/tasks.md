# Implementation Plan: Personal Dashboard

## Overview

Implement the personal dashboard as three static files (`index.html`, `css/style.css`, `js/app.js`) with no build step or external runtime dependencies. The implementation follows the data → render pattern described in the design: state is hydrated from `localStorage` on load, mutated in memory on user interaction, persisted back to `localStorage`, and the affected widget is re-rendered. A `tests/` directory holds Vitest + fast-check tests for all 15 correctness properties and the example-based unit tests.

## Tasks

- [x] 1. Scaffold project structure and set up the test harness
  - Create `tests/` directory with placeholder test files: `greeting.test.js`, `timer.test.js`, `todo.test.js`, `links.test.js`, `persistence.test.js`, `structure.test.js`
  - Add `package.json` with `vitest` and `fast-check` as dev dependencies and a `"test"` script (`vitest --run`)
  - Add `vitest.config.js` (or inline config in `package.json`) configured for the Node environment
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Build `index.html` — markup and asset wiring
  - Write the full HTML skeleton with `<link rel="stylesheet" href="css/style.css">` and `<script src="js/app.js" defer></script>`
  - Add the four widget sections with the exact IDs required by the design: `#greeting-widget`, `#timer-widget`, `#todo-widget`, `#links-widget`
  - Add all child elements referenced in the design (`#clock`, `#date-display`, `#greeting-message`, `#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`, `#todo-input`, `#btn-add-task`, `#todo-error`, `#task-list`, `#link-label-input`, `#link-url-input`, `#btn-add-link`, `#links-error`, `#links-list`)
  - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.1 Write structure unit tests
    - In `tests/structure.test.js`, assert `index.html` contains exactly one `<link>` to `css/style.css`
    - Assert `index.html` contains exactly one `<script>` pointing to `js/app.js`
    - _Requirements: 6.1, 6.2_

- [x] 3. Implement the `STORAGE` section and `STATE` object in `js/app.js`
  - Define the in-memory `state` object (`{ tasks: [], links: [] }`)
  - Implement `loadState()` with `try/catch` JSON parsing and empty-array fallback for both keys
  - Implement `saveTasks()` and `saveLinks()` using `localStorage.setItem`
  - Add the conditional export block at the bottom of the file so pure functions are available to the test runner
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 3.1 Write property test — Property 11: Persistence round-trip preserves tasks and links
    - **Property 11: Persistence round-trip preserves tasks and links**
    - **Validates: Requirements 3.8, 4.5, 5.3**
    - In `tests/persistence.test.js`, use `fc.array(taskArb)` and `fc.array(linkArb)` to verify that `saveTasks()` / `saveLinks()` followed by `loadState()` produces deeply equal arrays

  - [x] 3.2 Write property test — Property 15: Malformed localStorage always falls back to empty arrays
    - **Property 15: Malformed or absent localStorage data always falls back to empty arrays**
    - **Validates: Requirements 5.4**
    - In `tests/persistence.test.js`, use `fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined))` to verify `loadState()` returns `[]` and does not throw

- [x] 4. Implement the `GREETING` section
  - Implement `formatTime(date)` → `"HH:MM:SS"` string
  - Implement `formatDate(date)` → human-readable string containing weekday, month name, day, and year
  - Implement `getGreeting(hour)` → `"Good Morning"` / `"Good Afternoon"` / `"Good Evening"` based on hour ranges in the design
  - Implement `tickClock()` that reads `new Date()`, calls the formatters, derives the greeting, and writes to `#clock`, `#date-display`, and `#greeting-message`
  - Wire `tickClock()` to run once on init and then every 1 000 ms via `setInterval`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.1 Write property test — Property 1: Time formatting is always valid HH:MM:SS
    - **Property 1: Time formatting is always valid HH:MM:SS**
    - **Validates: Requirements 1.1**
    - In `tests/greeting.test.js`, use `fc.date()` to verify `formatTime(date)` always matches `/^\d{2}:\d{2}:\d{2}$/` with valid ranges

  - [x] 4.2 Write property test — Property 2: Date formatting always contains weekday, month, day, and year
    - **Property 2: Date formatting always contains weekday, month, day, and year**
    - **Validates: Requirements 1.2**
    - In `tests/greeting.test.js`, use `fc.date()` to verify `formatDate(date)` contains a valid English weekday, month name, day number, and 4-digit year

  - [x] 4.3 Write property test — Property 3: Greeting is determined solely by hour
    - **Property 3: Greeting is determined solely by hour**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - In `tests/greeting.test.js`, use `fc.integer({ min: 0, max: 23 })` to verify `getGreeting(hour)` returns exactly one of the three expected strings with correct hour-range boundaries

- [x] 5. Implement the `TIMER` section
  - Implement `formatTime(seconds)` → `"MM:SS"` string (note: reuse or alias the seconds-based formatter)
  - Define the `timer` state slice (`{ remaining: 1500, running: false, intervalId: null }`)
  - Implement `tickTimer()` — decrements `remaining`, stops and clears interval at 0
  - Implement `startTimer()`, `stopTimer()`, and `resetTimer()`
  - Wire button click handlers for `#btn-start`, `#btn-stop`, `#btn-reset`
  - Update `#timer-display` on every tick and on reset
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.1 Write property test — Property 4: Timer display is always valid MM:SS
    - **Property 4: Timer display is always valid MM:SS**
    - **Validates: Requirements 2.3**
    - In `tests/timer.test.js`, use `fc.integer({ min: 0, max: 1500 })` to verify `formatTime(seconds)` always matches `/^\d{2}:\d{2}$/` and the represented time equals the input

  - [x] 5.2 Write property test — Property 5: Timer reset always restores initial state
    - **Property 5: Timer reset always restores initial state**
    - **Validates: Requirements 2.5**
    - In `tests/timer.test.js`, use `fc.record({ remaining: fc.integer({min:0,max:1500}), running: fc.boolean() })` to verify `resetTimer()` always yields `remaining === 1500` and `running === false`

  - [x] 5.3 Write timer unit tests
    - Assert timer initialises to 1500 seconds with `running === false` (Requirement 2.1)
    - Assert `tickTimer()` decrements `remaining` by 1 (Requirement 2.2)
    - Assert `stopTimer()` sets `running === false` and preserves `remaining` (Requirement 2.4)
    - Assert timer stops at 0 and does not go negative (Requirement 2.6)
    - _Requirements: 2.1, 2.2, 2.4, 2.6_

- [x] 6. Checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all passing tests remain green; ask the user if any questions arise.

- [x] 7. Implement the `TODO` section
  - Implement `validateTaskInput(value)` — trims and returns `false` if empty
  - Implement `addTask(description)` — creates a task object with `crypto.randomUUID()` id, trims text, pushes to `state.tasks`, calls `saveTasks()`, calls `renderTasks()`
  - Implement `editTask(id, newDescription)` — validates, updates matching task's `text`, calls `saveTasks()`, calls `renderTasks()`
  - Implement `toggleTask(id)` — flips `done`, calls `saveTasks()`, calls `renderTasks()`
  - Implement `deleteTask(id)` — filters out the task, calls `saveTasks()`, calls `renderTasks()`
  - Implement `renderTasks()` — clears `#task-list` innerHTML, rebuilds `<li>` elements per the design template (checkbox, span with `done` class, Edit button, Delete button); wires inline edit mode on Edit click
  - Show/hide `#todo-error` based on validation result; wire `#btn-add-task` click and Enter key on `#todo-input`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 7.1 Write property test — Property 6: Adding a valid task always grows the list by one
    - **Property 6: Adding a valid task always grows the list by one**
    - **Validates: Requirements 3.1**
    - In `tests/todo.test.js`, use `fc.array(taskArb)` and `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` to verify list length increases by exactly 1 and `text` equals the trimmed description

  - [x] 7.2 Write property test — Property 7: Whitespace-only input is always rejected (task side)
    - **Property 7: Whitespace-only input is always rejected**
    - **Validates: Requirements 3.2**
    - In `tests/todo.test.js`, use `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` to verify `validateTaskInput` returns `false` and the task list remains unchanged

  - [x] 7.3 Write property test — Property 8: Editing a task with valid input always updates its text
    - **Property 8: Editing a task with valid input always updates its text**
    - **Validates: Requirements 3.4**
    - In `tests/todo.test.js`, use `fc.array(taskArb)` and a non-empty non-whitespace string to verify only the target task's `text` changes and `done` is preserved

  - [x] 7.4 Write property test — Property 9: Toggling a task twice restores its original state
    - **Property 9: Toggling a task twice restores its original state**
    - **Validates: Requirements 3.6**
    - In `tests/todo.test.js`, use `fc.record({ id: fc.uuid(), text: fc.string(), done: fc.boolean() })` to verify double-toggle is a no-op

  - [x] 7.5 Write property test — Property 10: Deleting a task removes exactly that task
    - **Property 10: Deleting a task removes exactly that task**
    - **Validates: Requirements 3.7**
    - In `tests/todo.test.js`, use `fc.array(taskArb, { minLength: 1 })` to verify list shrinks by 1, the deleted id is absent, and all other tasks are unchanged

  - [x] 7.6 Write property test — Property 12: Completed tasks are visually distinguished
    - **Property 12: Completed tasks are visually distinguished**
    - **Validates: Requirements 3.9**
    - In `tests/todo.test.js`, use `fc.array(taskArb)` to verify that after `renderTasks()` each `<li>` has the `done` CSS class if and only if the task's `done` field is `true`

- [x] 8. Implement the `LINKS` section
  - Implement `validateLinkInput(label, url)` — trims both fields, returns `false` if either is empty
  - Implement `addLink(label, url)` — creates a link object with id, pushes to `state.links`, calls `saveLinks()`, calls `renderLinks()`
  - Implement `deleteLink(id)` — filters out the link, calls `saveLinks()`, calls `renderLinks()`
  - Implement `renderLinks()` — clears `#links-list` innerHTML, rebuilds `<div class="link-item">` elements per the design template (`<a target="_blank" rel="noopener noreferrer">` + delete button)
  - Show/hide `#links-error` based on validation result; wire `#btn-add-link` click
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.1 Write property test — Property 13: Adding a valid link always grows the list by one
    - **Property 13: Adding a valid link always grows the list by one**
    - **Validates: Requirements 4.1**
    - In `tests/links.test.js`, use `fc.array(linkArb)`, `fc.string({ minLength: 1 })`, and `fc.webUrl()` to verify list length increases by 1 and `label`/`url` match the inputs

  - [x] 8.2 Write property test — Property 7: Whitespace-only input is always rejected (link side)
    - **Property 7: Whitespace-only input is always rejected (link label/URL)**
    - **Validates: Requirements 4.2**
    - In `tests/links.test.js`, use `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` to verify `validateLinkInput` returns `false` when label or URL is whitespace-only

  - [x] 8.3 Write property test — Property 14: Deleting a link removes exactly that link
    - **Property 14: Deleting a link removes exactly that link**
    - **Validates: Requirements 4.4**
    - In `tests/links.test.js`, use `fc.array(linkArb, { minLength: 1 })` to verify list shrinks by 1, the deleted id is absent, and all other links are unchanged

  - [x] 8.4 Write links unit tests
    - Assert rendered link elements have `target="_blank"` and the correct `href` (Requirement 4.3)
    - _Requirements: 4.3_

- [x] 9. Implement the `INIT` section and wire everything together
  - Implement the `DOMContentLoaded` handler that calls `loadState()`, populates `state`, then calls `renderTasks()`, `renderLinks()`, and starts `tickClock()` + `setInterval`
  - Verify all event listeners are attached inside the `DOMContentLoaded` callback
  - Confirm the conditional export block at the bottom of `js/app.js` exports all pure functions needed by the test suite
  - _Requirements: 3.8, 4.5, 5.3, 6.3_

- [x] 10. Write `css/style.css`
  - Add base layout styles for the dashboard grid / flex container
  - Style each widget section (`#greeting-widget`, `#timer-widget`, `#todo-widget`, `#links-widget`)
  - Add the `.done` class rule (e.g., `text-decoration: line-through; opacity: 0.6`) for completed tasks
  - Add styles for error messages (hidden by default via `display: none`), buttons, inputs, and link items
  - _Requirements: 3.9, 6.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all tests pass; ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 6 and 11) ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–15 from the design)
- Unit tests validate specific examples and edge cases
- The conditional export at the bottom of `js/app.js` is the bridge between the browser module and the Node-based test runner — it must be in place before any tests can run
