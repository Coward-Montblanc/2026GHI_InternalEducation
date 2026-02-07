# 2026GHI_InternalEducation
2026年GHI内定教育プロジェクト

コミット時にアップロードを控えることを推奨する項目

以下のファイル・データは GitHub にコミットしないでください。

.env（パスワード、トークン、DB 接続情報などの機密情報）

証明書／鍵ファイル（*.pem, *.pfx, id_rsa など）

DB の実データファイル（原則として）

ビルド成果物
(dist/, build/, node_modules/ など)

ライブラリ追加時のルール

新しいライブラリをインストールした場合は、
以下の 依存関係管理ファイルも必ず一緒にコミットしてください。

package.json

package-lock.json（または yarn.lock / pnpm-lock.yaml 等）

※ これにより、チームメンバー全員が同一の環境を再現できます。

初期データについて

必要な初期データは
seed.sql や マイグレーションファイルとして提供してください。

推奨 Docker プロジェクト構成
repo/
  frontend/
  backend/
  db/
    init/           (初期 SQL / seed)
  docker-compose.yml
  .env.example
  README.md
  .gitignore

※ パスワード等の機密情報は
docker-compose.yml に直接記述せず、${DB_PASSWORD} のように
環境変数として切り出してください。

実際の値は .env（ローカル環境のみ）で管理することを推奨します。

docker-compose 設計ルール（推奨）
サービス名は固定

以下のサービス名を必ず使用してください。

frontend

backend

db

環境変数管理

環境変数は .env で管理

リポジトリには .env.example を必ず含める

.env は .gitignore に追加し、コミット禁止

セキュリティルール

docker-compose にパスワードやキーをハードコードしないこと

ポート設計

基本ポートはチーム内で 標準値を固定
（例：Frontend 1111 / API 2222 / DB 3333）

ポート競合が発生する場合は
docker-compose.override.yml または .env で調整すること
（基本の compose ファイルは極力変更しない）

サービス依存関係

backend は db に依存する構成とする

可能であれば db に healthcheck を設定し、
depends_on: condition: service_healthy を使用すること
（対応する compose バージョンの場合）

DB 初期化

db/init/ フォルダを DB コンテナにマウントし、
初期 SQL / seed を自動適用すること

初期化スクリプトは 複数回実行しても問題が起きない設計にすること

データ永続化

DB データは named volume を使用して保持する

初期化からやり直したい場合は
docker compose down -v を使用する

ネットワーク

Docker ネットワークは 基本 1 つに統一する
