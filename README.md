# OpenFormosa Website

The source for [openformosa.com](https://openformosa.com) — a Jekyll site for OpenFormosa, a Taiwan-rooted open AI initiative around model training, benchmark evaluation, a pretrain base model, ASR, TTS, OCR, and local culture.

Deployed to GitHub Pages from `main` via the [`pages.yml`](.github/workflows/pages.yml) GitHub Actions workflow.

## What is included

- Public project homepage with clear entry points for the model family, evaluation, training, and updates.
- Blog ("Log") with Jekyll posts, search, and tag filter.
- Model pages for the OpenFormosa-Base (Barbet) and ASR / TTS / OCR task branches.
- Evaluation and training pages for benchmark workflow, model recipes, release gates, and reproducibility artifacts.
- Training data sheet and model card templates.
- Bilingual UI (Traditional Chinese default, English fallback) via a lightweight `data-i18n` layer.
- GitHub issue templates for evaluation, training, reproducibility, and release work.

## Local preview

The site uses UTF-8 source files, so export a UTF-8 locale before building or a bundled theme's SCSS will error on macOS's default US-ASCII locale.

```bash
bundle install
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000/`.

For a static preview that mirrors the deployed build:

```bash
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
bundle exec jekyll clean
bundle exec jekyll build
node scripts/validate-public-build.mjs _site
python3 -m http.server 4000 --bind 127.0.0.1 --directory _site
```

## Deploy to GitHub Pages

Deployment is automatic: every push to `main` runs [`pages.yml`](.github/workflows/pages.yml), which builds with a generated production config, validates `_site`, and deploys to GitHub Pages.

The production `url` / `baseurl` come from repository **Actions variables** (Settings → Secrets and variables → Actions → Variables):

- Root custom domain (current production): set `SITE_URL` to `https://openformosa.com` and leave `SITE_BASEURL` **unset** (GitHub rejects an empty variable value, so for a root domain the variable is simply not created and the workflow defaults `baseurl` to `""`).
- GitHub project page (`https://<owner>.github.io/<repo>`): set `SITE_URL` to `https://<owner>.github.io` and `SITE_BASEURL` to `/<repo>`.

The committed [`CNAME`](CNAME) file (`openformosa.com`) is copied into `_site` on every build so the custom domain persists across deploys.

To enable it on a fresh repository:

1. Push to GitHub.
2. Go to **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. Set the `SITE_URL` repository variable as above.
4. For the custom domain, confirm DNS points at GitHub Pages and that **Settings → Pages → Custom domain** shows `openformosa.com`.

### Local production test

```bash
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
cp _config.production.example.yml _config.production.yml   # already targets openformosa.com
bundle exec jekyll clean
bundle exec jekyll build --config _config.yml,_config.production.yml
node scripts/validate-public-build.mjs _site --require-absolute --expected-base="https://openformosa.com"
```

Before announcing changes, check `sitemap.xml`, `robots.txt`, `feed.xml`, and the social preview image. See [PUBLICATION_CHECKLIST.md](PUBLICATION_CHECKLIST.md).

## Blog Markdown and LaTeX

Blog posts live in `_posts/*.md` and are rendered by Jekyll/kramdown with GitHub-flavored Markdown. Posts also load MathJax, so authors can use inline math like `$E=mc^2$` and display math blocks like:

```tex
$$
\operatorname{WER} = \frac{S + D + I}{N}
$$
```

Use fenced code blocks, tables, headings, lists, links, and ordinary Markdown normally. For bilingual post bodies, wrap each language in `<div class="post-lang-zh" markdown="1">…</div>` and `<div class="post-lang-en" markdown="1">…</div>`; the active language is toggled by the site's language switcher.

## Scope note

This site documents model training, evaluation, and release evidence. It does not collect community datasets or accept raw data uploads. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
