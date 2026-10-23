(() => {
  const rail = document.querySelector('.contents-rail');
  if (!rail) return;
  const root = document.documentElement;
  const shell = rail.querySelector('.sidebar-shell');
  const compact = matchMedia('(max-width: 1000px)');
  const collapse = rail.querySelector('.sidebar-collapse');
  const groups = [...rail.querySelectorAll('.sidebar-group')];
  const entries = [...rail.querySelectorAll('[data-section-link]')].map(link => ({
    link, target: document.getElementById(link.hash.slice(1)), group: link.closest('.sidebar-group')
  })).filter(entry => entry.target);
  function expandGroup(group, open, closeOthers = true) {
    if (open && closeOthers) groups.filter(item => item !== group).forEach(item => expandGroup(item, false, false));
    const button = group.querySelector('.group-toggle');
    const submenu = group.querySelector('.sidebar-submenu');
    if (!button || !submenu) return;
    button.setAttribute('aria-expanded', String(open));
    submenu.hidden = !open;
    button.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} ${group.querySelector('.sidebar-label').textContent.toLowerCase()} shortcuts`);
  }
  groups.forEach(group => {
    group.querySelector('.group-toggle')?.addEventListener('click', () => {
      expandGroup(group, group.querySelector('.group-toggle').getAttribute('aria-expanded') !== 'true');
    });
  });
  // Labels stay visible on hover/focus even when the sidebar is icon-only.
  const tooltip = document.createElement('div');
  tooltip.id = 'sidebar-tooltip';
  tooltip.className = 'sidebar-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let tooltipTarget = null;
  function hideTooltip() {
    tooltip.hidden = true;
    tooltipTarget?.removeAttribute('aria-describedby');
    tooltipTarget = null;
  }
  function showTooltip(element) {
    hideTooltip();
    if (compact.matches || root.dataset.sidebar !== 'collapsed') return;
    const label = element.getAttribute('aria-label') || element.textContent.trim();
    if (!label) return;
    tooltip.textContent = label;
    tooltip.hidden = false;
    tooltipTarget = element;
    element.setAttribute('aria-describedby', tooltip.id);
    const bounds = element.getBoundingClientRect();
    tooltip.style.left = `${Math.min(bounds.right + 16, innerWidth - tooltip.offsetWidth - 12)}px`;
    tooltip.style.top = `${Math.max(12, Math.min(bounds.top + (bounds.height - tooltip.offsetHeight) / 2, innerHeight - tooltip.offsetHeight - 12))}px`;
  }
  rail.querySelectorAll('.sidebar-row > a, .sidebar-footer button').forEach(element => {
    if (!element.hasAttribute('aria-label')) element.setAttribute('aria-label', element.getAttribute('title') || element.textContent.trim());
    element.removeAttribute('title');
    element.addEventListener('pointerenter', () => showTooltip(element));
    element.addEventListener('pointerleave', hideTooltip);
    element.addEventListener('focus', () => showTooltip(element));
    element.addEventListener('blur', hideTooltip);
    element.addEventListener('click', hideTooltip);
  });
  window.addEventListener('resize', hideTooltip);
  window.addEventListener('scroll', hideTooltip, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTooltip(); });
  function syncCollapse() {
    const collapsed = root.dataset.sidebar === 'collapsed';
    collapse.setAttribute('aria-expanded', String(!collapsed));
    const label = `${collapsed ? 'Expand' : 'Collapse'} sidebar`;
    collapse.setAttribute('aria-label', label);
    collapse.setAttribute('title', label);
    collapse.querySelector('.sidebar-label').textContent = collapsed ? 'Expand' : 'Collapse';
  }
  collapse.addEventListener('click', () => {
    const collapsed = root.dataset.sidebar !== 'collapsed';
    root.dataset.sidebar = collapsed ? 'collapsed' : 'expanded';
    try { localStorage.setItem('personal-site-sidebar', collapsed ? 'collapsed' : 'expanded'); } catch {}
    syncCollapse();
  });
  syncCollapse();
  function syncMenu() { shell.open = !compact.matches; }
  syncMenu();
  compact.addEventListener('change', syncMenu);
  rail.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    if (link.hasAttribute('data-section-link')) expandGroup(link.closest('.sidebar-group'), true);
    if (compact.matches) shell.open = false;
  }));
  rail.addEventListener('keydown', event => {
    if (event.key === 'Escape' && compact.matches) {
      shell.open = false;
      shell.querySelector('summary').focus();
    }
  });
  const childEntries = [...rail.querySelectorAll('[data-entry-link]')].map(link => ({
    link, target: document.getElementById(link.hash.slice(1)), group: link.closest('.sidebar-group')
  })).filter(entry => entry.target);
  let scheduled = false;
  let previousGroup = null;
  function update() {
    scheduled = false;
    if (!entries.length) return;
    const top = scrollY;
    const offset = compact.matches ? 110 : 55;
    const atEnd = top + innerHeight >= document.documentElement.scrollHeight - 4;
    let current = 0;
    entries.forEach((entry, index) => {
      if (entry.target.getBoundingClientRect().top <= offset) current = index;
    });
    if (atEnd) current = entries.length - 1;
    const currentGroup = entries[current].group;
    if (previousGroup !== currentGroup && (previousGroup || location.hash)) expandGroup(currentGroup, true);
    previousGroup = currentGroup;
    entries.forEach(({ link, group }, index) => {
      group.classList.toggle('is-active', index === current);
      if (index !== current) { link.removeAttribute('aria-current'); return; }
      link.setAttribute('aria-current', 'location');
    });
    const children = childEntries.filter(entry => entry.group === currentGroup);
    let child = null;
    children.forEach(entry => {
      if (entry.target.getBoundingClientRect().top <= offset + 30) child = entry;
    });
    if (atEnd && children.length) child = children.at(-1);
    childEntries.forEach(entry => {
      if (entry === child) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  shell.addEventListener('toggle', schedule);
  document.fonts?.ready.then(schedule);
  update();
})();
