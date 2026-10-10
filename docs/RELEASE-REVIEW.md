# Release review · 2026-10-10

## Scope

The current trees of nexus-kit and nexus-registry, their single main branches and all 15 reachable main-history commits were enumerated. 107 unique current/historical text versions were scanned for common private keys, access-token patterns, credential URLs and local user paths. No live credential pattern was found. A credential URL is a deliberate test fixture. Old machine-specific paths were removed from current docs.

This is a targeted review, not an independent security audit or a guarantee about all historical media. Existing demonstration media has separate rights terms. History was not rewritten.

## Production source

Trees and selected files of fudo-gta, biyikgokhan-site and gokhanbiyik-portfolio were examined, not exhaustively audited.

- fudo-gta mixes rendering with commercial music, reference media, archives and services.
- biyikgokhan-site mixes deployed content, atelier source, internal interfaces and site-specific art.
- gokhanbiyik-portfolio is an older separate portfolio with internal interfaces.

Those complete histories are not ready to publish as an asset library. A separate release needs per-asset provenance, removal of private services/configuration, full-history review, replacement of nonredistributable media and testing of the extracted engine.

## Changes and limits

Generated source uses a public-data allowlist excluding private photos, credentials and arbitrary extensions. Starter builds regenerate manifests. Registry requests pin public IPv4 DNS answers, reject redirects, bound time/size and prevent cross-origin id takeover. Human review remains required. MCP is local and read-only.

No Higgsfield credits were needed: the infographic is original SVG. No Blender render or broad device FPS guarantee is claimed. ZIPs require a Node build. Hosted ChatGPT connectivity, npm publication, app-store approval and legal foundation formation are outside this release.
