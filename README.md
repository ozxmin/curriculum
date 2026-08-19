# curriculum

Extended resume — a hand-written static site, no build step.
Live at **https://career.ozmin.me** (deployed on Netlify, domain via Hover).

## Run locally

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

That's it. No dependencies, no bundler. Deploying is just publishing the repo root.

## Layout

```
index.html          The resume itself
my-stack.html       Tools and gear
404.html            Not-found page (Netlify serves a root 404.html automatically)
css/styles.css      All styling for every page, including the print stylesheet
js/script.js        The inline disclosure/popover widget on my-stack.html
img/                Icons and the social-preview image
```

### Why some files are still at root

Not leftover clutter — each of these breaks if moved:

| File | Reason |
| --- | --- |
| `robots.txt` | The spec requires it at the origin root |
| `sitemap.xml` | Root scope is what lets it cover the whole site in Search Console |
| `favicon.ico` | Browsers implicitly request `/favicon.ico` when no `<link>` matches; moving it loses that fallback |
| `_headers` | Netlify only reads it at the publish root |
| `404.html` | Same — Netlify only picks it up at the publish root |
| `site.webmanifest` | Site-level metadata rather than an asset, so it sits with `robots.txt` and `sitemap.xml` |

All asset references are **root-absolute** (`/css/styles.css`, not `styles.css`). One caveat worth knowing: icon paths inside `site.webmanifest` resolve relative to *the manifest's* URL, not the page's — keeping them absolute avoids that trap entirely.

### Generated assets

`img/favicon.ico`-adjacent raster files — `img/apple-touch-icon.png`, `img/icon-192.png`,
`img/icon-512.png`, `img/og-image.png`, and root `favicon.ico` — are generated, not hand-drawn.
The script that produced them is in the commit history; regenerate with Pillow installed.
`img/favicon.svg` is hand-written and is the one modern browsers actually use.

The mark is a blue rounded square with a white "OV". It stays the same blue in light and
dark themes on purpose: a brand mark that changes color between themes reads as two
different sites in a tab strip.

## Duplication, on purpose

There is no build step and no templating, so three things are copy-pasted across
`index.html`, `my-stack.html`, and `404.html`:

1. The icon `<link>` block and `theme-color` meta tags (marked with a `keep in sync` comment)
2. The `<nav>` element
3. The `<footer>` element

This is a deliberate trade: zero dependencies and "open index.html and it works", paid for
with ~30 duplicated lines. **Adding a page means copying all three blocks**, plus adding a
`sitemap.xml` entry and its own `<title>`/description/canonical/OG tags. If that ever starts
to hurt, the fix is a static site generator (Eleventy is the lightest), not a clever script.

Note that the JSON-LD block on `index.html` cannot be moved into a shared file:
`<script type="application/ld+json" src="...">` is not supported — the parser only reads
inline content. It lives in `<head>` with the rest of the metadata.

## Analytics

[Umami Cloud](https://cloud.umami.is) — cookieless, no consent banner needed, free tier.
The tag is on every page including `404.html`:

```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="..."></script>
```

The website ID is a public site identifier, not a credential. It is meant to be visible in
page source and is safe to commit.

Custom events are declared inline with `data-umami-event` attributes — no JS wiring needed.
Currently tracked: the two hero CTAs, nav links, and each contact link (outbound clicks are
the real conversion signal on a resume site).

Previously this used Simple Analytics, which was replaced because it derives country from
the visitor's *timezone* rather than their IP — so city and region data is impossible on it
by design, not by configuration.

## Things worth knowing before editing

- **The print stylesheet is load-bearing.** Saving the page as a PDF is the most likely
  thing a visitor does with a resume. `@media print` in `css/styles.css` forces the light
  palette, hides the nav, and expands the popovers into static text. If you restructure the
  page, re-check `Cmd+P` in both light and dark mode.
- **Absolute URLs in metadata.** `og:image` and `canonical` are absolute and hardcoded to
  `https://career.ozmin.me`. If the domain ever changes, they need updating in every HTML
  file, plus `sitemap.xml` and `robots.txt`.
- **The "More Details" section on `my-stack.html` is commented out**, waiting on real copy.
  Uncommenting it is all that's needed — `js/script.js` requires no changes.
- **`_headers` is Netlify-specific.** It exists only to serve `site.webmanifest` as
  `application/manifest+json`; Netlify defaults the unknown `.webmanifest` extension to
  `application/octet-stream`. If the site ever moves off Netlify, this needs re-doing in
  whatever the new host uses.
