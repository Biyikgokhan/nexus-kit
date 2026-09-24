/* Editor host: everything the in-browser editor (editor.js) needs from a three.js world, for worlds that are not
   the atelier's world-view — the star (yildiz), the cave (yeraltı), or any scene with a renderer, a camera and a
   canvas. It owns the orbit controls, the Blender-like shading modes and the overlay scene for gizmo and helpers;
   the world's own loop calls `host.frame(dt)` instead of stepping the player while `host.editing` is true. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {findByPath} from './scene-overrides.js';
/** Blender's viewport shading for any renderer: render = the world's own pipeline, material = scene lights without post,
 *  solid = grey studio clay under a fixed key + hemisphere rig, wire = wireframe, normal = surface directions. Helpers
 *  (gizmo, grid, selection boxes) live in `overlay`, drawn after the scene, so an override material never greys them. */
export function createShading(renderer,camera,{composerRender=null}={}){
 const shading={view:'render',light:'scene'};const overlay=new THREE.Scene();
 const studio=new THREE.Group();studio.name='editor-studio-light';const key=new THREE.DirectionalLight('#ffffff',2.6);key.position.set(3,6,4);studio.add(new THREE.HemisphereLight('#dfe6f5','#3a3226',1.5),key);
 const mats={solid:new THREE.MeshStandardMaterial({color:'#9ea2a8',roughness:.75,metalness:0}),wire:new THREE.MeshBasicMaterial({color:'#7fb2ff',wireframe:true}),normal:new THREE.MeshNormalMaterial()};
 return {shading,overlay,studio,
  render(scene){const v=shading.view,wantStudio=v==='solid'||shading.light==='studio';
   if(wantStudio&&studio.parent!==scene)scene.add(studio);if(!wantStudio&&studio.parent)studio.removeFromParent();
   if(v==='render'){if(composerRender)composerRender();else renderer.render(scene,camera);return;}
   scene.overrideMaterial=mats[v]||null;renderer.render(scene,camera);scene.overrideMaterial=null;
   renderer.autoClear=false;renderer.render(overlay,camera);renderer.autoClear=true;},
  dispose(){studio.removeFromParent();for(const m of Object.values(mats))m.dispose();}};
}
let gltf=null;const defaultLoadGLB=url=>(gltf?Promise.resolve(gltf):import('three/addons/loaders/GLTFLoader.js').then(m=>gltf=new m.GLTFLoader())).then(l=>l.loadAsync(url)).then(g=>g.scene);
/**
 * @param roots  {name: Object3D} — the editable roots; with one entry the realm buttons disappear.
 * @param realm  the name of the root that is active (and the overrides section it saves to).
 * @param overrides the full overrides object (src/scene-overrides.json or the browser draft); the realm's section is created if missing.
 */
export function createEditorHost({renderer,scene,camera,canvas,roots,realm,overrides,composerRender=null,loadGLB=defaultLoadGLB,onEditing=()=>{},onRealm=null}){
 const controls=new OrbitControls(camera,canvas);controls.enabled=false;controls.enableDamping=false;controls.zoomToCursor=true;
 const sh=createShading(renderer,camera,{composerRender});let editing=false,editorFrame=null,current=realm;
 for(const name of Object.keys(roots))if(!overrides[name])overrides[name]={edits:{},added:[]};
 return {camera,canvas,renderer,controls,overrides,loadGLB,find:findByPath,roots,get realm(){return current;},activeScene:()=>scene,
  overlay:sh.overlay,get shading(){return sh.shading;},setShading(s){Object.assign(sh.shading,s);},
  get editing(){return editing;},
  setEditing(on){editing=Boolean(on);controls.enabled=editing;if(editing){const f=new THREE.Vector3();camera.getWorldDirection(f);controls.target.copy(camera.position).addScaledVector(f,6);controls.update();}onEditing(editing);},
  onEditorFrame(fn){editorFrame=fn;},
  setRealm(name){if(roots[name]){current=name;onRealm?.(name);}},
  /** Called by the world's animation loop while editing, instead of stepping the player. */
  frame(dt){controls.update();editorFrame?.(dt);sh.render(scene);},
  dispose(){controls.dispose();sh.dispose();}};
}
