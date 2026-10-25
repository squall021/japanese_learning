import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ruleModes,ruleWords,ruleWord,ruleGuide,ruleSentence,ruleTranslation} from './dist/grammar/rules.js';
import {grammarLessons,allGrammarQuestions,grammarSkills} from './dist/grammar/data.js';
import {emptyGrammar,cleanGrammar,isGrammarAccepted,recordGrammarAnswer,dueGrammarSkills,grammarQueue} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {particleText,plainJapanese} from './dist/particles/ui.js';

// Independently reviewed forms: the new guides must retain ない and use the right readings.
const gold={sit:['座る','座って','座らない'],photo:['撮る','撮って','撮らない'],drink:['飲む','飲んで','飲まない'],enter:['入る','入って','入らない'],eat:['食べる','食べて','食べない'],borrow:['借りる','借りて','借りない'],do:['する','して','しない'],come:['来る','来て','来ない']};
assert.equal(ruleWords.length,8);assert.equal(new Set(ruleWords.map(v=>v.id)).size,8);
const suffixes={permission:'もいいですか',avoid:'でください',prohibition:'はいけません'};
let states=0;
for(const [id,forms] of Object.entries(gold)){
  const v=ruleWord(id);assert.deepEqual([v.jp,v.te,v.nai].map(plainJapanese),forms);assert.equal(v.contexts.length,3);
  for(const mode of Object.keys(ruleModes)){
    const base=mode==='avoid'?forms[2]:forms[1];
    assert.equal(plainJapanese(ruleSentence(v,mode)),plainJapanese(v.phrase)+base+suffixes[mode]+'。');
    for(const step of [0,1,2])for(const intent of step===2?Object.keys(ruleModes):[mode]){
      const html=ruleGuide(mode,id,step,intent);states++;
      assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
      if(step===1){assert.ok(html.includes(particleText(v[ruleModes[mode].form]+suffixes[mode])));if(mode==='avoid')assert.ok(html.includes('保留整個「ない」'));}
      if(step===2){
        const sentence=ruleSentence(v,intent);assert.ok(html.includes(ruleTranslation(v,intent)));assert.ok(html.includes(`data-gsound="${plainJapanese(sentence)}"`));
        assert.ok(html.includes(v.contexts[Object.keys(ruleModes).indexOf(intent)]));
        assert.ok(html.includes('用法會重疊'));assert.ok(html.includes(`data-gintent="${intent}" aria-pressed="true"`));
        if(intent==='permission'){assert.ok(html.includes('問句本身不代表已獲得許可'));assert.ok(html.includes(particleText(v.nai+'でください。')));assert.ok(html.includes(particleText(v.te+'もいいです。')));}
      }
    }
  }
}
assert.equal(states,120);assert.equal(ruleWord('come').nai,'{来|こ}ない');assert.equal(ruleWord('come').te,'{来|き}て');
assert.ok(ruleGuide('avoid','come',1).includes('<rt>こ</rt>'));
assert.ok(ruleGuide('permission','drink',1).includes('飲んでもいいですか')||ruleGuide('permission','drink',1).includes(particleText('{飲|の}んでもいいですか')));
assert.ok(readFileSync('dist/index.html','utf8').includes('./grammar/rules.css'));
for(const [id,order] of [['pm-2',[1,2,0,3,4,5]],['pb-2',[1,2,0,3,4]]])assert.ok(isGrammarAccepted(allGrammarQuestions.find(q=>q.id===id),order));
const ids=['permission','avoid-request','prohibition'];
const newQuestions=allGrammarQuestions.filter(q=>ids.includes(q.lesson));assert.equal(newQuestions.length,18);
for(const skill of ['permission-meaning','permission-form','avoid-meaning','avoid-form','prohibition-meaning','prohibition-form']){
  assert.ok(grammarSkills[skill]);assert.ok(newQuestions.filter(q=>q.use===skill).length>=2);
}
// Every distractor must have a distinct meaning/form explanation; review follows first submission.
const wrongProgress=emptyGrammar();
for(const q of newQuestions){
  if(q.type==='build')continue;
  for(const option of q.options){
    const expected=q.answers.includes(option);assert.equal(isGrammarAccepted(q,option),expected);
    if(!expected){assert.ok(q.wrong[option]);assert.equal(recordGrammarAnswer(wrongProgress,q,option,1000),false);assert.ok(dueGrammarSkills(wrongProgress,1000).includes(q.use));}
  }
}
const old={lessons:{'te-iru':{complete:true,best:4,attempts:2}},skills:{'iru-context':{attempts:2,correct:0,streak:0,needsReview:true,due:0}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(old))),old);
const expanded={lessons:{...old.lessons,permission:{complete:true,best:5,attempts:1}},skills:{...old.skills,'avoid-form':{attempts:3,correct:2,streak:2,needsReview:false,due:900000}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(expanded))),expanded);
for(const rng of [()=>0,()=>.5,()=>.99]){const q=grammarQueue('mixed',expanded,rng);assert.equal(q.length,18);assert.ok(ids.every(id=>q.some(q=>q.lesson===id)));}

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
const p=emptyGrammar();let html='',saved=0,speech=[];
const ui=createGrammar({getProgress:()=>p,render:()=>{html=ui.renderPage();},changed:answer=>{if(answer)saved++;},navigate(){},speak(s){speech.push(s);},stopSpeech(){}});
const click=dataset=>ui.handle({dataset});
const choose=value=>{const m=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].find(m=>m[2].includes(`<span>${particleText(value)}</span>`));assert.ok(m,value);click({ganswer:m[1]});};
for(const id of ids){
  click({glesson:id});assert.ok(html.includes('圖解：座る'));click({gvword:'photo'});click({gvstep:'1'});
  assert.ok(html.includes(particleText(ruleWord('photo')[id==='avoid-request'?'nai':'te']+suffixes[id==='avoid-request'?'avoid':id])));
  click({gvstep:'2'});for(const mode of Object.keys(ruleModes)){click({gintent:mode});assert.ok(html.includes(ruleTranslation(ruleWord('photo'),mode)));}
  const before=html;click({gvword:'die'});click({gintent:'invalid'});click({gvstep:'3'});assert.equal(html,before);
  click({gvgroup:'g3'});click({gvword:'come'});click({gvstep:'1'});assert.ok(html.includes(id==='avoid-request'?'<rt>こ</rt>':'<rt>き</rt>'));
}
click({glesson:'avoid-request'});click({gvstep:'2'});click({gintent:'permission'});click({glesson:'prohibition'});click({gvstep:'2'});assert.ok(html.includes('data-gintent="prohibition" aria-pressed="true"')); // Reset comparison when changing lessons.
click({glesson:'permission'});click({gaction:'practice'});choose('ここに{座|すわ}ってください。');assert.equal(saved,1);assert.ok(p.skills['permission-meaning'].needsReview);assert.ok(html.includes('沒有詢問自己能不能坐'));
const locked=html;click({gintent:'avoid'});click({gvword:'come'});assert.equal(html,locked);assert.equal(saved,1);assert.equal(p.lessons.permission,undefined);
click({gaction:'next'});for(const i of [1,2,0,3,4,5])click({gtile:String(i)});click({gaction:'submit'});assert.ok(html.includes('✓ 判斷正確'));assert.equal(saved,2);
click({gaction:'next'});choose('{飲|の}んでもいいですか');click({gaction:'next'});choose('對方允許我坐下。');click({gaction:'next'});choose('告訴我可以借這本書。');click({gaction:'next'});choose('{借|か}りてもいいですか');click({gaction:'next'});
assert.deepEqual(p.lessons.permission,{complete:true,best:5,attempts:1});assert.equal(saved,6);
assert.equal(p.skills['permission-meaning'].needsReview,false); // Two later correct meaning answers clear the initial mistake.
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(p))),p);
click({gsound:'ここで写真を撮ってもいいですか。'});assert.deepEqual(speech,['ここで写真を撮ってもいいですか。']);
assert.equal(grammarLessons.length,18);
console.log('PASS: 18 permission/negative-request/prohibition questions; 8 reviewed verbs / 120 illustrated and comparison states; て/ない connections and 来る readings; permission replies, contextual distinctions, selector guards, first-answer review, completion and old/new backups.');
