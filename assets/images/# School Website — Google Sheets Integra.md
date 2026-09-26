# School Website — Google Sheets Integration Blueprint
**Converting from Postgres to Google Apps Script backend**

Your existing single-page school website (`index.html` + `style.css` + `app.js`) now connects to Google Sheets via Apps Script, instead of Neon Postgres.

---

## 1. Setup: Deploy Google Apps Script

You already have your deployment URL:
```
https://script.googleapis.com/macros/s/AKfycbwhaZb0HgmwKob6Ble_IJTKvwjRKcSwqWyXTjnSFY174podwUYJvma25OuBL1KZ_8SBHw/exec
```

**Steps:**
1. Create a Google Sheet (any name, e.g. "School Database")
2. Copy its Sheet ID from the URL
3. Go to [apps.script.google.com](https://apps.script.google.com)
4. Create a new project
5. Paste the entire `school-appscript.gs` code
6. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
7. Run the `setupSchoolSheets()` function to create all tables
8. Deploy as Web App (Execute as: your account, Access: Anyone)
9. Done — your App Script URL is ready to use

---

## 2. What Each Endpoint Does

| Endpoint | Method | Purpose |
|---|---|---|
| `?action=getFaculty` | GET | Fetch all faculty members (name, subject, qualification, photo) |
| `?action=getAlumni` | GET | Fetch all alumni with achievements |
| `?action=getVacancies` | GET | Fetch open job positions |
| `?action=getAdmissions` | GET | Fetch all admissions (admin/staff only in real app) |
| `submitAdmission` | POST | Submit a student admission form |
| `addFaculty` | POST | Add a new faculty member |
| `addAlumnus` | POST | Add an alumnus entry |
| `addVacancy` | POST | Add a job vacancy |

---

## 3. Update your `app.js` — Key Fetch Calls

### 3.1 Set the API URL at the top of `app.js`

```js
// Replace with your actual deployed URL
const APPS_SCRIPT_URL = 'https://script.googleapis.com/macros/s/AKfycbwhaZb0HgmwKob6Ble_IJTKvwjRKcSwqWyXTjnSFY174podwUYJvma25OuBL1KZ_8SBHw/exec';
```

### 3.2 Load Faculty Data (runs on page load or when viewing #faculty section)

```js
async function loadFaculty() {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getFaculty`);
    const result = await res.json();
    
    if (result.success) {
      renderFacultyCards(result.data);
    }
  } catch (err) {
    console.error('Error loading faculty:', err);
  }
}

function renderFacultyCards(faculty) {
  const container = document.getElementById('faculty-container');
  container.innerHTML = '';
  
  faculty.forEach(member => {
    const card = document.createElement('div');
    card.className = 'faculty-card';
    card.innerHTML = `
      <img src="${member.photo_url || 'placeholder.png'}" alt="${member.name}">
      <h3>${member.name}</h3>
      <p class="subject">${member.subject}</p>
      <p class="qualification">${member.qualification}</p>
    `;
    container.appendChild(card);
  });
}
```

### 3.3 Load Alumni Data

```js
async function loadAlumni() {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getAlumni`);
    const result = await res.json();
    
    if (result.success) {
      renderAlumniCards(result.data);
    }
  } catch (err) {
    console.error('Error loading alumni:', err);
  }
}

function renderAlumniCards(alumni) {
  const container = document.getElementById('alumni-container');
  container.innerHTML = '';
  
  alumni.forEach(alumnus => {
    const card = document.createElement('div');
    card.className = 'alumni-card';
    card.innerHTML = `
      <img src="${alumnus.photo_url || 'placeholder.png'}" alt="${alumnus.name}">
      <h3>${alumnus.name}</h3>
      <p class="achievement">${alumnus.achievement}</p>
      <p class="year">Class of ${alumnus.year}</p>
    `;
    container.appendChild(card);
  });
}
```

### 3.4 Load Vacancies

```js
async function loadVacancies() {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getVacancies`);
    const result = await res.json();
    
    if (result.success) {
      renderVacancyCards(result.data);
    }
  } catch (err) {
    console.error('Error loading vacancies:', err);
  }
}

function renderVacancyCards(vacancies) {
  const container = document.getElementById('vacancies-container');
  container.innerHTML = '';
  
  vacancies.forEach(vacancy => {
    const card = document.createElement('div');
    card.className = 'vacancy-card';
    card.innerHTML = `
      <h3>${vacancy.position}</h3>
      <p class="department"><strong>Department:</strong> ${vacancy.department}</p>
      <p class="description">${vacancy.description}</p>
      <a href="mailto:careers@school.com" class="apply-btn">Apply</a>
    `;
    container.appendChild(card);
  });
}
```

### 3.5 Submit Admission Form

```js
async function submitAdmissionForm() {
  const form = document.getElementById('admission-form');
  const formData = new FormData(form);
  
  const data = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    class_applying: formData.get('class_applying')
  };
  
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=submitAdmission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (result.success) {
      showConfirmation(result.admission_id);
      form.reset();
    } else {
      showError(result.error || 'Something went wrong');
    }
  } catch (err) {
    showError('Network error: ' + err.message);
  }
}

function showConfirmation(admissionId) {
  const confirmDiv = document.getElementById('confirmation-message');
  confirmDiv.innerHTML = `
    <h3>✓ Form Submitted Successfully</h3>
    <p>Your admission ID: <strong>${admissionId}</strong></p>
    <p>We will contact you within 48 hours.</p>
  `;
  confirmDiv.style.display = 'block';
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}
```

---

## 4. Update your HTML — Add the Necessary IDs

Make sure your `index.html` has these container divs for the sections:

```html
<!-- Faculty Section -->
<section id="faculty">
  <h2>School Faculties</h2>
  <div id="faculty-container" class="grid"></div>
</section>

<!-- Alumni Section -->
<section id="alumni">
  <h2>Outstanding Alumni</h2>
  <div id="alumni-container" class="grid"></div>
</section>

<!-- Vacancies Section -->
<section id="vacancies">
  <h2>Join Our Team</h2>
  <div id="vacancies-container" class="list"></div>
</section>

<!-- Admission Section -->
<section id="admissions">
  <h2>Begin Your Child's Journey</h2>
  
  <div id="error-message" style="display:none; color: red;"></div>
  <div id="confirmation-message" style="display:none; color: green;"></div>
  
  <form id="admission-form" onsubmit="handleAdmissionSubmit(event)">
    <input type="text" name="full_name" placeholder="Full Name" required>
    <input type="tel" name="phone" placeholder="Phone Number" required>
    <input type="email" name="email" placeholder="Email" required>
    <textarea name="address" placeholder="Address" required></textarea>
    
    <select name="class_applying" required>
      <option value="">Select Class</option>
      <option value="Pre-KG">Pre-KG</option>
      <option value="LKG">LKG</option>
      <option value="UKG">UKG</option>
      <option value="1st">1st Std</option>
      <option value="2nd">2nd Std</option>
      <!-- ... continue through 12th -->
      <option value="12th">12th Std</option>
    </select>
    
    <button type="submit">Submit Application</button>
  </form>
</section>
```

### Add this handler for form submission:

```js
function handleAdmissionSubmit(event) {
  event.preventDefault();
  submitAdmissionForm();
}
```

---

## 5. Call these functions on page load or view change

```js
// Run on page load or when navigating to each section
window.addEventListener('load', () => {
  loadFaculty();
  loadAlumni();
  loadVacancies();
});

// Or if using hash routing (#faculty, #alumni, etc.):
window.addEventListener('hashchange', () => {
  const hash = location.hash;
  if (hash === '#faculty') loadFaculty();
  if (hash === '#alumni') loadAlumni();
  if (hash === '#vacancies') loadVacancies();
});
```

---

## 6. Google Sheet Structure (what you'll see after `setupSchoolSheets()`)

| Sheet | Columns |
|---|---|
| `admissions` | admission_id, full_name, phone, email, address, class_applying, status, submitted_at |
| `faculty` | name, subject, qualification, photo_url |
| `alumni` | name, achievement, year, photo_url |
| `vacancies` | position, department, description |

Every row added via the form or admin dashboard will appear directly in the Google Sheet — easy to manage and export.

---

## 7. Features

✓ Customers submit admission forms (no login needed)  
✓ Forms are instantly saved to Google Sheets  
✓ Faculty members displayed with photos & qualifications  
✓ Alumni achievements showcased  
✓ Job vacancies listed  
✓ Simple rate-limiting to prevent spam submissions (1 per IP per minute)  
✓ No backend server — everything runs on Google's infrastructure  

---

## 8. What to Do Next

1. ✓ Deploy the Google Apps Script (already done)
2. Create your Google Sheet
3. Run `setupSchoolSheets()` to create tables
4. Copy your Apps Script deployment URL into `app.js`
5. Add the functions above to `app.js`
6. Add the HTML sections to `index.html`
7. Test by visiting each section — data should load from Google Sheets

---

## 9. Admin Tasks (done directly in Google Sheets)

- **Add a faculty member:** Open the `faculty` sheet, add a new row with name, subject, qualification, photo URL
- **Add an alumnus:** Open the `alumni` sheet, add name, achievement, year, photo URL
- **Add a vacancy:** Open the `vacancies` sheet, add position, department, description
- **View submissions:** Open the `admissions` sheet to see all submitted admission forms

No backend dashboard needed — Google Sheets *is* your admin panel.