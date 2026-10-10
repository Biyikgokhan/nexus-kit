// Requirement check: looks, never installs, never reads secrets (only whether an env var exists).
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
const run=(cmd,args=['--version'])=>{try{return execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:8000,windowsHide:true}).trim().split('\n')[0];}catch{return null;}};
export const BLENDER_PATHS=['C:/Program Files/Blender Foundation/Blender 4.5/blender.exe','C:/Program Files/Blender Foundation/Blender 4.2/blender.exe','/Applications/Blender.app/Contents/MacOS/Blender','/usr/bin/blender','/snap/bin/blender'];
function npmVersion(){
 // The npm shim on Windows is a .cmd; the bundled npm package beside node.exe is the reliable witness.
 try{const pkg=JSON.parse(readFileSync(join(dirname(process.execPath),'node_modules','npm','package.json'),'utf8'));return pkg.version;}catch{}
 return run(process.platform==='win32'?'npm.cmd':'npm');
}
export function findBlender(){for(const p of BLENDER_PATHS)if(existsSync(p))return p;return run('blender',['--version'])?'blender':null;}
export async function doctor({fetcher=globalThis.fetch,env=process.env}={}){
 const items=[];
 const node=process.versions.node,[major,minor]=node.split('.').map(Number);
 items.push({id:'node',ok:major>22||(major===22&&minor>=12),label:`Node ${node}`,hint:'22.12 veya üstü gerekli: https://nodejs.org'});
 const npm=npmVersion();items.push({id:'npm',ok:Boolean(npm),label:npm?`npm ${npm}`:'npm bulunamadı',hint:'Node ile birlikte gelir; sarmalayıcı bozuksa: node <node-dizini>/node_modules/npm/bin/npm-cli.js'});
 const git=run('git');items.push({id:'git',ok:Boolean(git),label:git||'Git bulunamadı',hint:'https://git-scm.com'});
 const blender=findBlender();items.push({id:'blender',ok:Boolean(blender),optional:true,label:blender?`Blender: ${blender}`:'Blender bulunamadı',hint:process.platform==='win32'?'winget install BlenderFoundation.Blender  (4.5 LTS)':process.platform==='darwin'?'brew install --cask blender':'https://www.blender.org/download/lts/4-5/'});
 let ollama=false;try{const r=await fetcher('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(1500)});ollama=r.ok;}catch{}
 items.push({id:'ollama',ok:ollama,optional:true,label:ollama?'Ollama çalışıyor (127.0.0.1:11434)':'Ollama yok',hint:'isteğe bağlı; yerel yapay zekâ için https://ollama.com'});
 items.push({id:'anthropic',ok:Boolean(env.ANTHROPIC_API_KEY),optional:true,label:env.ANTHROPIC_API_KEY?'ANTHROPIC_API_KEY tanımlı':'ANTHROPIC_API_KEY yok',hint:'isteğe bağlı; Claude API için .env.local'});
 const claude=run(process.platform==='win32'?'claude.cmd':'claude');items.push({id:'claude-code',ok:Boolean(claude),optional:true,label:claude?`Claude Code bulundu (${claude})`:'Claude Code yok',hint:'isteğe bağlı; harness/providers/claude-code.md'});
 return {items,ok:items.filter(i=>!i.optional).every(i=>i.ok),blender};
}
export function formatDoctor(report){
 const lines=[`nexus-kit doctor · ${new Date().toISOString().slice(0,10)}`,''];
 for(const i of report.items)lines.push(`  ${i.ok?'✔':i.optional?'◌':'✖'} ${i.label}${i.ok?'':'\n      '+i.hint}`);
 const missing=report.items.filter(i=>!i.ok&&!i.optional).map(i=>i.id);
 lines.push('',report.ok?'  Devam edebilirsin: init, manifest, blender, check, publish.':`  Zorunlu eksik: ${missing.join(', ')}. "init" yine çalışır${missing.includes('blender')?'; "blender" adımı Blender kurulana kadar atlanır':''}.`);
 return lines.join('\n');
}


