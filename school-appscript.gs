/**
 * ============================================================
 * Oakwood International School — Google Apps Script Backend
 * ============================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (create a new sheet, e.g. "School Database")
 * 2. In Google Sheets menu, click: Extensions > Apps Script
 *    (Or visit https://script.google.com and create a new project)
 * 3. Replace all code in the script editor with this file's contents.
 * 4. If running as a standalone script (not created via Extensions in the Sheet),
 *    paste your Sheet ID into SPREADSHEET_ID below.
 *    (If created via Extensions > Apps Script, it auto-detects the active sheet!)
 * 5. In the Apps Script toolbar, select "setupSchoolSheets" from the dropdown and click "Run".
 *    Grant the requested permissions. This automatically creates the 4 tables:
 *    - admissions
 *    - faculty
 *    - alumni
 *    - vacancies
 * 6. Click "Deploy" > "New deployment".
 *    - Type: "Web app"
 *    - Description: "School Website API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Crucial so website visitors can submit forms and read data)
 * 7. Click "Deploy" and copy the Web App URL (ends with /exec).
 * 8. Paste that URL into `app.js` as `APPS_SCRIPT_URL`.
 * ============================================================
 */

// Replace with your actual Google Sheet ID if not using a bound container script:
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

/**
 * Returns the target Google Spreadsheet instance
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {
    // Standalone script
  }

  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Please set your SPREADSHEET_ID in school-appscript.gs, or bind this script to the sheet via Extensions > Apps Script.');
  }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Run this function once from the Apps Script editor to initialize all sheets with
 * correct headers, elegant styling, and seed data.
 */
function setupSchoolSheets() {
  const ss = getSpreadsheet();
  
  // Sheet configurations: name, headers, seed data
  const sheetConfigs = [
    {
      name: 'admissions',
      headers: ['admission_id', 'full_name', 'phone', 'email', 'address', 'class_applying', 'status', 'submitted_at'],
      seeds: []
    },
    {
      name: 'faculty',
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
      name: 'alumni',
      headers: ['name', 'achievement', 'year', 'photo_url'],
      seeds: [
        ['Aarav Kumar', 'Board Topper — State 1st in 12th Board Exams (IIT Madras)', '2022', ''],
        ['Priya Subramanian', 'Olympiad Gold — International Science Olympiad (Stanford University)', '2021', ''],
        ['Rohit Nair', 'National Sports — U-19 Tamil Nadu cricket captain', '2023', ''],
        ['Deepika Lakshmi', 'Medical — NEET AIR 42 (MBBS at JIPMER)', '2020', '']
      ]
    },
    {
      name: 'vacancies',
      headers: ['position', 'department', 'description'],
      seeds: [
        [
          'Senior Mathematics Teacher',
          'Mathematics',
          'Experienced educator for grades 9–12 with strong board exam preparation track record. M.Sc. Mathematics and B.Ed. required.'
        ],
        [
          'Pre-Primary Coordinator',
          'Early Years',
          'Lead our early years programme with a focus on play-based learning. Montessori or NTT certification preferred.'
        ],
        [
          'Admissions Counsellor',
          'Administration',
          'Friendly, organised professional to manage parent enquiries, campus tours, and the admissions pipeline.'
        ]
      ]
    }
  ];

  sheetConfigs.forEach(function (cfg) {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }

    // Set headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      
      // Style headers: Forest green (#1F3D2B) background, white text, bold
      const headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setBackground('#1F3D2B');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setFontFamily('Arial');
      sheet.setFrozenRows(1);

      // Populate seeds
      if (cfg.seeds && cfg.seeds.length > 0) {
        cfg.seeds.forEach(function (row) {
          sheet.appendRow(row);
        });
      }

      // Auto-fit column widths
      for (let c = 1; c <= cfg.headers.length; c++) {
        sheet.autoResizeColumn(c);
      }
    }
  });

  // Remove default "Sheet1" if empty and other sheets exist
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  Logger.log('Oakwood School Sheets successfully initialized!');
  return 'Success: All tables (admissions, faculty, alumni, vacancies) have been created and formatted.';
}

/**
 * Handle GET requests
 * Endpoints:
 *   ?action=getFaculty
 *   ?action=getAlumni
 *   ?action=getVacancies
 *   ?action=getAdmissions
 *   ?action=submitAdmission (fallback for GET)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

    if (action === 'getFaculty') {
      return jsonResponse({ success: true, data: getSheetRecords('faculty') });
    }

    if (action === 'getAlumni') {
      return jsonResponse({ success: true, data: getSheetRecords('alumni') });
    }

    if (action === 'getVacancies') {
      return jsonResponse({ success: true, data: getSheetRecords('vacancies') });
    }

    if (action === 'getAdmissions') {
      return jsonResponse({ success: true, data: getSheetRecords('admissions') });
    }

    // GET fallback for submitting admission form
    if (action === 'submitAdmission') {
      return handleAdmissionSubmission(e.parameter);
    }

    return jsonResponse({
      success: true,
      message: 'Oakwood International School API is live.',
      available_actions: ['getFaculty', 'getAlumni', 'getVacancies', 'getAdmissions', 'submitAdmission']
    });

  } catch (error) {
    return jsonResponse({ success: false, error: error.message || error.toString() });
  }
}

/**
 * Handle POST requests
 * Endpoints:
 *   ?action=submitAdmission
 *   ?action=addFaculty
 *   ?action=addAlumnus
 *   ?action=addVacancy
 */
function doPost(e) {
  try {
    let payload = {};

    // Parse JSON body or form parameters
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

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
    return jsonResponse({ success: false, error: error.message || error.toString() });
  }
}

/**
 * Reads all records from a specified sheet as an array of JSON objects
 */
function getSheetRecords(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return []; // Only headers or empty

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
 * Handles admission submission and appends to 'admissions' sheet
 */
function handleAdmissionSubmission(data) {
  const fullName = (data.full_name || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();
  const address = (data.address || '').trim();
  const classApplying = (data.class_applying || data.class_applied || '').trim();

  // Basic validation
  if (!fullName || !phone || !email || !address || !classApplying) {
    return jsonResponse({
      success: false,
      error: 'Please fill in all required fields (Full Name, Phone, Email, Address, Class Applying For).'
    });
  }

  // Rate limiting: 1 submission per phone/email per 60 seconds
  const cacheKey = 'rate_' + phone.replace(/[^0-9]/g, '');
  const cache = CacheService.getScriptCache();
  if (cache.get(cacheKey)) {
    return jsonResponse({
      success: false,
      error: 'An application from this phone number was recently submitted. Please wait 1 minute before submitting again.'
    });
  }

  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('admissions');
  if (!sheet) {
    setupSchoolSheets();
    sheet = ss.getSheetByName('admissions');
  }

  // Generate unique Admission ID: e.g. OIS-2024-XXXX
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const admissionId = 'OIS-' + year + '-' + randomNum;
  const submittedAt = new Date().toISOString();
  const status = 'Pending';

  // Append row matching: admission_id, full_name, phone, email, address, class_applying, status, submitted_at
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

  // Set rate-limit flag in cache for 60 seconds
  cache.put(cacheKey, 'submitted', 60);

  return jsonResponse({
    success: true,
    admission_id: admissionId,
    message: 'Application received successfully. Our admissions team will contact you within 48 hours.'
  });
}

/**
 * Admin action: Add faculty
 */
function handleAddFaculty(data) {
  if (!data.name || !data.subject) {
    return jsonResponse({ success: false, error: 'Name and subject are required.' });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('faculty');
  if (!sheet) return jsonResponse({ success: false, error: 'Faculty sheet not found.' });

  sheet.appendRow([
    data.name,
    data.subject,
    data.qualification || '',
    data.photo_url || ''
  ]);

  return jsonResponse({ success: true, message: 'Faculty member added successfully.' });
}

/**
 * Admin action: Add alumnus
 */
function handleAddAlumnus(data) {
  if (!data.name || !data.achievement) {
    return jsonResponse({ success: false, error: 'Name and achievement are required.' });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('alumni');
  if (!sheet) return jsonResponse({ success: false, error: 'Alumni sheet not found.' });

  sheet.appendRow([
    data.name,
    data.achievement,
    data.year || new Date().getFullYear(),
    data.photo_url || ''
  ]);

  return jsonResponse({ success: true, message: 'Alumnus added successfully.' });
}

/**
 * Admin action: Add vacancy
 */
function handleAddVacancy(data) {
  if (!data.position || !data.department) {
    return jsonResponse({ success: false, error: 'Position and department are required.' });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('vacancies');
  if (!sheet) return jsonResponse({ success: false, error: 'Vacancies sheet not found.' });

  sheet.appendRow([
    data.position,
    data.department,
    data.description || ''
  ]);

  return jsonResponse({ success: true, message: 'Vacancy added successfully.' });
}

/**
 * Outputs JSON with proper MIME type for web clients
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
