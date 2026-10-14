/* Mobile menu. On narrow screens the five nav links collapse behind a Menu
   button; on desktop this file does nothing visible. The button is added here
   rather than in the HTML, and the collapsing CSS only applies once the
   `js-nav` class is set, so with JavaScript off the links simply stay visible. */
(function () {
  'use strict';

  var inner = document.querySelector('.site-head__inner');
  var nav = inner && inner.querySelector('nav');
  if (!nav) return;

  document.documentElement.classList.add('js-nav');

  var list = nav.querySelector('ul');
  if (!list.id) list.id = 'site-nav-list';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', list.id);
  btn.innerHTML = '<span class="nav-toggle__label">Menu</span><span class="nav-toggle__icon" aria-hidden="true"></span>';
  inner.insertBefore(btn, nav);

  function setOpen(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
    btn.querySelector('.nav-toggle__label').textContent = open ? 'Close' : 'Menu';
  }

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });

  // In-page links (such as Contact) should close the menu.
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
