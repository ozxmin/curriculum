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

| File | What it is |
| --- | --- |
| `index.html` | The resume itself |
| `my-stack.html` | Tools and gear |
| `404.html` | Not-found page — Netlify serves a root `404.html` automatically |
| `styles.css` | All styling for every page, including the print stylesheet |
| `script.js` | The inline disclosure/popover widget on `my-stack.html` |

### Generated assets

`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `og-image.png`
are generated, not hand-drawn. The script that produced them lives in the commit history;
to regenerate, re-run it with Pillow installed. `favicon.svg` is hand-written and is the
one modern browsers actually use — the raster files are fallbacks.

The mark is a blue rounded square with a white "OV". It stays the same blue in light and
dark themes on purpose: a brand mark that changes color between themes reads as two
different sites in a tab strip.

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
  thing a visitor does with a resume. `@media print` in `styles.css` forces the light
  palette, hides the nav, and expands the popovers into static text. If you restructure the
  page, re-check `Cmd+P` in both light and dark mode.
- **Absolute URLs in metadata.** `og:image` and `canonical` are absolute and hardcoded to
  `https://career.ozmin.me`. If the domain ever changes, they need updating in every HTML
  file, plus `sitemap.xml` and `robots.txt`.
- **The "More Details" section on `my-stack.html` is commented out**, waiting on real copy.
  Uncommenting it is all that's needed — `script.js` requires no changes.
- **New pages need three things**: the icon `<link>` block, the metadata block, and an entry
  in `sitemap.xml`.
- **`_headers` is Netlify-specific.** It exists only to serve `site.webmanifest` as
  `application/manifest+json`; Netlify defaults the unknown `.webmanifest` extension to
  `application/octet-stream`. If the site ever moves off Netlify, this needs re-doing in
  whatever the new host uses.
