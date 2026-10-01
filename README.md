# Michael Klug — Less friction. More flow.

A personal portfolio for Michael Klug, Senior Platform Architect and Kubestronaut. Completely rebuilt on `sol-6.1` with a warm editorial design, orange accents, custom line illustrations, and a practical story about platform engineering.

## Run locally

No package installation or build is required:

```sh
python3 -m http.server 4173
```

Open <http://localhost:4173>. All assets, including the Manrope variable font, are served locally. The static files work on GitHub Pages under the repository subpath.

## Contents

- `index.html`: expertise, an interactive build/ship/understand journey, career history, certifications, teaching, community, selected talks, and contact.
- `impressum.html`: the existing German legal disclosure, with the new design.
- `styles.css`: responsive layouts, shared design tokens, and reduced-motion support.
- `script.js`: mobile navigation, accessible stage selection, progressive clipboard support, and footer year.
- `assets/`: the original portrait, new favicon and sharing artwork, and the locally hosted font with its SIL Open Font License.
- `robots.txt` and `sitemap.xml`: discovery and canonical URLs.

Career, education, speaking details, and credential URLs come from the original repository content. The rewrite adds no invented clients, projects, testimonials, or performance claims. The portrait is the original repository asset.

## Accessibility and behavior

Semantic sections, a skip link, visible keyboard focus, native disclosure controls, explicit navigation state, and live status messages support keyboard and assistive-technology use. Mobile navigation closes on Escape, outside interaction, destination selection, or a breakpoint change. Stage selection works with native buttons. Main content, navigation, career history, and certifications remain usable without JavaScript. The copy button appears only when the browser provides clipboard access, and reports failed copy attempts honestly.

No analytics, tracking, cookies, contact form, or third-party runtime dependency is included.

## Deployment

The site uses GitHub Pages with no build step. The `sol-6.1` branch contains the redesign; publishing is controlled by the repository’s Pages configuration. The current legal text describes a personal employee portfolio. Review it if the operating model changes.

## Validation of this redesign

Verified locally in Chrome on 2026-10-01:

- Twelve viewport widths from 320 to 1920 pixels, with no horizontal page overflow.
- Keyboard stage selection; career and certification disclosures; mobile navigation dismissal, focus, and resizing; clipboard success and permission rejection; reduced motion; and JavaScript-disabled navigation and content.
- Automated axe checks on desktop, mobile, open navigation, expanded disclosures, and both legal-page layouts, with zero findings for the selected WCAG A/AA and best-practice rules.
- Internal links, fragment targets, assets, alternative text, structured data, sitemap, and sharing artwork. No browser errors, failed asset requests, or third-party runtime requests were observed.
