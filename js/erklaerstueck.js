/**
 * KRS Erklärstück: vier Szenen im Hero.
 * Spielt im sichtbaren Bereich automatisch ab. Pausiert außerhalb des
 * Viewports, in einem verborgenen Tab, bei Mauszeiger über dem Element und
 * bei Tastaturfokus darin. Bei reduzierter Bewegung: Szene 4, statisch.
 * Prüfparameter: ?szene=1..4 springt zur Szene, &pause=1 zeigt den Endzustand
 * ohne Abspielen.
 */
(function () {
  'use strict';

  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  function readParams() {
    var out = { scene: 0, pause: false };
    try {
      var p = new URLSearchParams(window.location.search);
      var s = parseInt(p.get('szene'), 10);
      if (s >= 1 && s <= 4) out.scene = s;
      out.pause = p.get('pause') === '1';
    } catch (e) { /* ohne URLSearchParams: Standardverhalten */ }
    return out;
  }

  function init(root) {
    var scenes = root.querySelectorAll('.explainer__scene');
    var layers = root.querySelectorAll('.explainer__scene, .explainer__kicker, .explainer__cap');
    var segs = root.querySelectorAll('.explainer__seg');
    var toggle = root.querySelector('.explainer__toggle');
    var captions = root.querySelector('.explainer__captions');
    var count = scenes.length;
    if (!count || segs.length !== count) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var params = readParams();
    var reasons = { user: false, hover: false, focus: false, offscreen: false, hidden: false };
    var current = 0;
    var still = false;
    var seen = false;

    function durationOf(i) {
      var ms = parseInt(scenes[i].getAttribute('data-duration'), 10);
      return ms > 0 ? ms : 6000;
    }

    function updatePause() {
      var paused = false;
      for (var k in reasons) { if (reasons[k]) paused = true; }
      root.classList.toggle('is-paused', paused);
      root.classList.toggle('is-user-paused', reasons.user);
      if (toggle) {
        toggle.setAttribute('aria-label', reasons.user ? 'Erklärstück abspielen' : 'Erklärstück anhalten');
      }
    }

    function show(i, mode) {
      current = i;
      still = mode === 'still';
      root.classList.toggle('explainer--still', still);
      root.classList.toggle('explainer--play', !still);

      each(layers, function (el) { el.classList.remove('is-active'); });
      each(segs, function (b) {
        b.classList.remove('is-current', 'is-done');
        b.removeAttribute('aria-current');
      });
      void root.offsetWidth; /* Animationen neu starten */

      var key = String(i + 1);
      each(layers, function (el) {
        if (el.getAttribute('data-scene') === key) el.classList.add('is-active');
      });
      each(segs, function (b, j) {
        if (j < i) b.classList.add('is-done');
      });
      segs[i].classList.add('is-current');
      segs[i].setAttribute('aria-current', 'step');
      segs[i].style.setProperty('--explainer-dur', durationOf(i) + 'ms');
    }

    /* Szenenwechsel, sobald der Fortschrittsbalken voll ist */
    root.addEventListener('animationend', function (e) {
      if (still || e.animationName !== 'explainer-fill') return;
      if (!segs[current].contains(e.target)) return;
      show((current + 1) % count, 'play');
    });

    each(segs, function (b, j) {
      b.addEventListener('click', function () {
        show(j, still ? 'still' : 'play');
      });
    });

    if (toggle) {
      toggle.addEventListener('click', function () {
        reasons.user = !reasons.user;
        if (!reasons.user && still) show(current, 'play');
        updatePause();
      });
    }

    root.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { reasons.hover = true; updatePause(); }
    });
    root.addEventListener('pointerleave', function () {
      if (reasons.hover) { reasons.hover = false; updatePause(); }
    });

    root.addEventListener('focusin', function (e) {
      var keyboard = true;
      try { keyboard = e.target.matches(':focus-visible'); } catch (err) { /* älterer Browser */ }
      reasons.focus = keyboard;
      if (captions) captions.setAttribute('aria-live', 'polite');
      updatePause();
    });
    root.addEventListener('focusout', function (e) {
      if (e.relatedTarget && root.contains(e.relatedTarget)) return;
      reasons.focus = false;
      if (captions) captions.setAttribute('aria-live', 'off');
      updatePause();
    });

    document.addEventListener('visibilitychange', function () {
      reasons.hidden = document.hidden;
      updatePause();
    });

    root.classList.add('explainer--js');
    if (captions) captions.setAttribute('aria-live', 'off');

    if (reduced) {
      root.classList.add('explainer--reduced');
      reasons.user = true;
      show((params.scene || 4) - 1, 'still');
      updatePause();
      return;
    }

    if (params.pause) {
      reasons.user = true;
      show((params.scene || 4) - 1, 'still');
      updatePause();
      return;
    }

    var start = (params.scene || 1) - 1;
    show(start, 'play');

    if ('IntersectionObserver' in window) {
      reasons.offscreen = true;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          reasons.offscreen = !visible;
          if (visible && !seen) {
            seen = true;
            if (!still) show(current, 'play'); /* frisch beginnen, sobald sichtbar */
          }
          updatePause();
        });
      }, { threshold: [0, 0.35, 0.7] });
      io.observe(root);
    }
    reasons.hidden = document.hidden;
    updatePause();
  }

  each(document.querySelectorAll('.explainer'), init);
})();
