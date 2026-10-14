import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {zipSync, unzipSync, strToU8, strFromU8} from 'fflate';
import {readySiteFiles} from '../lib/ready-site.mjs';
import {buildReadyRuntime} from '../lib/ready-site-build.mjs';
import {validateManifest} from '../lib/manifest.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
function readTree(dir, prefix='', out={}) {
 for(const e of readdirSync(dir,{withFileTypes:true})) {
  if(e.isDirectory()) readTree(join(dir,e.name),prefix+e.name+'/',out);
  else out[prefix+e.name]=readFileSync(join(dir,e.name),'utf8');
 }
 return out;
}
const sources=readTree(join(root,'templates/site'));
sources.LICENSE=readFileSync(join(root,'LICENSE-APACHE'),'utf8');
const place={name:'Açık Atölye',kind:'studio',url:'https://studio.example/',description:'Merhaba & hello',language:'tr',room:{width:8,depth:6,items:[]},links:[{object:'Neighbour',relation:'portal',url:'https://neighbour.example/'}]};
const runtime=await buildReadyRuntime();

test('ready ZIP has complete bundled assets and valid domain-root manifest without Node',()=>{
 const files=readySiteFiles({...place,photos:['data:image/png;base64,AAAA'],apiKey:'PRIVATE-TEST'},sources,runtime);
 const zipped=unzipSync(zipSync(Object.fromEntries(Object.entries(files).map(([p,s])=>[p,strToU8(s)]))));
 const page=strFromU8(zipped['index.html']);
 for(const [,path] of page.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) assert.ok(zipped[path],path);
 assert.ok(zipped['START-HERE.txt']);assert.ok(zipped['THIRD-PARTY.txt']);assert.ok(zipped.LICENSE);
 assert.ok(!zipped['package.json']);assert.ok(!zipped['src/main.js']);
 assert.deepEqual(validateManifest(JSON.parse(strFromU8(zipped['.well-known/nexus.json']))),[]);
 assert.equal(strFromU8(zipped['nexus.json']),strFromU8(zipped['.well-known/nexus.json']));
 assert.ok(!JSON.stringify(files).includes('PRIVATE-TEST'));
 assert.ok(!JSON.stringify(files).includes('data:image/png;base64,AAAA'));
 const js=Object.entries(files).filter(([p])=>p.endsWith('.js')).map(([,s])=>s).join('\n');
 assert.match(js,/nexus-place-data/);
 assert.doesNotMatch(js,/from\s*["']three|from\s*["']\.\.\/place.json/);
 assert.match(page,/<h1 id="name">Açık Atölye<\/h1>/);
 assert.match(page,/<a href="https:\/\/neighbour.example\//);
});

test('embedded public data cannot close a script or inject HTML; selected language survives',()=>{
 const malicious={...place,name:'Safe <studio>',description:'</script><script>alert(1)</script>',language:'en',translations:{en:{name:'English studio',description:'<img src=x onerror=alert(1)>'},tr:{name:'Atölye',description:'Merhaba'}}};
 const files=readySiteFiles(malicious,sources,runtime),page=files['index.html'];
 const embedded=page.match(/<script id="nexus-place-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
 assert.equal(JSON.parse(embedded).description,malicious.description);
 assert.ok(!embedded.includes('<'));
 assert.ok(!page.includes('<img src=x'));assert.ok(!page.includes('<script>alert(1)'));
 assert.match(page,/<html lang="en">/);assert.match(page,/<title>English studio<\/title>/);
 assert.match(files['START-HERE.txt'],/no Node\/npm required/);
 assert.match(files['START-HERE.txt'],/Node\/npm gerekmez/);
});

test('ready export rejects invalid links and never mutates reusable runtime',()=>{
 const before=JSON.stringify(runtime);
 assert.throws(()=>readySiteFiles({...place,links:[{object:'bad',url:'javascript:alert(1)'}]},sources,runtime));
 readySiteFiles(place,sources,runtime);
 assert.equal(JSON.stringify(runtime),before);
});
