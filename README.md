# GOED: Utah Startup Ecosystem Swarm

An interactive way to explore Utah's startup ecosystem, built for the Governor's Office of Economic Development (GOED) bounty at AI Builder Day 2026.

![GOED landing view: See the Swarm of Activity in the Utah Startup Ecosystem](assets/goed-swarm-landing.png)

## Why a swarm?

A geographic map answers *where* companies are. This project instead begins with a living, interactive mind map: companies move as a swarm, revealing the density and energy of Utah's startup ecosystem before users drill into location, sector, headcount, or stage.

The visualization uses a GPU-powered boids simulation in Three.js. Each boid follows the classic flocking forces—separation, alignment, and cohesion—while additional forces let the swarm settle into meaningful groups, respond to cursor movement, avoid labels, and transition into a geographic Utah view. Company records become interactive hexagonal nodes, while the remaining boids trace the Utah outline.

## Explore

- **Swarm view:** an ambient entry point into the ecosystem.
- **Map view:** companies settle into their approximate Utah locations.
- **Filters:** regroup companies by location, sector, headcount, or funding stage.
- **Company cards:** open a company node for its profile and external links.

GOED made a bounty for AI Builder Day where we had to create a map of Utah companies.

## Run locally

This is a static site. Serve the repository directory with any local web server:

```bash
python3 -m http.server 3001
```

Then open `http://localhost:3001`.

## Built with

Three.js · GPUComputationRenderer · GLSL · Supabase · EmailJS
