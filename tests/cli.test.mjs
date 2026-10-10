import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateManifest,manifestFrom,slug,safeUrl} from '../lib/manifest.mjs';
import {checkProject} from '../lib/check.mjs';
import {initProject} from '../lib/init.mjs';
import {setupHarness} from '../lib/harness.mjs';
import {doctor,formatDoctor} from '../lib/doctor.mjs';
const example=JSON.parse(readFileSync(new URL('../templates/place.example.json',import.meta.url),'utf8'));
const schema=JSON.parse(readFileSync(new URL('../schema/nexus-interlink-0.2.schema.json',import.meta.url),'utf8'));
test('place.example.json → valid manifest; portal items and named links become https links; bad input is refused in Turkish',()=>{
 const m=manifestFrom(example);assert.deepEqual(validateManifest(m),[]);
 for(const key of schema.required)assert.ok(key in m,key);
 assert.ok(m.links.some(l=>l.url==='https://fudo.tattoo/'&&l.relation==='portal'));assert.ok(m.links.some(l=>l.relation==='reference'));
 assert.equal(m.extensions.nexusKit.geometry,'photo-sketch-and-owner-layout-interpretation');assert.equal(m.coordinateSource,'Mekân sahibinin beyanı');
 assert.equal(slug('Kozyatağı Bisiklet Atölyesi'),'kozyatagi-bisiklet-atolyesi');assert.equal(safeUrl('http://x.com'),null);assert.equal(safeUrl('https://a:b@x.com'),null);
 const bad=manifestFrom({...example,url:'http://plain.example',kind:'castle',room:{width:2,depth:6,items:[{type:'bed',x:9,z:0}]}});const errors=validateManifest(bad);
 assert.ok(errors.some(e=>/https/.test(e)));assert.ok(errors.some(e=>/kind/.test(e)));assert.ok(errors.some(e=>/width/.test(e)));assert.ok(errors.some(e=>/type bilinmiyor/.test(e)));assert.ok(errors.some(e=>/krokinin içinde/.test(e)));
});
test('init scaffolds a project without overwriting, harness setup copies AGENTS.md as CLAUDE.md, check reads it',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nexus-kit-'));
 const r=initProject(dir,{name:'Deneme Mekânı',kind:'shop',url:'https://deneme.example/',width:'6',depth:'5'});
 assert.ok(r.created.includes('place.json')&&r.created.includes('tools/build_place.py')&&r.created.includes('harness/'));
 assert.ok(existsSync(join(dir,'public','.well-known','nexus.json')));
 const again=initProject(dir,{name:'Başka'});assert.ok(again.skipped.includes('place.json'),'second init never overwrites');
 assert.equal(JSON.parse(readFileSync(join(dir,'place.json'),'utf8')).name,'Deneme Mekânı');
 const done=setupHarness(dir,'claude-code');assert.ok(existsSync(join(dir,'CLAUDE.md'))&&existsSync(join(dir,'.claude','skills','nexus-place','SKILL.md'))&&existsSync(join(dir,'.env.local')));
 assert.ok(done.some(d=>/deny/.test(d)),'permission suggestion is shown, not written');
 assert.match(readFileSync(join(dir,'.env.local'),'utf8'),/NEXUS_AI_PROVIDER=claude-code/);
 const c=checkProject(dir);assert.notEqual(c.status,'red',JSON.stringify(c.findings));assert.ok(c.findings.some(f=>f.rule==='report'),'no geometry report → yellow');
 // forbidden asset + secret + mismatch → red
 writeFileSync(join(dir,'public','google-streetview.jpg'),'x');mkdirSync(join(dir,'dist'),{recursive:true});writeFileSync(join(dir,'dist','.env'),'SECRET=1');writeFileSync(join(dir,'public','nexus.json'),readFileSync(join(dir,'public','nexus.json'),'utf8')+'\n');
 const red=checkProject(dir);assert.equal(red.status,'red');for(const rule of ['forbidden-asset','secret','well-known'])assert.ok(red.findings.some(f=>f.rule===rule),rule);
 // geometry report over budget → yellow/red finding
 writeFileSync(join(dir,'public','nexus.json'),readFileSync(join(dir,'public','.well-known','nexus.json')));writeFileSync(join(dir,'reference','blender-report.json'),JSON.stringify({triangles:600000,materials:12,textures:[{name:'big',width:4096,height:4096}]}));
 const budget=checkProject(dir);assert.ok(budget.findings.some(f=>f.rule==='triangles'&&f.level==='red'));assert.ok(budget.findings.some(f=>f.rule==='texture'&&f.level==='red'));
});
test('doctor never installs and reports optional tools as optional',async()=>{
 const r=await doctor({fetcher:async()=>{throw new Error('offline');},env:{}});
 assert.ok(r.items.find(i=>i.id==='node').ok);assert.equal(r.items.find(i=>i.id==='ollama').ok,false);assert.equal(r.items.find(i=>i.id==='ollama').optional,true);
 assert.match(formatDoctor(r),/nexus-kit doctor/);
});
test('CLI: help, manifest and publish show commands but never run deploys',()=>{
 const bin=fileURLToPath(new URL('../bin/nexus-kit.mjs',import.meta.url));
 const dir=mkdtempSync(join(tmpdir(),'nexus-kit-cli-'));initProject(dir,{name:'CLI Mekânı',url:'https://cli.example/'});
 assert.match(execFileSync(process.execPath,[bin,'help'],{encoding:'utf8'}),/doctor/);
 const m=JSON.parse(execFileSync(process.execPath,[bin,'manifest','--json'],{cwd:dir,encoding:'utf8'}));assert.equal(m.ok,true);assert.equal(readFileSync(join(dir,'public','nexus.json'),'utf8'),readFileSync(join(dir,'public','.well-known','nexus.json'),'utf8'));
 const p=JSON.parse(execFileSync(process.execPath,[bin,'publish','--json','--target=netlify'],{cwd:dir,encoding:'utf8'}));assert.match(p.command,/netlify deploy/);assert.equal(p.manifestUrl,'https://cli.example/.well-known/nexus.json');assert.ok(existsSync(join(dir,'KAYIT.md')));
});

