(function () {
  'use strict';

  const STORAGE_KEY = 'site-theme';
  const THEMES = ['dark', 'light', 'custom'];
  const ICONS = {
    dark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    light: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    custom: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" fill="currentColor" opacity="0.2"></path></svg>'
  };

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getCurrentTheme() {
    const stored = getStoredTheme();
    return stored || getSystemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    const icon = ICONS[theme] || ICONS.dark;
    btn.innerHTML = icon;
    btn.setAttribute('title', '当前主题: ' + (theme === 'dark' ? '深色' : theme === 'light' ? '浅色' : '自定义'));
  }

  function cycleTheme() {
    const current = getCurrentTheme();
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    setStoredTheme(next);
    applyTheme(next);
  }

  function init() {
    const theme = getCurrentTheme();
    applyTheme(theme);

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-theme-toggle]');
      if (btn) {
        e.preventDefault();
        cycleTheme();
      }
    });

    // Listen for system theme changes when no preference is stored
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
