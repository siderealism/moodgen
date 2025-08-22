# vibedealer

A single-page React app that deals a random vibe from the curated image collection in `img/`. The site is static so it can be hosted easily on [GitHub Pages](https://pages.github.com/).

## Local development

No build step is required. Use any static file server or open `index.html` directly in your browser.

```bash
# from the repository root
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) in your browser.

## Updating images

Images are listed in `images.json`. After adding or removing images in the `img/` directory, regenerate the manifest:

```bash
node generate-manifest.js
```

## Deployment

1. Commit and push changes to the `main` branch.
2. In your repository settings on GitHub, enable **Pages** with the `main` branch and root (`/`) directory.
3. Your site will be available at `https://<username>.github.io/<repository>/`.
