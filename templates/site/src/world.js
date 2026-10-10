// SPDX-License-Identifier: Apache-2.0
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createWorld(container, place, onMetrics = () => {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(10, 9, 12);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.5, 0);
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.minDistance = 4; controls.maxDistance = 30;
  controls.update();
  scene.add(new THREE.HemisphereLight(0xf6ebd6, 0x294341, 2.2));
  const sun = new THREE.DirectionalLight(0xffdec0, 3);
  sun.position.set(3, 10, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
  sun.shadow.bias = -0.001; scene.add(sun);
  let group, paletteMaterials = [], disposed = false;
  const release = root => {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    root.traverse(o => { if (o.geometry) geometries.add(o.geometry); for (const m of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) { materials.add(m); for (const v of Object.values(m)) if (v?.isTexture) textures.add(v); } });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose());
  };
  function render() { if (disposed) return; renderer.render(scene, camera); onMetrics({ triangles: renderer.info.render.triangles, drawCalls: renderer.info.render.calls }); }
  function resize() { const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); render(); }
  const observer = new ResizeObserver(resize); observer.observe(container);
  controls.addEventListener('change', render);
  function update(p) {
    if (group) { scene.remove(group); release(group); }
    paletteMaterials.forEach(m => m.dispose());
    group = new THREE.Group(); scene.add(group);
    const palette = p.palette || {};
    const materials = Object.fromEntries(Object.entries({ floor: '#c9b597', wall: '#71938c', wood: '#845b42', dark: '#263d3a', leaf: '#819c65', clay: '#c6734c', accent: palette.accent || '#e8ad72', paper: '#eee6ce' }).map(([k, color]) => [k, new THREE.MeshStandardMaterial({ color, roughness: 0.85 })]));
    paletteMaterials = Object.values(materials);
    const box = (name, x, y, z, w, h, d, color) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 1, Math.min(.035, w/8, h/8, d/8)), materials[color]); o.name = name; o.position.set(x,y,z); o.castShadow = o.receiveShadow = true; group.add(o); return o; };
    const { width = 8, depth = 6, items = [] } = p.room || {};
    box('floor', 0, -.15, 0, width, .3, depth, 'floor');
    box('back-wall', 0, 1.4, -depth/2, width, 2.8, .12, 'wall');
    box('left-wall', -width/2, 1.4, 0, .12, 2.8, depth, 'wall');
    for (const [i, item] of items.entries()) {
      const { x, z, type } = item, id = item.id || `${type}-${i}`;
      if (type === 'table') { box(id, x, .85, z, 1.4, .14, .8, 'wood'); for (const dx of [-.53,.53]) for (const dz of [-.25,.25]) box(id+'-leg', x+dx, .4, z+dz, .09, .8, .09, 'dark'); }
      if (type === 'seat') { box(id, x, .35, z, 1.3, .45, .7, 'accent'); box(id+'-back', x, .7, z-.3, 1.3, .7, .15, 'dark'); }
      if (type === 'plant') { box(id+'-pot', x, .2, z, .4, .4, .4, 'clay'); const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.5, 0), materials.leaf); crown.position.set(x,.85,z); crown.scale.y=1.4; crown.castShadow=true; group.add(crown); }
      if (type === 'frame') { box(id, x, 1.2, z, 1.1, 1.3, .12, 'wood'); box(id+'-art', x, 1.2, z+.07, .9, 1.1, .025, 'paper'); }
      if (type === 'portal') { box(id, x, 1, z, .9, 2, .3, 'dark'); box(id+'-light', x, 1.1, z+.16, .68, 1.35, .025, 'accent'); }
    }
    render();
  }
  update(place); resize();
  return { update, async loadModel(url) { const gltf = await new GLTFLoader().loadAsync(url); if (disposed) { release(gltf.scene); return; } if (group) { scene.remove(group); release(group); } paletteMaterials.forEach(m => m.dispose()); paletteMaterials=[]; group = gltf.scene; scene.add(group); render(); }, dispose() { disposed=true; observer.disconnect(); controls.dispose(); if(group)release(group); paletteMaterials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove(); } };
}
