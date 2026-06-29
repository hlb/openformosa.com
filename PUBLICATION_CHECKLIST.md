# OpenFormosa Publication Checklist

Use this before announcing the public site.

- Set the production URL in `_config.production.yml` (the example targets `https://openformosa.com`).
- Clean and build with `bundle exec jekyll clean` then `bundle exec jekyll build --config _config.yml,_config.production.yml` (export a UTF-8 locale first: `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`).
- Validate with `node scripts/validate-public-build.mjs _site --require-absolute --expected-base="https://openformosa.com"`.
- Confirm `sitemap.xml`, `robots.txt`, `feed.xml`, canonical URLs, and OpenGraph image URLs are absolute in the production build.
- In GitHub Pages settings, select GitHub Actions as the deployment source.
- If using the included workflow, set the `SITE_URL` repository variable to `https://openformosa.com`. For a root custom domain, leave `SITE_BASEURL` unset (GitHub rejects an empty variable value, so the workflow defaults `baseurl` to `""`).
- Click through homepage, models, evaluation, training, blog, roadmap, and forms pages.
- Test mobile, tablet, and desktop widths for overflow.
- Confirm no raw sensitive data, personal data, private files, enterprise data, or dataset-submission paths are linked from public pages.
