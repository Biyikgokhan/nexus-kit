// Nexus Kit harness client — one file, no dependencies, runs in Node 22 and in the browser (the easy-path wizard
// copies it verbatim). It sends ONE JSON task envelope to the provider the owner chose and returns ONE validated
// JSON envelope back. Keys go straight to the provider; nothing here logs, stores or forwards them.
//
//   import {assist} from './client.mjs';
//   const out = await assist({provider:'claude-api', config:{apiKey, model}, task:'describe', input:{name, kind, photos:2}});
//   // out = {task, ok, result, notes, confidence, error?}
//
// Providers: claude-api (Messages API, images as base64), ollama (/api/chat, vision models take images),
// custom (any https endpoint that accepts the envelope and answers JSON). Astra is a design note (providers/astra.md).
export const TASKS=['describe','sketch-to-plan','label','review'];
export const MAX_TOKENS={describe:600,'sketch-to-plan':2000,label:800,review:1200};
export const ITEM_TYPES=['table','plant','frame','portal','seat'];
export const DEFAULT_CLAUDE_MODEL='claude-sonnet-5'; // the owner may pick another with listClaudeModels(); the kit never pins a date-stamped id
/** Condensed nexus-place rules: the system text every provider receives (the full skill lives in skills/nexus-place/SKILL.md). */
export const PLACE_RULES=`Sen Nexus Kit'in mekân yardımcısısın. Sahibinin fotoğraf, kroki ve cevaplarından bir place.json parçası üretirsin.
Kurallar:
- Kroki ölçüsüzdür. Uzun kenarı sahibinden al; oda 3–16 m. Oda merkezi (0,0); x sağ, z kameraya doğru (+z ön). Kapı "south" = +z kenarı.
- En fazla 24 nesne; ilk taslakta 4–8. Türler yalnız: table plant frame portal seat. Tezgâh/dolap/raf → table; koltuk/sandalye/sedye → seat; bitki → plant; tablo/ekran/ayna/tabela → frame; başka siteye açılan şey → portal (yalnız gerçek https hedef varsa).
- Fotoğrafta GÖRÜNEN eşyayı koy; emin olmadığını notes'a yaz. Koordinat ya da adres uydurma.
- Etiketler ≤ 80 karakter, sahibinin dilinde, reklam dili yok. description ≤ 600 karakter, iki-üç cümle, kapıdan giren birine anlatır gibi; "en iyi", "eşsiz" gibi sıfatlar yok.
Yalnız JSON döndür, başka metin yazma. Zarf: {"task": "...", "ok": true, "result": {...}, "notes": ["..."], "confidence": 0..1}
result şekilleri:
- describe → {"description": "...", "alternatives": ["...", "..."]}
- sketch-to-plan → {"room": {"width": m, "depth": m, "items": [{"id","type","x","z","label","target"?}]}, "stations": [{"id","name","tag","anchor":[x,y,z]}], "obstacles": [{"x","z","w","d"}]}
- label → {"items": [{"id","label"}]}
- review → {"findings": [{"level":"red|yellow|green","message":"...","fix":"..."}]}`;
/** The task envelope the provider receives as the user turn. */
export function envelope(task,input={}){if(!TASKS.includes(task))throw new Error(`Görev şunlardan biri olmalı: ${TASKS.join(', ')}`);return {task,input,protocol:'nexus-kit/harness-task/0.1',answer:'JSON zarfı, başka bir şey değil'};}
/** Pull the first JSON object out of a model answer (code fences, prose around it, trailing text). */
export function extractJson(text){
 const s=String(text||'');const fenced=s.match(/```(?:json)?\s*([\s\S]*?)```/);const candidates=[fenced?fenced[1]:null,s].filter(Boolean);
 for(const c of candidates){const start=c.indexOf('{');if(start<0)continue;let depth=0,inStr=false,esc=false;for(let i=start;i<c.length;i++){const ch=c[i];if(inStr){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch==='"')inStr=false;continue;}if(ch==='"')inStr=true;else if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0){try{return JSON.parse(c.slice(start,i+1));}catch{break;}}}}}
 return null;
}
const num=v=>Number.isFinite(v)?v:Number(v);
/** Shape check per task. Returns a list of problems (Turkish, one sentence each); empty = usable. Also normalises numbers in place. */
export function validateResult(task,result,room={}){
 const errors=[];if(!result||typeof result!=='object')return ['Sonuç bir JSON nesnesi değil.'];
 if(task==='describe'){if(typeof result.description!=='string'||!result.description.trim())errors.push('description boş.');else if(result.description.length>600)errors.push('description 600 karakteri aşıyor.');if(result.alternatives!=null&&!Array.isArray(result.alternatives))errors.push('alternatives bir liste olmalı.');}
 if(task==='sketch-to-plan'){const r=result.room;if(!r||typeof r!=='object')errors.push('room yok.');else{
  r.width=num(r.width??room.width);r.depth=num(r.depth??room.depth);for(const k of ['width','depth'])if(!Number.isFinite(r[k])||r[k]<3||r[k]>16)errors.push(`room.${k} 3–16 metre olmalı.`);
  if(!Array.isArray(r.items))errors.push('room.items bir liste olmalı.');else{if(r.items.length>24)errors.push('24 nesneden fazla.');r.items.forEach((o,i)=>{if(!o||typeof o!=='object'){errors.push(`items[${i}] nesne değil.`);return;}o.x=num(o.x);o.z=num(o.z);if(!ITEM_TYPES.includes(o.type))errors.push(`items[${i}].type "${o.type}" bilinmiyor.`);if(!Number.isFinite(o.x)||!Number.isFinite(o.z)||Math.abs(o.x)>r.width/2||Math.abs(o.z)>r.depth/2)errors.push(`items[${i}] odanın dışında.`);if(o.target!=null&&o.target!==''&&!/^https:\/\//.test(String(o.target)))errors.push(`items[${i}].target https olmalı.`);o.label=String(o.label||'').slice(0,80);o.id=String(o.id||`${o.type}-${i+1}`).toLowerCase().replace(/[^a-z0-9-]+/g,'-').slice(0,40)||`${o.type}-${i+1}`;});}}
  if(result.stations!=null){if(!Array.isArray(result.stations))errors.push('stations bir liste olmalı.');else result.stations.forEach((s,i)=>{if(!Array.isArray(s?.anchor)||s.anchor.length!==3||!s.anchor.every(v=>Number.isFinite(num(v))))errors.push(`stations[${i}].anchor [x,y,z] olmalı.`);else s.anchor=s.anchor.map(num);});}
  if(result.obstacles!=null){if(!Array.isArray(result.obstacles))errors.push('obstacles bir liste olmalı.');else result.obstacles.forEach((b,i)=>{for(const k of ['x','z','w','d']){b[k]=num(b[k]);if(!Number.isFinite(b[k]))errors.push(`obstacles[${i}].${k} sayı olmalı.`);}});}}
 if(task==='label'){if(!Array.isArray(result.items))errors.push('items bir liste olmalı.');else result.items.forEach((o,i)=>{if(typeof o?.id!=='string'||typeof o?.label!=='string')errors.push(`items[${i}] id ve label içermeli.`);});}
 if(task==='review'){if(!Array.isArray(result.findings))errors.push('findings bir liste olmalı.');else result.findings.forEach((f,i)=>{if(!['red','yellow','green'].includes(f?.level))errors.push(`findings[${i}].level red/yellow/green olmalı.`);if(typeof f?.message!=='string')errors.push(`findings[${i}].message metin olmalı.`);});}
 return errors;
}
/** data: URL or {mediaType,data} → {mediaType,data}. Rejects anything that is not jpeg/png/webp or is over 1.5 MB. */
export function imageBlock(image){
 let mediaType,data;
 if(typeof image==='string'){const m=image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);if(!m)throw new Error('Görüntü jpeg/png/webp data: URL olmalı.');[,mediaType,data]=m;}
 else if(image&&typeof image==='object'){mediaType=image.mediaType;data=image.data;}
 if(!/^image\/(jpeg|png|webp)$/.test(mediaType||'')||typeof data!=='string')throw new Error('Görüntü jpeg/png/webp olmalı.');
 if(data.length>1.5*1024*1024*4/3)throw new Error('Görüntü 1,5 MB sınırını aşıyor; küçült.');
 return {mediaType,data};
}
const inBrowser=()=>typeof window!=='undefined'&&typeof document!=='undefined';
async function withTimeout(promise,ms,label){let t;const timeout=new Promise((_,rej)=>{t=setTimeout(()=>rej(new Error(`${label}: ${Math.round(ms/1000)} s içinde yanıt gelmedi.`)),ms);});try{return await Promise.race([promise,timeout]);}finally{clearTimeout(t);}}
async function callClaude({config,system,user,images,maxTokens,fetcher,signal}){
 if(!config?.apiKey)throw new Error('Claude için API anahtarı gerekli (yalnız bu oturumda tutulur).');
 const content=[...images.map(im=>({type:'image',source:{type:'base64',media_type:im.mediaType,data:im.data}})),{type:'text',text:user}];
 const headers={'content-type':'application/json','x-api-key':config.apiKey,'anthropic-version':'2023-06-01'};if(inBrowser())headers['anthropic-dangerous-direct-browser-access']='true';
 const r=await fetcher((config.baseUrl||'https://api.anthropic.com')+'/v1/messages',{method:'POST',headers,signal,body:JSON.stringify({model:config.model||DEFAULT_CLAUDE_MODEL,max_tokens:maxTokens,system,messages:[{role:'user',content}]})});
 if(!r.ok){const detail=await r.text().catch(()=>'');throw new Error(`Claude ${r.status}: ${detail.slice(0,200)||r.statusText}`);}
 const j=await r.json();return (j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\n');
}
async function callOllama({config,system,user,images,fetcher,signal}){
 const base=(config?.url||'http://127.0.0.1:11434').replace(/\/$/,'');if(!config?.model)throw new Error('Ollama için model adı gerekli (ollama list).');
 const r=await fetcher(base+'/api/chat',{method:'POST',headers:{'content-type':'application/json'},signal,body:JSON.stringify({model:config.model,stream:false,format:'json',options:{temperature:.2},messages:[{role:'system',content:system},{role:'user',content:user,...(images.length?{images:images.map(im=>im.data)}:{})}]})});
 if(!r.ok){const detail=await r.text().catch(()=>'');throw new Error(`Ollama ${r.status}: ${detail.slice(0,200)||r.statusText}`);}
 const j=await r.json();return j.message?.content||'';
}
async function callCustom({config,system,user,images,task,input,fetcher,signal}){
 if(!/^https?:\/\//.test(config?.url||''))throw new Error('custom sağlayıcı için bir https adres gerekli.');
 const r=await fetcher(config.url,{method:'POST',headers:{'content-type':'application/json',...(config.token?{authorization:'Bearer '+config.token}:{})},signal,body:JSON.stringify({system,user,task,input,images})});
 if(!r.ok)throw new Error(`Sağlayıcı ${r.status}`);const text=await r.text();return text;
}
/**
 * Run one harness task. `images` are data: URLs or {mediaType,data}. `system` defaults to PLACE_RULES; pass AGENTS.md + SKILL.md text to give the full skill.
 * Never throws for model mistakes: returns {ok:false,error} so the wizard can offer "yardımcısız devam".
 */
export async function assist({provider,task,input={},images=[],config={},system=PLACE_RULES,fetcher,timeoutMs=60000}={}){
 const env=envelope(task,input);const f=fetcher||globalThis.fetch;if(!f)return {task,ok:false,error:'fetch yok.'};
 let blocks;try{blocks=images.map(imageBlock);}catch(e){return {task,ok:false,error:e.message};}
 const user=JSON.stringify(env);const maxTokens=MAX_TOKENS[task];const controller=typeof AbortController!=='undefined'?new AbortController():null;
 const call={provider,config,system,user,images:blocks,maxTokens,task,input,fetcher:f,signal:controller?.signal};
 let text;
 try{
  const p=provider==='claude-api'?callClaude(call):provider==='ollama'?callOllama(call):provider==='custom'?callCustom(call):Promise.reject(new Error(`Sağlayıcı bilinmiyor: ${provider}`));
  text=await withTimeout(p,timeoutMs,'Yardımcı');
 }catch(e){controller?.abort();return {task,ok:false,error:e.message};}
 const parsed=extractJson(text);if(!parsed)return {task,ok:false,error:'Yardımcı JSON döndürmedi.',raw:String(text).slice(0,400)};
 const result=parsed.result&&typeof parsed.result==='object'?parsed.result:parsed; // tolerate a bare result without the envelope
 const errors=validateResult(task,result,input.room||{});
 if(errors.length)return {task,ok:false,error:'Yardımcının cevabı şemaya uymadı: '+errors.join(' '),result};
 const notes=Array.isArray(parsed.notes)?parsed.notes.map(String).slice(0,12):[];const confidence=Number.isFinite(Number(parsed.confidence))?Math.max(0,Math.min(1,Number(parsed.confidence))):null;
 return {task,ok:true,result,notes,confidence};
}
/** Current Claude model ids (for the owner to choose one); the key stays with the request. */
export async function listClaudeModels(apiKey,{fetcher,baseUrl='https://api.anthropic.com'}={}){
 const f=fetcher||globalThis.fetch;const headers={'x-api-key':apiKey,'anthropic-version':'2023-06-01'};if(inBrowser())headers['anthropic-dangerous-direct-browser-access']='true';
 const r=await f(baseUrl+'/v1/models',{headers});if(!r.ok)throw new Error(`Claude ${r.status}`);const j=await r.json();return (j.data||[]).map(m=>({id:m.id,name:m.display_name||m.id}));
}
