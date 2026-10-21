# Content audit

Source reviewed: `zosov.github.io_backup`, original HEAD `e0db3a1`.

## Retain

These projects explicitly name Oscar Guarnizo in the old homepage or project page:

- Bisimulation Prioritized Experience Replay (BPER), MSc thesis, 2023–2024.
- CovarianceNet / covariance tensor decomposition, IEEE Access, 2021.
- StyleGAN embedding reproductions and experiments, 2021.
- Ant Colony Optimization path planning, LA-CCI, 2019.
- Successive Adaptive Linear Neural Modeling, ETCM, 2018.
- Pretrained RL-Hangman, February 2025.
- Hangman BERT, May 2024.
- Minimal RL implementations.
- Automatic License Plate Recognition, Mobia Latam, 2022.
- Grape segmentation and counting, Digevo, 2021.
- Ride to the Heaven, GMTK Game Jam, 2020.

Retain Oscar's University of Birmingham semester notes, authored machine learning notes, Pandas notebooks, and Birmingham reading-group link. Authorship of the local notes is also supported by Git history under Oscar Guarnizo, ZosoV, and ZosoEU.

Retain the supplied education, scholarship, research internship, past employment, personal profile links, portrait, and CV. Do not present the old job-search status as current; the source does not establish a current employer or availability.

Retain collaborators and their names. Work undertaken with collaborators remains part of Oscar's portfolio; their contributions must not be erased.

## Exclude from the new site

- `mipnerf/` and `mipnerf360/`: inherited Jonathan T. Barron project sites; Oscar is absent from their author lists.
- `notes/note_template/` and `notes/dynamic_system_test/`: templates and unfinished editor experiments, not finished personal notes.
- Generic external reading groups, book recommendations, copied template README, commented-out examples, and unreferenced template assets.
- Broken placeholder links such as `href="#"` for theses or posters. Use the real personal document where it exists.

## Migration approach

Write a new implementation and design rather than copying the old template's markup or scripts. Bring over only content and media used by the retained personal pages. Preserve technical descriptions, collaborators, publication links, personal documents, and substantive learning notes. Keep the original backup untouched.

## Palette

Midnight mint: page `#17212B`, surface `#233140`, text `#E6EDF3`, links `#7DD3FC`, mint `#6EE7B7`, secondary text `#A8BACB`, border `#40566B`, secondary accent `#D8B4FE`.

## Verification

Use Chromium through Playwright for desktop and mobile interaction, navigation, local-resource checks, screenshots, and JavaScript errors. Use axe for automated WCAG A/AA checks. Automated accessibility checks supplement keyboard and visual inspection; they do not establish complete accessibility conformance.
