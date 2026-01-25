import { GatewayIntentBits, Client } from "discord.js";
import dotenv from "dotenv";
import voiceStateUpdateEvent from "./events/voiceStateUpdate";
import interactionCreateEvent from "./events/interactionCreate";
import { startServer } from "./server";
import { TOKEN } from "./config"; // GEMINI_API_KEY はここでは使わないので削除してもOK

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

async function initialize() {
  try {
    dotenv.config();
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

    client.on("ready", async () => {
      console.log(`${client.user?.tag} がログインしました！`);
    });

    voiceStateUpdateEvent(client);
    interactionCreateEvent(client);

    await client.login(TOKEN);
    // console.log("Bot がログインしました！");
  } catch (error) {
    console.error("アプリの初期化中にエラーが発生しました:", error);
    // エラー時はプロセスを強制終了させて Koyeb に再起動させる
    process.exit(1);
  }
}

initialize();
