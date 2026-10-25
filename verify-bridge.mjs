import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verbCards,verbById,verbChange} from './dist/grammar/verbs.js';
import {bridgeModes,bridgeVerbs,bridgeForm,bridgeSentence,bridgeGuide,pastUses,desireUses,invitationUses} from './dist/grammar/bridge.js';
import {grammarLessons,allGrammarQuestions,grammarSkills} from './dist/grammar/data.js';
import {emptyGrammar,cleanGrammar,isGrammarAccepted,recordGrammarAnswer,dueGrammarSkills,grammarQueue} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {plainJapanese,particleText} from './dist/particles/ui.js';

// Independent gold forms, including voiced endings and 行く / 来る exceptions.
const past={read:'読んだ',drink:'飲んだ',write:'書いた',buy:'買った',swim:'泳いだ',speak:'話した',wait:'待った',die:'死んだ',play:'遊んだ',return:'帰った',enter:'入った',run:'走った',cut:'切った',exist:'あった',go:'行った',eat:'食べた',see:'見た',wake:'起きた',borrow:'借りた',sleep:'寝た',do:'した',study:'勉強した',come:'来た',marry:'結婚した'};
const wants={read:['読みたいです','読みたくないです'],drink:['飲みたいです','飲みたくないです'],go:['行きたいです','行きたくないです'],eat:['食べたいです','食べたくないです'],see:['見たいです','見たくないです'],sleep:['寝たいです','寝たくないです'],study:['勉強したいです','勉強したくないです'],come:['来たいです','来たくないです']};
const invites={drink:['飲みませんか','飲みましょう'],swim:['泳ぎませんか','泳ぎましょう'],play:['遊びませんか','遊びましょう'],go:['行きませんか','行きましょう'],eat:['食べませんか','食べましょう'],see:['見ませんか','見ましょう'],do:['しませんか','しましょう'],study:['勉強しませんか','勉強しましょう']};
assert.equal(Object.keys(past).length,verbCards.length);
for(const [id,ta] of Object.entries(past)){const v=verbById(id);assert.equal(plainJapanese(v.ta),ta);assert.equal(verbChange(v,'ta').target,v.ta);}
assert.equal(verbById('come').ta,'{来|き}た');
assert.equal(Object.keys(pastUses).length,8);assert.equal(bridgeVerbs('tai').length,8);assert.equal(bridgeVerbs('invite').length,8);
for(const [id,forms] of Object.entries(wants))assert.deepEqual(['want','not-want'].map(k=>plainJapanese(bridgeForm(verbById(id),k))),forms);
for(const [id,forms] of Object.entries(invites))assert.deepEqual(['ask','suggest'].map(k=>plainJapanese(bridgeForm(verbById(id),k))),forms);
assert.ok(!desireUses.die);assert.ok(!desireUses.exist);assert.ok(!invitationUses.sleep);assert.ok(!invitationUses.come);
let states=0;
for(const mode of Object.keys(bridgeModes))for(const v of bridgeVerbs(mode))for(const step of [0,1,2]){
  for(const variant of step===2&&mode!=='ta'?bridgeModes[mode].variants:[undefined]){
    const html=bridgeGuide(mode,v.id,step,variant);states++;
    assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));assert.ok(html.includes('g-verb-illustration'));
    if(step===1)assert.ok(html.includes(particleText(mode==='ta'?v.ta:bridgeForm(v,mode==='tai'?'want':'ask'))));
    if(step===2){
      const sentence=bridgeSentence(v,mode,variant);
      if(sentence)assert.ok(html.includes(`data-gsound="${plainJapanese(sentence)}"`));
      if(mode==='ta'){assert.ok(html.includes(particleText(v.ta)));assert.ok(html.includes(particleText(v.masu.replace(/ます$/,'ました'))));assert.equal(html.includes('過去的事與現在回顧'),!!sentence);}
      if(mode==='tai'){assert.ok(html.includes(`data-gbridge="${variant}" aria-pressed="true"`));if(variant==='not-want')assert.ok(html.includes(particleText(bridgeForm(v,'want').replace('たいです','たくありません'))));}
      if(mode==='invite'){assert.ok(html.includes('在邀請，不是單純說不做'));if(variant==='accept')assert.ok(html.includes('B · 願意參加'));if(variant==='decline')assert.ok(html.includes('是在婉拒'));}
    }
  }
}
assert.equal(states,144);assert.equal(bridgeSentence(verbById('exist'),'ta'),null);
assert.ok(bridgeGuide('tai','die',2).includes('我想讀這本書'));assert.ok(!bridgeGuide('tai','die',2).includes('死にたい'));
assert.ok(bridgeGuide('ta','go',1).includes('行く先變行って，所以是行った'));
assert.ok(bridgeGuide('tai','come',1).includes('<rt>き</rt>'));assert.ok(bridgeGuide('ta','come',1).includes('きて → きた'));
const negative=allGrammarQuestions.find(q=>q.id==='ds-5');assert.ok(isGrammarAccepted(negative,'{食|た}べたくないです'));assert.ok(isGrammarAccepted(negative,'{食|た}べたくありません'));assert.ok(!isGrammarAccepted(negative,'{食|た}べたいじゃありません'));
for(const [id,order] of [['ta-5',[1,2,0,3]],['iv-2',[1,2,0,3,4]]])assert.ok(isGrammarAccepted(allGrammarQuestions.find(q=>q.id===id),order));
for(const id of ['ta-godan','ta-other','desire-meaning','desire-form','invitation-meaning','invitation-form']){assert.ok(grammarSkills[id]);assert.ok(allGrammarQuestions.filter(q=>q.use===id).length>=2);}
const old={lessons:{permission:{complete:true,best:5,attempts:1}},skills:{'avoid-form':{attempts:3,correct:2,streak:2,needsReview:false,due:900000}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(old))),old);
const updated={lessons:{...old.lessons,'ta-form':{complete:true,best:4,attempts:1}},skills:{...old.skills,'invitation-meaning':{attempts:2,correct:0,streak:0,needsReview:true,due:0}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(updated))),updated);
for(const rng of [()=>0,()=>.5,()=>.99]){const q=grammarQueue('mixed',updated,rng);assert.equal(q.length,18);assert.equal(new Set(q.map(q=>q.lesson)).size,18);}
const review=emptyGrammar(),decline=allGrammarQuestions.find(q=>q.id==='iv-4');recordGrammarAnswer(review,decline,'朋友已經答應，只是晚一點到。',1000);assert.ok(dueGrammarSkills(review,1000).includes('invitation-meaning'));

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
const p=emptyGrammar();let html='',saved=0;
const ui=createGrammar({getProgress:()=>p,render:()=>{html=ui.renderPage();},changed:answer=>{if(answer)saved++;},navigate(){},speak(){},stopSpeech(){}});
const click=dataset=>ui.handle({dataset});
const choose=value=>{const m=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].find(m=>m[2].includes(`<span>${particleText(value)}</span>`));assert.ok(m,value);click({ganswer:m[1]});return m[1];};
click({glesson:'ta-form'});assert.ok(html.includes('GRAMMAR 16'));click({gvword:'go'});click({gvstep:'1'});assert.ok(html.includes(particleText('{行|い}った')));
click({gaction:'practice'});click({ganswer:'0'});assert.equal(saved,0);click({ggroup:'g2'});click({gaction:'form'});const index=choose('{読|よ}んだ');click({ganswer:index});
assert.equal(saved,1);assert.ok(html.includes('變化正確，分類再看一次'));assert.ok(html.includes('data-gsound="読んだ"'));assert.ok(!html.includes('data-gsound="読んだ。"'));assert.ok(p.skills['groups-basic'].needsReview);assert.equal(p.skills['ta-godan'].correct,1);assert.equal(p.lessons['ta-form'],undefined);
click({glesson:'desire'});click({gvgroup:'g3'});click({gvword:'come'});click({gvstep:'2'});click({gbridge:'not-want'});assert.ok(html.includes(particleText('{来|き}たくないです')));
const before=html;click({gvword:'die'});click({gbridge:'accept'});click({gintent:'permission'});assert.equal(html,before);
click({glesson:'invitation'});click({gvword:'go'});click({gvstep:'2'});click({gbridge:'decline'});assert.ok(html.includes('B · 這次不方便'));click({gbridge:'accept'});assert.ok(html.includes(particleText('いいですね。{行|い}きましょう。')));
click({gvword:'drink'});click({gvstep:'2'});assert.ok(html.includes('data-gbridge="ask" aria-pressed="true"')); // Word changes reset the response.
click({glesson:'desire'});click({gvstep:'2'});assert.ok(html.includes('data-gbridge="want" aria-pressed="true"')); // Cross-course state does not leak.
click({glesson:'invitation'});click({gaction:'practice'});choose('いっしょに{昼|ひる}ごはんを{食|た}べませんか。');click({gaction:'next'});for(const i of [1,2,0,3,4])click({gtile:String(i)});click({gaction:'submit'});assert.ok(html.includes('✓ 判斷正確'));
assert.ok(readFileSync('dist/index.html','utf8').includes('./grammar/bridge.css'));
assert.equal(grammarLessons.length,18);
console.log('PASS: 24 independent ta forms and 来る readings; 8 desire / 8 invitation contexts; 144 guide and dialogue states; polite/plain past, negative desire alternatives, invitation replies, selectors, first-answer classification/form tracking and old/new backups.');
