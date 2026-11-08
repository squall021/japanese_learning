import {categories,scenes,helpPhrases,sources} from './data.js';
import {findScenes,resolveScene,rememberScene,toggleSaved,setSceneSelection} from './model.js';
import {rehearsalRoutes,createRehearsal,rehearsalTurn,moveRehearsal,slotPanel,routePicker,rehearsalView} from './rehearsal.js';
import {pocketScenes,selectionSummary,pocketHtml,pocketText} from './pocket.js';
import {particleText as text,plainJapanese} from '../particles/ui.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={bag:'M4 7h16l1 15H3ZM8 8V5a4 4 0 0 1 8 0v3',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7v6m-3-3h6',ticket:'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 7v2m0 3v1m0 3v1',cup:'M4 8h13v8a6 6 0 0 1-13 0Zm13 1h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3',home:'m3 10 9-7 9 7v11H3ZM9 21v-8h6v8',sign:'M12 2v21M3 5h14l4 4-4 4H3Z'};
const icon=name=>`<svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="${paths[name]||paths.sign}"/></svg>`;
const roleLabel=role=>role==='you'?'你可以說':'對方常說 · 聽懂即可';
Object.assign(paths,{parcel:'m3 7 9-5 9 5v12l-9 4-9-4Zm0 0 9 5 9-5M12 12v11M7 4l10 6',camera:'M3 7h4l2-4h6l2 4h4v14H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',wifi:'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01',help:'M4 3h16v18H4ZM9 8a3 3 0 1 1 5 2c-1 1-2 1-2 4m0 3h.01'});
export function createPhrasebook(api){
 let current=null,category='all',scope='all',query='',role='all',showChinese=true,rate=1,selection={},replyOnly=false,replyChoice=null,showPrompt=false,pocketOpen=false,rehearsal=null,revealed=false,routesOpen=false;
 const book=()=>api.getState();
 const selected=()=>scenes.find(s=>s.id===current);
 const refresh=(focus,top=false)=>{api.render();if(focus)document.querySelector(focus)?.focus({preventScroll:true});if(top)window.scrollTo(0,0);};
 const saveButton=s=>`<button class="f-save ${book().saved.includes(s.id)?'is-saved':''}" data-fsave="${s.id}" aria-pressed="${book().saved.includes(s.id)}" aria-label="${book().saved.includes(s.id)?'取消收藏':'收藏'}：${esc(s.title)}">${book().saved.includes(s.id)?'★ 已收藏':'☆ 收藏'}</button>`;
 function cards(){
  const results=findScenes(query,category,scope,book()).filter(s=>!replyOnly||s.replyPractice);
  return `<div class="f-result-heading"><h2>${scope==='saved'?'我的會話收藏':scope==='recent'?'最近看過':'找一句，解決眼前的小事'}</h2><span role="status">${results.length} 個情境</span></div>${results.length?`<div class="f-scene-grid">${results.map(s=>{const cat=categories.find(c=>c.id===s.category),resolved=resolveScene(s,book().selections?.[s.id]||{}),first=resolved.lines.find(l=>role==='all'?l.role==='you':l.role===role)||resolved.lines[0];return `<article class="f-scene-card"><div class="f-card-meta"><span>${cat.name}${s.replyPractice?'<small class="f-reply-badge">可練接話</small>':''}</span>${saveButton(s)}</div><button class="f-open" data-fopen="${s.id}"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><div class="f-preview"><small>${roleLabel(first.role)}</small><span lang="ja">${text(first.jp)}</span>${showChinese?`<span class="f-preview-zh">${esc(first.zh)}</span>`:''}</div><span class="f-card-link">看完整對話 <span aria-hidden="true">↗</span></span></button></article>`;}).join('')}</div>`:`<div class="f-empty"><h3>${scope==='saved'&&!book().saved.length?'還沒有收藏的會話':scope==='recent'&&!book().recent.length?'打開情境後，就能在這裡找回':'沒有找到符合的情境'}</h3><p>可以試試「袋子」「轉乘」「兒童票」等需求，或查看全部分類。</p><button class="secondary" data-faction="clear">查看全部情境</button></div>`}`;
 }
 function roleTabs(){return `<div class="f-role-tabs" role="group" aria-label="選擇會話角色">${[['all','雙方對話'],['you','我想說'],['staff','我可能聽到']].map(([id,label])=>`<button data-frole="${id}" aria-pressed="${role===id}">${label}</button>`).join('')}</div>`;}
 function overview(){return `<div class="f-heading"><span class="eyebrow">JAPANESE, WHEN YOU NEED IT</span><h1 id="f-title" tabindex="-1">在日本的每一天，<br>有一句話陪你。</h1><p>從找商品、問轉乘，到寄件、連網與找遺失物。先選一個需求，聽聽雙方怎麼說。</p></div>
  <div class="fr-intro-actions"><button class="secondary" data-faction="pocket">我的旅行小抄 · ${book().saved.length} 個收藏 ↗</button><button class="secondary" data-faction="routes" aria-expanded="${routesOpen}">${routesOpen?'收起連續演練路線':'找一條連續演練路線 ↓'}</button></div><section class="f-search-panel"><label for="f-search">現在想做什麼？</label><div class="f-search-row"><span aria-hidden="true">⌕</span><input id="f-search" type="search" data-fsearch value="${esc(query)}" placeholder="搜尋袋子、月台、轉車、寄件、Wi-Fi…" autocomplete="off"><button class="f-clear" data-faction="clear-query" aria-label="清除搜尋">×</button></div><div class="f-scopes" role="group" aria-label="會話清單">${[['all','全部會話'],['saved',`我的收藏 ${book().saved.length}`],['recent','最近看過']].map(([id,label])=>`<button data-fscope="${id}" aria-pressed="${scope===id}">${label}</button>`).join('')}</div></section>
  <section class="f-categories" aria-label="日常會話分類">${categories.map((c,i)=>`<button data-fcategory="${c.id}" aria-pressed="${category===c.id}" class="f-category f-color-${i%3}">${icon(c.icon)}<span><strong>${c.name}</strong><small>${c.hint}</small></span><em>${scenes.filter(s=>s.category===c.id).length}</em></button>`).join('')}</section>
  <p class="f-edition-note">${categories.length} 個分類 · ${scenes.length} 個生活情境 · ${scenes.filter(s=>s.replyPractice).length} 組接話練習。從「可練接話」的情境，試試對方問了以後怎麼回答。</p><div class="f-filter-row"><button class="${category==='all'?'f-active':'secondary'}" data-fcategory="all">全部分類</button><button class="secondary" data-faction="reply-only" aria-pressed="${replyOnly}">只看接話練習</button>${roleTabs()}<button class="secondary" data-faction="translation" aria-pressed="${showChinese}">${showChinese?'隱藏中文':'顯示中文'}</button></div>
  <details class="f-help"><summary>聽不懂時，先用這幾句</summary><div class="f-help-grid">${helpPhrases.map((h,i)=>`<article><strong>${h.title}</strong><p lang="ja">${text(h.jp)}</p><p>${esc(h.zh)}</p><div class="f-line-actions"><button data-fhelp-sound="${i}" aria-label="播放：${h.title}">♪ 聽這句</button><button data-fhelp-card="${i}">放大出示 ↗</button></div></article>`).join('')}</div></details>
  ${routesOpen?routePicker():''}<section id="f-results">${cards()}</section><details class="f-sources"><summary>關於這本日常會話</summary><p>${categories.length}類、${scenes.length}個常見小情境，以雙方對話、替代說法與接話練習編排。可自由查用，收藏與最近看過會隨學習資料一同備份。</p><p>語音沿用網站的日文合成聲音。工作人員的回覆是會話示例，現場說法可能不同；可用上方求助句請對方再說一次。</p><p>對話與中文由本站編寫，參考下列資源核對情境與表達。</p>${sources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</details>`;}
 const lineActions=(index,kind='line',label=`第 ${Number(index)+1} 句`)=>`<div class="f-line-actions"><button data-fsound="${kind}:${index}" aria-label="播放：${label}">♪ 聽這句</button><button data-fcard="${kind}:${index}">放大這句 ↗</button></div>`;
 function replyPractice(s){
  const p=s.replyPractice;if(!p)return '';
  const choice=p.options.find(o=>o.id===replyChoice);
  return `<section class="f-replies" aria-labelledby="f-replies-title"><span class="eyebrow">YOUR TURN TO REPLY</span><h2 id="f-replies-title" tabindex="-1">對方這樣問，我可以怎麼接？</h2>${role!=='all'?'<p>切換到雙方對話，就能聽問句、選擇需求，再看對方如何回應。</p><button class="secondary" data-frole="all">切換雙方對話，練習接話</button>':`
   <p>先聽對方的問句，再選你的需求。兩種回答都可以使用，不計分，依你當下的情況選擇。</p>
   <div class="f-reply-prompt"><span class="f-speaker">對方先問</span><div class="f-line-actions"><button data-fsound="practice:prompt">♪ 先聽對方說</button><button data-faction="prompt" aria-expanded="${showPrompt}">${showPrompt?'收起問句':'看問句與意思'}</button></div>${showPrompt?`<p class="f-jp" lang="ja">${text(p.prompt.jp)}</p>${showChinese?`<p class="f-zh">${esc(p.prompt.zh)}</p>`:''}<button class="secondary f-prompt-card" data-fcard="practice:prompt">放大問句 ↗</button>`:'<p class="f-listen-hint">可以先聽幾次；需要文字時，再展開問句。</p>'}</div>
   <div class="f-reply-choices" role="group" aria-label="選擇你當下的需求">${p.options.map(o=>`<button data-freply="${o.id}" aria-pressed="${replyChoice===o.id}"><span>我想表達</span><strong>${esc(o.label)}</strong><span aria-hidden="true">↗</span></button>`).join('')}</div>
   ${choice?`<div class="f-reply-result"><h3 id="f-reply-result" tabindex="-1">${esc(choice.label)}，可以這樣接</h3>${[[choice.line,'answer'],[choice.reply,'reply']].map(([l,key])=>`<article class="f-line f-line-${l.role}"><span class="f-speaker">${roleLabel(l.role)}</span><p class="f-jp" lang="ja">${text(l.jp)}</p>${showChinese?`<p class="f-zh">${esc(l.zh)}</p>`:''}${lineActions(key,'practice',l.role==='you'?'我的回覆':'對方的回覆')}</article>`).join('')}<div class="f-play-row"><button class="primary" data-faction="reply-play">♪ 播放這段接話</button><button class="secondary" data-faction="stop">停止播放</button><button class="secondary" data-faction="reply-reset">重新聽問句</button></div><p class="f-reply-note">這是其中一種接法；對方的實際回答可能不同。</p></div>`:''}`}</section>`;
 }
 function detail(){
  const s=resolveScene(selected(),selection),cat=categories.find(c=>c.id===s.category);
  return `<button class="back" data-faction="back">← 回日常會話</button><div class="f-detail-heading"><div><span class="eyebrow">${cat.name} · EVERYDAY CONVERSATION</span><h1 id="f-title" tabindex="-1">${esc(s.title)}</h1><p>${esc(s.description)}</p></div>${saveButton(s)}</div>
   ${slotPanel(s,selection)}
   ${s.note?`<p class="f-context-note">${esc(s.note)}</p>`:''}${s.replyPractice?'<button class="secondary f-reply-jump" data-faction="go-reply">直接練這個情境的接話 ↓</button>':''}
   <div class="f-dialogue-toolbar">${roleTabs()}<div class="f-speed" role="group" aria-label="會話播放速度">${[[1,'一般'],[.65,'慢速']].map(([value,label])=>`<button data-frate="${value}" aria-pressed="${rate===value}">${label}</button>`).join('')}</div><button class="secondary" data-faction="translation">${showChinese?'隱藏中文':'顯示中文'}</button></div>
   <div class="fr-detail-action"><button class="secondary" data-faction="rehearse">逐句角色演練 ↗</button><span>先看提示、試著開口，再展開日文對照。</span></div><div class="f-play-row"><button class="primary" data-faction="play">♪ ${role==='all'?'播放整段對話':role==='you'?'播放我方句子':'播放對方句子'}</button><button class="secondary" data-faction="stop">停止播放</button></div>
   <section class="f-dialogue" aria-label="情境對話">${s.lines.map((l,i)=>role==='all'||l.role===role?`<article class="f-line f-line-${l.role}"><span class="f-speaker">${roleLabel(l.role)}</span><p class="f-jp" lang="ja">${text(l.jp)}</p>${showChinese?`<p class="f-zh">${esc(l.zh)}</p>`:''}${lineActions(i)}</article>`:'').join('')}</section>
   ${replyPractice(s)}<section class="f-alternatives"><div class="f-result-heading"><h2>換個需求，也可以這樣說</h2></div>${s.alternatives.map((l,i)=>role==='all'||l.role===role?`<article class="f-alternative"><span class="f-speaker">${roleLabel(l.role)} · ${esc(l.label)}</span><p class="f-jp" lang="ja">${text(l.jp)}</p>${showChinese?`<p class="f-zh">${esc(l.zh)}</p>`:''}${lineActions(i,'alt')}</article>`:'').join('')||'<p class="muted">這個情境的替代說法放在「我想說」，可切換角色查看。</p>'}</section>
   <div class="f-detail-end"><p>需要時，再回來找這一句。</p><button class="secondary" data-faction="back">← 回日常會話</button></div>`;
 }
 function lineFor(value){
  if(!current)return null;
  const [kind,num]=value.split(':'),s=resolveScene(selected(),selection);
  if(kind==='practice'){
   if(num==='prompt')return s.replyPractice?.prompt||null;
   const choice=s.replyPractice?.options.find(o=>o.id===replyChoice);
   return num==='answer'?choice?.line||null:num==='reply'?choice?.reply||null:null;
  }
  const i=Number(num);return Number.isInteger(i)&&i>=0?(kind==='line'?s.lines:kind==='alt'?s.alternatives:[])[i]||null:null;
 }
 function largeCard(line){api.stopSpeech();api.detail(`<div class="f-large-card"><span class="eyebrow">${line.role==='staff'?'對方常說':'請看這句日文'}</span><p lang="ja">${text(line.jp)}</p><strong>${esc(line.zh)}</strong><button class="primary" data-fmodal-sound="1" data-fmodal-text="${esc(plainJapanese(line.jp))}">♪ 播放這句</button><p class="f-large-note">可直接將畫面出示給對方。</p></div>`);}
 function pocket(){
  const saved=pocketScenes(book());
  return `<button class="back" data-faction="back">← 回日常會話</button><div class="fr-pocket-heading"><span class="eyebrow">YOUR TRAVEL POCKET PHRASES</span><h1 id="f-title" tabindex="-1">把常用的話，帶在身邊。</h1><p>${saved.length} 個收藏情境，沿用你選好的地點、數量等內容。可在線上聽、放大，或下載文字帶著查用。</p></div><div class="fr-downloads"><button class="primary" data-faction="pocket-html" ${!saved.length?'disabled':''}>下載離線小抄（HTML）</button><button class="secondary" data-faction="pocket-text" ${!saved.length?'disabled':''}>下載純文字（TXT）</button></div><p class="fr-note">下載檔可離線閱讀，不需要連線載入文字與標音；語音請回網站播放。之後修改收藏或選項，可重新下載更新的小抄。</p>
   ${saved.length?`<div class="fr-pocket-list">${saved.map(s=>`<article class="fr-pocket-scene"><div class="f-card-meta"><span>${categories.find(c=>c.id===s.category).name}</span>${saveButton(s)}</div><h2>${esc(s.title)}</h2>${s.slots.length?`<p class="fr-note">${esc(selectionSummary(s,book()))}</p>`:''}${s.lines.map((l,i)=>l.role==='you'?`<div class="fr-pocket-line"><p class="f-jp" lang="ja">${text(l.jp)}</p><p class="f-zh">${esc(l.zh)}</p><div class="f-line-actions"><button data-fpocket-sound="${s.id}:${i}" aria-label="播放：${esc(s.title)}第${i+1}句">♪ 聽這句</button><button data-fpocket-card="${s.id}:${i}">放大這句 ↗</button></div></div>`:'').join('')}${s.note?`<p class="f-context-note">${esc(s.note)}</p>`:''}<button class="secondary" data-fopen="${s.id}">看完整對話與調整選項 ↗</button></article>`).join('')}</div>`:'<div class="f-empty"><h2>先收藏幾個會用到的情境</h2><p>回到日常會話，點情境旁的「收藏」，就能在這裡整理與下載。</p><button class="secondary" data-faction="back">挑選常用情境</button></div>'}`;
 }
 function pocketLine(value){const [id,index]=value.split(':'),i=Number(index);if(!book().saved.includes(id)||!Number.isInteger(i)||i<0)return null;const scene=scenes.find(s=>s.id===id);return scene?resolveScene(scene,book().selections?.[id]||{}).lines[i]||null:null;}
 function startRehearsal(ids,title){const next=createRehearsal(ids,title);if(!next)return;api.stopSpeech();api.navigate();rehearsal=next;revealed=false;pocketOpen=false;rememberScene(book(),ids[0]);api.changed();refresh('#fr-title',true);}
 return {
  reset(){current=null;category='all';scope='all';query='';role='all';selection={};replyOnly=false;replyChoice=null;showPrompt=false;pocketOpen=false;rehearsal=null;revealed=false;routesOpen=false;},
  renderPage(){return `<div class="phrasebook">${rehearsal?rehearsalView(rehearsal,book(),{revealed,showChinese,rate}):pocketOpen?pocket():current?detail():overview()}</div>`;},
  input(target){if(target.dataset?.fsearch===undefined)return false;query=target.value;const result=document.querySelector('#f-results');if(result)result.innerHTML=cards();return true;},
  change(target){const key=target.dataset?.fslot;if(!key)return false;const scene=rehearsal&&!rehearsal.finished?rehearsalTurn(rehearsal,book()).scene:current?selected():null;if(scene&&setSceneSelection(book(),scene.id,key,target.value)){if(current===scene.id)selection={...book().selections[scene.id]};revealed=false;api.stopSpeech();api.changed();refresh(`[data-fslot="${key}"]`);}return true;},
  handle(button){
   const d=button.dataset;
   if(d.fopen){const s=scenes.find(s=>s.id===d.fopen);if(!s)return true;api.stopSpeech();api.navigate();current=s.id;selection={...(book().selections?.[s.id]||{})};replyChoice=null;showPrompt=false;pocketOpen=false;rehearsal=null;if(replyOnly&&s.replyPractice)role='all';rememberScene(book(),s.id);api.changed();refresh('#f-title',true);if(replyOnly&&s.replyPractice){document.querySelector('#f-replies-title')?.focus({preventScroll:true});document.querySelector('.f-replies')?.scrollIntoView({block:'start'});}return true;}
   if(d.froute){const route=rehearsalRoutes.find(r=>r.id===d.froute);if(route){current=null;startRehearsal(route.sceneIds,route.title);}return true;}
   if(d.fpocketSound||d.fpocketCard){const line=pocketLine(d.fpocketSound||d.fpocketCard);if(line){if(d.fpocketSound)api.speak(plainJapanese(line.jp),button,{rate});else largeCard(line);}return true;}
   if(d.freply){const p=current?selected().replyPractice:null;if(p?.options.some(o=>o.id===d.freply)){api.stopSpeech();replyChoice=d.freply;showPrompt=true;refresh('#f-reply-result');document.querySelector('#f-reply-result')?.scrollIntoView({block:'nearest'});}return true;}
   if(d.fsave){if(toggleSaved(book(),d.fsave)){api.changed();refresh(`[data-fsave="${d.fsave}"]`);}return true;}
   if(d.fcategory){if(d.fcategory==='all'||categories.some(c=>c.id===d.fcategory)){category=d.fcategory;refresh(`[data-fcategory="${category}"]`);}return true;}
   if(d.fscope){if(['all','saved','recent'].includes(d.fscope)){scope=d.fscope;refresh(`[data-fscope="${scope}"]`);}return true;}
   if(d.frole){if(['all','you','staff'].includes(d.frole)){role=d.frole;api.stopSpeech();refresh(`[data-frole="${role}"]`);}return true;}
   if(d.frate){const n=Number(d.frate);if([1,.65].includes(n)){rate=n;api.stopSpeech();refresh(`[data-frate="${rate}"]`);}return true;}
   if(d.fsound){const line=lineFor(d.fsound);if(line)api.speak(plainJapanese(line.jp),button,{rate});return true;}
   if(d.fcard){const line=lineFor(d.fcard);if(line)largeCard(line);return true;}
   if(d.fhelpSound!==undefined||d.fhelpCard!==undefined){const i=Number(d.fhelpSound??d.fhelpCard),h=helpPhrases[i];if(h){if(d.fhelpSound!==undefined)api.speak(plainJapanese(h.jp),button,{rate});else largeCard({...h,role:'you'});}return true;}
   if(d.fmodalSound){if(d.fmodalText)api.speak(d.fmodalText,button,{rate});return true;}
   if(!d.faction)return false;
   api.stopSpeech();
   if(d.faction==='back'){current=null;pocketOpen=false;rehearsal=null;refresh('#f-title',true);}
   if(d.faction==='pocket'){current=null;pocketOpen=true;rehearsal=null;refresh('#f-title',true);}
   if(d.faction==='routes'){routesOpen=!routesOpen;refresh(routesOpen?'#fr-routes-title':'[data-faction="routes"]');if(routesOpen)document.querySelector('.fr-route-section')?.scrollIntoView({block:'start'});}
   if(['pocket-html','pocket-text'].includes(d.faction)&&book().saved.length)api.download(d.faction==='pocket-html'?pocketHtml(book()):pocketText(book()),d.faction==='pocket-html'?'html':'txt');
   if(d.faction==='rehearse'&&current)startRehearsal([current],selected().title);
   if(d.faction==='rehearsal-exit'){rehearsal=null;revealed=false;refresh('#f-title',true);}
   if(d.faction==='rehearsal-restart'&&rehearsal)startRehearsal(rehearsal.sceneIds,rehearsal.title);
   if(d.faction==='rehearsal-reveal'&&rehearsal&&!rehearsal.finished){revealed=!revealed;refresh('[data-faction="rehearsal-reveal"]');}
   if(['rehearsal-sound','rehearsal-card'].includes(d.faction)&&rehearsal&&!rehearsal.finished){const line=rehearsalTurn(rehearsal,book()).line;if(d.faction==='rehearsal-sound')api.speak(plainJapanese(line.jp),button,{rate});else largeCard(line);}
   if(['rehearsal-next','rehearsal-prev'].includes(d.faction)&&rehearsal){const oldIndex=rehearsal.sceneIndex;if(moveRehearsal(rehearsal,d.faction==='rehearsal-next'?1:-1)){revealed=false;if(oldIndex!==rehearsal.sceneIndex){rememberScene(book(),rehearsal.sceneIds[rehearsal.sceneIndex]);api.changed();}refresh('#fr-title',true);}}
   if(d.faction==='clear'){query='';category='all';scope='all';replyOnly=false;refresh('#f-search');}
   if(d.faction==='clear-query'){query='';refresh('#f-search');}
   if(d.faction==='translation'){showChinese=!showChinese;refresh();}
   if(d.faction==='reply-only'){replyOnly=!replyOnly;refresh('[data-faction="reply-only"]');}
   if(d.faction==='go-reply'&&current&&selected().replyPractice){role='all';refresh('#f-replies-title');document.querySelector('.f-replies')?.scrollIntoView({block:'start'});}
   if(d.faction==='prompt'&&current&&selected().replyPractice){showPrompt=!showPrompt;refresh('[data-faction="prompt"]');}
   if(d.faction==='reply-reset'&&current){replyChoice=null;showPrompt=false;refresh('[data-fsound="practice:prompt"]');}
   if(d.faction==='reply-play'&&current){const p=resolveScene(selected(),selection).replyPractice,o=p?.options.find(o=>o.id===replyChoice);if(o)api.speak([p.prompt.jp,o.line.jp,o.reply.jp].map(plainJapanese),button,{rate});}
   if(d.faction==='play'&&current){const lines=resolveScene(selected(),selection).lines.filter(l=>role==='all'||l.role===role);api.speak(lines.map(l=>plainJapanese(l.jp)),button,{rate});}
   return true;
  }
 };
}
