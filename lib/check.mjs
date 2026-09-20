// Ekol denetçisi: şema, .well-known, https, sırlar, yasak varlıklar, geometri bütçesi (rapor varsa).
// Kırmızı = paketlenmez, sarı = uyarı. Geometri sayımı FPS ölçümü değildir; rapor bunu aynen söyler.
import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
import {validateManifest,safeUrl} from './manifest.mjs';
export const BUDGET={triangles:[250000,500000],frameTriangles:[130000,200000],drawCalls:[300,400],meshes:[300,450],materials:[20,30],textureSize:[1024,2048],glbBytes:[3e6,5e6],shadowLights:[3,4],lights:[14,18]};
const FORBIDDEN=/(google|streetview|street-view|maps\.app|earth)[^/]*\.(png|jpe?g|webp|glb|ktx2)$/i;
const SECRET=/^(\.env(\..*)?|.*\.key|.*\.pem|satori-owner\.key|printer\.json)$/i;
function walk(dir,out=[],base=dir){if(!existsSync(dir))return out;for(const name of readdirSync(dir)){const p=join(dir,name);const s=statSync(p);if(s.isDirectory()){if(name==='node_modules'||name==='.git')continue;walk(p,out,base);}else out.push({path:relative(base,p).replace(/\\/g,'/'),size:s.size});}return out;}
const level=(value,[green,yellow])=>value<=green?'green':value<=yellow?'yellow':'red';
export function checkProject(root){
 const findings=[],add=(lvl,rule,message,hint='')=>findings.push({level:lvl,rule,message,hint});
 const pub=join(root,'public'),a=join(pub,'nexus.json'),b=join(pub,'.well-known','nexus.json');
 let manifest=null;
 if(!existsSync(a))add('red','manifest','public/nexus.json yok.','npx nexus-kit manifest');
 else{try{manifest=JSON.parse(readFileSync(a,'utf8'));}catch{add('red','manifest','public/nexus.json geçerli JSON değil.');}}
 if(manifest){const errors=validateManifest(manifest);for(const e of errors)add('red','schema',e);
  if(!existsSync(b))add('red','well-known','public/.well-known/nexus.json yok.','npx nexus-kit manifest');
  else if(readFileSync(a)+''!==readFileSync(b)+'')add('red','well-known','nexus.json ile .well-known/nexus.json aynı değil.','npx nexus-kit manifest');
  for(const l of manifest.links||[])if(!safeUrl(l.url))add('red','https',`Bağlantı https değil: ${l.url}`);
  if(manifest.room&&!(manifest.room.items||[]).some(o=>o.target)&&!(manifest.links||[]).some(l=>l.relation==='portal'))add('yellow','portal','Hiç kapı (portal) yok; ziyaretçi başka bir dünyaya geçemiyor.','Bir nesneye https hedef ver.');
  if(!manifest.description)add('yellow','story','Hikâye boş.');
  if(manifest.address&&!manifest.coordinates)add('yellow','coordinates','Adres var, koordinat yok; atlasta şehir ölçeğine yerleşemez.');
  if(manifest.extensions?.nexusKit?.geometry&&manifest.extensions.nexusKit.geometry!=='photo-sketch-and-owner-layout-interpretation')add('red','honesty','geometry alanı yorum dışında bir iddia taşıyor.');
 }
 const files=walk(pub);
 for(const f of files){if(FORBIDDEN.test(f.path))add('red','forbidden-asset',`Harita görüntüsü ya da yasak varlık: public/${f.path}`,'Kendi çektiğin fotoğrafı koy; harita görüntüsü dağıtılmaz.');if(SECRET.test(f.path.split('/').pop()))add('red','secret',`Sır dosyası public içinde: ${f.path}`);}
 const dist=walk(join(root,'dist'));for(const f of dist){const name=f.path.split('/').pop();if(SECRET.test(name)||f.path.startsWith('.runtime/'))add('red','secret',`Sır dist içinde: ${f.path}`);}
 for(const f of [...files,...dist])if(/\.glb$/i.test(f.path)){const lvl=level(f.size,BUDGET.glbBytes);if(lvl!=='green')add(lvl,'glb',`${f.path}: ${(f.size/1e6).toFixed(1)} MB (yeşil ≤ 3 MB)`);}
 const report=join(root,'reference','blender-report.json');
 if(existsSync(report)){try{const r=JSON.parse(readFileSync(report,'utf8'));
  for(const [key,rule,label] of [['triangles','triangles','üçgen'],['materials','materials','malzeme'],['meshes','meshes','mesh'],['lights','lights','ışık'],['shadowLights','shadowLights','gölgeli ışık'],['drawCalls','drawCalls','draw call']]){if(!Number.isFinite(r[key]))continue;const lvl=level(r[key],BUDGET[rule]);if(lvl!=='green')add(lvl,rule,`${label}: ${r[key]} (yeşil ≤ ${BUDGET[rule][0]})`,'harness › nexus-art-direction › bütçe düşürme sırası');}
  if(Array.isArray(r.textures))for(const t of r.textures){const size=Math.max(t.width||0,t.height||0);const lvl=level(size,BUDGET.textureSize);if(lvl!=='green')add(lvl,'texture',`doku ${t.name||''}: ${size}px (yeşil ≤ 1024)`);}
 }catch{add('yellow','report','reference/blender-report.json okunamadı.');}}
 else add('yellow','report','Geometri raporu yok (reference/blender-report.json); bütçe denetlenmedi.','npx nexus-kit blender');
 const src=join(root,'src');if(existsSync(src)){const code=walk(src).filter(f=>/\.(js|mjs)$/.test(f.path)).map(f=>readFileSync(join(src,f.path),'utf8')).join('\n');
  if(/new\s+THREE\.BoxGeometry\(/.test(code)&&!/boxGeometry\(/.test(code))add('yellow','bevel','Düz BoxGeometry kullanılıyor; ≥ 8 cm kutular için engine/geometry.js boxGeometry() (bevel kuralı).');
  if(!/prefers-reduced-motion/.test(code))add('yellow','reduced-motion','prefers-reduced-motion dallanması bulunamadı.');
  if(/SMAAPass|antialias:\s*true/.test(code)===false)add('yellow','aa','SMAA ya da antialias bulunamadı.');}
 const worst=findings.some(f=>f.level==='red')?'red':findings.some(f=>f.level==='yellow')?'yellow':'green';
 return {status:worst,findings,note:'Geometri sayımı ve bütçeler ölçümdür; FPS garantisi değildir.'};
}
export function formatCheck(r){const mark={red:'✖',yellow:'⚠',green:'✔'};const lines=[`nexus-kit check · ${r.status.toUpperCase()}`,''];for(const f of r.findings)lines.push(`  ${mark[f.level]} [${f.rule}] ${f.message}${f.hint?'\n      → '+f.hint:''}`);if(!r.findings.length)lines.push('  ✔ Bulgu yok.');lines.push('',`  ${r.note}`);return lines.join('\n');}
