import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {grammarLessons,grammarSkills,allGrammarQuestions,exampleSentence} from './dist/grammar/data.js';
import {emptyGrammar,cleanGrammar,isGrammarAccepted,recordGrammarAnswer,finishGrammarLesson,dueGrammarSkills,grammarQueue} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {plainJapanese,particleText} from './dist/particles/ui.js';
import {verbById} from './dist/grammar/verbs.js';

assert.equal(grammarLessons.length,15);assert.equal(allGrammarQuestions.length,90);
assert.equal(new Set(allGrammarQuestions.map(q=>q.id)).size,90);
assert.equal(Object.keys(grammarSkills).length,30);
assert.deepEqual(allGrammarQuestions.reduce((n,q)=>(n[q.type]=(n[q.type]||0)+1,n),{}),{choice:37,build:23,transform:24,conjugate:6});
for(const l of grammarLessons){
  assert.equal(l.examples.length,3);assert.equal(l.questions.length,6);assert.ok(l.notes.length>=3);
  for(const e of l.examples){
    assert.ok(e.scene&&e.zh);assert.ok(e.parts.every(p=>p.jp&&p.role&&p.note));
    assert.ok(exampleSentence(e).endsWith('。'));assert.ok(!/[{}]/.test(plainJapanese(exampleSentence(e))));
  }
  for(const q of allGrammarQuestions.filter(q=>q.lesson===l.id)){
    assert.ok(q.context&&q.why&&grammarSkills[q.use]);
    if(q.type==='build'){
      const canonical=q.parts.map((_,i)=>i);assert.ok(isGrammarAccepted(q,canonical));
      assert.ok(!isGrammarAccepted(q,[...canonical].reverse()));assert.ok(!isGrammarAccepted(q,canonical.slice(1)));
      assert.ok(q.translation&&q.hint);
    }else{
      assert.equal(new Set(q.options).size,q.options.length);
      for(const a of q.answers)assert.ok(q.options.includes(a));
      for(const a of q.options.filter(a=>!q.answers.includes(a)))assert.ok(q.wrong[a]);
      if(q.type==='transform')assert.ok(q.source&&typeof q.prefix==='string'&&q.translation);
    }
  }
}
for(const id of ['ng-3','ng-6','ad-6']){
  const q=allGrammarQuestions.find(q=>q.id===id);
  for(const ending of ['じゃありません','ではありません','じゃないです','ではないです'])assert.ok(isGrammarAccepted(q,ending));
  assert.ok(!isGrammarAccepted(q,'です'));assert.ok(!isGrammarAccepted(q,'ません'));
}
const adjectiveNegative=allGrammarQuestions.find(q=>q.id==='ad-3');
assert.ok(isGrammarAccepted(adjectiveNegative,'{熱|あつ}くないです'));
assert.ok(isGrammarAccepted(adjectiveNegative,'{熱|あつ}くありません'));
assert.ok(!isGrammarAccepted(adjectiveNegative,'{熱|あつ}いじゃないです'));
const flexibleOrder=allGrammarQuestions.find(q=>q.id==='ve-5');
assert.ok(isGrammarAccepted(flexibleOrder,[0,1,2,3,4,5]));
assert.ok(isGrammarAccepted(flexibleOrder,[2,3,0,1,4,5]));
assert.ok(!isGrammarAccepted(flexibleOrder,[0,3,2,1,4,5]));
for(const id of ['verbs','past','adjectives']){
  for(const q of allGrammarQuestions.filter(q=>q.lesson===id&&q.type==='build'))assert.ok(!q.hint.includes('身分或類別'));
}
const oldProgress={lessons:{statement:{complete:true,best:5,attempts:2}},skills:{'negative-form':{attempts:3,correct:2,streak:1,needsReview:true,due:1234}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(oldProgress))),oldProgress);
const expanded=cleanGrammar({...oldProgress,lessons:{...oldProgress.lessons,verbs:{complete:true,best:4,attempts:1},adjectives:{complete:true,best:6,attempts:1}},skills:{...oldProgress.skills,'past-form':{attempts:2,correct:1,streak:0,needsReview:true,due:0}}});
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(expanded))),expanded);
assert.deepEqual(expanded.lessons.statement,oldProgress.lessons.statement);
const now=123456,p=emptyGrammar(),q=allGrammarQuestions.find(q=>q.id==='qu-1');
assert.equal(recordGrammarAnswer(p,q,'invalid',now),null);assert.deepEqual(p,emptyGrammar());
recordGrammarAnswer(p,q,'かです',now);assert.deepEqual(dueGrammarSkills(p,now),['question-form']);
recordGrammarAnswer(p,q,'ですか',now);assert.equal(p.skills[q.use].needsReview,true);
recordGrammarAnswer(p,q,'ですか',now);assert.equal(p.skills[q.use].needsReview,false);assert.equal(p.skills[q.use].due,now+3*86400000);
assert.deepEqual(dueGrammarSkills(p,now),[]);assert.deepEqual(dueGrammarSkills(p,now+3*86400000),['question-form']);
const bq=allGrammarQuestions.find(q=>q.type==='build');
for(const invalid of [[],[0,0,2,3],[0,1,2,5],['0',1,2,3]])assert.equal(recordGrammarAnswer(p,bq,invalid,now),null);
finishGrammarLesson(p,'statement',5);finishGrammarLesson(p,'statement',2);assert.deepEqual(p.lessons.statement,{complete:true,best:5,attempts:2});
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(p))),p);
for(const empty of [undefined,null,[],true])assert.deepEqual(cleanGrammar(empty),emptyGrammar());
const bad=cleanGrammar({lessons:{statement:{complete:'true',best:999,attempts:-1},unknown:{complete:true}},skills:{'negative-form':{attempts:3,correct:99,streak:99,needsReview:1,due:Infinity},unknown:{attempts:100}}});
assert.deepEqual(bad.lessons.statement,{complete:false,best:6,attempts:0});assert.equal(bad.lessons.unknown,undefined);
assert.deepEqual(bad.skills['negative-form'],{attempts:3,correct:3,streak:3,needsReview:false,due:0});assert.equal(bad.skills.unknown,undefined);
for(const random of [()=>0,()=>.4,()=>.99]){
  const mixed=grammarQueue('mixed',emptyGrammar(),random,now);assert.equal(mixed.length,15);assert.equal(new Set(mixed.map(q=>q.id)).size,15);
  for(const l of grammarLessons)assert.equal(mixed.filter(q=>q.lesson===l.id).length,1);
  const review=grammarQueue('review',p,random,now+3*86400000);assert.equal(review.length,2);assert.equal(new Set(review.map(q=>q.id)).size,2);assert.ok(review.every(q=>q.use==='question-form'));
}
assert.deepEqual(grammarQueue('review',emptyGrammar()),[]);

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
const progress=emptyGrammar();let html='',saved=0,navigations=0;
const ui=createGrammar({getProgress:()=>progress,render:()=>{html=ui.renderPage();},changed:count=>{if(count)saved++;},navigate(){navigations++;},speak(){},stopSpeech(){}});
const click=dataset=>ui.handle({dataset});
const choose=value=>{
  const options=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)];
  const option=options.find(m=>m[2].replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]+>/g,'').includes(value));assert.ok(option,value);click({ganswer:option[1]});return option[1];
};
assert.equal(ui.handle({dataset:{paction:'overview'}}),false);
click({glesson:'invalid'});assert.equal(navigations,0);
for(const l of grammarLessons){
  click({glesson:l.id});assert.ok(html.includes(l.scene));
  click({gexample:'2'});click({gtoken:'0'});assert.ok(html.includes(l.examples[2].parts[0].note));
  click({gaction:'practice'});click({gaction:'next'});assert.equal(progress.lessons[l.id],undefined);
  for(const question of allGrammarQuestions.filter(q=>q.lesson===l.id)){
    if(question.type==='build'){
      click({gaction:'submit'});assert.ok(html.includes('確認組句')); // Incomplete answer must not be submitted.
      const before=saved;click({gtile:'999'});click({gremove:'-1'});assert.equal(saved,before);
      click({gtile:'0'});click({gtile:'0'});assert.equal((html.match(/data-gremove=/g)||[]).length,1);
      click({gremove:'0'});assert.ok(html.includes('你的句子，從這裡開始'));
      click({gtile:'2'});click({gaction:'clear'});assert.ok(html.includes('你的句子，從這裡開始'));
      for(let i=0;i<question.parts.length;i++)click({gtile:String(i)});
      click({gaction:'submit'});click({gaction:'submit'});click({gtile:'1'});
    }else{
      if(question.type==='conjugate'){
        const before=saved;click({ganswer:'0'});assert.equal(saved,before);
        click({ggroup:verbById(question.verbId).group});click({ggroup:verbById(question.verbId).group});
        assert.ok(html.includes('✓ 分類正確'));click({gaction:'form'});
      }
      // Build matching index from unique rendered text, including furigana markup.
      const allOptions=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)];
      const correct=question.type==='transform'?question.answers.at(-1):question.answers[0];
      const option=allOptions.find(m=>m[2].includes(`<span>${particleText(correct)}</span>`));assert.ok(option,question.id);
      click({ganswer:option[1]});click({ganswer:option[1]});
    }
    assert.ok(html.includes('✓ 判斷正確'),question.id);assert.ok(!html.includes('undefined'));
    assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html),`${question.id}: raw furigana markup`);
    if(question.id==='ad-3')assert.ok(html.includes('<mark><span class="reading"'), 'Furigana and answer emphasis must render together');
    click({gaction:'next'});
  }
  assert.deepEqual(progress.lessons[l.id],{complete:true,best:6,attempts:1});click({gaction:'next'});assert.equal(progress.lessons[l.id].attempts,1);
  assert.ok(html.includes('本次答對題數'));
}
assert.equal(saved,90);click({gaction:'retry'});assert.ok(html.includes('這裡不可以，說清楚規則'));
ui.reset();click({glesson:'statement'});click({gaction:'practice'});
choose('学生ですか');assert.ok(html.includes('這裡要介紹自己的身分'));
assert.equal(progress.skills['statement-meaning'].needsReview,true);click({gaction:'next'});
choose('は');click({gaction:'next'}); // Reach a builder and submit a valid but wrong order.
for(const id of [3,2,1,0])click({gtile:String(id)});click({gaction:'submit'});
assert.ok(html.includes('再看一次句子裡的線索'));assert.ok(html.includes('完整答案'));assert.equal(progress.skills['statement-order'].needsReview,true);
ui.reset();click({gaction:'review'});assert.ok(html.includes('換個角度，再理解一次'));
const styles=readFileSync('dist/index.html','utf8');assert.ok(styles.includes('./grammar/style.css'));
// A correctly reordered action sentence must receive credit through the actual controller as well.
ui.reset();click({glesson:'verbs'});click({gaction:'practice'});
for(const id of ['ve-1','ve-2','ve-3','ve-4','ve-5']){
  const q=allGrammarQuestions.find(q=>q.id===id);
  if(q.type==='build'){
    const order=q.id==='ve-5'?q.orders[1]:q.orders[0];for(const i of order)click({gtile:String(i)});click({gaction:'submit'});
  }else{
    const option=[...html.matchAll(/data-ganswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].find(m=>m[2].includes(`<span>${particleText(q.answers[0])}</span>`));assert.ok(option);click({ganswer:option[1]});
  }
  assert.ok(html.includes('✓ 判斷正確'));click({gaction:'next'});
}
console.log('PASS: 15 grammar lessons / 45 annotated examples / 90 questions; conjugation stage guards; verb/adjective forms and alternatives; flexible word order; furigana; first-answer scoring; balanced fifteen-lesson mixed practice; review scheduling and backup compatibility.');
