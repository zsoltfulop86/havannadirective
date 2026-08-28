# Havanna Directive

Official studio website for [havannadirective.com](https://havannadirective.com), designed as a dependency-free static site for GitHub Pages.

The `/sszr/` page displays live worldwide Skyscraper Security: Zombie Rain death totals, leaderboards, and defender achievements from the Cloudflare Worker API.

The `/legal/` and `/privacy/` pages provide the studio's English legal notice and website privacy information. Their complete Hungarian translations are under `/hu/impresszum/` and `/hu/adatvedelem/`. The more specific `/sszr/privacy/` notice covers optional game telemetry and Online Records.

## Local preview

From the repository root:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publishing

In the GitHub repository settings, select **Pages → Deploy from a branch**, then choose `main` and `/ (root)`. The included `CNAME` configures the custom domain.
