# تهران‌لاگ — وب‌سایت جامعه کاربران گنو/لینوکس تهران

Official static website for **Tehran LUG (تهران‌لاگ)**: an independent community around GNU/Linux and free/open-source software in Tehran.

This repository is a [Hugo](https://gohugo.io/) site (RTL, Persian). Content is mostly Markdown; layouts are HTML templates; styles and behavior live under `static/assets/`.

---

## Quick start

### Requirements

- [Hugo Extended](https://gohugo.io/installation/) **0.120+** (site was built with ~0.154)
- Optional: Python **3.10+** (only for the archive import script)

### Run locally

```bash
git clone <this-repo-url>
cd tehlug-website
hugo server
```

Open the URL Hugo prints (usually `http://localhost:1313/`).

### Production build

```bash
hugo --minify
```

Output goes to `public/` (gitignored).

---

## Project structure

```text
content/
  events/          # Event pages (جلسات و دورهمی‌ها)
  news/            # News posts
  pages/           # Static pages (about, gallery, speakers, FAQ, …)
  topics/          # Topics section
data/
  topics.yaml      # Topic list used by the topics page
layouts/           # Hugo templates
static/assets/     # CSS, JS, fonts, icons, images
scripts/           # Maintenance utilities (content import)
```

Useful paths:

| Area | Path |
|------|------|
| Global CSS | `static/assets/css/main.css` |
| Site JS | `static/assets/js/main.js` |
| Shared chrome | `layouts/partials/header.html`, `footer.html` |
| Homepage | `layouts/index.html` |
| Gallery / speakers logic | `layouts/_default/single.html` |
| Import tool | `scripts/import_published_content.py` |

---

## Content notes

- Site language is **Persian (`fa`)** with `relativeURLs: true` in `hugo.yaml`.
- Prefer **Persian digits** in user-facing UI (see `layouts/partials/fa-digits.html` and digit conversion in `main.js`).
- Events are sorted by `weight` / `date` front matter so the latest session (e.g. ۲۸۰) appears first.
- Gallery images are stored locally under `static/assets/images/archive/` so pages do not hotlink the old site.

Re-import / refresh archive samples (optional):

```bash
python3 scripts/import_published_content.py
```

---

## Contributing

Contributions are welcome — large or small. You do **not** need to be a Hugo expert.

### Good first workflow

1. Fork the repo and create a branch from `main`
2. Run `hugo server` and verify your change locally
3. Keep diffs focused (one concern per PR)
4. Open a pull request with a short summary + how you tested

### Commit message structure

Use short, imperative subjects (what the change *does*), optional body for *why*.

```text
<type>: <concise summary>

[optional body: motivation, trade-offs, follow-ups]
```

**Types we like:**

| Type | Use for |
|------|---------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `content` | Markdown / YAML content updates |
| `style` | CSS / visual polish (no behavior change) |
| `refactor` | Code cleanup without behavior change |
| `chore` | Tooling, ignore rules, deps, scripts |
| `docs` | README / contribution docs |
| `a11y` | Accessibility improvements |
| `perf` | Performance (images, CSS, build) |

**Examples:**

```text
feat: open event gallery images in an on-page lightbox

fix: keep footer at bottom of short pages with flex sticky layout

content: correct location text for session 279

style: stack homepage featured event poster above copy

chore: remove unused icons and orphan archive images

docs: add contributing guide and improvement ideas
```

**Please avoid:**

- Vague subjects: `update`, `fix stuff`, `wip`
- Mixing unrelated changes in one commit/PR (content + redesign + importer)
- Commit subjects longer than ~72 characters when possible

### Pull request checklist

- [ ] `hugo server` loads without template errors
- [ ] Touched pages look correct in desktop **and** mobile width
- [ ] Persian text/digits still read naturally (RTL)
- [ ] No secrets or huge unrelated binaries added
- [ ] Commit messages follow the structure above

---

## Ideas for contributors (improvements)

These are intentional, useful next steps. Pick one, open an issue or PR, and reference it.

### Content & data

1. **Harden scraped event front matter** — some older sessions have messy `time` / `location` fields from import. Clean them and keep a consistent schema.  
   Suggested commit: `content: normalize event front matter for sessions X–Y`

2. **Enrich stub pages** — `/calendar/`, `/faq/`, `/contribute/` are thin. Turn them into real, useful pages.  
   Suggested commit: `content: expand FAQ with community onboarding answers`

3. **Topics → local events** — topics currently lean on external archive links. Wire `data/topics.yaml` to local event pages where possible.  
   Suggested commit: `feat: link topic tags to matching local event pages`

### Features

4. **Dynamic homepage featured event** — homepage still hardcodes session ۲۸۰. Drive it from the latest weighted event.  
   Suggested commit: `feat: feature the latest event on the homepage dynamically`

5. **Event gallery lightbox** — gallery page has a slider; event detail galleries still open in a new tab. Reuse the same lightbox.  
   Suggested commit: `feat: reuse gallery lightbox on event detail pages`

6. **Replace manual speakers pages** — speakers pagination uses `speakers-2.md` … `speakers-8.md`. Prefer a maintainable Hugo approach (section pages or generated list).  
   Suggested commit: `refactor: replace manual speakers page files with paginated section`

7. **Real calendar view** — build a month/list calendar from event dates instead of a static page.  
   Suggested commit: `feat: render upcoming and past events on the calendar page`

8. **Site search** — lightweight client search over events/news/topics titles.  
   Suggested commit: `feat: add client-side search for events and news`

### Quality & polish

9. **SEO / social meta** — Open Graph, Twitter cards, canonical URLs, better `<title>` (config still has placeholder site title).  
   Suggested commit: `feat: add Open Graph tags and fix site title in hugo.yaml`

10. **Accessibility pass** — keyboard focus styles, contrast checks, meaningful landmarks/labels.  
    Suggested commit: `a11y: improve focus states and gallery lightbox keyboard UX`

11. **Image performance** — responsive `srcset`, modern formats, lazy-loading consistency, smaller posters.  
    Suggested commit: `perf: add responsive srcset for event posters and gallery thumbs`

12. **RSS / Atom feeds** — expose news (and optionally events) as feeds for subscribers.  
    Suggested commit: `feat: publish RSS feeds for news and events`

13. **CI checks** — GitHub Action to run `hugo --minify` on PRs and fail on build errors.  
    Suggested commit: `chore: add Hugo build workflow for pull requests`

14. **Importer robustness** — retries, clearer logs, dry-run mode, fix edge-case scrapes.  
    Suggested commit: `chore: add dry-run mode and better error reporting to importer`

### Design system

15. **Tokenize CSS** — consolidate repeated colors/spacing into clearer variables and reduce long one-line rules where readability suffers (without visual regressions).  
    Suggested commit: `refactor: organize CSS variables and section comments without UI changes`

16. **Component partials** — extract repeated cards (event tile, news card, pager) into partials for easier reuse.  
    Suggested commit: `refactor: extract event tile and news card into partials`

---

## Design constraints (please keep)

When changing UI, prefer matching the current grayscale Tehlug look:

- RTL-first layout and Persian typography (`IRANSansX`)
- No sudden theme redesigns in drive-by PRs
- Keep gallery / speakers / events behavior working after refactors
- Prefer small, reviewable PRs over large rewrites

---

## Maintainers & main contributors

This site is maintained primarily by:

| Person | GitHub |
|--------|--------|
| Maede | [@maede-ps](https://github.com/maede-ps) |
| Shirin Manzari | [@shirin-manzari](https://github.com/shirin-manzari) |

For questions about direction, reviews, or merging PRs, please ping the maintainers above.

---

## License & community

Tehran LUG is a community project. If you are unsure where to start, open an issue with the label idea you want to take, or ask on the community Telegram group linked from the site header/footer.

Thank you for helping make تهران‌لاگ better.
