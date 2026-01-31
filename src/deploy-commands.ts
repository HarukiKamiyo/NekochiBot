import { REST, Routes } from "discord.js";
import { TOKEN, APPLICATION_ID } from "./config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESMでは __dirname は使えないため、import.meta.urlから取得する
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rest = new REST({ version: "10" }).setToken(TOKEN!);

(async () => {
  try {
    const commands = [];
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = await import(filePath);
      if ('data' in command) {
        commands.push(command.data.toJSON());
      }
    }

    console.log(`📦 ${commands.length}個のスラッシュコマンドの登録を開始します...`);

    await rest.put(Routes.applicationCommands(APPLICATION_ID!), {
      body: commands,
    });

    console.log("✅ スラッシュコマンドの登録が完了しました！");
  } catch (error) {
    console.error("❌ 登録中にエラーが発生しました:", error);
  }
})();
