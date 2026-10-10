// SPDX-License-Identifier: Apache-2.0
import place from '../place.json';
import {createWorld} from './world.js';
import {ui} from './i18n.js';
import './style.css';
let language=place.language==='tr'?'tr':'en',state='ready',lastMetrics;
const $=s=>document.querySelector(s),nav=$('#links'),seen=new Set();
for(const link of [...(place.links||[]),...(place.room?.items||[]).filter(o=>o.target).map(o=>({url:o.target,object:o.label||o.type}))]){
 let url;try{url=new URL(link.url||link.target);if(url.protocol!=='https:'||url.username||url.password)continue;}catch{continue;}
 if(seen.has(url.href))continue;seen.add(url.href);
 const a=document.createElement('a');a.href=url.href;a.textContent=(link.object||url.hostname)+' ↗';a.rel='noopener noreferrer';nav.append(a);
}
function translate(){
 const words=ui[language],content=place.translations?.[language]||{};
 document.documentElement.lang=language;document.title=content.name||place.name;
 $('#name').textContent=content.name||place.name;$('#story').textContent=content.description||place.description;
 $('#language').value=language;$('#language').setAttribute('aria-label',words.language);
 document.querySelectorAll('[data-ui]').forEach(el=>el.textContent=words[el.dataset.ui]);
 $('#world').setAttribute('aria-label',words.world);nav.setAttribute('aria-label',words.links);
 if(!seen.size)nav.textContent=words.empty;
 $('#status').textContent=words[state];
 if(lastMetrics)$('#metrics').textContent=lastMetrics.triangles.toLocaleString(language==='tr'?'tr-TR':'en-US')+' '+words.triangles+' · '+lastMetrics.drawCalls+' '+words.calls;
}
$('#language').onchange=e=>{language=e.target.value;translate();};
translate();
try{
 const world=createWorld($('#world'),place,m=>{lastMetrics=m;translate();});
 $('#model').onclick=async()=>{const button=$('#model');button.disabled=true;try{await world.loadModel(new URL('models/place.glb',document.baseURI).href);state='loaded';}catch{state='missing';}finally{button.disabled=false;translate();}};
}catch{state='unavailable';$('#model').hidden=true;translate();}
