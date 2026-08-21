/* Click-to-play video.
 *
 * Posters are static images until clicked, so a page carrying several spots
 * stays fast and nothing autoplays at a reader. Handles self-hosted MP4 and
 * third-party embeds.
 *
 * This lived inline in copywriting.html until 21 Aug, when case-m1-web.html
 * needed the same behaviour. Rather than keep two copies in sync by hand, it
 * moved here. Both pages load it. */

(function () {
  'use strict';

  var posters = document.querySelectorAll('.poster');
  if (!posters.length) return;

  posters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = document.createElement('div');

      /* Ratio is opt-in per poster. The default is 16:9; "Bull" is a 720x480
         broadcast master, so it declares 3x2 or the frame crops its line. */
      box.className = 'video-embed' +
        (btn.dataset.ratio === '3x2' ? ' video-embed--3x2' : '') +
        (btn.dataset.bg === 'light' ? ' video-embed--light' : '');

      if (btn.dataset.video) {
        var v = document.createElement('video');
        v.src = btn.dataset.video;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        v.preload = 'auto';
        /* Several of these have no audio track. Muting anyway keeps autoplay
           from being blocked by browsers that refuse unmuted programmatic
           playback, and a muted attribute on a silent file costs nothing. */
        v.muted = btn.dataset.silent === 'true';
        box.appendChild(v);
      } else if (btn.dataset.embed) {
        var f = document.createElement('iframe');
        f.src = btn.dataset.embed;
        f.allow = 'autoplay; fullscreen; picture-in-picture';
        f.allowFullscreen = true;
        box.appendChild(f);
      }

      btn.replaceWith(box);
    });
  });
})();
