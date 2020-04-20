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
}

app.listen(PORT);
