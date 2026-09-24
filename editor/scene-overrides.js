/* Scene overrides: hand edits made in the in-browser editor (?editor=1), kept apart from the code that builds the
   world. src/scene-overrides.json is applied to the freshly built world before static meshes are merged, so an edit
   survives any rebuild. Objects are addressed by a path of "name#index" segments from the realm root; a renamed or
   reordered object falls back to its name among siblings, then to its index. Rotations are stored in degrees. */
import * as THREE from 'three';
export const DRAFT_KEY='kg-editor-draft';
/* Where each object sat when the code built it (kept outside userData: three's clone() JSON-copies userData). */
export const ORIGINAL_PARENT=new WeakMap();
export const EMPTY_OVERRIDES={version:1,atelier:{edits:{},added:[]},whiteknight:{edits:{},added:[]},yildiz:{edits:{},added:[]},yeralti:{edits:{},added:[]}};
export const REALM_LABELS={atelier:'Atölye',whiteknight:'Esatpaşa',yildiz:'Yıldız',yeralti:'Yeraltı'};
const clean=n=>String(n||'').replace(/[\/#]/g,'_');
export function segmentOf(obj){const i=obj.parent?obj.parent.children.indexOf(obj):0;return clean(obj.name)+'#'+i;}
export function pathOf(root,obj){const out=[];for(let o=obj;o&&o!==root;o=o.parent){if(!o.parent)return null;out.unshift(segmentOf(o));}return out.join('/');}
function childBySegment(parent,seg){const k=seg.lastIndexOf('#'),name=seg.slice(0,k),i=Number(seg.slice(k+1));const kids=parent.children;
 if(kids[i]&&clean(kids[i].name)===name)return kids[i];
 if(name){const same=kids.filter(c=>clean(c.name)===name);if(same.length===1)return same[0];}
 return !name&&kids[i]&&!kids[i].name?kids[i]:null;}
export function findByPath(root,path){if(!path)return root;let o=root;for(const seg of path.split('/')){o=childBySegment(o,seg);if(!o)return null;}return o;}
const r4=v=>Math.round(v*1e4)/1e4,deg=r=>Math.round(r*180/Math.PI*100)/100;
export function snapshotOf(obj){return {p:obj.position.toArray().map(r4),r:[obj.rotation.x,obj.rotation.y,obj.rotation.z].map(deg),s:obj.scale.toArray().map(r4)};}
export function stateOf(obj){const m=colorMaterial(obj);return {...snapshotOf(obj),visible:obj.visible,color:m?'#'+m.color.getHexString():null,mat:matState(obj),light:lightState(obj)};}
const hex=c=>'#'+c.getHexString();
export const MAT_NUMS=['emissiveIntensity','roughness','metalness','opacity','clearcoat','clearcoatRoughness','transmission','thickness','ior','sheen','iridescence','envMapIntensity','shininess'],MAT_FLAGS=['transparent','wireframe','flatShading'];
export const MAP_KEYS=['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','alphaMap','bumpMap'];
export const MATERIAL_TYPES=['MeshStandardMaterial','MeshPhysicalMaterial','MeshBasicMaterial','MeshLambertMaterial','MeshPhongMaterial','MeshToonMaterial','MeshNormalMaterial'];
/** A fresh material of another type that keeps what it can of the old one (colour, maps, transparency, side). The way to "create a material" in the editor. */
export function retypeMaterial(obj,type){if(!MATERIAL_TYPES.includes(type)||!obj.isMesh||Array.isArray(obj.material))return null;const old=obj.material;if(old.type===type)return old;const n=new THREE[type]();
 if(n.color&&old.color)n.color.copy(old.color);if(n.emissive&&old.emissive)n.emissive.copy(old.emissive);for(const k of MAP_KEYS)if(k in n&&old[k])n[k]=old[k];for(const k of ['transparent','opacity','side','wireframe','flatShading','roughness','metalness'])if(n[k]!==undefined&&old[k]!==undefined)n[k]=old[k];
 n.userData.editorMap0=old.userData.editorMap0||old.map||null;obj.material=n;obj.userData.ownMaterial=true;return n;}
/** Everything about a mesh's material the editor can touch: colours, PBR numbers, flags, side, the colour map (as a /textures URL, or '(kod)' when the code made it), shader uniforms that are numbers or colours. */
export function matState(obj){const m=obj.isMesh&&!Array.isArray(obj.material)?obj.material:null;if(!m)return null;const s={};
 s.type=m.type;if(m.color)s.color=hex(m.color);if(m.emissive)s.emissive=hex(m.emissive);
 for(const k of [...MAT_NUMS,...MAT_FLAGS,'side'])if(m[k]!==undefined)s[k]=m[k];
 if(!m.isShaderMaterial){for(const k of MAP_KEYS)if(k in m)s[k]=m[k]?(m[k].userData.editorUrl||'(kod)'):'';if(m.map)s.repeat=[m.map.repeat.x,m.map.repeat.y];}
 if(m.isShaderMaterial&&m.uniforms){s.uni={};for(const [k,u] of Object.entries(m.uniforms)){const v=u&&u.value;if(typeof v==='number')s.uni[k]=v;else if(v&&v.isColor)s.uni[k]=hex(v);}}
 return s;}
export function lightState(o){if(!o.isLight)return null;const s={intensity:o.intensity,color:hex(o.color)};for(const k of ['distance','decay','angle','penumbra','castShadow'])if(o[k]!==undefined)s[k]=o[k];if(o.groundColor)s.groundColor=hex(o.groundColor);return s;}
let texLoader=null;const loadTexture=url=>{if(typeof document==='undefined')return null;texLoader??=new THREE.TextureLoader();const t=texLoader.load(url);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.userData.editorUrl=url;return t;};
export const TEXTURE_URL=/^\/textures\/[\w\-./ %()]+\.(webp|png|jpe?g|avif)$/i;
/** Give the object its own material copy (once), so shared materials elsewhere stay untouched. */
export function ownMaterial(obj){const m=obj.isMesh&&!Array.isArray(obj.material)?obj.material:null;if(!m)return null;if(!obj.userData.ownMaterial){obj.material=m.clone();obj.userData.ownMaterial=true;if(m.map)obj.material.userData.editorMap0=m.map;}return obj.material;}
export function applyMat(m,s){if(!m||!s)return;
 for(const k of [...MAT_NUMS,...MAT_FLAGS,'side'])if(s[k]!==undefined&&m[k]!==undefined)m[k]=s[k];
 if(s.color&&m.color)m.color.set(s.color);if(s.emissive&&m.emissive)m.emissive.set(s.emissive);
 if(s.opacity!==undefined&&s.opacity<1)m.transparent=true;
 if(!m.isShaderMaterial)for(const k of MAP_KEYS){if(s[k]===undefined||!(k in m))continue;const cur=m[k];if(s[k]==='')m[k]=null;else if(s[k]==='(kod)'){if(k==='map'&&m.userData.editorMap0)m.map=m.userData.editorMap0;}else if(TEXTURE_URL.test(s[k])&&s[k]!==cur?.userData?.editorUrl){if(k==='map'&&!m.userData.editorMap0&&cur)m.userData.editorMap0=cur;const t=loadTexture(s[k]);if(t){if(k!=='map'&&k!=='emissiveMap')t.colorSpace=THREE.NoColorSpace;m[k]=t;}}}
 if(s.repeat&&m.map)m.map.repeat.set(Number(s.repeat[0])||1,Number(s.repeat[1])||1);
 if(s.uni&&m.uniforms)for(const [k,v] of Object.entries(s.uni)){const u=m.uniforms[k];if(!u)continue;if(typeof v==='number'&&typeof u.value==='number')u.value=v;else if(typeof v==='string'&&u.value&&u.value.isColor)u.value.set(v);}
 m.needsUpdate=true;}
export function applyLight(o,l){if(!o.isLight||!l)return;for(const k of ['intensity','distance','decay','angle','penumbra','castShadow'])if(l[k]!==undefined&&o[k]!==undefined)o[k]=l[k];if(l.color)o.color.set(l.color);if(l.groundColor&&o.groundColor)o.groundColor.set(l.groundColor);}
/** Scene-wide settings: fog, background colour, tone-mapping exposure. Saved under a realm's `world` key. */
export function worldState(scene,renderer){const f=scene.fog;return {fog:f?{color:hex(f.color),density:f.density??null,near:f.near??null,far:f.far??null}:null,background:scene.background&&scene.background.isColor?hex(scene.background):null,exposure:renderer?renderer.toneMappingExposure:null};}
export function applyWorld(scene,renderer,w){if(!w)return;const f=scene.fog;if(w.fog&&f){if(w.fog.color)f.color.set(w.fog.color);if(w.fog.density!=null&&f.density!==undefined)f.density=w.fog.density;if(w.fog.near!=null&&f.near!==undefined)f.near=w.fog.near;if(w.fog.far!=null&&f.far!==undefined)f.far=w.fog.far;}
 if(w.background&&scene.background&&scene.background.isColor)scene.background.set(w.background);if(w.exposure!=null&&renderer)renderer.toneMappingExposure=w.exposure;}
/** Keys of `cur` whose value differs from `orig` (deep for `uni`); null when nothing differs. */
export function diffState(cur,orig){if(!cur)return null;const out={};for(const [k,v] of Object.entries(cur)){if(k==='uni'){const o=orig?.uni||{},d={};for(const [n,x] of Object.entries(v||{}))if(JSON.stringify(x)!==JSON.stringify(o[n]))d[n]=x;if(Object.keys(d).length)out.uni=d;}else if(JSON.stringify(v)!==JSON.stringify(orig?.[k]))out[k]=v;}return Object.keys(out).length?out:null;}
export function colorMaterial(obj){const m=obj.isMesh&&!Array.isArray(obj.material)?obj.material:null;return m&&m.color?m:null;}
/** Apply one edit (or a full state) to an object. Colour edits give the object its own material copy first. */
export function applyEdit(obj,e){
 if(!obj.userData.editorOriginal)obj.userData.editorOriginal=stateOf(obj);
 if(e.p)obj.position.fromArray(e.p);if(e.r)obj.rotation.set(...e.r.map(d=>d*Math.PI/180));if(e.s)obj.scale.fromArray(e.s);
 if(e.hidden!==undefined)obj.visible=!e.hidden;if(e.visible!==undefined)obj.visible=e.visible;
 if(e.color){const m=colorMaterial(obj);if(m){ownMaterial(obj);obj.material.color.set(e.color);}}
 if(e.mat){if(e.mat.type)retypeMaterial(obj,e.mat.type);const m=ownMaterial(obj);if(m)applyMat(m,e.mat);}
 if(e.light)applyLight(obj,e.light);
 obj.updateMatrix();}
/** Build an object the editor added (primitive, light, clone of an existing object, or a GLB from /models). */
export function createAdded(THREE,a,root,opts={}){const {loadGLB}=opts;
 let obj;const color=a.color||'#cfcac0';
 const std=()=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.05});
 if(a.type==='box')obj=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),std());
 else if(a.type==='cylinder')obj=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1,32),std());
 else if(a.type==='sphere')obj=new THREE.Mesh(new THREE.SphereGeometry(.5,32,16),std());
 else if(a.type==='plane'){obj=new THREE.Mesh(new THREE.PlaneGeometry(1,1),std());obj.material.side=THREE.DoubleSide;}
 else if(a.type==='light'){obj=new THREE.PointLight(color,a.intensity??3,a.distance??6,2);}
 else if(a.type==='clone'){const src=(opts.map&&opts.map.get(a.source))||findByPath(root,a.source);if(!src)return null;obj=src.clone(true);obj.traverse(c=>{delete c.userData.editorPath;});}
 else if(a.type==='group'){obj=new THREE.Group();}
 else if(a.type==='glb'&&/^\/models\/[\w\-./]+\.glb$/.test(a.url||'')){obj=new THREE.Group();loadGLB?.(a.url).then(scene=>{if(scene)obj.add(scene);}).catch(()=>{});}
 else return null;
 if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;}
 obj.name=a.name||a.type;obj.userData.editorAdded=a.id;obj.userData.dynamic=true;
 applyEdit(obj,a);return obj;}
/** Stamp every built object with its original path, so edits keep finding it after it has been re-parented. */
export function stampPaths(root){const map=new Map();root.traverse(o=>{if(o===root||o.userData.editorAdded)return;const p=pathOf(root,o);if(p===null)return;if(o.userData.editorPath===undefined)o.userData.editorPath=p;if(!ORIGINAL_PARENT.has(o))ORIGINAL_PARENT.set(o,o.parent);map.set(o.userData.editorPath,o);});root.userData.editorStamped=true;return map;}
/** Reference to a parent: '' = realm root, 'added:<id>' = an editor-made object, otherwise an original path. */
export function refOf(root,o){if(!o||o===root)return '';if(o.userData.editorAdded)return 'added:'+o.userData.editorAdded;return o.userData.editorPath??pathOf(root,o)??'';}
export function isAncestorOf(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
function resolveRef(root,ref,map,added){if(!ref)return root;if(ref.startsWith('added:'))return added.get(ref.slice(6))||null;return map.get(ref)||findByPath(root,ref);}
/** Apply a realm's section to its freshly built root: resolve every target first, then build added objects, then re-parent, then transform. */
export function applyOverrides(THREE,root,section,opts={}){
 if(!section)return [];const edits=Object.entries(section.edits||{}),list=section.added||[];if(!edits.length&&!list.length)return [];
 const map=stampPaths(root);const targets=edits.map(([path,e])=>[map.get(path)||findByPath(root,path),e]).filter(([o])=>o);
 const added=new Map(),made=[];
 for(const a of list){const o=createAdded(THREE,a,root,{...opts,map});if(!o)continue;ORIGINAL_PARENT.set(o,root);root.add(o);added.set(a.id,o);made.push([o,a]);}
 const reparent=(o,ref)=>{const parent=resolveRef(root,ref,map,added);if(parent&&parent!==o&&!isAncestorOf(o,parent)&&o.parent!==parent)parent.add(o);};
 for(const [o,a] of made){if(a.parent)reparent(o,a.parent);applyEdit(o,a);}
 for(const [o,e] of targets){if(e.parent!==undefined)reparent(o,e.parent);applyEdit(o,e);}
 root.userData.overrideCount=targets.length;return made.map(([o])=>o);}
export function readDraft(){try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');return d&&d.version===1?d:null;}catch{return null;}}
