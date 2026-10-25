import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verbCards,verbById,verbChange,godanRows,verbGroups} from './dist/grammar/verbs.js';
import {verbGuide} from './dist/grammar/verb-guide.js';
import {allGrammarQuestions,grammarLessons} from './dist/grammar/data.js';
import {emptyGrammar,cleanGrammar,dueGrammarSkills} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {plainJapanese,particleText} from './dist/particles/ui.js';

// Independent, reviewed expectations: spelling, class, polite form and plain negative.
const golden=[
  ['read','読む','g1','読みます','読まない'],['write','書く','g1','書きます','書かない'],
  ['buy','買う','g1','買います','買わない'],['swim','泳ぐ','g1','泳ぎます','泳がない'],
  ['speak','話す','g1','話します','話さない'],['wait','待つ','g1','待ちます','待たない'],
  ['die','死ぬ','g1','死にます','死なない'],['play','遊ぶ','g1','遊びます','遊ばない'],
  ['return','帰る','g1','帰ります','帰らない'],['enter','入る','g1','入ります','入らない'],
  ['run','走る','g1','走ります','走らない'],['cut','切る','g1','切ります','切らない'],
  ['exist','ある','g1','あります','ない'],['eat','食べる','g2','食べます','食べない'],
  ['see','見る','g2','見ます','見ない'],['wake','起きる','g2','起きます','起きない'],
  ['borrow','借りる','g2','借ります','借りない'],['sleep','寝る','g2','寝ます','寝ない'],
  ['do','する','g3','します','しない'],['study','勉強する','g3','勉強します','勉強しない'],
  ['come','来る','g3','来ます','来ない'],['drink','飲む','g1','飲みます','飲まない'],
  ['go','行く','g1','行きます','行かない'],['marry','結婚する','g3','結婚します','結婚しない']
];
assert.equal(verbCards.length,24);assert.equal(new Set(verbCards.map(v=>v.id)).size,24);
assert.equal(godanRows.length,9);assert.equal(new Set(godanRows.map(r=>r[0])).size,9);
for(const [id,jp,group,masu,nai] of golden){
  const v=verbById(id);assert.ok(v);assert.equal(plainJapanese(v.jp),jp);assert.equal(v.group,group);
  assert.equal(plainJapanese(v.masu),masu);assert.equal(plainJapanese(v.nai),nai);
  assert.ok(v.meaning&&typeof v.phrase==='string'&&v.positive&&v.negative);
  for(const mode of ['groups','masu','nai'])for(const step of [0,1,2]){
    const html=verbGuide(mode,id,step);assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
    assert.ok(html.includes('動詞變化圖說'));assert.ok(html.includes('g-verb-illustration'));
    if(step===1)assert.ok(html.includes(particleText(v[mode==='nai'?'nai':'masu']))||html.includes('g-change-diagram'));
    if(step===2)assert.ok(html.includes(`data-gsound="${plainJapanese(v.phrase+v[mode==='nai'?'nai':'masu']+'。')}"`));
  }
}
assert.equal(verbById('unknown'),undefined);
assert.equal(verbById('come').jp,'{来|く}る');assert.equal(verbById('come').masu,'{来|き}ます');assert.equal(verbById('come').nai,'{来|こ}ない');
assert.ok(verbChange(verbById('exist'),'nai').special);assert.equal(verbChange(verbById('exist'),'nai').target,'ない');
assert.ok(verbChange(verbById('buy'),'nai').note.includes('「わ」，不是「あ」'));
assert.ok(verbChange(verbById('eat'),'masu').removed==='る');
assert.ok(!verbGuide('nai','exist',1).includes('あらない</span>'));
assert.ok(verbGuide('masu','wake',1).includes('起'));assert.ok(verbById('return').exception);
for(const q of allGrammarQuestions.filter(q=>q.type==='conjugate')){
  const v=verbById(q.verbId);assert.ok(v);assert.equal(q.answers[0],v[q.target]);assert.ok(['groups-basic','groups-tricky'].includes(q.groupUse));
}

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
const progress=emptyGrammar();let html='',answers=0,saves=0;
const ui=createGrammar({getProgress:()=>progress,render:()=>{html=ui.renderPage();},changed:count=>{count?answers++:saves++;},navigate(){},speak(){},stopSpeech(){}});
const click=dataset=>ui.handle({dataset});
const choose=option=>{const m=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].find(m=>m[2].includes(`<span>${particleText(option)}</span>`));assert.ok(m,option);click({ganswer:m[1]});};
click({glesson:'masu-form'});assert.ok(html.includes('動詞變化，一次看一步'));
click({gvgroup:'g2'});click({gvword:'wake'});click({gvstep:'1'});assert.ok(html.includes('拿掉「る」'));
click({gvgroup:'g3'});click({gvword:'come'});click({gvstep:'2'});assert.ok(html.includes('来ます'));
click({gvgroup:'__proto__'});click({gvword:'nope'});click({gvstep:'9'});assert.ok(!html.includes('undefined'));
assert.equal(answers,0);assert.equal(saves,0);assert.deepEqual(progress,emptyGrammar());
click({gaction:'practice'});click({gaction:'form'});assert.ok(!html.includes('data-ganswer='));
click({ggroup:'g2'});click({ggroup:'g1'});assert.equal(progress.skills['groups-basic'].attempts,1);assert.equal(progress.skills['groups-basic'].needsReview,true);
assert.equal(answers,0);assert.equal(saves,1);assert.ok(html.includes('先記住這個動詞的路線'));
assert.equal(progress.skills['masu-godan'],undefined);
click({gaction:'form'});choose(verbById('read').masu);choose(verbById('read').masu);
assert.equal(answers,1);assert.equal(progress.skills['masu-godan'].attempts,1);assert.equal(progress.skills['masu-godan'].correct,1);
assert.ok(html.includes('變化正確，分類再看一次'));assert.ok(html.includes('0 題答對'));
assert.ok(!dueGrammarSkills(progress).includes('masu-godan'));assert.ok(dueGrammarSkills(progress).includes('groups-basic'));
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(progress))),progress);
click({gaction:'next'});choose(allGrammarQuestions.find(q=>q.id==='ma-2').answers[0]);click({gaction:'next'});
click({ggroup:'g1'});click({gaction:'form'});choose('{帰|かえ}ます');
assert.ok(html.includes('再看一次句子裡的線索'));assert.equal(progress.skills['groups-tricky'].needsReview,false);assert.equal(progress.skills['masu-godan'].needsReview,true);
assert.equal(progress.lessons['masu-form'],undefined); // Leaving after three questions is not completion.
ui.reset();
const overview=ui.renderPage();assert.ok(overview.includes('15 堂短課'));assert.ok(overview.includes('45 組可點擊例句'));assert.ok(overview.includes('90 道練習'));
const index=readFileSync('dist/index.html','utf8');assert.ok(index.includes('./grammar/verb-guide.css'));
assert.equal(grammarLessons.filter(l=>l.guide).length,9);
console.log('PASS: 24 reviewed verbs / nine godan endings; all groups and exceptions; 来る readings; 216 basic illustrated guide states; plain/polite examples; classification/form mistakes tracked separately; interrupted and duplicate submission guards; old/new backups.');
