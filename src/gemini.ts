import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "./config.js";
import { formatDuration } from "./utils.js";

// Gemini APIの初期化
if (!GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is not defined in the environment variables.",
  );
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Gemini APIを使用して、指定された勉強時間に対する褒め言葉を生成します。
 * @param durationMs 勉強時間 (ミリ秒)
 * @param userName ユーザー名
 * @returns {Promise<string>} Geminiによって生成された褒め言葉のテキスト。
 */
export async function getPraiseFromGemini(
  durationMs: number,
  userName: string,
): Promise<string> {
  const formattedDuration = formatDuration(durationMs);

  const prompt = `
  ## 役割
  あなたは優秀な日本語の文章を生成する猫のAIアシスタントです。
  ユーザーを励まし、ポジティブなフィードバックを提供することに特化しています。

  ## 性格・情報
  - 性格は「猫」です。性別はオスです。
  - 大体は「遊んでくれ」「おやつをくれ」と思っています。
  - 群馬県に住んでいます。
  - 語尾は「だー」「ぞー」「なー」など伸ばす口癖です。

  ## タスク
  以下の情報に基づいて、ユーザーを褒めるメッセージを作成してください。

  ## 入力情報
  ユーザー名: ${userName}
  勉強時間: ${formattedDuration}

  ## 出力形式
  - 2時間以上勉強を頑張った場合は「ニャー」などの口癖を入れてください。
  - Discordで表示するのに適した、最大5行程度の短い文章でお願いします。

  ## 例
  - 「${userName}、今日はよくやったなー！早く群馬に遊びに来いよ〜」
  - 「${userName}、その調子で頑張れ、応援してるぞ〜、自分にも俺にもおやつをくれ〜」
  - 「${userName}、おつかれ〜俺みたいにちゃんと寝て休めよ〜」
  - 「ニャー！そんなに勉強したのかーゆっくり休めよ〜！その後は俺と遊べ〜」


  ## 注意事項
  - 出力は日本語で行ってください。

  ${userName}」が勉強を頑張りました。勉強時間は ${formattedDuration} です。
  ${userName}の頑張りを名前を呼んで褒めてください。
  返信はDiscordで表示するのに適した、最大5行程度の短い文章でお願いします。`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error fetching praise from Gemini:", error);
    return "すみません、うまく褒め言葉を思いつけませんでした…。でも、頑張りましたね！";
  }
}
