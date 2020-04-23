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

  if (event.message.text === "入会") {
    // 空の回答状況を記録
    answerStore[userId] = {};

    // メッセージで返信
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ありがとうございます！まずは名前を入力してください。",
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
      text: `${answer["name"]} さんですね。次は学類を教えてください。`,
    });
  }

  // こんな感じで順番に聞いてく

  // 名前が記録され学類が入力されていないなら、入力されたメッセージは学類
  if (answer["name"] != null && answer["faculties"] == null) {
    // 学類を記録
    answer["faculties"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "bottons",
      text: `${answer["name"]}さん、${answer["faculties"]} 所属で登録してよろしいですか？`,
      actions: [
        {
          type: "postback",
          label: "はい",
          data: `${answer["name"]}さん/${answer["faculties"]} 所属`,
          displayText: "送信完了しました！入ってくださりありがとうございます！",
        }
        {
          type: "postback",
          label: "いいえ",
          data: `登録が中止されました。`,
          displayText: "登録が中止されました。",
        }
      ]
    });
  }

}

app.listen(PORT);
