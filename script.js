/* ============================================================
   SCHOOL WEBSITE — SCRIPT.JS
   Smooth scroll · Sticky nav · Stat count-up · Scroll reveal
   Admission form submit · Mobile nav
   Zero dependencies, ~8KB uncompressed.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM references ---------- */
  const header      = document.getElementById('site-header');
  const hamburger   = document.getElementById('hamburger');
  const mobileNav   = document.getElementById('mobile-nav');
  const form        = document.getElementById('admission-form');
  const formMessage = document.getElementById('form-message');

  /* ---------- 1. Sticky nav (transparent → solid) ---------- */
  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.remove('transparent');
      header.classList.add('scrolled');
    } else {
      header.classList.add('transparent');
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // initial state

  /* ---------- 2. Mobile hamburger ---------- */
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- 3. Active nav link highlight ---------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id], div[id]');

  function setActiveLink() {
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---------- 4. Animated stat counter ---------- */
  var countersAnimated = new Set();

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (!target || countersAnimated.has(el)) return;
    countersAnimated.add(el);

    var duration = 2000; // ms
    var startTime = null;
    // Determine suffix: "+", "%" etc.
    var suffix = '';
    var label = el.nextElementSibling;
    if (label) {
      var labelText = label.textContent.toLowerCase();
      if (labelText.includes('rate') || labelText.includes('percent')) {
        suffix = '%';
      } else {
        suffix = '+';
      }
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* ---------- 5. Scroll-reveal (IntersectionObserver) ---------- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- 6. Stat counter observer ---------- */
  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var counters = entry.target.querySelectorAll('[data-count]');
          counters.forEach(animateCounter);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.stat-strip, .alumni-stats-band').forEach(function (el) {
    statObserver.observe(el);
  });

  /* ---------- 7. Admission form submit (Google Sheets Integration) ---------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      if (typeof window.handleAdmissionSubmit === 'function') {
        window.handleAdmissionSubmit(e);
      }
    });
  }

  /* ---------- 8. Smooth scroll for all anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
