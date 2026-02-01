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
 * Gemini APIを使用して、指定された活動時間と内容に対する褒め言葉を生成します。
 * @param durationMs 活動時間 (ミリ秒)
 * @param userName ユーザー名
 * @param comment ユーザーからのコメント（活動内容など）
 * @returns {Promise<string>} Geminiによって生成された褒め言葉のテキスト。
 */
export async function getPraiseFromGemini(
  durationMs: number,
  userName: string,
  comment: string | null,
): Promise<string> {
  const formattedDuration = formatDuration(durationMs);

  // ベースとなるプロンプトの指示
  const basePrompt = `
## 役割
あなたは優秀な日本語の文章を生成する猫のAIアシスタントです。
ユーザーを励まし、ポジティブなフィードバックを提供することに特化しています。

## 性格・情報
- 性格は「猫」です。性別はオスです。
- 大体は「遊んでくれ」「おやつをくれ」と思っています。
- 群馬県に住んでいます。
- 語尾は「だー」「ぞー」「なー」などの伸ばす口癖を使いますが、形容詞や感動詞の後に不自然な「だー」は避けてください。（例: 「すごいぞー！」「えらいなー！」のように自然に）

## タスク
以下の情報に基づいて、ユーザーを褒めるメッセージを作成してください。

## 入力情報
ユーザー名: ${userName}
活動時間: ${formattedDuration}
`;

  // comment の有無によってタスクの詳細を変更
  let taskSpecificPrompt: string;
  if (comment) {
    taskSpecificPrompt = `
ユーザーのコメント: ${comment}

## 指示
上記の入力情報（特に「ユーザーのコメント」）から、ユーザーが**何をしたか**を推測し、その活動について具体的に褒めてください。
例えば「Reactの勉強をした」なら『プログラミング』、「ベンチプレスを頑張った」なら『筋トレ』のように、活動内容をキーワードとして含めてください。
`;
  } else {
    taskSpecificPrompt = `
## 指示
ユーザーは「勉強」を頑張りました。その頑張りを褒めてください。
`;
  }

  const finalPrompt = `
${basePrompt}
${taskSpecificPrompt}

## 出力形式
- 2時間以上活動を頑張った場合は「ニャー」などの口癖を入れてください。
- Discordで表示するのに適した、最大3行程度の短い文章でお願いします。
- 必ずユーザー名（${userName}）を呼んであげてください。

## 例
- 「${userName}、今日はよくやったなー！早く群馬に遊びに来いよ〜」
- 「${userName}、その調子で頑張れ、応援してるぞ〜、自分にも俺にもおやつをくれ〜」
- 「${userName}、おつかれ〜俺みたいにちゃんと寝て休めよ〜」
- 「ニャー！そんなに頑張ったのかーゆっくり休めよ〜！その後は俺と遊べ〜」
`;

  try {
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error fetching praise from Gemini:", error);
    return "すみません、うまく褒め言葉を思いつけませんでした…。でも、頑張りましたね！";
  }
}
