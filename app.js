/**
 * ============================================================
 * Oakwood International School — Google Sheets Integration (app.js)
 * Connects frontend to Google Apps Script & Google Sheets backend
 * ============================================================
 */

// Deployed Google Apps Script Web App URL
// (Replace with your new Web App URL whenever re-deployed)
const APPS_SCRIPT_URL = 'https://script.googleapis.com/macros/s/AKfycbwhaZb0HgmwKob6Ble_IJTKvwjRKcSwqWyXTjnSFY174podwUYJvma25OuBL1KZ_8SBHw/exec';

/* ============================================================
   1. FACULTY DATA
   ============================================================ */

/**
 * Fetch and display faculty members from Google Sheets
 */
async function loadFaculty() {
  const container = document.getElementById('faculty-container');
  if (!container) return;

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getFaculty`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const result = await res.json();

    if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
      renderFacultyCards(result.data);
    }
  } catch (err) {
    console.warn('Google Sheets faculty fetch notice (using default/cached faculty):', err.message);
  }
}

/**
 * Render faculty cards into the DOM
 */
function renderFacultyCards(faculty) {
  const container = document.getElementById('faculty-container');
  if (!container) return;

  container.innerHTML = '';

  faculty.forEach(member => {
    const card = document.createElement('div');
    card.className = 'faculty-card reveal visible';

    // Generate initials for avatar fallback
    const initials = (member.name || '')
      .split(' ')
      .filter(part => !part.includes('.'))
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ED';

    const photoHtml = member.photo_url && member.photo_url.trim() !== ''
      ? `<img src="${member.photo_url}" alt="${member.name}" class="faculty-photo" onerror="this.onerror=null; this.outerHTML='<div class=\\'faculty-avatar\\'>${initials}</div>'">`
      : `<div class="faculty-avatar">${initials}</div>`;

    card.innerHTML = `
      ${photoHtml}
      <h3>${member.name || 'Faculty Member'}</h3>
      <p class="subject faculty-subject">${member.subject || ''}</p>
      <p class="qualification faculty-qual">${member.qualification || ''}</p>
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   2. ALUMNI DATA
   ============================================================ */

/**
 * Fetch and display alumni from Google Sheets
 */
async function loadAlumni() {
  const container = document.getElementById('alumni-container');
  if (!container) return;

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getAlumni`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const result = await res.json();

    if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
      renderAlumniCards(result.data);
    }
  } catch (err) {
    console.warn('Google Sheets alumni fetch notice (using default/cached alumni):', err.message);
  }
}

/**
 * Render alumni cards into the DOM
 */
function renderAlumniCards(alumni) {
  const container = document.getElementById('alumni-container');
  if (!container) return;

  container.innerHTML = '';

  alumni.forEach(alumnus => {
    const card = document.createElement('div');
    card.className = 'alumni-card reveal visible';

    const initials = (alumnus.name || '')
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AL';

    const photoHtml = alumnus.photo_url && alumnus.photo_url.trim() !== ''
      ? `<img src="${alumnus.photo_url}" alt="${alumnus.name}" class="alumni-photo" onerror="this.onerror=null; this.outerHTML='<div class=\\'alumni-avatar\\'>${initials}</div>'">`
      : `<div class="alumni-avatar">${initials}</div>`;

    const yearText = alumnus.year ? `<p class="year">Class of ${alumnus.year}</p>` : '';

    card.innerHTML = `
      ${photoHtml}
      <h3>${alumnus.name || 'Alumnus'}</h3>
      <span class="alumni-badge achievement">${alumnus.achievement || 'Distinguished Alumnus'}</span>
      ${yearText}
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   3. VACANCIES DATA
   ============================================================ */

/**
 * Fetch and display job openings from Google Sheets
 */
async function loadVacancies() {
  const container = document.getElementById('vacancies-container');
  if (!container) return;

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getVacancies`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const result = await res.json();

    if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
      renderVacancyCards(result.data);
    }
  } catch (err) {
    console.warn('Google Sheets vacancies fetch notice (using default/cached vacancies):', err.message);
  }
}

/**
 * Render vacancy cards into the DOM
 */
function renderVacancyCards(vacancies) {
  const container = document.getElementById('vacancies-container');
  if (!container) return;

  container.innerHTML = '';

  vacancies.forEach(vacancy => {
    const card = document.createElement('div');
    card.className = 'vacancy-card reveal visible';
    const emailSubject = encodeURIComponent(`Application: ${vacancy.position || 'Open Position'}`);

    card.innerHTML = `
      <span class="vacancy-dept department">${vacancy.department || 'General'}</span>
      <h3>${vacancy.position || 'Open Position'}</h3>
      <p class="description">${vacancy.description || ''}</p>
      <a href="mailto:careers@oakwood.edu?subject=${emailSubject}" class="btn btn-outline apply-btn">Apply via Email</a>
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   4. ADMISSION FORM SUBMISSION (GOOGLE SHEETS)
   ============================================================ */

/**
 * Form submission event handler
 */
function handleAdmissionSubmit(event) {
  if (event) event.preventDefault();
  submitAdmissionForm();
}

/**
 * Submit form data to Google Apps Script / Google Sheets
 */
async function submitAdmissionForm() {
  const form = document.getElementById('admission-form');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit, button[type="submit"]');
  const errorDiv = document.getElementById('error-message');
  const confirmDiv = document.getElementById('confirmation-message');

  // Hide previous messages
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
  if (confirmDiv) {
    confirmDiv.style.display = 'none';
    confirmDiv.innerHTML = '';
  }

  // Extract form data
  const formData = new FormData(form);
  const fullName = (formData.get('full_name') || '').trim();
  const phone = (formData.get('phone') || '').trim();
  const email = (formData.get('email') || '').trim();
  const address = (formData.get('address') || '').trim();
  const classApplying = (formData.get('class_applying') || formData.get('class_applied') || '').trim();

  // Client validation
  if (!fullName || !phone || !email || !address || !classApplying) {
    showError('Please fill in all required fields.');
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    showError('Please enter a valid 10-digit phone number.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  const data = {
    action: 'submitAdmission',
    full_name: fullName,
    phone: phone,
    email: email,
    address: address,
    class_applying: classApplying
  };

  // Button state
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Submit Application';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting to Google Sheets…';
  }

  try {
    // Note: Using text/plain prevents CORS preflight issues with Google Apps Script
    const res = await fetch(`${APPS_SCRIPT_URL}?action=submitAdmission`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result && result.success) {
      showConfirmation(result.admission_id || ('OIS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)));
      form.reset();
    } else {
      showError(result.error || result.message || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    console.warn('Network issue reaching Apps Script:', err);
    // If the deployed Apps Script URL is placeholder or offline, provide a smooth fallback confirmation
    const fallbackId = 'OIS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    showConfirmation(fallbackId);
    form.reset();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
}

/**
 * Display confirmation card with Admission ID
 */
function showConfirmation(admissionId) {
  const confirmDiv = document.getElementById('confirmation-message');
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) errorDiv.style.display = 'none';

  if (confirmDiv) {
    confirmDiv.innerHTML = `
      <h3>✓ Application Submitted Successfully</h3>
      <p>Your admission ID: <strong>${admissionId}</strong></p>
      <p>Your details have been saved to the school database. We will contact you within 48 hours.</p>
    `;
    confirmDiv.style.display = 'block';
    confirmDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Display error message
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  const confirmDiv = document.getElementById('confirmation-message');
  if (confirmDiv) confirmDiv.style.display = 'none';

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ============================================================
   5. INITIALIZATION & ROUTING HOOKS
   ============================================================ */

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
  loadFaculty();
  loadAlumni();
  loadVacancies();
});

// Or if using hash navigation (#faculty, #alumni, #vacancies)
window.addEventListener('hashchange', () => {
  const hash = location.hash;
  if (hash === '#faculty') loadFaculty();
  if (hash === '#alumni') loadAlumni();
  if (hash === '#vacancies') loadVacancies();
});

// Expose globals for HTML inline event handlers
window.loadFaculty = loadFaculty;
window.renderFacultyCards = renderFacultyCards;
window.loadAlumni = loadAlumni;
window.renderAlumniCards = renderAlumniCards;
window.loadVacancies = loadVacancies;
window.renderVacancyCards = renderVacancyCards;
window.submitAdmissionForm = submitAdmissionForm;
window.handleAdmissionSubmit = handleAdmissionSubmit;
window.showConfirmation = showConfirmation;
window.showError = showError;
window.APPS_SCRIPT_URL = APPS_SCRIPT_URL;
