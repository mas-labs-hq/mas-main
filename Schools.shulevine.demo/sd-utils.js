/**
 * ShuleVine - School Management System for Kenyan Schools
 * sd-utils.js - Constants, KCSE Grading Engine, Helpers, Sound System
 * Powered By MortApps Studios
 */

const SV = {
  IS_DEMO: true,
  DEMO_MAX_STUDENTS: 20,
  DEMO_MAX_EXAMS: 2,

  APP_NAME: 'ShuleVine',
  APP_VERSION: '1.0.0',
  APP_TAG: 'Powered By MortApps Studios',
  APP_URL: 'https://mortappsstudios.com/',
  DB_NAME: 'ShuleVineDB',
  DB_VERSION: 3,

  // License System Configuration
  LICENSE_API_URL: 'https://phein-license-server.vercel.app',
  LICENSE_API_TIMEOUT: 10000,
  LICENSE_MAX_OFFLINE_DAYS: 7,

  LICENSE_STORAGE_KEYS: {
    key: 'shulevine_license_key',
    fingerprint: 'shulevine_device_fingerprint',
    company: 'shulevine_school_name',
    lastOnlineCheck: 'shulevine_last_online_check',
    cachedLicense: 'shulevine_cached_license',
    expirationDate: 'shulevine_expiration_date',
    firstActivationDate: 'shulevine_first_activation_date'
  },

  COUNTIES: [
    'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu',
    'Garissa','Homa Bay','Isiolo','Kajiado','Kakamega','Kericho',
    'Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui','Kwale',
    'Laikipia','Lamu','Machakos','Makueni','Mandera','Marsabit',
    'Meru','Migori','Mombasa','Murang\'a','Nairobi','Nakuru',
    'Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu',
    'Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans-Nzoia',
    'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'
  ],

  SCHOOL_CATEGORIES: ['Public','Private','Extra-County','County','National'],

  TERMS: [
    { value: 1, label: 'Term 1' },
    { value: 2, label: 'Term 2' },
    { value: 3, label: 'Term 3' }
  ],

  getYears() {
    const current = new Date().getFullYear();
    const years = [];
    for (let y = current - 2; y <= current + 2; y++) years.push(y);
    return years;
  },

  PAYMENT_METHODS: [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ],

  BURSARY_SOURCES: [
    { value: 'cdf', label: 'CDF (Constituency Development Fund)' },
    { value: 'school', label: 'School Bursary' },
    { value: 'sponsor', label: 'Sponsor/Scholarship' },
    { value: 'capitation', label: 'Government Capitation' },
    { value: 'other', label: 'Other' }
  ],

  ADJUSTMENT_TYPES: [
    { value: 'refund', label: 'Refund (Credit)', sign: -1 },
    { value: 'penalty', label: 'Late Fee/Penalty (Debit)', sign: 1 },
    { value: 'waiver', label: 'Fee Waiver (Credit)', sign: -1 },
    { value: 'other', label: 'Other Adjustment', sign: 0 }
  ],

  STUDENT_TYPES: [
    { value: 'boarder', label: 'Boarder' },
    { value: 'day', label: 'Day Scholar' }
  ],

  CURRICULA: [
    { value: '844', label: '8-4-4 (KCSE)' },
    { value: 'cbc', label: 'CBC (Competency Based)' }
  ],

  EXAM_TYPES: [
    { value: 'midterm', label: 'Mid-Term Exam' },
    { value: 'endterm', label: 'End-Term Exam' },
    { value: 'mock', label: 'Mock Exam' },
    { value: 'assignment', label: 'Assignment/CA' },
    { value: 'opener', label: 'Opener Exam' }
  ],

  KCSE_SUBJECTS: [
    { id: 'eng', name: 'English', code: '101', isCompulsory: true, kcseGroup: 1, gradeScale: 'kcse', maxScore: 100 },
    { id: 'kisw', name: 'Kiswahili', code: '102', isCompulsory: true, kcseGroup: 1, gradeScale: 'kcse', maxScore: 100 },
    { id: 'math', name: 'Mathematics', code: '121', isCompulsory: true, kcseGroup: 1, gradeScale: 'kcse', maxScore: 100 },
    { id: 'bio', name: 'Biology', code: '231', isCompulsory: false, kcseGroup: 2, gradeScale: 'kcse', maxScore: 100 },
    { id: 'phys', name: 'Physics', code: '232', isCompulsory: false, kcseGroup: 2, gradeScale: 'kcse', maxScore: 100 },
    { id: 'chem', name: 'Chemistry', code: '233', isCompulsory: false, kcseGroup: 2, gradeScale: 'kcse', maxScore: 100 },
    { id: 'biphy', name: 'Biology for the Blind', code: '236', isCompulsory: false, kcseGroup: 2, gradeScale: 'kcse', maxScore: 100 },
    { id: 'gensc', name: 'General Science', code: '237', isCompulsory: false, kcseGroup: 2, gradeScale: 'kcse', maxScore: 100 },
    { id: 'hist', name: 'History & Government', code: '311', isCompulsory: false, kcseGroup: 3, gradeScale: 'kcse', maxScore: 100 },
    { id: 'geo', name: 'Geography', code: '312', isCompulsory: false, kcseGroup: 3, gradeScale: 'kcse', maxScore: 100 },
    { id: 'cre', name: 'CRE (Christian Religious Education)', code: '313', isCompulsory: false, kcseGroup: 3, gradeScale: 'kcse', maxScore: 100 },
    { id: 'ire', name: 'IRE (Islamic Religious Education)', code: '314', isCompulsory: false, kcseGroup: 3, gradeScale: 'kcse', maxScore: 100 },
    { id: 'hre', name: 'HRE (Hindu Religious Education)', code: '315', isCompulsory: false, kcseGroup: 3, gradeScale: 'kcse', maxScore: 100 },
    { id: 'agri', name: 'Agriculture', code: '443', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'biz', name: 'Business Studies', code: '455', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'comp', name: 'Computer Studies', code: '451', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'homsc', name: 'Home Science', code: '441', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'art', name: 'Art & Design', code: '442', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'music', name: 'Music', code: '511', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'aviat', name: 'Aviation Technology', code: '447', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'wood', name: 'Wood Work', code: '444', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'metal', name: 'Metal Work', code: '445', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'build', name: 'Building Construction', code: '446', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'power', name: 'Power Mechanics', code: '448', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'elec', name: 'Electricity', code: '449', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'draw', name: 'Drawing & Design', code: '450', isCompulsory: false, kcseGroup: 4, gradeScale: 'kcse', maxScore: 100 },
    { id: 'french', name: 'French', code: '501', isCompulsory: false, kcseGroup: 5, gradeScale: 'kcse', maxScore: 100 },
    { id: 'german', name: 'German', code: '502', isCompulsory: false, kcseGroup: 5, gradeScale: 'kcse', maxScore: 100 },
    { id: 'arabic', name: 'Arabic', code: '503', isCompulsory: false, kcseGroup: 5, gradeScale: 'kcse', maxScore: 100 },
    { id: 'ksl', name: 'Kenyan Sign Language', code: '504', isCompulsory: false, kcseGroup: 5, gradeScale: 'kcse', maxScore: 100 },
    { id: 'indig', name: 'Indigenous Languages', code: '505', isCompulsory: false, kcseGroup: 5, gradeScale: 'kcse', maxScore: 100 }
  ],

  KCSE_GROUP_NAMES: {
    1: 'Group 1 - Compulsory',
    2: 'Group 2 - Sciences',
    3: 'Group 3 - Humanities',
    4: 'Group 4 - Technical/Applied',
    5: 'Group 5 - Optional/Languages'
  },

  // ============================================================
  // CBC CONSTANTS
  // ============================================================

  CBC_RUBRIC: [
    { level: 'EE', label: 'Exceeding Expectation', points: 4, color: '#10b981', desc: 'Learner consistently demonstrates outstanding understanding and application beyond expectations' },
    { level: 'ME', label: 'Meeting Expectation', points: 3, color: '#3b82f6', desc: 'Learner demonstrates adequate understanding and application as expected' },
    { level: 'AE', label: 'Approaching Expectation', points: 2, color: '#f59e0b', desc: 'Learner demonstrates partial understanding and is progressing toward expectations' },
    { level: 'BE', label: 'Below Expectation', points: 1, color: '#ef4444', desc: 'Learner demonstrates limited understanding and requires significant support' }
  ],

  CBC_GRADE_LEVELS: [
    { value: 'pp1', label: 'Pre-Primary 1 (PP1)', tier: 'pre-primary' },
    { value: 'pp2', label: 'Pre-Primary 2 (PP2)', tier: 'pre-primary' },
    { value: 'g1', label: 'Grade 1', tier: 'lower-primary' },
    { value: 'g2', label: 'Grade 2', tier: 'lower-primary' },
    { value: 'g3', label: 'Grade 3', tier: 'lower-primary' },
    { value: 'g4', label: 'Grade 4', tier: 'upper-primary' },
    { value: 'g5', label: 'Grade 5', tier: 'upper-primary' },
    { value: 'g6', label: 'Grade 6', tier: 'upper-primary' },
    { value: 'g7', label: 'Grade 7', tier: 'junior' },
    { value: 'g8', label: 'Grade 8', tier: 'junior' },
    { value: 'g9', label: 'Grade 9', tier: 'junior' },
    { value: 'g10', label: 'Grade 10', tier: 'senior' },
    { value: 'g11', label: 'Grade 11', tier: 'senior' },
    { value: 'g12', label: 'Grade 12', tier: 'senior' }
  ],

  CBC_EXAM_TYPES: [
    { value: 'formative', label: 'Formative Assessment (SBA)' },
    { value: 'summative', label: 'Summative Assessment' },
    { value: 'midterm', label: 'Mid-Term Assessment' },
    { value: 'endterm', label: 'End-Term Assessment' },
    { value: 'assignment', label: 'Assignment/Project' },
    { value: 'opener', label: 'Opener Assessment' }
  ],

  // CBC Learning Areas for Junior School (Grade 7-9)
  CBC_JUNIOR_SUBJECTS: [
    // Core Learning Areas
    { id: 'cbc_eng', name: 'English', code: 'ENG', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Listening and Speaking', 'Reading', 'Writing', 'Grammar in Use', 'Literature'] },
    { id: 'cbc_kisw', name: 'Kiswahili', code: 'KIS', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Kusikiliza na Kusema', 'Kusoma', 'Kuandika', 'Sarufi na Matumizi ya Lugha', 'Fasihi'] },
    { id: 'cbc_ksl', name: 'Kenyan Sign Language', code: 'KSL', isCompulsory: false, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Receiving and Expressing', 'Grammar', 'Literature'] },
    { id: 'cbc_math', name: 'Mathematics', code: 'MAT', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Numbers', 'Algebra', 'Geometry', 'Measurement', 'Data Handling and Probability'] },
    // Science & Technology
    { id: 'cbc_isci', name: 'Integrated Science', code: 'ISC', isCompulsory: true, cbcGroup: 'science', curriculum: 'cbc', maxScore: 100,
      strands: ['Scientific Investigation', 'Matter and Forces', 'Living Things and Their Environment', 'Earth and Space'] },
    { id: 'cbc_health', name: 'Health Education', code: 'HED', isCompulsory: true, cbcGroup: 'science', curriculum: 'cbc', maxScore: 100,
      strands: ['Human Body Systems', 'Health and Wellness', 'First Aid and Emergency Response', 'Substance Abuse'] },
    { id: 'cbc_csc', name: 'Computer Science', code: 'CSC', isCompulsory: false, cbcGroup: 'science', curriculum: 'cbc', maxScore: 100,
      strands: ['Computational Thinking', 'Programming', 'Data Security and Ethics', 'Computer Systems'] },
    // Humanities
    { id: 'cbc_sost', name: 'Social Studies', code: 'SST', isCompulsory: true, cbcGroup: 'humanities', curriculum: 'cbc', maxScore: 100,
      strands: ['People and Relationships', 'Resources and Economic Activities', 'Political Systems and Governance', 'Citizenship'] },
    { id: 'cbc_cre', name: 'Christian Religious Education', code: 'CRE', isCompulsory: false, cbcGroup: 'humanities', curriculum: 'cbc', maxScore: 100,
      strands: ['Creation', 'Gods Revelation', 'Faith and Living', 'Morality and Worship'] },
    { id: 'cbc_ire', name: 'Islamic Religious Education', code: 'IRE', isCompulsory: false, cbcGroup: 'humanities', curriculum: 'cbc', maxScore: 100,
      strands: ['Quran', 'Hadith', 'Pillars of Iman', 'Pillars of Islam'] },
    { id: 'cbc_hre', name: 'Hindu Religious Education', code: 'HRE', isCompulsory: false, cbcGroup: 'humanities', curriculum: 'cbc', maxScore: 100,
      strands: ['Scriptures', 'Deities and Worship', 'Ethics and Values'] },
    // Technical & Applied
    { id: 'cbc_agri', name: 'Agriculture', code: 'AGR', isCompulsory: true, cbcGroup: 'technical', curriculum: 'cbc', maxScore: 100,
      strands: ['Soil and Water Conservation', 'Crop Production', 'Livestock Production', 'Agribusiness'] },
    { id: 'cbc_homsc', name: 'Home Science', code: 'HSC', isCompulsory: false, cbcGroup: 'technical', curriculum: 'cbc', maxScore: 100,
      strands: ['Foods and Nutrition', 'Textiles and Clothing', 'Home Management', 'Child Care'] },
    { id: 'cbc_vart', name: 'Visual Arts', code: 'VAR', isCompulsory: false, cbcGroup: 'technical', curriculum: 'cbc', maxScore: 100,
      strands: ['Drawing and Painting', 'Sculpture and Ceramics', 'Design and Craft', 'Appreciation of Art'] },
    { id: 'cbc_part', name: 'Performing Arts', code: 'PAR', isCompulsory: false, cbcGroup: 'technical', curriculum: 'cbc', maxScore: 100,
      strands: ['Music', 'Dance', 'Drama', 'Elocution and Verse Speaking'] },
    // Life Skills
    { id: 'cbc_lse', name: 'Life Skills Education', code: 'LSE', isCompulsory: true, cbcGroup: 'life-skills', curriculum: 'cbc', maxScore: 100,
      strands: ['Effective Communication', 'Decision Making', 'Self-Awareness and Esteem', 'Empathy and Conflict Resolution'] },
    { id: 'cbc_pe', name: 'Physical Education', code: 'PED', isCompulsory: true, cbcGroup: 'life-skills', curriculum: 'cbc', maxScore: 100,
      strands: ['Physical Fitness', 'Games and Sports', 'Gymnastics', 'Swimming'] },
    // Optional
    { id: 'cbc_french', name: 'French', code: 'FRE', isCompulsory: false, cbcGroup: 'optional', curriculum: 'cbc', maxScore: 100,
      strands: ['Listening and Speaking', 'Reading', 'Writing', 'Grammar'] },
    { id: 'cbc_arabic', name: 'Arabic', code: 'ARB', isCompulsory: false, cbcGroup: 'optional', curriculum: 'cbc', maxScore: 100,
      strands: ['Listening and Speaking', 'Reading', 'Writing', 'Grammar'] },
    { id: 'cbc_german', name: 'German', code: 'GER', isCompulsory: false, cbcGroup: 'optional', curriculum: 'cbc', maxScore: 100,
      strands: ['Listening and Speaking', 'Reading', 'Writing', 'Grammar'] },
    { id: 'cbc_mandarin', name: 'Mandarin', code: 'MAN', isCompulsory: false, cbcGroup: 'optional', curriculum: 'cbc', maxScore: 100,
      strands: ['Listening and Speaking', 'Reading', 'Writing', 'Grammar'] }
  ],

  // CBC Learning Areas for Senior School (Grade 10-12) - Core
  CBC_SENIOR_CORE: [
    { id: 'cbc_s_eng', name: 'English', code: 'ENG', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Listening and Speaking', 'Reading', 'Writing', 'Grammar in Use', 'Literature'] },
    { id: 'cbc_s_kisw', name: 'Kiswahili', code: 'KIS', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Kusikiliza na Kusema', 'Kusoma', 'Kuandika', 'Sarufi', 'Fasihi'] },
    { id: 'cbc_s_math', name: 'Mathematics', code: 'MAT', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Numbers and Algebra', 'Geometry and Trigonometry', 'Calculus', 'Statistics and Probability'] },
    { id: 'cbc_s_pe', name: 'Physical Education', code: 'PED', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Physical Fitness', 'Games and Sports', 'Gymnastics', 'Swimming'] },
    { id: 'cbc_s_csl', name: 'Community Service Learning', code: 'CSL', isCompulsory: true, cbcGroup: 'core', curriculum: 'cbc', maxScore: 100,
      strands: ['Community Engagement', 'Service Projects', 'Reflection and Documentation'] }
  ],

  // CBC Senior Pathways
  CBC_SENIOR_PATHWAYS: {
    stem: {
      label: 'STEM (Science, Technology, Engineering & Mathematics)',
      subjects: [
        { id: 'cbc_s_bio', name: 'Biology', code: 'BIO', strands: ['Cell Biology', 'Genetics', 'Ecology', 'Physiology'] },
        { id: 'cbc_s_chem', name: 'Chemistry', code: 'CHE', strands: ['Chemical Reactions', 'Organic Chemistry', 'Industrial Chemistry'] },
        { id: 'cbc_s_phys', name: 'Physics', code: 'PHY', strands: ['Mechanics', 'Electricity and Magnetism', 'Waves and Optics'] },
        { id: 'cbc_s_csc', name: 'Computer Science', code: 'CSC', strands: ['Programming', 'Data Structures', 'Networking', 'Cybersecurity'] },
        { id: 'cbc_s_agri', name: 'Agriculture', code: 'AGR', strands: ['Crop Science', 'Animal Science', 'Agribusiness'] },
        { id: 'cbc_s_tech', name: 'Technical Drawing', code: 'TDR', strands: ['Geometrical Drawing', 'Building Construction', 'Mechanical Drawing'] }
      ]
    },
    arts: {
      label: 'Arts & Sports Science',
      subjects: [
        { id: 'cbc_s_art', name: 'Visual Arts', code: 'VAR', strands: ['Fine Art', 'Design', 'Art History'] },
        { id: 'cbc_s_perf', name: 'Performing Arts', code: 'PAR', strands: ['Music', 'Dance', 'Drama', 'Film'] },
        { id: 'cbc_s_sport', name: 'Sports Science', code: 'SPO', strands: ['Sports Training', 'Sports Management', 'Sports Medicine'] },
        { id: 'cbc_s_media', name: 'Media Studies', code: 'MED', strands: ['Print Media', 'Broadcast Media', 'Digital Media'] }
      ]
    },
    social: {
      label: 'Social Sciences',
      subjects: [
        { id: 'cbc_s_hist', name: 'History', code: 'HIS', strands: ['African History', 'World History', 'Government and Governance'] },
        { id: 'cbc_s_geo', name: 'Geography', code: 'GEO', strands: ['Physical Geography', 'Human Geography', 'Environmental Management'] },
        { id: 'cbc_s_civ', name: 'Civics and Ethics', code: 'CIV', strands: ['Governance', 'Human Rights', 'Ethics and Integrity'] },
        { id: 'cbc_s_bus', name: 'Business Studies', code: 'BUS', strands: ['Entrepreneurship', 'Accounting', 'Marketing', 'Finance'] }
      ]
    }
  },

  // ============================================================
  // DISCIPLINE CONSTANTS
  // ============================================================

  INCIDENT_CATEGORIES: [
    { value: 'truancy', label: 'Truancy' },
    { value: 'lateness', label: 'Lateness' },
    { value: 'fighting', label: 'Fighting / Bullying' },
    { value: 'insubordination', label: 'Insubordination' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'substance', label: 'Substance Abuse' },
    { value: 'theft', label: 'Theft' },
    { value: 'exam_irregularity', label: 'Exam Irregularity' },
    { value: 'dress_code', label: 'Dress Code Violation' },
    { value: 'disorderly', label: 'Disorderly Conduct' },
    { value: 'other_incident', label: 'Other' }
  ],

  MERIT_CATEGORIES: [
    { value: 'leadership', label: 'Leadership' },
    { value: 'academic_improvement', label: 'Academic Improvement' },
    { value: 'helpful', label: 'Helpful / Caring' },
    { value: 'sports', label: 'Sports Achievement' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'attendance', label: 'Attendance Award' },
    { value: 'community_service', label: 'Community Service' },
    { value: 'creative_arts', label: 'Creative Arts' },
    { value: 'other_merit', label: 'Other' }
  ],

  SEVERITY_LEVELS: [
    { value: 'minor', label: 'Minor', color: '#f59e0b' },
    { value: 'major', label: 'Major', color: '#f97316' },
    { value: 'critical', label: 'Critical', color: '#ef4444' }
  ],

  ACTION_TYPES: [
    { value: 'warning', label: 'Verbal Warning' },
    { value: 'written_warning', label: 'Written Warning' },
    { value: 'detention', label: 'Detention' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'expulsion', label: 'Expulsion Recommendation' },
    { value: 'parent_summoned', label: 'Parent Summoned' },
    { value: 'counseling', label: 'Counseling Referral' },
    { value: 'community_service_action', label: 'Community Service' },
    { value: 'commendation', label: 'Commendation' },
    { value: 'award', label: 'Award / Certificate' },
    { value: 'other_action', label: 'Other' }
  ],

  CBC_GROUP_NAMES: {
    'core': 'Core Learning Areas',
    'science': 'Science & Technology',
    'humanities': 'Humanities & Social Sciences',
    'technical': 'Technical & Applied',
    'life-skills': 'Life Skills & Physical Education',
    'optional': 'Optional / Foreign Languages'
  }
};

// ============================================================
// LUCIDE ICON HELPER
// ============================================================

function ic(name, cls = '') {
  return `<i data-lucide="${name}" class="${cls}"></i>`;
}

function renderIcons() {
  if (typeof lucide !== 'undefined') {
    try { lucide.createIcons(); } catch (e) { /* ignore */ }
  }
}

// Schedule icon rendering after DOM updates
function scheduleIcons() {
  requestAnimationFrame(() => renderIcons());
}

// ============================================================
// KCSE GRADING ENGINE
// ============================================================

function rawToKCSE(percentage) {
  if (percentage >= 80) return { grade: 'A',  points: 12 };
  if (percentage >= 75) return { grade: 'A-', points: 11 };
  if (percentage >= 70) return { grade: 'B+', points: 10 };
  if (percentage >= 65) return { grade: 'B',  points: 9  };
  if (percentage >= 60) return { grade: 'B-', points: 8  };
  if (percentage >= 55) return { grade: 'C+', points: 7  };
  if (percentage >= 50) return { grade: 'C',  points: 6  };
  if (percentage >= 45) return { grade: 'C-', points: 5  };
  if (percentage >= 40) return { grade: 'D+', points: 4  };
  if (percentage >= 35) return { grade: 'D',  points: 3  };
  if (percentage >= 30) return { grade: 'D-', points: 2  };
  return                       { grade: 'E',  points: 1  };
}

function pointsToMeanGrade(meanPoints) {
  if (meanPoints >= 11.5) return 'A';
  if (meanPoints >= 10.5) return 'A-';
  if (meanPoints >= 9.5)  return 'B+';
  if (meanPoints >= 8.5)  return 'B';
  if (meanPoints >= 7.5)  return 'B-';
  if (meanPoints >= 6.5)  return 'C+';
  if (meanPoints >= 5.5)  return 'C';
  if (meanPoints >= 4.5)  return 'C-';
  if (meanPoints >= 3.5)  return 'D+';
  if (meanPoints >= 2.5)  return 'D';
  if (meanPoints >= 1.5)  return 'D-';
  return 'E';
}

function computeKCSEMeanGrade(scores, subjects) {
  const subjectMap = {};
  subjects.forEach(s => subjectMap[s.id] = s);

  const gradedSubjects = scores.map(sc => {
    const subj = subjectMap[sc.subjectId];
    if (!subj) return null;
    const pct = (sc.rawScore / sc.maxScore) * 100;
    const kcse = rawToKCSE(pct);
    return { subjectId: sc.subjectId, name: subj.name, kcseGroup: subj.kcseGroup, isCompulsory: subj.isCompulsory, grade: kcse.grade, points: kcse.points, percentage: pct };
  }).filter(Boolean);

  const groups = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  gradedSubjects.forEach(gs => { if (groups[gs.kcseGroup]) groups[gs.kcseGroup].push(gs); });
  Object.values(groups).forEach(g => g.sort((a, b) => b.points - a.points));

  const selected = [];
  selected.push(...groups[1].slice(0, 3));
  selected.push(...groups[2].slice(0, 2));
  if (groups[3].length > 0) selected.push(groups[3][0]);
  const best45 = [...groups[4], ...groups[5]].sort((a, b) => b.points - a.points);
  if (best45.length > 0) selected.push(best45[0]);

  const totalPoints = selected.reduce((sum, s) => sum + s.points, 0);
  const numSubjects = selected.length;
  const meanPoints = numSubjects > 0 ? totalPoints / 7 : 0;
  const meanGrade = pointsToMeanGrade(meanPoints);

  return { meanGrade: meanGrade, meanPoints: Math.round(meanPoints * 100) / 100, totalPoints, numSubjects, selectedSubjects: selected, allSubjectGrades: gradedSubjects };
}

// ============================================================
// CBC GRADING ENGINE
// ============================================================

/**
 * Convert a percentage score to CBC rubric level
 */
function rawToCBC(percentage) {
  if (percentage >= 80) return { level: 'EE', label: 'Exceeding Expectation', points: 4 };
  if (percentage >= 50) return { level: 'ME', label: 'Meeting Expectation', points: 3 };
  if (percentage >= 25) return { level: 'AE', label: 'Approaching Expectation', points: 2 };
  return                       { level: 'BE', label: 'Below Expectation', points: 1 };
}

/**
 * Compute overall CBC competency level from rubric scores
 * @param {Array} rubricScores - Array of { subjectId, rubricLevel ('EE'/'ME'/'AE'/'BE') }
 * @returns {Object} Overall competency assessment
 */
function computeCBCCompetency(rubricScores) {
  const rubricMap = {};
  SV.CBC_RUBRIC.forEach(r => rubricMap[r.level] = r.points);

  const scoredSubjects = rubricScores.filter(s => rubricMap[s.rubricLevel]);
  if (scoredSubjects.length === 0) {
    return { overallLevel: '-', overallLabel: 'No Assessment', totalPoints: 0, numSubjects: 0, averagePoints: 0, levelBreakdown: { EE: 0, ME: 0, AE: 0, BE: 0 } };
  }

  let totalPoints = 0;
  const breakdown = { EE: 0, ME: 0, AE: 0, BE: 0 };

  scoredSubjects.forEach(s => {
    const pts = rubricMap[s.rubricLevel] || 0;
    totalPoints += pts;
    breakdown[s.rubricLevel] = (breakdown[s.rubricLevel] || 0) + 1;
  });

  const avgPoints = totalPoints / scoredSubjects.length;

  // Determine overall level based on average points
  let overallLevel, overallLabel;
  if (avgPoints >= 3.5) { overallLevel = 'EE'; overallLabel = 'Exceeding Expectation'; }
  else if (avgPoints >= 2.5) { overallLevel = 'ME'; overallLabel = 'Meeting Expectation'; }
  else if (avgPoints >= 1.5) { overallLevel = 'AE'; overallLabel = 'Approaching Expectation'; }
  else { overallLevel = 'BE'; overallLabel = 'Below Expectation'; }

  return {
    overallLevel,
    overallLabel,
    totalPoints,
    numSubjects: scoredSubjects.length,
    averagePoints: Math.round(avgPoints * 100) / 100,
    levelBreakdown: breakdown
  };
}

/**
 * Compute CBC mean grade from raw scores (for hybrid mode where schools still give % scores but want CBC grading)
 * @param {Array} scores - Array of { subjectId, rawScore, maxScore }
 * @param {Array} subjects - Array of subject objects with cbcGroup
 * @returns {Object} CBC competency assessment with per-subject levels
 */
function computeCBCFromRaw(scores, subjects) {
  const subjectMap = {};
  subjects.forEach(s => subjectMap[s.id] = s);

  const rubricScores = [];
  const detailedSubjects = [];

  scores.forEach(sc => {
    const subj = subjectMap[sc.subjectId];
    if (!subj) return;
    const pct = (sc.rawScore / sc.maxScore) * 100;
    const cbc = rawToCBC(pct);
    rubricScores.push({ subjectId: sc.subjectId, rubricLevel: cbc.level });
    detailedSubjects.push({
      subjectId: sc.subjectId,
      name: subj.name,
      cbcGroup: subj.cbcGroup,
      rawScore: sc.rawScore,
      maxScore: sc.maxScore,
      percentage: Math.round(pct * 100) / 100,
      rubricLevel: cbc.level,
      rubricLabel: cbc.label,
      rubricPoints: cbc.points
    });
  });

  const competency = computeCBCCompetency(rubricScores);
  return { ...competency, subjects: detailedSubjects };
}

/**
 * Get CBC rubric color class
 */
function cbcLevelClass(level) {
  const colors = { EE: 'rubric-ee', ME: 'rubric-me', AE: 'rubric-ae', BE: 'rubric-be' };
  return colors[level] || '';
}

/**
 * Get the active curriculum from settings (async wrapper)
 */
async function getActiveCurriculum() {
  if (typeof db !== 'undefined') {
    return (await db.getSetting('gradingSystem')) || '844';
  }
  return '844';
}

/**
 * Get CBC subjects for the appropriate level
 */
function getCBCSubjectsForLevel(gradeLevel) {
  if (!gradeLevel) return SV.CBC_JUNIOR_SUBJECTS;
  const tier = SV.CBC_GRADE_LEVELS.find(g => g.value === gradeLevel)?.tier;
  if (tier === 'senior') {
    return [...SV.CBC_SENIOR_CORE];
  }
  return SV.CBC_JUNIOR_SUBJECTS;
}

// ============================================================
// SOUND SYSTEM (Web Audio API)
// ============================================================

const SoundManager = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { this.enabled = false; }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  play(type) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    try {
      switch (type) {
        case 'success': this._playTones([523.25, 659.25], 0.1, 0.12, 'sine', 0.15); break;
        case 'error': this._playTones([440, 349.23], 0.12, 0.15, 'square', 0.08); break;
        case 'click': this._playTones([800], 0.04, 0.05, 'sine', 0.05); break;
        case 'notify': this._playTones([587.33, 783.99], 0.08, 0.1, 'sine', 0.1); break;
        case 'warning': this._playTones([493.88, 440], 0.1, 0.12, 'triangle', 0.1); break;
      }
    } catch (e) { /* ignore audio errors */ }
  },

  _playTones(freqs, dur, gap, type, vol) {
    let t = this.ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur + gap;
    });
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatKES(amount) {
  return 'KES ' + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function getCurrentTerm() {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 4) return 1;
  if (month >= 5 && month <= 8) return 2;
  return 3;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${ic(iconMap[type] || 'info', 'icon-sm')}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(toast);
  scheduleIcons();

  requestAnimationFrame(() => toast.classList.add('show'));
  SoundManager.play(type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'notify');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showConfirm(message, onYes, onNo) {
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  document.getElementById('confirm-message').textContent = message;
  modal.classList.add('active');
  SoundManager.play('notify');

  const yesBtn = document.getElementById('confirm-yes');
  const noBtn = document.getElementById('confirm-no');
  const cleanup = () => { modal.classList.remove('active'); yesBtn.replaceWith(yesBtn.cloneNode(true)); noBtn.replaceWith(noBtn.cloneNode(true)); };

  document.getElementById('confirm-yes').addEventListener('click', () => { cleanup(); if (onYes) onYes(); });
  document.getElementById('confirm-no').addEventListener('click', () => { cleanup(); if (onNo) onNo(); });
}

function showPrompt(title, placeholder, onSubmit, type = 'text') {
  const modal = document.getElementById('prompt-modal');
  if (!modal) return;
  document.getElementById('prompt-title').textContent = title;
  const input = document.getElementById('prompt-input');
  input.placeholder = placeholder || '';
  input.type = type;
  input.value = '';
  modal.classList.add('active');
  SoundManager.play('notify');
  input.focus();

  const cleanup = () => { modal.classList.remove('active'); };
  document.getElementById('prompt-ok').onclick = () => { const val = input.value.trim(); cleanup(); if (onSubmit) onSubmit(val); };
  document.getElementById('prompt-cancel').onclick = () => { cleanup(); };
  input.onkeydown = (e) => { if (e.key === 'Enter') { const val = input.value.trim(); cleanup(); if (onSubmit) onSubmit(val); } };
}

function ordinalSuffix(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function validateMpesaRef(ref) {
  if (!ref) return true;
  return /^[A-Za-z0-9]{1,10}$/.test(ref);
}

function compressLogo(file, maxWidth = 200, maxHeight = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = h * (maxWidth / w); w = maxWidth; }
        if (h > maxHeight) { w = w * (maxHeight / h); h = maxHeight; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getTermLabel(term, year) {
  return `Term ${term} ${year || new Date().getFullYear()}`;
}

function calculateBalance(feeStructures, payments, bursaries, adjustments, term, year) {
  let totalFees = 0;
  feeStructures.forEach(fs => { if ((!term || fs.term === term) && (!year || fs.year === year)) totalFees += fs.totalAmount || 0; });
  let totalPayments = 0;
  payments.forEach(p => { if ((!term || p.term === term) && (!year || p.year === year) && !p.voided) totalPayments += p.amount || 0; });
  let totalBursaries = 0;
  bursaries.forEach(b => { if ((!term || b.term === term) && (!year || b.year === year)) totalBursaries += b.amount || 0; });
  let totalAdjustments = 0;
  adjustments.forEach(a => { if ((!term || a.term === term) && (!year || a.year === year)) { const adjType = SV.ADJUSTMENT_TYPES.find(t => t.value === a.type); const sign = adjType ? adjType.sign : 0; totalAdjustments += (a.amount || 0) * (sign || (a.amount < 0 ? -1 : 1)); } });
  const balance = totalFees - totalPayments - totalBursaries - totalAdjustments;
  return { totalFees, totalPayments, totalBursaries, totalAdjustments, balance: Math.round(balance * 100) / 100 };
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get stream names from a class object.
 * Handles backward compatibility: if cls.streams is a number, converts to letter array.
 * If cls.streams is already an array, returns it directly.
 */
function getStreamNames(cls) {
  if (!cls) return ['A'];
  if (Array.isArray(cls.streams)) return cls.streams.length > 0 ? cls.streams : ['A'];
  // Legacy: streams was a number (1-10), convert to letters
  const count = cls.streams || 1;
  const sl = 'ABCDEFGHIJ';
  const names = [];
  for (let i = 0; i < count; i++) names.push(sl[i]);
  return names;
}

function getTopCategory(records) {
  if (!records || records.length === 0) return '-';
  const counts = {};
  records.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topVal = sorted[0][0];
  const cat = SV.INCIDENT_CATEGORIES.find(c => c.value === topVal);
  return cat ? cat.label : topVal;
}

// ============================================================
// SCHOOL LEVEL (Primary / Secondary) LABELS
// ============================================================

/**
 * Returns 'Pupil' or 'Student' based on the schoolLevel setting
 * Reads from IndexedDB settings; falls back to 'Student' for secondary
 */
async function learnerLabel() {
  if (typeof db !== 'undefined') {
    const level = await db.getSetting('schoolLevel');
    return level === 'primary' ? 'Pupil' : 'Student';
  }
  return 'Student';
}

/**
 * Returns 'Pupils' or 'Students' based on the schoolLevel setting
 */
async function learnerLabelPlural() {
  if (typeof db !== 'undefined') {
    const level = await db.getSetting('schoolLevel');
    return level === 'primary' ? 'Pupils' : 'Students';
  }
  return 'Students';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SV, rawToKCSE, pointsToMeanGrade, computeKCSEMeanGrade, rawToCBC, computeCBCCompetency, computeCBCFromRaw, cbcLevelClass, getActiveCurriculum, getCBCSubjectsForLevel, generateId, formatKES, formatDate, formatDateTime, getCurrentTerm, escapeHtml, debounce, showToast, showConfirm, showPrompt, ordinalSuffix, validateMpesaRef, compressLogo, getTermLabel, calculateBalance, SoundManager, ic, renderIcons, scheduleIcons, learnerLabel, learnerLabelPlural, getStreamNames };
}
