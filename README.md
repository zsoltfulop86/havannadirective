# Havanna Directive

Official studio website for [havannadirective.com](https://havannadirective.com), designed as a dependency-free static site for GitHub Pages.

The `/sszr/` page displays live worldwide SS: Zombie Rain death totals from the Cloudflare Worker API at `https://sszr-api.silverkobra.workers.dev/v1/deaths`.

## Local preview

From the repository root:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publishing

In the GitHub repository settings, select **Pages → Deploy from a branch**, then choose `main` and `/ (root)`. The included `CNAME` configures the custom domain.
