# content/ の書き方

「黒猫台湾まつりができるまで」の中身はすべてこのフォルダにある。
ここに Markdown ファイルを1つ足して `main` に push すると、数分でサイトに載る。

```text
content/
├─ people/    書き手（1人1ファイル）。ファイル名がその人のID
└─ records/   記録（1出来事1ファイル）。ファイル名は 日付-短い英語名

public/images/
├─ people/    顔写真（任意）。people/<ID>.jpg
└─ records/   記録の画像。records/<記録のファイル名>/01.jpg
```

初めて書く人は、先に自分を `people/` に登録してから `records/` に記録を書く。
詳しい説明と、うまくいかないときの直し方は `docs/writing-guide.md`。

## 1. 記録を書く（`records/`）

`records/YYYY-MM-DD-<短い英語名>.md` を作る。日付は出来事があった日（書いた日ではない）。
例: `records/2026-12-03-poster-v2.md`

```markdown
---
title: ポスターの2回目の案ができました
date: 2026-12-03
author: ikeda
summary: 「作っている途中」の空気を出す方向で作り直しました。まだ決定ではありません。
tags: [試作中]
topics: [poster]
thumbnail: /images/records/2026-12-03-poster-v2/01.jpg
draft: false
---

本文はここから。短くてよい。

![2回目の案](/images/records/2026-12-03-poster-v2/01.jpg "机の上で撮った2回目の案")
```

| 項目 | 必須 | 書き方 |
|---|---|---|
| `title` | 必須 | 出来事がわかる文。「〇〇しました」「〇〇を迷っています」 |
| `date` | 必須 | `YYYY-MM-DD` |
| `author` | 必須 | 自分のID（`people/` のファイル名から `.md` を除いたもの）。公式のお知らせは `committee` |
| `summary` | 必須 | 一行の要約。一覧に出る |
| `tags` | 任意 | `検討中` `試作中` `決定` `ボツ` `募集中` `開催情報` から。1つなら `tags: 検討中` |
| `topics` | 任意 | 関係する案内。`event` `shops` `programs` `venue` `access` `volunteer` `poster` から |
| `thumbnail` | 任意 | 一覧と SNS 共有に使う画像。`/images/...` から書く |
| `instagram` | 任意 | 関連する投稿の URL。複数なら `- https://...` を並べる |
| `draft` | 任意 | `true` で非公開（手元の `npm run dev` では見える）。既定は `false` |

本文のコツ:

- 写真: `![説明](/images/records/<記録のファイル名>/01.jpg "キャプション")`。1段落に1枚だけ置くと台紙付きで表示される
- 画像は長辺 1600px 以下、1枚 500KB 程度に縮小してから `public/images/records/<記録のファイル名>/` に置く
- 見出しは `##` から。生の HTML は書けない
- 決まっていないことは「決まっていない」と書く。ボツも記録にする

## 2. 書き手を登録する（`people/`）

`people/<ID>.md` を作る。IDは英小文字・数字・ハイフン（例: `haru`）。
登録すると、書き手のページ（`/making/people/<ID>/`）、「作っている人たち」「書いている人たち」「顔で絞る」に自動で載る。

```markdown
---
name: ハル
role: youth
avatar: /images/people/haru.jpg
bio: 若者チーム。高校2年生。2026年はボランティアで参加して、今年は自分たちの企画を作ります。
instagram: https://www.instagram.com/xxxx/
draft: false
---

長めの自己紹介はここ（任意）。
```

| 項目 | 必須 | 書き方 |
|---|---|---|
| `name` | 必須 | 公開してよい名前。ニックネーム可 |
| `role` | 必須 | `committee`（実行委員） `youth`（若者チーム） `shop`（出店者） `performer`（出演者） `volunteer`（ボランティア） `local`（地域の人・お店） `taiwan`（台湾関係者） `other` |
| `bio` | 推奨 | 1〜2文の自己紹介。カードとページに出る |
| `avatar` | 任意 | 顔写真やイラスト。正方形、400px 四方・200KB 程度まで。角丸の四角で表示される。無ければ名前の1文字目が丸の中に出る |
| `shortName` | 任意 | 顔の下に出す短い名前。名前が長いときだけ（例: 実行委員会） |
| `kind` | 任意 | 組織なら `group`。立場が出ず、顔は黒猫のマークになる |
| `instagram` | 任意 | 自分のアカウントの URL |
| `order` | 任意 | 一覧の並び順（小さいほど先）。無ければID順 |
| `draft` | 任意 | `true` で本人も記録も非公開。既定は `false` |

使い分け:

- 出店者募集や日程の決定など、実行委員会としてのお知らせは `committee`（黒猫台湾まつり実行委員会）の名前で書く
- 実行委員が中の人として書く話（迷っていること、ボツになったこと）は自分の名前で書く
- 一人で二つの立場があるとき（実行委員が自分の店を出す、など）は書き手を2つ登録する（例: `ikeda` = 池田（実行委員）、`ikeda-shop` = イケダ（出店者））。最初の記録で同じ人だと明かす

## 3. 確認と公開

- 手元で見る: `npm run dev` → `http://localhost:3000/y2027/`。`draft: true` のものも見える
- 公開: `main` に push。GitHub Actions が数分でビルドして公開する
- 書き方が間違っているとビルドが止まり、Actions のログに `content/records/2026-12-03-poster-v2.md [author]: ...` のようにファイルと項目が出る。直して push し直す。よくあるメッセージと直し方は `docs/writing-guide.md` の「よくある失敗」
