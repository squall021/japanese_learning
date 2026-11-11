const example=(scene,sentence,zh,relation,note)=>({scene,sentence,zh,relation,note});
const question=(id,use,context,sentence,answer,why,wrong)=>({
  id,use,context,sentence,options:[answer,...Object.keys(wrong)],answers:[answer],why,wrong
});

const method='de-method';
const recipient='ni-recipient';
const duration='made-duration';
const deadline='madeni-deadline';
const methodsLesson='ni-de-method-recipient';
const timeLesson='made-madeni';

export const methodTimeUsages={
  [method]:'で・交通、工具與方式',
  [recipient]:'に・接收物品或訊息的人',
  [duration]:'まで・動作持續的終點',
  [deadline]:'までに・完成的期限'
};

const methodWrong={
  に:'に可以標目的地或接收者。本題空格前面是做這個動作所用的方法。',
  を:'を可以標動作的對象。本題空格要標用什麼方式做。'
};
const recipientWrong={
  で:'で可標手段或場所。本句空格前面是收到物品或訊息的人。',
  を:'を標交付或傳送的東西。本句空格前面是接收的人。'
};
const durationWrong={
  までに:'までに表示最遲在那個時間完成。題目指定的是動作一路持續到那時。',
  に:'只用に會標時間點。題目要標出持續這段時間的終點。'
};
const deadlineWrong={
  まで:'まで適合標動作持續的終點。題目是在說最遲何時要完成。',
  に:'に指定在那個時間做。題目允許早一點完成，需要標出最後期限。'
};

export const methodTimeLessons=[
  {
    id:methodsLesson,symbol:'に／で（對象與方式）',title:'用什麼方式？交給誰？',
    subtitle:'用「で」說交通、工具與方式，用「に」指出接收的人。',
    pattern:'場所 で 動作 ｜ 手段 で 動作 ｜ 人 に 東西 を 渡します',
    intro:'在車站用卡片付款，再把票交給朋友。「車站」是做事的地方，「卡片」是付款方式，「朋友」是收到票的人。',
    rule:'で可標做事的場所，也可標交通工具、工具或方法。に接在人後面時，依動詞可以指出收到物品或訊息的人。',
    caution:'「電車で行きます」說搭電車去，「駅に行きます」說去車站。換成乗る時會說「電車に乗ります」，所以要一起看後面的動詞。',
    examples:[
      example('用卡片付款。','カード【で】{払|はら}います。','用卡片付款。','カード → 用什麼方式付款？','這裡的で標付款方式。駅で的で則可以標做事的地方。'),
      example('搭電車去車站。','{電車|でんしゃ}【で】{駅|えき}に{行|い}きます。','搭電車去車站。','電車で → 交通方式 ｜ 駅に → 目的地','句中分開說怎麼去，以及要去哪裡。'),
      example('把車票交給朋友。','{友|とも}だち【に】{切符|きっぷ}を{渡|わた}します。','把車票交給朋友。','友だちに → 收票的人 ｜ 切符を → 交付的東西','に標接收者，を標交付的物品。')
    ],
    questions:[
      question('method-1',method,'你決定搭公車去學校。請標出交通方式。','バス＿{学校|がっこう}に{行|い}きます。','で','バスで說「搭公車」，学校に說「去學校」。',methodWrong),
      question('method-2',method,'你要用智慧型手機拍照。空格要標出用的工具。','スマートフォン＿{写真|しゃしん}を{撮|と}ります。','で','スマートフォンで是用來拍照的工具，写真を是拍攝的對象。',methodWrong),
      question('recipient-1',recipient,'你把文件交給老師。請標出誰會收到文件。','{先生|せんせい}＿{書類|しょるい}を{渡|わた}します。','に','先生に指出老師收文件，書類を指出交付的是文件。',recipientWrong),
      question('recipient-2',recipient,'你要出示菜單給店員看。空格要標出給誰看。','{店員|てんいん}＿メニューを{見|み}せます。','に','店員に是看菜單的對象，メニューを是出示的東西。',recipientWrong)
    ]
  },
  {
    id:timeLesson,symbol:'まで／までに',title:'到幾點為止？最晚幾點？',
    subtitle:'分清楚持續的終點與完成的期限。',
    pattern:'五時 まで 待ちます ｜ 五時 までに 来てください',
    intro:'朋友說他會等到五點，並請你最晚五點到。時間一樣，但一個人在等一段時間，另一個人要在期限前完成「到達」。',
    rule:'まで指出動作或狀態持續到何時。までに給完成的最後期限，提早完成也可以。',
    caution:'三時に出します是指定三點送出；三時までに出します是最晚三點送出。要配合題目判斷是在說整段時間，還是在說完成的期限。',
    examples:[
      example('等到下午五點。','{五時|ごじ}【まで】{待|ま}ちます。','我會等到五點。','等待 ─────────→ 五時','等待持續到五點，五點是這段等待的終點。'),
      example('最晚下午五點前來，提早也可以。','{五時|ごじ}【までに】{来|き}てください。','請最晚五點到。','可提早到達 ───── ● 五時（最後期限）','までに標出最晚到達時間。'),
      example('回覆截止日是星期五，週四回也可以。','{金曜日|きんようび}【までに】{返事|へんじ}をしてください。','請最晚星期五回覆。','可提早回覆 ───── ● 金曜日（最後期限）','這裡規定最遲何時要完成回覆。')
    ],
    questions:[
      question('until-1',duration,'朋友還沒到。你會繼續待在這裡，一直等到五點。','{五時|ごじ}＿{待|ま}ちます。','まで','等待持續到五點，用まで表示這段等待的終點。',durationWrong),
      question('until-2',duration,'你會一直待在飯店，直到上午十點。','{午前|ごぜん}{十時|じゅうじ}＿ホテルにいます。','まで','在飯店這個狀態維持到十點。',durationWrong),
      question('by-1',deadline,'朋友請你最晚五點到，四點半到也可以。','{五時|ごじ}＿{来|き}てください。','までに','五點是到達的最後期限，早一點到也符合要求。',deadlineWrong),
      question('by-2',deadline,'表單最晚星期五交，星期四交也可以。','{金曜日|きんようび}＿{申込書|もうしこみしょ}を{出|だ}してください。','までに','星期五是交表單的最後期限，用までに。',deadlineWrong)
    ]
  }
];

const word=(id,jp,zh)=>({id,jp,zh});
const transport=word('subway','{地下鉄|ちかてつ}','地鐵');
const cash=word('cash','{現金|げんきん}','現金');
const pencil=word('pencil','{鉛筆|えんぴつ}','鉛筆');
const scissors=word('scissors','はさみ','剪刀');
const chopsticks=word('chopsticks','{箸|はし}','筷子');
const phone=word('phone','{電話|でんわ}','電話');

function variation(id,lesson,use,context,sentence,answer,why,wrong,translation,words){
  return {...question('v3:'+id,use,context,sentence,answer,why,wrong),lesson,translation,words,generated:true};
}

const methods=[
  [transport,word('go-museum','{美術館|びじゅつかん}に{行|い}きます','去美術館')],
  [cash,word('pay','{払|はら}います','付款')],
  [pencil,word('write-name','{名前|なまえ}を{書|か}きます','寫名字')],
  [scissors,word('cut-paper','{紙|かみ}を{切|き}ります','剪紙')],
  [chopsticks,word('eat-udon','うどんを{食|た}べます','吃烏龍麵')],
  [phone,word('contact-hotel','ホテルに{連絡|れんらく}します','聯絡飯店')]
];
const people=[word('friend','{友|とも}だち','朋友'),word('teacher','{先生|せんせい}','老師'),word('tanaka','{田中|たなか}さん','田中')];
const messages=[
  [word('send','メールを{送|おく}ります','寄電子郵件'),person=>`寄電子郵件給${person}。`],
  [word('show','{写真|しゃしん}を{見|み}せます','出示照片'),person=>`把照片給${person}看。`]
];
const times=[word('four','{四時|よじ}','四點'),word('six','{六時|ろくじ}','六點'),word('eight','{八時|はちじ}','八點')];
const continuing=[
  [word('study','{図書館|としょかん}で{勉強|べんきょう}します','在圖書館讀書'),'在圖書館讀書讀到'],
  [word('stay','カフェにいます','待在咖啡店'),'待在咖啡店到']
];
const completing=[
  [word('reply','{返事|へんじ}をしてください','請回覆'),'回覆'],
  [word('return-book','{本|ほん}を{返|かえ}してください','請還書'),'還書']
];

export const methodTimeVariations=[
  ...methods.map(([tool,action])=>variation(
    `method:${tool.id}:${action.id}`,methodsLesson,method,`用${tool.zh}${action.zh}。請標出所用的方法。`,
    `${tool.jp}＿${action.jp}。`,'で',`${tool.zh}是${action.zh}時所用的方式，後面加で。`,
    methodWrong,`用${tool.zh}${action.zh}。`,[tool,action]
  )),
  ...people.flatMap(person=>messages.map(([action,translate])=>variation(
    `recipient:${person.id}:${action.id}`,methodsLesson,recipient,`${translate(person.zh)}空格要標出接收的人。`,
    `${person.jp}＿${action.jp}。`,'に',`${person.zh}是收到訊息或看到照片的人，後面加に。`,
    recipientWrong,translate(person.zh),[person,action]
  ))),
  ...times.flatMap(time=>continuing.map(([action,description])=>variation(
    `until:${time.id}:${action.id}`,timeLesson,duration,`你會一直${description}${time.zh}。請標出動作持續的終點。`,
    `${time.jp}＿${action.jp}。`,'まで',`動作持續到${time.zh}，用まで標出終點。`,
    durationWrong,`我會${description}${time.zh}。`,[time,action]
  ))),
  ...times.flatMap(time=>completing.map(([action,description])=>variation(
    `by:${time.id}:${action.id}`,timeLesson,deadline,`最晚${time.zh}要${description}，提早完成也可以。請標出期限。`,
    `${time.jp}＿${action.jp}。`,'までに',`${time.zh}是最晚的完成時間，用までに表示期限。`,
    deadlineWrong,`請最晚${time.zh}${description}。`,[time,action]
  )))
];
