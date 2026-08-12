#!/usr/bin/env bash
# PreToolUse フック: git push / gh pr create の前にセルフレビュー結果を検証する。
# セルフレビュー未実施または fail の場合、exit 2 でコマンドをブロックする。
set -euo pipefail

# PreToolUse の入力（JSON）を読む
input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)"

# 対象は git push / gh pr create のみ。それ以外は素通り。
if ! printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(git[[:space:]]+push|gh[[:space:]]+pr[[:space:]]+create)([[:space:]]|$)'; then
  exit 0
fi

sha="$(git rev-parse HEAD 2>/dev/null || echo "")"
result=".self-review/${sha}.json"

if [ -z "$sha" ] || [ ! -f "$result" ]; then
  cat <<'EOF'
[PRゲート] このコミットのセルフレビュー結果が見つかりません。

PR作成 / push の前にセルフレビューを実行してください:
  /self-review

結果が .self-review/<commit>.json に保存され、status: pass になると push が許可されます。
EOF
  exit 2
fi

status="$(jq -r '.status // ""' "$result" 2>/dev/null || echo "")"
if [ "$status" != "pass" ]; then
  echo "[PRゲート] セルフレビューのステータスが「${status}」です。パスしていません。"
  echo "findings:"
  jq -r '.findings[]? | "  - [\(.severity)] \(.file):\(.line) \(.issue)"' "$result" 2>/dev/null || true
  echo ""
  echo "問題を修正して再度 /self-review を実行してください。"
  exit 2
fi

echo "[PRゲート] セルフレビュー合格（commit ${sha:0:8}）。push を許可します。"
exit 0
