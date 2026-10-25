import assert from 'node:assert/strict';
import {scenarioLessons,scenarioGrammarIds} from './dist/scenarios/data.js';
import {acceptedScenarioAnswers,scenarioAnswerMarkup,scenarioVerdict,recordScenarioAnswer,cleanCourseProgress,canFinishCourse,finishScenarioPractice} from './dist/scenarios/model.js';
import {scenarioTeaching,scenarioGrammarLinks} from './dist/scenarios/ui.js';
import {grammarLessons,grammarSkills,allGrammarQuestions} from './dist/grammar/data.js';
import {emptyGrammar,cleanGrammar,dueGrammarSkills,grammarQueue} from './dist/grammar/model.js';
import {lessons,legacyLessons,allWords} from './dist/data.js';
import {plainJapanese} from './dist/particles/ui.js';

assert.equal(scenarioLessons.length,8);assert.equal(legacyLessons.length,5);assert.equal(lessons.length,13);assert.equal(allWords.length,78);
assert.deepEqual(legacyLessons.map(l=>l.id),['meet','cafe','shop','place','like']);
assert.equal(new Set(allWords.map(w=>w.id)).size,78);
const questions=scenarioLessons.flatMap(l=>l.questions),coverage=new Set(questions.map(q=>q.grammar));
assert.equal(questions.length,48);assert.equal(new Set(questions.map(q=>q.id)).size,48);
assert.equal(lessons.reduce((n,l)=>n+l.questions.length,0),63);
assert.deepEqual(new Set(grammarLessons.map(l=>l.id)),coverage); // Coverage must be assessed, not merely mentioned in a dialogue.
assert.deepEqual(questions.reduce((n,q)=>(n[q.type]=(n[q.type]||0)+1,n),{}),{choice:21,input:21,listen:6});
const expectedCoverage=[['statement','negative','question'],['verbs','verb-groups','masu-form','nai-form'],['past','ta-form'],['adjectives'],['te-request','te-form'],['te-iru'],['permission','avoid-request','prohibition'],['desire','invitation']];
for(const [i,l] of scenarioLessons.entries()){
  assert.equal(l.words.length,6);assert.ok(l.dialogue.length>=6);assert.equal(l.points.length,3);assert.equal(l.questions.length,6);
  assert.deepEqual(new Set(scenarioGrammarIds(l)),new Set(expectedCoverage[i]));
  for(const [name,jp,zh] of l.dialogue){assert.ok(name&&jp&&zh);assert.ok(!/[{}|]/.test(plainJapanese(jp)));}
  for(const [pi,p] of l.points.entries())for(const [ti,part] of p.parts.entries()){
    assert.ok(p.refs.every(id=>grammarLessons.some(l=>l.id===id)));assert.ok(part.jp&&part.label&&part.note);
    const html=scenarioTeaching(l,pi,ti);assert.ok(html.includes(part.note));assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
  }
}
for(const q of questions){
  assert.ok(q.q&&q.why&&grammarSkills[q.use]);assert.equal(q.grammar,allGrammarQuestions.find(b=>b.use===q.use).lesson);
  if(q.type==='input'){
    for(const a of acceptedScenarioAnswers(q))assert.equal(scenarioVerdict(q,'  '+a+'。  '),true);
    for(const a of ['',null,undefined,0])assert.equal(scenarioVerdict(q,a),null);
    assert.equal(scenarioVerdict(q,'まったく違う答え'),false);
  }else{
    assert.equal(new Set(q.options).size,q.options.length);assert.equal(scenarioVerdict(q,q.answer),true);assert.equal(scenarioVerdict(q,String(q.answer)),true);
    for(const i of [-1,99,1.2,'',null,undefined,'<script>'])assert.equal(scenarioVerdict(q,i),null);
    q.options.forEach((_,i)=>{if(!q.answers.includes(i)){assert.ok(q.wrong[i]);assert.equal(scenarioVerdict(q,i),false);}});
    if(q.type==='listen')assert.ok(q.audio);
  }
  const progress=emptyGrammar(),wrong=q.type==='input'?'不正確な答え':q.options.findIndex((_,i)=>!q.answers.includes(i));
  assert.equal(recordScenarioAnswer(progress,q,wrong,1000),false);assert.ok(dueGrammarSkills(progress,1000).includes(q.use));
  assert.equal(recordScenarioAnswer(progress,q,q.answer,1000),true);assert.equal(progress.skills[q.use].needsReview,true);
  assert.equal(recordScenarioAnswer(progress,q,q.answer,1000),true);assert.equal(progress.skills[q.use].needsReview,false);
  assert.equal(progress.skills[q.use].attempts,3);assert.deepEqual(progress.lessons,{}); // Application answers must not complete grammar lessons.
  assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(progress))),progress);
  const before=JSON.stringify(progress);assert.equal(recordScenarioAnswer(progress,q,null),null);assert.equal(JSON.stringify(progress),before);
}
// Independent reviewed input forms: readings, tense, tone and legitimate alternatives.
const q=id=>questions.find(q=>q.id===id),correct=(id,forms)=>forms.forEach(form=>assert.equal(scenarioVerdict(q(id),form),true,id));
correct('scene-introduce-4',['じゃありません','ではありません','じゃないです','ではないです']);
correct('scene-describe-2',['熱くないです','あつくないです','熱くありません','あつくありません']);
correct('scene-weekend-2',['行きたくないです','いきたくないです','行きたくありません','いきたくありません']);
correct('scene-registration-4',['きて']);assert.equal(scenarioVerdict(q('scene-registration-4'),'こて'),false);
correct('scene-routine-6',['来ない','こない']);assert.equal(scenarioVerdict(q('scene-routine-6'),'きない'),false);
correct('scene-yesterday-5',['来た','きた']);assert.equal(scenarioVerdict(q('scene-yesterday-5'),'こた'),false);
correct('scene-museum-5',['来ないでください','こないでください']);assert.equal(scenarioVerdict(q('scene-museum-5'),'きないでください'),false);
assert.equal(scenarioAnswerMarkup(q('scene-museum-5'),'来ないでください'),'{来|こ}ないでください');
assert.equal(scenarioAnswerMarkup(q('scene-registration-3'),'書いて'),'{書|か}いて');
assert.equal(scenarioAnswerMarkup(q('scene-describe-2'),'熱くありません'),'{熱|あつ}くありません');
assert.equal(scenarioAnswerMarkup(q('scene-weekend-2'),'行きたくありません'),'{行|い}きたくありません');
assert.ok(scenarioTeaching(scenarioLessons[6],1,0).includes('aria-label="聽這個情境例句"'));
for(const [id,wrong] of [['scene-routine-4','読むます'],['scene-routine-5','行くない'],['scene-yesterday-2','ませんました'],['scene-yesterday-4','書きた'],['scene-registration-2','待ちて'],['scene-registration-3','書きて'],['scene-phone-2','食べますいます'],['scene-museum-3','撮ってください'],['scene-museum-4','飲まないはいけません'],['scene-weekend-2','行きたいじゃありません'],['scene-weekend-5','行くましょう']])assert.equal(scenarioVerdict(q(id),wrong),false,id);
const legacy={step:4,complete:true};assert.deepEqual(cleanCourseProgress(legacyLessons[0],legacy),legacy);
const l=scenarioLessons[0];assert.deepEqual(cleanCourseProgress(l,{step:4,complete:true}),{step:3,complete:false});
assert.equal(canFinishCourse(l,{step:3}),false);const p={step:3,complete:false};finishScenarioPractice(l,p,4);assert.equal(canFinishCourse(l,p),true);finishScenarioPractice(l,p,2);assert.deepEqual(p,{step:3,complete:false,best:4,attempts:2});
assert.deepEqual(cleanCourseProgress(l,JSON.parse(JSON.stringify({...p,step:4,complete:true}))),{step:4,complete:true,best:4,attempts:2});
assert.deepEqual(cleanCourseProgress(l,{step:4,complete:true,best:99,attempts:2}),{step:4,complete:true,best:6,attempts:2});
for(const raw of [null,{},[],{step:-1},{step:8}])assert.equal(cleanCourseProgress(l,raw),null);
const queued=emptyGrammar();recordScenarioAnswer(queued,q('scene-weekend-6'),0,1000);const review=grammarQueue('review',queued,()=>.5,1000);assert.ok(review.length&&review.every(q=>q.use==='invitation-meaning'));assert.ok(review.every(q=>allGrammarQuestions.some(b=>b.id===q.id)));
assert.ok(scenarioGrammarLinks(['te-request']).includes('data-glesson="te-request"'));
console.log('PASS: 8 applied scenarios / 48 reviewed questions cover all 18 grammar lessons; 24 interactive breakdowns; 78 stable word IDs; kana/kanji and negative alternatives; invalid answers, grammar SRS sharing without course completion, graded completion and old progress compatibility.');
