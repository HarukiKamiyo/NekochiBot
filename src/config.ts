import dotenv from "dotenv";
dotenv.config();

export const TOKEN = process.env.TOKEN;
export const TARGET_VOICE_CHANNEL_ID = process.env.TARGET_VOICE_CHANNEL_ID;
export const NOTIFICATION_CHANNEL_ID = process.env.NOTIFICATION_CHANNEL_ID;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (
  !TOKEN ||
  !TARGET_VOICE_CHANNEL_ID ||
  !NOTIFICATION_CHANNEL_ID ||
  !GEMINI_API_KEY
) {
  console.error(
    "環境変数 TOKEN, TARGET_VOICE_CHANNEL_ID, NOTIFICATION_CHANNEL_ID, GEMINI_API_KEY のいずれかが設定されていません。",
  );
  process.exit(1);
}
