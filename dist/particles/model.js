import {particleLessons, usages, allParticleQuestions} from './data.js';
export const emptyParticles = () => ({lessons:{},skills:{}});
const count = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n,1000000) : 0;
export function cleanParticles(raw) {
  const out=emptyParticles();
  if(!raw || typeof raw!=='object' || Array.isArray(raw)) return out;
  for(const l of particleLessons){
    const p=raw.lessons?.[l.id];
    if(p && typeof p==='object') out.lessons[l.id]={complete:p.complete===true,best:Math.min(count(p.best),l.questions.length),attempts:count(p.attempts)};
  }
  for(const id of Object.keys(usages)){
    const p=raw.skills?.[id];
    if(!p || typeof p!=='object') continue;
    const attempts=count(p.attempts);
    if(!attempts) continue;
    out.skills[id]={attempts,correct:Math.min(count(p.correct),attempts),streak:Math.min(count(p.streak),attempts),needsReview:p.needsReview===true,
      due:Number.isFinite(p.due)&&p.due>=0&&p.due<=8640000000000000?p.due:0};
  }
  return out;
}
export function isAccepted(question,choice){return question.answers.includes(choice);}
export function recordParticleAnswer(progress,question,choice,now=Date.now()){
  if(!question.options.includes(choice)) return null;
  const correct=isAccepted(question,choice);
  const p=progress.skills[question.use]??={attempts:0,correct:0,streak:0,needsReview:false,due:0};
  p.attempts++;p.correct+=Number(correct);p.streak=correct?p.streak+1:0;
  if(!correct)p.needsReview=true;
  else if(p.streak>=2)p.needsReview=false;
  p.due=correct?now+[1,3,7,14][Math.min(p.streak-1,3)]*86400000:now;
  return correct;
}
export function finishParticleLesson(progress,id,score){
  const lesson=particleLessons.find(l=>l.id===id);
  if(!lesson) return;
  const old=progress.lessons[id]||{best:0,attempts:0};
  progress.lessons[id]={complete:true,best:Math.max(old.best,Math.min(count(score),lesson.questions.length)),attempts:old.attempts+1};
}
export const dueParticleUsages=(progress,now=Date.now())=>Object.keys(usages).filter(id=>progress.skills[id]&&(progress.skills[id].needsReview||progress.skills[id].due<=now));
export function shuffled(items,rng=Math.random){
  const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function particleQueue(kind,progress,rng=Math.random,now=Date.now()){
  if(kind==='mixed')return shuffled(particleLessons.map(l=>shuffled(allParticleQuestions.filter(q=>q.lesson===l.id),rng)[0]),rng);
  const due=dueParticleUsages(progress,now);
  // Two different examples per usage where available; never repeat a question in a session.
  return shuffled(due.flatMap(id=>shuffled(allParticleQuestions.filter(q=>q.use===id),rng).slice(0,2)),rng);
}
