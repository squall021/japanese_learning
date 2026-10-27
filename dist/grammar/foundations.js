import {particleText as text,plainJapanese} from '../particles/ui.js';
const card=(label,jp,zh,note,visual,extra={})=>({label,jp,zh,note,visual,...extra});
export const foundationDecks={
  existence:{title:'看位置，也看句子在說什麼',intro:'點選房間裡的物品、動物或人物。每張圖都能對照完整句子。',cards:[
    card('桌上的書','{机|つくえ}の{上|うえ}に{本|ほん}があります。','桌上有書。','書是物品，用あります。机の上是位置，用に連接。','book'),
    card('椅下的貓','{猫|ねこ}はいすの{下|した}にいます。','貓在椅子下面。','貓是動物，用います。已知道在找貓，可先用猫は提出話題。','cat'),
    card('圖書館裡的人','{田中|たなか}さんは{図書館|としょかん}にいます。','田中在圖書館。','這裡只說人在哪裡：場所＋に＋います。','person'),
    card('公園裡的樹','{公園|こうえん}に{木|き}があります。','公園裡有樹。','樹雖然是生物，基本存在句仍用あります。','tree'),
    card('同一地點，換成動作','{田中|たなか}さんは{図書館|としょかん}で{勉強|べんきょう}します。','田中在圖書館讀書。','同一個場所，現在說的是「做什麼」：動作場所用で。','study')
  ]},
  demonstratives:{title:'站在說話者的位置，看看距離',intro:'「我」是正在說話的人，「你」是聽話的人。這裡只比較眼前物品的位置。',cards:[
    card('靠近我：これ','これは{本|ほん}です。','這個是書。','これ可以自己指物品，後面直接接は。','pointer',{zone:0}),
    card('靠近你：それ','それは{本|ほん}です。','你那邊那個是書。','物品在聽話者身邊，這個空間情境用それ。','pointer',{zone:1}),
    card('離雙方遠：あれ','あれは{本|ほん}です。','遠處那個是書。','書離說話者與聽話者都遠，使用あれ。','pointer',{zone:2}),
    card('靠近我：この本','この{本|ほん}は{私|わたし}の{本|ほん}です。','這本書是我的書。','この不能自己指物，先接本，形成この本，再接は。','pointer',{zone:0}),
    card('靠近你：その本','その{本|ほん}は{田中|たなか}さんの{本|ほん}です。','你那邊那本書是田中的書。','その＋本，合起來是「那本書」。','pointer',{zone:1}),
    card('離雙方遠：あの本','あの{本|ほん}は{田中|たなか}さんの{本|ほん}です。','遠處那本書是田中的書。','あの後面也需要名詞；不要直接接成あのは。','pointer',{zone:2})
  ]},
  interrogatives:{title:'把缺少的資訊，換成一個問題',intro:'同一場聚會，缺的可能是人、物、場所或時間。點選要問的資訊。',cards:[
    card('不知道是誰','{誰|だれ}が{来|き}ますか。','誰會來？','想問人，用誰。回答要補上具體的人，而不是只說はい。','info',{missing:0,reply:'{田中|たなか}さんが{来|き}ます。'}),
    card('不知道帶什麼','{何|なに}を{持|も}って{行|い}きますか。','要帶什麼去？','想問東西，用何。帶的對象後面仍用を，這裡的何讀なに。','info',{missing:1,reply:'お{茶|ちゃ}を{持|も}って{行|い}きます。'}),
    card('不知道在哪裡','どこで{会|あ}いますか。','在哪裡見面？','想問見面地點，用どこ。見面是動作，場所後用で。','info',{missing:2,reply:'{駅|えき}で{会|あ}います。'}),
    card('不知道何時','いつ{会|あ}いますか。','什麼時候見面？','想問時間，用いつ。本句不在いつ後加に。','info',{missing:3,reply:'{明日|あした}{会|あ}います。'})
  ]},
  'state-past':{title:'先認類別，再把描述移到昨天',intro:'選一個詞，看現在、過去肯定與過去否定。句尾不能用同一條規則全部替換。',cards:[
    card('名詞：學生','{去年|きょねん}は{学生|がくせい}でした。','去年是學生。','名詞用でした；過去否定也可用じゃなかったです、ではなかったです。','past',{now:'{学生|がくせい}です',past:'{学生|がくせい}でした',negative:'{学生|がくせい}じゃありませんでした',route:'名詞 → でした／じゃありませんでした'}),
    card('な形容詞：安靜','{昨日|きのう}の{店|みせ}は{静|しず}かでした。','昨天的店很安靜。','な形容詞敘述過去與名詞同類，不在でした前加な。','past',{now:'{静|しず}かです',past:'{静|しず}かでした',negative:'{静|しず}かじゃありませんでした',route:'な形容詞 → でした／じゃありませんでした'}),
    card('い形容詞：熱','{昨日|きのう}は{暑|あつ}かったです。','昨天很熱。','暑い的い換成かった。過去否定也可說暑くありませんでした。','past',{now:'{暑|あつ}いです',past:'{暑|あつ}かったです',negative:'{暑|あつ}くなかったです',route:'い → かったです／くなかったです'}),
    card('い形容詞：好吃','{昨日|きのう}のケーキはおいしかったです。','昨天的蛋糕很好吃。','おいしい最後的い拿掉，保留おいし，再接かったです或くなかったです。','past',{now:'おいしいです',past:'おいしかったです',negative:'おいしくなかったです',route:'おいし ＋ かったです／くなかったです'}),
    card('特例：いい','{昨日|きのう}の{天気|てんき}はよかったです。','昨天的天氣很好。','いい變化時用よい的路線；不說いかったです。','past',{now:'いいです',past:'よかったです',negative:'よくなかったです',route:'いい → よかったです／よくなかったです'})
  ]},
  preferences:{title:'心裡喜不喜歡，和做得好不好',intro:'喜好與擅長程度是兩條不同的軸。選個詞，先看它在描述哪一件事。',cards:[
    card('好き：喜歡','{私|わたし}は{料理|りょうり}が{好|す}きです。','我喜歡做菜。','好き說喜好，不保證一定做得好。對象後用が。','heart',{caption:'心情：喜歡'}),
    card('嫌い：不喜歡','{魚|さかな}が{嫌|きら}いです。','不喜歡魚。','嫌い也是な形容詞。對人直接表達可能太強，可先學あまり好きじゃないです。','heart',{caption:'心情：不喜歡',negative:true}),
    card('上手：擅長','{田中|たなか}さんは{歌|うた}が{上手|じょうず}です。','田中很擅長唱歌。','上手說做得好，常用來稱讚別人。不能僅憑這句判定田中喜不喜歡。','skill',{caption:'熟練程度：擅長'}),
    card('下手：不擅長','{私|わたし}は{歌|うた}が{下手|へた}です。','我不擅長唱歌。','下手說不擅長，不代表討厭。談自己的弱項也常說苦手です。','skill',{caption:'熟練程度：不擅長',negative:true})
  ]},
  'time-frequency':{title:'時間點、時間範圍、出現頻率',intro:'看時鐘與作息卡，分辨是在說幾點、從何時到何時，還是常不常做。',cards:[
    card('幾點：七時に','{毎朝|まいあさ}{七時|しちじ}に{起|お}きます。','每天早上七點起床。','毎朝通常不接に；七時是明確時刻，用に標示。七時是七點，七時間才是七小時。','clock'),
    card('範圍：から／まで','{授業|じゅぎょう}は{九時|くじ}から{十時|じゅうじ}までです。','課程從九點到十點。','から標記起點，まで標記終點。可以只說九時からです，或十時までです。','range'),
    card('常常：よく','よく{図書館|としょかん}に{行|い}きます。','常常去圖書館。','よく表示常常；ときどき是有時。這些頻率詞不等於精確的百分比。','frequency',{caption:'よく ＋ 肯定：常常',dots:5}),
    card('不太：あまり＋否定','{朝|あさ}ごはんはあまり{食|た}べません。','不太常吃早餐。','本課用あまり＋否定表達不太常；ぜんぜん＋否定則是完全不。','frequency',{caption:'あまり ＋ 否定：不太常',dots:1}),
    card('每天：毎日','{毎日|まいにち}{本|ほん}を{読|よ}みます。','每天讀書。','毎日、毎朝、今日、明日、いつ通常直接用，不需要加時間助詞に。','frequency',{caption:'毎日：每一天',dots:7})
  ]}
};
const svg=(body,label)=>`<svg class="g-foundation-svg" viewBox="0 0 420 220" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const label=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="currentColor" stroke="none" font-size="16" font-family="sans-serif">${s}</text>`;
const person=(x,y,name)=>`<circle cx="${x}" cy="${y}" r="15"/><path d="M${x-24} ${y+60}v-23a24 24 0 0 1 48 0v23M${x} ${y+16}v44"/>${label(x,y+87,name)}`;
const book=(x,y)=>`<path d="M${x-24} ${y-16}q12-9 24 0q12-9 24 0v37q-12-9-24 0q-12-9-24 0zM${x} ${y-16}v37"/>`;
function illustration(c){
  if(c.visual==='pointer')return svg(`<rect x="${[12,150,288][c.zone]}" y="20" width="120" height="175" rx="18" fill="#e4edd9" stroke-dasharray="5 6"/>${person(72,70,'我（說話者）')}${person(210,70,'你（聽話者）')}${book([100,238,350][c.zone],40)}${label(350,155,'離雙方都遠')}`,`${c.label}；書的位置以虛線區域標出`);
  if(c.visual==='book')return svg(`<path d="M80 120h260M95 120v65M325 120v65"/>${book(210,91)}${label(210,35,'書：桌子的上面')}${label(210,213,'物品 → あります')}`,'一本書放在桌子上方');
  if(c.visual==='cat')return svg(`<path d="M150 48v70h120V48M150 118v73M270 118v73"/><path d="M182 173v-21l12 8q16-7 32 0l12-8v21q-28 28-56 0zM238 180q40 8 33-20"/>${label(210,28,'貓：椅子的下面')}${label(210,216,'動物 → います')}`,'一隻貓在椅子下方');
  if(c.visual==='tree')return svg(`<rect x="50" y="46" width="320" height="150" rx="30" stroke-dasharray="5 6"/><path d="M210 178v-65M210 66q-48-14-47 29q-48 35 0 50q12 25 47 5q35 20 47-5q48-15 0-50q1-43-47-29z"/>${label(210,28,'公園裡的樹')}${label(210,218,'植物 → あります')}`,'樹木位於公園內，植物用あります');
  if(c.visual==='person'||c.visual==='study')return svg(`<rect x="60" y="38" width="300" height="160" rx="12"/>${label(210,25,'圖書館')}${person(210,82,'田中')}${c.visual==='study'?book(280,113):''}${label(210,218,c.visual==='study'?'做事的場所 → で':'所在的位置 → に')}`,c.visual==='study'?'田中在圖書館讀書，動作場所用で':'田中位於圖書館內，所在位置用に');
  if(c.visual==='clock')return svg(`<circle cx="210" cy="105" r="76"/>${[12,3,6,9].map((n,i)=>label([210,270,210,150][i],[53,111,171,111][i],n)).join('')}<path d="M210 105V68M210 105l-26 37"/>${label(210,214,'07:00 → 七時に')}`,'時鐘顯示七點整');
  if(c.visual==='range')return svg(`<path d="M65 100h290M345 90l12 10-12 10"/><circle cx="85" cy="100" r="8" fill="currentColor"/><circle cx="335" cy="100" r="8" fill="currentColor"/>${label(85,65,'九時から')}${label(335,65,'十時まで')}${label(210,155,'起點 → 課程 → 終點')}`,'課程從九點開始，十點結束');
  if(c.visual==='frequency')return svg(`${Array.from({length:7},(_,i)=>`<rect x="${25+i*54}" y="70" width="43" height="54" rx="7" ${i<c.dots?'fill="#d6e4c7"':''}/>${label(46+i*54,105,i<c.dots?'✓':'·')}`).join('')}${label(210,165,c.caption)}${label(210,205,'示意圖；不表示固定出現比例')}`,c.caption+'，七格作息示意，不是精確比例');
  return svg(c.visual==='heart'?`<path d="M210 165l-66-61q-30-50 19-55q32-5 47 28q15-33 47-28q49 5 19 55z"/>${c.negative?'<path d="M147 50l126 121"/>':''}${label(210,211,c.caption)}`:`<path d="M150 138v-27M180 138V88M210 138V66M240 138V44M138 148h115"/>${c.negative?'<path d="M145 50l111 110"/>':''}${label(210,205,c.caption)}`,c.caption);
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sound=jp=>`<button class="g-sound" data-gsound="${esc(plainJapanese(jp))}" aria-label="播放：${esc(plainJapanese(jp))}">♪</button>`;
export function foundationGuide(id,index=0){
  const deck=foundationDecks[id];if(!deck)return '';const active=Number.isInteger(index)&&deck.cards[index]?index:0,c=deck.cards[active];
  let visual;
  if(c.visual==='info')visual=`<div class="g-info-card"><span class="eyebrow">聚會資訊卡</span>${[['誰','田中'],['帶什麼','茶'],['在哪裡','車站'],['何時','明天']].map(([k,v],i)=>`<div class="${i===c.missing?'missing':''}"><span>${k}</span><strong>${i===c.missing?'？':v}</strong></div>`).join('')}</div>`;
  else if(c.visual==='past')visual=`<div class="g-past-card"><div><span>現在的描述</span><p lang="ja">${text(c.now)}</p></div><b aria-hidden="true">↓</b><div><span>移到過去・肯定</span><p lang="ja">${text(c.past)}</p></div><div><span>移到過去・否定</span><p lang="ja">${text(c.negative)}</p></div></div>`;
  else visual=illustration(c);
  return `<section class="g-foundation-guide" aria-label="生活句型互動圖解"><div class="g-guide-heading"><div><span class="eyebrow">SEE IT, SAY IT</span><h2>${deck.title}</h2><p>${deck.intro}</p></div></div><div class="g-foundation-tabs" role="group" aria-label="切換圖解情境">${deck.cards.map((x,i)=>`<button data-gfoundation="${i}" aria-pressed="${i===active}">${x.label}</button>`).join('')}</div><div class="g-foundation-panel"><div class="g-foundation-picture">${visual}</div><div class="g-foundation-explain" aria-live="polite"><span class="eyebrow">${c.label}</span>${c.route?`<p class="g-foundation-route">${c.route}</p>`:''}<p class="g-foundation-jp" lang="ja">${text(c.jp)} ${sound(c.jp)}</p><strong>${c.zh}</strong><p>${c.note}</p>${c.reply?`<div class="g-foundation-reply"><span>補回缺少的資訊</span><p lang="ja">${text(c.reply)} ${sound(c.reply)}</p></div>`:''}</div></div><p class="g-small-note">圖解可自由切換，不計入成績。完成下方六題後才會保存本課最佳成績。</p></section>`;
}
