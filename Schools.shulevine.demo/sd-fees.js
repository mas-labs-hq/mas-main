/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-fees.js - Fee Management Module
 * Powered By MortApps Studios
 */

// ============================================================
// FEE PAYMENTS
// ============================================================

/**
 * Open payment form
 */
function openPaymentForm() {
  document.getElementById('payment-edit-id').value = '';
  document.getElementById('payment-amount').value = '';
  document.getElementById('payment-method').value = 'cash';
  document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('payment-mpesa-ref').value = '';
  document.getElementById('payment-paid-by').value = '';
  document.getElementById('payment-received-by').value = '';
  document.getElementById('payment-term').value = getCurrentTerm();

  // Populate year select
  populateYearSelect('payment-year');

  // Populate student select
  populateStudentSelect('payment-student');

  document.getElementById('payment-modal').classList.add('active');
  SoundManager.play('notify');
}

/**
 * Save a payment
 * @param {boolean} andNext - If true, reset form for next payment instead of closing modal
 */
async function savePayment(andNext = false) {
  const editId = document.getElementById('payment-edit-id').value;
  const studentId = document.getElementById('payment-student').value;
  const amount = parseFloat(document.getElementById('payment-amount').value);
  const method = document.getElementById('payment-method').value;
  const date = document.getElementById('payment-date').value;
  const mpesaRef = document.getElementById('payment-mpesa-ref').value.trim();
  const paidBy = document.getElementById('payment-paid-by').value.trim();
  const term = parseInt(document.getElementById('payment-term').value);
  const year = parseInt(document.getElementById('payment-year').value);
  const receivedBy = document.getElementById('payment-received-by').value.trim();

  // Validation
  if (!studentId) { showToast('Please select a student', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
  if (!date) { showToast('Please select a date', 'error'); return; }
  if (!term) { showToast('Please select a term', 'error'); return; }
  if (!year) { showToast('Please select a year', 'error'); return; }

  // M-Pesa reference validation
  if (method === 'mpesa' && mpesaRef && !validateMpesaRef(mpesaRef)) {
    showToast('M-Pesa reference must be up to 10 alphanumeric characters', 'error');
    return;
  }

  // "Record & Next" only works for new payments (not edits)
  if (andNext && editId) { andNext = false; }

  let receiptNo;
  if (editId) {
    // Editing existing payment - keep same receipt number
    const existing = await db.get('feePayments', editId);
    receiptNo = existing.receiptNo;
  } else {
    const counter = await db.getNextReceiptNo();
    receiptNo = `RCT-${String(counter).padStart(5, '0')}`;
  }

  const payment = {
    id: editId || generateId(),
    studentId,
    amount,
    date,
    method,
    mpesaRef: method === 'mpesa' ? mpesaRef : '',
    paidBy,
    term,
    year,
    receivedBy,
    receiptNo,
    voided: false,
    voidReason: '',
    voidedBy: '',
    voidedAt: null,
    dateCreated: editId ? undefined : new Date().toISOString()
  };

  try {
    // Build edit history if editing
    if (editId) {
      const existing = await db.get('feePayments', editId);
      if (existing) {
        // Build audit trail entry for changes
        const changes = [];
        const fields = ['studentId','amount','method','date','mpesaRef','paidBy','term','year','receivedBy'];
        const labels = {'studentId':'Student','amount':'Amount','method':'Method','date':'Date','mpesaRef':'M-Pesa Ref','paidBy':'Paid By','term':'Term','year':'Year','receivedBy':'Received By'};
        for (const f of fields) {
          const oldVal = String(existing[f] ?? '');
          const newVal = String(payment[f] ?? '');
          if (oldVal !== newVal) {
            changes.push({ field: labels[f] || f, oldValue: oldVal, newValue: newVal });
          }
        }
        if (changes.length > 0) {
          if (!existing.editHistory) existing.editHistory = [];
          existing.editHistory.push({
            action: 'edit',
            timestamp: new Date().toISOString(),
            changes,
            performedBy: 'Current User'
          });
          payment.editHistory = existing.editHistory;
        }
        payment.dateCreated = existing.dateCreated;
        payment.voided = existing.voided;
        payment.voidReason = existing.voidReason;
        payment.voidedBy = existing.voidedBy;
        payment.voidedAt = existing.voidedAt;
      }
    }

    await db.put('feePayments', payment);
    SoundManager.play('success');

    // Reset modal title and Record & Next button visibility
    const modalTitle = document.querySelector('#payment-modal .modal-header h3');
    if (modalTitle) modalTitle.textContent = 'Record Fee Payment';
    const recordNextBtn = document.querySelector('#payment-modal .btn-secondary');
    if (recordNextBtn) recordNextBtn.style.display = '';

    if (andNext) {
      // Reset form for next payment but keep modal open
      showToast(`Payment recorded — Receipt #${receiptNo}. Ready for next.`, 'success');
      document.getElementById('payment-edit-id').value = '';
      document.getElementById('payment-amount').value = '';
      document.getElementById('payment-mpesa-ref').value = '';
      document.getElementById('payment-paid-by').value = '';
      document.getElementById('payment-student').focus();
    } else {
      closeModal('payment-modal');
      showToast(editId ? 'Payment updated' : `Payment recorded — Receipt #${receiptNo}`, 'success');
    }
    loadPaymentsList();
  } catch (err) {
    showToast('Error saving payment: ' + err.message, 'error');
  }
}

/**
 * Void a payment (never delete — preserve sequential numbering)
 */
async function voidPayment(paymentId) {
  // Require PIN
  const pinVerified = await verifyPin();
  if (!pinVerified) return;

  showConfirm('Void this payment? The receipt number will be preserved but marked as voided.', async () => {
    showPrompt('Reason for voiding:', 'Enter reason', async (reason) => {
      if (!reason) {
        showToast('A reason is required to void a payment', 'error');
        return;
      }

      const payment = await db.get('feePayments', paymentId);
      if (!payment) return;

      payment.voided = true;
      payment.voidReason = reason;
      payment.voidedBy = 'Current User'; // Could be tracked with auth
      payment.voidedAt = new Date().toISOString();

      try {
        await db.put('feePayments', payment);
        showToast(`Receipt #${payment.receiptNo} has been voided`, 'warning');
        loadPaymentsList();
      } catch (err) {
        showToast('Error voiding payment: ' + err.message, 'error');
      }
    });
  });
}

/**
 * Edit a payment (PIN-protected, with audit trail)
 */
async function editPayment(paymentId) {
  // Require PIN
  const pinVerified = await verifyPin();
  if (!pinVerified) return;

  const payment = await db.get('feePayments', paymentId);
  if (!payment) { showToast('Payment not found', 'error'); return; }

  // Pre-fill payment form with existing data
  document.getElementById('payment-edit-id').value = payment.id;
  document.getElementById('payment-amount').value = payment.amount;
  document.getElementById('payment-method').value = payment.method;
  document.getElementById('payment-date').value = payment.date;
  document.getElementById('payment-mpesa-ref').value = payment.mpesaRef || '';
  document.getElementById('payment-paid-by').value = payment.paidBy || '';
  document.getElementById('payment-term').value = payment.term;
  document.getElementById('payment-received-by').value = payment.receivedBy || '';

  // Populate year select and set value
  populateYearSelect('payment-year');
  setTimeout(() => {
    const yearSelect = document.getElementById('payment-year');
    if (yearSelect) yearSelect.value = payment.year;
  }, 100);

  // Populate student select and set value
  await populateStudentSelect('payment-student');
  setTimeout(() => {
    const studentSelect = document.getElementById('payment-student');
    if (studentSelect) studentSelect.value = payment.studentId;
  }, 100);

  // Update modal title to indicate editing
  document.querySelector('#payment-modal .modal-header h3').textContent = 'Edit Fee Payment';
  
  // Hide "Record & Next" button when editing
  const recordNextBtn = document.querySelector('#payment-modal .btn-secondary');
  if (recordNextBtn) recordNextBtn.style.display = 'none';

  document.getElementById('payment-modal').classList.add('active');
  SoundManager.play('notify');
}

/**
 * Unvoid a payment (PIN-protected, with reason)
 */
async function unvoidPayment(paymentId) {
  // Require PIN
  const pinVerified = await verifyPin();
  if (!pinVerified) return;

  showPrompt('Reason for unvoiding this payment:', 'Enter reason', async (reason) => {
    if (!reason) {
      showToast('A reason is required to unvoid a payment', 'error');
      return;
    }

    const payment = await db.get('feePayments', paymentId);
    if (!payment) return;

    // Save the void info to editHistory before unvoiding
    const editEntry = {
      action: 'unvoid',
      timestamp: new Date().toISOString(),
      previousVoidReason: payment.voidReason || '',
      previousVoidedBy: payment.voidedBy || '',
      previousVoidedAt: payment.voidedAt || '',
      unvoidReason: reason,
      performedBy: 'Current User'
    };
    if (!payment.editHistory) payment.editHistory = [];
    payment.editHistory.push(editEntry);

    // Unvoid the payment
    payment.voided = false;
    payment.voidReason = '';  // Clear but history is preserved in editHistory
    payment.voidedBy = '';
    payment.voidedAt = null;
    payment.unvoidReason = reason;
    payment.unvoidedAt = new Date().toISOString();

    try {
      await db.put('feePayments', payment);
      showToast(`Receipt #${payment.receiptNo} has been restored (unvoided)`, 'success');
      SoundManager.play('success');
      loadPaymentsList();
    } catch (err) {
      showToast('Error unvoiding payment: ' + err.message, 'error');
    }
  });
}

/**
 * Load payments list
 */
async function loadPaymentsList() {
  const tbody = document.getElementById('payments-tbody');
  const countEl = document.getElementById('payments-count');

  let payments = await db.getAll('feePayments');

  // Apply filters
  const searchTerm = document.getElementById('payment-search')?.value?.toLowerCase() || '';
  const filterTerm = document.getElementById('payment-filter-term')?.value || '';
  const filterMethod = document.getElementById('payment-filter-method')?.value || '';

  if (filterTerm) payments = payments.filter(p => p.term === parseInt(filterTerm));
  if (filterMethod) payments = payments.filter(p => p.method === filterMethod);

  // Sort by date descending
  payments.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (payments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <div class="empty-icon">${ic('banknote','')}</div>
            <h3>No payments recorded</h3>
            <p>Record your first fee payment</p>
          </div>
        </td>
      </tr>`;
    countEl.textContent = '0 payments';
    scheduleIcons();
    return;
  }

  let html = '';
  let visibleCount = 0;
  let visibleTotal = 0;
  for (const p of payments) {
    const student = await db.get('students', p.studentId);
    const studentName = student ? student.name : 'Unknown';
    const methodLabel = SV.PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method;

    if (searchTerm && !studentName.toLowerCase().includes(searchTerm) && !String(p.receiptNo).includes(searchTerm)) {
      continue;
    }

    visibleCount++;
    if (!p.voided) visibleTotal += p.amount;

    html += `
      <tr class="${p.voided ? 'voided-row' : ''}">
        <td>${p.receiptNo}</td>
        <td>${escapeHtml(studentName)}</td>
        <td><strong>${formatKES(p.amount)}</strong></td>
        <td>${formatDate(p.date)}</td>
        <td>${methodLabel}${p.method === 'mpesa' && p.mpesaRef ? ` (${escapeHtml(p.mpesaRef)})` : ''}</td>
        <td>Term ${p.term} ${p.year}</td>
        <td>${escapeHtml(p.receivedBy || '-')}</td>
        <td>${p.voided ? '<span class="badge badge-voided">VOIDED</span>' : '<span class="badge badge-active">Valid</span>'}</td>
        <td>
          <div class="action-btns">
            ${!p.voided ? `
              <button class="btn-icon" title="Print Receipt" onclick="generateReport('receipt', null, '${p.id}')">${ic('printer','')}</button>
              <button class="btn-icon" title="Edit" onclick="editPayment('${p.id}')">${ic('pencil','')}</button>
              <button class="btn-icon" title="Void" onclick="voidPayment('${p.id}')">${ic('x-circle','')}</button>
            ` : `
              <button class="btn-icon" title="Unvoid" onclick="unvoidPayment('${p.id}')">${ic('undo-2','')}</button>
              <span title="${escapeHtml(p.voidReason)}" style="color: var(--text-muted); font-size: 0.8rem;">Voided: ${escapeHtml(p.voidReason?.substring(0, 20) || '')}</span>
            `}
          </div>
        </td>
      </tr>`;
  }

  tbody.innerHTML = html;
  countEl.textContent = `${visibleCount} payment${visibleCount !== 1 ? 's' : ''} | Total: ${formatKES(visibleTotal)}`;
  scheduleIcons();
}

// ============================================================
// FEE STRUCTURES
// ============================================================

/**
 * Open fee structure form
 */
function openFeeStructureForm(fsId) {
  document.getElementById('fs-edit-id').value = '';
  document.getElementById('fs-class').value = 'all';
  document.getElementById('fs-type').value = 'all';
  document.getElementById('fs-term').value = getCurrentTerm();
  populateYearSelect('fs-year');

  // Reset line items
  document.getElementById('fs-line-items').innerHTML = `
    <div class="line-item-row">
      <input type="text" class="line-item-name" placeholder="e.g. Tuition Fee">
      <input type="number" class="line-item-amount" placeholder="Amount" min="0" oninput="updateFSTotal()">
      <button class="btn-icon btn-remove" onclick="removeLineItem(this)">${ic('x','')}</button>
    </div>`;
  document.getElementById('fs-total').textContent = '0.00';
  document.getElementById('fs-due-date').value = '';

  populateStudentClassSelects();

  if (fsId) {
    loadFeeStructureIntoForm(fsId);
  }

  document.getElementById('fee-structure-modal').classList.add('active');
  SoundManager.play('notify');
  scheduleIcons();
}

/**
 * Load fee structure into form
 */
async function loadFeeStructureIntoForm(fsId) {
  const fs = await db.get('feeStructures', fsId);
  if (!fs) return;

  document.getElementById('fs-edit-id').value = fs.id;
  document.getElementById('fs-class').value = fs.class || 'all';
  document.getElementById('fs-type').value = fs.studentType || 'all';
  document.getElementById('fs-term').value = fs.term;
  document.getElementById('fs-year').value = fs.year;
  document.getElementById('fs-due-date').value = fs.dueDate || '';

  // Fill line items
  const container = document.getElementById('fs-line-items');
  container.innerHTML = '';
  (fs.lineItems || []).forEach(item => {
    container.innerHTML += `
      <div class="line-item-row">
        <input type="text" class="line-item-name" value="${escapeHtml(item.name)}" placeholder="e.g. Tuition Fee">
        <input type="number" class="line-item-amount" value="${item.amount}" placeholder="Amount" min="0" oninput="updateFSTotal()">
        <button class="btn-icon btn-remove" onclick="removeLineItem(this)">${ic('x','')}</button>
      </div>`;
  });
  if (!fs.lineItems || fs.lineItems.length === 0) {
    container.innerHTML = `
      <div class="line-item-row">
        <input type="text" class="line-item-name" placeholder="e.g. Tuition Fee">
        <input type="number" class="line-item-amount" placeholder="Amount" min="0" oninput="updateFSTotal()">
        <button class="btn-icon btn-remove" onclick="removeLineItem(this)">${ic('x','')}</button>
      </div>`;
  }
  updateFSTotal();
  scheduleIcons();
}

/**
 * Add a line item row
 */
function addLineItem() {
  const container = document.getElementById('fs-line-items');
  container.innerHTML += `
    <div class="line-item-row">
      <input type="text" class="line-item-name" placeholder="e.g. Tuition Fee">
      <input type="number" class="line-item-amount" placeholder="Amount" min="0" oninput="updateFSTotal()">
      <button class="btn-icon btn-remove" onclick="removeLineItem(this)">${ic('x','')}</button>
    </div>`;
  scheduleIcons();
}

/**
 * Remove a line item row
 */
function removeLineItem(btn) {
  const container = document.getElementById('fs-line-items');
  if (container.children.length > 1) {
    btn.parentElement.remove();
    updateFSTotal();
  }
}

/**
 * Update fee structure total
 */
function updateFSTotal() {
  const amounts = document.querySelectorAll('.line-item-amount');
  let total = 0;
  amounts.forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  document.getElementById('fs-total').textContent = total.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Save fee structure
 */
async function saveFeeStructure() {
  const editId = document.getElementById('fs-edit-id').value;
  const cls = document.getElementById('fs-class').value;
  const studentType = document.getElementById('fs-type').value;
  const term = parseInt(document.getElementById('fs-term').value);
  const year = parseInt(document.getElementById('fs-year').value);
  const dueDate = document.getElementById('fs-due-date').value;

  // Collect line items
  const names = document.querySelectorAll('#fs-line-items .line-item-name');
  const amounts = document.querySelectorAll('#fs-line-items .line-item-amount');
  const lineItems = [];

  names.forEach((nameInput, i) => {
    const name = nameInput.value.trim();
    const amount = parseFloat(amounts[i].value) || 0;
    if (name && amount > 0) {
      lineItems.push({ name, amount });
    }
  });

  if (lineItems.length === 0) {
    showToast('Please add at least one fee item with a name and amount', 'error');
    return;
  }

  if (!term || !year) {
    showToast('Please select term and year', 'error');
    return;
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const feeStructure = {
    id: editId || generateId(),
    class: cls,
    studentType,
    term,
    year,
    lineItems,
    totalAmount,
    dueDate,
    dateCreated: editId ? undefined : new Date().toISOString()
  };

  if (editId) {
    const existing = await db.get('feeStructures', editId);
    if (existing) feeStructure.dateCreated = existing.dateCreated;
  }

  try {
    await db.put('feeStructures', feeStructure);
    closeModal('fee-structure-modal');
    showToast(editId ? 'Fee structure updated' : 'Fee structure created', 'success');
    loadFeeStructuresList();
  } catch (err) {
    showToast('Error saving fee structure: ' + err.message, 'error');
  }
}

/**
 * Delete fee structure
 */
async function deleteFeeStructure(fsId) {
  showConfirm('Delete this fee structure? This cannot be undone.', async () => {
    try {
      await db.delete('feeStructures', fsId);
      showToast('Fee structure deleted', 'success');
      loadFeeStructuresList();
    } catch (err) {
      showToast('Error deleting: ' + err.message, 'error');
    }
  });
}

/**
 * Load fee structures list
 */
async function loadFeeStructuresList() {
  const container = document.getElementById('fee-structures-list');

  let structures = await db.getAll('feeStructures');

  // Apply filters
  const filterTerm = document.getElementById('fs-filter-term')?.value || '';
  const filterClass = document.getElementById('fs-filter-class')?.value || '';

  if (filterTerm) structures = structures.filter(fs => fs.term === parseInt(filterTerm));
  if (filterClass) structures = structures.filter(fs => fs.class === filterClass || fs.class === 'all');

  // Sort by term, year
  structures.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.term - b.term;
  });

  if (structures.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ic('layout-list','')}</div>
        <h3>No fee structures</h3>
        <p>Create fee structures for each term</p>
      </div>`;
    scheduleIcons();
    return;
  }

  let html = '';
  for (const fs of structures) {
    const itemsHtml = (fs.lineItems || []).map(item =>
      `<div><span>${escapeHtml(item.name)}</span><span>${formatKES(item.amount)}</span></div>`
    ).join('');

    html += `
      <div class="fee-structure-card">
        <h4>${escapeHtml(fs.class === 'all' ? 'All Classes' : fs.class)} — ${fs.studentType === 'all' ? 'All Types' : fs.studentType === 'boarder' ? 'Boarder' : 'Day Scholar'}</h4>
        <div class="fs-meta">
          <span class="fs-tag">Term ${fs.term} ${fs.year}</span>
          ${fs.dueDate ? `<span class="fs-tag">Due: ${formatDate(fs.dueDate)}</span>` : ''}
        </div>
        <div class="fs-total">${formatKES(fs.totalAmount)}</div>
        <div class="fs-items">${itemsHtml}</div>
        <div class="fs-actions">
          <button class="btn btn-outline btn-sm" onclick="openFeeStructureForm('${fs.id}')">${ic('pencil','')} Edit</button>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger);" onclick="deleteFeeStructure('${fs.id}')">${ic('trash-2','')} Delete</button>
        </div>
      </div>`;
  }

  container.innerHTML = html;
  scheduleIcons();
}

// ============================================================
// BURSARIES
// ============================================================

/**
 * Open bursary form
 */
function openBursaryForm() {
  document.getElementById('bursary-amount').value = '';
  document.getElementById('bursary-allocated-by').value = '';
  document.getElementById('bursary-term').value = getCurrentTerm();
  populateYearSelect('bursary-year');

  // Populate source select
  const sourceSelect = document.getElementById('bursary-source');
  sourceSelect.innerHTML = '';
  SV.BURSARY_SOURCES.forEach(s => {
    sourceSelect.innerHTML += `<option value="${s.value}">${s.label}</option>`;
  });

  // Populate student select
  populateStudentSelect('bursary-student');

  document.getElementById('bursary-modal').classList.add('active');
  SoundManager.play('notify');
}

/**
 * Save bursary
 */
async function saveBursary() {
  const studentId = document.getElementById('bursary-student').value;
  const amount = parseFloat(document.getElementById('bursary-amount').value);
  const source = document.getElementById('bursary-source').value;
  const term = parseInt(document.getElementById('bursary-term').value);
  const year = parseInt(document.getElementById('bursary-year').value);
  const allocatedBy = document.getElementById('bursary-allocated-by').value.trim();

  if (!studentId) { showToast('Please select a student', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
  if (!source) { showToast('Please select a source', 'error'); return; }
  if (!term || !year) { showToast('Please select term and year', 'error'); return; }

  const bursary = {
    id: generateId(),
    studentId,
    amount,
    source,
    term,
    year,
    allocatedBy,
    dateCreated: new Date().toISOString()
  };

  try {
    await db.add('bursaries', bursary);
    closeModal('bursary-modal');
    showToast('Bursary added successfully', 'success');
    loadBursariesList();
  } catch (err) {
    showToast('Error saving bursary: ' + err.message, 'error');
  }
}

/**
 * Delete bursary
 */
async function deleteBursary(bursaryId) {
  showConfirm('Delete this bursary?', async () => {
    try {
      await db.delete('bursaries', bursaryId);
      showToast('Bursary deleted', 'success');
      loadBursariesList();
    } catch (err) {
      showToast('Error deleting: ' + err.message, 'error');
    }
  });
}

/**
 * Load bursaries list
 */
async function loadBursariesList() {
  const tbody = document.getElementById('bursaries-tbody');
  let bursaries = await db.getAll('bursaries');

  const searchTerm = document.getElementById('bursary-search')?.value?.toLowerCase() || '';
  bursaries.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  if (bursaries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">${ic('award','')}</div>
            <h3>No bursaries recorded</h3>
            <p>Add bursaries allocated to students</p>
          </div>
        </td>
      </tr>`;
    scheduleIcons();
    return;
  }

  let html = '';
  for (const b of bursaries) {
    const student = await db.get('students', b.studentId);
    const studentName = student ? student.name : 'Unknown';
    const sourceLabel = SV.BURSARY_SOURCES.find(s => s.value === b.source)?.label || b.source;

    if (searchTerm && !studentName.toLowerCase().includes(searchTerm)) continue;

    html += `
      <tr>
        <td>${escapeHtml(studentName)}</td>
        <td><strong>${formatKES(b.amount)}</strong></td>
        <td>${escapeHtml(sourceLabel)}</td>
        <td>Term ${b.term}</td>
        <td>${b.year}</td>
        <td>${escapeHtml(b.allocatedBy || '-')}</td>
        <td>
          <button class="btn-icon" title="Delete" onclick="deleteBursary('${b.id}')">${ic('trash-2','')}</button>
        </td>
      </tr>`;
  }

  tbody.innerHTML = html;
  scheduleIcons();
}

// ============================================================
// FEE ADJUSTMENTS
// ============================================================

/**
 * Open adjustment form
 */
function openAdjustmentForm() {
  document.getElementById('adjustment-amount').value = '';
  document.getElementById('adjustment-reason').value = '';
  document.getElementById('adjustment-authorized-by').value = '';
  document.getElementById('adjustment-term').value = getCurrentTerm();
  populateYearSelect('adjustment-year');

  // Populate type select
  const typeSelect = document.getElementById('adjustment-type');
  typeSelect.innerHTML = '';
  SV.ADJUSTMENT_TYPES.forEach(t => {
    typeSelect.innerHTML += `<option value="${t.value}">${t.label}</option>`;
  });

  // Populate student select
  populateStudentSelect('adjustment-student');

  document.getElementById('adjustment-modal').classList.add('active');
  SoundManager.play('notify');
}

/**
 * Save adjustment
 */
async function saveAdjustment() {
  const studentId = document.getElementById('adjustment-student').value;
  const amount = parseFloat(document.getElementById('adjustment-amount').value);
  const type = document.getElementById('adjustment-type').value;
  const reason = document.getElementById('adjustment-reason').value.trim();
  const term = parseInt(document.getElementById('adjustment-term').value);
  const year = parseInt(document.getElementById('adjustment-year').value);
  const authorizedBy = document.getElementById('adjustment-authorized-by').value.trim();

  if (!studentId) { showToast('Please select a student', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
  if (!reason) { showToast('Please provide a reason', 'error'); return; }
  if (!term || !year) { showToast('Please select term and year', 'error'); return; }

  const adjType = SV.ADJUSTMENT_TYPES.find(t => t.value === type);

  const adjustment = {
    id: generateId(),
    studentId,
    amount: amount * (adjType?.sign || 1), // Apply sign based on type
    type,
    reason,
    term,
    year,
    authorizedBy,
    dateCreated: new Date().toISOString()
  };

  try {
    await db.add('feeAdjustments', adjustment);
    closeModal('adjustment-modal');
    showToast('Fee adjustment added', 'success');
    loadAdjustmentsList();
  } catch (err) {
    showToast('Error saving adjustment: ' + err.message, 'error');
  }
}

/**
 * Delete adjustment
 */
async function deleteAdjustment(adjId) {
  showConfirm('Delete this adjustment?', async () => {
    try {
      await db.delete('feeAdjustments', adjId);
      showToast('Adjustment deleted', 'success');
      loadAdjustmentsList();
    } catch (err) {
      showToast('Error deleting: ' + err.message, 'error');
    }
  });
}

/**
 * Load adjustments list
 */
async function loadAdjustmentsList() {
  const tbody = document.getElementById('adjustments-tbody');
  let adjustments = await db.getAll('feeAdjustments');

  const searchTerm = document.getElementById('adjustment-search')?.value?.toLowerCase() || '';
  adjustments.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  if (adjustments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">${ic('refresh-cw','')}</div>
            <h3>No adjustments recorded</h3>
            <p>Add fee adjustments, waivers, or penalties</p>
          </div>
        </td>
      </tr>`;
    scheduleIcons();
    return;
  }

  let html = '';
  for (const a of adjustments) {
    const student = await db.get('students', a.studentId);
    const studentName = student ? student.name : 'Unknown';
    const typeLabel = SV.ADJUSTMENT_TYPES.find(t => t.value === a.type)?.label || a.type;

    if (searchTerm && !studentName.toLowerCase().includes(searchTerm)) continue;

    const amountClass = a.amount < 0 ? 'balance-negative' : 'balance-positive';
    html += `
      <tr>
        <td>${escapeHtml(studentName)}</td>
        <td class="${amountClass}"><strong>${formatKES(Math.abs(a.amount))}</strong></td>
        <td>${escapeHtml(typeLabel)}</td>
        <td>${escapeHtml(a.reason)}</td>
        <td>Term ${a.term}</td>
        <td>${a.year}</td>
        <td>${escapeHtml(a.authorizedBy || '-')}</td>
        <td>
          <button class="btn-icon" title="Delete" onclick="deleteAdjustment('${a.id}')">${ic('trash-2','')}</button>
        </td>
      </tr>`;
  }

  tbody.innerHTML = html;
  scheduleIcons();
}

// ============================================================
// DEFAULTERS
// ============================================================

/**
 * Load defaulters list
 */
async function loadDefaultersList() {
  const tbody = document.getElementById('defaulters-tbody');
  const countEl = document.getElementById('defaulters-count');
  const totalEl = document.getElementById('defaulters-total');

  const term = parseInt(document.getElementById('defaulter-filter-term')?.value || getCurrentTerm());
  const year = parseInt(document.getElementById('defaulter-filter-year')?.value || new Date().getFullYear());
  const filterClass = document.getElementById('defaulter-filter-class')?.value || '';

  let defaulters = await db.getDefaulters(term, year);

  if (filterClass) {
    defaulters = defaulters.filter(d => d.student.class === filterClass);
  }

  if (defaulters.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <div class="empty-icon">${ic('check-circle','')}</div>
            <h3>No defaulters found</h3>
            <p>All students have cleared their fees</p>
          </div>
        </td>
      </tr>`;
    countEl.textContent = '0 defaulters';
    totalEl.textContent = '';
    scheduleIcons();
    return;
  }

  let html = '';
  let totalBalance = 0;
  defaulters.forEach((d, idx) => {
    totalBalance += d.balance;
    html += `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(d.student.admissionNumber)}</td>
        <td><strong>${escapeHtml(d.student.name)}</strong></td>
        <td>${escapeHtml(d.student.class)}</td>
        <td>${escapeHtml(d.student.stream)}</td>
        <td><span class="badge badge-${d.student.type}">${d.student.type === 'boarder' ? 'Boarder' : 'Day'}</span></td>
        <td>${formatKES(d.totalFees)}</td>
        <td>${formatKES(d.totalPayments + d.totalBursaries + d.totalAdjustments)}</td>
        <td class="balance-positive"><strong>${formatKES(d.balance)}</strong></td>
      </tr>`;
  });

  tbody.innerHTML = html;
  countEl.textContent = `${defaulters.length} defaulter${defaulters.length !== 1 ? 's' : ''}`;
  totalEl.textContent = `Total Outstanding: ${formatKES(totalBalance)}`;
  scheduleIcons();
}

/**
 * Generate defaulters report (print)
 */
function generateDefaultersReport() {
  window.print();
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Populate student select dropdown
 */
async function populateStudentSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const students = await db.getAll('students');
  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  select.innerHTML = '<option value="">Select Student</option>';
  students.forEach(s => {
    if (s.status === 'active' || !s.status) {
      select.innerHTML += `<option value="${s.id}">${escapeHtml(s.admissionNumber)} - ${escapeHtml(s.name)} (${escapeHtml(s.class)} ${escapeHtml(s.stream)})</option>`;
    }
  });
}

/**
 * Populate year select
 */
function populateYearSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const years = SV.getYears();
  const currentYear = new Date().getFullYear();

  select.innerHTML = '';
  years.forEach(y => {
    select.innerHTML += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
  });
}

/**
 * Verify PIN for sensitive operations
 */
async function verifyPin() {
  const pin = await db.getSetting('pin');
  if (!pin) {
    showToast('No PIN set. Please set a PIN in Settings first.', 'warning');
    return false;
  }

  return new Promise((resolve) => {
    const modal = document.getElementById('pin-modal');
    const input = document.getElementById('pin-input');
    const confirmBtn = document.getElementById('pin-confirm-btn');

    input.value = '';
    modal.classList.add('active');
    input.focus();

    SoundManager.play('notify');

    const cleanup = () => {
      modal.classList.remove('active');
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    };

    document.getElementById('pin-confirm-btn').addEventListener('click', () => {
      const entered = input.value;
      cleanup();
      if (entered === pin) {
        resolve(true);
      } else {
        showToast('Incorrect PIN', 'error');
        resolve(false);
      }
    });
  });
}

// ============================================================
// FEE TAB SWITCHING
// ============================================================

function initFeesTabs() {
  const tabGroup = document.getElementById('fees-tabs');
  if (!tabGroup) return;

  tabGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    const tabId = btn.dataset.tab;

    // Update active tab button
    tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show active tab content
    document.querySelectorAll('#page-fees .tab-content').forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');

    // Load data for the tab
    switch (tabId) {
      case 'fee-payments': loadPaymentsList(); break;
      case 'fee-structures': loadFeeStructuresList(); break;
      case 'fee-bursaries': loadBursariesList(); break;
      case 'fee-adjustments': loadAdjustmentsList(); break;
      case 'fee-defaulters': loadDefaultersList(); break;
    }
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initFeesTabs();

  // Payment search/filter
  const paymentSearch = document.getElementById('payment-search');
  if (paymentSearch) {
    paymentSearch.addEventListener('input', debounce(() => loadPaymentsList(), 300));
  }

  const paymentFilterTerm = document.getElementById('payment-filter-term');
  if (paymentFilterTerm) paymentFilterTerm.addEventListener('change', loadPaymentsList);

  const paymentFilterMethod = document.getElementById('payment-filter-method');
  if (paymentFilterMethod) paymentFilterMethod.addEventListener('change', loadPaymentsList);

  // Fee structure filters
  const fsFilterTerm = document.getElementById('fs-filter-term');
  if (fsFilterTerm) fsFilterTerm.addEventListener('change', loadFeeStructuresList);

  const fsFilterClass = document.getElementById('fs-filter-class');
  if (fsFilterClass) fsFilterClass.addEventListener('change', loadFeeStructuresList);

  // Defaulters filters
  const defaulterTerm = document.getElementById('defaulter-filter-term');
  if (defaulterTerm) defaulterTerm.addEventListener('change', loadDefaultersList);

  const defaulterYear = document.getElementById('defaulter-filter-year');
  if (defaulterYear) {
    populateYearSelect('defaulter-filter-year');
    defaulterYear.addEventListener('change', loadDefaultersList);
  }

  const defaulterClass = document.getElementById('defaulter-filter-class');
  if (defaulterClass) defaulterClass.addEventListener('change', loadDefaultersList);

  // M-Pesa ref toggle
  const methodSelect = document.getElementById('payment-method');
  if (methodSelect) {
    methodSelect.addEventListener('change', () => {
      const mpesaRow = document.getElementById('mpesa-ref-row');
      // Always show the row but the label indicates it's for M-Pesa
    });
  }
});
