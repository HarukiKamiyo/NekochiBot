import dotenv from "dotenv";
dotenv.config();

export const TOKEN = process.env.TOKEN;
export const APPLICATION_ID = process.env.APPLICATION_ID;
export const TARGET_VOICE_CHANNEL_ID = process.env.TARGET_VOICE_CHANNEL_ID;
export const NOTIFICATION_CHANNEL_ID = process.env.NOTIFICATION_CHANNEL_ID;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (
  !TOKEN ||
  !APPLICATION_ID ||
  !TARGET_VOICE_CHANNEL_ID ||
  !NOTIFICATION_CHANNEL_ID ||
  !GEMINI_API_KEY
) {
  console.error("必要な環境変数が設定されていません。");
  process.exit(1);
}
