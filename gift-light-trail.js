/* A bounded, fading ribbon below the gift. The existing cursor owns scheduling. */
(function (root) {
  'use strict';

  const FADE_MS = 380;
  const MAX_POINTS = 24;
  const MAX_LENGTH = 110;
  const PIXEL_BUDGET = 4000000;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const validPoint = (point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) &&
    Math.abs(point.x) <= 10000000 && Math.abs(point.y) <= 10000000;

  function createTrail() {
    let anchor = null;
    let points = [];

    function reset() {
      anchor = null;
      points = [];
    }

    function trim() {
      if (points.length > MAX_POINTS) points = points.slice(-MAX_POINTS);
      let length = 0;
      for (let i = points.length - 1; i > 0; i--) {
        const next = points[i];
        const previous = points[i - 1];
        const segment = distance(next, previous);
        if (length + segment > MAX_LENGTH) {
          const fraction = (MAX_LENGTH - length) / segment;
          points[i - 1] = {
            x: next.x + (previous.x - next.x) * fraction,
            y: next.y + (previous.y - next.y) * fraction,
            age: next.age + (previous.age - next.age) * fraction,
            strength: next.strength + (previous.strength - next.strength) * fraction,
          };
          points = points.slice(i - 1);
          break;
        }
        length += segment;
      }
    }

    function snapshot() {
      if (points.length < 2) {
        points = [];
        return { active: false, points: [] };
      }
      return {
        active: true,
        points: points.map(({ x, y, age, strength }) => ({
          x, y, strength, alpha: Math.pow(Math.max(0, 1 - age / FADE_MS), 1.35),
        })),
      };
    }

    function frame(position, deltaMs = 16) {
      if (!validPoint(position)) {
        reset();
        return snapshot();
      }
      const delta = Number.isFinite(deltaMs) && deltaMs >= 0 ? deltaMs : 16;
      // A suspended tab must not draw a bridge from its old page position.
      if (delta >= FADE_MS) reset();
      points = points.map(point => ({ ...point, age: point.age + delta }))
        .filter(point => point.age < FADE_MS);
      const current = { x: position.x, y: position.y };
      if (!anchor) {
        anchor = current;
        return snapshot();
      }
      const moved = distance(current, anchor);
      if (moved > .15) {
        const strength = clamp(.16 + moved / Math.max(delta, 1) * .28, .16, 1);
        if (!points.length) points.push({ ...anchor, age: Math.min(delta, FADE_MS - 1), strength });
        points.push({ ...current, age: 0, strength });
        anchor = current;
        trim();
      }
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

    function trace(points) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }

    function paint(points) {
      const tail = points[0];
      const head = points[points.length - 1];
      const energy = head.alpha * head.strength;
      // One continuous path per pass avoids isolated glowing dots at sample points.
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      for (const pass of [
        { width: 8, alpha: .19, blur: 8, rgb: '220, 212, 255' },
        { width: 2.3, alpha: .5, blur: 3, rgb: '248, 247, 255' },
      ]) {
        const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        gradient.addColorStop(0, `rgba(${pass.rgb}, 0)`);
        gradient.addColorStop(.4, `rgba(${pass.rgb}, ${energy * pass.alpha * .45})`);
        gradient.addColorStop(1, `rgba(${pass.rgb}, ${energy * pass.alpha})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = pass.width * (.72 + head.strength * .28);
        ctx.shadowColor = `rgba(${pass.rgb}, ${energy * pass.alpha * .8})`;
        ctx.shadowBlur = pass.blur * ratio;
        trace(points);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function frame(labelState, deltaMs) {
      const center = validPoint(labelState) ? { x: labelState.x + 30, y: labelState.y + 22 } : null;
      const state = trail.frame(center, deltaMs);
      clear();
      if (state.active) paint(state.points);
      return state.active;
    }

    resize();
    return { frame, reset, resize };
  }

  const api = { createTrail, mount };
  root.GiftLightTrail = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
