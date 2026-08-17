# aireview-sample

AIコードレビュー性能比較用の意図的に問題を含むサンプル（ブログ/CMS）。本番運用不可。
詳細は `docs/`（00〜07）を参照。main は「健康な骨組み」のみを保ち、問題は feature ブランチ側で実装する。

## PR前のセルフレビュー（IMPORTANT）

push前に必ず実施する。ここを通さないPRは作らない。

1. **PRの粒度を確認**: 1PR=1つの関心事・目安 +400行まで（200行以下が理想）。リファクタと挙動変更を混ぜない。超える場合や関心事が混ざる場合は分割（スタックPR可）してから再レビュー
2. CI と同じチェックを通す（ci.yml と同順）:
   ```bash
   npx prettier --check "server/src/**/*.ts" "client/src/**/*.{ts,tsx}"
   npm run lint
   npm run typecheck
   ```
   （※ 本リポジトリに test スクリプト・テストコードは未実装。CI の grep ゲート（`$queryRawUnsafe` / `dangerouslySetInnerHTML` / `@ts-ignore`）にも引っかからないこと）
3. Claude Code でセルフレビュー:
   `/self-review`（または `/code-review`）
   認可・決済・Webhook が絡む変更は `/security-review` も実行
4. 「重大」指摘をゼロにしてから PR を作成する
5. 合格証 `.self-review/<sha>.json`（`/self-review` が生成）が pushゲート（`.husky/pre-push` ＋ PreToolUse フック）を通す
