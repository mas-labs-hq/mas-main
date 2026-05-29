/**
 * ShuleVine - sd-ui.js - App Init, Dashboard, Navigation, Settings
 * Powered By MortApps Studios
 */

// ============================================================
// LICENSE SYSTEM v5.0 (Hardened - Enforced Blocking)
// ============================================================


// ============================================================
// DEMO BOOT (No License Required)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading-screen');
  const app = document.getElementById('app');

  if (loadingScreen) { loadingScreen.style.display = 'flex'; loadingScreen.style.opacity = '1'; }

  try {
    await db.init();
    await db.initSubjects();
    SoundManager.init();
    const soundsEnabled = await db.getSetting('soundsEnabled');
    if (soundsEnabled !== null) SoundManager.enabled = soundsEnabled;
    const savedTheme = await db.getSetting('theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    await loadSettingsUI();

    const licenseBadge = document.getElementById('header-license-badge');
    if (licenseBadge) { licenseBadge.textContent = 'Demo'; licenseBadge.style.background = 'rgba(245,158,11,0.15)'; licenseBadge.style.color = '#f59e0b'; licenseBadge.classList.remove('expiring','expired'); }

    // Minimum loading display time so user can see the DEMO splash
    const minLoadTime = 2500;
    const loadStart = Date.now();
    const elapsed = Date.now() - loadStart;
    const remaining = Math.max(0, minLoadTime - elapsed);

    setTimeout(() => {
      if (loadingScreen) loadingScreen.classList.add('fade-out');
      if (app) app.classList.remove('hidden');
      setTimeout(() => { if (loadingScreen) loadingScreen.style.display = 'none'; }, 600);
      initNavigation(); initSidebar(); initThemeToggle(); initSoundToggle();
      loadDashboard(); updateTermDisplay(); initSettings(); initUpdateChecker(); renderIcons();
    }, remaining || minLoadTime);
  } catch (err) { console.error('App init error:', err); showToast('Error initializing: ' + err.message, 'error'); }
});

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => { e.preventDefault(); navigateTo(item.dataset.page); });
  });
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  const titles = { dashboard:'Dashboard', students:'Students', fees:'Fees Management', academics:'Academics', reports:'Reports', conduct:'Conduct', settings:'Settings' };
  document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
  SoundManager.play('click');
  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'students': loadStudentsList(); break;
    case 'fees': loadPaymentsList(); break;
    case 'academics': if (typeof initAcademicsTabs === 'function') initAcademicsTabs(); loadExamsList(); populateExamSelects(); break;
    case 'conduct': loadDisciplinePage(); break;
    case 'settings': loadSettingsUI(); break;
  }
  if (window.innerWidth <= 1024) document.body.classList.remove('sidebar-open');
}

// ============================================================
// SIDEBAR
// ============================================================
function initSidebar() {
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    if (window.innerWidth <= 1024) document.body.classList.toggle('sidebar-open');
    else document.body.classList.toggle('sidebar-collapsed');
    SoundManager.play('click');
  });
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.getElementById('sidebar-toggle');
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) document.body.classList.remove('sidebar-open');
    }
  });
}

// ============================================================
// THEME TOGGLE
// ============================================================
function initThemeToggle() {
  document.getElementById('theme-toggle').addEventListener('click', async () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    await db.setSetting('theme', next);
    updateThemeIcon();
    SoundManager.play('click');
  });
}

function updateThemeIcon() {
  const icon = document.getElementById('theme-icon');
  const themeToggle = document.getElementById('theme-toggle');
  if (!icon || !themeToggle) return;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  themeToggle.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  renderIcons();

  // Sync settings checkbox
  const themeCheckbox = document.getElementById('set-theme');
  if (themeCheckbox) themeCheckbox.checked = isDark;
}

// ============================================================
// SOUND TOGGLE
// ============================================================
function initSoundToggle() {
  const checkbox = document.getElementById('set-sounds');
  if (!checkbox) return;
  checkbox.checked = SoundManager.enabled;
  checkbox.addEventListener('change', async () => {
    SoundManager.enabled = checkbox.checked;
    await db.setSetting('soundsEnabled', checkbox.checked);
    if (checkbox.checked) SoundManager.play('success');
  });
}

// ============================================================
// TERM DISPLAY
// ============================================================
function updateTermDisplay() {
  const termDisplay = document.getElementById('term-display');
  if (termDisplay) termDisplay.textContent = `Term ${getCurrentTerm()} ${new Date().getFullYear()}`;
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
  const statsGrid = document.getElementById('dashboard-stats');
  const stats = await db.getDashboardStats();
  const schoolName = await db.getSetting('schoolName');
  const schoolDisplay = document.getElementById('school-name-display');
  if (schoolDisplay && schoolName) schoolDisplay.textContent = schoolName;

  const curriculum = stats.curriculum || '844';
  const curriculumBadge = curriculum === 'cbc' ? '<span class="badge badge-cbc">CBC</span>' : '<span class="badge badge-844">8-4-4</span>';
  const subjectLabel = curriculum === 'cbc' ? 'Learning Areas' : 'Subjects';

  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">${ic('users','')}</div>
      <div class="stat-value">${stats.activeStudents}</div>
      <div class="stat-label">Active Students</div>
      <div class="stat-sub">${stats.totalStudents} total | ${Object.entries(stats.typeCounts).map(([k,v])=>`${k}: ${v}`).join(' | ')}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${ic('banknote','')}</div>
      <div class="stat-value">${formatKES(stats.totalCollected)}</div>
      <div class="stat-label">Total Collected</div>
      <div class="stat-sub">${stats.totalPayments} payments | ${stats.voidedPayments} voided</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${ic('clipboard-list','')}</div>
      <div class="stat-value">${stats.totalExams}</div>
      <div class="stat-label">Exams Created</div>
      <div class="stat-sub">Term ${stats.currentTerm} ${stats.currentYear} ${curriculumBadge}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${ic('shield','')}</div>
      <div class="stat-value">${stats.disciplineStats.totalIncidents}</div>
      <div class="stat-label">Incidents This Term</div>
      <div class="stat-sub">${stats.disciplineStats.totalMerits} merits | ${stats.disciplineStats.criticalIncidents} critical</div>
    </div>`;
  scheduleIcons();
  loadDashboardCharts(stats);
}

async function loadDashboardCharts(stats) {
  if (typeof Chart === 'undefined') {
    await new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'; s.onload = resolve; s.onerror = reject; document.head.appendChild(s); });
  }
  const classCanvas = document.getElementById('chart-class-distribution');
  if (classCanvas) {
    const existingChart = Chart.getChart(classCanvas); if (existingChart) existingChart.destroy();
    const classLabels = Object.keys(stats.classCounts);
    const classData = Object.values(stats.classCounts);
    const colors = ['rgba(124,58,237,0.8)','rgba(139,92,246,0.8)','rgba(167,139,250,0.8)','rgba(100,226,218,0.8)','rgba(59,130,246,0.8)','rgba(16,185,129,0.8)','rgba(245,158,11,0.8)','rgba(239,68,68,0.8)'];
    new Chart(classCanvas, { type:'doughnut', data:{ labels:classLabels, datasets:[{ data:classData, backgroundColor:colors.slice(0,classLabels.length), borderWidth:0 }] }, options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:'#8892b0', padding:15 } } } } });
  }
  const feeCanvas = document.getElementById('chart-fee-collection');
  if (feeCanvas) {
    const existingChart = Chart.getChart(feeCanvas); if (existingChart) existingChart.destroy();
    const payments = await db.getAll('feePayments');
    const validPayments = payments.filter(p => !p.voided);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = new Array(12).fill(0);
    validPayments.forEach(p => { const d = new Date(p.date); if (d.getFullYear() === currentYear) monthlyData[d.getMonth()] += p.amount; });
    new Chart(feeCanvas, { type:'bar', data:{ labels:months, datasets:[{ label:'Fee Collection (KES)', data:monthlyData, backgroundColor:'rgba(124,58,237,0.6)', borderColor:'rgba(124,58,237,1)', borderWidth:1, borderRadius:4 }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true, ticks:{ color:'#8892b0', callback:(v)=>'KES '+(v>=1000000?(v/1000000).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'K':v) }, grid:{ color:'rgba(30,41,59,0.5)' } }, x:{ ticks:{ color:'#8892b0' }, grid:{ display:false } } }, plugins:{ legend:{ labels:{ color:'#8892b0' } } } } });
  }
}

// ============================================================
// SETTINGS
// ============================================================
function initSettings() {
  const countySelect = document.getElementById('set-county');
  if (countySelect) { countySelect.innerHTML = '<option value="">Select County</option>'; SV.COUNTIES.forEach(c => countySelect.innerHTML += `<option value="${c}">${c}</option>`); }
  const categorySelect = document.getElementById('set-category');
  if (categorySelect) { categorySelect.innerHTML = '<option value="">Select Category</option>'; SV.SCHOOL_CATEGORIES.forEach(c => categorySelect.innerHTML += `<option value="${c}">${c}</option>`); }
  const logoUploadArea = document.getElementById('logo-upload-area');
  const logoInput = document.getElementById('set-logo');
  if (logoUploadArea && logoInput) {
    logoUploadArea.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', async (e) => { const file = e.target.files[0]; if (!file) return; try { const base64 = await compressLogo(file); await db.setSetting('logo', base64); updateLogoPreview(base64); showToast('Logo uploaded', 'success'); } catch (err) { showToast('Error: ' + err.message, 'error'); } });
  }
  // Initialize stream name inputs for the Add Class form
  updateStreamNameInputs();
}

async function loadSettingsUI() {
  const sets = {};
  const keys = ['schoolName','motto','county','subCounty','category','gradingSystem','cbcGradeLevel','logo','clearanceThreshold','lateFeePenalty','nextTermOpeningDate','schoolLevel','includeExpelledInDefaulters'];
  for (const k of keys) sets[k] = await db.getSetting(k);

  const el = (id) => document.getElementById(id);
  if (el('set-school-name')) el('set-school-name').value = sets.schoolName || '';
  if (el('set-motto')) el('set-motto').value = sets.motto || '';
  if (el('set-county')) el('set-county').value = sets.county || '';
  if (el('set-subcounty')) el('set-subcounty').value = sets.subCounty || '';
  if (el('set-category')) el('set-category').value = sets.category || '';
  if (el('set-grading')) el('set-grading').value = sets.gradingSystem || '844';
  if (sets.logo) updateLogoPreview(sets.logo);
  if (el('set-clearance-threshold')) el('set-clearance-threshold').value = sets.clearanceThreshold || 0;
  if (el('set-late-fee')) el('set-late-fee').value = sets.lateFeePenalty || 0;
  if (el('set-next-term-date')) el('set-next-term-date').value = sets.nextTermOpeningDate || '';
  const includeExpelledCb = el('set-include-expelled-defaulters');
  if (includeExpelledCb) includeExpelledCb.checked = sets.includeExpelledInDefaulters || false;

  // CBC Grade Level select
  const cbcGradeLevelSelect = el('set-cbc-grade-level');
  if (cbcGradeLevelSelect) {
    cbcGradeLevelSelect.innerHTML = '';
    SV.CBC_GRADE_LEVELS.forEach(g => {
      cbcGradeLevelSelect.innerHTML += `<option value="${g.value}" ${g.value === (sets.cbcGradeLevel || 'g7') ? 'selected' : ''}>${g.label}</option>`;
    });
  }

  // Show/hide CBC grade level row based on curriculum
  toggleCBCGradeLevel(sets.gradingSystem || '844');

  // Curriculum change handler
  const gradingSelect = el('set-grading');
  if (gradingSelect) {
    gradingSelect.onchange = () => {
      toggleCBCGradeLevel(gradingSelect.value);
    };
  }

  // Sync sound toggle
  const soundsCb = el('set-sounds');
  if (soundsCb) soundsCb.checked = SoundManager.enabled;

  // Sync theme toggle
  const themeCb = el('set-theme');
  if (themeCb) themeCb.checked = document.documentElement.getAttribute('data-theme') !== 'light';
  if (themeCb) {
    themeCb.onchange = async () => {
      const next = themeCb.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      await db.setSetting('theme', next);
      updateThemeIcon();
      SoundManager.play('click');
    };
  }

  // Sync school level toggle
  const schoolLevelSelect = el('set-school-level');
  if (schoolLevelSelect) {
    schoolLevelSelect.value = sets.schoolLevel || 'secondary';
    schoolLevelSelect.onchange = async () => {
      await db.setSetting('schoolLevel', schoolLevelSelect.value);
      const label = schoolLevelSelect.value === 'primary' ? 'Pupil' : 'Student';
      showToast(`School level set to ${schoolLevelSelect.value === 'primary' ? 'Primary' : 'Secondary'} (${label})`, 'success');
      SoundManager.play('success');
      // Refresh sidebar label and current page
      updateSidebarLabel();
      if (typeof loadStudentsList === 'function') loadStudentsList();
    };
  }

  // Load storage meter
  await loadStorageMeter();

  // Load security status
  await updateSecurityStatus();

  await loadClassesConfig();
}

function toggleCBCGradeLevel(curriculum) {
  const cbcRow = document.getElementById('cbc-grade-level-row');
  if (cbcRow) {
    cbcRow.style.display = curriculum === 'cbc' ? '' : 'none';
  }
}

function updateLogoPreview(base64) { const p = document.getElementById('logo-preview'); if (p) p.innerHTML = `<img src="${base64}" alt="School Logo">`; }

async function saveSchoolProfile() {
  const el = (id) => document.getElementById(id)?.value?.trim() || '';
  try {
    const newCurriculum = document.getElementById('set-grading')?.value || '844';
    const oldCurriculum = await db.getSetting('gradingSystem') || '844';
    
    await db.setSetting('schoolName', el('set-school-name'));
    await db.setSetting('motto', el('set-motto'));
    await db.setSetting('county', document.getElementById('set-county')?.value || '');
    await db.setSetting('subCounty', el('set-subcounty'));
    await db.setSetting('category', document.getElementById('set-category')?.value || '');
    await db.setSetting('gradingSystem', newCurriculum);

    // Save CBC grade level if applicable
    if (newCurriculum === 'cbc') {
      const cbcGradeLevel = document.getElementById('set-cbc-grade-level')?.value || 'g7';
      await db.setSetting('cbcGradeLevel', cbcGradeLevel);
    }

    const sd = document.getElementById('school-name-display'); if (sd) sd.textContent = el('set-school-name');
    
    // If curriculum changed, switch subjects
    if (newCurriculum !== oldCurriculum) {
      await db.switchCurriculum(newCurriculum);
      showToast(`Curriculum switched to ${newCurriculum === 'cbc' ? 'CBC' : '8-4-4 (KCSE)'}. Subjects updated.`, 'success');
      // Refresh dashboard and any loaded page to reflect curriculum change
      loadDashboard();
      // Refresh subjects list if academics page is visible
      const subjectsList = document.getElementById('subjects-list');
      if (subjectsList && subjectsList.innerHTML.trim()) loadSubjectsList();
    } else {
      showToast('School profile saved', 'success');
    }
  } catch (err) { showToast('Error: ' + err.message, 'error'); }
}

async function saveFeeSettings() {
  try {
    await db.setSetting('clearanceThreshold', parseFloat(document.getElementById('set-clearance-threshold')?.value) || 0);
    await db.setSetting('lateFeePenalty', parseFloat(document.getElementById('set-late-fee')?.value) || 0);
    await db.setSetting('nextTermOpeningDate', document.getElementById('set-next-term-date')?.value || '');
    const includeExpelledCb = document.getElementById('set-include-expelled-defaulters');
    if (includeExpelledCb) await db.setSetting('includeExpelledInDefaulters', includeExpelledCb.checked);
    showToast('Fee settings saved', 'success');
  } catch (err) { showToast('Error: ' + err.message, 'error'); }
}

async function saveSecuritySettings() {
  const pin = document.getElementById('set-pin')?.value?.trim() || '';
  const question = document.getElementById('set-security-question')?.value || '';
  const answer = document.getElementById('set-security-answer')?.value?.trim() || '';

  if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) { showToast('PIN must be exactly 4 digits', 'error'); return; }

  try {
    if (pin) {
      await db.setSetting('pin', pin);
    }
    if (question && answer) {
      await db.setSetting('securityQuestion', question);
      await db.setSetting('securityAnswer', answer.toLowerCase().trim());
    }
    document.getElementById('set-pin').value = '';
    document.getElementById('set-security-answer').value = '';
    showToast('Security settings saved', 'success');
    updateSecurityStatus();
  } catch (err) { showToast('Error: ' + err.message, 'error'); }
}

async function updateSecurityStatus() {
  const pin = await db.getSetting('pin');
  const question = await db.getSetting('securityQuestion');
  const statusEl = document.getElementById('security-status');
  const changeBtn = document.getElementById('btn-change-pin');
  const disableBtn = document.getElementById('btn-disable-pin');
  const pinInput = document.getElementById('set-pin');

  if (statusEl) {
    if (pin) {
      statusEl.innerHTML = '<span class="badge badge-active">PIN Active</span>' + (question ? ' <span class="badge badge-merit">Recovery Question Set</span>' : ' <span class="badge badge-suspended">No Recovery Question</span>');
    } else {
      statusEl.innerHTML = '<span class="badge badge-voided">No PIN Set</span>';
    }
  }
  if (changeBtn) changeBtn.style.display = pin ? '' : 'none';
  if (disableBtn) disableBtn.style.display = pin ? '' : 'none';
  if (pinInput) pinInput.placeholder = pin ? 'Enter new PIN to change' : '****';

  // Load security question into form
  const questionSelect = document.getElementById('set-security-question');
  if (questionSelect && question) questionSelect.value = question;

  scheduleIcons();
}

async function changePin() {
  const currentPin = await db.getSetting('pin');
  if (!currentPin) { showToast('No PIN is currently set', 'warning'); return; }

  showPrompt('Enter current PIN', '4-digit PIN', async (entered) => {
    if (entered !== currentPin) { showToast('Incorrect current PIN', 'error'); return; }
    showPrompt('Enter new PIN', '4-digit PIN', async (newPin) => {
      if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { showToast('PIN must be exactly 4 digits', 'error'); return; }
      await db.setSetting('pin', newPin);
      showToast('PIN changed successfully', 'success');
      SoundManager.play('success');
    }, 'password');
  }, 'password');
}

async function disablePin() {
  const currentPin = await db.getSetting('pin');
  if (!currentPin) { showToast('No PIN is currently set', 'warning'); return; }

  showPrompt('Enter current PIN to disable', '4-digit PIN', async (entered) => {
    if (entered !== currentPin) { showToast('Incorrect PIN', 'error'); return; }
    showConfirm('Disable PIN protection? This will allow anyone to void receipts and override exam clearance without verification.', async () => {
      await db.setSetting('pin', '');
      showToast('PIN disabled', 'success');
      SoundManager.play('success');
      updateSecurityStatus();
    });
  }, 'password');
}

async function forgotPin() {
  const question = await db.getSetting('securityQuestion');
  const answer = await db.getSetting('securityAnswer');

  if (!question || !answer) {
    showToast('No security question set. You cannot recover your PIN.', 'error');
    return;
  }

  closeModal('pin-modal');

  const questionLabels = {
    primary_school: 'What primary school did you attend?',
    mother_maiden: "What is your mother's maiden name?",
    first_pet: 'What was the name of your first pet?',
    favorite_food: 'What is your favorite food?',
    birth_town: 'In which town were you born?',
    childhood_friend: "What was your childhood best friend's name?"
  };

  const questionText = questionLabels[question] || question;

  showPrompt(questionText, 'Enter your answer', async (enteredAnswer) => {
    if (!enteredAnswer) { showToast('Answer is required', 'error'); return; }
    if (enteredAnswer.toLowerCase().trim() !== answer) {
      showToast('Incorrect answer', 'error');
      return;
    }
    showConfirm('PIN will be cleared. You can set a new one in Settings.', async () => {
      await db.setSetting('pin', '');
      showToast('PIN cleared. Set a new one in Settings.', 'success');
      SoundManager.play('success');
    });
  });
}


async function loadClassesConfig() {
  const container = document.getElementById('classes-config'); if (!container) return;
  let classes = await db.getSetting('classes') || [];
  if (classes.length === 0) { container.innerHTML = '<p style="color:var(--text-muted)">No classes configured. Add your first class below.</p>'; populateStudentClassSelects(); return; }

  // Migrate old format: if any class has streams as a number, convert to array
  let needsMigration = false;
  classes = classes.map(cls => {
    if (typeof cls.streams === 'number') {
      needsMigration = true;
      return { ...cls, streams: getStreamNames(cls) };
    }
    return cls;
  });
  if (needsMigration) {
    await db.setSetting('classes', classes);
  }

  container.innerHTML = classes.map(cls => {
    const streams = getStreamNames(cls);
    return `<div class="class-config-item"><span class="class-name">${escapeHtml(cls.name)}</span><span class="class-streams">${streams.length} stream${streams.length!==1?'s':''} (${streams.map(s=>escapeHtml(s)).join(', ')})</span><button class="btn-icon" title="Edit Streams" onclick="editClassStreams('${escapeHtml(cls.name)}')">${ic('edit-3','')}</button><button class="btn-icon" title="Remove" onclick="removeClass('${escapeHtml(cls.name)}')">${ic('trash-2','')}</button></div>`;
  }).join('');
  scheduleIcons();
  populateStudentClassSelects();
}

async function addClass() {
  const name = document.getElementById('new-class-name')?.value?.trim();
  const streamCount = parseInt(document.getElementById('new-class-streams')?.value) || 1;
  if (!name) { showToast('Please enter a class name', 'error'); return; }
  if (streamCount < 1 || streamCount > 10) { showToast('Streams must be 1-10', 'error'); return; }
  const classes = await db.getSetting('classes') || [];
  if (classes.find(c => c.name.toLowerCase() === name.toLowerCase())) { showToast('Class already exists', 'error'); return; }

  // Collect stream names from the dynamic inputs
  const streamNames = [];
  for (let i = 0; i < streamCount; i++) {
    const input = document.getElementById(`stream-name-${i}`);
    const streamName = input ? input.value.trim() : '';
    if (!streamName) { showToast(`Stream ${i + 1} name cannot be empty`, 'error'); return; }
    streamNames.push(streamName);
  }
  // Check for duplicate stream names within this class
  const uniqueNames = new Set(streamNames.map(n => n.toLowerCase()));
  if (uniqueNames.size !== streamNames.length) { showToast('Stream names must be unique within a class', 'error'); return; }

  classes.push({ name, streams: streamNames }); await db.setSetting('classes', classes);
  document.getElementById('new-class-name').value = '';
  document.getElementById('new-class-streams').value = '1';
  // Clear dynamic stream name inputs
  const streamNamesContainer = document.getElementById('stream-names-container');
  if (streamNamesContainer) streamNamesContainer.innerHTML = '';
  showToast(`Class "${name}" added with streams: ${streamNames.join(', ')}`, 'success'); loadClassesConfig();
}

/**
 * Dynamically generate stream name input fields based on stream count
 */
function updateStreamNameInputs() {
  const streamCount = parseInt(document.getElementById('new-class-streams')?.value) || 1;
  const container = document.getElementById('stream-names-container');
  if (!container) return;
  const sl = 'ABCDEFGHIJ';
  let html = '';
  for (let i = 0; i < streamCount; i++) {
    html += `<div class="form-group" style="min-width:80px"><label>Stream ${i + 1}</label><input type="text" id="stream-name-${i}" value="${sl[i]}" placeholder="${sl[i]}" maxlength="20"></div>`;
  }
  container.innerHTML = html;
}

async function removeClass(className) {
  showConfirm(`Remove class "${className}"?`, async () => {
    const classes = await db.getSetting('classes') || [];
    await db.setSetting('classes', classes.filter(c => c.name !== className));
    showToast('Class removed', 'success'); loadClassesConfig();
  });
}

async function editClassStreams(className) {
  const classes = await db.getSetting('classes') || [];
  const cls = classes.find(c => c.name === className);
  if (!cls) { showToast('Class not found', 'error'); return; }
  const currentNames = getStreamNames(cls);
  const currentCount = currentNames.length;

  const newCount = prompt(`How many streams for "${className}"?\n(Current: ${currentCount} stream${currentCount!==1?'s':''}: ${currentNames.join(', ')})`, currentCount);
  if (newCount === null) return;
  const count = parseInt(newCount);
  if (isNaN(count) || count < 1 || count > 10) { showToast('Streams must be a number between 1 and 10', 'error'); return; }

  // Build new stream names array, preserving existing names
  const sl = 'ABCDEFGHIJ';
  const newNames = [];
  for (let i = 0; i < count; i++) {
    // Keep existing name if available, otherwise default to letter
    newNames.push(currentNames[i] || sl[i]);
  }

  // Ask for each stream name
  for (let i = 0; i < count; i++) {
    const newName = prompt(`Name for stream ${i + 1} of "${className}":`, newNames[i]);
    if (newName === null) { showToast('Edit cancelled', 'info'); return; } // User cancelled
    const trimmed = newName.trim();
    if (!trimmed) { showToast('Stream name cannot be empty', 'error'); return; }
    newNames[i] = trimmed;
  }

  // Check for duplicate names
  const uniqueCheck = new Set(newNames.map(n => n.toLowerCase()));
  if (uniqueCheck.size !== newNames.length) { showToast('Stream names must be unique within a class', 'error'); return; }

  // Check if anything actually changed
  if (JSON.stringify(currentNames) === JSON.stringify(newNames)) { showToast('No change needed', 'info'); return; }

  cls.streams = newNames;
  await db.setSetting('classes', classes);

  // Migrate any students whose stream no longer exists
  const students = await db.getAll('students');
  let migrated = 0;
  for (const student of students) {
    if (student.class === className && !newNames.includes(student.stream)) {
      // Student's stream was removed, assign to first stream
      student.stream = newNames[0];
      await db.put('students', student);
      migrated++;
    }
  }

  let msg = `"${className}" updated to ${count} stream${count!==1?'s':''}: ${newNames.join(', ')}`;
  if (migrated > 0) msg += ` (${migrated} student${migrated!==1?'s':''} moved to ${newNames[0]})`;
  showToast(msg, 'success');
  loadClassesConfig();
}

// ============================================================
// BACKUP & RESTORE
// ============================================================
async function exportBackup() {
  try { const backup = await db.exportBackup(); downloadFile(JSON.stringify(backup, null, 2), `ShuleVine_Backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json'); showToast('Backup exported', 'success'); }
  catch (err) { showToast('Error: ' + err.message, 'error'); }
}

function importBackup() {
  const input = document.getElementById('backup-file-input'); if (!input) return;
  input.onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const text = await file.text(); const data = JSON.parse(text);
      if (!data.appName || data.appName !== 'ShuleVine') { showToast('Invalid backup file', 'error'); return; }
      showConfirm(`Restore backup from "${data.schoolName || 'Unknown'}"? This will REPLACE all data!`, async () => {
        try { const summary = await db.importBackup(data); const total = Object.values(summary).reduce((s,c)=>s+c,0); showToast(`Restored: ${total} records`, 'success'); loadSettingsUI(); loadDashboard(); }
        catch (err) { showToast('Error: ' + err.message, 'error'); }
      });
    } catch (err) { showToast('Invalid file: ' + err.message, 'error'); }
    input.value = '';
  };
  input.click();
}

// ============================================================
// LOAD DATA (CSV Import & Test Data)
// ============================================================

/**
 * Download a CSV template with the correct column headers for student import
 */
function downloadCSVTemplate() {
  const headers = [
    'Admission No',
    'First Name',
    'Last Name',
    'Gender',
    'Class',
    'Stream',
    'Type',
    'Curriculum',
    'Guardian Name',
    'Guardian Phone',
    'Status'
  ];

  // Two example rows so users see the expected format
  const examples = [
    ['SCH/2026/001', 'Wanjiku', 'Njoroge', 'female', 'Form 1', 'North', 'boarder', '844', 'Grace Njoroge', '0721 345 678', 'active'],
    ['SCH/2026/002', 'Otieno', 'Oketch', 'male', 'Form 1', 'South', 'day', '844', 'James Oketch', '0733 456 789', 'active']
  ];

  let csv = headers.join(',') + '\n';
  examples.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  // Add a blank row with hints for each column
  const hints = ['Required', 'Required', 'Required', 'male/female', 'e.g. Form 1', 'Any name (A, North, East...)', 'boarder/day', '844/cbc', 'Parent name', '07XX XXX XXX', 'active/transferred/graduated/suspended'];
  csv += hints.map(h => `"${h}"`).join(',') + '\n';

  downloadFile(csv, 'ShuleVine_Student_Template.csv', 'text/csv');
  showToast('Template downloaded! Open it in Excel or Google Sheets.', 'success');
  SoundManager.play('success');
}

/**
 * Import students from a CSV file (main entry point for Load Data section)
 */
function importCSVData() {
  const input = document.getElementById('csv-file-input');
  if (!input) return;
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        showToast('CSV file is empty or has no data rows', 'error');
        return;
      }

      // Count rows (skip header and hint rows)
      const dataLines = lines.slice(1).filter(line => {
        const cols = parseCSVLine(line);
        // Skip rows that look like hints (first cell contains "Required" or "e.g.")
        const first = cols[0]?.trim().toLowerCase();
        return first && first !== 'required' && !first.startsWith('e.g.');
      });

      if (dataLines.length === 0) {
        showToast('No student data found in the file. Make sure to fill in the template.', 'error');
        return;
      }

      showConfirm(`Import ${dataLines.length} student${dataLines.length !== 1 ? 's' : ''} from "${file.name}"? Students with duplicate admission numbers will be skipped.`, async () => {
        let imported = 0;
        let skipped = 0;
        const curriculum = await getActiveCurriculum();

        for (const line of dataLines) {
          const cols = parseCSVLine(line);
          if (cols.length < 3) { skipped++; continue; }

          const admNo = cols[0]?.trim();
          const firstName = cols[1]?.trim();
          const lastName = cols[2]?.trim();

          if (!admNo || !firstName || !lastName) { skipped++; continue; }

          // Check for duplicate admission number
          const existing = await db.getOneByIndex('students', 'admissionNumber', admNo);
          if (existing) { skipped++; continue; }

          const student = {
            id: generateId(),
            admissionNumber: admNo,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            gender: cols[3]?.trim().toLowerCase() || '',
            class: cols[4]?.trim() || '',
            stream: cols[5]?.trim() || '',
            type: cols[6]?.trim().toLowerCase() || 'boarder',
            curriculum: cols[7]?.trim().toLowerCase() || curriculum,
            guardianName: cols[8]?.trim() || '',
            guardianPhone: cols[9]?.trim() || '',
            status: cols[10]?.trim().toLowerCase() || 'active',
            subjectCombination: [],
            streamSortOrder: 0,
            dateAdded: new Date().toISOString()
          };

          await db.add('students', student);
          imported++;
        }

        SoundManager.play('success');
        showToast(`Imported ${imported} student${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped - duplicate or incomplete)` : ''}`, 'success');

        // Refresh student list and dashboard if visible
        if (typeof loadStudentsList === 'function') loadStudentsList();
        if (typeof loadDashboard === 'function') loadDashboard();
      });
    } catch (err) {
      showToast('Error importing: ' + err.message, 'error');
    }
    input.value = '';
  };
  input.click();
}

/**
 * Import seed file (.js) for test data
 * Uses file picker so user manually selects the seed file from their computer
 * Injects as inline script so it runs in global scope with access to db, generateId(), etc.
 * Polls for window.__seedComplete flag set by the seed script upon completion.
 */
function importSeedFile() {
  const input = document.getElementById('seed-file-input');
  if (!input) return;
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showConfirm(`Run seed file "${file.name}"? This will add data to your database.`, async () => {
      try {
        showToast('Loading seed file...', 'info');
        // Reset completion flag
        window.__seedComplete = false;
        const text = await file.text();
        // Inject as inline script - runs in global scope with access to db, generateId(), etc.
        const script = document.createElement('script');
        script.textContent = text;
        document.head.appendChild(script);
        // Poll for completion flag (seed scripts should set window.__seedComplete = true when done)
        const pollInterval = 200; // check every 200ms
        const maxWait = 15000; // max 15 seconds
        let elapsed = 0;
        const pollId = setInterval(() => {
          elapsed += pollInterval;
          if (window.__seedComplete || elapsed >= maxWait) {
            clearInterval(pollId);
            script.remove(); // Clean up the script element
            showToast('Seed data loaded! Refreshing...', 'success');
            SoundManager.play('success');
            setTimeout(() => location.reload(), 1000);
          }
        }, pollInterval);
      } catch (err) {
        showToast('Error running seed file: ' + err.message, 'error');
      }
    });
    input.value = '';
  };
  input.click();
}

// ============================================================
// CONTACT FORM
// ============================================================

function openContactForm() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  // Reset form
  const form = document.getElementById('contact-form');
  if (form) form.reset();
  // Pre-fill school name if available
  db.getSetting('schoolName').then(name => {
    const schoolInput = document.getElementById('contact-school');
    if (schoolInput && name) schoolInput.value = name;
  });
  // Hide status
  const status = document.getElementById('contact-form-status');
  if (status) { status.style.display = 'none'; status.className = 'contact-form-status'; }
  modal.classList.add('active');
  SoundManager.play('click');
}

async function submitContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Basic validation
  const school = document.getElementById('contact-school')?.value?.trim();
  const phone = document.getElementById('contact-phone')?.value?.trim();
  const email = document.getElementById('contact-email')?.value?.trim();
  const position = document.getElementById('contact-position')?.value;
  const message = document.getElementById('contact-message')?.value?.trim();

  if (!school || !phone || !email || !position || !message) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const status = document.getElementById('contact-form-status');

  try {
    const formData = new FormData(form);
    const response = await fetch('https://formspree.io/f/mjgekqvw', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      if (status) {
        status.style.display = 'block';
        status.className = 'contact-form-status success';
        status.textContent = 'Thank you for reaching out! We appreciate your feedback and will get back to you shortly.';
      }
      form.reset();
      SoundManager.play('success');
      // Auto-close after 4 seconds
      setTimeout(() => closeModal('contact-modal'), 4000);
    } else {
      if (status) {
        status.style.display = 'block';
        status.className = 'contact-form-status error';
        status.textContent = 'Something went wrong. Please try again or contact us directly via email.';
      }
    }
  } catch (err) {
    if (status) {
      status.style.display = 'block';
      status.className = 'contact-form-status error';
      status.textContent = 'Network error. Please check your connection and try again.';
    }
  }
}

// ============================================================
// STORAGE METER
// ============================================================

async function loadStorageMeter() {
  const container = document.getElementById('storage-meter-content');
  if (!container) return;

  try {
    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      try {
        const persisted = await navigator.storage.persisted();
        if (!persisted) {
          await navigator.storage.persist();
        }
      } catch (e) { /* ignore */ }
    }

    // Use db.count() for fast record counting (no need to load all records)
    const storeNames = ['students','feePayments','feeStructures','bursaries','feeAdjustments','exams','scores','discipline','settings'];
    let totalRecords = 0;
    const storeCounts = {};

    for (const store of storeNames) {
      try {
        const count = await db.count(store);
        storeCounts[store] = count || 0;
        totalRecords += (count || 0);
      } catch (e) {
        storeCounts[store] = 0;
      }
    }

    // Use navigator.storage.estimate() for real usage data
    let usedMB = 0;
    let quotaMB = 250;
    let isPersistent = false;
    let hasRealUsage = false;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate && typeof estimate.usage === 'number' && !isNaN(estimate.usage)) {
          usedMB = parseFloat((estimate.usage / (1024 * 1024)).toFixed(2));
          hasRealUsage = estimate.usage > 0;
        }
        if (estimate && typeof estimate.quota === 'number' && !isNaN(estimate.quota)) {
          quotaMB = Math.max(250, Math.round(estimate.quota / (1024 * 1024)));
        }
      } catch (e) { /* fallback */ }
    }

    // If storage API returned 0 or unavailable, estimate from record count
    if (!hasRealUsage || usedMB === 0) {
      usedMB = parseFloat((totalRecords * 2 / 1024).toFixed(2));
    }

    if (navigator.storage && navigator.storage.persisted) {
      try { isPersistent = await navigator.storage.persisted(); } catch (e) {}
    }

    const usagePercent = quotaMB > 0 ? Math.min(100, Math.round((usedMB / quotaMB) * 100)) : 0;
    const isWarning = usagePercent >= 95;
    const barColor = usagePercent >= 95 ? 'var(--danger)' : usagePercent >= 75 ? 'var(--warning)' : 'var(--primary)';

    container.innerHTML = `
      <div class="storage-meter">
        <div class="storage-bar-container">
          <div class="storage-bar-fill" style="width:${usagePercent}%; background:${barColor}"></div>
        </div>
        <div class="storage-info">
          <span>${totalRecords} records | ${usedMB} MB used</span>
          <span>${usagePercent}% of ${quotaMB} MB</span>
        </div>
        ${isPersistent ? '<span class="badge badge-active" style="margin:0.25rem 0">Data Protected from Browser Clearing</span>' : '<span class="badge badge-suspended" style="margin:0.25rem 0">Data Not Protected - Back Up Regularly</span>'}
        ${isWarning ? '<p class="hint warning">Storage is nearly full! Back up your data and consider clearing old records.</p>' : ''}
        <div class="storage-breakdown">
          ${Object.entries(storeCounts).filter(([,c]) => c > 0).sort((a,b) => b[1] - a[1]).map(([store, count]) => {
            const labels = {
              students: 'Students', feePayments: 'Payments', feeStructures: 'Fee Structures',
              bursaries: 'Bursaries', feeAdjustments: 'Adjustments', exams: 'Exams',
              scores: 'Exam Scores', discipline: 'Discipline', settings: 'Settings'
            };
            return `<span class="storage-chip">${labels[store] || store}: ${count}</span>`;
          }).join('')}
        </div>
      </div>
      <div class="settings-btn-group" style="margin-top:0.5rem">
        <button class="btn btn-outline btn-block" onclick="clearOldData()">${ic('trash-2', 'btn-icon-lucide')} Clear Old Data</button>
        <button class="btn btn-outline btn-block" onclick="requestPersistentStorage()">${ic('shield', 'btn-icon-lucide')} Protect Data</button>
      </div>`;
    scheduleIcons();
  } catch (err) {
    container.innerHTML = '<p class="hint">Unable to calculate storage usage</p>';
  }
}

async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const granted = await navigator.storage.persist();
      if (granted) {
        showToast('Data is now protected from automatic browser clearing', 'success');
      } else {
        showToast('Browser denied persistent storage. Try installing ShuleVine as an app first.', 'warning');
      }
      loadStorageMeter();
    } catch (e) {
      showToast('Could not request persistent storage', 'error');
    }
  } else {
    showToast('Persistent storage is not supported in this browser', 'warning');
  }
}

async function clearOldData() {
  const currentTerm = getCurrentTerm();
  const currentYear = new Date().getFullYear();

  // Count old records that would be deleted
  let scoresCount = 0;
  let disciplineCount = 0;

  try {
    // Count old exam scores via linked exams
    const exams = await db.getAll('exams');
    const oldExams = exams.filter(e => e.year < currentYear || (e.year === currentYear && e.term < currentTerm));
    const oldExamIds = new Set(oldExams.map(e => e.id));
    const allScores = await db.getAll('scores');
    scoresCount = allScores.filter(s => oldExamIds.has(s.examId)).length;

    const discipline = await db.getAll('discipline');
    disciplineCount = discipline.filter(d => d.year < currentYear || (d.year === currentYear && d.term < currentTerm)).length;
  } catch (e) { /* ignore */ }

  const total = scoresCount + disciplineCount;

  if (total === 0) {
    showToast('No old data found to clear', 'info');
    return;
  }

  showConfirm(
    `Delete old data from previous terms?\n\n` +
    `This will remove:\n` +
    `- ${scoresCount} exam score record(s) from past terms\n` +
    `- ${disciplineCount} discipline record(s) from past terms\n\n` +
    `Students, fee structures, and settings will be kept.\n` +
    `This cannot be undone.`,
    async () => {
      try {
        // Delete old discipline records
        const discipline = await db.getAll('discipline');
        const oldDiscipline = discipline.filter(d => d.year < currentYear || (d.year === currentYear && d.term < currentTerm));
        for (const rec of oldDiscipline) {
          await db.delete('discipline', rec.id);
        }

        // Delete old exam scores (via old exams)
        const exams = await db.getAll('exams');
        const oldExams = exams.filter(e => e.year < currentYear || (e.year === currentYear && e.term < currentTerm));
        const allScores = await db.getAll('scores');
        const oldExamIds = new Set(oldExams.map(e => e.id));
        const oldScores = allScores.filter(s => oldExamIds.has(s.examId));
        for (const score of oldScores) {
          await db.delete('scores', score.id);
        }

        // Delete old exams themselves
        for (const exam of oldExams) {
          await db.delete('exams', exam.id);
        }

        SoundManager.play('success');
        showToast(`Cleared ${oldScores.length} scores, ${oldExams.length} exams, ${oldDiscipline.length} discipline records`, 'success');
        loadStorageMeter();
      } catch (err) {
        showToast('Error clearing data: ' + err.message, 'error');
      }
    }
  );
}

async function clearSampleDataOnly() {
  showConfirm(
    'Clear all student records, payments, exams, scores, and discipline data?\n\n' +
    'Your school profile, classes, fee structures, and settings will be kept.\n' +
    'This cannot be undone.',
    async () => {
      try {
        await db.clear('students');
        await db.clear('feePayments');
        await db.clear('exams');
        await db.clear('scores');
        await db.clear('discipline');
        await db.clear('bursaries');
        await db.clear('feeAdjustments');
        await db.clear('examClearance');
        SoundManager.play('success');
        showToast('Student records cleared. School profile and settings preserved.', 'success');
        loadDashboard();
        loadStorageMeter();
      } catch (err) {
        showToast('Error clearing data: ' + err.message, 'error');
      }
    }
  );
}

async function resetAllSchoolData() {
  showConfirm(
    'WARNING: This will delete ALL your data and reset ShuleVine to a clean start.\n\n' +
    'Only your PIN and security question will be preserved.\n' +
    'School name, logo, classes, students, payments, exams - everything else will be erased.\n\n' +
    'Consider exporting a backup first!\n' +
    'This cannot be undone.',
    async () => {
      try {
        // Preserve security settings
        const pin = await db.getSetting('pin');
        const secQuestion = await db.getSetting('securityQuestion');
        const secAnswer = await db.getSetting('securityAnswer');

        // Clear all stores
        const storeNames = ['students', 'feePayments', 'feeStructures', 'bursaries', 'feeAdjustments', 'subjects', 'exams', 'scores', 'examClearance', 'settings', 'discipline'];
        for (const store of storeNames) {
          await db.clear(store);
        }

        // Restore security settings
        if (pin) await db.setSetting('pin', pin);
        if (secQuestion) await db.setSetting('securityQuestion', secQuestion);
        if (secAnswer) await db.setSetting('securityAnswer', secAnswer);

        SoundManager.play('success');
        showToast('All data reset. ShuleVine is now clean. Refreshing...', 'success');
        setTimeout(() => location.reload(), 2000);
      } catch (err) {
        showToast('Error resetting: ' + err.message, 'error');
      }
    }
  );
}

// ============================================================
// SIDEBAR LABEL UPDATE
// ============================================================

async function updateSidebarLabel() {
  const label = await learnerLabelPlural();
  const navItem = document.querySelector('.nav-item[data-page="students"] .nav-label');
  if (navItem) navItem.textContent = label;

  // Update page title if currently on students page
  const pageTitle = document.getElementById('page-title');
  if (pageTitle && document.querySelector('.nav-item[data-page="students"]')?.classList.contains('active')) {
    pageTitle.textContent = label;
  }

  // Update the "Add Student" button text
  const addBtn = document.querySelector('#page-students .toolbar-right .btn-primary');
  if (addBtn) {
    const singular = await learnerLabel();
    addBtn.innerHTML = `${ic('plus-circle', 'btn-icon-lucide')} Add ${singular}`;
    scheduleIcons();
  }
}

// ============================================================
// USER GUIDE
// ============================================================

const GUIDE_SECTIONS = [
  {
    id: 'demo-info',
    icon: 'info',
    title: 'Demo Info',
    content: `
      <h3>Welcome to ShuleVine Demo</h3>
      <p>Thank you for trying ShuleVine! This is a fully functional demo version that lets you explore the core features of our school management system. You can add students, record fee payments, enter exam scores, track conduct, and much more.</p>
      <div class="guide-tip">This is a demo version with some limitations. The premium version offers unlimited students, unlimited exams, data backup and restore, PIN security, PDF report exports, and much more. We encourage you to experience the full power of ShuleVine by upgrading to premium.</div>
      <h4>Demo Limitations</h4>
      <ul>
        <li>Maximum 20 students</li>
        <li>Maximum 2 exams</li>
        <li>Data backup and restore are premium features</li>
        <li>PIN security is a premium feature</li>
        <li>PDF report exports are a premium feature</li>
        <li>A "DEMO" watermark appears on generated reports</li>
      </ul>
      <p>Despite these limits, you can still explore grading (8-4-4 and CBC), fee management, conduct tracking, and the principal's brief. We believe once you see how ShuleVine streamlines school administration, you will want the complete experience.</p>
      <h4>Upgrading to Premium</h4>
      <p>When you are ready to unlock the full power of ShuleVine, upgrading is simple. Click the <strong>Upgrade to Premium</strong> button in the top bar to submit an upgrade request. Our team will contact you promptly to set up your premium license.</p>
      <ul>
        <li>Unlimited students and exams</li>
        <li>Full data backup and restore capabilities</li>
        <li>PIN security for sensitive operations</li>
        <li>PDF report generation without watermarks</li>
        <li>Data protection from browser clearing</li>
        <li>Priority support from MortApps Studios</li>
      </ul>
    `
  },
  {
    id: 'getting-started',
    icon: 'rocket',
    title: 'Getting Started',
    content: `
      <h3>Getting Started</h3>
      <p>Welcome to ShuleVine, your all in one school management system designed for Kenyan schools. This guide will walk you through every feature so you can get the most out of the platform.</p>
      <h4>First Time Setup</h4>
      <p>When you first open ShuleVine, head over to the <strong>Settings</strong> page. Here is what you need to configure:</p>
      <ul>
        <li><strong>School Name and Motto</strong>: Enter your school's official name and motto. This will appear on all generated reports and receipts.</li>
        <li><strong>County and Sub County</strong>: Select your county and type your sub county for official documentation.</li>
        <li><strong>Grading System</strong>: Choose between 8-4-4 (KCSE) or CBC (Competency Based Curriculum). This determines how subjects, grading, and report cards work across the entire platform.</li>
        <li><strong>School Level</strong>: Choose between Secondary and Primary. When set to Primary, labels change from "Students" to "Pupils" throughout the app.</li>
        <li><strong>Classes and Streams</strong>: Add your school's classes (e.g. Form 1, Form 2) and specify how many streams each class has. You can name each stream whatever you like (A, B, C, Alpha, Beta, East, West, North, South, Gamma, and so on). By default, streams are labelled A, B, C, but you can change them to any name that suits your school.</li>
        <li><strong>School Logo</strong>: Upload your school logo. It will appear on printed reports and receipts.</li>
        <li><strong>PIN and Security Question</strong>: Set a 4-digit PIN to protect sensitive actions like voiding receipts. Also set a security question so you can recover your PIN if you forget it.</li>
      </ul>
      <h4>Load Data (CSV Bulk Import)</h4>
      <p>Instead of adding students one by one, you can use the <strong>Load Data</strong> section in Settings:</p>
      <ol>
        <li>Click <strong>Download Template</strong> to get a blank CSV file with the correct column headers.</li>
        <li>Open it in Excel or Google Sheets and paste your student data into the columns.</li>
        <li>Save as CSV (Comma Separated Values).</li>
        <li>Click <strong>Import from CSV</strong> and select your filled template.</li>
        <li>Students with duplicate admission numbers will be skipped automatically.</li>
      </ol>
      <p><strong>Stream names:</strong> In the Stream column, type whatever stream names your school uses. You are not limited to A, B, C. For example, you can use North, South, East, West, Alpha, Beta, Gamma, or any other names. The same custom names you set up in Classes and Streams will work here too.</p>
      <h4>Test Data (Seed File)</h4>
      <p>Want to explore ShuleVine before entering real records? Use the <strong>Test Data</strong> section in Settings to import a seed file. This populates the app with sample students, payments, exams, and discipline records so you can try every feature. The seed file simulates Hillcrest Secondary School with 30 students across 4 forms.</p>
      <h4>Clean Start</h4>
      <p>If you loaded test data and want to start fresh with your own school, use the <strong>Reset Data</strong> section in Settings. You have two options:</p>
      <ul>
        <li><strong>Clear Student Records Only</strong>: Removes all students, payments, exams, scores, and discipline records. Your school profile, classes, fee structures, and settings are kept.</li>
        <li><strong>Reset Everything</strong>: Wipes all data completely, giving you a blank slate. Only your PIN and security question survive the reset.</li>
      </ul>
      <div class="guide-tip">Tip: Always export a backup before resetting. You can restore from the backup file later if needed.</div>
    `
  },
  {
    id: 'students',
    icon: 'graduation-cap',
    title: 'Students',
    content: `
      <h3>Managing Students</h3>
      <p>The Students page is where you manage your entire student register. Every student record includes admission details, class placement, contact information, and fee balance at a glance.</p>
      <h4>Adding a Student</h4>
      <p>Click the <strong>Add Student</strong> button to open the student form. Fill in the required fields: Admission Number, First Name, Last Name, Class, Stream, and Student Type (Boarder or Day Scholar). You can also record the student's gender, guardian name, guardian phone number, and current status.</p>
      <h4>Bulk Receipt Generation</h4>
      <p>Select multiple students using the checkboxes in the first column, or use the "Select All" checkbox to check all visible students. Then click <strong>Bulk Receipts</strong> to generate a combined PDF with one receipt per page for each selected student's latest payment. This is useful for printing receipts for an entire class at once.</p>
      <h4>WhatsApp Receipt Sharing</h4>
      <p>Click the WhatsApp icon next to any student to send their fee receipt directly to their guardian's WhatsApp number. The message includes the student name, admission number, last payment details (receipt number, amount, date, method, term), and the fee balance status (cleared or outstanding). WhatsApp sharing is available one student at a time. For multiple receipts, use Bulk Receipts to generate a PDF instead.</p>
      <h4>CSV Bulk Import</h4>
      <p>Go to Settings > Load Data to import many students at once from a CSV file. Download the template, fill it in Excel or Google Sheets, and import. Duplicate admission numbers are skipped automatically.</p>
      <h4>Searching and Filtering</h4>
      <p>Use the search bar to find students by name or admission number. The filter dropdowns let you narrow down the list by class, stream, or status (Active, Transferred, Graduated, Suspended).</p>
      <div class="guide-tip">Tip: Admission numbers must be unique. If you try to add a student with a duplicate admission number, the system will alert you.</div>
    `
  },
  {
    id: 'fees',
    icon: 'banknote',
    title: 'Fees Management',
    content: `
      <h3>Fees Management</h3>
      <p>The Fees section handles all financial records for your school. It is divided into five tabs: Payments, Structures, Bursaries, Adjustments, and Defaulters.</p>
      <h4>Recording a Payment</h4>
      <p>Go to the Payments tab and click <strong>Record Payment</strong>. Select the student, enter the amount, choose the payment method (Cash, M-Pesa, Bank Transfer, or Cheque), and specify the term and year. For M-Pesa payments, you can also record the transaction reference.</p>
      <h4>WhatsApp Receipt</h4>
      <p>After recording a payment, you can share the receipt with a guardian via WhatsApp. Click the WhatsApp icon on the student's row. The WhatsApp message includes:</p>
      <ul>
        <li>School name and receipt number</li>
        <li>Student name and admission number</li>
        <li>Payment amount, date, method, and term</li>
        <li>Fee balance status: "Fees Cleared" or "Balance Outstanding: KES X,XXX"</li>
      </ul>
      <p>The phone number is automatically formatted for Kenya (254 country code). WhatsApp receipts work one student at a time. For bulk printing, select multiple students and use the Bulk Receipts button.</p>
      <h4>Fee Structures</h4>
      <p>Fee structures define how much each class or student type owes per term. Create a structure, assign it to a class (or all classes), set the term and year, then add line items like Tuition, Boarding, Lunch, and so on. The total is calculated automatically.</p>
      <h4>Bursaries and Adjustments</h4>
      <p>Bursaries record financial aid awarded to students. Adjustments allow you to add credits or debits to a student's account for cases like overpayments, waivers, or penalties.</p>
      <h4>Defaulters Report</h4>
      <p>The Defaulters tab shows students with outstanding fee balances for a selected term and year. You can filter by class and print the report directly.</p>
      <div class="guide-tip">Tip: Receipts can be voided if a mistake was made. Voiding requires your 4-digit PIN. Voided receipts are marked clearly and excluded from totals.</div>
    `
  },
  {
    id: 'academics',
    icon: 'book-open',
    title: 'Academics',
    content: `
      <h3>Academics</h3>
      <p>The Academics section covers exams, score entry, subject management, rankings, and exam clearance. It adapts based on whether your school uses the 8-4-4 KCSE system or the CBC system.</p>
      <h4>Creating an Exam</h4>
      <p>Go to the Exams tab and click <strong>Create Exam</strong>. Enter the exam name, select the type (Mid-Term, End-Term, Mock, etc.), choose the class, term, and year. Exam types vary between 8-4-4 and CBC.</p>
      <h4>Entering Scores</h4>
      <p>In 8-4-4 mode, you enter raw scores out of 100 for each subject and the system automatically calculates KCSE grades (A, B+, B, and so on) and points. In CBC mode, you select rubric levels (EE, ME, AE, BE) for each learning area instead of numeric scores.</p>
      <h4>Subjects and Learning Areas</h4>
      <p>The Subjects tab shows all available subjects or learning areas based on your selected curriculum. You can enable or disable individual subjects, add custom subjects, or reset to the default list. CBC subjects are grouped into Core, Science, Humanities, Technical, Life Skills, and Optional.</p>
      <h4>Rankings</h4>
      <p>After entering scores, view rankings by exam. Students are ranked by mean points within their stream and across the entire form. In CBC mode, the overall competency level is shown (EE, ME, AE, BE).</p>
      <h4>Exam Clearance</h4>
      <p>Exam clearance links fee balances to exam eligibility. Students with balances above the threshold (set in Settings) are marked as not cleared. You can manually override clearance for individual students if needed (requires PIN).</p>
      <div class="guide-tip">Tip: When you switch between 8-4-4 and CBC in Settings, the score entry mode, grading system, and subject list all update automatically throughout the platform.</div>
    `
  },
  {
    id: 'conduct',
    icon: 'shield',
    title: 'Conduct',
    content: `
      <h3>Conduct Tracking</h3>
      <p>The Conduct section allows you to record both disciplinary incidents and merits for students. It is divided into four tabs: Incidents, Merits, Student Timeline, and Statistics.</p>
      <h4>Term Filter</h4>
      <p>At the top of the Conduct page, you will find a term and year filter. By default it shows the current term. You can switch to any term (1, 2, or 3), choose a different year, or select "All Terms" to see all records regardless of term. All tabs (Incidents, Merits, Timeline, Statistics) and the summary cards respect this filter.</p>
      <h4>Logging an Incident</h4>
      <p>Click <strong>Log Incident</strong> to record a disciplinary issue. Select the student, date, category (Truancy, Lateness, Fighting, etc.), severity level (Minor, Major, Critical), and the action taken (Verbal Warning, Written Warning, Detention, Suspension, etc.). You can also note whether the parent or guardian was notified.</p>
      <h4>Recording a Merit</h4>
      <p>Click <strong>Record Merit</strong> to log positive conduct. Choose from categories like Leadership, Academic Improvement, Helpful/Caring, Sports Achievement, and more. Merits are a great way to recognize and encourage good behaviour.</p>
      <h4>Student Timeline</h4>
      <p>Select any student to view their complete conduct history displayed as a visual timeline. Incidents appear in red and merits in green. You can also generate a PDF conduct report for the selected student.</p>
      <h4>Statistics</h4>
      <p>The Statistics tab shows breakdowns of incidents by category, severity distribution, repeat offenders, and merit distribution for the selected term. This helps identify patterns and take proactive measures. All statistics reflect real data from the discipline records store.</p>
    `
  },
  {
    id: 'reports',
    icon: 'printer',
    title: 'Reports',
    content: `
      <h3>Reports</h3>
      <p>The Reports page lets you generate professional PDF documents for various purposes. All reports include your school name, motto, logo (if uploaded), and county details.</p>
      <h4>Available Reports</h4>
      <ul>
        <li><strong>Fee Receipt</strong>: A detailed receipt for a specific payment, including student details, amount, method, and balance.</li>
        <li><strong>Fee Statement</strong>: A complete fee history for a student showing all payments, bursaries, adjustments, and running balance.</li>
        <li><strong>Defaulters Report</strong>: A list of students with outstanding balances for a given term and year.</li>
        <li><strong>Report Card</strong>: An end term report card showing subject scores, grades, remarks, and overall performance. In 8-4-4 mode it shows KCSE grades; in CBC mode it shows rubric levels.</li>
        <li><strong>Merit List</strong>: Top performing students for a selected exam.</li>
        <li><strong>Class List</strong>: A complete register of students in a class with their details.</li>
        <li><strong>Conduct Report</strong>: A student's full conduct history including incidents, merits, and an overall assessment. Available from the Conduct page.</li>
        <li><strong>Bulk Receipts</strong>: Generate receipts for multiple students at once from the Students page. Select students using checkboxes, then click Bulk Receipts.</li>
      </ul>
      <div class="guide-tip">Tip: All PDF reports are generated locally in your browser. No data is sent to any server. Reports work even when you are offline.</div>
    `
  },
  {
    id: 'settings',
    icon: 'settings',
    title: 'Settings',
    content: `
      <h3>Settings</h3>
      <p>The Settings page is the control centre for your ShuleVine installation. Here you configure everything from school details to security.</p>
      <h4>School Profile</h4>
      <p>Set your school name, motto, county, sub county, and category. The grading system selector (8-4-4 or CBC) is the most important setting because it affects subjects, grading, score entry, and report cards across the entire platform.</p>
      <h4>School Level</h4>
      <p>Choose between Secondary and Primary in the Sound and Appearance section. When set to Primary, all references to "Students" change to "Pupils" throughout the app (sidebar, page titles, buttons, empty states).</p>
      <h4>Classes and Streams</h4>
      <p>Add or remove classes and set the number of streams per class. When adding a class, you can name each stream individually. Some schools use letters (A, B, C), while others prefer names like Alpha, Beta, Gamma, or East, West, North, South. Use the pencil icon next to any class to change stream names or add/remove streams. If you reduce the number of streams, students in removed streams are automatically reassigned to the first stream.</p>
      <h4>Fee Settings</h4>
      <p>Configure the exam clearance threshold (the maximum balance a student can have and still sit exams), late fee penalties, and the next term opening date.</p>
      <h4>Security (PIN and Recovery)</h4>
      <p>Set a 4-digit PIN that is required for sensitive operations like voiding receipts and overriding exam clearance. You can also set a security question and answer for PIN recovery. If you forget your PIN, click "Forgot PIN?" on the PIN prompt, answer your security question, and the PIN will be cleared so you can set a new one.</p>
      <p>You can change your PIN (requires the current PIN) or disable PIN protection entirely (also requires the current PIN). Your PIN and security question survive data resets.</p>
      <h4>Sound and Appearance</h4>
      <p>Toggle sound effects on or off. Switch between light mode and dark mode. Set School Level to Primary or Secondary. Your preference is saved automatically.</p>
      <h4>Backup and Restore</h4>
      <p>Export a complete backup of all your data as a single JSON file. You can restore from a backup at any time. Be cautious: restoring replaces all existing data.</p>
      <h4>Load Data</h4>
      <p>Bulk import students from a CSV file. Download the template, fill it in Excel or Google Sheets, and import. Duplicate admission numbers are skipped. This is the fastest way to add many students at once.</p>
      <h4>Test Data</h4>
      <p>Import a seed file to populate ShuleVine with sample data for learning and testing. Great for training or exploring features before entering real records.</p>
      <h4>Reset Data</h4>
      <p>Two options for clearing data: "Clear Student Records Only" keeps your school profile and fee structures but removes all students and their records. "Reset Everything" wipes all data to a clean start, preserving only your PIN and security question.</p>
      <h4>Storage</h4>
      <p>The Storage section shows real data usage measured from your browser's storage API. It displays a usage bar, record counts by category, and whether your data is protected from automatic browser clearing. Click "Protect Data" to request persistent storage, which prevents the browser from evicting your data when disk space is low. ShuleVine supports up to 250 MB of storage, which is enough for roughly 10 years of data for a 500-student school.</p>
    `
  },
  {
    id: 'tips',
    icon: 'lightbulb',
    title: 'Tips and Shortcuts',
    content: `
      <h3>Tips and Shortcuts</h3>
      <h4>General Tips</h4>
      <ul>
        <li>ShuleVine works entirely offline. Once loaded, you do not need an internet connection to use any feature.</li>
        <li>You can install ShuleVine as a desktop app using your browser's install prompt. This gives you a dedicated window and faster access.</li>
        <li>The sidebar can be collapsed on desktop by clicking the menu icon. On smaller screens, it slides in as an overlay.</li>
        <li>All data is stored locally in your browser using IndexedDB. Go to Settings > Storage and click "Protect Data" to prevent the browser from clearing it automatically.</li>
      </ul>
      <h4>Test Data for Learning</h4>
      <ul>
        <li>Use the seed/test data file from Settings > Test Data to populate the system with sample records. This is the best way to learn how ShuleVine works before entering real data.</li>
        <li>The test data includes 30 students, payments, exams, scores, and discipline records for a simulated school called Hillcrest Secondary.</li>
        <li>When you are ready to use ShuleVine for real, go to Settings > Reset Data to clear the sample data and start fresh.</li>
      </ul>
      <h4>Regular Backups</h4>
      <ul>
        <li>Back up your data regularly using Settings > Backup and Restore > Export Backup.</li>
        <li>Check the Storage meter in Settings to monitor how much data you have. With 250 MB available, most schools will not run out for many years.</li>
        <li>Store backup files in a safe location, preferably on a separate drive or cloud storage.</li>
      </ul>
      <h4>WhatsApp Receipts</h4>
      <ul>
        <li>Share fee receipts with guardians directly via WhatsApp. Click the WhatsApp icon on any student row.</li>
        <li>The WhatsApp message includes the fee balance status so guardians know if fees are cleared or outstanding.</li>
        <li>WhatsApp works one student at a time. For printing receipts for multiple students, use the Bulk Receipts button instead.</li>
        <li>Make sure the guardian phone number is entered correctly (format: 07XX XXX XXX). ShuleVine automatically converts it to the international format.</li>
      </ul>
      <h4>Keyboard Shortcuts</h4>
      <ul>
        <li><strong>Escape</strong>: Close any open modal or popup.</li>
        <li><strong>Click outside a modal</strong>: Close the modal.</li>
      </ul>
      <h4>Need Help?</h4>
      <p>Click the <strong>Contact</strong> button in the top bar to send us a message. We appreciate your feedback and will get back to you shortly.</p>
    `
  }
];

function openGuide() {
  const modal = document.getElementById('guide-modal');
  if (!modal) return;

  // Build navigation
  const navContainer = document.getElementById('guide-nav');
  if (navContainer) {
    navContainer.innerHTML = GUIDE_SECTIONS.map((s, i) =>
      `<div class="guide-nav-item ${i === 0 ? 'active' : ''}" data-guide="${s.id}" onclick="switchGuideSection('${s.id}')">${ic(s.icon, '')} ${s.title}</div>`
    ).join('');
  }

  // Build content
  const contentContainer = document.getElementById('guide-content');
  if (contentContainer) {
    contentContainer.innerHTML = GUIDE_SECTIONS.map((s, i) =>
      `<div class="guide-section ${i === 0 ? 'active' : ''}" id="guide-section-${s.id}">${s.content}</div>`
    ).join('');
  }

  modal.classList.add('active');
  scheduleIcons();
  SoundManager.play('click');
}

function switchGuideSection(sectionId) {
  // Update nav
  document.querySelectorAll('.guide-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.guide === sectionId);
  });
  // Update content
  document.querySelectorAll('.guide-section').forEach(section => {
    section.classList.toggle('active', section.id === `guide-section-${sectionId}`);
  });
  SoundManager.play('click');
}

// ============================================================
// MODAL HELPERS
// ============================================================
function closeModal(modalId) { const m = document.getElementById(modalId); if (m) m.classList.remove('active'); SoundManager.play('click'); }
document.addEventListener('click', (e) => { if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) e.target.classList.remove('active'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); });

// ============================================================
// PWA AUTO-UPDATE SYSTEM
// ============================================================

let swRegistration = null;
let newWorker = null;

/**
 * Initialize the update checker - runs on app startup
 * Detects new service worker versions and shows update banner
 */
function initUpdateChecker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    swRegistration = registration;

    // Check for updates every 30 minutes
    setInterval(() => {
      registration.update();
    }, 30 * 60 * 1000);

    // Listen for new service worker waiting to activate
    registration.addEventListener('updatefound', () => {
      newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available! Show the update banner
          showUpdateBanner();
        }
      });
    });

    // Also listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        // The new SW has activated - prompt page reload
        showUpdateBanner(true);
      }
    });
  }).catch(err => {
    console.warn('Update checker init failed:', err);
  });

  // Also check version.json for updates (catches manual cache-bump updates)
  checkRemoteVersion();
}

/**
 * Check version.json from the remote server to detect updates
 * This catches cases where the SW cache was bumped but the
 * user hasn't refreshed yet
 */
async function checkRemoteVersion() {
  try {
    const response = await fetch('./version.json?' + Date.now(), { cache: 'no-cache' });
    if (!response.ok) return;
    const remote = await response.json();

    // Get current version from the cached version.json
    const currentResponse = await caches.match('./version.json');
    if (!currentResponse) return;
    const current = await currentResponse.json();

    if (remote.build > current.build) {
      // New version detected on the server
      showUpdateBanner();
    }
  } catch (e) {
    // Silently fail - no internet or version.json not available
  }
}

/**
 * Show the update banner at the bottom of the screen
 */
function showUpdateBanner(isActivated = false) {
  const banner = document.getElementById('update-banner');
  if (!banner) return;

  // Don't show multiple times
  if (banner.style.display === 'flex') return;

  const textEl = banner.querySelector('.update-banner-text');
  if (isActivated && textEl) {
    textEl.innerHTML = '<strong>ShuleVine has been updated!</strong><span>Click Update to reload and use the new version.</span>';
  }

  banner.style.display = 'flex';
  // Re-render Lucide icons in the banner
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
  SoundManager.play('notify');
}

/**
 * Apply the update - tell the waiting SW to activate, then reload page
 */
function applyUpdate() {
  const banner = document.getElementById('update-banner');
  if (banner) banner.style.display = 'none';

  if (newWorker && newWorker.state === 'installed') {
    // Tell the waiting service worker to skip waiting and activate
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    // Once it activates, the 'controllerchange' event fires
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  } else {
    // If no waiting worker, just reload (the new cache should already be active)
    window.location.reload();
  }
}

/**
 * Dismiss the update banner (user will see it again next session or next check)
 */
function dismissUpdate() {
  const banner = document.getElementById('update-banner');
  if (banner) banner.style.display = 'none';
}
