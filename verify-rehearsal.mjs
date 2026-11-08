import assert from 'node:assert/strict';
import {scenes,slots} from './dist/phrasebook/data.js';
import {emptyPhrasebook,cleanPhrasebook,setSceneSelection,resolveScene} from './dist/phrasebook/model.js';
import {rehearsalRoutes,createRehearsal,rehearsalTurn,moveRehearsal} from './dist/phrasebook/rehearsal.js';
import {pocketScenes,pocketHtml,pocketText} from './dist/phrasebook/pocket.js';
import {createPhrasebook} from './dist/phrasebook/ui.js';
import {plainJapanese} from './dist/particles/ui.js';

const book=emptyPhrasebook();
assert.equal(rehearsalRoutes.length,6);
assert.equal(new Set(rehearsalRoutes.map(r=>r.id)).size,6);
for(const route of rehearsalRoutes)assert.equal(route.sceneIds.length,3);
for(const route of [...rehearsalRoutes,...scenes.map(s=>({sceneIds:[s.id],title:s.title}))]){
 const session=createRehearsal(route.sceneIds,route.title);assert.ok(session);
 const expected=route.sceneIds.flatMap(id=>resolveScene(scenes.find(s=>s.id===id)).lines);
 assert.equal(moveRehearsal(session,-1),false);
 for(let i=0;i<expected.length;i++){
  const turn=rehearsalTurn(session,book);assert.equal(turn.position,i+1);assert.equal(turn.total,expected.length);assert.equal(plainJapanese(turn.line.jp),plainJapanese(expected[i].jp));
  if(i>0){assert.equal(moveRehearsal(session,-1),true);assert.equal(rehearsalTurn(session,book).position,i);assert.equal(moveRehearsal(session,1),true);}
  assert.equal(moveRehearsal(session,1),true);assert.equal(session.finished,i===expected.length-1);
 }
 const completed=JSON.stringify(session);assert.equal(moveRehearsal(session,1),false);assert.equal(moveRehearsal(session,-1),false);assert.equal(JSON.stringify(session),completed);
}
for(const invalid of [null,[],['invalid'],['shop-bag','shop-bag'],['shop-bag',null]])assert.equal(createRehearsal(invalid,'bad'),null);
assert.deepEqual(cleanPhrasebook({saved:['shop-bag'],recent:['shop-bag']}),{saved:['shop-bag'],recent:['shop-bag'],selections:{}});
const dirty={saved:['ticket-count','<script>','ticket-count'],recent:['ticket-count'],selections:{'ticket-count':{adults:'4',children:'bad',roomIssue:'ac',unknown:'x'},'help-lost':{lostItem:'phone'},'unknown':{destination:'kyoto'},'shop-color':['black']}};
assert.deepEqual(cleanPhrasebook(dirty),{saved:['ticket-count'],recent:['ticket-count'],selections:{'ticket-count':{adults:'4'},'help-lost':{lostItem:'phone'}}});
for(const args of [['bad','adults','4'],['ticket-count','destination','tokyo'],['ticket-count','adults','<script>']]){const before=JSON.stringify(book);assert.equal(setSceneSelection(book,...args),false);assert.equal(JSON.stringify(book),before);}
for(const scene of scenes)for(const key of scene.slots)for(const option of slots[key].options){assert.equal(setSceneSelection(book,scene.id,key,option.id),true);assert.equal(book.selections[scene.id][key],option.id);}
assert.deepEqual(cleanPhrasebook(JSON.parse(JSON.stringify(book))),book);
setSceneSelection(book,'ticket-count','adults','4');setSceneSelection(book,'ticket-count','children','2');
setSceneSelection(book,'travel-ticket','destination','kyoto');
assert.ok(rehearsalTurn(createRehearsal(['ticket-count'],'票券'),book).line.zh.includes('成人票四張'));
book.saved=['ticket-count','travel-ticket'];
const frozen=JSON.stringify(book),html=pocketHtml(book),txt=pocketText(book);
assert.equal(pocketScenes(book).length,2);assert.ok(html.includes('成人票四張')&&html.includes('兒童票兩張')&&html.includes('京都站'));assert.ok(txt.includes('大人四枚')&&txt.includes('京都駅'));
assert.ok(html.includes('<ruby')&&html.includes('Content-Security-Policy'));assert.ok(!html.match(/<script|<link|<img|<iframe|\ssrc=/i));assert.ok(!html.includes('[[')&&!html.includes('undefined'));assert.equal(JSON.stringify(book),frozen);
assert.ok(!pocketHtml(dirty).includes('<script>'));assert.ok(pocketText(dirty).includes('成人票四張'));

let page='',modal='',spoken,download,changed=0;
globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
const ui=createPhrasebook({getState:()=>book,render:()=>page=ui.renderPage(),changed:()=>changed++,stopSpeech(){},speak:(value,el,opts)=>spoken={value,opts},detail:value=>modal=value,navigate(){},download:(value,format)=>download={value,format}});
const click=dataset=>assert.equal(ui.handle({dataset}),true);
click({fopen:'ticket-count'});assert.ok(page.includes('成人票四張'));
ui.change({dataset:{fslot:'adults'},value:'3'});assert.equal(book.selections['ticket-count'].adults,'3');
click({faction:'rehearse'});assert.ok(page.includes('輪到你，試著表達'));assert.ok(page.includes('成人票三張'));assert.ok(page.includes('先試著說說看'));
const beforePractice=JSON.stringify(book),beforeChanges=changed;
click({frate:'.65'});click({faction:'rehearsal-sound'});assert.ok(spoken.value.includes('大人三枚'));assert.equal(spoken.opts.rate,.65);
click({faction:'rehearsal-reveal'});assert.ok(!page.includes('先試著說說看'));click({faction:'rehearsal-card'});assert.ok(modal.includes('成人票三張'));
click({faction:'rehearsal-next'});assert.ok(page.includes('對方這樣說'));click({faction:'rehearsal-prev'});assert.ok(page.includes('先試著說說看'));
for(const line of scenes.find(s=>s.id==='ticket-count').lines)click({faction:'rehearsal-next'});
assert.ok(page.includes('這一次，你把話接下去了'));assert.equal(JSON.stringify(book),beforePractice);assert.equal(changed,beforeChanges);
click({faction:'rehearsal-restart'});assert.ok(page.includes('第 1 /'));click({faction:'rehearsal-exit'});assert.ok(page.includes('直接練這個情境的接話')===false);
click({faction:'pocket'});assert.ok(page.includes('把常用的話，帶在身邊'));assert.ok(page.includes('成人票三張')&&page.includes('京都站'));
click({fpocketSound:'ticket-count:0'});assert.ok(spoken.value.includes('大人三枚'));click({fpocketCard:'travel-ticket:0'});assert.ok(modal.includes('京都站'));
click({faction:'pocket-html'});assert.equal(download.format,'html');assert.ok(download.value.includes('成人票三張'));click({faction:'pocket-text'});assert.equal(download.format,'txt');assert.ok(download.value.includes('京都駅'));
click({faction:'back'});ui.reset();click({fopen:'ticket-count'});assert.ok(page.includes('成人票三張'));
book.recent=[];click({faction:'back'});click({faction:'routes'});assert.equal((page.match(/data-froute=/g)||[]).length,6);
const route=rehearsalRoutes[0];click({froute:route.id});assert.deepEqual(book.recent,[route.sceneIds[0]]);
const expectedTurns=route.sceneIds.reduce((n,id)=>n+scenes.find(s=>s.id===id).lines.length,0);
for(let i=0;i<expectedTurns;i++)click({faction:'rehearsal-next'});
assert.ok(page.includes('這一次，你把話接下去了'));assert.deepEqual(book.recent,[...route.sceneIds].reverse());
click({faction:'rehearsal-exit'});assert.ok(page.includes('在日本的每一天'));
ui.reset();const empty=emptyPhrasebook();const emptyUi=createPhrasebook({getState:()=>empty,render(){},stopSpeech(){}});emptyUi.handle({dataset:{faction:'pocket'}});assert.ok(emptyUi.renderPage().includes('先收藏幾個會用到的情境'));
console.log('PASS: all 60 single-scene rehearsals and six three-scene routes; backward/forward/finish guards, hidden Japanese, speed/card controls; selected-content persistence and old backups; portable offline HTML/TXT, favorites and visited-only route history without grading.');
