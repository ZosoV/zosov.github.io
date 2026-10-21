# Oscar Guarnizo — personal website

A fresh portfolio for Oscar Guarnizo, using the Midnight mint palette.

This repository starts independently of the old website's template history. Personal content has been migrated from the local backup, with collaborators credited and unrelated template projects excluded.

## Direction

- One continuous homepage with the full About section, individual research and software entries, learning notes, and contact information.
- Responsive layouts, readable text, keyboard navigation, and reduced-motion support.
- Static HTML output suitable for GitHub Pages.
- Browser checks with Playwright and accessibility checks with axe.

See [the content audit](docs/content-audit.md) for the migration decisions.

## Run locally

```sh
npm ci
npx playwright install chromium
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/`. Run `npm test` to rebuild and test the homepage sequence, project navigation, mobile layout, internal links, and accessibility on all pages.

The source for project metadata lives in `src/data.mjs`. Page layouts and rendering are in `scripts/build.mjs`; styling lives in `src/styles.css`. The generated `dist/` directory is GitHub Pages ready and is intentionally not tracked.

The seven long project articles and four local notes are in `src/content/`. Their images, figures, videos, and linked documents are in `assets/archive/`. The one-time `scripts/migrate_content.py` script records how those files were selected from the backup; it requires Python and Pillow if run again. The old backup is not required to build or test the site.

The repository is private for review. Publishing with GitHub Pages is a separate step.
