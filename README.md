# ContactMimic.github.io

Project page for **ContactMimic: Contact Conditioning Enables Task-Contextual Humanoid Object Interaction**.

Paper under double-blind review at CoRL 2026.
This repository and page intentionally omit author and institutional information.

## Structure

```
index.html              main page
static/css/style.css    styling
static/images/          figures (placeholders included; replace with real assets)
static/videos/          videos (add .mp4 files)
```

## Local preview

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Adding media

- Drop teaser/method figures into `static/images/` and update `index.html`.
- Drop videos into `static/videos/` and update `<source>` paths.
- For anonymity, strip metadata from images and videos before committing.
