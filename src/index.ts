/**
 * @file index.ts
 * @description このファイルはDiscordボットのメインエントリーポイントです。
 *              ボットの起動、設定、イベントハンドラの登録を行います。
 */
import { GatewayIntentBits, Client, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import voiceStateUpdateEvent from "./events/voiceStateUpdate.js";
import interactionCreateEvent from "./events/interactionCreate.js";
import { startServer } from "./server.js";
import { TOKEN } from "./config.js";

// ESMでは __dirname は使えないため、import.meta.urlから取得する
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[警告] ${filePath} のコマンドは、必須の "data" または "execute" プロパティを欠いています。`);
    }
  }
}

async function initialize() {
  try {
    await loadCommands(); // コマンドをロード
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

    // 1秒待機して、他の初期化処理が完了するのを待つ
    console.log("1秒待機してからDiscordにログインします...");
    await new Promise(resolve => setTimeout(resolve, 1000));

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
