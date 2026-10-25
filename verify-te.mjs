import assert from 'node:assert/strict';
import {verbCards,verbById,verbChange,tePatterns,requestUses,iruUses,guideVerbs} from './dist/grammar/verbs.js';
import {verbGuide} from './dist/grammar/verb-guide.js';
import {grammarLessons,allGrammarQuestions,grammarSkills} from './dist/grammar/data.js';
import {emptyGrammar,cleanGrammar,isGrammarAccepted,dueGrammarSkills} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {plainJapanese,particleText} from './dist/particles/ui.js';

const expected={read:'読んで',drink:'飲んで',write:'書いて',buy:'買って',swim:'泳いで',speak:'話して',wait:'待って',die:'死んで',play:'遊んで',return:'帰って',enter:'入って',run:'走って',cut:'切って',exist:'あって',go:'行って',eat:'食べて',see:'見て',wake:'起きて',borrow:'借りて',sleep:'寝て',do:'して',study:'勉強して',come:'来て',marry:'結婚して'};
assert.equal(tePatterns.length,5);assert.equal(Object.keys(expected).length,verbCards.length);
for(const [id,form] of Object.entries(expected)){
  const v=verbById(id);assert.equal(plainJapanese(v.te),form);assert.equal(verbChange(v,'te').target,v.te);
  for(const step of [0,1,2]){
    const html=verbGuide('te',id,step);assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
    if(step===1){assert.ok(html.includes(particleText(v.te))||html.includes('g-change-diagram'));if(id==='go')assert.ok(html.includes('直接記「行く → 行って」'));}
    if(step===2)assert.ok(html.includes(`data-gsound="${form}"`));
  }
}
assert.equal(verbById('come').te,'{来|き}て');assert.ok(verbChange(verbById('go'),'te').special);
assert.equal(verbChange(verbById('swim'),'te').pattern.ending,'いで');
assert.equal(verbChange(verbById('read'),'te').pattern.ending,'んで');
assert.equal(guideVerbs('request').length,12);assert.equal(guideVerbs('iru').length,7);
for(const id of ['die','exist','return']){assert.ok(!requestUses[id]);assert.ok(!iruUses[id]);}
for(const mode of ['request','iru'])for(const v of guideVerbs(mode)){
  const use=mode==='request'?requestUses[v.id]:iruUses[v.id];
  for(const step of [0,1,2]){
    const html=verbGuide(mode,v.id,step);assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
    if(step===1)assert.ok(html.includes(particleText(v.te+(mode==='request'?'ください':'います'))));
    if(step===2){assert.ok(html.includes(use.zh));assert.ok(html.includes(`data-gsound="${plainJapanese(use.phrase+v.te+(mode==='request'?'ください':'います')+'。')}"`));}
  }
}
assert.ok(verbGuide('iru','read',2).includes('動作正在進行的時間圖'));
assert.ok(verbGuide('iru','study',2).includes('習慣反覆發生的時間圖'));
assert.ok(verbGuide('iru','marry',2).includes('結果狀態的時間圖'));
assert.ok(!verbGuide('iru','marry',2).includes('正在結婚'));
assert.ok(!verbGuide('request','die',2).includes('死んでください')); // Ineligible words fall back to a reviewed pair.
assert.ok(!verbGuide('iru','exist',2).includes('あっています'));
assert.ok(isGrammarAccepted(allGrammarQuestions.find(q=>q.id==='ir-2'),[1,2,0,3,4]));
for(const id of ['te-godan','te-other','request-meaning','request-form','iru-progress','iru-context'])assert.ok(grammarSkills[id]);
const previous={lessons:{'nai-form':{complete:true,best:5,attempts:1}},skills:{'nai-godan':{attempts:3,correct:2,streak:1,needsReview:true,due:1234}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(previous))),previous);
const expanded={lessons:{...previous.lessons,'te-iru':{complete:true,best:4,attempts:2}},skills:{...previous.skills,'iru-context':{attempts:2,correct:0,streak:0,needsReview:true,due:0}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(expanded))),expanded);
assert.ok(dueGrammarSkills(expanded).includes('iru-context'));

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
const p=emptyGrammar();let html='',saved=0;
const ui=createGrammar({getProgress:()=>p,render:()=>{html=ui.renderPage();},changed:answer=>{if(answer)saved++;},navigate(){},speak(){},stopSpeech(){}});
const click=dataset=>ui.handle({dataset});
const choose=value=>{const m=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].find(m=>m[2].includes(`<span>${particleText(value)}</span>`));assert.ok(m,value);click({ganswer:m[1]});};
click({glesson:'te-form'});assert.ok(html.includes('GRAMMAR 10'));assert.ok(!html.includes('GRAMMAR 010'));
click({gvword:'go'});click({gvstep:'1'});assert.ok(html.includes('這一組直接記'));assert.ok(html.includes('行って'));
click({gaction:'practice'});click({ggroup:'g1'});click({gaction:'form'});choose(verbById('read').te);
assert.ok(html.includes('完成的形式'));assert.ok(html.includes('data-gsound="読んで"'));assert.ok(!html.includes('data-gsound="読んで。"'));
assert.equal(saved,1);assert.equal(p.lessons['te-form'],undefined);
click({glesson:'te-iru'});click({gvgroup:'g3'});click({gvword:'marry'});click({gvstep:'2'});
assert.ok(html.includes('仍然已婚'));assert.ok(html.includes('結果狀態的時間圖'));
const before=html;click({gvword:'exist'});assert.equal(html,before); // No unreviewed ています combinations through the controller.
click({gaction:'practice'});
choose(allGrammarQuestions.find(q=>q.id==='ir-1').answers[0]);click({gaction:'next'});
for(const i of [1,2,0,3,4])click({gtile:String(i)});click({gaction:'submit'});assert.ok(html.includes('✓ 判斷正確'));
click({gaction:'next'});choose('{食|た}べてください');assert.ok(html.includes('這是在請對方吃'));
assert.equal(p.skills['iru-progress'].needsReview,true);click({gaction:'next'});
choose('只表示說話當下正在學，不能用來說習慣。');assert.ok(html.includes('不只有正在進行一種意思'));
assert.equal(p.skills['iru-context'].needsReview,true);
assert.equal(p.lessons['te-iru'],undefined);
assert.equal(grammarLessons.filter(l=>l.guide).length,12);
console.log('PASS: all 24 te forms and 行く/来る exceptions; 129 new guide states; only 12 reviewed requests and 7 contextual ています examples; progress/habit/result timelines; bare-form rendering; twelve-lesson numbering; context mistakes, accepted word order and backup compatibility.');
