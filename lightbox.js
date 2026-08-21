/* ==========================================================================
   Lightbox
   Makes work images clickable and openable full-screen, with actual-size zoom
   for print and direct mail pieces whose fine print is unreadable at grid size.

   How it picks up images: any <img> inside .workitem__media, or any <img> with
   a data-lb attribute. Images already wrapped in a link are skipped, so the
   card grids on the homepage keep behaving like links.

   Higher-resolution source: set data-full="path/to/big.jpg" on the <img> and
   the lightbox loads that instead. If data-full fails to load, it silently
   falls back to the version shown on the page, so a wrong guess degrades
   rather than breaking.

   No dependencies. Include once per page, before </body>.
   ========================================================================== */

(function () {
  'use strict';

  var items = [];
  var index = 0;
  var lastFocus = null;

  /* ------------------------------------------------------------- collect --- */

  function collect() {
    var imgs = document.querySelectorAll('.workitem__media img, img[data-lb]');

    Array.prototype.forEach.call(imgs, function (img) {
      if (img.closest('a')) return;            // leave real links alone
      if (img.closest('.zoom-btn')) return;    // already wired

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zoom-btn';
      btn.setAttribute('aria-label', 'Enlarge: ' + (img.alt || 'image'));

      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);

      // Caption: prefer an explicit data-caption, else the nearest heading in
      // the same work item, else the alt text.
      var caption = img.dataset.caption;
      if (!caption) {
        var block = btn.closest('.workitem, figure');
        var h = block && block.querySelector('h3, figcaption');
        caption = h ? h.textContent.trim() : (img.alt || '');
      }

      var i = items.length;
      items.push({
        src: img.dataset.full || img.currentSrc || img.src,
        fallback: img.currentSrc || img.src,
        caption: caption,
        alt: img.alt || ''
      });

      btn.addEventListener('click', function () { open(i); });
    });
  }

  /* -------------------------------------------------------------- build --- */

  var lb, stage, img, cap, count, prev, next;

  function build() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Enlarged image');

    lb.innerHTML =
      '<div class="lb__bar">' +
        '<span class="lb__count"></span>' +
        '<div class="lb__nav">' +
          '<button type="button" data-act="prev">Previous</button>' +
          '<button type="button" data-act="next">Next</button>' +
          '<button type="button" data-act="zoom">Actual size</button>' +
          '<button type="button" data-act="close">Close</button>' +
        '</div>' +
      '</div>' +
      '<div class="lb__stage"><img alt=""></div>' +
      '<p class="lb__cap"><strong></strong></p>';

    document.body.appendChild(lb);

    stage = lb.querySelector('.lb__stage');
    img   = lb.querySelector('.lb__stage img');
    cap   = lb.querySelector('.lb__cap strong');
    count = lb.querySelector('.lb__count');
    prev  = lb.querySelector('[data-act="prev"]');
    next  = lb.querySelector('[data-act="next"]');

    lb.addEventListener('click', function (e) {
      var act = e.target.dataset && e.target.dataset.act;
      if (act === 'close') return close();
      if (act === 'prev')  return show(index - 1);
      if (act === 'next')  return show(index + 1);
      if (act === 'zoom')  return toggleZoom();
      if (e.target === lb || e.target === stage) close();   // backdrop
    });

    img.addEventListener('click', toggleZoom);

    // If the high-resolution guess 404s, quietly use what the page shows.
    img.addEventListener('error', function () {
      var it = items[index];
      if (it && img.src !== it.fallback) img.src = it.fallback;
    });
  }

  /* ------------------------------------------------------------ controls --- */

  function toggleZoom() {
    lb.classList.toggle('is-zoomed');
    var z = lb.classList.contains('is-zoomed');
    lb.querySelector('[data-act="zoom"]').textContent = z ? 'Fit to screen' : 'Actual size';
    if (!z) stage.scrollTo(0, 0);
  }

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;      // wrap both directions
    var it = items[index];

    lb.classList.remove('is-zoomed');
    lb.querySelector('[data-act="zoom"]').textContent = 'Actual size';

    img.src = it.src;
    img.alt = it.alt;
    cap.textContent = it.caption || '';
    count.textContent = (index + 1) + ' of ' + items.length;

    var solo = items.length < 2;
    prev.hidden = solo;
    next.hidden = solo;
    stage.scrollTo(0, 0);
  }

  function open(i) {
    lastFocus = document.activeElement;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    show(i);
    lb.querySelector('[data-act="close"]').focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    lb.classList.remove('is-open', 'is-zoomed');
    document.body.style.overflow = '';
    img.src = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape')     return close();
    if (e.key === 'ArrowLeft')  return show(index - 1);
    if (e.key === 'ArrowRight') return show(index + 1);
    if (e.key === 'Tab') {
      // Keep focus inside the dialog while it's open.
      var f = lb.querySelectorAll('button:not([hidden])');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* --------------------------------------------------------------- init --- */

  function init() {
    collect();
    if (!items.length) return;
    build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
