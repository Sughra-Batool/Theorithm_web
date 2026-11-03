(function () {
  'use strict';

  var root = document.querySelector('.thrm');
  if (!root) { return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var supportsIO = ('IntersectionObserver' in window);

  /* ------------------------------------------------------------------ *
   * 0. FOOTER YEAR
   * ------------------------------------------------------------------ */
  var yearEl = document.getElementById('thrm-year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ------------------------------------------------------------------ *
   * 1. ENTRANCE CHOREOGRAPHY (both sections)
   * ------------------------------------------------------------------ */
  var revealEls = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));

  if (reduce || !supportsIO) {
    revealEls.forEach(function (el) {
      el.classList.add('is-in');
      el.removeAttribute('data-reveal');
    });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) { revealIO.observe(el); });

    root.addEventListener('animationend', function (event) {
      if (event.animationName === 'thrm-rise') {
        event.target.removeAttribute('data-reveal');
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. METHODOLOGY RAIL — sequential underline draw (Road Map)
   * ------------------------------------------------------------------ */
  var rail = root.querySelector('.thrm-rail');
  if (rail) {
    if (reduce || !supportsIO) {
      rail.classList.add('is-in');
    } else {
      var railIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            rail.classList.add('is-in');
            railIO.disconnect();
          }
        });
      }, { threshold: 0.35 });
      railIO.observe(rail);
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. ACCESSIBLE ACCORDIONS (Road Map)
   * ------------------------------------------------------------------ */
  var cards = Array.prototype.slice.call(root.querySelectorAll('.thrm-card'));

  cards.forEach(function (card) {
    var btn   = card.querySelector('.thrm-card__toggle');
    var panel = card.querySelector('.thrm-card__panel');
    if (!btn || !panel) { return; }

    if ('inert' in HTMLElement.prototype) { panel.inert = true; }

    btn.addEventListener('click', function () {
      var isOpen = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if ('inert' in HTMLElement.prototype) { panel.inert = !isOpen; }
    });
  });

  /* ------------------------------------------------------------------ *
   * 4. HOVER PHYSICS — cursor spotlight + micro-tilt
   * ------------------------------------------------------------------ */
  if (fine && !reduce) {
    var physics = Array.prototype.slice.call(
      root.querySelectorAll('.thrm-card, .thrm-layer, .thrm-module')
    );

    physics.forEach(function (card) {
      var raf = 0;
      var mx = 0, my = 0;

      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) { return; }
        mx = event.clientX - rect.left;
        my = event.clientY - rect.top;
        card.style.setProperty('--mx', mx + 'px');
        card.style.setProperty('--my', my + 'px');
        if (!raf) {
          raf = window.requestAnimationFrame(function () {
            raf = 0;
            var rx = ((my / rect.height) - 0.5) * -2.0;
            var ry = ((mx / rect.width)  - 0.5) *  2.0;
            card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
            card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          });
        }
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. CHIP → CARD LINKAGE (Road Map)
   * ------------------------------------------------------------------ */
  var chips = Array.prototype.slice.call(root.querySelectorAll('.thrm-chip'));

  chips.forEach(function (chip) {
    var targetId = chip.getAttribute('data-target');
    var target = targetId ? document.getElementById(targetId) : null;
    if (!target) { return; }

    var on  = function () { target.classList.add('is-active'); };
    var off = function () { target.classList.remove('is-active'); };

    chip.addEventListener('mouseenter', on);
    chip.addEventListener('mouseleave', off);
    chip.addEventListener('focus', on);
    chip.addEventListener('blur', off);
  });

  /* ------------------------------------------------------------------ *
   * 6. ACTIVE SUB-NAV
   * ------------------------------------------------------------------ */
  if (supportsIO) {
    if (chips.length && cards.length) {
      var cardIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var id = entry.target.id;
          chips.forEach(function (chip) {
            chip.setAttribute('aria-current', chip.getAttribute('data-target') === id ? 'true' : 'false');
          });
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      cards.forEach(function (card) { cardIO.observe(card); });
    }

    var navLinks = Array.prototype.slice.call(
      root.querySelectorAll('.thrm-subnav__list a')
    );
    if (navLinks.length) {
      var navSections = navLinks
        .map(function (a) { return document.getElementById(a.getAttribute('data-target')); })
        .filter(Boolean);

      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var id = entry.target.id;
          navLinks.forEach(function (a) {
            a.setAttribute('aria-current', a.getAttribute('data-target') === id ? 'true' : 'false');
          });
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

      navSections.forEach(function (s) { navIO.observe(s); });
    }
  }

  /* ------------------------------------------------------------------ *
   * 7. FAQ ACCORDION (added per instruction)
   * ------------------------------------------------------------------ */
  var faqButtons = Array.prototype.slice.call(root.querySelectorAll('.thrm-faq__q'));

  faqButtons.forEach(function (btn) {
    var item = btn.closest('.thrm-faq__item');
    if (!item) { return; }
    var panel = item.querySelector('.thrm-faq__a');
    if (!panel) { return; }

    if ('inert' in HTMLElement.prototype) { panel.inert = true; }

    btn.addEventListener('click', function () {
      var isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if ('inert' in HTMLElement.prototype) { panel.inert = !isOpen; }
    });
  });

})();

/* ------------------------------------------------------------------ *
 * 8. HEADER — mobile menu toggle (added per instruction)
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  var header     = document.querySelector('.thrm-header');
  var toggle     = header ? header.querySelector('.thrm-header__toggle') : null;
  var mobileMenu = header ? header.querySelector('.thrm-header__mobile') : null;
  if (!header || !toggle || !mobileMenu) { return; }

  function setOpen(open) {
    mobileMenu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setOpen(!mobileMenu.classList.contains('is-open'));
  });

  // Close on link click
  Array.prototype.slice.call(mobileMenu.querySelectorAll('a')).forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  // Close on Escape
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', function (event) {
    if (!mobileMenu.classList.contains('is-open')) { return; }
    if (header.contains(event.target)) { return; }
    setOpen(false);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.thrm-header');
  
  if (header) {
    const handleScroll = () => {
      // Check if the page has been scrolled down
      if (window.scrollY > 10) {
        header.classList.add('thrm-header--scrolled');
      } else {
        header.classList.remove('thrm-header--scrolled');
      }
    };

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Run once on load in case the page is already scrolled (e.g., on refresh)
    handleScroll();
  }
});
//js for the form

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Header Height Calculation
  const header = document.querySelector('.thrm-header');
  const overlay = document.getElementById('thrm-contact-overlay');
  
  if (header) {
    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--thrm-header-height', `${header.offsetHeight}px`);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
  }

  // 2. Trigger Elements (All "Talk to Theorithm" buttons)
  const triggerButtons = document.querySelectorAll('a[href="#thrm-contact"], a[href="https://www.theorithm.com/contact"]');
  
  const formSection = document.getElementById('thrm-form-section');
  const thankYouSection = document.getElementById('thrm-thankyou-section');
  const contactForm = document.getElementById('thrm-contact-form');
  
  // 3. Open Overlay
  if (triggerButtons.length > 0 && overlay) {
    triggerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop default anchor jump
        
        // Reset form and views
        if(contactForm) contactForm.reset();
        if(formSection) formSection.hidden = false;
        if(thankYouSection) thankYouSection.hidden = true;
        
        // Show Overlay
        overlay.hidden = false;
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden'; 
      });
    });
  }

  // 4. Close Overlay Functionality
  const closeButtons = document.querySelectorAll('.js-close-form');
  
  const closeOverlay = () => {
    if (overlay) {
      overlay.hidden = true;
      document.body.style.overflow = ''; // Restore scrolling
    }
  };

  closeButtons.forEach(btn => btn.addEventListener('click', closeOverlay));

  // Close when clicking outside the form container
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
  }

  // 5. NEW: Close Overlay when Header Links are clicked
  const headerLinks = document.querySelectorAll('.thrm-header a');
  headerLinks.forEach(link => {
    link.addEventListener('click', () => {
      // If the overlay is open, close it. This restores body scrolling 
      // and allows the browser to process the anchor link normally.
      closeOverlay();
    });
  });

  // 6. Handle Form Submission
  // 6. Handle Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent the default page reload

      // --- CONFIGURATION ---
      // PASTE YOUR DEPLOYED WEB APP URL HERE
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxw4kT91VyVnfy5dreoVWiV-vmODhByVLuzGB037dSwqafkLMj9mbIEi_dE4dmHnozhyA/exec'; 

      // Gather form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Check if all required fields are filled
      const isComplete = data.company && data.email && data.person && data.details && data.query;

      try {
        // Send the data to Google Apps Script using fetch
        await fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors', // Important for avoiding CORS issues with Apps Script[reference:3]
          body: new URLSearchParams(data), // Send data as URL-encoded form data
        });

        // --- SUCCESS HANDLING ---
        if (isComplete) {
          // Show the Thank You message
          formSection.hidden = true;
          thankYouSection.hidden = false;
        } else {
          // If the user didn't fill everything, silently close as per your requirement
          closeOverlay();
        }

      } catch (error) {
        console.error('Error submitting form:', error);
        // Optional: You could show an error message to the user here
      }
    });
  }
});