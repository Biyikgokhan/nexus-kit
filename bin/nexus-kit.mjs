#!/usr/bin/env node
// nexus-kit CLI — kendini açıklar, hiçbir adımı sessizce atlamaz, onaysız silmez veya yayınlamaz.
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {doctor,formatDoctor,findBlender} from '../lib/doctor.mjs';
import {initProject} from '../lib/init.mjs';
import {manifestFrom,validateManifest} from '../lib/manifest.mjs';
import {checkProject,formatCheck} from '../lib/check.mjs';
import {setupHarness,PROVIDERS} from '../lib/harness.mjs';
import {asciiPlan,parseGridPlan,applyProposal,planToNavigation} from '../lib/plan.mjs';
import {assist,PLACE_RULES} from '../lib/assist.mjs';
import {readEnv,providerFrom} from '../lib/env.mjs';
import {extname} from 'node:path';
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
  sketch                 kroki → plan: --show (ASCII plan) · --grid=reference/plan.txt (çevrimdışı) · --ai (harness) · --yes yazar
                         --long=<m> --door=south|north|east|west --notes="…" cevapları; reference/navigation-draft.json her seferinde yazılır

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
 else if(command==='sketch'){
  // Three ways in, one way out: place.json › room/stations/obstacles + reference/navigation-draft.json. Nothing is written without --yes (or --dry-run shows).
  const root=resolve('.');let place=loadPlace(root);const room=place.room||{};
  const write=(next,label)=>{const nav=planToNavigation(next);if(flags['dry-run']||!flags.yes){out(`${label}\n\n${asciiPlan(next)}\n\nNavigasyon taslağı: ${nav.obstacles.length} engel, ${Object.keys(nav.locations).length} bakış noktası${nav.warnings.length?'\n  ⚠ '+nav.warnings.join('\n  ⚠ '):''}\n\nYazmak için --yes ekle.`,{ok:true,dry:true,place:next,navigation:nav});return;}
   mkdirSync(join(root,'.runtime','backup'),{recursive:true});copyFileSync(join(root,'place.json'),join(root,'.runtime','backup',`place-${new Date().toISOString().replace(/[:.]/g,'-')}.json`));
   writeFileSync(join(root,'place.json'),JSON.stringify(next,null,2)+'\n');mkdirSync(join(root,'reference'),{recursive:true});writeFileSync(join(root,'reference','navigation-draft.json'),JSON.stringify(nav,null,2)+'\n');
   out(`${label}\n\n${asciiPlan(next)}\n\nplace.json yazıldı (yedek .runtime/backup/), reference/navigation-draft.json yazıldı.${nav.warnings.length?'\n  ⚠ '+nav.warnings.join('\n  ⚠ '):''}\n\nSonraki: npx nexus-kit manifest · npx nexus-kit check`,{ok:true,place:next,navigation:nav});};
  if(flags.grid){const file=resolve(String(flags.grid));if(!existsSync(file))throw new Error(`Plan dosyası yok: ${file}`);const width=Number(flags.long||room.width)||8,depth=Number(room.depth)||6;const items=parseGridPlan(readFileSync(file,'utf8'),{width,depth});
   write(applyProposal(place,{room:{width,depth,items}}),`Izgara planı okundu: ${items.length} nesne (${file}). Etiketleri place.json › room.items › label alanına yaz.`);}
  else if(flags.ai){
   const env=readEnv(root),prov=providerFrom(env);if(!prov)throw new Error('Yardımcı bağlı değil: .env.local › NEXUS_AI_PROVIDER ve anahtar/model (npx nexus-kit harness --provider=claude-api|ollama).');
   const images=[];const sketchFile=['reference/sketch.jpg','reference/sketch.jpeg','reference/sketch.png','reference/sketch.webp'].map(f=>join(root,f)).find(existsSync);
   const toData=f=>{const type={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[extname(f).toLowerCase()];const bytes=readFileSync(f);if(bytes.length>1.4e6)throw new Error(`${f} 1,4 MB'ı aşıyor; küçült.`);return {mediaType:type,data:bytes.toString('base64')};};
   if(sketchFile)images.push(toData(sketchFile));const photosDir=join(root,'reference','photos');if(existsSync(photosDir))for(const f of readdirSync(photosDir).filter(f=>/\.(jpe?g|png|webp)$/i.test(f)).slice(0,3))images.push(toData(join(photosDir,f)));
   const input={name:place.name,kind:place.kind,room:{width:Number(flags.long||room.width)||8,depth:Number(room.depth)||6,door:flags.door||room.door||'south'},answers:{longSide:flags.long||null,door:flags.door||null,notes:flags.notes||null},existingItems:(room.items||[]).map(o=>({id:o.id,type:o.type,label:o.label})),images:{sketch:Boolean(sketchFile),photos:images.length-(sketchFile?1:0)}};
   if(!images.length)console.log('· Kroki ya da fotoğraf yok (reference/sketch.jpg, reference/photos/); yardımcı yalnız cevaplardan çalışacak.');
   let system=PLACE_RULES;try{system=readFileSync(join(root,'harness','AGENTS.md'),'utf8')+'\n\n'+readFileSync(join(root,'harness','skills','nexus-place','SKILL.md'),'utf8');}catch{}
   console.log(`· Yardımcı: ${prov.provider} · sketch-to-plan · ${images.length} görüntü`);
   let r;if(prov.provider==='command'){const run=spawnSync(prov.config.command,{input:JSON.stringify({task:'sketch-to-plan',input,system}),encoding:'utf8',shell:true,timeout:120000});const {extractJson,validateResult}=await import('../lib/assist.mjs');const parsed=extractJson(run.stdout||'');const result=parsed?.result||parsed;const errors=result?validateResult('sketch-to-plan',result,input.room):['komut JSON döndürmedi'];r=errors.length?{ok:false,error:errors.join(' ')}:{ok:true,result,notes:parsed.notes||[],confidence:parsed.confidence??null};}
   else r=await assist({provider:prov.provider,config:prov.config,task:'sketch-to-plan',input,images,system});
   if(!r.ok){out(`Yardımcı öneri veremedi: ${r.error}\nYardımcısız devam: --grid=reference/plan.txt ya da place.json › room.items elle.`,{ok:false,error:r.error});process.exit(2);}
   write(applyProposal(place,r.result),`Yardımcının önerisi (güven ${r.confidence==null?'—':Math.round(r.confidence*100)+'%'}): ${r.result.room.items.length} nesne${r.notes.length?'\n  · '+r.notes.join('\n  · '):''}`);}
  else{const nav=planToNavigation(place);if(flags.yes&&!flags['dry-run']){mkdirSync(join(root,'reference'),{recursive:true});writeFileSync(join(root,'reference','navigation-draft.json'),JSON.stringify(nav,null,2)+'\n');}
   out(`${asciiPlan(place)}\n\nNavigasyon taslağı: ${nav.obstacles.length} engel, ${Object.keys(nav.locations).length} bakış noktası${nav.warnings.length?'\n  ⚠ '+nav.warnings.join('\n  ⚠ '):''}${flags.yes&&!flags['dry-run']?'\nreference/navigation-draft.json yazıldı.':''}\n\nPlanı değiştirmek için: --grid=reference/plan.txt (T masa · S koltuk · P bitki · F eser · O portal) ya da --ai`,{ok:true,place,navigation:nav});}
 }
 else{console.error(`Bilinmeyen komut: ${command}\n\n${HELP}`);process.exit(1);}
}catch(e){console.error('✖ '+e.message);process.exit(1);}
