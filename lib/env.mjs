// .env.local reader: KEY=value lines, # comments, no expansion. Values are handed to the provider; never printed.
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
export function readEnv(root){
 const out={};const p=join(root,'.env.local');if(!existsSync(p))return out;
 for(const raw of readFileSync(p,'utf8').split(/\r?\n/)){const line=raw.replace(/\s+#.*$/,'').trim();if(!line||line.startsWith('#'))continue;const i=line.indexOf('=');if(i<0)continue;const k=line.slice(0,i).trim(),v=line.slice(i+1).trim().replace(/^["']|["']$/g,'');if(v)out[k]=v;}
 return out;
}
/** Provider + config from env (process.env wins over .env.local). Returns null when no provider is configured. */
export function providerFrom(env){
 const e={...env,...process.env};const provider=e.NEXUS_AI_PROVIDER||'none';
 if(provider==='claude-api')return e.ANTHROPIC_API_KEY?{provider,config:{apiKey:e.ANTHROPIC_API_KEY,model:e.NEXUS_AI_MODEL||undefined}}:null;
 if(provider==='ollama')return {provider,config:{url:e.OLLAMA_URL||'http://127.0.0.1:11434',model:e.OLLAMA_MODEL||''}};
 if(provider==='custom')return e.NEXUS_AI_URL?{provider,config:{url:e.NEXUS_AI_URL,token:e.NEXUS_AI_TOKEN}}:e.NEXUS_AI_COMMAND?{provider:'command',config:{command:e.NEXUS_AI_COMMAND}}:null;
 return null;
}
