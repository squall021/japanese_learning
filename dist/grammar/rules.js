import {particleText as text,plainJapanese} from '../particles/ui.js';

// Reviewed forms and contexts. These guides do not conjugate arbitrary user input.
export const ruleModes={
  permission:{label:'詢問許可',form:'te',suffix:'もいいですか',base:'て形',lesson:'te-form',lessonNumber:10},
  avoid:{label:'請對方不要做',form:'nai',suffix:'でください',base:'ない形',lesson:'nai-form',lessonNumber:9},
  prohibition:{label:'說明禁止規則',form:'te',suffix:'はいけません',base:'て形',lesson:'te-form',lessonNumber:10}
};
export const ruleWords=[
  {id:'sit',jp:'{座|すわ}る',te:'{座|すわ}って',nai:'{座|すわ}らない',group:'g1',meaning:'坐',phrase:'ここに',action:'坐在這裡',scene:'seat',contexts:['你看到一張空椅子，想先確認可不可以坐。','這張椅子正在維修，工作人員請你不要坐。','教室規定這個保留座位不能坐。']},
  {id:'photo',jp:'{撮|と}る',te:'{撮|と}って',nai:'{撮|と}らない',group:'g1',meaning:'拍攝',phrase:'ここで{写真|しゃしん}を',action:'在這裡拍照',scene:'camera',contexts:['參觀展覽時，你想先問工作人員能不能拍照。','你準備拍照，工作人員請你先不要拍。','這個展區的規則是禁止拍照。']},
  {id:'drink',jp:'{飲|の}む',te:'{飲|の}んで',nai:'{飲|の}まない',group:'g1',meaning:'喝',phrase:'ここでお{茶|ちゃ}を',action:'在這裡喝茶',scene:'cup',contexts:['進入共用空間時，你先問能不能喝茶。','工作人員正在清理桌面，請你不要在這裡喝茶。','這間資料室的規則是禁止在這裡喝茶。']},
  {id:'enter',jp:'{入|はい}る',te:'{入|はい}って',nai:'{入|はい}らない',group:'g1',meaning:'進入',phrase:'この{部屋|へや}に',action:'進入這個房間',scene:'door',contexts:['你站在門外，先詢問能不能進入房間。','房間正在整理，工作人員請你不要進入。','這個房間是管制區，規則是不准進入。'],note:'「入る」是五段，ない形是入らない；不是一段。'},
  {id:'eat',jp:'{食|た}べる',te:'{食|た}べて',nai:'{食|た}べない',group:'g2',meaning:'吃',phrase:'ここでパンを',action:'在這裡吃麵包',scene:'cup',contexts:['你拿著麵包，詢問這個地方能不能用餐。','桌面還沒清理好，工作人員請你不要在這裡吃麵包。','這間資料室的規則是禁止在這裡吃麵包。']},
  {id:'borrow',jp:'{借|か}りる',te:'{借|か}りて',nai:'{借|か}りない',group:'g2',meaning:'借入',phrase:'この{本|ほん}を',action:'借這本書',scene:'book',contexts:['你在圖書室詢問這本書能不能借走。','這本書已經有人預約，管理員請你不要借走。','這本書只供館內閱讀，規定不能外借。']},
  {id:'do',jp:'する',te:'して',nai:'しない',group:'g3',meaning:'做',phrase:'ここでゲームを',action:'在這裡玩遊戲',scene:'game',contexts:['休息時間，你先詢問這個空間能不能玩遊戲。','旁邊有人需要專心，老師請你不要在這裡玩遊戲。','自習室規定不能在這裡玩遊戲。']},
  {id:'come',jp:'{来|く}る',te:'{来|き}て',nai:'{来|こ}ない',group:'g3',meaning:'來',phrase:'{明日|あした}ここに',action:'明天來這裡',scene:'door',contexts:['你想明天再來，先詢問對方是否允許。','對方明天不在，請你明天不要來這裡。','場地明天封閉，規定明天不能來這裡。'],note:'来る讀くる；来て讀きて，来ない讀こない。'}
];
export const ruleWord=id=>ruleWords.find(v=>v.id===id)||ruleWords[0];
export const ruleSentence=(v,mode)=>v.phrase+v[ruleModes[mode].form]+ruleModes[mode].suffix+'。';
export const ruleTranslation=(v,mode)=>mode==='permission'?'可以'+v.action+'嗎？':mode==='avoid'?'請不要'+v.action+'。':'不可以'+v.action+'。';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sound=s=>'<button class="g-sound" data-gsound="'+esc(plainJapanese(s))+'" aria-label="播放：'+esc(plainJapanese(s))+'">♪</button>';
const images={
  seat:'<path d="M47 26v43h67M47 51h63v21H47m7 0-5 30m53-30 8 30M110 29v22"/>',
  camera:'<path d="M30 42h27l10-13h27l10 13h26v54H30Z"/><circle cx="81" cy="68" r="19"/><path d="M112 52h6"/>',
  cup:'<path d="M41 46h65v29q0 26-32 26T41 75Zm65 9h9q26 0 7 27h-17M54 32q-9-9 0-18m20 18q-9-9 0-18"/>',
  door:'<path d="M44 102V20h69v82M32 103h94M55 102V30h45v72"/><circle cx="88" cy="65" r="2"/>',
  book:'<path d="M25 29q28-9 55 4 27-13 55-4v65q-28-10-55 3-27-13-55-3ZM80 33v64M40 48h23m-23 15h23m34-15h23m-23 15h23"/>',
  game:'<path d="M45 39h69q15 2 21 42 1 16-13 10l-21-15H59L37 92q-12 4-10-12 5-39 18-41ZM53 49v21m-11-10h22"/><circle cx="108" cy="54" r="3"/><circle cx="119" cy="66" r="3"/>'
};
function illustration(v,intent){
  const badge=intent==='permission'?'<circle cx="126" cy="23" r="17" fill="#e6efdf"/><text x="126" y="29" text-anchor="middle" fill="#446d4a" font-size="23" stroke="none">?</text>':intent==='avoid'?'<path d="M115 5h35v26h-13l-9 9v-9h-13Z" fill="#f2e4d1"/><path d="M126 13v10m7-10v10m7-10v10"/>':'<circle cx="128" cy="24" r="18" fill="#f7e7df"/><path d="m115 11 26 26" stroke="#a16d59" stroke-width="4"/>';
  return '<svg class="g-verb-illustration g-rule-illustration" viewBox="0 0 160 120" fill="none" aria-hidden="true"><circle cx="78" cy="63" r="51" fill="#edf1e4"/><g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'+images[v.scene]+badge+'</g></svg>';
}
const box=(label,value)=>'<div><small>'+label+'</small><span lang="ja">'+text(value)+'</span></div>';
export function ruleGuide(mode,wordId,step,intent=mode){
  const v=ruleWord(wordId),m=ruleModes[mode],selected=Object.hasOwn(ruleModes,intent)?intent:mode,form=v[m.form];
  const titles=['先看動詞','接上句型','比較說話目的'];
  let body;
  if(step===0)body='<div class="g-word-intro"><div><span class="g-guide-caption">辭書形 · 原本的動詞</span><p lang="ja">'+text(v.jp)+sound(v.jp)+'</p></div><div><span class="g-guide-caption">這次要說的動作</span><strong>'+v.action+'</strong><p>'+({g1:'五段動詞',g2:'一段動詞',g3:'不規則動詞'})[v.group]+' · '+v.meaning+'</p></div></div>';
  else if(step===1)body='<p class="g-guide-rule">'+(mode==='avoid'?'先做ない形，保留整個「ない」，再加「でください」。':'先做て形，再接「'+m.suffix+'」。以「で」結尾的て形，也直接往後接。')+'</p><div class="g-change-diagram">'+box('① 原本的動詞',v.jp)+'<b aria-hidden="true">→</b>'+box('② 先變'+m.base,form)+'<b aria-hidden="true">→</b>'+box('③ 接上'+m.suffix,form+m.suffix)+'</div><p class="g-small-note">'+(mode==='permission'?'有「か」是在詢問許可；去掉「か」的「てもいいです」是在表示允許。':mode==='avoid'?'「飲まない＋でください」是「飲まないでください」。不要改成「飲んでください」，那會變成請對方喝。':'「飲んで＋はいけません」是「飲んではいけません」。這裡的「は」讀わ。')+'</p>';
  else{
    const sentence=ruleSentence(v,selected),index=Object.keys(ruleModes).indexOf(selected);
    body='<div class="g-intent-comparison"><h3>同一個動作，換個目的說</h3><p class="g-small-note">點選目的，看看句型和情境如何改變。</p><div class="g-intent-tabs" role="group" aria-label="比較說話目的">'+Object.entries(ruleModes).map(([id,r])=>'<button data-gintent="'+id+'" aria-pressed="'+(id===selected)+'">'+r.label+'</button>').join('')+'</div><div class="g-intent-scene '+selected+'">'+illustration(v,selected)+'<div><span class="g-intent-label">'+ruleModes[selected].label+'</span><p>'+v.contexts[index]+'</p></div></div><div class="g-guide-sentence"><p lang="ja">'+text(sentence)+sound(sentence)+'</p><strong>'+ruleTranslation(v,selected)+'</strong></div>';
    if(selected==='permission')body+='<div class="g-permission-replies"><div><small>對方允許時，可以回答</small><p lang="ja">はい、'+text(v.te+'もいいです。')+sound('はい、'+v.te+'もいいです。')+'</p><span>可以，允許做這件事。</span></div><div><small>對方不允許時，一種說法是</small><p lang="ja">すみません、'+text(v.nai+'でください。')+sound('すみません、'+v.nai+'でください。')+'</p><span>不好意思，請不要做這件事。</span></div></div><p class="g-small-note">問句本身不代表已獲得許可，要聽完對方的回答。</p>';
    body+='<p class="g-small-note">「ないでください」也能用於提醒或指示；「てはいけません」是較明確、較強的禁止。實際用法會重疊，請一起看目的、對象與場合。</p></div>';
  }
  return '<section class="g-verb-guide g-rules-guide" aria-labelledby="g-guide-title"><div class="g-guide-heading"><div><span class="eyebrow">ONE ACTION, DIFFERENT INTENTIONS</span><h2 id="g-guide-title">'+m.label+'，一步一步說</h2><p>選個動作，先看接法，再比較生活情境。</p></div>'+illustration(v,mode)+'</div><div class="g-guide-groups" role="group" aria-label="選擇動詞類別">'+[['g1','五段動詞（1 類）'],['g2','一段動詞（2 類）'],['g3','不規則動詞（3 類）']].map(([id,label])=>'<button data-gvgroup="'+id+'" aria-pressed="'+(id===v.group)+'">'+label+'</button>').join('')+'</div><div class="g-guide-words" role="group" aria-label="選擇圖解動詞">'+ruleWords.filter(w=>w.group===v.group).map(w=>'<button data-gvword="'+w.id+'" aria-pressed="'+(w.id===v.id)+'" aria-label="圖解：'+esc(plainJapanese(w.jp))+'">'+text(w.jp)+'</button>').join('')+'</div><div class="g-guide-steps" role="group" aria-label="圖解步驟">'+titles.map((t,i)=>'<button data-gvstep="'+i+'" aria-pressed="'+(i===step)+'"><span>'+(i+1)+'</span>'+t+'</button>').join('')+'</div><div class="g-verb-reveal" role="region" aria-label="動詞變化圖說">'+body+'</div>'+(v.note?'<p class="g-verb-exception"><strong>這個單字，另外留意一下</strong>'+v.note+'</p>':'')+'<div class="g-guide-controls"><button class="secondary" data-gvstep="'+Math.max(0,step-1)+'" '+(step===0?'disabled':'')+'>← 上一步</button><span>'+(step+1)+' / 3</span><button class="primary" data-gvstep="'+Math.min(2,step+1)+'" '+(step===2?'disabled':'')+'>'+titles[Math.min(2,step+1)]+' →</button></div><p class="g-guide-back"><button class="secondary" data-glesson="'+m.lesson+'">回看第 '+m.lessonNumber+' 課'+m.base+'圖解 →</button></p></section>';
}
