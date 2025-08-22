# vibedealer

A single-page React app that deals a random vibe from the curated image collection in `img/`. The site is static so it can be hosted easily on [GitHub Pages](https://pages.github.com/).

## Local development

The app fetches local files, so the browser must load it over HTTP.
Opening `index.html` directly from the filesystem triggers CORS errors.
Scripts are authored in JSX and modern JavaScript; `index.html` loads Babel with the `env` and `react` presets so they compile in the browser.
Tailwind CSS is pulled from its CDN to style the page without a build step.
Image tiles span two columns while word tiles take one and the header tile is 1×1, producing a tightly packed grid with three rows and four columns on larger screens and four rows by two columns on small screens.
Each moodboard always shows at least one image and one word from both the selected aesthetic and place so every vibe is represented.
Start the included static server:

```bash
npm start
```

This launches at [http://localhost:3000](http://localhost:3000).
You can use any other static server if you prefer, for example:

```bash
python -m http.server 8000
```

and visit [http://localhost:8000](http://localhost:8000) in your browser.

## Updating images

Images are listed in `images.json`. After adding or removing images in the `img/` directory, regenerate the manifest:

```bash
node generate-manifest.js
```

## Deployment

1. Commit and push changes to the `main` branch.
2. In your repository settings on GitHub, enable **Pages** with the `main` branch and root (`/`) directory.
3. Your site will be available at `https://<username>.github.io/<repository>/`.
