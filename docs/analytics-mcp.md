# Google Analytics を Claude Code から読む（analytics-mcp）

サイトのアクセス状況を、Claude Code のセッションから直接たずねられるようにする仕組み。
計測そのもの（gtag.js の埋め込み、測定ID）は `specification.md` 9.5 を参照。

## 1. 仕組み

- `.mcp.json`（リポジトリ直下）に Google 公式の MCP サーバー `analytics-mcp` を登録してある。Claude Code は `uvx` でこれを起動し、GA の Data API と Admin API を読み取り専用で呼ぶ
- 認証は Application Default Credentials（ADC）。GCP プロジェクト `kuronekotaiwan-2027` のサービスアカウント `ga-mcp-reader` の権限を借用する形で、ユーザー自身の OAuth クライアントは作らない
- 認証情報は `%APPDATA%\gcloud-kuroneko-ga\` に置く。普段の gcloud（別アカウント・別プロジェクト・既存の ADC）とは分離してあり、`.mcp.json` から `GOOGLE_APPLICATION_CREDENTIALS` でこの場所を指している
- GA 側は、サービスアカウントのメールアドレスをプロパティの「閲覧者」として追加するだけ。GA を管理する Google アカウントと gcloud のアカウントが違っても動く
- 秘密情報はリポジトリに入れない。`.mcp.json` と `scripts/ga-mcp-login.cmd` に書いてあるのは、起動コマンド、プロジェクト ID、サービスアカウントのメール、連絡先として公開済みのまつりの Google アカウントだけ

## 2. 初回設定の手順

一度だけ行う。2026-10-13 に実施。

### GCP 側（gcloud で実施済み）

```
gcloud services enable analyticsdata.googleapis.com analyticsadmin.googleapis.com iamcredentials.googleapis.com --project kuronekotaiwan-2027
gcloud iam service-accounts create ga-mcp-reader --project kuronekotaiwan-2027 --display-name "GA MCP reader (Claude Code)"
gcloud iam service-accounts add-iam-policy-binding ga-mcp-reader@kuronekotaiwan-2027.iam.gserviceaccount.com --project kuronekotaiwan-2027 --member user:kuronekotaiwan.matsuri@gmail.com --role roles/iam.serviceAccountTokenCreator
```

- 課金の有効化は不要（3つの API はどれも無料枠で足りる）
- サービスアカウントには GCP 側のロールを付けない。GA のデータは GA 側の権限で読む

### GA 側（手作業）

1. GA の管理画面 → プロパティ「黒猫台湾まつり2027」（測定ID `G-VDER797CPB`）→ プロパティのアクセス管理
2. `ga-mcp-reader@kuronekotaiwan-2027.iam.gserviceaccount.com` を「閲覧者」で追加する

### ローカル（このPC）

```
scripts\ga-mcp-login.cmd
```

ブラウザが2回開く。1回目は gcloud へのログイン（まつりの Google アカウントを選ぶ）、2回目は MCP 用の認証情報の作成。2回目にユーザーへ求められる権限は cloud-platform だけで、GA の読み取り権限はサービスアカウント側のトークンに付く。
終わると `%APPDATA%\gcloud-kuroneko-ga\application_default_credentials.json` ができる。

### Claude Code 側

リポジトリ直下の `.mcp.json` はプロジェクト共有の設定なので、最初のセッションで「このサーバーを使うか」の承認を求められる。承認すると `analytics-mcp` のツールが使えるようになる。
`claude mcp list` で接続状態を確認できる。

## 3. 使い方

セッションの中で普通に聞けばよい。例:

- 「先週、どのページがいちばん見られた？」
- 「10月に入ってからの日別の訪問者数を出して」
- 「流入元の内訳を教えて」
- 「いま誰か見てる？」（リアルタイム）

MCP が持つツール: `get_account_summaries`（アカウントとプロパティの一覧）、`get_property_details`、`run_report`（通常のレポート）、`run_realtime_report`、`run_funnel_report`、`get_custom_dimensions_and_metrics`、`list_google_ads_links`。すべて読み取り専用。

レポートにはプロパティの数値 ID が要る。2027年のプロパティは `properties/558401465`（下の「4. 記録」）。別のプロパティは `get_account_summaries` で引ける。

## 4. 記録

| 項目 | 値 |
|---|---|
| GCP プロジェクト | `kuronekotaiwan-2027`（Google アカウント: kuronekotaiwan.matsuri@gmail.com） |
| サービスアカウント | `ga-mcp-reader@kuronekotaiwan-2027.iam.gserviceaccount.com` |
| GA アカウント | `accounts/352226151`（表示名 kuronekotaiwan.matsuri） |
| GA プロパティ（2027） | `properties/558401465`「黒猫台湾まつり2027」。測定ID `G-VDER797CPB`。サービスアカウントはこのプロパティの閲覧者 |
| MCP サーバー | `analytics-mcp` 0.7.0（PyPI）。`.mcp.json` でバージョンを固定 |
| 認証情報の置き場所 | `%APPDATA%\gcloud-kuroneko-ga\application_default_credentials.json` |

## 5. 更新と困ったとき

- **MCP サーバーを上げる**: `.mcp.json` の `analytics-mcp==0.7.0` を新しい版に書き換える。`uvx` が次回起動時に取り直す
- **認証が切れた**（`invalid_grant` や `Reauthentication is needed`）: `scripts\ga-mcp-login.cmd adc` を実行し直す。gcloud 自体のログインも切れていれば引数なしで実行する
- **`iam.serviceAccounts.getAccessToken` denied**: 権限借用の IAM 設定が反映されるまで数分かかることがある。設定直後なら少し待って再試行する
- **`get_account_summaries` が空の配列を返す**: GA 側でサービスアカウントがまだ閲覧者になっていない（または反映待ち）
- **403 PERMISSION_DENIED で GA のデータが読めない**: GA 側でサービスアカウントが閲覧者になっているか、プロパティ ID が合っているかを確認する
- **`has not been used in project ... before or it is disabled`**: `kuronekotaiwan-2027` で API が無効になっている。上の `gcloud services enable` を再実行する
- **サーバーが起動しない**: `uvx --from analytics-mcp==0.7.0 python -c "import analytics_mcp.server"` で依存の取得が通るか見る。`uv` が古いときは `winget upgrade astral-sh.uv`
- **別の PC で使う**: `uv`（`uvx`）と gcloud CLI を入れ、「2. 初回設定の手順」の「ローカル」以降をやり直す。GCP と GA の設定は共通

## 6. 判断の記録

- **権限借用にした理由**: ユーザー自身の OAuth クライアントを使う方式（公式 README の案1）は、GCP コンソールで同意画面とデスクトップ用クライアントを作り、JSON を落とす手順が要る。gmail アカウントの「テスト」状態のクライアントは7日でトークンが切れる。サービスアカウントの鍵ファイルは長期の秘密情報を PC に置くことになる。権限借用なら、鍵も OAuth クライアントも作らず、GA 側はメールアドレスを1つ足すだけで済む
- **専用の gcloud 設定ディレクトリにした理由**: このPCの既定の ADC は別の開発で使っている。MCP 用の ADC を既定の場所に書くと、そちらがまつりのサービスアカウントとして動いてしまう
- **バージョンを固定した理由**: `uvx` は固定しないと最初に取った版を使い続けるので、どの版が動いているかを `.mcp.json` に明示しておく
