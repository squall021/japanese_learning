import {allGrammarQuestions} from '../grammar/data.js';

export const t=(jp,label,note)=>({jp,label,note});
export const pt=(title,refs,parts,zh,pattern,explain)=>({title,refs,parts,zh,pattern,explain});
export const choice=(id,use,q,options,answer,why,wrong,extra={})=>({id,type:'choice',use,q,options,answer,answers:[answer],why,wrong,...extra});
export const input=(id,use,q,text,answers,why)=>({id,type:'input',use,q,text,answer:answers[0],answers,why});
export const listen=(id,use,q,audio,options,answer,why,wrong)=>choice(id,use,q,options,answer,why,wrong,{type:'listen',audio});

export function scenario(slug,meta,words,dialogue,points,questions){
  const id='scene-'+slug;
  return {
    id,kind:'application',...meta,
    words:words.map(([jp,reading,zh,example],i)=>({id:id+'-w'+(i+1),jp,reading,zh,example})),
    dialogue,points,
    questions:questions.map(q=>({...q,id:id+'-'+q.id,grammar:allGrammarQuestions.find(question=>question.use===q.use)?.lesson}))
  };
}
