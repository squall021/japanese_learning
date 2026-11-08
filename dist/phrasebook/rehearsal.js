import {scenes,slots} from './data.js';
import {resolveScene} from './model.js';
import {particleText as text} from '../particles/ui.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const rehearsalRoutes=[
 {id:'convenience',title:'走進便利商店',hint:'找商品 → 加熱便當 → 回答袋子需求',sceneIds:['shop-find','store-warm','shop-bag']},
 {id:'dining',title:'從入座到結帳',hint:'告知人數 → 點餐 → 結帳與付款',sceneIds:['food-party','food-order','food-bill']},
 {id:'transport',title:'在車站搭上電車',hint:'問買票位置 → 確認轉乘 → 找月台',sceneIds:['travel-ticket','travel-transfer','travel-platform']},
 {id:'sightseeing',title:'安排一次景點參觀',hint:'購買票券 → 確認入場 → 租借導覽',sceneIds:['ticket-count','ticket-entry','sight-audio']},
 {id:'hotel',title:'抵達住宿的第一天',hint:'辦理入住 → 詢問寄放 → 提出房間需求',sceneIds:['hotel-checkin','hotel-luggage','hotel-problem']},
 {id:'assistance',title:'旅途中求助與聯絡',hint:'描述遺失物 → 找交番 → 請人協助聯絡',sceneIds:['help-lost','help-police','connect-call']}
];
export function createRehearsal(sceneIds,title){
 if(!Array.isArray(sceneIds)||!sceneIds.length||sceneIds.length>scenes.length||new Set(sceneIds).size!==sceneIds.length||sceneIds.some(id=>!scenes.some(s=>s.id===id)))return null;
 return {sceneIds:[...sceneIds],title,sceneIndex:0,lineIndex:0,finished:false};
}
export function rehearsalTurn(session,book){
 const scene=resolveScene(scenes.find(s=>s.id===session.sceneIds[session.sceneIndex]),book.selections?.[session.sceneIds[session.sceneIndex]]||{});
 const total=session.sceneIds.reduce((n,id)=>n+scenes.find(s=>s.id===id).lines.length,0);
 const position=session.sceneIds.slice(0,session.sceneIndex).reduce((n,id)=>n+scenes.find(s=>s.id===id).lines.length,0)+session.lineIndex+1;
 return {scene,line:scene.lines[session.lineIndex],total,position};
}
export function moveRehearsal(session,direction){
 if(!session||session.finished||![1,-1].includes(direction))return false;
 const length=scenes.find(s=>s.id===session.sceneIds[session.sceneIndex]).lines.length;
 if(direction===1){
  if(session.lineIndex<length-1)session.lineIndex++;
  else if(session.sceneIndex<session.sceneIds.length-1){session.sceneIndex++;session.lineIndex=0;}
  else session.finished=true;
 }else{
  if(session.lineIndex>0)session.lineIndex--;
  else if(session.sceneIndex>0){session.sceneIndex--;session.lineIndex=scenes.find(s=>s.id===session.sceneIds[session.sceneIndex]).lines.length-1;}
  else return false;
 }
 return true;
}
export function slotPanel(scene,selection={}){
 return scene.slots.length?`<section class="f-slot-panel"><h2>換成你需要的說法</h2><p>選項會記住，之後回來或加入旅行小抄時也會沿用。</p><div class="f-slots">${scene.slots.map(key=>`<label>${slots[key].label}<select data-fslot="${key}" aria-label="${slots[key].label}">${slots[key].options.map(o=>`<option value="${o.id}" ${(selection[key]||slots[key].options[0].id)===o.id?'selected':''}>${esc(o.zh)}</option>`).join('')}</select></label>`).join('')}</div></section>`:'';
}
export function routePicker(){return `<section class="fr-route-section" aria-labelledby="fr-routes-title"><span class="eyebrow">ONE DAY, THREE SMALL CONVERSATIONS</span><h2 id="fr-routes-title" tabindex="-1">把三個小情境，連成一次生活演練。</h2><p>輪到你時先看中文提示，試著開口，再展開日文對照。可自由前後切換，自行練習，不錄音、不計分。</p><div class="fr-route-grid">${rehearsalRoutes.map(r=>`<button data-froute="${r.id}"><strong>${r.title}</strong><span>${r.hint}</span><small>開始3個情境的演練 ↗</small></button>`).join('')}</div><button class="secondary fr-route-close" data-faction="routes">收起演練路線</button></section>`;}
export function rehearsalView(session,book,{revealed=false,showChinese=true,rate=1}={}){
 if(session.finished)return `<section class="fr-finished"><span class="eyebrow">A LITTLE MORE CONFIDENT</span><h1 id="fr-title" tabindex="-1">這一次，你把話接下去了。</h1><p>已走完「${esc(session.title)}」的 ${session.sceneIds.length} 個情境。可以再練一次，或回到會話查用。</p><ul>${session.sceneIds.map(id=>`<li>${esc(scenes.find(s=>s.id===id).title)}</li>`).join('')}</ul><p class="fr-note">這次演練沒有發音評分或完成成績；可重聽示範，依自己的步調再練一次。</p><div class="fr-controls"><button class="primary" data-faction="rehearsal-restart">再練一次</button><button class="secondary" data-faction="rehearsal-exit">回到會話</button></div></section>`;
 const {scene,line,total,position}=rehearsalTurn(session,book),you=line.role==='you',last=position===total;
 return `<button class="back" data-faction="rehearsal-exit">← 離開演練，回到會話</button><div class="fr-heading"><span class="eyebrow">TAKE YOUR TURN</span><h1 id="fr-title" tabindex="-1">${esc(session.title)}</h1><p>第 ${session.sceneIndex+1} / ${session.sceneIds.length} 個情境 · ${esc(scene.title)}</p></div><div class="fr-progress"><span>第 ${position} / ${total} 句</span><progress value="${position}" max="${total}" aria-label="演練句子進度"></progress></div>
  <div class="fr-toolbar"><div class="f-speed" role="group" aria-label="演練播放速度">${[[1,'一般'],[.65,'慢速']].map(([v,label])=>`<button data-frate="${v}" aria-pressed="${rate===v}">${label}</button>`).join('')}</div><button class="secondary" data-faction="translation">${showChinese?'隱藏對方中文':'顯示對方中文'}</button></div>
  <section class="fr-turn fr-turn-${line.role}" aria-labelledby="fr-turn-title"><span class="eyebrow">${you?'YOUR TURN':'LISTEN TO THE OTHER PERSON'}</span><h2 id="fr-turn-title">${you?'輪到你，試著表達':'對方這樣說'}</h2>${you?`<p class="fr-cue">${esc(line.zh)}</p>${revealed?`<p class="f-jp" lang="ja">${text(line.jp)}</p>`:'<p class="fr-hidden">先試著說說看，再展開日文對照。</p>'}`:`<p class="f-jp" lang="ja">${text(line.jp)}</p>${showChinese?`<p class="f-zh">${esc(line.zh)}</p>`:''}`}<div class="f-line-actions"><button data-faction="rehearsal-sound">♪ ${you?'聽示範':'聽對方說'}</button>${you?`<button data-faction="rehearsal-reveal" aria-expanded="${revealed}">${revealed?'收起日文':'顯示日文對照'}</button>`:''}${!you||revealed?'<button data-faction="rehearsal-card">放大這句 ↗</button>':''}</div></section>
  <div class="fr-controls"><button class="secondary" data-faction="rehearsal-prev" ${position===1?'disabled':''}>← 上一句</button><button class="primary" data-faction="rehearsal-next">${last?'完成這次演練':you?'我說完了，下一句 →':'看下一句 →'}</button></div><p class="fr-note">自行開口後，按按鈕前進。可以隨時回上一句；離開後會重新開始這次演練。系統不錄音或評分。</p>
  ${slotPanel(scene,book.selections?.[scene.id])}${scene.note?`<p class="f-context-note">${esc(scene.note)}</p>`:''}`;
}
