const STORAGE_KEYS = {
  done: 'om-lab-done',
  todo: 'om-lab-todo',
  current: 'om-lab-current',
  progress: 'om-lab-progress',
  currentUser: 'om-lab-current-user',
  lastActiveUser: 'om-lab-last-active-user',
  lastActiveTime: 'om-lab-last-active-time',
  tasksForOmar: 'om-lab-tasks-for-omar',
  tasksForMohamed: 'om-lab-tasks-for-mohamed',
  githubProjects: 'om-lab-github-projects',
};

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let doneList = load(STORAGE_KEYS.done, []);
let todoList = load(STORAGE_KEYS.todo, []);
let currentProject = load(STORAGE_KEYS.current, '') || '';
let currentProgress = Math.min(100, Math.max(0, Number(load(STORAGE_KEYS.progress, 0)) || 0));
let currentUser = load(STORAGE_KEYS.currentUser, 'mohamed') || 'mohamed';
let tasksForOmar = load(STORAGE_KEYS.tasksForOmar, []);
let tasksForMohamed = load(STORAGE_KEYS.tasksForMohamed, []);
let githubProjects = load(STORAGE_KEYS.githubProjects, []);
function ensureGithubItems(arr) {
  return arr.map((p) => {
    if (typeof p === 'string') return { id: Date.now() + Math.random(), name: p, url: '', hasPermission: false };
    return {
      id: p.id || Date.now() + Math.random(),
      name: p.name || '',
      url: p.url || '',
      hasPermission: !!p.hasPermission,
    };
  });
}
githubProjects = ensureGithubItems(githubProjects);

function taskItem(text) {
  return typeof text === 'string' ? { id: Date.now() + Math.random(), text } : text;
}
function ensureTaskItems(arr) {
  return arr.map((t) => (typeof t === 'string' ? { id: Date.now() + Math.random(), text: t } : t));
}
tasksForOmar = ensureTaskItems(tasksForOmar);
tasksForMohamed = ensureTaskItems(tasksForMohamed);

function persist() {
  save(STORAGE_KEYS.done, doneList);
  save(STORAGE_KEYS.todo, todoList);
  save(STORAGE_KEYS.current, currentProject);
  save(STORAGE_KEYS.progress, currentProgress);
  save(STORAGE_KEYS.currentUser, currentUser);
  save(STORAGE_KEYS.tasksForOmar, tasksForOmar);
  save(STORAGE_KEYS.tasksForMohamed, tasksForMohamed);
  save(STORAGE_KEYS.githubProjects, githubProjects);
}

// ---------- Splash ----------
const splash = document.getElementById('splash');
const mainContent = document.getElementById('main-content');
if (splash) {
  setTimeout(() => {
    splash.classList.add('hidden');
    if (mainContent) mainContent.style.visibility = '';
  }, 2500);
}
if (mainContent) mainContent.style.visibility = 'hidden';

// ---------- Presence ----------
function updatePresence() {
  const lastUser = load(STORAGE_KEYS.lastActiveUser, '');
  const lastTime = load(STORAGE_KEYS.lastActiveTime, 0);
  save(STORAGE_KEYS.lastActiveUser, currentUser);
  save(STORAGE_KEYS.lastActiveTime, Date.now());

  const el = document.getElementById('presence');
  if (!el) return;
  if (!lastUser || lastUser === currentUser) {
    el.textContent = 'You are ' + (currentUser === 'mohamed' ? 'Mohamed' : 'Omar');
    return;
  }
  const otherName = lastUser === 'mohamed' ? 'Mohamed' : 'Omar';
  const when = lastTime ? formatWhen(lastTime) : 'recently';
  el.innerHTML = '<strong>' + otherName + '</strong> was last here ' + when;
}
function formatWhen(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' h ago';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------- User switcher ----------
function setCurrentUser(user) {
  currentUser = user === 'omar' ? 'omar' : 'mohamed';
  save(STORAGE_KEYS.currentUser, currentUser);
  const btnMohamed = document.getElementById('btn-mohamed');
  const btnOmar = document.getElementById('btn-omar');
  btnMohamed.classList.toggle('active', currentUser === 'mohamed');
  btnOmar.classList.toggle('active', currentUser === 'omar');
  btnMohamed.setAttribute('aria-pressed', currentUser === 'mohamed');
  btnOmar.setAttribute('aria-pressed', currentUser === 'omar');
  updatePresence();
  updateOtherNames();
  renderTasks();
}

function updateOtherNames() {
  const other = currentUser === 'mohamed' ? 'Omar' : 'Mohamed';
  const el1 = document.getElementById('other-name');
  const el2 = document.getElementById('other-name-from');
  if (el1) el1.textContent = other;
  if (el2) el2.textContent = other;
}

function renderList(containerId, items, onRemove) {
  const ul = document.getElementById(containerId);
  if (!ul) return;
  ul.innerHTML = items
    .map(
      (item, i) => {
        const text = typeof item === 'string' ? item : (item && item.text);
        return `<li>
          <span>${escapeHtml(text || '')}</span>
          <button type="button" class="btn-remove" data-index="${i}" aria-label="Remove">×</button>
        </li>`;
      }
    )
    .join('');

  ul.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', () => onRemove(Number(btn.dataset.index)));
  });
}

function normalizeGithubUrl(url) {
  const u = (url || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) return 'https://' + u;
  return u;
}

function renderGithubList() {
  const ul = document.getElementById('github-list');
  if (!ul) return;
  ul.innerHTML = githubProjects
    .map(
      (p, i) => {
        const name = escapeHtml(p.name || 'Unnamed');
        const url = normalizeGithubUrl(p.url);
        const link = url
          ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="github-link">View code</a>`
          : '<span class="github-no-url">— no URL —</span>';
        const permId = 'github-perm-' + i;
        const checked = p.hasPermission ? ' checked' : '';
        return `<li class="github-item">
          <div class="github-item-main">
            <span class="github-name">${name}</span>
            ${link}
          </div>
          <label class="github-permission">
            <input type="checkbox" id="${permId}" data-index="${i}"${checked} />
            <span>I have permission to change this code</span>
          </label>
          <button type="button" class="btn-remove" data-index="${i}" aria-label="Remove">×</button>
        </li>`;
      }
    )
    .join('');

  ul.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      githubProjects.splice(Number(btn.dataset.index), 1);
      save(STORAGE_KEYS.githubProjects, githubProjects);
      render();
    });
  });
  ul.querySelectorAll('.github-permission input').forEach((cb) => {
    cb.addEventListener('change', () => {
      const i = Number(cb.dataset.index);
      if (githubProjects[i]) {
        githubProjects[i].hasPermission = cb.checked;
        save(STORAGE_KEYS.githubProjects, githubProjects);
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function addToList(list, item, key) {
  const t = (item || '').trim();
  if (!t) return;
  list.push(t);
  save(key, list);
  render();
}

function removeFromList(list, index, key) {
  list.splice(index, 1);
  save(key, list);
  render();
}

// ---------- Task exchange ----------
function getTasksForOther() {
  return currentUser === 'mohamed' ? tasksForOmar : tasksForMohamed;
}
function getTasksForMe() {
  return currentUser === 'mohamed' ? tasksForMohamed : tasksForOmar;
}
function getTasksForOtherKey() {
  return currentUser === 'mohamed' ? STORAGE_KEYS.tasksForOmar : STORAGE_KEYS.tasksForMohamed;
}
function getTasksForMeKey() {
  return currentUser === 'mohamed' ? STORAGE_KEYS.tasksForMohamed : STORAGE_KEYS.tasksForOmar;
}

function renderTasks() {
  const forOther = getTasksForOther();
  const forMe = getTasksForMe();
  renderList('tasks-for-other-list', forOther, (i) => {
    const list = getTasksForOther();
    list.splice(i, 1);
    save(getTasksForOtherKey(), list);
    render();
    renderTasks();
  });
  renderList('tasks-for-me-list', forMe, (i) => {
    const list = getTasksForMe();
    list.splice(i, 1);
    save(getTasksForMeKey(), list);
    render();
    renderTasks();
  });
}

function render() {
  renderList('done-list', doneList, (i) => {
    removeFromList(doneList, i, STORAGE_KEYS.done);
  });
  renderList('todo-list', todoList, (i) => {
    removeFromList(todoList, i, STORAGE_KEYS.todo);
  });

  const nameDisplay = document.getElementById('current-name-display');
  const progressFill = document.getElementById('current-progress-fill');
  const progressLabel = document.getElementById('current-progress-label');

  if (currentProject) {
    nameDisplay.textContent = currentProject;
    progressFill.style.width = currentProgress + '%';
    progressLabel.textContent = currentProgress + '%';
  } else {
    nameDisplay.textContent = '— No current project —';
    progressFill.style.width = '0%';
    progressLabel.textContent = '0%';
  }

  const slider = document.getElementById('progress-slider');
  const valueSpan = document.getElementById('progress-value');
  const fill = document.getElementById('progress-fill');
  if (slider) {
    slider.value = currentProgress;
    valueSpan.textContent = currentProgress;
    fill.style.width = currentProgress + '%';
  }

  renderTasks();
  renderGithubList();
}

// ---------- Event listeners ----------
document.getElementById('done-add').addEventListener('click', () => {
  const input = document.getElementById('done-input');
  addToList(doneList, input.value, STORAGE_KEYS.done);
  input.value = '';
  input.focus();
});
document.getElementById('done-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('done-add').click();
});

document.getElementById('todo-add').addEventListener('click', () => {
  const input = document.getElementById('todo-input');
  addToList(todoList, input.value, STORAGE_KEYS.todo);
  input.value = '';
  input.focus();
});
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('todo-add').click();
});

const progressSlider = document.getElementById('progress-slider');
const progressValue = document.getElementById('progress-value');
const progressFill = document.getElementById('progress-fill');
progressSlider.addEventListener('input', () => {
  const v = Number(progressSlider.value);
  progressValue.textContent = v;
  progressFill.style.width = v + '%';
  currentProgress = v;
  save(STORAGE_KEYS.progress, currentProgress);
  render();
});

document.getElementById('set-current').addEventListener('click', () => {
  const input = document.getElementById('current-name');
  const name = (input.value || '').trim();
  if (name) {
    currentProject = name;
    currentProgress = Number(progressSlider.value) || 0;
    persist();
    render();
  }
});

document.getElementById('btn-mohamed').addEventListener('click', () => setCurrentUser('mohamed'));
document.getElementById('btn-omar').addEventListener('click', () => setCurrentUser('omar'));

document.getElementById('task-for-other-add').addEventListener('click', () => {
  const input = document.getElementById('task-for-other-input');
  const list = getTasksForOther();
  const key = getTasksForOtherKey();
  const t = (input.value || '').trim();
  if (!t) return;
  list.push(taskItem(t));
  save(key, list);
  input.value = '';
  input.focus();
  renderTasks();
});
document.getElementById('task-for-other-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('task-for-other-add').click();
});

document.getElementById('github-add').addEventListener('click', () => {
  const nameInput = document.getElementById('github-name');
  const urlInput = document.getElementById('github-url');
  const name = (nameInput.value || '').trim();
  const url = (urlInput.value || '').trim();
  if (!name) return;
  githubProjects.push({
    id: Date.now() + Math.random(),
    name,
    url: normalizeGithubUrl(url) || url,
    hasPermission: false,
  });
  save(STORAGE_KEYS.githubProjects, githubProjects);
  nameInput.value = '';
  urlInput.value = '';
  nameInput.focus();
  render();
});
document.getElementById('github-url').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('github-add').click();
});
document.getElementById('github-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('github-add').click();
});

// ---------- Init ----------
updatePresence();
updateOtherNames();
render();
