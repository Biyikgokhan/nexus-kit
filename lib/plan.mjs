// Plan tools for `sketch`: ASCII plan of a room, the offline grid file → items path, proposal merge, and the
// navigation draft (zones / obstacles / locations) the modeler path starts from. Pure functions, no I/O.
import {ITEM_TYPES} from '../harness/client.mjs';
export const GLYPH={table:'T',seat:'S',plant:'P',frame:'F',portal:'O'};
const TYPE_OF=Object.fromEntries(Object.entries(GLYPH).map(([t,g])=>[g,t]));
const FOOT={table:[1.2,.7],seat:[.9,.9],plant:[.5,.5],frame:[.9,.15],portal:[1,.3]}; // metres, w × d
/** Top view: one character per 0.5 m cell, walls around, door marked on its side. */
export function asciiPlan(place){
 const r=place.room||{};const w=Math.max(3,Math.min(16,Number(r.width)||8)),d=Math.max(3,Math.min(16,Number(r.depth)||6));
 const cols=Math.round(w*2),rows=Math.round(d*2);const grid=Array.from({length:rows},()=>Array(cols).fill('·'));
 (r.items||[]).forEach((o,i)=>{const c=Math.min(cols-1,Math.max(0,Math.floor((Number(o.x)+w/2)*2))),row=Math.min(rows-1,Math.max(0,Math.floor((Number(o.z)+d/2)*2)));grid[row][c]=GLYPH[o.type]||'?';});
 const door=r.door||'south';const top=door==='north'?'▒':'─',bottom=door==='south'?'▒':'─';
 const lines=['┌'+top.repeat(cols)+'┐',...grid.map((line,i)=>(door==='west'&&i===Math.floor(rows/2)?'▒':'│')+line.join('')+(door==='east'&&i===Math.floor(rows/2)?'▒':'│')),'└'+bottom.repeat(cols)+'┘'];
 const legend=(r.items||[]).map((o,i)=>`${GLYPH[o.type]||'?'} ${o.id||i}: ${o.label||o.type}${o.target?' → '+o.target:''} (${o.x}, ${o.z})`);
 return [`${place.name||'Mekân'} · ${w} × ${d} m · kapı ${door} (▒) · 1 karakter = 0,5 m · x sağa, z aşağıya (+z = ön)`,...lines,...legend].join('\n');
}
/**
 * Offline path: a text grid drawn by the owner (reference/plan.txt). Letters place objects, anything else is floor.
 *   T table · S seat · P plant · F frame · O portal (a digit after a letter is ignored: "T1")
 * Each character is one cell; the grid is stretched to the room size, so a 16×12 drawing of an 8×6 m room is 0.5 m per cell.
 */
export function parseGridPlan(text,{width,depth}){
 const rows=String(text).replace(/\r/g,'').split('\n').filter(l=>l.trim().length&&!l.trim().startsWith('#'));
 if(!rows.length)throw new Error('Plan dosyası boş.');
 const cols=Math.max(...rows.map(l=>l.length));const items=[];const count={};
 rows.forEach((line,ri)=>{for(let ci=0;ci<line.length;ci++){const g=line[ci].toUpperCase();const type=TYPE_OF[g];if(!type)continue;if(/[0-9]/.test(line[ci+1]||''))ci++;count[type]=(count[type]||0)+1;
  const x=+(((ci+.5)/cols-.5)*width).toFixed(2),z=+(((ri+.5)/rows.length-.5)*depth).toFixed(2);items.push({id:`${type}-${count[type]}`,type,x,z,label:''});}});
 if(items.length>24)throw new Error(`Planda ${items.length} nesne var; en fazla 24.`);
 return items;
}
/** Merge a sketch-to-plan result into place.json (validated upstream). Keeps the owner's name/url/etc.; replaces room items, stations and obstacles. */
export function applyProposal(place,result){
 const next=structuredClone(place);const room=result.room||{};
 next.room={...(next.room||{}),width:room.width??next.room?.width,depth:room.depth??next.room?.depth,items:(room.items||[]).filter(o=>ITEM_TYPES.includes(o.type)).map(o=>({id:o.id,type:o.type,x:o.x,z:o.z,label:o.label||'',...(o.target?{target:o.target}:{})}))};
 if(Array.isArray(result.stations)&&result.stations.length)next.stations=result.stations.map((s,i)=>({id:String(s.id||`s${i+1}`),number:String(i+1).padStart(2,'0'),name:String(s.name||'').slice(0,80),tag:String(s.tag||'').slice(0,80),anchor:s.anchor}));
 if(Array.isArray(result.obstacles))next.obstacles=result.obstacles.map(b=>({x:b.x,z:b.z,w:b.w,d:b.d}));
 next.geometry='photo-sketch-and-owner-layout-interpretation';
 return next;
}
/**
 * Navigation draft in the KG Atelier convention: zones = walkable rectangles [x1,x2,z1,z2], obstacles = item footprints + 5 cm,
 * locations = one eye point per station or item (1.2 m in front, eye 1.62). Corridors under 0.7 m are reported, not fixed.
 */
export function planToNavigation(place){
 const r=place.room||{};const w=Number(r.width)||8,d=Number(r.depth)||6;const zones=[[-w/2,w/2,-d/2,d/2]];
 const obstacles=(r.items||[]).map(o=>{const [fw,fd]=FOOT[o.type]||[.8,.8];return [+(o.x-fw/2-.05).toFixed(2),+(o.x+fw/2+.05).toFixed(2),+(o.z-fd/2-.05).toFixed(2),+(o.z+fd/2+.05).toFixed(2)];});
 if(Array.isArray(place.obstacles))for(const b of place.obstacles)obstacles.push([+(b.x-b.w/2).toFixed(2),+(b.x+b.w/2).toFixed(2),+(b.z-b.d/2).toFixed(2),+(b.z+b.d/2).toFixed(2)]);
 const locations={};const src=Array.isArray(place.stations)&&place.stations.length?place.stations.map(s=>({id:s.id,name:s.name,x:s.anchor[0],z:s.anchor[2],y:s.anchor[1]})):(r.items||[]).map(o=>({id:o.id,name:o.label||o.type,x:o.x,z:o.z,y:1.1}));
 for(const s of src){const toward=s.z<0?1:-1;const z=+(s.z+toward*1.2).toFixed(2);locations[s.id]={position:[+s.x.toFixed(2),1.62,Math.max(-d/2+.4,Math.min(d/2-.4,z))],look:[+s.x.toFixed(2),s.y??1.1,+s.z.toFixed(2)],title:s.name};}
 const warnings=[];for(let i=0;i<obstacles.length;i++)for(let j=i+1;j<obstacles.length;j++){const a=obstacles[i],b=obstacles[j];const gapX=Math.max(b[0]-a[1],a[0]-b[1]),gapZ=Math.max(b[2]-a[3],a[2]-b[3]);const gap=Math.max(gapX,gapZ);if(gap>0&&gap<.7)warnings.push(`${(r.items[i]||{}).id||i} ile ${(r.items[j]||{}).id||j} arası ${gap.toFixed(2)} m; koridor ≥ 0,7 m olmalı.`);}
 (r.items||[]).forEach((it,i)=>{const o=obstacles[i];if(!o||it.type==='frame'||it.type==='portal')return; /* frames and portals hang on walls */ if(o[0]<-w/2||o[1]>w/2||o[2]<-d/2||o[3]>d/2)warnings.push(`${it.id||i} duvara gömülü; kenardan en az yarım ayak izi uzaklaştır.`);});
 return {zones,obstacles,locations,eyeHeight:1.62,warnings};
}
