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

  if (event.message.text === "こんにちは") {
    // メッセージで返信
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "こんにちは！",
    });
  }

  if (event.message.text === "入会") {
    // メッセージで返信
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "入会ありがとうごさいます！",
    });
  }

  // こんな感じで順番に聞いてく

  // 名前が記録され学類が入力されていないなら、入力されたメッセージは学類
  if (answer["name"] != null && answer["faculties"] == null) {
    // 学類を記録
    answer["faculties"] = event.message.text;

    return client.replyMessage(event.replyToken, {
      type: "confirm",
      text: "${event.message.text} さん、${event.message.text}所属ですね。"<br>
            "この内容でよろしければ「はい」、修正がある場合は「いいえ」を押してください",
      actions: [
        {
          type: "message",
          label: "はい",
          text: "はい"
        },
        {
          type: "message",
          label: "いいえ",
          text: "いいえ"
        }
      ]

    });
  }

}

app.listen(PORT);
