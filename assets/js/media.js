(() => {
  const triggers = document.querySelectorAll('[data-image-original]');
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'image-dialog';
  dialog.setAttribute('aria-labelledby', 'image-dialog-title');
  dialog.innerHTML = `<div class="dialog-toolbar"><p id="image-dialog-title" class="dialog-title"></p><div class="dialog-tools"><button type="button" data-image-zoom aria-pressed="false">Original size</button><a data-image-open target="_blank" rel="noopener noreferrer">Open original</a><button type="button" data-image-close aria-label="Close image">Close</button></div></div><div class="dialog-viewport"><p class="dialog-status" role="status">Loading image…</p><img class="dialog-image" alt="" hidden></div>`;
  document.body.append(dialog);
  const image = dialog.querySelector('.dialog-image');
  const title = dialog.querySelector('.dialog-title');
  const status = dialog.querySelector('.dialog-status');
  const zoom = dialog.querySelector('[data-image-zoom]');
  const original = dialog.querySelector('[data-image-open]');
  const close = dialog.querySelector('[data-image-close]');
  const viewport = dialog.querySelector('.dialog-viewport');
  let trigger = null;
  let previousOverflow = '';
  function resetZoom() {
    dialog.classList.remove('is-zoomed');
    zoom.textContent = 'Original size';
    zoom.setAttribute('aria-pressed', 'false');
    viewport.scrollTo(0, 0);
  }
  image.addEventListener('load', () => {
    image.hidden = false;
    status.hidden = true;
    zoom.disabled = false;
  });
  image.addEventListener('error', () => {
    status.textContent = 'This image could not be loaded. Use Open original to view the source.';
    status.hidden = false;
    zoom.disabled = true;
  });
  triggers.forEach(element => element.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') {
      if (element.tagName !== 'A') window.open(element.dataset.imageOriginal, '_blank', 'noopener');
      return;
    }
    event.preventDefault();
    trigger = element;
    resetZoom();
    const label = element.dataset.imageTitle || element.querySelector('img')?.alt || 'Image';
    title.textContent = label;
    image.alt = label;
    image.hidden = true;
    status.hidden = false;
    status.textContent = 'Loading image…';
    zoom.disabled = true;
    original.href = element.dataset.imageOriginal;
    image.src = element.dataset.imageOriginal;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    close.focus();
  }));
  zoom.addEventListener('click', () => {
    const enlarged = dialog.classList.toggle('is-zoomed');
    zoom.textContent = enlarged ? 'Fit to screen' : 'Original size';
    zoom.setAttribute('aria-pressed', String(enlarged));
    if (enlarged) viewport.scrollTo((viewport.scrollWidth - viewport.clientWidth) / 2, (viewport.scrollHeight - viewport.clientHeight) / 2);
    else viewport.scrollTo(0, 0);
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    trigger?.focus({ preventScroll: true });
  });
})();
