# cubic レビュー結果 — PR #1

PR: https://github.com/kawai621-beep/aireview-sample/pull/1

## レビュー概要
### Review (COMMENTED)

<!-- cubic:review-summary:start -->
**14 issues found** across 8 files
<!-- cubic:review-summary:end -->

<details>
<summary>Prompt for AI agents (unresolved issues)</summary>

```text

Check if these issues are valid — if so, understand the root cause of each and fix them. If appropriate, use sub-agents to investigate and fix each issue separately.


<file name="server/src/auth/password.ts">

<violation number="1" location="server/src/auth/password.ts:2">
P0: Passwords are stored as reversible base64 encoding rather than hashed, so anybody with database read access recovers every plaintext password. Use a proper salted password hash (e.g. bcrypt/argon2) and store the resulting hash; verify with the same library's comparison function rather than an encoding check.</violation>

<violation number="2" location="server/src/auth/password.ts:7">
P2: Password verification can leak hash-comparison timing because `===` is not constant-time. Use the selected password-KDF library’s verification API, which performs a timing-safe comparison.</violation>
</file>

<file name="server/src/auth/jwt.ts">

<violation number="1" location="server/src/auth/jwt.ts:10">
P2: The accepted-algorithm policy includes `none`, although this service only issues signed HS256 tokens. Restricting verification to `HS256` preserves the signed-token invariant and avoids a fragile unsigned-token bypass if key handling changes.</violation>
</file>

<file name="server/src/config.ts">

<violation number="1" location="server/src/config.ts:9">
P1: The JWT signing secret is hardcoded in source, so anyone with repository access can sign valid tokens and forge arbitrary authenticated/admin identities. Read it from the environment like the other settings (e.g. `process.env.JWT_SECRET`), with a random generated value in deploy config, and fail fast when it is missing in production. The unused `adminToken`/`admin123` constant should also be removed rather than shipped in code.</violation>

<violation number="2" location="server/src/config.ts:10">
P2: A stolen access JWT remains usable for seven days, substantially extending the compromise window and undermining the new refresh flow. Consider separate short-lived access-token and longer-lived refresh-token expiry settings rather than one seven-day lifetime.</violation>
</file>

<file name="server/src/services/users.service.ts">

<violation number="1" location="server/src/services/users.service.ts:4">
P3: `findOrCreateUser` never returns a found user, so its name suggests idempotent find-or-create behavior that it does not provide. Rename it to `createUser` or `registerUser` and update the sole route import/call.</violation>

<violation number="2" location="server/src/services/users.service.ts:4">
P1: Registration accepts empty or malformed emails, names, and passwords because TypeScript input types provide no runtime validation. Validate and normalize these fields before the lookup/create so unusable accounts and empty-password credentials cannot be stored.</violation>

<violation number="3" location="server/src/services/users.service.ts:9">
P1: Concurrent registrations can create duplicate accounts for one email because the existence check and insert are non-atomic and `User.email` has no unique constraint. Add a database unique constraint/migration and map Prisma's unique-constraint error to the registration response.</violation>
</file>

<file name="server/src/app.ts">

<violation number="1" location="server/src/app.ts:19">
P1: Cookie-authenticated cross-origin requests will be blocked because the configured origin is `*` while `credentials` is enabled. Use an explicit trusted-origin allowlist (for example the configured SPA origin) whenever credentials are allowed.</violation>
</file>

<file name="server/src/routes/auth.routes.ts">

<violation number="1" location="server/src/routes/auth.routes.ts:14">
P2: Auth token cookies are set without the `secure` attribute, so they may travel over plain HTTP in non-HTTPS deployments. Adding `secure` (typically env-gated for local dev) hardens session transport.</violation>

<violation number="2" location="server/src/routes/auth.routes.ts:17">
P2: Registration errors currently expose raw exception messages to clients, which enables email enumeration and leaks internal failure detail. Returning a generic message here reduces information disclosure.</violation>

<violation number="3" location="server/src/routes/auth.routes.ts:22">
P1: Malformed login payloads can raise runtime errors instead of returning a controlled auth response because `password` is used before validation. Validating `email`/`password` types early keeps this endpoint deterministic.</violation>

<violation number="4" location="server/src/routes/auth.routes.ts:38">
P2: The refresh endpoint does not actually refresh anything: it never verifies the existing token and never issues a new one, so it returns `ok` even for invalid or expired cookies while providing no renewed token to the client. Verify the token, and on success either sign and set a fresh token or remove the endpoint until real refresh (and ideally a short-lived access token with a rotating refresh token) is implemented.</violation>
</file>

<file name="server/src/routes/admin.routes.ts">

<violation number="1" location="server/src/routes/admin.routes.ts:7">
P1: The admin endpoint only enforces that a request is authenticated, not that the caller holds an admin role, so any logged-in user (and, with the `none`-algorithm token flaw, anyone) can list all users. Enforce `role === 'ADMIN'` in the middleware/route, derived from the verified token rather than the unused hardcoded `adminToken`.</violation>
</file>
```

</details>

<sub>**Tip**: instead of fixing issues one by one [fix them all with cubic](https://www.cubic.dev/action/fix/pr/kawai621-beep/aireview-sample/1/ai_pr_review_1786439206119_f8380360-934a-4288-85bb-158b3a56c879?entrySource=github_ui_to_cubic_ui)<br /><br />[Re-trigger cubic](https://www.cubic.dev/action/re-review/pr/kawai621-beep/aireview-sample/1/ai_pr_review_1786439206119_f8380360-934a-4288-85bb-158b3a56c879?returnTo=https%3A%2F%2Fgithub.com%2Fkawai621-beep%2Faireview-sample%2Fpull%2F1)</sub>

<!-- cubic:review-post:ai_pr_review_1786439206119_f8380360-934a-4288-85bb-158b3a56c879:9ae4dc71685f664344c89c5e92c1f021305a2ad2:2501c8aa-c9af-4a13-8563-40c20747559f -->


## インラインコメント
### server/src/auth/password.ts:2

<!-- cubic:v=b26f69c1-c27f-47b5-8b6e-2750ac57fbd1 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":10} -->
P0: Passwords are stored as reversible base64 encoding rather than hashed, so anybody with database read access recovers every plaintext password. Use a proper salted password hash (e.g. bcrypt/argon2) and store the resulting hash; verify with the same library's comparison function rather than an encoding check.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/auth/password.ts, line 2:

<comment>Passwords are stored as reversible base64 encoding rather than hashed, so anybody with database read access recovers every plaintext password. Use a proper salted password hash (e.g. bcrypt/argon2) and store the resulting hash; verify with the same library's comparison function rather than an encoding check.</comment>

<file context>
@@ -0,0 +1,8 @@
+export function hashPassword(password: string): string {
+  return Buffer.from(password).toString('base64');
+}
+
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/b26f69c1-c27f-47b5-8b6e-2750ac57fbd1" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/users.service.ts:9

<!-- cubic:v=31b183cd-1d21-4aeb-a2cb-17f24154e675 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":10} -->
P1: Concurrent registrations can create duplicate accounts for one email because the existence check and insert are non-atomic and `User.email` has no unique constraint. Add a database unique constraint/migration and map Prisma's unique-constraint error to the registration response.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/users.service.ts, line 9:

<comment>Concurrent registrations can create duplicate accounts for one email because the existence check and insert are non-atomic and `User.email` has no unique constraint. Add a database unique constraint/migration and map Prisma's unique-constraint error to the registration response.</comment>

<file context>
@@ -0,0 +1,24 @@
+  name: string;
+  password: string;
+}) {
+  const existing = await prisma.user.findFirst({ where: { email: input.email } });
+  if (existing) {
+    throw new Error('既に登録済みのメールアドレスです');
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/31b183cd-1d21-4aeb-a2cb-17f24154e675" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/users.service.ts:4

<!-- cubic:v=cec8c7c1-8329-402a-ad46-fc88c14fc6bc -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":10} -->
P1: Registration accepts empty or malformed emails, names, and passwords because TypeScript input types provide no runtime validation. Validate and normalize these fields before the lookup/create so unusable accounts and empty-password credentials cannot be stored.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/users.service.ts, line 4:

<comment>Registration accepts empty or malformed emails, names, and passwords because TypeScript input types provide no runtime validation. Validate and normalize these fields before the lookup/create so unusable accounts and empty-password credentials cannot be stored.</comment>

<file context>
@@ -0,0 +1,24 @@
+import { prisma } from '../db/prisma';
+import { hashPassword } from '../auth/password';
+
+export async function findOrCreateUser(input: {
+  email: string;
+  name: string;
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/cec8c7c1-8329-402a-ad46-fc88c14fc6bc" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/app.ts:19

<!-- cubic:v=473cf5a6-e3ea-4b78-ab7b-806876f54762 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":10} -->
P1: Cookie-authenticated cross-origin requests will be blocked because the configured origin is `*` while `credentials` is enabled. Use an explicit trusted-origin allowlist (for example the configured SPA origin) whenever credentials are allowed.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/app.ts, line 19:

<comment>Cookie-authenticated cross-origin requests will be blocked because the configured origin is `*` while `credentials` is enabled. Use an explicit trusted-origin allowlist (for example the configured SPA origin) whenever credentials are allowed.</comment>

<file context>
@@ -1,19 +1,22 @@
   app.use(
     cors({
-      origin: ['http://localhost:5173'],
+      origin: config.corsOrigin,
       credentials: true,
     }),
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/473cf5a6-e3ea-4b78-ab7b-806876f54762" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/auth.routes.ts:22

<!-- cubic:v=85c36766-0896-4937-b212-684c864c7c7c -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":9} -->
P1: Malformed login payloads can raise runtime errors instead of returning a controlled auth response because `password` is used before validation. Validating `email`/`password` types early keeps this endpoint deterministic.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/auth.routes.ts, line 22:

<comment>Malformed login payloads can raise runtime errors instead of returning a controlled auth response because `password` is used before validation. Validating `email`/`password` types early keeps this endpoint deterministic.</comment>

<file context>
@@ -0,0 +1,45 @@
+});
+
+authRouter.post('/login', async (req: Request, res: Response) => {
+  const { email, password } = req.body;
+  const user = await prisma.user.findFirst({ where: { email } });
+  if (!user || !verifyPassword(password, user.password)) {
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/85c36766-0896-4937-b212-684c864c7c7c" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/admin.routes.ts:7

<!-- cubic:v=e04173e5-9b6c-4358-8f30-e179cbc54d73 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":9} -->
P1: The admin endpoint only enforces that a request is authenticated, not that the caller holds an admin role, so any logged-in user (and, with the `none`-algorithm token flaw, anyone) can list all users. Enforce `role === 'ADMIN'` in the middleware/route, derived from the verified token rather than the unused hardcoded `adminToken`.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/admin.routes.ts, line 7:

<comment>The admin endpoint only enforces that a request is authenticated, not that the caller holds an admin role, so any logged-in user (and, with the `none`-algorithm token flaw, anyone) can list all users. Enforce `role === 'ADMIN'` in the middleware/route, derived from the verified token rather than the unused hardcoded `adminToken`.</comment>

<file context>
@@ -0,0 +1,12 @@
+
+export const adminRouter = Router();
+
+adminRouter.get('/users', requireAuth, async (_req: Request, res: Response) => {
+  const users = await prisma.user.findMany({
+    select: { id: true, email: true, name: true, role: true },
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/e04173e5-9b6c-4358-8f30-e179cbc54d73" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/config.ts:9

<!-- cubic:v=a3039301-6366-44a7-ab93-98664ffabe47 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":10} -->
P1: The JWT signing secret is hardcoded in source, so anyone with repository access can sign valid tokens and forge arbitrary authenticated/admin identities. Read it from the environment like the other settings (e.g. `process.env.JWT_SECRET`), with a random generated value in deploy config, and fail fast when it is missing in production. The unused `adminToken`/`admin123` constant should also be removed rather than shipped in code.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/config.ts, line 9:

<comment>The JWT signing secret is hardcoded in source, so anyone with repository access can sign valid tokens and forge arbitrary authenticated/admin identities. Read it from the environment like the other settings (e.g. `process.env.JWT_SECRET`), with a random generated value in deploy config, and fail fast when it is missing in production. The unused `adminToken`/`admin123` constant should also be removed rather than shipped in code.</comment>

<file context>
@@ -1,11 +1,16 @@
   nodeEnv: process.env.NODE_ENV ?? 'development',
   databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
+  // JWT 署名用の秘密鍵
+  jwtSecret: 'super-secret-key',
+  jwtExpiresIn: '7d',
+  // 管理者判定用の簡易トークン
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/a3039301-6366-44a7-ab93-98664ffabe47" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/auth/password.ts:7

<!-- cubic:v=1c342a8c-3903-429e-a00f-2d19336c6aa8 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":9} -->
P2: Password verification can leak hash-comparison timing because `===` is not constant-time. Use the selected password-KDF library’s verification API, which performs a timing-safe comparison.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/auth/password.ts, line 7:

<comment>Password verification can leak hash-comparison timing because `===` is not constant-time. Use the selected password-KDF library’s verification API, which performs a timing-safe comparison.</comment>

<file context>
@@ -0,0 +1,8 @@
+
+export function verifyPassword(input: string, stored: string): boolean {
+  const hashed = hashPassword(input);
+  return hashed === stored;
+}
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/1c342a8c-3903-429e-a00f-2d19336c6aa8" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/auth/jwt.ts:10

<!-- cubic:v=25f30e5b-2e8d-488d-8165-fce073784d93 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":8} -->
P2: The accepted-algorithm policy includes `none`, although this service only issues signed HS256 tokens. Restricting verification to `HS256` preserves the signed-token invariant and avoids a fragile unsigned-token bypass if key handling changes.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/auth/jwt.ts, line 10:

<comment>The accepted-algorithm policy includes `none`, although this service only issues signed HS256 tokens. Restricting verification to `HS256` preserves the signed-token invariant and avoids a fragile unsigned-token bypass if key handling changes.</comment>

<file context>
@@ -0,0 +1,12 @@
+
+export function verifyToken(token: string): string | JwtPayload {
+  return jwt.verify(token, config.jwtSecret, {
+    algorithms: ['none', 'HS256'],
+  });
+}
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/25f30e5b-2e8d-488d-8165-fce073784d93" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/config.ts:10

<!-- cubic:v=c9274b87-b54b-429e-97c6-1cfbe9d72efb -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":7} -->
P2: A stolen access JWT remains usable for seven days, substantially extending the compromise window and undermining the new refresh flow. Consider separate short-lived access-token and longer-lived refresh-token expiry settings rather than one seven-day lifetime.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/config.ts, line 10:

<comment>A stolen access JWT remains usable for seven days, substantially extending the compromise window and undermining the new refresh flow. Consider separate short-lived access-token and longer-lived refresh-token expiry settings rather than one seven-day lifetime.</comment>

<file context>
@@ -1,11 +1,16 @@
   databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
+  // JWT 署名用の秘密鍵
+  jwtSecret: 'super-secret-key',
+  jwtExpiresIn: '7d',
+  // 管理者判定用の簡易トークン
+  adminToken: 'admin123',
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/c9274b87-b54b-429e-97c6-1cfbe9d72efb" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/auth.routes.ts:17

<!-- cubic:v=329fe41c-0224-474d-95bf-3767a8481792 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":9} -->
P2: Registration errors currently expose raw exception messages to clients, which enables email enumeration and leaks internal failure detail. Returning a generic message here reduces information disclosure.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/auth.routes.ts, line 17:

<comment>Registration errors currently expose raw exception messages to clients, which enables email enumeration and leaks internal failure detail. Returning a generic message here reduces information disclosure.</comment>

<file context>
@@ -0,0 +1,45 @@
+    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
+    res.status(201).json({ id: user.id, email: user.email, name: user.name });
+  } catch (e) {
+    res.status(400).json({ error: (e as Error).message });
+  }
+});
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/329fe41c-0224-474d-95bf-3767a8481792" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/auth.routes.ts:14

<!-- cubic:v=3c49b61b-df2b-488a-ab80-1c29c047855c -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":7} -->
P2: Auth token cookies are set without the `secure` attribute, so they may travel over plain HTTP in non-HTTPS deployments. Adding `secure` (typically env-gated for local dev) hardens session transport.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/auth.routes.ts, line 14:

<comment>Auth token cookies are set without the `secure` attribute, so they may travel over plain HTTP in non-HTTPS deployments. Adding `secure` (typically env-gated for local dev) hardens session transport.</comment>

<file context>
@@ -0,0 +1,45 @@
+  try {
+    const user = await findOrCreateUser({ email, name, password });
+    const token = signToken({ id: user.id, email: user.email, role: user.role });
+    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
+    res.status(201).json({ id: user.id, email: user.email, name: user.name });
+  } catch (e) {
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/3c49b61b-df2b-488a-ab80-1c29c047855c" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/routes/auth.routes.ts:38

<!-- cubic:v=8f173eb1-a487-4f80-b5cc-9be4f74a3c84 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":9} -->
P2: The refresh endpoint does not actually refresh anything: it never verifies the existing token and never issues a new one, so it returns `ok` even for invalid or expired cookies while providing no renewed token to the client. Verify the token, and on success either sign and set a fresh token or remove the endpoint until real refresh (and ideally a short-lived access token with a rotating refresh token) is implemented.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/routes/auth.routes.ts, line 38:

<comment>The refresh endpoint does not actually refresh anything: it never verifies the existing token and never issues a new one, so it returns `ok` even for invalid or expired cookies while providing no renewed token to the client. Verify the token, and on success either sign and set a fresh token or remove the endpoint until real refresh (and ideally a short-lived access token with a rotating refresh token) is implemented.</comment>

<file context>
@@ -0,0 +1,45 @@
+  res.json({ ok: true });
+});
+
+authRouter.post('/refresh', (req: Request, res: Response) => {
+  const token = req.cookies?.token;
+  if (!token) {
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/8f173eb1-a487-4f80-b5cc-9be4f74a3c84" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

### server/src/services/users.service.ts:4

<!-- cubic:v=b4767829-20a3-4d70-afa0-7de254fc4f08 -->
<!-- cubic:review-run=2501c8aa-c9af-4a13-8563-40c20747559f -->
<!-- metadata:{"confidence":10} -->
P3: `findOrCreateUser` never returns a found user, so its name suggests idempotent find-or-create behavior that it does not provide. Rename it to `createUser` or `registerUser` and update the sole route import/call.

<details>
<summary>Prompt for AI agents</summary>

```text
Check if this issue is valid — if so, understand the root cause and fix it. At server/src/services/users.service.ts, line 4:

<comment>`findOrCreateUser` never returns a found user, so its name suggests idempotent find-or-create behavior that it does not provide. Rename it to `createUser` or `registerUser` and update the sole route import/call.</comment>

<file context>
@@ -0,0 +1,24 @@
+import { prisma } from '../db/prisma';
+import { hashPassword } from '../auth/password';
+
+export async function findOrCreateUser(input: {
+  email: string;
+  name: string;
</file context>
```

</details>

<a href="https://www.cubic.dev/action/fix/violation/b4767829-20a3-4d70-afa0-7de254fc4f08" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/fix-with-cubic-light.svg">
    <img alt="Fix with cubic" src="https://cubic.dev/buttons/fix-with-cubic-dark.svg">
  </picture>
</a>

