# Michael Klug — Homepage

A hand-built, dependency-free static homepage for Michael Klug: Senior Platform Architect at
FULLSTACKS, Kubestronaut, guest lecturer at FH Joanneum and organizer of Cloud Native Carinthia.

The design is a "control plane" theme: dark by default with a light theme toggle, a git-log
career timeline, a CI-pipeline approach section and an interactive terminal (type `help`).
The site is bilingual: English at `/` and German at `/de/`, linked with `hreflang`.

## Preview locally

From this directory, run:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173` (English) or `http://localhost:4173/de/` (German).

## Project structure

- `index.html` — English page content, metadata and structured data
- `de/index.html` — German version with the same markup, section IDs and structured data
- `impressum.html` — legal disclosure and privacy note for the personal employee portfolio (German)
- `404.html` — GitHub Pages "not found" page
- `styles.css` — design tokens (dark and light), layout, components and motion
- `script.js` — theme toggle, navigation, scroll reveal, copy button and the terminal; strings
  switch between English and German based on `<html lang>`
- `assets/` — portrait (JPG and WebP), favicon, touch icon and social sharing cards (English and
  German)
- `assets/fonts/` — self-hosted Bricolage Grotesque, Geist and Geist Mono (SIL OFL 1.1)
- `robots.txt` and `sitemap.xml` — crawler and indexing metadata

## Editing content

Both language versions are plain HTML. When you change content, update `index.html` and
`de/index.html` together, and keep the talk list in `script.js` (the terminal's `talks` command) in
step with the Talks section. Bump `dateModified` in the structured data and `lastmod` in
`sitemap.xml` when the content changes.

## Privacy

Fonts and every other asset are served from this repository. The site sets no cookies, loads
no third-party scripts or fonts, and has no analytics. The only browser storage used is
`localStorage` for the chosen color theme.

## Deployment

The project has no build step and is published through GitHub Pages. `404.html` uses absolute
`/mklug-homepage/` paths, so update them if the site moves to a custom domain.

The current legal disclosure is written for a personal employee portfolio. Reassess it before
adding commercial services, analytics, forms, tracking, or a different operating entity.
