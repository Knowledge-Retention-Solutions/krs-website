/**
 * KRS Website - Main JavaScript
 * Mobile menu, scroll animations, and counter functionality
 */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  var CONFIG = {
    observer: {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    },
    counter: {
      duration: 2000
    },
    stagger: {
      delay: 100
    }
  };

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Easing function for smooth animations (easeOutQuart)
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * Parse numeric value from stat text (handles "12,9 Mio.", "57%", etc.)
   */
  function parseStatValue(text) {
    var match = text.match(/[\d,\.]+/);
    if (!match) return null;

    var numStr = match[0].replace(',', '.');
    var value = parseFloat(numStr);
    var suffix = text.replace(match[0], '').trim();
    var hasDecimal = match[0].includes(',');

    return {
      value: value,
      suffix: suffix,
      decimals: hasDecimal ? 1 : 0,
      original: text
    };
  }

  /**
   * Format number back to German locale
   */
  function formatNumber(value, decimals) {
    return value.toLocaleString('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // ==========================================================================
  // Mobile Menu
  // ==========================================================================

  function initMobileMenu() {
    var menuToggle = document.querySelector('.nav__toggle');
    var mobileMenu = document.querySelector('.nav__mobile');
    var mobileLinks = document.querySelectorAll('.nav__mobile-link, .nav__mobile-cta');

    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', function() {
      var isOpen = mobileMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);

      var icon = menuToggle.querySelector('svg');
      if (isOpen) {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />';
        menuToggle.setAttribute('aria-label', 'Menu schliessen');
      } else {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />';
        menuToggle.setAttribute('aria-label', 'Menu oeffnen');
      }
    });

    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');

        var icon = menuToggle.querySelector('svg');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />';
        menuToggle.setAttribute('aria-label', 'Menu oeffnen');
      });
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ==========================================================================
  // Scroll Reveal Animation
  // ==========================================================================

  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(function(el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          if (entry.target.hasAttribute('data-counter')) {
            animateCounter(entry.target);
          }

          if (entry.target.classList.contains('timeline-weeks')) {
            animateTimeline(entry.target);
          }

          observer.unobserve(entry.target);
        }
      });
    }, CONFIG.observer);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, [data-counter], .timeline-weeks').forEach(function(el) {
      observer.observe(el);
    });
  }

  // ==========================================================================
  // Counter Animation
  // ==========================================================================

  function animateCounter(element) {
    var parsed = parseStatValue(element.textContent);
    if (!parsed) return;

    var startTime = performance.now();
    var duration = CONFIG.counter.duration;

    element.classList.add('is-counting');

    function update(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var currentValue = easedProgress * parsed.value;

      element.textContent = formatNumber(currentValue, parsed.decimals) + ' ' + parsed.suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = parsed.original;
        element.classList.remove('is-counting');
        element.classList.add('is-counted');
      }
    }

    requestAnimationFrame(update);
  }

  // ==========================================================================
  // Timeline Animation
  // ==========================================================================

  function animateTimeline(container) {
    var weeks = container.querySelectorAll('.timeline-week');
    weeks.forEach(function(week, index) {
      setTimeout(function() {
        week.classList.add('is-filled');
      }, index * CONFIG.stagger.delay);
    });
  }

  // ==========================================================================
  // Hero Animations
  // ==========================================================================

  function initHeroAnimations() {
    var highlight = document.querySelector('.hero__title-highlight');
    if (highlight) {
      setTimeout(function() {
        highlight.classList.add('is-visible');
      }, 500);
    }

    var scrollIndicator = document.querySelector('.hero__scroll-indicator');
    if (scrollIndicator) {
      setTimeout(function() {
        scrollIndicator.classList.add('is-visible');
      }, 1500);

      scrollIndicator.addEventListener('click', function() {
        var nextSection = document.querySelector('#problem');
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    var scrollIndicatorHidden = false;
    window.addEventListener('scroll', function() {
      if (!scrollIndicatorHidden && window.scrollY > 100 && scrollIndicator) {
        scrollIndicator.style.opacity = '0';
        scrollIndicatorHidden = true;
      }
    }, { passive: true });
  }

  // ==========================================================================
  // Process Steps Pulse Animation
  // ==========================================================================

  function initProcessSteps() {
    var steps = document.querySelectorAll('.process-step');

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var index = Array.prototype.indexOf.call(steps, entry.target);
          setTimeout(function() {
            entry.target.classList.add('is-visible');
          }, index * CONFIG.stagger.delay);
          observer.unobserve(entry.target);
        }
      });
    }, CONFIG.observer);

    steps.forEach(function(step) {
      observer.observe(step);
    });
  }

  // ==========================================================================
  // Scroll-Based Navigation Toggle
  // ==========================================================================

  function initScrollNav() {
    var topbar = document.getElementById('topbar');
    var nav = document.querySelector('.nav');
    var scrollThreshold = 100; // Pixel nach denen die Nav erscheint

    if (!topbar || !nav) return;

    var lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
      var currentScrollY = window.scrollY;

      if (currentScrollY > scrollThreshold) {
        // Nach unten gescrollt - Nav zeigen, Topbar verstecken
        topbar.classList.add('topbar--hidden');
        nav.classList.add('nav--visible');
      } else {
        // Ganz oben - Topbar zeigen, Nav verstecken
        topbar.classList.remove('topbar--hidden');
        nav.classList.remove('nav--visible');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // ==========================================================================
  // Card Modals
  // ==========================================================================

  function initCardModals() {
    var modalOverlay = document.getElementById('cardModal');
    if (!modalOverlay) return;

    var modal = modalOverlay.querySelector('.modal');
    var modalTitle = modalOverlay.querySelector('.modal__title');
    var modalContent = modalOverlay.querySelector('.modal__content');
    var closeBtn = modalOverlay.querySelector('.modal__close');

    // Open modal on card toggle click
    document.querySelectorAll('.card--has-modal .card__toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = btn.closest('.card--has-modal');
        modalTitle.textContent = card.dataset.modalTitle;
        modalContent.innerHTML = card.dataset.modalContent;
        openModal();
      });
    });

    // Close on X button
    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
        closeModal();
      }
    });

    function openModal() {
      modalOverlay.classList.add('is-open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      // Focus the close button for accessibility
      closeBtn.focus();
    }

    function closeModal() {
      modalOverlay.classList.remove('is-open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
  }

  // ==========================================================================
  // ==========================================================================
  // Contact Modal
  // ==========================================================================

  function initContactModal() {
    const openBtnPhone = document.getElementById('openContactModal');
    const openBtnEmail = document.getElementById('openContactModalEmail');
    const modal = document.getElementById('contactModal');

    if (!modal) return;

    const closeBtn = modal.querySelector('.contact-modal__close');
    const backdrop = modal.querySelector('.contact-modal__backdrop');

    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    // Both buttons open the same modal
    if (openBtnPhone) openBtnPhone.addEventListener('click', openModal);
    if (openBtnEmail) openBtnEmail.addEventListener('click', openModal);

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  // Initialize
  // ==========================================================================

  function init() {
    initMobileMenu();
    initScrollReveal();
    initHeroAnimations();
    initProcessSteps();
    initScrollNav();
    initCardModals();
    initContactModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
