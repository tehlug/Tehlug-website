# تهران‌لاگ — Tehran LUG website

Static site for **Tehran LUG (تهران‌لاگ)**, the Tehran GNU/Linux & free-software community.

Built with [Hugo](https://gohugo.io/) (Persian, RTL).

## Quick start

Needs Hugo Extended (~0.120+).

```bash
hugo server          # http://localhost:1313/
hugo --minify        # builds into public/
```

Optional archive refresh:

```bash
python3 scripts/import_published_content.py
```

## Layout

| Path | Purpose |
|------|---------|
| `content/` | Events, news, pages, topics |
| `data/topics.yaml` | Topics list |
| `layouts/` | Templates |
| `static/assets/` | CSS, JS, fonts, images |
| `scripts/` | Import utilities |

## Maintainers

| | GitHub |
|--|--------|
| Maede | [@maede-ps](https://github.com/maede-ps) |
| Shirin Manzari | [@shirin-manzari](https://github.com/shirin-manzari) |

## Contributing

1. Branch from `main`
2. Run `hugo server` and check desktop + mobile
3. Keep PRs focused
4. Use clear commit messages (see below)

### Commit messages

```text
<type>: <short summary>
```

Types: `feat` · `fix` · `content` · `style` · `refactor` · `chore` · `docs` · `a11y` · `perf`

Examples:

```text
feat: feature the latest event on the homepage dynamically
fix: keep footer at bottom of short pages
content: normalize event front matter for sessions 270–280
docs: clarify local Hugo setup
```

Avoid vague subjects like `update` or mixed unrelated changes in one PR.

## Good first improvements

1. **Clean scraped event fields** — fix messy `time` / `location` in older events  
   `content: normalize event front matter for sessions X–Y`

2. **Expand stub pages** — real content for FAQ, contribute, calendar  
   `content: expand FAQ with community onboarding answers`

3. **Dynamic homepage event** — stop hardcoding session ۲۸۰  
   `feat: feature the latest event on the homepage dynamically`

4. **Event-page lightbox** — reuse gallery slider on event detail galleries  
   `feat: reuse gallery lightbox on event detail pages`

5. **Speakers pagination** — replace manual `speakers-2.md`… pages with a maintainable approach  
   `refactor: replace manual speakers pages with paginated section`

6. **SEO meta** — Open Graph + fix placeholder site title in `hugo.yaml`  
   `feat: add Open Graph tags and fix site title`

7. **CI build check** — run `hugo --minify` on PRs  
   `chore: add Hugo build workflow for pull requests`

8. **Topics → local events** — link topics to local event pages where possible  
   `feat: link topic tags to matching local event pages`

Keep the current grayscale RTL look unless a PR is explicitly a redesign.

Thanks for contributing to تهران‌لاگ.
