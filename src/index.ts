/**
 * @file index.ts
 * @description このファイルはDiscordボットのメインエントリーポイントです。
 *              ボットの起動、設定、イベントハンドラの登録を行います。
 */
import { GatewayIntentBits, Client } from "discord.js"; // Discord API とのやり取りに必要なクラスをインポート
import dotenv from "dotenv"; // .env ファイルから環境変数をロードするために使用
import voiceStateUpdateEvent from "./events/voiceStateUpdate"; // 音声チャンネルの状態変化を処理するイベントハンドラ
import interactionCreateEvent from "./events/interactionCreate"; // スラッシュコマンドやボタン操作などのインタラクションを処理するイベントハンドラ
import { startServer } from "./server"; // ヘルスチェック用のサーバーを起動する関数
import { TOKEN } from "./config"; // ボットの認証トークンなどの設定をインポート

// Discord クライアントのインスタンスを作成
const client = new Client({
  // ボットが購読するイベントの種類（インテント）を設定
  intents: [
    GatewayIntentBits.Guilds, // サーバー関連のイベント (参加、退出など)
    GatewayIntentBits.GuildMessages, // サーバー内のメッセージ関連イベント (メッセージ作成、編集、削除など)
    GatewayIntentBits.MessageContent, // メッセージの内容へのアクセス (v13以降で特権インテント)
    GatewayIntentBits.GuildVoiceStates, // サーバー内のボイスチャンネルの状態変化 (参加、退出、ミュートなど)
  ],
});

async function initialize() {
  try {
    // .env ファイルから環境変数をロード
    dotenv.config();
    // ヘルスチェックやその他のAPIを公開するサーバーを起動
    startServer();

    // エラー関連のイベントリスナー（デバッグ用）
    client.on("error", (error) =>
      console.error("Discord Client Error:", error),
    );
    client.on("warn", (info) => console.warn("Discord Client Warning:", info));
    client.on("shardDisconnect", (event, id) =>
      console.log(`Shard ${id} disconnected:`),
    );
    client.on("shardReconnecting", (id) =>
      console.log(`Shard ${id} reconnecting...`),
    );

    // ボットがDiscord APIに接続し、準備ができたときに一度だけ実行されるイベント
    client.on("ready", async () => {
      console.log(`${client.user?.tag} がログインしました！`);
    });

    // 各イベントハンドラを登録
    voiceStateUpdateEvent(client); // 音声状態更新イベントのリスナーを登録
    interactionCreateEvent(client); // インタラクションイベントのリスナーを登録

    // Discord にログイン
    await client.login(TOKEN);
  } catch (error) {
    console.error("アプリの初期化中にエラーが発生しました:", error);
    // エラー発生時はアプリケーションを終了し、外部サービス (例: Koyeb) による再起動を促す
    process.exit(1);
  }
}

// アプリケーションの初期化処理を開始
initialize();
