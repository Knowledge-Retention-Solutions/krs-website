/**
 * KRS Redesign - Verhalten
 * Nav, Scroll-Reveal, Zähler-Animation, E-Mail-Schutz
 */
(function () {
  'use strict';

  /* ----- Nav: Hairline beim Scrollen ----- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Mobile-Menü ----- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----- Scroll-Reveal ----- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if ('IntersectionObserver' in window && !prefersReduced) {
    var ioFired = false;
    var io = new IntersectionObserver(function (entries) {
      ioFired = true;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Fallback: Falls der Observer nie feuert (z.B. eingebettete Previews),
       alles sichtbar machen statt leere Sektionen zu zeigen. */
    setTimeout(function () { if (!ioFired) revealAll(); }, 900);
  } else {
    revealAll();
  }

  /* ----- Zähler-Animation für Stats ----- */
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCount(el) {
    if (document.body.dataset.motion !== 'an' || prefersReduced) return;
    var original = el.getAttribute('data-count') || el.textContent;
    var match = original.match(/[\d,.]+/);
    if (!match) return;
    var numStr = match[0];
    var value = parseFloat(numStr.replace(',', '.'));
    var decimals = numStr.indexOf(',') !== -1 ? 1 : 0;
    var prefix = original.slice(0, original.indexOf(numStr));
    var suffix = original.slice(original.indexOf(numStr) + numStr.length);
    var duration = 1600;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var current = value * easeOutQuart(p);
      el.textContent = prefix + current.toLocaleString('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = original;
    }
    requestAnimationFrame(frame);
  }

  var statEls = document.querySelectorAll('.stat__number');
  if ('IntersectionObserver' in window) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statIo.observe(el); });
  }

  /* ----- E-Mail-Links zusammensetzen (Spam-Schutz) ----- */
  document.querySelectorAll('a[data-user][data-domain]').forEach(function (link) {
    var addr = link.getAttribute('data-user') + '@' + link.getAttribute('data-domain');
    link.setAttribute('href', 'mailto:' + addr);
  });

  /* ----- Stimmen-Carousel (statisch, manueller Wechsel ueber Punkte) ----- */
  var carousel = document.querySelector('[data-quote-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-quote-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-quote-dot]'));

    function go(i) {
      var current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === current); });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === current);
        d.setAttribute('aria-selected', n === current ? 'true' : 'false');
      });
    }

    /* Keine Auto-Rotation: die erste Stimme (Driescher) bleibt sichtbar,
       bis der Nutzer ueber die Punkte aktiv auf eine andere wechselt. */
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { go(n); });
    });

    go(0);
  }
})();
