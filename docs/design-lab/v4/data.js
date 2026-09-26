// design-lab v4 の見本データ。全案で共通。
// v3 との違い: 「物語」を持たない。記録は「誰が書いたか」だけで読む。
// 池田さんは、実行委員としての「池田」と、出店者としての「イケダ」の2つの書き手として登録する。
window.LAB_DATA = {
  roles: {
    committee: "実行委員",
    youth: "若者チーム",
    shop: "出店者",
    performer: "出演者",
    volunteer: "ボランティア",
    local: "地域の人・お店",
    taiwan: "台湾関係者",
    other: "その他"
  },

  // 書き手。avatar は "photo" / "photo2" / "photo3"（写真の代わり）、無指定なら名前の1文字目、kind: "group" なら黒猫のマーク
  people: [
    {
      id: "committee",
      name: "黒猫台湾まつり実行委員会",
      role: "committee",
      kind: "group",
      bio: "祭りを企画・運営しているチーム。2023年の第1回から、主に4人で続けてきました。"
    },
    {
      id: "ikeda",
      name: "池田",
      role: "committee",
      avatar: "photo",
      bio: "実行委員。2023年の第1回から関わっています。出店者としての記録は「イケダ」の名前で書いています。"
    },
    {
      id: "ikeda-shop",
      name: "イケダ",
      role: "shop",
      avatar: "photo3",
      bio: "出店者。実行委員の池田と同じ人ですが、ここでは一人の出店者として、お店ができるまでを書きます。"
    },
    {
      id: "haru",
      name: "ハル",
      role: "youth",
      bio: "若者チーム。高校2年生。2026年はボランティアで参加して、今年は自分たちの企画を作ります。"
    },
    {
      id: "lin",
      name: "リン",
      role: "shop",
      avatar: "photo2",
      bio: "会場の近くで豆花のお店をやっています。台湾・台南の出身です。"
    }
  ],

  // 日付昇順
  records: [
    {
      slug: "2026-10-05-kickoff", date: "2026-10-05", author: "ikeda",
      title: "今年も動き始めました",
      summary: "2027年に向けて、まず4人で集まりました。まだ何も決まっていません。",
      tags: [{ label: "検討中", status: "consider" }], thumb: "photo"
    },
    {
      slug: "2026-10-18-hello-ikeda", date: "2026-10-18", author: "ikeda-shop",
      title: "出店者としても書いていきます",
      summary: "実行委員の池田と同じ人です。ここでは一人の出店者「イケダ」として、店ができるまでを書きます。",
      tags: [], thumb: null,
      body:
        "<p>実行委員の池田です。この名前では、実行委員としてではなく、一人の出店者として書いていきます。</p>" +
        "<p>祭りの運営とは別に、今年は自分でも一つ、小さな店を出してみようと思っています。運営の話と混ざらないように、書き手を分けました。</p>" +
        "<p>何を売るかも、まだ決まっていません。決まっていないところから、順番に書いていきます。</p>"
    },
    {
      slug: "2026-10-20-what-to-sell", date: "2026-10-20", author: "ikeda-shop",
      title: "何を売るか、まだ決まっていません",
      summary: "候補は3つ。豆花、魯肉飯、それとも雑貨。悩んでいるところから記録します。",
      tags: [{ label: "検討中", status: "consider" }], thumb: null,
      topics: ["出店情報"]
    },
    {
      slug: "2026-11-02-brainstorm", date: "2026-11-02", author: "committee",
      title: "今年やりたいことを話しました",
      summary: "出た案を全部書き出しました。決めたのは「まだ決めないこと」です。",
      tags: [{ label: "検討中", status: "consider" }], thumb: "memo"
    },
    {
      slug: "2026-11-15-youth", date: "2026-11-15", author: "haru",
      title: "若者メンバーが企画を始めました",
      summary: "「自分たちで台湾の夜市ゲームをやりたい」。まず、何が必要かを書き出しました。",
      tags: [{ label: "試作中", status: "trial" }, { label: "募集中", status: "recruit" }], thumb: null
    },
    {
      slug: "2026-11-20-limited-menu", date: "2026-11-20", author: "lin",
      title: "まつり限定メニューを考えはじめました",
      summary: "台南の朝ごはんを、通りで食べやすい形にできないか。まず家族に食べてもらいました。",
      tags: [{ label: "試作中", status: "trial" }], thumb: "photo3"
    },
    {
      slug: "2026-11-28-poster-rejected", date: "2026-11-28", author: "ikeda",
      title: "ポスター案、1回目はボツになりました",
      summary: "若者チームの案と実行委員の案、両方とも「これじゃない」となりました。理由を書いておきます。",
      tags: [{ label: "ボツ", status: "rejected" }], thumb: "sketch",
      topics: ["ポスター・チラシ"],
      body:
        '<p>ポスターの1回目の案を2つ作りました。若者チームの案と、実行委員の案です。</p>' +
        '<figure class="figure"><div class="figure__frame"><div class="ph ph--sketch ph--wide">ボツ案スケッチ（仮）</div></div><figcaption>若者チームの案。「きれいだけど、これじゃない」。</figcaption></figure>' +
        '<p>両方とも、見た人の反応は「きれいだけど、これじゃない」でした。</p>' +
        '<p>理由を整理すると、</p>' +
        '<ul><li>去年までのポスターに寄せすぎて、今年の「作っている途中」の空気が出ていない</li><li>情報を全部入れようとして、まだ決まっていないことまで書こうとしていた</li></ul>' +
        '<p>ということでした。決まっていないことは、決まっていないまま出す。ポスターもそうしようと思います。次の案は12月に。</p>'
    }
  ],

  // 記録ページの見本に使う記録（実行委員の記録と、イケダの最初の記録）
  sampleA: "2026-11-28-poster-rejected",
  sampleB: "2026-10-18-hello-ikeda",
  // 書き手ページの見本に使う人
  samplePerson: "ikeda-shop"
};
