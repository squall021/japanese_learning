import {particleLessons, usages, allParticleQuestions, sourceLinks} from './data.js';
import {dueParticleUsages, particleQueue, recordParticleAnswer, finishParticleLesson, shuffled} from './model.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const plainJapanese=s=>s.replace(/\{([^|{}]+)\|[^{}]+\}/g,'$1').replace(/[【】]/g,'');
export function particleText(s,focus=''){
  return s.split(/(\{[^|{}]+\|[^{}]+\}|【[^】]+】)/g).map(part=>{
    const r=part.match(/^\{([^|{}]+)\|([^{}]+)\}$/);
    if(r)return `<span class="reading" tabindex="0"><ruby lang="ja">${esc(r[1])}<rt>${esc(r[2])}</rt></ruby></span>`;
    const p=part.match(/^【([^】]+)】$/);
    if(p)return focus?`<button class="p-particle" data-pexample="${esc(focus)}" aria-label="助詞「${esc(p[1])}」的本句用途">${esc(p[1])}</button>`:`<mark>${esc(p[1])}</mark>`;
    return esc(part).replaceAll('＿','<span class="p-blank" aria-label="空格">？</span>');
  }).join('');
}
export function createParticles(api){
  let view='overview',lessonId=null,session=null;
  const progress=()=>api.getProgress();
  const lesson=()=>particleLessons.find(l=>l.id===lessonId);
  const button=(label,action,cls='primary',disabled=false)=>`<button class="${cls}" data-paction="${action}" ${disabled?'disabled':''}>${label}</button>`;
  function refresh(focus='#p-title'){
    api.render();
    document.querySelector(focus)?.focus({preventScroll:true});
  }
  const heading=(eyebrow,title,sub)=>`<div class="p-heading"><p class="eyebrow">${eyebrow}</p><h1 id="p-title" tabindex="-1">${title}</h1><p>${sub}</p></div>`;
  function overview(){
    const p=progress(),done=particleLessons.filter(l=>p.lessons[l.id]?.complete).length,due=dueParticleUsages(p),weak=Object.keys(usages).filter(id=>p.skills[id]?.needsReview);
    return `${heading('SMALL WORDS, CLEAR CONNECTIONS','小小助詞，讓意思連起來。','先看生活情境，再練習判斷。一次學一種用法，慢慢把句子讀懂。')}
    <div class="p-hero"><div><span class="p-kicker">你的助詞小教室</span><h2>從「談什麼」，到「去哪裡」。</h2><p>6 堂短課 · 24 道情境題 · 每課約 3–5 分鐘</p><div class="p-progress"><span>已完成 ${done} / 6 課</span><progress max="6" value="${done}" aria-label="助詞課程完成數"></progress></div></div><div class="p-orbit" aria-hidden="true"><span>は</span><span>を</span><span>の</span><span>も</span><span>に</span><span>で</span><span>へ</span></div></div>
    <div class="p-practice-options"><section><span class="eyebrow">CONNECT THE DOTS</span><h3>把學過的放在一起</h3><p>跨六課隨機出 6 題，每次換個情境想想。</p>${button('開始混合練習 →','mixed','secondary')}</section><section><span class="eyebrow">A LITTLE REVIEW</span><h3>${due.length?`${due.length} 種用法，等你再見一次`:'今天的複習，從一次練習開始'}</h3><p>${due.length?'複習答錯或已到期的用法，對照原因，再換一句試試。':'作答後會依用法安排複習。答錯的用法會優先留下。'}</p>${button(due.length?'複習易錯與到期用法 →':'目前沒有待複習用法','review','secondary',!due.length)}</section></div>
    <div class="section-title"><h2>六堂課，一步一步來</h2><span>可以依序學，也可以自由選課</span></div><div class="p-course-grid">${particleLessons.map((l,i)=>{const record=p.lessons[l.id];return `<button class="p-course" data-plesson="${l.id}"><div class="p-course-top"><span class="eyebrow">LESSON 0${i+1}</span><span class="pill">${record?.complete?'✓ 已完成':'3–5 分鐘'}</span></div><span class="p-symbol" lang="ja">${l.symbol}</span><h3>${l.title}</h3><p>${l.subtitle}</p><div class="p-course-bottom"><span>${record?.complete?`最佳 ${record.best} / ${l.questions.length} 題`:'看情境 · 點助詞 · 換你試試'}</span><span aria-hidden="true">↗</span></div></button>`;}).join('')}</div>
    ${weak.length?`<section class="p-weak"><h2>再想一想的用法</h2><p>同一種用法連續答對兩次後，移出易錯清單；之後仍會安排間隔複習。</p><div class="p-usage-list">${weak.map(id=>`<button class="secondary" data-plesson="${allParticleQuestions.find(q=>q.use===id).lesson}">${usages[id]} · 回看教學</button>`).join('')}</div></section>`:''}
    <details class="p-sources"><summary>教材與複習方式</summary><p>本站自行編寫繁體中文解說與題目，依下列公開教材核對基本用法。此階段聚焦入門情境；完成課程表示已做完練習。</p><p>答錯的用法立即加入複習。答對後依連續答對次數安排約 1、3、7、14 天後複習；進度保存在此瀏覽器，可於「我的學習」匯出。</p>${sourceLinks.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</details>`;
  }
  function study(){
    const l=lesson();
    return `<button class="back" data-paction="overview">← 所有助詞課程</button>${heading(`LESSON 0${particleLessons.indexOf(l)+1} · ${l.symbol}`,l.title,l.subtitle)}
    <div class="p-study-grid"><aside class="p-rule"><span class="p-symbol" lang="ja">${l.symbol}</span><h2>先記住這個關係</h2><p>${l.rule}</p><div class="p-formula">${l.pattern}</div><div class="p-caution"><strong>多想一步</strong><p>${l.caution}</p></div></aside>
    <section class="p-examples"><div class="p-scene"><span class="eyebrow">IMAGINE THIS</span><h2>把自己放進這個情境</h2><p>${l.intro}</p></div><p class="p-instruction">點綠色助詞，看它在本句的作用；點聲音按鈕聽整句。</p>${l.examples.map((e,i)=>`<article class="p-example"><p class="p-scene-label"><span>0${i+1}</span>${e.scene}</p><div class="p-sentence" lang="ja">${particleText(e.sentence,`${l.id}:${i}`)}<button class="p-sound" data-psound="${esc(plainJapanese(e.sentence))}" aria-label="播放例句 ${i+1}">♪</button></div><p class="p-translation">${e.zh}</p><div class="p-relation">${esc(e.relation)}</div><p class="p-example-note">${e.note}</p></article>`).join('')}</section></div>
    <div class="p-lesson-end"><div><h2>換一個情境，你也能判斷嗎？</h2><p>4 道練習，每題都有判斷線索與解說。</p></div>${button('開始本課練習 →','practice')}</div>`;
  }
  function questionPage(){
    const q=session.queue[session.index],selected=session.selected,answered=selected!==null,correct=answered&&q.answers.includes(selected);
    return `<button class="back" data-paction="overview">← 回助詞課程</button>${heading(session.kind==='lesson'?'TRY IT YOURSELF':session.kind==='mixed'?'MIX & MATCH':'REVISIT & REMEMBER',session.kind==='lesson'?lesson().title:session.kind==='mixed'?'把助詞，放回情境裡。':'換個句子，再理解一次。','先讀情境，再選答案。每題作答會即時保存；離開後可重新開始一組練習。')}
    <section class="p-question"><div class="p-question-top"><span>第 ${session.index+1} / ${session.queue.length} 題</span><span>${session.score} 題答對</span></div><progress value="${session.index+(answered?1:0)}" max="${session.queue.length}" aria-label="本次練習進度"></progress><div class="p-question-context"><span class="eyebrow">THE SITUATION</span><h2>${q.context}</h2></div>
    <div class="p-question-sentence" lang="ja">${particleText(q.sentence)}</div>${q.answers.length>1?'<p class="p-multi-note">本題有多個可接受答案，選一個即可。</p>':''}
    <div class="p-answers">${session.options.map((option,i)=>`<button data-panswer="${i}" ${answered?'disabled':''} class="${answered&&q.answers.includes(option)?'accepted':''} ${answered&&option===selected&&!correct?'incorrect':''}"><span class="p-choice-letter">${String.fromCharCode(65+i)}</span><span>${esc(option)}</span>${answered&&q.answers.includes(option)?'<span class="p-answer-mark">✓ 可接受</span>':answered&&option===selected?'<span class="p-answer-mark">你的選擇</span>':''}</button>`).join('')}</div>
    ${answered?`<div class="p-feedback ${correct?'good':'retry'}" tabindex="-1" role="status"><h3>${correct?'✓ 判斷正確':'再看一次句子裡的線索'}</h3>${!correct?`<p>${esc(q.wrong[selected])}</p>`:''}<p>${esc(q.why)}</p><p><strong>可接受答案：</strong>${q.answers.map(esc).join('、')}</p>${q.sentence.includes('＿')?`<div class="p-answer-sentences">${q.answers.map(a=>`<span lang="ja">${particleText(q.sentence.replace('＿',`【${a}】`))}<button class="p-sound" data-psound="${esc(plainJapanese(q.sentence.replace('＿',a)))}" aria-label="播放完整答案 ${esc(a)}">♪</button></span>`).join('')}</div>`:''}${button(session.index===session.queue.length-1?'查看本次成果 →':'下一題 →','next')}</div>`:''}</section>`;
  }
  function result(){
    const wrongIds=[...new Set(session.missed)],next=particleLessons[particleLessons.findIndex(l=>l.id===lessonId)+1];
    return `${heading('ONE STEP FORWARD','這一次，理解又多了一點。','看看答對的地方，也把需要再想一想的用法留下。')}<section class="p-result"><span class="p-score">${session.score}<small> / ${session.queue.length}</small></span><h2>本次答對題數</h2><p>${wrongIds.length?'需要加強的用法已加入複習清單。可以先回看教學，再換一組題目。':'這組練習都答對了！之後也會安排間隔複習，幫你留住記憶。'}</p>${wrongIds.length?`<div class="p-usage-list">${wrongIds.map(id=>`<button class="secondary" data-plesson="${allParticleQuestions.find(q=>q.use===id).lesson}">${usages[id]} · 回看教學</button>`).join('')}</div>`:''}<div class="button-row">${button('回助詞課程','overview','secondary')}${button('再練一組','retry')}${session.kind==='lesson'&&next?`<button class="secondary" data-plesson="${next.id}">下一課：${next.symbol} →</button>`:''}</div></section>`;
  }
  function start(kind){
    const queue=kind==='lesson'?allParticleQuestions.filter(q=>q.lesson===lessonId):particleQueue(kind,progress());
    if(!queue.length){view='overview';refresh();return;}
    session={kind,queue,index:0,selected:null,score:0,missed:[],options:shuffled(queue[0].options)};view='question';refresh();window.scrollTo(0,0);
  }
  return {
    reset(){view='overview';lessonId=null;session=null;},
    renderPage(){return `<div class="particles">${view==='overview'?overview():view==='study'?study():view==='question'?questionPage():result()}</div>`;},
    handle(b){
      const d=b.dataset;
      if(d.plesson){const l=particleLessons.find(l=>l.id===d.plesson);if(!l)return true;api.navigate();lessonId=l.id;view='study';session=null;refresh();window.scrollTo(0,0);return true;}
      if(d.psound){api.speak(d.psound,b);return true;}
      if(d.pexample){const [id,i]=d.pexample.split(':'),l=particleLessons.find(l=>l.id===id),e=l?.examples[Number(i)];if(e)api.detail(`<span class="eyebrow">本句的助詞關係</span><div class="p-sentence" lang="ja">${particleText(e.sentence)}</div><p>${e.zh}</p><div class="p-relation">${esc(e.relation)}</div><p>${e.note}</p><p class="muted small">${l.caution}</p>`);return true;}
      if(d.panswer!==undefined){
        if(view!=='question'||session.selected!==null)return true;
        const q=session.queue[session.index],choice=session.options[Number(d.panswer)];if(!q.options.includes(choice))return true;
        session.selected=choice;const correct=recordParticleAnswer(progress(),q,choice);if(correct)session.score++;else session.missed.push(q.use);
        api.changed(true);refresh('.p-feedback');document.querySelector('.p-feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});return true;
      }
      if(!d.paction)return false;
      api.stopSpeech();
      if(d.paction==='overview'){view='overview';session=null;refresh();window.scrollTo(0,0);}
      if(d.paction==='practice'&&view==='study')start('lesson');
      if(d.paction==='mixed'||d.paction==='review')start(d.paction);
      if(d.paction==='retry'&&view==='result')start(session.kind);
      if(d.paction==='next'&&view==='question'&&session.selected!==null){
        if(session.index===session.queue.length-1){if(session.kind==='lesson'){finishParticleLesson(progress(),lessonId,session.score);api.changed(false);}view='result';}
        else{session.index++;session.selected=null;session.options=shuffled(session.queue[session.index].options);}
        refresh();window.scrollTo(0,0);
      }
      return true;
    }
  };
}
