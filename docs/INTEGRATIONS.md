# Blender, Claude, Codex and ChatGPT

No AI account or API key is needed to use the wizard or starter. AI is optional; use the tools you already prefer.

## Codex

After initializing a place, run the kit CLI from that place directory:

```sh
node /path/to/nexus-kit/bin/nexus-kit.mjs harness --provider=codex
```

This installs the existing Nexus skills into `.agents/skills/` and adds `AGENTS.md` if absent. Existing instructions and skills are preserved. It does not change the user's global Codex configuration. The portable plugin source is `plugins/nexus-interlink/.codex-plugin/plugin.json`.

## Claude Code

Use `harness --provider=claude-code` for project-local `.claude/skills/` and `CLAUDE.md`, or load the portable plugin:

```sh
claude --plugin-dir /path/to/nexus-kit/plugins/nexus-interlink
```

The same plugin folder includes `.claude-plugin/plugin.json`. These are source-distributed integrations, not claims of approval in an official marketplace.

## Local MCP tools

After `npm ci` in the kit, any compatible stdio MCP client can launch:

```json
{
  "mcpServers": {
    "nexus-interlink": {
      "command": "node",
      "args": ["/absolute/path/to/nexus-kit/mcp/server.mjs"]
    }
  }
}
```

On Windows, use forward slashes or escaped backslashes. Merge this entry with the client's existing configuration. Tools: `validate_manifest`, `plan_from_grid`, `design_brief`. All operate only on supplied data; none reads the disk, launches commands, reaches the network, or publishes. The server logs no prompts and needs no keys.

For Codex CLI: `codex mcp add nexus-interlink -- node /absolute/path/to/nexus-kit/mcp/server.mjs`. Host support and setup screens vary. This local stdio server is not a hosted ChatGPT connector; a remote authenticated HTTP transport would require a separate service and review.

## ChatGPT and other assistants

In the wizard, download the AI design brief. Paste it into your chosen assistant and attach only photos/sketches you want that provider to receive. Ask for a complete `place.json`. Import the returned JSON into the wizard and review the layout. This works without a Nexus subscription or a Nexus-managed API key. Model output can be wrong; dimensions and rights remain the owner's decision.

## Blender and other creative tools

Run `blender --background --python tools/build_place.py` from a generated place, or export your own `.glb` to `public/models/place.glb`. The starter's button loads that model. This release supplies a Blender script, not an installed Blender add-on. The script's coordinate conversion uses Blender Z-up and web Y-up. Hand-authored models, Cinema 4D exports and other GLB workflows can share the same manifest and links.

## Sources checked for this release

- [OpenAI skill documentation](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI plugin development](https://developers.openai.com/plugins)
- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [Model Context Protocol server guide](https://modelcontextprotocol.io/docs/develop/build-server)
- [Three.js installation](https://threejs.org/manual/pages/installation.html)
