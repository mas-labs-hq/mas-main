/**
 * ShuleVine Demo - sd-demo.js
 * Demo version feature gating, caps, and upgrade flow
 * Powered By MortApps Studios
 */

// ============================================================
// DEMO FEATURE GATING
// ============================================================

const DEMO_LOCKED_FEATURES = {
  'backup': 'Export Backup',
  'import-backup': 'Restore from Backup',
  'pin': 'Set / Change PIN',
  'protect': 'Protect Data',
  'pdf-reports': 'Export PDF Reports'
};

function showProPopup(featureKey) {
  const featureName = DEMO_LOCKED_FEATURES[featureKey] || 'This feature';
  const overlay = document.createElement('div');
  overlay.className = 'pro-popup-overlay';
  overlay.innerHTML = `
    <div class="pro-popup">
      <div class="pro-popup-icon">${ic('lock','')}</div>
      <h3>Premium Feature</h3>
      <p>${featureName} is available in the premium version of ShuleVine. Upgrade now to unlock all features and manage your school without limits.</p>
      <div class="pro-popup-actions">
        <button class="btn btn-primary btn-block" onclick="this.closest('.pro-popup-overlay').remove();openUpgradeForm();">${ic('crown','btn-icon-lucide')} Upgrade to Premium</button>
        <button class="btn btn-outline btn-block" onclick="this.closest('.pro-popup-overlay').remove();">Maybe Later</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  scheduleIcons();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  SoundManager.play('notify');
}

function initDemoFeatureLocks() {
  document.addEventListener('click', (e) => {
    const lockedEl = e.target.closest('.demo-pro-only');
    if (lockedEl) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showProPopup(lockedEl.dataset.demoFeature || 'unknown');
    }
  }, true);
}

// ============================================================
// STUDENT CAP
// ============================================================

async function isStudentCapReached() {
  if (!SV.IS_DEMO) return false;
  const count = await db.count('students');
  return count >= SV.DEMO_STUDENT_CAP;
}

function showStudentCapWarning() {
  showToast('Demo limit reached: Maximum ' + SV.DEMO_STUDENT_CAP + ' students. Upgrade to premium for unlimited students.', 'warning');
}

// ============================================================
// EXAM CAP
// ============================================================

async function isExamCapReached() {
  if (!SV.IS_DEMO) return false;
  const count = await db.count('exams');
  return count >= SV.DEMO_EXAM_CAP;
}

function showExamCapWarning() {
  showToast('Demo limit reached: Maximum ' + SV.DEMO_EXAM_CAP + ' exams. Upgrade to premium for unlimited exams.', 'warning');
}

// ============================================================
// UPGRADE FORM
// ============================================================

function openUpgradeForm() {
  const modal = document.getElementById('upgrade-modal');
  if (!modal) return;
  const form = document.getElementById('upgrade-form');
  if (form) form.reset();
  db.getSetting('schoolName').then(name => {
    const si = document.getElementById('upgrade-school');
    if (si && name) si.value = name;
  });
  const fb = document.getElementById('upgrade-form-body');
  const sb = document.getElementById('upgrade-success-body');
  if (fb) fb.style.display = '';
  if (sb) sb.style.display = 'none';
  modal.classList.add('active');
  SoundManager.play('click');
}

function closeUpgradeForm() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.remove('active');
}

async function submitUpgradeForm() {
  const form = document.getElementById('upgrade-form');
  if (!form) return;
  const name = document.getElementById('upgrade-name')?.value?.trim();
  const position = document.getElementById('upgrade-position')?.value;
  const school = document.getElementById('upgrade-school')?.value?.trim();
  const duration = document.getElementById('upgrade-duration')?.value;
  if (!name || !position || !school || !duration) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  const btn = document.getElementById('upgrade-submit-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0 auto;"></div>'; }
  try {
    const formData = new FormData(form);
    const response = await fetch('https://formspree.io/f/mjgekqvw', {
      method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const fb = document.getElementById('upgrade-form-body');
      const sb = document.getElementById('upgrade-success-body');
      if (fb) fb.style.display = 'none';
      if (sb) sb.style.display = '';
      SoundManager.play('success');
      setTimeout(() => closeUpgradeForm(), 5000);
    } else {
      showToast('Something went wrong. Please try again.', 'error');
    }
  } catch (err) {
    showToast('Network error. Please check your connection.', 'error');
  }
  if (btn) { btn.disabled = false; btn.innerHTML = ic('crown','btn-icon-lucide') + ' Request Upgrade'; scheduleIcons(); }
}

// ============================================================
// DEMO WATERMARK FOR PDFs
// ============================================================

function addDemoWatermarkSimple(doc) {
  if (!SV.IS_DEMO) return;
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.saveGraphicsState();
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(72);
    doc.setFont(undefined, 'bold');
    doc.text('D E M O', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 35 });
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(36);
    doc.text('DEMO VERSION', pageWidth / 2, pageHeight / 2 + 30, { align: 'center', angle: 35 });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);
  }
}

// ============================================================
// INIT DEMO ON LOAD
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (SV.IS_DEMO) initDemoFeatureLocks();
});
