# Project resource links

These rules apply to the resource links in every project page header under `portfolio/`.

- Keep visible resource labels to one concise word: `Article`, `Thesis`, `Poster`, `Slides`, `Video`, `Code`, `Source`, or `Blog`.
- Do not put project names, descriptions, or qualifiers such as “Demo”, “State Abstractions”, or “Extended Code” in the visible label. Put useful context in the link's `title` and accessible label instead.
- Preserve each link's destination and meaning. Use a distinct concise label when a project links to multiple code resources.
- Keep resource tiles equal in width and height within each viewport, with identical icon dimensions and consistent spacing. Keep labels on one line. Use the shared rules in `assets/css/site.css` rather than per-project sizing.
- Keep the pastel icon palette, dark navy project headers, white project content backgrounds in light mode, and responsive layout consistent across project pages.
- When changing resource links, check all project pages at phone and desktop widths for consistent tile dimensions, readable labels, and overflow.

# Navigation and appearance

- Use short sidebar labels for nested home-page project shortcuts (for example, BPER, StyleGAN, or Path planning). Keep full project titles in the page content.
- Keep the shared sidebar consistent across the home page and project pages, with expandable groups, an icon-only desktop state, and a collapsible mobile menu.
- Preserve light and dark modes and save the visitor's theme choice across pages. Keep links free of underlines and preserve figures' original colors in either theme.
- Keep all project content and full mathematical definitions when adjusting navigation or presentation. Convert algorithm images to selectable, numbered pseudocode with rendered math without omitting steps or changing notation.
- Indicate active sidebar items with background and text color; do not add vertical progress strokes beside icons. Use recognizable section icons and show labels on hover and keyboard focus when collapsed.
- Keep inline algorithm math free of individual scrollbars; allow scrolling only on genuinely oversized lines at small widths.
- Display existing project BibTeX entries as readable, selectable, consistently indented text with a Copy BibTeX button, success feedback, and a manual-copy fallback. Preserve citation keys, metadata, and LaTeX escapes; do not invent missing bibliographic fields.

# Images and figures

- Size previews fluidly, preserve aspect ratios, and cap standalone logos so they do not fill phone screens. Keep home-page thumbnails flush inside rounded corners, without added inner padding or a white mat; align hover overlays with the base image.
- Supply intrinsic image dimensions, responsive source variants, and lazy loading for images below the fold. Preserve animations.
- Keep original full-resolution figures available through the shared image viewer. It must support keyboard opening, original-size viewing, Escape to close, and focus restoration.
- Preserve scientific figure colors and labels. Use a white paper surface with theme-aware framing instead of inverting or recoloring plots for dark mode.

# Blog

- Keep the Blog as a separate page under `blog/`, reached below a divider in the shared sidebar. Home-section shortcuts remain grouped above that divider.
- Preserve the posts’ original Courier New / monospace font and desktop layout: short topic headings on the left, main text in the center, and supplementary explanations on the right. Stack these sensibly on phones.
- Use article titles and tags without course-week labels or describing the posts as notes. Preserve all existing scientific text, formulas, and illustrations when migrating articles.
- Keep the unfinished Dichotomy draft out of the blog until the user supplies or approves finished content. Retain its source files.
- Preserve old article addresses with redirects when moving posts. Keep blog tag filtering, shared themes, and navigation accessible.

- Keep blog figures flush with their rounded frame: do not add white padding around previews or within the enlarged image viewport. Preserve whitespace that belongs to the original scientific image.

# Resources

- Keep plain, categorized external resource links on `resources/index.html`, using the blog’s Courier New / monospace font and shared light/dark themes.
- Link Resources beside Blog below the sidebar divider on every main page. Home contains only About, Research, and Demos; do not reintroduce Learning or Miscellaneous sections or their obsolete sidebar shortcuts.
- Group links into Books, Tutorials and study material, and Summer schools. Keep the removed Deep Learning Reading Group off this list.

- Keep Minimal RL in Resources under Tutorials and study material, marked WIP. Do not restore its home-page card or home-section sidebar shortcut.

- Do not reintroduce the removed “Powered by” template-credit footer on any page.

- Keep the personal email link off the home page. Use an X icon and label for the X profile instead of the old Twitter bird.

- Show the three Medium articles as blog cards with their original publication dates, topic tags, and a Medium label. Card titles link to Medium; do not create local copies of those articles.
