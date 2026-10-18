---
name: polish
description: 推敲。content/records/ の記録や下書きを yomiyasu（AI が生成した日本語の不自然な比喩、曖昧な主述、不要な装飾を直すスキル）で整える。先に yomiyasu が最新版か確かめてから使う。記録を書き終えたあと、ビルドとコミットの前に呼ぶ。「AIっぽさを消して」「読みやすくして」と頼まれたときも使う。
---
# 推敲: yomiyasu を最新版で使う

yomiyasu は Claude Code のプラグイン `yomiyasu@yomiyasu`（nanaism/yomiyasu、MIT）としてプロジェクト範囲に入れてある。数日おきに更新されるので、使う前に最新版か確かめる。
このスキルが決めるのは「最新版の確認」と「黒猫台湾まつりの記録に合う頼み方」だけで、推敲そのものは yomiyasu に任せる。

## 1. 最新版か確かめる

`node scripts/yomiyasu-check-update.mjs` を実行する。プロンプトに `yomiyasu` か `/polish` が含まれていれば UserPromptSubmit フックが同じ結果を先に出している。`yomiyasu:` で始まる行が文脈にすでにあれば、実行しなくてよい。

結果ごとの動き:

- 「最新です」: 2 へ進む
- 「更新あり」: `claude plugin marketplace update yomiyasu` と `claude plugin update yomiyasu@yomiyasu` を1つずつ実行する。更新は再起動後に反映され、今のセッションは現行版のまま。ユーザーに「再起動して最新版で推敲するか、今回は現行版のまま進めるか」を版の番号を添えて聞く。再起動を選んだら、ここで止まる
- 「確認できません」: そう伝えて、現行版で 2 へ進む
- 「導入されていません」: 出力に書かれたコマンドを案内して止まる

## 2. yomiyasu に渡す

Skill ツールで `yomiyasu:yomiyasu` を呼ぶ（素の `yomiyasu` は Unknown skill になる）。依頼文に次を入れる。

- 対象: 指定されたファイル。指定がなければ、このセッションで直前に書いた記録
- 書き手と読み手: 書き手は front-matter の `author` の人。`ikeda` なら「実行委員の池田。個人として書いている」、`committee` なら「黒猫台湾まつり実行委員会。組織の窓口として書いている」。読み手は「黒猫台湾まつりに関心のある一般の人（general）」
- 文書の種類: 個人の書き手（`ikeda`、`ikeda-shop` など）の記録は `essay`。`committee` のお知らせは種類を指定しない
- 立場（`--stance`）: `説明`
- 変えないもの:
  - front-matter。`title` は変えない。`summary` だけは本文と同じ基準で直してよいが、YAML として壊さない
  - 見出しの数、順、文の形。「お店ごとではなく、ゾーンごと」のような文の見出しは書き手の約束なので、名詞句に縮めない
  - リンク、画像、数字、固有名詞、引用符の中の文言
  - 書き手の控えめな言い回し（「〜なと思いました」「〜したいところです」「決まっていない」「思いついただけです」）。断定に強めない。感想の位置も動かさない
- 書き手の文体の約束は `.claude/skills/writer-<author>/SKILL.md` の「書き方」節にある。あれば yomiyasu を呼ぶ前に読み、依頼文に要点を写す
- Python は `python` で実行する（この環境の `python3` は Microsoft Store の案内が出て動かない）
- ファイルの置き方: 最終稿と `.material.txt` を `content/records/` に別名で作らない（ビルドが拾い、別の記録として公開される）。最終稿はスクラッチパッドに書いて `run` と `verify` を通し、原文のファイルに写す。yomiyasu には「原文のファイルを更新する依頼」として頼む。検査の記録 `.yomiyasu/` は `.gitignore` 済み

## 3. 終わったら

- yomiyasu の「変えたところ」「残したAIっぽいところ」「書き手に確かめたい点」をそのまま書き手に見せる。確かめたい点があれば、書き手の答えを待ってから次へ進む
- `npm run build` を通す。content の検証はここで走る
- コミットは書き手スキルの手順に従う。推敲だけのコミットなら `feat(content): <記録名>を推敲`
