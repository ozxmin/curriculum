# curriculum

Extended resume — a hand-written static site, no build step.
Live at **https://career.ozmin.me** (deployed on Netlify, domain via Hover).

## Run locally

Double-click **`serve.command`** in Finder, or from a terminal:

```sh
./serve.command          # or: python3 -m http.server 8000
# → http://localhost:8000
```

Asset paths are root-absolute, so the site needs to be *served* — opening `index.html`
straight from Finder resolves `/css/styles.css` to `file:///css/styles.css` and you get an
unstyled page. `serve.command` exists so the local preview is still one double-click.

Note that `404.html` is only wired up by Netlify; `python3 -m http.server` returns its own
bare 404, so the not-found page can't be previewed locally.

No dependencies, no bundler. Deploying is just publishing the repo root.

## Layout

```
index.html          The resume itself
how-i-work.html     Case study: architectural guardrails for agentic coding
projects.html       Work built outside employment
404.html            Not-found page (Netlify serves a root 404.html automatically)
css/styles.css      All styling for every page
js/script.js        Disclosure widgets: the skill-tag evidence popover,
                    hash-opened panels, and the diagram lightbox
img/                Icons and the social-preview image
```

## Progressive disclosure

The resume is layered rather than flat, because a website can hold far more than a
one-page PDF without making the reader wade through it:

| Layer | Mechanism | Holds |
| --- | --- | --- |
| L0 | Static markup | The 20-second scan: hero, migration ledger rows, role headline + scope |
| L1 | Native `<details>`/`<summary>` | Evidence: per-role bullets, migration detail, engagement terms |
| L2 | A separate page | Full case studies (`how-i-work.html`, `projects.html`) |
| L∞ | `.tag[data-ev]` popover | One line answering "where did you use this?" |

**The rule that keeps it honest: disclosure adds evidence, it never carries a claim.**
Anything load-bearing has to survive with every panel closed. If a fact only exists
inside a `<details>`, a recruiter who expands nothing will never see it — which is most
of them.

L1 uses native `<details>` rather than a JS widget: keyboard support, screen-reader state,
and find-in-page all come for free. The `.tag[data-ev]` popover is kept for micro-content
only — it is 20rem wide and cannot hold a paragraph.

One behaviour is wired in `js/script.js` and is easy to break by accident:

- **The hash opens a panel.** `/#job-chop` or `/#mig-agentic` expands that panel instead of
  scrolling to a collapsed heading, so one claim can be linked directly from an email or an
  application. Role `<div class="job">` blocks need their `id` for this, `.job:target`
  gives the highlight, and `scroll-margin-top` on `.job`/`.mig` keeps the target clear of
  the sticky nav — without it the anchor jump lands the heading underneath it.

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

All asset references are **root-absolute** (`/css/styles.css`, not `./styles.css`), on every
page, with no exceptions. This is load-bearing rather than stylistic:

- **Netlify serves each page at three URLs.** `projects.html` answers at `/projects.html`,
  `/projects`, *and* `/projects/`. Relative paths resolve against the URL's directory, so on
  that last one `./css/styles.css` becomes `/projects/css/styles.css` and 404s — a page that
  still returns 200, just with no CSS and no JS. Absolute paths resolve identically at all
  three. Every page you add would otherwise need its own redirect rule to paper over this.
- **`404.html` is served at arbitrary unmatched URLs.** At `/foo/bar/baz` a relative path
  would look for `/foo/bar/css/styles.css`. Absolute is the only thing that works here.
- **Icon paths inside `site.webmanifest`** resolve relative to *the manifest's* URL, not the
  page's. They are absolute too, which sidesteps that trap entirely.

The cost is that you can't preview by double-clicking `index.html` — see *Run locally* above.

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
`index.html`, `how-i-work.html`, `projects.html`, and `404.html`:

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

- **There is no print stylesheet.** `@media print` and the `beforeprint`/`afterprint` hook
  were removed deliberately. `Cmd+P` now falls back to browser defaults, which means a
  collapsed `<details>` is silently absent from the PDF and a dark-mode reader may get the
  dark palette on paper. If saving to PDF ever needs to be supported again, both pieces
  have to come back together — the stylesheet alone would print collapsed panels.
- **Absolute URLs in metadata.** `og:image` and `canonical` are absolute and hardcoded to
  `https://career.ozmin.me`. If the domain ever changes, they need updating in every HTML
  file, plus `sitemap.xml` and `robots.txt`.
- **`_headers` is Netlify-specific.** It carries the CSP and the other security headers,
  the `application/manifest+json` content type for `site.webmanifest` (Netlify defaults the
  unknown `.webmanifest` extension to `application/octet-stream`), and the asset cache
  policy. If the site ever moves off Netlify, all of it needs re-doing in whatever the new
  host uses. **The CSP names `cloud.umami.is` explicitly** — if the analytics provider or
  its event endpoint ever changes, the policy has to change with it or events fail silently.
