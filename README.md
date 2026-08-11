# AIREVIEW Sample

CodeRabbit / cubic.dev の **AI コードレビュー性能を比較するため**のサンプルリポジトリです。

本リポジトリは、**意図的に多数の問題（N+1・セキュリティホール・可読性の欠如・メンテナンス性の低下など）を埋め込んだ** ブログ/CMS アプリです。実際のレビュー性能を比較するために用います。**本番運用しないでください。**

## 構成

- `server/` — Express + Prisma + SQLite（バックエンド API）
- `client/` — React + Vite（フロントエンド SPA）
- `shared/` — 共通型定義
- `docs/` — 仕様書・埋め込んだ問題一覧・比較フロー・採点方法

詳細は [`docs/00-目的と方針.md`](docs/00-目的と方針.md) から。問題一覧は [`docs/05-埋め込んだ問題一覧.md`](docs/05-埋め込んだ問題一覧.md)。

## セットアップ

```bash
npm install
npm run db:generate              # Prisma Client の生成
cp server/.env.example server/.env
npm run dev:server               # ターミナル1: API (http://localhost:3000)
npm run dev:client               # ターミナル2: SPA (http://localhost:5173)
```

## ブランチ構成

`main` ブランチには**健康な骨組みのみ**を置き、問題はカテゴリ別の feature ブランチ（PR）に分割しています。これにより、両レビューツールが同一の PR 差分を入力として比較できます。

| PR | ブランチ | カテゴリ |
|---|---|---|
| PR-1 | `feature/backend-auth` | 認証・認可・入力 |
| PR-2 | `feature/backend-posts` | N+1・SQLi・IDOR・可読性 |
| PR-3 | `feature/backend-ops` | 並行性・TZ・リソース・情報漏洩 |
| PR-4 | `feature/frontend` | XSS・秘密・型・重複 |

詳細は [`docs/06-PR分割と比較フロー.md`](docs/06-PR分割と比較フロー.md)。

## ⚠️ 注意

- このコードには意図的な脆弱性・アンチパターンが含まれます。他プロジェクトに流用しないでください。
- 比較評価のためのコードであり、セキュア・本番品質ではありません。
