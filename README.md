# y2027
黒猫台湾まつり2027

- 記録や書き手を書き足す: `content/README.md`（詳しくは `docs/writing-guide.md`）
- サイトの仕様: `docs/specification.md`、デザイン: `docs/design-system.md`

## インフラ

| サービス | 用途 | 設定の場所 |
|---|---|---|
| GitHub Actions | `main` への push でビルドし、`gh-pages` ブランチに公開 | `.github/workflows/deploy.yml` |
| GitHub Pages | サイトの配信（`https://kuronekotaiwan-matsuri.github.io/y2027/`） | リポジトリの Settings → Pages（`gh-pages` ブランチ）、`next.config.ts` の `basePath` |
| Google Fonts | 書体の配信。閲覧者のブラウザが読む | `src/app/layout.tsx` の `FONTS_URL` |
| Google Analytics 4 | アクセスの計測 | `src/config/site.ts` の `gaMeasurementId` |
| Google Search Console | 検索での見え方の確認、サイトマップの送信 | 所有確認は `public/googleafcd8224eb805b59.html`、ほかは管理画面で設定 |
| Google Cloud（プロジェクト `kuronekotaiwan-2027`） | GA と Search Console を Claude Code から読むための API。手元でだけ使う | `.mcp.json`、`scripts/ga-mcp-login.cmd`、`scripts/gsc-mcp/server.py` |
| Instagram（`@kuronekotw_fes`） | 告知の窓口。サイトからはリンクするだけ | `src/config/site.ts` の `instagram` |

サーバー、データベース、独自ドメインは持たない。サイトは静的ファイル（`out/`）だけで、ルート `https://kuronekotaiwan-matsuri.github.io/` は別リポジトリ `kuronekotaiwan-matsuri.github.io` が配信し、最新年のサイトへ送る。

アカウント、区分（止まったときの影響）、費用、手元でだけ使う制作の道具まで含めた詳細は `docs/infrastructure.md` にある。
