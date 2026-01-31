# Nekochi Bot 開発ガイド

## 🤖 開発環境と本番環境の使い分け

このプロジェクトでは、開発中の動作確認と本番運用で **2つの異なるBot（アカウント）** を使い分けています。

| 環境            | 用途               | 稼働場所         | 使用するBot                   |
| :-------------- | :----------------- | :--------------- | :---------------------------- |
| **Development** | 機能開発・デバッグ | ローカルPC (Mac) | **デバッグ用Bot** (Dev Token) |
| **Production**  | 実際の運用         | Koyeb (クラウド) | **本番用Bot** (Prod Token)    |

---

## 🔑 環境変数の設定

Botを動かすには `.env` ファイルの設定が必要です。
`TOKEN` と `APPLICATION_ID` は必ず **同じBotのペア** を設定してください。

### 1. ローカル開発用 (`.env`)

ローカルで開発する際は、**デバッグ用Bot** の情報を記述します。

```env
# デバッグ用Botのトークン
TOKEN=MTE... (Dev Bot Token)

# デバッグ用BotのID (Discord Developer Portalの "Application ID")
APPLICATION_ID=12345... (Dev Bot ID)

# その他設定
GEMINI_API_KEY=...
TARGET_VOICE_CHANNEL_ID=...
NOTIFICATION_CHANNEL_ID=...

```

### 2. 本番環境 (Koyeb)

Koyebの「Secrets」には、**本番用Bot** の情報を設定しています。

- `TOKEN`: 本番用Botのトークン
- `APPLICATION_ID`: 本番用BotのID
- (その他APIキーなど)

---

## 🚀 スラッシュコマンドの登録・更新

Botの起動を高速化するため、**コマンドの登録処理はBot起動時（`npm start`）には行われません。**
コマンドの内容（説明文やオプションなど）を変更した時だけ、以下の手順で手動更新してください。

### 開発用Botのコマンドを更新する場合

ローカルの `.env` がデバッグ用Botになっていることを確認し、以下を実行します。

```bash
npm run deploy
```

### 本番用Botのコマンドを更新する場合

以下のどちらかの方法で行います。

#### 方法A: ローカルから一時的に更新（推奨）

1. ローカルの `.env` の `TOKEN` と `APPLICATION_ID` を **本番用Botのもの** に書き換える。
2. `npm run deploy` を実行する。
3. 終わったら `.env` をデバッグ用に戻す。

#### 方法B: Koyebのコンソールから更新

1. Koyebの管理画面で `Console` を開く。
2. `npm run deploy` と入力して実行する。

---

## 📚 TypeScriptとESMの規約

このプロジェクトは、最新のJavaScript標準である **ES Modules (ESM)** を使用しています。
これに伴い、いくつかの重要な規約があります。

### インポートパスには `.js` 拡張子が必須

`src` ディレクトリ内のTypeScriptファイル (`.ts`) で、他のファイルを `import` する際には、必ずパスの末尾に **`.js`** を付ける必要があります。

```typescript
// OK
import { TOKEN } from "./config.js";

// NG (エラーになります)
import { TOKEN } from "./config";
```

#### なぜ？

1.  **Node.jsのESM仕様:** このプロジェクトは `package.json` で `"type": "module"` と設定されており、ESMとして動作します。Node.jsのESM仕様では、`import` する際に拡張子を含めた完全なファイルパスを明記することが必須となっています。
2.  **実行されるのはJavaScript:** TypeScript (`.ts`) ファイルは、実行前に `tsc` によって JavaScript (`.js`) にコンパイルされ、`dist` ディレクトリに出力されます。実際にNode.jsが実行するのは、このコンパイル後の `.js` ファイルです。
3.  **コンパイル後を見据えた記述:** そのため、TypeScriptのソースコードの段階で、コンパイル後の `import` 文が正しいパス (`./config.js`) を指すように、あらかじめ `.js` 拡張子を付けておく必要があります。

これは `tsconfig.json` の `"moduleResolution": "NodeNext"` 設定によって強制される、モダンなNode.js開発における標準的な作法です。

---

## 🏃‍♂️ Botの起動

### 開発モード (ローカル)

ファイルの変更を検知して自動再起動します。

```bash
npm run dev
```

### 本番モード (Koyeb)

Koyebが自動的に以下のコマンドを実行して起動します。

```bash
npm start
```
