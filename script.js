const STORAGE_KEYS = {
  users: 'stwilliamsUsers',
  session: 'stwilliamsSession',
  assignments: 'stwilliamsAssignments',
  admin: 'stwilliamsAdminSession'
};

const ADMIN_PASSWORD = 'church12';
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SAMPLE_ASSIGNMENTS = [
  { name: 'Mary Johnson', date: '2026-11-08', day: 'Sunday', time: '08:00', type: 'First Reading' },
  { name: 'Joseph Martin', date: '2026-11-08', day: 'Sunday', time: '09:30', type: 'Responsorial Psalm' },
  { name: 'Grace Okafor', date: '2026-11-08', day: 'Sunday', time: '10:00', type: 'Gospel' },
  { name: 'Daniel Smith', date: '2026-11-09', day: 'Monday', time: '07:00', type: 'Lector Reading' },
  { name: 'Alicia Brown', date: '2026-11-10', day: 'Tuesday', time: '06:30', type: 'First Reading' },
  { name: 'Peter Akin', date: '2026-11-11', day: 'Wednesday', time: '18:00', type: 'Psalm' },
  { name: 'Rosemary Nwosu', date: '2026-11-12', day: 'Thursday', time: '19:00', type: 'Lector Reading' },
  { name: 'Samuel Mensah', date: '2026-11-13', day: 'Friday', time: '17:30', type: 'First Reading' },
  { name: 'Faith Green', date: '2026-11-14', day: 'Saturday', time: '16:00', type: 'Psalm' },
  { name: 'Thomas Reid', date: '2026-11-15', day: 'Sunday', time: '08:45', type: 'Gospel' }
];

const feastDays = {
  '01-01': 'Solemnity of Mary, Mother of God',
  '01-06': 'Epiphany of the Lord',
  '02-02': 'Presentation of the Lord',
  '03-19': 'Saint Joseph, Husband of Mary',
  '03-25': 'Annunciation of the Lord',
  '04-16': 'Saint Bernadette Soubirous',
  '05-01': 'Saint Joseph the Worker',
  '05-13': 'Our Lady of Fatima',
  '06-29': 'Saints Peter and Paul',
  '08-15': 'Assumption of the Blessed Virgin Mary',
  '09-08': 'Nativity of the Blessed Virgin Mary',
  '11-01': 'All Saints\' Day',
  '12-08': 'Immaculate Conception',
  '12-25': 'Christmas Day',
};

const defaultReadings = [
  'Genesis 1:1-5; Psalm 29:1-11; Matthew 5:1-12',
  'Isaiah 40:1-11; Psalm 96:1-3, 7-10; Matthew 18:12-14',
  '1 Samuel 1:9-20; Psalm 84:2-6; Luke 1:46-56',
  'Exodus 14:15-31; Psalm 114:1-6; Matthew 28:16-20',
  'Proverbs 3:5-12; Psalm 34:8-14; Luke 10:25-37',
  'Romans 5:1-5; Psalm 103:1-4, 8-13; John 14:1-6',
  'Hebrews 11:1-2, 8-19; Psalm 33:4-9; Mark 4:35-41'
];

function getDateString(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function isLoggedIn() {
  const session = readStorage(STORAGE_KEYS.session, null);
  return Boolean(session && session.email);
}

function getCurrentSession() {
  return readStorage(STORAGE_KEYS.session, null);
}

function setCurrentSession(user) {
  saveStorage(STORAGE_KEYS.session, user);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  updateAuthState();
  showView('login');
  showToast('You have been logged out.');
}

function showView(viewName) {
  const sections = document.querySelectorAll('.view');
  sections.forEach((section) => {
    section.classList.toggle('active', section.id === `${viewName}View`);
  });

  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  navLinks.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });

  if (viewName === 'dashboard' && !isLoggedIn()) {
    showView('login');
  }
}

function bindViewTriggers() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view === 'dashboard' && !isLoggedIn()) {
        showView('login');
        return;
      }
      showView(view);
    });
  });

  document.querySelectorAll('[data-view-trigger]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showView(link.dataset.viewTrigger);
    });
  });
}

function updateAuthState() {
  const session = getCurrentSession();
  const logoutBtn = document.getElementById('logoutBtn');
  const isLogged = Boolean(session && session.name);

  if (logoutBtn) {
    logoutBtn.classList.toggle('hidden', !isLogged);
  }

  if (isLogged) {
    const name = session.name || 'Lector';
    const greeting = document.getElementById('dashboardGreeting');
    if (greeting) {
      greeting.textContent = `Welcome, ${name}.`;
    }
  }
}

function createUser(user) {
  const users = readStorage(STORAGE_KEYS.users, []);
  users.push(user);
  saveStorage(STORAGE_KEYS.users, users);
}

function findUser(email) {
  const users = readStorage(STORAGE_KEYS.users, []);
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function validateSignupForm(name, email, password) {
  if (!name || !email || !password) {
    return 'Please complete all signup fields.';
  }

  if (password.length > 8) {
    return 'Password must be 8 characters or less.';
  }

  if (findUser(email)) {
    return 'An account already exists for this email.';
  }

  return '';
}

function handleSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.querySelector('#signupName').value.trim();
  const email = form.querySelector('#signupEmail').value.trim();
  const password = form.querySelector('#signupPassword').value.trim();

  const validationMessage = validateSignupForm(name, email, password);
  if (validationMessage) {
    showToast(validationMessage);
    return;
  }

  createUser({ name, email, password });
  form.reset();
  showToast('Account created successfully. Please login.');
  showView('login');
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector('#loginEmail').value.trim();
  const password = form.querySelector('#loginPassword').value.trim();
  const user = findUser(email);

  if (!user || user.password !== password) {
    showToast('Incorrect email or password.');
    return;
  }

  setCurrentSession({ name: user.name, email: user.email });
  updateAuthState();
  renderAssignments();
  form.reset();
  showView('dashboard');
  showToast('Login successful.');
}

function getAssignments() {
  const stored = readStorage(STORAGE_KEYS.assignments, []);
  if (!Array.isArray(stored) || stored.length === 0) {
    saveStorage(STORAGE_KEYS.assignments, SAMPLE_ASSIGNMENTS);
    return SAMPLE_ASSIGNMENTS;
  }
  return stored;
}

function saveAssignments(list) {
  saveStorage(STORAGE_KEYS.assignments, list);
}

function formatDate(value) {
  const safeDate = new Date(`${value}T00:00:00`);
  return safeDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return '—';
  const [hour, minute] = value.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute));
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function renderAssignments() {
  const assignments = getAssignments().sort((a, b) => new Date(a.date) - new Date(b.date));
  const readerList = document.getElementById('readerList');
  const tableBody = document.getElementById('assignmentTableBody');
  const statusText = document.getElementById('dashboardSummary');

  if (!readerList || !tableBody) {
    return;
  }

  if (!assignments.length) {
    readerList.innerHTML = '<li class="empty-state">No readings added yet.</li>';
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state-cell">No entries yet.</td></tr>';
    if (statusText) {
      statusText.textContent = '0 readers assigned';
    }
    return;
  }

  readerList.innerHTML = assignments.map((item) => `
    <li>
      <span>${item.name}</span>
      <span class="pill">${item.type}</span>
    </li>
  `).join('');

  tableBody.innerHTML = assignments.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${formatDate(item.date)}</td>
      <td>${item.day}</td>
      <td>${formatTime(item.time)}</td>
      <td>${item.type}</td>
    </tr>
  `).join('');

  if (statusText) {
    statusText.textContent = assignments.length === 1 ? '1 reader assigned' : `${assignments.length} readers assigned`;
  }
}

function getLiturgicalInfo(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;
  const feast = feastDays[key] || 'Ordinary Time';
  return {
    celebration: feast,
    daily: getDailyReading(date),
    sunday: getSundayReading(date)
  };
}

function getDailyReading(date) {
  if (date.getDay() === 0) {
    return 'Luke 6:12-19 — Jesus chose the twelve apostles and taught the people.';
  }

  const index = (date.getDate() + date.getMonth()) % defaultReadings.length;
  return defaultReadings[index];
}

function getSundayReading(date) {
  if (date.getDay() !== 0) {
    return 'Sunday readings are displayed for the selected Sunday date.';
  }

  const cycle = (date.getFullYear() + date.getMonth()) % 3;
  const sundayReadings = [
    'Isaiah 56:1, 6-7; Psalm 67:2-3, 5-6, 8; Romans 11:17-24; Matthew 15:21-28',
    'Jeremiah 17:5-8; Psalm 1:1-4, 6; 1 Corinthians 15:12, 16-20; Luke 6:17, 20-26',
    'Joshua 24:1-2, 15-18; Psalm 34:2-9; Ephesians 2:19-22; John 6:60-69'
  ];

  return sundayReadings[cycle] || sundayReadings[0];
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const monthTitle = document.getElementById('monthTitle');
  const calendarGrid = document.getElementById('calendarGrid');

  if (!monthTitle || !calendarGrid) {
    return;
  }

  monthTitle.textContent = `${monthNames[monthIndex]} ${year}`;
  calendarGrid.innerHTML = '';

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day empty';
    calendarGrid.appendChild(blank);
  }

  const selectedDate = document.getElementById('readingDate')?.value || '';

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const cellDate = new Date(year, monthIndex, day);
    const cell = document.createElement('div');
    const celebration = feastDays[`${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`];
    const isToday = getDateString(new Date()) === getDateString(cellDate);
    const isSelected = selectedDate === getDateString(cellDate);

    cell.className = `calendar-day ${isToday ? 'is-today' : ''}`;
    if (isSelected) {
      cell.style.borderColor = 'rgba(47,128,237,0.6)';
      cell.style.background = 'rgba(47,128,237,0.08)';
    }

    const number = document.createElement('span');
    number.className = 'date-number';
    number.textContent = day;

    const feast = document.createElement('span');
    feast.className = 'date-feast';
    feast.textContent = celebration ? celebration.split(',')[0] : cellDate.getDay() === 0 ? 'Sun' : '—';

    cell.appendChild(number);
    cell.appendChild(feast);
    cell.addEventListener('click', () => {
      const dateValue = getDateString(cellDate);
      const input = document.getElementById('readingDate');
      if (input) {
        input.value = dateValue;
      }
      updateReadingsForDate(cellDate);
    });

    calendarGrid.appendChild(cell);
  }
}

function updateReadingsForDate(date) {
  const info = getLiturgicalInfo(date);
  const dailyLabel = document.getElementById('dailyReadingLabel');
  const sundayLabel = document.getElementById('sundayReadingLabel');
  const celebrationLabel = document.getElementById('celebrationLabel');
  const dailyText = document.getElementById('dailyReadingText');
  const sundayText = document.getElementById('sundayReadingText');
  const celebrationText = document.getElementById('celebrationText');
  const todayText = document.getElementById('todayText');

  if (dailyLabel) dailyLabel.textContent = `Daily Reading • ${weekdayNames[date.getDay()]}`;
  if (sundayLabel) sundayLabel.textContent = `Sunday Reading • ${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
  if (celebrationLabel) celebrationLabel.textContent = `Celebration • ${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
  if (dailyText) dailyText.textContent = info.daily;
  if (sundayText) sundayText.textContent = info.sunday;
  if (celebrationText) celebrationText.textContent = info.celebration;
  if (todayText) todayText.textContent = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  renderCalendar(date);
}

function initializeCurrentDate() {
  const today = new Date();
  const dateInput = document.getElementById('readingDate');
  if (dateInput) {
    dateInput.value = getDateString(today);
  }

  updateReadingsForDate(today);
}

function wireUpForms() {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const viewReadingBtn = document.getElementById('viewReadingBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const dateInput = document.getElementById('readingDate');

  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  if (viewReadingBtn) {
    viewReadingBtn.addEventListener('click', () => {
      const value = document.getElementById('readingDate')?.value;
      if (!value) {
        showToast('Please select a date first.');
        return;
      }
      updateReadingsForDate(new Date(`${value}T12:00:00`));
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', (event) => {
      const selectedDate = event.target.value;
      if (!selectedDate) return;
      updateReadingsForDate(new Date(`${selectedDate}T12:00:00`));
    });
  }
}

function isAdminLoggedIn() {
  return readStorage(STORAGE_KEYS.admin, false) === true;
}

function handleAdminLogin(event) {
  event.preventDefault();
  const input = document.getElementById('adminPassword');
  const value = input ? input.value.trim() : '';

  if (value === ADMIN_PASSWORD) {
    saveStorage(STORAGE_KEYS.admin, true);
    window.location.href = 'schedule.html';
    return;
  }

  showToast('Incorrect admin password.');
}

function renderScheduleRows() {
  const tbody = document.getElementById('scheduleTableBody');
  const summary = document.getElementById('scheduleSummary');
  if (!tbody) return;

  const assignments = getAssignments().sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!assignments.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state-cell">No schedules added yet.</td></tr>';
    if (summary) summary.textContent = '0 assignments';
    return;
  }

  tbody.innerHTML = assignments.map((item, index) => `
    <tr>
      <td>${item.name}</td>
      <td>${formatDate(item.date)}</td>
      <td>${item.day}</td>
      <td>${formatTime(item.time)}</td>
      <td>${item.type}</td>
      <td>
        <button type="button" class="admin-link-inline" data-edit-index="${index}">Edit</button>
        <button type="button" class="admin-link-inline" data-delete-index="${index}" style="margin-left:8px;">Delete</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-edit-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.editIndex);
      const assignment = getAssignments()[index];
      if (!assignment) return;
      const form = document.getElementById('scheduleForm');
      if (!form) return;
      document.getElementById('scheduleName').value = assignment.name;
      document.getElementById('scheduleDate').value = assignment.date;
      document.getElementById('scheduleDay').value = assignment.day;
      document.getElementById('scheduleTime').value = assignment.time;
      document.getElementById('scheduleType').value = assignment.type;
      form.dataset.editIndex = String(index);
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Update schedule';
      }
    });
  });

  document.querySelectorAll('[data-delete-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.deleteIndex);
      const assignments = getAssignments();
      assignments.splice(index, 1);
      saveAssignments(assignments);
      renderScheduleRows();
      renderAssignments();
      showToast('Schedule entry deleted.');
    });
  });

  if (summary) {
    summary.textContent = assignments.length === 1 ? '1 assignment' : `${assignments.length} assignments`;
  }
}

function handleScheduleSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('scheduleName').value.trim();
  const date = document.getElementById('scheduleDate').value;
  const day = document.getElementById('scheduleDay').value.trim();
  const time = document.getElementById('scheduleTime').value;
  const type = document.getElementById('scheduleType').value;

  if (!name || !date || !day || !time) {
    showToast('Please complete all schedule fields.');
    return;
  }

  const existing = getAssignments();
  const form = event.currentTarget;
  const editIndex = form.dataset.editIndex;

  if (editIndex !== undefined && editIndex !== '') {
    existing[Number(editIndex)] = { name, date, day, time, type };
    delete form.dataset.editIndex;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Add to schedule';
    }
    showToast('Schedule updated successfully.');
  } else {
    existing.push({ name, date, day, time, type });
    showToast('Schedule added successfully.');
  }

  saveAssignments(existing);
  renderScheduleRows();
  renderAssignments();
  form.reset();
}

function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.admin);
  window.location.href = 'admin-login.html';
}

function initPublicApp() {
  bindViewTriggers();
  wireUpForms();
  initializeCurrentDate();
  updateAuthState();
  renderAssignments();

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.assignments) {
      renderAssignments();
    }
  });

  if (isLoggedIn()) {
    showView('dashboard');
  } else {
    showView('home');
  }
}

function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.addEventListener('submit', handleAdminLogin);
  }
}

function initSchedulePage() {
  if (!isAdminLoggedIn()) {
    window.location.href = 'admin-login.html';
    return;
  }

  const form = document.getElementById('scheduleForm');
  const logoutBtn = document.getElementById('logoutAdminBtn');

  if (form) {
    form.addEventListener('submit', handleScheduleSubmit);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.assignments) {
      renderScheduleRows();
      renderAssignments();
    }
  });

  renderScheduleRows();
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'admin-login') {
    initAdminLogin();
    return;
  }

  if (page === 'schedule') {
    initSchedulePage();
    return;
  }

  initPublicApp();
});
