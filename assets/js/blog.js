(() => {
  const controls = [...document.querySelectorAll('[data-filter-tag]')];
  if (!controls.length) return;
  const posts = [...document.querySelectorAll('[data-post-tags]')];
  const count = document.querySelector('.post-count');
  const empty = document.querySelector('.no-posts');
  function filter(tag, updateUrl = false) {
    if (!controls.some(button => button.dataset.filterTag === tag)) tag = 'all';
    let visible = 0;
    posts.forEach(post => {
      post.hidden = tag !== 'all' && !post.dataset.postTags.split(' ').includes(tag);
      if (!post.hidden) visible++;
    });
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filterTag === tag)));
    count.textContent = `${visible} ${visible === 1 ? 'post' : 'posts'}`;
    empty.hidden = visible !== 0;
    if (updateUrl) {
      const url = new URL(location.href);
      if (tag === 'all') url.searchParams.delete('tag');
      else url.searchParams.set('tag', tag);
      history.pushState(null, '', url);
    }
  }
  controls.forEach(button => button.addEventListener('click', () => filter(button.dataset.filterTag, true)));
  window.addEventListener('popstate', () => filter(new URLSearchParams(location.search).get('tag') || 'all'));
  filter(new URLSearchParams(location.search).get('tag') || 'all');
})();
