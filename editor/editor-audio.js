/* Sound and music controls a world offers to the editor's "Ses" panel. Each world registers what it has —
   the atelier its ambience volume, mute and music, the cave its radio and strobe — as small typed items;
   the editor only renders them. Nothing here touches audio itself. */
const items=[];const listeners=new Set();
export const editorAudio={
 /** item: {id,label,kind:'range'|'toggle'|'action',get,set,min=0,max=1,step=.01,tip} */
 register(item){const i=items.findIndex(x=>x.id===item.id);if(i>=0)items[i]=item;else items.push(item);for(const l of listeners)l();return()=>{const k=items.indexOf(item);if(k>=0)items.splice(k,1);for(const l of listeners)l();};},
 list(){return [...items];},
 onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},
};
