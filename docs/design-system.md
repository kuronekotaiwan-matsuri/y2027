# デザインシステム

黒猫台湾まつり2027 — 「机の上の商店街」

design-lab 第2ラウンドの案02 を採用したもの（`docs/design-lab/v2/tokens/tokens-02.css`）。
本書が確定値の置き場所であり、実装では本書末尾のトークンをそのまま `src/app/globals.css` の `:root` に置く。

## 1. 世界観

祭りを作っている人の机の上。商店街の色（クリーム・赤・紺・金）の紙に、ペン字でメモを書き、
写真をテープで貼り、決まったことに判子を押している。

- 書体はペン字（Klee One）。看板もメモも同じ手で書いている
- 紙はクリーム色で、細かいドットの方眼が入っている
- カードはわずかに傾き、金色のマスキングテープで留めてある
- 状態は判子（二重線の丸いタグ）で示す。ボツは打ち消し線
- 写真はポラロイド風の白い台紙に入れる。スマホ写真のままでよい
- 月の区切りと「いま」は黄色い付箋

整えるのは余白と部品の形まで。中身（写真・メモ）は途中のままでよい。

## 2. カラー

### 基本

| 役割 | 値 | 用途 |
|---|---|---|
| プライマリ | `#B7332A` | 主要ボタン、公式の物語、判子、Instagramアイコン |
| プライマリ上の文字 | `#FFFBF2` | |
| セカンダリ | `#1F3A5F`（紺） | 個人の物語、リンク、タイムラインの線、フッター |
| アクセント | `#D9A62E`（金） | ヘッダーの二重線、テープ、注記の枠 |
| 背景 | `#FBF3E4`（クリーム） | ページ背景 |
| 代替背景 | `#F3E4C8` | 交互に置くセクションの背景 |
| 面 | `#FFFBF2` | カード、記録本文の背景、ヒーロー |
| 文字 | `#2B2118` | 本文 |
| 文字（薄） | `#6A5A48` | 要約、日付、キャプション |
| 罫線 | `#D9C7A6` | カードの枠、区切り線 |
| リンク | `#1F3A5F` | 本文中のリンク、物語名 |
| 付箋 | `#FFF3B0` / 文字 `#5A4A00` | 立場バッジ、月ラベル、「いま」ボックス、見出しのマーカー |

### ヘッダー・フッター・ボタン

| 役割 | 値 |
|---|---|
| ヘッダー背景 / 文字 | `#FBF3E4` / `#2B2118`。下端に `4px double #D9A62E` |
| フッター背景 / 文字 | `#1F3A5F` / `#F3E4C8` |
| ボタン（プライマリ）背景 / 文字 | `#B7332A` / `#FFFBF2` |
| ボタン（セカンダリ）背景 / 文字 / 枠 | `#FFFBF2` / `#1F3A5F` / `#1F3A5F` |

### 物語の色

物語バッジ、タイムラインのフィルタチップ、物語ページの見出しに使う。

| 物語 | 背景 | 文字 |
|---|---|---|
| 公式（祭りをつくる） | `#B7332A` | `#FFFBF2` |
| 個人・団体の1本目 | `#1F3A5F` | `#F3E4C8` |
| 3本目以降（未指定時の自動割当。この順） | `#4F7F4A` 緑 → `#7A3E6B` 紫 → `#2A7F7F` 青緑 → `#B07A1E` 黄土 | `#FFFBF2` |

`kind: personal` の物語はバッジに「個人」の印を付け、物語ページと記録ページの冒頭に注記を置く（注記の色は下記）。

### 立場バッジ・状態タグ・注記

| 部品 | 背景 | 文字 | 枠 |
|---|---|---|---|
| 立場バッジ | `#FFF3B0` | `#5A4A00` | なし |
| 検討中・試作中 | 透明 | `#B7332A` | `2px double currentColor` |
| 決定・開催情報 | `#B7332A` | `#FFFBF2` | `2px double currentColor` |
| ボツ | 透明 | `#6A5A48` + 打ち消し線 | `2px double currentColor` |
| 募集中 | 透明 | `#1F3A5F` | `2px double currentColor` |
| 個人活動の注記 | `#FFF3D6` | `#5A4300` | `#D9A62E`（左端を太く） |

状態タグは判子に見せるため、`-2deg` 傾ける。

## 3. タイポグラフィ

- 看板・見出し（ロゴ、ヒーロー、セクション見出し、記録タイトル、ゴール）: `"Klee One", "Zen Maru Gothic", sans-serif` ウェイト 600
- 本文: `"Zen Maru Gothic", sans-serif` ウェイト 400
- アクセント（日付、キャプション、要約の一部、月ラベル）: `"Klee One"` ウェイト 400
- Google Fonts: `https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700&family=Klee+One:wght@400;600&display=swap`
- ベースサイズ: `16px`
- h1: `2.9rem`（モバイルでは 0.72倍）
- h2: `2.1rem`（モバイルでは 0.85倍）
- h3: `1.5rem`
- 小テキスト: `0.875rem`
- 本文行間: `1.85`
- 見出し字間: `0.03em`

## 4. スペーシング・レイアウト

- 基本単位: `8px`
- セクション間余白: `76px`（モバイルは `48px`）
- コンテンツ内余白（左右）: `24px`
- コンテンツ最大幅: `1080px`
- 記録本文の最大幅: `700px`
- ヒーロー: 左寄せ、最小高さ `50vh`、背景は面色 `#FFFBF2`
- ナビ: 水平。モバイルはハンバーガー
- カード列数: 3（物語一覧は 2）。モバイルは 1
- タイムライン: 縦1列。線は左、カードは右。モバイルでも同じ

## 5. 形・装飾

- 角丸: `4px`（カード内要素・注記・タイムラインカード）、`6px`（カード）、`50px`（ボタン・タグ）
- 枠線: `1px solid #D9C7A6`
- ボタンの枠: `2px`
- シャドウ: `0 2px 4px rgba(43,33,24,0.10), 0 8px 18px rgba(43,33,24,0.06)`
- シャドウ（ホバー）: `0 4px 8px rgba(43,33,24,0.12), 0 14px 28px rgba(43,33,24,0.10)`
- トランジション: `0.25s`
- 背景のドット: `radial-gradient(rgba(43,33,24,0.14) 1px, transparent 1.2px)` を `18px` 間隔
- カードの傾き: `-0.6deg`。偶数番目は逆向き。傾けるのはカードだけで、タイムラインの項目や本文は傾けない
- テープ: カード上端中央と写真上端中央に `rgba(217,166,46,0.75)` の帯（90〜110px × 22〜24px、少し回転）
- 写真の台紙: 白 `#FFFBF2`、内側余白 `10px 10px 28px`（下を広く）、角丸 `2px`、シャドウあり
- セクション見出し: 文字の下 38% に付箋色 `#FFF3B0` のマーカー
- 「いま」ボックス（ヒーロー）: 付箋色の背景、枠なし。`-1deg` 傾けて貼る
- 月ラベル: 付箋色の背景、`-1.5deg` 傾け、薄いシャドウ
- フォーカス: `2px solid #1F3A5F`、外側に `3px` 離す。紺地（フッター）では金 `#D9A62E`
- 空の状態（記録 0 件など）: 点線の枠 `2px dashed #D9C7A6` の中に「いつ・何が載るか」を書く。「まだない」で終わらせない
- 押せるものは 44px 四方以上（ボタン、ナビ、チップ）

## 6. タイムライン

- 線: `2px dashed #1F3A5F`
- ドット: `16px` の円。面色 `#FFFBF2` に `3px double #B7332A`（判子）
- 月ラベル: 付箋（上記）
- ゴールマーカー（2027.05 開催）: 背景 `#B7332A`、文字 `#FFFBF2`

## 7. ブレークポイント

- モバイル: `〜767px`
- タブレット: `768px〜1023px`
- デスクトップ: `1024px〜`

## 8. 使い方の注意

- 主コンテンツ（出店情報・プログラムなど来場者が情報を探すページ）では、傾きとテープを使わない（`--card-tilt: 0deg`、`--decor-tape: none` をページ単位で上書き）。色・書体・判子・付箋は共通。サブコンテンツ（できるまで）では本書のとおり傾きとテープを使う
- 準備中ページは「準備中」の状態バッジ（付箋色 `#FFF3B0` / 文字 `#5A4A00`、判子と同じ二重線の枠）で示す。「公開中」は赤の判子と同じ見た目
- 色は本書のトークンから選ぶ。新しい色を足すときは本書に追記する
- 手書き感は書体・傾き・テープ・付箋で出す。写真や画像の加工では出さない
- 記録本文の画像はそのままでよい。台紙とキャプションで整える
- 公式と個人を混同させない。個人の記録は必ずバッジの「個人」印と注記を出す
- コントラストは本文・薄文字ともクリーム背景に対して 4.5:1 以上を確認済み。新しい組み合わせを作るときは確認する

## 9. トークン（CSS custom properties）

実装ではこのブロックを `src/app/globals.css` の `:root` に置く。
部品側の CSS の参考実装は `docs/design-lab/v2/lab.css`（design-lab を削除するまで）。

```css
:root {
  /* --- カラー --- */
  --color-primary: #B7332A;
  --color-primary-contrast: #FFFBF2;
  --color-secondary: #1F3A5F;
  --color-accent: #D9A62E;
  --color-background: #FBF3E4;
  --color-background-alt: #F3E4C8;
  --color-surface: #FFFBF2;
  --color-text: #2B2118;
  --color-text-light: #6A5A48;
  --color-border: #D9C7A6;
  --color-link: #1F3A5F;
  --color-header-bg: #FBF3E4;
  --color-header-text: #2B2118;
  --color-footer-bg: #1F3A5F;
  --color-footer-text: #F3E4C8;
  --color-button-primary-bg: #B7332A;
  --color-button-primary-text: #FFFBF2;
  --color-button-secondary-bg: #FFFBF2;
  --color-button-secondary-text: #1F3A5F;
  --color-button-secondary-border: #1F3A5F;

  /* --- 物語・立場・タグ --- */
  --color-story-official: #B7332A;
  --color-story-official-text: #FFFBF2;
  --color-story-personal: #1F3A5F;
  --color-story-personal-text: #F3E4C8;
  --color-role-bg: #FFF3B0;
  --color-role-text: #5A4A00;
  --role-border: 0;
  --color-tag-consider-bg: transparent;
  --color-tag-consider-text: #B7332A;
  --color-tag-decided-bg: #B7332A;
  --color-tag-decided-text: #FFFBF2;
  --color-tag-rejected-bg: transparent;
  --color-tag-rejected-text: #6A5A48;
  --tag-rejected-decoration: line-through;
  --color-tag-recruit-bg: transparent;
  --color-tag-recruit-text: #1F3A5F;
  --tag-border: 2px double currentColor;
  --tag-tilt: -2deg;
  --color-notice-bg: #FFF3D6;
  --color-notice-border: #D9A62E;
  --color-notice-text: #5A4300;

  /* --- タイポグラフィ --- */
  --font-display: "Klee One", "Zen Maru Gothic", sans-serif;
  --font-weight-display: 600;
  --font-heading: "Klee One", "Zen Maru Gothic", sans-serif;
  --font-body: "Zen Maru Gothic", sans-serif;
  --font-accent: "Klee One", "Zen Maru Gothic", sans-serif;
  --font-size-base: 16px;
  --font-size-h1: 2.9rem;
  --font-size-h2: 2.1rem;
  --font-size-h3: 1.5rem;
  --font-size-small: 0.875rem;
  --font-weight-heading: 600;
  --font-weight-body: 400;
  --line-height-body: 1.85;
  --letter-spacing-heading: 0.03em;

  /* --- スペーシング・レイアウト --- */
  --spacing-unit: 8px;
  --spacing-section: 76px;
  --spacing-content: 24px;
  --content-max-width: 1080px;
  --prose-max-width: 700px;
  --hero-min-height: 50vh;
  --hero-align: left;
  --hero-justify: flex-start;

  /* --- 形 --- */
  --border-radius: 4px;
  --border-radius-lg: 6px;
  --border-radius-button: 50px;
  --border-radius-tag: 50px;
  --border-width: 1px;
  --border-style: solid;
  --button-border-width: 2px;
  --shadow: 0 2px 4px rgba(43, 33, 24, 0.10), 0 8px 18px rgba(43, 33, 24, 0.06);
  --shadow-hover: 0 4px 8px rgba(43, 33, 24, 0.12), 0 14px 28px rgba(43, 33, 24, 0.10);
  --transition-speed: 0.25s;

  /* --- 装飾 --- */
  --bg-texture: radial-gradient(rgba(43, 33, 24, 0.14) 1px, transparent 1.2px);
  --bg-texture-size: 18px 18px;
  --hero-bg: linear-gradient(#FFFBF2, #FFFBF2);
  --hero-text: #2B2118;
  --hero-now-bg: #FFF3B0;
  --hero-now-border: 0;
  --hero-now-text: #2B2118;
  --header-border-bottom: 4px double #D9A62E;
  --section-title-bg: linear-gradient(transparent 62%, #FFF3B0 62%);
  --section-title-border-bottom: 0;
  --card-tilt: -0.6deg;
  --decor-tape: block;
  --figure-tape: block;
  --color-tape: rgba(217, 166, 46, 0.75);
  --image-frame-border: 0;
  --image-frame-radius: 2px;
  --image-frame-shadow: 0 2px 4px rgba(43, 33, 24, 0.10), 0 8px 18px rgba(43, 33, 24, 0.10);
  --image-frame-padding: 10px 10px 28px;

  /* --- タイムライン --- */
  --timeline-line-width: 2px;
  --timeline-line-style: dashed;
  --timeline-line-color: #1F3A5F;
  --timeline-dot-size: 16px;
  --timeline-dot-radius: 50%;
  --timeline-dot-bg: #FFFBF2;
  --timeline-dot-border: 3px double #B7332A;
  --timeline-dot-shadow: none;
  --timeline-month-bg: #FFF3B0;
  --timeline-month-text: #2B2118;
  --timeline-month-border: 0;
  --timeline-month-tilt: -1.5deg;
  --timeline-month-shadow: 0 2px 4px rgba(43, 33, 24, 0.15);
  --timeline-goal-bg: #B7332A;
  --timeline-goal-text: #FFFBF2;
  --timeline-goal-border: 0;

  /* --- 実装で追加（第2段階） --- */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 40px;
  --space-6: 48px;
  --tap-target: 44px;
  --header-height: 64px;
  --focus-outline: 2px solid #1F3A5F;
  --focus-outline-offset: 3px;
  --hero-now-tilt: -1deg;
  --empty-border: 2px dashed #D9C7A6;
}
```
