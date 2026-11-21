# Havanna Directive

Official studio website for [havannadirective.com](https://havannadirective.com), designed as a dependency-free static site for GitHub Pages.

The `/sszr/` page links to Steam and explains where players can find Skyscraper Security: Zombie Rain rankings and achievements. It makes no requests to the legacy records API.

The `/legal/` and `/privacy/` pages provide the studio's English legal notice and website privacy information. Their complete Hungarian translations are under `/hu/impresszum/` and `/hu/adatvedelem/`. The more specific `/sszr/privacy/` notice covers Steam features, local saves, and legacy records from earlier builds.

## Local preview

From the repository root:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publishing

In the GitHub repository settings, select **Pages → Deploy from a branch**, then choose `main` and `/ (root)`. The included `CNAME` configures the custom domain.
