console.log("[LOG] config.ts: モジュール読み込み開始");

import dotenv from "dotenv";
dotenv.config();

export const TOKEN = process.env.TOKEN;
export const APPLICATION_ID = process.env.APPLICATION_ID;
export const TARGET_VOICE_CHANNEL_ID = process.env.TARGET_VOICE_CHANNEL_ID;
export const NOTIFICATION_CHANNEL_ID = process.env.NOTIFICATION_CHANNEL_ID;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("[LOG] config.ts: 環境変数チェック開始");

if (
  !TOKEN ||
  !APPLICATION_ID ||
  !TARGET_VOICE_CHANNEL_ID ||
  !NOTIFICATION_CHANNEL_ID ||
  !GEMINI_API_KEY
) {
  console.error(
    "[LOG] config.ts: 環境変数が不足しています。プロセスを終了します。",
  );
  process.exit(1);
}

console.log("[LOG] config.ts: 環境変数チェック完了、問題なし");
