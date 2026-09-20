// Proje iskeleti: place.json + harness kopyası + README + tools/build_place.py + public/.well-known.
// Ağa çıkmaz, hiçbir şeyi ezmez (var olan dosyayı atlar ve söyler).
import {mkdirSync,existsSync,writeFileSync,readFileSync,cpSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {slug,manifestFrom} from './manifest.mjs';
const KIT=join(dirname(fileURLToPath(import.meta.url)),'..');
export function initProject(dir,answers={}){
 const created=[],skipped=[];
 const write=(rel,content)=>{const p=join(dir,rel);if(existsSync(p)){skipped.push(rel);return;}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,content);created.push(rel);};
 mkdirSync(dir,{recursive:true});
 const name=answers.name||'Yeni Mekân',place={id:slug(name),name,kind:answers.kind||'studio',url:answers.url||'',description:answers.description||'',address:answers.address||'',coordinates:null,engine:answers.engine||'fudo-three',geometry:'photo-sketch-and-owner-layout-interpretation',language:'tr',
  palette:{paper:'#101522',ink:'#e8e3cf',accent:'#f36a4d',sage:'#7dd1c7',filament:'#d89632',wood:'#76513c'},
  room:{width:Number(answers.width)||8,depth:Number(answers.depth)||6,ceiling:3,door:'south',window:'south',items:[]},stations:[],links:[],photos:[],sketch:'reference/sketch.jpg',services:{guestGuide:false,guestbook:false,printer:false},nexusKit:{version:'0.1',path:'modeler',template:answers.template||'room',geometry:answers.geometrySource||'code'}};
 write('place.json',JSON.stringify(place,null,2)+'\n');
 write('README.md',readFileSync(join(KIT,'templates','README-sablonu.md'),'utf8').replace('<Mekân adı>',name));
 write('.gitignore','node_modules/\ndist/\n.runtime/\n.env\n.env.*\n!harness/providers/.env.example\n*.log\n');
 write('tools/build_place.py',readFileSync(join(KIT,'templates','project','build_place.py'),'utf8'));
 write('reference/README.md','Fotoğrafları reference/photos/ altına, krokiyi reference/sketch.jpg olarak koy. Bunlar git\'e girmez (.gitignore).\n');
 mkdirSync(join(dir,'reference','photos'),{recursive:true});mkdirSync(join(dir,'public','.well-known'),{recursive:true});mkdirSync(join(dir,'public','models'),{recursive:true});
 if(!existsSync(join(dir,'harness'))){cpSync(join(KIT,'harness'),join(dir,'harness'),{recursive:true});created.push('harness/');}else skipped.push('harness/');
 const m=manifestFrom(place);if(!m.url)m.url='https://ornek.invalid/';
 for(const rel of ['public/nexus.json','public/.well-known/nexus.json'])write(rel,JSON.stringify(m,null,2)+'\n');
 return {created,skipped,place};
}
