// Classifications are reviewed vocabulary data, never inferred from a word's spelling.
export const verbGroups={
  g1:{label:'五段動詞（1 類）',short:'五段',hint:'換最後一個音，再接句尾。'},
  g2:{label:'一段動詞（2 類）',short:'一段',hint:'拿掉最後的「る」，再接句尾。'},
  g3:{label:'不規則動詞（3 類）',short:'不規則',hint:'「する」「来る」的變化各自記。'}
};
export const godanRows=[['う','い','わ'],['く','き','か'],['ぐ','ぎ','が'],['す','し','さ'],['つ','ち','た'],['ぬ','に','な'],['ぶ','び','ば'],['む','み','ま'],['る','り','ら']];
const record=(id,prefix,tail,meaning,group,phrase,positive,negative,scene='book',extra={})=>{
  const row=godanRows.find(r=>r[0]===tail);
  return {id,prefix,tail,jp:prefix+tail,meaning,group,phrase,positive,negative,scene,
    masu:group==='g1'?prefix+row[1]+'ます':prefix+'ます',
    nai:group==='g1'?prefix+row[2]+'ない':prefix+'ない',...extra};
};
export const verbCards=[
  record('read','{読|よ}','む','讀','g1','{本|ほん}を','讀書','不讀書'),
  record('write','{書|か}','く','寫','g1','{名前|なまえ}を','寫名字','不寫名字','write'),
  record('buy','{買|か}','う','買','g1','パンを','買麵包','不買麵包','bag'),
  record('swim','{泳|およ}','ぐ','游泳','g1','プールで','在泳池游泳','不在泳池游泳','move'),
  record('speak','{話|はな}','す','說話','g1','{日本語|にほんご}を','說日文','不說日文','chat'),
  record('wait','{待|ま}','つ','等','g1','ここで','在這裡等','不在這裡等','clock'),
  record('die','{死|し}','ぬ','死亡','g1','このゲームでは','在這個遊戲中會死','在這個遊戲中不會死','game'),
  record('play','{遊|あそ}','ぶ','玩','g1','{公園|こうえん}で','在公園玩','不在公園玩','move'),
  record('return','{帰|かえ}','る','回去','g1','うちに','回家','不回家','home',{exception:'「帰る」雖然是「える」的聲音結尾，仍是五段；把分類和單字一起記。'}),
  record('enter','{入|はい}','る','進入','g1','{部屋|へや}に','進房間','不進房間','home',{exception:'「入る」以「いる」的聲音結尾，仍是五段，不是拿掉「る」就好。'}),
  record('run','{走|はし}','る','跑','g1','{公園|こうえん}で','在公園跑步','不在公園跑步','move',{exception:'「走る」以「いる」的聲音結尾，仍是五段；需要連同分類記住。'}),
  record('cut','{切|き}','る','切、剪','g1','{紙|かみ}を','剪紙','不剪紙','write',{exception:'這裡是表示切、剪的「切る」，屬於五段。不要只用讀音判斷分類。'}),
  record('exist','あ','る','有、存在','g1','{本|ほん}が','有書','沒有書','book',{nai:'ない',exception:'「ある」是五段，但ない形特別：直接用「ない」，不說「あらない」。'}),
  record('eat','{食|た}べ','る','吃','g2','パンを','吃麵包','不吃麵包','food'),
  record('see','{見|み}','る','看','g2','{映画|えいが}を','看電影','不看電影','game'),
  record('wake','{起|お}き','る','起床','g2','{朝|あさ}に','早上起床','早上不起床','clock',{exception:'「起きる」是一段動詞；變化時保留「起き」，拿掉「る」。'}),
  record('borrow','{借|か}り','る','借入','g2','{本|ほん}を','借書','不借書','book'),
  record('sleep','{寝|ね}','る','睡覺','g2','{夜|よる}に','晚上睡覺','晚上不睡覺','clock'),
  {id:'do',jp:'する',meaning:'做',group:'g3',masu:'します',nai:'しない',phrase:'{宿題|しゅくだい}を',positive:'做作業',negative:'不做作業',scene:'write'},
  {id:'study',jp:'{勉強|べんきょう}する',meaning:'學習',group:'g3',masu:'{勉強|べんきょう}します',nai:'{勉強|べんきょう}しない',phrase:'{日本語|にほんご}を',positive:'學日文',negative:'不學日文',scene:'book'},
  {id:'come',jp:'{来|く}る',meaning:'來',group:'g3',masu:'{来|き}ます',nai:'{来|こ}ない',phrase:'ここに',positive:'來這裡',negative:'不來這裡',scene:'home',exception:'漢字仍是「来」，讀音會變：くる → きます → こない。'}
];
export const verbById=id=>verbCards.find(v=>v.id===id);
export function verbChange(v,mode){
  if(mode==='groups')return {note:`「${v.meaning}」這個動詞屬於${verbGroups[v.group].label}。先記路線，後兩課再練怎麼變。`,target:v.masu};
  const suffix=mode==='masu'?'ます':'ない',target=v[mode];
  if(v.id==='exist'&&mode==='nai')return {note:'「ある」的否定是特別的一組，直接記「ある → ない」。',target,special:true};
  if(v.group==='g3')return {note:v.id==='come'?`這組連讀音一起記：くる → ${mode==='masu'?'きます':'こない'}。`:`把「する」這一段換成「${mode==='masu'?'します':'しない'}」。`,target,special:true};
  if(v.group==='g2')return {note:`拿掉最後的「る」，接上「${suffix}」。前面的部分保留。`,target,keep:v.prefix,changed:'',suffix,removed:'る'};
  const row=godanRows.find(r=>r[0]===v.tail),changed=row[mode==='masu'?1:2];
  return {note:`最後的「${v.tail}」換成「${changed}」，再加「${suffix}」。${mode==='nai'&&v.tail==='う'?'這裡用「わ」，不是「あ」。':''}`,target,keep:v.prefix,changed,suffix};
}
