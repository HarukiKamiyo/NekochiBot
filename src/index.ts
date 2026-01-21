import {
  GatewayIntentBits,
  Client,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js"; // 追加
import dotenv from "dotenv";
import voiceStateUpdateEvent from "./events/voiceStateUpdate";
import interactionCreateEvent from "./events/interactionCreate";
import { startServer } from "./server";
import { TOKEN } from "./config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// スラッシュコマンドの定義
const commands = [
  new SlashCommandBuilder()
    .setName("gemini")
    .setDescription("Geminiとお話しします")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Geminiへの質問")
        .setRequired(true),
    ),
];

async function initialize() {
  try {
    // 環境変数の読み込み
    dotenv.config();

    // Koyeb ヘルスチェック用サーバーを起動
    startServer();

    // Bot の準備完了イベント
    client.on("ready", async () => {
      console.log(`${client.user?.tag} がログインしました！`);

      // Discord APIへ登録申請するためのRESTクライアントを作成（事務手続き用の窓口）
      const rest = new REST({ version: "10" }).setToken(TOKEN!);
      try {
        console.log("スラッシュコマンドを登録中...");

        // Bot自身のIDが必要なので、user情報があるか確認してから実行
        if (client.user) {
          // グローバルコマンドとして登録（参加している全サーバーで使えるようになる）
          // ※反映まで最大1時間くらいかかることもあるから注意
          await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
          });
          console.log("スラッシュコマンドの登録が完了しました！");
        }
      } catch (error) {
        console.error("スラッシュコマンド登録エラー:", error);
      }
    });

    // ボイスチャンネルの入退室イベントを登録
    voiceStateUpdateEvent(client);
    // スラッシュコマンドのインタラクションイベントを登録
    interactionCreateEvent(client);

    // Discord Bot へのログイン
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.error("アプリの初期化中にエラーが発生しました:", error);
  }
}

// アプリの初期化を実行
initialize();
