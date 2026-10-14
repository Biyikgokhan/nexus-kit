// SPDX-License-Identifier: GPL-3.0-or-later
// Compile once on the maintainer's machine; the browser only fills in public data.
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

export async function buildReadyRuntime() {
  const root = fileURLToPath(new URL('../templates/site/', import.meta.url));
  const result = await build({
    configFile: false, root, base: './', publicDir: false, logLevel: 'silent',
    plugins: [{
      name: 'nexus-export-place', enforce: 'pre',
      resolveId(id, importer) {
        if (id === '../place.json' && importer?.replaceAll('\\', '/').endsWith('/templates/site/src/main.js')) return '\0nexus-export-place';
      },
      load(id) {
        if (id === '\0nexus-export-place') {
          return { code: "export default JSON.parse(document.getElementById('nexus-place-data').textContent);", moduleType: 'js' };
        }
      }
    }],
    build: { write: false, minify: true, sourcemap: false, modulePreload: false }
  });
  const files = {};
  for (const item of result.output) {
    files[item.fileName] = item.type === 'chunk' ? item.code :
      typeof item.source === 'string' ? item.source : new TextDecoder().decode(item.source);
  }
  files['THIRD-PARTY.txt'] = 'Three.js (MIT)\n\n' + await readFile(new URL('../node_modules/three/LICENSE', import.meta.url), 'utf8');
  return files;
}

export function readyRuntimePlugin() {
  let runtime;
  return {
    name: 'nexus-ready-runtime',
    resolveId(id) { if (id === 'virtual:nexus-ready-runtime') return '\0nexus-ready-runtime'; },
    async load(id) {
      if (id !== '\0nexus-ready-runtime') return;
      runtime ||= buildReadyRuntime();
      return 'export default ' + JSON.stringify(await runtime) + ';';
    }
  };
}
