# 2020 学園祭実行委員会 LINE BOT

2020 年度の新入生が入会等を LINE で行うための BOT です。

## 環境構築

1. リポジトリをクローンします。

```sh
git clone https://github.com/sohosai/line-admission-bot.git
# or clone via ssh
# git clone git@github.com:sohosai/line-admission-bot.git
```

2. 依存パッケージをインストールします。

```sh
npm install
```

3. `.env` ファイルを作成し、LINE Messaging API のアクセストークンと secret を環境変数に設定します。

```
LINE_CHANNEL_SECRET=XXXXXXXXXXXXXXX
LINE_CHANNEL_ACCESS_TOKEN=YYYYYYYYYYYY
```

## 開発

1. プログラムを起動します。一度起動すると、プログラムを変更するたびに自動で反映されます。

```sh
npm run dev
```

2. 外部に公開（=LINE のサーバーからアクセスできるように）します。上のコマンドは実行したままで、別のウィンドウを開いて実行してください。

```sh
npm run ngrok
```

下記のような表示になれば成功です。一番下の `Forwarding` の右の URL をコピーします。この例では `https://b4fbee5e.ngrok.io` です。 **https から始まることを確認してください。**

```
ngrok by @inconshreveable

Session Status                online
Session Expires               7 hours, 59 minutes
Version                       2.3.35
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://b4fbee5e.ngrok.io -> http://localhost:3000
Forwarding                    https://b4fbee5e.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

3. LINE Official Account Manager 上の[設定画面](https://manager.line.biz/account/@722ukuum/setting/messaging-api)で、手順 2 でコピーした URL を Webhook URL として登録します。この URL は手順 2 を実行するたびに変わります。

4. Line Bot アカウントにメッセージを送信する等して、正しくプログラムを起動できていることを確認します。
