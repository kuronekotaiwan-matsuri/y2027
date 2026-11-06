# 外部サービスの一覧

このサイトが頼っている外部のサービスと、その設定がどこにあるかをまとめる。2026-11-06 時点でリポジトリと GitHub の設定を調べて書いた。
サービスを足す・やめるときは、この表も直す。

サーバーは持たない。サイトは静的ファイル（`out/`）だけで、データベース、フォーム、決済、メール送信、独自ドメインはどれも使っていない。

## 1. 一覧

| サービス | 用途 | 区分 | 設定の場所 | 費用 |
|---|---|---|---|---|
| GitHub（組織 `kuronekotaiwan-matsuri`） | ソースの置き場所 | 公開の土台 | リポジトリ `kuronekotaiwan-matsuri/y2027` | 無料 |
| GitHub Actions | `main` への push でビルドし、`gh-pages` に公開 | 公開の土台 | `.github/workflows/deploy.yml` | 無料（公開リポジトリ） |
| GitHub Pages | サイトの配信 | 公開の土台 | リポジトリの Settings → Pages（`gh-pages` ブランチの `/`、HTTPS 強制、独自ドメインなし） | 無料 |
| npm レジストリ | ビルド時の依存の取得 | 公開の土台 | `package.json`、`package-lock.json` | 無料 |
| Google Fonts | 書体（Zen Maru Gothic、Klee One）の配信。閲覧者のブラウザが読む | 閲覧時 | `src/app/layout.tsx` の `FONTS_URL` | 無料 |
| Google Analytics 4 | アクセスの計測（gtag.js）。閲覧者のブラウザが読む | 閲覧時 | `src/config/site.ts` の `gaMeasurementId`（`G-VDER797CPB`） | 無料 |
| Google Search Console | 検索での見え方の確認、サイトマップの送信 | 運用 | 所有確認は `public/googleafcd8224eb805b59.html` | 無料 |
| Google Cloud（プロジェクト `kuronekotaiwan-2027`） | GA と Search Console を Claude Code から読むための API とサービスアカウント | 運用（手元のみ） | `.mcp.json`、`scripts/ga-mcp-login.cmd`、`scripts/gsc-mcp/server.py` | 無料（課金は無効のまま） |
| PyPI（`analytics-mcp`、`mcp` など） | 上の MCP サーバーの依存。`uv` / `uvx` が取る | 運用（手元のみ） | `.mcp.json`（`analytics-mcp==0.7.0`）、`server.py` 先頭の inline metadata | 無料 |
| Instagram（`@kuronekotw_fes`） | 告知の窓口。サイトからはリンクするだけで、埋め込みや API は使わない | リンク先 | `src/config/site.ts` の `instagram` | 無料 |
| Claude Code のプラグイン | 推敲（`yomiyasu@yomiyasu`、GitHub `nanaism/yomiyasu`）と見た目の指針（`frontend-design`） | 制作（手元のみ） | `.claude/settings.json`、`.claude/settings.local.json` | — |
| GitHub API（リリース情報） | `/polish` が yomiyasu の最新版を確かめる | 制作（手元のみ） | `scripts/yomiyasu-check-update.mjs` | 無料（認証なし） |

区分の意味:

- **公開の土台**: 止まるとサイトの更新や配信が止まる
- **閲覧時**: 閲覧者のブラウザが読みに行く。止まっても本文は読める（書体が代替になる、計測が欠ける）
- **運用 / 制作（手元のみ）**: 実行委員が手元で使う。止まってもサイトには影響しない

## 2. アカウント

| アカウント | 持っているもの |
|---|---|
| GitHub 組織 `kuronekotaiwan-matsuri` | 年ごとのサイト（`y2025`、`y2026`、`y2027`）と、ルートの `kuronekotaiwan-matsuri.github.io`。2026-11-04 に個人アカウントから組織へ移した。URL は変わっていない |
| Google アカウント `kuronekotaiwan.matsuri@gmail.com` | GA（アカウント `accounts/352226151`、2027年のプロパティ `properties/558401465`）、Search Console のプロパティ、GCP プロジェクト `kuronekotaiwan-2027` |
| Instagram `@kuronekotw_fes` | 告知 |

GA・Search Console・GCP の細かい ID、サービスアカウント、認証の仕組みは `docs/analytics-mcp.md` に書いてある。

## 3. このリポジトリの外にある関連

- **ルートのリダイレクト**: `https://kuronekotaiwan-matsuri.github.io/` は別リポジトリ `kuronekotaiwan-matsuri.github.io` の `app-top` が配信し、最新年のサイトへ送る。新しい年を公開するときは向き先を直す（仕様書 9.9）
- **robots.txt**: クローラーが読むのはホスト直下の `/robots.txt` だけなので、年ごとのサイトマップの場所はルートリポジトリの `app-top/public/robots.txt` に書く（仕様書 9.5）
- **2026年の GA**: 2026年のサイトは別のプロパティ（測定ID `G-5JW9C3WY72`）を使っている

## 4. 方針

- 閲覧時に読み込む外部のものは Google Fonts と GA だけにする（仕様書 9.7）。地図や動画、SNS の埋め込みを足すときは、ここと仕様書を直してから入れる
- 秘密情報（鍵ファイル、トークン）はリポジトリに入れない。GitHub Actions が使うのは自動で発行される `GITHUB_TOKEN` だけで、リポジトリの Secrets は登録していない
- 有料のプランは使わない。費用が出るサービスを足すときは実行委員会で決める
