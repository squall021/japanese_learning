import {verbCards,verbGroups,verbById,godanRows,verbChange,tePatterns,requestUses,iruUses,guideVerbs} from './verbs.js';
import {particleText as text,plainJapanese} from '../particles/ui.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drawings={
  book:'<path d="M28 30q27-10 52 3 25-13 52-3v62q-26-10-52 3-25-13-52-3Z"/><path d="M80 33v62M41 48h23M41 61h23M94 48h24M94 61h24"/>',
  home:'<path d="m35 49 45-31 45 31v49H35Z"/><path d="M69 98V65h24v33M46 55h13v17H46"/><path d="m10 80 18 0m-7-7 7 7-7 7"/>',
  food:'<ellipse cx="84" cy="72" rx="39" ry="17"/><path d="M49 70q3-30 20-27 9-17 23-5 20-2 24 32M28 28v28m-7-28v17q7 13 14 0V28m-7 28v39M139 28v68m0-68q-18 13 0 37"/>',
  bag:'<path d="M44 43h73l8 55H36ZM62 44V32a18 18 0 0 1 36 0v12"/><path d="M56 63h45m-45 14h31"/>',
  write:'<path d="M37 22h61v75H37Zm10 18h34m-34 15h27m-27 15h23m26 17 27-46 13 8-27 46-16 4Z"/>',
  chat:'<path d="M25 28h87v45H65L45 91V73H25Z"/><path d="M113 47h24v45h-16l-12 10V88H79m-38-43h55m-55 13h36"/>',
  clock:'<circle cx="80" cy="61" r="35"/><path d="M80 36v26l19 10M48 95l-8 11m71-11 8 11M38 25l13-11m58 0 13 11"/>',
  move:'<circle cx="90" cy="24" r="9"/><path d="m82 39-17 26 20 9-16 29m16-29 23 24m-30-50 23 11 16-10M63 42 49 64H33M23 98h25m-30-13h20"/>',
  game:'<path d="M45 40h69q13 1 19 36 2 19-11 16l-21-17H59L38 92q-13 4-10-16 6-35 17-36Z"/><path d="M53 49v22m-11-11h22"/><circle cx="106" cy="54" r="3"/><circle cx="117" cy="66" r="3"/>'
};
export const verbIllustration=kind=>`<svg class="g-verb-illustration" viewBox="0 0 160 120" fill="none" aria-hidden="true"><circle cx="80" cy="60" r="52" fill="#e9eedf" stroke="none"/><g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${drawings[kind]||drawings.book}</g></svg>`;
const sound=s=>`<button class="g-sound" data-gsound="${esc(plainJapanese(s))}" aria-label="播放：${esc(plainJapanese(s))}">♪</button>`;

const formBox=(caption,value)=>'<div><small>'+caption+'</small><span lang="ja">'+text(value)+'</span></div>';
function teMap(v){
  return '<div class="g-te-map" aria-label="五段て形音變分組">'+tePatterns.map(p=>'<div class="'+(v.group==='g1'&&v.id!=='go'&&p.tails.includes(v.tail)?'current':'')+'"><strong>'+p.tails.join('・')+'</strong><span>→</span><b>'+p.ending+'</b></div>').join('')+'<div class="'+(v.id==='go'?'current special':'special')+'"><strong>'+text('{行|い}く')+'</strong><span>→</span><b>'+text('{行|い}って')+'</b><small>這個另外記</small></div></div>';
}
function changeDiagram(v,mode){
  const c=verbChange(v,mode);
  const before='<p class="g-guide-rule"><strong>'+verbGroups[v.group].label+'</strong> · '+c.note+'</p>';
  if(mode==='groups')return before+'<div class="g-form-comparison">'+formBox('辭書形',v.jp)+'<span aria-hidden="true">→</span>'+formBox('之後會學的ます形',v.masu)+'</div>';
  if(c.special)return before+'<div class="g-form-comparison">'+formBox('原本的動詞',v.jp)+'<span aria-hidden="true">→</span>'+formBox('這一組直接記',c.target)+'</div>';
  if(c.teSound)return before+'<div class="g-change-diagram"><div><small>① 保留前面，找字尾</small><span lang="ja">'+text(v.prefix)+'<mark>'+v.tail+'</mark></span></div><b aria-hidden="true">→</b><div><small>② 找到同一組音變</small><span lang="ja">'+v.tail+' → <mark>'+c.pattern.ending+'</mark></span></div><b aria-hidden="true">→</b>'+formBox('③ 完成て形',v.te)+'</div><p class="g-small-note">「んで」「いで」也是て形，接句型時直接往後接，不用再加一個て。</p>';
  return before+'<div class="g-change-diagram"><div><small>① 保留前面，注意字尾</small><span lang="ja">'+text(v.prefix)+'<mark>'+v.tail+'</mark></span></div><b aria-hidden="true">→</b><div><small>② '+(c.removed?'拿掉「る」':'換一個音')+'</small><span lang="ja">'+text(c.keep)+(c.removed?'<del>'+c.removed+'</del>':'<mark>'+c.changed+'</mark>')+'</span></div><b aria-hidden="true">→</b><div><small>③ 接上「'+c.suffix+'」</small><span lang="ja">'+text(c.keep)+(c.changed?'<mark>'+c.changed+'</mark>':'')+'<em>'+c.suffix+'</em></span></div></div><div class="g-diagram-legend"><span>底色字：要變的音</span><span>刪除線：拿掉的字</span><span>框線字：新接上的句尾</span></div>';
}
function usageTimeline(kind){
  if(kind==='state')return '<div class="g-usage-timeline state" aria-label="結果狀態的時間圖"><div><small>之前發生</small><strong>結婚了</strong></div><span aria-hidden="true">→</span><div class="now"><small>現在的狀態</small><strong>仍然已婚</strong></div></div>';
  const labels=kind==='habit'?['前幾天也做','今天也做','持續反覆做']:['開始做','現在還在做','之後結束'];
  return '<div class="g-usage-timeline '+kind+'" aria-label="'+(kind==='habit'?'習慣反覆發生的時間圖':'動作正在進行的時間圖')+'">'+labels.map((label,i)=>'<div class="'+(i===1?'now':'')+'"><span aria-hidden="true">'+(kind==='habit'?'↻':i===1?'●':'○')+'</span><strong>'+label+'</strong></div>').join('')+'</div>';
}
function usageSentence(v,mode){
  const use=mode==='request'?requestUses[v.id]:iruUses[v.id],sentence=use.phrase+v.te+(mode==='request'?'ください':'います')+'。';
  const label=mode==='request'?'請對方做一件事':({progress:'現在正在進行',habit:'目前持續的習慣',state:'動作後留下的狀態'})[use.kind];
  return '<div class="g-guide-sentence"><span class="g-guide-caption">'+label+'</span>'+(mode==='iru'?usageTimeline(use.kind):'')+'<p lang="ja">'+text(sentence)+' '+sound(sentence)+'</p><strong>'+use.zh+'</strong><small>'+(mode==='request'?'先變成て形，再接ください；不是把ます或辭書形直接接上去。':use.kind==='progress'?'留意「今」的情境：這件事在說話時還在進行。':use.kind==='habit'?'這裡有「毎日」，描述反覆持續的生活習慣。':'這裡是已婚狀態，不是正在進行婚禮。')+'</small></div>';
}
export function verbGuide(mode,wordId,step){
  const pool=guideVerbs(mode),v=pool.find(w=>w.id===wordId)||pool[0],group=verbGroups[v.group];
  const usage=mode==='request'||mode==='iru';
  const labels=mode==='groups'?['先看單字','認識路線','放回句子']:mode==='te'?['先看原形','找到音變組','看看怎麼接']:usage?['先看動詞','接上句型','放回情境']:['先看原形','看哪裡改變','放回句子'];
  const mainIds=['read','write','buy','return','go','eat','see','wake','do','study','come','marry',v.id],words=pool.filter(w=>w.group===v.group),main=words.filter(w=>mainIds.includes(w.id)),more=words.filter(w=>!mainIds.includes(w.id));
  const wordButtons=items=>items.map(w=>'<button data-gvword="'+w.id+'" aria-pressed="'+(w.id===v.id)+'" aria-label="圖解：'+esc(plainJapanese(w.jp))+'">'+text(w.jp)+(w.exception||((mode==='te'||usage)&&w.teException)?'<small>留意</small>':'')+'</button>').join('');
  let body;
  if(step===0)body='<div class="g-word-intro"><div><span class="g-guide-caption">辭書形 · 字典裡看到的樣子</span><p lang="ja">'+text(v.jp)+' '+sound(v.jp)+'</p></div><div><span class="g-guide-caption">意思</span><strong>'+v.meaning+'</strong><p>這個單字走「'+group.short+'」這條路。</p></div></div>';
  else if(step===1){
    if(usage){const suffix=mode==='request'?'ください':'います';body='<p class="g-guide-rule">先用第 10 課學過的て形，再接「'+suffix+'」。</p><div class="g-change-diagram">'+formBox('① 原本的動詞',v.jp)+'<b aria-hidden="true">→</b>'+formBox('② 先變て形',v.te)+'<b aria-hidden="true">→</b>'+formBox('③ 接上'+suffix,v.te+suffix)+'</div><p class="g-small-note">即使て形以「で」結尾，也直接接後面的表現。</p>';}
    else body=changeDiagram(v,mode);
  }else if(usage)body=usageSentence(v,mode);
  else if(mode==='te'){
    body='<div class="g-guide-sentence"><span class="g-guide-caption">先完成形式，再看它怎麼接</span><p lang="ja">'+text(v.te)+' '+sound(v.te)+'</p><small>て形本身先不要固定翻成「請」或「正在」；接上不同表現，意思才會完整。</small></div>';
    if(requestUses[v.id])body+='<div class="g-te-use-preview"><span>第 11 課：接ください</span>'+usageSentence(v,'request')+'</div>';
    if(iruUses[v.id])body+='<div class="g-te-use-preview"><span>第 12 課：接います</span>'+usageSentence(v,'iru')+'</div>';
    if(!requestUses[v.id]&&!iruUses[v.id])body+='<p class="g-small-note">這個單字在這裡練習て形本身。下一課會用經確認的生活搭配練習句型。</p>';
  }else{const form=mode==='nai'?'nai':'masu',sentence=v.phrase+v[form]+'。';body='<div class="g-guide-sentence"><span class="g-guide-caption">把變好的動詞放回生活裡</span><p lang="ja">'+text(sentence)+' '+sound(sentence)+'</p><strong>'+(mode==='nai'?v.negative:v.positive)+'。</strong><small>'+(mode==='nai'?'這是普通形式的否定；禮貌地說可以使用「ません」。':'和前面學過的「ます」句子接起來，就能說一件日常的事。')+'</small></div>';}
  let table='';
  if(mode==='masu'||mode==='nai')table='<details class="g-verb-table"><summary>需要時再看：五段動詞的九種字尾</summary><p>先確定單字是五段，再用這張表找變化。'+(mode==='nai'?'「う」用「わ」；「ある」的ない形另記為「ない」。':'')+'</p><table><thead><tr><th>原字尾</th><th>換成</th><th>例子</th></tr></thead><tbody>'+godanRows.map(row=>{const w=verbCards.find(w=>w.group==='g1'&&w.tail===row[0]);return '<tr><td>'+row[0]+'</td><td>'+row[mode==='masu'?1:2]+'＋'+(mode==='masu'?'ます':'ない')+'</td><td>'+text(w.jp)+' → '+text(w[mode])+'</td></tr>';}).join('')+'</tbody></table></details>';
  if(mode==='te')table='<details class="g-verb-table"><summary>需要時再看：て形音變與例子</summary><table><thead><tr><th>五段字尾</th><th>變成</th><th>例子</th></tr></thead><tbody>'+tePatterns.map(p=>{const w=verbById(p.sample);return '<tr><td>'+p.tails.join('・')+'</td><td>'+p.ending+'</td><td>'+text(w.jp)+' → '+text(w.te)+'</td></tr>';}).join('')+'<tr><td colspan="2">行く另外記</td><td>'+text(verbById('go').jp)+' → '+text(verbById('go').te)+'</td></tr></tbody></table></details>';
  const exception=(mode==='te'||usage)&&v.teException?v.teException:v.exception;
  return '<section class="g-verb-guide" aria-labelledby="g-guide-title"><div class="g-guide-heading"><div><span class="eyebrow">ONE SMALL CHANGE AT A TIME</span><h2 id="g-guide-title">動詞變化，一次看一步</h2><p>先選一個動詞，依序點 1、2、3。你可以反覆比較。</p></div>'+verbIllustration(v.scene)+'</div>'+
    (mode==='groups'?'<div class="g-route-map">'+Object.entries(verbGroups).map(([id,g],i)=>'<article class="g-route '+id+'"><span class="g-route-number">'+(i+1)+'</span><h3>'+g.label+'</h3><p>'+g.hint+'</p><div lang="ja">'+(id==='g1'?text('{読|よ}')+'<mark>む</mark> → '+text('{読|よ}')+'<mark>み</mark>ます':id==='g2'?text('{食|た}べ')+'<del>る</del> → '+text('{食|た}べます'):'する → します')+'</div></article>').join('')+'</div>':'')+
    '<div class="g-guide-groups" role="group" aria-label="選擇動詞類別">'+Object.entries(verbGroups).map(([id,g])=>'<button data-gvgroup="'+id+'" aria-pressed="'+(id===v.group)+'" '+(!pool.some(w=>w.group===id)?'disabled':'')+'>'+g.label+'</button>').join('')+'</div><div class="g-guide-words" role="group" aria-label="選擇圖解動詞">'+wordButtons(main)+'</div>'+(more.length?'<details class="g-guide-more"><summary>再看 '+more.length+' 個動詞</summary><div class="g-guide-words">'+wordButtons(more)+'</div></details>':'')+
    (mode==='te'&&v.group==='g1'?teMap(v):'')+'<div class="g-guide-steps" role="group" aria-label="圖解步驟">'+labels.map((label,i)=>'<button data-gvstep="'+i+'" aria-pressed="'+(step===i)+'"><span>'+(i+1)+'</span>'+label+'</button>').join('')+'</div><div class="g-verb-reveal" role="region" aria-label="動詞變化圖說">'+body+'</div>'+(exception?'<p class="g-verb-exception"><strong>這個單字，另外留意一下</strong>'+exception+'</p>':'')+
    '<div class="g-guide-controls"><button class="secondary" data-gvstep="'+Math.max(0,step-1)+'" '+(step===0?'disabled':'')+'>← 上一步</button><span>'+(step+1)+' / 3</span><button class="primary" data-gvstep="'+Math.min(2,step+1)+'" '+(step===2?'disabled':'')+'>'+(step===0?labels[1]+' →':labels[2]+' →')+'</button></div>'+table+(usage?'<p class="g-guide-back"><button class="secondary" data-glesson="te-form">回看第 10 課て形圖解 →</button></p>':'')+'</section>';
}
