import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {foundationLessons,foundationSkills} from './dist/grammar/foundations-data.js';
import {foundationDecks,foundationGuide} from './dist/grammar/foundations.js';
import {grammarLessons,allGrammarQuestions} from './dist/grammar/data.js';
import {cleanGrammar,emptyGrammar,recordGrammarAnswer,grammarQueue,isGrammarAccepted} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {plainJapanese,particleText} from './dist/particles/ui.js';
import {scenarioLessons} from './dist/scenarios/data.js';
import {scenarioVerdict,scenarioAnswerMarkup} from './dist/scenarios/model.js';

const ids=['existence','demonstratives','interrogatives','state-past','preferences','time-frequency'];
assert.deepEqual(grammarLessons.slice(18).map(l=>l.id),ids);
assert.equal(foundationLessons.flatMap(l=>l.questions).length,36);
assert.equal(Object.keys(foundationSkills).length,12);
let states=0;
for(const l of foundationLessons){
  assert.ok(l.foundation);assert.equal(l.examples.length,3);assert.equal(l.questions.length,6);
  for(const [i,c] of foundationDecks[l.id].cards.entries()){
    const html=foundationGuide(l.id,i);states++;
    assert.ok(html.includes(`data-gfoundation="${i}" aria-pressed="true"`));
    assert.ok(html.includes(particleText(c.jp)));assert.ok(html.includes(c.zh)&&html.includes(c.note));
    assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
    assert.ok(html.includes('role="img"')||['info','past'].includes(c.visual));
    assert.ok(html.includes('data-gsound="'+plainJapanese(c.jp)+'"'));
  }
  assert.equal(foundationGuide(l.id,999),foundationGuide(l.id,0));
  assert.ok(scenarioLessons.some(s=>s.questions.some(q=>q.grammar===l.id)));
}
assert.equal(states,29);
assert.equal(foundationGuide('unknown'),'');
// Explicitly reviewed alternatives and rejected mistakes, independent of the display logic.
const q=id=>allGrammarQuestions.find(q=>q.id===id);
for(const a of ['{暑|あつ}くなかったです','{暑|あつ}くありませんでした'])assert.ok(isGrammarAccepted(q('sp-4'),a));
for(const a of ['じゃありませんでした','ではありませんでした','じゃなかったです','ではなかったです'])assert.ok(isGrammarAccepted(q('sp-5'),a));
for(const [id,a] of [['sp-2','{暑|あつ}いでした'],['sp-6','いかったです'],['dm-4','これ{本|ほん}'],['ex-1','います'],['tf-1','で'],['pf-4','くないです']])assert.equal(isGrammarAccepted(q(id),a),false);
for(const id of Object.keys(foundationSkills)){
  const p=emptyGrammar(),question=allGrammarQuestions.find(q=>q.use===id&&q.type!=='build');assert.ok(question,id);
  const wrong=question.options.find(a=>!question.answers.includes(a));recordGrammarAnswer(p,question,wrong,1000);
  const review=grammarQueue('review',p,()=>.5,1000);assert.equal(review.length,2,id);assert.ok(review.every(q=>q.use===id));
}
const before={lessons:{'ta-form':{complete:true,best:5,attempts:2}},skills:{'desire-form':{attempts:2,correct:1,streak:0,needsReview:true,due:1000}}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(before))),before);
const expanded=cleanGrammar({...before,lessons:{...before.lessons,'state-past':{complete:true,best:5,attempts:1}}});
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(expanded))),expanded);assert.equal(expanded.lessons['ta-form'].best,5);

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
let html='',stops=0;const progress=emptyGrammar();
const ui=createGrammar({getProgress:()=>progress,render(){html=ui.renderPage();},navigate(){},changed(){},speak(){},stopSpeech(){stops++;}});
const click=dataset=>ui.handle({dataset});
for(const l of foundationLessons){
  click({glesson:l.id});const initial=html;
  for(const [i,c] of foundationDecks[l.id].cards.entries()){click({gfoundation:String(i)});assert.ok(html.includes(c.note));}
  const last=html;for(const bad of ['-1','999','abc','1.5'])click({gfoundation:bad});assert.equal(html,last);
  assert.deepEqual(progress,emptyGrammar()); // Browsing diagrams never counts as practice.
  click({glesson:l.id});assert.equal(html,initial); // Card selection resets between lessons.
  click({gaction:'practice'});const practice=html;click({gfoundation:'1'});assert.equal(html,practice);
}
assert.ok(stops>=29);
const scenario=scenarioLessons.find(l=>l.id==='scene-dinner-memories').questions.find(q=>q.id.endsWith('-3'));
for(const a of ['暑くなかったです','あつくなかったです','暑くありませんでした','あつくありませんでした'])assert.equal(scenarioVerdict(scenario,a),true);
for(const a of ['暑いでした','暑くないです','暑いじゃありませんでした'])assert.equal(scenarioVerdict(scenario,a),false);
assert.equal(scenarioAnswerMarkup(scenario,'暑くなかったです'),'{暑|あつ}くなかったです');
const courses=readFileSync('dist/scenarios/ui.js','utf8');assert.ok(!courses.includes('8 堂應用'));
assert.ok(readFileSync('dist/index.html','utf8').includes('./grammar/foundations.css'));
console.log('PASS: lessons 19-24 / 36 questions / 29 illustrated states; existence and distance, question information, adjective past alternatives, likes vs skill, time/frequency; selector guards, zero-score browsing, 12 concept reviews, scenario readings and old progress.');
