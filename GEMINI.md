# Gemini API 連携ガイド

このドキュメントでは、Nekochi BotにおけるGoogle Gemini APIとの連携について説明します。

## 1. Gemini APIの利用設定

Gemini APIを利用するには、Google CloudまたはGoogle AI StudioでAPIキーを取得し、プロジェクトの環境変数に設定する必要があります。

- **環境変数:** `GEMINI_API_KEY`
- **設定場所:** `.env` ファイル (ローカル開発時) または Koyeb の Secrets (本番環境)

## 2. Gemini APIの統合 (`src/gemini.ts`)

`src/gemini.ts` ファイルは、Gemini APIとの通信を抽象化する役割を担っています。

- `GoogleGenerativeAI` ライブラリを使用してGemini APIを初期化します。
- `getPraiseFromGemini` 関数を提供し、特定のプロンプト（勉強時間に対する褒め言葉）をGeminiに送信し、その応答を返します。
- Geminiへのプロンプトは、Discordでの表示に適した最大5行程度の短い文章になるよう調整されています。

## 3. Gemini APIを使用する機能

### 3.1. スラッシュコマンド `/gemini`

ユーザーがGeminiと直接対話するためのコマンドです。

- **使用方法:** `/gemini prompt: <あなたの質問>`
- **目的:** ユーザーからの質問に対して、Geminiが簡潔な回答を生成します。

### 3.2. スラッシュコマンド `/log`

ユーザーが手動で勉強時間を記録し、Geminiに褒めてもらうためのコマンドです。

- **使用方法:** `/log hours: <時間> minutes: <分>` (例: `/log hours: 1 minutes: 30`)
- **目的:** 入力された勉強時間に基づき、Geminiがユーザーの頑張りを名前入りで褒めます。

### 3.3. ボイスチャンネル退出時の自動褒め言葉 (`src/events/voiceStateUpdate.ts`)

特定の「勉強部屋」ボイスチャンネルからユーザーが退出した際に、自動的にGeminiが勉強時間を計算し、その頑張りを褒めます。

- **トリガー:** ユーザーが `TARGET_VOICE_CHANNEL_ID` で指定されたボイスチャンネルから退出した時。
- **動作:** 滞在時間（勉強時間）が計算され、`getPraiseFromGemini` を通じてGeminiが褒め言葉を生成し、`NOTIFICATION_CHANNEL_ID` で指定されたチャンネルに通知されます。

## 4. プロンプトエンジニアリング

Geminiからの応答がDiscordのチャットに適した形式になるよう、プロンプトには以下の制約が含まれています。

- 「返信はDiscordで表示するのに適した、最大5行程度の短い文章でお願いします。」

これにより、冗長な応答を避け、ユーザーフレンドリーな体験を提供しています。
