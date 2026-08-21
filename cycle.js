/* ==========================================================================
   Rotating setup line above the contact CTA.

   The first phrase is written into the HTML, so with JavaScript off, or before
   this file loads, the line still reads correctly. Screen readers get that one
   sentence and are not told about the swaps, since the element has no aria-live
   and announcing a decorative rotation would be noise.

   Anyone who has asked their system to reduce motion gets the static line.
   ========================================================================== */

(function () {
  'use strict';

  var el = document.querySelector('[data-cycle]');
  if (!el) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var lines;
  try {
    lines = JSON.parse(el.getAttribute('data-cycle'));
  } catch (e) {
    return;
  }
  if (!Array.isArray(lines) || lines.length < 2) return;

  /* The line is centred in the footer block, so a width that changes on every
     swap would make the big CTA below it appear to twitch. Measuring the widest
     phrase once and reserving that space keeps everything still. */
  var probe = document.createElement('span');
  var cs = window.getComputedStyle(el);
  probe.style.cssText =
    'position:absolute;visibility:hidden;white-space:nowrap;' +
    'font:' + cs.font + ';letter-spacing:' + cs.letterSpacing;
  document.body.appendChild(probe);

  var widest = 0;
  lines.forEach(function (t) {
    probe.textContent = t;
    widest = Math.max(widest, probe.offsetWidth);
  });
  document.body.removeChild(probe);

  /* Only reserve the space if it fits the container, otherwise let it wrap
     naturally on narrow screens. */
  if (widest && widest < el.parentNode.offsetWidth) {
    el.style.display = 'inline-block';
    el.style.minWidth = Math.ceil(widest) + 'px';
  }

  var i = 0;
  var HOLD = 3600;
  var FADE = 420;

  el.style.transition = 'opacity ' + FADE + 'ms ease';

  setInterval(function () {
    el.style.opacity = '0';
    setTimeout(function () {
      i = (i + 1) % lines.length;
      el.textContent = lines[i];
      el.style.opacity = '1';
    }, FADE);
  }, HOLD + FADE);
})();
