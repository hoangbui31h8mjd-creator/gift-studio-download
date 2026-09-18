/* Independent glow ribbon using the supplied appearance parameters.
   No GlowCursor/React Bits Pro source or extra runtime is included. */
(function (root) {
  'use strict';

  const SETTINGS = Object.freeze({ color: '#3000ff', secondaryColor: '#0f0330',
    trailLength: 19, trailWidth: 9, trailTaper: .07, followSpeed: .26,
    glowIntensity: 1.65, glowSpread: 3, hotspot: .32, brightness: .7,
    opacity: .56, pulseSpeed: 1.1, noiseStrength: .215,
    idleTimeout: 450, fadeDuration: 1300, blendMode: 'screen' });
  const MAX_LENGTH = 240;
  const PIXEL_BUDGET = 4000000;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const validPoint = (point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) &&
    Math.abs(point.x) <= 10000000 && Math.abs(point.y) <= 10000000;

  function createTrail() {
    let anchor = null, points = [], idle = 0, elapsed = 0, strength = .2;

    function reset() {
      anchor = null;
      points = [];
      idle = 0;
      elapsed = 0;
    }

    function trim() {
      let length = 0;
      for (let i = 1; i < points.length; i++) length += distance(points[i], points[i - 1]);
      if (length > MAX_LENGTH) {
        const head = points.at(-1);
        const scale = MAX_LENGTH / length;
        points = points.map(p => ({ x: head.x + (p.x - head.x) * scale,
          y: head.y + (p.y - head.y) * scale }));
      }
    }

    function snapshot() {
      const progress = clamp((idle - SETTINGS.idleTimeout) / SETTINGS.fadeDuration, 0, 1);
      const alpha = 1 - progress * progress * (3 - 2 * progress);
      if (!points.length || alpha <= 0) {
        points = [];
        return { active: false, points: [], elapsed };
      }
      return {
        active: true, elapsed,
        points: points.map(p => ({ ...p, strength, alpha })),
      };
    }

    function frame(position, deltaMs = 16, sample = true) {
      if (!validPoint(position)) {
        reset();
        return snapshot();
      }
      const delta = Number.isFinite(deltaMs) && deltaMs >= 0 ? deltaMs : 16;
      // A suspended tab must not draw a bridge from its old page position.
      if (delta >= SETTINGS.idleTimeout + SETTINGS.fadeDuration) reset();
      elapsed += delta;
      idle += delta;
      const current = { x: position.x, y: position.y };
      if (!anchor) {
        anchor = current;
        return snapshot();
      }
      const moved = distance(current, anchor);
      // Input resets idle; the rendered tail updates geometry EVERY frame.
      if (sample) {
        idle = 0;
        strength = clamp(.2 + moved / Math.max(delta, 1) * .28, .2, 1);
      }
      if (!points.length && moved > .000001 && idle < SETTINGS.idleTimeout) {
        points = Array.from({ length: SETTINGS.trailLength }, (_, i) => {
          const t = i / (SETTINGS.trailLength - 1);
          return { x: anchor.x + (current.x - anchor.x) * t,
            y: anchor.y + (current.y - anchor.y) * t };
        });
      }
      if (points.length) {
        points[points.length - 1] = current; // never smooth the attachment
        if (moved > .001) {
          const follow = 1 - Math.pow(1 - SETTINGS.followSpeed, Math.min(delta, 64) / (1000 / 60));
          for (let i = points.length - 2; i >= 0; i--) {
            points[i].x += (points[i + 1].x - points[i].x) * follow;
            points[i].y += (points[i + 1].y - points[i].y) * follow;
          }
        }
        trim();
      }
      anchor = current;
      return snapshot();
    }

    return { frame, reset };
  }

  function mount({ layer } = {}) {
    const doc = layer && (layer.ownerDocument || root.document);
    const inactive = { frame: () => false, reset() {}, resize() {} };
    if (!doc || !layer || typeof layer.prepend !== 'function') return inactive;
    const view = doc.defaultView || root;
    const canvas = doc.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return inactive;
    canvas.className = 'gift-light-trail';
    canvas.setAttribute('aria-hidden', 'true');
    layer.prepend(canvas);
    const trail = createTrail();
    let width = 1;
    let height = 1;
    let ratio = 1;

    function clear() {
      ctx.clearRect(0, 0, width, height);
    }

    function reset() {
      trail.reset();
      clear();
    }

    function resize() {
      const dimension = (value) => Number.isFinite(value) && value > 0 ? clamp(value, 1, 32768) : 1;
      width = dimension(view.innerWidth);
      height = dimension(view.innerHeight);
      const dpr = Number.isFinite(view.devicePixelRatio) && view.devicePixelRatio > 0 ? view.devicePixelRatio : 1;
      // Soft light needs no Retina sharpness. This also bounds 4K/8K allocations.
      ratio = Math.min(2, dpr, Math.sqrt(PIXEL_BUDGET / (width * height)));
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      reset();
    }

    function paint(state) {
      const last = state.points.length - 1;
      const time = state.elapsed / 1000;
      const pulse = .94 + .06 * Math.sin(time * SETTINGS.pulseSpeed * Math.PI * 2);
      const energy = state.points[last].alpha * SETTINGS.opacity * SETTINGS.brightness *
        SETTINGS.glowIntensity * pulse * (.6 + state.points[last].strength * .4);
      // Ripple is zero at the attachment so it never detaches from the pointer.
      const points = state.points.map((p, i, all) => {
        if (i === last) return p;
        const next = all[i + 1];
        const length = Math.max(.001, distance(p, next));
        const ripple = Math.sin(time * 3 + i * .7) * Math.sin(i / last * Math.PI) *
          SETTINGS.noiseStrength * SETTINGS.trailWidth;
        return { x: p.x - (next.y - p.y) / length * ripple,
          y: p.y + (next.x - p.x) / length * ripple };
      });
      // Merge tiny segments, especially the last one: skipping the final stroke
      // would separate the glow from the pointer as its spring comes to rest.
      const drawable = [{ ...points[0], progress: 0 }];
      for (let i = 1; i <= last; i++) {
        const point = { ...points[i], progress: i / last };
        if (i === last) {
          while (drawable.length > 1 && distance(drawable.at(-1), point) < .35) drawable.pop();
        }
        if (distance(drawable.at(-1), point) >= .35) drawable.push(point);
      }
      if (drawable.length < 2) return;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = SETTINGS.blendMode;
      for (const pass of [
        { width: SETTINGS.glowSpread, alpha: .18, blur: 27 },
        { width: 1, alpha: .62, blur: 8 },
        { width: SETTINGS.hotspot, alpha: 1, blur: 3 },
      ]) {
        const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[last].x, points[last].y);
        gradient.addColorStop(0, `rgba(15, 3, 48, ${energy * pass.alpha * .7})`);
        gradient.addColorStop(1, `rgba(48, 0, 255, ${energy * pass.alpha})`);
        for (let i = 1; i < drawable.length; i++) {
          const a = drawable[i - 1], b = drawable[i];
          const progress = b.progress;
          const taper = SETTINGS.trailTaper + (1 - SETTINGS.trailTaper) * progress;
          const alpha = energy * pass.alpha * progress;
          ctx.strokeStyle = gradient;
          ctx.lineWidth = SETTINGS.trailWidth * pass.width * taper;
          ctx.shadowBlur = pass.blur * ratio;
          ctx.shadowColor = `rgba(48, 0, 255, ${alpha * .6})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    }

    function frame(position, deltaMs, sample) {
      const state = trail.frame(validPoint(position) ? position : null, deltaMs, sample);
      clear();
      if (state.active) paint(state);
      return state.active;
    }

    resize();
    return { frame, reset, resize };
  }

  const api = { createTrail, mount, SETTINGS };
  root.GiftLightTrail = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
