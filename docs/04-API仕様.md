# 04. API 仕様

> 本仕様は **「あるべき姿」** を記載したものです。実際の実装には意図的な問題が含まれます（[05-埋め込んだ問題一覧](./05-埋め込んだ問題一覧.md) 参照）。

## 1. 共通仕様

- **ベース URL**: `http://localhost:3000`
- **リクエスト/レスポンス**: JSON（`Content-Type: application/json`）
- **認証**: 認証が必要なエンドポイントは httpOnly Cookie の JWT で認証。
- **日時**: すべて UTC（ISO 8601）で扱うのが理想。

## 2. エンドポイント一覧

### 2.1 認証（`/api/auth`）

| Method | Path | 認証 | 権限 | 説明 |
|---|---|---|---|---|
| POST | `/api/auth/register` | 不要 | — | 新規ユーザ登録 |
| POST | `/api/auth/login` | 不要 | — | ログイン（JWT を Cookie にセット） |
| POST | `/api/auth/logout` | 必要 | — | ログアウト（Cookie を破棄） |
| POST | `/api/auth/refresh` | 必要 | — | JWT の再発行 |

### 2.2 投稿（`/api/posts`）

| Method | Path | 認証 | 権限 | 説明 |
|---|---|---|---|---|
| GET | `/api/posts` | 不要 | — | 投稿一覧（ページング・ソート付き） |
| GET | `/api/posts/:id` | 不要 | — | 投稿詳細（コメント付き） |
| POST | `/api/posts` | 必要 | — | 投稿作成 |
| PUT | `/api/posts/:id` | 必要 | **投稿者のみ** | 投稿更新（IDOR 注意） |
| DELETE | `/api/posts/:id` | 必要 | **投稿者のみ** | 投稿削除 |
| GET | `/api/posts/feed` | 必要 | — | フォロー中ユーザのフィード |
| POST | `/api/posts/:id/like` | 必要 | — | 投稿にいいね |
| GET | `/api/posts/search` | 不要 | — | 投稿検索（キーワード） |

### 2.3 コメント（`/api/posts/:id/comments`, `/api/comments`）

| Method | Path | 認証 | 権限 | 説明 |
|---|---|---|---|---|
| POST | `/api/posts/:id/comments` | 必要 | — | コメント作成 |
| DELETE | `/api/comments/:id` | 必要 | **投稿者または管理者** | コメント削除（IDOR 注意） |

### 2.4 管理者（`/api/admin`）

| Method | Path | 認証 | 権限 | 説明 |
|---|---|---|---|---|
| GET | `/api/admin/users` | 必要 | **管理者のみ** | 全ユーザ一覧 |

### 2.5 デバッグ・ヘルス

| Method | Path | 認証 | 権限 | 説明 |
|---|---|---|---|---|
| GET | `/health` | 不要 | — | ヘルスチェック（`{ status: "ok" }`） |
| GET | `/debug/state` | 不要 | — | 内部状態ダンプ（**開発環境のみ**） |

## 3. リクエスト/レスポンス形式（代表例）

### 3.1 POST /api/auth/register

**リクエスト**
```json
{
  "email": "alice@example.com",
  "username": "alice",
  "password": "p@ssw0rd-very-strong"
}
```

**レスポンス**（201 Created）
```json
{
  "user": {
    "id": "u_01",
    "email": "alice@example.com",
    "username": "alice",
    "role": 0
  }
}
```

### 3.2 POST /api/auth/login

**リクエスト**
```json
{
  "email": "alice@example.com",
  "password": "p@ssw0rd-very-strong"
}
```

**レスポンス**（200 OK）
- Body にはトークンを含めず、httpOnly Cookie に JWT をセットして返す。

```http
Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Lax
```

### 3.3 GET /api/posts（一覧）

**クエリパラメータ**

| 名前 | 型 | 説明 |
|---|---|---|
| `page` | number | ページ番号（1始まり） |
| `limit` | number | 1ページあたりの件数 |
| `sortBy` | string | ソートキー（`createdAt`, `likes` など許可リスト内） |
| `order` | string | `asc` / `desc` |

**レスポンス**（200 OK）
```json
{
  "posts": [
    {
      "id": "p_01",
      "title": "はじめての投稿",
      "body": "...",
      "author": { "id": "u_01", "username": "alice" },
      "likes": 3,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "total": 42
}
```

> 各投稿に `author` を **一括取得で** ネストするのが理想（N+1 回避）。

### 3.4 POST /api/posts/:id/like

**レスポンス**（200 OK）
```json
{ "id": "p_01", "likes": 4 }
```

## 4. エラーレスポンス形式

エラーは一貫したフォーマットで返します。**本番では内部情報（スタックトレース等）を含めない** のが理想です。

**レスポンス例**（400 Bad Request）
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "リクエストが不正です"
  }
}
```

**代表的なステータスコード**

| ステータス | code | 意味 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 入力バリデーション失敗 |
| 401 | `UNAUTHORIZED` | 認証が必要、または認証失敗 |
| 403 | `FORBIDDEN` | 認可失敗（権限不足） |
| 404 | `NOT_FOUND` | リソース不在 |
| 429 | `RATE_LIMITED` | レートリミット超過 |
| 500 | `INTERNAL_ERROR` | サーバ内部エラー |

## 5. 関連ドキュメント

- [02-アーキテクチャ](./02-アーキテクチャ.md)
- [03-データモデル](./03-データモデル.md)
- [05-埋め込んだ問題一覧](./05-埋め込んだ問題一覧.md)
