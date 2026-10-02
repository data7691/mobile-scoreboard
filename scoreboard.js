(() => {
  'use strict';
  const players = ['left', 'front', 'right'];
  const labels = { left: '左', front: '前', right: '右' };
  const storageKey = 'scoreboard-state'; // Preserves scores from the existing site.
  const state = Object.fromEntries(players.map(p => [p, { base: 0, tai: 0 }]));
  const $ = selector => document.querySelector(selector);
  const money = value => value.toLocaleString('zh-TW');
  const safeNumber = value => Math.max(0, Math.min(999999, Math.trunc(Number(value) || 0)));
  const baseInput = $('#basePrice');
  const taiInput = $('#taiPrice');
  const selfDrawTaiInput = $('#selfDrawTai');
  const wakeBtn = $('#wakeBtn');
  const fsBtn = $('#fsBtn');
  const toast = $('#toast');
  let toastTimer;
  let wakeLock = null;
  let wakeDesired = false;

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
  }

  function amountFor(player) {
    return state[player].base * safeNumber(baseInput.value) + state[player].tai * safeNumber(taiInput.value);
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        state,
        basePrice: baseInput.value,
        taiPrice: taiInput.value,
        selfDrawTai: selfDrawTaiInput.value
      }));
    } catch (_) { /* Private browsing may disable storage. */ }
  }

  function fitText(element, max, min) {
    let size = max;
    element.style.fontSize = size + 'px';
    while (size > min && element.scrollWidth > element.clientWidth) {
      size -= 2;
      element.style.fontSize = size + 'px';
    }
  }

  function render() {
    for (const player of players) {
      const panel = document.querySelector(`[data-player="${player}"]`);
      panel.querySelector('[data-kind="base"]').textContent = state[player].base;
      panel.querySelector('[data-kind="tai"]').textContent = state[player].tai;
      panel.querySelector('[data-role="amount"]').textContent = money(amountFor(player));
      $('#sum-' + player).textContent = money(amountFor(player));
    }
    $('#grandTotal').textContent = money(players.reduce((sum, p) => sum + amountFor(p), 0));
    requestAnimationFrame(() => {
      document.querySelectorAll('.amount').forEach(el => fitText(el, Math.min(82, Math.max(32, innerWidth * .063)), 22));
      document.querySelectorAll('.sval').forEach(el => fitText(el, Math.min(30, Math.max(16, innerWidth * .024)), 13));
      fitText($('#grandTotal'), Math.min(42, Math.max(18, innerWidth * .033)), 16);
    });
    save();
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!saved) return;
      for (const player of players) {
        state[player].base = safeNumber(saved.state?.[player]?.base);
        state[player].tai = safeNumber(saved.state?.[player]?.tai);
      }
      if (saved.basePrice != null) baseInput.value = safeNumber(saved.basePrice);
      if (saved.taiPrice != null) taiInput.value = safeNumber(saved.taiPrice);
      if (saved.selfDrawTai != null) selfDrawTaiInput.value = Math.min(99, safeNumber(saved.selfDrawTai));
    } catch (_) { /* Invalid saved state starts at zero. */ }
  }

  $('.boards').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const player = button.closest('[data-player]').dataset.player;
    const scores = state[player];
    switch (button.dataset.action) {
      case 'inc-base': case 'plus-round': scores.base = Math.min(999999, scores.base + 1); break;
      case 'dec-base': case 'minus-round': scores.base = Math.max(0, scores.base - 1); break;
      case 'inc-tai': scores.tai = Math.min(999999, scores.tai + 1); break;
      case 'dec-tai': scores.tai = Math.max(0, scores.tai - 1); break;
      case 'clear-player':
        if (!confirm(`確定清除「${labels[player]}」的底數與台數？`)) return;
        scores.base = 0;
        scores.tai = 0;
        break;
    }
    render();
  });

  for (const input of [baseInput, taiInput]) {
    input.addEventListener('input', render);
    input.addEventListener('change', () => {
      input.value = safeNumber(input.value);
      render();
    });
  }
  selfDrawTaiInput.addEventListener('input', save);
  selfDrawTaiInput.addEventListener('change', () => {
    selfDrawTaiInput.value = Math.min(99, safeNumber(selfDrawTaiInput.value));
    save();
  });
  $('#selfDrawBtn').addEventListener('click', () => {
    const tai = Math.min(99, safeNumber(selfDrawTaiInput.value));
    selfDrawTaiInput.value = tai;
    for (const player of players) {
      state[player].base = Math.min(999999, state[player].base + 1);
      state[player].tai = Math.min(999999, state[player].tai + tai);
    }
    render();
    showToast(`自摸 ${tai} 台：左、前、右各加 1 底 ${tai} 台`);
  });
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('確定將左、前、右全部清除？')) return;
    for (const player of players) state[player] = { base: 0, tai: 0 };
    render();
  });

  async function updateWakeLock() {
    if (!wakeDesired) {
      try { await wakeLock?.release(); } catch (_) {}
      wakeLock = null;
      wakeBtn.setAttribute('aria-pressed', 'false');
      wakeBtn.textContent = '常亮';
      return;
    }
    if (!navigator.wakeLock) {
      wakeDesired = false;
      showToast('此瀏覽器不支援網頁常亮，請調整手機自動鎖定設定');
      return;
    }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeBtn.setAttribute('aria-pressed', 'true');
      wakeBtn.textContent = '常亮 ON';
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        wakeBtn.setAttribute('aria-pressed', 'false');
        wakeBtn.textContent = '常亮';
      }, { once: true });
    } catch (_) {
      showToast('目前無法啟用常亮');
    }
  }
  wakeBtn.addEventListener('click', () => { wakeDesired = !wakeDesired; updateWakeLock(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeDesired && !wakeLock) updateWakeLock();
  });

  fsBtn.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        try { await screen.orientation?.lock?.('landscape'); } catch (_) {}
      } else {
        showToast('此瀏覽器不支援網頁全螢幕；可從 Safari 加入主畫面使用');
      }
    } catch (_) {
      showToast('此瀏覽器無法進入全螢幕；可從 Safari 加入主畫面使用');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fsBtn.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
  });
  window.addEventListener('resize', render);

  load();
  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {}));
  }
})();
