/* Decorative comparison controls are opt-in; the ordinary page has no toy. */
(function (root) {
  'use strict';
  const names = ['star', 'droplet', 'gift'];
  const descriptions = {
    star: '玻璃星星 · 轻轻甩动，停下回弹',
    droplet: '软糖光团 · 拖动拉伸，松弛回圆',
    gift: '迷你礼盒 · 点击开盖，扫光后合上',
  };
  function readPreview(search) {
    const query = new URLSearchParams(search);
    if (query.get('cursor-preview') !== '1') return null;
    const name = query.get('cursor');
    return names.includes(name) ? name : 'star';
  }
  function createController({ label, variants, initial = 'star', timers = root }) {
    let selected = null, previous = null;
    let revealTimer = null, generation = 0;
    function shape(stretch = 1, angle = 0) {
      label.style.setProperty('--trail-stretch', String(stretch));
      label.style.setProperty('--trail-squash', String(1 / Math.sqrt(stretch)));
      label.style.setProperty('--trail-angle', `${angle}deg`);
    }
    function cancelReveal() {
      generation++;
      if (revealTimer !== null) timers.clearTimeout(revealTimer);
      revealTimer = null;
      label.classList.toggle('is-open', false);
    }
    function click() {
      // Let one open / sweep / close finish; rapid clicks cannot stack or pin it open.
      if (selected !== 'gift' || revealTimer !== null) return false;
      label.classList.toggle('is-open', true);
      const currentGeneration = generation;
      revealTimer = timers.setTimeout(() => {
        if (currentGeneration !== generation) return;
        label.classList.toggle('is-open', false);
        revealTimer = timers.setTimeout(() => {
          if (currentGeneration === generation) revealTimer = null;
        }, 400);
      }, 850);
      return true;
    }
    function select(name) {
      if (!names.includes(name) || typeof variants[name] !== 'string') return false;
      selected = name;
      label.setAttribute('data-variant', name);
      label.innerHTML = variants[name];
      previous = null;
      cancelReveal();
      shape();
      return true;
    }
    function frame(state, delta) {
      const p = state.label;
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(delta) || delta <= 0) {
        previous = null;
        shape();
        return;
      }
      if (!previous || !state.moving) shape();
      else {
        const dx = p.x - previous.x, dy = p.y - previous.y;
        const speed = Math.hypot(dx, dy) * 1000 / delta;
        const strength = selected === 'droplet' ? 0.36 : selected === 'star' ? 0.16 : 0;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle > 90) angle -= 180;
        if (angle < -90) angle += 180;
        shape(1 + Math.min(speed / 1800, 1) * strength, angle);
      }
      previous = { x: p.x, y: p.y };
    }
    function reset() { previous = null; cancelReveal(); shape(); }
    select(initial);
    return { select, frame, click, reset };
  }

  function mount({ doc, labelNode, variants = root.GiftCursorVariants, timers = root }) {
    const initial = readPreview(root.location?.search || '');
    if (!variants || !names.every(name => typeof variants[name] === 'string')) return null;
    if (!initial) return null;
    const controller = createController({ label: labelNode, variants, initial, timers });
    const effect = controller;
    const panel = doc.createElement('aside');
    panel.className = 'cursor-preview-panel';
    panel.setAttribute('aria-label', '鼠标跟随效果预览');
    panel.innerHTML = `
      <div class="cursor-preview-heading"><strong>跟随效果预览</strong><a class="cursor-preview-exit">退出预览 ↗</a></div>
      <div class="cursor-preview-options" role="group" aria-label="选择跟随效果">
        <button type="button" data-cursor-option="star"><span>01</span>玻璃星星</button>
        <button type="button" data-cursor-option="droplet"><span>02</span>软糖光团</button>
        <button type="button" data-cursor-option="gift"><span>03</span>迷你礼盒</button>
      </div>
      <p class="cursor-preview-description" aria-live="polite"></p>
      <p class="cursor-preview-motion-note">当前设备或减少动态设置已关闭跟随动效。</p>`;
    const buttons = [...panel.querySelectorAll('[data-cursor-option]')];
    const description = panel.querySelector('.cursor-preview-description');
    const exitUrl = new URL(root.location.href);
    exitUrl.searchParams.delete('cursor-preview');
    exitUrl.searchParams.delete('cursor');
    panel.querySelector('.cursor-preview-exit').href = exitUrl.href;
    function update(name, writeUrl = true) {
      if (!controller.select(name)) return;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cursorOption === name)));
      description.textContent = descriptions[name];
      if (writeUrl) {
        const url = new URL(root.location.href);
        url.searchParams.set('cursor', name);
        // A restrictive embed must not make visual switching fail.
        try { root.history.replaceState(root.history.state, '', url); } catch (_) { /* preview still works */ }
      }
    }
    panel.addEventListener('click', event => {
      const button = event.target.closest('[data-cursor-option]');
      if (button && panel.contains(button)) update(button.dataset.cursorOption);
    });
    update(initial, false);
    doc.body.append(panel);
    return effect;
  }
  const api = { readPreview, createController, mount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GiftCursorPreview = api;
})(globalThis);
