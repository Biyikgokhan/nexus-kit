// SPDX-License-Identifier: Apache-2.0
import place from '../place.json';
import { createWorld } from './world.js';
import './style.css';
document.title = place.name;
document.documentElement.lang = place.language || 'en';
document.querySelector('#name').textContent = place.name;
document.querySelector('#story').textContent = place.description;
const nav = document.querySelector('#links'), seen = new Set();
for (const link of [...(place.links || []), ...(place.room?.items || []).filter(o=>o.target).map(o=>({url:o.target, object:o.label || o.type, relation:'portal'}))]) {
  let url; try { url = new URL(link.url || link.target); if(url.protocol!=='https:'||url.username||url.password)continue; } catch { continue; }
  if (seen.has(url.href)) continue; seen.add(url.href);
  const a=document.createElement('a'); a.href=url.href; a.textContent=`${link.object || url.hostname} ↗`; a.rel='noopener noreferrer'; nav.append(a);
}
if (!seen.size) nav.textContent = 'Your next connection starts here. Add a portal in place.json.';
const status = document.querySelector('#status'), button = document.querySelector('#model');
try {
  const world = createWorld(document.querySelector('#world'), place, m => { document.querySelector('#metrics').textContent=`${m.triangles.toLocaleString()} rendered triangles · ${m.drawCalls} draw calls. Not an FPS benchmark.`; });
  button.addEventListener('click', async()=>{ button.disabled=true; try { await world.loadModel(new URL('models/place.glb', document.baseURI).href); status.textContent='Blender model loaded.'; } catch { status.textContent='Place a GLB at public/models/place.glb and rebuild. The procedural room remains available.'; } finally {button.disabled=false;} });
} catch { status.textContent='3D is unavailable on this device. The place description and links remain accessible.'; button.hidden=true; }
