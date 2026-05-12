# Sharvari Mhatre — Portfolio

Personal portfolio site. React + Vite, no UI framework — single-component with inline styles and CSS-in-JS for the comic-pop aesthetic.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # preview the build
```

## Add your assets

Drop these two files in `public/`:

- `profile.jpg` — headshot (portrait crop works best)
- `resume.pdf` — resume PDF

If `profile.jpg` is missing the hero falls back gracefully to an emoji + a hint.

## Edit the content

All copy lives at the top of [`src/Portfolio.jsx`](src/Portfolio.jsx):

- `projects` — case-file cards
- `skillCategories` — skill chips
- `experience` — work history
- `education` — schools
- `stats` — by-the-numbers strip
- `CERTS`, `TYPING_PHRASES` — hero badges and rotating tagline

The `education` array has a `// TODO` next to the undergrad entry — edit the school and dates to match your record.

## Notes

- Honours `prefers-color-scheme` on first paint, then the toggle takes over.
- Honours `prefers-reduced-motion` (animations disabled).
- AudioContext sound effects fail silently on unsupported browsers.
- The project modal closes on ESC, on backdrop click, and on the × button.
