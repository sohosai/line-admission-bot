const express = require("express");
const line = require("@line/bot-sdk");

require("dotenv").config();
const PORT = process.env.PORT || 3000;
const LINE_CONFIG = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const app = express();
const client = new line.Client(LINE_CONFIG);

app.post("/", line.middleware(LINE_CONFIG), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

// ユーザー ID をキー、回答状況を値として、ここに保存する
const answerStore = {};

// Bot に発生したイベント（メッセージの受信など）をここで処理
// イベントの詳細: https://developers.line.biz/ja/docs/messaging-api/receiving-messages/#webhook-event-types
// メッセージイベントの詳細: https://developers.line.biz/ja/reference/messaging-api/#message-event
async function handleEvent(event) {
  // 開発用に event の中身を出力
  console.log(event);

  // テキストのメッセージ以外のイベントは処理しない
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  // 送信してきたユーザーを判別する ID
  const userId = event.source.userId;

  if (event.message.text == "入会") {
    // 空の回答状況を記録
    answerStore[userId] = {};

    // メッセージで返信
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ありがとうございます！\nまずは名前を入力してください。",
    });
  }

  // 「入会」以外のメッセージを処理

  // ユーザーの回答状況
  const answer = answerStore[userId];

  // 回答状況がない(=入会手続き中じゃない)なら何もしない
  if (answer == null) {
    return null;
  }

  // 名前が記録されていないなら、入力されたメッセージは名前
  if (answer["name"] == null) {
    // 名前を記録
    answer["name"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer["name"]} さんですね。\n次は性別を教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] == null) {
    answer["name"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\n名前を教えてください。`,
    });
  }

  //性別 gender
  if (answer["name"] != null && answer["gender"] == null && event.message.text != "戻る") {
    answer["gender"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `ご回答ありがとうございます。\n次は学類を教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] == null) {
    answer["gender"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\n性別を入力してください。`,
    });
  }

  //学類 faculties
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] == null && event.message.text != "戻る") {
    answer["faculties"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer["faculties"]} 所属ですね。\n次は学籍番号を教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] == null) {
    answer["faculties"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\n学類を入力してください。`,
    });
  }

  //学籍番号 studentnumber
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] == null && event.message.text != "戻る") {
    answer["studentnumber"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer["studentnumber"]} ですね。\n次はメールアドレスを教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] == null) {
    answer["studentnumber"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\n学籍番号を入力してください。`,
    });
  }

  //メアド  address
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] == null && event.message.text != "戻る") {
    answer["address"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer["address"]} ですね。\n次は希望する局を希望する順に３つ教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }
  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null  && answer["belongs"] == null) {
    answer["address"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\nメールアドレスを入力してください。`,
    });
  }

  //希望する局（第3まで） belongs
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] == null && event.message.text != "戻る") {
    answer["belongs"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `希望局は順に${answer["belongs"]} ですね。\n次に特技や資格など、アピールしたいことがあれば教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }
  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null  && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] == null) {
    answer["belongs"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\n希望する局を希望する順に３つ入力してください。`,
    });
  }

  //特技や資格など、アピールしたいこと appeal
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] == null && event.message.text != "戻る") {
    answer["appeal"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `了解しました。\n次はバイトや他のサークルなどを検討しているか教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }
  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null  && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] == null) {
    answer["appeal"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\nアピールしたいことを入力してください。`,
    });
  }

  //バイトとか他のサークルとか検討してますか others
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] == null && event.message.text != "戻る") {
    answer["others"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `了解しました。\n最後にその他伝えたいことがあれば教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }
  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null  && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] == null) {
    answer["others"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\nバイトや他のサークルなど検討していることを入力してください。`,
    });
  }

  //その他伝えたいこと自由記述 free
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] == null && event.message.text != "戻る") {
    answer["free"] = event.message.text;

    return client.replyMessage(event.replyToken,
      [{
        type: "text",
        text: `ありがとうございました。\n名前：${answer["name"]} さん\n性別：${answer["gender"]}\n所属：${answer["faculties"]} \n学籍番号：${answer["studentnumber"]}\nメールアドレス：${answer["address"]}\n所属希望局：${answer["belongs"]}\nアピール：${answer["appeal"]}\n他の検討：${answer["others"]}\nその他：${answer["free"]}\n\n変更したい場合は「戻る」と入力してください。\n※注意：「いいえ」と入力すると今までの全データが消去されます。`,
      },
      {
        type: "template",
        altText: `以上の内容で登録してよろしいですか？「はい」か「いいえ」で教えてください。`,
        template: {
          type: "buttons",
          text: `以上の内容で登録してよろしいですか？「はい」か「いいえ」で教えてください。`,
          actions: [
            {
              type: "postback",
              label: "はい",
              data: `名前：${answer["name"]} さん、性別：${answer["gender"]}、所属：${answer["faculties"]} 、学籍番号：${answer["studentnumber"]}、メールアドレス：${answer["address"]}、所属希望局：${answer["belongs"]}、アピール：${answer["appeal"]}、他の検討：${answer["others"]}、その他：${answer["free"]}`,
              text: "はい",
            },
            {
              type: "postback",
              label: "いいえ",
              data: `登録が中止されました。`,
              text: "いいえ"
            }
          ]
        }
      }])
      .catch((e) => {
        console.log("Error!");
        console.log(e.originalError.response.data);
      });

  }

  if (event.message.text == "はい" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] != null) {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "送信完了しました！入ってくださりありがとうございます！",
    });
  }

  if (event.message.text == "いいえ" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] != null) {
    answer["name"] == null
    answer["gender"] == null
    answer["faculties"] == null
    answer["studentnumber"] == null
    answer["address"] == null
    answer["belongs"] == null
    answer["appeal"] == null
    answer["others"] == null
    answer["free"] == null
    
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "登録が中止されました。",
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null&& answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] != null) {
    answer["free"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `その他伝えたいことを教えてください。`,
    });
  }

}

app.listen(PORT);
