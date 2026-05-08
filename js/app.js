// Personal Dashboard — js/app.js
// Sections: STATE | STORAGE | GREETING | TIMER | TODO | LINKS | INIT

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  tasks: [],
  links: [],
};

// ─── TIMER STATE ──────────────────────────────────────────────────────────────

const timer = {
  remaining: 1500,
  running: false,
  intervalId: null,
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────

function loadState() {
  let tasks = [];
  let links = [];
  try {
    const rawTasks = localStorage.getItem('pd_tasks');
    const parsed = JSON.parse(rawTasks);
    if (Array.isArray(parsed)) tasks = parsed;
  } catch (_) {}
  try {
    const rawLinks = localStorage.getItem('pd_links');
    const parsed = JSON.parse(rawLinks);
    if (Array.isArray(parsed)) links = parsed;
  } catch (_) {}
  return { tasks, links };
}

function saveTasks() {
  localStorage.setItem('pd_tasks', JSON.stringify(state.tasks));
}

function saveLinks() {
  localStorage.setItem('pd_links', JSON.stringify(state.links));
}

// ─── GREETING ─────────────────────────────────────────────────────────────────

function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatDate(date) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${day} ${year}`;
}

function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  return 'Good Evening';
}

function tickClock() {
  if (typeof document === 'undefined') return;
  const now = new Date();
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date-display');
  const greetingEl = document.getElementById('greeting-message');
  if (clockEl) clockEl.textContent = formatTime(now);
  if (dateEl) dateEl.textContent = formatDate(now);
  if (greetingEl) greetingEl.textContent = getGreeting(now.getHours());
}

// ─── TIMER ────────────────────────────────────────────────────────────────────

function formatTimerDisplay(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function tickTimer() {
  if (timer.remaining <= 0) {
    timer.remaining = 0;
    clearInterval(timer.intervalId);
    timer.intervalId = null;
    timer.running = false;
    if (typeof document !== 'undefined') {
      const display = document.getElementById('timer-display');
      if (display) display.textContent = '00:00';
    }
    return;
  }
  timer.remaining -= 1;
  if (typeof document !== 'undefined') {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatTimerDisplay(timer.remaining);
  }
  if (timer.remaining <= 0) {
    clearInterval(timer.intervalId);
    timer.intervalId = null;
    timer.running = false;
    if (typeof document !== 'undefined') {
      const display = document.getElementById('timer-display');
      if (display) display.textContent = '00:00';
    }
  }
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  timer.intervalId = setInterval(tickTimer, 1000);
  if (typeof document !== 'undefined') {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatTimerDisplay(timer.remaining);
  }
}

function stopTimer() {
  clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.running = false;
}

function resetTimer() {
  stopTimer();
  timer.remaining = 1500;
  if (typeof document !== 'undefined') {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = '25:00';
  }
}

function initTimer() {
  if (typeof document === 'undefined') return;
  const btnStart = document.getElementById('btn-start');
  const btnStop = document.getElementById('btn-stop');
  const btnReset = document.getElementById('btn-reset');
  const display = document.getElementById('timer-display');
  if (display) display.textContent = '25:00';
  if (btnStart) btnStart.addEventListener('click', startTimer);
  if (btnStop) btnStop.addEventListener('click', stopTimer);
  if (btnReset) btnReset.addEventListener('click', resetTimer);
}

// ─── TODO ─────────────────────────────────────────────────────────────────────

function validateTaskInput(value) {
  return value.trim().length > 0;
}

function addTask(description) {
  if (!validateTaskInput(description)) {
    if (typeof document !== 'undefined') {
      const errorEl = document.getElementById('todo-error');
      if (errorEl) errorEl.style.display = 'block';
    }
    return;
  }
  if (typeof document !== 'undefined') {
    const errorEl = document.getElementById('todo-error');
    if (errorEl) errorEl.style.display = 'none';
  }
  const task = {
    id: crypto.randomUUID(),
    text: description.trim(),
    done: false,
  };
  state.tasks.push(task);
  saveTasks();
  renderTasks();
}

function editTask(id, newDescription) {
  if (!validateTaskInput(newDescription)) {
    return;
  }
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.text = newDescription.trim();
    saveTasks();
    renderTasks();
  }
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  if (typeof document === 'undefined') return;
  const list = document.getElementById('task-list');
  if (!list) return;
  list.innerHTML = '';
  state.tasks.forEach(task => {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text' + (task.done ? ' done' : '');
    span.textContent = task.text;

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-edit';
    btnEdit.textContent = 'Edit';
    btnEdit.addEventListener('click', () => {
      // Enter inline edit mode: replace span with input + confirm button
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;

      const btnConfirm = document.createElement('button');
      btnConfirm.textContent = 'Confirm';
      btnConfirm.addEventListener('click', () => {
        editTask(task.id, editInput.value);
      });

      li.replaceChild(editInput, span);
      li.replaceChild(btnConfirm, btnEdit);
    });

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-delete';
    btnDelete.textContent = 'Delete';
    btnDelete.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    list.appendChild(li);
  });
}

function initTodo() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('todo-input');
  const btnAdd = document.getElementById('btn-add-task');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (input) {
        addTask(input.value);
        if (validateTaskInput(input.value)) input.value = '';
      }
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addTask(input.value);
        if (validateTaskInput(input.value)) input.value = '';
      }
    });
  }
}

// ─── LINKS ────────────────────────────────────────────────────────────────────

function validateLinkInput(label, url) {
  return label.trim().length > 0 && url.trim().length > 0;
}

function addLink(label, url) {
  if (!validateLinkInput(label, url)) {
    if (typeof document !== 'undefined') {
      const errorEl = document.getElementById('links-error');
      if (errorEl) errorEl.style.display = 'block';
    }
    return;
  }
  if (typeof document !== 'undefined') {
    const errorEl = document.getElementById('links-error');
    if (errorEl) errorEl.style.display = 'none';
  }
  const link = {
    id: crypto.randomUUID(),
    label: label.trim(),
    url: url.trim(),
  };
  state.links.push(link);
  saveLinks();
  renderLinks();
}

function deleteLink(id) {
  state.links = state.links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

function renderLinks() {
  if (typeof document === 'undefined') return;
  const list = document.getElementById('links-list');
  if (!list) return;
  list.innerHTML = '';
  state.links.forEach(link => {
    const div = document.createElement('div');
    div.className = 'link-item';
    div.setAttribute('data-id', link.id);

    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.label;

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-delete-link';
    btnDelete.textContent = '×';
    btnDelete.addEventListener('click', () => deleteLink(link.id));

    div.appendChild(a);
    div.appendChild(btnDelete);
    list.appendChild(div);
  });
}

function initLinks() {
  if (typeof document === 'undefined') return;
  const labelInput = document.getElementById('link-label-input');
  const urlInput = document.getElementById('link-url-input');
  const btnAdd = document.getElementById('btn-add-link');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const label = labelInput ? labelInput.value : '';
      const url = urlInput ? urlInput.value : '';
      addLink(label, url);
      if (validateLinkInput(label, url)) {
        if (labelInput) labelInput.value = '';
        if (urlInput) urlInput.value = '';
      }
    });
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const loaded = loadState();
    state.tasks = loaded.tasks;
    state.links = loaded.links;
    renderTasks();
    renderLinks();
    initTimer();
    initTodo();
    initLinks();
    tickClock();
    setInterval(tickClock, 1000);
  });
}

// ─── CONDITIONAL EXPORT (Node / test runner) ──────────────────────────────────

if (typeof module !== 'undefined') {
  module.exports = {
    state,
    timer,
    loadState,
    saveTasks,
    saveLinks,
    formatTime,
    formatDate,
    getGreeting,
    tickClock,
    formatTimerDisplay,
    startTimer,
    stopTimer,
    resetTimer,
    tickTimer,
    initTimer,
    validateTaskInput,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    renderTasks,
    initTodo,
    validateLinkInput,
    addLink,
    deleteLink,
    renderLinks,
    initLinks,
  };
}
