/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-storage.js - IndexedDB Wrapper (All 10 Stores)
 * Powered By MortApps Studios
 */

class ShuleVineDB {
  constructor() {
    this.db = null;
    this.dbName = SV.DB_NAME;
    this.dbVersion = SV.DB_VERSION;
  }

  /**
   * Initialize the database with all stores
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store 1: students
        if (!db.objectStoreNames.contains('students')) {
          const studentsStore = db.createObjectStore('students', { keyPath: 'id' });
          studentsStore.createIndex('name', 'name', { unique: false });
          studentsStore.createIndex('class', 'class', { unique: false });
          studentsStore.createIndex('stream', 'stream', { unique: false });
          studentsStore.createIndex('classStream', ['class', 'stream'], { unique: false });
          studentsStore.createIndex('status', 'status', { unique: false });
          studentsStore.createIndex('admissionNumber', 'admissionNumber', { unique: true });
        }

        // Store 2: feeStructures
        if (!db.objectStoreNames.contains('feeStructures')) {
          const fsStore = db.createObjectStore('feeStructures', { keyPath: 'id' });
          fsStore.createIndex('term', 'term', { unique: false });
          fsStore.createIndex('year', 'year', { unique: false });
          fsStore.createIndex('class', 'class', { unique: false });
          fsStore.createIndex('studentType', 'studentType', { unique: false });
          fsStore.createIndex('termYear', ['term', 'year'], { unique: false });
          fsStore.createIndex('classTermYear', ['class', 'term', 'year'], { unique: false });
        }

        // Store 3: feePayments
        if (!db.objectStoreNames.contains('feePayments')) {
          const fpStore = db.createObjectStore('feePayments', { keyPath: 'id' });
          fpStore.createIndex('studentId', 'studentId', { unique: false });
          fpStore.createIndex('receiptNo', 'receiptNo', { unique: true });
          fpStore.createIndex('term', 'term', { unique: false });
          fpStore.createIndex('year', 'year', { unique: false });
          fpStore.createIndex('date', 'date', { unique: false });
          fpStore.createIndex('method', 'method', { unique: false });
          fpStore.createIndex('studentTermYear', ['studentId', 'term', 'year'], { unique: false });
          fpStore.createIndex('voided', 'voided', { unique: false });
        }

        // Store 4: bursaries
        if (!db.objectStoreNames.contains('bursaries')) {
          const burStore = db.createObjectStore('bursaries', { keyPath: 'id' });
          burStore.createIndex('studentId', 'studentId', { unique: false });
          burStore.createIndex('source', 'source', { unique: false });
          burStore.createIndex('term', 'term', { unique: false });
          burStore.createIndex('year', 'year', { unique: false });
          burStore.createIndex('studentTermYear', ['studentId', 'term', 'year'], { unique: false });
        }

        // Store 5: feeAdjustments
        if (!db.objectStoreNames.contains('feeAdjustments')) {
          const faStore = db.createObjectStore('feeAdjustments', { keyPath: 'id' });
          faStore.createIndex('studentId', 'studentId', { unique: false });
          faStore.createIndex('type', 'type', { unique: false });
          faStore.createIndex('term', 'term', { unique: false });
          faStore.createIndex('year', 'year', { unique: false });
          faStore.createIndex('studentTermYear', ['studentId', 'term', 'year'], { unique: false });
        }

        // Store 6: subjects
        if (!db.objectStoreNames.contains('subjects')) {
          const subStore = db.createObjectStore('subjects', { keyPath: 'id' });
          subStore.createIndex('kcseGroup', 'kcseGroup', { unique: false });
          subStore.createIndex('cbcGroup', 'cbcGroup', { unique: false });
          subStore.createIndex('curriculum', 'curriculum', { unique: false });
          subStore.createIndex('enabled', 'enabled', { unique: false });
          subStore.createIndex('code', 'code', { unique: false });
        }

        // Store 7: exams
        if (!db.objectStoreNames.contains('exams')) {
          const examStore = db.createObjectStore('exams', { keyPath: 'id' });
          examStore.createIndex('term', 'term', { unique: false });
          examStore.createIndex('year', 'year', { unique: false });
          examStore.createIndex('type', 'type', { unique: false });
          examStore.createIndex('class', 'class', { unique: false });
          examStore.createIndex('termYear', ['term', 'year'], { unique: false });
        }

        // Store 8: scores
        if (!db.objectStoreNames.contains('scores')) {
          const scoreStore = db.createObjectStore('scores', { keyPath: 'id' });
          scoreStore.createIndex('studentId', 'studentId', { unique: false });
          scoreStore.createIndex('examId', 'examId', { unique: false });
          scoreStore.createIndex('subjectId', 'subjectId', { unique: false });
          scoreStore.createIndex('studentExam', ['studentId', 'examId'], { unique: false });
          scoreStore.createIndex('studentExamSubject', ['studentId', 'examId', 'subjectId'], { unique: true });
        }

        // Store 9: examClearance
        if (!db.objectStoreNames.contains('examClearance')) {
          const ecStore = db.createObjectStore('examClearance', { keyPath: 'id' });
          ecStore.createIndex('studentId', 'studentId', { unique: false });
          ecStore.createIndex('examId', 'examId', { unique: false });
          ecStore.createIndex('studentExam', ['studentId', 'examId'], { unique: true });
        }

        // Store 10: settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Store 11: discipline
        if (!db.objectStoreNames.contains('discipline')) {
          const discStore = db.createObjectStore('discipline', { keyPath: 'id' });
          discStore.createIndex('studentId', 'studentId', { unique: false });
          discStore.createIndex('type', 'type', { unique: false });
          discStore.createIndex('category', 'category', { unique: false });
          discStore.createIndex('severity', 'severity', { unique: false });
          discStore.createIndex('date', 'date', { unique: false });
          discStore.createIndex('term', 'term', { unique: false });
          discStore.createIndex('year', 'year', { unique: false });
          discStore.createIndex('studentTermYear', ['studentId', 'term', 'year'], { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // ============================================================
  // GENERIC CRUD OPERATIONS
  // ============================================================

  /**
   * Add a record to a store
   */
  async add(storeName, record) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Put (add or update) a record in a store
   */
  async put(storeName, record) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a record by key
   */
  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all records from a store
   */
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a record by key
   */
  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get records by index
   */
  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get one record by index
   */
  async getOneByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Count records in a store
   */
  async count(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all records in a store
   */
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================
  // SETTINGS HELPERS
  // ============================================================

  async getSetting(key) {
    const record = await this.get('settings', key);
    return record ? record.value : null;
  }

  async setSetting(key, value) {
    return this.put('settings', { key, value });
  }

  async getAllSettings() {
    const records = await this.getAll('settings');
    const settings = {};
    records.forEach(r => settings[r.key] = r.value);
    return settings;
  }

  /**
   * Get next receipt number (never resets)
   */
  async getNextReceiptNo() {
    let counter = await this.getSetting('receiptCounter') || 0;
    counter++;
    await this.setSetting('receiptCounter', counter);
    return counter;
  }

  // ============================================================
  // SUBJECT INITIALIZATION
  // ============================================================

  /**
   * Initialize pre-loaded subjects based on curriculum
   */
  async initSubjects() {
    const existing = await this.getAll('subjects');
    const curriculum = await this.getSetting('gradingSystem') || '844';

    // Check if we already have subjects for the current curriculum
    const curSubjects = existing.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));
    if (curSubjects.length > 0) return; // Already initialized for this curriculum

    if (curriculum === 'cbc') {
      await this.initCBCSubjects();
    } else {
      await this.initKCSESubjects();
    }
  }

  /**
   * Initialize KCSE subjects
   */
  async initKCSESubjects() {
    for (const subj of SV.KCSE_SUBJECTS) {
      await this.add('subjects', {
        ...subj,
        curriculum: '844',
        enabled: subj.isCompulsory,
        isCustom: false,
        dateAdded: new Date().toISOString()
      });
    }
  }

  /**
   * Initialize CBC learning areas
   */
  async initCBCSubjects() {
    const gradeLevel = await this.getSetting('cbcGradeLevel') || 'g7';
    const cbcSubjects = getCBCSubjectsForLevel(gradeLevel);

    for (const subj of cbcSubjects) {
      await this.add('subjects', {
        ...subj,
        curriculum: 'cbc',
        enabled: subj.isCompulsory,
        isCustom: false,
        dateAdded: new Date().toISOString()
      });
    }
  }

  /**
   * Switch curriculum - remove old subjects, add new ones
   */
  async switchCurriculum(newCurriculum) {
    // Remove non-custom subjects
    const existing = await this.getAll('subjects');
    for (const s of existing) {
      if (!s.isCustom) {
        await this.delete('subjects', s.id);
      }
    }

    // Save new curriculum
    await this.setSetting('gradingSystem', newCurriculum);

    // Initialize new subjects
    if (newCurriculum === 'cbc') {
      await this.initCBCSubjects();
    } else {
      await this.initKCSESubjects();
    }
  }

  /**
   * Get subjects filtered by curriculum
   */
  async getSubjectsByCurriculum(curriculum) {
    const all = await this.getAll('subjects');
    if (!curriculum) return all;
    return all.filter(s => s.curriculum === curriculum || (!s.curriculum && curriculum === '844'));
  }

  // ============================================================
  // BACKUP & RESTORE
  // ============================================================

  /**
   * Export all data as a single JSON file
   */
  async exportBackup() {
    const storeNames = ['students', 'feeStructures', 'feePayments', 'bursaries', 'feeAdjustments', 'subjects', 'exams', 'scores', 'examClearance', 'settings', 'discipline'];
    const backup = {
      version: SV.APP_VERSION,
      appName: SV.APP_NAME,
      exportedAt: new Date().toISOString(),
      schoolName: await this.getSetting('schoolName') || 'Unknown School',
      stores: {}
    };

    for (const storeName of storeNames) {
      try {
        backup.stores[storeName] = await this.getAll(storeName);
      } catch (e) {
        console.warn(`Could not export store ${storeName}:`, e);
        backup.stores[storeName] = [];
      }
    }

    return backup;
  }

  /**
   * Import data from a backup JSON file
   * Returns a summary of what was imported
   */
  async importBackup(backupData) {
    if (!backupData || !backupData.stores) {
      throw new Error('Invalid backup file format');
    }

    const storeNames = ['students', 'feeStructures', 'feePayments', 'bursaries', 'feeAdjustments', 'subjects', 'exams', 'scores', 'examClearance', 'settings', 'discipline'];
    const summary = {};

    // Clear existing data and import
    for (const storeName of storeNames) {
      if (backupData.stores[storeName]) {
        await this.clear(storeName);
        for (const record of backupData.stores[storeName]) {
          try {
            await this.put(storeName, record);
          } catch (e) {
            console.warn(`Error importing record to ${storeName}:`, e);
          }
        }
        summary[storeName] = backupData.stores[storeName].length;
      }
    }

    return summary;
  }

  // ============================================================
  // AGGREGATE QUERIES
  // ============================================================

  /**
   * Get student's fee payments for a specific term/year
   */
  async getStudentPayments(studentId, term, year) {
    const allPayments = await this.getByIndex('feePayments', 'studentId', studentId);
    return allPayments.filter(p => {
      if (p.voided) return false;
      if (term !== undefined && p.term !== term) return false;
      if (year !== undefined && p.year !== year) return false;
      return true;
    });
  }

  /**
   * Get student's bursaries for a specific term/year
   */
  async getStudentBursaries(studentId, term, year) {
    const all = await this.getByIndex('bursaries', 'studentId', studentId);
    return all.filter(b => {
      if (term !== undefined && b.term !== term) return false;
      if (year !== undefined && b.year !== year) return false;
      return true;
    });
  }

  /**
   * Get student's fee adjustments for a specific term/year
   */
  async getStudentAdjustments(studentId, term, year) {
    const all = await this.getByIndex('feeAdjustments', 'studentId', studentId);
    return all.filter(a => {
      if (term !== undefined && a.term !== term) return false;
      if (year !== undefined && a.year !== year) return false;
      return true;
    });
  }

  /**
   * Get student's fee structures for a specific term/year
   */
  async getStudentFeeStructures(studentId, term, year) {
    // First get the student to know their class and type
    const student = await this.get('students', studentId);
    if (!student) return [];

    const allFS = await this.getAll('feeStructures');
    return allFS.filter(fs => {
      if (fs.class !== student.class && fs.class !== 'all') return false;
      if (fs.studentType !== student.type && fs.studentType !== 'all') return false;
      if (term !== undefined && fs.term !== term) return false;
      if (year !== undefined && fs.year !== year) return false;
      return true;
    });
  }

  /**
   * Get full fee balance breakdown for a student
   */
  async getStudentFeeBalance(studentId, term, year) {
    const structures = await this.getStudentFeeStructures(studentId, term, year);
    const payments = await this.getStudentPayments(studentId, term, year);
    const bursaries = await this.getStudentBursaries(studentId, term, year);
    const adjustments = await this.getStudentAdjustments(studentId, term, year);

    return calculateBalance(structures, payments, bursaries, adjustments, term, year);
  }

  /**
   * Get all fee defaulters for a term/year
   * Returns array of { student, balance }
   */
  async getDefaulters(term, year, threshold = 0) {
    const students = await this.getAll('students');
    const includeExpelled = await this.getSetting('includeExpelledInDefaulters') || false;
    const defaulters = [];

    for (const student of students) {
      if (student.status === 'transferred' || student.status === 'graduated') continue;
      if (student.status === 'expelled' && !includeExpelled) continue;
      const balance = await this.getStudentFeeBalance(student.id, term, year);
      if (balance.balance > threshold) {
        defaulters.push({ student, ...balance });
      }
    }

    // Sort by balance descending (biggest defaulters first)
    defaulters.sort((a, b) => b.balance - a.balance);
    return defaulters;
  }

  /**
   * Get scores for an exam
   */
  async getExamScores(examId) {
    return this.getByIndex('scores', 'examId', examId);
  }

  /**
   * Get scores for a student in an exam
   */
  async getStudentExamScores(studentId, examId) {
    const all = await this.getByIndex('scores', 'studentId', studentId);
    return all.filter(s => s.examId === examId);
  }

  /**
   * Get exam clearance for a student
   */
  async getStudentExamClearance(studentId, examId) {
    const all = await this.getByIndex('examClearance', 'studentId', studentId);
    return all.find(c => c.examId === examId) || null;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const students = await this.getAll('students');
    const activeStudents = students.filter(s => s.status === 'active' || !s.status);
    const payments = await this.getAll('feePayments');
    const validPayments = payments.filter(p => !p.voided);
    const exams = await this.getAll('exams');
    const curriculum = await this.getSetting('gradingSystem') || '844';
    const disciplineRecords = await this.getAll('discipline');
    const currentTerm = getCurrentTerm();
    const currentYear = new Date().getFullYear();

    // Discipline stats for current term
    const termDiscipline = disciplineRecords.filter(d => d.term === currentTerm && d.year === currentYear);
    const termIncidents = termDiscipline.filter(d => d.type === 'incident');
    const termMerits = termDiscipline.filter(d => d.type === 'merit');

    const totalCollected = validPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Count by class
    const classCounts = {};
    activeStudents.forEach(s => {
      const cls = s.class || 'Unassigned';
      classCounts[cls] = (classCounts[cls] || 0) + 1;
    });

    // Count by type
    const typeCounts = { boarder: 0, day: 0 };
    activeStudents.forEach(s => {
      if (s.type === 'boarder') typeCounts.boarder++;
      else if (s.type === 'day') typeCounts.day++;
    });

    // Gender counts (if tracked)
    const genderCounts = { male: 0, female: 0, other: 0 };
    activeStudents.forEach(s => {
      if (s.gender) genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
    });

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalCollected,
      totalPayments: validPayments.length,
      voidedPayments: payments.length - validPayments.length,
      totalExams: exams.length,
      currentTerm,
      currentYear,
      classCounts,
      typeCounts,
      genderCounts,
      curriculum,
      disciplineStats: {
        totalIncidents: termIncidents.length,
        totalMerits: termMerits.length,
        criticalIncidents: termIncidents.filter(d => d.severity === 'critical').length,
        topInfraction: getTopCategory(termIncidents),
        totalAllTime: disciplineRecords.length
      }
    };
  }
}

// Global DB instance
const db = new ShuleVineDB();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShuleVineDB, db };
}
