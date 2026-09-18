/* One automatic entrance, driven by asset readiness and time — never scroll. */
(function (root) {
  'use strict';

  function createSequence({ onPhase, onSlow = () => {}, onError = () => {}, schedule = setTimeout, cancel = clearTimeout, reducedMotion = false }) {
    let phase = reducedMotion ? 'ready' : 'loading';
    let timer = null;
    let failed = false;
    const ready = new Set();
    // Keep each layer readable before introducing the next one. CSS finishes
    // the last character at 1900ms, the background fade at 1200ms, and the
    // lower content at 2000ms; these phases include short holds/blur removal.
    const durations = { headline: 2300, background: 1500, content: 2200 };
    function enter(next) {
      if (timer !== null) cancel(timer);
      timer = null;
      phase = next;
      onPhase(next);
      if (durations[next]) {
        timer = schedule(() => enter({ headline: 'background', background: 'content', content: 'ready' }[next]), durations[next]);
      }
    }
    onPhase(phase);
    // A slow first download is still a valid load. Warn, but keep accepting
    // readiness signals. A confirmed failure stays on this surface for retry.
    if (phase === 'loading') timer = schedule(() => { timer = null; onSlow(); }, 8000);
    return {
      get phase() { return phase; },
      signal(asset) {
        if (failed || phase !== 'loading' || !['fonts', 'background'].includes(asset)) return;
        ready.add(asset);
        if (ready.size === 2) enter('headline');
      },
      fail() {
        if (failed || phase !== 'loading') return;
        failed = true;
        if (timer !== null) cancel(timer);
        timer = null;
        onError();
      },
      skip() { if (phase !== 'ready') enter('ready'); },
    };
  }

  function centerHero(rect, width, height) {
    return {
      x: width / 2 - (rect.x + rect.width / 2),
      y: height / 2 - (rect.y + rect.height / 2),
      scale: Math.min(1.18, Math.max(1, width - 40) / Math.max(1, rect.width), Math.max(1, height - 64) / Math.max(1, rect.height)),
    };
  }

  function contentRiseDistance(top, height) {
    return Math.max(0, height - top);
  }

  function pushPose(progress, { heroRect, heroPose, platformTop, viewportHeight }) {
    const p = Math.min(1, Math.max(0, progress));
    const distance = contentRiseDistance(platformTop, viewportHeight);
    const lowerY = distance * (1 - p);
    const cardTop = platformTop + lowerY;
    const travel = heroPose.y + heroRect.height * (heroPose.scale - 1) / 2;
    const initialBottom = heroRect.bottom + travel;
    const gap = platformTop - heroRect.bottom;
    let pushed = p;
    if (travel > 0 && distance > 0) {
      // C1 soft contact: begin just before reaching the final gap, then push
      // at the cards' speed. The resulting gap can never be less than `gap`.
      const softness = Math.min(32, travel * 2);
      const pressure = initialBottom + gap + softness / 2 - cardTop;
      const displacement = pressure <= 0 ? 0 : pressure < softness ?
        pressure * pressure / (2 * softness) : pressure - softness / 2;
      pushed = Math.min(1, Math.max(0, displacement / travel));
    }
    if (p === 1) pushed = 1;
    const remaining = 1 - pushed;
    const heroY = remaining === 0 ? 0 : heroPose.y * remaining;
    const heroScale = 1 + (heroPose.scale - 1) * remaining;
    return { lowerY, cardTop, heroX: remaining === 0 ? 0 : heroPose.x * remaining, heroY, heroScale,
      heroBottom: heroRect.bottom + heroY + heroRect.height * (heroScale - 1) / 2 };
  }

  function riseProgress(time) {
    if (time <= 0 || time >= 1) return Math.min(1, Math.max(0, time));
    // Invert the x coordinate of the existing cubic-bezier(.36, 0, .5, 1).
    let low = 0, high = 1;
    for (let i = 0; i < 22; i++) {
      const u = (low + high) / 2, v = 1 - u;
      const x = 3 * v * v * u * .36 + 3 * v * u * u * .5 + u * u * u;
      if (x < time) low = u; else high = u;
    }
    const u = (low + high) / 2;
    return 3 * (1 - u) * u * u + u * u * u;
  }

  function animatePush(view, hero, groups, geometry) {
    if (!hero.animate || groups.some(element => !element.animate)) return [];
    const heroFrames = [], lowerFrames = [];
    // Finite sampled frames share one timeline: no per-frame layout reads or
    // follower RAF, and no independent delayed title easing to drift apart.
    for (let i = 0; i <= 120; i++) {
      const offset = i / 120;
      const pose = pushPose(riseProgress(offset), geometry);
      heroFrames.push({ offset, transform: `translate3d(${pose.heroX}px, ${pose.heroY}px, 0) scale(${pose.heroScale})` });
      lowerFrames.push({ offset, translate: `0 ${pose.lowerY}px` });
    }
    const startTime = view.document.timeline.currentTime;
    return [[hero, heroFrames], ...groups.map(element => [element, lowerFrames])].map(([element, frames]) => {
      const animation = element.animate(frames, { duration: 2000, fill: 'both', easing: 'linear' });
      animation.startTime = startTime;
      return animation;
    });
  }

  function mount(view) {
    const doc = view.document;
    const html = doc.documentElement;
    const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
    const contrast = view.matchMedia('(forced-colors: active)');
    const deepLink = view.location.hash && view.location.hash !== '#top';
    let cleanup = () => {};
    let heroRect, heroPose;
    let motion = [];
    const owned = [];

    function display(phase) {
      const hero = doc.querySelector('.hero');
      if (phase === 'headline' && hero) {
        heroRect = hero.getBoundingClientRect();
        const pose = heroPose = centerHero(heroRect, view.innerWidth, view.innerHeight);
        hero.style.setProperty('--intro-x', `${pose.x}px`);
        hero.style.setProperty('--intro-y', `${pose.y}px`);
        hero.style.setProperty('--intro-scale', pose.scale);
      }
      if (phase === 'content') {
        // Measure BEFORE the content selector starts its animation. All lower
        // sections share this distance, so their spacing stays intact and the
        // first card starts at the viewport edge behind the fixed blur band.
        const platforms = doc.querySelector('.platforms');
        const distance = platforms ? contentRiseDistance(platforms.getBoundingClientRect().top, view.innerHeight) : 0;
        html.style.setProperty('--intro-rise-distance', `${distance}px`);
        if (platforms && hero && heroRect && heroPose) {
          motion = animatePush(view, hero, [...doc.querySelectorAll('.platforms, .start-section, .site-footer')], {
            heroRect, heroPose, platformTop: platforms.getBoundingClientRect().top, viewportHeight: view.innerHeight,
          });
        }
      }
      html.dataset.intro = phase;
      if (phase !== 'loading') delete html.dataset.introWait;
      const loader = doc.querySelector('.intro-loader');
      if (loader) loader.hidden = phase !== 'loading';
      if (phase === 'ready') {
        for (const { element, inert, busy } of owned) {
          element.inert = inert;
          if (busy === null) element.removeAttribute('aria-busy');
          else element.setAttribute('aria-busy', busy);
        }
        owned.length = 0;
        if (hero) for (const name of ['--intro-x', '--intro-y', '--intro-scale']) hero.style.removeProperty(name);
        html.style.removeProperty('--intro-rise-distance');
        motion.forEach(animation => animation.cancel());
        motion = [];
        cleanup();
      }
    }

    // Installed before the stylesheet: no flash of the completed layout. If
    // this small script fails to load, there is no data-intro and the page is usable.
    const sequence = createSequence({
      onPhase: display,
      onSlow: () => { html.dataset.introWait = 'slow'; },
      onError: () => { html.dataset.introWait = 'failed'; },
      reducedMotion: reduced.matches || contrast.matches || Boolean(deepLink),
      schedule: (fn, ms) => view.setTimeout(fn, ms),
      cancel: (token) => view.clearTimeout(token),
    });
    const skip = () => sequence.skip();
    const settleActive = () => { if (sequence.phase !== 'loading') skip(); };
    // Bind at script execution, not DOMContentLoaded: the deferred background
    // bundle can fail before DOMContentLoaded; retry must already be usable.
    const click = (event) => { if (event.target.closest?.('[data-intro-retry]')) view.location.reload(); };
    const fail = () => sequence.fail();
    const resourceError = (event) => {
      if (event.target?.matches?.('script[data-intro-critical], link[rel="stylesheet"][data-intro-critical]')) {
        fail();
      } else if (event.filename) {
        // A downloaded background bundle can fail at execution, too. Ignore
        // unrelated errors and speculative preload failures.
        const bundle = doc.querySelector('script[data-intro-critical]');
        if (!bundle) return;
        try {
          const failed = new URL(event.filename, doc.baseURI);
          const expected = new URL(bundle.src, doc.baseURI);
          if (failed.origin === expected.origin && failed.pathname === expected.pathname) fail();
        } catch (_) { /* not a URL belonging to the background bundle */ }
      }
    };
    const key = (event) => { if (event.key === 'Tab' || event.key === 'Escape') settleActive(); };
    const pageShow = (event) => { if (event.persisted) settleActive(); };
    const media = () => { if (reduced.matches || contrast.matches) skip(); };
    let observer;
    cleanup = () => {
      observer?.disconnect();
      view.removeEventListener('resize', settleActive);
      doc.removeEventListener('click', click);
      view.removeEventListener('error', resourceError, true);
      view.removeEventListener('pagehide', settleActive);
      view.removeEventListener('pageshow', pageShow);
      view.removeEventListener('keydown', key);
      reduced.removeEventListener('change', media);
      contrast.removeEventListener('change', media);
      view.visualViewport?.removeEventListener('resize', settleActive);
      doc.removeEventListener('DOMContentLoaded', bind);
    };

    function bind() {
      if (sequence.phase === 'ready' || html.dataset.introWait === 'failed') return;
      try {
        const host = doc.querySelector('.shader-background');
        if (!host || !doc.fonts?.load) { fail(); return; }
        for (const element of doc.querySelectorAll('.site-header, main, .site-footer')) {
          owned.push({ element, inert: element.inert, busy: element.getAttribute('aria-busy') });
          element.inert = true;
          element.setAttribute('aria-busy', 'true');
        }
        // Observe first, then read: both cached-first-frame and delayed-frame
        // paths work. Rejected/late assets cannot replay the opening sequence.
        const background = () => {
          if (host.dataset.renderMode === 'fallback') fail();
          else if (host.dataset.ready === 'true') sequence.signal('background');
        };
        observer = new view.MutationObserver(background);
        observer.observe(host, { attributes: true, attributeFilter: ['data-ready', 'data-render-mode'] });
        background();
        doc.fonts.load('400 1em "Gift Studio Headline"', '让灵感，闪耀全场。')
          .then(() => sequence.signal('fonts'), fail);
      } catch (_) { fail(); }
    }

    if (sequence.phase !== 'ready') {
      view.addEventListener('resize', settleActive, { passive: true });
      doc.addEventListener('click', click);
      view.addEventListener('error', resourceError, true);
      view.addEventListener('pagehide', settleActive);
      view.addEventListener('pageshow', pageShow);
      view.addEventListener('keydown', key);
      reduced.addEventListener('change', media);
      contrast.addEventListener('change', media);
      view.visualViewport?.addEventListener('resize', settleActive, { passive: true });
      if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', bind, { once: true });
      else bind();
    }
    return sequence;
  }

  if (typeof module === 'object' && module.exports) module.exports = { createSequence, centerHero, contentRiseDistance, pushPose, mount };
  if (root.document) mount(root);
})(globalThis);
