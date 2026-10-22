# Utah Startup Map

An interactive, static explorer for Utah's startup ecosystem. Companies appear as a GPU-powered swarm that can be explored by location, sector, headcount, and funding stage.

## Explore

- **Swarm view:** an animated overview of Utah's startup ecosystem.
- **Map view:** companies settle into their approximate Utah locations.
- **Filters:** regroup companies by location, sector, headcount, or stage.
- **Company cards:** open a company node for its profile and links.

## Company data

The app loads its 222 company records from [data/companies.json](data/companies.json). The file is a static snapshot exported from the project database. GitHub Pages serves it with the app; visitors can browse and filter records, while updates are made by editing the JSON file in GitHub.

## Run locally

Serve the repository directory with any local web server:

```bash
python3 -m http.server 3001
```

Then open `http://localhost:3001`.

## Deploy

The `.github/workflows/pages.yml` workflow publishes the static site to GitHub Pages when changes reach `main`. In the repository's **Settings → Pages**, set the source to **GitHub Actions**.

## Built with

Three.js · GPUComputationRenderer · GLSL · GitHub Pages
