#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) 用フック: git push / gh pr create のときだけ pr-gate に委譲する。
# それ以外のコマンドは素通り。pr-gate が失敗したら exit 2 でツール実行をブロックする。
set -euo pipefail

# PreToolUse の入力（JSON）を読む
input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)"

# git push（git -C <path> push 形式もカバー）と gh pr create を対象にする。
case "$cmd" in
  *"git push"*|*"git -C"*" push"*|*"gh pr create"*)
    "$(dirname "$0")/pr-gate.sh" || exit 2   # exit 2 = ツール実行をブロック
    ;;
esac
exit 0
