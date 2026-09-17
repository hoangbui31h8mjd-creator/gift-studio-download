(function () {
  'use strict';
  const releases = window.GIFT_STUDIO_RELEASES || {};
  document.querySelectorAll('[data-platform]').forEach((card) => {
    const release = window.GiftDownloads.resolveDownload(releases[card.dataset.platform], document.baseURI);
    const button = card.querySelector('[data-download]');
    if (release.available) {
      button.href = release.href;
      button.setAttribute('download', '');
      button.removeAttribute('aria-disabled');
      button.removeAttribute('role');
    }
    button.addEventListener('click', (event) => {
      if (button.getAttribute('aria-disabled') === 'true') event.preventDefault();
    });
  });
})();
