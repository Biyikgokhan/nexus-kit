/* Dock: the editor's window system, Ableton-style. Every panel (outliner, properties, world, textures, sound, help)
   is a tab in one of three zones — left, right, bottom — or a floating window. Tabs drag between zones or out into
   a float; zones and floats resize; anything collapses to a strip; a lock freezes the arrangement. The layout is
   one JSON in localStorage, shared by every world, so the atelier, the star and the cave open with the same desk. */
const ZONES=['left','right','bottom'];const MIN={left:180,right:220,bottom:120};
export function createDock(host,{panels,defaults={},storageKey='kg-editor-layout',onChange=()=>{}}){
 const byId=new Map(panels.map(p=>[p.id,p]));
 const fresh=()=>({v:1,lock:false,hidden:[],floats:{},zones:Object.fromEntries(ZONES.map(z=>[z,{size:defaults.sizes?.[z]||(z==='bottom'?220:280),collapsed:Boolean(defaults.collapsed?.[z]),active:(defaults[z]||[])[0]||null,panels:[...(defaults[z]||[])]}]))});
 let state=null;try{const s=JSON.parse(localStorage.getItem(storageKey)||'null');if(s&&s.v===1)state=s;}catch{}
 if(!state)state=fresh();
 // every known panel lives somewhere; ids from older layouts that no longer exist are dropped
 const placed=new Set();for(const z of ZONES){state.zones[z].panels=state.zones[z].panels.filter(id=>byId.has(id)&&!placed.has(id)&&placed.add(id));}
 for(const id of Object.keys(state.floats))if(!byId.has(id)||placed.has(id))delete state.floats[id];else placed.add(id);
 state.hidden=(state.hidden||[]).filter(id=>byId.has(id)&&!placed.has(id)&&placed.add(id));
 for(const p of panels)if(!placed.has(p.id)){const z=ZONES.find(z=>(defaults[z]||[]).includes(p.id))||'bottom';state.zones[z].panels.push(p.id);}
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}onChange(state);};
 /* ── DOM ── */
 const root=document.createElement('div');root.className='ed-dock';host.append(root);
 const zoneEl={},bodyEl={},tabsEl={};for(const z of ZONES){const el=document.createElement('section');el.className='ed-zone ed-zone-'+z;el.dataset.zone=z;el.innerHTML='<div class="ed-tabs"></div><div class="ed-zone-body"></div>';root.append(el);zoneEl[z]=el;tabsEl[z]=el.firstElementChild;bodyEl[z]=el.lastElementChild;}
 const splits={};for(const z of ZONES){const s=document.createElement('div');s.className='ed-split ed-split-'+z;root.append(s);splits[z]=s;}
 const drops={};for(const z of ZONES){const d=document.createElement('div');d.className='ed-drop ed-drop-'+z;d.textContent={left:'◧ sol',right:'◨ sağ',bottom:'⬓ alt'}[z];root.append(d);drops[z]=d;}
 const floatLayer=document.createElement('div');floatLayer.className='ed-floats';root.append(floatLayer);const floatEl={};
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function zoneOf(id){return ZONES.find(z=>state.zones[z].panels.includes(id))||null;}
 function detach(id){for(const z of ZONES){const zs=state.zones[z];const i=zs.panels.indexOf(id);if(i>=0){zs.panels.splice(i,1);if(zs.active===id)zs.active=zs.panels[Math.min(i,zs.panels.length-1)]||null;}}delete state.floats[id];state.hidden=state.hidden.filter(x=>x!==id);}
 function dockTo(id,z,index){detach(id);const zs=state.zones[z];zs.panels.splice(index??zs.panels.length,0,id);zs.active=id;zs.collapsed=false;render();save();}
 function floatAt(id,x,y,w,h){detach(id);const prev=state.floats[id];const hr=root.getBoundingClientRect();w=Math.max(300,w||prev?.w||360);h=Math.max(220,h||prev?.h||320);state.floats[id]={x:Math.max(0,Math.min(x,hr.width-w)),y:Math.max(0,Math.min(y,hr.height-h)),w,h,collapsed:false};render();save();} // floats never leave the dock and never shrink below a usable size
 function render(){
  root.classList.toggle('lock',Boolean(state.lock));
  for(const z of ZONES){const zs=state.zones[z],el=zoneEl[z];const empty=!zs.panels.length;el.classList.toggle('empty',empty);el.classList.toggle('collapsed',zs.collapsed&&!empty);
   root.style.setProperty('--'+z[0],empty?'0px':zs.collapsed?'28px':zs.size+'px');splits[z].classList.toggle('off',empty||zs.collapsed);
   if(!zs.active||!zs.panels.includes(zs.active))zs.active=zs.panels[0]||null;
   tabsEl[z].innerHTML=zs.panels.map(id=>`<button type="button" class="ed-tab${id===zs.active?' on':''}" data-tab="${id}" draggable="false" title="${esc(byId.get(id).title)} · sürükle: taşı">${esc(byId.get(id).title)}</button>`).join('')+`<span class="ed-tabgap"></span><button type="button" class="ed-zbtn" data-zcollapse title="${zs.collapsed?'Aç':'Katla'}">${zs.collapsed?(z==='bottom'?'▴':'▸'):'▾'}</button><button type="button" class="ed-zbtn" data-zfloat title="Sekmeyi pencereye çıkar">⧉</button><button type="button" class="ed-zbtn" data-zhide title="Sekmeyi gizle">×</button>`;
   for(const id of zs.panels){const p=byId.get(id);if(p.el.parentElement!==bodyEl[z])bodyEl[z].append(p.el);p.el.classList.toggle('ed-pane-off',id!==zs.active||zs.collapsed);p.el.classList.add('ed-pane');}
  }
  for(const id of Object.keys(floatEl))if(!state.floats[id]){floatEl[id].remove();delete floatEl[id];}
  for(const [id,f] of Object.entries(state.floats)){const p=byId.get(id);let el=floatEl[id];if(!el){el=document.createElement('section');el.className='ed-float';el.dataset.float=id;el.innerHTML=`<div class="ed-fhead"><b>${esc(p.title)}</b><span class="ed-tabgap"></span><button type="button" class="ed-zbtn" data-fcollapse title="Katla">▾</button><button type="button" class="ed-zbtn" data-fdock title="Sağ bölgeye yerleştir">⇲</button><button type="button" class="ed-zbtn" data-fhide title="Gizle">×</button></div><div class="ed-fbody"></div><div class="ed-fres"></div>`;floatLayer.append(el);floatEl[id]=el;}
   const body=el.querySelector('.ed-fbody');if(p.el.parentElement!==body)body.append(p.el);p.el.classList.remove('ed-pane-off');p.el.classList.add('ed-pane');
   el.classList.toggle('collapsed',Boolean(f.collapsed));el.style.left=f.x+'px';el.style.top=f.y+'px';el.style.width=f.w+'px';el.style.height=f.collapsed?'auto':f.h+'px';el.querySelector('[data-fcollapse]').textContent=f.collapsed?'▸':'▾';}
  for(const id of state.hidden){const p=byId.get(id);p.el.classList.add('ed-pane-off');if(!p.el.parentElement)root.append(p.el);}
 }
 /* ── clicks ── */
 root.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const zone=t.closest('.ed-zone')?.dataset.zone,fl=t.closest('.ed-float')?.dataset.float;
  if(t.dataset.tab!==undefined){const zs=state.zones[zone];if(zs.active===t.dataset.tab&&!zs.collapsed)zs.collapsed=false;zs.active=t.dataset.tab;zs.collapsed=false;render();save();}
  else if(t.dataset.zcollapse!==undefined){state.zones[zone].collapsed=!state.zones[zone].collapsed;render();save();}
  else if(t.dataset.zfloat!==undefined){const id=state.zones[zone].active;if(id){const r=zoneEl[zone].getBoundingClientRect(),hr=root.getBoundingClientRect();floatAt(id,r.left-hr.left+30,Math.max(20,r.top-hr.top-200),420,340);}}
  else if(t.dataset.zhide!==undefined){const id=state.zones[zone].active;if(id)hide(id);}
  else if(t.dataset.fcollapse!==undefined){state.floats[fl].collapsed=!state.floats[fl].collapsed;render();save();}
  else if(t.dataset.fdock!==undefined)dockTo(fl,'right');
  else if(t.dataset.fhide!==undefined)hide(fl);});
 /* ── drag: tabs and float heads move panels; the edges of the dock are drop zones, anywhere else floats ── */
 let drag=null;const ghost=document.createElement('div');ghost.className='ed-ghost';
 root.addEventListener('pointerdown',e=>{if(state.lock||e.button!==0)return;const tab=e.target.closest('.ed-tab'),head=e.target.closest('.ed-fhead');if(!tab&&!head)return;if(head&&e.target.closest('button'))return;
  const id=tab?tab.dataset.tab:head.closest('.ed-float').dataset.float;drag={id,x0:e.clientX,y0:e.clientY,moved:false,fromFloat:Boolean(head),f:head?{...state.floats[id]}:null};root.setPointerCapture?.(e.pointerId);e.preventDefault();});
 root.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  if(!drag.moved){drag.moved=true;root.classList.add('dragging');ghost.textContent=byId.get(drag.id).title;root.append(ghost);}
  const hr=root.getBoundingClientRect();const z=dropZoneAt(e.clientX-hr.left,e.clientY-hr.top,hr);root.dataset.drop=z||'';
  if(drag.fromFloat&&!z){const f=state.floats[drag.id];f.x=Math.max(0,drag.f.x+dx);f.y=Math.max(0,drag.f.y+dy);floatEl[drag.id].style.left=f.x+'px';floatEl[drag.id].style.top=f.y+'px';ghost.hidden=true;}else ghost.hidden=false;
  ghost.style.left=(e.clientX-hr.left+12)+'px';ghost.style.top=(e.clientY-hr.top+12)+'px';});
 const endDrag=e=>{if(!drag)return;const d=drag;drag=null;root.classList.remove('dragging');ghost.remove();const z=root.dataset.drop;root.dataset.drop='';
  if(!d.moved)return;const hr=root.getBoundingClientRect();
  if(z)dockTo(d.id,z);else if(d.fromFloat)save();else floatAt(d.id,e.clientX-hr.left-40,e.clientY-hr.top-12);};
 root.addEventListener('pointerup',endDrag);root.addEventListener('pointercancel',endDrag);
 function dropZoneAt(x,y,hr){if(x<70)return 'left';if(x>hr.width-70)return 'right';if(y>hr.height-90)return 'bottom';return null;}
 /* ── resize: zone splitters and float corners ── */
 let rs=null;
 for(const z of ZONES)splits[z].addEventListener('pointerdown',e=>{if(state.lock)return;rs={z,x0:e.clientX,y0:e.clientY,s0:state.zones[z].size};splits[z].setPointerCapture(e.pointerId);e.preventDefault();});
 floatLayer.addEventListener('pointerdown',e=>{const h=e.target.closest('.ed-fres');if(!h||state.lock)return;const id=h.closest('.ed-float').dataset.float;rs={id,x0:e.clientX,y0:e.clientY,w0:state.floats[id].w,h0:state.floats[id].h};h.setPointerCapture(e.pointerId);e.preventDefault();});
 addEventListener('pointermove',e=>{if(!rs)return;if(rs.z){const d=rs.z==='left'?e.clientX-rs.x0:rs.z==='right'?rs.x0-e.clientX:rs.y0-e.clientY;state.zones[rs.z].size=Math.max(MIN[rs.z],Math.min(rs.z==='bottom'?innerHeight*.7:innerWidth*.5,rs.s0+d));root.style.setProperty('--'+rs.z[0],state.zones[rs.z].size+'px');}
  else{const f=state.floats[rs.id];f.w=Math.max(180,rs.w0+e.clientX-rs.x0);f.h=Math.max(80,rs.h0+e.clientY-rs.y0);const el=floatEl[rs.id];el.style.width=f.w+'px';el.style.height=f.h+'px';}});
 addEventListener('pointerup',()=>{if(rs){rs=null;save();}});
 /* ── API ── */
 function show(id){if(!byId.has(id))return;if(state.hidden.includes(id)){state.hidden=state.hidden.filter(x=>x!==id);state.zones.right.panels.push(id);state.zones.right.active=id;state.zones.right.collapsed=false;}
  else{const z=zoneOf(id);if(z){state.zones[z].active=id;state.zones[z].collapsed=false;}else if(state.floats[id])state.floats[id].collapsed=false;}render();save();}
 function hide(id){detach(id);state.hidden.push(id);render();save();}
 function visible(id){const z=zoneOf(id);if(z)return state.zones[z].active===id&&!state.zones[z].collapsed;const f=state.floats[id];return Boolean(f&&!f.collapsed);}
 render();
 return {root,state,show,hide,visible,toggle(id){visible(id)?hide(id):show(id);},
  setLock(v){state.lock=Boolean(v);render();save();},get lock(){return Boolean(state.lock);},
  reset(){state=fresh();for(const p of panels)if(!ZONES.some(z=>state.zones[z].panels.includes(p.id)))state.zones.bottom.panels.push(p.id);render();save();},
  panels:()=>panels.map(p=>({id:p.id,title:p.title,visible:visible(p.id),hidden:state.hidden.includes(p.id)}))};
}
