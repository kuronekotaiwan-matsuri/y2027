# Google Analytics と Search Console を Claude Code から読む

サイトのアクセス状況（GA）と検索での見え方（Search Console）を、Claude Code のセッションから直接たずねられるようにする仕組み。
計測そのもの（gtag.js の埋め込み、測定ID）は `specification.md` 9.5 を参照。

## 1. 仕組み

- `.mcp.json`（リポジトリ直下）に2つの MCP サーバーを登録してある。どちらも読み取り専用
  - `analytics-mcp`: Google 公式の MCP サーバー（PyPI）。Claude Code が `uvx` で起動し、GA の Data API と Admin API を呼ぶ
  - `search-console-mcp`: このリポジトリの `scripts/gsc-mcp/server.py`。Claude Code が `uv run` で起動する（依存はファイル先頭の inline metadata に書いてあり、`uv` が自動で取る）。Search Console API を REST で呼ぶ
- 認証は Application Default Credentials（ADC）。GCP プロジェクト `kuronekotaiwan-2027` のサービスアカウント `ga-mcp-reader` の権限を借用する形で、ユーザー自身の OAuth クライアントは作らない
- 認証情報は `%APPDATA%\gcloud-kuroneko-ga\` に置く。普段の gcloud（別アカウント・別プロジェクト・既存の ADC）とは分離してあり、`.mcp.json` から `GOOGLE_APPLICATION_CREDENTIALS` でこの場所を指している。2つのサーバーで同じファイルを使う
- GA 側・Search Console 側は、サービスアカウントのメールアドレスをユーザーとして追加するだけ。GA や GSC を管理する Google アカウントと gcloud のアカウントが違っても動く
- 秘密情報はリポジトリに入れない。`.mcp.json` と `scripts/` に書いてあるのは、起動コマンド、プロジェクト ID、サービスアカウントのメール、連絡先として公開済みのまつりの Google アカウントだけ

## 2. 初回設定の手順

一度だけ行う。2026-10-13 に実施。

### GCP 側（gcloud で実施済み）

```
gcloud services enable analyticsdata.googleapis.com analyticsadmin.googleapis.com searchconsole.googleapis.com iamcredentials.googleapis.com --project kuronekotaiwan-2027
gcloud iam service-accounts create ga-mcp-reader --project kuronekotaiwan-2027 --display-name "GA MCP reader (Claude Code)"
gcloud iam service-accounts add-iam-policy-binding ga-mcp-reader@kuronekotaiwan-2027.iam.gserviceaccount.com --project kuronekotaiwan-2027 --member user:kuronekotaiwan.matsuri@gmail.com --role roles/iam.serviceAccountTokenCreator
```

- 課金の有効化は不要（4つの API はどれも無料）
- サービスアカウントには GCP 側のロールを付けない。データは GA・GSC 側の権限で読む

### GA 側（手作業）

1. GA の管理画面 → プロパティ「黒猫台湾まつり2027」（測定ID `G-VDER797CPB`）→ プロパティのアクセス管理
2. `ga-mcp-reader@kuronekotaiwan-2027.iam.gserviceaccount.com` を「閲覧者」で追加する

### Search Console 側（手作業）

1. Search Console → プロパティ `https://kuronekotaiwan-matsuri.github.io/y2027/` → 設定 → ユーザーと権限
2. 同じメールアドレスを追加する（読むだけなら「制限付き」で足りる。現在は「フル」）

### ローカル（このPC）

```
scripts\ga-mcp-login.cmd
```

ブラウザが2回開く。1回目は gcloud へのログイン（まつりの Google アカウントを選ぶ）、2回目は MCP 用の認証情報の作成。2回目にユーザーへ求められる権限は cloud-platform だけで、GA と Search Console の読み取り権限はサービスアカウント側のトークンに付く。
終わると `%APPDATA%\gcloud-kuroneko-ga\application_default_credentials.json` ができる。

### Claude Code 側

リポジトリ直下の `.mcp.json` はプロジェクト共有の設定なので、最初のセッションで「このサーバーを使うか」の承認を求められる。承認すると2つのサーバーのツールが使えるようになる。
`claude mcp list` で接続状態を確認できる。

## 3. 使い方

セッションの中で普通に聞けばよい。例:

- 「先週、どのページがいちばん見られた？」（GA）
- 「10月に入ってからの日別の訪問者数を出して」（GA）
- 「流入元の内訳を教えて」（GA）
- 「いま誰か見てる？」（GA リアルタイム）
- 「どんな検索語で表示されている？クリックされた？」（GSC）
- 「/making/ はインデックスされている？」（GSC の URL 検査）
- 「サイトマップは処理された？」（GSC）

`analytics-mcp` のツール: `get_account_summaries`（アカウントとプロパティの一覧）、`get_property_details`、`run_report`（通常のレポート）、`run_realtime_report`、`run_funnel_report`、`get_custom_dimensions_and_metrics`、`list_google_ads_links`。
レポートにはプロパティの数値 ID が要る。2027年のプロパティは `properties/558401465`（下の「4. 記録」）。別のプロパティは `get_account_summaries` で引ける。

`search-console-mcp` のツール: `list_sites`、`query_search_analytics`（クリック数・表示回数・CTR・掲載順位を query / page / country / device / date で集計）、`list_sitemaps`、`inspect_url`（URL 検査）。
サイトの URL は省略すると 2027 のプロパティになる。日付は `YYYY-MM-DD` のほか `today` / `yesterday` / `NdaysAgo` が使える。GSC のデータは2〜3日遅れて確定する。

## 4. 記録

| 項目 | 値 |
|---|---|
| GCP プロジェクト | `kuronekotaiwan-2027`（Google アカウント: kuronekotaiwan.matsuri@gmail.com） |
| サービスアカウント | `ga-mcp-reader@kuronekotaiwan-2027.iam.gserviceaccount.com` |
| GA アカウント | `accounts/352226151`（表示名 kuronekotaiwan.matsuri） |
| GA プロパティ（2027） | `properties/558401465`「黒猫台湾まつり2027」。測定ID `G-VDER797CPB`。サービスアカウントはこのプロパティの閲覧者 |
| Search Console プロパティ | URL プレフィックス `https://kuronekotaiwan-matsuri.github.io/y2027/`。確認は `public/googleafcd8224eb805b59.html`。サービスアカウントはフル権限 |
| MCP サーバー | `analytics-mcp` 0.7.0（PyPI、`.mcp.json` でバージョン固定）と `search-console-mcp`（`scripts/gsc-mcp/server.py`） |
| 認証情報の置き場所 | `%APPDATA%\gcloud-kuroneko-ga\application_default_credentials.json` |

## 5. 更新と困ったとき

- **analytics-mcp を上げる**: `.mcp.json` の `analytics-mcp==0.7.0` を新しい版に書き換える。`uvx` が次回起動時に取り直す
- **search-console-mcp を直す**: `scripts/gsc-mcp/server.py` を編集する。依存を足すときはファイル先頭の `dependencies` に書く
- **認証が切れた**（`invalid_grant` や `Reauthentication is needed`）: `scripts\ga-mcp-login.cmd adc` を実行し直す。gcloud 自体のログインも切れていれば引数なしで実行する
- **`iam.serviceAccounts.getAccessToken` denied**: 権限借用の IAM 設定が反映されるまで数分かかることがある。設定直後なら少し待って再試行する
- **`get_account_summaries` が空の配列を返す**: GA 側でサービスアカウントがまだ閲覧者になっていない（または反映待ち）
- **403 PERMISSION_DENIED で GA のデータが読めない**: GA 側でサービスアカウントが閲覧者になっているか、プロパティ ID が合っているかを確認する
- **`Request had insufficient authentication scopes`（GSC）**: 権限借用のトークンに Search Console のスコープが付いていない。`server.py` は ADC ファイルを読んでスコープを明示しているので通常は出ない。`google.auth.default()` を使う別のコードから呼ぶ場合は、ADC ファイルの `scopes` に `webmasters.readonly` が要る（`scripts\ga-mcp-login.cmd adc` を実行し直すと付く）
- **GSC の集計が空**: 表示回数がまだ無いか、直近2〜3日はデータが未確定
- **`has not been used in project ... before or it is disabled`**: `kuronekotaiwan-2027` で API が無効になっている。上の `gcloud services enable` を再実行する
- **サーバーが起動しない**: `uvx --from analytics-mcp==0.7.0 python -c "import analytics_mcp.server"` や `uv run --no-project scripts/gsc-mcp/server.py` で依存の取得が通るか見る。`uv` が古いときは `winget upgrade astral-sh.uv`
- **別の PC で使う**: `uv`（`uvx`）と gcloud CLI を入れ、「2. 初回設定の手順」の「ローカル」以降をやり直す。GCP・GA・GSC の設定は共通

## 6. 判断の記録

- **権限借用にした理由**: ユーザー自身の OAuth クライアントを使う方式（公式 README の案1）は、GCP コンソールで同意画面とデスクトップ用クライアントを作り、JSON を落とす手順が要る。gmail アカウントの「テスト」状態のクライアントは7日でトークンが切れる。サービスアカウントの鍵ファイルは長期の秘密情報を PC に置くことになる。権限借用なら、鍵も OAuth クライアントも作らず、GA・GSC 側はメールアドレスを1つ足すだけで済む
- **専用の gcloud 設定ディレクトリにした理由**: このPCの既定の ADC は別の開発で使っている。MCP 用の ADC を既定の場所に書くと、そちらがまつりのサービスアカウントとして動いてしまう
- **バージョンを固定した理由**: `uvx` は固定しないと最初に取った版を使い続けるので、どの版が動いているかを `.mcp.json` に明示しておく
- **Search Console は自前のサーバーにした理由**: Google 公式の MCP が無く、コミュニティのものはサービスアカウントの鍵ファイルを前提にしている。必要な API は4本だけなので、同じ認証ファイルを使う 100 行ほどのサーバーを置いた方が、依存も挙動も把握できる
