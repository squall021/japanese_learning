import {categories,scenes,slots} from './data.js';
const ids=new Set(scenes.map(s=>s.id));
export const emptyPhrasebook=()=>({saved:[],recent:[]});
const validList=raw=>Array.isArray(raw)?[...new Set(raw.filter(id=>typeof id==='string'&&ids.has(id)))]:[];
export const cleanPhrasebook=raw=>({saved:validList(raw?.saved),recent:validList(raw?.recent).slice(0,12)});
export function rememberScene(book,id){if(!ids.has(id))return false;book.recent=[id,...book.recent.filter(x=>x!==id)].slice(0,12);return true;}
export function toggleSaved(book,id){if(!ids.has(id))return false;book.saved=book.saved.includes(id)?book.saved.filter(x=>x!==id):[...book.saved,id];return true;}
export function resolveScene(scene,selection={}){
 const replace=(value,lang)=>value.replace(/\[\[(\w+)\]\]/g,(_,key)=>{
  if(!scene.slots.includes(key)||!slots[key])throw Error('Unknown phrase slot: '+key);
  return (slots[key].options.find(o=>o.id===selection[key])||slots[key].options[0])[lang];
 });
 const resolve=line=>({...line,jp:replace(line.jp,'jp'),zh:replace(line.zh,'zh')});
 const p=scene.replyPractice;
 return {...scene,lines:scene.lines.map(resolve),alternatives:scene.alternatives.map(resolve),...(p?{replyPractice:{...p,prompt:resolve(p.prompt),options:p.options.map(o=>({...o,line:resolve(o.line),reply:resolve(o.reply)}))}}:{})};
}
const plain=s=>s.replace(/\{([^|{}]+)\|[^{}]+\}/g,'$1');
const reading=s=>s.replace(/\{[^|{}]+\|([^{}]+)\}/g,'$1');
const sceneLines=s=>[...s.lines,...s.alternatives,...(s.replyPractice?[s.replyPractice.prompt,...s.replyPractice.options.flatMap(o=>[o.line,o.reply])]:[])];
export const normalizeSearch=s=>String(s).normalize('NFKC').toLowerCase().replace(/[\u30a1-\u30f6]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const searchable=s=>normalizeSearch([s.title,s.description,categories.find(c=>c.id===s.category).name,...s.keywords,
 ...sceneLines(s).flatMap(l=>[plain(l.jp),reading(l.jp),l.zh]),...(s.replyPractice?.options.map(o=>o.label)||[]),
 ...s.slots.flatMap(key=>slots[key].options.flatMap(o=>[plain(o.jp),reading(o.jp),o.zh]))].join(' '));
const index=new Map(scenes.map(s=>[s.id,searchable(s)]));
export function findScenes(query='',category='all',scope='all',book=emptyPhrasebook()){
 const terms=normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
 const pool=scope==='recent'?book.recent.map(id=>scenes.find(s=>s.id===id)).filter(Boolean):scenes;
 return pool.filter(s=>(category==='all'||s.category===category)&&(scope!=='saved'||book.saved.includes(s.id))&&terms.every(t=>index.get(s.id).includes(t)));
}
