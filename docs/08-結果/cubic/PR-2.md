# cubic レビュー結果 — PR #2

PR: https://github.com/kawai621-beep/aireview-sample/pull/2

## レビュー概要
### Review (COMMENTED)

**Ultrareview** completed in 24m 58s

<!-- cubic:review-summary:start -->
**15 issues found** across 6 files
<!-- cubic:review-summary:end -->

<details>
<summary>Prompt for AI agents (unresolved issues)</summary>

```text

Check if these issues are valid — if so, understand the root cause of each and fix them. If appropriate, use sub-agents to investigate and fix each issue separately.


<file name="server/src/services/search.service.ts">

<violation number="1" location="server/src/services/search.service.ts:8">
P0: A search keyword containing a quote is interpolated directly into an unsafe raw SQL string, so callers can alter the query rather than merely search text. Use Prisma's parameterized `$queryRaw` (and bind the wildcard pattern as a value) instead of constructing SQL with `q`.</violation>
</file>

<file name="server/src/app.ts">

<violation number="1" location="server/src/app.ts:32">
P1: By mounting `postsRouter`, the post update/delete APIs are now available with only `requireAuth`, and they currently authorize by login state only, not by resource ownership. As implemented, any authenticated user who knows a post ID can edit or delete another user’s post (IDOR). Consider adding an ownership/admin authorization check before `update`/`delete`.</violation>
</file>

<file name="server/src/routes/comments.routes.ts">

<violation number="1" location="server/src/routes/comments.routes.ts:10">
P1: Any logged-in user can currently delete other users’ comments because the new delete handler filters only by `id` and does not authorize against the comment owner (or admin role). Adding an ownership/role check in the delete query would prevent cross-user comment deletion.</violation>
</file>

<file name="server/src/services/feed.service.ts">

<violation number="1" location="server/src/services/feed.service.ts:7">
P1: A post marked for a future `publishAt` can appear in the public feed immediately when the create request also has `published: true`, because this filter ignores the scheduled timestamp. Filtering out future `publishAt` values here prevents embargoed/scheduled content from being exposed before its intended time.</violation>

<violation number="2" location="server/src/services/feed.service.ts:7">
P2: The feed has no deterministic order, so the selected 20 posts can be arbitrary and may change between requests rather than showing the newest public posts. Ordering by `createdAt` before applying `take` makes the feed stable and chronological.</violation>

<violation number="3" location="server/src/services/feed.service.ts:10">
P2: The post count is capped, but comments are not, so a single heavily discussed post can produce an arbitrarily large feed response and expensive database/JSON work. A feed comment preview should use a bounded, ordered subset (with a separate paginated comments endpoint for the remainder).</violation>

<violation number="4" location="server/src/services/feed.service.ts:10">
P2: Each feed request issues one comment query per post, and those lookups are not indexed by `Comment.postId`. At scale this turns a 20-post feed into repeated scans of the comments table. Fetching the relation in a single batched relation query (or one `postId: { in: postIds }` query) and adding an index on `Comment.postId` would keep this endpoint from scaling with both post and comment counts.</violation>
</file>

<file name="server/src/services/posts.service.ts">

<violation number="1" location="server/src/services/posts.service.ts:11">
P2: Malformed `publishAt` values produce an Invalid Date and then make `date.toISOString()` throw a `RangeError`. Validate the parsed timestamp and return the service's normal validation error before attempting to use it, so an invalid scheduling request does not become an unexpected server error.</violation>

<violation number="2" location="server/src/services/posts.service.ts:15">
P1: A successful scheduling call currently only logs and returns metadata; it does not persist a schedule or enqueue any work. As a result, posts requested for future publication will never be published while the caller sees a successful response. This should register a durable job (and/or persist the scheduled publication state) before returning success.</violation>
</file>

<file name="server/src/routes/posts.routes.ts">

<violation number="1" location="server/src/routes/posts.routes.ts:15">
P0: The `sortBy` and `order` query parameters are concatenated into `ORDER BY`, allowing SQL injection through the public list endpoint. Restrict both values to a fixed allowlist before building this identifier/direction portion of the query (or map them to a Prisma `orderBy` object).</violation>

<violation number="2" location="server/src/routes/posts.routes.ts:18">
P2: Listing 50 posts can make 51 sequential database round trips because each author is loaded inside this loop. Loading `author` through the post query (with a narrow `select`) would keep the list endpoint's latency and database load bounded.</violation>

<violation number="3" location="server/src/routes/posts.routes.ts:49">
P2: A post with many comments issues one author query per comment, with no comment limit, so detail requests grow linearly in database round trips. Fetching `comments` and each comment's `author` through Prisma `include` would retrieve the same response without the nested N+1 access.</violation>

<violation number="4" location="server/src/routes/posts.routes.ts:57">
P3: This route mixes validation, media normalization, persistence, notifications, logging, and scheduling, making changes to any one workflow harder to test without exercising the rest. Moving the creation workflow into a post service and extracting the normalization/validation helpers would give the handler a single orchestration responsibility.</violation>

<violation number="5" location="server/src/routes/posts.routes.ts:84">
P2: Scheduled publication time depends on the server's local time zone when clients send a timestamp without an offset, so a requested “09:00” can publish at a different instant after deployment. Accept and validate an ISO-8601 timestamp with an explicit UTC offset (or explicitly normalize an agreed input zone) before scheduling.</violation>

<violation number="6" location="server/src/routes/posts.routes.ts:146">
P1: Concurrent likes can be dropped by this read-modify-write sequence: two requests that both read 0 each write 1. Prisma's atomic `increment` update avoids the lost-update race.</violation>
</file>
```

</details>

<sub>**Tip**: instead of fixing issues one by one [fix them all with cubic](https://www.cubic.dev/action/fix/pr/kawai621-beep/aireview-sample/2/ultrareview_1786439203002_66bb7e12-13fd-431c-b78f-b9f09ed911ae?entrySource=github_ui_to_cubic_ui)<br /><br />[Re-trigger cubic](https://www.cubic.dev/action/re-review/pr/kawai621-beep/aireview-sample/2/ultrareview_1786439203002_66bb7e12-13fd-431c-b78f-b9f09ed911ae?returnTo=https%3A%2F%2Fgithub.com%2Fkawai621-beep%2Faireview-sample%2Fpull%2F2)</sub>

<!-- cubic:review-post:ultrareview_1786439203002_66bb7e12-13fd-431c-b78f-b9f09ed911ae:100fc8a1a1305298cd23acf8ff6abf09230d25a4:04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->


## インラインコメント
### server/src/services/search.service.ts:8

<!-- cubic:v=f6d953b5-cd2e-40ea-b852-e22667140167 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P0: A search keyword containing a quote is interpolated directly into an unsafe raw SQL string, so callers can alter the query rather than merely search text. Use Prisma's parameterized `$queryRaw` (and bind the wildcard pattern as a value) instead of constructing SQL with `q`.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/search.service.ts, line 8:

<comment>A search keyword containing a quote is interpolated directly into an unsafe raw SQL string, so callers can alter the query rather than merely search text. Use Prisma's parameterized `$queryRaw` (and bind the wildcard pattern as a value) instead of constructing SQL with `q`.</comment>

<file context>
@@ -0,0 +1,10 @@
+ */
+export async function searchPosts(q: string) {
+  return prisma.$queryRawUnsafe(
+    `SELECT id, title, content FROM Post WHERE title LIKE '%${q}%' OR content LIKE '%${q}%' LIMIT 50`,
+  );
+}
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/f6d953b5-cd2e-40ea-b852-e22667140167" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/posts.routes.ts:15

<!-- cubic:v=5f477328-6c43-40b2-bb6a-ab050847a035 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P0: The `sortBy` and `order` query parameters are concatenated into `ORDER BY`, allowing SQL injection through the public list endpoint. Restrict both values to a fixed allowlist before building this identifier/direction portion of the query (or map them to a Prisma `orderBy` object).

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/posts.routes.ts, line 15:

<comment>The `sortBy` and `order` query parameters are concatenated into `ORDER BY`, allowing SQL injection through the public list endpoint. Restrict both values to a fixed allowlist before building this identifier/direction portion of the query (or map them to a Prisma `orderBy` object).</comment>

<file context>
@@ -0,0 +1,165 @@
+  const sortBy = (req.query.sortBy as string) ?? 'createdAt';
+  const order = (req.query.order as string) ?? 'desc';
+  const posts = await prisma.$queryRawUnsafe(
+    `SELECT * FROM Post ORDER BY ${sortBy} ${order} LIMIT 50`,
+  );
+  const result = [];
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/5f477328-6c43-40b2-bb6a-ab050847a035" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/app.ts:32

<!-- cubic:v=42d04f77-1f0f-4923-bb15-a5f2c45a83d8 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":9} -->
P1: By mounting `postsRouter`, the post update/delete APIs are now available with only `requireAuth`, and they currently authorize by login state only, not by resource ownership. As implemented, any authenticated user who knows a post ID can edit or delete another user’s post (IDOR). Consider adding an ownership/admin authorization check before `update`/`delete`.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/app.ts, line 32:

<comment>By mounting `postsRouter`, the post update/delete APIs are now available with only `requireAuth`, and they currently authorize by login state only, not by resource ownership. As implemented, any authenticated user who knows a post ID can edit or delete another user’s post (IDOR). Consider adding an ownership/admin authorization check before `update`/`delete`.</comment>

<file context>
@@ -27,6 +29,8 @@ export function createApp(): express.Application {
 
   app.use('/api/auth', authRouter);
   app.use('/api/admin', adminRouter);
+  app.use('/api/posts', postsRouter);
+  app.use('/api/comments', commentsRouter);
 
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/42d04f77-1f0f-4923-bb15-a5f2c45a83d8" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/comments.routes.ts:10

<!-- cubic:v=39837cde-633b-4e9b-992f-c0fec966b949 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":9} -->
P1: Any logged-in user can currently delete other users’ comments because the new delete handler filters only by `id` and does not authorize against the comment owner (or admin role). Adding an ownership/role check in the delete query would prevent cross-user comment deletion.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/comments.routes.ts, line 10:

<comment>Any logged-in user can currently delete other users’ comments because the new delete handler filters only by `id` and does not authorize against the comment owner (or admin role). Adding an ownership/role check in the delete query would prevent cross-user comment deletion.</comment>

<file context>
@@ -0,0 +1,12 @@
+
+// コメント削除
+commentsRouter.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
+  await prisma.comment.delete({ where: { id: req.params.id } });
+  res.json({ ok: true });
+});
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/39837cde-633b-4e9b-992f-c0fec966b949" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/feed.service.ts:7

<!-- cubic:v=7eb2d187-37d1-4d43-8d9c-feeafd6826c0 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":9} -->
P1: A post marked for a future `publishAt` can appear in the public feed immediately when the create request also has `published: true`, because this filter ignores the scheduled timestamp. Filtering out future `publishAt` values here prevents embargoed/scheduled content from being exposed before its intended time.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/feed.service.ts, line 7:

<comment>A post marked for a future `publishAt` can appear in the public feed immediately when the create request also has `published: true`, because this filter ignores the scheduled timestamp. Filtering out future `publishAt` values here prevents embargoed/scheduled content from being exposed before its intended time.</comment>

<file context>
@@ -0,0 +1,13 @@
+ * 公開投稿のフィードをコメント付きで取得する。
+ */
+export async function getFeedWithComments() {
+  const posts = await prisma.post.findMany({ where: { published: true }, take: 20 });
+  const postIds = posts.map((p) => p.id);
+  const commentsByPost = await Promise.all(
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/7eb2d187-37d1-4d43-8d9c-feeafd6826c0" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/posts.service.ts:15

<!-- cubic:v=6695c33b-e057-49bf-a1b7-81cd96796991 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P1: A successful scheduling call currently only logs and returns metadata; it does not persist a schedule or enqueue any work. As a result, posts requested for future publication will never be published while the caller sees a successful response. This should register a durable job (and/or persist the scheduled publication state) before returning success.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/posts.service.ts, line 15:

<comment>A successful scheduling call currently only logs and returns metadata; it does not persist a schedule or enqueue any work. As a result, posts requested for future publication will never be published while the caller sees a successful response. This should register a durable job (and/or persist the scheduled publication state) before returning success.</comment>

<file context>
@@ -0,0 +1,17 @@
+  const delay = date.getTime() - Date.now();
+  // 本来はジョブキューへ登録
+  // eslint-disable-next-line no-console
+  console.log(`[schedule] post ${postId} at ${date.toISOString()} (in ${delay}ms)`);
+  return { postId, scheduledAt: date };
+}
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/6695c33b-e057-49bf-a1b7-81cd96796991" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/posts.routes.ts:146

<!-- cubic:v=b9258367-7699-467a-827a-4f03717a69f3 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P1: Concurrent likes can be dropped by this read-modify-write sequence: two requests that both read 0 each write 1. Prisma's atomic `increment` update avoids the lost-update race.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/posts.routes.ts, line 146:

<comment>Concurrent likes can be dropped by this read-modify-write sequence: two requests that both read 0 each write 1. Prisma's atomic `increment` update avoids the lost-update race.</comment>

<file context>
@@ -0,0 +1,165 @@
+  post.likes = post.likes + 1;
+  const updated = await prisma.post.update({
+    where: { id: post.id },
+    data: { likes: post.likes },
+  });
+  res.json(updated);
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/b9258367-7699-467a-827a-4f03717a69f3" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/feed.service.ts:7

<!-- cubic:v=fc4cba7c-d0c1-4836-93fa-b8279b41ebff -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P2: The feed has no deterministic order, so the selected 20 posts can be arbitrary and may change between requests rather than showing the newest public posts. Ordering by `createdAt` before applying `take` makes the feed stable and chronological.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/feed.service.ts, line 7:

<comment>The feed has no deterministic order, so the selected 20 posts can be arbitrary and may change between requests rather than showing the newest public posts. Ordering by `createdAt` before applying `take` makes the feed stable and chronological.</comment>

<file context>
@@ -0,0 +1,13 @@
+ * 公開投稿のフィードをコメント付きで取得する。
+ */
+export async function getFeedWithComments() {
+  const posts = await prisma.post.findMany({ where: { published: true }, take: 20 });
+  const postIds = posts.map((p) => p.id);
+  const commentsByPost = await Promise.all(
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/fc4cba7c-d0c1-4836-93fa-b8279b41ebff" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/feed.service.ts:10

<!-- cubic:v=8932a9fa-079a-49af-88e3-3ec1507a27ae -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":9} -->
P2: The post count is capped, but comments are not, so a single heavily discussed post can produce an arbitrarily large feed response and expensive database/JSON work. A feed comment preview should use a bounded, ordered subset (with a separate paginated comments endpoint for the remainder).

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/feed.service.ts, line 10:

<comment>The post count is capped, but comments are not, so a single heavily discussed post can produce an arbitrarily large feed response and expensive database/JSON work. A feed comment preview should use a bounded, ordered subset (with a separate paginated comments endpoint for the remainder).</comment>

<file context>
@@ -0,0 +1,13 @@
+  const posts = await prisma.post.findMany({ where: { published: true }, take: 20 });
+  const postIds = posts.map((p) => p.id);
+  const commentsByPost = await Promise.all(
+    postIds.map((id) => prisma.comment.findMany({ where: { postId: id } })),
+  );
+  return posts.map((p, i) => ({ ...p, comments: commentsByPost[i] }));
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/8932a9fa-079a-49af-88e3-3ec1507a27ae" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/feed.service.ts:10

<!-- cubic:v=4727f8ba-471d-4445-9f79-5f05170b5b03 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P2: Each feed request issues one comment query per post, and those lookups are not indexed by `Comment.postId`. At scale this turns a 20-post feed into repeated scans of the comments table. Fetching the relation in a single batched relation query (or one `postId: { in: postIds }` query) and adding an index on `Comment.postId` would keep this endpoint from scaling with both post and comment counts.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/feed.service.ts, line 10:

<comment>Each feed request issues one comment query per post, and those lookups are not indexed by `Comment.postId`. At scale this turns a 20-post feed into repeated scans of the comments table. Fetching the relation in a single batched relation query (or one `postId: { in: postIds }` query) and adding an index on `Comment.postId` would keep this endpoint from scaling with both post and comment counts.</comment>

<file context>
@@ -0,0 +1,13 @@
+  const posts = await prisma.post.findMany({ where: { published: true }, take: 20 });
+  const postIds = posts.map((p) => p.id);
+  const commentsByPost = await Promise.all(
+    postIds.map((id) => prisma.comment.findMany({ where: { postId: id } })),
+  );
+  return posts.map((p, i) => ({ ...p, comments: commentsByPost[i] }));
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/4727f8ba-471d-4445-9f79-5f05170b5b03" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/posts.service.ts:11

<!-- cubic:v=7f466e28-726f-4028-9682-6e8418140d22 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P2: Malformed `publishAt` values produce an Invalid Date and then make `date.toISOString()` throw a `RangeError`. Validate the parsed timestamp and return the service's normal validation error before attempting to use it, so an invalid scheduling request does not become an unexpected server error.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/posts.service.ts, line 11:

<comment>Malformed `publishAt` values produce an Invalid Date and then make `date.toISOString()` throw a `RangeError`. Validate the parsed timestamp and return the service's normal validation error before attempting to use it, so an invalid scheduling request does not become an unexpected server error.</comment>

<file context>
@@ -0,0 +1,17 @@
+ * 投稿の公開をスケジュールする。
+ */
+export async function schedulePost(postId: string, publishAt: string) {
+  const date = new Date(publishAt);
+  const delay = date.getTime() - Date.now();
+  // 本来はジョブキューへ登録
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/7f466e28-726f-4028-9682-6e8418140d22" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/posts.routes.ts:84

<!-- cubic:v=c5813730-dd1c-4961-8205-3de221d7521f -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":9} -->
P2: Scheduled publication time depends on the server's local time zone when clients send a timestamp without an offset, so a requested “09:00” can publish at a different instant after deployment. Accept and validate an ISO-8601 timestamp with an explicit UTC offset (or explicitly normalize an agreed input zone) before scheduling.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/posts.routes.ts, line 84:

<comment>Scheduled publication time depends on the server's local time zone when clients send a timestamp without an offset, so a requested “09:00” can publish at a different instant after deployment. Accept and validate an ISO-8601 timestamp with an explicit UTC offset (or explicitly normalize an agreed input zone) before scheduling.</comment>

<file context>
@@ -0,0 +1,165 @@
+  // --- 公開日時の解釈 ---
+  let scheduledAt: Date | null = null;
+  if (publishAt) {
+    scheduledAt = new Date(publishAt);
+  }
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/c5813730-dd1c-4961-8205-3de221d7521f" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/posts.routes.ts:18

<!-- cubic:v=2641f7bd-a46e-4444-ba8d-9f5d5a41bd11 -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P2: Listing 50 posts can make 51 sequential database round trips because each author is loaded inside this loop. Loading `author` through the post query (with a narrow `select`) would keep the list endpoint's latency and database load bounded.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/posts.routes.ts, line 18:

<comment>Listing 50 posts can make 51 sequential database round trips because each author is loaded inside this loop. Loading `author` through the post query (with a narrow `select`) would keep the list endpoint's latency and database load bounded.</comment>

<file context>
@@ -0,0 +1,165 @@
+    `SELECT * FROM Post ORDER BY ${sortBy} ${order} LIMIT 50`,
+  );
+  const result = [];
+  for (const p of posts as Array<Record<string, unknown>>) {
+    const author = await prisma.user.findUnique({
+      where: { id: p.authorId as string },
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/2641f7bd-a46e-4444-ba8d-9f5d5a41bd11" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/posts.routes.ts:49

<!-- cubic:v=e8673f7a-fbd6-46b4-a539-e8853adebcbd -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":10} -->
P2: A post with many comments issues one author query per comment, with no comment limit, so detail requests grow linearly in database round trips. Fetching `comments` and each comment's `author` through Prisma `include` would retrieve the same response without the nested N+1 access.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/posts.routes.ts, line 49:

<comment>A post with many comments issues one author query per comment, with no comment limit, so detail requests grow linearly in database round trips. Fetching `comments` and each comment's `author` through Prisma `include` would retrieve the same response without the nested N+1 access.</comment>

<file context>
@@ -0,0 +1,165 @@
+  }
+  const comments = await prisma.comment.findMany({ where: { postId: post.id } });
+  const commentsWithAuthor = [];
+  for (const c of comments) {
+    const author = await prisma.user.findUnique({ where: { id: c.authorId } });
+    commentsWithAuthor.push({ ...c, authorName: author?.name });
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/e8673f7a-fbd6-46b4-a539-e8853adebcbd" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/posts.routes.ts:57

<!-- cubic:v=cbaaf5dd-5b6f-42a4-ab1d-d994ef0228bb -->
<!-- cubic:review-run=04e9f9fa-d4ed-43cf-b2f5-f181c770065d -->
<!-- metadata:{"confidence":9} -->
P3: This route mixes validation, media normalization, persistence, notifications, logging, and scheduling, making changes to any one workflow harder to test without exercising the rest. Moving the creation workflow into a post service and extracting the normalization/validation helpers would give the handler a single orchestration responsibility.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/posts.routes.ts, line 57:

<comment>This route mixes validation, media normalization, persistence, notifications, logging, and scheduling, making changes to any one workflow harder to test without exercising the rest. Moving the creation workflow into a post service and extracting the normalization/validation helpers would give the handler a single orchestration responsibility.</comment>

<file context>
@@ -0,0 +1,165 @@
+});
+
+// 投稿作成
+postsRouter.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
+  const user = req.user!;
+  const { title, content, published, publishAt, imageUrl } = req.body;
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/cbaaf5dd-5b6f-42a4-ab1d-d994ef0228bb" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

