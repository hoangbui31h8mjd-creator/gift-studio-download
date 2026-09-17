(function (root) {
  'use strict';
  function resolveDownload(release, baseURL) {
    const text = (value) => typeof value === 'string' ? value.trim() : '';
    const result = { available: false, href: '', version: '', system: '', architecture: '' };
    if (!release || release.available !== true) return result;
    const raw = text(release.url);
    if (!raw || /^[#?]/.test(raw)) return result;
    try {
      const url = new URL(raw, baseURL);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return result;
      return { available: true, href: url.href, version: text(release.version), system: text(release.system), architecture: text(release.architecture) };
    } catch (_) {
      return result;
    }
  }
  root.GiftDownloads = { resolveDownload };
})(globalThis);
