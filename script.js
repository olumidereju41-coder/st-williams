const STORAGE_KEY = 'st-williams-members';
const SCHEDULE_KEY = 'st-williams-schedule';
const OWNER_PASSWORD = 'church12';

const defaultUsers = [
  {
    name: 'Owner Admin',
    email: 'owner@stwilliams.com',
    password: OWNER_PASSWORD,
    approved: true,
    role: 'owner'
  }
];

const sundayReadings = [
  { title: 'First Sunday of Advent', first: 'Isaiah 2:1-5', second: 'Romans 13:11-14', gospel: 'Matthew 24:37-44' },
  { title: 'Second Sunday of Advent', first: 'Isaiah 11:1-10', second: 'Romans 15:4-9', gospel: 'Matthew 3:1-12' },
  { title: 'Third Sunday of Advent', first: 'Isaiah 35:1-6, 10', second: 'James 5:7-10', gospel: 'Matthew 11:2-11' },
  { title: 'Fourth Sunday of Advent', first: 'Isaiah 7:10-14', second: 'Romans 1:1-7', gospel: 'Matthew 1:18-25' },
  { title: 'Christmas Day', first: 'Isaiah 9:1-6', second: 'Titus 2:11-14', gospel: 'Luke 2:1-14' }
];

const defaultSchedule = [
  { id: 1, name: 'John Peter', role: 'Reader', day: 'Sunday', date: 10, month: 'November', time: '08:00' },
  { id: 2, name: 'Mary Grace', role: 'Lector', day: 'Sunday', date: 10, month: 'November', time: '10:30' },
  { id: 3, name: 'Daniel Mark', role: 'Reader', day: 'Saturday', date: 9, month: 'November', time: '17:30' },
  { id: 4, name: 'Sarah Joy', role: 'Lector', day: 'Monday', date: 11, month: 'November', time: '09:00' }
];

function getMembers() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!saved || !saved.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    return [...defaultUsers];
  }
  return saved;
}

function saveMembers(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

function getSchedule() {
  const saved = JSON.parse(localStorage.getItem(SCHEDULE_KEY));
  if (!saved || !saved.length) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(defaultSchedule));
    return [...defaultSchedule];
  }
  return saved;
}

function saveSchedule(schedule) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

function redirectToSignup(email = '') {
  const target = email ? `signup.html?email=${encodeURIComponent(email)}` : 'signup.html';
  window.location.href = target;
}

function getCurrentUser() {
  const saved = sessionStorage.getItem('st-williams-user');
  return saved ? JSON.parse(saved) : null;
}

function isApprovedMember(member) {
  return !!member && member.approved === true;
}

function ensureApprovedAccess() {
  const user = getCurrentUser();
  if (!user) return false;

  const members = getMembers();
  const activeMember = members.find((member) => member.email.toLowerCase() === user.email.toLowerCase());

  if (!isApprovedMember(activeMember)) {
    sessionStorage.removeItem('st-williams-user');
    return false;
  }

  return true;
}

function formatDate() {
  const readGrid = document.getElementById('readingGrid');
  const todayDate = document.getElementById('todayDate');
  const todayName = document.getElementById('todayName');
  const readingTitle = document.getElementById('readingTitle');
  const firstReading = document.getElementById('firstReading');
  const secondReading = document.getElementById('secondReading');
  const gospelReading = document.getElementById('gospelReading');

  if (!readGrid || !todayDate || !todayName || !readingTitle || !firstReading || !secondReading || !gospelReading) return;

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  todayDate.textContent = formattedDate;
  todayName.textContent = dayName;

  const selected = sundayReadings[now.getDate() % sundayReadings.length];
  readingTitle.textContent = selected.title;
  firstReading.textContent = selected.first;
  secondReading.textContent = selected.second;
  gospelReading.textContent = selected.gospel;
}

function renderReadings() {
  const readGrid = document.getElementById('readingGrid');
  if (!readGrid) return;

  readGrid.innerHTML = sundayReadings
    .map(
      (reading) => `
        <article class="reading-item">
          <h3>${reading.title}</h3>
          <p><strong>First Reading:</strong> ${reading.first}</p>
          <p><strong>Second Reading:</strong> ${reading.second}</p>
          <p><strong>Gospel:</strong> ${reading.gospel}</p>
        </article>
      `
    )
    .join('');
}

function handleLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  if (!loginForm || !loginMessage) return;

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const members = getMembers();
    const foundUser = members.find((member) => member.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      loginMessage.style.color = '#c43636';
      loginMessage.textContent = 'This email is not registered. Redirecting to sign up…';
      setTimeout(() => redirectToSignup(email), 700);
      return;
    }

    if (foundUser.password !== password) {
      loginMessage.style.color = '#c43636';
      loginMessage.textContent = 'Incorrect password. Redirecting to sign up…';
      setTimeout(() => redirectToSignup(email), 700);
      return;
    }

    if (!isApprovedMember(foundUser)) {
      loginMessage.style.color = '#c43636';
      loginMessage.textContent = 'Your account is waiting for owner approval.';
      return;
    }

    sessionStorage.setItem('st-williams-user', JSON.stringify(foundUser));
    loginMessage.style.color = '#1f8a57';
    loginMessage.textContent = `Welcome, ${foundUser.name}! Redirecting to dashboard...`;
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 600);
  });
}

function handleSignupPage() {
  const signupForm = document.getElementById('signupForm');
  const signupMessage = document.getElementById('signupMessage');
  if (!signupForm || !signupMessage) return;

  const params = new URLSearchParams(window.location.search);
  const presetEmail = params.get('email');
  if (presetEmail) {
    document.getElementById('signupEmail').value = presetEmail;
  }

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
      signupMessage.style.color = '#c43636';
      signupMessage.textContent = 'Please complete all fields.';
      return;
    }

    const members = getMembers();
    const existingUser = members.find((member) => member.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      signupMessage.style.color = '#c43636';
      signupMessage.textContent = 'This email is already registered.';
      return;
    }

    members.push({
      name,
      email,
      password,
      approved: false,
      role: 'member'
    });

    saveMembers(members);
    signupForm.reset();
    signupMessage.style.color = '#1f8a57';
    signupMessage.textContent = 'Your request has been sent. Wait for owner approval.';
  });
}

function handleOwnerPage() {
  const passwordForm = document.getElementById('ownerPasswordForm');
  const ownerDashboard = document.getElementById('ownerDashboard');
  const userForm = document.getElementById('memberForm');
  const memberTable = document.getElementById('memberTable');
  const pendingTable = document.getElementById('pendingTable');
  const statusMessage = document.getElementById('ownerStatus');

  if (!passwordForm || !ownerDashboard || !userForm || !memberTable || !pendingTable || !statusMessage) {
    return;
  }

  sessionStorage.removeItem('st-williams-owner');
  ownerDashboard.classList.add('hidden');
  passwordForm.classList.remove('hidden');

  const clearOwnerSession = () => {
    sessionStorage.removeItem('st-williams-owner');
    passwordForm.classList.remove('hidden');
    ownerDashboard.classList.add('hidden');
  };

  window.addEventListener('pagehide', clearOwnerSession);
  window.addEventListener('beforeunload', clearOwnerSession);

  passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = document.getElementById('ownerPassword').value;
    if (password === OWNER_PASSWORD) {
      sessionStorage.setItem('st-williams-owner', 'true');
      passwordForm.classList.add('hidden');
      ownerDashboard.classList.remove('hidden');
      statusMessage.style.color = '#1f8a57';
      statusMessage.textContent = 'Owner access granted.';
    } else {
      statusMessage.style.color = '#c43636';
      statusMessage.textContent = 'Incorrect owner password.';
    }
  });

  const renderPendingSignups = () => {
    const pending = getMembers().filter((member) => member.role !== 'owner' && !member.approved);

    if (!pending.length) {
      pendingTable.innerHTML = '<p class="empty-state">No pending signups.</p>';
      return;
    }

    pendingTable.innerHTML = pending
      .map(
        (member) => `
          <div class="member-row">
            <div class="details">
              <strong>${member.name}</strong>
              <span>${member.email}</span>
            </div>
            <div class="details">
              <strong>Status</strong>
              <span>Pending</span>
            </div>
            <div class="member-actions">
              <button class="approve-btn" type="button" data-action="approve" data-email="${member.email}">Approve</button>
              <button class="edit-btn" type="button" data-action="edit" data-email="${member.email}">Edit</button>
              <button class="delete-btn" type="button" data-action="delete" data-email="${member.email}">Delete</button>
            </div>
          </div>
        `
      )
      .join('');

    pendingTable.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const email = button.dataset.email;
        const user = getMembers().find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!user) return;

        if (action === 'approve') {
          user.approved = true;
          const members = getMembers();
          saveMembers(members);
          renderPendingSignups();
          renderMembers();
          if (sessionStorage.getItem('st-williams-user')) {
            const sessionUser = getCurrentUser();
            if (sessionUser && sessionUser.email.toLowerCase() === user.email.toLowerCase()) {
              sessionStorage.setItem('st-williams-user', JSON.stringify(user));
            }
          }
          statusMessage.style.color = '#1f8a57';
          statusMessage.textContent = `${user.name} was approved and moved to the approved member list.`;
        }

        if (action === 'edit') {
          document.getElementById('memberName').value = user.name;
          document.getElementById('memberEmail').value = user.email;
          document.getElementById('memberPassword').value = user.password;
          document.getElementById('memberStatus').checked = user.approved;
          document.getElementById('memberRole').value = user.role;
          userForm.dataset.editing = user.email;
          userForm.querySelector('button[type="submit"]').textContent = 'Save Changes';
          statusMessage.textContent = `Editing ${user.name}.`;
        }

        if (action === 'delete') {
          const members = getMembers().filter((item) => item.email.toLowerCase() !== email.toLowerCase());
          saveMembers(members);
          renderPendingSignups();
          renderMembers();
          statusMessage.style.color = '#c43636';
          statusMessage.textContent = `${user.name} was deleted.`;
        }
      });
    });
  };

  const renderMembers = () => {
    const members = getMembers();
    const filtered = members.filter((member) => member.role !== 'owner' && member.approved);

    if (!filtered.length) {
      memberTable.innerHTML = '<p class="empty-state">No approved members yet.</p>';
      return;
    }

    memberTable.innerHTML = filtered
      .map(
        (member) => `
          <div class="member-row">
            <div class="details">
              <strong>${member.name}</strong>
              <span>${member.email}</span>
            </div>
            <div class="details">
              <strong>Role</strong>
              <span>${member.role}</span>
            </div>
            <div class="member-actions">
              <button class="edit-btn" type="button" data-action="edit" data-email="${member.email}">Edit</button>
              <button class="delete-btn" type="button" data-action="delete" data-email="${member.email}">Delete</button>
            </div>
          </div>
        `
      )
      .join('');

    memberTable.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const email = button.dataset.email;
        const user = getMembers().find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!user) return;

        if (action === 'edit') {
          document.getElementById('memberName').value = user.name;
          document.getElementById('memberEmail').value = user.email;
          document.getElementById('memberPassword').value = user.password;
          document.getElementById('memberStatus').checked = user.approved;
          document.getElementById('memberRole').value = user.role;
          userForm.dataset.editing = user.email;
          userForm.querySelector('button[type="submit"]').textContent = 'Save Changes';
          statusMessage.textContent = `Editing ${user.name}.`;
        }

        if (action === 'delete') {
          const members = getMembers().filter((item) => item.email.toLowerCase() !== email.toLowerCase());
          saveMembers(members);
          renderPendingSignups();
          renderMembers();
          statusMessage.style.color = '#c43636';
          statusMessage.textContent = `${user.name} was removed.`;
        }
      });
    });
  };

  userForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const members = getMembers();
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const password = document.getElementById('memberPassword').value;
    const approved = document.getElementById('memberStatus').checked;
    const role = document.getElementById('memberRole').value;

    if (!name || !email || !password) {
      statusMessage.style.color = '#c43636';
      statusMessage.textContent = 'Please fill in all fields.';
      return;
    }

    const editingEmail = userForm.dataset.editing || null;

    if (editingEmail) {
      const target = members.find((member) => member.email.toLowerCase() === editingEmail.toLowerCase());
      if (!target) {
        statusMessage.style.color = '#c43636';
        statusMessage.textContent = 'User not found.';
        return;
      }

      target.name = name;
      target.email = email;
      target.password = password;
      target.approved = approved;
      target.role = role;
      userForm.dataset.editing = '';
      userForm.reset();
      userForm.querySelector('button[type="submit"]').textContent = 'Add Member';
      saveMembers(members);
      renderPendingSignups();
      renderMembers();
      statusMessage.style.color = '#1f8a57';
      statusMessage.textContent = `${name} was updated successfully.`;
      return;
    }

    const existing = members.find((member) => member.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      statusMessage.style.color = '#c43636';
      statusMessage.textContent = 'This email already exists.';
      return;
    }

    members.push({
      name,
      email,
      password,
      approved,
      role
    });

    saveMembers(members);
    userForm.reset();
    renderPendingSignups();
    renderMembers();
    statusMessage.style.color = '#1f8a57';
    statusMessage.textContent = `${name} was added successfully.`;
  });

  document.getElementById('clearMemberForm').addEventListener('click', () => {
    userForm.dataset.editing = '';
    userForm.reset();
    userForm.querySelector('button[type="submit"]').textContent = 'Add Member';
    statusMessage.textContent = 'Form cleared.';
  });

  renderPendingSignups();
  renderMembers();

  const ownerScheduleForm = document.getElementById('ownerScheduleForm');
  const ownerScheduleTable = document.getElementById('ownerScheduleTable');
  const ownerScheduleStatus = document.getElementById('ownerScheduleStatus');
  if (!ownerScheduleForm || !ownerScheduleTable || !ownerScheduleStatus) return;

  const renderOwnerSchedule = () => {
    const schedule = getSchedule();
    if (!schedule.length) {
      ownerScheduleTable.innerHTML = '<p class="empty-state">No readers assigned yet.</p>';
      return;
    }

    ownerScheduleTable.innerHTML = schedule
      .map((entry) => `
        <div class="member-row">
          <div class="details">
            <strong>${entry.name}</strong>
            <span>${entry.role}</span>
          </div>
          <div class="details">
            <strong>Schedule</strong>
            <span>${entry.day}, ${entry.date} ${entry.month}, ${entry.time}</span>
          </div>
          <div class="member-actions">
            <button class="edit-btn" type="button" data-schedule-action="edit" data-id="${entry.id}">Edit</button>
            <button class="delete-btn" type="button" data-schedule-action="delete" data-id="${entry.id}">Delete</button>
          </div>
        </div>
      `)
      .join('');

    ownerScheduleTable.querySelectorAll('[data-schedule-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.id);
        const action = button.dataset.scheduleAction;
        const schedule = getSchedule();
        const item = schedule.find((entry) => entry.id === id);
        if (!item) return;

        if (action === 'delete') {
          const updated = schedule.filter((entry) => entry.id !== id);
          saveSchedule(updated);
          renderOwnerSchedule();
          ownerScheduleStatus.style.color = '#c43636';
          ownerScheduleStatus.textContent = `${item.name} was removed from the schedule.`;
          return;
        }

        if (action === 'edit') {
          document.getElementById('ownerScheduleName').value = item.name;
          document.getElementById('ownerScheduleRole').value = item.role;
          document.getElementById('ownerScheduleDay').value = item.day;
          document.getElementById('ownerScheduleDate').value = item.date;
          document.getElementById('ownerScheduleMonth').value = item.month;
          document.getElementById('ownerScheduleTime').value = item.time;
          ownerScheduleForm.dataset.editingId = String(id);
          ownerScheduleForm.querySelector('button[type="submit"]').textContent = 'Save Schedule';
          ownerScheduleStatus.textContent = `Editing ${item.name}.`;
        }
      });
    });
  };

  ownerScheduleForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('ownerScheduleName').value.trim();
    const role = document.getElementById('ownerScheduleRole').value;
    const day = document.getElementById('ownerScheduleDay').value;
    const date = Number(document.getElementById('ownerScheduleDate').value);
    const month = document.getElementById('ownerScheduleMonth').value;
    const time = document.getElementById('ownerScheduleTime').value;

    if (!name || !date || !time) {
      ownerScheduleStatus.style.color = '#c43636';
      ownerScheduleStatus.textContent = 'Please complete all schedule fields.';
      return;
    }

    const schedule = getSchedule();
    const editingId = ownerScheduleForm.dataset.editingId ? Number(ownerScheduleForm.dataset.editingId) : null;

    if (editingId) {
      const item = schedule.find((entry) => entry.id === editingId);
      if (item) {
        item.name = name;
        item.role = role;
        item.day = day;
        item.date = date;
        item.month = month;
        item.time = time;
      }
      ownerScheduleForm.dataset.editingId = '';
      ownerScheduleForm.querySelector('button[type="submit"]').textContent = 'Add Schedule';
    } else {
      schedule.push({
        id: Date.now(),
        name,
        role,
        day,
        date,
        month,
        time
      });
    }

    saveSchedule(schedule);
    ownerScheduleForm.reset();
    renderOwnerSchedule();
    ownerScheduleStatus.style.color = '#1f8a57';
    ownerScheduleStatus.textContent = editingId ? 'Schedule updated successfully.' : 'New reading assigned successfully.';
  });

  document.getElementById('clearOwnerScheduleForm').addEventListener('click', () => {
    ownerScheduleForm.dataset.editingId = '';
    ownerScheduleForm.reset();
    ownerScheduleForm.querySelector('button[type="submit"]').textContent = 'Add Schedule';
    ownerScheduleStatus.textContent = 'Schedule form cleared.';
  });

  renderOwnerSchedule();
}

function handleDashboardPage() {
  const user = getCurrentUser();
  if (!user || !ensureApprovedAccess()) {
    window.location.href = 'login.html';
    return;
  }

  const dashboardDay = document.getElementById('dashboardDay');
  const dashboardDate = document.getElementById('dashboardDate');
  const dashboardReadingTitle = document.getElementById('dashboardReadingTitle');
  const dashboardReadingText = document.getElementById('dashboardReadingText');
  const dashboardRosterCount = document.getElementById('dashboardRosterCount');
  const dashboardRoleLabel = document.getElementById('dashboardRoleLabel');
  const scheduleTable = document.getElementById('scheduleTable');
  const scheduleForm = document.getElementById('scheduleForm');
  const scheduleStatus = document.getElementById('scheduleStatus');

  if (!dashboardDay || !dashboardDate || !dashboardReadingTitle || !dashboardReadingText || !dashboardRosterCount || !dashboardRoleLabel || !scheduleTable || !scheduleForm || !scheduleStatus) {
    return;
  }

  const now = new Date();
  dashboardDay.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
  dashboardDate.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const selected = sundayReadings[now.getDate() % sundayReadings.length];
  dashboardReadingTitle.textContent = selected.title;
  dashboardReadingText.textContent = `${selected.first} • ${selected.second} • ${selected.gospel}`;

  const renderScheduleTable = () => {
    const schedule = getSchedule();
    dashboardRosterCount.textContent = `${schedule.length} readers`;
    dashboardRoleLabel.textContent = user.role === 'owner' ? 'Owner admin access' : 'Approved member access';

    if (!schedule.length) {
      scheduleTable.innerHTML = '<p class="empty-state">No reading assignments yet.</p>';
      return;
    }

    scheduleTable.innerHTML = schedule
      .map(
        (entry) => `
          <div class="member-row">
            <div class="details">
              <strong>${entry.name}</strong>
              <span>${entry.role}</span>
            </div>
            <div class="details">
              <strong>${entry.day}</strong>
              <span>${entry.date} ${entry.month} • ${entry.time}</span>
            </div>
          </div>
        `
      )
      .join('');
  };

  if (user.role === 'owner') {
    scheduleForm.classList.remove('hidden');
    scheduleForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const schedule = getSchedule();
      const name = document.getElementById('scheduleName').value.trim();
      const role = document.getElementById('scheduleRole').value;
      const day = document.getElementById('scheduleDay').value;
      const date = Number(document.getElementById('scheduleDate').value);
      const month = document.getElementById('scheduleMonth').value;
      const time = document.getElementById('scheduleTime').value;

      if (!name || !date || !time) {
        scheduleStatus.style.color = '#c43636';
        scheduleStatus.textContent = 'Please complete all schedule fields.';
        return;
      }

      schedule.push({ id: Date.now(), name, role, day, date, month, time });
      saveSchedule(schedule);
      scheduleForm.reset();
      renderScheduleTable();
      scheduleStatus.style.color = '#1f8a57';
      scheduleStatus.textContent = 'Reader added successfully.';
    });

    document.getElementById('clearScheduleForm').addEventListener('click', () => {
      scheduleForm.reset();
      scheduleStatus.textContent = 'Form cleared.';
    });
  } else {
    scheduleForm.classList.add('hidden');
  }

  renderScheduleTable();
}

function handleReadersPage() {
  const readersList = document.getElementById('readersPageList');
  if (!readersList) return;

  const schedule = getSchedule();
  if (!schedule.length) {
    readersList.innerHTML = '<p class="empty-state">No readers have been assigned yet.</p>';
    return;
  }

  readersList.innerHTML = schedule
    .map(
      (entry) => `
        <div class="member-row">
          <div class="details">
            <strong>${entry.name}</strong>
            <span>${entry.role}</span>
          </div>
          <div class="details">
            <strong>${entry.day}</strong>
            <span>${entry.date} ${entry.month} • ${entry.time}</span>
          </div>
        </div>
      `
    )
    .join('');
}

window.addEventListener('DOMContentLoaded', () => {
  formatDate();
  renderReadings();

  if (window.location.pathname.endsWith('login.html')) {
    handleLoginPage();
  }

  if (window.location.pathname.endsWith('signup.html')) {
    handleSignupPage();
  }

  if (window.location.pathname.endsWith('owner.html')) {
    handleOwnerPage();
  }

  if (window.location.pathname.endsWith('dashboard.html')) {
    handleDashboardPage();
  }

  if (window.location.pathname.endsWith('readers.html')) {
    handleReadersPage();
  }
});
