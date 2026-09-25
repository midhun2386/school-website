/**
 * Serverless API function: POST /api/admissions
 * Validates admission form data and inserts into Neon Postgres.
 *
 * Environment variable required:
 *   DATABASE_URL — Neon Postgres connection string
 *
 * Works with: Vercel Functions, Netlify Functions, or any Node.js serverless runtime.
 * Uses @neondatabase/serverless for HTTP-based Postgres connection (no TCP needed).
 */

// -- If deploying to Vercel/Netlify, install: npm install @neondatabase/serverless
// import { neon } from '@neondatabase/serverless';

// For Node.js / Express standalone, use pg:
// const { Pool } = require('pg');

const ALLOWED_CLASSES = [
  'Pre-KG', 'LKG', 'UKG',
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th', '11th', '12th'
];

/**
 * Main handler (Vercel-style export)
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const { full_name, phone, email, address, class_applied } = req.body || {};

    // --- Server-side validation ---
    if (!full_name || !phone || !email || !address || !class_applied) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields correctly.'
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!ALLOWED_CLASSES.includes(class_applied)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class selection.'
      });
    }

    // --- Database insert ---
    // Using @neondatabase/serverless (recommended for serverless environments)
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO admissions (full_name, phone, email, address, class_applied)
      VALUES (${full_name}, ${phone}, ${email}, ${address}, ${class_applied})
    `;

    return res.status(200).json({
      success: true,
      message: 'Application received. Our admissions team will contact you within 48 hours.'
    });

  } catch (error) {
    console.error('Admissions API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact us directly.'
    });
  }
}
