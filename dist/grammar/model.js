import {grammarLessons,grammarSkills,allGrammarQuestions} from './data.js';
export const emptyGrammar=()=>({lessons:{},skills:{}});
const count=n=>Number.isSafeInteger(n)&&n>=0?Math.min(n,1000000):0;
export function cleanGrammar(raw){
  const out=emptyGrammar();if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const l of grammarLessons){const p=raw.lessons?.[l.id];if(p&&typeof p==='object')out.lessons[l.id]={complete:p.complete===true,best:Math.min(count(p.best),l.questions.length),attempts:count(p.attempts)};}
  for(const id of Object.keys(grammarSkills)){
    const p=raw.skills?.[id];if(!p||typeof p!=='object'||!count(p.attempts))continue;
    const attempts=count(p.attempts);
    out.skills[id]={attempts,correct:Math.min(count(p.correct),attempts),streak:Math.min(count(p.streak),attempts),needsReview:p.needsReview===true,due:Number.isFinite(p.due)&&p.due>=0&&p.due<=8640000000000000?p.due:0};
  }
  return out;
}
export function isGrammarAccepted(q,answer){
  if(q.type!=='build')return q.answers.includes(answer);
  return Array.isArray(answer)&&q.orders.some(order=>order.length===answer.length&&order.every((id,i)=>id===answer[i]));
}
export function recordGrammarAnswer(p,q,answer,now=Date.now()){
  if(q.type==='build'){
    if(!Array.isArray(answer)||answer.length!==q.parts.length||new Set(answer).size!==answer.length||answer.some(i=>!Number.isInteger(i)||!q.parts[i]))return null;
  }else if(!q.options.includes(answer))return null;
  const correct=isGrammarAccepted(q,answer),s=p.skills[q.use]??={attempts:0,correct:0,streak:0,needsReview:false,due:0};
  s.attempts++;s.correct+=Number(correct);s.streak=correct?s.streak+1:0;
  if(!correct)s.needsReview=true;else if(s.streak>=2)s.needsReview=false;
  s.due=correct?now+[1,3,7,14][Math.min(s.streak-1,3)]*86400000:now;
  return correct;
}
export function finishGrammarLesson(p,id,score){
  const l=grammarLessons.find(l=>l.id===id);if(!l)return;
  const old=p.lessons[id]||{best:0,attempts:0};p.lessons[id]={complete:true,best:Math.max(old.best,Math.min(count(score),l.questions.length)),attempts:old.attempts+1};
}
export const dueGrammarSkills=(p,now=Date.now())=>Object.keys(grammarSkills).filter(id=>p.skills[id]&&(p.skills[id].needsReview||p.skills[id].due<=now));
export function shuffleGrammar(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function grammarQueue(kind,p,rng=Math.random,now=Date.now()){
  if(kind==='mixed')return shuffleGrammar(grammarLessons.flatMap(l=>shuffleGrammar(allGrammarQuestions.filter(q=>q.lesson===l.id),rng).slice(0,2)),rng);
  return shuffleGrammar(dueGrammarSkills(p,now).flatMap(id=>shuffleGrammar(allGrammarQuestions.filter(q=>q.use===id),rng).slice(0,2)),rng);
}
