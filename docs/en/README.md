# Nexus Kit 0.3 quick start

Build an independently hosted stylized place, then link to other places.

Open the [live English wizard](https://gokhanbiyik.com/nexus-kit/?lang=en) to start in your browser, or follow steps 1–3 to run it locally. Building the exported project still requires Node.js and npm.

1. Install Node.js 22.12+ and Git.
2. Clone this repository, run `npm ci`, then `npm run wizard`.
3. Choose English. Edit identity, room and links.
4. Optional reference photos stay in browser memory and are excluded from export.
5. Extract the source ZIP. Run `npm install`, `npm run dev`, then `npm run build`.
6. Deploy `dist/` including `.well-known/` on your HTTPS domain. Project-subpath hosting needs a custom domain or a separately hosted root manifest.
7. Review your public manifest and [request registry review](https://github.com/Biyikgokhan/nexus-kit/issues/new?template=place-connection.yml).

Edit `place.json`; builds regenerate public manifests. Put a Blender/other modeller GLB at `public/models/place.glb` and use the page’s model button. Text links work without WebGL.

The AI brief is a manual workflow: paste into your chosen assistant, review its JSON, then import it. No direct ChatGPT account connection or hosted MCP endpoint is included.

[Integrations](../INTEGRATIONS.md) · [Licenses](../../NOTICE.md) · [Roadmap](../../ROADMAP.md)

