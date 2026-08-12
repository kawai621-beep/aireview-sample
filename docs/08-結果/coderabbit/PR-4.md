# CodeRabbit レビュー結果 — PR #4

PR: https://github.com/kawai621-beep/aireview-sample/pull/4

## レビュー概要
### Review (COMMENTED)

<!-- coderabbit-cli-agent-hint:v3
After fixes: `coderabbit review '-''-agent'`. Missing? Ask user; `curl -fsSL https://cli.coderabbit.ai/install.sh | CRS=ghr1 sh`.
-->

**Actionable comments posted: 5**

<details>
<summary>🤖 Prompt for all review comments with AI agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

Inline comments:
In `@client/src/api/client.ts`:
- Line 1: Update the API_BASE_URL constant so it is not hardcoded to
localhost:3000; source the URL from the deployment environment configuration or
use a same-origin relative path, ensuring browser requests target the deployed
API.
- Line 15: HTTP失敗を成功値として扱わないよう、client/src/api/client.ts:15-15 の apiFetch で
res.ok を検証し、失敗時は構造化エラーを throw してください。client/src/pages/LoginPage.tsx:12-20 ではエラーを
catch してログイン状態を変更せず、失敗を表示してください。client/src/pages/PostListPage.tsx:9-11
ではエラー状態を保持し、エラー本文を投稿配列として処理しないでください。client/src/pages/PostDetailPage.tsx:11-13
でもエラー状態を保持し、エラー本文を投稿詳細として描画しないでください。

In `@client/src/components/MarkdownRenderer.tsx`:
- Around line 3-5: Sanitize the HTML produced in MarkdownRenderer before passing
it to dangerouslySetInnerHTML. Apply DOMPurify or the project’s existing
sanitizer with an explicit allowlist of permitted tags and attributes, then
render only the sanitized result.

In `@client/src/context/AuthContext.tsx`:
- Around line 6-11: 認証をHttpOnly
Cookieに統一するため、client/src/context/AuthContext.tsxのuser初期化ではlocalStorageに保存済みのユーザー情報を復元し、logout処理では/api/auth/logoutを呼び出してサーバー側Cookieも破棄してください。client/src/api/client.tsのapiFetchではlocalStorageのtoken読取を削除し、credentials:
'include'を設定してCookieを送信してください。

In `@client/src/pages/AdminPage.tsx`:
- Around line 4-12: Remove the client-side ADMIN_API_KEY constant and the
X-Admin-Key header from AdminPage’s /api/admin/users request. Rely on the
existing Bearer-token authentication so the server identifies the user and
validates the admin role; keep any required service key exclusively in the
server environment.
```

</details>

<details>
<summary>🪄 Autofix</summary>

Fix all unresolved CodeRabbit comments on this PR:

- [ ] <!-- {"checkboxId": "4b0d0e0a-96d7-4f10-b296-3a18ea78f0b9"} --> Push a commit to this branch (recommended)
- [ ] <!-- {"checkboxId": "ff5b1114-7d8c-49e6-8ac1-43f82af23a33"} --> Create a new PR with the fixes

</details>

---

<details>
<summary>ℹ️ Review info</summary>

<details>
<summary>⚙️ Run configuration</summary>

**Configuration used**: Organization UI

**Review profile**: CHILL

**Plan**: Pro Plus

**Run ID**: `6f4da9a3-9328-4b41-af7a-0004827a0e97`

</details>

<details>
<summary>📥 Commits</summary>

Reviewing files that changed from the base of the PR and between c43b46fbab08dbcbb3d56f29d57f141a66186cf4 and f804a97cd5f29c6245263e18f83c3d6173a36d95.

</details>

<details>
<summary>⛔ Files ignored due to path filters (1)</summary>

* `package-lock.json` is excluded by `!**/package-lock.json`

</details>

<details>
<summary>📒 Files selected for processing (11)</summary>

* `client/package.json`
* `client/src/App.tsx`
* `client/src/api/client.ts`
* `client/src/components/MarkdownRenderer.tsx`
* `client/src/context/AuthContext.tsx`
* `client/src/pages/AdminPage.tsx`
* `client/src/pages/LoginPage.tsx`
* `client/src/pages/PostDetailPage.tsx`
* `client/src/pages/PostListPage.tsx`
* `client/src/utils/date.ts`
* `server/src/utils/date.ts`

</details>

</details>

<!-- This is an auto-generated comment by CodeRabbit for review status -->


## インラインコメント
### client/src/api/client.ts:1

_🎯 Functional Correctness_ | _🟠 Major_ | _⚡ Quick win_

**本番 API URL を固定しないでください。**

`http://localhost:3000` は利用者のブラウザで解決されます。本番環境では利用者の端末上の port 3000 を参照するため、API 呼び出しが失敗します。

デプロイ環境ごとに設定した API URL、または同一オリジンの相対パスを使用してください。

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@client/src/api/client.ts` at line 1, Update the API_BASE_URL constant so it
is not hardcoded to localhost:3000; source the URL from the deployment
environment configuration or use a same-origin relative path, ensuring browser
requests target the deployed API.
```

</details>

<!-- fingerprinting:phantom:poseidon:tapir -->

<!-- cr-indicator-types:potential_issue -->

<!-- cr-comment:v1:123fdeeb3ff7702417933ce3 -->

<!-- This is an auto-generated comment by CodeRabbit -->

### client/src/api/client.ts:15

_🎯 Functional Correctness_ | _🟠 Major_ | _⚡ Quick win_

**HTTP 失敗を成功レスポンスとして処理しないでください。**

`apiFetch` は 401 や 500 の JSON 本文を正常値として返します。ログイン画面はその値で `login(res)` を実行してホームへ遷移します。投稿ページはエラー本文を投稿データとして処理します。

- `client/src/api/client.ts#L15-L15`: `res.ok` が false の場合は構造化したエラーを throw してください。
- `client/src/pages/LoginPage.tsx#L12-L20`: エラーを catch し、ログイン状態を変更せず、利用者に失敗を表示してください。
- `client/src/pages/PostListPage.tsx#L9-L11`: エラー状態を保持し、投稿配列としてエラー本文を処理しないでください。
- `client/src/pages/PostDetailPage.tsx#L11-L13`: エラー状態を保持し、投稿詳細としてエラー本文を描画しないでください。

<details>
<summary>📍 Affects 4 files</summary>

- `client/src/api/client.ts#L15-L15` (this comment)
- `client/src/pages/LoginPage.tsx#L12-L20`
- `client/src/pages/PostListPage.tsx#L9-L11`
- `client/src/pages/PostDetailPage.tsx#L11-L13`

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@client/src/api/client.ts` at line 15,
HTTP失敗を成功値として扱わないよう、client/src/api/client.ts:15-15 の apiFetch で res.ok
を検証し、失敗時は構造化エラーを throw してください。client/src/pages/LoginPage.tsx:12-20 ではエラーを catch
してログイン状態を変更せず、失敗を表示してください。client/src/pages/PostListPage.tsx:9-11
ではエラー状態を保持し、エラー本文を投稿配列として処理しないでください。client/src/pages/PostDetailPage.tsx:11-13
でもエラー状態を保持し、エラー本文を投稿詳細として描画しないでください。
```

</details>

<!-- consolidated_sites_start -->
<!--
<consolidated_sites>
<site>
<role>anchor</role>
<file>client/src/api/client.ts</file>
<line_range>15-15</line_range>
</site>
<site>
<role>sibling</role>
<file>client/src/pages/LoginPage.tsx</file>
<line_range>12-20</line_range>
</site>
<site>
<role>sibling</role>
<file>client/src/pages/PostListPage.tsx</file>
<line_range>9-11</line_range>
</site>
<site>
<role>sibling</role>
<file>client/src/pages/PostDetailPage.tsx</file>
<line_range>11-13</line_range>
</site>
</consolidated_sites>
-->
<!-- consolidated_sites_end -->

<!-- fingerprinting:phantom:poseidon:tapir -->

<!-- cr-indicator-types:potential_issue -->

<!-- cr-comment:v1:3d2c6af2a0bf8192e8023bdc -->

<!-- This is an auto-generated comment by CodeRabbit -->

### client/src/components/MarkdownRenderer.tsx:5

_🔒 Security & Privacy_ | _🟠 Major_ | _⚡ Quick win_

<details>
<summary>🧩 Analysis chain</summary>

🌐 Web query:

`For marked 12.0.2, does marked.parse sanitize raw HTML? What documented DOMPurify integration is recommended before passing its output to React dangerouslySetInnerHTML?`

💡 Result:

No, marked (including version 12.0.2) does not sanitize its output HTML [1][2][3]. The library maintainers explicitly removed built-in sanitization features in previous versions (v8.0.0+) to emphasize that sanitization is a complex, evolving security task that should be handled by dedicated, purpose-built libraries [4][3]. Marked returns the parsed HTML exactly as the input Markdown describes, which may include raw HTML tags or malicious attributes [3]. To securely render Markdown in React using dangerouslySetInnerHTML, you must sanitize the output produced by marked before passing it to the component [3][5]. The recommended integration approach is to use DOMPurify [1][6][3]. Recommended Implementation Pattern: 1. Parse the Markdown to HTML using marked. 2. Sanitize the resulting HTML string with DOMPurify. 3. Pass the sanitized string to dangerouslySetInnerHTML [7][5]. Example: import { marked } from 'marked'; import DOMPurify from 'dompurify'; function MarkdownPreview({ markdown }) { // 1. Convert Markdown to HTML (returns raw, potentially unsafe string) const rawHtml = marked.parse(markdown); // 2. Sanitize the output using an allowlist (strips scripts, event handlers, etc.) const cleanHtml = DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'code', 'pre'], ALLOWED_ATTR: ['href', 'title'] }); // 3. Render safely return <div dangerouslySetInnerHTML={{ html: cleanHtml }} />; } Security Note: Always sanitize the output of marked, not the input, to ensure the sanitizer can correctly process the final structure and to avoid breaking valid Markdown syntax [3][8][7]. Configuring DOMPurify with an explicit allowlist (as shown above) is highly recommended over default settings to minimize the attack surface [7].

Citations:

- 1: https://marked.js.org/
- 2: https://npmx.dev/package/marked/v/12.0.2
- 3: https://safeguard.sh/resources/blog/marked-npm
- 4: https://marked.js.org/using_advanced
- 5: https://www.beforemerge.com/rules/41c63d98-sanitize-all-html-before-using-dangerouslysetinnerhtml
- 6: https://www.npmjs.com/package/marked
- 7: https://reactz2h.com/chapter_12_frontend_security_for_react/series_01_xss_and_injection_defense/sanitizing_rich_text_dompurify
- 8: https://github.com/markedjs/marked/pull/2462

---

🏁 Script executed:

```shell
#!/bin/bash
set -eu

printf '%s\n' '--- MarkdownRenderer.tsx ---'
cat -n client/src/components/MarkdownRenderer.tsx

printf '%s\n' '--- MarkdownRenderer usages ---'
rg -n -C 3 'MarkdownRenderer|content' client/src/pages client/src/components -g '*.tsx'

printf '%s\n' '--- package manifests and sanitizer dependencies ---'
find . -maxdepth 3 \( -name 'package.json' -o -name 'package-lock.json' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' \) -print
rg -n 'marked|dompurify|sanitize-html|rehype-sanitize' --glob 'package.json' --glob '*lock*' .
```

Repository: kawai621-beep/aireview-sample

Length of output: 7369

---



</details>

**`marked.parse` の出力をサニタイズしてください。**

API の投稿とコメントを未サニタイズで `dangerouslySetInnerHTML` に渡すと、raw HTML やイベント属性による XSS が発生します。DOMPurify などで、許可するタグと属性を明示してから挿入してください。

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 ast-grep (0.45.1)</summary>

[warning] 4-4: Usage of dangerouslySetInnerHTML detected. This bypasses React's built-in XSS protection. Always sanitize HTML content using libraries like DOMPurify before injecting it into the DOM to prevent XSS attacks.
Context: dangerouslySetInnerHTML
Note: [CWE-79] Improper Neutralization of Input During Web Page Generation

(react-unsafe-html-injection)

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@client/src/components/MarkdownRenderer.tsx` around lines 3 - 5, Sanitize the
HTML produced in MarkdownRenderer before passing it to dangerouslySetInnerHTML.
Apply DOMPurify or the project’s existing sanitizer with an explicit allowlist
of permitted tags and attributes, then render only the sanitized result.
```

</details>

<!-- fingerprinting:phantom:poseidon:tapir -->

<!-- cr-indicator-types:potential_issue -->

<!-- cr-comment:v1:78f6c622c5a83e116cb3fcc3 -->

_Source: Linters/SAST tools_

<!-- This is an auto-generated comment by CodeRabbit -->

### client/src/context/AuthContext.tsx:11

_🔒 Security & Privacy_ | _🟠 Major_ | _🏗️ Heavy lift_

<details>
<summary>🧩 Analysis chain</summary>

🏁 Script executed:

```shell
#!/bin/bash
set -euo pipefail

ast-grep outline client/src/context/AuthContext.tsx --items all
rg -n -C 3 'localStorage\.(getItem|setItem|removeItem)\(|Authorization|/api/auth/login|token' client server
```

Repository: kawai621-beep/aireview-sample

Length of output: 6651

---

🏁 Script executed:

```shell
#!/bin/bash
set -euo pipefail

for f in \
  client/src/context/AuthContext.tsx \
  client/src/api/client.ts \
  client/src/pages/LoginPage.tsx \
  client/src/pages/PostListPage.tsx \
  client/src/pages/PostDetailPage.tsx \
  server/src/routes/auth.routes.ts \
  server/src/auth/middleware.ts
do
  echo "===== $f ====="
  wc -l "$f"
  cat -n "$f"
done

echo "===== client fetch call sites ====="
rg -n -C 4 'apiFetch\(|credentials|setUser|useAuth\(' client/src

echo "===== server route and CORS configuration ====="
rg -n -C 5 'cors\(|cookieParser|requireAuth|res\.cookie|clearCookie|app\.use' server/src
```

Repository: kawai621-beep/aireview-sample

Length of output: 23146

---

🏁 Script executed:

```shell
#!/bin/bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path
import re

auth = Path("client/src/context/AuthContext.tsx").read_text()
client = Path("client/src/api/client.ts").read_text()
login = Path("client/src/pages/LoginPage.tsx").read_text()
server = Path("server/src/routes/auth.routes.ts").read_text()
middleware = Path("server/src/auth/middleware.ts").read_text()
app = Path("server/src/app.ts").read_text()

checks = {
    "client persists user": "localStorage.setItem('user'" in auth,
    "client restores user during initialization": bool(
        re.search(r'useState\s*\(\s*\(\s*\)\s*=>|useEffect\s*\(', auth)
    ),
    "client reads localStorage token": "localStorage.getItem('token')" in client,
    "client sends credentials": bool(re.search(r"credentials\s*:", client)),
    "login sends cookie auth": "res.cookie('token'" in server,
    "protected routes read cookie token": "req.cookies?.token" in middleware,
    "server allows credentialed CORS": "credentials: true" in app,
    "login passes response to login": bool(re.search(r"login\s*\(\s*res\s*\)", login)),
}

for name, result in checks.items():
    print(f"{name}: {'YES' if result else 'NO'}")

if "res.cookie('token'" in server and "localStorage.getItem('token')" in client:
    print("CONTRACT_MISMATCH: server uses an HttpOnly cookie, client reads localStorage token")
if "res.cookie('token'" in server and not re.search(r"credentials\s*:", client):
    print("COOKIE_NOT_ENABLED: apiFetch does not configure credentialed requests")
if "localStorage.setItem('user'" in auth and not checks["client restores user during initialization"]:
    print("USER_NOT_RESTORED: AuthProvider initializes user as null without loading persisted user")
PY
```

Repository: kawai621-beep/aireview-sample

Length of output: 689

---



</details>

**認証方式を HttpOnly Cookie に統一してください。**

サーバーは `token` を HttpOnly Cookie に設定し、保護されたAPIもCookieだけを読みます。`apiFetch` は `localStorage` の `token` を読み、`credentials: 'include'` も指定しないため、ログイン後も認証Cookieが送信されません。

- `client/src/api/client.ts#L5-L12`: `localStorage` のtoken読取を削除し、`credentials: 'include'` を設定してください。
- `client/src/context/AuthContext.tsx#L6-L15`: 初期状態で保存済みの `user` を復元してください。ログアウト時は `/api/auth/logout` を呼び、サーバー側のCookieも破棄してください。

<details>
<summary>📍 Affects 2 files</summary>

- `client/src/context/AuthContext.tsx#L6-L11` (this comment)
- `client/src/api/client.ts#L5-L5`

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@client/src/context/AuthContext.tsx` around lines 6 - 11, 認証をHttpOnly
Cookieに統一するため、client/src/context/AuthContext.tsxのuser初期化ではlocalStorageに保存済みのユーザー情報を復元し、logout処理では/api/auth/logoutを呼び出してサーバー側Cookieも破棄してください。client/src/api/client.tsのapiFetchではlocalStorageのtoken読取を削除し、credentials:
'include'を設定してCookieを送信してください。
```

</details>

<!-- consolidated_sites_start -->
<!--
<consolidated_sites>
<site>
<role>anchor</role>
<file>client/src/context/AuthContext.tsx</file>
<line_range>6-11</line_range>
</site>
<site>
<role>sibling</role>
<file>client/src/api/client.ts</file>
<line_range>5-5</line_range>
</site>
</consolidated_sites>
-->
<!-- consolidated_sites_end -->

<!-- fingerprinting:phantom:poseidon:tapir -->

<!-- cr-indicator-types:potential_issue -->

<!-- cr-comment:v1:3d50a5f673c6e1c92e6f9663 -->

<!-- This is an auto-generated comment by CodeRabbit -->

### client/src/pages/AdminPage.tsx:12

_🔒 Security & Privacy_ | _🔴 Critical_ | _⚡ Quick win_

**クライアントに管理者キーを置かないでください。**

`ADMIN_API_KEY` はブラウザへ配布されます。利用者は値を取得し、`X-Admin-Key` を付けたリクエストを任意に送信できます。サーバーがこのキーを管理者認証として信頼すると、未認証の利用者がメールアドレスを含むユーザー一覧を取得できます。

`X-Admin-Key` と `ADMIN_API_KEY` を削除してください。サーバーは既存のBearerトークンからユーザーを識別し、サーバー側で管理者ロールを検証してください。管理用のサービスキーが必要な場合は、ブラウザではなくサーバー環境だけに保持してください。

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In `@client/src/pages/AdminPage.tsx` around lines 4 - 12, Remove the client-side
ADMIN_API_KEY constant and the X-Admin-Key header from AdminPage’s
/api/admin/users request. Rely on the existing Bearer-token authentication so
the server identifies the user and validates the admin role; keep any required
service key exclusively in the server environment.
```

</details>

<!-- fingerprinting:phantom:poseidon:tapir -->

<!-- cr-indicator-types:potential_issue -->

<!-- cr-comment:v1:c3d96a44b53389962ab1f17e -->

<!-- This is an auto-generated comment by CodeRabbit -->

