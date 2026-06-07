# submission-any.github.io

Project page for **ContactMimic: Humanoid Object Interaction via Contact Control**.

Paper under double-blind review at CoRL 2026.
This repository and page intentionally omit author and institutional information.

## Structure

```
index.html                     main page
static/css/style.css           styling
static/js/main.js              gallery rendering, lazy video autoplay, lightbox, copy
static/js/real_manifest.js     auto-generated manifest of the 70 real-world clips
static/images/                 teaser, pipeline, controllability, ablation, box, posters
static/videos/main_video.mp4   compressed overview/supplementary video (H.264)
static/videos/real/<task>/<condition>/<take>.mp4   real-world clips (+ .jpg posters)
static/pdf/appendix.pdf        supplementary appendix
```

The 70 real-world clips are organized by task and contact condition
(`contact ✔` / `contact ✘`, and `near` / `far` keypoints for the lean motions),
5 trials each. Every video is web-friendly H.264 (the source `.mov` files were
HEVC 10-bit HDR and were transcoded to 8-bit SDR with proper tone-mapping;
this also stripped the original device/GPS metadata).

## Local preview

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- `.nojekyll` disables Jekyll so all assets are served as-is.
- Total repo is ~72 MB; the largest single file is ~24 MB — within GitHub Pages limits.
- Before publishing for review, sanity-check that the teaser, appendix, and video
  footage do not contain visually identifying content (logos, faces, lab signage).
