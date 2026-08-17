---
description: push前セルフレビュー（粒度チェック＋チェックリスト適用。結果を .self-review/<sha>.json に保存）
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git rev-parse:*), Bash(git merge-base:*), Write
---
作業ブランチの差分（main...HEAD）に対してレビューを実行する。

> 設計意図（目指す開発フロー §5-1）: 修正の自動適用は行わない（修正案は提案として表示し、採用判断は開発者が持つ）。
> Write を allowed-tools に含めるのは pushゲート用の合格証 `.self-review/<sha>.json` を出力するためのみ。

## 手順

1. **粒度を最初に確認する**（ここで引っかかったらレビューは続行しない）
   - `git diff --numstat $(git merge-base main HEAD)...HEAD` と `git diff --stat` で追加行数・変更ファイルを把握する
   - 基準: **1PR = 1つの関心事**（リファクタと機能追加・バグ修正を混ぜない）／追加行数は **+400行まで（200行以下が理想）**
   - 分割サイン: タイトルが「〜と〜」になる／PR本文で要約しきれない／追加行数が +400行を超える
   - **基準を満たさない場合**（超過・関心事の混在）:
     1. 分割案（関心事単位・リファクタと機能の分離・スタックPR）を提示する
     2. `.self-review/<sha>.json` を `status: "fail"`、findings に粒度問題（severity: major、issue に分割案）で保存する
     3. **そこで終了する**（チェックリスト適用には進まない。pushゲートがブロックする）
2. `git diff $(git merge-base main HEAD)...HEAD` で差分を取得する
3. `docs/pr-self-review-checklist.md` のチェックリストを差分に対して評価する。特に行単位でなく設計全体を見る必要がある項目（N+1・レース・タイミング・認可・TZ）は注意深く
4. 指摘を「重大（実バグ・認可・データ整合）／要検討／nit」に分けて列挙する。重大なものは修正案をコードで示す
5. CI が拾う範囲（書式・型・lint・test failing）は指摘しない
6. 結果を `.self-review/<sha>.json` に保存する:
   ```json
   {
     "commit": "<sha>",
     "branch": "<branch>",
     "timestamp": "<ISO8601>",
     "status": "pass" | "fail",
     "granularity": { "additions": 0, "deletions": 0, "singleConcern": true, "ok": true },
     "checks": { "<項目>": "ok" | "ng" | "n/a" },
     "findings": [
       { "severity": "critical|major|minor", "file": "...", "line": 0, "issue": "...", "suggestion": "..." }
     ]
   }
   ```
7. 報告:
   - `status: fail`（粒度NG含む）のときは findings と分割案を提示し、対応（修正または分割）を促す
   - `status: pass` のときは「人間レビュアーに確認を頼みたい点」を3つ挙げ、PR作成に進めることを伝える

## 注意
- `status: pass` でも AIレビューの取りこぼしはあり得る。重要な変更は特に慎重に。
- `.self-review/` は `.gitignore` 対象（一時成果物）。
- この結果は `.husky/pre-push` と Claude Code PreToolUse フック（`.claude/hooks/claude-pr-gate.sh`）のゲートとして使われる。
