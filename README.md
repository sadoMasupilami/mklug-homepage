# Michael Klug — Homepage

A hand-built, dependency-free static homepage for Michael Klug: Senior Platform Architect at
FullStackS, Kubestronaut, guest lecturer at FH Joanneum and organizer of Cloud Native Carinthia.

The design is a "control plane" theme: dark by default with a light theme toggle, a git-log
career timeline, a CI-pipeline approach section and an interactive terminal (type `help`).

## Preview locally

From this directory, run:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Project structure

- `index.html` — page content, metadata and structured data
- `impressum.html` — legal disclosure for the personal employee portfolio (German)
- `404.html` — GitHub Pages "not found" page
- `styles.css` — design tokens (dark and light), layout, components and motion
- `script.js` — theme toggle, navigation, scroll reveal, copy button and the terminal
- `assets/` — portrait (JPG and WebP), favicon, touch icon and social sharing card
- `assets/fonts/` — self-hosted Bricolage Grotesque, Geist and Geist Mono (SIL OFL 1.1)
- `robots.txt` and `sitemap.xml` — crawler and indexing metadata

## Privacy

Fonts and every other asset are served from this repository. The site sets no cookies, loads
no third-party scripts or fonts, and has no analytics. The only browser storage used is
`localStorage` for the chosen color theme.

## Deployment

The project has no build step and is published through GitHub Pages. `404.html` uses absolute
`/mklug-homepage/` paths, so update them if the site moves to a custom domain.

The current legal disclosure is written for a personal employee portfolio. Reassess it before
adding commercial services, analytics, forms, tracking, or a different operating entity.
