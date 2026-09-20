// nexus-interlink/0.2 manifest: validation without dependencies (mirrors schema/nexus-interlink-0.2.schema.json
// and Fudō src/nexus/data.js validateNode/manifestFor). Errors are Turkish, one sentence, for the CLI and the wizard.
export const PROTOCOL='nexus-interlink/0.2';
export const KINDS=['studio','garden','simulation','gallery','shop'];
export const ITEM_TYPES=['table','plant','frame','portal','seat'];
export function safeUrl(value){try{const u=new URL(String(value||''));return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function slug(name){return String(name||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'mekan';}
/** Returns a list of problems; empty means valid. */
export function validateManifest(m){
 const errors=[];const push=s=>errors.push(s);
 if(!m||typeof m!=='object')return ['Manifest bir JSON nesnesi olmalı.'];
 if(m.protocol!==PROTOCOL)push(`protocol "${PROTOCOL}" olmalı.`);
 if(!/^[a-z0-9][a-z0-9-]{1,39}$/.test(String(m.id||'')))push('id küçük harf, rakam ve tire ile 2–40 karakter olmalı.');
 const name=String(m.name||'').trim();if(name.length<2||name.length>70)push('name 2–70 karakter olmalı.');
 if(!safeUrl(m.url))push('url https:// ile başlamalı ve kimlik bilgisi içermemeli.');
 if(!KINDS.includes(m.kind))push(`kind şunlardan biri olmalı: ${KINDS.join(', ')}.`);
 if(typeof m.description!=='string'||m.description.length>600)push('description en fazla 600 karakter bir metin olmalı.');
 if(m.address!=null&&(typeof m.address!=='string'||m.address.length>250))push('address en fazla 250 karakter olmalı ya da null.');
 if(m.coordinates!=null){const c=m.coordinates;if(typeof c!=='object'||!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||Math.abs(c.latitude)>90||Math.abs(c.longitude)>180)push('coordinates {latitude −90…90, longitude −180…180} olmalı.');else if(!m.coordinateSource)push('coordinates varsa coordinateSource da olmalı.');}
 if(m.anchorId!=null&&!/^[a-z0-9][a-z0-9-]{1,39}$/.test(String(m.anchorId)))push('anchorId geçerli bir id olmalı.');
 if(typeof m.engine!=='string'||!m.engine||m.engine.length>40)push('engine kısa bir metin olmalı (örn. fudo-three).');
 if(m.room!=null){const r=m.room;if(typeof r!=='object')push('room bir nesne olmalı.');else{
  for(const k of ['width','depth'])if(!Number.isFinite(r[k])||r[k]<3||r[k]>16)push(`room.${k} 3–16 metre olmalı.`);
  if(!Array.isArray(r.items))push('room.items bir liste olmalı.');else{if(r.items.length>24)push('room.items en fazla 24 nesne içerebilir.');
   r.items.forEach((o,i)=>{if(!ITEM_TYPES.includes(o?.type))push(`room.items[${i}].type bilinmiyor.`);if(!Number.isFinite(o?.x)||!Number.isFinite(o?.z)||Math.abs(o.x)>(r.width||0)/2||Math.abs(o.z)>(r.depth||0)/2)push(`room.items[${i}] krokinin içinde olmalı.`);if(o?.target&&!safeUrl(o.target))push(`room.items[${i}].target https olmalı.`);if(o?.label!=null&&String(o.label).length>80)push(`room.items[${i}].label en fazla 80 karakter.`);});}}}
 if(m.photos!=null){if(!Array.isArray(m.photos)||m.photos.length>3)push('photos en fazla 3 öğe olmalı.');else m.photos.forEach((p,i)=>{if(typeof p!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p)||p.length>1500000)push(`photos[${i}] jpeg/png/webp data: URI ve < 1,5 MB olmalı.`);});}
 if(!Array.isArray(m.links))push('links bir liste olmalı (boş olabilir).');else{if(m.links.length>60)push('links en fazla 60.');m.links.forEach((l,i)=>{if(!['portal','reference'].includes(l?.relation))push(`links[${i}].relation portal ya da reference olmalı.`);if(!safeUrl(l?.url))push(`links[${i}].url https olmalı.`);if(typeof l?.object!=='string'||l.object.length>80)push(`links[${i}].object en fazla 80 karakter bir metin olmalı.`);});}
 if(m.aliases!=null&&(!Array.isArray(m.aliases)||m.aliases.length>5||!m.aliases.every(safeUrl)))push('aliases en fazla 5 https adres olmalı.');
 return errors;
}
/** place.json → manifest. Portal items and named links both become links; the room keeps its shape. */
export function manifestFrom(place){
 const links=[];
 for(const l of place.links||[]){const url=safeUrl(l.target||l.url);if(url)links.push({object:String(l.object||'').slice(0,80),relation:l.relation==='reference'?'reference':'portal',url});}
 for(const o of place.room?.items||[]){const url=safeUrl(o.target);if(url)links.push({object:String(o.label||o.type).slice(0,80),relation:'portal',url});}
 const room=place.room?{width:Number(place.room.width),depth:Number(place.room.depth),items:(place.room.items||[]).map((o,i)=>({id:String(o.id??i),type:o.type,x:Number(o.x),z:Number(o.z),label:String(o.label||'').slice(0,80),target:safeUrl(o.target)||''}))}:null;
 const m={protocol:PROTOCOL,id:place.id||slug(place.name),name:String(place.name||'').trim(),url:safeUrl(place.url)||'',kind:place.kind,description:String(place.description||'').trim().slice(0,600),address:place.address?String(place.address).slice(0,250):null,coordinates:place.coordinates?{latitude:Number(place.coordinates.latitude),longitude:Number(place.coordinates.longitude)}:null,anchorId:place.anchorId||null,coordinateSource:place.coordinates?(place.coordinateSource||'Mekân sahibinin beyanı'):null,engine:place.engine||'fudo-three',room,photos:(place.photos||[]).filter(p=>typeof p==='string'&&p.startsWith('data:')).slice(0,3),links};
 if(Array.isArray(place.aliases)&&place.aliases.length)m.aliases=place.aliases.filter(safeUrl);
 m.extensions={...(place.extensions||{}),nexusKit:{version:'0.1',path:place.nexusKit?.path||'modeler',geometry:'photo-sketch-and-owner-layout-interpretation',checkedAt:new Date().toISOString(),...(place.nexusKit?.tag?{tag:String(place.nexusKit.tag).slice(0,60)}:{})}};
 return m;
}
