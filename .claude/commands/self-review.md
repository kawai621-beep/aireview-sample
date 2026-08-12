---
description: PR前セルフレビューを実行し、結果を .self-review/<sha>.json に保存する
---

現在のブランチの差分に対して `docs/pr-self-review-checklist.md` のチェックリストを適用し、セルフレビューを実行してください。

## 手順

1. **対象コミット取得**: `git rev-parse HEAD` で SHA、`git rev-parse --abbrev-ref HEAD` でブランチ名を取得。
2. **差分取得**: `git diff $(git merge-base main HEAD)...HEAD` を取得（main との差分）。
3. **チェックリスト読込**: `docs/pr-self-review-checklist.md` を読む。
4. **評価**: チェックリストの各項目を差分に対して評価する。特に行単位でなく設計全体を見る必要がある項目（N+1・レース・タイミング・認可・TZ）は注意深く。
5. **結果保存**: `.self-review/<sha>.json` を作成:
   ```json
   {
     "commit": "<sha>",
     "branch": "<branch>",
     "timestamp": "<ISO8601>",
     "status": "pass" | "fail",
     "checks": { "<項目>": "ok" | "ng" | "n/a" },
     "findings": [
       { "severity": "critical|major|minor", "file": "...", "line": 0, "issue": "...", "suggestion": "..." }
     ]
   }
   ```
6. **報告**:
   - `status: fail` のときは findings を提示し修正を促す（修正後に再度 `/self-review`）。
   - `status: pass` のときは PR 作成に進めることを伝える。

## 注意
- `status: pass` でも AIレビューの取りこぼしはあり得る。重要な変更は特に慎重に。
- `.self-review/` は `.gitignore` 対象（一時成果物）。
- この結果は PreToolUse フック（`.claude/hooks/pr-gate.sh`）で `git push` / `gh pr create` のゲートとして使われる。
