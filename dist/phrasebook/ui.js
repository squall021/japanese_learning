import {categories,scenes,slots,helpPhrases,sources} from './data.js';
import {findScenes,resolveScene,rememberScene,toggleSaved} from './model.js';
import {particleText as text,plainJapanese} from '../particles/ui.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={bag:'M4 7h16l1 15H3ZM8 8V5a4 4 0 0 1 8 0v3',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7v6m-3-3h6',ticket:'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 7v2m0 3v1m0 3v1',cup:'M4 8h13v8a6 6 0 0 1-13 0Zm13 1h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3',home:'m3 10 9-7 9 7v11H3ZM9 21v-8h6v8',sign:'M12 2v21M3 5h14l4 4-4 4H3Z'};
const icon=name=>`<svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="${paths[name]||paths.sign}"/></svg>`;
const roleLabel=role=>role==='you'?'你可以說':'對方常說 · 聽懂即可';
export function createPhrasebook(api){
 let current=null,category='all',scope='all',query='',role='all',showChinese=true,rate=1,selection={};
 const book=()=>api.getState();
 const selected=()=>scenes.find(s=>s.id===current);
 const refresh=(focus,top=false)=>{api.render();if(focus)document.querySelector(focus)?.focus({preventScroll:true});if(top)window.scrollTo(0,0);};
 const saveButton=s=>`<button class="f-save ${book().saved.includes(s.id)?'is-saved':''}" data-fsave="${s.id}" aria-pressed="${book().saved.includes(s.id)}" aria-label="${book().saved.includes(s.id)?'取消收藏':'收藏'}：${esc(s.title)}">${book().saved.includes(s.id)?'★ 已收藏':'☆ 收藏'}</button>`;
 function cards(){
  const results=findScenes(query,category,scope,book());
  return `<div class="f-result-heading"><h2>${scope==='saved'?'我的會話收藏':scope==='recent'?'最近看過':'找一句，解決眼前的小事'}</h2><span role="status">${results.length} 個情境</span></div>${results.length?`<div class="f-scene-grid">${results.map(s=>{const cat=categories.find(c=>c.id===s.category),resolved=resolveScene(s),first=resolved.lines.find(l=>role==='all'?l.role==='you':l.role===role)||resolved.lines[0];return `<article class="f-scene-card"><div class="f-card-meta"><span>${cat.name}</span>${saveButton(s)}</div><button class="f-open" data-fopen="${s.id}"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><div class="f-preview"><small>${roleLabel(first.role)}</small><span lang="ja">${text(first.jp)}</span>${showChinese?`<span class="f-preview-zh">${esc(first.zh)}</span>`:''}</div><span class="f-card-link">看完整對話 <span aria-hidden="true">↗</span></span></button></article>`;}).join('')}</div>`:`<div class="f-empty"><h3>${scope==='saved'&&!book().saved.length?'還沒有收藏的會話':scope==='recent'&&!book().recent.length?'打開情境後，就能在這裡找回':'沒有找到符合的情境'}</h3><p>可以試試「袋子」「轉乘」「兒童票」等需求，或查看全部分類。</p><button class="secondary" data-faction="clear">查看全部情境</button></div>`}`;
 }
 function roleTabs(){return `<div class="f-role-tabs" role="group" aria-label="選擇會話角色">${[['all','雙方對話'],['you','我想說'],['staff','我可能聽到']].map(([id,label])=>`<button data-frole="${id}" aria-pressed="${role===id}">${label}</button>`).join('')}</div>`;}
 function overview(){return `<div class="f-heading"><span class="eyebrow">JAPANESE, WHEN YOU NEED IT</span><h1 id="f-title" tabindex="-1">在日本的每一天，<br>有一句話陪你。</h1><p>想買東西、找月台、辦入住？先選一個需求，聽聽雙方怎麼說。</p></div>
  <section class="f-search-panel"><label for="f-search">現在想做什麼？</label><div class="f-search-row"><span aria-hidden="true">⌕</span><input id="f-search" type="search" data-fsearch value="${esc(query)}" placeholder="搜尋袋子、月台、轉車、小孩票…" autocomplete="off"><button class="f-clear" data-faction="clear-query" aria-label="清除搜尋">×</button></div><div class="f-scopes" role="group" aria-label="會話清單">${[['all','全部會話'],['saved',`我的收藏 ${book().saved.length}`],['recent','最近看過']].map(([id,label])=>`<button data-fscope="${id}" aria-pressed="${scope===id}">${label}</button>`).join('')}</div></section>
  <section class="f-categories" aria-label="日常會話分類">${categories.map((c,i)=>`<button data-fcategory="${c.id}" aria-pressed="${category===c.id}" class="f-category f-color-${i%3}">${icon(c.icon)}<span><strong>${c.name}</strong><small>${c.hint}</small></span><em>6</em></button>`).join('')}</section>
  <div class="f-filter-row"><button class="${category==='all'?'f-active':'secondary'}" data-fcategory="all">全部分類</button>${roleTabs()}<button class="secondary" data-faction="translation" aria-pressed="${showChinese}">${showChinese?'隱藏中文':'顯示中文'}</button></div>
  <details class="f-help"><summary>聽不懂時，先用這幾句</summary><div class="f-help-grid">${helpPhrases.map((h,i)=>`<article><strong>${h.title}</strong><p lang="ja">${text(h.jp)}</p><p>${esc(h.zh)}</p><div class="f-line-actions"><button data-fhelp-sound="${i}" aria-label="播放：${h.title}">♪ 聽這句</button><button data-fhelp-card="${i}">放大出示 ↗</button></div></article>`).join('')}</div></details>
  <section id="f-results">${cards()}</section><details class="f-sources"><summary>關於這本日常會話</summary><p>六類、36個常見小情境，以雙方對話與替代說法編排。可自由查用，收藏與最近看過會隨學習資料一同備份。</p><p>語音沿用網站的日文合成聲音。工作人員的回覆是會話示例，現場說法可能不同；可用上方求助句請對方再說一次。</p><p>對話與中文由本站編寫，參考下列資源核對情境與表達。</p>${sources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</details>`;}
 const lineActions=(index,kind='line')=>`<div class="f-line-actions"><button data-fsound="${kind}:${index}" aria-label="播放第 ${index+1} 句">♪ 聽這句</button><button data-fcard="${kind}:${index}">放大這句 ↗</button></div>`;
 function detail(){
  const s=resolveScene(selected(),selection),cat=categories.find(c=>c.id===s.category);
  return `<button class="back" data-faction="back">← 回日常會話</button><div class="f-detail-heading"><div><span class="eyebrow">${cat.name} · EVERYDAY CONVERSATION</span><h1 id="f-title" tabindex="-1">${esc(s.title)}</h1><p>${esc(s.description)}</p></div>${saveButton(s)}</div>
   ${s.slots.length?`<section class="f-slot-panel"><h2>換成你需要的說法</h2><p>先選地點或數量，再播放或放大句子。</p><div class="f-slots">${s.slots.map(key=>`<label>${slots[key].label}<select data-fslot="${key}" aria-label="${slots[key].label}">${slots[key].options.map((o,i)=>`<option value="${o.id}" ${(selection[key]||slots[key].options[0].id)===o.id?'selected':''}>${esc(o.zh)}</option>`).join('')}</select></label>`).join('')}</div></section>`:''}
   ${s.note?`<p class="f-context-note">${esc(s.note)}</p>`:''}
   <div class="f-dialogue-toolbar">${roleTabs()}<div class="f-speed" role="group" aria-label="會話播放速度">${[[1,'一般'],[.65,'慢速']].map(([value,label])=>`<button data-frate="${value}" aria-pressed="${rate===value}">${label}</button>`).join('')}</div><button class="secondary" data-faction="translation">${showChinese?'隱藏中文':'顯示中文'}</button></div>
   <div class="f-play-row"><button class="primary" data-faction="play">♪ ${role==='all'?'播放整段對話':role==='you'?'播放我方句子':'播放對方句子'}</button><button class="secondary" data-faction="stop">停止播放</button></div>
   <section class="f-dialogue" aria-label="情境對話">${s.lines.map((l,i)=>role==='all'||l.role===role?`<article class="f-line f-line-${l.role}"><span class="f-speaker">${roleLabel(l.role)}</span><p class="f-jp" lang="ja">${text(l.jp)}</p>${showChinese?`<p class="f-zh">${esc(l.zh)}</p>`:''}${lineActions(i)}</article>`:'').join('')}</section>
   <section class="f-alternatives"><div class="f-result-heading"><h2>換個需求，也可以這樣說</h2></div>${s.alternatives.map((l,i)=>role==='all'||l.role===role?`<article class="f-alternative"><span class="f-speaker">${roleLabel(l.role)} · ${esc(l.label)}</span><p class="f-jp" lang="ja">${text(l.jp)}</p>${showChinese?`<p class="f-zh">${esc(l.zh)}</p>`:''}${lineActions(i,'alt')}</article>`:'').join('')||'<p class="muted">這個情境的替代說法放在「我想說」，可切換角色查看。</p>'}</section>
   <div class="f-detail-end"><p>需要時，再回來找這一句。</p><button class="secondary" data-faction="back">← 回日常會話</button></div>`;
 }
 function lineFor(value){if(!current)return null;const [kind,num]=value.split(':'),i=Number(num),s=resolveScene(selected(),selection);return Number.isInteger(i)&&i>=0?(kind==='line'?s.lines:kind==='alt'?s.alternatives:[])[i]||null:null;}
 function largeCard(line){api.stopSpeech();api.detail(`<div class="f-large-card"><span class="eyebrow">${line.role==='staff'?'對方常說':'請看這句日文'}</span><p lang="ja">${text(line.jp)}</p><strong>${esc(line.zh)}</strong><button class="primary" data-fmodal-sound="1" data-fmodal-text="${esc(plainJapanese(line.jp))}">♪ 播放這句</button><p class="f-large-note">可直接將畫面出示給對方。</p></div>`);}
 return {
  reset(){current=null;category='all';scope='all';query='';role='all';selection={};},
  renderPage(){return `<div class="phrasebook">${current?detail():overview()}</div>`;},
  input(target){if(target.dataset?.fsearch===undefined)return false;query=target.value;const result=document.querySelector('#f-results');if(result)result.innerHTML=cards();return true;},
  change(target){const key=target.dataset?.fslot;if(!key)return false;if(current&&selected().slots.includes(key)&&slots[key].options.some(o=>o.id===target.value)){selection[key]=target.value;api.stopSpeech();refresh(`[data-fslot="${key}"]`);}return true;},
  handle(button){
   const d=button.dataset;
   if(d.fopen){const s=scenes.find(s=>s.id===d.fopen);if(!s)return true;api.stopSpeech();api.navigate();current=s.id;selection={};rememberScene(book(),s.id);api.changed();refresh('#f-title',true);return true;}
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
   if(d.faction==='back'){current=null;refresh('#f-title',true);}
   if(d.faction==='clear'){query='';category='all';scope='all';refresh('#f-search');}
   if(d.faction==='clear-query'){query='';refresh('#f-search');}
   if(d.faction==='translation'){showChinese=!showChinese;refresh();}
   if(d.faction==='play'&&current){const lines=resolveScene(selected(),selection).lines.filter(l=>role==='all'||l.role===role);api.speak(lines.map(l=>plainJapanese(l.jp)),button,{rate});}
   return true;
  }
 };
}
