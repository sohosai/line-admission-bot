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
    answer["name"] = event.message.text;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "template",
          altText: `${answer["name"]}さんですね。\n次は性別を選択してください。\n変更したい場合は「戻る」と入力してください。`,
          template: {
            type: "buttons",
            text: `${answer["name"]}さんですね。\n次は性別を選択してください。\n変更したい場合は「戻る」と入力してください。`,
            actions: [
              {
                type: "postback",
                label: "男性",
                data: "男性",
                text: "男性",
              },
              {
                type: "postback",
                label: "女性",
                data: "女性",
                text: "女性",
              },
              {
                type: "postback",
                label: "その他",
                data: "その他",
                text: "その他",
              },
              {
                type: "postback",
                label: "無回答",
                data: "無回答",
                text: "無回答",
              },
            ]
          }
        }]);
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

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `ご回答ありがとうございます。\n次は学類を選択してください。\n変更したい場合は「戻る」と入力してください。`,
        },
        {
          type: "template",
          altText: `学類選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "人文・文化学群",
                actions: [
                  {
                    type: "postback",
                    label: "人文学類",
                    data: `人文学類`,
                    text: "人文学類",
                  },
                  {
                    type: "postback",
                    label: "比較文化学類",
                    data: `比較文化学類`,
                    text: "比較文化学類",
                  },
                  {
                    type: "postback",
                    label: "日本語・日本文化学類",
                    data: `日本語・日本文化学類`,
                    text: "日本語・日本文化学類",
                  },
                ]
              },
              {
                text: "社会・国際学群",
                actions: [
                  {
                    type: "postback",
                    label: "社会学類",
                    data: `社会学類`,
                    text: "社会学類",
                  },
                  {
                    type: "postback",
                    label: "国際総合学類",
                    data: `国際総合学類`,
                    text: "国際総合学類",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
              {
                text: "人間学群",
                actions: [
                  {
                    type: "postback",
                    label: "教育学類",
                    data: `教育学類`,
                    text: "教育学類",
                  },
                  {
                    type: "postback",
                    label: "心理学類",
                    data: `心理学類`,
                    text: "心理学類",
                  },
                  {
                    type: "postback",
                    label: "障害科学類",
                    data: `障害科学類`,
                    text: "障害科学類",
                  },
                ]
              },
              {
                text: "生命環境学群",
                actions: [
                  {
                    type: "postback",
                    label: "生物学類",
                    data: `生物学類`,
                    text: "生物学類",
                  },
                  {
                    type: "postback",
                    label: "生物資源学類",
                    data: `生物資源学類`,
                    text: "生物資源学類",
                  },
                  {
                    type: "postback",
                    label: "地球学類",
                    data: `地球学類`,
                    text: "地球学類",
                  },
                ]
              },
              {
                text: "理工学群①",
                actions: [
                  {
                    type: "postback",
                    label: "数学類",
                    data: `数学類`,
                    text: "数学類",
                  },
                  {
                    type: "postback",
                    label: "物理学類",
                    data: `物理学類`,
                    text: "物理学類",
                  },
                  {
                    type: "postback",
                    label: "化学類",
                    data: `化学類`,
                    text: "化学類",
                  },
                ]
              },
              {
                text: "理工学群②",
                actions: [
                  {
                    type: "postback",
                    label: "応用理工学類",
                    data: `応用理工学類`,
                    text: "応用理工学類",
                  },
                  {
                    type: "postback",
                    label: "工学システム学類",
                    data: `工学システム学類`,
                    text: "工学システム学類",
                  },
                  {
                    type: "postback",
                    label: "社会工学類",
                    data: `社会工学類`,
                    text: "社会工学類",
                  },
                ]
              },
              {
                text: "情報学群",
                actions: [
                  {
                    type: "postback",
                    label: "情報科学類",
                    data: `情報科学類`,
                    text: "情報科学類",
                  },
                  {
                    type: "postback",
                    label: "情報メディア創成学類",
                    data: `情報メディア創成学類`,
                    text: "情報メディア創成学類",
                  },
                  {
                    type: "postback",
                    label: "知識情報・図書館学類",
                    data: `知識情報・図書館学類`,
                    text: "知識情報・図書館学類",
                  },
                ]
              },
              {
                text: "医学群",
                actions: [
                  {
                    type: "postback",
                    label: "医学類",
                    data: `医学類`,
                    text: "医学類",
                  },
                  {
                    type: "postback",
                    label: "看護学類",
                    data: `看護学類`,
                    text: "看護学類",
                  },
                  {
                    type: "postback",
                    label: "医療科学類",
                    data: `医療科学類`,
                    text: "医療科学類",
                  },
                ]
              },
              {
                text: "体育専門学群",
                actions: [
                  {
                    type: "postback",
                    label: "体育専門学群",
                    data: `体育専門学群`,
                    text: "体育専門学群",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
              {
                text: "芸術専門学群",
                actions: [
                  {
                    type: "postback",
                    label: "芸術専門学群",
                    data: `芸術専門学群`,
                    text: "芸術専門学群",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] == null) {
    answer["gender"] = null;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "template",
          altText: `取り消しました。\n性別を選択してください。`,
          template: {
            type: "buttons",
            text: `取り消しました。\n性別を選択してください。`,
            actions: [
              {
                type: "postback",
                label: "男性",
                data: `男性`,
                text: "男性",
              },
              {
                type: "postback",
                label: "女性",
                data: `女性`,
                text: "女性"
              },
              {
                type: "postback",
                label: "その他",
                data: `その他`,
                text: "その他",
              },
              {
                type: "postback",
                label: "無回答",
                data: `無回答`,
                text: "無回答",
              },
            ]
          }
        }]);
  }

  //学類 faculties
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] == null && event.message.text != "戻る") {
    answer["faculties"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer["faculties"]}所属ですね。\n次は学籍番号を教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] == null) {
    answer["faculties"] = null;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `取り消しました。\n学類を選択してください。`,
        },
        {
          type: "template",
          altText: `学類選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "人文・文化学群",
                actions: [
                  {
                    type: "postback",
                    label: "人文学類",
                    data: `人文学類`,
                    text: "人文学類",
                  },
                  {
                    type: "postback",
                    label: "比較文化学類",
                    data: `比較文化学類`,
                    text: "比較文化学類",
                  },
                  {
                    type: "postback",
                    label: "日本語・日本文化学類",
                    data: `日本語・日本文化学類`,
                    text: "日本語・日本文化学類",
                  },
                ]
              },
              {
                text: "社会・国際学群",
                actions: [
                  {
                    type: "postback",
                    label: "社会学類",
                    data: `社会学類`,
                    text: "社会学類",
                  },
                  {
                    type: "postback",
                    label: "国際総合学類",
                    data: `国際総合学類`,
                    text: "国際総合学類",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
              {
                text: "人間学群",
                actions: [
                  {
                    type: "postback",
                    label: "教育学類",
                    data: `教育学類`,
                    text: "教育学類",
                  },
                  {
                    type: "postback",
                    label: "心理学類",
                    data: `心理学類`,
                    text: "心理学類",
                  },
                  {
                    type: "postback",
                    label: "障害科学類",
                    data: `障害科学類`,
                    text: "障害科学類",
                  },
                ]
              },
              {
                text: "生命環境学群",
                actions: [
                  {
                    type: "postback",
                    label: "生物学類",
                    data: `生物学類`,
                    text: "生物学類",
                  },
                  {
                    type: "postback",
                    label: "生物資源学類",
                    data: `生物資源学類`,
                    text: "生物資源学類",
                  },
                  {
                    type: "postback",
                    label: "地球学類",
                    data: `地球学類`,
                    text: "地球学類",
                  },
                ]
              },
              {
                text: "理工学群①",
                actions: [
                  {
                    type: "postback",
                    label: "数学類",
                    data: `数学類`,
                    text: "数学類",
                  },
                  {
                    type: "postback",
                    label: "物理学類",
                    data: `物理学類`,
                    text: "物理学類",
                  },
                  {
                    type: "postback",
                    label: "化学類",
                    data: `化学類`,
                    text: "化学類",
                  },
                ]
              },
              {
                text: "理工学群②",
                actions: [
                  {
                    type: "postback",
                    label: "応用理工学類",
                    data: `応用理工学類`,
                    text: "応用理工学類",
                  },
                  {
                    type: "postback",
                    label: "工学システム学類",
                    data: `工学システム学類`,
                    text: "工学システム学類",
                  },
                  {
                    type: "postback",
                    label: "社会工学類",
                    data: `社会工学類`,
                    text: "社会工学類",
                  },
                ]
              },
              {
                text: "情報学群",
                actions: [
                  {
                    type: "postback",
                    label: "情報科学類",
                    data: `情報科学類`,
                    text: "情報科学類",
                  },
                  {
                    type: "postback",
                    label: "情報メディア創成学類",
                    data: `情報メディア創成学類`,
                    text: "情報メディア創成学類",
                  },
                  {
                    type: "postback",
                    label: "知識情報・図書館学類",
                    data: `知識情報・図書館学類`,
                    text: "知識情報・図書館学類",
                  },
                ]
              },
              {
                text: "医学群",
                actions: [
                  {
                    type: "postback",
                    label: "医学類",
                    data: `医学類`,
                    text: "医学類",
                  },
                  {
                    type: "postback",
                    label: "看護学類",
                    data: `看護学類`,
                    text: "看護学類",
                  },
                  {
                    type: "postback",
                    label: "医療科学類",
                    data: `医療科学類`,
                    text: "医療科学類",
                  },
                ]
              },
              {
                text: "体育専門学群",
                actions: [
                  {
                    type: "postback",
                    label: "体育専門学群",
                    data: `体育専門学群`,
                    text: "体育専門学群",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
              {
                text: "芸術専門学群",
                actions: [
                  {
                    type: "postback",
                    label: "芸術専門学群",
                    data: `芸術専門学群`,
                    text: "芸術専門学群",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }

  //学籍番号 studentnumber
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] == null && event.message.text != "戻る") {
    answer["studentnumber"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer["studentnumber"]}ですね。\n次はメールアドレスを教えてください。\n変更したい場合は「戻る」と入力してください。`,
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

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `${answer["address"]}ですね。\n次は第一希望の局を選択してください。\n変更したい場合は「戻る」と入力してください。`,
        },
        {
          type: "template",
          altText: `第一希望局選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "1/3",
                actions: [
                  {
                    type: "postback",
                    label: "総務局",
                    data: `総務局`,
                    text: "総務局",
                  },
                  {
                    type: "postback",
                    label: "渉外局",
                    data: `渉外局`,
                    text: "渉外局",
                  },
                  {
                    type: "postback",
                    label: "推進局",
                    data: `推進局`,
                    text: "推進局",
                  },
                ]
              },
              {
                text: "2/3",
                actions: [
                  {
                    type: "postback",
                    label: "総合計画局",
                    data: `総合計画局`,
                    text: "総合計画局",
                  },
                  {
                    type: "postback",
                    label: "広報宣伝局",
                    data: `広報宣伝局`,
                    text: "広報宣伝局",
                  },
                  {
                    type: "postback",
                    label: "情報メディアシステム局",
                    data: `情報メディアシステム局`,
                    text: "情報メディアシステム局",
                  },
                ]
              },
              {
                text: "3/3",
                actions: [
                  {
                    type: "postback",
                    label: "ステージ管理局",
                    data: `ステージ管理局`,
                    text: "ステージ管理局",
                  },
                  {
                    type: "postback",
                    label: "本部企画局",
                    data: `本部企画局`,
                    text: "本部企画局",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }


  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] == null) {
    answer["address"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\nメールアドレスを入力してください。`,
    });
  }

  //希望する局（3つ） belongs
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] == null && event.message.text != "戻る") {
    answer["belongs1"] = event.message.text;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `第一希望局は${answer["belongs1"]}ですね。\n次に第二希望の局を選択してください。\n変更したい場合は「戻る」と入力してください。`,
        },
        {
          type: "template",
          altText: `第二希望局選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "1/3",
                actions: [
                  {
                    type: "postback",
                    label: "総務局",
                    data: `総務局`,
                    text: "総務局",
                  },
                  {
                    type: "postback",
                    label: "渉外局",
                    data: `渉外局`,
                    text: "渉外局",
                  },
                  {
                    type: "postback",
                    label: "推進局",
                    data: `推進局`,
                    text: "推進局",
                  },
                ]
              },
              {
                text: "2/3",
                actions: [
                  {
                    type: "postback",
                    label: "総合計画局",
                    data: `総合計画局`,
                    text: "総合計画局",
                  },
                  {
                    type: "postback",
                    label: "広報宣伝局",
                    data: `広報宣伝局`,
                    text: "広報宣伝局",
                  },
                  {
                    type: "postback",
                    label: "情報メディアシステム局",
                    data: `情報メディアシステム局`,
                    text: "情報メディアシステム局",
                  },
                ]
              },
              {
                text: "3/3",
                actions: [
                  {
                    type: "postback",
                    label: "ステージ管理局",
                    data: `ステージ管理局`,
                    text: "ステージ管理局",
                  },
                  {
                    type: "postback",
                    label: "本部企画局",
                    data: `本部企画局`,
                    text: "本部企画局",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }


  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] == null) {
    answer["belongs1"] = null;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `取り消しました。\n第一希望の局を選択してください。`,
        },
        {
          type: "template",
          altText: `第一希望局選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "1/3",
                actions: [
                  {
                    type: "postback",
                    label: "総務局",
                    data: `総務局`,
                    text: "総務局",
                  },
                  {
                    type: "postback",
                    label: "渉外局",
                    data: `渉外局`,
                    text: "渉外局",
                  },
                  {
                    type: "postback",
                    label: "推進局",
                    data: `推進局`,
                    text: "推進局",
                  },
                ]
              },
              {
                text: "2/3",
                actions: [
                  {
                    type: "postback",
                    label: "総合計画局",
                    data: `総合計画局`,
                    text: "総合計画局",
                  },
                  {
                    type: "postback",
                    label: "広報宣伝局",
                    data: `広報宣伝局`,
                    text: "広報宣伝局",
                  },
                  {
                    type: "postback",
                    label: "情報メディアシステム局",
                    data: `情報メディアシステム局`,
                    text: "情報メディアシステム局",
                  },
                ]
              },
              {
                text: "3/3",
                actions: [
                  {
                    type: "postback",
                    label: "ステージ管理局",
                    data: `ステージ管理局`,
                    text: "ステージ管理局",
                  },
                  {
                    type: "postback",
                    label: "本部企画局",
                    data: `本部企画局`,
                    text: "本部企画局",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }

  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] == null && event.message.text != "戻る") {
    answer["belongs2"] = event.message.text;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `第二希望局は${answer["belongs2"]}ですね。\n次に第三希望の局を選択してください。\n変更したい場合は「戻る」と入力してください。`,
        },
        {
          type: "template",
          altText: `第三希望局選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "1/3",
                actions: [
                  {
                    type: "postback",
                    label: "総務局",
                    data: `総務局`,
                    text: "総務局",
                  },
                  {
                    type: "postback",
                    label: "渉外局",
                    data: `渉外局`,
                    text: "渉外局",
                  },
                  {
                    type: "postback",
                    label: "推進局",
                    data: `推進局`,
                    text: "推進局",
                  },
                ]
              },
              {
                text: "2/3",
                actions: [
                  {
                    type: "postback",
                    label: "総合計画局",
                    data: `総合計画局`,
                    text: "総合計画局",
                  },
                  {
                    type: "postback",
                    label: "広報宣伝局",
                    data: `広報宣伝局`,
                    text: "広報宣伝局",
                  },
                  {
                    type: "postback",
                    label: "情報メディアシステム局",
                    data: `情報メディアシステム局`,
                    text: "情報メディアシステム局",
                  },
                ]
              },
              {
                text: "3/3",
                actions: [
                  {
                    type: "postback",
                    label: "ステージ管理局",
                    data: `ステージ管理局`,
                    text: "ステージ管理局",
                  },
                  {
                    type: "postback",
                    label: "本部企画局",
                    data: `本部企画局`,
                    text: "本部企画局",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }


  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] == null) {
    answer["belongs2"] = null;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `取り消しました。\n第二希望の局を選択してください。`,
        },
        {
          type: "template",
          altText: `第二希望局選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "1/3",
                actions: [
                  {
                    type: "postback",
                    label: "総務局",
                    data: `総務局`,
                    text: "総務局",
                  },
                  {
                    type: "postback",
                    label: "渉外局",
                    data: `渉外局`,
                    text: "渉外局",
                  },
                  {
                    type: "postback",
                    label: "推進局",
                    data: `推進局`,
                    text: "推進局",
                  },
                ]
              },
              {
                text: "2/3",
                actions: [
                  {
                    type: "postback",
                    label: "総合計画局",
                    data: `総合計画局`,
                    text: "総合計画局",
                  },
                  {
                    type: "postback",
                    label: "広報宣伝局",
                    data: `広報宣伝局`,
                    text: "広報宣伝局",
                  },
                  {
                    type: "postback",
                    label: "情報メディアシステム局",
                    data: `情報メディアシステム局`,
                    text: "情報メディアシステム局",
                  },
                ]
              },
              {
                text: "3/3",
                actions: [
                  {
                    type: "postback",
                    label: "ステージ管理局",
                    data: `ステージ管理局`,
                    text: "ステージ管理局",
                  },
                  {
                    type: "postback",
                    label: "本部企画局",
                    data: `本部企画局`,
                    text: "本部企画局",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }

  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] == null && event.message.text != "戻る") {
    answer["belongs3"] = event.message.text;


    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `希望局は順に${answer["belongs1"]}、${answer["belongs2"]}、${answer["belongs3"]}ですね。\n次に特技や資格など、アピールしたいことがあれば教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] == null) {
    answer["belongs3"] = null;

    return client.replyMessage(event.replyToken,
      [
        {
          type: "text",
          text: `取り消しました。\n第三希望の局を選択してください。`,
        },
        {
          type: "template",
          altText: `第三希望局選択`,
          template: {
            type: "carousel",
            columns: [
              {
                text: "1/3",
                actions: [
                  {
                    type: "postback",
                    label: "総務局",
                    data: `総務局`,
                    text: "総務局",
                  },
                  {
                    type: "postback",
                    label: "渉外局",
                    data: `渉外局`,
                    text: "渉外局",
                  },
                  {
                    type: "postback",
                    label: "推進局",
                    data: `推進局`,
                    text: "推進局",
                  },
                ]
              },
              {
                text: "2/3",
                actions: [
                  {
                    type: "postback",
                    label: "総合計画局",
                    data: `総合計画局`,
                    text: "総合計画局",
                  },
                  {
                    type: "postback",
                    label: "広報宣伝局",
                    data: `広報宣伝局`,
                    text: "広報宣伝局",
                  },
                  {
                    type: "postback",
                    label: "情報メディアシステム局",
                    data: `情報メディアシステム局`,
                    text: "情報メディアシステム局",
                  },
                ]
              },
              {
                text: "3/3",
                actions: [
                  {
                    type: "postback",
                    label: "ステージ管理局",
                    data: `ステージ管理局`,
                    text: "ステージ管理局",
                  },
                  {
                    type: "postback",
                    label: "本部企画局",
                    data: `本部企画局`,
                    text: "本部企画局",
                  },
                  {
                    type: "postback",
                    label: "　",
                    data: `　`,
                  },
                ]
              },
            ]
          }
        }]);
  }

  //特技や資格など、アピールしたいこと appeal
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] == null && event.message.text != "戻る") {
    answer["appeal"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `了解しました。\n次はバイトや他のサークルなどを検討しているか教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }
  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] == null) {
    answer["appeal"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\nアピールしたいことを入力してください。`,
    });
  }

  //バイトとか他のサークルとか検討してますか others
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] == null && event.message.text != "戻る") {
    answer["others"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `了解しました。\n最後にその他伝えたいことがあれば教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  }
  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] == null) {
    answer["others"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `取り消しました。\nバイトや他のサークルなど検討していることを入力してください。`,
    });
  }

  //その他伝えたいこと自由記述 free
  if (answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] == null && event.message.text != "戻る") {
    answer["free"] = event.message.text;

    return client.replyMessage(event.replyToken,
      [{
        type: "text",
        text: `ありがとうございました。\n名前：${answer["name"]}さん\n性別：${answer["gender"]}\n所属：${answer["faculties"]} \n学籍番号：${answer["studentnumber"]}\nメールアドレス：${answer["address"]}\n所属希望局：\n1.${answer["belongs1"]}\n2.${answer["belongs2"]}\n3.${answer["belongs3"]}\nアピール：${answer["appeal"]}\n他の検討：${answer["others"]}\nその他：${answer["free"]}\n\n変更したい場合は「戻る」と入力してください。\n※注意：「いいえ」と入力すると今までの全データが消去されます。`,
      },
      {
        type: "template",
        altText: `以上の内容で登録してよろしいですか？「はい」か「いいえ」で教えてください。`,
        template: {
          type: "confirm",
          text: `以上の内容で登録してよろしいですか？「はい」か「いいえ」で教えてください。`,
          actions: [
            {
              type: "postback",
              label: "はい",
              data: `名前：${answer["name"]}、性別：${answer["gender"]}、所属：${answer["faculties"]}、学籍番号：${answer["studentnumber"]}、メールアドレス：${answer["address"]}、所属希望局：1.${answer["belongs1"]}/2.${answer["belongs2"]}/3.${answer["belongs3"]}、アピール：${answer["appeal"]}、他の検討：${answer["others"]}、その他：${answer["free"]}`,
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

  if (event.message.text == "はい" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] != null) {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "送信完了しました！入ってくださりありがとうございます！",
    });
  }

  if (event.message.text == "いいえ" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] != null) {
    answer["name"] == null
    answer["gender"] == null
    answer["faculties"] == null
    answer["studentnumber"] == null
    answer["address"] == null
    answer["belongs1"] == null
    answer["belongs2"] == null
    answer["belongs3"] == null
    answer["appeal"] == null
    answer["others"] == null
    answer["free"] == null

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "登録が中止されました。",
    });
  }

  if (event.message.text == "戻る" && answer["name"] != null && answer["gender"] != null && answer["faculties"] != null && answer["studentnumber"] != null && answer["address"] != null && answer["belongs1"] != null && answer["belongs2"] != null && answer["belongs3"] != null && answer["appeal"] != null && answer["others"] != null && answer["free"] != null) {
    answer["free"] = null;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `その他伝えたいことを教えてください。`,
    });
  }

}

app.listen(PORT);
