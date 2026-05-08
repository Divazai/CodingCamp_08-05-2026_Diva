# Requirements Document

## Introduction

A personal dashboard web app (MVP) delivered as a single-page application using one HTML file, one CSS file, and one JavaScript file. The dashboard provides four core widgets: a live greeting with date/time, a Pomodoro-style focus timer, a to-do list, and a quick-links panel. Task and link data are persisted in the browser's Local Storage so they survive page refreshes.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section that displays the current time, date, and a time-of-day greeting.
- **Timer**: The focus countdown timer widget.
- **Todo_List**: The widget that manages the user's task items.
- **Task**: A single to-do item stored in Local Storage.
- **Quick_Links**: The widget that displays user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link entry (label + URL) stored in Local Storage.
- **Local_Storage**: The browser's `localStorage` API used for client-side persistence.

---

## Requirements

### Requirement 1: Live Greeting

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an at-a-glance overview of the moment.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM:SS format, updated every second.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., Monday, January 1 2025).
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the local hour is between 18:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Evening".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL initialise with a countdown value of 25 minutes (1500 seconds) on page load.
2. WHEN the user activates the Start control, THE Timer SHALL begin counting down one second per real-world second.
3. WHILE the Timer is counting down, THE Timer SHALL update the displayed MM:SS value every second.
4. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the Reset control, THE Timer SHALL stop any active countdown and restore the displayed value to 25:00.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and display 00:00.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, mark complete, and delete tasks that persist across page refreshes, so that I can track my work without losing progress.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task description, THE Todo_List SHALL add a new Task to the list and save the updated list to Local Storage.
2. IF the user submits an empty task description, THEN THE Todo_List SHALL reject the submission and display an inline validation message.
3. WHEN the user activates the Edit control on a Task, THE Todo_List SHALL allow the user to modify the task description inline.
4. WHEN the user confirms an edit with a non-empty description, THE Todo_List SHALL update the Task text and save the updated list to Local Storage.
5. IF the user confirms an edit with an empty description, THEN THE Todo_List SHALL reject the update and retain the original task description.
6. WHEN the user activates the Mark-Done control on a Task, THE Todo_List SHALL toggle the Task's completion state and save the updated list to Local Storage.
7. WHEN the user activates the Delete control on a Task, THE Todo_List SHALL remove the Task from the list and save the updated list to Local Storage.
8. WHEN the Dashboard loads, THE Todo_List SHALL read all Tasks from Local Storage and render them in the order they were saved.
9. THE Todo_List SHALL visually distinguish completed Tasks from incomplete Tasks (e.g., strikethrough text).

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and open favourite website shortcuts from the dashboard, so that I can navigate to frequently visited pages with a single click.

#### Acceptance Criteria

1. WHEN the user submits a link label and a valid URL, THE Quick_Links widget SHALL add a new Link entry and save the updated link list to Local Storage.
2. IF the user submits a link with an empty label or an empty URL, THEN THE Quick_Links widget SHALL reject the submission and display an inline validation message.
3. WHEN the user activates a Link button, THE Quick_Links widget SHALL open the associated URL in a new browser tab.
4. WHEN the user activates the Delete control on a Link, THE Quick_Links widget SHALL remove the Link and save the updated link list to Local Storage.
5. WHEN the Dashboard loads, THE Quick_Links widget SHALL read all Links from Local Storage and render them as clickable buttons.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my tasks and quick links to be automatically saved in the browser, so that my data is available the next time I open the dashboard.

#### Acceptance Criteria

1. WHEN any Task is added, edited, toggled, or deleted, THE Dashboard SHALL serialise the complete Task array to Local Storage under a consistent key.
2. WHEN any Link is added or deleted, THE Dashboard SHALL serialise the complete Link array to Local Storage under a consistent key.
3. WHEN the Dashboard loads, THE Dashboard SHALL deserialise Tasks and Links from Local Storage and restore the previous state before rendering.
4. IF Local Storage data for Tasks or Links is absent or malformed, THEN THE Dashboard SHALL initialise the corresponding list as empty and continue loading without error.

---

### Requirement 6: Single-File Architecture

**User Story:** As a developer, I want the project to use exactly one CSS file and one JavaScript file, so that the codebase stays simple and maintainable.

#### Acceptance Criteria

1. THE Dashboard SHALL load all styles from exactly one CSS file located at `css/style.css`.
2. THE Dashboard SHALL load all JavaScript from exactly one JS file located at `js/app.js`.
3. THE Dashboard SHALL be fully functional when `index.html` is opened directly in a modern browser without a build step.
