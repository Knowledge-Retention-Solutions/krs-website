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

  /* ----- Stimmen-Carousel (statisch; Wechsel ueber Punkte, Wischgeste, Pfeiltasten) ----- */
  var carousel = document.querySelector('[data-quote-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-quote-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-quote-dot]'));
    var active = 0;

    function go(i) {
      active = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === active); });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === active);
        d.setAttribute('aria-selected', n === active ? 'true' : 'false');
      });
    }

    /* Keine Auto-Rotation: die erste Stimme (Driescher) bleibt sichtbar,
       bis der Nutzer ueber Punkte, Wischgeste oder Pfeiltasten wechselt. */
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { go(n); });
    });

    /* Touch-Swipe (Mobile): horizontale Wischgeste blaettert eine Stimme weiter. */
    var touchX = null;
    carousel.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });

    /* Tastatur (a11y): Pfeil links/rechts blaettert, wenn das Carousel fokussiert ist. */
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(active - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(active + 1); e.preventDefault(); }
    });

    go(0);
  }

  /* ----- Abbildungen in Fachartikeln groß anzeigen ----- */
  /* Ein Link mit class="figure-zoom" zeigt auf die Bilddatei; ohne JS oder <dialog> öffnet er sie direkt.
     Die Bilder sind in doppelter Auflösung gerendert und erscheinen hier in halber Pixelbreite,
     also in der Größe, für die ihre Beschriftungen gesetzt sind. Breitere Bilder lassen sich verschieben. */
  var zoomLinks = document.querySelectorAll('a.figure-zoom');
  if (zoomLinks.length && typeof HTMLDialogElement === 'function') {
    var isDe = document.documentElement.lang === 'de';
    var zoom = document.createElement('dialog');
    zoom.className = 'zoom';
    zoom.setAttribute('aria-label', isDe ? 'Vergrößerte Abbildung' : 'Enlarged figure');
    zoom.innerHTML = '<button type="button" class="zoom__close" aria-label="' + (isDe ? 'Schließen' : 'Close') + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="zoom__stage"><img class="zoom__img" alt=""></div>';
    document.body.appendChild(zoom);
    var zoomImg = zoom.querySelector('.zoom__img');
    var fit = function () {
      if (zoomImg.naturalWidth) zoomImg.style.width = Math.round(zoomImg.naturalWidth / 2) + 'px';
    };
    zoomImg.addEventListener('load', fit);
    zoomLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        zoomImg.alt = link.querySelector('img').alt;
        zoomImg.src = link.href;
        if (zoomImg.complete) fit();
        document.documentElement.classList.add('zoom-open');
        zoom.showModal();
        zoom.querySelector('.zoom__stage').scrollTo(0, 0);
      });
    });
    zoom.addEventListener('click', function (e) {
      if (e.target === zoom || e.target.classList.contains('zoom__stage') || e.target.closest('.zoom__close')) zoom.close();
    });
    zoom.addEventListener('close', function () {
      document.documentElement.classList.remove('zoom-open');
    });
  }
})();
