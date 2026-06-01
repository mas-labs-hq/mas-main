/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-academics.js - Academic Performance Module
 * Powered By MortApps Studios
 */

// ============================================================
// SUBJECTS MANAGEMENT
// ============================================================

/**
 * Load subjects list grouped by curriculum-specific group
 */
async function loadSubjectsList() {
  const container = document.getElementById('subjects-list');
  const filterGroup = document.getElementById('subject-filter-group')?.value || '';
  const curriculum = await getActiveCurriculum();

  // Update subject filter dropdown based on curriculum
  const filterSelect = document.getElementById('subject-filter-group');
  if (filterSelect) {
    const currentVal = filterSelect.value;
    if (curriculum === 'cbc') {
      filterSelect.innerHTML = '<option value="">All Groups</option><option value="core">CBC - Core</option><option value="science">CBC - Science</option><option value="humanities">CBC - Humanities</option><option value="technical">CBC - Technical</option><option value="life-skills">CBC - Life Skills</option><option value="optional">CBC - Optional</option>';
    } else {
      filterSelect.innerHTML = '<option value="">All Groups</option><option value="1">Group 1 - Compulsory</option><option value="2">Group 2 - Sciences</option><option value="3">Group 3 - Humanities</option><option value="4">Group 4 - Technical/Applied</option><option value="5">Group 5 - Optional/Languages</option>';
    }
    // Restore selection if still valid
    const options = Array.from(filterSelect.options).map(o => o.value);
    if (options.includes(currentVal)) filterSelect.value = currentVal;
  }
  const effectiveFilter = filterSelect?.value || '';

  let subjects = await db.getAll('subjects');
  // Filter by current curriculum
  subjects = subjects.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));

  if (curriculum === 'cbc') {
    subjects.sort((a, b) => {
      const groupOrder = ['core','science','humanities','technical','life-skills','optional'];
      return groupOrder.indexOf(a.cbcGroup || '') - groupOrder.indexOf(b.cbcGroup || '');
    });
  } else {
    subjects.sort((a, b) => (a.kcseGroup || 0) - (b.kcseGroup || 0));
  }

  if (effectiveFilter) {
    if (curriculum === 'cbc') {
      subjects = subjects.filter(s => s.cbcGroup === effectiveFilter);
    } else {
      subjects = subjects.filter(s => String(s.kcseGroup) === effectiveFilter);
    }
  }

  // Group subjects
  const groups = {};
  subjects.forEach(s => {
    const g = curriculum === 'cbc' ? (s.cbcGroup || 'core') : (s.kcseGroup || 0);
    if (!groups[g]) groups[g] = [];
    groups[g].push(s);
  });

  if (Object.keys(groups).length === 0) {
    const curriculumLabel = curriculum === 'cbc' ? 'CBC' : 'KCSE';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ic('book-open','')}</div>
        <h3>No learning areas configured</h3>
        <p>Click "Reset to Default" to load ${curriculumLabel} subjects</p>
      </div>`;
    scheduleIcons();
    return;
  }

  let html = '';
  for (const [groupId, groupSubjects] of Object.entries(groups)) {
    const groupName = curriculum === 'cbc'
      ? (SV.CBC_GROUP_NAMES[groupId] || `Group ${groupId}`)
      : (SV.KCSE_GROUP_NAMES[groupId] || `Group ${groupId}`);
    const itemCount = curriculum === 'cbc' ? 'learning areas' : 'subjects';

    html += `
      <div class="subject-group">
        <div class="subject-group-header">
          <h4>${escapeHtml(groupName)}</h4>
          <span style="color: var(--text-muted); font-size: 0.8rem;">${groupSubjects.length} ${itemCount}</span>
        </div>`;

    groupSubjects.forEach(s => {
      const strands = (curriculum === 'cbc' && s.strands) ? `<span class="subject-strands" title="${s.strands.join(', ')}">${s.strands.length} strands</span>` : '';
      html += `
        <div class="subject-item">
          <div class="subject-info">
            <span class="subject-code">${escapeHtml(s.code || 'N/A')}</span>
            <span class="subject-name">${escapeHtml(s.name)}</span>
            ${s.isCompulsory ? '<span class="subject-compulsory">COMPULSORY</span>' : ''}
            ${s.isCustom ? '<span style="color: var(--info); font-size: 0.75rem; font-weight: 600;">CUSTOM</span>' : ''}
            ${strands}
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label class="toggle-switch">
              <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="toggleSubject('${s.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
            ${s.isCustom ? `<button class="btn-icon" title="Delete" onclick="deleteCustomSubject('${s.id}')">${ic('trash-2','')}</button>` : ''}
          </div>
        </div>`;
    });

    html += '</div>';
  }

  container.innerHTML = html;
  scheduleIcons();
}

/**
 * Toggle subject enabled/disabled
 */
async function toggleSubject(subjectId, enabled) {
  try {
    const subject = await db.get('subjects', subjectId);
    if (subject) {
      subject.enabled = enabled;
      await db.put('subjects', subject);
      showToast(`${subject.name} ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }
  } catch (err) {
    showToast('Error updating subject: ' + err.message, 'error');
  }
}

/**
 * Open custom subject form
 */
async function openCustomSubjectForm() {
  const curriculum = await getActiveCurriculum();
  
  document.getElementById('custom-subj-name').value = '';
  document.getElementById('custom-subj-code').value = '';
  
  // Update group options based on curriculum
  const groupSelect = document.getElementById('custom-subj-group');
  if (curriculum === 'cbc') {
    groupSelect.innerHTML = `
      <option value="core">CBC - Core</option>
      <option value="science">CBC - Science & Technology</option>
      <option value="humanities">CBC - Humanities</option>
      <option value="technical">CBC - Technical & Applied</option>
      <option value="life-skills">CBC - Life Skills</option>
      <option value="optional">CBC - Optional</option>`;
  } else {
    groupSelect.innerHTML = `
      <option value="2">Group 2 - Sciences</option>
      <option value="3">Group 3 - Humanities</option>
      <option value="4">Group 4 - Technical/Applied</option>
      <option value="5">Group 5 - Optional/Languages</option>`;
  }
  
  document.getElementById('custom-subj-max').value = '100';
  document.getElementById('custom-subject-modal').classList.add('active');
  SoundManager.play('notify');
}

/**
 * Save custom subject
 */
async function saveCustomSubject() {
  const name = document.getElementById('custom-subj-name').value.trim();
  const code = document.getElementById('custom-subj-code').value.trim() || generateId().substring(0, 3).toUpperCase();
  const group = document.getElementById('custom-subj-group').value;
  const maxScore = parseInt(document.getElementById('custom-subj-max').value) || 100;
  const curriculum = await getActiveCurriculum();

  if (!name) { showToast('Subject name is required', 'error'); return; }

  const subject = {
    id: 'custom_' + generateId(),
    name,
    code,
    isCompulsory: false,
    maxScore,
    enabled: true,
    isCustom: true,
    curriculum,
    dateAdded: new Date().toISOString()
  };

  // Set group field based on curriculum
  if (curriculum === 'cbc') {
    subject.cbcGroup = group;
    subject.gradeScale = 'cbc';
  } else {
    subject.kcseGroup = parseInt(group);
    subject.gradeScale = 'kcse';
  }

  try {
    await db.add('subjects', subject);
    closeModal('custom-subject-modal');
    showToast(`Custom subject "${name}" added`, 'success');
    loadSubjectsList();
  } catch (err) {
    showToast('Error adding subject: ' + err.message, 'error');
  }
}

/**
 * Delete custom subject
 */
async function deleteCustomSubject(subjectId) {
  showConfirm('Delete this custom subject?', async () => {
    try {
      await db.delete('subjects', subjectId);
      showToast('Subject deleted', 'success');
      loadSubjectsList();
    } catch (err) {
      showToast('Error deleting subject: ' + err.message, 'error');
    }
  });
}

/**
 * Reset subjects to default based on current curriculum
 */
async function resetSubjectsToDefault() {
  const curriculum = await getActiveCurriculum();
  const curriculumLabel = curriculum === 'cbc' ? 'CBC' : 'KCSE';
  
  showConfirm(`Reset all subjects to the default ${curriculumLabel} list? Custom subjects will be preserved.`, async () => {
    try {
      // Delete non-custom subjects
      const subjects = await db.getAll('subjects');
      for (const s of subjects) {
        if (!s.isCustom) {
          await db.delete('subjects', s.id);
        }
      }

      // Re-add default subjects
      if (curriculum === 'cbc') {
        await db.initCBCSubjects();
      } else {
        for (const subj of SV.KCSE_SUBJECTS) {
          await db.add('subjects', {
            ...subj,
            curriculum: '844',
            enabled: subj.isCompulsory,
            isCustom: false,
            dateAdded: new Date().toISOString()
          });
        }
      }

      showToast(`${curriculumLabel} subjects reset to default`, 'success');
      loadSubjectsList();
    } catch (err) {
      showToast('Error resetting subjects: ' + err.message, 'error');
    }
  });
}

// ============================================================
// EXAMS MANAGEMENT
// ============================================================

/**
 * Open exam form
 */
async function openExamForm(examId) {
  // Demo cap only blocks CREATING new exams, not editing existing ones
  if (SV.IS_DEMO && !examId) {
    const exams = await db.getAll('exams');
    if (exams.length >= SV.DEMO_MAX_EXAMS) {
      showToast(`Demo version is limited to ${SV.DEMO_MAX_EXAMS} exams. Upgrade to Premium for unlimited exams.`, 'warning');
      return;
    }
  }

  document.getElementById('exam-edit-id').value = '';
  document.getElementById('exam-name').value = '';
  document.getElementById('exam-term').value = getCurrentTerm();
  populateYearSelect('exam-year');

  // Populate exam types based on curriculum
  const typeSelect = document.getElementById('exam-type');
  typeSelect.innerHTML = '';
  
  getActiveCurriculum().then(curriculum => {
    const types = curriculum === 'cbc' ? SV.CBC_EXAM_TYPES : SV.EXAM_TYPES;
    types.forEach(t => {
      typeSelect.innerHTML += `<option value="${t.value}">${t.label}</option>`;
    });
  });

  // Populate class select
  populateStudentClassSelects();

  if (examId) {
    loadExamIntoForm(examId);
  }

  document.getElementById('exam-modal').classList.add('active');
  SoundManager.play('notify');
}

/**
 * Load exam into form for editing
 */
async function loadExamIntoForm(examId) {
  const exam = await db.get('exams', examId);
  if (!exam) return;

  document.getElementById('exam-edit-id').value = exam.id;
  document.getElementById('exam-name').value = exam.name || '';
  document.getElementById('exam-type').value = exam.type || '';
  document.getElementById('exam-class').value = exam.class || '';
  document.getElementById('exam-term').value = exam.term || '';
  document.getElementById('exam-year').value = exam.year || '';
}

/**
 * Save exam
 */
async function saveExam() {
  const editId = document.getElementById('exam-edit-id').value;
  const name = document.getElementById('exam-name').value.trim();
  const type = document.getElementById('exam-type').value;
  const cls = document.getElementById('exam-class').value;
  const term = parseInt(document.getElementById('exam-term').value);
  const year = parseInt(document.getElementById('exam-year').value);

  if (!name) { showToast('Exam name is required', 'error'); return; }
  if (!type) { showToast('Exam type is required', 'error'); return; }
  if (!cls) { showToast('Class is required', 'error'); return; }
  if (!term || !year) { showToast('Term and year are required', 'error'); return; }

  const exam = {
    id: editId || generateId(),
    name,
    type,
    class: cls,
    term,
    year,
    dateCreated: editId ? undefined : new Date().toISOString()
  };

  if (editId) {
    const existing = await db.get('exams', editId);
    if (existing) exam.dateCreated = existing.dateCreated;
  }

  try {
    await db.put('exams', exam);
    closeModal('exam-modal');
    showToast(editId ? 'Exam updated' : 'Exam created', 'success');
    loadExamsList();
    populateExamSelects();
  } catch (err) {
    showToast('Error saving exam: ' + err.message, 'error');
  }
}

/**
 * Delete exam
 */
async function deleteExam(examId) {
  showConfirm('Delete this exam and all its scores? This cannot be undone.', async () => {
    try {
      // Delete all scores for this exam
      const scores = await db.getByIndex('scores', 'examId', examId);
      for (const s of scores) {
        await db.delete('scores', s.id);
      }

      // Delete exam clearance
      const clearances = await db.getByIndex('examClearance', 'examId', examId);
      for (const c of clearances) {
        await db.delete('examClearance', c.id);
      }

      // Delete the exam
      await db.delete('exams', examId);

      showToast('Exam and all scores deleted', 'success');
      loadExamsList();
      populateExamSelects();
    } catch (err) {
      showToast('Error deleting exam: ' + err.message, 'error');
    }
  });
}

/**
 * Load exams list
 */
async function loadExamsList() {
  const tbody = document.getElementById('exams-tbody');
  let exams = await db.getAll('exams');

  const filterTerm = document.getElementById('exam-filter-term')?.value || '';
  if (filterTerm) exams = exams.filter(e => e.term === parseInt(filterTerm));

  exams.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  if (exams.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">${ic('clipboard-list','')}</div>
            <h3>No exams created</h3>
            <p>Create an exam to start entering scores</p>
          </div>
        </td>
      </tr>`;
    scheduleIcons();
    return;
  }

  let html = '';
  for (const e of exams) {
    const curriculum = await getActiveCurriculum();
    const examTypeList = curriculum === 'cbc' ? SV.CBC_EXAM_TYPES : SV.EXAM_TYPES;
    const typeLabel = examTypeList.find(t => t.value === e.type)?.label || SV.EXAM_TYPES.find(t => t.value === e.type)?.label || e.type;
    const scoreCount = (await db.getByIndex('scores', 'examId', e.id)).length;

    html += `
      <tr>
        <td><strong>${escapeHtml(e.name)}</strong></td>
        <td>${escapeHtml(typeLabel)}</td>
        <td>Term ${e.term}</td>
        <td>${e.year}</td>
        <td>${escapeHtml(e.class)}</td>
        <td>${formatDate(e.dateCreated)} <span style="color: var(--text-muted);">(${scoreCount} scores)</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="Enter Scores" onclick="openScoreEntryForExam('${e.id}')">${ic('file-edit','')}</button>
            <button class="btn-icon" title="View Rankings" onclick="viewExamRankings('${e.id}')">${ic('trophy','')}</button>
            <button class="btn-icon" title="Edit" onclick="openExamForm('${e.id}')">${ic('pencil','')}</button>
            <button class="btn-icon" title="Delete" onclick="deleteExam('${e.id}')">${ic('trash-2','')}</button>
          </div>
        </td>
      </tr>`;
  }

  tbody.innerHTML = html;
  scheduleIcons();
}

/**
 * Populate exam select dropdowns across the app
 */
async function populateExamSelects() {
  const exams = await db.getAll('exams');
  exams.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  const selects = [
    'score-filter-exam', 'score-entry-exam',
    'rank-filter-exam', 'clearance-filter-exam'
  ];

  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">Select Exam</option>';
    exams.forEach(e => {
      select.innerHTML += `<option value="${e.id}">${escapeHtml(e.name)} (${escapeHtml(e.class)} - T${e.term} ${e.year})</option>`;
    });
    if (currentVal) select.value = currentVal;
  });
}

// ============================================================
// SCORE ENTRY
// ============================================================

/**
 * Open score entry modal
 */
async function openScoreEntry() {
  populateExamSelects();
  populateStudentClassSelects();

  document.getElementById('score-entry-grid').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${ic('file-edit','')}</div>
      <h3>Select an exam and class</h3>
      <p>Choose an exam and class above to start entering scores</p>
    </div>`;

  document.getElementById('score-entry-modal').classList.add('active');
  SoundManager.play('notify');
  scheduleIcons();
}

/**
 * Open score entry for a specific exam
 */
function openScoreEntryForExam(examId) {
  openScoreEntry();
  setTimeout(async () => {
    const examSelect = document.getElementById('score-entry-exam');
    if (examSelect) examSelect.value = examId;
    await loadScoreEntryGrid();
  }, 200);
}

/**
 * Load score entry grid - supports both 8-4-4 and CBC
 */
async function loadScoreEntryGrid() {
  const examId = document.getElementById('score-entry-exam')?.value;
  const cls = document.getElementById('score-entry-class')?.value;

  if (!examId || !cls) {
    document.getElementById('score-entry-grid').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ic('file-edit','')}</div>
        <h3>Select an exam and class</h3>
        <p>Choose an exam and class above to start entering scores</p>
      </div>`;
    scheduleIcons();
    return;
  }

  const exam = await db.get('exams', examId);
  if (!exam) return;

  const curriculum = await getActiveCurriculum();

  // Get enabled subjects for the current curriculum
  const allSubjects = (await db.getAll('subjects')).filter(s => s.enabled);
  const subjects = allSubjects.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));

  if (curriculum === 'cbc') {
    subjects.sort((a, b) => {
      const groupOrder = ['core','science','humanities','technical','life-skills','optional'];
      return groupOrder.indexOf(a.cbcGroup || '') - groupOrder.indexOf(b.cbcGroup || '');
    });
  } else {
    subjects.sort((a, b) => (a.kcseGroup || 0) - (b.kcseGroup || 0));
  }

  // Get students in this class
  const students = (await db.getAll('students')).filter(s =>
    s.class === cls && (s.status === 'active' || !s.status)
  );
  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Get existing scores
  const existingScores = await db.getByIndex('scores', 'examId', examId);

  if (students.length === 0) {
    document.getElementById('score-entry-grid').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ic('users','')}</div>
        <h3>No students in this class</h3>
        <p>Add students to this class first</p>
      </div>`;
    scheduleIcons();
    return;
  }

  // CBC uses rubric dropdowns, 8-4-4 uses raw score inputs
  if (curriculum === 'cbc') {
    // CBC Score Entry - rubric dropdowns
    let html = '<table class="score-entry-table"><thead><tr><th>Student</th>';
    subjects.forEach(s => {
      html += `<th title="${escapeHtml(s.name)}">${escapeHtml(s.code || s.name.substring(0, 5))}</th>`;
    });
    html += '</tr></thead><tbody>';

    students.forEach(student => {
      html += `<tr><td class="student-name-cell" data-student-id="${student.id}">${escapeHtml(student.name)}</td>`;
      subjects.forEach(subj => {
        const existingScore = existingScores.find(sc =>
          sc.studentId === student.id && sc.subjectId === subj.id
        );
        const selectedLevel = existingScore ? (existingScore.rubricLevel || '') : '';
        html += `<td><select class="cbc-rubric-select" data-student="${student.id}" data-subject="${subj.id}" data-max="${subj.maxScore || 100}">
          <option value="">-</option>
          <option value="EE" ${selectedLevel === 'EE' ? 'selected' : ''}>EE</option>
          <option value="ME" ${selectedLevel === 'ME' ? 'selected' : ''}>ME</option>
          <option value="AE" ${selectedLevel === 'AE' ? 'selected' : ''}>AE</option>
          <option value="BE" ${selectedLevel === 'BE' ? 'selected' : ''}>BE</option>
        </select></td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    html += '<div class="cbc-score-hint"><p class="hint">CBC Rubric: EE = Exceeding Expectation | ME = Meeting Expectation | AE = Approaching Expectation | BE = Below Expectation</p></div>';
    document.getElementById('score-entry-grid').innerHTML = html;
  } else {
    // 8-4-4 Score Entry - raw score inputs (original)
    let html = '<table class="score-entry-table"><thead><tr><th>Student</th>';
    subjects.forEach(s => {
      html += `<th title="${escapeHtml(s.name)}">${escapeHtml(s.code || s.name.substring(0, 5))}</th>`;
    });
    html += '</tr></thead><tbody>';

    students.forEach(student => {
      html += `<tr><td class="student-name-cell" data-student-id="${student.id}">${escapeHtml(student.name)}</td>`;
      subjects.forEach(subj => {
        const existingScore = existingScores.find(sc =>
          sc.studentId === student.id && sc.subjectId === subj.id
        );
        const value = existingScore ? existingScore.rawScore : '';
        html += `<td><input type="number" min="0" max="${subj.maxScore || 100}" value="${value}" data-student="${student.id}" data-subject="${subj.id}" data-max="${subj.maxScore || 100}" placeholder="-"></td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('score-entry-grid').innerHTML = html;
  }
  scheduleIcons();
}

/**
 * Save all scores from the entry grid - supports both 8-4-4 and CBC
 */
async function saveAllScores() {
  const examId = document.getElementById('score-entry-exam')?.value;
  if (!examId) { showToast('Please select an exam', 'error'); return; }

  const curriculum = await getActiveCurriculum();
  let saved = 0;
  let errors = 0;

  if (curriculum === 'cbc') {
    // CBC rubric score saving
    const selects = document.querySelectorAll('#score-entry-grid .cbc-rubric-select');

    for (const select of selects) {
      const rubricLevel = select.value;
      if (!rubricLevel) continue; // Skip empty

      const studentId = select.dataset.student;
      const subjectId = select.dataset.subject;
      const maxScore = parseInt(select.dataset.max) || 100;

      // Convert rubric level to a representative raw score for compatibility
      const rubricPoints = { EE: 4, ME: 3, AE: 2, BE: 1 };
      const pts = rubricPoints[rubricLevel] || 0;
      // Store as percentage-based raw score for compatibility (EE=92, ME=67, AE=42, BE=17)
      const rawScoreMap = { EE: 92, ME: 67, AE: 42, BE: 17 };
      const rawScore = rawScoreMap[rubricLevel] || 0;

      const score = {
        id: generateId(),
        studentId,
        examId,
        subjectId,
        rawScore,
        maxScore,
        grade: rubricLevel, // Store rubric level as "grade"
        points: pts,
        rubricLevel, // Explicitly store rubric level
        comment: '',
        dateEntered: new Date().toISOString()
      };

      try {
        const existing = await db.getOneByIndex('scores', 'studentExamSubject', [studentId, examId, subjectId]);
        if (existing) {
          score.id = existing.id;
          await db.put('scores', score);
        } else {
          await db.add('scores', score);
        }
        saved++;
      } catch (err) {
        errors++;
        console.error('Error saving CBC score:', err);
      }
    }
  } else {
    // 8-4-4 raw score saving (original)
    const inputs = document.querySelectorAll('#score-entry-grid input[type="number"]');

    for (const input of inputs) {
      const value = input.value.trim();
      if (value === '') continue;

      const rawScore = parseFloat(value);
      const studentId = input.dataset.student;
      const subjectId = input.dataset.subject;
      const maxScore = parseInt(input.dataset.max) || 100;

      if (isNaN(rawScore) || rawScore < 0 || rawScore > maxScore) {
        errors++;
        continue;
      }

      const percentage = (rawScore / maxScore) * 100;
      const kcse = rawToKCSE(percentage);

      const score = {
        id: generateId(),
        studentId,
        examId,
        subjectId,
        rawScore,
        maxScore,
        grade: kcse.grade,
        points: kcse.points,
        comment: '',
        dateEntered: new Date().toISOString()
      };

      try {
        const existing = await db.getOneByIndex('scores', 'studentExamSubject', [studentId, examId, subjectId]);
        if (existing) {
          score.id = existing.id;
          await db.put('scores', score);
        } else {
          await db.add('scores', score);
        }
        saved++;
      } catch (err) {
        errors++;
        console.error('Error saving score:', err);
      }
    }
  }

  if (saved > 0) {
    showToast(`${saved} score${saved !== 1 ? 's' : ''} saved${errors > 0 ? ` (${errors} errors)` : ''}`, 'success');
  } else if (errors > 0) {
    showToast(`Failed to save ${errors} scores`, 'error');
  } else {
    showToast('No scores to save', 'warning');
  }
}

// ============================================================
// SCORES VIEW
// ============================================================

/**
 * Load scores table for viewing
 */
async function loadScoresTable() {
  const examId = document.getElementById('score-filter-exam')?.value;
  const cls = document.getElementById('score-filter-class')?.value;

  if (!examId) return;

  const exam = await db.get('exams', examId);
  if (!exam) return;

  const curriculum = await getActiveCurriculum();

  const allSubjects = (await db.getAll('subjects')).filter(s => s.enabled);
  const subjects = allSubjects.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));

  if (curriculum === 'cbc') {
    subjects.sort((a, b) => {
      const groupOrder = ['core','science','humanities','technical','life-skills','optional'];
      return groupOrder.indexOf(a.cbcGroup || '') - groupOrder.indexOf(b.cbcGroup || '');
    });
  } else {
    subjects.sort((a, b) => (a.kcseGroup || 0) - (b.kcseGroup || 0));
  }

  let students = await db.getAll('students');
  if (cls) students = students.filter(s => s.class === cls);
  students = students.filter(s => s.status === 'active' || !s.status);
  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const scores = await db.getByIndex('scores', 'examId', examId);

  // Build table header
  const thead = document.getElementById('scores-thead');
  const gradeLabel = curriculum === 'cbc' ? 'Rubric' : 'Mean Grade';
  let headerHtml = '<tr><th>Student</th>';
  subjects.forEach(s => {
    headerHtml += `<th title="${escapeHtml(s.name)}">${escapeHtml(s.code || s.name.substring(0, 8))}<br><small style="font-weight: normal;">${escapeHtml(s.name)}</small></th>`;
  });
  headerHtml += `<th>Total</th><th>${gradeLabel}</th></tr>`;
  thead.innerHTML = headerHtml;

  // Build table body
  const tbody = document.getElementById('scores-tbody');
  let html = '';

  for (const student of students) {
    const studentScores = scores.filter(s => s.studentId === student.id);
    html += `<tr><td><strong>${escapeHtml(student.name)}</strong></td>`;

    let totalPoints = 0;
    let numScored = 0;

    subjects.forEach(subj => {
      const score = studentScores.find(s => s.subjectId === subj.id);
      if (score) {
        if (curriculum === 'cbc') {
          const level = score.rubricLevel || score.grade || '';
          const cssClass = cbcLevelClass(level);
          html += `<td style="text-align: center;"><span class="rubric-badge ${cssClass}">${level}</span></td>`;
          totalPoints += score.points || 0;
        } else {
          html += `<td style="text-align: center;">${score.rawScore} <small style="color: var(--grape);">(${score.grade})</small></td>`;
          totalPoints += score.points;
        }
        numScored++;
      } else {
        html += '<td style="text-align: center; color: var(--text-muted);">-</td>';
      }
    });

    // Calculate overall grade for this student
    if (numScored > 0) {
      const studentScoreObjects = studentScores.map(sc => ({
        subjectId: sc.subjectId,
        rawScore: sc.rawScore,
        maxScore: sc.maxScore,
        rubricLevel: sc.rubricLevel
      }));

      if (curriculum === 'cbc') {
        const rubricScores = studentScoreObjects.filter(sc => sc.rubricLevel).map(sc => ({ subjectId: sc.subjectId, rubricLevel: sc.rubricLevel }));
        const cbcResult = computeCBCCompetency(rubricScores);
        const cssClass = cbcLevelClass(cbcResult.overallLevel);
        html += `<td style="text-align: center;">${totalPoints}</td>`;
        html += `<td style="text-align: center;"><span class="rubric-badge ${cssClass}">${cbcResult.overallLevel}</span> <small>(${cbcResult.averagePoints})</small></td>`;
      } else {
        const kcseResult = computeKCSEMeanGrade(studentScoreObjects, subjects);
        html += `<td style="text-align: center;">${totalPoints}</td>`;
        html += `<td style="text-align: center;"><strong style="color: var(--grape);">${kcseResult.meanGrade}</strong> (${kcseResult.meanPoints})</td>`;
      }
    } else {
      html += '<td>-</td><td>-</td>';
    }

    html += '</tr>';
  }

  tbody.innerHTML = html || `
    <tr>
      <td colspan="${subjects.length + 3}">
        <div class="empty-state">
          <div class="empty-icon">${ic('file-edit','')}</div>
          <h3>No scores recorded</h3>
          <p>Enter scores for this exam</p>
        </div>
      </td>
    </tr>`;
  scheduleIcons();
}

// ============================================================
// RANKINGS
// ============================================================

/**
 * View exam rankings
 */
function viewExamRankings(examId) {
  navigateTo('academics');
  setTimeout(async () => {
    // Switch to rankings tab
    const rankingsTab = document.querySelector('[data-tab="acad-rankings"]');
    if (rankingsTab) rankingsTab.click();

    const rankExamSelect = document.getElementById('rank-filter-exam');
    if (rankExamSelect) {
      await populateExamSelects();
      rankExamSelect.value = examId;
      loadRankingsTable();
    }
  }, 300);
}

/**
 * Load rankings table
 */
async function loadRankingsTable() {
  const examId = document.getElementById('rank-filter-exam')?.value;
  const filterClass = document.getElementById('rank-filter-class')?.value;
  const filterStream = document.getElementById('rank-filter-stream')?.value;

  if (!examId) return;

  const exam = await db.get('exams', examId);
  if (!exam) return;

  const curriculum = await getActiveCurriculum();

  const allSubjects = (await db.getAll('subjects')).filter(s => s.enabled);
  const subjects = allSubjects.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));
  const allStudents = await db.getAll('students');
  const scores = await db.getByIndex('scores', 'examId', examId);

  // Filter students
  let students = allStudents.filter(s => s.status === 'active' || !s.status);
  if (filterClass) students = students.filter(s => s.class === filterClass);
  if (filterStream) students = students.filter(s => s.stream === filterStream);

  // Calculate grades for each student
  const ranked = [];
  for (const student of students) {
    const studentScores = scores.filter(s => s.studentId === student.id);
    if (studentScores.length === 0) continue;

    if (curriculum === 'cbc') {
      const rubricScores = studentScores.filter(sc => sc.rubricLevel).map(sc => ({ subjectId: sc.subjectId, rubricLevel: sc.rubricLevel }));
      const cbcResult = computeCBCCompetency(rubricScores);
      const totalMarks = studentScores.reduce((sum, sc) => sum + sc.rawScore, 0);

      ranked.push({
        student,
        totalMarks,
        meanGrade: cbcResult.overallLevel,
        meanPoints: cbcResult.averagePoints,
        totalPoints: cbcResult.totalPoints,
        breakdown: cbcResult.levelBreakdown
      });
    } else {
      const scoreObjects = studentScores.map(sc => ({
        subjectId: sc.subjectId,
        rawScore: sc.rawScore,
        maxScore: sc.maxScore
      }));

      const kcseResult = computeKCSEMeanGrade(scoreObjects, subjects);
      const totalMarks = studentScores.reduce((sum, sc) => sum + sc.rawScore, 0);

      ranked.push({
        student,
        totalMarks,
        meanGrade: kcseResult.meanGrade,
        meanPoints: kcseResult.meanPoints,
        totalPoints: kcseResult.totalPoints
      });
    }
  }

  // Sort by mean points descending
  ranked.sort((a, b) => b.meanPoints - a.meanPoints || b.totalMarks - a.totalMarks);

  // Calculate positions
  ranked.forEach((r, i) => r.positionInForm = i + 1);

  // Position in Stream
  const classConfig = (typeof db !== 'undefined') ? (await db.getSetting('classes') || []) : [];
  const streamGroups = {};
  ranked.forEach(r => {
    // Get the first stream name from class config, falling back to the student's own stream or 'A'
    let stream = r.student.stream;
    if (!stream) {
      const classObj = classConfig.find(c => c.name === r.student.class);
      const names = classObj ? getStreamNames(classObj) : ['A'];
      stream = names[0];
    }
    if (!streamGroups[stream]) streamGroups[stream] = [];
    streamGroups[stream].push(r);
  });

  Object.values(streamGroups).forEach(group => {
    group.sort((a, b) => b.meanPoints - a.meanPoints);
    group.forEach((r, i) => r.positionInStream = i + 1);
  });

  // Display
  const tbody = document.getElementById('rankings-tbody');
  if (ranked.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">${ic('trophy','')}</div>
            <h3>No rankings available</h3>
            <p>Enter scores first to generate rankings</p>
          </div>
        </td>
      </tr>`;
    scheduleIcons();
    return;
  }

  let html = '';
  ranked.forEach(r => {
    const gradeDisplay = curriculum === 'cbc'
      ? `<span class="rubric-badge ${cbcLevelClass(r.meanGrade)}">${r.meanGrade}</span>`
      : `<strong style="color: var(--grape);">${r.meanGrade}</strong>`;

    html += `
      <tr>
        <td><strong>${ordinalSuffix(r.positionInStream)}</strong></td>
        <td>${ordinalSuffix(r.positionInForm)}</td>
        <td>${escapeHtml(r.student.admissionNumber)}</td>
        <td><strong>${escapeHtml(r.student.name)}</strong></td>
        <td>${escapeHtml(r.student.stream)}</td>
        <td>${r.totalMarks}</td>
        <td>${gradeDisplay}</td>
        <td>${r.meanPoints.toFixed(2)}</td>
      </tr>`;
  });

  tbody.innerHTML = html;
  scheduleIcons();
}

/**
 * Print rankings
 */
function printRankings() {
  window.print();
}

// ============================================================
// EXAM CLEARANCE
// ============================================================

/**
 * Load exam clearance table
 */
async function loadClearanceTable() {
  const examId = document.getElementById('clearance-filter-exam')?.value;
  const filterClass = document.getElementById('clearance-filter-class')?.value;

  if (!examId) return;

  const exam = await db.get('exams', examId);
  if (!exam) return;

  const threshold = await db.getSetting('clearanceThreshold') || 0;

  let students = await db.getAll('students');
  if (filterClass) students = students.filter(s => s.class === filterClass);
  students = students.filter(s => s.status === 'active' || !s.status);

  const tbody = document.getElementById('clearance-tbody');
  let html = '';

  for (const student of students) {
    const balance = await db.getStudentFeeBalance(student.id, exam.term, exam.year);
    const isCleared = balance.balance <= threshold;

    // Check for override
    const clearance = await db.getStudentExamClearance(student.id, examId);
    const hasOverride = clearance && clearance.clearanceOverride;
    const effectivelyCleared = isCleared || hasOverride;

    html += `
      <tr>
        <td>${escapeHtml(student.admissionNumber)}</td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td>${escapeHtml(student.class)}</td>
        <td class="${balance.balance > 0 ? 'balance-positive' : 'balance-zero'}">${formatKES(balance.balance)}</td>
        <td>
          ${effectivelyCleared
            ? '<span class="badge badge-active">Cleared</span>'
            : '<span class="badge badge-suspended">Not Cleared</span>'}
        </td>
        <td>
          ${hasOverride
            ? `<span style="color: var(--warning); font-size: 0.8rem;">Override: ${escapeHtml(clearance.overrideReason || '')}</span>`
            : '-'}
        </td>
        <td>
          <div class="action-btns">
            ${!isCleared && !hasOverride
              ? `<button class="btn btn-warning btn-sm" onclick="overrideClearance('${student.id}', '${examId}')">Override</button>`
              : ''}
            ${hasOverride
              ? `<button class="btn btn-outline btn-sm" onclick="removeOverride('${student.id}', '${examId}')">Remove Override</button>`
              : ''}
          </div>
        </td>
      </tr>`;
  }

  tbody.innerHTML = html || `
    <tr>
      <td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">${ic('check-circle','')}</div>
          <h3>Select an exam to check clearance</h3>
        </div>
      </td>
    </tr>`;
  scheduleIcons();
}

/**
 * Override exam clearance for a student
 */
async function overrideClearance(studentId, examId) {
  const pinVerified = await verifyPin();
  if (!pinVerified) return;

  showPrompt('Reason for clearance override:', 'e.g. Bursary pending', async (reason) => {
    if (!reason) { showToast('A reason is required for override', 'error'); return; }

    const clearance = {
      id: generateId(),
      studentId,
      examId,
      isCleared: true,
      clearanceOverride: true,
      overrideReason: reason,
      authorizedBy: 'Current User',
      authorizedAt: new Date().toISOString()
    };

    try {
      // Check if record exists
      const existing = await db.getOneByIndex('examClearance', 'studentExam', [studentId, examId]);
      if (existing) {
        clearance.id = existing.id;
        await db.put('examClearance', clearance);
      } else {
        await db.add('examClearance', clearance);
      }
      showToast('Clearance override applied', 'success');
      loadClearanceTable();
    } catch (err) {
      showToast('Error applying override: ' + err.message, 'error');
    }
  });
}

/**
 * Remove clearance override
 */
async function removeOverride(studentId, examId) {
  showConfirm('Remove this clearance override?', async () => {
    try {
      const existing = await db.getOneByIndex('examClearance', 'studentExam', [studentId, examId]);
      if (existing) {
        await db.delete('examClearance', existing.id);
        showToast('Override removed', 'success');
        loadClearanceTable();
      }
    } catch (err) {
      showToast('Error removing override: ' + err.message, 'error');
    }
  });
}

/**
 * Open bulk clearance dialog
 */
async function openBulkClearance() {
  const examId = document.getElementById('clearance-filter-exam')?.value;
  if (!examId) { showToast('Please select an exam first', 'error'); return; }

  const exam = await db.get('exams', examId);
  if (!exam) return;

  showConfirm(`Auto-clear all students with zero balance for ${exam.name}?`, async () => {
    const threshold = await db.getSetting('clearanceThreshold') || 0;
    const students = await db.getAll('students');
    let cleared = 0;

    for (const student of students) {
      if (student.status !== 'active' && student.status) continue;
      if (student.class !== exam.class) continue;

      const balance = await db.getStudentFeeBalance(student.id, exam.term, exam.year);
      if (balance.balance <= threshold) {
        const existing = await db.getOneByIndex('examClearance', 'studentExam', [student.id, examId]);
        if (!existing) {
          await db.add('examClearance', {
            id: generateId(),
            studentId: student.id,
            examId,
            isCleared: true,
            clearanceOverride: false,
            overrideReason: 'Auto-cleared (balance within threshold)',
            authorizedBy: 'System',
            authorizedAt: new Date().toISOString()
          });
          cleared++;
        }
      }
    }

    showToast(`${cleared} student${cleared !== 1 ? 's' : ''} auto-cleared`, 'success');
    loadClearanceTable();
  });
}

// ============================================================
// ACADEMICS TAB SWITCHING
// ============================================================

let _academicsTabsInitialized = false;

function initAcademicsTabs() {
  if (_academicsTabsInitialized) return;
  _academicsTabsInitialized = true;

  const tabGroup = document.getElementById('academics-tabs');
  if (!tabGroup) return;

  tabGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    const tabId = btn.dataset.tab;
    if (!tabId) return;

    e.stopPropagation();

    tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('#page-academics .tab-content').forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');

    SoundManager.play('click');

    switch (tabId) {
      case 'acad-exams': loadExamsList(); populateExamSelects(); break;
      case 'acad-scores': loadScoresTable(); break;
      case 'acad-subjects': loadSubjectsList(); break;
      case 'acad-rankings': loadRankingsTable(); break;
      case 'acad-clearance': loadClearanceTable(); break;
    }
  });
}

// Also use global delegated handler as a safety net (works even if DOMContentLoaded already fired)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#academics-tabs .tab-btn');
  if (!btn) return;

  const tabId = btn.dataset.tab;
  if (!tabId) return;

  const tabGroup = document.getElementById('academics-tabs');
  tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('#page-academics .tab-content').forEach(tc => tc.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');

  SoundManager.play('click');

  switch (tabId) {
    case 'acad-exams': loadExamsList(); populateExamSelects(); break;
    case 'acad-scores': loadScoresTable(); break;
    case 'acad-subjects': loadSubjectsList(); break;
    case 'acad-rankings': loadRankingsTable(); break;
    case 'acad-clearance': loadClearanceTable(); break;
  }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initAcademicsTabs();

  // Subject filter
  const subjectFilter = document.getElementById('subject-filter-group');
  if (subjectFilter) subjectFilter.addEventListener('change', loadSubjectsList);

  // Exam filters
  const examFilterTerm = document.getElementById('exam-filter-term');
  if (examFilterTerm) examFilterTerm.addEventListener('change', loadExamsList);

  // Score entry - load grid when exam or class changes
  const scoreEntryExam = document.getElementById('score-entry-exam');
  const scoreEntryClass = document.getElementById('score-entry-class');
  if (scoreEntryExam) scoreEntryExam.addEventListener('change', loadScoreEntryGrid);
  if (scoreEntryClass) scoreEntryClass.addEventListener('change', loadScoreEntryGrid);

  // Score view filters
  const scoreFilterExam = document.getElementById('score-filter-exam');
  const scoreFilterClass = document.getElementById('score-filter-class');
  if (scoreFilterExam) scoreFilterExam.addEventListener('change', loadScoresTable);
  if (scoreFilterClass) scoreFilterClass.addEventListener('change', loadScoresTable);

  // Ranking filters
  const rankFilterExam = document.getElementById('rank-filter-exam');
  const rankFilterClass = document.getElementById('rank-filter-class');
  const rankFilterStream = document.getElementById('rank-filter-stream');
  if (rankFilterExam) rankFilterExam.addEventListener('change', loadRankingsTable);
  if (rankFilterClass) rankFilterClass.addEventListener('change', async () => {
    // Populate stream filter based on selected class
    if (rankFilterStream) {
      const classes = await db.getSetting('classes') || [];
      const classObj = rankFilterClass.value ? classes.find(c => c.name === rankFilterClass.value) : null;
      const streamNames = classObj ? getStreamNames(classObj) : [];
      rankFilterStream.innerHTML = '<option value="">All Streams</option>';
      for (const name of streamNames) {
        rankFilterStream.innerHTML += `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
      }
    }
    loadRankingsTable();
  });
  if (rankFilterStream) rankFilterStream.addEventListener('change', loadRankingsTable);

  // Clearance filters
  const clearanceExam = document.getElementById('clearance-filter-exam');
  const clearanceClass = document.getElementById('clearance-filter-class');
  if (clearanceExam) clearanceExam.addEventListener('change', loadClearanceTable);
  if (clearanceClass) clearanceClass.addEventListener('change', loadClearanceTable);
});
