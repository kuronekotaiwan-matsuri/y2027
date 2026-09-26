# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code の挙動を定める。
黒猫台湾まつり自体の内容（コンセプト・仕様）は `docs/` を参照すること。

## プロジェクトの参照先

- コンセプト: `docs/concept/concept.md`（判断に迷ったらここに戻る）
- サイト仕様書: `docs/specification.md`
- デザインシステム: `docs/design-system.md`（デザイン工程で作成）
- 過去サイト: `../y2026`, `../y2025`。参考程度に見る。踏襲する義務はなく、GitHub Pages で動作すればよい
- 公開URL: `https://kuronekotaiwan-matsuri.github.io/y2027/`（`basePath` は `/y2027`）

## Git 運用

- ブランチは `main` のみ。feature ブランチは作らない
- commit / push はユーザーの指示を待たず、区切りのよいタイミングで自律的に行う
  - 例: ドキュメントを1本書き終えた、機能が動く状態になった、ビルドが通った
  - 途中の壊れた状態はコミットしない
- コミットメッセージは日本語。`種別(範囲): 内容` の形式（例: `docs: サイト仕様書を追加`, `feat(timeline): 物語フィルタを追加`）
- コミット前に `git status` と `git diff` で内容を確認する

## Bash コマンドの実行ルール

- `&&`, `;`, `|` などで複数コマンドをチェインしない。1コマンドずつ実行する
  - 理由: `settings.json` の許可パターンはコマンド先頭にマッチするため、チェインすると毎回許可を求めてしまう
- `cd` を含めず、絶対パスまたは作業ディレクトリ基準の相対パスで実行する

## 言語

- ドキュメント、コメント、コミットメッセージ、ユーザーへの応答は日本語
- コード内の識別子は英語

## サブエージェント（`.claude/agents/`）

本番サイトの実装では、次の3つを使い分ける。メインのセッションは計画、依頼、統合、git を担当する。

| エージェント | 担当 | 使うとき |
|---|---|---|
| `frontend-engineer` | Next.js のページ、content パイプライン、データ・設定、テスト、ビルド設定 | ページやデータ構造を作る、content を触る、ビルド・lint・型を直す |
| `web-designer` | マークアップの意匠、CSS Modules、余白・文字組み・色、文言、デザインシステムの適用 | 見た目を作る・直す、デザインシステムを更新する |
| `design-reviewer` | 読み取り専用のレビュー。スクリーンショットと grep で、デザイン・仕様・アクセシビリティ・静的サイトの正しさを確認 | ページを実装した後、公開前 |

基本の流れ: `frontend-engineer`（骨組みとデータ）→ `web-designer`（見た目）→ `design-reviewer`（確認）→ 指摘があれば担当に戻す。
見た目とロジックが分けにくい小さな変更は、どちらか1つに任せてよい。

見た目の判断基準は Anthropic 公式の `frontend-design` プラグインの原則を日本語で `web-designer` に組み込んである。
プラグイン自体を入れるとメインのセッションでも同じ指針がスキルとして使える（任意）: `/plugin install frontend-design@claude-plugins-official`

## 実装の約束

- スタック: Next.js（App Router、`output: 'export'`、`basePath: '/y2027'`）+ TypeScript strict + CSS Modules + CSS custom properties。Tailwind は使わない
- コンポーネント: `src/components/<group>/<Name>/<Name>.tsx` と `<Name>.module.css`（PascalCase）。ページは `src/app/`
- デザイントークンは `src/app/globals.css` の `:root` に置き、`docs/design-system.md` 9章と一致させる
- content の読み込み・検証・変換は `src/lib/content/` に閉じる。不正な front-matter はビルドを失敗させる
- 完了の条件: `npm run lint`、`npx tsc --noEmit`、`npm test`、`npm run build` がすべて通ること

## 使い捨ての作業物

- `docs/design-lab/` はデザイン選定用の使い捨てツール。サイト本体（`src/`）から独立させ、ビルド不要の静的 HTML で作る
- 選定後は採用したトークンを `docs/design-system.md` と `src/app/globals.css` に移す。lab 自体は削除してよい（履歴に残る）
- 一時ファイルはリポジトリ内に残さない。必要ならスクラッチパッドを使う

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
