import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {starterFiles} from '../lib/starter.mjs';
import {initProject} from '../lib/init.mjs';
import {setupHarness} from '../lib/harness.mjs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const kit=fileURLToPath(new URL('..',import.meta.url));
const readTree=(dir,root=dir,out={})=>{for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())readTree(p,root,out);else out[p.slice(root.length+1).replaceAll('\\','/')]=readFileSync(p,'utf8');}return out;};
test('wizard exports a complete source site without private photos or credentials',()=>{
 const sources=readTree(join(kit,'templates/site'));sources.LICENSE=readFileSync(join(kit,'LICENSE-APACHE'),'utf8');
 const files=starterFiles({name:'Open Studio',kind:'studio',url:'https://studio.example',description:'A shared workbench.',room:{width:8,depth:6,items:[]},links:[],photos:['data:image/png;base64,AAAA'],apiKey:'PRIVATE-TEST-VALUE',extensions:{private:'PRIVATE-TEST-VALUE'}},sources);
 for(const path of ['index.html','package.json','src/main.js','src/world.js','place.json','public/.nojekyll','public/.well-known/nexus.json','LICENSE'])assert.ok(path in files,path);
 assert.equal(files['public/nexus.json'],files['public/.well-known/nexus.json']);
 assert.ok(!JSON.stringify(files).includes('data:image/png;base64,AAAA'));
 assert.ok(!JSON.stringify(files).includes('PRIVATE-TEST-VALUE'));
 assert.throws(()=>starterFiles({name:'x',url:'http://x',links:[]},sources));
});
test('scaffold is runnable, preserves edits, excludes reference media and installs Codex skills',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nexus-release-'));initProject(dir,{name:'Atölye',url:'https://atelier.example/'});
 const pkg=JSON.parse(readFileSync(join(dir,'package.json')));assert.ok(pkg.scripts.dev&&pkg.scripts.build);
 writeFileSync(join(dir,'src/main.js'),'// OWNER EDIT');initProject(dir);assert.equal(readFileSync(join(dir,'src/main.js'),'utf8'),'// OWNER EDIT');
 assert.match(readFileSync(join(dir,'.gitignore'),'utf8'),/reference\/photos\//);
 setupHarness(dir,'codex');assert.ok(existsSync(join(dir,'.agents/skills/nexus-place/SKILL.md')));
 writeFileSync(join(dir,'AGENTS.md'),'OWNER RULES');setupHarness(dir,'codex');assert.equal(readFileSync(join(dir,'AGENTS.md'),'utf8'),'OWNER RULES');
});
test('Blender dry run does not create backup or modify files',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nexus-dry-'));initProject(dir);writeFileSync(join(dir,'public/models/place.glb'),'model');
 execFileSync(process.execPath,[join(kit,'bin/nexus-kit.mjs'),'blender','--dry-run','--blender=does-not-run'],{cwd:dir});
 assert.equal(existsSync(join(dir,'.runtime')),false);
});
test('noninteractive init uses CLI identity flags and preserves equals signs in URLs',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nexus-flags-'));
 execFileSync(process.execPath,[join(kit,'bin/nexus-kit.mjs'),'init',dir,'--yes','--name=Test Studio','--url=https://studio.example/?a=b']);
 const p=JSON.parse(readFileSync(join(dir,'place.json')));
 assert.equal(p.name,'Test Studio');assert.equal(p.url,'https://studio.example/?a=b');
 execFileSync(process.execPath,[join(dir,'scripts/manifest.mjs')],{cwd:dir});
 assert.equal(JSON.parse(readFileSync(join(dir,'public/nexus.json'))).engine,'nexus-starter');
});
test('MCP stdio initialization, tools and invalid data work with the official client',async()=>{
 const client=new Client({name:'release-test',version:'1.0.0'});
 const transport=new StdioClientTransport({command:process.execPath,args:[join(kit,'mcp/server.mjs')],stderr:'pipe'});
 try{
  await client.connect(transport);
  const listed=await client.listTools();assert.equal(listed.tools.length,3);assert.ok(listed.tools.every(t=>t.annotations.readOnlyHint));
  const bad=await client.callTool({name:'validate_manifest',arguments:{manifest:{url:'javascript:alert(1)'}}});assert.equal(JSON.parse(bad.content[0].text).valid,false);
  const plan=await client.callTool({name:'plan_from_grid',arguments:{grid:'T..P\n..S.',width:8,depth:6}});assert.equal(JSON.parse(plan.content[0].text).room.items.length,3);
 }finally{await client.close();}
});
