/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-discipline.js - Discipline & Conduct Tracking Module
 * Powered By MortApps Studios
 */

// ============================================================
// DISCIPLINE FILTER STATE
// ============================================================
let disciplineFilterTerm = 0; // 0 = current term
let disciplineFilterYear = 0; // 0 = current year

/**
 * Get the effective filter term and year
 */
function getDisciplineFilter() {
  const term = disciplineFilterTerm || getCurrentTerm();
  const year = disciplineFilterYear || new Date().getFullYear();
  const showAll = disciplineFilterTerm === -1; // -1 means "All Terms"
  return { term, year, showAll };
}

/**
 * Filter discipline records based on the current filter
 */
function filterDisciplineRecords(records) {
  const { term, year, showAll } = getDisciplineFilter();
  if (showAll) return records;
  return records.filter(d => d.term === term && d.year === year);
}

// ============================================================
// DISCIPLINE DATA CACHE (Performance Optimizer)
// Batch-loads students to avoid N+1 queries on every tab switch
// ============================================================

let _disciplineCache = null;
let _disciplineCacheTime = 0;
const DISCIPLINE_CACHE_TTL = 3000; // 3 seconds

async function getDisciplineData() {
  const now = Date.now();
  if (_disciplineCache && (now - _disciplineCacheTime) < DISCIPLINE_CACHE_TTL) {
    return _disciplineCache;
  }
  const [allRecords, allStudents] = await Promise.all([
    db.getAll('discipline'),
    db.getAll('students')
  ]);
  // Build student lookup map for O(1) access
  const studentMap = {};
  for (const s of allStudents) {
    studentMap[s.id] = s;
  }
  _disciplineCache = { allRecords, studentMap };
  _disciplineCacheTime = now;
  return _disciplineCache;
}

function invalidateDisciplineCache() {
  _disciplineCache = null;
  _disciplineCacheTime = 0;
}

// Helper: get student from cache
function getCachedStudent(studentMap, studentId) {
  return studentMap[studentId] || null;
}

// ============================================================
// DISCIPLINE PAGE LOADER
// ============================================================

async function loadDisciplinePage() {
  const disciplineContent = document.getElementById('discipline-content');
  if (!disciplineContent) return;

  // Use cached data for fast load
  const { allRecords, studentMap } = await getDisciplineData();
  const currentTerm = getCurrentTerm();
  const currentYear = new Date().getFullYear();

  // Apply term/year filter
  const filteredRecords = filterDisciplineRecords(allRecords);
  const { term, year, showAll } = getDisciplineFilter();
  const filterLabel = showAll ? 'All Terms' : `Term ${term} ${year}`;

  const termIncidents = filteredRecords.filter(d => d.type === 'incident');
  const termMerits = filteredRecords.filter(d => d.type === 'merit');

  // Build term/year filter controls
  const yearOptions = [];
  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    yearOptions.push(y);
  }

  const filterHtml = `
    <div class="discipline-filter-bar">
      <label class="discipline-filter-label">${ic('filter', '')} Filter:</label>
      <select id="discipline-filter-term" class="filter-select" onchange="onDisciplineFilterChange()">
        <option value="0" ${disciplineFilterTerm === 0 ? 'selected' : ''}>Current Term</option>
        <option value="1" ${disciplineFilterTerm === 1 ? 'selected' : ''}>Term 1</option>
        <option value="2" ${disciplineFilterTerm === 2 ? 'selected' : ''}>Term 2</option>
        <option value="3" ${disciplineFilterTerm === 3 ? 'selected' : ''}>Term 3</option>
        <option value="-1" ${disciplineFilterTerm === -1 ? 'selected' : ''}>All Terms</option>
      </select>
      <select id="discipline-filter-year" class="filter-select" onchange="onDisciplineFilterChange()" ${disciplineFilterTerm === -1 ? 'disabled' : ''}>
        ${yearOptions.map(y => `<option value="${y}" ${disciplineFilterYear === y || (disciplineFilterYear === 0 && y === currentYear) ? 'selected' : ''}>${y}</option>`).join('')}
      </select>
    </div>`;

  // Summary cards
  disciplineContent.innerHTML = `
    ${filterHtml}
    <div class="discipline-summary">
      <div class="disc-stat-card disc-stat-incident">
        <div class="disc-stat-icon">${ic('alert-triangle', '')}</div>
        <div class="disc-stat-value">${termIncidents.length}</div>
        <div class="disc-stat-label">Incidents (${filterLabel})</div>
        <div class="disc-stat-sub">${termIncidents.filter(d => d.severity === 'critical').length} critical</div>
      </div>
      <div class="disc-stat-card disc-stat-merit">
        <div class="disc-stat-icon">${ic('award', '')}</div>
        <div class="disc-stat-value">${termMerits.length}</div>
        <div class="disc-stat-label">Merits (${filterLabel})</div>
        <div class="disc-stat-sub">${termMerits.filter(d => d.actionTaken === 'award').length} awards</div>
      </div>
      <div class="disc-stat-card disc-stat-top">
        <div class="disc-stat-icon">${ic('trending-up', '')}</div>
        <div class="disc-stat-value">${getTopCategory(termIncidents)}</div>
        <div class="disc-stat-label">Top Infraction</div>
        <div class="disc-stat-sub">${termIncidents.length} total incidents</div>
      </div>
      <div class="disc-stat-card disc-stat-all">
        <div class="disc-stat-icon">${ic('database', '')}</div>
        <div class="disc-stat-value">${allRecords.length}</div>
        <div class="disc-stat-label">All Time Records</div>
        <div class="disc-stat-sub">${allRecords.filter(d => d.type === 'incident').length} incidents | ${allRecords.filter(d => d.type === 'merit').length} merits</div>
      </div>
    </div>
    <div class="discipline-tab-content" id="discipline-tab-content">
      ${renderIncidentsTab(allRecords, studentMap)}
    </div>`;

  scheduleIcons();
  initDisciplineTabs();
}

/**
 * Handle discipline filter change
 */
function onDisciplineFilterChange() {
  const termSelect = document.getElementById('discipline-filter-term');
  const yearSelect = document.getElementById('discipline-filter-year');
  if (!termSelect || !yearSelect) return;

  disciplineFilterTerm = parseInt(termSelect.value);
  disciplineFilterYear = parseInt(yearSelect.value);

  // Disable year when "All Terms" is selected
  yearSelect.disabled = disciplineFilterTerm === -1;

  // Reload the page to apply filter
  loadDisciplinePage();
}

// ============================================================
// TAB SYSTEM (Instant switching with cached data)
// ============================================================

function initDisciplineTabs() {
  const tabBtns = document.querySelectorAll('#discipline-tabs .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SoundManager.play('click');
      const tab = btn.dataset.tab;
      const container = document.getElementById('discipline-tab-content');
      if (!container) return;

      // Use cached data for instant tab switching
      const { allRecords, studentMap } = await getDisciplineData();

      switch (tab) {
        case 'disc-incidents': container.innerHTML = renderIncidentsTab(allRecords, studentMap); break;
        case 'disc-merits': container.innerHTML = renderMeritsTab(allRecords, studentMap); break;
        case 'disc-timeline': container.innerHTML = renderTimelineTab(studentMap); break;
        case 'disc-stats': container.innerHTML = renderStatsTab(allRecords, studentMap); break;
      }
      scheduleIcons();
    });
  });
}

// ============================================================
// INCIDENTS TAB (Synchronous with cache)
// ============================================================

function renderIncidentsTab(allRecords, studentMap) {
  const filtered = filterDisciplineRecords(allRecords);
  const incidents = filtered.filter(d => d.type === 'incident').sort((a, b) => new Date(b.date) - new Date(a.date));

  let rows = '';
  for (const inc of incidents) {
    const student = getCachedStudent(studentMap, inc.studentId);
    const catLabel = SV.INCIDENT_CATEGORIES.find(c => c.value === inc.category)?.label || inc.category;
    const sevLabel = SV.SEVERITY_LEVELS.find(s => s.value === inc.severity)?.label || inc.severity;
    const actionLabel = SV.ACTION_TYPES.find(a => a.value === inc.actionTaken)?.label || inc.actionTaken;

    rows += `<tr>
      <td>${formatDate(inc.date)}</td>
      <td>${student ? escapeHtml(student.name) : '<em>Unknown</em>'}</td>
      <td>${student ? escapeHtml(student.class + ' ' + student.stream) : '-'}</td>
      <td><span class="badge badge-category">${escapeHtml(catLabel)}</span></td>
      <td><span class="severity-badge severity-${inc.severity}">${escapeHtml(sevLabel)}</span></td>
      <td>${escapeHtml((inc.description || '').substring(0, 50))}${inc.description && inc.description.length > 50 ? '...' : ''}</td>
      <td>${escapeHtml(actionLabel)}</td>
      <td>${inc.parentNotified ? '<span class="badge badge-active">Yes</span>' : '<span class="badge badge-suspended">No</span>'}</td>
      <td class="action-btns">
        <button class="btn-icon" title="View" onclick="viewDisciplineRecord('${inc.id}')">${ic('eye', '')}</button>
        <button class="btn-icon" title="Delete" onclick="deleteDisciplineRecord('${inc.id}')">${ic('trash-2', '')}</button>
      </td>
    </tr>`;
  }

  return `
    <div class="page-toolbar">
      <div class="toolbar-left">
        <div class="search-wrap"><i data-lucide="search" class="search-icon"></i><input type="text" id="incident-search" class="search-input" placeholder="Search incidents..." oninput="filterIncidents()"></div>
        <select id="incident-filter-severity" class="filter-select" onchange="filterIncidents()">
          <option value="">All Severities</option>
          <option value="minor">Minor</option>
          <option value="major">Major</option>
          <option value="critical">Critical</option>
        </select>
        <select id="incident-filter-category" class="filter-select" onchange="filterIncidents()">
          <option value="">All Categories</option>
          ${SV.INCIDENT_CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-primary" onclick="openDisciplineForm('incident')">${ic('plus-circle', 'btn-icon-lucide')} Log Incident</button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table" id="incidents-table">
        <thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Category</th><th>Severity</th><th>Description</th><th>Action</th><th>Parent</th><th>Actions</th></tr></thead>
        <tbody id="incidents-tbody">${rows || '<tr><td colspan="9" class="empty-state">No incidents recorded yet</td></tr>'}</tbody>
      </table>
    </div>
    <div class="table-footer"><span class="table-count">${incidents.length} incident${incidents.length !== 1 ? 's' : ''} recorded</span></div>`;
}

// ============================================================
// MERITS TAB (Synchronous with cache)
// ============================================================

function renderMeritsTab(allRecords, studentMap) {
  const filtered = filterDisciplineRecords(allRecords);
  const merits = filtered.filter(d => d.type === 'merit').sort((a, b) => new Date(b.date) - new Date(a.date));

  let rows = '';
  for (const m of merits) {
    const student = getCachedStudent(studentMap, m.studentId);
    const catLabel = SV.MERIT_CATEGORIES.find(c => c.value === m.category)?.label || m.category;
    const actionLabel = SV.ACTION_TYPES.find(a => a.value === m.actionTaken)?.label || m.actionTaken;

    rows += `<tr>
      <td>${formatDate(m.date)}</td>
      <td>${student ? escapeHtml(student.name) : '<em>Unknown</em>'}</td>
      <td>${student ? escapeHtml(student.class + ' ' + student.stream) : '-'}</td>
      <td><span class="badge badge-merit">${escapeHtml(catLabel)}</span></td>
      <td>${escapeHtml((m.description || '').substring(0, 60))}${m.description && m.description.length > 60 ? '...' : ''}</td>
      <td>${escapeHtml(actionLabel)}</td>
      <td>${escapeHtml(m.reportedBy || '-')}</td>
      <td class="action-btns">
        <button class="btn-icon" title="View" onclick="viewDisciplineRecord('${m.id}')">${ic('eye', '')}</button>
        <button class="btn-icon" title="Delete" onclick="deleteDisciplineRecord('${m.id}')">${ic('trash-2', '')}</button>
      </td>
    </tr>`;
  }

  return `
    <div class="page-toolbar">
      <div class="toolbar-left">
        <div class="search-wrap"><i data-lucide="search" class="search-icon"></i><input type="text" id="merit-search" class="search-input" placeholder="Search merits..." oninput="filterMerits()"></div>
        <select id="merit-filter-category" class="filter-select" onchange="filterMerits()">
          <option value="">All Categories</option>
          ${SV.MERIT_CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-success" onclick="openDisciplineForm('merit')">${ic('plus-circle', 'btn-icon-lucide')} Record Merit</button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table" id="merits-table">
        <thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Category</th><th>Description</th><th>Action</th><th>Reported By</th><th>Actions</th></tr></thead>
        <tbody id="merits-tbody">${rows || '<tr><td colspan="8" class="empty-state">No merits recorded yet</td></tr>'}</tbody>
      </table>
    </div>
    <div class="table-footer"><span class="table-count">${merits.length} merit${merits.length !== 1 ? 's' : ''} recorded</span></div>`;
}

// ============================================================
// STUDENT TIMELINE TAB (Synchronous with cache)
// ============================================================

function renderTimelineTab(studentMap) {
  const students = Object.values(studentMap).filter(s => s.status !== 'transferred' && s.status !== 'graduated' && s.status !== 'expelled');
  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return `
    <div class="page-toolbar">
      <div class="toolbar-left">
        <label style="color:var(--text-secondary);font-size:0.85rem;font-weight:500;">Select Student:</label>
        <select id="timeline-student-select" class="filter-select" onchange="loadStudentTimeline()">
          <option value="">Choose a student...</option>
          ${students.map(s => `<option value="${s.id}">${escapeHtml(s.admissionNumber)} - ${escapeHtml(s.name)} (${escapeHtml(s.class)})${s.status === 'suspended' ? ' [SUSPENDED]' : ''}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-outline" id="timeline-pdf-btn" onclick="generateDisciplineReport()" style="display:none">${ic('printer', 'btn-icon-lucide')} Print Report</button>
      </div>
    </div>
    <div id="student-timeline" class="timeline-container">
      <div class="empty-state">
        ${ic('user', 'empty-icon')}
        <h3>Select a Student</h3>
        <p>Choose a student above to view their complete conduct history</p>
      </div>
    </div>`;
}

async function loadStudentTimeline() {
  const studentId = document.getElementById('timeline-student-select')?.value;
  const container = document.getElementById('student-timeline');
  const pdfBtn = document.getElementById('timeline-pdf-btn');
  if (!container) return;

  if (!studentId) {
    container.innerHTML = `<div class="empty-state">${ic('user', 'empty-icon')}<h3>Select a Student</h3><p>Choose a student above to view their complete conduct history</p></div>`;
    if (pdfBtn) pdfBtn.style.display = 'none';
    scheduleIcons();
    return;
  }

  if (pdfBtn) pdfBtn.style.display = '';

  const student = await db.get('students', studentId);
  if (!student) return;

  const records = (await db.getByIndex('discipline', 'studentId', studentId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (records.length === 0) {
    container.innerHTML = `
      <div class="timeline-student-header">
        <h3>${escapeHtml(student.name)}</h3>
        <span class="badge badge-active">${escapeHtml(student.class + ' ' + student.stream)}</span>
        <span class="badge badge-${student.status || 'active'}">${(student.status || 'active').charAt(0).toUpperCase() + (student.status || 'active').slice(1)}</span>
      </div>
      <div class="empty-state"><h3>No Records</h3><p>This student has no discipline or merit records</p></div>`;
    scheduleIcons();
    return;
  }

  // Count summaries
  const incidents = records.filter(r => r.type === 'incident');
  const merits = records.filter(r => r.type === 'merit');
  const critical = incidents.filter(r => r.severity === 'critical');

  let timelineHtml = `
    <div class="timeline-student-header">
      <h3>${escapeHtml(student.name)}</h3>
      <span class="badge badge-active">${escapeHtml(student.class + ' ' + student.stream)}</span>
      <span class="badge badge-${student.status || 'active'}">${(student.status || 'active').charAt(0).toUpperCase() + (student.status || 'active').slice(1)}</span>
      <span class="badge badge-suspended">${incidents.length} incident${incidents.length !== 1 ? 's' : ''}</span>
      <span class="badge badge-merit">${merits.length} merit${merits.length !== 1 ? 's' : ''}</span>
      ${critical.length > 0 ? `<span class="severity-badge severity-critical">${critical.length} critical</span>` : ''}
    </div>
    <div class="timeline">`;

  for (const rec of records) {
    const isIncident = rec.type === 'incident';
    const catLabel = isIncident
      ? (SV.INCIDENT_CATEGORIES.find(c => c.value === rec.category)?.label || rec.category)
      : (SV.MERIT_CATEGORIES.find(c => c.value === rec.category)?.label || rec.category);
    const actionLabel = SV.ACTION_TYPES.find(a => a.value === rec.actionTaken)?.label || rec.actionTaken;
    const sevLabel = SV.SEVERITY_LEVELS.find(s => s.value === rec.severity)?.label || '';

    timelineHtml += `
      <div class="timeline-item ${isIncident ? 'timeline-incident' : 'timeline-merit'}">
        <div class="timeline-marker">
          <i data-lucide="${isIncident ? 'alert-triangle' : 'star'}"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-date">${formatDate(rec.date)} &mdash; Term ${rec.term} ${rec.year}</div>
          <div class="timeline-category">
            <span class="badge ${isIncident ? 'badge-category' : 'badge-merit'}">${escapeHtml(catLabel)}</span>
            ${isIncident && rec.severity ? `<span class="severity-badge severity-${rec.severity}">${escapeHtml(sevLabel)}</span>` : ''}
          </div>
          ${rec.description ? `<p class="timeline-desc">${escapeHtml(rec.description)}</p>` : ''}
          <div class="timeline-meta">
            <span><strong>Action:</strong> ${escapeHtml(actionLabel)}</span>
            <span><strong>By:</strong> ${escapeHtml(rec.reportedBy || 'N/A')}</span>
            ${isIncident ? `<span><strong>Parent Notified:</strong> ${rec.parentNotified ? 'Yes' : 'No'}</span>` : ''}
          </div>
        </div>
      </div>`;
  }

  timelineHtml += '</div>';
  container.innerHTML = timelineHtml;
  scheduleIcons();
}

// ============================================================
// STATISTICS TAB (Synchronous with cache)
// ============================================================

function renderStatsTab(allRecords, studentMap) {
  const filtered = filterDisciplineRecords(allRecords);
  const incidents = filtered.filter(d => d.type === 'incident');
  const merits = filtered.filter(d => d.type === 'merit');
  const { term, year, showAll } = getDisciplineFilter();
  const filterLabel = showAll ? 'All Terms' : `Term ${term} ${year}`;
  const termIncidents = incidents;

  // Category breakdown
  const catCounts = {};
  termIncidents.forEach(d => { catCounts[d.category] = (catCounts[d.category] || 0) + 1; });
  const catSorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  // Severity breakdown
  const sevCounts = { minor: 0, major: 0, critical: 0 };
  termIncidents.forEach(d => { if (sevCounts.hasOwnProperty(d.severity)) sevCounts[d.severity]++; });

  // Repeat offenders (students with 2+ incidents this term)
  const offenderCounts = {};
  termIncidents.forEach(d => { offenderCounts[d.studentId] = (offenderCounts[d.studentId] || 0) + 1; });
  const repeatOffenders = Object.entries(offenderCounts).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);

  let repeatHtml = '';
  for (const [sid, count] of repeatOffenders) {
    const student = getCachedStudent(studentMap, sid);
    if (student) {
      repeatHtml += `<div class="repeat-offender">
        <span class="repeat-name">${escapeHtml(student.name)}</span>
        <span class="repeat-class">${escapeHtml(student.class + ' ' + student.stream)}</span>
        <span class="severity-badge severity-${count >= 4 ? 'critical' : count >= 3 ? 'major' : 'minor'}">${count} incidents</span>
      </div>`;
    }
  }

  // Merit breakdown
  const meritCatCounts = {};
  merits.forEach(d => {
    meritCatCounts[d.category] = (meritCatCounts[d.category] || 0) + 1;
  });
  const meritCatSorted = Object.entries(meritCatCounts).sort((a, b) => b[1] - a[1]);
  const termMerits = merits;

  return `
    <div class="stats-grid-discipline">
      <div class="disc-stats-card">
        <h4>${ic('alert-triangle', '')} Incidents by Category (${filterLabel})</h4>
        ${catSorted.length > 0 ? catSorted.map(([cat, count]) => {
          const label = SV.INCIDENT_CATEGORIES.find(c => c.value === cat)?.label || cat;
          const pct = termIncidents.length > 0 ? Math.round((count / termIncidents.length) * 100) : 0;
          return `<div class="stat-bar-row">
            <span class="stat-bar-label">${escapeHtml(label)}</span>
            <div class="stat-bar-track"><div class="stat-bar-fill stat-bar-incident" style="width:${pct}%"></div></div>
            <span class="stat-bar-count">${count} (${pct}%)</span>
          </div>`;
        }).join('') : '<p class="hint">No incidents this term</p>'}
      </div>

      <div class="disc-stats-card">
        <h4>${ic('shield', '')} Severity Breakdown (This Term)</h4>
        <div class="sev-breakdown">
          <div class="sev-row"><span class="severity-badge severity-minor">Minor</span><span class="sev-count">${sevCounts.minor}</span></div>
          <div class="sev-row"><span class="severity-badge severity-major">Major</span><span class="sev-count">${sevCounts.major}</span></div>
          <div class="sev-row"><span class="severity-badge severity-critical">Critical</span><span class="sev-count">${sevCounts.critical}</span></div>
        </div>
        <h4 style="margin-top:1.2rem">${ic('users', '')} Repeat Offenders (${filterLabel})</h4>
        ${repeatHtml || '<p class="hint">No repeat offenders this term</p>'}
      </div>

      <div class="disc-stats-card">
        <h4>${ic('award', '')} Merits by Category (${filterLabel})</h4>
        ${meritCatSorted.length > 0 ? meritCatSorted.map(([cat, count]) => {
          const label = SV.MERIT_CATEGORIES.find(c => c.value === cat)?.label || cat;
          return `<div class="stat-bar-row">
            <span class="stat-bar-label">${escapeHtml(label)}</span>
            <div class="stat-bar-track"><div class="stat-bar-fill stat-bar-merit" style="width:${count > 0 ? Math.max(10, Math.round((count / (meritCatSorted[0][1] || 1)) * 100)) : 0}%"></div></div>
            <span class="stat-bar-count">${count}</span>
          </div>`;
        }).join('') : '<p class="hint">No merits this term</p>'}
      </div>
    </div>`;
}

// ============================================================
// DISCIPLINE FORM (Incident / Merit)
// ============================================================

async function openDisciplineForm(type, recordId) {
  const isIncident = type === 'incident';
  const isEdit = !!recordId;
  let record = null;
  if (isEdit) {
    record = await db.get('discipline', recordId);
    if (!record) { showToast('Record not found', 'error'); return; }
    type = record.type;
  }

  const students = (await db.getAll('students')).filter(s => s.status !== 'transferred' && s.status !== 'graduated' && s.status !== 'expelled');
  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const currentTerm = getCurrentTerm();
  const currentYear = new Date().getFullYear();

  const categories = isIncident ? SV.INCIDENT_CATEGORIES : SV.MERIT_CATEGORIES;
  const catOptions = categories.map(c =>
    `<option value="${c.value}" ${record && record.category === c.value ? 'selected' : ''}>${c.label}</option>`
  ).join('');

  // For incidents, show incident-related actions; for merits, show merit-related
  const actionOptions = isIncident
    ? SV.ACTION_TYPES.filter(a => !['commendation', 'award'].includes(a.value))
    : SV.ACTION_TYPES.filter(a => ['commendation', 'award', 'other_action'].includes(a.value));

  const modalTitle = isEdit
    ? `Edit ${isIncident ? 'Incident' : 'Merit'}`
    : `Log ${isIncident ? 'Incident' : 'Merit'}`;

  const modal = document.getElementById('discipline-modal');
  if (!modal) return;

  modal.querySelector('.modal-header h3').textContent = modalTitle;
  const body = modal.querySelector('.modal-body');
  body.innerHTML = `
    <input type="hidden" id="disc-edit-id" value="${isEdit ? record.id : ''}">
    <input type="hidden" id="disc-type" value="${type}">
    <div class="form-group">
      <label>Student *</label>
      <select id="disc-student">
        <option value="">Select Student</option>
        ${students.map(s => `<option value="${s.id}" ${record && record.studentId === s.id ? 'selected' : ''}>${escapeHtml(s.admissionNumber)} - ${escapeHtml(s.name)} (${escapeHtml(s.class)})${s.status === 'suspended' ? ' [SUSPENDED]' : ''}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date *</label>
        <input type="date" id="disc-date" value="${record ? record.date : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Category *</label>
        <select id="disc-category">
          <option value="">Select Category</option>
          ${catOptions}
        </select>
      </div>
    </div>
    ${isIncident ? `
    <div class="form-row">
      <div class="form-group">
        <label>Severity *</label>
        <select id="disc-severity">
          <option value="minor" ${record && record.severity === 'minor' ? 'selected' : ''}>Minor</option>
          <option value="major" ${record && record.severity === 'major' ? 'selected' : ''}>Major</option>
          <option value="critical" ${record && record.severity === 'critical' ? 'selected' : ''}>Critical</option>
        </select>
      </div>
      <div class="form-group">
        <label>Parent Notified</label>
        <select id="disc-parent-notified">
          <option value="no" ${record && !record.parentNotified ? 'selected' : ''}>No</option>
          <option value="yes" ${record && record.parentNotified ? 'selected' : ''}>Yes</option>
        </select>
      </div>
    </div>` : ''}
    <div class="form-group">
      <label>Action Taken *</label>
      <select id="disc-action">
        <option value="">Select Action</option>
        ${actionOptions.map(a => `<option value="${a.value}" ${record && record.actionTaken === a.value ? 'selected' : ''}>${a.label}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="disc-description" rows="3" placeholder="Provide details...">${record ? escapeHtml(record.description || '') : ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Reported By</label>
        <input type="text" id="disc-reported-by" placeholder="Teacher / Staff name" value="${record ? escapeHtml(record.reportedBy || '') : ''}">
      </div>
      <div class="form-group">
        <label>Term / Year</label>
        <div class="form-row" style="gap:0.5rem">
          <select id="disc-term">
            <option value="1" ${(record ? record.term : currentTerm) === 1 ? 'selected' : ''}>Term 1</option>
            <option value="2" ${(record ? record.term : currentTerm) === 2 ? 'selected' : ''}>Term 2</option>
            <option value="3" ${(record ? record.term : currentTerm) === 3 ? 'selected' : ''}>Term 3</option>
          </select>
          <select id="disc-year">
            ${SV.getYears().map(y => `<option value="${y}" ${(record ? record.year : currentYear) === y ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>`;

  modal.classList.add('active');
  scheduleIcons();
}

async function saveDisciplineRecord() {
  const editId = document.getElementById('disc-edit-id')?.value;
  const type = document.getElementById('disc-type')?.value;
  const studentId = document.getElementById('disc-student')?.value;
  const date = document.getElementById('disc-date')?.value;
  const category = document.getElementById('disc-category')?.value;
  const actionTaken = document.getElementById('disc-action')?.value;
  const description = document.getElementById('disc-description')?.value?.trim();
  const reportedBy = document.getElementById('disc-reported-by')?.value?.trim();
  const term = parseInt(document.getElementById('disc-term')?.value) || getCurrentTerm();
  const year = parseInt(document.getElementById('disc-year')?.value) || new Date().getFullYear();

  if (!studentId) { showToast('Please select a student', 'error'); return; }
  if (!date) { showToast('Please select a date', 'error'); return; }
  if (!category) { showToast('Please select a category', 'error'); return; }
  if (!actionTaken) { showToast('Please select an action taken', 'error'); return; }

  const isIncident = type === 'incident';
  let severity = 'minor';
  let parentNotified = false;

  if (isIncident) {
    severity = document.getElementById('disc-severity')?.value || 'minor';
    parentNotified = document.getElementById('disc-parent-notified')?.value === 'yes';
  }

  try {
    const record = {
      id: editId || generateId(),
      studentId,
      type,
      date,
      category,
      severity: isIncident ? severity : '',
      description,
      actionTaken,
      reportedBy,
      parentNotified,
      term,
      year,
      createdAt: editId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editId) {
      const existing = await db.get('discipline', editId);
      if (existing) record.createdAt = existing.createdAt;
    }

    await db.put('discipline', record);

    // Auto-update student status based on action taken
    if (isIncident && !editId) {
      const student = await db.get('students', studentId);
      if (student) {
        let newStatus = null;
        if (actionTaken === 'suspension') newStatus = 'suspended';
        else if (actionTaken === 'expulsion') newStatus = 'expelled';
        if (newStatus && (student.status === 'active' || !student.status)) {
          student.status = newStatus;
          await db.put('students', student);
        }
      }
    }

    invalidateDisciplineCache();
    closeModal('discipline-modal');
    showToast(`${isIncident ? 'Incident' : 'Merit'} ${editId ? 'updated' : 'recorded'}`, 'success');
    SoundManager.play('success');
    loadDisciplinePage();
  } catch (err) {
    showToast('Error saving record: ' + err.message, 'error');
  }
}

// ============================================================
// VIEW / DELETE RECORDS
// ============================================================

async function viewDisciplineRecord(recordId) {
  const record = await db.get('discipline', recordId);
  if (!record) { showToast('Record not found', 'error'); return; }

  const student = await db.get('students', record.studentId);
  const isIncident = record.type === 'incident';
  const catLabel = isIncident
    ? (SV.INCIDENT_CATEGORIES.find(c => c.value === record.category)?.label || record.category)
    : (SV.MERIT_CATEGORIES.find(c => c.value === record.category)?.label || record.category);
  const actionLabel = SV.ACTION_TYPES.find(a => a.value === record.actionTaken)?.label || record.actionTaken;

  const modal = document.getElementById('discipline-view-modal');
  if (!modal) return;

  modal.querySelector('.modal-header h3').textContent = isIncident ? 'Incident Details' : 'Merit Details';
  const body = modal.querySelector('.modal-body');
  body.innerHTML = `
    <div class="disc-view-header">
      <span class="badge ${isIncident ? 'badge-category' : 'badge-merit'}">${isIncident ? 'Incident' : 'Merit'}</span>
      ${isIncident ? `<span class="severity-badge severity-${record.severity}">${SV.SEVERITY_LEVELS.find(s => s.value === record.severity)?.label || record.severity}</span>` : ''}
    </div>
    <div class="disc-view-row"><strong>Student:</strong> ${student ? escapeHtml(student.name) : 'Unknown'}</div>
    <div class="disc-view-row"><strong>Adm No:</strong> ${student ? escapeHtml(student.admissionNumber) : '-'}</div>
    <div class="disc-view-row"><strong>Class:</strong> ${student ? escapeHtml(student.class + ' ' + student.stream) : '-'}</div>
    <div class="disc-view-row"><strong>Date:</strong> ${formatDate(record.date)}</div>
    <div class="disc-view-row"><strong>Category:</strong> ${escapeHtml(catLabel)}</div>
    <div class="disc-view-row"><strong>Action Taken:</strong> ${escapeHtml(actionLabel)}</div>
    <div class="disc-view-row"><strong>Reported By:</strong> ${escapeHtml(record.reportedBy || 'N/A')}</div>
    ${isIncident ? `<div class="disc-view-row"><strong>Parent Notified:</strong> ${record.parentNotified ? 'Yes' : 'No'}</div>` : ''}
    <div class="disc-view-row"><strong>Term:</strong> Term ${record.term} ${record.year}</div>
    ${record.description ? `<div class="disc-view-row disc-view-desc"><strong>Description:</strong><p>${escapeHtml(record.description)}</p></div>` : ''}
    <div class="disc-view-row"><strong>Recorded:</strong> ${formatDateTime(record.createdAt)}</div>`;

  modal.classList.add('active');
  scheduleIcons();
}

async function deleteDisciplineRecord(recordId) {
  showConfirm('Delete this discipline record? This cannot be undone.', async () => {
    try {
      const record = await db.get('discipline', recordId);
      await db.delete('discipline', recordId);

      if (record && record.type === 'incident' && (record.actionTaken === 'suspension' || record.actionTaken === 'expulsion')) {
        const student = await db.get('students', record.studentId);
        if (student && (student.status === 'suspended' || student.status === 'expelled')) {
          const allRecords = await db.getByIndex('discipline', 'studentId', record.studentId);
          const activeSuspensions = allRecords.filter(r =>
            r.type === 'incident' && (r.actionTaken === 'suspension' || r.actionTaken === 'expulsion')
          );
          if (activeSuspensions.length === 0) {
            student.status = 'active';
            await db.put('students', student);
            showToast('Record deleted. Student status reverted to Active.', 'success');
          } else {
            showToast('Record deleted. Student still has active suspension/expulsion records.', 'success');
          }
        } else {
          showToast('Record deleted', 'success');
        }
      } else {
        showToast('Record deleted', 'success');
      }

      invalidateDisciplineCache();
      SoundManager.play('success');
      loadDisciplinePage();
    } catch (err) {
      showToast('Error deleting record: ' + err.message, 'error');
    }
  });
}

// ============================================================
// FILTERING (Uses cache for fast search)
// ============================================================

async function filterIncidents() {
  const search = document.getElementById('incident-search')?.value?.toLowerCase() || '';
  const sevFilter = document.getElementById('incident-filter-severity')?.value || '';
  const catFilter = document.getElementById('incident-filter-category')?.value || '';

  const { allRecords, studentMap } = await getDisciplineData();
  let incidents = allRecords.filter(d => d.type === 'incident');

  if (sevFilter) incidents = incidents.filter(d => d.severity === sevFilter);
  if (catFilter) incidents = incidents.filter(d => d.category === catFilter);

  const tbody = document.getElementById('incidents-tbody');
  if (!tbody) return;

  let rows = '';
  for (const inc of incidents) {
    const student = getCachedStudent(studentMap, inc.studentId);
    const studentName = student ? student.name : 'Unknown';
    const studentClass = student ? student.class + ' ' + student.stream : '';

    if (search && !studentName.toLowerCase().includes(search) && !studentClass.toLowerCase().includes(search) && !(inc.description || '').toLowerCase().includes(search)) continue;

    const catLabel = SV.INCIDENT_CATEGORIES.find(c => c.value === inc.category)?.label || inc.category;
    const sevLabel = SV.SEVERITY_LEVELS.find(s => s.value === inc.severity)?.label || inc.severity;
    const actionLabel = SV.ACTION_TYPES.find(a => a.value === inc.actionTaken)?.label || inc.actionTaken;

    rows += `<tr>
      <td>${formatDate(inc.date)}</td>
      <td>${escapeHtml(studentName)}</td>
      <td>${escapeHtml(studentClass)}</td>
      <td><span class="badge badge-category">${escapeHtml(catLabel)}</span></td>
      <td><span class="severity-badge severity-${inc.severity}">${escapeHtml(sevLabel)}</span></td>
      <td>${escapeHtml((inc.description || '').substring(0, 50))}${inc.description && inc.description.length > 50 ? '...' : ''}</td>
      <td>${escapeHtml(actionLabel)}</td>
      <td>${inc.parentNotified ? '<span class="badge badge-active">Yes</span>' : '<span class="badge badge-suspended">No</span>'}</td>
      <td class="action-btns">
        <button class="btn-icon" title="View" onclick="viewDisciplineRecord('${inc.id}')">${ic('eye', '')}</button>
        <button class="btn-icon" title="Delete" onclick="deleteDisciplineRecord('${inc.id}')">${ic('trash-2', '')}</button>
      </td>
    </tr>`;
  }

  tbody.innerHTML = rows || '<tr><td colspan="9" class="empty-state">No matching incidents</td></tr>';
  scheduleIcons();
}

async function filterMerits() {
  const search = document.getElementById('merit-search')?.value?.toLowerCase() || '';
  const catFilter = document.getElementById('merit-filter-category')?.value || '';

  const { allRecords, studentMap } = await getDisciplineData();
  let merits = allRecords.filter(d => d.type === 'merit');

  if (catFilter) merits = merits.filter(d => d.category === catFilter);

  const tbody = document.getElementById('merits-tbody');
  if (!tbody) return;

  let rows = '';
  for (const m of merits) {
    const student = getCachedStudent(studentMap, m.studentId);
    const studentName = student ? student.name : 'Unknown';
    const studentClass = student ? student.class + ' ' + student.stream : '';

    if (search && !studentName.toLowerCase().includes(search) && !studentClass.toLowerCase().includes(search) && !(m.description || '').toLowerCase().includes(search)) continue;

    const catLabel = SV.MERIT_CATEGORIES.find(c => c.value === m.category)?.label || m.category;
    const actionLabel = SV.ACTION_TYPES.find(a => a.value === m.actionTaken)?.label || m.actionTaken;

    rows += `<tr>
      <td>${formatDate(m.date)}</td>
      <td>${escapeHtml(studentName)}</td>
      <td>${escapeHtml(studentClass)}</td>
      <td><span class="badge badge-merit">${escapeHtml(catLabel)}</span></td>
      <td>${escapeHtml((m.description || '').substring(0, 60))}${m.description && m.description.length > 60 ? '...' : ''}</td>
      <td>${escapeHtml(actionLabel)}</td>
      <td>${escapeHtml(m.reportedBy || '-')}</td>
      <td class="action-btns">
        <button class="btn-icon" title="View" onclick="viewDisciplineRecord('${m.id}')">${ic('eye', '')}</button>
        <button class="btn-icon" title="Delete" onclick="deleteDisciplineRecord('${m.id}')">${ic('trash-2', '')}</button>
      </td>
    </tr>`;
  }

  tbody.innerHTML = rows || '<tr><td colspan="8" class="empty-state">No matching merits</td></tr>';
  scheduleIcons();
}
