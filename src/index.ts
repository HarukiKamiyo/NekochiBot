/**
 * @file index.ts
 * @description このファイルはDiscordボットのメインエントリーポイントです。
 *              ボットの起動、設定、イベントハンドラの登録を行います。
 */
console.log("[LOG] index.ts: モジュール読み込み開始");

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

console.log("[LOG] index.ts: Clientオブジェクト作成開始");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
console.log("[LOG] index.ts: Clientオブジェクト作成完了");

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[警告] ${filePath} のコマンドは、必須の "data" または "execute" プロパティを欠いています。`,
      );
    }
  }
}

async function initialize() {
  console.log("[LOG] index.ts: initialize() 関数開始");
  try {
    console.log("[LOG] index.ts: loadCommands() 呼び出し開始");
    await loadCommands(); // コマンドをロード
    console.log("[LOG] index.ts: loadCommands() 呼び出し完了");
    
    dotenv.config();

    console.log("[LOG] index.ts: startServer() 呼び出し開始");
    // ヘルスチェックやその他のAPIを公開するサーバーを起動
    startServer();
    console.log("[LOG] index.ts: startServer() 呼び出し完了");

    // エラー関連のイベントリスナー（デバッグ用）
    console.log("[LOG] index.ts: Discord Client イベントリスナー登録開始");
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
    console.log("[LOG] index.ts: Discord Client イベントリスナー登録完了");

    // ボットがDiscord APIに接続し、準備ができたときに一度だけ実行されるイベント
    client.on("ready", async () => {
      console.log(`[LOG] index.ts: readyイベント発火！ ${client.user?.tag} がログインしました！`);
    });

    // 各イベントハンドラを登録
    console.log("[LOG] index.ts: カスタムイベントハンドラ登録開始");
    voiceStateUpdateEvent(client); // 音声状態更新イベントのリスナーを登録
    interactionCreateEvent(client); // インタラクションイベントのリスナーを登録
    console.log("[LOG] index.ts: カスタムイベントハンドラ登録完了");

    // Discord にログイン
    console.log("[LOG] index.ts: client.login() 呼び出し開始");
    await client.login(TOKEN);
    console.log("[LOG] index.ts: client.login() 呼び出し完了 (Promise解決)");
  } catch (error) {
    console.error("[LOG] index.ts: initialize() の catchブロックでエラーを補足", error);
    // エラー発生時はアプリケーションを終了し、外部サービス (例: Koyeb) による再起動を促す
    process.exit(1);
  }
}

// アプリケーションの初期化処理を開始
console.log("[LOG] index.ts: initialize() 呼び出し直前");
initialize();
