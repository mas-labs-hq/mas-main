/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-students.js - Student Management Module
 * Powered By MortApps Studios
 */

// ============================================================
// STUDENT CRUD
// ============================================================

/**
 * Open student form (add or edit)
 */
async function openStudentForm(studentId) {
  // Demo cap only blocks ADDING new students, not editing existing ones
  if (SV.IS_DEMO && !studentId) {
    const students = await db.getAll('students');
    if (students.length >= SV.DEMO_MAX_STUDENTS) {
      showToast(`Demo version is limited to ${SV.DEMO_MAX_STUDENTS} students. Upgrade to Premium for unlimited students.`, 'warning');
      return;
    }
  }

  const modal = document.getElementById('student-modal');
  const title = document.getElementById('student-modal-title');

  if (studentId) {
    title.textContent = 'Edit Student';
    loadStudentIntoForm(studentId);
  } else {
    title.textContent = 'Add Student';
    clearStudentForm();
  }

  populateStudentClassSelects();
  modal.classList.add('active');
  SoundManager.play('notify');
}

/**
 * Clear student form
 */
function clearStudentForm() {
  document.getElementById('student-edit-id').value = '';
  document.getElementById('student-adm').value = '';
  document.getElementById('student-fname').value = '';
  document.getElementById('student-lname').value = '';
  document.getElementById('student-gender').value = '';
  document.getElementById('student-class').value = '';
  document.getElementById('student-stream').value = '';
  document.getElementById('student-type').value = 'boarder';
  getActiveCurriculum().then(c => { document.getElementById('student-curriculum').value = c; });
  document.getElementById('student-guardian').value = '';
  document.getElementById('student-phone').value = '';
  document.getElementById('student-status').value = 'active';
}

/**
 * Load student data into form for editing
 */
async function loadStudentIntoForm(studentId) {
  const student = await db.get('students', studentId);
  if (!student) return;

  document.getElementById('student-edit-id').value = student.id;
  document.getElementById('student-adm').value = student.admissionNumber || '';
  document.getElementById('student-fname').value = student.firstName || '';
  document.getElementById('student-lname').value = student.lastName || '';
  document.getElementById('student-gender').value = student.gender || '';
  document.getElementById('student-class').value = student.class || '';
  document.getElementById('student-stream').value = student.stream || '';
  document.getElementById('student-type').value = student.type || 'boarder';
  document.getElementById('student-curriculum').value = student.curriculum || (await getActiveCurriculum());
  document.getElementById('student-guardian').value = student.guardianName || '';
  document.getElementById('student-phone').value = student.guardianPhone || '';
  document.getElementById('student-status').value = student.status || 'active';

  // Trigger stream update
  updateStreamSelect();
}

/**
 * Save student (add or update)
 */
async function saveStudent() {
  const editId = document.getElementById('student-edit-id').value;
  const admNo = document.getElementById('student-adm').value.trim();
  const firstName = document.getElementById('student-fname').value.trim();
  const lastName = document.getElementById('student-lname').value.trim();
  const gender = document.getElementById('student-gender').value;
  const cls = document.getElementById('student-class').value;
  const stream = document.getElementById('student-stream').value;
  const type = document.getElementById('student-type').value;
  const curriculum = document.getElementById('student-curriculum').value;
  const guardianName = document.getElementById('student-guardian').value.trim();
  const guardianPhone = document.getElementById('student-phone').value.trim();
  const status = document.getElementById('student-status').value;

  // Validation
  if (!admNo) { showToast('Admission number is required', 'error'); return; }
  if (!firstName) { showToast('First name is required', 'error'); return; }
  if (!lastName) { showToast('Last name is required', 'error'); return; }
  if (!cls) { showToast('Class is required', 'error'); return; }
  if (!stream) { showToast('Stream is required', 'error'); return; }

  // Check for duplicate admission number
  const existingStudent = await db.getOneByIndex('students', 'admissionNumber', admNo);
  if (existingStudent && existingStudent.id !== editId) {
    showToast('A student with this admission number already exists', 'error');
    return;
  }

  const student = {
    id: editId || generateId(),
    admissionNumber: admNo,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    gender,
    class: cls,
    stream,
    type,
    curriculum,
    guardianName,
    guardianPhone,
    status,
    subjectCombination: [],
    streamSortOrder: 0,
    dateAdded: editId ? undefined : new Date().toISOString(),
    dateModified: new Date().toISOString()
  };

  // If editing, preserve existing fields
  if (editId) {
    const existing = await db.get('students', editId);
    if (existing) {
      student.dateAdded = existing.dateAdded;
      student.subjectCombination = existing.subjectCombination || [];
      student.streamSortOrder = existing.streamSortOrder || 0;
    }
  }

  try {
    await db.put('students', student);
    closeModal('student-modal');
    showToast(editId ? 'Student updated successfully' : 'Student added successfully', 'success');
    loadStudentsList();
  } catch (err) {
    console.error('Error saving student:', err);
    showToast('Error saving student: ' + err.message, 'error');
  }
}

/**
 * Delete a student
 */
async function deleteStudent(studentId) {
  showConfirm('Are you sure you want to delete this student? This action cannot be undone.', async () => {
    try {
      await db.delete('students', studentId);
      showToast('Student deleted', 'success');
      loadStudentsList();
    } catch (err) {
      showToast('Error deleting student: ' + err.message, 'error');
    }
  });
}

// ============================================================
// STUDENT LIST
// ============================================================

/**
 * Load and display students list
 */
async function loadStudentsList() {
  const tbody = document.getElementById('students-tbody');
  const countEl = document.getElementById('students-count');

  let students = await db.getAll('students');

  // Apply filters
  const searchTerm = document.getElementById('student-search')?.value?.toLowerCase() || '';
  const filterClass = document.getElementById('student-filter-class')?.value || '';
  const filterStream = document.getElementById('student-filter-stream')?.value || '';
  const filterStatus = document.getElementById('student-filter-status')?.value || '';

  if (searchTerm) {
    students = students.filter(s =>
      (s.name || '').toLowerCase().includes(searchTerm) ||
      (s.admissionNumber || '').toLowerCase().includes(searchTerm) ||
      (s.guardianName || '').toLowerCase().includes(searchTerm)
    );
  }

  if (filterClass) {
    students = students.filter(s => s.class === filterClass);
  }

  if (filterStream) {
    students = students.filter(s => s.stream === filterStream);
  }

  if (filterStatus) {
    students = students.filter(s => s.status === filterStatus);
  }

  // Sort by class, stream, then name
  students.sort((a, b) => {
    if (a.class !== b.class) return (a.class || '').localeCompare(b.class || '');
    if (a.stream !== b.stream) return (a.stream || '').localeCompare(b.stream || '');
    return (a.name || '').localeCompare(b.name || '');
  });

  // Get the learner label
  const labelSingular = (await learnerLabel()).toLowerCase();
  const labelPlural = (await learnerLabelPlural()).toLowerCase();

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            <div class="empty-icon">${ic('users','')}</div>
            <h3>No ${labelPlural} found</h3>
            <p>Add your first ${labelSingular} or adjust your filters</p>
          </div>
        </td>
      </tr>`;
    countEl.textContent = `0 ${labelPlural}`;
    scheduleIcons();
    return;
  }

  // Build rows with balance info
  let html = '';
  for (const s of students) {
    const balance = await db.getStudentFeeBalance(s.id);
    const balanceClass = balance.balance > 0 ? 'balance-positive' : 'balance-zero';

    html += `
      <tr>
        <td><input type="checkbox" class="student-row-checkbox" data-student-id="${s.id}" onchange="updateBulkActions()"></td>
        <td>${escapeHtml(s.admissionNumber)}</td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>${escapeHtml(s.class)}</td>
        <td>${escapeHtml(s.stream)}</td>
        <td><span class="badge badge-${s.type}">${s.type === 'boarder' ? 'Boarder' : 'Day'}</span></td>
        <td>${s.gender ? (s.gender === 'male' ? 'Male' : 'Female') : '-'}</td>
        <td><span class="badge badge-${s.status || 'active'}">${(s.status || 'active').charAt(0).toUpperCase() + (s.status || 'active').slice(1)}</span></td>
        <td class="${balanceClass}">${formatKES(balance.balance)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="Edit" onclick="openStudentForm('${s.id}')">${ic('pencil','')}</button>
            <button class="btn-icon" title="View Statement" onclick="viewStudentStatement('${s.id}')">${ic('eye','')}</button>
            <button class="btn-icon" title="WhatsApp Receipt" onclick="sendWhatsAppReceipt('${s.id}')">${ic('message-circle','')}</button>
            <button class="btn-icon" title="Delete" onclick="deleteStudent('${s.id}')">${ic('trash-2','')}</button>
          </div>
        </td>
      </tr>`;
  }

  tbody.innerHTML = html;
  countEl.textContent = `${students.length} ${labelSingular}${students.length !== 1 ? 's' : ''}`;
  updateBulkActions();
  scheduleIcons();
}

// ============================================================
// STUDENT IMPORT/EXPORT
// ============================================================

/**
 * Export students to CSV
 */
async function exportStudents() {
  const students = await db.getAll('students');
  if (students.length === 0) {
    showToast('No students to export', 'warning');
    return;
  }

  const headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'Class', 'Stream', 'Type', 'Curriculum', 'Guardian Name', 'Guardian Phone', 'Status'];
  const rows = students.map(s => [
    s.admissionNumber, s.firstName, s.lastName, s.gender,
    s.class, s.stream, s.type, s.curriculum,
    s.guardianName, s.guardianPhone, s.status
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',') + '\n';
  });

  downloadFile(csv, 'students_export.csv', 'text/csv');
  showToast(`Exported ${students.length} students`, 'success');
}

/**
 * Import students from CSV
 */
async function importStudents() {
  // Demo: allow import but respect student cap
  if (SV.IS_DEMO) {
    const currentStudents = await db.getAll('students');
    if (currentStudents.length >= SV.DEMO_MAX_STUDENTS) {
      showToast(`Demo version is limited to ${SV.DEMO_MAX_STUDENTS} students. Upgrade to Premium for unlimited students.`, 'warning');
      return;
    }
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
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

      let imported = 0;
      let skipped = 0;
      let existingCount = 0;
      if (SV.IS_DEMO) {
        const currentStudents = await db.getAll('students');
        existingCount = currentStudents.length;
      }

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        // Demo cap check during import
        if (SV.IS_DEMO && (existingCount + imported) >= SV.DEMO_MAX_STUDENTS) {
          skipped += lines.length - i;
          break;
        }
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 7) { skipped++; continue; }

        const admNo = cols[0]?.trim();
        const firstName = cols[1]?.trim();
        const lastName = cols[2]?.trim();

        if (!admNo || !firstName || !lastName) { skipped++; continue; }

        // Check for duplicate
        const existing = await db.getOneByIndex('students', 'admissionNumber', admNo);
        if (existing) { skipped++; continue; }

        const student = {
          id: generateId(),
          admissionNumber: admNo,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          gender: cols[3]?.trim() || '',
          class: cols[4]?.trim() || '',
          stream: cols[5]?.trim() || '',
          type: cols[6]?.trim() || 'boarder',
          curriculum: cols[7]?.trim() || (await getActiveCurriculum()),
          guardianName: cols[8]?.trim() || '',
          guardianPhone: cols[9]?.trim() || '',
          status: cols[10]?.trim() || 'active',
          subjectCombination: [],
          streamSortOrder: 0,
          dateAdded: new Date().toISOString()
        };

        await db.add('students', student);
        imported++;
      }

      showToast(`Imported ${imported} students${skipped > 0 ? ` (${skipped} skipped)` : ''}`, 'success');
      loadStudentsList();
    } catch (err) {
      showToast('Error importing: ' + err.message, 'error');
    }
  };
  input.click();
}

/**
 * Simple CSV line parser (handles quoted fields)
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ============================================================
// STUDENT CLASS/STREAM MANAGEMENT
// ============================================================

/**
 * Populate class select dropdowns
 */
async function populateStudentClassSelects() {
  const classes = await db.getSetting('classes') || [];
  const classSelects = [
    document.getElementById('student-class'),
    document.getElementById('student-filter-class'),
    document.getElementById('payment-filter-class'), // for fees
    document.getElementById('fs-filter-class')
  ];

  classSelects.forEach(select => {
    if (!select) return;
    const isFilterSelect = select.id && select.id.includes('filter');
    const currentVal = select.value;
    select.innerHTML = isFilterSelect
      ? '<option value="">All Classes</option>'
      : '<option value="">Select Class</option>';
    classes.forEach(cls => {
      select.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) select.value = currentVal;
  });

  // Also populate exam class select and other class selects
  const examClassSelect = document.getElementById('exam-class');
  if (examClassSelect) {
    const currentVal = examClassSelect.value;
    examClassSelect.innerHTML = '<option value="">Select Class</option>';
    classes.forEach(cls => {
      examClassSelect.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) examClassSelect.value = currentVal;
  }

  // Fee structure class select
  const fsClassSelect = document.getElementById('fs-class');
  if (fsClassSelect) {
    const currentVal = fsClassSelect.value;
    fsClassSelect.innerHTML = '<option value="all">All Classes</option>';
    classes.forEach(cls => {
      fsClassSelect.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) fsClassSelect.value = currentVal;
  }

  // Defaulters class select
  const defClassSelect = document.getElementById('defaulter-filter-class');
  if (defClassSelect) {
    const currentVal = defClassSelect.value;
    defClassSelect.innerHTML = '<option value="">All Classes</option>';
    classes.forEach(cls => {
      defClassSelect.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) defClassSelect.value = currentVal;
  }

  // Rankings class select
  const rankClassSelect = document.getElementById('rank-filter-class');
  if (rankClassSelect) {
    const currentVal = rankClassSelect.value;
    rankClassSelect.innerHTML = '<option value="">All Classes</option>';
    classes.forEach(cls => {
      rankClassSelect.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) rankClassSelect.value = currentVal;
  }

  // Score entry class select
  const scoreClassSelect = document.getElementById('score-entry-class');
  if (scoreClassSelect) {
    const currentVal = scoreClassSelect.value;
    scoreClassSelect.innerHTML = '<option value="">Select Class</option>';
    classes.forEach(cls => {
      scoreClassSelect.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) scoreClassSelect.value = currentVal;
  }

  // Score filter class
  const scoreFilterClass = document.getElementById('score-filter-class');
  if (scoreFilterClass) {
    const currentVal = scoreFilterClass.value;
    scoreFilterClass.innerHTML = '<option value="">All Classes</option>';
    classes.forEach(cls => {
      scoreFilterClass.innerHTML += `<option value="${escapeHtml(cls.name)}">${escapeHtml(cls.name)}</option>`;
    });
    if (currentVal) scoreFilterClass.value = currentVal;
  }
}

/**
 * Update stream select based on selected class
 */
async function updateStreamSelect() {
  const classSelect = document.getElementById('student-class');
  const streamSelect = document.getElementById('student-stream');
  if (!classSelect || !streamSelect) return;

  const selectedClass = classSelect.value;
  const classes = await db.getSetting('classes') || [];
  const classObj = classes.find(c => c.name === selectedClass);

  const streamNames = classObj ? getStreamNames(classObj) : ['A'];

  const currentVal = streamSelect.value;
  streamSelect.innerHTML = '';
  for (const name of streamNames) {
    streamSelect.innerHTML += `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
  }
  if (currentVal && streamSelect.querySelector(`option[value="${CSS.escape(currentVal)}"]`)) {
    streamSelect.value = currentVal;
  }

  // Also update filter stream select
  updateFilterStreamSelect(selectedClass);
}

/**
 * Update filter stream select
 */
async function updateFilterStreamSelect(className) {
  const streamFilter = document.getElementById('student-filter-stream');
  if (!streamFilter) return;

  const classes = await db.getSetting('classes') || [];
  const classObj = className ? classes.find(c => c.name === className) : null;

  // If no class selected, collect all stream names from all classes
  let streamNames;
  if (classObj) {
    streamNames = getStreamNames(classObj);
  } else {
    const allNames = new Set();
    for (const cls of classes) {
      getStreamNames(cls).forEach(n => allNames.add(n));
    }
    streamNames = Array.from(allNames).sort();
  }

  const currentVal = streamFilter.value;
  streamFilter.innerHTML = '<option value="">All Streams</option>';
  for (const name of streamNames) {
    streamFilter.innerHTML += `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
  }
  if (currentVal && streamFilter.querySelector(`option[value="${CSS.escape(currentVal)}"]`)) {
    streamFilter.value = currentVal;
  }
}

/**
 * View student fee statement (navigate to reports)
 */
function viewStudentStatement(studentId) {
  window._pendingReport = { type: 'statement', studentId };
  navigateTo('reports');
  setTimeout(() => generateReport('statement', studentId), 300);
}

/**
 * Send WhatsApp receipt link for student's last payment
 */
async function sendWhatsAppReceipt(studentId) {
  const payments = await db.getByIndex('feePayments', 'studentId', studentId);
  const validPayments = payments.filter(p => !p.voided).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (validPayments.length === 0) {
    showToast('No payments found for this student', 'warning');
    return;
  }

  const student = await db.get('students', studentId);
  const lastPayment = validPayments[0];
  const schoolName = await db.getSetting('schoolName') || 'School';

  // Calculate fee balance for status
  const balance = await db.getStudentFeeBalance(studentId);
  const feeStatus = balance.balance <= 0
    ? 'Fees Cleared'
    : `Balance Outstanding: ${formatKES(balance.balance)}`;

  const methodLabel = SV.PAYMENT_METHODS.find(m => m.value === lastPayment.method)?.label || lastPayment.method.toUpperCase();

  const message = `*${schoolName} - Fee Receipt*\n\n` +
    `Student: ${student.name}\n` +
    `Adm No: ${student.admissionNumber}\n\n` +
    `Last Payment Details:\n` +
    `Receipt #: ${lastPayment.receiptNo}\n` +
    `Amount: ${formatKES(lastPayment.amount)}\n` +
    `Date: ${formatDate(lastPayment.date)}\n` +
    `Method: ${methodLabel}\n` +
    `Term: ${getTermLabel(lastPayment.term, lastPayment.year)}\n\n` +
    `FEE BALANCE STATUS: ${feeStatus}\n\n` +
    `Powered By MortApps Studios`;

  const encoded = encodeURIComponent(message);

  // Format phone number: strip all non-digit chars, ensure starts with 254
  let phone = (student.guardianPhone || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '254' + phone.substring(1);
  if (phone.startsWith('7') || phone.startsWith('1')) phone = '254' + phone;

  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

  window.location.href = url;
}

// ============================================================
// BULK RECEIPTS
// ============================================================

/**
 * Update bulk action buttons based on checkbox state
 */
function updateBulkActions() {
  const checkboxes = document.querySelectorAll('.student-row-checkbox');
  const checked = document.querySelectorAll('.student-row-checkbox:checked');
  const selectAllCb = document.getElementById('select-all-students');
  const bulkBtn = document.getElementById('bulk-receipts-btn');
  const countSpan = document.getElementById('bulk-selected-count');

  if (selectAllCb && checkboxes.length > 0) {
    selectAllCb.checked = checked.length === checkboxes.length;
  }

  if (bulkBtn) bulkBtn.disabled = checked.length === 0;
  if (countSpan) countSpan.textContent = checked.length > 0 ? `${checked.length} selected` : '';
}

/**
 * Toggle all student checkboxes
 */
function toggleAllStudents() {
  const selectAllCb = document.getElementById('select-all-students');
  const checkboxes = document.querySelectorAll('.student-row-checkbox');
  const isChecked = selectAllCb ? selectAllCb.checked : false;
  checkboxes.forEach(cb => { cb.checked = isChecked; });
  updateBulkActions();
}

/**
 * Generate bulk receipts PDF for all selected students
 */
async function generateBulkReceipts() {
  const checked = document.querySelectorAll('.student-row-checkbox:checked');
  if (checked.length === 0) {
    showToast('No students selected', 'warning');
    return;
  }

  const loaded = await ensureJsPDF();
  if (!loaded) { showToast('PDF library failed to load', 'error'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const schoolName = await db.getSetting('schoolName') || 'School';
  const header = await getSchoolHeader();
  let firstPage = true;

  for (const cb of checked) {
    const studentId = cb.dataset.studentId;
    const student = await db.get('students', studentId);
    if (!student) continue;

    const payments = await db.getByIndex('feePayments', 'studentId', studentId);
    const validPayments = payments.filter(p => !p.voided).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (validPayments.length === 0) continue;

    const lastPayment = validPayments[0];

    if (!firstPage) {
      doc.addPage();
    }
    firstPage = false;

    let y = await addSchoolHeader(doc);

    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FEE RECEIPT', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const methodLabel = SV.PAYMENT_METHODS.find(m => m.value === lastPayment.method)?.label || lastPayment.method.toUpperCase();
    const receiptRows = [
      ['Receipt No:', String(lastPayment.receiptNo)],
      ['Student Name:', student.name],
      ['Admission No:', student.admissionNumber],
      ['Class:', `${student.class} ${student.stream}`],
      ['Amount Paid:', formatKES(lastPayment.amount)],
      ['Payment Method:', methodLabel],
      ['Date Paid:', formatDate(lastPayment.date)],
      ['Term:', getTermLabel(lastPayment.term, lastPayment.year)],
      ['Paid By:', lastPayment.paidBy || 'N/A'],
      ['Received By:', lastPayment.receivedBy || 'N/A']
    ];

    if (lastPayment.method === 'mpesa' && lastPayment.mpesaRef) {
      receiptRows.push(['M-Pesa Ref:', lastPayment.mpesaRef]);
    }

    receiptRows.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(String(value), 80, y);
      y += 7;
    });

    y += 5;
    const balance = await db.getStudentFeeBalance(studentId);
    doc.setFont(undefined, 'bold');
    doc.text('Fee Balance:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(formatKES(balance.balance), 80, y);
    y += 7;

    if (balance.balance <= 0) {
      doc.setTextColor(16, 185, 129);
      doc.setFont(undefined, 'bold');
      doc.text('FEES CLEARED', 80, y);
      doc.setTextColor(0, 0, 0);
    }

    addPDFFooter(doc);
  }

  if (firstPage) {
    showToast('No payments found for selected students', 'warning');
    return;
  }

  doc.save(`Bulk_Receipts_${new Date().toISOString().split('T')[0]}.pdf`);
  showToast(`Generated receipts for ${checked.length} students`, 'success');
}

// ============================================================
// UTILITY
// ============================================================

/**
 * Download a file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Event listeners for student page
document.addEventListener('DOMContentLoaded', () => {
  const classSelect = document.getElementById('student-class');
  if (classSelect) {
    classSelect.addEventListener('change', updateStreamSelect);
  }

  const filterClass = document.getElementById('student-filter-class');
  if (filterClass) {
    filterClass.addEventListener('change', (e) => {
      updateFilterStreamSelect(e.target.value);
      loadStudentsList();
    });
  }

  // Search and filter listeners
  const searchInput = document.getElementById('student-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => loadStudentsList(), 300));
  }

  const filterStream = document.getElementById('student-filter-stream');
  if (filterStream) {
    filterStream.addEventListener('change', loadStudentsList);
  }

  const filterStatus = document.getElementById('student-filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', loadStudentsList);
  }
});
