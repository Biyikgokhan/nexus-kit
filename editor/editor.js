/* KG Atelier scene editor — opened with ?editor=1. Blender / Cinema 4D habits (full table on "?" and in EDITOR.md).
   Every change is an edit (transform, colour, visibility, parent) or an added object in src/scene-overrides.json.
   Objects are keyed by the path they had when the code built them (userData.editorPath), so re-parenting never
   loses them. Multi-selection moves around a shared pivot; Ctrl+P / Alt+P / Ctrl+G and outliner drag & drop parent. */
import * as THREE from 'three';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {pathOf,findByPath,snapshotOf,stateOf,applyEdit,createAdded,colorMaterial,stampPaths,refOf,isAncestorOf,ORIGINAL_PARENT,DRAFT_KEY} from './scene-overrides.js';
import {REALM_LABELS,diffState,matState,lightState,worldState,applyWorld,MAP_KEYS,MATERIAL_TYPES} from './scene-overrides.js';
import {editorAudio} from './editor-audio.js';
import {createDock} from './editor-dock.js';
import './editor.css';
const ADD_TYPES=[['box','Küp','Birim küp, 1 m'],['cylinder','Silindir','1 m çaplı silindir'],['sphere','Küre','1 m çaplı küre'],['plane','Düzlem','1×1 m yatay düzlem'],['group','Boş grup','C4D Null gibi: içine nesne koy, hepsini birlikte taşı'],['light','Nokta ışık','Sıcak bir nokta ışığı, 6 m menzil'],['glb','GLB modeli','public/models altındaki bir .glb dosyası']];
const MODE_TR={translate:'Taşı',rotate:'Döndür',scale:'Ölçekle'};
export function startEditor(ctx){
 const {camera,canvas,controls}=ctx;let data=structuredClone(ctx.overrides);
 const realm=()=>ctx.roots[ctx.realm]?ctx.realm:Object.keys(ctx.roots)[0];
 const root=()=>{const r=ctx.roots[realm()];if(!r.userData.editorStamped)stampPaths(r);return r;};
 const section=()=>{const k=realm();data[k]=data[k]||{};data[k].edits=data[k].edits||{};data[k].added=data[k].added||[];return data[k];};
 ctx.setEditing(true);document.body.classList.add('editor-on');setTimeout(()=>hint(NAV[nav.scheme]+' · F seçime odaklar'),600);
 let sel=[],helpers=[],snap=false,axes='xyz',downAt=null,downAxis=null,hist=[],redo=[],dirty=false,treeAnchor=null;const expanded=new Set([root().uuid]);
 const active=()=>sel[sel.length-1]||null;
 /* ── gizmo, pivot, helpers ──────────────────────────────────────── */
 const tc=new TransformControls(camera,canvas);tc.setSize(.9);const gizmo=tc.getHelper();
 const pivot=new THREE.Object3D();pivot.name='editor-pivot';
 const grid=new THREE.GridHelper(40,80,'#ff9d3a','#3b4148');for(const o of [gizmo,grid,pivot])o.userData.editorInternal=true;grid.material.transparent=true;grid.material.opacity=.35;
 const place=()=>{const s=ctx.overlay&&ctx.shading?.view!=='render'?ctx.overlay:ctx.activeScene();for(const o of [gizmo,grid,pivot,...helpers])if(o.parent!==s)s.add(o);};place(); // in render mode helpers sit in the scene (depth against walls); in the other modes they move to the overlay so the override material never greys them
 let drag=null;
 tc.addEventListener('dragging-changed',e=>{controls.enabled=!e.value&&!fly.on;
  if(e.value){pivot.updateMatrixWorld(true);drag={items:sel.map(o=>({o,b:fullState(o),w:o.matrixWorld.clone()})),inv:pivot.matrixWorld.clone().invert()};}
  else if(drag){const items=drag.items.map(i=>({o:i.o,b:i.b,a:fullState(i.o)}));drag=null;pushHistory(transformEntry(items));items.forEach(i=>record(i.o));paintProps();}});
 const mw=new THREE.Matrix4(),inv=new THREE.Matrix4();
 tc.addEventListener('objectChange',()=>{if(drag&&tc.object===pivot){pivot.updateMatrixWorld(true);const delta=mw.multiplyMatrices(pivot.matrixWorld,drag.inv);
   for(const i of drag.items){const w=new THREE.Matrix4().multiplyMatrices(delta,i.w);i.o.parent.updateMatrixWorld(true);inv.copy(i.o.parent.matrixWorld).invert();w.premultiply(inv);w.decompose(i.o.position,i.o.quaternion,i.o.scale);}}
  paintProps(true);});
 /* ── camera: Blender MMB / Ctrl+MMB zoom, C4D Alt+buttons, RMB fly (WASD QE) ───────────── */
 const fly={on:false,sticky:false,speed:3,keys:new Set(),euler:new THREE.Euler(0,0,0,'YXZ'),dist:5};
 /* ── navigation schemes. Blender: middle orbit, Shift+middle pan, Ctrl+middle / wheel zoom. Cinema 4D: Alt+left orbit, Alt+middle pan,
 Alt+right zoom (middle alone also orbits). Both: right-drag flies, wheel zooms toward the cursor. The orbit pivot is never stale: a drag
 starts around the selection, or around whatever sits under the cursor, at that depth along the view axis, so the picture never jumps. */
 const NAV={blender:'Blender: orta tuş döndür · Shift+orta kaydır · Ctrl+orta / tekerlek yakınlaş · sağ tuş basılı uçuş',c4d:'Cinema 4D: Alt+sol döndür · Alt+orta kaydır · Alt+sağ yakınlaş · orta tuş da döndürür · sağ tuş basılı uçuş',fly:'Uçuş: fare bak · W A S D · Q E · Shift hızlı · tekerlek hız · Esc çıkar'};
 const nav={scheme:'blender',orbitSelection:true};try{Object.assign(nav,JSON.parse(localStorage.getItem('kg-editor-nav')||'{}'));}catch{}if(!NAV[nav.scheme])nav.scheme='blender';
 const M=THREE.MOUSE;
 const setButtons=e=>{const alt=e.altKey;controls.mouseButtons=nav.scheme==='c4d'?{LEFT:alt?M.ROTATE:-1,MIDDLE:alt?M.PAN:(e.ctrlKey?M.DOLLY:M.ROTATE),RIGHT:alt?M.DOLLY:-1}:alt?{LEFT:M.ROTATE,MIDDLE:M.PAN,RIGHT:M.DOLLY}:{LEFT:-1,MIDDLE:e.ctrlKey?M.DOLLY:M.ROTATE,RIGHT:-1};};
 /** Move the orbit pivot to a point's depth along the current view axis: orbit centre changes, the view does not. */
 function pivotAtDepth(point){const f=new THREE.Vector3();camera.getWorldDirection(f);const depth=Math.max(.2,point.clone().sub(camera.position).dot(f));controls.target.copy(camera.position).addScaledVector(f,depth);controls.update();}
 function autoPivot(e){if(nav.orbitSelection&&sel.length){const box=new THREE.Box3();sel.forEach(o=>box.expandByObject(o));if(!box.isEmpty()){pivotAtDepth(box.getCenter(new THREE.Vector3()));return;}}
  const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObject(root(),true).find(h=>shown(h.object));if(hit)pivotAtDepth(hit.point);}
 function setNav(scheme){if(!NAV[scheme])return;const wasFly=nav.scheme==='fly';nav.scheme=scheme;try{localStorage.setItem('kg-editor-nav',JSON.stringify(nav));}catch{}
  if(scheme==='fly'&&!fly.sticky)toggleFree();else if(scheme!=='fly'&&fly.sticky)toggleFree();if(wasFly&&scheme!=='fly')controls.enabled=!tc.dragging;hint(NAV[scheme]);setButtons({});const sel2=ui.querySelector('[data-nav]');if(sel2)sel2.value=scheme;}
 const onDown=e=>{setButtons(e);downAt={x:e.clientX,y:e.clientY,button:e.button,alt:e.altKey,mod:e.shiftKey||e.ctrlKey||e.metaKey};downAxis=tc.axis;
  cmd={op:null};closeCtx();if(!fly.on&&(e.button===1||(e.altKey&&e.button===0)))autoPivot(e); // orbit starts around the selection or the point under the cursor
  if(e.button===2&&!e.altKey&&!fly.sticky){rmb={t:performance.now(),x:e.clientX,y:e.clientY};beginFly(e.pointerId);}};
 const onMove=e=>{if(!fly.on)return;fly.euler.y-=e.movementX*.0025;fly.euler.x=THREE.MathUtils.clamp(fly.euler.x-e.movementY*.0025,-1.55,1.55);camera.quaternion.setFromEuler(fly.euler);};
 const endFly=(force=false)=>{if(!fly.on||(fly.sticky&&!force))return;fly.sticky=false;fly.on=false;fly.keys.clear();canvas.style.cursor='';const f=new THREE.Vector3();camera.getWorldDirection(f);controls.target.copy(camera.position).addScaledVector(f,fly.dist);controls.enabled=!tc.dragging;controls.update();hint('');};
 const onUp=e=>{if(e.button===2){const quick=rmb&&performance.now()-rmb.t<280&&Math.hypot(e.clientX-rmb.x,e.clientY-rmb.y)<4;rmb=null;endFly();if(quick&&!fly.sticky)openContext(e);}if(!downAt||downAt.button!==0||downAt.alt||downAxis||tc.dragging){downAt=null;return;}const moved=Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>4;const add=downAt.mod;downAt=null;if(moved)return;pick(e,add);};
 const onWheel=e=>{if(!fly.on)return;e.preventDefault();e.stopImmediatePropagation();fly.speed=THREE.MathUtils.clamp(fly.speed*(e.deltaY<0?1.2:1/1.2),.3,40);hint('Fly hızı '+fly.speed.toFixed(1)+' m/s');};
 canvas.addEventListener('pointerdown',onDown,{capture:true});canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('lostpointercapture',endFly);canvas.addEventListener('wheel',onWheel,{capture:true,passive:false});canvas.addEventListener('contextmenu',e=>e.preventDefault());
 controls.enabled=true;controls.enableDamping=false;controls.zoomToCursor=true;controls.enablePan=true;controls.enableRotate=true;controls.enableZoom=true;controls.panSpeed=1;controls.rotateSpeed=.9; // the world view disables pan for its own modes; the editor needs Shift+middle / Alt+middle to slide the cameracontrols.minDistance=.05;controls.maxDistance=250;controls.maxPolarAngle=Math.PI;controls.screenSpacePanning=true;setButtons({});
 camera.far=Math.max(camera.far,400);camera.updateProjectionMatrix();
 /* ── picking & selection ────────────────────────────────────────── */
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 const shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.userData.editorInternal)return false;return true;};
 function pick(e,add){const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);
  const hit=ray.intersectObject(root(),true).find(h=>shown(h.object));if(!hit){if(!add)select([]);return;}
  let o=hit.object;for(let p=o;p&&p!==root();p=p.parent)if(p.userData.editorAdded&&p.type!=='Group'){o=p;break;}
  if(add)toggle(o);else select([o]);}
 function toggle(o){const i=sel.indexOf(o);if(i>=0&&i===sel.length-1)sel.splice(i,1);else{if(i>=0)sel.splice(i,1);sel.push(o);}select(sel);}
 function select(list){sel=[...new Set(list)].filter(o=>o&&o!==root());for(const h of helpers){h.removeFromParent();h.geometry.dispose();}helpers=[];
  for(const o of sel){if(!o.userData.editorOriginal)o.userData.editorOriginal=stateOf(o);const h=new THREE.BoxHelper(o,o===active()?'#ffb23f':'#c77a2a');h.material.depthTest=false;h.renderOrder=999;helpers.push(h);for(let p=o.parent;p;p=p.parent)expanded.add(p.uuid);}
  attachGizmo();place();paintProps();paintTree();paintStatus();}
 function attachGizmo(){if(!sel.length){tc.detach();return;}if(sel.length===1){tc.attach(sel[0]);return;}
  const c=new THREE.Vector3(),v=new THREE.Vector3();sel.forEach(o=>{o.updateMatrixWorld(true);c.add(o.getWorldPosition(v));});c.divideScalar(sel.length);pivot.position.copy(c);pivot.quaternion.identity();pivot.scale.set(1,1,1);pivot.updateMatrixWorld(true);tc.attach(pivot);}
 /* ── state, history, records ────────────────────────────────────── */
 const fullState=o=>({...stateOf(o),parent:o.parent});
 function setFull(o,s){if(s.parent&&o.parent!==s.parent)s.parent.add(o);applyEdit(o,{p:s.p,r:s.r,s:s.s,visible:s.visible,...(s.color?{color:s.color}:{})});o.updateMatrixWorld(true);record(o);}
 const transformEntry=items=>({undo(){items.forEach(i=>setFull(i.o,i.b));attachGizmo();paintProps();paintTree();},redo(){items.forEach(i=>setFull(i.o,i.a));attachGizmo();paintProps();paintTree();}});
 function pushHistory(entry){hist.push(entry);redo=[];if(hist.length>300)hist.shift();paintStatus();}
 function change(list,fn){const items=list.map(o=>({o,b:fullState(o)}));fn();items.forEach(i=>{i.o.updateMatrixWorld(true);i.a=fullState(i.o);record(i.o);});pushHistory(transformEntry(items));attachGizmo();paintProps();paintTree();}
 function saveDraft(){dirty=true;try{localStorage.setItem(DRAFT_KEY,JSON.stringify(data));}catch{}paintStatus();}
 function record(o){const id=o.userData.editorAdded,st=stateOf(o),orig=o.userData.editorOriginal||{},parentRef=refOf(root(),o.parent);const md=diffState(st.mat,orig.mat),ld=diffState(st.light,orig.light);
  if(id){const a=section().added.find(x=>x.id===id);if(a){Object.assign(a,snapshotOf(o),{hidden:!o.visible,parent:parentRef},st.color?{color:st.color}:{});delete a.mat;delete a.light;if(md)a.mat=md;if(ld)a.light=ld;}}
  else{const key=o.userData.editorPath??pathOf(root(),o);if(key===null||key===undefined)return;const e={...snapshotOf(o)};if(!o.visible)e.hidden=true;if(st.color&&st.color!==orig.color)e.color=st.color;if(md)e.mat=md;if(ld)e.light=ld;
   if(ORIGINAL_PARENT.has(o)&&ORIGINAL_PARENT.get(o)!==o.parent)e.parent=parentRef;
   const same=JSON.stringify([orig.p,orig.r,orig.s,orig.visible])===JSON.stringify([e.p,e.r,e.s,!e.hidden])&&!e.color&&!e.mat&&!e.light&&e.parent===undefined;
   if(same)delete section().edits[key];else section().edits[key]=e;} /* back to how the code built it: no edit kept */
  saveDraft();}
 function undo(){const h=hist.pop();if(!h)return;redo.push(h);h.undo();toast('Geri alındı');paintStatus();}
 function redoIt(){const h=redo.pop();if(!h)return;hist.push(h);h.redo();toast('Yinelendi');paintStatus();}
 /* ── add, duplicate, delete ─────────────────────────────────────── */
 const newId=()=>'add-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
 function build(a,parent){const o=createAdded(THREE,a,root(),{loadGLB:ctx.loadGLB,map:null});if(!o)return null;ORIGINAL_PARENT.set(o,root());parent.add(o);o.updateMatrixWorld(true);return o;}
 function addEntries(pairs){const made=[];for(const [a,parent] of pairs){const o=build(a,parent||root());if(!o)continue;section().added.push(a);made.push([o,a,parent||root()]);record(o);}
  if(!made.length){toast('Eklenemedi');return [];}
  pushHistory({undo(){made.forEach(([o,a])=>{const l=section().added,i=l.indexOf(a);if(i>=0)l.splice(i,1);o.removeFromParent();});select([]);saveDraft();},redo(){made.forEach(([o,a,p])=>{section().added.push(a);p.add(o);record(o);});select(made.map(m=>m[0]));}});
  select(made.map(m=>m[0]));return made.map(m=>m[0]);}
 function add(type){let url;if(type==='glb'){url=prompt('Model yolu (public/models altındaki dosya):','/models/');if(!url||!/^\/models\/[\w\-./]+\.glb$/.test(url)){toast('Yol /models/… .glb olmalı');return;}}
  const t=controls.target,meta=ADD_TYPES.find(x=>x[0]===type)||[];const p=[t.x,type==='plane'||type==='group'?t.y:t.y+.5,t.z].map(v=>Math.round(v*1e3)/1e3);
  addEntries([[{id:newId(),type,name:meta[1]||type,p,r:[type==='plane'?-90:0,0,0],s:[1,1,1],color:type==='light'?'#ffd2a1':'#cfcac0',...(type==='light'?{intensity:3,distance:6}:{}),...(url?{url}:{})},root()]]);tc.setMode('translate');paintStatus();}
 function duplicate(){if(!sel.length)return;const pairs=[];
  const taken=new Set();root().traverse(x=>{if(x.name)taken.add(x.name);});
  const nextName=o=>{const base=(o.name||o.type).replace(/[ .]\d{2,}$/,'');let i=1;while(taken.has(`${base} ${String(i).padStart(2,'0')}`))i++;const n=`${base} ${String(i).padStart(2,'0')}`;taken.add(n);return n;}; // Blender-style: sofa → sofa 01, sofa 02 …
  for(const o of sel){const s0=snapshotOf(o);s0.p=[s0.p[0]+.3,s0.p[1],s0.p[2]];const parentRef=refOf(root(),o.parent),name=nextName(o);
   if(o.userData.editorAdded){const a=section().added.find(x=>x.id===o.userData.editorAdded);if(a)pairs.push([{...structuredClone(a),id:newId(),...s0,parent:parentRef,name},o.parent]);}
   else{const key=o.userData.editorPath??pathOf(root(),o);if(key)pairs.push([{id:newId(),type:'clone',source:key,parent:parentRef,name,...s0},o.parent]);}}
  addEntries(pairs);tc.setMode('translate');paintStatus();toast('Kopyalandı · G ile taşı');}
 function removeOrHide(){if(!sel.length)return;const added=sel.filter(o=>o.userData.editorAdded),built=sel.filter(o=>!o.userData.editorAdded);
  if(built.length)change(built,()=>built.forEach(o=>{o.visible=false;}));
  if(added.length){const gone=added.map(o=>{const a=section().added.find(x=>x.id===o.userData.editorAdded);return [o,a,o.parent];}).filter(g=>g[1]);
   const doIt=()=>{gone.forEach(([o,a])=>{const l=section().added,i=l.indexOf(a);if(i>=0)l.splice(i,1);o.removeFromParent();});saveDraft();};
   doIt();pushHistory({undo(){gone.forEach(([o,a,p])=>{section().added.push(a);p.add(o);record(o);});paintTree();},redo(){doIt();paintTree();}});}
  select([]);toast(added.length&&built.length?'Eklenenler silindi, diğerleri gizlendi':added.length?'Silindi':'Gizlendi · Alt+H hepsini göster');}
 function showAll(){const s=section(),objs=[];root().traverse(o=>{if(!o.visible&&o!==root())objs.push(o);});if(!objs.length)return;change(objs,()=>objs.forEach(o=>{o.visible=true;}));toast(objs.length+' nesne gösterildi');}
 function resetSel(){const built=sel.filter(o=>!o.userData.editorAdded);if(!built.length){toast('Eklenen nesneyi Delete ile sil');return;}
  change(built,()=>built.forEach(o=>{const home=ORIGINAL_PARENT.get(o);if(home&&o.parent!==home)home.add(o);if(o.userData.editorOriginal)applyEdit(o,o.userData.editorOriginal);}));
  built.forEach(o=>{delete section().edits[o.userData.editorPath??pathOf(root(),o)];});saveDraft();toast('Koddaki hâline döndü');}
 /* ── parenting (Blender Ctrl+P / Alt+P / Ctrl+G, C4D Alt+G / drag in the tree) ───────────── */
 function parentTo(children,target){const ok=children.filter(o=>o!==target&&!isAncestorOf(o,target)&&o.parent!==target);if(!ok.length){toast('Bu nesneye bağlanamaz');return false;}
  change(ok,()=>ok.forEach(o=>target.attach(o)));expanded.add(target.uuid);toast(ok.length+' nesne → '+(target===root()?'sahne kökü':(target.name||target.type)));return true;}
 function parentSelection(){if(sel.length<2){toast('Önce çocukları, en son parent olacak nesneyi seç (Shift+tık)');return;}const target=active();parentTo(sel.slice(0,-1),target);select([target]);}
 function clearParent(){if(!sel.length)return;parentTo(sel,root());}
 function group(){if(!sel.length)return;const c=new THREE.Vector3(),v=new THREE.Vector3();sel.forEach(o=>c.add(o.getWorldPosition(v)));c.divideScalar(sel.length);
  const parent=sel.every(o=>o.parent===sel[0].parent)?sel[0].parent:root();const local=parent.worldToLocal(c.clone());const kids=[...sel];
  const [g]=addEntries([[{id:newId(),type:'group',name:'Grup',p:local.toArray().map(x=>Math.round(x*1e4)/1e4),r:[0,0,0],s:[1,1,1]},parent]]);if(!g)return;
  change(kids,()=>kids.forEach(o=>g.attach(o)));expanded.add(g.uuid);select([g]);toast('Gruplandı · '+kids.length+' nesne');}
 /* ── camera helpers ─────────────────────────────────────────────── */
 function frame(list=sel){const box=new THREE.Box3();(list.length?list:[root()]).forEach(o=>box.expandByObject(o));if(box.isEmpty())return;const c=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()).length();const dir=camera.position.clone().sub(controls.target).normalize();controls.target.copy(c);camera.position.copy(c).addScaledVector(dir,Math.max(.6,size*1.1));controls.update();}
 function view(axis,flip){const d=camera.position.distanceTo(controls.target)||6,t=controls.target,s=flip?-1:1;const v={front:[0,0,d*s],right:[d*s,0,0],top:[0,d*s,.0001]}[axis];camera.position.set(t.x+v[0],t.y+v[1],t.z+v[2]);controls.update();}
 function orbitStep(yaw,pitch){const off=camera.position.clone().sub(controls.target),sph=new THREE.Spherical().setFromVector3(off);sph.theta+=yaw;sph.phi=THREE.MathUtils.clamp(sph.phi+pitch,.01,Math.PI-.01);off.setFromSpherical(sph);camera.position.copy(controls.target).add(off);controls.update();}
 /* ── UI ─────────────────────────────────────────────────────────── */
 const b=(attrs,label,tip,key)=>`<button ${attrs} data-tip="${tip}"${key?` data-key="${key}"`:''}>${label}</button>`;
 const ui=document.createElement('div');ui.id='kg-editor';ui.dataset.i18nSkip='';ui.innerHTML=`
  <header class="ed-top"><b data-tip="KG sahne editörü. Değişiklikler src/scene-overrides.json dosyasına gider; kod değişmez.">KG EDITOR</b>
   <span class="ed-realm">${b('data-realm="atelier"','Atölye','Karagümrük atölyesini düzenle')}${b('data-realm="whiteknight"','Esatpaşa','Esatpaşa / Whiteknight odasını düzenle')}</span>
   <span class="ed-modes">${b('data-mode="translate"','Taşı','Gizmo: seçimi eksenler boyunca taşı. Bir eksene tut ve sürükle.','G · E')}${b('data-mode="rotate"','Döndür','Gizmo: halkalardan tutup döndür.','R')}${b('data-mode="scale"','Ölçekle','Gizmo: kutulardan tutup ölçekle.','S · T')}${b('data-space','Dünya','Gizmo yönü: dünya eksenleri ya da nesnenin kendi eksenleri.','W')}${b('data-snap','Snap','Adım adım: taşıma 5 cm, dönüş 15°, ölçek 0.1. Ctrl basılı tutarak da açılır.','Ctrl')}</span>
   <span class="ed-actions">${b('data-add','+ Ekle','Küp, silindir, küre, düzlem, boş grup, ışık ya da GLB modeli ekle.','Shift+A')}${b('data-dup','Kopyala','Seçilenlerin kopyasını 30 cm yana koyar.','Shift+D')}${b('data-group','Grupla','Seçilenleri yeni bir boş grubun içine koyar; grubu taşıyınca hepsi birlikte gider.','Ctrl+G · Alt+G')}${b('data-parent','Parent','Seçtiklerini en son seçtiğine bağlar (çocuk olurlar).','Ctrl+P')}${b('data-unparent','Ayır','Seçilenleri parentlarından ayırır, dünyadaki yerleri değişmez.','Alt+P')}${b('data-hide','Gizle','Koddaki nesneleri gizler, editörle eklenenleri siler.','Delete · H')}${b('data-grid','Izgara','Zemindeki ızgarayı aç/kapat.')}${b('data-roof','Çatı','Atölyenin çatısını aç/kapat.')}${b('data-help','?','Tüm kısayollar.','?')}${b('data-save class="ed-primary"','Kaydet','Yerel sunucuda src/scene-overrides.json dosyasına yazar; canlı sitede dosyayı indirir.','Ctrl+S')}${b('data-exit','Oyuna dön','Editörü kapatıp siteye döner. Kaydedilmemiş iş taslak olarak kalır.')}</span></header>
  <aside class="ed-tree"><input class="ed-search" placeholder="Nesne ara…" spellcheck="false" data-tip="Ada göre filtrele"><div class="ed-root" data-tip="Buraya bırakılan nesneler sahne köküne taşınır (Alt+P).">⌂ Sahne kökü</div><ul></ul></aside>
  <aside class="ed-props"></aside>
  <div class="ed-addmenu" hidden>${ADD_TYPES.map(([k,l,t])=>b(`data-type="${k}"`,l,t)).join('')}</div>
  <footer class="ed-status"></footer><div class="ed-toast" hidden></div><div class="ed-hint" hidden></div><div class="ed-tip" hidden></div>
  <div class="ed-help" hidden><h3>Kısayollar</h3><table><tr><th>Gezinme</th><td>Üst çubuktan şema: <b>Blender</b> (orta tuş döndür, Shift+orta kaydır, Ctrl+orta / tekerlek yakınlaş) · <b>Cinema 4D</b> (Alt+sol döndür, Alt+orta kaydır, Alt+sağ yakınlaş) · <b>Uçuş</b>. Döndürme merkezi seçili nesne, yoksa imlecin altındaki nokta; <b>F</b> seçime odaklar</td></tr><tr><th>Komut dili</th><td>Seçimle <b>G</b> / <b>R</b> / <b>S</b>, sonra <b>X Y Z</b>, sonra sayı, <b>⏎</b>: G X 1.5 → 1,5 m taşı · R Z 45 → 45° döndür · S 2 → iki kat · Esc iptal</td></tr><tr><th>Seçim kümesi</th><td><b>A</b> hepsi · <b>Alt+A</b> hiçbiri · <b>Ctrl+I</b> tersle · <b>Shift+H</b> izole et · ağaçta <b>Shift</b> aralık, <b>Ctrl</b> tek tek, <b>Ctrl+Shift</b> aralık ekle</td></tr><tr><th>Serbest gezinme</th><td><b>Shift+F</b> aç/kapat · fare bak · W A S D · Q E · Shift hızlı · tekerlek hız</td></tr><tr><th>Sağ tık</th><td>Kısa tık: bağlam menüsü (odakla, kopyala, grupla, gizle, görünüm, tam ekran…) · basılı tut: uçuş</td></tr><tr><th>Pencereler</th><td>Sekmeleri sürükle: sol / sağ / alt bölge ya da boşluğa bırakınca yüzen pencere · ▾ katla · ⧉ pencereye çıkar · × gizle · kenarlardan boyutlandır · Pencereler menüsünden kilitle / sıfırla; yerleşim bütün dünyalarda ortak</td></tr><tr><th>Snap</th><td>Sürüklerken <b>Ctrl</b> 5 cm / 15° · <b>Shift</b> 10 cm / 45° · Snap düğmesi kalıcı</td></tr><tr><th>Görünüm</th><td><b>Z</b> mod döndür · <b>Shift+Z</b> tel kafes · Işık: Sahne / Stüdyo</td></tr>
   <tr><th>Kamera</th><td>Orta tuş döndür · Shift+orta kaydır · Ctrl+orta ya da tekerlek yakınlaş (fare noktasına)<br>C4D: Alt+sol döndür · Alt+orta kaydır · Alt+sağ yakınlaş<br>Sağ tuş basılı: fly · W A S D ileri/yan · Q E aşağı/yukarı · Shift hızlı · tekerlek hız<br>Numpad 2 4 6 8 adım adım döndür · 1 ön · 3 sağ · 7 üst (Ctrl ile ters)</td></tr>
   <tr><th>Seçim</th><td>Sol tık seç · Shift / Ctrl + tık ekle-çıkar (sonuncu aktif) · ↑ üst grup · Esc bırak · F / O / numpad . odakla · Home hepsi</td></tr>
   <tr><th>Gizmo</th><td>G veya E taşı · R döndür · S veya T ölçekle · X Y Z eksen kilidi · W dünya/yerel · Ctrl basılı snap · çoklu seçim ortak merkezden döner</td></tr>
   <tr><th>Hiyerarşi</th><td>Ctrl+P seçilenleri aktif olana bağla · Alt+P ayır · Ctrl+G / Alt+G grupla · ağaçta sürükle-bırak: nesnenin üstüne bırak = çocuk yap, "Sahne kökü"ne bırak = ayır</td></tr>
   <tr><th>Düzen</th><td>Shift+D kopyala · Shift+A ekle · Delete / H gizle (eklenenleri siler) · Alt+H hepsini göster · Ctrl+Z geri · Ctrl+Y ileri · Ctrl+S kaydet</td></tr></table>${b('data-help','Kapat','Kapat')}</div>`;
 document.body.append(ui);const $=s=>ui.querySelector(s);
 if(Object.keys(ctx.roots).length<2)$('.ed-realm')?.remove();if(!ctx.toggleRoof)$('[data-roof]')?.remove(); // single-root worlds (star, cave) have no realm switch or roof
 for(let node=canvas;node&&node!==document.body;node=node.parentElement)for(const el of [...node.parentElement.children])if(!(el===node||el===ui||el.tagName==='SCRIPT'||el.tagName==='STYLE'||el.tagName==='DIALOG'&&!el.open)){if(!el.dataset.edHidden){el.dataset.edHidden=el.style.display||'';el.style.setProperty('display','none','important');}} // the world's own UI steps aside at every level around the canvas (inline !important beats page CSS that overrides [hidden]); the canvas' ancestor chain stays

 function toast(t){const el=$('.ed-toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true;},2400);}
 function hint(t){const el=$('.ed-hint');el.textContent=t;el.hidden=!t;}
 /* hover info: wait on any control for .45 s */
 let tipTimer=null;const tip=$('.ed-tip');
 const VIEWS=[['render','Render'],['material','Malzeme'],['solid','Katı'],['wire','Tel'],['normal','Normal']];
 ui.querySelector('.ed-actions').insertAdjacentHTML('beforeend',`<label class="ed-view" data-tip="Görünüm modu (Blender). Render: gerçek boru hattı, bloom ve renk. Malzeme: sahne ışıkları, efektsiz. Katı: gri stüdyo kili. Tel: tel kafes. Normal: yüzey yönleri." data-key="Z döndürür · Shift+Z tel">Görünüm <select data-view>${VIEWS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label class="ed-view" data-tip="Aydınlatma. Sahne: dünyanın kendi ışıkları. Stüdyo: Blender'daki gibi kameraya bağlı olmayan sabit bir yarımküre + ana ışık eklenir; karanlık mekânlarda biçimi görmek için.">Işık <select data-light><option value="scene">Sahne</option><option value="studio">Stüdyo</option></select></label>`);
 ui.querySelector('.ed-actions').insertAdjacentHTML('beforeend',b('data-free','Serbest','Serbest gezinme: fare ile bak, W A S D ileri/yan, Q E aşağı/yukarı, Shift hızlı, tekerlek hız. Sağ tuşu basılı tutmadan.','Shift+F')+b('data-audio','Ses','Bu dünyanın ses ve müzik kontrolleri: ortam sesi, düzey, radyo, strobe…'));ui.insertAdjacentHTML('beforeend','<div class="ed-audio" hidden></div>');
 ui.querySelector('[data-free]').onclick=()=>toggleFree();ui.querySelector('[data-audio]').onclick=()=>{dock.toggle('audio');paintAudio();};
 ui.querySelector('.ed-actions').insertAdjacentHTML('beforeend',b('data-fs','Tam ekran','Tarayıcıyı tam ekrana alır; Esc çıkar. Sağ tık menüsünde de var.','Ctrl+Alt+F'));ui.querySelector('[data-fs]').onclick=()=>toggleFullscreen();
 ui.querySelector('.ed-actions').insertAdjacentHTML('beforeend',`<label class="ed-view" data-tip="Gezinme şeması. Blender: orta tuş döndürür, Shift+orta kaydırır, Ctrl+orta ya da tekerlek yakınlaştırır. Cinema 4D: Alt+sol döndürür, Alt+orta kaydırır, Alt+sağ yakınlaştırır. Uçuş: fare ile bak, W A S D. Her şemada sağ tuşu basılı tutmak uçurur, tekerlek imlece doğru yakınlaştırır. Döndürme merkezi seçili nesnedir; seçim yoksa imlecin altındaki nokta." data-key="Shift+F uçuş">Gezinme <select data-nav><option value="blender">Blender</option><option value="c4d">Cinema 4D</option><option value="fly">Uçuş</option></select></label><label class="ed-view" data-tip="Açıkken orbit seçili nesnenin etrafında döner; kapalıyken her zaman imlecin altındaki noktanın etrafında."><input type="checkbox" data-navsel ${nav.orbitSelection?'checked':''}> seçim etrafında</label>`);
 ui.querySelector('[data-nav]').value=nav.scheme;ui.querySelector('[data-nav]').onchange=e=>setNav(e.target.value);ui.querySelector('[data-navsel]').onchange=e=>{nav.orbitSelection=e.target.checked;try{localStorage.setItem('kg-editor-nav',JSON.stringify(nav));}catch{}};
 if(nav.scheme==='fly')nav.scheme='blender'; // a fly session never survives a reload
 const viewSel=ui.querySelector('[data-view]'),lightSel=ui.querySelector('[data-light]');
 const setView=v=>{ctx.setShading?.({view:v});viewSel.value=v;place();};viewSel.onchange=()=>setView(viewSel.value);lightSel.onchange=()=>ctx.setShading?.({light:lightSel.value});
 addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||e.code!=='KeyZ')return;const cur=ctx.shading?.view||'render';
  if(e.shiftKey)setView(cur==='wire'?'render':'wire');else setView(VIEWS[(VIEWS.findIndex(([v])=>v===cur)+1)%VIEWS.length][0]);e.preventDefault();});

 /* ── window system: panels in zones / floats, texture browser, world panel ── */
 const worldEl=document.createElement('div');worldEl.className='ed-world';
 const texEl=document.createElement('div');texEl.className='ed-textures';texEl.innerHTML=`<div class="ed-texbar"><input type="search" placeholder="Doku ara…" data-texq data-tip="Ada göre süz"><select data-texslot data-tip="Tıklanan doku bu kanala takılır">${[['map','Renk'],['normalMap','Normal'],['roughnessMap','Pürüz'],['metalnessMap','Metal'],['emissiveMap','Işıma'],['aoMap','AO'],['alphaMap','Alfa'],['bumpMap','Bump']].map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><label class="ed-abtn" data-tip="Bilgisayarından görsel yükle (dev sunucu: public/textures/editor/)">Yükle<input type="file" accept="image/*" data-texup hidden></label><button type="button" class="ed-abtn" data-texrefresh data-tip="Listeyi yenile">↻</button></div><div class="ed-texgrid"></div><p class="ed-meta" data-texnote></p>`;
 let texUrls=null,texLoading=null;
 function loadTextureList(force){if(texUrls&&!force)return Promise.resolve(texUrls);texLoading??=fetch('/__editor/textures').then(r=>r.ok?r.json():Promise.reject()).catch(()=>fetch('/textures/index.json').then(r=>r.ok?r.json():[]).catch(()=>[])).then(list=>{texUrls=Array.isArray(list)?list:[];texLoading=null;ensureTextureList();if(texList)texList.innerHTML=texUrls.map(u=>`<option value="${esc(u)}">`).join('');return texUrls;});return texLoading;}
 function paintTextures(){if(!dock.visible('textures'))return;loadTextureList().then(list=>{const q=texEl.querySelector('[data-texq]').value.trim().toLowerCase(),slot=texEl.querySelector('[data-texslot]').value,o=active(),m=o&&matState(o);const cur=m?m[slot]:null;
   const rows=list.filter(u=>!q||u.toLowerCase().includes(q));texEl.querySelector('.ed-texgrid').innerHTML=rows.map(u=>`<button type="button" class="ed-thumb${u===cur?' on':''}" data-texu="${esc(u)}" title="${esc(u)}"><img loading="lazy" src="${esc(u)}" alt=""><span>${esc(u.split('/').pop().replace(/\.\w+$/,''))}</span></button>`).join('')||'<p class="ed-empty">Doku yok. public/textures altına dosya koy ya da Yükle.</p>';
   texEl.querySelector('[data-texnote]').textContent=o&&m?`${o.name||o.type} · ${slot} ← tıkla`:'Önce bir mesh seç; seçili kanala tıklayarak doku atanır.';});}
 texEl.addEventListener('click',e=>{const t=e.target.closest('[data-texu]');if(t){const o=active();if(!o||!matState(o)){toast('Önce bir mesh seç');return;}const slot=texEl.querySelector('[data-texslot]').value;change([o],()=>applyEdit(o,{mat:{[slot]:t.dataset.texu}}));paintTextures();toast(`${slot} ← ${t.dataset.texu.split('/').pop()}`);}
  if(e.target.closest('[data-texrefresh]'))loadTextureList(true).then(paintTextures);});
 texEl.querySelector('[data-texq]').addEventListener('input',paintTextures);texEl.querySelector('[data-texslot]').addEventListener('change',paintTextures);
 texEl.querySelector('[data-texup]').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;fetch('/__editor/upload?name='+encodeURIComponent(f.name),{method:'POST',body:f}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(j=>loadTextureList(true).then(()=>{toast('Yüklendi: '+j.url);paintTextures();})).catch(()=>toast('Canlı sitede yükleme yok: dosyayı public/textures altına koy'));e.target.value='';});
 function paintWorld(){if(!dock.visible('world'))return;worldEl.innerHTML=worldRows();bindWorld(worldEl);}
 const dock=createDock(ui,{panels:[{id:'tree',title:'Ağaç',el:$('.ed-tree')},{id:'props',title:'Özellikler',el:$('.ed-props')},{id:'world',title:'Dünya',el:worldEl},{id:'textures',title:'Dokular',el:texEl},{id:'audio',title:'Ses',el:$('.ed-audio')},{id:'help',title:'Kısayollar',el:$('.ed-help')}],
  defaults:{left:['tree'],right:['props'],bottom:['world','textures','audio','help'],sizes:{left:250,right:320,bottom:240},collapsed:{bottom:true}},
  onChange(){paintWorld();paintTextures();paintAudio();}});
 $('.ed-help').hidden=false;$('.ed-audio').hidden=false;
 ui.querySelector('.ed-actions').insertAdjacentHTML('beforeend',b('data-windows','Pencereler','Panelleri aç/kapat, yerleşimi kilitle ya da sıfırla. Sekmeleri sürükleyerek sol/sağ/alt bölgelere ya da pencereye taşı; kenarlardan boyutlandır.'));
 const winMenu=document.createElement('div');winMenu.className='ed-winmenu';winMenu.hidden=true;ui.append(winMenu);
 function paintWinMenu(){winMenu.innerHTML=dock.panels().map(p=>`<label><input type="checkbox" data-win="${p.id}" ${p.hidden?'':'checked'}> ${esc(p.title)}</label>`).join('')+`<hr><label><input type="checkbox" data-winlock ${dock.lock?'checked':''}> Yerleşimi kilitle</label><button type="button" data-winreset>Yerleşimi sıfırla</button>`;}
 ui.querySelector('[data-windows]').onclick=()=>{winMenu.hidden=!winMenu.hidden;if(!winMenu.hidden)paintWinMenu();};
 winMenu.addEventListener('change',e=>{const t=e.target;if(t.dataset.win){t.checked?dock.show(t.dataset.win):dock.hide(t.dataset.win);}else if(t.dataset.winlock!==undefined)dock.setLock(t.checked);});
 winMenu.addEventListener('click',e=>{if(e.target.closest('[data-winreset]')){dock.reset();paintWinMenu();}});
 document.addEventListener('pointerdown',e=>{if(!winMenu.hidden&&!winMenu.contains(e.target)&&!e.target.closest('[data-windows]'))winMenu.hidden=true;},{capture:true});
 /* Toolbar diet: bar = realm · gizmo modes · Ekle · Düzen ▾ · Görünüm ▾ · Gezinme · Kaydet · ? · Oyuna dön. Everything else lives in the two menus. */
 (function foldToolbar(){const actions=ui.querySelector('.ed-actions');if(!actions)return;
  const menu=(id,label,tip)=>{const wrap=document.createElement('span');wrap.className='ed-menu';wrap.innerHTML=`<button type="button" data-menu="${id}" data-tip="${tip}">${label}</button><div class="ed-menu-list" hidden></div>`;return wrap;};
  const duzen=menu('duzen','Düzen','Kopyala, grupla, bağla, ayır, gizle, ızgara, çatı.'),gorunum=menu('gorunum','Görünüm','Gölgeleme modu, ışık, serbest gezinme, ses paneli, tam ekran, pencereler.');
  const move=(sel,into)=>{for(const el of [...ui.querySelectorAll(sel)]){const host=el.closest('label.ed-view')||el;if(host.closest('.ed-menu-list'))continue;into.querySelector('.ed-menu-list').append(host);}};
  actions.prepend(duzen);duzen.after(gorunum);
  move('[data-dup],[data-group],[data-parent],[data-unparent],[data-hide],[data-grid],[data-roof]',duzen);
  move('[data-view],[data-light],[data-free],[data-audio],[data-fs],[data-windows]',gorunum);
  const add=ui.querySelector('[data-add]');if(add)actions.prepend(add);
  const nav=ui.querySelector('[data-nav]')?.closest('label.ed-view'),navsel=ui.querySelector('[data-navsel]')?.closest('label.ed-view');if(navsel)gorunum.querySelector('.ed-menu-list').append(navsel);if(nav)gorunum.after(nav);
  ui.addEventListener('click',e=>{const b=e.target.closest('[data-menu]');const open=[...ui.querySelectorAll('.ed-menu-list')];if(b){const list=b.nextElementSibling;const show=list.hidden;open.forEach(l=>l.hidden=true);list.hidden=!show;e.stopPropagation();return;}if(!e.target.closest('.ed-menu-list')||e.target.closest('button'))setTimeout(()=>open.forEach(l=>l.hidden=true),0);});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.ed-menu'))ui.querySelectorAll('.ed-menu-list').forEach(l=>l.hidden=true);},{capture:true});})();
 ui.addEventListener('pointerover',e=>{const el=e.target.closest('[data-tip]');clearTimeout(tipTimer);tip.hidden=true;if(!el)return;tipTimer=setTimeout(()=>{tip.innerHTML=esc(el.dataset.tip)+(el.dataset.key?`<kbd>${esc(el.dataset.key)}</kbd>`:'');tip.hidden=false;const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let x=Math.min(innerWidth-w-8,Math.max(8,r.left+r.width/2-w/2)),y=r.bottom+8;if(y+h>innerHeight-8)y=r.top-h-8;tip.style.left=x+'px';tip.style.top=y+'px';},450);});
 ui.addEventListener('pointerout',e=>{if(!e.relatedTarget||!e.target.closest('[data-tip]')?.contains(e.relatedTarget)){clearTimeout(tipTimer);tip.hidden=true;}});
 const num=v=>Number.isFinite(v)?String(Math.round(v*1000)/1000):'0';
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let propsQueued=false;
 function paintProps(light){if(light){if(propsQueued)return;propsQueued=true;requestAnimationFrame(()=>{propsQueued=false;paintProps();});return;}const p=$('.ed-props'),o=active();
  if(!o){p.innerHTML=`<p class="ed-empty">Bir nesne seç.<br><small>Sol tık · ağaçtan tıkla · Shift+A ekle</small></p><p class="ed-meta">${Object.keys(section().edits).length} düzenleme · ${section().added.length} eklenen nesne</p><p class="ed-meta">Sis, arka plan ve pozlama <b>Dünya</b> sekmesinde; dokular <b>Dokular</b> sekmesinde.</p>`;paintWorld();paintTextures();return;}
  if(sel.length>1){p.innerHTML=`<h4>${sel.length} nesne seçili</h4><p class="ed-meta">Aktif: ${esc(o.name||o.type)} · gizmo ortak merkezde</p><ul class="ed-multi">${sel.map(x=>`<li>${esc(x.name||x.type)}${x===o?' ★':''}</li>`).join('')}</ul>
   <div class="ed-btns">${b('data-act="parent"','Aktife bağla','Diğerlerini ★ aktif nesnenin çocuğu yap.','Ctrl+P')}${b('data-act="group"','Grupla','Hepsini yeni bir boş grubun içine koy.','Ctrl+G')}${b('data-act="unparent"','Ayır','Hepsini parentlarından ayır.','Alt+P')}${b('data-act="frame"','Odakla','Kamerayı seçime getir.','F')}</div>`;return;}
  const s=snapshotOf(o),m=colorMaterial(o),path=o.userData.editorAdded?'eklenen · '+o.userData.editorAdded:(o.userData.editorPath??pathOf(root(),o));const parentName=o.parent===root()?'sahne kökü':(o.parent?.name||o.parent?.type);
  const row=(label,key,vals,tipText)=>`<label class="ed-row" data-tip="${tipText}"><span>${label}</span>${vals.map((v,i)=>`<input type="number" step="${key==='r'?1:.01}" data-k="${key}" data-i="${i}" value="${num(v)}">`).join('')}</label>`;
  p.innerHTML=`<h4>${esc(o.name||o.type)}</h4><p class="ed-path" title="${esc(path)}">${esc(path)}</p><p class="ed-meta">${o.type}${o.isLight?' · ışık':''}${o.children.length?' · '+o.children.length+' alt':''} · parent: ${esc(parentName)}</p>
   ${row('Konum','p',s.p,'Parent’a göre yerel konum, metre (X Y Z)')}${row('Dönüş°','r',s.r,'Derece cinsinden dönüş (X Y Z)')}${row('Ölçek','s',s.s,'Ölçek çarpanı (X Y Z)')}
   <label class="ed-row" data-tip="Nesneyi göster ya da gizle"><span>Görünür</span><input type="checkbox" data-visible ${o.visible?'checked':''}></label>
   ${m?`<label class="ed-row" data-tip="Renk değişince nesneye kendi malzemesi verilir; aynı malzemeyi paylaşan diğerleri etkilenmez"><span>Renk</span><input type="color" data-color value="#${m.color.getHexString()}"><small>${o.userData.ownMaterial?'kendi malzemesi':'paylaşılan malzeme kopyalanır'}</small></label>`:''}
   ${extraRows(o)}
   <div class="ed-btns">${b('data-act="frame"','Odakla','Kamerayı nesneye getir.','F · O')}${b('data-act="up"','Üst grup','Parent nesneyi seç.','↑')}${b('data-act="unparent"','Ayır','Parent’tan ayır, sahne köküne taşı.','Alt+P')}${b('data-act="reset"','Sıfırla','Koddaki hâline ve yerine döndür.')}</div>`;
  p.querySelectorAll('input[data-k]').forEach(inp=>inp.onchange=()=>change([o],()=>{const s2=snapshotOf(o);s2[inp.dataset.k][inp.dataset.i]=Number(inp.value)||0;applyEdit(o,s2);}));
  p.querySelector('[data-visible]').onchange=e=>change([o],()=>{o.visible=e.target.checked;});
  p.querySelector('[data-color]')?.addEventListener('change',e=>change([o],()=>applyEdit(o,{color:e.target.value})));
  p.querySelector('[data-color]')?.addEventListener('input',e=>applyEdit(o,{color:e.target.value}));
  p.querySelector('[data-intensity]')?.addEventListener('change',e=>change([o],()=>applyEdit(o,{light:{intensity:Number(e.target.value)||0}})));bindExtra(p,o);paintWorld();paintTextures();}
 const label=o=>(o.name||o.type)+(o.userData.editorAdded?' ✚':'');
 let rows=[],dragRows=null;
 function paintTree(){const ul=$('.ed-tree ul'),q=$('.ed-search').value.trim().toLowerCase();rows=[];
  if(q){root().traverse(o=>{if(o!==root()&&!o.userData.editorInternal&&rows.length<400&&label(o).toLowerCase().includes(q))rows.push([o,0]);});}
  else{const walk=(o,d)=>{for(const c of o.children){if(c.userData.editorInternal)continue;rows.push([c,d]);if(c.children.length&&expanded.has(c.uuid)&&rows.length<1500)walk(c,d+1);}};walk(root(),0);}
  ul.innerHTML=rows.map(([o,d],i)=>`<li draggable="true" data-i="${i}" class="${sel.includes(o)?(o===active()?'sel act':'sel'):''}${o.visible?'':' off'}" style="padding-left:${6+d*12}px">${o.children.length&&!q?`<i data-tog>${expanded.has(o.uuid)?'▾':'▸'}</i>`:'<i></i>'}<span>${esc(label(o))}</span><b data-eye>${o.visible?'●':'○'}</b></li>`).join('');
  ul.querySelector('.act')?.scrollIntoView({block:'nearest'});}
 const tree=$('.ed-tree ul');
 tree.addEventListener('click',e=>{const li=e.target.closest('li');if(!li)return;const o=rows[li.dataset.i]?.[0];if(!o)return;
  if(e.target.dataset.tog!==undefined){expanded.has(o.uuid)?expanded.delete(o.uuid):expanded.add(o.uuid);paintTree();return;}
  if(e.target.dataset.eye!==undefined){change([o],()=>{o.visible=!o.visible;});return;}
  const i=Number(li.dataset.i);
  if(e.shiftKey&&treeAnchor!=null){const a=Math.min(treeAnchor,i),z=Math.max(treeAnchor,i),range=rows.slice(a,z+1).map(r=>r[0]);select(e.ctrlKey||e.metaKey?[...sel,...range]:range);} // Shift: range from the anchor · Ctrl+Shift: add the range
  else if(e.ctrlKey||e.metaKey){toggle(o);treeAnchor=i;} // Ctrl: toggle one
  else{select([o]);treeAnchor=i;}});
 tree.addEventListener('dblclick',e=>{const li=e.target.closest('li');const o=li&&rows[li.dataset.i]?.[0];if(o){select([o]);frame([o]);}});
 tree.addEventListener('dragstart',e=>{const li=e.target.closest('li');const o=li&&rows[li.dataset.i]?.[0];if(!o)return;dragRows=sel.includes(o)?[...sel]:[o];e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','kg');});
 const dropTarget=e=>{const li=e.target.closest('li');return li?rows[li.dataset.i]?.[0]:(e.target.closest('.ed-root')?root():null);};
 for(const el of [tree,$('.ed-root')]){el.addEventListener('dragover',e=>{if(!dragRows)return;const t=dropTarget(e);if(!t)return;e.preventDefault();ui.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));(e.target.closest('li')||e.target.closest('.ed-root'))?.classList.add('drop');});
  el.addEventListener('drop',e=>{e.preventDefault();ui.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));const t=dropTarget(e);if(t&&dragRows){const kids=dragRows;dragRows=null;if(parentTo(kids,t))select(kids);}});}
 tree.addEventListener('dragend',()=>{dragRows=null;ui.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));});

 /* ── keyboard command language: G/R/S, optional axis, number, Enter (Blender's "G X 1.5 ⏎") ── */
 let cmd={op:null};const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
 const digitOf=k=>k.startsWith('Digit')?k.slice(5):/^Numpad\d$/.test(k)?k.slice(6):/Minus|Subtract/.test(k)?'-':'.';
 const setModeFor=op=>tc.setMode(op==='g'?'translate':op==='r'?'rotate':'scale');
 function preKey(e,k,ctrl){
  if(cmd.op){if(k==='Escape'){cmd={op:null};paintStatus();consume(e);return true;}
   if(k==='Enter'||k==='NumpadEnter'){applyCmd();consume(e);return true;}
   if(/^Key[XYZ]$/.test(k)){cmd.axis=k.slice(3).toLowerCase();paintStatus();consume(e);return true;}
   if(/^(Digit\d|Numpad\d|Minus|NumpadSubtract|Period|NumpadDecimal|Comma)$/.test(k)){cmd.text+=digitOf(k);paintStatus();consume(e);return true;}
   if(k==='Backspace'){cmd.text=cmd.text.slice(0,-1);paintStatus();consume(e);return true;}
   if(/^Key[GRS]$/.test(k)&&!ctrl&&!e.shiftKey&&!e.altKey){cmd={op:k.slice(3).toLowerCase(),axis:null,text:''};setModeFor(cmd.op);paintStatus();consume(e);return true;}
   cmd={op:null};paintStatus();} // any other key leaves command mode and is handled as usual
  if(!ctrl&&!e.altKey&&!e.shiftKey&&/^Key[GRS]$/.test(k)&&sel.length&&!tc.dragging&&!fly.on){cmd={op:k.slice(3).toLowerCase(),axis:null,text:''};setModeFor(cmd.op);paintStatus();consume(e);return true;}
  if(k==='KeyF'&&e.shiftKey&&!ctrl&&!e.altKey){toggleFree();consume(e);return true;}
  if(k==='KeyF'&&ctrl&&e.altKey){toggleFullscreen();consume(e);return true;}
  if(k==='KeyA'&&!ctrl&&!e.shiftKey&&!fly.on){if(e.altKey)select([]);else selectAll();consume(e);return true;}
  if(k==='KeyI'&&ctrl&&!e.shiftKey){invertSelection();consume(e);return true;}
  if(k==='KeyH'&&e.shiftKey&&!ctrl&&!e.altKey){isolate();consume(e);return true;}
  return false;}
 function applyCmd(){const {op,axis}=cmd,v=parseFloat(String(cmd.text).replace(',','.'));cmd={op:null};paintStatus();if(!Number.isFinite(v)||!sel.length)return;
  const ax=axis?new THREE.Vector3(axis==='x'?1:0,axis==='y'?1:0,axis==='z'?1:0):null;if(op!=='s'&&!ax){hint('Önce eksen: X, Y ya da Z');return;}
  change(sel,()=>{for(const o of sel){
   if(op==='g'){const d=ax.clone();if(tc.space==='local')d.applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));const wp=o.getWorldPosition(new THREE.Vector3()).addScaledVector(d,v);o.position.copy(o.parent.worldToLocal(wp));}
   else if(op==='r'){if(tc.space==='local')o.rotateOnAxis(ax,v*Math.PI/180);else o.rotateOnWorldAxis(ax,v*Math.PI/180);}
   else{if(ax)o.scale.multiply(new THREE.Vector3(ax.x?v:1,ax.y?v:1,ax.z?v:1));else o.scale.multiplyScalar(v);}}});
  hint(`${op.toUpperCase()} ${axis?axis.toUpperCase()+' ':''}${v} uygulandı`);}
 /* ── selection sets: A all (top level), Alt+A none, Ctrl+I invert, Shift+H isolate ── */
 const topLevel=()=>root().children.filter(o=>shown(o));
 function selectAll(){select(topLevel());}
 function invertSelection(){const cur=new Set(sel);select(topLevel().filter(o=>!cur.has(o)));}
 function isolate(){if(!sel.length)return;const keep=o=>sel.some(s=>s===o||isAncestorOf(o,s)||isAncestorOf(s,o));const hide=[];(function walk(n){for(const c of n.children){if(keep(c)){if(!sel.includes(c))walk(c);}else if(c.visible)hide.push(c);}})(root());
  if(!hide.length)return;change(hide,()=>hide.forEach(o=>{o.visible=false;}));hint('İzole edildi · Alt+H hepsini geri getirir');}
 /* ── free navigation: Shift+F or the Serbest button — WASD/QE with mouse look under pointer lock, no button held ── */
 function beginFly(pointerId){fly.on=true;fly.dist=camera.position.distanceTo(controls.target)||5;fly.euler.setFromQuaternion(camera.quaternion);controls.enabled=false;if(pointerId!=null)canvas.setPointerCapture(pointerId);canvas.style.cursor='none';
  hint(fly.sticky?'Serbest gezinme: fare bak · W A S D · Q E · Shift hızlı · tekerlek hız · Shift+F ya da Esc çıkar':'Fly: W A S D ileri/yan · Q E aşağı/yukarı · Shift hızlı · tekerlek hız');}
 function toggleFree(){if(fly.sticky){fly.sticky=false;if(document.pointerLockElement===canvas)document.exitPointerLock();endFly(true);return;}fly.sticky=true;beginFly(null);try{canvas.requestPointerLock?.();}catch{}}
 document.addEventListener('pointerlockchange',()=>{if(fly.sticky&&document.pointerLockElement!==canvas){fly.sticky=false;endFly(true);if(nav.scheme==='fly'){nav.scheme='blender';try{localStorage.setItem('kg-editor-nav',JSON.stringify(nav));}catch{}const s2=ui.querySelector('[data-nav]');if(s2)s2.value='blender';}}});
 /* ── light / material / shader / texture rows and the world panel ── */
 const nrow=(label,attrs,val,step,tip)=>`<label class="ed-row" data-tip="${tip}"><span>${label}</span><input type="number" step="${step}" ${attrs} value="${num(val)}"></label>`;
 const crow=(label,attrs,hexv,tip)=>`<label class="ed-row" data-tip="${tip}"><span>${label}</span><input type="color" ${attrs} value="${hexv}"></label>`;
 const krow=(label,attrs,on,tip)=>`<label class="ed-row" data-tip="${tip}"><span>${label}</span><input type="checkbox" ${attrs} ${on?'checked':''}></label>`;
 function extraRows(o){let h='';
  if(o.isLight){const l=lightState(o);h+=`<h5>Işık <small>${esc(o.type)}</small></h5>`+nrow('Şiddet','data-intensity',o.intensity,.1,'Işık şiddeti')+crow('Renk','data-l="color"',l.color,'Işık rengi');
   for(const [k,lab,st,tip] of [['distance','Menzil',.1,'Sıfır = sınırsız'],['decay','Sönüm',.1,'Fiziksel için 2'],['angle','Açı',.01,'Spot koni yarı açısı, radyan'],['penumbra','Yumuşak',.01,'Spot kenar yumuşaklığı 0–1']])if(l[k]!==undefined)h+=nrow(lab,`data-l="${k}"`,l[k],st,tip);
   if(l.groundColor)h+=crow('Zemin','data-l="groundColor"',l.groundColor,'Yarımküre ışığın alt rengi');if(l.castShadow!==undefined)h+=krow('Gölge','data-lb="castShadow"',l.castShadow,'Bu ışık gölge düşürsün');}
  const m=matState(o);if(m){h+=`<h5>Malzeme <small>${o.userData.ownMaterial?'kendi malzemesi':'paylaşılan; ilk değişiklikte kopyalanır'}</small></h5>`;
   if(!o.material.isShaderMaterial)h+=`<label class="ed-row" data-tip="Malzeme türünü değiştir = bu nesneye yeni bir malzeme oluştur. Renk ve dokular taşınır. Physical: cam, vernik, ipek gibi ek kanallar açar."><span>Tür</span><select data-mtype>${MATERIAL_TYPES.map(t=>`<option value="${t}"${o.material.type===t?' selected':''}>${t.replace('Mesh','').replace('Material','')}</option>`).join('')}</select></label>`;else h+=`<p class="ed-meta">ShaderMaterial · ${esc(o.material.name||'')}</p>`;
   if(m.emissive!==undefined)h+=crow('Işıma','data-m="emissive"',m.emissive,'Kendinden ışıyan renk');
   for(const [k,lab,tip] of [['emissiveIntensity','Işıma ×','Işıma çarpanı'],['roughness','Pürüz','0 ayna · 1 mat'],['metalness','Metal','0 yalıtkan · 1 metal'],['opacity','Opaklık','1 altı yarı saydam yapar']])if(m[k]!==undefined)h+=nrow(lab,`data-m="${k}"`,m[k],.01,tip);
   for(const [k,lab,tip] of [['wireframe','Tel kafes','Yalnız kenarlar'],['flatShading','Düz yüzey','Facetli görünüm'],['transparent','Saydam','Alfa karışımı']])if(m[k]!==undefined)h+=krow(lab,`data-mb="${k}"`,m[k],tip);
   if(m.side!==undefined)h+=`<label class="ed-row" data-tip="Hangi yüz çizilsin"><span>Yüz</span><select data-ms="side"><option value="0"${m.side===0?' selected':''}>Ön</option><option value="1"${m.side===1?' selected':''}>Arka</option><option value="2"${m.side===2?' selected':''}>İki</option></select></label>`;
   const MAP_TR={map:'Renk dokusu',normalMap:'Normal',roughnessMap:'Pürüz dokusu',metalnessMap:'Metal dokusu',emissiveMap:'Işıma dokusu',aoMap:'AO',alphaMap:'Alfa',bumpMap:'Bump'};const slots=MAP_KEYS.filter(k=>m[k]!==undefined);
   if(slots.length){h+=`<h5>Dokular</h5>`;for(const k of slots)h+=`<label class="ed-row" data-tip="${MAP_TR[k]}: /textures/ altından bir dosya; listeden seç ya da yaz. Boş = yok, (kod) = kodun verdiği."><span>${MAP_TR[k]}</span><input type="text" data-mt="${k}" list="ed-tex" value="${esc(m[k])}" placeholder="/textures/…"></label>`;
    h+=`<label class="ed-row" data-tip="Bilgisayarından bir görsel yükle: dev sunucuda public/textures/editor/ altına yazılır ve seçili kanala takılır. Canlı sitede yükleme yok; dosyayı public/textures altına koy."><span>Yükle</span><select data-mupslot>${slots.map(k=>`<option value="${k}">${MAP_TR[k]}</option>`).join('')}</select><input type="file" accept="image/*" data-mup></label>`;
    if(m.repeat)h+=`<label class="ed-row" data-tip="Doku tekrarı (U V)"><span>Tekrar</span><input type="number" step=".1" data-mr="0" value="${num(m.repeat[0])}"><input type="number" step=".1" data-mr="1" value="${num(m.repeat[1])}"></label>`;}
   if(m.uni&&Object.keys(m.uni).length){h+=`<h5>Shader uniform</h5>`;for(const [k,v] of Object.entries(m.uni))h+=typeof v==='number'?nrow(k,`data-u="${k}"`,v,.01,'Sayısal uniform; kod her karede yazıyorsa değişiklik kalıcı olmaz'):crow(k,`data-uc="${k}"`,v,'Renk uniform');}}
  return h;}
 function bindExtra(p,o){const on=(q,ev,fn)=>p.querySelectorAll(q).forEach(el=>el.addEventListener(ev,()=>fn(el)));
  const edit=e=>change([o],()=>applyEdit(o,e)),live=e=>applyEdit(o,e);
  on('[data-l]','change',el=>edit({light:{[el.dataset.l]:el.type==='color'?el.value:Number(el.value)||0}}));on('[data-l][type=color]','input',el=>live({light:{[el.dataset.l]:el.value}}));
  on('[data-lb]','change',el=>edit({light:{[el.dataset.lb]:el.checked}}));
  on('[data-m]','change',el=>edit({mat:{[el.dataset.m]:el.type==='color'?el.value:Number(el.value)||0}}));on('[data-m][type=color]','input',el=>live({mat:{[el.dataset.m]:el.value}}));
  on('[data-mb]','change',el=>edit({mat:{[el.dataset.mb]:el.checked}}));on('[data-ms]','change',el=>edit({mat:{[el.dataset.ms]:Number(el.value)}}));
  on('[data-mt]','change',el=>edit({mat:{[el.dataset.mt]:el.value.trim()}}));on('[data-mtype]','change',el=>{edit({mat:{type:el.value}});paintProps();});
  on('[data-mup]','change',el=>{const f=el.files?.[0];if(!f)return;const slot=p.querySelector('[data-mupslot]')?.value||'map';fetch('/__editor/upload?name='+encodeURIComponent(f.name),{method:'POST',body:f}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(j=>{texList=null;ensureTextureList();edit({mat:{[slot]:j.url}});paintProps();toast('Doku yüklendi: '+j.url);}).catch(()=>toast('Canlı sitede yükleme yok: dosyayı public/textures altına koy, sonra yolunu yaz'));});on('[data-mr]','change',()=>edit({mat:{repeat:[...p.querySelectorAll('[data-mr]')].map(i=>Number(i.value)||1)}}));
  on('[data-u]','change',el=>edit({mat:{uni:{[el.dataset.u]:Number(el.value)||0}}}));on('[data-uc]','change',el=>edit({mat:{uni:{[el.dataset.uc]:el.value}}}));on('[data-uc]','input',el=>live({mat:{uni:{[el.dataset.uc]:el.value}}}));
  ensureTextureList();}
 let texList=null;function ensureTextureList(){if(texList)return;texList=document.getElementById('ed-tex')||document.createElement('datalist');texList.id='ed-tex';document.body.append(texList);fetch('/__editor/textures').then(r=>r.ok?r.json():[]).then(list=>{texList.innerHTML=list.map(u=>`<option value="${esc(u)}">`).join('');}).catch(()=>{});}
 function worldRows(){const sc=ctx.activeScene(),w=worldState(sc,ctx.renderer);let h=`<h5>Dünya <small>${REALM_LABELS[realm()]||realm()}</small></h5>`;
  if(w.fog){h+=crow('Sis rengi','data-w="fog.color"',w.fog.color,'Sahne sisinin rengi');if(w.fog.density!=null)h+=nrow('Sis yoğunluk','data-w="fog.density"',w.fog.density,.001,'Üstel sis yoğunluğu');if(w.fog.near!=null)h+=nrow('Sis yakın','data-w="fog.near"',w.fog.near,.5,'Doğrusal sis başlangıcı')+nrow('Sis uzak','data-w="fog.far"',w.fog.far,.5,'Doğrusal sis bitişi');}
  if(w.background)h+=crow('Arka plan','data-w="background"',w.background,'Sahne arka plan rengi');if(w.exposure!=null)h+=nrow('Pozlama','data-w="exposure"',w.exposure,.05,'Tone mapping pozlaması');
  return h+`<p class="ed-meta">Dünya ayarları dosyaya <code>world</code> olarak yazılır; geri al buraya işlemez.</p>`;}
 function bindWorld(p){p.querySelectorAll('[data-w]').forEach(el=>{const apply=()=>{const path=el.dataset.w.split('.'),v=el.type==='color'?el.value:Number(el.value)||0;const w=section().world??={};let t=w;for(const k of path.slice(0,-1))t=t[k]??={};t[path[path.length-1]]=v;applyWorld(ctx.activeScene(),ctx.renderer,w);saveDraft();dirty=true;paintStatus();};el.addEventListener('change',apply);if(el.type==='color')el.addEventListener('input',apply);});}
 /* ── sound / music panel: whatever the world registered in editor-audio.js ── */
 function paintAudio(){const box=$('.ed-audio');if(!box||!dock.visible('audio'))return;const items=editorAudio.list();
  box.innerHTML=`<h4>Ses · müzik <small>${REALM_LABELS[realm()]||realm()}</small></h4>`+(items.length?'':'<p class="ed-empty">Bu dünya editöre ses kontrolü vermedi.</p>')+items.map((it,i)=>it.kind==='range'?`<label class="ed-row" data-tip="${esc(it.tip||'')}"><span>${esc(it.label)}</span><input type="range" min="${it.min??0}" max="${it.max??1}" step="${it.step??.01}" value="${Number(it.get?.())||0}" data-ai="${i}"></label>`:it.kind==='toggle'?`<label class="ed-row" data-tip="${esc(it.tip||'')}"><span>${esc(it.label)}</span><input type="checkbox" data-ai="${i}" ${it.get?.()?'checked':''}></label>`:`<button type="button" class="ed-abtn" data-ai="${i}" data-tip="${esc(it.tip||'')}">${esc(it.label)}</button>`).join('');
  box.querySelectorAll('[data-ai]').forEach(el=>{const it=items[+el.dataset.ai];const h=()=>{try{if(it.kind==='range')it.set(Number(el.value));else if(it.kind==='toggle')it.set(el.checked);else it.set();}catch{}if(it.kind!=='range')setTimeout(paintAudio,250);};el.addEventListener(el.type==='range'?'input':el.tagName==='BUTTON'?'click':'change',h);});}
 editorAudio.onChange(()=>paintAudio());

 /* ── right-click menu (a quick tap; holding the button still flies) and fullscreen ── */
 let rmb=null;const ctxMenu=document.createElement('div');ctxMenu.className='ed-ctx';ctxMenu.hidden=true;ctxMenu.dataset.i18nSkip='';document.body.append(ctxMenu);
 const closeCtx=()=>{ctxMenu.hidden=true;};document.addEventListener('pointerdown',e=>{if(!ctxMenu.contains(e.target))closeCtx();},{capture:true});
 function openContext(e){const hitObj=(()=>{const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObject(root(),true).find(x=>shown(x.object));if(!h)return null;let o=h.object;for(let p=o;p&&p!==root();p=p.parent)if(p.userData.editorAdded&&p.type!=='Group'){o=p;break;}return o;})();
  if(hitObj&&!sel.includes(hitObj))select([hitObj]);
  const has=sel.length>0,one=sel.length===1;const item=(label,key,fn,on=true)=>on?`<button type="button" data-ci="${items.push(fn)-1}">${label}${key?`<kbd>${key}</kbd>`:''}</button>`:'';const items=[];const sep='<hr>';
  ctxMenu.innerHTML=`<b>${esc(has?(one?(sel[0].name||sel[0].type):sel.length+' nesne'):'Sahne')}</b>`
   +item('Odakla','F',()=>frame(sel.length?sel:undefined))
   +item('Kopyala','Shift+D',duplicate,has)+item('Grupla','Ctrl+G',group,has)+item('Aktife bağla','Ctrl+P',parentSelection,sel.length>1)+item('Ayır','Alt+P',clearParent,has)
   +item('İzole et','Shift+H',isolate,has)+item(has?'Gizle / sil':'', 'Del',removeOrHide,has)+item('Sıfırla','',resetSel,has)
   +sep+item('Ekle…','Shift+A',()=>{$('.ed-addmenu').hidden=false;})+item('Hepsini göster','Alt+H',showAll)+item('Hepsini seç','A',selectAll)
   +sep+item('Görünüm: Render','Z',()=>setView('render'))+item('Görünüm: Katı','',()=>setView('solid'))+item('Görünüm: Tel','Shift+Z',()=>setView('wire'))
   +item(fly.sticky?'Serbest gezinmeyi kapat':'Serbest gezinme','Shift+F',toggleFree)+item(document.fullscreenElement?'Tam ekrandan çık':'Tam ekran','Ctrl+Alt+F',toggleFullscreen);
  ctxMenu.querySelectorAll('[data-ci]').forEach(bt=>bt.onclick=()=>{closeCtx();items[+bt.dataset.ci]?.();});
  ctxMenu.hidden=false;const w=ctxMenu.offsetWidth,h=ctxMenu.offsetHeight;ctxMenu.style.left=Math.min(innerWidth-w-8,e.clientX)+'px';ctxMenu.style.top=Math.min(innerHeight-h-8,e.clientY)+'px';}
 function toggleFullscreen(){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{});}
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 function paintStatus(){$('.ed-status').textContent=(cmd.op?`⌨ ${cmd.op.toUpperCase()}${cmd.axis?' '+cmd.axis.toUpperCase():''} ${cmd.text||'…'} ⏎ · `:'')+`${MODE_TR[tc.mode]} · ${tc.space==='world'?'Dünya':'Yerel'} · eksen ${axes.toUpperCase()}${snap?(coarse?' · snap 45°/10cm':' · snap'):''} · ${sel.length?sel.length+' seçili':'seçim yok'} · ${REALM_LABELS[realm()]||realm()} · ${hist.length} adım${dirty?' · kaydedilmedi':''}   —   ? kısayollar`;
  ui.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.mode===tc.mode)));$('[data-space]').textContent=tc.space==='world'?'Dünya':'Yerel';$('[data-snap]').setAttribute('aria-pressed',String(snap));
  ui.querySelectorAll('[data-realm]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.realm===realm())));}
 function setAxes(a){axes=axes===a?'xyz':a;tc.showX=axes.includes('x');tc.showY=axes.includes('y');tc.showZ=axes.includes('z');paintStatus();}
 let coarse=false;
 function setSnap(v,big=false){snap=v;coarse=v&&big;tc.setTranslationSnap(v?(big?.1:.05):null);tc.setRotationSnap(v?THREE.MathUtils.degToRad(big?45:15):null);tc.setScaleSnap(v?(big?.25:.1):null);paintStatus();} // Ctrl: 5 cm / 15° / 0.1 · Shift: 10 cm / 45° / 0.25
 async function save(){const body=JSON.stringify(data,null,1);
  try{const r=await fetch('/__editor/save',{method:'POST',headers:{'Content-Type':'application/json'},body});if(r.ok){dirty=false;try{localStorage.removeItem(DRAFT_KEY);}catch{}toast('Kaydedildi → src/scene-overrides.json');paintStatus();return;}}catch{}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body+'\n'],{type:'application/json'}));a.download='scene-overrides.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('İndirildi: scene-overrides.json → projede src/ klasörüne koy');}
 ui.addEventListener('click',e=>{const x=e.target.closest('button');if(!x)return;const d=x.dataset;tip.hidden=true;
  if(d.mode){tc.setMode(d.mode);paintStatus();}else if(d.space!==undefined){tc.setSpace(tc.space==='world'?'local':'world');paintStatus();}else if(d.snap!==undefined)setSnap(!snap);
  else if(d.add!==undefined)$('.ed-addmenu').hidden=!$('.ed-addmenu').hidden;else if(d.type){$('.ed-addmenu').hidden=true;add(d.type);}
  else if(d.dup!==undefined)duplicate();else if(d.group!==undefined)group();else if(d.parent!==undefined)parentSelection();else if(d.unparent!==undefined)clearParent();
  else if(d.hide!==undefined)removeOrHide();else if(d.grid!==undefined)grid.visible=!grid.visible;else if(d.roof!==undefined)ctx.toggleRoof();
  else if(d.help!==undefined)dock.toggle('help');else if(d.save!==undefined)save();
  else if(d.act==='frame')frame();else if(d.act==='up'){const o=active();if(o?.parent&&o.parent!==root())select([o.parent]);}else if(d.act==='reset')resetSel();else if(d.act==='parent')parentSelection();else if(d.act==='group')group();else if(d.act==='unparent')clearParent();
  else if(d.exit!==undefined){if(dirty&&!confirm('Kaydedilmemiş değişiklikler taslak olarak bu tarayıcıda duruyor. Çıkılsın mı?'))return;const u=new URL(location.href);u.searchParams.delete('editor');location.href=u.toString();}
  else if(d.realm&&d.realm!==realm()){select([]);ctx.setRealm(d.realm);setTimeout(()=>{place();expanded.add(root().uuid);paintTree();paintProps();paintStatus();},50);}});
 $('.ed-search').addEventListener('input',paintTree);
 /* ── keyboard ───────────────────────────────────────────────────── */
 const FLY_KEYS=['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight'];
 const onKey=e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.code,ctrl=e.ctrlKey||e.metaKey;if(preKey(e,k,ctrl))return;
  if(fly.on&&FLY_KEYS.includes(k)){fly.keys.add(k);e.preventDefault();e.stopImmediatePropagation();return;}
  let used=true;
  if(k==='ControlLeft'||k==='ControlRight'){setSnap(true);return;}if((k==='ShiftLeft'||k==='ShiftRight')&&!fly.on){setSnap(true,true);return;}
  if(ctrl&&k==='KeyZ')e.shiftKey?redoIt():undo();else if(ctrl&&k==='KeyY')redoIt();else if(ctrl&&k==='KeyS')save();else if(ctrl&&k==='KeyP')parentSelection();else if(ctrl&&k==='KeyG')group();
  else if(e.altKey&&k==='KeyP')clearParent();else if(e.altKey&&k==='KeyG')group();else if(e.altKey&&k==='KeyH')showAll();
  else if(e.shiftKey&&k==='KeyD')duplicate();else if(e.shiftKey&&k==='KeyA')$('.ed-addmenu').hidden=false;
  else if(k==='KeyG'||k==='KeyE'){tc.setMode('translate');paintStatus();}else if(k==='KeyR'){tc.setMode('rotate');paintStatus();}else if(k==='KeyS'||k==='KeyT'){tc.setMode('scale');paintStatus();}
  else if(k==='KeyX'||k==='KeyY'||(k==='KeyZ'&&tc.dragging))setAxes(k.slice(3).toLowerCase()); /* Z locks the axis only mid-drag; otherwise it cycles the shading, like Blender */else if(k==='KeyW'){tc.setSpace(tc.space==='world'?'local':'world');paintStatus();}
  else if(k==='KeyF'||k==='KeyO'||k==='NumpadDecimal')frame();else if(k==='Home')frame([]);
  else if(k==='Delete'||k==='KeyH')removeOrHide();else if(k==='Escape'){$('.ed-addmenu').hidden=true;closeCtx();select([]);}
  else if(k==='ArrowUp'&&active()?.parent&&active().parent!==root())select([active().parent]);
  else if(k==='Numpad1')view('front',ctrl);else if(k==='Numpad3')view('right',ctrl);else if(k==='Numpad7')view('top',ctrl);else if(k==='Numpad9')orbitStep(Math.PI,0);
  else if(k==='Numpad4')orbitStep(-Math.PI/12,0);else if(k==='Numpad6')orbitStep(Math.PI/12,0);else if(k==='Numpad8')orbitStep(0,-Math.PI/12);else if(k==='Numpad2')orbitStep(0,Math.PI/12);
  else if(e.key==='?')$('.ed-help').hidden=!$('.ed-help').hidden;else used=false;
  if(used){e.preventDefault();e.stopImmediatePropagation();}};
 const onKeyUp=e=>{if(e.code==='ControlLeft'||e.code==='ControlRight')setSnap(false);if(e.code==='ShiftLeft'||e.code==='ShiftRight')setSnap(e.ctrlKey);fly.keys.delete(e.code);};
 addEventListener('keydown',onKey,{capture:true});addEventListener('keyup',onKeyUp,{capture:true});
 addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 const f=new THREE.Vector3(),r=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 ctx.onEditorFrame(dt=>{place();for(const h of helpers)h.update();
  if(fly.on&&fly.keys.size){const k=fly.keys,sp=fly.speed*(k.has('ShiftLeft')||k.has('ShiftRight')?3:1)*dt;camera.getWorldDirection(f);r.crossVectors(f,up).normalize();
   const fw=(k.has('KeyW')?1:0)-(k.has('KeyS')?1:0),st=(k.has('KeyD')?1:0)-(k.has('KeyA')?1:0),vu=(k.has('KeyE')?1:0)-(k.has('KeyQ')?1:0);
   camera.position.addScaledVector(f,fw*sp).addScaledVector(r,st*sp).addScaledVector(up,vu*sp);}});
 /* start: bird's eye over the courtyard */
 const t=controls.target;if(t.lengthSq()<1e-6)t.set(-1,1,0);camera.position.set(t.x+6,t.y+6,t.z+7);controls.update();
 select([]);paintTree();paintStatus();toast('Editör açık · düğmelerin üstünde bekle: açıklama · ? kısayollar');
 const api={get data(){return data;},get selection(){return sel;},select,parentTo,group,save,frame,debug:{tc,gizmo,grid,pivot,controls,camera,ctx,get helpers(){return helpers;}},dispose(){removeEventListener('keydown',onKey,{capture:true});removeEventListener('keyup',onKeyUp,{capture:true});tc.dispose();gizmo.removeFromParent();grid.removeFromParent();pivot.removeFromParent();helpers.forEach(h=>h.removeFromParent());ui.remove();}};
 globalThis.kgEditor=api; /* console access: kgEditor.select([...]), kgEditor.debug.tc … */
 return api;
}
