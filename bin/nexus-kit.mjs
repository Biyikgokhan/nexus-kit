#!/usr/bin/env node
// nexus-kit CLI — kendini açıklar, hiçbir adımı sessizce atlamaz, onaysız silmez veya yayınlamaz.
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {doctor,formatDoctor,findBlender} from '../lib/doctor.mjs';
import {initProject} from '../lib/init.mjs';
import {manifestFrom,validateManifest} from '../lib/manifest.mjs';
import {checkProject,formatCheck} from '../lib/check.mjs';
import {setupHarness,PROVIDERS} from '../lib/harness.mjs';
const argv=process.argv.slice(2),command=argv[0],flags=Object.fromEntries(argv.slice(1).filter(a=>a.startsWith('--')).map(a=>{const [k,v]=a.slice(2).split('=');return [k,v??true];})),positional=argv.slice(1).filter(a=>!a.startsWith('--'));
const json=Boolean(flags.json),out=(text,data)=>console.log(json?JSON.stringify(data,null,2):text);
const HELP=`nexus-kit — kendi 3B mekânını kur, haritaya çık

  doctor                 gereksinim kontrolü (kurmaz)
  init <klasör>          proje iskeleti (place.json, harness, tools/build_place.py) · --yes ile sorusuz
  manifest               place.json → public/nexus.json + public/.well-known/nexus.json
  check [--browser]      şema, .well-known, https, sırlar, yasak varlıklar, bütçe · yeşil/sarı/kırmızı
  blender                Blender 4.5 background ile tools/build_place.py çalıştırır, GLB + rapor yazar
  harness --provider=X   ${PROVIDERS.join(' | ')}
  publish                yayın komutunu GÖSTERİR (çalıştırmaz), .well-known doğrular, KAYIT.md yazar
  sketch                 kroki → plan (0.4'te; şimdilik place.json › room elle ya da harness ile)

Her komut --json ve --dry-run kabul eder.`;
async function ask(question,fallback){if(flags.yes)return fallback;const rl=createInterface({input:process.stdin,output:process.stdout});try{const a=(await rl.question(`${question}${fallback?` [${fallback}]`:''} › `)).trim();return a||fallback;}finally{rl.close();}}
function loadPlace(root){const p=join(root,'place.json');if(!existsSync(p))throw new Error('place.json yok. Önce: npx nexus-kit init .');return JSON.parse(readFileSync(p,'utf8'));}
try{
 if(!command||command==='help'||flags.help){console.log(HELP);process.exit(0);}
 if(command==='doctor'){const r=await doctor();out(formatDoctor(r),r);process.exit(r.ok?0:1);}
 else if(command==='init'){
  const dir=resolve(positional[0]||'.');
  const answers={name:await ask('Mekânın adı','Yeni Mekân'),kind:await ask('Tür (studio · garden · simulation · gallery · shop)','studio'),url:await ask('Site adresin (https://…, boş bırakılabilir)',''),template:await ask('Motor şablonu (room · walk · stage)','room'),geometrySource:await ask('Geometri kaynağı (code · blender · both)','code'),width:await ask('Oda genişliği (m)','8'),depth:await ask('Oda derinliği (m)','6')};
  if(flags['dry-run']){out(`Kuru çalışma: ${dir} içine place.json, README.md, harness/, tools/build_place.py, public/.well-known yazılacaktı.`,{dir,answers});process.exit(0);}
  const r=initProject(dir,answers);
  out(`Oluşturuldu (${r.created.length}): ${r.created.join(', ')}${r.skipped.length?`\nAtlandı (zaten vardı): ${r.skipped.join(', ')}`:''}\n\nSonraki: fotoğrafları reference/photos/, krokiyi reference/sketch.jpg olarak koy; place.json › room.items doldur; npx nexus-kit manifest; npx nexus-kit check`,r);
 }
 else if(command==='manifest'){
  const root=resolve('.'),place=loadPlace(root),m=manifestFrom(place),errors=validateManifest(m);
  if(errors.length){out('Manifest üretilemedi:\n  - '+errors.join('\n  - '),{ok:false,errors});process.exit(1);}
  if(flags['dry-run']){out(JSON.stringify(m,null,2),m);process.exit(0);}
  mkdirSync(join(root,'public','.well-known'),{recursive:true});const text=JSON.stringify(m,null,2)+'\n';
  for(const rel of ['public/nexus.json','public/.well-known/nexus.json'])writeFileSync(join(root,rel),text);
  out('Manifest yazıldı: public/nexus.json ve public/.well-known/nexus.json (aynı içerik).',{ok:true,manifest:m});
 }
 else if(command==='check'){
  const r=checkProject(resolve('.'));out(formatCheck(r),r);
  if(flags.browser)console.log('\n  --browser: Playwright tarayıcı denetimi 0.4 yol haritasında; şimdilik npm run dev ile 1440×900 ve 390 px elle kontrol et.');
  process.exit(r.status==='red'?1:0);
 }
 else if(command==='blender'){
  const root=resolve('.'),blender=flags.blender||findBlender(),script=join(root,'tools','build_place.py');
  if(!blender){out('Blender bulunamadı. npx nexus-kit doctor kurulum yolunu gösterir; --blender=<yol> ile de verebilirsin.',{ok:false});process.exit(1);}
  if(!existsSync(script)){out('tools/build_place.py yok. npx nexus-kit init . iskeleti yazar.',{ok:false});process.exit(1);}
  const glb=join(root,'public','models','place.glb');
  if(existsSync(glb)){mkdirSync(join(root,'.runtime','backup'),{recursive:true});const backup=join(root,'.runtime','backup',`place-${new Date().toISOString().replace(/[:.]/g,'-')}.glb`);copyFileSync(glb,backup);console.log('· Yedek: '+backup);}
  const args=['--background','--python',script,'--',...(flags['from-blend']?['--from-blend',String(flags['from-blend'])]:[])];
  console.log(`· Çalıştırılıyor: ${blender} ${args.join(' ')}`);
  if(flags['dry-run'])process.exit(0);
  const started=Date.now(),r=spawnSync(blender,args,{cwd:root,stdio:'inherit',timeout:600000});
  if(r.status!==0){out(`Blender ${r.status} koduyla bitti.`,{ok:false,status:r.status});process.exit(1);}
  const report=join(root,'reference','blender-report.json');const rep=existsSync(report)?JSON.parse(readFileSync(report,'utf8')):null;
  out(`· ${Math.round((Date.now()-started)/1000)} s${rep?` · ${rep.triangles} üçgen · ${rep.materials} malzeme · ${rep.meshes} mesh · GLB ${(rep.glbBytes/1e6).toFixed(1)} MB`:''} → public/models/place.glb\n  Şimdi: npx nexus-kit check`,{ok:true,report:rep});
 }
 else if(command==='harness'){
  const provider=String(flags.provider||await ask(`Sağlayıcı (${PROVIDERS.join(' · ')})`,'none'));
  if(flags['dry-run']){out(`Kuru çalışma: harness/, .env.local (NEXUS_AI_PROVIDER=${provider})${provider==='claude-code'?', CLAUDE.md, .claude/skills':''}`,{provider});process.exit(0);}
  const done=setupHarness(resolve('.'),provider);out(done.map(d=>'· '+d).join('\n'),{provider,done});
 }
 else if(command==='publish'){
  const root=resolve('.'),place=loadPlace(root),m=manifestFrom(place),target=String(flags.target||process.env.NEXUS_PUBLISH_TARGET||'vercel');
  const check=checkProject(root);if(check.status==='red'){out('check KIRMIZI; önce düzelt: npx nexus-kit check',check);process.exit(1);}
  const commands={vercel:'vercel deploy --prod',netlify:'netlify deploy --prod --dir dist',cloudflare:'wrangler pages deploy dist','github-pages':'dist/ içeriğini gh-pages dalına gönder; CNAME ve .nojekyll dist içinde olmalı',manual:'dist/ içeriğini alan adının köküne yükle; .well-known gizli klasörünü unutma'};
  const site=m.url||'https://<alan-adin>/',kayit=`# Nexus kayıt başvurusu\n- Mekân: ${m.name}\n- Manifest: ${new URL('/.well-known/nexus.json',site).href}\n- Tür: ${m.kind} · Adres: ${m.address||'dijital'} · Bağlı merkez: ${m.anchorId||'—'}\n- Hikâye: ${m.description}\n- [ ] Fotoğraflar bana ait ya da izinliyim.\n- [ ] Ekol kurallarını (04-ART-DIRECTION) okudum.\n- [ ] Manifestimi ben yayınlıyorum; kaldırmak istersem issue açarım.\n`;
  if(!flags['dry-run'])writeFileSync(join(root,'KAYIT.md'),kayit);
  const repo=process.env.NEXUS_REGISTRY_REPO||'Biyikgokhan/nexus-registry';
  out(`Yayın komutu (SEN çalıştırırsın; kit çalıştırmaz):\n\n  npm run build\n  ${commands[target]||commands.manual}\n\nSonra doğrula:\n\n  curl -sI ${new URL('/.well-known/nexus.json',site).href}\n\nKayıt başvurusu (KAYIT.md yazıldı):\n\n  gh issue create --repo ${repo} --template place-registration.yml --title "Kayıt: ${m.name}" --body-file KAYIT.md\n`,{target,command:commands[target]||commands.manual,manifestUrl:new URL('/.well-known/nexus.json',site).href,registry:repo});
 }
 else if(command==='sketch'){out('sketch: kroki → plan dönüşümü 0.4 yol haritasında. Şimdilik: place.json › room.items elle (templates/place.example.json) ya da harness › nexus-place › sketch-to-plan görevi ile.',{ok:false,roadmap:'0.4'});process.exit(2);}
 else{console.error(`Bilinmeyen komut: ${command}\n\n${HELP}`);process.exit(1);}
}catch(e){console.error('✖ '+e.message);process.exit(1);}
