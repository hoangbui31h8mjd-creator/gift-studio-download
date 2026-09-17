/* Original Gift Studio cursor, inspired by the public User Cursor demo/props.
   No React Bits Pro source or runtime dependency is included. */
(function (root) {
  'use strict';

  const ARROW = { stiffness: 380, damping: 32, mass: 0.6 };
  // A softer, heavier gift follows behind the unchanged precise arrow spring.
  const LABEL = { stiffness: 150, damping: 24, mass: 0.9 };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function shouldRun({ pointerType = 'mouse', finePointer = true, hover = true,
    reducedMotion = false, forcedColors = false, hidden = false } = {}) {
    return pointerType === 'mouse' && finePointer && hover &&
      !reducedMotion && !forcedColors && !hidden;
  }

  function spring(value) { return { value, velocity: 0 }; }
  function step(axis, target, config, dt) {
    axis.velocity += ((target - axis.value) * config.stiffness -
      axis.velocity * config.damping) / config.mass * dt;
    axis.value += axis.velocity * dt;
  }
  function rest(axis, target, precision = 0.02) {
    if (Math.abs(axis.value - target) > precision || Math.abs(axis.velocity) > precision * 4) return false;
    axis.value = target;
    axis.velocity = 0;
    return true;
  }

  function createFollower({ width = Infinity, height = Infinity } = {}) {
    let target = null;
    let arrow, label;
    const arrowTilt = spring(-14);
    const labelTilt = spring(0);
    const scale = spring(1);
    let pressed = false;

    function labelTarget() {
      let x = target.x + 25.2;
      let y = target.y + 11.6;
      if (x + 60 + 12 > width) x = target.x - 60 - 20;
      if (y + 44 + 12 > height) y = target.y - 44 - 16;
      return { x: clamp(x, 12, Math.max(12, width - 72)),
        y: clamp(y, 12, Math.max(12, height - 56)) };
    }
    function move(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      target = { x, y };
      if (!arrow) {
        const p = labelTarget();
        arrow = { x: spring(x), y: spring(y) };
        label = { x: spring(p.x), y: spring(p.y) };
      }
    }
    function resize(nextWidth, nextHeight) {
      if (Number.isFinite(nextWidth) && nextWidth > 0) width = nextWidth;
      if (Number.isFinite(nextHeight) && nextHeight > 0) height = nextHeight;
    }
    function frame(delta = 16) {
      if (!target) return { visible: false, moving: false };
      const p = labelTarget();
      const scaleTarget = pressed ? 0.92 : 1;
      const arrowRestTilt = -14 + (pressed ? 12 : 0);
      let remaining = Number.isFinite(delta) ? clamp(delta, 0, 64) / 1000 : 0;
      // Small integration steps keep the two physical springs stable at low FPS.
      while (remaining > 0.000001) {
        const dt = Math.min(remaining, 0.004);
        for (const key of ['x', 'y']) {
          step(arrow[key], target[key], ARROW, dt);
          step(label[key], p[key], LABEL, dt);
        }
        // Direction changes rock the arrow itself; position/follow springs stay unchanged.
        const movementTilt = clamp(arrow.x.velocity / 34 - arrow.y.velocity / 75, -32, 32);
        step(arrowTilt, arrowRestTilt + movementTilt, ARROW, dt);
        step(labelTilt, clamp(label.x.velocity / 60, -12, 12), LABEL, dt);
        step(scale, scaleTarget, ARROW, dt);
        remaining -= dt;
      }
      const atRest = [
        rest(arrow.x, target.x), rest(arrow.y, target.y),
        rest(label.x, p.x), rest(label.y, p.y),
        rest(arrowTilt, arrowRestTilt), rest(labelTilt, 0), rest(scale, scaleTarget, 0.0005),
      ].every(Boolean);
      return { visible: true, moving: !atRest,
        arrow: { x: arrow.x.value, y: arrow.y.value, rotation: arrowTilt.value, scale: scale.value },
        label: { x: clamp(label.x.value, 12, Math.max(12, width - 72)),
          y: clamp(label.y.value, 12, Math.max(12, height - 56)),
          rotation: labelTilt.value, scale: scale.value } };
    }
    return { move, resize, frame, press(value) {
      const next = !!value;
      if (next && !pressed) {
        // A small impulse preserves feedback even for a click between two frames.
        arrowTilt.velocity += 90;
        scale.velocity -= 0.8;
      }
      pressed = next;
    } };
  }

  if (typeof module === 'object' && module.exports) module.exports = { createFollower, shouldRun };
  if (!root.document) return;

  const doc = root.document;
  const reducedMotion = root.matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = root.matchMedia('(forced-colors: active)');
  const finePointer = root.matchMedia('(pointer: fine)');
  const hover = root.matchMedia('(hover: hover)');
  const layer = doc.createElement('div');
  layer.className = 'gift-cursor';
  layer.setAttribute('aria-hidden', 'true');
  layer.hidden = true;
  // Rounded silhouette shared by the glass surface and its clipped light.
  // Neutral white highlights only: the blurred page supplies the glass color.
  const arrowShape = 'M7.2 3.4C3.65 2.05 1.75 3.7 3.05 7.25L8.55 22.15C9.7 25.45 12.45 25.6 13.85 22.35L15.75 17.95Q16.1 17.1 16.95 16.75L21.95 14.55C25.3 13.1 25.2 10.35 21.9 9.1Z';
  // Fixed, local decorative markup; no remote assets, fonts or generated particles.
  layer.innerHTML = `
    <span class="gift-cursor-arrow" style="--cursor-arrow-shape: path('${arrowShape}')">
      <svg viewBox="0 0 28 28" width="28" height="28" focusable="false">
        <defs>
          <clipPath id="cursor-arrow-clip"><path d="${arrowShape}"/></clipPath>
          <linearGradient id="cursor-arrow-glass" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="#fff" stop-opacity=".3"/>
            <stop offset=".42" stop-color="#fff" stop-opacity=".08"/>
            <stop offset=".76" stop-color="#fff" stop-opacity=".18"/>
            <stop offset="1" stop-color="#fff" stop-opacity=".38"/>
          </linearGradient>
          <radialGradient id="cursor-arrow-light" cx=".75" cy=".45" r=".7">
            <stop stop-color="#fff" stop-opacity=".58"/>
            <stop offset=".5" stop-color="#fff" stop-opacity=".16"/>
            <stop offset="1" stop-color="#fff" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="cursor-arrow-edge" x1="0" y1="0" x2=".8" y2="1">
            <stop stop-color="#fff" stop-opacity=".92"/><stop offset=".42" stop-color="#fff" stop-opacity=".38"/>
            <stop offset="1" stop-color="#fff" stop-opacity=".86"/>
          </linearGradient>
        </defs>
        <path d="${arrowShape}" fill="url(#cursor-arrow-glass)"/>
        <g clip-path="url(#cursor-arrow-clip)">
          <ellipse cx="19" cy="13" rx="13" ry="12" fill="url(#cursor-arrow-light)"/>
        </g>
        <path d="${arrowShape}" fill="none" stroke="url(#cursor-arrow-edge)"
          stroke-width=".85" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="gift-cursor-label">
      <svg class="gift-cursor-gift" viewBox="0 0 48 42" width="40" height="36" focusable="false">
        <defs>
          <linearGradient id="cursor-gift-body" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="#bdc9ff"/><stop offset=".48" stop-color="#9888f5"/>
            <stop offset="1" stop-color="#615bda" stop-opacity=".65"/>
          </linearGradient>
          <linearGradient id="cursor-gift-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="#f3efff"/><stop offset="1" stop-color="#b7caff" stop-opacity=".8"/>
          </linearGradient>
        </defs>
        <path d="M23.5 12C13 13 9 8 12.5 5.5S21 7 23.5 12Zm1 0C35 13 39 8 35.5 5.5S27 7 24.5 12Z"
          fill="none" stroke="url(#cursor-gift-ribbon)" stroke-width="3" stroke-linecap="round"/>
        <rect x="9" y="18" width="30" height="21" rx="6" fill="url(#cursor-gift-body)" stroke="#d0c7ff" stroke-opacity=".55"/>
        <rect x="7" y="12" width="34" height="10" rx="4" fill="url(#cursor-gift-body)" stroke="#e1dcff" stroke-opacity=".7"/>
        <path d="M22 13h4v26h-4z" fill="url(#cursor-gift-ribbon)"/>
        <path d="M12 25v7q0 3 3 3" fill="none" stroke="#e8e4ff" stroke-opacity=".45" stroke-linecap="round"/>
      </svg>
    </span>`;
  const arrowNode = layer.querySelector('.gift-cursor-arrow');
  const labelNode = layer.querySelector('.gift-cursor-label');
  doc.body.append(layer);
  const preview = root.GiftCursorPreview?.mount({ doc, labelNode });

  let follower = createFollower({ width: root.innerWidth, height: root.innerHeight });
  let frameId = null;
  let previousTime = null;
  function allowed(pointerType = 'mouse') {
    return shouldRun({ pointerType, finePointer: finePointer.matches, hover: hover.matches,
      reducedMotion: reducedMotion.matches, forcedColors: forcedColors.matches, hidden: doc.hidden });
  }
  function hide() {
    preview?.reset();
    layer.hidden = true;
    doc.documentElement.classList.remove('gift-cursor-active');
    if (frameId !== null) root.cancelAnimationFrame(frameId);
    frameId = null;
    previousTime = null;
    follower = createFollower({ width: root.innerWidth, height: root.innerHeight });
  }
  function transform(node, p) {
    node.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${p.rotation.toFixed(2)}deg) scale(${p.scale.toFixed(4)})`;
  }
  function render(time) {
    frameId = null;
    if (!allowed()) { hide(); return; }
    const delta = previousTime === null ? 16 : time - previousTime;
    const state = follower.frame(delta);
    if (!state.visible) return;
    previousTime = time;
    transform(arrowNode, state.arrow);
    transform(labelNode, state.label);
    preview?.frame(state, delta);
    layer.hidden = false;
    // Hide the native cursor only after a positioned replacement is visible.
    doc.documentElement.classList.add('gift-cursor-active');
    if (state.moving) frameId = root.requestAnimationFrame(render);
    else previousTime = null;
  }
  function schedule() {
    if (frameId === null) frameId = root.requestAnimationFrame(render);
  }
  function track(event) {
    if (!allowed(event.pointerType)) { hide(); return false; }
    follower.move(event.clientX, event.clientY);
    follower.press(event.buttons !== 0);
    schedule();
    return true;
  }
  doc.addEventListener('pointermove', track, { passive: true });
  doc.addEventListener('pointerdown', (event) => {
    if (track(event)) follower.press(true);
  }, { passive: true });
  root.addEventListener('pointerup', (event) => {
    if (!allowed(event.pointerType)) { hide(); return; }
    follower.press(false);
    if (!layer.hidden || frameId !== null) {
      schedule();
    }
  }, { passive: true });
  doc.addEventListener('click', (event) => {
    if (event.button !== 0 || event.detail < 1 || !allowed(event.pointerType || 'mouse')) return;
    if (!layer.hidden || frameId !== null) preview?.click();
  }, { passive: true });
  doc.addEventListener('pointerleave', hide);
  doc.addEventListener('pointercancel', hide);
  doc.addEventListener('keydown', hide);
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) hide(); });
  root.addEventListener('blur', hide);
  root.addEventListener('pagehide', hide);
  root.addEventListener('resize', () => {
    follower.resize(root.innerWidth, root.innerHeight);
    if (!layer.hidden) schedule();
  }, { passive: true });
  [reducedMotion, forcedColors, finePointer, hover].forEach((query) => {
    query.addEventListener('change', () => { if (!allowed()) hide(); });
  });
})(globalThis);
