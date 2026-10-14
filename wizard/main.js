import './style.css';
import { zipSync, strToU8 } from 'fflate';
import { createWorld } from '../templates/site/src/world.js';
import { starterFiles, aiBrief } from '../lib/starter.mjs';
import { readySiteFiles } from '../lib/ready-site.mjs';
import readyRuntime from 'virtual:nexus-ready-runtime';
import { manifestFrom, validateManifest, slug } from '../lib/manifest.mjs';
import license from '../LICENSE-APACHE?raw';

const sources = Object.fromEntries(Object.entries(import.meta.glob('../templates/site/**/*', {query:'?raw',import:'default',eager:true})).map(([p,s])=>[p.replace('../templates/site/',''),s]));
sources['public/.nojekyll']=''; sources.LICENSE=license;
const $=s=>document.querySelector(s), message=$('#message');
let step=0, language=new URLSearchParams(location.search).get('lang')==='en'?'en':'tr', world, photos=[], extraLinks=[], importedOptions={}, lastMetrics;
const say=(tr,en)=>language==='tr'?tr:en;
const types={table:['Masa','Table'],seat:['Koltuk','Seat'],plant:['Bitki','Plant'],frame:['Eser','Artwork'],portal:['Geçit','Portal']};
const seedLabels={worktable:['Çalışma masası','Workbench'],plant:['Bitki','Plant'],seat:['Birlikte düşün','Think together'],portal:['Başka bir dünya','Another world']};
let items=[{id:'worktable',type:'table',x:0,z:-.8,label:''},{id:'plant',type:'plant',x:-2.7,z:-2,label:''},{id:'seat',type:'seat',x:2,z:0,label:''},{id:'portal',type:'portal',x:2.7,z:-2.5,label:''}];

function read(){return {...importedOptions,id:slug($('#name').value),name:$('#name').value,kind:$('#kind').value,url:$('#url').value,description:$('#description').value,language,room:{width:Number($('#width').value),depth:Number($('#depth').value),items},links:[...($('#link-url').value?[{object:$('#link-label').value,relation:'portal',url:$('#link-url').value}]:[]),...extraLinks]};}
function metrics(m){lastMetrics=m;$('#metrics').textContent=m.triangles.toLocaleString(language==='tr'?'tr-TR':'en-US')+say(' üçgen · ',' tris · ')+m.drawCalls+say(' çizim',' calls');}
function translate(){
 document.documentElement.lang=language;document.title=say('Nexus Kit — Mekânını kur','Nexus Kit — Build your place');
 $('#language').value=language;$('#language').setAttribute('aria-label',say('Dil','Language'));
 document.querySelectorAll('[data-tr]').forEach(el=>{const value=el.dataset[language];if(el.tagName==='H1')el.innerHTML=value;else el.textContent=value;});
 for(const [id,tr,en]of [['name','Açık Atölye','Open Studio'],['description','Birlikte üretmek ve fikir paylaşmak için küçük bir atölye.','A small studio for making things and sharing ideas.']])if(!$('#'+id).dataset.edited)$('#'+id).value=say(tr,en);
 for(const item of items)if(seedLabels[item.id])item.label=seedLabels[item.id][language==='tr'?0:1];
 $('#world').setAttribute('aria-label',say('3B önizleme. Döndürmek için sürükle, yaklaşmak için kaydır.','3D preview. Drag to orbit, scroll to zoom.'));
 $('.steps').setAttribute('aria-label',say('Kurulum adımları','Setup steps'));
 $('#item-type').setAttribute('aria-label',say('Nesne türü','Object type'));
 renderItems();if(lastMetrics)metrics(lastMetrics);message.textContent='';
}
function show(){document.querySelectorAll('[data-panel]').forEach(el=>el.hidden=Number(el.dataset.panel)!==step);document.querySelectorAll('[data-step]').forEach(el=>{el.classList.toggle('active',Number(el.dataset.step)===step);el.setAttribute('aria-current',Number(el.dataset.step)===step?'step':'false');});$('#previous').disabled=step===0;$('#next').hidden=step===2;message.textContent='';}
function refresh(){const p=read();if(p.room.width>=3&&p.room.width<=16&&p.room.depth>=3&&p.room.depth<=16)world?.update(p);}
function renderItems(){
 const list=$('#items');list.replaceChildren();
 for(const [i,item]of items.entries()){
  const row=document.createElement('div');row.className='item';
  const heading=document.createElement('div');heading.className='item-heading';
  const label=document.createElement('input');label.value=item.label;label.maxLength=80;label.setAttribute('aria-label',say('Nesne '+(i+1)+' etiketi','Object '+(i+1)+' label'));
  label.addEventListener('input',()=>{item.label=label.value;delete seedLabels[item.id];});
  const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',say('Nesne '+(i+1)+' kaldır','Remove object '+(i+1)));
  remove.addEventListener('click',()=>{items.splice(i,1);renderItems();refresh();});heading.append(label,remove);row.append(heading);
  const pair=document.createElement('div');pair.className='pair';
  for(const axis of ['x','z']){
   const l=document.createElement('label'),text=document.createElement('span'),slider=document.createElement('input');
   slider.type='range';const bound=Number($(axis==='x'?'#width':'#depth').value)/2;slider.min=-bound;slider.max=bound;slider.step=.1;slider.value=item[axis];
   text.textContent=axis.toUpperCase()+' · '+item[axis].toFixed(1)+' m';slider.setAttribute('aria-label',types[item.type][language==='tr'?0:1]+' '+(i+1)+' '+axis);
   slider.addEventListener('input',()=>{item[axis]=Number(slider.value);text.textContent=axis.toUpperCase()+' · '+item[axis].toFixed(1)+' m';refresh();});l.append(text,slider);pair.append(l);
  }
  row.append(pair);list.append(row);
 }
}
function download(name,data,type){
 const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');
 a.href=url;a.download=name;a.textContent=say('İndirmeyi aç: ','Open download: ')+name;
 // Keep a real visible link available if the browser blocks the automatic download.
 message.replaceChildren(a);a.click();
 setTimeout(()=>URL.revokeObjectURL(url),120000);
}
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=Number(b.dataset.step);show();}));
$('#next').onclick=()=>{step=Math.min(2,step+1);show();};$('#previous').onclick=()=>{step=Math.max(0,step-1);show();};
$('#language').onchange=e=>{language=e.target.value;translate();};
$('#form').onsubmit=e=>e.preventDefault();
$('#form').addEventListener('input',e=>{if(['name','description'].includes(e.target.id))e.target.dataset.edited='true';if(['width','depth'].includes(e.target.id)){renderItems();refresh();}});
$('#add').onclick=()=>{if(items.length>=24){message.textContent=say('En fazla 24 nesne ekleyebilirsin.','You can add at most 24 objects.');return;}const type=$('#item-type').value;items.push({id:crypto.randomUUID().slice(0,8),type,x:0,z:0,label:types[type][language==='tr'?0:1]});renderItems();refresh();};
$('#photos').onchange=e=>{
 photos.forEach(URL.revokeObjectURL);photos=[];$('#references').replaceChildren();
 for(const f of [...e.target.files].slice(0,4)){
  if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024){message.textContent=say('Yalnız JPEG/PNG/WebP; referans başına en fazla 10 MB.','JPEG/PNG/WebP only; at most 10 MB per reference.');continue;}
  const url=URL.createObjectURL(f);photos.push(url);const img=document.createElement('img');img.src=url;img.alt=say('Yerel referans','Local reference');$('#references').append(img);
 }
};
$('#brief').onclick=()=>download('nexus-design-brief-'+language+'.txt',aiBrief(read()),'text/plain');
$('#import').onchange=async e=>{
 try{
  const f=e.target.files[0];if(!f)return;
  if(f.size>256*1024)throw Error(say('JSON 256 KB’tan küçük olmalı.','JSON must be smaller than 256 KB.'));
  let p;try{p=JSON.parse(await f.text());}catch{throw Error(say('Dosya geçerli bir JSON değil.','This file is not valid JSON.'));}
  let m;try{m=manifestFrom(p);}catch{throw Error(say('JSON yapısını kontrol et: room.items ve links liste olmalı.','Check the JSON structure: room.items and links must be lists.'));}
  const errors=validateManifest(m,language);if(errors.length)throw Error(errors.join('\n'));
  if(!m.room)throw Error(say('Bu sihirbaz için bir oda gerekli.','This wizard requires a room.'));
  for(const key of ['name','url','kind','description']){$('#'+key).value=m[key];$('#'+key).dataset.edited='true';}
  // Preserve only validated public options when editing an exported project.
  const clean=JSON.parse(starterFiles(p,sources)['place.json']);
  importedOptions={palette:clean.palette,translations:clean.translations};
  $('#width').value=m.room.width;$('#depth').value=m.room.depth;items=m.room.items;
  for(const id of Object.keys(seedLabels))delete seedLabels[id];
  extraLinks=m.links.slice(1);$('#link-label').value=m.links[0]?.object||'';$('#link-url').value=m.links[0]?.url||'';
  renderItems();refresh();message.textContent=say('JSON alındı. Dışa aktarmadan önce gözden geçir.','JSON imported. Review before exporting.')+(extraLinks.length?say(' Ek bağlantılar korunuyor: ',' Additional links preserved: ')+extraLinks.length:'');
 }catch(err){message.textContent=err.message;}
};
$('#download').onclick=()=>{
 try{
  const p=read(),files=readySiteFiles(p,sources,readyRuntime);
  download(slug(p.name)+'-site.zip',zipSync(Object.fromEntries(Object.entries(files).map(([name,text])=>[name,strToU8(text)]))),'application/zip');
  message.append(document.createTextNode(say(' — ZIP’i aç; içindekileri kendi HTTPS sitenin köküne yükle. Node/npm gerekmez. START-HERE.txt rehberini izle.',' — Extract and upload the contents to your own HTTPS site root. No Node/npm needed. Follow START-HERE.txt.')));
 }catch(err){message.textContent=err.message;}
};
$('#download-source').onclick=()=>{
 try{
  const p=read(),files=starterFiles(p,sources);
  download(slug(p.name)+'-source.zip',zipSync(Object.fromEntries(Object.entries(files).map(([name,text])=>[name,strToU8(text)]))),'application/zip');
  message.append(document.createTextNode(say(' — ZIP’i aç, npm install ve npm run dev çalıştır.',' — Extract, run npm install and npm run dev.')));
 }catch(err){message.textContent=err.message;}
};
translate();show();
try{world=createWorld($('#world'),read(),metrics);}catch{$('#fallback').hidden=false;}
