/**
 * ============================================================
 * Oakwood International School — Google Apps Script Backend (Fixed & Hardened)
 * ============================================================
 * 
 * Key Improvements:
 * 1. Automatic table creation on the fly (if sheets don't exist yet)
 * 2. Safe empty sheet handling (prevents range errors on empty tables)
 * 3. Consistent response format: { success, data, error, message }
 * 4. Comprehensive logging via Logger.log() for debugging in Execution Log
 * 5. Robust input validation & 60-second rate limiting
 * 6. Seed sample data included for immediate testing
 * 7. Proper MIME type (JSON) with full CORS compliance
 * 
 * SETUP:
 * 1. Copy this code into your Google Apps Script editor (https://script.google.com).
 * 2. Replace 'YOUR_GOOGLE_SHEET_ID_HERE' with your real Google Sheet ID.
 * 3. Deploy > New deployment > Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * ============================================================
 */

// Replace with your Google Sheet ID (from https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit):
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

// Table names
const SHEETS = {
  ADMISSIONS: 'admissions',
  FACULTY: 'faculty',
  ALUMNI: 'alumni',
  VACANCIES: 'vacancies'
};

/**
 * Returns the target Google Spreadsheet instance
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}

  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Please set your SPREADSHEET_ID in the script, or bind this script to the sheet via Extensions > Apps Script.');
  }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * One-click initialization: creates and formats all tables with headers & sample data
 */
function setupSchoolSheets() {
  Logger.log('Starting setupSchoolSheets()...');
  const ss = getSpreadsheet();

  const configs = [
    {
      name: SHEETS.ADMISSIONS,
      headers: ['admission_id', 'full_name', 'phone', 'email', 'address', 'class_applying', 'status', 'submitted_at'],
      seeds: []
    },
    {
      name: SHEETS.FACULTY,
      headers: ['name', 'subject', 'qualification', 'photo_url'],
      seeds: [
        ['Dr. Meera Krishnan', 'Principal', 'Ph.D. Education, M.A. English Literature', ''],
        ['Mr. Srinivasan R.', 'Mathematics', 'M.Sc. Mathematics, B.Ed., 18 yrs exp.', ''],
        ['Ms. Anitha George', 'Physics', 'M.Sc. Physics, B.Ed., CSIR-NET', ''],
        ['Mr. Karthik Pandian', 'Computer Science', 'M.Tech. CS, Oracle Certified, 12 yrs exp.', ''],
        ['Ms. Lakshmi Sundaram', 'Chemistry', 'M.Sc. Chemistry, B.Ed., 15 yrs exp.', ''],
        ['Mr. Rajesh Patel', 'English & Literature', 'M.A. English, CELTA Certified', ''],
        ['Ms. Divya Nair', 'Biology', 'M.Sc. Biotechnology, B.Ed., 10 yrs exp.', ''],
        ['Mr. Vijay Kumar', 'Physical Education', 'M.P.Ed., National-level Athlete', '']
      ]
    },
    {
      name: SHEETS.ALUMNI,
      headers: ['name', 'achievement', 'year', 'photo_url'],
      seeds: [
        ['Aarav Kumar', 'Board Topper — State 1st in 12th Board Exams (IIT Madras)', '2022', ''],
        ['Priya Subramanian', 'Olympiad Gold — International Science Olympiad (Stanford University)', '2021', ''],
        ['Rohit Nair', 'National Sports — U-19 Tamil Nadu cricket captain', '2023', ''],
        ['Deepika Lakshmi', 'Medical — NEET AIR 42 (MBBS at JIPMER)', '2020', '']
      ]
    },
    {
      name: SHEETS.VACANCIES,
      headers: ['position', 'department', 'description'],
      seeds: [
        ['Senior Mathematics Teacher', 'Mathematics', 'Experienced educator for grades 9–12 with strong board exam preparation track record. M.Sc. Mathematics and B.Ed. required.'],
        ['Pre-Primary Coordinator', 'Early Years', 'Lead our early years programme with a focus on play-based learning. Montessori or NTT certification preferred.'],
        ['Admissions Counsellor', 'Administration', 'Friendly, organised professional to manage parent enquiries, campus tours, and the admissions pipeline.']
      ]
    }
  ];

  configs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      Logger.log('Created sheet: ' + cfg.name);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      const headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setBackground('#1F3D2B');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);

      if (cfg.seeds && cfg.seeds.length > 0) {
        cfg.seeds.forEach(row => sheet.appendRow(row));
      }

      for (let c = 1; c <= cfg.headers.length; c++) {
        sheet.autoResizeColumn(c);
      }
      Logger.log('Populated headers and seed data for: ' + cfg.name);
    }
  });

  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  Logger.log('setupSchoolSheets() completed successfully.');
  return 'All sheets created, styled, and seeded.';
}

/**
 * Handle GET requests
 */
function doGet(e) {
  Logger.log('doGet triggered with parameters: ' + JSON.stringify(e ? e.parameter : {}));
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

    if (action === 'getFaculty') {
      const data = getSheetRecords(SHEETS.FACULTY);
      return jsonResponse({ success: true, data: data });
    }

    if (action === 'getAlumni') {
      const data = getSheetRecords(SHEETS.ALUMNI);
      return jsonResponse({ success: true, data: data });
    }

    if (action === 'getVacancies') {
      const data = getSheetRecords(SHEETS.VACANCIES);
      return jsonResponse({ success: true, data: data });
    }

    if (action === 'getAdmissions') {
      const data = getSheetRecords(SHEETS.ADMISSIONS);
      return jsonResponse({ success: true, data: data });
    }

    if (action === 'submitAdmission') {
      return handleAdmissionSubmission(e.parameter);
    }

    return jsonResponse({
      success: true,
      message: 'Oakwood International School API is live.',
      data: { available_actions: ['getFaculty', 'getAlumni', 'getVacancies', 'getAdmissions', 'submitAdmission'] }
    });

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return jsonResponse({ success: false, error: error.message || error.toString() });
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  Logger.log('doPost triggered.');
  try {
    let payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        Logger.log('Could not parse postData as JSON, using e.parameter');
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    Logger.log('Parsed payload: ' + JSON.stringify(payload));
    const action = (e && e.parameter && e.parameter.action) || payload.action || 'submitAdmission';

    if (action === 'submitAdmission') {
      return handleAdmissionSubmission(payload);
    }

    if (action === 'addFaculty') {
      return handleAddFaculty(payload);
    }

    if (action === 'addAlumnus') {
      return handleAddAlumnus(payload);
    }

    if (action === 'addVacancy') {
      return handleAddVacancy(payload);
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({ success: false, error: error.message || error.toString() });
  }
}

/**
 * Reads all records safely with automatic sheet creation if missing
 */
function getSheetRecords(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  // Auto-create missing sheets on the fly
  if (!sheet) {
    Logger.log('Sheet ' + sheetName + ' not found. Automatically initializing...');
    setupSchoolSheets();
    sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // Safe empty sheet handling: 1 row means header only, no records
  if (lastRow <= 1 || lastCol === 0) {
    return [];
  }

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const records = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const record = {};
    let hasContent = false;

    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      const val = row[c];
      record[key] = val;
      if (val !== '' && val !== null && val !== undefined) {
        hasContent = true;
      }
    }

    if (hasContent) {
      records.push(record);
    }
  }

  return records;
}

/**
 * Handles admission submission with validation and rate limiting
 */
function handleAdmissionSubmission(data) {
  Logger.log('Processing admission submission...');
  const fullName = (data.full_name || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();
  const address = (data.address || '').trim();
  const classApplying = (data.class_applying || data.class_applied || '').trim();

  // Validation
  if (!fullName || !phone || !email || !address || !classApplying) {
    Logger.log('Validation failed: missing fields.');
    return jsonResponse({
      success: false,
      error: 'All fields are required (Full Name, Phone, Email, Address, Class Applying For).'
    });
  }

  // Rate limiting (1 per phone per 60s)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone) {
    const cacheKey = 'rate_' + cleanPhone;
    const cache = CacheService.getScriptCache();
    if (cache.get(cacheKey)) {
      Logger.log('Rate limit triggered for phone: ' + cleanPhone);
      return jsonResponse({
        success: false,
        error: 'An application from this number was recently submitted. Please wait 1 minute before submitting again.'
      });
    }
    cache.put(cacheKey, 'submitted', 60);
  }

  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.ADMISSIONS);
  if (!sheet) {
    setupSchoolSheets();
    sheet = ss.getSheetByName(SHEETS.ADMISSIONS);
  }

  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const admissionId = 'OIS-' + year + '-' + randomNum;
  const submittedAt = new Date().toISOString();
  const status = 'Pending';

  sheet.appendRow([
    admissionId,
    fullName,
    phone,
    email,
    address,
    classApplying,
    status,
    submittedAt
  ]);

  Logger.log('Admission saved successfully with ID: ' + admissionId);

  return jsonResponse({
    success: true,
    admission_id: admissionId,
    message: 'Application received successfully. Our admissions team will contact you within 48 hours.'
  });
}

function handleAddFaculty(data) {
  if (!data.name || !data.subject) {
    return jsonResponse({ success: false, error: 'Name and subject are required.' });
  }
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.FACULTY);
  if (!sheet) {
    setupSchoolSheets();
    sheet = ss.getSheetByName(SHEETS.FACULTY);
  }
  sheet.appendRow([data.name, data.subject, data.qualification || '', data.photo_url || '']);
  return jsonResponse({ success: true, message: 'Faculty member added successfully.' });
}

function handleAddAlumnus(data) {
  if (!data.name || !data.achievement) {
    return jsonResponse({ success: false, error: 'Name and achievement are required.' });
  }
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.ALUMNI);
  if (!sheet) {
    setupSchoolSheets();
    sheet = ss.getSheetByName(SHEETS.ALUMNI);
  }
  sheet.appendRow([data.name, data.achievement, data.year || new Date().getFullYear(), data.photo_url || '']);
  return jsonResponse({ success: true, message: 'Alumnus added successfully.' });
}

function handleAddVacancy(data) {
  if (!data.position || !data.department) {
    return jsonResponse({ success: false, error: 'Position and department are required.' });
  }
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.VACANCIES);
  if (!sheet) {
    setupSchoolSheets();
    sheet = ss.getSheetByName(SHEETS.VACANCIES);
  }
  sheet.appendRow([data.position, data.department, data.description || '']);
  return jsonResponse({ success: true, message: 'Vacancy added successfully.' });
}

/**
 * Standardized JSON response builder
 */
function jsonResponse(obj) {
  const payload = {
    success: obj.success !== false,
    data: obj.data !== undefined ? obj.data : null,
    error: obj.error || null,
    message: obj.message || null
  };
  if (obj.admission_id) {
    payload.admission_id = obj.admission_id;
  }
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
