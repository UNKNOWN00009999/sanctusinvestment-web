/* Sanctus Investment - concept E, third edition. Draws the strategy pictograms once, when their tile comes into view.
   Hand-written, no libraries. Without the script, or with reduced motion, the pictograms are simply there. */
(function () {
  'use strict';
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-draw]'));
  if (!els.length) return;
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function on(el) { el.classList.add('in'); }
  if (RM || !('IntersectionObserver' in window)) { els.forEach(on); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); on(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.3 });
  els.forEach(function (el) { io.observe(el); });
})();
