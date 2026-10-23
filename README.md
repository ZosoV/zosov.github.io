# Oscar Guarnizo — personal website

Static personal website with research projects, demos, blog posts, and learning resources.

## Preview locally

Run from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://localhost:8765/.

## GitHub Pages

Publish the `main` branch from the repository root (`/`). No build step is required; `.nojekyll` keeps GitHub Pages from processing the HTML with Jekyll.

The public site address is https://zosov.github.io/ once Pages is enabled.

## Source layout

- `index.html`: profile, research, and demos.
- `portfolio/`: individual project pages.
- `blog/`: published articles.
- `resources/`: categorized external links.
- `assets/`: shared styles, scripts, fonts, and media.
- `notes/`: legacy redirects and retained drafts.

## Acknowledgments

The original academic website layout was adapted from [Jon Barron’s website](https://jonbarron.info/) and [Michaël Gharbi’s project-page template](http://mgharbi.com/).
