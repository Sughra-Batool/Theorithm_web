document.addEventListener('DOMContentLoaded', () => {
  // --- 1. RESTORE PATH FROM 404 REDIRECT & SCROLL TO SECTION ---
  const redirectPath = sessionStorage.getItem('redirectPath');
  if (redirectPath) {
    window.history.replaceState(null, '', redirectPath);
    sessionStorage.removeItem('redirectPath');
  }

  const urlToSectionMap = {
    '/home': 'thrm-roadmap',
    '/research': 'thrm-research',
    '/technology': 'thrm-tech',
    '/human-excellence': 'thrm-human',
    '/assurance-native': 'thrm-p04',
    '/learning': 'thrm-p01',
    '/quantum-computing': 'thrm-p05',
    '/photonic-computing': 'thrm-p07',
    '/faq': 'thrm-faq',
    '/contact-us': 'thrm-contact',
    '/legal': 'thrm-legal'
  };

  const currentPath = window.location.pathname;
  if (urlToSectionMap[currentPath]) {
    const targetId = urlToSectionMap[currentPath];
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  // --- 2. CORE SITE ANIMATIONS & INTERACTIONS ---
  (function () {
    'use strict';

    var root = document.querySelector('.thrm');
    if (!root) { return; }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var supportsIO = ('IntersectionObserver' in window);

    // Footer Year
    var yearEl = document.getElementById('thrm-year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    // Entrance Choreography
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

    // Methodology Rail
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

    // Road Map Accordions
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

    // Hover Physics
    if (fine && !reduce) {
      var physics = Array.prototype.slice.call(root.querySelectorAll('.thrm-card, .thrm-layer, .thrm-module'));
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

    // Chip Linkage
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

    // Active Sub-nav
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

      var navLinks = Array.prototype.slice.call(root.querySelectorAll('.thrm-subnav__list a'));
      if (navLinks.length) {
        var navSections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('data-target')); }).filter(Boolean);
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
  })();

  // --- 3. HEADER: MOBILE MENU TOGGLE ---
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

    Array.prototype.slice.call(mobileMenu.querySelectorAll('a')).forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!mobileMenu.classList.contains('is-open')) { return; }
      if (header.contains(event.target)) { return; }
      setOpen(false);
    });
  })();

  // --- 4. STICKY HEADER SCROLL STATE ---
  const header = document.querySelector('.thrm-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        header.classList.add('thrm-header--scrolled');
      } else {
        header.classList.remove('thrm-header--scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // --- 5. CONTACT FORM OVERLAY ---
  const overlay = document.getElementById('thrm-contact-overlay');
  if (header && overlay) {
    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--thrm-header-height', `${header.offsetHeight}px`);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
  }

  const triggerButtons = document.querySelectorAll('a[href="#thrm-contact"], a[href="https://www.theorithm.com/contact"]');
  const formSection = document.getElementById('thrm-form-section');
  const thankYouSection = document.getElementById('thrm-thankyou-section');
  const contactForm = document.getElementById('thrm-contact-form');

  if (triggerButtons.length > 0 && overlay) {
    triggerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); 
        if(contactForm) contactForm.reset();
        if(formSection) formSection.hidden = false;
        if(thankYouSection) thankYouSection.hidden = true;
        overlay.hidden = false;
        document.body.style.overflow = 'hidden'; 
      });
    });
  }

  const closeButtons = document.querySelectorAll('.js-close-form');
  const closeOverlay = () => {
    if (overlay) {
      overlay.hidden = true;
      document.body.style.overflow = ''; 
    }
  };

  closeButtons.forEach(btn => btn.addEventListener('click', closeOverlay));
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  const headerLinks = document.querySelectorAll('.thrm-header a');
  headerLinks.forEach(link => {
    link.addEventListener('click', closeOverlay);
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); 
      const scriptURL = 'https://script.google.com/macros/s/AKfycbx5RY9vQDjO5qpBkmbcTJ3H8yQqQ6oZslHtxzfzIv6lzUyEjyowEdm-ivL2SMm2QK4k/exec'; 
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      const isComplete = data.company && data.email && data.person && data.details && data.query;

      try {
        await fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams(data),
        });

        if (isComplete) {
          formSection.hidden = true;
          thankYouSection.hidden = false;
        } else {
          closeOverlay();
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    });
  }

    // --- 6. CLEAN URL NAVIGATION LINKS ---
  const navLinks = document.querySelectorAll('a[data-path]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const cleanPath = this.getAttribute('data-path');
      
      // 1. Handle the Logo / Home click (href="#" or href="#thrm-roadmap")
      if (cleanPath === '/home' || targetId === '#' || targetId === '#thrm-roadmap') {
        e.preventDefault(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (cleanPath) {
          window.history.pushState({ path: cleanPath }, '', cleanPath);
        }

        // Close mobile menu
        const mobileMenu = document.getElementById('thrm-header-mobile');
        const mobileToggle = document.querySelector('.thrm-header__toggle');
        if (mobileMenu && mobileMenu.classList.contains('is-open')) {
          mobileMenu.classList.remove('is-open');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
        return; // Stop execution here for the logo
      }

      // 2. Handle all other section links
      if (targetId && targetId.startsWith('#') && targetId !== '#') {
        e.preventDefault(); 
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (cleanPath) {
          window.history.pushState({ path: cleanPath }, '', cleanPath);
        }
        
        // Close mobile menu
        const mobileMenu = document.getElementById('thrm-header-mobile');
        const mobileToggle = document.querySelector('.thrm-header__toggle');
        if (mobileMenu && mobileMenu.classList.contains('is-open')) {
          mobileMenu.classList.remove('is-open');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // --- 7. FAQ & LEGAL TOGGLES ---
  // Master toggles (opens the main FAQ and Legal blocks)
  const masterToggles = document.querySelectorAll('.thrm-faq__master-btn, .thrm-legal__master-toggle');
  masterToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault(); 
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });

  // Individual FAQ items (opens the specific questions inside FAQ)
  const faqQuestions = document.querySelectorAll('.thrm-faq__q');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });

});