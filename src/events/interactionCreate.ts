// src/events/interactionCreate.ts
import { Client, Events, Interaction } from "discord.js";

export default function interactionCreateEvent(client: Client) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    // スラッシュコマンド以外は無視
    if (!interaction.isChatInputCommand()) return;

    // client.commands からコマンド名に一致するコマンドを取得
    const command = client.commands.get(interaction.commandName);

    // コマンドが見つからない場合はエラーメッセージを送信
    if (!command) {
      console.error(`'${interaction.commandName}' というコマンドは見つかりませんでした。`);
      await interaction.reply({
        content: "エラー: コマンドが見つかりません。",
        ephemeral: true,
      });
      return;
    }

    try {
      // コマンドの execute 関数を実行
      await command.execute(interaction);
    } catch (error) {
      console.error(`コマンド '${interaction.commandName}' の実行中にエラーが発生しました:`, error);
      // エラーが発生した場合、ユーザーにフィードバック
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "コマンドの実行中にエラーが発生しました。",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "コマンドの実行中にエラーが発生しました。",
          ephemeral: true,
        });
      }
    }
  });
}

