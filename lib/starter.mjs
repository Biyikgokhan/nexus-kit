// SPDX-License-Identifier: GPL-3.0-or-later
// Shared by the browser wizard and the CLI. Generated site sources are Apache-2.0.
import { manifestFrom, validateManifest, slug } from './manifest.mjs';
export function starterFiles(place, sources) {
  for (const link of place.links || []) {
    let url; try { url = new URL(link.url || link.target); } catch { throw Error('Every link needs a valid HTTPS URL.'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('Every link needs HTTPS without credentials.');
  }
  const manifest = manifestFrom({...place, engine:'nexus-starter'});
  const errors = validateManifest(manifest);
  if(errors.length) throw new Error(errors.join('\n'));
  // References are private inputs, never site payload. No provider credentials belong here.
  const clean = { id:manifest.id, name:manifest.name, kind:manifest.kind, url:manifest.url, description:manifest.description, room:manifest.room, links:manifest.links, language:place.language==='tr'?'tr':'en', palette:{accent:/^#[a-f0-9]{6}$/i.test(place.palette?.accent||'')?place.palette.accent:'#e8ad72'}, geometry:'photo-sketch-and-owner-layout-interpretation' };
  const publicManifest={...manifest,photos:[],extensions:{nexusKit:manifest.extensions.nexusKit}};
  const files={...sources, 'place.json':JSON.stringify(clean,null,2)+'\n', 'public/nexus.json':JSON.stringify(publicManifest,null,2)+'\n', 'public/.well-known/nexus.json':JSON.stringify(publicManifest,null,2)+'\n', '.gitignore':'node_modules/\ndist/\n.env\n.env.*\n.runtime/\nreference/photos/\nreference/sketch.*\n'};
  const pkg=JSON.parse(files['package.json']);pkg.name=slug(place.name);files['package.json']=JSON.stringify(pkg,null,2)+'\n';
  files['README.md']=`# ${clean.name}\n\nEditable Nexus Interlink starter. Requires Node 22.12 or newer.\n\n\`\`\`sh\nnpm install\nnpm run dev\nnpm run build\n\`\`\`\n\nEdit place.json. npm run build validates it and regenerates public/nexus.json and public/.well-known/nexus.json automatically. Host dist/ on your HTTPS domain, including .well-known/ and .nojekyll. Project-subpath hosting alone cannot serve the required root manifest; use a custom domain.\n\nThis is a small procedural diorama, not automatic photogrammetry or a surveyed digital twin. The browser wizard does not upload photos. Source photographs, private addresses, API keys and server services are not included.\n\nBlender: export glTF binary to public/models/place.glb; the page has a load-model button. Other tools that export GLB work too.\n\nRegistration: https://github.com/Biyikgokhan/nexus-registry/issues/new?template=place-registration.yml (requires a public repository and maintainer review; not automatic listing).\n\nTemplate code: Apache-2.0, see LICENSE. Three.js: MIT. Your original artwork and content remain yours.\n`;
  return files;
}
export function aiBrief(place) {
  return `Help me create a small stylized Nexus Interlink place. Work from my own photographs and sketch only when I explicitly provide them. Do not invent unseen rooms, measurements, precise coordinates or rights to artwork. Keep width/depth within 3–16 m and at most 24 items (table, seat, plant, frame, portal). x/z are metres around the room centre, +z is the front. Return a complete place.json with name, kind, https url, description, room and links. Preserve my choices; AI is optional. Do not include API keys, base64 photographs, private infrastructure or personal conversations. My current public design:\n\n${JSON.stringify({name:place.name,kind:place.kind,url:place.url,description:place.description,room:place.room,links:place.links||[]},null,2)}`;
}
