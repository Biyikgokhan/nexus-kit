# Nexus Kit — build your own 3D place, publish it on your own domain, appear on the Nexus atlas

Nexus Kit is the open-source toolkit behind [gokhanbiyik.com](https://gokhanbiyik.com/) (KG Atelier) and [fudo.tattoo](https://fudo.tattoo/): small, walkable web places built from photographs and a napkin sketch, hosted by their owners, linked to each other through doors, and listed on one shared atlas. There is no central server, no account and no token: your place is a folder on your own HTTPS domain, and the atlas only reads one public file from it, `/.well-known/nexus.json`.

The Turkish documents in `docs/00…07` are the source of truth; this page is the English overview and quick start.

## Two ways in

| | Easy path (browser wizard) | Modeler path (CLI + Blender) |
| --- | --- | --- |
| For | anyone; no installation | people who model or code |
| Where | [gokhanbiyik.com/nexus/#kur](https://gokhanbiyik.com/nexus/#kur) | this repository, `node bin/nexus-kit.mjs` |
| Input | name, story, up to 3 photos, a sketch, objects placed on a grid | `place.json`, `reference/sketch.jpg`, `reference/photos/`, optional `.blend` |
| Output | a ZIP: `index.html`, the engine, fonts, `nexus.json` + `.well-known/nexus.json`, licences, `KAYIT.md` (registration text) | a project folder with the same manifest, a Blender-built GLB, a navigation draft, an honest report |
| AI help | optional: your own Claude key (session only) or a local Ollama | optional: the same providers, or Claude Code with the bundled skills |

Both paths end the same way: you upload the folder to your domain (Vercel, Netlify, Cloudflare Pages, GitHub Pages or any host), the wizard or `publish` checks that `/.well-known/nexus.json` is reachable, and you open a registration issue on [nexus-registry](https://github.com/Biyikgokhan/nexus-registry). Once merged, the atlas reads your manifest; to change your place later you only edit your own file.

## Quick start (modeler path)

Requirements: Node 22.12+, optionally Blender 4.5 for the GLB build. Nothing is installed by the kit; `doctor` only looks.

```bash
git clone https://github.com/Biyikgokhan/nexus-kit
cd nexus-kit && npm test                       # 7 test files, no dependencies
node bin/nexus-kit.mjs doctor                  # what is present, what is missing
node bin/nexus-kit.mjs init my-place --yes     # place.json, README, harness/, tools/build_place.py, public/.well-known
cd my-place
node ../bin/nexus-kit.mjs sketch --show        # ASCII plan of the room
node ../bin/nexus-kit.mjs sketch --grid=reference/plan.txt --yes   # offline: letters on a grid become objects
node ../bin/nexus-kit.mjs manifest             # place.json → public/nexus.json + public/.well-known/nexus.json
node ../bin/nexus-kit.mjs check                # schema, .well-known, https, secrets, forbidden assets, budgets → green / yellow / red
node ../bin/nexus-kit.mjs blender              # Blender 4.5 in the background: shell + objects → GLB + report
node ../bin/nexus-kit.mjs publish              # shows the deploy command for your host (never runs it), writes KAYIT.md
```

`sketch` takes a plan three ways: `--show` prints the current plan; `--grid=reference/plan.txt` reads a text grid you type (`T` table, `S` seat, `P` plant, `F` frame, `O` portal, anything else is floor; the grid is stretched to the room size); `--ai` sends the sketch, the photos and your answers (`--long=6.8 --door=south --notes="…"`) to the provider in `.env.local` and prints the proposal. Nothing is written without `--yes`, and `place.json` is backed up under `.runtime/backup/` first. Every run also writes `reference/navigation-draft.json`: walkable zones, object footprints with a 5 cm margin, one eye point per station, and warnings for corridors under 0.7 m.

## AI harness (optional)

`harness/client.mjs` is one dependency-free file that runs in Node and in the browser. It sends one JSON task envelope to the provider you chose and returns one validated JSON envelope: `{task, ok, result, notes, confidence}`. Tasks: `describe` (the story), `sketch-to-plan` (sketch → room items, stations, obstacles), `label`, `review` (school check). Providers: `claude-api` (your key, straight to the Messages API, images as base64), `ollama` (local, vision models read the sketch), `custom` (any HTTPS endpoint or a shell command via `NEXUS_AI_COMMAND`). `harness --provider=claude-code` copies the skills into `.claude/skills` and `AGENTS.md` as `CLAUDE.md`. Keys stay in `.env.local` (gitignored) or, in the wizard, in `sessionStorage`; they never enter `place.json`, the ZIP or `dist/`, and `check` turns red if a secret lands in `public/` or `dist/`.

## The school (art direction)

The atlas is a neighbourhood, not a marketplace, so places share a few rules ([docs/04-ART-DIRECTION.md](../04-ART-DIRECTION.md)): photographs you own, no map imagery, an honest `geometry` field ("photo-sketch-and-owner-layout-interpretation": a layout interpretation, not photogrammetry), budgets that keep a place walkable on a laptop (≤ 250k triangles green, ≤ 3 MB GLB, ≤ 20 materials), bevelled edges on anything over 8 cm, `prefers-reduced-motion` respected, and short, plain descriptions without advertising language. `check` is the same list as code.

## Protocol

`nexus-interlink/0.2` ([schema/nexus-interlink-0.2.schema.json](../../schema/nexus-interlink-0.2.schema.json), Apache-2.0): a place is one JSON file with `id`, `name`, `url`, `kind` (studio · garden · simulation · gallery · shop), `description`, optional `address` and `coordinates` (owner-declared; the kit never guesses), `room` (width, depth, up to 24 items of type table · plant · frame · portal · seat), up to 3 photos as data URIs, and `links` (portal or reference, HTTPS only). The registry keeps only URLs; every place remains on its owner's domain.

## Licensing

Tooling (`bin/`, `lib/`, `harness/`): GPL-3.0-or-later. Templates, schema and protocol (`templates/`, `schema/`, the manifest format and the engine shipped in the ZIP): Apache-2.0, so what you build with the kit is yours. "Nexus Kit", "Nexus Interlink", "Fudō Engine" and the marks are trademarks ([TRADEMARKS.md](../../TRADEMARKS.md)). Contributions are signed off under the DCO ([CONTRIBUTING.md](../../CONTRIBUTING.md)). The registry code is MIT and its data CC-BY-4.0.

## Status (0.2, September 2026)

Working and tested: `doctor`, `init`, `manifest`, `check`, `blender` (end to end with Blender 4.5), `harness`, `publish`, `sketch` (show / grid / ai), the harness client, and the browser wizard steps 01–06 with the helper panel (Claude key or Ollama, describe · sketch-to-plan · review). Verified on 20 September 2026: the wizard on a static build produced a 25-file ZIP that the kit's `check` rated yellow (no portal yet, no Blender report), at 320, 390 and 1440 px with no horizontal overflow and no console errors of its own (`reference/wizard-qa.json`).

Not there yet: `check --browser` (Playwright), `dev` and `package` commands, the `walk` and `stage` templates, the Astra provider (owner-gateway assistant, design only), the 4-point sketch correction in the wizard, schema 0.3.
