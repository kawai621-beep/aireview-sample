#!/usr/bin/env bash
# セルフレビュー合格証 (.self-review/<sha>.json) を検査する共通ゲート（ツール非依存）。
# 呼び出し元: ① .husky/pre-push（git push をブロック） ② .claude/hooks/claude-pr-gate.sh（Claude Code のツール実行をブロック）
set -e

sha="$(git rev-parse HEAD 2>/dev/null || echo "")"
result=".self-review/${sha}.json"

# 意図的にスキップしたい場合は環境変数 SKIP_SELF_REVIEW=1
if [ "${SKIP_SELF_REVIEW:-0}" = "1" ]; then
  echo "[pr-gate] SKIP_SELF_REVIEW=1 のためセルフレビューゲートをスキップします。"
  exit 0
fi

if [ -z "$sha" ] || [ ! -f "$result" ]; then
  echo "✗ セルフレビュー未実施: ${result} がありません。" >&2
  echo "  PR前セルフレビューを実行してください:" >&2
  echo "    - Claude Code: /self-review（粒度チェック→チェックリスト適用→合格証生成）" >&2
  echo "    - その他: docs/pr-self-review-checklist.md に沿ってレビューし .self-review/<sha>.json を生成" >&2
  exit 1
fi

status="$(jq -r '.status // ""' "$result" 2>/dev/null || echo "")"
if [ "$status" != "pass" ]; then
  echo "✗ セルフレビューのステータスが「${status}」です。パスしていません。" >&2
  jq -r '.findings[]? | "  - [\(.severity)] \(.file):\(.line) \(.issue)"' "$result" 2>/dev/null || true
  echo "問題を修正（粒度NGの場合は分割）して、再度 /self-review を実行してください。" >&2
  exit 1
fi

echo "✓ セルフレビュー合格（commit ${sha:0:8}）— push を許可します。"
exit 0
