# Havanna Directive

Official studio website for [havannadirective.com](https://havannadirective.com), designed as a dependency-free static site for GitHub Pages.

## Local preview

From the repository root:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publishing

In the GitHub repository settings, select **Pages → Deploy from a branch**, then choose `main` and `/ (root)`. The included `CNAME` configures the custom domain.
