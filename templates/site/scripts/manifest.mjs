// SPDX-License-Identifier: Apache-2.0
// Rebuild only public identity and room data. Reference media stays private.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const place=JSON.parse(readFileSync(new URL('place.json',root),'utf8'));
const https=value=>{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('Use an HTTPS URL without credentials.');return u.href;};
const room=place.room;
if(!room||!Number.isFinite(room.width)||!Number.isFinite(room.depth)||room.width<3||room.width>16||room.depth<3||room.depth>16||!Array.isArray(room.items)||room.items.length>24)throw Error('A room needs width/depth 3–16 m and up to 24 items.');
const items=room.items.map((o,i)=>{
 if(!['table','seat','plant','frame','portal'].includes(o?.type)||!Number.isFinite(o.x)||!Number.isFinite(o.z)||Math.abs(o.x)>room.width/2||Math.abs(o.z)>room.depth/2)throw Error('Invalid room item '+i);
 return {id:String(o.id||'item-'+i).slice(0,40),type:o.type,x:o.x,z:o.z,label:String(o.label||'').slice(0,80),target:o.target?https(o.target):''};
});
const id=place.id||String(place.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);
if(!/^[a-z0-9][a-z0-9-]{1,39}$/.test(id)||typeof place.name!=='string'||place.name.trim().length<2||place.name.length>70||typeof place.description!=='string'||place.description.length>600||!['studio','garden','simulation','gallery','shop'].includes(place.kind))throw Error('Invalid place identity.');
const links=(place.links||[]).map(l=>({object:String(l.object||'').slice(0,80),relation:l.relation==='reference'?'reference':'portal',url:https(l.url||l.target)}));
for(const o of items)if(o.target)links.push({object:o.label||o.type,relation:'portal',url:o.target});
if(links.length>60)throw Error('At most 60 links are allowed.');
const manifest={protocol:'nexus-interlink/0.2',id,name:place.name,url:https(place.url),kind:place.kind,description:place.description,engine:'nexus-starter',room:{width:room.width,depth:room.depth,items},links,photos:[],extensions:{nexusKit:{version:'0.3.0',path:'easy',geometry:'photo-sketch-and-owner-layout-interpretation'}}};
mkdirSync(new URL('public/.well-known/',root),{recursive:true});
for(const path of ['public/nexus.json','public/.well-known/nexus.json'])writeFileSync(new URL(path,root),JSON.stringify(manifest,null,2)+'\n');
