import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { TOKEN, APPLICATION_ID } from "./config";

// 登録したいコマンドの定義
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
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN!);

(async () => {
  try {
    console.log("📦 スラッシュコマンドの登録を開始します...");

    // グローバルコマンドとして登録（反映に時間がかかる場合があります）
    await rest.put(Routes.applicationCommands(APPLICATION_ID!), {
      body: commands,
    });

    console.log("✅ スラッシュコマンドの登録が完了しました！");
  } catch (error) {
    console.error("❌ 登録中にエラーが発生しました:", error);
  }
})();
