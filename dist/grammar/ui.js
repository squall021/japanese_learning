import {grammarLessons,grammarSkills,allGrammarQuestions,exampleSentence,grammarSources} from './data.js';
import {dueGrammarSkills,grammarQueue,recordGrammarAnswer,finishGrammarLesson,shuffleGrammar} from './model.js';
import {particleText as text,plainJapanese} from '../particles/ui.js';
import {verbGroups,verbCards,verbById,verbChange} from './verbs.js';
import {verbGuide} from './verb-guide.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roles={topic:'話題',particle:'助詞',noun:'說明的名詞',ending:'句尾',question:'疑問助詞',object:'動作對象',place:'場所',time:'時間',verb:'動詞（ます前）',adjective:'形容詞',change:'變化的部分'};
const types={choice:'情境選答',build:'詞塊組句',transform:'句尾變換',conjugate:'先分組，再變化'};
const speakButton=(sentence,label='聽完整句子')=>`<button class="g-sound" data-gsound="${esc(plainJapanese(sentence))}" aria-label="${esc(label)}">♪</button>`;
const heading=(eyebrow,title,sub)=>`<div class="g-heading"><span class="eyebrow">${eyebrow}</span><h1 id="g-title" tabindex="-1">${title}</h1><p>${sub}</p></div>`;
const action=(label,id,cls='primary',disabled=false)=>`<button class="${cls}" data-gaction="${id}" ${disabled?'disabled':''}>${label}</button>`;

export function createGrammar(api){
  let view='overview',lessonId=null,exampleIndex=0,tokenIndex=0,session=null,guideWord='read',guideStep=0;
  const progress=()=>api.getProgress();
  const lesson=()=>grammarLessons.find(l=>l.id===lessonId);
  function refresh(focus='#g-title',top=false){
    api.render();document.querySelector(focus)?.focus({preventScroll:true});if(top)window.scrollTo(0,0);
  }
  function overview(){
    const p=progress(),done=grammarLessons.filter(l=>p.lessons[l.id]?.complete).length,due=dueGrammarSkills(p),weak=Object.keys(grammarSkills).filter(id=>p.skills[id]?.needsReview);
    return `${heading('BUILD A SENTENCE, SHARE AN IDEA','把詞語，變成你想說的話。','從介紹身分，到日常行動與感受。一次看懂一個變化。')}
      <section class="g-hero"><div><span class="eyebrow">JAPANESE FOR YOUR EVERYDAY</span><h2>把今天的日常，<br>說成日文。</h2><p>${grammarLessons.length} 堂短課 · ${grammarLessons.reduce((n,l)=>n+l.examples.length,0)} 組可點擊例句 · ${allGrammarQuestions.length} 道練習</p><div class="g-progress"><span>已完成 ${done} / ${grammarLessons.length} 課</span><progress max="${grammarLessons.length}" value="${done}" aria-label="基礎文法課程完成數"></progress></div></div><div class="g-hero-sentences" aria-hidden="true"><span>学生<b>です</b>。</span><span>本を読み<b>ます</b>。</span><span>きのう、読み<b>ました</b>。</span></div></section>
      <div class="section-title"><h2>先理解，再親手組一句</h2><span>每課約 5–12 分鐘 · 可自由選課</span></div>
      <div class="g-course-grid">${grammarLessons.map((l,i)=>{const r=p.lessons[l.id];return `<button class="g-course" data-glesson="${l.id}"><div class="g-course-top"><span class="eyebrow">GRAMMAR ${String(i+1).padStart(2,'0')}</span><span class="pill">${r?.complete?'✓ 已完成':'6 題練習'}</span></div><span class="g-course-symbol" lang="ja">${l.symbol}</span><h3>${l.title}</h3><p>${l.goal}</p><span class="g-course-bottom">${r?.complete?`最佳 ${r.best} / 6 題`:l.guide==='groups'?'看圖解 → 認路線 → 練判斷':l.guide?'看圖解 → 看變化 → 練組句':'看情境 → 拆句 → 組句'} <span aria-hidden="true">↗</span></span></button>`;}).join('')}</div>
      <div class="g-practice-grid"><section><span class="eyebrow">PUT IT TOGETHER</span><h3>換個情境，再想一次</h3><p>每課隨機抽一題，共 ${grammarLessons.length} 題，把身分、行動與描述放回情境裡。</p>${action(`開始 ${grammarLessons.length} 題綜合練習 →`,'mixed','secondary')}</section><section><span class="eyebrow">REVISIT & REMEMBER</span><h3>${due.length?`${due.length} 個概念，等你再見一次`:'讓學過的句型，慢慢留下來'}</h3><p>${due.length?'每個待複習概念抽兩題，重新留意句子裡的線索。':'答錯的概念會優先加入複習，答對後也會安排間隔複習。'}</p>${action(due.length?'複習易錯與到期概念 →':'目前沒有待複習概念','review','secondary',!due.length)}</section></div>
      ${weak.length?`<section class="g-weak"><h2>再留意這幾個地方</h2><p>同一概念連續答對兩次後移出易錯清單，之後仍會間隔複習。</p><div class="button-row">${weak.map(id=>`<button class="secondary" data-glesson="${allGrammarQuestions.find(q=>q.use===id).lesson}">${grammarSkills[id]} · 回看教學</button>`).join('')}</div></section>`:''}
      <details class="g-sources"><summary>教材與複習方式</summary><p>本站編寫繁體中文解說與練習，參照入門教材核對基本用法。完成表示已做完本課六題，最佳分數保留每組練習首次送出答案的結果。</p><p>答錯概念立即加入複習；答對後依連續答對次數安排約 1、3、7、14 天後複習。練習題取自這 ${grammarLessons.length} 課的 ${allGrammarQuestions.length} 題；綜合練習會隨機抽題。作答即時保存，離開後可重新開始一組。進度可於「我的學習」匯出。</p>${grammarSources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</details>`;
  }
  function study(){
    const l=lesson(),e=l.examples[exampleIndex],part=e.parts[tokenIndex];
    return `${action('← 所有文法課程','overview','back')}${heading(`GRAMMAR 0${grammarLessons.indexOf(l)+1} · ${l.symbol}`,l.title,l.subtitle)}
      <section class="g-scene"><span class="eyebrow">IMAGINE THIS</span><h2>把自己放進這個情境</h2><p>${l.scene}</p></section>
      ${l.guide?verbGuide(l.guide,guideWord,guideStep):''}
      <div class="g-study-grid"><aside class="g-rule"><span class="eyebrow">TAKE THIS PATTERN WITH YOU</span><h2>先記住這個關係</h2><p>${l.rule}</p><div class="g-formula">${l.pattern}</div><ul>${l.notes.map(n=>`<li>${text(n)}</li>`).join('')}</ul></aside>
      <section class="g-breakdown"><div class="section-title"><h2>一句話，一塊一塊看懂</h2></div><p class="muted">選個情境，再點詞塊，看看它在本句的作用。</p><div class="g-example-tabs" role="group" aria-label="切換文法例句">${l.examples.map((ex,i)=>`<button data-gexample="${i}" aria-pressed="${i===exampleIndex}">${String(i+1).padStart(2,'0')} ${ex.scene}</button>`).join('')}</div>
      <div class="g-token-sentence" lang="ja">${e.parts.map((t,i)=>`<button class="g-token g-role-${t.role}" data-gtoken="${i}" aria-pressed="${i===tokenIndex}" aria-label="${esc(plainJapanese(t.jp))}：${roles[t.role]}">${text(t.jp)}<small>${roles[t.role]}</small></button>`).join('')}<span>。</span></div><p class="g-translation">${e.zh} ${speakButton(exampleSentence(e))}</p>
      <div class="g-token-note" role="status"><span class="g-role-label">${roles[part.role]}</span><strong lang="ja">${text(part.jp)}</strong><p>${part.note}</p></div>
      <p class="g-small-note">顏色搭配文字標籤，幫你辨認句子關係；只說明這個例句的用法。</p></section></div>
      <div class="g-study-end"><div><h2>${l.guide==='groups'?'認識三條路線了，換你判斷':'換你把意思，組成一句話'}</h2><p>${l.guide==='groups'?'六個小問題，練習分類與容易混淆的單字。':'每課六題，從選句到自己排列。可先調整詞塊，再送出答案。'}</p></div>${action('開始本課六題練習 →','practice')}</div>`;
  }
  function answersFor(q){
    if(q.type==='build')return q.orders.map(order=>order.map(i=>q.parts[i].jp).join('')+'。');
    if(q.type==='transform'||q.type==='conjugate')return q.answers.map(a=>q.prefix+a+'。');
    return q.answers;
  }
  function builder(q){
    const locked=session.answered;
    return `<div class="g-builder"><p class="g-small-note">依序點選下方詞塊。點已選詞塊可以移回；請使用全部 ${q.parts.length} 塊。</p><div class="g-built-sentence" role="group" aria-label="你組成的句子">${session.tiles.length?session.tiles.map((id,pos)=>`<span class="g-built-part"><button data-gremove="${pos}" ${locked?'disabled':''} aria-label="移除第 ${pos+1} 塊：${esc(plainJapanese(q.parts[id].jp))}"><span class="g-tile-position">${pos+1}</span>${text(q.parts[id].jp)}</button>${pos===session.tiles.length-1?'。':''}</span>`).join(''):'<span class="g-builder-placeholder">你的句子，從這裡開始。</span>'}</div><div class="g-tile-bank" role="group" aria-label="可選的詞塊">${session.bank.map(id=>`<button data-gtile="${id}" ${locked||session.tiles.includes(id)?'disabled':''} aria-label="加入詞塊：${esc(plainJapanese(q.parts[id].jp))}">${text(q.parts[id].jp)}</button>`).join('')}</div><div class="button-row">${action('確認組句','submit','primary',locked||session.tiles.length!==q.parts.length)}${action('重新排列','clear','secondary',locked||!session.tiles.length)}</div></div>`;
  }
  function questionPage(){
    const q=session.queue[session.index],answered=session.answered,correct=session.correct;
    const title=session.kind==='lesson'?lesson().title:session.kind==='mixed'?'把學過的句型，放回生活裡。':'換個角度，再理解一次。';
    return `${action('← 回文法課程','overview','back')}${heading('A SENTENCE OF YOUR OWN',title,'先讀情境，再選句或組句。每題作答會即時保存；離開後可重新開始一組。')}
      <section class="g-question"><div class="g-question-top"><span>第 ${session.index+1} / ${session.queue.length} 題 · ${types[q.type]}</span><span>${session.score} 題答對</span></div><progress value="${session.index+(answered?1:0)}" max="${session.queue.length}" aria-label="本次文法練習進度"></progress><span class="eyebrow">THE SITUATION</span><h2>${text(q.context)}</h2>
      ${q.type==='transform'||q.type==='conjugate'?`<div class="g-transform-source"><span>${q.sourceLabel||'原句'}</span><p lang="ja">${text(q.source)}</p></div>`:''}
      ${q.type==='conjugate'?groupQuestion(q):''}
      ${q.type==='transform'||(q.type==='conjugate'&&session.formStage)?`<div class="g-transform-target" lang="ja">${text(q.prefix)}<span class="g-ending-slot">${answered?text(session.selected):'選個說法'}</span>。</div>`:''}
      ${q.answers?.length>1?'<p class="g-small-note">本題有多個合理答案，選一個即可。</p>':''}
      ${q.type==='build'?builder(q):q.type==='conjugate'&&!session.formStage?'':`<div class="g-options ${q.type==='transform'||q.type==='conjugate'?'g-ending-options':''}">${session.options.map((option,i)=>`<button data-ganswer="${i}" ${answered?'disabled':''} class="${answered&&q.answers.includes(option)?'g-accepted':''} ${answered&&option===session.selected&&!session.formCorrect?'g-incorrect':''}"><span class="g-choice-letter">${String.fromCharCode(65+i)}</span><span>${text(option)}</span>${answered&&q.answers.includes(option)?'<small>✓ 可接受</small>':answered&&option===session.selected?'<small>你的選擇</small>':''}</button>`).join('')}</div>`}
      ${answered?`<div class="g-feedback ${correct?'good':'retry'}" tabindex="-1" role="status"><h3>${correct?'✓ 判斷正確':q.type==='conjugate'&&session.formCorrect?'變化正確，分類再看一次':'再看一次句子裡的線索'}</h3>${!correct?`<p>${esc(q.type==='conjugate'&&session.formCorrect?`變化這一步答對了。這次要再留意的是分類：「${plainJapanese(q.source)}」屬於${verbGroups[verbById(q.verbId).group].label}。`:q.type==='build'?q.hint:q.wrong[session.selected])}</p>`:''}<p>${q.why}</p><strong>${q.type==='choice'?'可接受答案':'完整答案'}</strong><div class="g-correct-sentences">${answersFor(q).map((s,i)=>`<div><span>${q.type==='transform'||q.type==='conjugate'?text(q.prefix)+`<mark>${text(q.answers[i])}</mark>。`:text(s)}</span>${q.type!=='choice'?speakButton(s,'播放答案：'+plainJapanese(s)):''}</div>`).join('')}</div>${q.translation?`<p class="g-answer-translation">${q.translation}</p>`:''}${action(session.index===session.queue.length-1?'查看本次成果 →':'下一題 →','next')}</div>`:''}</section>`;
  }
  function groupQuestion(q){
    const v=verbById(q.verbId),chosen=session.groupSelected!==null;
    return `<div class="g-group-question"><span class="eyebrow">STEP 1 · 先認路線</span><p>這個動詞屬於哪一組？</p><p class="g-small-note">本題有兩小步：分類與變化。兩步第一次都答對，計一題答對；需要加強的地方會分開留下。</p><div class="g-group-answers">${Object.entries(verbGroups).map(([id,g])=>`<button data-ggroup="${id}" ${chosen?'disabled':''} class="${chosen&&id===v.group?'g-group-accepted':''} ${chosen&&id===session.groupSelected&&!session.groupCorrect?'g-group-wrong':''}">${g.label}${chosen&&id===v.group?' ✓':''}</button>`).join('')}</div>${chosen?`<div class="g-group-feedback" role="status" tabindex="-1"><strong>${session.groupCorrect?'✓ 分類正確':'先記住這個動詞的路線'}</strong><p>${text(v.jp)} 屬於${verbGroups[v.group].label}。${v.exception||verbGroups[v.group].hint}</p>${!session.formStage?action('接著看變化 →','form','secondary'):`<span class="eyebrow">STEP 2 · ${verbChange(v,q.target).note}</span>`}</div>`:''}</div>`;
  }
  function result(){
    const missed=[...new Set(session.missed)],next=session.kind==='lesson'?grammarLessons[grammarLessons.findIndex(l=>l.id===lessonId)+1]:null;
    return `${heading('ONE STEP FORWARD','你想說的，又清楚了一點。','保留做對的地方，也看看可以再留意的概念。')}<section class="g-result"><span class="g-score">${session.score}<small> / ${session.queue.length}</small></span><h2>本次答對題數</h2><p>${missed.length?'本次答錯的概念已記錄。可以先回看教學，再重新練習。':'這組練習都答對了！之後也會安排間隔複習。'}</p>${missed.length?`<div class="button-row">${missed.map(id=>`<button class="secondary" data-glesson="${allGrammarQuestions.find(q=>q.use===id).lesson}">${grammarSkills[id]} · 回看教學</button>`).join('')}</div>`:''}<div class="button-row">${action('回文法課程','overview','secondary')}${action('再練一組','retry')}${next?`<button class="secondary" data-glesson="${next.id}">下一課：${next.symbol} →</button>`:''}</div></section>`;
  }
  function prepareQuestion(){
    const q=session.queue[session.index];Object.assign(session,{answered:false,correct:false,formCorrect:false,selected:null,groupSelected:null,groupCorrect:false,formStage:false,tiles:[],options:q.options?shuffleGrammar(q.options):[],bank:q.parts?shuffleGrammar(q.parts.map((_,i)=>i)):[]});
  }
  function start(kind){
    const queue=kind==='lesson'?allGrammarQuestions.filter(q=>q.lesson===lessonId):grammarQueue(kind,progress());
    if(!queue.length){view='overview';refresh('#g-title',true);return;}
    session={kind,queue,index:0,score:0,missed:[]};prepareQuestion();view='question';refresh('#g-title',true);
  }
  function answer(value){
    if(view!=='question'||session.answered)return;
    const q=session.queue[session.index];if(q.type==='conjugate'&&!session.formStage)return;
    const correct=recordGrammarAnswer(progress(),q,value);if(correct===null)return;
    session.answered=true;session.formCorrect=correct;session.correct=correct&&(q.type!=='conjugate'||session.groupCorrect);session.selected=value;
    if(session.correct)session.score++;if(!correct)session.missed.push(q.use);
    api.changed(true);refresh('.g-feedback');document.querySelector('.g-feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  return {
    reset(){view='overview';lessonId=null;session=null;exampleIndex=0;tokenIndex=0;guideWord='read';guideStep=0;},
    renderPage(){return `<div class="grammar">${view==='overview'?overview():view==='study'?study():view==='question'?questionPage():result()}</div>`;},
    handle(b){
      const d=b.dataset;
      if(d.glesson){if(!grammarLessons.some(l=>l.id===d.glesson))return true;api.navigate();lessonId=d.glesson;exampleIndex=0;tokenIndex=0;guideWord='read';guideStep=0;session=null;view='study';refresh('#g-title',true);return true;}
      if(d.gvgroup||d.gvword||d.gvstep!==undefined){
        if(view!=='study'||!lesson().guide)return true;api.stopSpeech();
        if(d.gvgroup){if(!Object.hasOwn(verbGroups,d.gvgroup))return true;guideWord=verbCards.find(v=>v.group===d.gvgroup).id;guideStep=0;}
        if(d.gvword){if(!verbById(d.gvword))return true;guideWord=d.gvword;guideStep=0;}
        if(d.gvstep!==undefined){const n=Number(d.gvstep);if(!Number.isInteger(n)||n<0||n>2)return true;guideStep=n;}
        refresh(d.gvgroup?`[data-gvgroup="${d.gvgroup}"]`:d.gvword?`[data-gvword="${guideWord}"]`:`[data-gvstep="${guideStep}"]`);return true;
      }
      if(d.ggroup){
        if(view!=='question'||session.answered||session.groupSelected!==null)return true;const q=session.queue[session.index];if(q.type!=='conjugate'||!Object.hasOwn(verbGroups,d.ggroup))return true;
        const correct=recordGrammarAnswer(progress(),{type:'choice',use:q.groupUse,options:Object.keys(verbGroups),answers:[verbById(q.verbId).group]},d.ggroup);
        session.groupSelected=d.ggroup;session.groupCorrect=correct;if(!correct)session.missed.push(q.groupUse);api.changed(false);refresh('.g-group-feedback');document.querySelector('.g-group-feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});return true;
      }
      if(d.gsound){api.speak(d.gsound,b);return true;}
      if(d.gexample!==undefined){if(view==='study'&&lesson().examples[Number(d.gexample)]){api.stopSpeech();exampleIndex=Number(d.gexample);tokenIndex=0;refresh(`[data-gexample="${exampleIndex}"]`);}return true;}
      if(d.gtoken!==undefined){if(view==='study'&&lesson().examples[exampleIndex].parts[Number(d.gtoken)]){tokenIndex=Number(d.gtoken);refresh(`[data-gtoken="${tokenIndex}"]`);}return true;}
      if(d.gtile!==undefined||d.gremove!==undefined){
        if(view!=='question'||session.answered||session.queue[session.index].type!=='build')return true;
        let target;
        if(d.gtile!==undefined){const id=Number(d.gtile);if(!Number.isInteger(id)||!session.bank.includes(id)||session.tiles.includes(id))return true;session.tiles.push(id);target=session.bank.find(i=>!session.tiles.includes(i));}
        else{const pos=Number(d.gremove);if(!Number.isInteger(pos)||pos<0||pos>=session.tiles.length)return true;[target]=session.tiles.splice(pos,1);}
        refresh(target===undefined?'[data-gaction="submit"]':`[data-gtile="${target}"]`);return true;
      }
      if(d.ganswer!==undefined){if(view==='question'&&session.queue[session.index].type!=='build')answer(session.options[Number(d.ganswer)]);return true;}
      if(!d.gaction)return false;
      api.stopSpeech();
      if(d.gaction==='overview'){view='overview';session=null;refresh('#g-title',true);}
      if(d.gaction==='practice'&&view==='study')start('lesson');
      if(d.gaction==='form'&&view==='question'&&session.queue[session.index].type==='conjugate'&&session.groupSelected!==null&&!session.answered){session.formStage=true;refresh('[data-ganswer="0"]');}
      if(d.gaction==='mixed'||d.gaction==='review')start(d.gaction);
      if(d.gaction==='retry'&&view==='result')start(session.kind);
      if(d.gaction==='clear'&&view==='question'&&!session.answered){session.tiles=[];refresh(`[data-gtile="${session.bank[0]}"]`);}
      if(d.gaction==='submit'&&view==='question'&&session.queue[session.index].type==='build')answer([...session.tiles]);
      if(d.gaction==='next'&&view==='question'&&session.answered){
        if(session.index===session.queue.length-1){if(session.kind==='lesson'){finishGrammarLesson(progress(),lessonId,session.score);api.changed(false);}view='result';}
        else{session.index++;prepareQuestion();}
        refresh('#g-title',true);
      }
      return true;
    }
  };
}
