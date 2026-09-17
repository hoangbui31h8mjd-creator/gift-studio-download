/* Adapted for this website from React Bits BorderGlow by David Haz.
 * MIT + Commons Clause; see ./third-party/react-bits-LICENSE.txt.
 * React lifecycle replaced with DOM listeners; animated=false (no sweep).
 */
(function (root) {
  'use strict';

  function pointerState(rect, clientX, clientY) {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    if (!(cx > 0 && cy > 0) || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return { proximity: 0, angle: 0 };
    }
    const dx = clientX - rect.left - cx;
    const dy = clientY - rect.top - cy;
    const proximity = Math.min(Math.max(Math.abs(dx) / cx, Math.abs(dy) / cy), 1) * 100;
    const angle = dx === 0 && dy === 0 ? 0 : (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
    return { proximity, angle };
  }

  root.GiftBorderGlow = { pointerState };
  if (!root.document) return;

  const reduceMotion = root.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = root.document.querySelectorAll('.border-glow-card');
  const clear = (card) => card.style.setProperty('--edge-proximity', '0');

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch' || reduceMotion.matches) return;
      const state = pointerState(card.getBoundingClientRect(), event.clientX, event.clientY);
      card.style.setProperty('--edge-proximity', state.proximity.toFixed(3));
      card.style.setProperty('--cursor-angle', `${state.angle.toFixed(3)}deg`);
    });
    card.addEventListener('pointerleave', () => clear(card));
    card.addEventListener('pointercancel', () => clear(card));
  });
  const clearAll = () => cards.forEach(clear);
  root.addEventListener('blur', clearAll);
  reduceMotion.addEventListener('change', clearAll);
})(globalThis);
