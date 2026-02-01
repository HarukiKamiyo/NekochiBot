FROM node:22.14.0-alpine

# 作業ディレクトリを作成して移動
WORKDIR /app

# package.json と package-lock.json と tsconfig.json をコピー
COPY package*.json ./
COPY tsconfig.json ./

# 依存関係をインストール
RUN npm install

# TypeScript のソースコードをコピー
COPY src ./src

# TypeScript をビルド
RUN npm run build

# 起動コマンドを設定 (ビルド後の JavaScript ファイルを実行)
CMD [ "node", "dist/index.js" ]

# アプリケーションがリッスンするポートを公開 (もし HTTP サーバーを立てるなら)
EXPOSE 3000