import assert from 'node:assert/strict';
import {categories,scenes,slots,helpPhrases} from './dist/phrasebook/data.js';
import {emptyPhrasebook,cleanPhrasebook,rememberScene,toggleSaved,resolveScene,normalizeSearch,findScenes} from './dist/phrasebook/model.js';
import {createPhrasebook} from './dist/phrasebook/ui.js';
import {plainJapanese} from './dist/particles/ui.js';

assert.equal(categories.length,6);
assert.equal(scenes.length,36);
assert.equal(new Set(scenes.map(s=>s.id)).size,36);
for(const c of categories)assert.equal(scenes.filter(s=>s.category===c.id).length,6);
const validateLine=l=>{
 assert.ok(['you','staff'].includes(l.role));assert.ok(l.jp&&l.zh);
 assert.ok(!l.jp.includes('[[')&&!l.zh.includes('[['));
 assert.ok(!l.jp.replace(/\{[^|{}]+\|[^{}]+\}/g,'').match(/[{}]/));
 assert.ok(!plainJapanese(l.jp).match(/[{}|]/));
};
for(const s of scenes){
 assert.ok(s.lines.some(l=>l.role==='you')&&s.lines.some(l=>l.role==='staff'));
 assert.equal(s.alternatives.length,2);
 for(const l of [...resolveScene(s).lines,...resolveScene(s).alternatives])validateLine(l);
 for(const key of s.slots){
  assert.ok(slots[key]);assert.equal(new Set(slots[key].options.map(o=>o.id)).size,slots[key].options.length);
  for(const o of slots[key].options){
   const resolved=resolveScene(s,{[key]:o.id});
   for(const l of [...resolved.lines,...resolved.alternatives])validateLine(l);
   const template=s.lines.find(l=>l.jp.includes(`[[${key}]]`));
   if(template){const line=resolved.lines[s.lines.indexOf(template)];assert.ok(line.jp.includes(o.jp));assert.ok(line.zh.includes(o.zh));}
  }
 }
 assert.deepEqual(resolveScene(s,{destination:'<script>',adults:'bad'}),resolveScene(s));
}
const ticket=scenes.find(s=>s.id==='ticket-count');
for(const a of slots.adults.options)for(const c of slots.children.options){
 const line=resolveScene(ticket,{adults:a.id,children:c.id}).lines[0];
 assert.ok(line.jp.includes(a.jp)&&line.jp.includes(c.jp));assert.ok(line.zh.includes(a.zh)&&line.zh.includes(c.zh));
}
assert.ok(findScenes('袋子').some(s=>s.id==='shop-bag'));
assert.ok(findScenes('轉車').some(s=>s.id==='travel-transfer'));
assert.ok(findScenes('月台').some(s=>s.id==='travel-platform'));
assert.ok(findScenes('小孩票').some(s=>s.id==='ticket-count'));
assert.ok(findScenes('袋').some(s=>s.id==='shop-bag'));
assert.ok(findScenes('ふくろ').some(s=>s.id==='shop-bag'));
assert.ok(findScenes('ｻｲｽﾞ').some(s=>s.id==='shop-size'));
assert.equal(normalizeSearch('ＴＯＫＹＯ カレー'),'tokyo かれー');
assert.ok(findScenes('兒童票 幾張','tickets').some(s=>s.id==='ticket-count'));
assert.equal(findScenes('袋子','hotel').length,0);
assert.equal(findScenes('<script>"').length,0);
assert.deepEqual(cleanPhrasebook(undefined),emptyPhrasebook());
assert.deepEqual(cleanPhrasebook({saved:['shop-bag','bad','shop-bag',null],recent:['shop-size','shop-size','bad']}),{saved:['shop-bag'],recent:['shop-size']});
const book=emptyPhrasebook();
for(const s of scenes)rememberScene(book,s.id);
assert.equal(book.recent.length,12);assert.equal(book.recent[0],scenes.at(-1).id);
rememberScene(book,scenes.at(-3).id);assert.equal(book.recent[0],scenes.at(-3).id);assert.equal(new Set(book.recent).size,12);
assert.equal(rememberScene(book,'invalid'),false);assert.equal(toggleSaved(book,'invalid'),false);
toggleSaved(book,'shop-bag');assert.deepEqual(findScenes('','all','saved',book).map(s=>s.id),['shop-bag']);
assert.deepEqual(findScenes('','all','recent',book).map(s=>s.id),book.recent);
assert.deepEqual(cleanPhrasebook(JSON.parse(JSON.stringify(book))),book);
toggleSaved(book,'shop-bag');assert.equal(book.saved.length,0);

let html='',modal='',spoken,changed=0,renders=0,stopped=0,navigated=0;
const result={innerHTML:''};
globalThis.document={querySelector:s=>s==='#f-results'?result:{focus(){}}};
globalThis.window={scrollTo(){}};
const ui=createPhrasebook({getState:()=>book,render:()=>{renders++;html=ui.renderPage();},changed:()=>changed++,speak:(value,button,opts)=>{spoken={value,opts};},stopSpeech:()=>stopped++,detail:s=>modal=s,navigate:()=>navigated++});
const click=d=>assert.equal(ui.handle({dataset:d}),true);
html=ui.renderPage();assert.equal((html.match(/class="f-scene-card"/g)||[]).length,36);
assert.equal(ui.handle({dataset:{other:'x'}}),false);
const beforeInput=renders;assert.equal(ui.input({dataset:{fsearch:''},value:'袋子'}),true);assert.equal(renders,beforeInput);assert.ok(result.innerHTML.includes('shop-bag'));
ui.input({dataset:{fsearch:''},value:'"><img src=x onerror=alert(1)>'});
html=ui.renderPage();assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
click({faction:'clear'});
for(const s of scenes){
 click({fopen:s.id});assert.ok(html.includes(s.title));assert.ok(!html.includes('[[')&&!html.includes('undefined'));
 click({faction:'play'});assert.equal(spoken.value.length,s.lines.length);assert.ok(spoken.value.every(t=>!/[{}|]/.test(t)));
 click({frole:'staff'});click({faction:'play'});assert.equal(spoken.value.length,s.lines.filter(l=>l.role==='staff').length);
 click({frole:'you'});click({faction:'play'});assert.equal(spoken.value.length,s.lines.filter(l=>l.role==='you').length);
 click({frole:'all'});click({faction:'back'});
}
click({fopen:'ticket-count'});
const option=slots.adults.options.at(-1);
assert.equal(ui.change({dataset:{fslot:'adults'},value:option.id}),true);
assert.ok(html.includes(option.zh));
click({fsound:'line:0'});assert.ok(spoken.value.includes(plainJapanese(option.jp)));
click({frate:'.65'});click({fsound:'alt:0'});assert.equal(spoken.opts.rate,.65);assert.ok(spoken.value.includes(plainJapanese(option.jp)));
click({fcard:'line:0'});assert.ok(modal.includes('f-large-card'));assert.ok(!modal.includes('[['));assert.ok(modal.includes(option.zh));
const old=html;ui.change({dataset:{fslot:'adults'},value:'malicious'});assert.equal(html,old);
const saves=changed;click({fsave:'ticket-count'});assert.equal(changed,saves+1);assert.ok(book.saved.includes('ticket-count'));
click({faction:'back'});click({fscope:'saved'});assert.ok(html.includes('我的會話收藏'));
click({faction:'clear'});
for(let i=0;i<helpPhrases.length;i++){click({fhelpSound:String(i)});assert.equal(spoken.value,plainJapanese(helpPhrases[i].jp));click({fhelpCard:String(i)});assert.ok(modal.includes(helpPhrases[i].zh));}
click({faction:'translation'});assert.ok(!ui.renderPage().includes('class="f-preview-zh"'));
ui.reset();assert.equal((ui.renderPage().match(/class="f-scene-card"/g)||[]).length,36);
assert.equal(navigated,37);assert.ok(stopped>0);
console.log('PASS: 36 everyday conversations / six categories, all substitutions, search, role-filtered playback, cards, favorites, recent history, backup validation and independent browsing.');
