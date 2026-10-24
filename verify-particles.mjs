import assert from 'node:assert/strict';
import {particleLessons,allParticleQuestions,usages} from './dist/particles/data.js';
import {emptyParticles,cleanParticles,isAccepted,recordParticleAnswer,finishParticleLesson,dueParticleUsages,particleQueue} from './dist/particles/model.js';
import {createParticles,particleText,plainJapanese} from './dist/particles/ui.js';

assert.equal(particleLessons.length,6);
assert.equal(allParticleQuestions.length,24);
assert.equal(new Set(allParticleQuestions.map(q=>q.id)).size,24);
for(const l of particleLessons){
  assert.equal(l.examples.length,3);assert.equal(l.questions.length,4);
  for(const e of l.examples){assert.match(e.sentence,/【.+】/);assert.ok(e.scene&&e.relation&&e.note);assert.ok(!/[{}【】]/.test(plainJapanese(e.sentence)));}
  for(const q of l.questions){
    assert.ok(usages[q.use]);assert.ok(q.answers.length);assert.equal(new Set(q.options).size,q.options.length);
    for(const a of q.answers)assert.ok(q.options.includes(a));
    for(const a of q.options.filter(a=>!q.answers.includes(a)))assert.ok(q.wrong[a],`${q.id} missing explanation for ${a}`);
  }
}
const movement=allParticleQuestions.find(q=>q.id==='nh-1');
assert.ok(isAccepted(movement,'に'));assert.ok(isAccepted(movement,'へ'));assert.ok(!isAccepted(movement,'で'));
assert.ok(particleText('<script>{私|わたし}【は】').includes('&lt;script&gt;'));
assert.equal(plainJapanese('{学校|がっこう}【へ】{行|い}きます。'),'学校へ行きます。');
const progress=emptyParticles(),now=100000;
assert.equal(recordParticleAnswer(progress,movement,'invalid',now),null);
assert.equal(Object.keys(progress.skills).length,0);
recordParticleAnswer(progress,movement,'で',now);
assert.deepEqual(dueParticleUsages(progress,now),['movement']);
recordParticleAnswer(progress,movement,'へ',now);
assert.equal(progress.skills.movement.needsReview,true);
recordParticleAnswer(progress,movement,'に',now);
assert.equal(progress.skills.movement.needsReview,false);
assert.equal(progress.skills.movement.correct,2);
assert.equal(progress.skills.movement.due,now+3*86400000);
assert.deepEqual(dueParticleUsages(progress,now),[]);
assert.deepEqual(dueParticleUsages(progress,now+3*86400000),['movement']);
recordParticleAnswer(progress,movement,'で',now);
assert.equal(progress.skills.movement.streak,0);
const review=particleQueue('review',progress,()=>.4,now);
assert.equal(review.length,2);assert.equal(new Set(review.map(q=>q.id)).size,2);assert.ok(review.every(q=>q.use==='movement'));
const mixed=particleQueue('mixed',emptyParticles(),()=>.6,now);
assert.equal(mixed.length,6);assert.equal(new Set(mixed.map(q=>q.lesson)).size,6);
finishParticleLesson(progress,'wa',3);finishParticleLesson(progress,'wa',1);
assert.deepEqual(progress.lessons.wa,{best:3,attempts:2,complete:true});
assert.deepEqual(cleanParticles(JSON.parse(JSON.stringify(progress))),progress);
assert.deepEqual(cleanParticles(undefined),emptyParticles());
assert.deepEqual(cleanParticles([]),emptyParticles());
const bad=cleanParticles({lessons:{fake:{complete:true},wa:{complete:'yes',best:Infinity,attempts:-1}},skills:{topic:{attempts:2,correct:99,streak:99,due:Infinity,needsReview:'yes'},fake:{attempts:100}}});
assert.deepEqual(bad.lessons.wa,{complete:false,best:0,attempts:0});
assert.deepEqual(bad.skills.topic,{attempts:2,correct:2,streak:2,due:0,needsReview:false});
assert.equal(bad.skills.fake,undefined);

// Exercise the session controller: one persisted answer per question and completion only after all four.
globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};
globalThis.window={scrollTo(){}};
const sessionProgress=emptyParticles();let savedAnswers=0,html='';
const ui=createParticles({getProgress:()=>sessionProgress,render:()=>{html=ui.renderPage();},changed:answer=>{if(answer)savedAnswers++;},navigate(){},speak(){},stopSpeech(){},detail(){}});
const click=dataset=>ui.handle({dataset});
click({plesson:'ni-he'});click({paction:'practice'});
assert.equal(sessionProgress.lessons['ni-he'],undefined);
for(const choice of ['へ','に','え（e）','兩句都可以']){
  const options=[...html.matchAll(/data-panswer="(\d+)"[^>]*>[\s\S]*?<span class="p-choice-letter">[^<]+<\/span><span>([^<]+)<\/span>/g)];
  const match=options.find(m=>m[2]===choice);assert.ok(match,choice);
  click({panswer:match[1]});click({panswer:match[1]});click({paction:'next'});
}
assert.equal(savedAnswers,4);assert.equal(sessionProgress.lessons['ni-he'].best,4);
assert.equal(sessionProgress.lessons['ni-he'].attempts,1);click({paction:'next'});
assert.equal(sessionProgress.lessons['ni-he'].attempts,1);
assert.ok(html.includes('本次答對題數'));
console.log('PASS: six lessons / 24 contextual questions; all choices explained; に and へ both accepted; usage scheduling and mistake recovery; backup validation; balanced mixed/review queues; duplicate-answer and premature-completion guards.');
