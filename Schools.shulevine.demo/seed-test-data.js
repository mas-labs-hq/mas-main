/**
 * ShuleVine Test Data Seeder
 * Simulates Hillcrest Secondary School - 8-4-4 System
 * 
 * HOW TO USE (3 ways):
 * 
 * Method 1 - Settings Page (Recommended):
 *   Go to Settings > Test Data > Click "Load Sample School"
 * 
 * Method 2 - Import Seed File:
 *   Go to Settings > Test Data > Click "Import Seed File" > Select this .js file
 * 
 * Method 3 - Console (Manual):
 *   1. Open Developer Tools (F12 or Ctrl+Shift+I)
 *   2. Go to Console tab
 *   3. Type: allow pasting  (press Enter, Chrome security step)
 *   4. Paste this entire script and press Enter
 *   5. Refresh the page (F5)
 * 
 * This will populate the database with:
 * - School profile settings
 * - 4 forms x 2 streams = 8 class/stream combos
 * - 30 students with realistic Kenyan names
 * - Fee structures for Term 1 2026
 * - 47 fee payment records
 * - 5 exams (Mid-Term + End-Term across forms)
 * - Scores for all students in all exams
 * - 8 discipline incidents + 6 merits
 * - 2 bursaries + 2 adjustments
 * 
 * WARNING: This will ADD to existing data. If you want a clean slate,
 * go to Settings > Backup & Restore and clear data first, or run:
 *   indexedDB.deleteDatabase('ShuleVineDB')
 * in the console before seeding.
 */

(async function seedTestData() {
  console.log('🌱 Seeding ShuleVine test data...');
  console.log('School: Hillcrest Secondary School (8-4-4)');

  // Wait for db to be ready
  if (typeof db === 'undefined') {
    console.error('❌ Database not found. Make sure ShuleVine is loaded first.');
    return;
  }

  const TERM = 1;
  const YEAR = 2026;

  // ========================================
  // SCHOOL PROFILE
  // ========================================
  await db.setSetting('schoolName', 'Hillcrest Secondary School');
  await db.setSetting('motto', 'Excellence Through Diligence');
  await db.setSetting('county', 'Nakuru');
  await db.setSetting('subCounty', 'Nakuru East');
  await db.setSetting('category', 'Extra-County');
  await db.setSetting('gradingSystem', '844');
  await db.setSetting('clearanceThreshold', '0');
  await db.setSetting('lateFee', '500');
  await db.setSetting('nextTermOpeningDate', '2026-05-12');
  await db.setSetting('receiptCounter', '1000');
  console.log('✅ School profile set');

  // ========================================
  // CLASSES & STREAMS
  // ========================================
  const classes = [
    { name: 'Form 1', streams: ['A', 'B'] },
    { name: 'Form 2', streams: ['A', 'B'] },
    { name: 'Form 3', streams: ['A', 'B'] },
    { name: 'Form 4', streams: ['A', 'B'] }
  ];
  await db.setSetting('classes', classes);
  console.log('✅ Classes set (Form 1-4, 2 streams each)');

  // ========================================
  // SUBJECTS (8-4-4 KCSE)
  // ========================================
  const subjects844 = [
    { id: 'eng', name: 'English', code: '101', isCompulsory: true, kcseGroup: 1, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'kisw', name: 'Kiswahili', code: '102', isCompulsory: true, kcseGroup: 1, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'math', name: 'Mathematics', code: '121', isCompulsory: true, kcseGroup: 1, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'bio', name: 'Biology', code: '231', isCompulsory: false, kcseGroup: 2, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'phys', name: 'Physics', code: '232', isCompulsory: false, kcseGroup: 2, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'chem', name: 'Chemistry', code: '233', isCompulsory: false, kcseGroup: 2, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'hist', name: 'History & Government', code: '311', isCompulsory: false, kcseGroup: 3, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'cre', name: 'CRE', code: '313', isCompulsory: false, kcseGroup: 3, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'geo', name: 'Geography', code: '312', isCompulsory: false, kcseGroup: 3, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'agri', name: 'Agriculture', code: '443', isCompulsory: false, kcseGroup: 4, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'biz', name: 'Business Studies', code: '455', isCompulsory: false, kcseGroup: 4, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true },
    { id: 'comp', name: 'Computer Studies', code: '451', isCompulsory: false, kcseGroup: 4, curriculum: '844', gradeScale: 'kcse', maxScore: 100, enabled: true }
  ];
  for (const subj of subjects844) {
    await db.put('subjects', subj);
  }
  console.log('✅ 12 KCSE subjects loaded');

  // ========================================
  // STUDENTS (30 realistic Kenyan students)
  // ========================================
  const studentsData = [
    // Form 1 Stream A (8 students)
    { admNo: 'HC/2026/001', fname: 'Wanjiku', lname: 'Njoroge', gender: 'female', cls: 'Form 1', stream: 'A', type: 'boarder', guardian: 'Grace Njoroge', phone: '0721 345 678' },
    { admNo: 'HC/2026/002', fname: 'Otieno', lname: 'Oketch', gender: 'male', cls: 'Form 1', stream: 'A', type: 'boarder', guardian: 'James Oketch', phone: '0733 456 789' },
    { admNo: 'HC/2026/003', fname: 'Kamau', lname: 'Mwangi', gender: 'male', cls: 'Form 1', stream: 'A', type: 'day', guardian: 'Mary Mwangi', phone: '0712 567 890' },
    { admNo: 'HC/2026/004', fname: 'Amina', lname: 'Hassan', gender: 'female', cls: 'Form 1', stream: 'A', type: 'boarder', guardian: 'Fatuma Hassan', phone: '0745 678 901' },
    { admNo: 'HC/2026/005', fname: 'Chemutai', lname: 'Kiprop', gender: 'female', cls: 'Form 1', stream: 'A', type: 'boarder', guardian: 'Esther Kiprop', phone: '0756 789 012' },
    { admNo: 'HC/2026/006', fname: 'Brian', lname: 'Ochieng', gender: 'male', cls: 'Form 1', stream: 'A', type: 'day', guardian: 'Rose Ochieng', phone: '0767 890 123' },
    { admNo: 'HC/2026/007', fname: 'Njeri', lname: 'Kariuki', gender: 'female', cls: 'Form 1', stream: 'A', type: 'boarder', guardian: 'Peter Kariuki', phone: '0778 901 234' },
    { admNo: 'HC/2026/008', fname: 'Dennis', lname: 'Musyoka', gender: 'male', cls: 'Form 1', stream: 'A', type: 'day', guardian: 'Agnes Musyoka', phone: '0789 012 345' },

    // Form 1 Stream B (7 students)
    { admNo: 'HC/2026/009', fname: 'Faith', lname: 'Wambui', gender: 'female', cls: 'Form 1', stream: 'B', type: 'boarder', guardian: 'Lucy Wambui', phone: '0711 234 567' },
    { admNo: 'HC/2026/010', fname: 'Kipchumba', lname: 'Maiyo', gender: 'male', cls: 'Form 1', stream: 'B', type: 'boarder', guardian: 'Samuel Maiyo', phone: '0722 345 678' },
    { admNo: 'HC/2026/011', fname: 'Lucas', lname: 'Mutua', gender: 'male', cls: 'Form 1', stream: 'B', type: 'day', guardian: 'Janet Mutua', phone: '0733 456 789' },
    { admNo: 'HC/2026/012', fname: 'Sharon', lname: 'Chepkemoi', gender: 'female', cls: 'Form 1', stream: 'B', type: 'boarder', guardian: 'Loise Chepkemoi', phone: '0744 567 890' },
    { admNo: 'HC/2026/013', fname: 'Eric', lname: 'Kibet', gender: 'male', cls: 'Form 1', stream: 'B', type: 'day', guardian: 'David Kibet', phone: '0755 678 901' },
    { admNo: 'HC/2026/014', fname: 'Mercy', lname: 'Achieng', gender: 'female', cls: 'Form 1', stream: 'B', type: 'boarder', guardian: 'Pamela Achieng', phone: '0766 789 012' },
    { admNo: 'HC/2026/015', fname: 'Joseph', lname: 'Maina', gender: 'male', cls: 'Form 1', stream: 'B', type: 'boarder', guardian: 'Hannah Maina', phone: '0777 890 123' },

    // Form 2 Stream A (5 students)
    { admNo: 'HC/2025/016', fname: 'Valerie', lname: 'Akinyi', gender: 'female', cls: 'Form 2', stream: 'A', type: 'boarder', guardian: 'Beatrice Akinyi', phone: '0788 901 234' },
    { admNo: 'HC/2025/017', fname: 'Kelvin', lname: 'Kimutai', gender: 'male', cls: 'Form 2', stream: 'A', type: 'day', guardian: 'Philip Kimutai', phone: '0799 012 345' },
    { admNo: 'HC/2025/018', fname: 'Cynthia', lname: 'Nyambura', gender: 'female', cls: 'Form 2', stream: 'A', type: 'boarder', guardian: 'Margaret Nyambura', phone: '0710 123 456' },
    { admNo: 'HC/2025/019', fname: 'Samuel', lname: 'Kiprono', gender: 'male', cls: 'Form 2', stream: 'A', type: 'boarder', guardian: 'Rebecca Kiprono', phone: '0721 234 567' },
    { admNo: 'HC/2025/020', fname: 'Ann', lname: 'Wangari', gender: 'female', cls: 'Form 2', stream: 'A', type: 'day', guardian: 'Ruth Wangari', phone: '0732 345 678' },

    // Form 3 Stream A (5 students)
    { admNo: 'HC/2024/021', fname: 'Martin', lname: 'Odhiambo', gender: 'male', cls: 'Form 3', stream: 'A', type: 'boarder', guardian: 'George Odhiambo', phone: '0743 456 789' },
    { admNo: 'HC/2024/022', fname: 'Diana', lname: 'Nabwire', gender: 'female', cls: 'Form 3', stream: 'A', type: 'boarder', guardian: 'Florence Nabwire', phone: '0754 567 890' },
    { admNo: 'HC/2024/023', fname: 'Anthony', lname: 'Gikonyo', gender: 'male', cls: 'Form 3', stream: 'A', type: 'day', guardian: 'Simon Gikonyo', phone: '0765 678 901' },
    { admNo: 'HC/2024/024', fname: 'Lydia', lname: 'Jerono', gender: 'female', cls: 'Form 3', stream: 'A', type: 'boarder', guardian: 'Nancy Jerono', phone: '0776 789 012' },
    { admNo: 'HC/2024/025', fname: 'Francis', lname: 'Barasa', gender: 'male', cls: 'Form 3', stream: 'A', type: 'boarder', guardian: 'Jackson Barasa', phone: '0787 890 123' },

    // Form 4 Stream A (5 students)
    { admNo: 'HC/2023/026', fname: 'Grace', lname: 'Muthoni', gender: 'female', cls: 'Form 4', stream: 'A', type: 'boarder', guardian: 'Alice Muthoni', phone: '0798 901 234' },
    { admNo: 'HC/2023/027', fname: 'Kevin', lname: 'Wafula', gender: 'male', cls: 'Form 4', stream: 'A', type: 'boarder', guardian: 'Patrick Wafula', phone: '0709 012 345' },
    { admNo: 'HC/2023/028', fname: 'Susan', lname: 'Chebet', gender: 'female', cls: 'Form 4', stream: 'A', type: 'day', guardian: 'Violet Chebet', phone: '0720 123 456' },
    { admNo: 'HC/2023/029', fname: 'Emmanuel', lname: 'Ngugi', gender: 'male', cls: 'Form 4', stream: 'A', type: 'boarder', guardian: 'Daniel Ngugi', phone: '0731 234 567' },
    { admNo: 'HC/2023/030', fname: 'Irene', lname: 'Siyoi', gender: 'female', cls: 'Form 4', stream: 'A', type: 'boarder', guardian: 'Margaret Siyoi', phone: '0742 345 678' }
  ];

  const students = [];
  for (const s of studentsData) {
    const student = {
      id: generateId(),
      admissionNumber: s.admNo,
      name: `${s.fname} ${s.lname}`,
      firstName: s.fname,
      lastName: s.lname,
      gender: s.gender,
      class: s.cls,
      stream: s.stream,
      type: s.type,
      curriculum: '844',
      guardianName: s.guardian,
      guardianPhone: s.phone,
      status: 'active',
      subjectCombination: [],
      streamSortOrder: 0,
      dateAdded: `${YEAR}-01-15`,
      createdAt: new Date().toISOString()
    };
    students.push(student);
    await db.put('students', student);
  }
  console.log(`✅ ${students.length} students created`);

  // ========================================
  // FEE STRUCTURES
  // ========================================
  const feeStructures = [
    { id: generateId(), class: 'all', studentType: 'boarder', term: TERM, year: YEAR, lineItems: [
      { name: 'Tuition Fee', amount: 15000 },
      { name: 'Boarding Fee', amount: 12000 },
      { name: 'Medical Fee', amount: 2000 },
      { name: 'Activity Fee', amount: 1500 },
      { name: 'Development Levy', amount: 3000 }
    ], totalAmount: 33500, dueDate: `${YEAR}-02-01`, createdAt: new Date().toISOString() },
    { id: generateId(), class: 'all', studentType: 'day', term: TERM, year: YEAR, lineItems: [
      { name: 'Tuition Fee', amount: 15000 },
      { name: 'Lunch Fee', amount: 4000 },
      { name: 'Medical Fee', amount: 1500 },
      { name: 'Activity Fee', amount: 1500 },
      { name: 'Development Levy', amount: 2000 }
    ], totalAmount: 24000, dueDate: `${YEAR}-02-01`, createdAt: new Date().toISOString() }
  ];
  for (const fs of feeStructures) {
    await db.put('feeStructures', fs);
  }
  console.log('✅ Fee structures: Boarder KES 33,500 | Day Scholar KES 24,000');

  // ========================================
  // FEE PAYMENTS (47 records - mixed)
  // ========================================
  let receiptNo = 1001;
  const paymentEntries = [
    // Fully paid students
    { idx: 0, amount: 33500, method: 'mpesa', date: '2026-01-20', mpesaRef: 'SHK4R7B9VX', paidBy: 'Grace Njoroge', receivedBy: 'Mr. Kiptoo' },
    { idx: 1, amount: 33500, method: 'bank', date: '2026-01-22', paidBy: 'James Oketch', receivedBy: 'Mr. Kiptoo' },
    { idx: 3, amount: 33500, method: 'cash', date: '2026-01-25', paidBy: 'Fatuma Hassan', receivedBy: 'Mrs. Wanjiru' },

    // Partially paid (2 installments)
    { idx: 2, amount: 12000, method: 'mpesa', date: '2026-01-28', mpesaRef: 'MT8K2NP5RQ', paidBy: 'Mary Mwangi', receivedBy: 'Mr. Kiptoo' },
    { idx: 2, amount: 12000, method: 'cash', date: '2026-02-15', paidBy: 'Mary Mwangi', receivedBy: 'Mrs. Wanjiru' },

    { idx: 4, amount: 20000, method: 'bank', date: '2026-01-30', paidBy: 'Esther Kiprop', receivedBy: 'Mr. Kiptoo' },
    { idx: 4, amount: 13500, method: 'mpesa', date: '2026-02-10', mpesaRef: 'LP3D7WM2TN', paidBy: 'Esther Kiprop', receivedBy: 'Mr. Kiptoo' },

    { idx: 5, amount: 24000, method: 'cash', date: '2026-02-01', paidBy: 'Rose Ochieng', receivedBy: 'Mrs. Wanjiru' },
    { idx: 6, amount: 33500, method: 'mpesa', date: '2026-02-03', mpesaRef: 'QR9F5XB4JH', paidBy: 'Peter Kariuki', receivedBy: 'Mr. Kiptoo' },

    // Partially paid - still has balance
    { idx: 7, amount: 10000, method: 'cash', date: '2026-02-05', paidBy: 'Agnes Musyoka', receivedBy: 'Mrs. Wanjiru' },
    { idx: 8, amount: 15000, method: 'mpesa', date: '2026-02-07', mpesaRef: 'NW2G8YP6KE', paidBy: 'Lucy Wambui', receivedBy: 'Mr. Kiptoo' },
    { idx: 9, amount: 33500, method: 'bank', date: '2026-02-08', paidBy: 'Samuel Maiyo', receivedBy: 'Mr. Kiptoo' },
    { idx: 10, amount: 12000, method: 'cash', date: '2026-02-10', paidBy: 'Janet Mutua', receivedBy: 'Mrs. Wanjiru' },
    { idx: 11, amount: 33500, method: 'mpesa', date: '2026-02-12', mpesaRef: 'BT7H3ZM9RF', paidBy: 'Loise Chepkemoi', receivedBy: 'Mr. Kiptoo' },
    { idx: 12, amount: 5000, method: 'cash', date: '2026-02-14', paidBy: 'David Kibet', receivedBy: 'Mrs. Wanjiru' },
    { idx: 13, amount: 33500, method: 'bank', date: '2026-02-15', paidBy: 'Pamela Achieng', receivedBy: 'Mr. Kiptoo' },
    { idx: 14, amount: 33500, method: 'mpesa', date: '2026-02-17', mpesaRef: 'KX4J6VQ8DN', paidBy: 'Hannah Maina', receivedBy: 'Mr. Kiptoo' },

    // Form 2 payments
    { idx: 15, amount: 33500, method: 'cash', date: '2026-01-18', paidBy: 'Beatrice Akinyi', receivedBy: 'Mrs. Wanjiru' },
    { idx: 16, amount: 24000, method: 'mpesa', date: '2026-01-20', mpesaRef: 'YE5L9CW3PA', paidBy: 'Philip Kimutai', receivedBy: 'Mr. Kiptoo' },
    { idx: 17, amount: 20000, method: 'bank', date: '2026-01-25', paidBy: 'Margaret Nyambura', receivedBy: 'Mr. Kiptoo' },
    { idx: 17, amount: 13500, method: 'cash', date: '2026-02-20', paidBy: 'Margaret Nyambura', receivedBy: 'Mrs. Wanjiru' },
    { idx: 18, amount: 33500, method: 'mpesa', date: '2026-01-28', mpesaRef: 'UD6M2RK7HS', paidBy: 'Rebecca Kiprono', receivedBy: 'Mr. Kiptoo' },
    { idx: 19, amount: 24000, method: 'cash', date: '2026-02-02', paidBy: 'Ruth Wangari', receivedBy: 'Mrs. Wanjiru' },

    // Form 3 payments
    { idx: 20, amount: 33500, method: 'bank', date: '2026-01-22', paidBy: 'George Odhiambo', receivedBy: 'Mr. Kiptoo' },
    { idx: 21, amount: 15000, method: 'mpesa', date: '2026-01-30', mpesaRef: 'WG8N4TX1BC', paidBy: 'Florence Nabwire', receivedBy: 'Mr. Kiptoo' },
    { idx: 22, amount: 24000, method: 'cash', date: '2026-02-01', paidBy: 'Simon Gikonyo', receivedBy: 'Mrs. Wanjiru' },
    { idx: 23, amount: 33500, method: 'bank', date: '2026-02-05', paidBy: 'Nancy Jerono', receivedBy: 'Mr. Kiptoo' },
    { idx: 24, amount: 10000, method: 'cash', date: '2026-02-08', paidBy: 'Jackson Barasa', receivedBy: 'Mrs. Wanjiru' },

    // Form 4 payments
    { idx: 25, amount: 33500, method: 'mpesa', date: '2026-01-15', mpesaRef: 'FJ3P7YQ5NR', paidBy: 'Alice Muthoni', receivedBy: 'Mr. Kiptoo' },
    { idx: 26, amount: 33500, method: 'bank', date: '2026-01-18', paidBy: 'Patrick Wafula', receivedBy: 'Mr. Kiptoo' },
    { idx: 27, amount: 24000, method: 'cash', date: '2026-01-22', paidBy: 'Violet Chebet', receivedBy: 'Mrs. Wanjiru' },
    { idx: 28, amount: 20000, method: 'mpesa', date: '2026-01-25', mpesaRef: 'CM9R2LD6HU', paidBy: 'Daniel Ngugi', receivedBy: 'Mr. Kiptoo' },
    { idx: 28, amount: 13500, method: 'cash', date: '2026-02-18', paidBy: 'Daniel Ngugi', receivedBy: 'Mrs. Wanjiru' },
    { idx: 29, amount: 33500, method: 'bank', date: '2026-01-28', paidBy: 'Margaret Siyoi', receivedBy: 'Mr. Kiptoo' }
  ];

  let paymentCount = 0;
  for (const pe of paymentEntries) {
    const student = students[pe.idx];
    const payment = {
      id: generateId(),
      studentId: student.id,
      amount: pe.amount,
      method: pe.method,
      date: pe.date,
      mpesaRef: pe.mpesaRef || '',
      paidBy: pe.paidBy || '',
      term: TERM,
      year: YEAR,
      receivedBy: pe.receivedBy || '',
      receiptNo: `RCT-${String(receiptNo++).padStart(5, '0')}`,
      voided: false,
      createdAt: new Date().toISOString()
    };
    await db.put('feePayments', payment);
    paymentCount++;
  }
  console.log(`✅ ${paymentCount} fee payments recorded`);

  // ========================================
  // BURSARIES (2)
  // ========================================
  await db.put('bursaries', {
    id: generateId(), studentId: students[7].id, amount: 8000, source: 'cdf',
    term: TERM, year: YEAR, allocatedBy: 'Nakuru East CDF Committee',
    createdAt: new Date().toISOString()
  });
  await db.put('bursaries', {
    id: generateId(), studentId: students[23].id, amount: 10000, source: 'sponsor',
    term: TERM, year: YEAR, allocatedBy: 'St. Joseph Scholarship Fund',
    createdAt: new Date().toISOString()
  });
  console.log('✅ 2 bursaries allocated');

  // ========================================
  // ADJUSTMENTS (2)
  // ========================================
  await db.put('feeAdjustments', {
    id: generateId(), studentId: students[12].id, amount: 2000, type: 'waiver',
    reason: 'Staff dependant waiver', term: TERM, year: YEAR,
    authorizedBy: 'Principal Mrs. Kariuki', createdAt: new Date().toISOString()
  });
  await db.put('feeAdjustments', {
    id: generateId(), studentId: students[24].id, amount: 500, type: 'penalty',
    reason: 'Late payment penalty', term: TERM, year: YEAR,
    authorizedBy: 'Deputy Mr. Ochieng', createdAt: new Date().toISOString()
  });
  console.log('✅ 2 fee adjustments (1 waiver + 1 penalty)');

  // ========================================
  // EXAMS (5 exams)
  // ========================================
  const examsData = [
    { name: 'Term 1 Mid-Term Exam 2026', type: 'midterm', cls: 'Form 1', term: TERM, year: YEAR },
    { name: 'Term 1 Mid-Term Exam 2026', type: 'midterm', cls: 'Form 2', term: TERM, year: YEAR },
    { name: 'Term 1 Mid-Term Exam 2026', type: 'midterm', cls: 'Form 3', term: TERM, year: YEAR },
    { name: 'Term 1 Mid-Term Exam 2026', type: 'midterm', cls: 'Form 4', term: TERM, year: YEAR },
    { name: 'Term 1 End-Term Exam 2026', type: 'endterm', cls: 'Form 1', term: TERM, year: YEAR }
  ];
  const exams = [];
  for (const ed of examsData) {
    const exam = {
      id: generateId(), name: ed.name, type: ed.type, class: ed.cls,
      term: ed.term, year: ed.year, createdAt: new Date().toISOString()
    };
    exams.push(exam);
    await db.put('exams', exam);
  }
  console.log(`✅ ${exams.length} exams created`);

  // ========================================
  // SCORES (for each exam, generate scores for each student in that class)
  // ========================================
  const subjectIds = subjects844.map(s => s.id);
  let scoreCount = 0;

  // Helper: generate a realistic score with some variation
  function randomScore(subjectId, studentIdx) {
    // Base scores vary by "student ability" (using index as pseudo-random seed)
    const bases = [72, 58, 45, 81, 63, 39, 55, 67, 74, 50, 61, 43, 77, 52, 69, 83, 47, 71, 56, 64, 78, 42, 59, 73, 48, 85, 66, 54, 76, 60];
    const base = bases[studentIdx % bases.length];
    // Add subject variation
    const variation = ((studentIdx * 7 + subjectIds.indexOf(subjectId) * 3) % 30) - 15;
    const score = Math.max(10, Math.min(100, base + variation));
    return score;
  }

  for (const exam of exams) {
    const classStudents = students.filter(s => s.class === exam.class);
    // Determine subjects for this class - students in lower forms do fewer
    const examSubjectIds = exam.class === 'Form 1' || exam.class === 'Form 2'
      ? ['eng', 'kisw', 'math', 'bio', 'phys', 'chem', 'hist', 'cre', 'agri', 'comp']
      : subjectIds; // All 12 for Form 3-4

    for (const student of classStudents) {
      for (const subjId of examSubjectIds) {
        const rawScore = randomScore(subjId, students.indexOf(student));
        const score = {
          id: generateId(),
          studentId: student.id,
          examId: exam.id,
          subjectId: subjId,
          rawScore: rawScore,
          maxScore: 100,
          createdAt: new Date().toISOString()
        };
        await db.put('scores', score);
        scoreCount++;
      }
    }
  }
  console.log(`✅ ${scoreCount} exam scores generated`);

  // ========================================
  // DISCIPLINE INCIDENTS (8)
  // ========================================
  const incidents = [
    { studentIdx: 1, category: 'lateness', severity: 'minor', description: 'Arrived 30 minutes late for morning prep. Third occurrence this term.', action: 'warning', reportedBy: 'Mr. Ochieng (DOS)', date: '2026-02-10' },
    { studentIdx: 7, category: 'fighting', severity: 'major', description: 'Involved in a physical altercation with another student during break time over a borrowed textbook.', action: 'suspension', reportedBy: 'Mr. Ochieng (DOS)', date: '2026-02-15' },
    { studentIdx: 12, category: 'truancy', severity: 'major', description: 'Skipped afternoon classes for two consecutive days. Found at the shopping centre nearby.', action: 'parent_summoned', reportedBy: 'Mrs. Wafula (Class Teacher)', date: '2026-02-18' },
    { studentIdx: 19, category: 'dress_code', severity: 'minor', description: 'Reported with non-uniform shoes and dyed hair. Second warning issued.', action: 'written_warning', reportedBy: 'Mrs. Kamau (Class Teacher)', date: '2026-02-20' },
    { studentIdx: 24, category: 'substance', severity: 'critical', description: 'Found in possession of cigarettes behind the dormitory. Disciplinary committee convened.', action: 'suspension', reportedBy: 'Mr. Kiptoo (Bursar)', date: '2026-02-22' },
    { studentIdx: 2, category: 'insubordination', severity: 'minor', description: 'Talked back to the teacher during Mathematics lesson and refused to follow instructions.', action: 'detention', reportedBy: 'Mr. Bett (Math Teacher)', date: '2026-02-25' },
    { studentIdx: 14, category: 'vandalism', severity: 'major', description: 'Scratched names into the classroom desk. Desk needs replacement.', action: 'written_warning', reportedBy: 'Mrs. Wafula (Class Teacher)', date: '2026-03-01' },
    { studentIdx: 27, category: 'exam_irregularity', severity: 'critical', description: 'Caught with unauthorized notes during the Term 1 Mid-Term Exam in Chemistry.', action: 'parent_summoned', reportedBy: 'Mr. Langat (Exam Invigilator)', date: '2026-03-05' }
  ];

  for (const inc of incidents) {
    const student = students[inc.studentIdx];
    await db.put('discipline', {
      id: generateId(),
      studentId: student.id,
      type: 'incident',
      category: inc.category,
      severity: inc.severity,
      description: inc.description,
      actionTaken: inc.action,
      parentNotified: inc.severity === 'critical' || inc.severity === 'major',
      reportedBy: inc.reportedBy,
      date: inc.date,
      term: TERM,
      year: YEAR,
      createdAt: new Date().toISOString()
    });
  }
  console.log('✅ 8 discipline incidents logged');

  // ========================================
  // MERITS (6)
  // ========================================
  const merits = [
    { studentIdx: 0, category: 'leadership', description: 'Elected Class Captain of Form 1A. Demonstrated excellent leadership during the first month.', action: 'commendation', reportedBy: 'Mrs. Wafula (Class Teacher)', date: '2026-02-05' },
    { studentIdx: 3, category: 'helpful', description: 'Volunteered to help new students settle into the dormitory. Showed great initiative and kindness.', action: 'commendation', reportedBy: 'Mrs. Kamau (Class Teacher)', date: '2026-02-10' },
    { studentIdx: 15, category: 'sports', description: 'Won first place in 400m race at the Sub-County Athletics Championship. Qualified for County level.', action: 'award', reportedBy: 'Mr. Koech (Sports Master)', date: '2026-02-18' },
    { studentIdx: 25, category: 'academic_improvement', description: 'Improved Mathematics score from D+ to B over one term. Outstanding progress.', action: 'commendation', reportedBy: 'Mr. Bett (Math Teacher)', date: '2026-02-22' },
    { studentIdx: 9, category: 'cleanliness', description: 'Maintained the cleanest dormitory cubicle consistently throughout February.', action: 'award', reportedBy: 'Mr. Ochieng (DOS)', date: '2026-02-28' },
    { studentIdx: 20, category: 'community_service', description: 'Led the school environmental club in planting 50 trees around the school compound.', action: 'commendation', reportedBy: 'Mrs. Chebet (Club Patron)', date: '2026-03-02' }
  ];

  for (const m of merits) {
    const student = students[m.studentIdx];
    await db.put('discipline', {
      id: generateId(),
      studentId: student.id,
      type: 'merit',
      category: m.category,
      severity: 'minor', // merits don't have severity but field is required
      description: m.description,
      actionTaken: m.action,
      reportedBy: m.reportedBy,
      date: m.date,
      term: TERM,
      year: YEAR,
      createdAt: new Date().toISOString()
    });
  }
  console.log('✅ 6 merit records logged');

  // ========================================
  // DONE
  // ========================================
  window.__seedComplete = true;
  console.log('');
  console.log('🎉 TEST DATA SEEDING COMPLETE!');
  console.log('');
  console.log('📊 Summary for Hillcrest Secondary School:');
  console.log('   System:     8-4-4 (KCSE)');
  console.log('   Term:       Term 1, 2026');
  console.log('   Students:   30 (across Form 1-4)');
  console.log('   Payments:   ' + paymentCount + ' records');
  console.log('   Bursaries:  2 (CDF + Sponsor)');
  console.log('   Adjustments: 2 (waiver + penalty)');
  console.log('   Exams:      5 (4 mid-terms + 1 end-term)');
  console.log('   Scores:     ' + scoreCount + ' subject scores');
  console.log('   Incidents:  8 (2 minor, 3 major, 2 critical)');
  console.log('   Merits:     6 (leadership, sports, academic, etc.)');
  console.log('');
  console.log('🔄 Now refresh the page (F5) to see all the data!');
  console.log('');
  console.log('💡 THINGS TO TEST:');
  console.log('   1. Dashboard - check stats, charts, quick actions');
  console.log('   2. Students - search, filter by class/stream/status/gender');
  console.log('   3. Fees - search payments, check defaulters tab');
  console.log('   4. Academics - view rankings, subject groups');
  console.log('   5. Reports - generate report card for any student');
  console.log('   6. Conduct - browse incidents/merits, student timeline');
  console.log('   7. Settings - verify school profile, try backup/restore');
  console.log('   8. Try voiding a receipt (set PIN in Settings first)');
  console.log('   9. Generate a merit list PDF from Reports');
  console.log('   10. Search for "Wanjiku" in fees and verify count matches');

})();
