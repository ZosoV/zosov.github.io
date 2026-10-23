(() => {
  // Copy the source text, including BibTeX braces, escapes, and line breaks.
  const resetTimers = new WeakMap();
  function legacyCopy(text) {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.append(input);
    input.select();
    try { return document.execCommand('copy'); }
    catch { return false; }
    finally { input.remove(); }
  }
  document.querySelectorAll('[data-copy-citation]').forEach(button => {
    const block = button.closest('.citation-block');
    const code = block.querySelector('code');
    const label = button.querySelector('[data-copy-label]');
    const status = block.querySelector('.citation-status');
    button.addEventListener('click', async () => {
      clearTimeout(resetTimers.get(button));
      button.disabled = true;
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(code.textContent);
          copied = true;
        }
      } catch { /* Older browsers or blocked clipboard access use selection copying. */ }
      if (!copied) copied = legacyCopy(code.textContent);
      button.disabled = false;
      if (copied) {
        label.textContent = 'Copied!';
        status.textContent = 'BibTeX copied.';
        button.focus({ preventScroll: true });
        resetTimers.set(button, setTimeout(() => {
          label.textContent = 'Copy BibTeX';
          status.textContent = '';
        }, 2500));
      } else {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        block.querySelector('pre').focus({ preventScroll: true });
        selection.removeAllRanges();
        selection.addRange(range);
        label.textContent = 'Copy BibTeX';
        status.textContent = 'Citation selected. Use your keyboard’s copy shortcut.';
      }
    });
  });
})();
