import assert from 'node:assert/strict';
import {connectionLessons,connectionSkills,connectionDecks} from './dist/grammar/connections.js';
import {connectionParticleLessons,connectionUsages} from './dist/particles/connections.js';
import {grammarLessons,allGrammarQuestions} from './dist/grammar/data.js';
import {foundationGuide} from './dist/grammar/foundations.js';
import {createParticles,plainJapanese,particleText} from './dist/particles/ui.js';
import {emptyParticles,cleanParticles,particleQueue,recordParticleAnswer} from './dist/particles/model.js';
import {variationQueue,variationIds,variationCounts,questionFromVariationId,cleanVariationRecent} from './dist/particles/generator.js';
import {isGrammarAccepted,emptyGrammar,cleanGrammar,recordGrammarAnswer,grammarQueue} from './dist/grammar/model.js';
import {createGrammar} from './dist/grammar/ui.js';
import {scenarioLessons} from './dist/scenarios/data.js';
import {scenarioVerdict} from './dist/scenarios/model.js';

assert.deepEqual(grammarLessons.slice(24).map(l=>l.id),['reasons','comparisons','before-after']);
assert.equal(connectionLessons.flatMap(l=>l.questions).length,18);
assert.equal(Object.keys(connectionSkills).length,6);assert.equal(Object.keys(connectionUsages).length,5);
let states=0;
for(const l of connectionLessons)for(const [i,c] of connectionDecks[l.id].cards.entries()){
 const html=foundationGuide(l.id,i);states++;assert.ok(html.includes(particleText(c.jp)));assert.ok(html.includes(c.note));
 assert.ok(html.includes('g-relation-card'));assert.ok(!html.includes('undefined'));assert.ok(!/\{[^{}]+\|[^{}]+\}/.test(html));
 assert.ok(html.includes('data-gsound="'+plainJapanese(c.jp)+'"'));
}
assert.equal(states,11);
const q=id=>allGrammarQuestions.find(q=>q.id===id);
assert.equal(isGrammarAccepted(q('cp-1'),'{電車|でんしゃ}はバスより{速|はや}いです。'),true);
assert.equal(isGrammarAccepted(q('cp-1'),'バスは{電車|でんしゃ}より{速|はや}いです。'),false);
assert.equal(isGrammarAccepted(q('cp-5'),[1,0,2]),true);assert.equal(isGrammarAccepted(q('cp-5'),[0,2,1]),false);
assert.equal(isGrammarAccepted(q('cp-2'),[1,0,2]),true);
assert.equal(isGrammarAccepted(q('sq-6'),'安排明天先吃飯，再讀書。'),true);
assert.equal(isGrammarAccepted(q('rs-3'),'から、{公園|こうえん}に{行|い}きます'),false);
for(const use of Object.keys(connectionSkills)){
 const p=emptyGrammar(),question=allGrammarQuestions.find(q=>q.use===use&&q.type!=='build');
 recordGrammarAnswer(p,question,question.options.find(a=>!question.answers.includes(a)),1000);
 const review=grammarQueue('review',p,()=>.4,1000);assert.equal(review.length,2);assert.ok(review.every(q=>q.use===use));
}
const oldGrammar={lessons:{'state-past':{complete:true,best:5,attempts:2}},skills:{}};
assert.deepEqual(cleanGrammar(JSON.parse(JSON.stringify(oldGrammar))),oldGrammar);
const oldParticles={...emptyParticles(),lessons:{wa:{complete:true,best:3,attempts:2}},recentVariations:['v1:identity:self:teacher']};
assert.deepEqual(cleanParticles(JSON.parse(JSON.stringify(oldParticles))),oldParticles);
assert.deepEqual(cleanVariationRecent(oldParticles.recentVariations),oldParticles.recentVariations);
assert.deepEqual([variationCounts.ga,variationCounts['wa-ga'],variationCounts.to],[16,17,16]);
assert.ok(variationIds().map(questionFromVariationId).some(q=>q.sentence==='ピアノ＿{上手|じょうず}です。'));
assert.ok(!variationIds().map(questionFromVariationId).some(q=>q.sentence==='{音楽|おんがく}＿{上手|じょうず}です。'));
for(const l of connectionParticleLessons){
 const a=variationQueue(l.id,[],()=>.4),b=variationQueue(l.id,a.map(q=>q.id),()=>.4);
 assert.equal(a.length,6);assert.equal(b.length,6);assert.ok(b.every(q=>!a.some(p=>p.id===q.id)));
 assert.equal(variationQueue(l.id,variationIds(),()=>.5).length,6);
 for(const q of a){assert.ok(q.context&&q.why&&q.translation);assert.ok(!/[{}|]/.test(q.context));}
}
for(const use of Object.keys(connectionUsages)){
 const p=emptyParticles(),question=variationIds().map(questionFromVariationId).find(q=>q.use===use);
 recordParticleAnswer(p,question,question.options.find(a=>!question.answers.includes(a)),1000);
 const review=particleQueue('review',p,()=>.2,1000);assert.equal(review.length,2);assert.equal(review.filter(q=>q.generated).length,1);
 assert.notEqual(plainJapanese(review[0].sentence),plainJapanese(review[1].sentence));
 assert.deepEqual(cleanParticles(JSON.parse(JSON.stringify(p))),p);
}
globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};globalThis.window={scrollTo(){}};
let html='',saves=0;const p=emptyParticles();
const ui=createParticles({getProgress:()=>p,render(){html=ui.renderPage();},changed(answer){if(answer)saves++;},navigate(){},speak(){},stopSpeech(){},detail(){}});
const click=dataset=>ui.handle({dataset});
for(const l of connectionParticleLessons){
 click({plesson:l.id});assert.ok(html.includes(l.caution));click({paction:'practice'});
 for(const q of l.questions){
  const m=[...html.matchAll(/data-panswer="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)].find(m=>m[2].includes(`<span>${q.answers[0]}</span>`));assert.ok(m,q.id);
  click({panswer:m[1]});click({panswer:m[1]});assert.ok(html.includes('✓ 判斷正確'));click({paction:'next'});
 }
 assert.deepEqual(p.lessons[l.id],{complete:true,best:4,attempts:1});
}
assert.equal(saves,12);
const gp=emptyGrammar(),g=createGrammar({getProgress:()=>gp,render(){html=g.renderPage();},changed(){},navigate(){},speak(){},stopSpeech(){}});
for(const l of connectionLessons){g.handle({dataset:{glesson:l.id}});for(const [i,c] of connectionDecks[l.id].cards.entries()){g.handle({dataset:{gfoundation:String(i)}});assert.ok(html.includes(c.note));}assert.deepEqual(gp,emptyGrammar());}
const scene=scenarioLessons.find(l=>l.id==='scene-plan-reasons');assert.equal(scene.questions.length,6);
assert.deepEqual(new Set(scene.questions.map(q=>q.grammar)),new Set(connectionLessons.map(l=>l.id)));
assert.equal(scenarioVerdict(scene.questions[5],'いった'),true);assert.equal(scenarioVerdict(scene.questions[5],'行く'),false);
console.log('PASS: grammar 25-27 / 18 questions / 11 diagram states; ga, wa-ga, to / 12 questions / 49 reviewed variations; comparison direction and alternative order, relative tense, all new reviews, repeat avoidance/exhaustion, duplicate submissions and old backups.');
