// Sağlayıcı kurulumu: dosya kopyalar, izin önerisini gösterir, anahtar saklamaz.
import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const KIT=join(dirname(fileURLToPath(import.meta.url)),'..');
export const PROVIDERS=['claude-code','claude-api','ollama','astra','custom','none'];
export function setupHarness(dir,provider='none'){
 if(!PROVIDERS.includes(provider))throw new Error(`Sağlayıcı şunlardan biri olmalı: ${PROVIDERS.join(', ')}`);
 const done=[];
 if(!existsSync(join(dir,'harness'))){cpSync(join(KIT,'harness'),join(dir,'harness'),{recursive:true});done.push('harness/ kopyalandı');}
 const envExample=join(dir,'harness','providers','.env.example'),envLocal=join(dir,'.env.local');
 if(!existsSync(envLocal)){writeFileSync(envLocal,readFileSync(envExample,'utf8').replace('NEXUS_AI_PROVIDER=none',`NEXUS_AI_PROVIDER=${provider}`));done.push('.env.local yazıldı (anahtarları sen doldurursun; git\'e girmez)');}
 if(provider==='claude-code'){
  const claudeMd=join(dir,'CLAUDE.md');if(!existsSync(claudeMd)){writeFileSync(claudeMd,readFileSync(join(dir,'harness','AGENTS.md'),'utf8'));done.push('CLAUDE.md = harness/AGENTS.md');}
  const skills=join(dir,'.claude','skills');mkdirSync(skills,{recursive:true});
  for(const name of readdirSync(join(dir,'harness','skills'))){const target=join(skills,name);if(!existsSync(target)){cpSync(join(dir,'harness','skills',name),target,{recursive:true});done.push(`.claude/skills/${name}`);}}
  done.push('İzin önerisi (settings.json, sen eklersin): allow npx nexus-kit doctor|check|blender|manifest, npm run build, npm test · deny vercel deploy, netlify deploy, git push, gh issue create, Read .env*, Read .runtime/**');
 }
 if(provider==='ollama')done.push('Ollama: OLLAMA_MODEL seç; kroki için vision model gerekir (harness/providers/ollama.md)');
 if(provider==='astra')done.push('Astra: davet adresi ve anahtarı sahibinden al; ziyaretçi sınıfı kanal (harness/providers/astra.md)');
 return done;
}
