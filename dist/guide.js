const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const destination=(kind,id,label)=>({kind,id,label});
const nav=(id,label)=>destination('nav',id,label);
const grammar=(id,label)=>destination('glesson',id,label);
const particle=(id,label)=>destination('plesson',id,label);

export const guidePaths=[
 {id:'beginner',symbol:'あ',title:'日文初學者',summary:'從聲音與假名開始，一次學一點。',intro:'還不會讀日文也沒關係。先認識假名的聲音，再試著看懂一句簡單的日文。',
  steps:[
   {title:'先聽，再認識五十音',body:'進入五十音，先從平假名的一行開始。點字卡聽發音，再用聽音測驗確認；熟悉後再換片假名。',target:nav('kana','開始認識五十音')},
   {title:'想記住字形，就加一點手寫',body:'點開想練的假名字卡，選「手寫練習」。先看逐筆動畫，再描寫，最後試著自由書寫；可以直接選字，不必每次從あ開始。',target:nav('kana','選一個假名練手寫')},
   {title:'用第一句話介紹自己',body:'從文法第1課的「です」認識簡單句子，再看助詞「は」怎麼帶出話題。例句可點擊拆解，也能聽整句。',target:grammar('statement','前往文法第1課'),extra:particle('wa','看看助詞「は」')}
  ],rhythm:[['3分鐘','聽一行假名'],['3分鐘','練一兩個字形'],['4分鐘','看一句例句']],next:'能認出常見假名後，可以切換到「已熟悉五十音」路線，開始句子與助詞。'},
 {id:'kana-ready',symbol:'文',title:'已熟悉五十音',summary:'從短句、助詞到生活情境。',intro:'讀得出假名，接下來試著把詞語連成句子。課程可自由選，不需要重做五十音。',
  steps:[
   {title:'先建立簡單句子的骨架',body:'建議依序看文法第1～6課：名詞句、否定、疑問、動詞禮貌句、過去與形容詞。已經會的內容可以略過，從不熟的地方開始。',target:grammar('statement','從文法第1課開始'),extra:nav('grammar','自行選擇文法課')},
   {title:'搭配助詞，弄清楚詞語的關係',body:'從「は、を、の、も」開始，再比較場所、方向與「は／が」。先看情境例句，再做單課練習；想換句子時可試變化練習。',target:particle('wa','從助詞「は」開始'),extra:nav('particles','查看全部助詞課')},
   {title:'把學過的句子放回生活',body:'在情境課程中聽對話、看拆句，再完成練習。遇到不熟的文法，可從題目回饋回看對應課程。動詞變化想補強時，從第7課的分類圖解開始。',target:nav('courses','選一堂情境課程'),extra:grammar('verb-groups','看看動詞分類圖解')}
  ],rhythm:[['4分鐘','理解一個句型'],['4分鐘','做幾題助詞或文法'],['2分鐘','聽一段生活對話']],next:'不必一次做完所有分類。先選一個能用上的句型，再到情境課程練習。'},
 {id:'grammar',symbol:'組',title:'想加強文法',summary:'找出不熟的接法，理解後再練習。',intro:'已經學過一些日文，可以依弱點選課，用圖解、拆句與練習把容易混淆的地方整理清楚。',
  steps:[
   {title:'依目前的問題選一堂課',body:'第1～6課建立基本句子；第7～18課整理動詞分類、活用與常用句型；第19～27課加入位置、疑問、時間、原因、比較與先後。',target:nav('grammar','查看文法課程地圖'),extra:grammar('verb-groups','從動詞分類補強')},
   {title:'先看懂變化，再親手組句',body:'在單課裡點例句查看詞語用途，有圖解的課可切換動詞或情境。接著做選答、組句或變換練習；答錯時閱讀解析，再比較完整答案。',target:grammar('te-form','試看て形圖解'),extra:nav('particles','容易混淆助詞？到這裡比較')},
   {title:'用綜合練習與易錯複習確認',body:'文法專區的「綜合練習」會跨課抽題；「易錯與到期概念」會依作答安排複習。助詞的變化練習與用法複習在助詞專區，想練實際運用則到情境課程。',target:nav('grammar','前往文法練習與複習'),extra:nav('courses','到情境課程練運用')}
  ],rhythm:[['3分鐘','回看一個易錯概念'],['5分鐘','完成一組單課練習'],['2分鐘','聽懂例句再說一次']],next:'課程完成表示已完成該課練習。可以重做並閱讀回饋，讓容易混淆的用法逐漸清楚。'},
 {id:'travel',symbol:'旅',title:'旅行時想直接用日文',summary:'依需求找句子，聽懂也能出示。',intro:'想買東西、問月台或辦入住，可以直接從日常會話查用，隨時回來找需要的句子。',
  steps:[
   {title:'用需求搜尋一句話',body:'進入日常會話，選擇購物、交通、寄件、連網或遺失求助等分類，也可直接搜尋「袋子」「月台」「寄件」等需求。',target:nav('phrasebook','打開日常會話')},
   {title:'分清楚自己說的、對方說的',body:'切換「我想說」或「我可能聽到」，聽單句或整段對話。相關情境可替換地點、票數等選項，再放大句子給對方看。實際月台與營業規定等請向現場確認。',target:nav('phrasebook','找一個情境試試')},
   {title:'先收藏，再練熟常用情境',body:'常用情境可收藏，最近看過也能快速找回。標示「可練接話」的情境可先聽問句，再依需求選回答；聽不懂時也能使用四句求助語。想進一步學習與作答，再選情境課程。',target:nav('phrasebook','整理常用會話'),extra:nav('courses','想多練一點？看情境課程')}
  ],rhythm:[['3分鐘','找一個旅行需求'],['4分鐘','聽雙方對話'],['3分鐘','換選項並練說一句']],next:'日常會話以查用為主；情境課程則帶你學習、練習與作答。兩種方式可以搭配使用。'}
];

export const guideFeatures=[
 {title:'五十音與手寫',body:'點假名字卡聽音、做聽音測驗；基本平假名與片假名可看筆順、描寫和自由書寫。',target:nav('kana','前往五十音')},
 {title:'助詞練習',body:'理解詞語之間的關係，做單課、混合或變化練習；在這個專區複習易錯與到期用法。',target:nav('particles','前往助詞練習')},
 {title:'基礎文法',body:'用拆句和圖解理解接法，再做選答、組句與變換；文法概念的綜合與易錯複習也在這裡。',target:nav('grammar','前往基礎文法')},
 {title:'情境課程',body:'跟著生活對話學詞語與句型，再完成選答、聽力或輸入練習，把文法放進生活。',target:nav('courses','前往情境課程')},
 {title:'日常會話',body:'依生活需求查句子，看雙方對話、替換選項、收藏或放大出示。適合需要時快速查用。',target:nav('phrasebook','前往日常會話')},
 {title:'每日複習',body:'複習從情境課程加入的詞語卡，依記憶情況安排下次出現時間。助詞與文法請回各自專區複習。',target:nav('review','前往詞語複習')}
];

export const guideQuestions=[
 ['漢字讀不出來，怎麼辦？','用頁首的「振假名」切換全部顯示、需要時顯示或全部隱藏。選「需要時顯示」後，點有標音的漢字即可查看讀音。初學時可先全部顯示。'],
 ['點播放後沒有聲音？','先確認裝置音量，再到「我的學習」選日文聲音並試聽。合成聲音由裝置提供；若沒有日文聲音，可安裝系統日文語音或改用其他支援的瀏覽器。'],
 ['手寫會判斷我寫得正不正確嗎？','目前提供筆順動畫、描寫、自由書寫與筆跡對照，記錄練習次數。可搭配範本自行觀察字形；沒有字形正確度評分。'],
 ['練習做到一半離開，會接著同一題嗎？','作答紀錄會保存；助詞、文法與情境題組離開後可能重新開始，不保證接續原題。文法與助詞有各自的複習區；每日複習主要是詞語卡。'],
 ['進度存在哪裡？換手機怎麼辦？','進度保存在目前瀏覽器，沒有帳戶或自動跨裝置同步。到「我的學習」匯出進度，在另一台裝置匯入；清除瀏覽資料前也建議先備份。']
];

function action(target,cls='secondary'){
 return `<button class="${cls}" data-${target.kind}="${target.id}">${escape(target.label)} <span aria-hidden="true">↗</span></button>`;
}
function pathButton(path,current,home=false){
 return `<button class="lg-path ${home?'lg-path-home':''}" data-guide-path="${path.id}" ${home?'':`aria-pressed="${current===path.id}" aria-controls="lg-route"`}><span class="lg-symbol" aria-hidden="true">${path.symbol}</span><span><strong>${path.title}</strong><small>${path.summary}</small></span><span class="lg-path-arrow" aria-hidden="true">${home?'↗':current===path.id?'✓':'→'}</span></button>`;
}

export function hasLearningHistory(state){
 const positiveRecords=records=>Object.values(records||{}).some(p=>p&&(p.complete||p.attempts>0||p.trace>0||p.free>0));
 return Object.keys(state.progress||{}).length>0||Object.keys(state.cards||{}).length>0||Object.values(state.kana||{}).some(Boolean)||
  positiveRecords(state.writing)||positiveRecords(state.particles?.lessons)||positiveRecords(state.particles?.skills)||positiveRecords(state.grammar?.lessons)||positiveRecords(state.grammar?.skills)||
  Object.values(state.activity||{}).some(n=>n>0)||(state.saved?.length||0)>0||(state.phrasebook?.saved?.length||0)>0||(state.phrasebook?.recent?.length||0)>0;
}

export function homeGuide(state){
 if(hasLearningHistory(state))return `<section class="lg-returning" aria-label="使用指南"><div><strong>想換個學習方向？</strong><p>依程度找起點，也看看各專區怎麼搭配。</p></div><button class="secondary" data-nav="guide">查看使用指南 ↗</button></section>`;
 return `<section class="lg-welcome" aria-labelledby="lg-welcome-title"><div class="lg-welcome-heading"><div><span class="eyebrow">WELCOME TO HIYORI</span><h2 id="lg-welcome-title">第一次來？從適合你的地方開始。</h2><p>選一個最接近現在的你，看看建議順序與怎麼使用。</p></div><button class="text-link" data-nav="guide">完整使用指南 ↗</button></div><div class="lg-paths lg-home-paths">${guidePaths.map(p=>pathButton(p,'',true)).join('')}</div></section>`;
}

export function learningGuide(selected='beginner'){
 const path=guidePaths.find(p=>p.id===selected)||guidePaths[0];
 return `<div class="learning-guide"><div class="lg-heading"><span class="eyebrow">FIND YOUR STARTING POINT</span><h1 id="lg-title" tabindex="-1">從現在的你，開始學日文。</h1><p>先選程度或想做的事，跟著建議走一小段。你可以隨時換路線，也能自由選課。</p></div>
  <section aria-label="依程度或目標選擇學習路線"><div class="lg-paths">${guidePaths.map(p=>pathButton(p,path.id)).join('')}</div></section>
  <section id="lg-route" class="lg-route" aria-labelledby="lg-route-title"><div class="lg-route-heading"><span class="lg-symbol" aria-hidden="true">${path.symbol}</span><div><span class="eyebrow">YOUR LEARNING ROUTE</span><h2 id="lg-route-title" tabindex="-1">${path.title}，可以這樣開始</h2><p>${path.intro}</p></div></div>
   <ol class="lg-steps">${path.steps.map((s,i)=>`<li><span class="lg-step-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><h3>${s.title}</h3><p>${s.body}</p><div class="lg-actions">${action(s.target,i===0?'primary':'secondary')}${s.extra?action(s.extra,'text-link'):''}</div></div></li>`).join('')}</ol>
   <div class="lg-rhythm"><h3>今天先留10分鐘就好</h3><p>這是一種時間分配示例，可以依自己的步調調整。</p><div>${path.rhythm.map(([time,task])=>`<span><strong>${time}</strong>${task}</span>`).join('')}</div></div><p class="lg-next">${path.next}</p>
  </section>
  <section class="lg-feature-section" aria-labelledby="lg-features-title"><div class="section-title"><h2 id="lg-features-title">每個專區，可以幫你什麼？</h2></div><div class="lg-feature-grid">${guideFeatures.map(f=>`<article><h3>${f.title}</h3><p>${f.body}</p>${action(f.target,'text-link')}</article>`).join('')}</div></section>
  <section class="lg-questions" aria-labelledby="lg-questions-title"><div class="section-title"><h2 id="lg-questions-title">第一次使用，可能會想知道</h2></div>${guideQuestions.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>
  <section class="lg-backup"><div><h2>把學過的，安心留下來。</h2><p>語音選擇、每日目標，以及進度匯出／匯入，都在「我的學習」。</p></div>${action(nav('mine','前往我的學習'))}</section>
 </div>`;
}
