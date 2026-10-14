// SPDX-License-Identifier: GPL-3.0-or-later
import { starterFiles } from './starter.mjs';
import { ui } from '../templates/site/src/i18n.js';

const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scriptJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function readySiteFiles(place, sources, runtime) {
  const source = starterFiles(place, sources);
  const clean = JSON.parse(source['place.json']);
  const words = ui[clean.language];
  if (!runtime['index.html'] || !Object.keys(runtime).some(p => p.endsWith('.js'))) throw Error('Ready-site runtime is missing.');
  const files = {...runtime};
  const content = clean.translations?.[clean.language] || clean;
  // Static text and links remain usable when JavaScript/WebGL is unavailable.
  const links = [...new Map(clean.links.map(l => [l.url, l])).values()];
  files['index.html'] = files['index.html']
    .replace('<html lang="en">', '<html lang="'+clean.language+'">')
    .replace('<title>My Nexus place</title>', '<title>'+html(content.name)+'</title>')
    .replace('<h1 id="name"></h1>', '<h1 id="name">'+html(content.name)+'</h1>')
    .replace('<p id="story"></p>', '<p id="story">'+html(content.description)+'</p>')
    .replace('<nav id="links"></nav>', '<nav id="links">'+links.map(l => '<a href="'+html(l.url)+'" rel="noopener noreferrer">'+html(l.object||new URL(l.url).hostname)+' ↗</a>').join('')+'</nav>')
    .replace(/(<[^>]+data-ui="(\w+)"[^>]*>)(<\/[^>]+>)/g, (_, open, key, close) => open+html(words[key]||'')+close)
    .replace('</head>', '<script id="nexus-place-data" type="application/json">'+scriptJson(clean)+'</script></head>');
  files['place.json'] = source['place.json'];
  files['nexus.json'] = source['public/nexus.json'];
  files['.well-known/nexus.json'] = source['public/.well-known/nexus.json'];
  files['.nojekyll'] = '';
  files['LICENSE'] = sources.LICENSE;
  files['models/README.txt'] = 'Optional: copy your GLB here as place.glb. No rebuild needed. / İsteğe bağlı: GLB dosyanı place.glb adıyla buraya koy. Yeniden derleme gerekmez.\n';
  files['START-HERE.txt'] = `READY TO PUBLISH — no Node/npm required

1. Extract this ZIP.
2. Upload its CONTENTS (index.html, assets/, models/, .well-known/ and the other files) to your own HTTPS website's document root using your host's file manager or file transfer tool. Enable hidden files so .well-known/ is included. Hosting and domain costs are yours.
3. Open ${clean.url} and check the scene, language switch and links. This site needs an HTTP(S) server; double-clicking index.html is not a supported preview.
4. Open ${new URL('/.well-known/nexus.json', clean.url).href} and check that it returns JSON. A project subfolder alone cannot publish the domain-root manifest.
5. Request a connection: https://github.com/Biyikgokhan/nexus-kit/issues/new?template=place-connection.yml . This is a request for human review, not automatic listing.

Optional GLB: copy a self-contained .glb to models/place.glb, then use the site's model button. No rebuild required. Third-party decoder-dependent compressed GLBs need a custom renderer configuration.
To edit the layout/text: import place.json into the wizard, change it and download a fresh site ZIP. Editing this backup JSON alone does not change the embedded site data. Advanced users can download the separate source ZIP.
Keep LICENSE and THIRD-PARTY.txt. Template: Apache-2.0; Three.js: MIT. Original artwork remains yours.

YAYINA HAZIR — Node/npm gerekmez

1. ZIP'i aç.
2. İÇİNDEKİ dosyaları (index.html, assets/, models/, .well-known/ ve diğerleri) hosting dosya yöneticisi veya dosya aktarım aracınla kendi HTTPS sitenin köküne yükle. Gizli dosyaları göstererek .well-known/ dizinini de yükle. Domain ve hosting gideri sana aittir.
3. ${clean.url} adresinde sahneyi, dil seçimini ve bağlantıları kontrol et. Site HTTP(S) sunucusunda açılır; index.html dosyasına çift tıklamak desteklenen önizleme değildir.
4. ${new URL('/.well-known/nexus.json', clean.url).href} adresinde JSON'u doğrula. Yalnız alt dizin barındırmak kökte manifest yayınlamaya yetmez.
5. Yukarıdaki GitHub formuyla bağlantı talebi aç. Atlas kaydı insan incelemesi gerektirir.

GLB: bağımsız .glb dosyanı models/place.glb konumuna koy; sitedeki model düğmesini kullan. Derleme gerekmez. Harici çözücü isteyen sıkıştırılmış GLB'ler özel motor yapılandırması gerektirir.
Düzenleme: place.json dosyasını sihirbaza aktar, değiştir, yeni site ZIP'ini indir. Bu yedek JSON'u tek başına değiştirmek siteyi güncellemez. Kaynak kod ZIP'i ileri düzenlemeler için ayrıca sunulur.
LICENSE ve THIRD-PARTY.txt dosyalarını koru. Şablon Apache-2.0, Three.js MIT. Özgün eserlerin sana aittir.
`;
  return files;
}
