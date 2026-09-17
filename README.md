# AQUA

Visual study of AQUA — a modular social platform.

**Mantra:** Aqua stores relationships, not possessions.

This repo is the Grok preview: feed chrome, nazar brand, books (native blocks + imported EPUB via epub.js), wiki, marketplace sketches.

The product itself is intended as a **fork of** [bluesky-social/social-app](https://github.com/bluesky-social/social-app), not a rewrite of this React tree. See `artifacts/AQUA-BLUESKY-FORK-GUIDE.md`.

## Run locally

```bash
npm install
npm run dev
```

Tab bar: Home · Search · + · Chat · Profile. Books live in the left drawer / pills, not in the tab bar.

## Stack

TanStack Start, Tailwind, Zustand (local persist). No accounts. Catalog is seeded in `src/lib/aqua/catalog.ts`.

## License

Original AQUA code in this study: use as you like for the product.
Do **not** copy Bluesky `assets/icons/` or `assets/illustrations/` into a public fork — those are not MIT. Read Bluesky `ASSETS.md` when you fork `social-app`.
