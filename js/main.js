/* CampusCare shared client-side application logic. */
(function () {
  'use strict';


  // Browser-storage names and appointment states used throughout the website.


  const KEYS = {
    students: 'campusCareStudents', counsellors: 'campusCareCounsellors', appointments: 'campusCareAppointments', session: 'campusCareSession'
  };
  const ACTIVE = ['Pending', 'Approved'];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];


  // Storage helpers safely return an empty list if stored browser data is missing or malformed.


  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : [];
    }
    catch (e) {
      return [];
    }
  }
  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function getSession() {
    try {
      const value = JSON.parse(sessionStorage.getItem(KEYS.session));
      return value && value.id && value.role ? value : null;
    }
    catch (e) {
      return null;
    }
  }
  function setSession(user) {
    sessionStorage.setItem(KEYS.session, JSON.stringify( {
      id: user.id, role: user.role
    }
    ));
  }
  function id(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
  function today() {
    return new Date().toISOString().split('T')[0];
  }
  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return (s.role === 'student' ? readList(KEYS.students) : readList(KEYS.counsellors)).find(u => u.id === s.id) || null;
  }
  function flash(message, kind = 'success', target = '#message') {
    const el = $(target);
    if (!el) return;
    el.textContent = message;
    el.className = 'message ' + kind;
    el.hidden = false;
    el.scrollIntoView( {
      behavior: 'smooth', block: 'nearest'
    }
    );
  }
  function clearFlash(target = '#message') {
    const el = $(target);
    if (el) el.hidden = true;
  }
  function signOut() {
    sessionStorage.removeItem(KEYS.session);
    location.href = 'index.html';
  }


  // Starter profiles make the directory useful without replacing registered counsellors.


  // Adds sample counsellors only when a matching demo profile is not already saved.


  function ensureDemoCounsellors() {
    const demos = [
   {
      id: 'CON-DEMO-01', role: 'counsellor', name: 'Dr. Ananya Mehta', email: 'ananya.mehta@campuscare.demo', phone: '+91 98765 41001', specialisation: 'Stress and anxiety', qualification: 'Ph.D. Counselling Psychology', description: 'Supports students with anxiety, stress management, confidence, and healthy coping strategies.', password: 'demo123', createdAt: '2026-01-01T09:00:00.000Z', demo: true
    }
    ,
   {
      id: 'CON-DEMO-02', role: 'counsellor', name: 'Rahul Verma', email: 'rahul.verma@campuscare.demo', phone: '+91 98765 41002', specialisation: 'Academic pressure', qualification: 'M.A. Clinical Psychology', description: 'Helps students build practical routines for academic pressure, motivation, and study-life balance.', password: 'demo123', createdAt: '2026-01-01T09:05:00.000Z', demo: true
    }
    ,
   {
      id: 'CON-DEMO-03', role: 'counsellor', name: 'Dr. Sana Iqbal', email: 'sana.iqbal@campuscare.demo', phone: '+91 98765 41003', specialisation: 'Relationships and personal growth', qualification: 'Psy.D., Student Wellbeing', description: 'Offers a warm, non-judgemental space to discuss relationships, identity, transitions, and personal growth.', password: 'demo123', createdAt: '2026-01-01T09:10:00.000Z', demo: true
    }
    ];
    const counsellors = readList(KEYS.counsellors);
    const missingDemos = demos.filter(demo => !counsellors.some(user => user.id === demo.id || user.email === demo.email));
    if (missingDemos.length) writeList(KEYS.counsellors, counsellors.concat(missingDemos));
  }


  // Builds navigation based on the current role on every page.


  // Shows different navigation links for guests, students, and counsellors.


  function renderNav() {
    const nav = $('#site-nav');
    if (!nav) return;
    const s = getSession();
    let links = '<a href="index.html">Home</a><a href="counsellors.html">Counsellors</a>';
    if (!s) links += '<a class="nav-cta" href="login.html">Login / Sign Up</a>';
    else if (s.role === 'student') links += '<a href="book.html">Book Appointment</a><a href="student-dashboard.html">My Dashboard</a><a href="profile.html">Profile</a><button class="link-button" data-logout>Logout</button>';
    else links += '<a href="counsellor-dashboard.html">Dashboard</a><a href="profile.html">Profile</a><button class="link-button" data-logout>Logout</button>';
    nav.innerHTML = '<button class="menu-toggle" aria-label="Toggle navigation">☰</button><div class="nav-links">' + links + '</div>';
    $('.menu-toggle', nav).addEventListener('click', () => $('.nav-links', nav).classList.toggle('open'));
    $('[data-logout]', nav)?.addEventListener('click', signOut);
  }


  // Protected pages return signed-in users to their own dashboard instead of the login page.


  // Stops users from opening dashboard pages that do not belong to their role.


  function requireRole(role) {
    const s = getSession();
    if (!s || !currentUser()) {
      location.href = 'login.html';
      return false;
    }
    if (s.role !== role) {
      location.href = s.role === 'student' ? 'student-dashboard.html' : 'counsellor-dashboard.html';
      return false;
    }
    return true;
  }


  // Connects the role selector, login forms, sign-up forms, and password buttons.


  function initialiseAuth() {
    const roleButtons = $$('[data-role]');
    const forms = $$('.auth-form');
    const modeButtons = $$('[data-mode]');
    let role = 'student', mode = 'login';
    function update() {
      roleButtons.forEach(b => b.classList.toggle('selected', b.dataset.role === role));
      modeButtons.forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
      forms.forEach(f => f.hidden = !(f.dataset.role === role && f.dataset.mode === mode));
      clearFlash();
    }
    roleButtons.forEach(b => b.addEventListener('click', () => {
      role = b.dataset.role;
      update();
    }
    ));
    modeButtons.forEach(b => b.addEventListener('click', () => {
      mode = b.dataset.mode;
      update();
    }
    ));
    $$('.password-toggle').forEach(button => button.addEventListener('click', () => {
      const input = $('#' + button.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      button.textContent = input.type === 'password' ? 'Show' : 'Hide';
    }
    ));
    $('#student-login')?.addEventListener('submit', event => login(event, 'student'));
    $('#counsellor-login')?.addEventListener('submit', event => login(event, 'counsellor'));
    $('#student-signup')?.addEventListener('submit', event => register(event, 'student'));
    $('#counsellor-signup')?.addEventListener('submit', event => register(event, 'counsellor'));
    update();
  }


  // Checks saved credentials and starts a role-based session after successful login.


  function login(event, role) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const users = readList(role === 'student' ? KEYS.students : KEYS.counsellors);
    const user = users.find(item => item.email === email && item.password === password);
    if (!user) return flash('Incorrect email, password, or selected role.', 'error');
    setSession( {
      ...user, role
    }
    );
    location.href = role === 'student' ? 'student-dashboard.html' : 'counsellor-dashboard.html';
  }


  // Validates and saves a new student or counsellor without overwriting existing accounts.


  function register(event, role) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const email = data.email.trim().toLowerCase();
    if (!form.checkValidity()) return form.reportValidity();
    if (data.password.length < 6) return flash('Password must contain at least 6 characters.', 'error');
    if (data.password !== data.confirmPassword) return flash('Passwords do not match.', 'error');
    if ([...readList(KEYS.students), ...readList(KEYS.counsellors)].some(user => user.email === email)) return flash('An account with this email already exists.', 'error');
    const user = {
      id: id(role === 'student' ? 'STU' : 'CON'), role, name: data.name.trim(), email, phone: data.phone.trim(), password: data.password, createdAt: new Date().toISOString()
    };
    if (role === 'counsellor') Object.assign(user, {
      specialisation: data.specialisation.trim(), qualification: data.qualification.trim(), description: data.description.trim()
    }
    );
    const key = role === 'student' ? KEYS.students : KEYS.counsellors;
    const users = readList(key);
    users.push(user);
    writeList(key, users);
    form.reset();
    flash('Account created successfully. Please log in.', 'success');
  }


  // Builds the searchable counsellor directory from browser storage.


  function renderCounsellors() {
    const grid = $('#counsellor-grid');
    if (!grid) return;
    const search = $('#counsellor-search'), filter = $('#specialisation-filter');
    const counsellors = readList(KEYS.counsellors);
    [...new Set(counsellors.map(c => c.specialisation).filter(Boolean))].sort().forEach(value => filter.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>'));
    function paint() {
      const term = search.value.trim().toLowerCase(), category = filter.value;
      const shown = counsellors.filter(c => c.name.toLowerCase().includes(term) && (!category || c.specialisation === category));
      grid.innerHTML = shown.length ? shown.map(c => '<article class="counsellor-card"><div class="avatar">' + escapeHtml(c.name.charAt(0)) + '</div><h3>' + escapeHtml(c.name) + '</h3><p class="tag">' + escapeHtml(c.specialisation) + '</p><p><strong>' + escapeHtml(c.qualification) + '</strong></p><p>' + escapeHtml(c.description) + '</p><p class="contact">✉ ' + escapeHtml(c.email) + '<br>☎ ' + escapeHtml(c.phone) + '</p>' + bookLink(c.id) + '</article>').join('') : '<div class="empty-state"><h3>No counsellors found</h3><p>Try another search or check back after counsellors register.</p></div>';
    }
    search.addEventListener('input', paint);
    filter.addEventListener('change', paint);
    paint();
  }


  // Shows up to three counsellor cards on the home page.


  function renderHomeCounsellors() {
    const grid = $('#home-counsellors');
    if (!grid) return;
    const counsellors = readList(KEYS.counsellors).slice(0, 3);
    grid.innerHTML = counsellors.length ? counsellors.map(c => '<article class="counsellor-card"><div class="avatar">' + escapeHtml(c.name.charAt(0)) + '</div><h3>' + escapeHtml(c.name) + '</h3><p class="tag">' + escapeHtml(c.specialisation) + '</p><p>' + escapeHtml(c.description) + '</p>' + bookLink(c.id) + '</article>').join('') : '<div class="empty-state"><h3>Our counsellor directory is growing</h3><p>Registered counsellors will appear here. <a href="counsellors.html">View the directory</a>.</p></div>';
  }


  // Counsellors never receive an appointment-booking action in the directory.


  // Gives students a booking button while keeping counsellors out of the booking flow.


  function bookLink(counsellorId) {
    const s = getSession();
    if (s?.role === 'student') return '<a class="button small" href="book.html?counsellor=' + encodeURIComponent(counsellorId) + '">Book Appointment</a>';
    if (s?.role === 'counsellor') return '<a class="button small outline" href="counsellor-dashboard.html">View Dashboard</a>';
    return '<a class="button small" href="login.html">Log in to Book</a>';
  }


  // Saves a validated student appointment request with a Pending status.


  function initialiseBooking() {
    if (!requireRole('student')) return;
    const form = $('#booking-form'), select = $('#counsellor');
    const counsellors = readList(KEYS.counsellors);
    select.innerHTML = '<option value="">Choose a counsellor</option>' + counsellors.map(c => '<option value="' + c.id + '">' + escapeHtml(c.name) + ' — ' + escapeHtml(c.specialisation) + '</option>').join('');
    select.value = new URLSearchParams(location.search).get('counsellor') || '';
    $('#appointment-date').min = today();
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();
      const user = currentUser(), data = Object.fromEntries(new FormData(form).entries());
      if (data.date < today()) return flash('Please choose today or a future date.', 'error');
      if (!counsellors.some(c => c.id === data.counsellorId)) return flash('Please choose a valid counsellor.', 'error');
      const appointments = readList(KEYS.appointments);
      const duplicate = appointments.some(a => a.counsellorId === data.counsellorId && a.date === data.date && a.time === data.time && ACTIVE.includes(a.status));
      if (duplicate) return flash('That counsellor already has an active appointment in this time slot. Please choose another time.', 'error');
      appointments.push( {
        id: id('APT'), studentId: user.id, counsellorId: data.counsellorId, date: data.date, time: data.time, category: data.category, mode: data.mode, message: data.message.trim(), status: 'Pending', createdAt: new Date().toISOString()
      }
      );
      writeList(KEYS.appointments, appointments);
      form.reset();
      flash('Appointment request sent successfully. It is now pending counsellor approval.', 'success');
    }
    );
  }
  function statusClass(status) {
    return 'status ' + status.toLowerCase();
  }
  function appointmentRow(a, counsellors) {
    const c = counsellors.find(x => x.id === a.counsellorId) || {
      name: 'Unknown counsellor'
    };
    return '<tr><td>' + escapeHtml(c.name) + '</td><td>' + escapeHtml(a.date) + '</td><td>' + escapeHtml(a.time) + '</td><td>' + escapeHtml(a.category) + '</td><td>' + escapeHtml(a.mode) + '</td><td><span class="' + statusClass(a.status) + '">' + a.status + '</span></td><td>' + (ACTIVE.includes(a.status) ? '<button class="text-action danger" data-cancel="' + a.id + '">Cancel</button>' : '—') + '</td></tr>';
  }


  // Displays only the logged-in student's appointments and cancellation actions.


  function initialiseStudentDashboard() {
    if (!requireRole('student')) return;
    const user = currentUser(), appointments = readList(KEYS.appointments).filter(a => a.studentId === user.id), counsellors = readList(KEYS.counsellors);
    $('#student-name').textContent = user.name;
    $('#student-email').textContent = user.email;
    const counts = {
      all: appointments.length, Pending: 0, Approved: 0, Rejected: 0, Cancelled: 0
    };
    appointments.forEach(a => counts[a.status]++);
    $('#student-stats').innerHTML = stat('Total', counts.all) + stat('Pending', counts.Pending) + stat('Approved', counts.Approved) + stat('Rejected', counts.Rejected) + stat('Cancelled', counts.Cancelled);
    $('#student-appointments').innerHTML = appointments.length ? appointments.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(a => appointmentRow(a, counsellors)).join('') : '<tr><td colspan="7">No appointments yet. <a href="book.html">Book your first session.</a></td></tr>';
    $$('[data-cancel]').forEach(button => button.addEventListener('click', () => {
      const list = readList(KEYS.appointments), a = list.find(x => x.id === button.dataset.cancel && x.studentId === user.id);
      if (a && ACTIVE.includes(a.status)) {
        a.status = 'Cancelled';
        writeList(KEYS.appointments, list);
        initialiseStudentDashboard();
      }
    }
    ));
  }
  function stat(label, value) {
    return '<article class="stat-card"><span>' + label + '</span><strong>' + value + '</strong></article>';
  }


  // Displays only the logged-in counsellor's requests and approve/reject controls.


  function initialiseCounsellorDashboard() {
    if (!requireRole('counsellor')) return;
    const user = currentUser(), appointments = readList(KEYS.appointments).filter(a => a.counsellorId === user.id), students = readList(KEYS.students);
    $('#counsellor-name').textContent = user.name;
    $('#counsellor-specialisation').textContent = user.specialisation;
    const counts = {
      all: appointments.length, Pending: 0, Approved: 0, Rejected: 0
    };
    appointments.forEach(a => counts[a.status]++);
    $('#counsellor-stats').innerHTML = stat('Total Requests', counts.all) + stat('Pending', counts.Pending) + stat('Approved', counts.Approved) + stat('Rejected', counts.Rejected);
    $('#requests-list').innerHTML = appointments.length ? appointments.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(a => {
      const s = students.find(x => x.id === a.studentId) || {
      };
      return '<article class="request-card"><div><h3>' + escapeHtml(s.name || 'Unknown student') + ' <span class="' + statusClass(a.status) + '">' + a.status + '</span></h3><p>' + escapeHtml(s.email || '') + ' · ' + escapeHtml(s.phone || '') + '</p><p><strong>' + escapeHtml(a.date) + ' at ' + escapeHtml(a.time) + '</strong> · ' + escapeHtml(a.category) + ' · ' + escapeHtml(a.mode) + '</p><p class="student-message">“' + escapeHtml(a.message || 'No additional message.') + '”</p></div>' + (a.status === 'Pending' ? '<div class="request-actions"><button class="button small" data-update="Approved" data-id="' + a.id + '">Approve</button><button class="button small outline" data-update="Rejected" data-id="' + a.id + '">Reject</button><button class="text-action" data-details="' + a.id + '">View details</button></div>' : '<button class="text-action" data-details="' + a.id + '">View details</button>') + '</article>';
    }
    ).join('') : '<div class="empty-state"><h3>No appointment requests yet</h3><p>New student bookings will appear here.</p></div>';
    $$('[data-update]').forEach(button => button.addEventListener('click', () => {
      const list = readList(KEYS.appointments), a = list.find(x => x.id === button.dataset.id && x.counsellorId === user.id);
      if (a && a.status === 'Pending') {
        a.status = button.dataset.update;
        writeList(KEYS.appointments, list);
        initialiseCounsellorDashboard();
      }
    }
    ));
    $$('[data-details]').forEach(button => button.addEventListener('click', () => {
      const a = appointments.find(x => x.id === button.dataset.details), s = students.find(x => x.id === a.studentId) || {
      };
      alert('Appointment ID: ' + a.id + '\nStudent: ' + (s.name || 'Unknown') + '\nEmail: ' + (s.email || '') + '\nPhone: ' + (s.phone || '') + '\nDate & time: ' + a.date + ' ' + a.time + '\nCategory: ' + a.category + '\nMode: ' + a.mode + '\nMessage: ' + (a.message || 'None'));
    }
    ));
  }


  // Loads the signed-in user's details and saves allowed profile changes.


  function initialiseProfile() {
    const s = getSession();
    if (!s || !currentUser()) {
      location.href = 'login.html';
      return;
    }
    const user = currentUser(), form = $('#profile-form');
    $('#profile-heading').textContent = user.role === 'student' ? 'Student Profile' : 'Counsellor Profile';
    form.elements.name.value = user.name;
    form.elements.email.value = user.email;
    form.elements.phone.value = user.phone;
    $('#profile-id').textContent = user.id;
    $('#role-label').textContent = user.role;
    if (user.role === 'counsellor') {
      $('#professional-fields').hidden = false;
      form.elements.specialisation.value = user.specialisation;
      form.elements.qualification.value = user.qualification;
      form.elements.description.value = user.description;
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();
      const users = readList(user.role === 'student' ? KEYS.students : KEYS.counsellors), saved = users.find(x => x.id === user.id);
      saved.name = form.elements.name.value.trim();
      saved.phone = form.elements.phone.value.trim();
      if (user.role === 'counsellor') Object.assign(saved, {
        specialisation: form.elements.specialisation.value.trim(), qualification: form.elements.qualification.value.trim(), description: form.elements.description.value.trim()
      }
      );
      writeList(user.role === 'student' ? KEYS.students : KEYS.counsellors, users);
      flash('Your profile has been updated.', 'success');
    }
    );
  }


  // Runs the correct setup function after the current page has loaded.


  document.addEventListener('DOMContentLoaded', () => {
    ensureDemoCounsellors();
    renderNav();
    const page = document.body.dataset.page;
    if (page === 'home') renderHomeCounsellors();
    if (page === 'login') initialiseAuth();
    if (page === 'counsellors') renderCounsellors();
    if (page === 'book') initialiseBooking();
    if (page === 'student-dashboard') initialiseStudentDashboard();
    if (page === 'counsellor-dashboard') initialiseCounsellorDashboard();
    if (page === 'profile') initialiseProfile();
  }
  );
}
());
