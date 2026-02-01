// src/commands/log.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { getPraiseFromGemini } from "../gemini.js";

export const data = new SlashCommandBuilder()
  .setName("log")
  .setDescription("頑張った活動の時間を記録して、褒めてもらいます。")
  .addIntegerOption((option) =>
    option.setName("hours").setDescription("活動した時間 (整数)").setMinValue(0)
  )
  .addIntegerOption((option) =>
    option
      .setName("minutes")
      .setDescription("活動した分 (整数)")
      .setMinValue(0)
      .setMaxValue(59)
  )
  .addStringOption((option) =>
    option
      .setName("comment")
      .setDescription("活動内容や感想など（例: 筋トレ、読書）")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const hours = interaction.options.getInteger("hours") ?? 0;
  const minutes = interaction.options.getInteger("minutes") ?? 0;
  const comment = interaction.options.getString("comment"); // コメントを取得

  const totalMilliseconds = (hours * 60 * 60 + minutes * 60) * 1000;

  if (totalMilliseconds <= 0) {
    return interaction.reply({
      content:
        "活動時間を正しく入力してください（時間または分のどちらかは1以上である必要があります）。",
      ephemeral: true,
    });
  }

  // deferReply を呼び出して、Gemini API の応答を待っている間にタイムアウトしないようにする
  await interaction.deferReply();

  try {
    const praise = await getPraiseFromGemini(
      totalMilliseconds,
      interaction.user.displayName,
      comment // getPraiseFromGemini に comment を渡す
    );

    let replyContent = praise;
    if (comment) {
      replyContent = `> ${interaction.user.displayName}「${comment}」\n\n${praise}`;
    }

    await interaction.editReply({ content: replyContent });
  } catch (error) {
    console.error("Error in /log command:", error);
    await interaction.editReply({
      content: "エラーが発生しました。もう一度お試しください。",
    });
  }
}
