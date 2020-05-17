const express = require("express");
const line = require("@line/bot-sdk");
const { saveAnswer, isAlreadyAnswered } = require("./database.js");
const { validateEmail, validateStudentNumber } = require("./validator.js");

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

const questionIds = [
  "name",
  "gender",
  "faculity",
  "studentNumber",
  "email",
  "firstChoice",
  "secondChoice",
  "thirdChoice",
  "appeal",
  "other",
  "free",
  "done",
];

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
    const answered = await isAlreadyAnswered(userId);
    if (answered) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text:
          "すでに入会申請を受け付けています。追ってご連絡しますのでお待ちください！",
      });
    }
    // 空の回答状況を記録
    answerStore[userId] = {
      currentQuestionIndex: 0,
    };

    // メッセージで返信
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ありがとうございます！\nまずは名前を入力してください。",
    });
  }

  // 「入会」以外のメッセージを処理

  // ユーザーの回答状況
  const answer = answerStore[userId];
  const text = event.message.text;

  // 回答状況がない(=入会手続き中じゃない)なら何もしない
  if (answer == null) {
    return null;
  }

  if (text === "戻る" || text === "もどる") {
    if (answer.currentQuestionIndex > 0) {
      answer.currentQuestionIndex -= 1;
    }
  } else {
    answer[questionIds[answer.currentQuestionIndex]] = text;
    answer.currentQuestionIndex += 1;
  }
  const questionId = questionIds[answer.currentQuestionIndex];
  // 名前が記録されていないなら、入力されたメッセージは名前
  if (questionId === "name") {
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: "まずは名前を入力してください。",
    });
  } else if (questionId === "gender") {
    await client.replyMessage(event.replyToken, [
      {
        type: "template",
        altText: `${answer.name}さんですね。\n次は性別を選択してください。\n変更したい場合は「戻る」と入力してください。`,
        template: {
          type: "buttons",
          text: `${answer.name}さんですね。\n次は性別を選択してください。\n変更したい場合は「戻る」と入力してください。`,
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
          ],
        },
      },
    ]);
  } else if (questionId === "faculity") {
    await client.replyMessage(event.replyToken, [
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
              ],
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
              ],
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
              ],
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
              ],
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
              ],
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
              ],
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
              ],
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
              ],
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
              ],
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
              ],
            },
          ],
        },
      },
    ]);
  } else if (questionId === "studentNumber") {
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer.faculity}所属ですね。\n次は学籍番号を教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  } else if (questionId === "email") {
    if (!validateStudentNumber(answer.studentNumber)) {
      answer.currentQuestionIndex -= 1;
      await client.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `無効な学籍番号です。20から始まる9桁の学籍番号を入力してください。`,
        },
      ]);
    }
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `${answer.studentNumber}ですね。\n次はメールアドレスを教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  } else if (questionId === "firstChoice") {
    if (!validateEmail(answer.email)) {
      answer.currentQuestionIndex -= 1;
      await client.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `無効なメールアドレスです。正しいメールアドレスを入力してください。`,
        },
      ]);
    }
    await client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `${answer.email}ですね。\n次は第一希望の局を選択してください。\n変更したい場合は「戻る」と入力してください。`,
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
              ],
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
              ],
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
              ],
            },
          ],
        },
      },
    ]);
  } else if (questionId === "secondChoice") {
    await client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `第一希望局は${answer.firstChoice}ですね。\n次に第二希望の局を選択してください。\n変更したい場合は「戻る」と入力してください。`,
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
              ],
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
              ],
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
              ],
            },
          ],
        },
      },
    ]);
  } else if (questionId === "thirdChoice") {
    await client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `第二希望局は${answer.secondChoice}ですね。\n次に第三希望の局を選択してください。\n変更したい場合は「戻る」と入力してください。`,
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
              ],
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
              ],
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
              ],
            },
          ],
        },
      },
    ]);
  } else if (questionId === "appeal") {
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `第三希望局は${answer.thirdChoice}ですね。\n次に特技や資格など、アピールしたいことがあれば教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  } else if (questionId === "other") {
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `了解しました。\n次はバイトや他のサークルなどを検討しているか教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  } else if (questionId === "free") {
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `了解しました。\n最後にその他伝えたいことがあれば教えてください。\n変更したい場合は「戻る」と入力してください。`,
    });
  } else if (questionId === "done") {
    await client
      .replyMessage(event.replyToken, [
        {
          type: "text",
          text: `ありがとうございました。\n名前：${answer.name}さん\n性別：${answer.gender}\n所属：${answer.faculity} \n学籍番号：${answer.studentNumber}\nメールアドレス：${answer.email}\n所属希望局：\n1.${answer.firstChoice}\n2.${answer.secondChoice}\n3.${answer.thirdChoice}\nアピール：${answer.appeal}\n他の検討：${answer.other}\nその他：${answer.free}\n\n変更したい場合は「戻る」と入力してください。\n※注意：「いいえ」と入力すると今までの全データが消去されます。`,
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
                text: "いいえ",
              },
            ],
          },
        },
      ])
      .catch((e) => {
        console.log("Error!");
        console.log(e.originalError.response.data);
      });
  } else {
    if (event.message.text == "はい") {
      await saveAnswer(userId, answer);
      return await client.replyMessage(event.replyToken, {
        type: "text",
        text: "送信完了しました！入ってくださりありがとうございます！",
      });
    } else if (event.message.text == "いいえ") {
      answer["name"] == null;
      answer["gender"] == null;
      answer["faculties"] == null;
      answer["studentnumber"] == null;
      answer["address"] == null;
      answer["belongs1"] == null;
      answer["belongs2"] == null;
      answer["belongs3"] == null;
      answer["appeal"] == null;
      answer["others"] == null;
      answer["free"] == null;

      return await client.replyMessage(event.replyToken, {
        type: "text",
        text: "登録が中止されました。",
      });
    }
  }
}

app.listen(PORT);
