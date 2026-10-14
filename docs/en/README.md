# Nexus Kit quick start

1. Open the [live English wizard](https://gokhanbiyik.com/nexus-kit/?lang=en).
2. Edit identity, room and links. Reference photos stay in browser memory and are excluded from export.
3. Download **Ready-to-publish site ZIP**. No Node/npm is required for this path.
4. Extract and upload its contents to your own HTTPS website's root, including hidden .well-known/. Follow START-HERE.txt. You provide the domain and hosting.
5. Open your site and https://your-domain/.well-known/nexus.json. A project subfolder alone cannot serve the domain-root manifest.
6. Review the public data and [request registry review](https://github.com/Biyikgokhan/nexus-kit/issues/new?template=place-connection.yml). This is manual review, not automatic enrollment.

The site needs an HTTP(S) server; double-clicking index.html is not a supported preview. To change the exported place, reimport the included place.json into the wizard and download a fresh ZIP. Editing that backup alone does not update the embedded site.

Put a self-contained GLB at models/place.glb and use the page's model button. Text links work without WebGL. External decoder-dependent GLBs require custom renderer configuration.

## Optional developer workflow

Install Node.js 22.12+ and Git. Clone this repository, run npm ci, then npm run wizard to run the wizard locally. For custom code, select the separate **Source code ZIP**, extract it, then run npm install, npm run dev and npm run build. Host dist/, including hidden files. Source models belong in public/models/; source builds validate place.json and regenerate public manifests.

The AI brief is a manual workflow: paste into your chosen assistant, review its JSON, then import it. No direct ChatGPT account connection or hosted MCP endpoint is included. AI is optional.

[TR/EN hosting guide](../SELF-HOST.md) · [Integrations](../INTEGRATIONS.md) · [Licenses](../../NOTICE.md)
