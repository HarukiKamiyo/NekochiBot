// src/commands/gemini.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config.js";

if (!GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is not defined in the environment variables.",
  );
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const data = new SlashCommandBuilder()
  .setName("gemini")
  .setDescription("Geminiとお話しします")
  .addStringOption((option) =>
    option.setName("prompt").setDescription("Geminiへの質問").setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const promptOption = interaction.options.get("prompt");
  if (!promptOption || typeof promptOption.value !== "string") {
    return interaction.reply({
      content: "質問内容を正しく取得できませんでした。",
      ephemeral: true,
    });
  }
  const prompt = promptOption.value;

  await interaction.deferReply();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    await interaction.editReply({ content: text });
  } catch (error) {
    console.error("Error in /gemini command:", error);
    await interaction.editReply({
      content: "エラーが発生しました。もう一度お試しください。",
    });
  }
}
