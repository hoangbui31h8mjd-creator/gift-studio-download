/* Proportional desktop sizing. Browser zoom compensation is a same-page
   heuristic based on stable screen/window geometry, not universal zoom detection. */
(function (root) {
  'use strict';

  const positive = (value) => Number.isFinite(value) && value > 0;
  const hasPair = (state, a, b) => positive(state[a]) && positive(state[b]);
  const samePair = (a, b, x, y) => hasPair(a, x, y) && hasPair(b, x, y) &&
    a[x] === b[x] && a[y] === b[y];

  function createLayoutScaleController() {
    let previous = null;
    let zoomCompensation = 1;
    let scale = 1;

    function update(input) {
      if (!input || !positive(input.width) || !positive(input.height)) return scale;
      const current = {};
      for (const key of ['width', 'height', 'dpr', 'outerWidth', 'outerHeight', 'screenWidth', 'screenHeight']) {
        current[key] = positive(input[key]) ? input[key] : null;
      }
      let compensation = zoomCompensation;
      if (previous) {
        const sameScreen = samePair(previous, current, 'screenWidth', 'screenHeight');
        const screenChanged = hasPair(previous, 'screenWidth', 'screenHeight') &&
          hasPair(current, 'screenWidth', 'screenHeight') && !sameScreen;
        if (screenChanged) {
          compensation = 1;
        } else if (previous.dpr && current.dpr && previous.dpr !== current.dpr) {
          const sameWindow = samePair(previous, current, 'outerWidth', 'outerHeight');
          const viewportChanged = previous.width !== current.width || previous.height !== current.height;
          // DPR alone can describe display density. Require a changed CSS viewport
          // and unchanged known geometry before treating it as browser zoom.
          compensation = sameScreen && sameWindow && viewportChanged ?
            compensation * current.dpr / previous.dpr : 1;
        }
      }
      if (!positive(compensation)) compensation = 1;
      // Apply compensation before the minimum of 1, including CSS viewports that
      // become phone-sized through browser zoom. Real small windows remain at 1.
      const nextScale = Math.max(1, Math.min(current.width / 1728, current.height / 941) * compensation);
      if (!Number.isFinite(nextScale)) return scale;
      previous = current;
      zoomCompensation = compensation;
      scale = nextScale;
      return scale;
    }
    return { update, effectiveWidth() { return previous ? previous.width * zoomCompensation : 1728; } };
  }

  if (typeof module === 'object' && module.exports) module.exports = { createLayoutScaleController };
  if (!root.document) return;

  const controller = createLayoutScaleController();
  let frameId = null;
  function apply() {
    frameId = null;
    const scale = controller.update({
      width: root.innerWidth, height: root.innerHeight, dpr: root.devicePixelRatio,
      outerWidth: root.outerWidth, outerHeight: root.outerHeight,
      screenWidth: root.screen && root.screen.width,
      screenHeight: root.screen && root.screen.height,
    });
    root.document.documentElement.style.setProperty('--layout-scale', String(scale));
    root.document.documentElement.style.setProperty('--layout-vw', `${controller.effectiveWidth() / 100}px`);
  }
  apply();
  root.addEventListener('resize', () => {
    if (frameId === null) frameId = root.requestAnimationFrame(apply);
  }, { passive: true });
})(globalThis);
