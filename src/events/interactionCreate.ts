import { Client, Events, Interaction } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config";

// Geminiの初期化
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function interactionCreateEvent(client: Client) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    // チャットコマンド（スラッシュコマンド）以外は無視
    if (!interaction.isChatInputCommand()) return;

    // コマンド名が 'gemini' の場合のみ処理
    if (interaction.commandName === "gemini") {
      try {
        // 処理に時間がかかる可能性があるため、先に「考え中...」状態にする（deferReply）
        await interaction.deferReply();

        // ユーザーの入力内容を取得
        const prompt = interaction.options.getString("prompt");

        if (!prompt) {
          await interaction.editReply("質問内容が入力されていません。");
          return;
        }

        // 指示文とユーザーの入力を合体させる
        // Template Literal (バッククォート) を使って、指示を埋め込みます
        const modifiedPrompt = `
以下の質問に対して、1〜3行程度の簡潔な文章で回答してください。

質問: ${prompt}
        `.trim();

        // Geminiに送信して回答を生成
        const result = await model.generateContent(modifiedPrompt);
        const response = result.response.text();

        // ユーザー名を取得（サーバーでの表示名、なければユーザー名）
        const username =
          interaction.user.displayName || interaction.user.username;

        // 名前付きで引用する形に変更
        const finalResponse = `> **${username}** の入力: \n> ${prompt}\n\n${response}`;

        // Discordに返信（2000文字制限のチェック）
        if (finalResponse.length > 2000) {
          await interaction.editReply(
            finalResponse.substring(0, 2000) +
              "...\n(長すぎるため省略されました)",
          );
        } else {
          await interaction.editReply(finalResponse);
        }
      } catch (error) {
        console.error("Gemini Error:", error);
        await interaction.editReply(
          "エラーが発生しました。もう一度試してみてください。",
        );
      }
    }
  });
}
