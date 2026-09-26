// design-lab v4 の案。案02「顔と名前」を土台に、署名の置き方と立場の書き方だけを変える。
// 物語（公式／個人）の区別は持たない。池田さんは「池田（実行委員）」と「イケダ（出店者）」の2つの書き手。
(function () {
  var D = window.LAB_DATA;

  // ---------- 共通の部品 ----------
  var H = {
    esc: function (s) {
      return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    },
    person: function (id) { return D.people.filter(function (p) { return p.id === id; })[0]; },
    role: function (p) { return D.roles[p.role]; },
    isGroup: function (p) { return p.kind === "group"; },
    san: function (p) { return H.isGroup(p) ? p.name : p.name + "さん"; },
    shortName: function (p) { return H.isGroup(p) ? "実行委員会" : p.name; },
    catSvg:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M5 3l7 6h8l7-6v12a11 11 0 0 1-22 0z"/>' +
      '<circle cx="12" cy="17" r="1.7" fill="#B7332A"/><circle cx="20" cy="17" r="1.7" fill="#B7332A"/></svg>',
    avatar: function (p, size) {
      var cls = "avatar avatar--" + (size || "sm");
      if (H.isGroup(p)) return '<span class="' + cls + ' avatar--group" aria-hidden="true">' + H.catSvg + "</span>";
      if (p.avatar) return '<span class="' + cls + ' avatar--photo avatar--' + p.avatar + '" aria-hidden="true">写真</span>';
      return '<span class="' + cls + '" aria-hidden="true">' + H.esc(p.name.slice(0, 1)) + "</span>";
    },
    // 顔 + 名前 + 立場（小さな枠のラベル）
    bylineLabel: function (p, o) {
      o = o || {};
      return (
        '<span class="byline">' + H.avatar(p, o.size || "sm") +
        '<span class="byline__name">' + H.esc(p.name) + "</span>" +
        (H.isGroup(p) ? "" : '<span class="byline__role">' + H.role(p) + "</span>") +
        "</span>"
      );
    },
    // 顔 + 名前（立場）
    bylineParen: function (p, o) {
      o = o || {};
      return (
        '<span class="byline">' + H.avatar(p, o.size || "sm") +
        '<span class="byline__name">' + H.esc(p.name) + "</span>" +
        (H.isGroup(p) ? "" : '<span class="byline__paren">（' + H.role(p) + "）</span>") +
        "</span>"
      );
    },
    tags: function (rec, cls) {
      if (!rec.tags.length) return "";
      return '<div class="' + (cls || "timeline__tags") + '">' + rec.tags.map(H.tag).join("") + "</div>";
    },
    tag: function (t) { return '<span class="tag" data-status="' + t.status + '">' + t.label + "</span>"; },
    phLabel: { photo: "スマホ写真（仮）", photo2: "スマホ写真（仮）", photo3: "スマホ写真（仮）", memo: "手書きメモ（仮）", sketch: "ボツ案スケッチ（仮）" },
    thumb: function (rec, cls) {
      if (!rec.thumb) return "";
      return '<div class="' + (cls || "timeline__thumb") + '"><div class="ph ph--' + rec.thumb + '">' + H.phLabel[rec.thumb] + "</div></div>";
    },
    short: function (d) { return d.slice(5).replace("-", "."); },
    dot: function (d) { return d.replace(/-/g, "."); },
    month: function (d) { return d.slice(0, 4) + "." + d.slice(5, 7); },
    crumb: function () { return '<p class="crumb"><a href="#">できるまで</a></p>'; },
    topics: function (rec) {
      if (!rec.topics) return "";
      return '<p class="article__topics">関連する案内: ' + rec.topics.map(function (t) { return '<a href="#">' + t + "</a>"; }).join("、") + "</p>";
    },
    insta:
      '<a class="insta-card" href="#"><span class="insta-card__icon">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
      '</span><span class="insta-card__text"><span class="insta-card__label">Instagramで見る</span><br><span class="insta-card__url">instagram.com/p/xxxxxxxx/</span></span><span class="insta-card__arrow" aria-hidden="true">→</span></a>',
    pager: function (prev, next) {
      return (
        '<nav class="pager" aria-label="前後の記録">' +
        '<a href="#"><span>← 前の記録</span>' + prev + "</a>" +
        '<a href="#"><span>次の記録 →</span>' + next + "</a></nav>"
      );
    },
    back: '<p class="article__back"><a href="#">← できるまでへ戻る</a></p>',
    authorCard: function (p) {
      return (
        '<aside class="author-card">' +
        '<div class="author-card__label">書いた人</div>' +
        H.avatar(p, "lg") +
        "<div>" +
        '<span class="author-card__name">' + H.esc(p.name) + "</span>" +
        (H.isGroup(p) ? "" : '<span class="author-card__role">' + H.role(p) + "</span>") +
        '<p class="author-card__bio">' + H.esc(p.bio) + "</p>" +
        '<a class="author-card__link" href="#">' + H.san(p) + "の記録をすべて見る →</a>" +
        "</div></aside>"
      );
    },
    // PC で記事の横に置く書き手パネル（案04）
    authorPanel: function (p, others) {
      return (
        '<div class="author-panel__label">書いた人</div>' +
        '<div class="author-panel__head">' + H.avatar(p, "lg") + "<div>" +
        '<span class="author-panel__name">' + H.esc(p.name) + "</span>" +
        (H.isGroup(p) ? "" : '<span class="author-panel__role">' + H.role(p) + "</span>") +
        "</div></div>" +
        '<p class="author-panel__bio">' + H.esc(p.bio) + "</p>" +
        '<a class="author-panel__link" href="#">' + H.san(p) + "の記録をすべて見る →</a>" +
        (others.length
          ? '<div class="author-panel__others"><h3>' + H.san(p) + "の他の記録</h3><ul>" +
            others.map(function (r) { return '<li><a href="#">' + r.title + "</a><span>" + H.dot(r.date) + "</span></li>"; }).join("") +
            "</ul></div>"
          : "")
      );
    },
    facesFilter: function (people) {
      return (
        '<div class="faces" role="group" aria-label="人で絞る">' +
        '<button class="face face--all face--active" type="button"><span class="avatar avatar--md">全部</span><span>すべて</span></button>' +
        people.map(function (p) {
          return '<button class="face" type="button">' + H.avatar(p, "md") + "<span>" + H.esc(H.shortName(p)) + "</span></button>";
        }).join("") + "</div>"
      );
    }
  };

  // ---------- 案01 基本（案02 そのまま。物語なし） ----------
  var base = {
    id: "01",
    name: "基本",
    note: "v3 の案02 そのまま。カードの先頭に顔・名前・立場（小さな枠）、右に日付。個人の活動の色分けと注記は無い。",

    byline: function (p, o) { return H.bylineLabel(p, o); },

    timelineCard: function (rec, p) {
      return (
        '<a class="timeline__card' + (rec.thumb ? " timeline__card--thumb" : "") + '" href="#"><div>' +
        '<div class="timeline__meta timeline__meta--split">' + this.byline(p) + '<span class="timeline__date">' + H.short(rec.date) + "</span></div>" +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        H.tags(rec) +
        "</div>" + H.thumb(rec) + "</a>"
      );
    },

    recordHeader: function (rec, p) {
      return (
        H.crumb() +
        '<h1 class="article__title">' + rec.title + "</h1>" +
        '<div class="article__meta">' +
        '<span class="article__byline">' + this.byline(p, { size: "md" }) + "</span>" +
        '<span class="card__date">' + H.dot(rec.date) + "</span>" +
        rec.tags.map(H.tag).join("") +
        "</div>" +
        H.topics(rec)
      );
    },

    recordFooter: function (rec, p, adj) {
      return H.authorCard(p) + H.pager(adj.prev, adj.next) + H.back;
    },

    // true なら PC で記事の横に書き手パネルを置く
    sideLayout: false,

    homeCard: function (rec, p) {
      return (
        '<article class="card">' +
        H.thumb(rec, "card__thumb") +
        '<div class="card__body">' +
        '<div class="card__meta timeline__meta--split">' + this.byline(p) + '<span class="card__date">' + H.dot(rec.date) + "</span></div>" +
        '<h3 class="card__title">' + rec.title + "</h3>" +
        '<p class="card__summary">' + rec.summary + "</p>" +
        H.tags(rec, "card__tags") +
        "</div></article>"
      );
    },

    // トップ: 書いている人たち（顔の列）
    writers: function (people) {
      return (
        '<div class="writers"><h3 class="writers__title">書いている人たち<small>顔を押すと、その人の記録だけ読めます</small></h3>' +
        '<div class="faces">' +
        people.map(function (p) {
          return '<a class="face" href="#">' + H.avatar(p, "md") + "<span>" + H.esc(H.shortName(p)) + "</span></a>";
        }).join("") + "</div></div>"
      );
    },

    peopleList: function (people) {
      return (
        '<div class="people">' +
        people.map(function (p) {
          return (
            '<a class="person-row" href="#">' + H.avatar(p, "md") +
            '<div><span class="person-row__name">' + H.esc(p.name) + "</span>" +
            (H.isGroup(p) ? "" : '<span class="person-row__role">' + H.role(p) + "</span>") + "</div>" +
            '<p class="person-row__bio">' + H.esc(p.bio) + "</p></a>"
          );
        }).join("") +
        "</div>"
      );
    },

    personHeader: function (p) {
      return (
        H.crumb() +
        '<header class="person-header">' + H.avatar(p, "lg") +
        "<div><h1>" + H.esc(p.name) + "</h1>" + (H.isGroup(p) ? "" : '<p class="person-header__role">' + H.role(p) + "</p>") + "</div>" +
        '<p class="person-header__bio">' + H.esc(p.bio) + "</p>" +
        '<p class="person-header__insta"><a href="#">Instagram を見る</a></p>' +
        "</header>"
      );
    },
    personRecordsTitle: function (p) { return H.san(p) + "の記録"; }
  };

  function extend(over) { return Object.assign({}, base, over); }

  // ---------- 案02 立場を括弧で ----------
  var v02 = extend({
    id: "02",
    name: "立場を括弧で",
    note: "立場の枠をやめて「イケダ（出店者）」と文字で添える。ラベルが減って静かになる。",
    byline: function (p, o) { return H.bylineParen(p, o); }
  });

  // ---------- 案03 署名は下 ----------
  var v03 = extend({
    id: "03",
    name: "署名は下",
    note: "日付を先頭に、顔と名前はカードの右下。出来事を先に読み、最後に「誰が」を見る。手紙の署名の順。",
    byline: function (p, o) { return H.bylineParen(p, o); },
    timelineCard: function (rec, p) {
      return (
        '<a class="timeline__card' + (rec.thumb ? " timeline__card--thumb" : "") + '" href="#"><div>' +
        '<div class="timeline__meta"><span class="timeline__date">' + H.short(rec.date) + "</span></div>" +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        '<div class="timeline__foot">' + H.tags(rec) + this.byline(p) + "</div>" +
        "</div>" + H.thumb(rec) + "</a>"
      );
    },
    homeCard: function (rec, p) {
      return (
        '<article class="card">' + H.thumb(rec, "card__thumb") + '<div class="card__body">' +
        '<div class="card__meta"><span class="card__date">' + H.dot(rec.date) + "</span></div>" +
        '<h3 class="card__title">' + rec.title + "</h3>" +
        '<p class="card__summary">' + rec.summary + "</p>" +
        '<div class="card__foot">' + H.tags(rec, "card__tags") + this.byline(p) + "</div>" +
        "</div></article>"
      );
    }
  });

  // ---------- 案04 PC では書き手を横に ----------
  var v04 = extend({
    id: "04",
    name: "PC では書き手を横に",
    note: "カードは案01 と同じ。記録ページを PC で開くと、左に書き手の紹介と「他の記録」が並ぶ（note のクリエイター欄に近い）。スマホでは末尾のカード。「1案を詳しく」の PC 幅で見る。",
    sideLayout: true
  });

  window.LAB_VARIANTS = [base, v02, v03, v04];
  window.LAB_H = H;
})();
