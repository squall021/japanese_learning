import {grammarSkills} from '../grammar/data.js';
import {recordGrammarAnswer} from '../grammar/model.js';
export const normalizeScenario=s=>String(s).normalize('NFKC').replace(/[\s。！？!?]/g,'');
export const acceptedScenarioAnswers=q=>q.answers||[q.answer];
export function scenarioAnswerMarkup(q,answer){
  const match=answer.match(/^(.*[一-龯])(.*)$/);if(!match)return answer;
  const [,head,tail]=match,kana=acceptedScenarioAnswers(q).find(a=>!/[一-龯]/.test(a)&&a.endsWith(tail));
  if(!kana)return answer;const reading=tail?kana.slice(0,-tail.length):kana;
  return reading?'{'+head+'|'+reading+'}'+tail:answer;
}
export function scenarioVerdict(q,value){
  if(q.type==='input'){
    if(typeof value!=='string'||!normalizeScenario(value))return null;
    return acceptedScenarioAnswers(q).some(a=>normalizeScenario(a)===normalizeScenario(value));
  }
  if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+$/.test(value)))return null;
  const i=Number(value);if(!Number.isInteger(i)||i<0||i>=q.options.length)return null;
  return acceptedScenarioAnswers(q).includes(i);
}
export function recordScenarioAnswer(grammar,q,value,now=Date.now()){
  const correct=scenarioVerdict(q,value);if(correct===null)return null;
  if(q.use){
    if(!Object.hasOwn(grammarSkills,q.use))return null;
    recordGrammarAnswer(grammar,{type:'choice',use:q.use,options:['correct','wrong'],answers:['correct']},correct?'correct':'wrong',now);
  }
  return correct;
}
export function cleanCourseProgress(l,raw){
  if(!raw||typeof raw!=='object'||!Number.isInteger(raw.step)||raw.step<0||raw.step>4)return null;
  const p={step:raw.step,complete:!!raw.complete};
  if(Number.isInteger(raw.best)&&raw.best>=0&&Number.isInteger(raw.attempts)&&raw.attempts>0){p.best=Math.min(raw.best,l.questions.length);p.attempts=Math.min(raw.attempts,1000000);}
  if(l.kind==='application'&&p.best===undefined){p.complete=false;p.step=Math.min(p.step,3);}
  return p;
}
export const canFinishCourse=(l,p)=>l.kind!=='application'||(Number.isInteger(p?.best)&&p.attempts>0);
export function finishScenarioPractice(l,p,score){
  if(!Number.isInteger(score)||score<0||score>l.questions.length)return;
  p.best=Math.max(p.best||0,score);p.attempts=Math.min((p.attempts||0)+1,1000000);
}
