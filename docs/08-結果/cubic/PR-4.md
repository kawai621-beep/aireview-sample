# cubic レビュー結果 — PR #4

PR: https://github.com/kawai621-beep/aireview-sample/pull/4

## レビュー概要
### Review (COMMENTED)

<!-- cubic:review-summary:start -->
**19 issues found** across 12 files
<!-- cubic:review-summary:end -->

<details>
<summary>Prompt for AI agents (unresolved issues)</summary>

```text

Check if these issues are valid — if so, understand the root cause of each and fix them. If appropriate, use sub-agents to investigate and fix each issue separately.


<file name="client/src/components/MarkdownRenderer.tsx">

<violation number="1" location="client/src/components/MarkdownRenderer.tsx:5">
P0: Rendering user-supplied Markdown with `marked.parse` into `dangerouslySetInnerHTML` is a stored XSS vector. `marked` does not strip raw HTML, so a comment or post containing `<img src=x onerror=...>` or `<script>` will execute in the viewer's browser, and content is author-controlled by any authenticated user. Sanitize the generated HTML before injecting, e.g. wrap the output with DOMPurify (`DOMPurify.sanitize(marked.parse(content))`) and add `dompurify` as a dependency.</violation>
</file>

<file name="server/src/utils/date.ts">

<violation number="1" location="server/src/utils/date.ts:1">
P3: This `formatDate` duplicates the helper already added in `client/src/utils/date.ts`, but with a different output format (server uses `-` separators, client uses `/`), and it is currently unused anywhere in the server code. Keeping two divergent copies is a consistency/maintainability hazard — if either is later used for user-facing dates the formats will disagree. Consider extracting a shared helper (e.g. into `@aireview/shared`) or removing the unused server copy until it is actually needed.</violation>
</file>

<file name="client/src/pages/PostListPage.tsx">

<violation number="1" location="client/src/pages/PostListPage.tsx:10">
P2: An HTTP error response replaces `posts` with an error object, causing `posts.map` to crash the page; network/JSON failures also become unhandled rejections. Validate the response as an array and handle rejection with explicit loading/error UI before updating `posts`.</violation>
</file>

<file name="client/src/pages/AdminPage.tsx">

<violation number="1" location="client/src/pages/AdminPage.tsx:4">
P0: The admin endpoint is protected by a secret key that is hardcoded in the client bundle (`admin-secret-key-98765`). Because this value ships to every browser, any user can extract it from the frontend source and forge the `X-Admin-Key` header to reach `/api/admin/users` directly, so the admin screen provides no real security. Admin authorization should be enforced server-side (e.g., via the authenticated session/JWT role check rather than a hand-rolled secret, or by never letting the browser hold the credential at all).</violation>

<violation number="2" location="client/src/pages/AdminPage.tsx:12">
P2: A failed admin-users request is displayed as an empty list and the rejected promise is left unhandled. Consider catching the request failure and rendering an explicit error state so administrators can distinguish failure from “no users.”</violation>
</file>

<file name="client/src/utils/date.ts">

<violation number="1" location="client/src/utils/date.ts:2">
P3: Malformed or unexpected API timestamps render as `NaN/NaN/NaN NaN:NaN` because the parsed date is never validated. Consider checking `Number.isNaN(d.getTime())` and returning an intentional placeholder or error before formatting.</violation>
</file>

<file name="client/src/pages/LoginPage.tsx">

<violation number="1" location="client/src/pages/LoginPage.tsx:14">
P0: Login cannot establish the server session: `apiFetch` is cross-origin and omits `credentials: 'include'`, so the JWT returned only in `Set-Cookie` is not retained for authenticated endpoints. The API client should send cookie credentials (or use the same-origin proxy), with CORS configured to allow the explicit frontend origin.</violation>

<violation number="2" location="client/src/pages/LoginPage.tsx:26">
P3: Both credential fields lack persistent accessible labels, leaving screen-reader and voice-input users without reliable field names once placeholders disappear. Associate visible `<label>` elements with each input; email and autocomplete semantics also improve browser/password-manager behavior.</violation>
</file>

<file name="client/src/context/AuthContext.tsx">

<violation number="1" location="client/src/context/AuthContext.tsx:6">
P2: A page reload always resets `user` to `null`, even after `login` persisted it to `localStorage`. Initialize the state from the stored value (with malformed-data handling), or remove the persistence write if reload persistence is not intended.</violation>

<violation number="2" location="client/src/context/AuthContext.tsx:13">
P1: Calling `logout` leaves the server's httpOnly authentication cookie valid, so subsequent authenticated requests can continue under the old session. The logout flow should call `/api/auth/logout` before clearing local user state.</violation>
</file>

<file name="client/src/api/client.ts">

<violation number="1" location="client/src/api/client.ts:1">
P0: Login cannot establish an authenticated session in dev, and production requests target each user's localhost: this absolute URL bypasses the Vite proxy while cross-origin fetch omits cookies. Using the proxied same-origin `/api` paths avoids both failures; alternatively configure a deployment base URL and include credentials.</violation>

<violation number="2" location="client/src/api/client.ts:2">
P0: Every visitor can extract `API_KEY` and `INTERNAL_DEBUG_KEY` from the browser bundle, making these credentials unusable as secrets. Keep API/debug credentials server-side and authorize browser requests with the user session instead.</violation>

<violation number="3" location="client/src/api/client.ts:5">
P1: Authentication is both ineffective and exposed: the server reads only the HttpOnly `token` cookie, while this code reads a browser-accessible token and sends an ignored `Authorization` header. Remove local-storage token handling and use the cookie session end to end.</violation>

<violation number="4" location="client/src/api/client.ts:12">
P2: Valid `RequestInit.headers` values such as `new Headers(...)` or tuple arrays are not preserved by object spread. Normalize with `Headers` before merging so `apiFetch` honors its declared input type.</violation>

<violation number="5" location="client/src/api/client.ts:15">
P2: `apiFetch` resolves `res.json()` without ever checking `res.ok`, so HTTP error responses resolve as successful data instead of rejecting. Concretely, in LoginPage a failed login (wrong password / 401 / 500) still resolves and `navigate('/')` runs as if authentication succeeded, and any non-JSON error page makes `res.json()` throw an unhandled error. Add a status check that throws on non-2xx so callers can branch on failure.</violation>

<violation number="6" location="client/src/api/client.ts:19">
P3: `INTERNAL_DEBUG_KEY` is exported but never referenced anywhere in the codebase (the only matches are its declaration and the `@ts-ignore` above it). It is dead code shipped in the public API surface of this module. Remove the export (and the redundant `@ts-ignore` that hides the unused/type-checking problem) so the debug override doesn't persist in the client.</violation>
</file>

<file name="client/src/App.tsx">

<violation number="1" location="client/src/App.tsx:30">
P1: Signed-out visitors can follow the visible Admin link, where the 401 response replaces `users` and `users.map` crashes the page; non-admin users are not gated either. Consider rendering this route/link only for an authenticated admin, redirecting others to login, while retaining server-side role authorization.</violation>
</file>

<file name="client/src/pages/PostDetailPage.tsx">

<violation number="1" location="client/src/pages/PostDetailPage.tsx:12">
P2: Rapid navigation between detail URLs can display the wrong post when an older request resolves last; the previous post also remains visible while the new request runs. Reset state and abort or ignore stale requests in the effect cleanup.</violation>

<violation number="2" location="client/src/pages/PostDetailPage.tsx:12">
P2: Missing or failed posts do not reach an error UI: a 404 payload is rendered as a post and can crash Markdown rendering, while network failures leave 「読み込み中...」 forever. Check HTTP success and maintain explicit loading/error states before calling `setPost`.</violation>
</file>
```

</details>

<sub>**Tip**: instead of fixing issues one by one [fix them all with cubic](https://www.cubic.dev/action/fix/pr/kawai621-beep/aireview-sample/4/ai_pr_review_1786439207739_fcf42a7e-732a-481d-907b-b29e84138ec6?entrySource=github_ui_to_cubic_ui)<br /><br />[Re-trigger cubic](https://www.cubic.dev/action/re-review/pr/kawai621-beep/aireview-sample/4/ai_pr_review_1786439207739_fcf42a7e-732a-481d-907b-b29e84138ec6?returnTo=https%3A%2F%2Fgithub.com%2Fkawai621-beep%2Faireview-sample%2Fpull%2F4)</sub>

<!-- cubic:review-post:ai_pr_review_1786439207739_fcf42a7e-732a-481d-907b-b29e84138ec6:f804a97cd5f29c6245263e18f83c3d6173a36d95:1c8aa0c7-378d-4812-8ea7-455cbe52afff -->


## インラインコメント
### client/src/components/MarkdownRenderer.tsx:5

<!-- cubic:v=1c0c9050-665a-4a4f-aad1-b713b46fb2c5 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":9} -->
P0: Rendering user-supplied Markdown with `marked.parse` into `dangerouslySetInnerHTML` is a stored XSS vector. `marked` does not strip raw HTML, so a comment or post containing `<img src=x onerror=...>` or `<script>` will execute in the viewer's browser, and content is author-controlled by any authenticated user. Sanitize the generated HTML before injecting, e.g. wrap the output with DOMPurify (`DOMPurify.sanitize(marked.parse(content))`) and add `dompurify` as a dependency.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/components/MarkdownRenderer.tsx, line 5:

<comment>Rendering user-supplied Markdown with `marked.parse` into `dangerouslySetInnerHTML` is a stored XSS vector. `marked` does not strip raw HTML, so a comment or post containing `<img src=x onerror=...>` or `<script>` will execute in the viewer's browser, and content is author-controlled by any authenticated user. Sanitize the generated HTML before injecting, e.g. wrap the output with DOMPurify (`DOMPurify.sanitize(marked.parse(content))`) and add `dompurify` as a dependency.</comment>

<file context>
@@ -0,0 +1,6 @@
+
+export function MarkdownRenderer({ content }: { content: string }) {
+  const html = marked.parse(content) as string;
+  return <div dangerouslySetInnerHTML={{ __html: html }} />;
+}
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/1c0c9050-665a-4a4f-aad1-b713b46fb2c5" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/AdminPage.tsx:4

<!-- cubic:v=319ab0da-a160-4a89-93b0-fcf9192b2ca4 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":9} -->
P0: The admin endpoint is protected by a secret key that is hardcoded in the client bundle (`admin-secret-key-98765`). Because this value ships to every browser, any user can extract it from the frontend source and forge the `X-Admin-Key` header to reach `/api/admin/users` directly, so the admin screen provides no real security. Admin authorization should be enforced server-side (e.g., via the authenticated session/JWT role check rather than a hand-rolled secret, or by never letting the browser hold the credential at all).

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/AdminPage.tsx, line 4:

<comment>The admin endpoint is protected by a secret key that is hardcoded in the client bundle (`admin-secret-key-98765`). Because this value ships to every browser, any user can extract it from the frontend source and forge the `X-Admin-Key` header to reach `/api/admin/users` directly, so the admin screen provides no real security. Admin authorization should be enforced server-side (e.g., via the authenticated session/JWT role check rather than a hand-rolled secret, or by never letting the browser hold the credential at all).</comment>

<file context>
@@ -0,0 +1,27 @@
+import { useEffect, useState } from 'react';
+import { apiFetch } from '../api/client';
+
+const ADMIN_API_KEY = 'admin-secret-key-98765';
+
+export function AdminPage() {
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/319ab0da-a160-4a89-93b0-fcf9192b2ca4" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/LoginPage.tsx:14

<!-- cubic:v=0d3981fc-7edb-4048-a7db-06d43203bd83 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P0: Login cannot establish the server session: `apiFetch` is cross-origin and omits `credentials: 'include'`, so the JWT returned only in `Set-Cookie` is not retained for authenticated endpoints. The API client should send cookie credentials (or use the same-origin proxy), with CORS configured to allow the explicit frontend origin.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/LoginPage.tsx, line 14:

<comment>Login cannot establish the server session: `apiFetch` is cross-origin and omits `credentials: 'include'`, so the JWT returned only in `Set-Cookie` is not retained for authenticated endpoints. The API client should send cookie credentials (or use the same-origin proxy), with CORS configured to allow the explicit frontend origin.</comment>

<file context>
@@ -0,0 +1,39 @@
+
+  const handleSubmit = async (e: FormEvent) => {
+    e.preventDefault();
+    const res = await apiFetch('/api/auth/login', {
+      method: 'POST',
+      body: JSON.stringify({ email, password }),
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/0d3981fc-7edb-4048-a7db-06d43203bd83" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/api/client.ts:1

<!-- cubic:v=8544d51a-2c56-40c8-a62d-0abc970a6e57 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P0: Login cannot establish an authenticated session in dev, and production requests target each user's localhost: this absolute URL bypasses the Vite proxy while cross-origin fetch omits cookies. Using the proxied same-origin `/api` paths avoids both failures; alternatively configure a deployment base URL and include credentials.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/api/client.ts, line 1:

<comment>Login cannot establish an authenticated session in dev, and production requests target each user's localhost: this absolute URL bypasses the Vite proxy while cross-origin fetch omits cookies. Using the proxied same-origin `/api` paths avoids both failures; alternatively configure a deployment base URL and include credentials.</comment>

<file context>
@@ -0,0 +1,19 @@
+const API_BASE_URL = 'http://localhost:3000';
+const API_KEY = 'sk_test_1234567890abcdef';
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/8544d51a-2c56-40c8-a62d-0abc970a6e57" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/api/client.ts:1

<!-- cubic:v=377bf02e-61a1-4898-bcb1-5fdfa7aba63c -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P0: Every visitor can extract `API_KEY` and `INTERNAL_DEBUG_KEY` from the browser bundle, making these credentials unusable as secrets. Keep API/debug credentials server-side and authorize browser requests with the user session instead.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/api/client.ts, line 2:

<comment>Every visitor can extract `API_KEY` and `INTERNAL_DEBUG_KEY` from the browser bundle, making these credentials unusable as secrets. Keep API/debug credentials server-side and authorize browser requests with the user session instead.</comment>

<file context>
@@ -0,0 +1,19 @@
+const API_BASE_URL = 'http://localhost:3000';
+const API_KEY = 'sk_test_1234567890abcdef';
+
+export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/377bf02e-61a1-4898-bcb1-5fdfa7aba63c" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/context/AuthContext.tsx:13

<!-- cubic:v=0e91cea2-4fcd-479e-aaae-0f6bac2a287f -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P1: Calling `logout` leaves the server's httpOnly authentication cookie valid, so subsequent authenticated requests can continue under the old session. The logout flow should call `/api/auth/logout` before clearing local user state.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/context/AuthContext.tsx, line 13:

<comment>Calling `logout` leaves the server's httpOnly authentication cookie valid, so subsequent authenticated requests can continue under the old session. The logout flow should call `/api/auth/logout` before clearing local user state.</comment>

<file context>
@@ -0,0 +1,25 @@
+    localStorage.setItem('user', JSON.stringify(userData));
+  };
+
+  const logout = () => {
+    setUser(null);
+    localStorage.removeItem('user');
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/0e91cea2-4fcd-479e-aaae-0f6bac2a287f" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/api/client.ts:5

<!-- cubic:v=1182ece7-b741-44d6-ac8d-b89d28611dfc -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P1: Authentication is both ineffective and exposed: the server reads only the HttpOnly `token` cookie, while this code reads a browser-accessible token and sends an ignored `Authorization` header. Remove local-storage token handling and use the cookie session end to end.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/api/client.ts, line 5:

<comment>Authentication is both ineffective and exposed: the server reads only the HttpOnly `token` cookie, while this code reads a browser-accessible token and sends an ignored `Authorization` header. Remove local-storage token handling and use the cookie session end to end.</comment>

<file context>
@@ -0,0 +1,19 @@
+const API_KEY = 'sk_test_1234567890abcdef';
+
+export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
+  const token = localStorage.getItem('token');
+  const res = await fetch(`${API_BASE_URL}${path}`, {
+    ...options,
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/1182ece7-b741-44d6-ac8d-b89d28611dfc" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/App.tsx:30

<!-- cubic:v=07aaf809-8ff2-45e2-9fb8-1d663fbd7c58 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P1: Signed-out visitors can follow the visible Admin link, where the 401 response replaces `users` and `users.map` crashes the page; non-admin users are not gated either. Consider rendering this route/link only for an authenticated admin, redirecting others to login, while retaining server-side role authorization.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/App.tsx, line 30:

<comment>Signed-out visitors can follow the visible Admin link, where the 401 response replaces `users` and `users.map` crashes the page; non-admin users are not gated either. Consider rendering this route/link only for an authenticated admin, redirecting others to login, while retaining server-side role authorization.</comment>

<file context>
@@ -1,25 +1,35 @@
+          <Route path="/" element={<PostListPage />} />
+          <Route path="/posts/:id" element={<PostDetailPage />} />
+          <Route path="/login" element={<LoginPage />} />
+          <Route path="/admin" element={<AdminPage />} />
+        </Routes>
+      </div>
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/07aaf809-8ff2-45e2-9fb8-1d663fbd7c58" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/PostListPage.tsx:10

<!-- cubic:v=1ebb582b-8ab5-4116-b433-802867db158f -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P2: An HTTP error response replaces `posts` with an error object, causing `posts.map` to crash the page; network/JSON failures also become unhandled rejections. Validate the response as an array and handle rejection with explicit loading/error UI before updating `posts`.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/PostListPage.tsx, line 10:

<comment>An HTTP error response replaces `posts` with an error object, causing `posts.map` to crash the page; network/JSON failures also become unhandled rejections. Validate the response as an array and handle rejection with explicit loading/error UI before updating `posts`.</comment>

<file context>
@@ -0,0 +1,28 @@
+  const [posts, setPosts] = useState<any[]>([]);
+
+  useEffect(() => {
+    apiFetch('/api/posts').then(setPosts);
+  }, []);
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/1ebb582b-8ab5-4116-b433-802867db158f" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/AdminPage.tsx:12

<!-- cubic:v=ba00eb85-255b-4959-b05a-5663d81cdaeb -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":9} -->
P2: A failed admin-users request is displayed as an empty list and the rejected promise is left unhandled. Consider catching the request failure and rendering an explicit error state so administrators can distinguish failure from “no users.”

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/AdminPage.tsx, line 12:

<comment>A failed admin-users request is displayed as an empty list and the rejected promise is left unhandled. Consider catching the request failure and rendering an explicit error state so administrators can distinguish failure from “no users.”</comment>

<file context>
@@ -0,0 +1,27 @@
+  useEffect(() => {
+    apiFetch('/api/admin/users', {
+      headers: { 'X-Admin-Key': ADMIN_API_KEY },
+    }).then(setUsers);
+  }, []);
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/ba00eb85-255b-4959-b05a-5663d81cdaeb" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/context/AuthContext.tsx:6

<!-- cubic:v=6555881b-2258-4392-9423-0d8b802f7c44 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P2: A page reload always resets `user` to `null`, even after `login` persisted it to `localStorage`. Initialize the state from the stored value (with malformed-data handling), or remove the persistence write if reload persistence is not intended.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/context/AuthContext.tsx, line 6:

<comment>A page reload always resets `user` to `null`, even after `login` persisted it to `localStorage`. Initialize the state from the stored value (with malformed-data handling), or remove the persistence write if reload persistence is not intended.</comment>

<file context>
@@ -0,0 +1,25 @@
+const AuthContext = createContext<any>(null);
+
+export function AuthProvider({ children }: { children: ReactNode }) {
+  const [user, setUser] = useState<any>(null);
+
+  const login = (userData: any) => {
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/6555881b-2258-4392-9423-0d8b802f7c44" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/api/client.ts:12

<!-- cubic:v=9f803cac-7b3d-47d2-81ce-eb975c7274ff -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":9} -->
P2: Valid `RequestInit.headers` values such as `new Headers(...)` or tuple arrays are not preserved by object spread. Normalize with `Headers` before merging so `apiFetch` honors its declared input type.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/api/client.ts, line 12:

<comment>Valid `RequestInit.headers` values such as `new Headers(...)` or tuple arrays are not preserved by object spread. Normalize with `Headers` before merging so `apiFetch` honors its declared input type.</comment>

<file context>
@@ -0,0 +1,19 @@
+      'Content-Type': 'application/json',
+      'X-API-Key': API_KEY,
+      ...(token ? { Authorization: `Bearer ${token}` } : {}),
+      ...options.headers,
+    },
+  });
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/9f803cac-7b3d-47d2-81ce-eb975c7274ff" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/PostDetailPage.tsx:12

<!-- cubic:v=62849505-d3ca-4bc0-8ffd-5dfd3a81d2b1 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":9} -->
P2: Rapid navigation between detail URLs can display the wrong post when an older request resolves last; the previous post also remains visible while the new request runs. Reset state and abort or ignore stale requests in the effect cleanup.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/PostDetailPage.tsx, line 12:

<comment>Rapid navigation between detail URLs can display the wrong post when an older request resolves last; the previous post also remains visible while the new request runs. Reset state and abort or ignore stale requests in the effect cleanup.</comment>

<file context>
@@ -0,0 +1,32 @@
+  const [post, setPost] = useState<any>(null);
+
+  useEffect(() => {
+    if (id) apiFetch(`/api/posts/${id}`).then(setPost);
+  }, [id]);
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/62849505-d3ca-4bc0-8ffd-5dfd3a81d2b1" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/PostDetailPage.tsx:12

<!-- cubic:v=45485dfa-326d-49b5-9a6e-e6e0201f60f8 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":10} -->
P2: Missing or failed posts do not reach an error UI: a 404 payload is rendered as a post and can crash Markdown rendering, while network failures leave 「読み込み中...」 forever. Check HTTP success and maintain explicit loading/error states before calling `setPost`.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/PostDetailPage.tsx, line 12:

<comment>Missing or failed posts do not reach an error UI: a 404 payload is rendered as a post and can crash Markdown rendering, while network failures leave 「読み込み中...」 forever. Check HTTP success and maintain explicit loading/error states before calling `setPost`.</comment>

<file context>
@@ -0,0 +1,32 @@
+  const [post, setPost] = useState<any>(null);
+
+  useEffect(() => {
+    if (id) apiFetch(`/api/posts/${id}`).then(setPost);
+  }, [id]);
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/45485dfa-326d-49b5-9a6e-e6e0201f60f8" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/api/client.ts:15

<!-- cubic:v=b5bbf423-ecde-406e-87fd-89139dfae514 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":8} -->
P2: `apiFetch` resolves `res.json()` without ever checking `res.ok`, so HTTP error responses resolve as successful data instead of rejecting. Concretely, in LoginPage a failed login (wrong password / 401 / 500) still resolves and `navigate('/')` runs as if authentication succeeded, and any non-JSON error page makes `res.json()` throw an unhandled error. Add a status check that throws on non-2xx so callers can branch on failure.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/api/client.ts, line 15:

<comment>`apiFetch` resolves `res.json()` without ever checking `res.ok`, so HTTP error responses resolve as successful data instead of rejecting. Concretely, in LoginPage a failed login (wrong password / 401 / 500) still resolves and `navigate('/')` runs as if authentication succeeded, and any non-JSON error page makes `res.json()` throw an unhandled error. Add a status check that throws on non-2xx so callers can branch on failure.</comment>

<file context>
@@ -0,0 +1,19 @@
+      ...options.headers,
+    },
+  });
+  return res.json();
+}
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/b5bbf423-ecde-406e-87fd-89139dfae514" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/utils/date.ts:1

<!-- cubic:v=2836e493-1a5d-4464-8ccc-31462239d413 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":6} -->
P3: This `formatDate` duplicates the helper already added in `client/src/utils/date.ts`, but with a different output format (server uses `-` separators, client uses `/`), and it is currently unused anywhere in the server code. Keeping two divergent copies is a consistency/maintainability hazard — if either is later used for user-facing dates the formats will disagree. Consider extracting a shared helper (e.g. into `@aireview/shared`) or removing the unused server copy until it is actually needed.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/utils/date.ts, line 1:

<comment>This `formatDate` duplicates the helper already added in `client/src/utils/date.ts`, but with a different output format (server uses `-` separators, client uses `/`), and it is currently unused anywhere in the server code. Keeping two divergent copies is a consistency/maintainability hazard — if either is later used for user-facing dates the formats will disagree. Consider extracting a shared helper (e.g. into `@aireview/shared`) or removing the unused server copy until it is actually needed.</comment>

<file context>
@@ -0,0 +1,9 @@
+export function formatDate(date: Date | string): string {
+  const d = typeof date === 'string' ? new Date(date) : date;
+  const y = d.getFullYear();
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/2836e493-1a5d-4464-8ccc-31462239d413" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/utils/date.ts:2

<!-- cubic:v=5d9cc660-b073-48c7-85fa-8e3e065f34e3 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":8} -->
P3: Malformed or unexpected API timestamps render as `NaN/NaN/NaN NaN:NaN` because the parsed date is never validated. Consider checking `Number.isNaN(d.getTime())` and returning an intentional placeholder or error before formatting.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/utils/date.ts, line 2:

<comment>Malformed or unexpected API timestamps render as `NaN/NaN/NaN NaN:NaN` because the parsed date is never validated. Consider checking `Number.isNaN(d.getTime())` and returning an intentional placeholder or error before formatting.</comment>

<file context>
@@ -0,0 +1,9 @@
+export function formatDate(date: Date | string): string {
+  const d = typeof date === 'string' ? new Date(date) : date;
+  const y = d.getFullYear();
+  const m = ('0' + (d.getMonth() + 1)).slice(-2);
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/5d9cc660-b073-48c7-85fa-8e3e065f34e3" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/pages/LoginPage.tsx:26

<!-- cubic:v=f37ad66d-8f7b-4408-98a1-636ebf30ba66 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":9} -->
P3: Both credential fields lack persistent accessible labels, leaving screen-reader and voice-input users without reliable field names once placeholders disappear. Associate visible `<label>` elements with each input; email and autocomplete semantics also improve browser/password-manager behavior.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/pages/LoginPage.tsx, line 26:

<comment>Both credential fields lack persistent accessible labels, leaving screen-reader and voice-input users without reliable field names once placeholders disappear. Associate visible `<label>` elements with each input; email and autocomplete semantics also improve browser/password-manager behavior.</comment>

<file context>
@@ -0,0 +1,39 @@
+    <form onSubmit={handleSubmit}>
+      <h2>ログイン</h2>
+      <div>
+        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
+      </div>
+      <div>
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/f37ad66d-8f7b-4408-98a1-636ebf30ba66" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### client/src/api/client.ts:19

<!-- cubic:v=6c92d7a2-8ded-42fa-9c8a-87b00a2b8290 -->
<!-- cubic:review-run=1c8aa0c7-378d-4812-8ea7-455cbe52afff -->
<!-- metadata:{"confidence":8} -->
P3: `INTERNAL_DEBUG_KEY` is exported but never referenced anywhere in the codebase (the only matches are its declaration and the `@ts-ignore` above it). It is dead code shipped in the public API surface of this module. Remove the export (and the redundant `@ts-ignore` that hides the unused/type-checking problem) so the debug override doesn't persist in the client.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At client/src/api/client.ts, line 19:

<comment>`INTERNAL_DEBUG_KEY` is exported but never referenced anywhere in the codebase (the only matches are its declaration and the `@ts-ignore` above it). It is dead code shipped in the public API surface of this module. Remove the export (and the redundant `@ts-ignore` that hides the unused/type-checking problem) so the debug override doesn't persist in the client.</comment>

<file context>
@@ -0,0 +1,19 @@
+}
+
+// @ts-ignore
+export const INTERNAL_DEBUG_KEY = 'debug-override-token';
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/6c92d7a2-8ded-42fa-9c8a-87b00a2b8290" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

