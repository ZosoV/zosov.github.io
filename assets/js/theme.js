(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let savedTheme = null;
  try {
    const saved = localStorage.getItem('personal-site-theme');
    if (saved === 'light' || saved === 'dark') savedTheme = saved;
    if (localStorage.getItem('personal-site-sidebar') === 'collapsed') root.dataset.sidebar = 'collapsed';
  } catch { /* Preferences still work when browser storage is unavailable. */ }
  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const dark = theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(dark));
      button.querySelector('[data-theme-label]').textContent = dark ? 'Light mode' : 'Dark mode';
      const symbol = button.querySelector('use');
      symbol.setAttribute('href', symbol.getAttribute('href').split('#')[0] + (dark ? '#sun' : '#moon'));
    });
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
  apply(savedTheme || (preference.matches ? 'dark' : 'light'));
  function init() {
    apply(root.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('personal-site-theme', savedTheme); } catch {}
        apply(savedTheme);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  preference.addEventListener('change', () => {
    if (!savedTheme) apply(preference.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'personal-site-theme') return;
    savedTheme = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    apply(savedTheme || (preference.matches ? 'dark' : 'light'));
  });
})();
