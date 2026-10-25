import {verbCards,verbGroups,tePatterns} from './verbs.js';
import {verbIllustration} from './verb-guide.js';
import {particleText as text,plainJapanese} from '../particles/ui.js';

export const bridgeModes={ta:{variants:[]},tai:{variants:['want','not-want']},invite:{variants:['ask','accept','decline']}};
// Full sentences are limited to reviewed contexts; forms use the reviewed verb registry.
export const pastUses={
  read:{phrase:'きのう、この{本|ほん}を',zh:'昨天讀了這本書。'},write:{phrase:'きのう、{名前|なまえ}を',zh:'昨天寫了名字。'},
  drink:{phrase:'きのう、お{茶|ちゃ}を',zh:'昨天喝了茶。'},go:{phrase:'きのう、{学校|がっこう}に',zh:'昨天去了學校。'},
  eat:{phrase:'きのう、パンを',zh:'昨天吃了麵包。'},see:{phrase:'きのう、{映画|えいが}を',zh:'昨天看了電影。'},
  study:{phrase:'きのう、{日本語|にほんご}を',zh:'昨天學了日文。'},come:{phrase:'きのう、ここに',zh:'昨天來了這裡。'}
};
export const desireUses={
  read:{phrase:'この{本|ほん}を',action:'讀這本書'},drink:{phrase:'お{茶|ちゃ}を',action:'喝茶'},go:{phrase:'{日本|にほん}に',action:'去日本'},
  eat:{phrase:'ラーメンを',action:'吃拉麵'},see:{phrase:'{映画|えいが}を',action:'看電影'},sleep:{phrase:'',action:'睡覺'},
  study:{phrase:'{日本語|にほんご}を',action:'學日文'},come:{phrase:'{来年|らいねん}またここに',action:'明年再來這裡'}
};
export const invitationUses={
  drink:{phrase:'お{茶|ちゃ}を',action:'喝茶'},swim:{phrase:'プールで',action:'在泳池游泳'},play:{phrase:'{公園|こうえん}で',action:'在公園玩'},
  go:{phrase:'{公園|こうえん}に',action:'去公園'},eat:{phrase:'{昼|ひる}ごはんを',action:'吃午餐'},see:{phrase:'{映画|えいが}を',action:'看電影'},
  do:{phrase:'{宿題|しゅくだい}を',action:'做作業'},study:{phrase:'{日本語|にほんご}を',action:'學日文'}
};
export const bridgeVerbs=mode=>verbCards.filter(v=>mode==='tai'?Object.hasOwn(desireUses,v.id):mode==='invite'?Object.hasOwn(invitationUses,v.id):true);
export const masuStem=v=>v.masu.replace(/ます$/,'');
export const bridgeForm=(v,kind)=>kind==='ta'?v.ta:masuStem(v)+({want:'たいです','not-want':'たくないです',ask:'ませんか',suggest:'ましょう'})[kind];
export function bridgeSentence(v,mode,variant){
  if(mode==='ta')return pastUses[v.id]?pastUses[v.id].phrase+v.ta+'。':null;
  if(mode==='tai')return desireUses[v.id].phrase+bridgeForm(v,variant==='not-want'?'not-want':'want')+'。';
  return '{明日|あした}、いっしょに'+invitationUses[v.id].phrase+bridgeForm(v,'ask')+'。';
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sound=s=>'<button class="g-sound" data-gsound="'+esc(plainJapanese(s))+'" aria-label="播放：'+esc(plainJapanese(s))+'">♪</button>';
const box=(label,value)=>'<div><small>'+label+'</small><span lang="ja">'+text(value)+'</span></div>';
const spoken=(s,zh)=>'<div class="g-guide-sentence"><p lang="ja">'+text(s)+sound(s)+'</p><strong>'+zh+'</strong></div>';
function pastMap(v){
  return '<div class="g-te-map g-ta-map" aria-label="て形與た形音變對照">'+tePatterns.map(p=>'<div class="'+(v.group==='g1'&&v.id!=='go'&&p.tails.includes(v.tail)?'current':'')+'"><strong>'+p.tails.join('・')+'</strong><span>'+p.ending+' →</span><b>'+p.ending.replace('て','た').replace('で','だ')+'</b></div>').join('')+'<div class="special '+(v.id==='go'?'current':'')+'"><strong>'+text('{行|い}く')+'</strong><span>'+text('{行|い}って')+' →</span><b>'+text('{行|い}った')+'</b><small>這一組另外記</small></div></div>';
}
function pastScene(v){
  const sentence=bridgeSentence(v,'ta'),polite=v.masu.replace(/ます$/,'ました');
  let html='<p class="g-guide-rule">兩種形式都能在這課的情境說明過去，選擇哪個，要配合關係與場合。</p><div class="g-form-comparison">'+box('普通形式的過去肯定',v.ta)+'<span aria-hidden="true">↔</span>'+box('禮貌形式的過去肯定',polite)+'</div>';
  if(sentence)html+='<div class="g-past-timeline" aria-label="過去的事與現在回顧"><div><span aria-hidden="true">●</span><strong>昨天發生</strong></div><span aria-hidden="true">→</span><div><span aria-hidden="true">○</span><strong>現在回顧</strong></div></div>'+spoken(sentence,pastUses[v.id].zh)+'<p class="g-small-note">這裡是熟悉的人之間，回顧昨天做過的事；禮貌地說可改用「'+plainJapanese(polite)+'」。</p>';
  else html+='<p class="g-small-note">這個單字先比較動詞形式；完整例句請選読む、飲む、行く、食べる、見る、書く、勉強する或来る。</p>';
  return html+'<p class="g-small-note">這課先練過去肯定。た形也能接其他句型，不是每個出現た形的地方都直接翻成「昨天做了」。</p>';
}
function desireScene(v,variant){
  const negative=variant==='not-want',s=bridgeSentence(v,'tai',variant),use=desireUses[v.id];
  return '<div class="g-intent-tabs" role="group" aria-label="切換想做與不想做">'+[['want','想做'],['not-want','不想做']].map(([id,label])=>'<button data-gbridge="'+id+'" aria-pressed="'+(id===variant)+'">'+label+'</button>').join('')+'</div><div class="g-wish-card"><span class="g-wish-symbol" aria-hidden="true">'+(negative?'−':'♡')+'</span><div><span class="g-guide-caption">先說自己的願望</span><h3>我'+(negative?'不想':'想')+use.action+'</h3><p>表達現在的想法，還沒有表示這件事已經發生或一定會做。</p></div></div>'+spoken(s,'我'+(negative?'不想':'想')+use.action+'。')+(negative?'<p class="g-small-note">否定也可以用「'+text(masuStem(v)+'たくありません')+'」。たい的否定像い形容詞：たい → たくない。</p>':'<p class="g-small-note">「たいです」說自己的願望；要邀請對方一起做，下一課會練「ませんか」。</p>');
}
function invitationScene(v,variant){
  const question=bridgeSentence(v,'invite'),use=invitationUses[v.id],suggest='いっしょに'+use.phrase+bridgeForm(v,'suggest')+'。';
  let html='<div class="g-intent-tabs" role="group" aria-label="切換邀請與回應">'+[['ask','提出邀請'],['accept','接受邀請'],['decline','婉拒邀請']].map(([id,label])=>'<button data-gbridge="'+id+'" aria-pressed="'+(id===variant)+'">'+label+'</button>').join('')+'</div><div class="g-dialogue"><div class="g-dialogue-line"><span class="g-speaker">A · 邀請</span>'+spoken(question,'明天要不要一起'+use.action+'？')+'</div>';
  if(variant==='accept')html+='<div class="g-dialogue-line reply"><span class="g-speaker">B · 願意參加</span>'+spoken('いいですね。'+bridgeForm(v,'suggest')+'。','好呀。一起'+use.action+'吧。')+'</div>';
  if(variant==='decline')html+='<div class="g-dialogue-line reply"><span class="g-speaker">B · 這次不方便</span>'+spoken('すみません、{明日|あした}はちょっと…。','不好意思，明天有點不方便……。')+'</div><p class="g-small-note">這個對話中，「ちょっと…」配合前面的すみません是在婉拒，不是表示「等一下就會答應」。</p>';
  html+='</div>';
  if(variant==='ask')html+='<div class="g-invitation-proposal"><span class="g-guide-caption">已經有共同意向時，也可提議</span>'+spoken(suggest,'一起'+use.action+'吧。')+'</div>';
  return html+'<p class="g-small-note">這裡的「ませんか」是在邀請，不是單純說不做；「ましょう」較直接地提議一起做。是否合適，要看對方的意向與情境。</p>';
}
export function bridgeGuide(mode,wordId,step,variant){
  const pool=bridgeVerbs(mode),v=pool.find(v=>v.id===wordId)||pool[0],stem=masuStem(v),meta=bridgeModes[mode];
  const selected=meta.variants.includes(variant)?variant:meta.variants[0];
  const labels=mode==='ta'?['先看原形','從て形換過來','比較兩種過去']:['先看動詞','拿掉ます再接','放進生活情境'];
  const title=mode==='ta'?'て形換一個字，就認得た形':mode==='tai'?'想做什麼，從ます形接過來':'邀請別人，一起把話接下去';
  let body;
  if(step===0)body='<div class="g-word-intro"><div><span class="g-guide-caption">辭書形 · 原本的動詞</span><p lang="ja">'+text(v.jp)+sound(v.jp)+'</p></div><div><span class="g-guide-caption">意思與類別</span><strong>'+v.meaning+'</strong><p>'+verbGroups[v.group].label+'</p></div></div>';
  else if(step===1){
    if(mode==='ta')body='<p class="g-guide-rule">沿用已學過的て形，最後的「て → た」「で → だ」。'+(v.id==='go'?'行く先變行って，所以是行った。':v.id==='come'?'来て與来た都讀き開頭：きて → きた。':'')+'</p><div class="g-change-diagram">'+box('① 原本的動詞',v.jp)+'<b aria-hidden="true">→</b>'+box('② 先回想て形',v.te)+'<b aria-hidden="true">→</b>'+box('③ 換成た形',v.ta)+'</div>';
    else body='<p class="g-guide-rule">先找已學過的ます形，拿掉「ます」，再接「'+(mode==='tai'?'たいです':'ませんか')+'」。</p><div class="g-change-diagram">'+box('① 已學過的ます形',v.masu)+'<b aria-hidden="true">→</b><div><small>② 拿掉ます，保留前面</small><span lang="ja">'+text(stem)+'<del>ます</del></span></div><b aria-hidden="true">→</b>'+box('③ 換上新的句尾',bridgeForm(v,mode==='tai'?'want':'ask'))+'</div>'+(mode==='invite'?'<p class="g-small-note">同一段「'+text(stem)+'」也能接「ましょう」：'+text(bridgeForm(v,'suggest'))+'。</p>':'<p class="g-small-note">する → します → したいです；来る → 来ます → 来たいです，最後讀きたいです。</p>');
  }else body=mode==='ta'?pastScene(v):mode==='tai'?desireScene(v,selected):invitationScene(v,selected);
  const back=mode==='ta'?['te-form',10,'て形']:['masu-form',8,'ます形'];
  return '<section class="g-verb-guide g-bridge-guide" aria-labelledby="g-guide-title"><div class="g-guide-heading"><div><span class="eyebrow">FROM A FORM TO A CONVERSATION</span><h2 id="g-guide-title">'+title+'</h2><p>一次看一步，讓學過的變化接上新的意思。</p></div>'+verbIllustration(v.scene)+'</div><div class="g-guide-groups" role="group" aria-label="選擇動詞類別">'+Object.entries(verbGroups).map(([id,g])=>'<button data-gvgroup="'+id+'" aria-pressed="'+(v.group===id)+'">'+g.label+'</button>').join('')+'</div><div class="g-guide-words" role="group" aria-label="選擇圖解動詞">'+pool.filter(w=>w.group===v.group).map(w=>'<button data-gvword="'+w.id+'" aria-pressed="'+(w.id===v.id)+'" aria-label="圖解：'+esc(plainJapanese(w.jp))+'">'+text(w.jp)+'</button>').join('')+'</div>'+(mode==='ta'&&v.group==='g1'?pastMap(v):'')+'<div class="g-guide-steps" role="group" aria-label="圖解步驟">'+labels.map((l,i)=>'<button data-gvstep="'+i+'" aria-pressed="'+(i===step)+'"><span>'+(i+1)+'</span>'+l+'</button>').join('')+'</div><div class="g-verb-reveal" role="region" aria-label="動詞變化圖說">'+body+'</div><div class="g-guide-controls"><button class="secondary" data-gvstep="'+Math.max(0,step-1)+'" '+(step===0?'disabled':'')+'>← 上一步</button><span>'+(step+1)+' / 3</span><button class="primary" data-gvstep="'+Math.min(2,step+1)+'" '+(step===2?'disabled':'')+'>'+labels[Math.min(2,step+1)]+' →</button></div><p class="g-guide-back"><button class="secondary" data-glesson="'+back[0]+'">回看第 '+back[1]+' 課'+back[2]+'圖解 →</button></p></section>';
}
