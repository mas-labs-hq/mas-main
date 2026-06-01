/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-reports.js - PDF Report Generation Module
 * Powered By MortApps Studios
 */

const MORTAPPS_URL = 'https://mortappsstudios.com/';

// Note: jsPDF and autoTable are loaded via CDN in the HTML head
// We'll dynamically load them if not present

let jsPDFReady = false;

function addDemoWatermark(doc) {
  if (!SV.IS_DEMO) return;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.saveGraphicsState();
  doc.setFontSize(60);
  doc.setTextColor(200, 200, 200);
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  doc.text('DEMO', pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center' });
  doc.restoreGraphicsState();
}

/**
 * Sort students array based on the report sort dropdown
 */
async function sortStudentsForReport(students) {
  const sortSelect = document.getElementById('report-sort-select');
  const sortBy = sortSelect?.value || 'alpha';

  switch (sortBy) {
    case 'alpha':
      students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'admission':
      students.sort((a, b) => (a.admissionNumber || '').localeCompare(b.admissionNumber || ''));
      break;
    case 'dateAdmitted':
      students.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
      break;
    case 'classStream':
      students.sort((a, b) => {
        if (a.class !== b.class) return (a.class || '').localeCompare(b.class || '');
        if (a.stream !== b.stream) return (a.stream || '').localeCompare(b.stream || '');
        return (a.name || '').localeCompare(b.name || '');
      });
      break;
    case 'feeBalance':
      // Sort by balance descending (need to fetch balances)
      const balances = new Map();
      for (const s of students) {
        try {
          const bal = await db.getStudentFeeBalance(s.id);
          balances.set(s.id, bal.balance);
        } catch (e) {
          balances.set(s.id, 0);
        }
      }
      students.sort((a, b) => (balances.get(b.id) || 0) - (balances.get(a.id) || 0));
      break;
    default:
      students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
  return students;
}

async function ensureJsPDF() {
  if (jsPDFReady && window.jspdf) return true;

  return new Promise((resolve) => {
    // Load jsPDF
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => {
      // Load autoTable plugin
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
      script2.onload = () => {
        jsPDFReady = true;
        resolve(true);
      };
      script2.onerror = () => {
        console.error('Failed to load jsPDF-autotable');
        resolve(false);
      };
      document.head.appendChild(script2);
    };
    script1.onerror = () => {
      console.error('Failed to load jsPDF');
      resolve(false);
    };
    document.head.appendChild(script1);
  });
}

/**
 * Compute student position in stream and form for a given set of exams
 * @param {Object} student - The student object
 * @param {Array} exams - Exams to consider
 * @param {string} curriculum - '844' or 'cbc'
 * @param {Array} subjects - Active subjects
 * @returns {Object} { positionInStream, positionInForm, totalStudents }
 */
async function computeStudentPosition(student, exams, curriculum, subjects) {
  if (!exams || exams.length === 0) return { positionInStream: '-', positionInForm: '-', totalInStream: 0, totalInForm: 0 };

  const allStudents = await db.getAll('students');
  const classes = await db.getSetting('classes') || [];
  const classStudents = allStudents.filter(s => (s.status === 'active' || !s.status) && s.class === student.class);

  const ranked = [];
  for (const s of classStudents) {
    let totalMarks = 0;
    let meanPoints = 0;

    for (const exam of exams) {
      const scores = await db.getByIndex('scores', 'examId', exam.id);
      const studentScores = scores.filter(sc => sc.studentId === s.id);
      if (studentScores.length === 0) continue;

      totalMarks += studentScores.reduce((sum, sc) => sum + sc.rawScore, 0);

      if (curriculum === 'cbc') {
        const rubricScores = studentScores.filter(sc => sc.rubricLevel).map(sc => ({ subjectId: sc.subjectId, rubricLevel: sc.rubricLevel }));
        if (rubricScores.length > 0) {
          const cbcResult = computeCBCCompetency(rubricScores);
          meanPoints += cbcResult.averagePoints;
        }
      } else {
        const scoreObjects = studentScores.map(sc => ({ subjectId: sc.subjectId, rawScore: sc.rawScore, maxScore: sc.maxScore }));
        if (scoreObjects.length > 0) {
          const kcseResult = computeKCSEMeanGrade(scoreObjects, subjects);
          meanPoints += kcseResult.meanPoints;
        }
      }
    }

    if (totalMarks > 0 || meanPoints > 0) {
      ranked.push({ student: s, meanPoints, totalMarks });
    }
  }

  ranked.sort((a, b) => b.meanPoints - a.meanPoints || b.totalMarks - a.totalMarks);
  ranked.forEach((r, i) => r.positionInForm = i + 1);

  const streamGroups = {};
  ranked.forEach(r => {
    let stream = r.student.stream;
    if (!stream) {
      const classObj = classes.find(c => c.name === r.student.class);
      const names = classObj ? getStreamNames(classObj) : ['A'];
      stream = names[0];
    }
    if (!streamGroups[stream]) streamGroups[stream] = [];
    streamGroups[stream].push(r);
  });

  Object.values(streamGroups).forEach(group => {
    group.sort((a, b) => b.meanPoints - a.meanPoints || b.totalMarks - a.totalMarks);
    group.forEach((r, i) => r.positionInStream = i + 1);
  });

  const studentRank = ranked.find(r => r.student.id === student.id);
  if (!studentRank) return { positionInStream: '-', positionInForm: '-', totalInStream: 0, totalInForm: ranked.length };

  const studentStream = student.stream || (function() {
    const classObj = classes.find(c => c.name === student.class);
    return classObj ? getStreamNames(classObj)[0] : 'A';
  })();
  const streamCount = streamGroups[studentStream]?.length || 0;
  return {
    positionInStream: ordinalSuffix(studentRank.positionInStream),
    positionInForm: ordinalSuffix(studentRank.positionInForm),
    totalInStream: streamCount,
    totalInForm: ranked.length
  };
}

/**
 * Get school header for PDF
 */
async function getSchoolHeader() {
  const schoolName = await db.getSetting('schoolName') || 'School Name';
  const motto = await db.getSetting('motto') || '';
  const county = await db.getSetting('county') || '';
  const subCounty = await db.getSetting('subCounty') || '';
  const logo = await db.getSetting('logo') || '';

  return { schoolName, motto, county, subCounty, logo };
}

/**
 * Add school header to PDF
 */
async function addSchoolHeader(doc, y = 15) {
  const header = await getSchoolHeader();

  // Add logo if present
  if (header.logo) {
    try {
      doc.addImage(header.logo, 'PNG', 14, y, 20, 20);
      // Offset text to the right of logo
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(header.schoolName, 40, y + 8);
      if (header.motto) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.text(`"${header.motto}"`, 40, y + 15);
      }
      if (header.county) {
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`${header.county}${header.subCounty ? ' - ' + header.subCounty : ''}`, 40, y + 21);
      }
      return y + 28;
    } catch (e) {
      console.warn('Error adding logo to PDF:', e);
    }
  }

  // No logo - center the header
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(header.schoolName, pageWidth / 2, y + 8, { align: 'center' });

  if (header.motto) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.text(`"${header.motto}"`, pageWidth / 2, y + 15, { align: 'center' });
  }

  if (header.county) {
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`${header.county}${header.subCounty ? ' - ' + header.subCounty : ''}`, pageWidth / 2, y + 21, { align: 'center' });
  }

  return y + 28;
}

/**
 * Add footer to PDF
 */
function addPDFFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.internal.getNumberOfPages();
  const mortAppsText = 'Powered By MortApps Studios';
  const mortAppsUrl = MORTAPPS_URL;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(128, 128, 128);
    // Make MortApps text a clickable link
    const textWidth = doc.getTextWidth(mortAppsText);
    const textX = (pageWidth / 2) - (textWidth / 2);
    const textY = pageHeight - 10;
    doc.textWithLink(mortAppsText, textX, textY, { url: mortAppsUrl });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    doc.text(`Generated on ${new Date().toLocaleDateString('en-KE')}`, 14, pageHeight - 10);
    doc.setTextColor(0, 0, 0);
  }
}

// ============================================================
// REPORT GENERATION ROUTER
// ============================================================

/**
 * Generate a report
 */
async function generateReport(type, preselectedId, paymentId) {
  const loaded = await ensureJsPDF();
  if (!loaded) {
    showToast('PDF library failed to load. Check your internet connection.', 'error');
    return;
  }

  switch (type) {
    case 'receipt':
      await generateReceipt(paymentId);
      break;
    case 'statement':
      await generateFeeStatement(preselectedId);
      break;
    case 'defaulters':
      await generateDefaultersPDF();
      break;
    case 'reportcard':
      if (SV.IS_DEMO) { showProLockPopup(); return; }
      await generateReportCard(preselectedId);
      break;
    case 'meritlist':
      if (SV.IS_DEMO) { showProLockPopup(); return; }
      await generateMeritList();
      break;
    case 'classlist':
      await generateClassList();
      break;
  }
}

// ============================================================
// FEE RECEIPT
// ============================================================

async function generateReceipt(paymentId) {
  if (!paymentId) {
    // Show selection dialog
    const payments = await db.getAll('feePayments');
    const validPayments = payments.filter(p => !p.voided);

    if (validPayments.length === 0) {
      showToast('No valid payments to generate receipts for', 'warning');
      return;
    }

    // Resolve student names and sort alphabetically by student name
    const paymentOptions = await Promise.all(validPayments.map(async p => {
      const student = await db.get('students', p.studentId);
      const studentName = student ? student.name : 'Unknown';
      return { payment: p, studentName };
    }));
    paymentOptions.sort((a, b) => a.studentName.localeCompare(b.studentName));

    const body = document.getElementById('report-options-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Select Payment</label>
        <select id="report-receipt-select">
          ${paymentOptions.slice(0, 100).map(({ payment: p, studentName }) =>
            `<option value="${p.id}">${escapeHtml(studentName)} - Receipt #${p.receiptNo} - ${formatKES(p.amount)}</option>`
          ).join('')}
        </select>
      </div>`;

    document.getElementById('report-options-title').textContent = 'Generate Fee Receipt';
    document.getElementById('report-generate-btn').onclick = async () => {
      const selectedId = document.getElementById('report-receipt-select').value;
      closeModal('report-options-modal');
      if (selectedId) await generateReceipt(selectedId);
    };
    document.getElementById('report-options-modal').classList.add('active');
    return;
  }

  const payment = await db.get('feePayments', paymentId);
  if (!payment) { showToast('Payment not found', 'error'); return; }

  const student = await db.get('students', payment.studentId);
  const header = await getSchoolHeader();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  let y = await addSchoolHeader(doc);

  // Divider
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  // Receipt title
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('FEE PAYMENT RECEIPT', 105, y + 5, { align: 'center' });
  y += 12;

  // Receipt details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  const leftCol = [
    ['Receipt No:', payment.receiptNo],
    ['Date:', formatDate(payment.date)],
    ['Student Name:', student ? student.name : 'Unknown'],
    ['Admission No:', student ? student.admissionNumber : ''],
    ['Class:', student ? `${student.class} ${student.stream}` : ''],
    ['Student Type:', student ? (student.type === 'boarder' ? 'Boarder' : 'Day Scholar') : '']
  ];

  const rightCol = [
    ['Amount Paid:', formatKES(payment.amount)],
    ['Payment Method:', SV.PAYMENT_METHODS.find(m => m.value === payment.method)?.label || payment.method],
    ['M-Pesa Ref:', payment.mpesaRef || '-'],
    ['Paid By:', payment.paidBy || '-'],
    ['Received By:', payment.receivedBy || '-'],
    ['Term:', `Term ${payment.term} ${payment.year}`]
  ];

  leftCol.forEach((row, i) => {
    doc.setFont(undefined, 'bold');
    doc.text(row[0], 14, y + (i * 7));
    doc.setFont(undefined, 'normal');
    doc.text(String(row[1]), 55, y + (i * 7));
  });

  rightCol.forEach((row, i) => {
    doc.setFont(undefined, 'bold');
    doc.text(row[0], 110, y + (i * 7));
    doc.setFont(undefined, 'normal');
    doc.text(String(row[1]), 150, y + (i * 7));
  });

  y += leftCol.length * 7 + 10;

  // Amount box
  doc.setFillColor(124, 58, 237, 0.1);
  doc.roundedRect(14, y, 182, 20, 3, 3, 'FD');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL AMOUNT PAID', 105, y + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(formatKES(payment.amount), 105, y + 16, { align: 'center' });
  y += 28;

  // Running balance
  const balance = await db.getStudentFeeBalance(student.id, payment.term, payment.year);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`Running Balance for Term ${payment.term} ${payment.year}:`, 14, y);
  doc.setFont(undefined, 'normal');
  doc.text(formatKES(balance.balance), 110, y);
  y += 15;

  // Guardian line
  doc.setFontSize(9);
  doc.text('Guardian Signature: ________________________', 14, y);
  doc.text('Bursar Signature: ________________________', 110, y);
  y += 10;

  // Stamp area
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('[School Stamp]', 155, y + 15);

  // Footer
  addPDFFooter(doc);
  addDemoWatermark(doc);

  doc.save(`Receipt_${payment.receiptNo}_${student ? student.admissionNumber : 'unknown'}.pdf`);
  showToast('Receipt generated', 'success');
}

// ============================================================
// FEE STATEMENT
// ============================================================

async function generateFeeStatement(studentId) {
  if (!studentId) {
    // Show student selection
    const students = await db.getAll('students');
    const active = students.filter(s => s.status === 'active' || !s.status);

    if (active.length === 0) {
      showToast('No students found', 'warning');
      return;
    }

    await sortStudentsForReport(active);

    const body = document.getElementById('report-options-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Select Student</label>
        <select id="report-student-select">
          ${active.map(s =>
            `<option value="${s.id}">${escapeHtml(s.admissionNumber)} - ${escapeHtml(s.name)} (${escapeHtml(s.class)})</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Term</label>
          <select id="report-statement-term">
            <option value="">All Terms</option>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>
        <div class="form-group">
          <label>Year</label>
          <select id="report-statement-year">
            <option value="">All Years</option>
            ${SV.getYears().map(y => `<option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
      </div>`;

    document.getElementById('report-options-title').textContent = 'Generate Fee Statement';
    document.getElementById('report-generate-btn').onclick = async () => {
      const selStudentId = document.getElementById('report-student-select').value;
      closeModal('report-options-modal');
      if (selStudentId) await generateFeeStatement(selStudentId);
    };
    document.getElementById('report-options-modal').classList.add('active');
    return;
  }

  const student = await db.get('students', studentId);
  if (!student) { showToast('Student not found', 'error'); return; }

  const header = await getSchoolHeader();
  const currentTerm = getCurrentTerm();
  const currentYear = new Date().getFullYear();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = await addSchoolHeader(doc);

  // Divider
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  // Title
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('FEE STATEMENT', 105, y + 5, { align: 'center' });
  y += 12;

  // Student info
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${student.name}`, 14, y);
  doc.text(`Adm No: ${student.admissionNumber}`, 120, y);
  y += 6;
  doc.text(`Class: ${student.class} ${student.stream}`, 14, y);
  doc.text(`Type: ${student.type === 'boarder' ? 'Boarder' : 'Day Scholar'}`, 120, y);
  y += 10;

  // Get all data for this student
  const structures = await db.getStudentFeeStructures(studentId);
  const payments = (await db.getByIndex('feePayments', 'studentId', studentId)).filter(p => !p.voided);
  const bursaries = await db.getByIndex('bursaries', 'studentId', studentId);
  const adjustments = await db.getByIndex('feeAdjustments', 'studentId', studentId);

  // Build transaction table
  const transactions = [];

  structures.forEach(fs => {
    transactions.push({
      date: fs.dateCreated || '',
      description: `Fee Structure - Term ${fs.term} ${fs.year} (${fs.class === 'all' ? 'All' : fs.class})`,
      debit: fs.totalAmount,
      credit: 0,
      type: 'fee'
    });
  });

  payments.forEach(p => {
    const method = SV.PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method;
    transactions.push({
      date: p.date,
      description: `Payment - ${method}${p.mpesaRef ? ' (' + p.mpesaRef + ')' : ''} - Receipt #${p.receiptNo}`,
      debit: 0,
      credit: p.amount,
      type: 'payment'
    });
  });

  bursaries.forEach(b => {
    const source = SV.BURSARY_SOURCES.find(s => s.value === b.source)?.label || b.source;
    transactions.push({
      date: b.dateCreated || '',
      description: `Bursary - ${source}`,
      debit: 0,
      credit: b.amount,
      type: 'bursary'
    });
  });

  adjustments.forEach(a => {
    const adjType = SV.ADJUSTMENT_TYPES.find(t => t.value === a.type)?.label || a.type;
    transactions.push({
      date: a.dateCreated || '',
      description: `${adjType} - ${a.reason || 'No reason'}`,
      debit: a.amount < 0 ? 0 : Math.abs(a.amount),
      credit: a.amount < 0 ? Math.abs(a.amount) : 0,
      type: 'adjustment'
    });
  });

  // Sort by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build table data
  const tableBody = [];
  let runningBalance = 0;

  transactions.forEach(t => {
    runningBalance += t.debit - t.credit;
    tableBody.push([
      formatDate(t.date),
      t.description,
      t.debit > 0 ? formatKES(t.debit) : '',
      t.credit > 0 ? formatKES(t.credit) : '',
      formatKES(Math.abs(runningBalance))
    ]);
  });

  // Total row
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  const finalBalance = totalDebit - totalCredit;

  doc.autoTable({
    startY: y,
    head: [['Date', 'Description', 'Debit (KES)', 'Credit (KES)', 'Balance (KES)']],
    body: tableBody,
    foot: [['', 'TOTAL', formatKES(totalDebit), formatKES(totalCredit), formatKES(Math.abs(finalBalance))]],
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: 255,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 72 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 }
    },
    margin: { left: 14 }
  });

  // Balance summary
  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  const balanceText = finalBalance > 0
    ? `BALANCE DUE: ${formatKES(finalBalance)}`
    : finalBalance < 0
      ? `OVERPAYMENT: ${formatKES(Math.abs(finalBalance))}`
      : 'ACCOUNT FULLY CLEARED';

  const balanceColor = finalBalance > 0 ? [239, 68, 68] : finalBalance < 0 ? [16, 185, 129] : [16, 185, 129];
  doc.setTextColor(...balanceColor);
  doc.text(balanceText, 105, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Footer
  addPDFFooter(doc);
  addDemoWatermark(doc);

  doc.save(`FeeStatement_${student.admissionNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
  showToast('Fee statement generated', 'success');
}

// ============================================================
// DEFAULTERS REPORT PDF
// ============================================================

async function generateDefaultersPDF() {
  const term = getCurrentTerm();
  const year = new Date().getFullYear();
  const defaulters = await db.getDefaulters(term, year);

  if (defaulters.length === 0) {
    showToast('No defaulters found for current term', 'success');
    return;
  }

  const header = await getSchoolHeader();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = await addSchoolHeader(doc);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('FEE DEFAULTERS REPORT', 105, y + 5, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Term ${term} ${year}`, 105, y + 12, { align: 'center' });
  y += 18;

  const tableBody = defaulters.map((d, i) => [
    i + 1,
    d.student.admissionNumber,
    d.student.name,
    `${d.student.class} ${d.student.stream}`,
    d.student.type === 'boarder' ? 'Boarder' : 'Day',
    formatKES(d.totalFees),
    formatKES(d.totalPayments + d.totalBursaries + d.totalAdjustments),
    formatKES(d.balance)
  ]);

  const totalOutstanding = defaulters.reduce((sum, d) => sum + d.balance, 0);

  doc.autoTable({
    startY: y,
    head: [['#', 'Adm No', 'Name', 'Class', 'Type', 'Billed', 'Paid', 'Balance']],
    body: tableBody,
    foot: [['', '', '', '', '', '', 'TOTAL', formatKES(totalOutstanding)]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 45 },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    },
    margin: { left: 14 }
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Defaulters: ${defaulters.length}`, 14, y);
  doc.text(`Total Outstanding: ${formatKES(totalOutstanding)}`, 110, y);

  addPDFFooter(doc);
  addDemoWatermark(doc);
  doc.save(`Defaulters_Term${term}_${year}.pdf`);
  showToast('Defaulters report generated', 'success');
}

// ============================================================
// REPORT CARD
// ============================================================

async function generateReportCard(studentId, term, year) {
  if (!studentId) {
    const students = await db.getAll('students');
    const active = students.filter(s => s.status === 'active' || !s.status);

    if (active.length === 0) {
      showToast('No students found', 'warning');
      return;
    }

    await sortStudentsForReport(active);

    const body = document.getElementById('report-options-body');
    body.innerHTML = `
      <div class="form-group">
        <label>Select Student</label>
        <select id="report-card-student">
          ${active.map(s =>
            `<option value="${s.id}">${escapeHtml(s.admissionNumber)} - ${escapeHtml(s.name)} (${escapeHtml(s.class)})</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Term</label>
          <select id="report-card-term">
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>
        <div class="form-group">
          <label>Year</label>
          <select id="report-card-year">
            ${SV.getYears().map(y => `<option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
      </div>`;

    document.getElementById('report-options-title').textContent = 'Generate Report Card';
    document.getElementById('report-generate-btn').onclick = async () => {
      const selId = document.getElementById('report-card-student').value;
      const selTerm = parseInt(document.getElementById('report-card-term').value) || getCurrentTerm();
      const selYear = parseInt(document.getElementById('report-card-year').value) || new Date().getFullYear();
      closeModal('report-options-modal');
      if (selId) await generateReportCard(selId, selTerm, selYear);
    };
    document.getElementById('report-options-modal').classList.add('active');
    return;
  }

  const student = await db.get('students', studentId);
  if (!student) { showToast('Student not found', 'error'); return; }

  const reportTerm = term || getCurrentTerm();
  const reportYear = year || new Date().getFullYear();
  const curriculum = await getActiveCurriculum();

  if (curriculum === 'cbc') {
    await generateCBCReportCard(student, reportTerm, reportYear);
  } else {
    await generateKCSEReportCard(student, reportTerm, reportYear);
  }
}

/**
 * Generate CBC Report Card (rubric-based)
 */
async function generateCBCReportCard(student, reportTerm, reportYear) {
  const header = await getSchoolHeader();
  const allSubjects = (await db.getAll('subjects')).filter(s => s.enabled);
  const subjects = allSubjects.filter(s => s.curriculum === 'cbc');

  const currentTerm = reportTerm || getCurrentTerm();
  const currentYear = reportYear || new Date().getFullYear();
  const exams = (await db.getAll('exams')).filter(e => e.class === student.class && e.term === currentTerm && e.year === currentYear);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = await addSchoolHeader(doc);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('CBC LEARNER PROGRESS REPORT', 105, y + 5, { align: 'center' });
  y += 12;

  // Student info
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${student.name}`, 14, y);
  doc.text(`Adm No: ${student.admissionNumber}`, 120, y);
  y += 6;
  doc.text(`Class: ${student.class} ${student.stream}`, 14, y);
  doc.text(`Type: ${student.type === 'boarder' ? 'Boarder' : 'Day Scholar'}`, 120, y);
  y += 6;
  doc.text(`Term: ${getTermLabel(currentTerm, currentYear)}`, 14, y);
  y += 10;

  // Fee status
  const balance = await db.getStudentFeeBalance(student.id, currentTerm, currentYear);
  doc.setFont(undefined, 'bold');
  doc.text(`Fee Balance: ${formatKES(balance.balance)}`, 14, y);
  doc.text(balance.balance <= 0 ? 'CLEARED' : 'NOT CLEARED', 120, y);
  y += 10;

  // CBC Rubric Legend
  doc.setFillColor(124, 58, 237, 0.08);
  doc.roundedRect(14, y, 182, 18, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('CBC Assessment Rubric:', 18, y + 6);
  doc.setFont(undefined, 'normal');
  const rubricText = SV.CBC_RUBRIC.map(r => `${r.level} = ${r.label}`).join('  |  ');
  doc.text(rubricText, 18, y + 13);
  y += 22;

  // Scores table with rubric levels
  const tableBody = [];
  const allScores = [];

  for (const subject of subjects) {
    const row = [subject.name, subject.code || ''];
    let rubricLevel = '-';
    let rubricPoints = 0;

    for (const exam of exams) {
      const scores = await db.getByIndex('scores', 'examId', exam.id);
      const score = scores.find(s => s.studentId === student.id && s.subjectId === subject.id);
      if (score) {
        const level = score.rubricLevel || score.grade || '-';
        row.push(level);
        rubricLevel = level;
        rubricPoints = score.points || 0;
      } else {
        row.push('-');
      }
    }

    row.push(rubricLevel);
    row.push(String(rubricPoints));

    // Strands for this learning area
    if (subject.strands && subject.strands.length > 0) {
      row.push(subject.strands.slice(0, 3).join(', '));
    } else {
      row.push('-');
    }

    tableBody.push(row);
    if (rubricLevel !== '-') {
      allScores.push({ subjectId: subject.id, rubricLevel });
    }
  }

  // Calculate overall competency
  let overallLevel = '-';
  let overallLabel = 'No Assessment';
  let averagePoints = 0;
  let breakdown = { EE: 0, ME: 0, AE: 0, BE: 0 };

  if (allScores.length > 0) {
    const competency = computeCBCCompetency(allScores);
    overallLevel = competency.overallLevel;
    overallLabel = competency.overallLabel;
    averagePoints = competency.averagePoints;
    breakdown = competency.levelBreakdown;
  }

  const examHeaders = exams.map(e => e.name.substring(0, 14));
  const headRow = ['Learning Area', 'Code', ...examHeaders, 'Rubric', 'Pts', 'Key Strands'];

  doc.autoTable({
    startY: y,
    head: [headRow],
    body: tableBody,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 12 },
      5: { cellWidth: 10 },
      6: { cellWidth: 50 }
    },
    margin: { left: 14 },
    didParseCell: function(data) {
      // Color rubric cells
      if (data.section === 'body' && data.column.index >= 2 && data.column.index <= headRow.length - 3) {
        const val = data.cell.raw;
        if (val === 'EE') data.cell.styles.textColor = [16, 185, 129];
        else if (val === 'ME') data.cell.styles.textColor = [59, 130, 246];
        else if (val === 'AE') data.cell.styles.textColor = [245, 158, 11];
        else if (val === 'BE') data.cell.styles.textColor = [239, 68, 68];
      }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Overall Competency Assessment
  doc.setFillColor(124, 58, 237, 0.1);
  doc.roundedRect(14, y, 182, 30, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Overall Competency Level: ${overallLevel}`, 18, y + 10);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`${overallLabel} | Average Points: ${averagePoints}`, 18, y + 18);
  doc.text(`EE: ${breakdown.EE}  ME: ${breakdown.ME}  AE: ${breakdown.AE}  BE: ${breakdown.BE}`, 18, y + 25);
  y += 36;

  // Competency Summary
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Competency Summary:', 14, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  const totalLearnAreas = allScores.length;
  const eePct = totalLearnAreas > 0 ? Math.round((breakdown.EE / totalLearnAreas) * 100) : 0;
  const mePct = totalLearnAreas > 0 ? Math.round((breakdown.ME / totalLearnAreas) * 100) : 0;
  const aePct = totalLearnAreas > 0 ? Math.round((breakdown.AE / totalLearnAreas) * 100) : 0;
  const bePct = totalLearnAreas > 0 ? Math.round((breakdown.BE / totalLearnAreas) * 100) : 0;

  doc.text(`Exceeding Expectation: ${breakdown.EE} (${eePct}%)`, 14, y);
  doc.text(`Meeting Expectation: ${breakdown.ME} (${mePct}%)`, 110, y);
  y += 6;
  doc.text(`Approaching Expectation: ${breakdown.AE} (${aePct}%)`, 14, y);
  doc.text(`Below Expectation: ${breakdown.BE} (${bePct}%)`, 110, y);
  y += 12;

  // Rankings (computed from actual data)
  const positions = await computeStudentPosition(student, exams, 'cbc', subjects);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`Position: ${positions.positionInStream} out of ${positions.totalInStream} in Stream`, 14, y);
  doc.text(`Position: ${positions.positionInForm} out of ${positions.totalInForm} in Form`, 110, y);
  y += 10;

  // Teacher comments
  doc.setFont(undefined, 'normal');
  doc.text('Teacher Remarks: _______________________________________________', 14, y);
  y += 7;
  doc.text('___________________________________________________________________', 14, y);
  y += 10;

  doc.text('Principal Remarks: _______________________________________________', 14, y);
  y += 7;
  doc.text('___________________________________________________________________', 14, y);
  y += 12;

  // Signatures
  doc.setFontSize(9);
  doc.text('Class Teacher: _____________________', 14, y);
  doc.text('Principal: _____________________', 110, y);
  y += 8;
  doc.text('Guardian: _____________________', 14, y);

  // Next term info
  const nextTermDate = await db.getSetting('nextTermOpeningDate');
  const nextTerm = currentTerm >= 3 ? 1 : currentTerm + 1;
  const nextYear = currentTerm >= 3 ? currentYear + 1 : currentYear;
  if (nextTermDate || true) {
    y += 10;
    doc.setFont(undefined, 'bold');
    if (nextTermDate) {
      doc.text(`Next Term Opens: ${formatDate(nextTermDate)}`, 14, y);
    }
    // Next term fee
    const nextFeeStructures = (await db.getAll('feeStructures')).filter(fs =>
      (fs.class === student.class || fs.class === 'all') &&
      (fs.studentType === student.type || fs.studentType === 'all') &&
      fs.term === nextTerm && fs.year === nextYear
    );
    const nextTermFee = nextFeeStructures.reduce((sum, fs) => sum + (fs.totalAmount || 0), 0);
    if (nextTermFee > 0) {
      doc.text(`Next Term Fee: ${formatKES(nextTermFee)}`, 14, y + 7);
    }
  }

  addPDFFooter(doc);
  addDemoWatermark(doc);
  doc.save(`CBC_ReportCard_${student.admissionNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
  showToast('CBC report card generated', 'success');
}

/**
 * Generate KCSE Report Card (8-4-4)
 */
async function generateKCSEReportCard(student, reportTerm, reportYear) {
  const curriculum = await getActiveCurriculum();
  const allSubjects = (await db.getAll('subjects')).filter(s => s.enabled);
  const subjects = allSubjects.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));

  // Get exams for the selected term/year only
  const currentTerm = reportTerm || getCurrentTerm();
  const currentYear = reportYear || new Date().getFullYear();
  const exams = (await db.getAll('exams')).filter(e => e.class === student.class && e.term === currentTerm && e.year === currentYear);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = await addSchoolHeader(doc);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('END OF TERM REPORT CARD', 105, y + 5, { align: 'center' });
  y += 12;

  // Student info
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${student.name}`, 14, y);
  doc.text(`Adm No: ${student.admissionNumber}`, 120, y);
  y += 6;
  doc.text(`Class: ${student.class} ${student.stream}`, 14, y);
  doc.text(`Type: ${student.type === 'boarder' ? 'Boarder' : 'Day Scholar'}`, 120, y);
  y += 6;
  doc.text(`Term: ${getTermLabel(currentTerm, currentYear)}`, 14, y);
  y += 10;

  // Fee status
  const balance = await db.getStudentFeeBalance(student.id, currentTerm, currentYear);
  doc.setFont(undefined, 'bold');
  doc.text(`Fee Balance: ${formatKES(balance.balance)}`, 14, y);
  doc.text(balance.balance <= 0 ? 'CLEARED' : 'NOT CLEARED', 120, y);
  y += 10;

  // Scores table
  const tableBody = [];

  for (const subject of subjects) {
    const row = [subject.name, subject.code || ''];
    let totalScore = 0;
    let totalMax = 0;

    for (const exam of exams) {
      const scores = await db.getByIndex('scores', 'examId', exam.id);
      const score = scores.find(s => s.studentId === student.id && s.subjectId === subject.id);
      if (score) {
        row.push(`${score.rawScore}/${score.maxScore}`);
        totalScore += score.rawScore;
        totalMax += score.maxScore;
      } else {
        row.push('-');
      }
    }

    if (totalMax > 0) {
      const pct = (totalScore / totalMax) * 100;
      const kcse = rawToKCSE(pct);
      row.push(kcse.grade);
      row.push(String(kcse.points));
      row.push(`${String(kcse.points)}/${String(totalMax)}`);
    } else {
      row.push('-', '-', '-');
    }

    tableBody.push(row);
  }

  // Calculate mean grade
  const allScores = [];
  for (const exam of exams) {
    const examScores = await db.getByIndex('scores', 'examId', exam.id);
    const studentScores = examScores.filter(s => s.studentId === student.id);
    allScores.push(...studentScores);
  }

  let meanGrade = '-';
  let meanPoints = '-';
  if (allScores.length > 0) {
    const scoreObjects = allScores.map(sc => ({
      subjectId: sc.subjectId,
      rawScore: sc.rawScore,
      maxScore: sc.maxScore
    }));
    const kcseResult = computeKCSEMeanGrade(scoreObjects, subjects);
    meanGrade = kcseResult.meanGrade;
    meanPoints = kcseResult.meanPoints.toFixed(2);
  }

  const examHeaders = exams.map(e => e.name.substring(0, 12));
  const headRow = ['Subject', 'Code', ...examHeaders, 'Grade', 'Pts', 'Remarks'];

  doc.autoTable({
    startY: y,
    head: [headRow],
    body: tableBody,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 15 }
    },
    margin: { left: 14 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Mean grade summary
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Mean Grade: ${meanGrade}`, 14, y);
  doc.text(`Mean Points: ${meanPoints}`, 80, y);
  y += 15;

  // Rankings (computed from actual data)
  const positions = await computeStudentPosition(student, exams, curriculum, subjects);
  doc.setFontSize(10);
  doc.text(`Position: ${positions.positionInStream} out of ${positions.totalInStream} in Stream`, 14, y);
  doc.text(`Position: ${positions.positionInForm} out of ${positions.totalInForm} in Form`, 110, y);
  y += 10;

  doc.text('Class Teacher Remarks: _______________________________________________', 14, y);
  y += 7;
  doc.text('___________________________________________________________________', 14, y);
  y += 10;

  doc.text('Principal Remarks: _______________________________________________', 14, y);
  y += 7;
  doc.text('___________________________________________________________________', 14, y);
  y += 12;

  // Signatures
  doc.setFontSize(9);
  doc.text('Class Teacher: _____________________', 14, y);
  doc.text('Principal: _____________________', 110, y);
  y += 8;
  doc.text('Guardian: _____________________', 14, y);

  // Next term info
  const nextTermDate = await db.getSetting('nextTermOpeningDate');
  const nextTerm = currentTerm >= 3 ? 1 : currentTerm + 1;
  const nextYear = currentTerm >= 3 ? currentYear + 1 : currentYear;
  y += 10;
  doc.setFont(undefined, 'bold');
  if (nextTermDate) {
    doc.text(`Next Term Opens: ${formatDate(nextTermDate)}`, 14, y);
  }
  // Next term fee
  const nextFeeStructures = (await db.getAll('feeStructures')).filter(fs =>
    (fs.class === student.class || fs.class === 'all') &&
    (fs.studentType === student.type || fs.studentType === 'all') &&
    fs.term === nextTerm && fs.year === nextYear
  );
  const nextTermFee = nextFeeStructures.reduce((sum, fs) => sum + (fs.totalAmount || 0), 0);
  if (nextTermFee > 0) {
    doc.text(`Next Term Fee: ${formatKES(nextTermFee)}`, 14, y + 7);
  }

  addPDFFooter(doc);
  addDemoWatermark(doc);
  doc.save(`ReportCard_${student.admissionNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
  showToast('Report card generated', 'success');
}

// ============================================================
// PRINCIPAL'S BRIEF
// ============================================================

async function generatePrincipalsBrief() {
  if (SV.IS_DEMO) { showProLockPopup(); return; }
  const loaded = await ensureJsPDF();
  if (!loaded) { showToast('PDF library failed to load', 'error'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const header = await getSchoolHeader();
  const currentTerm = getCurrentTerm();
  const currentYear = new Date().getFullYear();
  const schoolName = header.schoolName;

  // ---- PAGE 1: HEADER + FEE SUMMARY ----
  let y = await addSchoolHeader(doc);

  // Purple divider
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.8);
  doc.line(14, y, 196, y);
  y += 6;

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('PRINCIPAL\'S BRIEF', 105, y + 5, { align: 'center' });
  y += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Term ${currentTerm} ${currentYear} | Generated: ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}`, 105, y + 2, { align: 'center' });
  y += 10;
  doc.setTextColor(0, 0, 0);

  // ---- FEE COLLECTION SUMMARY ----
  doc.setFillColor(124, 58, 237, 0.08);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('FEE COLLECTION SUMMARY', 18, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  const allPayments = await db.getAll('feePayments');
  const validPayments = allPayments.filter(p => !p.voided);
  const termPayments = validPayments.filter(p => p.term === currentTerm && p.year === currentYear);
  const totalCollected = termPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Method breakdown
  const methodBreakdown = {};
  termPayments.forEach(p => {
    const label = SV.PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method;
    methodBreakdown[label] = (methodBreakdown[label] || 0) + p.amount;
  });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const feeSummaryRows = [
    ['Total Collected This Term:', formatKES(totalCollected)],
    ['Number of Payments:', String(termPayments.length)],
    ['Voided Payments:', String(allPayments.filter(p => p.voided && p.term === currentTerm && p.year === currentYear).length)],
  ];
  feeSummaryRows.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 20, y);
    doc.setFont(undefined, 'normal');
    doc.text(value, 100, y);
    y += 6;
  });

  // Method breakdown
  y += 2;
  doc.setFont(undefined, 'bold');
  doc.text('By Method:', 20, y);
  y += 6;
  Object.entries(methodBreakdown).forEach(([method, amount]) => {
    doc.setFont(undefined, 'normal');
    doc.text(`  ${method}: ${formatKES(amount)}`, 24, y);
    y += 5;
  });
  y += 6;

  // ---- TOP DEFAULTERS ----
  doc.setFillColor(239, 68, 68, 0.08);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text('FEE DEFAULTERS (TOP 15)', 18, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  const defaulters = await db.getDefaulters(currentTerm, currentYear);
  const topDefaulters = defaulters.slice(0, 15);
  const totalOutstanding = defaulters.reduce((sum, d) => sum + d.balance, 0);

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Defaulters: ${defaulters.length} | Total Outstanding: ${formatKES(totalOutstanding)}`, 20, y);
  y += 7;

  if (topDefaulters.length > 0) {
    const defTableBody = topDefaulters.map((d, i) => [
      i + 1,
      d.student.name,
      `${d.student.class} ${d.student.stream}`,
      d.student.type === 'boarder' ? 'Brd' : 'Day',
      formatKES(d.balance)
    ]);
    doc.autoTable({
      startY: y,
      head: [['#', 'Student', 'Class', 'Type', 'Balance']],
      body: defTableBody,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 55 },
        4: { halign: 'right' }
      },
      margin: { left: 14 }
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont(undefined, 'normal');
    doc.text('All students have cleared their fees for this term.', 20, y);
    y += 8;
  }

  // ---- PAGE 2: DISCIPLINE + MERITS + NEW ADMISSIONS ----
  doc.addPage();
  y = 15;

  // Discipline section
  doc.setFillColor(245, 158, 11, 0.08);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('DISCIPLINE INCIDENTS', 18, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  const allDiscipline = await db.getAll('discipline');
  const termIncidents = allDiscipline.filter(d => d.type === 'incident' && d.term === currentTerm && d.year === currentYear);
  const criticalIncidents = termIncidents.filter(d => d.severity === 'critical');
  const suspendedStudents = [];

  // Build incident table
  if (termIncidents.length > 0) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`${termIncidents.length} incidents this term | ${criticalIncidents.length} critical`, 20, y);
    y += 7;

    const incidentBody = [];
    for (const inc of termIncidents.slice(0, 20)) {
      const student = await db.get('students', inc.studentId);
      const catLabel = SV.INCIDENT_CATEGORIES.find(c => c.value === inc.category)?.label || inc.category;
      const actionLabel = SV.ACTION_TYPES.find(a => a.value === inc.actionTaken)?.label || inc.actionTaken;
      if (inc.actionTaken === 'suspension') {
        suspendedStudents.push(student ? student.name : 'Unknown');
      }
      incidentBody.push([
        formatDate(inc.date),
        student ? student.name : 'Unknown',
        catLabel,
        inc.severity === 'critical' ? 'CRIT' : inc.severity === 'major' ? 'MAJ' : 'MIN',
        actionLabel
      ]);
    }

    doc.autoTable({
      startY: y,
      head: [['Date', 'Student', 'Category', 'Sev', 'Action']],
      body: incidentBody,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 45 },
        2: { cellWidth: 38 },
        3: { cellWidth: 14 },
      },
      margin: { left: 14 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'CRIT') data.cell.styles.textColor = [239, 68, 68];
          else if (data.cell.raw === 'MAJ') data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });
    y = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('No discipline incidents recorded this term.', 20, y);
    y += 8;
  }

  // Suspended students callout
  if (suspendedStudents.length > 0) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Currently Suspended:', 20, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(suspendedStudents.join(', '), 65, y);
    y += 8;
  }

  // Merits section
  doc.setFillColor(16, 185, 129, 0.08);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('MERITS & AWARDS', 18, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  const termMerits = allDiscipline.filter(d => d.type === 'merit' && d.term === currentTerm && d.year === currentYear);

  if (termMerits.length > 0) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`${termMerits.length} merits recorded this term`, 20, y);
    y += 7;

    const meritBody = [];
    for (const m of termMerits.slice(0, 15)) {
      const student = await db.get('students', m.studentId);
      const catLabel = SV.MERIT_CATEGORIES.find(c => c.value === m.category)?.label || m.category;
      meritBody.push([
        formatDate(m.date),
        student ? student.name : 'Unknown',
        catLabel,
        m.reportedBy || '-'
      ]);
    }

    doc.autoTable({
      startY: y,
      head: [['Date', 'Student', 'Category', 'Reported By']],
      body: meritBody,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 50 },
        3: { cellWidth: 35 }
      },
      margin: { left: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('No merits recorded this term.', 20, y);
    y += 8;
  }

  // New admissions section (students added in last 30 days)
  doc.setFillColor(59, 130, 246, 0.08);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('NEW ADMISSIONS (LAST 30 DAYS)', 18, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 12;

  const allStudents = await db.getAll('students');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newAdmissions = allStudents.filter(s => s.dateAdded && new Date(s.dateAdded) >= thirtyDaysAgo);

  if (newAdmissions.length > 0) {
    const admBody = newAdmissions.map(s => [
      s.admissionNumber,
      s.name,
      `${s.class} ${s.stream}`,
      s.type === 'boarder' ? 'Boarder' : 'Day'
    ]);

    doc.autoTable({
      startY: y,
      head: [['Adm No', 'Name', 'Class', 'Type']],
      body: admBody,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 55 },
      },
      margin: { left: 14 }
    });
  } else {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('No new admissions in the last 30 days.', 20, y);
  }

  // Add footer to all pages
  addPDFFooter(doc);

  const dateStr = new Date().toISOString().split('T')[0];
  addDemoWatermark(doc);
  doc.save(`Principals_Brief_${schoolName.replace(/\s+/g, '_')}_${dateStr}.pdf`);
  showToast('Principal\'s Brief downloaded', 'success');
  SoundManager.play('success');
}

// ============================================================
// MERIT LIST
// ============================================================

async function generateMeritList() {
  const body = document.getElementById('report-options-body');
  body.innerHTML = `
    <div class="form-group">
      <label>Select Exam</label>
      <select id="report-merit-exam">
        <option value="">Select Exam</option>
      </select>
    </div>`;

  // Populate exam select
  const exams = await db.getAll('exams');
  const examSelect = body.querySelector('#report-merit-exam');
  exams.forEach(e => {
    examSelect.innerHTML += `<option value="${e.id}">${escapeHtml(e.name)} (${escapeHtml(e.class)} - T${e.term} ${e.year})</option>`;
  });

  document.getElementById('report-options-title').textContent = 'Generate Merit List';
  document.getElementById('report-generate-btn').onclick = async () => {
    const examId = examSelect.value;
    closeModal('report-options-modal');
    if (examId) await generateMeritListPDF(examId);
  };
  document.getElementById('report-options-modal').classList.add('active');
}

async function generateMeritListPDF(examId) {
  const exam = await db.get('exams', examId);
  if (!exam) return;

  const curriculum = await getActiveCurriculum();
  const allSubjects = (await db.getAll('subjects')).filter(s => s.enabled);
  const subjects = allSubjects.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));
  const students = (await db.getAll('students')).filter(s =>
    s.class === exam.class && (s.status === 'active' || !s.status)
  );
  const scores = await db.getByIndex('scores', 'examId', examId);

  const header = await getSchoolHeader();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = await addSchoolHeader(doc);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`MERIT LIST - ${exam.name}`, 105, y + 5, { align: 'center' });
  y += 12;

  // Calculate rankings
  const ranked = [];
  for (const student of students) {
    const studentScores = scores.filter(s => s.studentId === student.id);
    if (studentScores.length === 0) continue;

    if (curriculum === 'cbc') {
      const rubricScores = studentScores.filter(sc => sc.rubricLevel).map(sc => ({ subjectId: sc.subjectId, rubricLevel: sc.rubricLevel }));
      const cbcResult = computeCBCCompetency(rubricScores);
      const totalMarks = studentScores.reduce((sum, sc) => sum + sc.rawScore, 0);
      ranked.push({ student, totalMarks, meanGrade: cbcResult.overallLevel, meanPoints: cbcResult.averagePoints });
    } else {
      const scoreObjects = studentScores.map(sc => ({
        subjectId: sc.subjectId,
        rawScore: sc.rawScore,
        maxScore: sc.maxScore
      }));
      const kcseResult = computeKCSEMeanGrade(scoreObjects, subjects);
      const totalMarks = studentScores.reduce((sum, sc) => sum + sc.rawScore, 0);
      ranked.push({ student, totalMarks, meanGrade: kcseResult.meanGrade, meanPoints: kcseResult.meanPoints });
    }
  }

  ranked.sort((a, b) => b.meanPoints - a.meanPoints || b.totalMarks - a.totalMarks);

  const gradeLabel = curriculum === 'cbc' ? 'Level' : 'Grade';
  const ptsLabel = curriculum === 'cbc' ? 'Avg Pts' : 'Mean Pts';

  const tableBody = ranked.map((r, i) => [
    i + 1,
    r.student.admissionNumber,
    r.student.name,
    r.student.stream,
    r.totalMarks,
    r.meanGrade,
    r.meanPoints.toFixed(2)
  ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'Adm No', 'Name', 'Stream', 'Total', gradeLabel, ptsLabel]],
    body: tableBody,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { cellWidth: 55 },
      4: { halign: 'right' },
      6: { halign: 'right' }
    },
    margin: { left: 14 }
  });

  addPDFFooter(doc);
  addDemoWatermark(doc);
  doc.save(`MeritList_${exam.name.replace(/\s+/g, '_')}.pdf`);
  showToast('Merit list generated', 'success');
}

// ============================================================
// CLASS LIST
// ============================================================

async function generateClassList() {
  const classes = await db.getSetting('classes') || [];

  const body = document.getElementById('report-options-body');
  body.innerHTML = `
    <div class="form-group">
      <label>Select Class</label>
      <select id="report-classlist-class">
        ${classes.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('')}
      </select>
    </div>`;

  document.getElementById('report-options-title').textContent = 'Generate Class List';
  document.getElementById('report-generate-btn').onclick = async () => {
    const cls = document.getElementById('report-classlist-class').value;
    closeModal('report-options-modal');
    if (cls) await generateClassListPDF(cls);
  };
  document.getElementById('report-options-modal').classList.add('active');
}

async function generateClassListPDF(cls) {
  const students = (await db.getAll('students')).filter(s => s.class === cls);
  students.sort((a, b) => (a.stream || '').localeCompare(b.stream || '') || (a.name || '').localeCompare(b.name || ''));

  if (students.length === 0) {
    showToast('No students in this class', 'warning');
    return;
  }

  const header = await getSchoolHeader();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = await addSchoolHeader(doc);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`CLASS LIST - ${cls}`, 105, y + 5, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total: ${students.length} students`, 105, y + 12, { align: 'center' });
  y += 18;

  const tableBody = students.map((s, i) => [
    i + 1,
    s.admissionNumber,
    s.name,
    s.stream,
    s.type === 'boarder' ? 'Boarder' : 'Day',
    s.gender === 'male' ? 'M' : s.gender === 'female' ? 'F' : '-',
    s.guardianName || '-',
    s.guardianPhone || '-'
  ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'Adm No', 'Name', 'Stream', 'Type', 'Gender', 'Guardian', 'Phone']],
    body: tableBody,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 45 }
    },
    margin: { left: 14 }
  });

  addPDFFooter(doc);
  addDemoWatermark(doc);
  doc.save(`ClassList_${cls.replace(/\s+/g, '_')}.pdf`);
  showToast('Class list generated', 'success');
}
