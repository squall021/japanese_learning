import assert from 'node:assert/strict';
import {particleLessons,allParticleQuestions,usages} from './dist/particles/data.js';
import {variationQueue,reviewVariation,variationIds,questionFromVariationId,variationCounts,variationTotal,cleanVariationRecent,noteVariationShown,RECENT_LIMIT} from './dist/particles/generator.js';
import {emptyParticles,cleanParticles,particleQueue,recordParticleAnswer} from './dist/particles/model.js';
import {createParticles,plainJapanese} from './dist/particles/ui.js';

const all=variationIds().map(questionFromVariationId),fixed=new Set(allParticleQuestions.map(q=>`${q.lesson}:${plainJapanese(q.sentence)}`));
assert.equal(all.length,299);
assert.equal(variationTotal,Object.values(variationCounts).reduce((a,b)=>a+b,0));
assert.equal(new Set(all.map(q=>q.id)).size,all.length);
assert.equal(new Set(all.map(q=>q.context+q.sentence)).size,all.length);
for(const q of all){
  assert.ok(particleLessons.some(l=>l.id===q.lesson));assert.ok(usages[q.use]);
  assert.equal((q.sentence.match(/＿/g)||[]).length,1);
  assert.ok(!/[{}【】]/.test(plainJapanese(q.sentence)),q.id);
  assert.ok(q.translation&&q.why&&q.context&&q.words.length>=2,q.id);
  assert.equal(new Set(q.options).size,q.options.length);
  assert.ok(!fixed.has(`${q.lesson}:${plainJapanese(q.sentence)}`));
  for(const a of q.answers)assert.ok(q.options.includes(a));
  for(const a of q.options.filter(a=>!q.answers.includes(a)))assert.ok(q.wrong[a]);
  if(q.use==='movement')assert.deepEqual(q.answers,['に','へ']);
  if(q.use==='action')assert.match(q.sentence,/＿.+を.+ます。$/);
  if(q.use==='object')assert.match(q.sentence,/で.+＿.+ます。$/);
  if(q.use==='existence')assert.match(q.sentence,/(います|あります)。$/);
  if(q.id.startsWith('v1:travel:'))assert.ok(!q.id.includes(':self:'));
}
// Verify generation at several deterministic random streams, including extreme ordering.
for(const random of [()=>0,()=>.999,()=>.4]){
  for(const scope of ['all',...particleLessons.map(l=>l.id)]){
    const first=variationQueue(scope,[],random),history=first.map(q=>q.id),second=variationQueue(scope,history,random);
    for(const batch of [first,second]){
      assert.equal(batch.length,6);assert.equal(new Set(batch.map(q=>q.id)).size,6);
      assert.equal(new Set(batch.map(q=>plainJapanese(q.sentence))).size,6);
      if(scope==='all')assert.equal(new Set(batch.map(q=>q.lesson)).size,6);
      else assert.ok(batch.every(q=>q.lesson===scope));
      if(scope==='no'||scope==='ni-de'){
        const counts={};for(const q of batch)counts[q.use]=(counts[q.use]||0)+1;
        assert.deepEqual(Object.values(counts),[3,3]);
      }
    }
    assert.ok(second.every(q=>!history.includes(q.id)),scope);
  }
}
assert.deepEqual(variationQueue('invalid'),[]);
assert.equal(questionFromVariationId('<script>'),null);
assert.deepEqual(cleanVariationRecent(null),[]);
const recent=cleanVariationRecent([...variationIds(),'<script>',false,variationIds()[0]]);
assert.equal(recent.length,RECENT_LIMIT);assert.equal(recent.at(-1),variationIds()[0]);assert.equal(new Set(recent).size,RECENT_LIMIT);
const p=emptyParticles(),batch=variationQueue('wo',[],()=>0);
noteVariationShown(p,batch[0]);assert.deepEqual(p.recentVariations,[batch[0].id]);
assert.equal(Object.keys(p.skills).length,0); // Seeing a question is not an answer or lesson completion.
noteVariationShown(p,batch[0]);assert.equal(p.recentVariations.length,1);
assert.deepEqual(cleanParticles(JSON.parse(JSON.stringify(p))),p);
assert.deepEqual(cleanParticles({lessons:{},skills:{}}).recentVariations,[]);
assert.deepEqual(cleanParticles({...p,recentVariations:['invalid',batch[0].id]}).recentVariations,[batch[0].id]);
const exhausted=all.filter(q=>q.lesson==='mo').map(q=>q.id);
assert.equal(variationQueue('mo',exhausted,()=>.2).length,6); // Finite pool exhaustion falls back, not an endless loop.
assert.ok(!variationQueue('mo',exhausted,()=>.2).some(q=>exhausted.slice(-6).includes(q.id)));
for(const use of Object.keys(usages)){
  const q=reviewVariation(use,[],()=>0),progress=emptyParticles();
  recordParticleAnswer(progress,q,q.options.find(o=>!q.answers.includes(o)),1000);
  const review=particleQueue('review',progress,()=>.5,1000);
  assert.equal(review.length,2);assert.ok(review.every(r=>r.use===use));
  assert.equal(review.filter(q=>q.generated).length,1);
  assert.notEqual(plainJapanese(review[0].sentence),plainJapanese(review[1].sentence));
}

globalThis.document={querySelector:()=>({focus(){},scrollIntoView(){}})};
globalThis.window={scrollTo(){}};
const progress=emptyParticles();progress.lessons['ni-he']={complete:true,best:3,attempts:1};
let html='',answers=0;
const ui=createParticles({getProgress:()=>progress,render:()=>{html=ui.renderPage();},changed:answer=>{if(answer)answers++;},speak(){},stopSpeech(){},navigate(){},detail(){}});
const click=dataset=>ui.handle({dataset});
click({pvariation:'ni-he'});
assert.ok(html.includes('に / へ · 變化練習'));
assert.equal(progress.recentVariations.length,1); // Only the displayed question, not all six queued questions.
for(let i=0;i<6;i++){
  const choices=[...html.matchAll(/data-panswer="(\d+)"[^>]*>[\s\S]*?<span class="p-choice-letter">[^<]+<\/span><span>([^<]+)<\/span>/g)];
  const match=choices.find(m=>m[2]==='へ');assert.ok(match);
  click({panswer:match[1]});click({panswer:match[1]});
  assert.ok(html.includes('✓ 判斷正確'));assert.ok(html.includes('p-answer-translation'));
  click({paction:'next'});
}
assert.equal(answers,6);assert.equal(progress.recentVariations.length,6);
assert.deepEqual(progress.lessons['ni-he'],{complete:true,best:3,attempts:1});
const previous=[...progress.recentVariations];click({paction:'retry'});
assert.ok(html.includes('に / へ · 變化練習'));
assert.ok(!previous.includes(progress.recentVariations.at(-1)));
ui.reset();click({pvariation:'all'});assert.ok(html.includes('六課綜合變化練習'));
console.log('PASS: 299 generated scenarios; reviewed slot rules; all choices explained; multi-answer acceptance; balanced six-question batches; recent-history avoidance/exhaustion; old backup migration; fixed/generated review pairing; displayed-only history and assessment isolation.');
