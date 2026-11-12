/**
 * Angebote: Stufenauswahl über Ringe und Reiter (?stufe=1..4).
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);

  var kr = document.querySelector('[data-kr]');
  if (kr) {
    var tabs = Array.prototype.slice.call(kr.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(kr.querySelectorAll('.kr__panel'));
    var rings = Array.prototype.slice.call(kr.querySelectorAll('.kr__ring'));
    var share = kr.querySelector('.kr-share');
    var shareBar = share ? share.querySelector('.kr-share__bar') : null;
    var shareText = {
      1: 'Schematisch: Bei Stufe 1 erfasst KRS das Wissen.',
      2: 'Schematisch: Bei Stufe 2 erfassen KRS und Ihr Team das Wissen, KRS den größeren Teil.',
      3: 'Schematisch: Bei Stufe 3 erfassen Ihre Teams den größeren Teil des Wissens.',
      4: 'Schematisch: Bei Stufe 4 erfasst vor allem Ihr Unternehmen das Wissen selbst.'
    };

    panels.forEach(function (p) {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('tabindex', '0');
    });

    var select = function (n, focusTab) {
      tabs.forEach(function (t) {
        var on = Number(t.dataset.stufe) === n;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focusTab) t.focus();
      });
      panels.forEach(function (p) { p.hidden = Number(p.dataset.stufe) !== n; });
      rings.forEach(function (r) {
        var s = Number(r.dataset.stufe);
        r.classList.toggle('is-selected', s === n);
        r.classList.toggle('is-inside', s < n);
        r.setAttribute('aria-pressed', s === n ? 'true' : 'false');
      });
      if (share) {
        share.dataset.stufe = String(n);
        if (shareBar) shareBar.setAttribute('aria-label', shareText[n]);
      }
    };

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(Number(t.dataset.stufe), false); });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          select(Number(tabs[next].dataset.stufe), true);
        }
      });
    });
    rings.forEach(function (r) {
      r.addEventListener('click', function () { select(Number(r.dataset.stufe), false); });
      r.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(Number(r.dataset.stufe), false);
        }
      });
    });

    var stufe = parseInt(params.get('stufe'), 10);
    if (!(stufe >= 1 && stufe <= 4)) stufe = 1;
    kr.classList.add('is-enhanced');
    select(stufe, false);
  }
})();
