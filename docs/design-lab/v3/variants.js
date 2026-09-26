// design-lab v3 の案。同じデータ（data.js）を、案ごとに違うマークアップで描画する。
// 各案は基準の案（02 顔と名前）を土台に、必要な関数だけ差し替える。
(function () {
  var D = window.LAB_DATA;

  // ---------- 共通の部品 ----------
  var H = {
    esc: function (s) {
      return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    },
    role: function (p) { return D.roles[p.role]; },
    isGroup: function (p) { return p.kind === "group"; },
    san: function (p) { return H.isGroup(p) ? p.name : p.name + "さん"; },
    catSvg:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M5 3l7 6h8l7-6v12a11 11 0 0 1-22 0z"/>' +
      '<circle cx="12" cy="17" r="1.7" fill="#B7332A"/><circle cx="20" cy="17" r="1.7" fill="#B7332A"/></svg>',
    avatar: function (p, size) {
      var cls = "avatar avatar--" + (size || "sm");
      if (H.isGroup(p)) return '<span class="' + cls + ' avatar--group" aria-hidden="true">' + H.catSvg + "</span>";
      if (p.avatar === "photo") return '<span class="' + cls + ' avatar--photo" aria-hidden="true">写真</span>';
      if (p.avatar === "photo2") return '<span class="' + cls + ' avatar--photo avatar--photo2" aria-hidden="true">写真</span>';
      return '<span class="' + cls + '" aria-hidden="true">' + H.esc(p.name.slice(0, 1)) + "</span>";
    },
    // 顔 + 名前 + 立場
    byline: function (p, o) {
      o = o || {};
      return (
        '<span class="byline">' +
        (o.noAvatar ? "" : H.avatar(p, o.size || "sm")) +
        '<span class="byline__name">' + H.esc(p.name) + "</span>" +
        (o.noRole || H.isGroup(p) ? "" : '<span class="byline__role">' + H.role(p) + "</span>") +
        "</span>"
      );
    },
    // ― 池田（実行委員）
    sign: function (p) {
      return '<span class="sign"><b>' + H.esc(p.name) + "</b>" + (H.isGroup(p) ? "" : "（" + H.role(p) + "）") + "</span>";
    },
    // 池田さんの『店をつくる』
    seriesText: function (story) { return H.san(D.people[story.owner]) + "の『" + story.title + "』"; },
    series: function (story, link) {
      var t = H.seriesText(story);
      return link ? '<a class="series" href="#">' + t + "</a>" : '<span class="series">' + t + "</span>";
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
    ja: function (d) { var a = d.split("-"); return a[0] + "年" + Number(a[1]) + "月" + Number(a[2]) + "日"; },
    month: function (d) { return d.slice(0, 4) + "." + d.slice(5, 7); },
    notice: function (owner) {
      return '<div class="notice">これは、' + H.esc(owner.name) + "さんが自分で取り組んでいる活動の記録です。黒猫台湾まつり実行委員会の企画や販売ではありません。</div>";
    },
    crumb: function (extra) { return '<p class="crumb"><a href="#">できるまで</a>' + (extra ? "<span>" + extra + "</span>" : "") + "</p>"; },
    topics: function (rec) {
      if (!rec.topics) return "";
      return '<p class="article__topics">関連する案内: ' + rec.topics.map(function (t) { return '<a href="#">' + t + "</a>"; }).join("、") + "</p>";
    },
    insta:
      '<a class="insta-card" href="#"><span class="insta-card__icon">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
      '</span><span class="insta-card__text"><span class="insta-card__label">Instagramで見る</span><br><span class="insta-card__url">instagram.com/p/xxxxxxxx/</span></span><span class="insta-card__arrow" aria-hidden="true">→</span></a>',
    pager: function (label, prev, next) {
      return (
        '<nav class="pager" aria-label="' + label + '">' +
        '<a href="#"><span>← 前の記録</span>' + prev + "</a>" +
        '<a href="#"><span>次の記録 →</span>' + next + "</a></nav>"
      );
    },
    back: '<p class="article__back"><a href="#">← できるまでへ戻る</a></p>',
    authorCard: function (p, o) {
      o = o || {};
      return (
        '<aside class="author-card' + (o.noAvatar ? " author-card--noavatar" : "") + '">' +
        '<div class="author-card__label">' + (o.label || "書いた人") + "</div>" +
        (o.noAvatar ? "" : H.avatar(p, "lg")) +
        "<div>" +
        '<span class="author-card__name">' + H.esc(p.name) + "</span>" +
        (H.isGroup(p) ? "" : '<span class="author-card__role">' + H.role(p) + "</span>") +
        '<p class="author-card__bio">' + H.esc(p.bio) + "</p>" +
        '<a class="author-card__link" href="#">' + H.san(p) + "の記録をすべて見る →</a>" +
        "</div></aside>"
      );
    },
    seriesBox: function (story) {
      return '<div class="series-box">この記録は「' + H.seriesText(story) + "」の1つです。<a href=\"#\">まとめて読む →</a></div>";
    }
  };

  // ---------- 案02 顔と名前（基準） ----------
  var base = {
    id: "02",
    name: "顔と名前",
    note: "カードの先頭に顔・名前・立場。note や Instagram と同じ並び。開いた先の末尾に「書いた人」。",
    filter: function () { return ""; },

    timelineCard: function (rec, p, story, personal) {
      return (
        '<a class="timeline__card' + (rec.thumb ? " timeline__card--thumb" : "") + (personal ? " timeline__card--personal" : "") + '" href="#"><div>' +
        '<div class="timeline__meta timeline__meta--split">' + H.byline(p) + '<span class="timeline__date">' + H.short(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        H.tags(rec) +
        "</div>" + H.thumb(rec) + "</a>"
      );
    },

    recordHeader: function (rec, p, story, personal) {
      return (
        H.crumb() +
        (personal ? H.notice(D.people[story.owner]) + H.series(story, true) : "") +
        '<h1 class="article__title">' + rec.title + "</h1>" +
        '<div class="article__meta">' +
        '<span class="article__byline">' + H.byline(p, { size: "md" }) + "</span>" +
        '<span class="card__date">' + H.dot(rec.date) + "</span>" +
        rec.tags.map(H.tag).join("") +
        "</div>" +
        H.topics(rec)
      );
    },

    recordFooter: function (rec, p, story, personal, adj) {
      return H.authorCard(p) + (personal ? H.seriesBox(story) : "") + H.pager("前後の記録", adj.prev, adj.next) + H.back;
    },

    homeCard: function (rec, p, story, personal) {
      return (
        '<article class="card' + (personal ? " card--personal" : "") + '">' +
        H.thumb(rec, "card__thumb") +
        '<div class="card__body">' +
        '<div class="card__meta timeline__meta--split">' + H.byline(p) + '<span class="card__date">' + H.dot(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="card__title">' + rec.title + "</h3>" +
        '<p class="card__summary">' + rec.summary + "</p>" +
        H.tags(rec, "card__tags") +
        "</div></article>"
      );
    },

    homeStories: function (stories) {
      var personal = stories.filter(function (s) { return s.kind === "personal"; });
      if (!personal.length) return "";
      return (
        '<div class="home-stories"><h3 class="home-stories__title">それぞれがつくっているもの<small>まつりの中で、自分のことに取り組んでいる人</small></h3>' +
        '<div class="card-grid card-grid--2">' +
        personal.map(function (s) {
          var o = D.people[s.owner];
          return (
            '<article class="card card--personal"><div class="card__body">' +
            '<div class="story-card__person">' + H.avatar(o, "sm") + "<span>" + H.san(o) + "の</span></div>" +
            '<h3 class="card__title">' + s.title + "</h3>" +
            '<p class="card__summary">' + s.subtitle + "</p>" +
            '<div class="card__stats"><span>' + H.month(s.startDate) + "〜 進行中</span><span>記録 " + s.count + "件</span></div>" +
            "</div></article>"
          );
        }).join("") +
        "</div></div>"
      );
    },

    peopleList: function (people) {
      return (
        '<div class="people">' +
        people.map(function (p) {
          return (
            '<a class="person-row" href="#">' + H.avatar(p, "md") +
            "<div><span class=\"person-row__name\">" + H.esc(p.name) + "</span>" +
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

  // ---------- 案00 現状（比較用） ----------
  var v00 = extend({
    id: "00",
    name: "現状（比較用）",
    note: "いまのサイト。物語バッジ、立場バッジ、状態タグの3種類のラベルと、物語で絞るチップ。",
    filter: function () {
      return (
        '<div class="chips"><button class="chip chip--active" type="button">すべて</button>' +
        '<button class="chip" type="button"><span class="chip__dot" style="background: var(--color-story-official)"></span>祭りをつくる</button>' +
        '<button class="chip" type="button"><span class="chip__dot" style="background: var(--color-story-personal)"></span>店をつくる（個人）</button></div>'
      );
    },
    timelineCard: function (rec, p, story, personal) {
      return (
        '<a class="timeline__card' + (rec.thumb ? " timeline__card--thumb" : "") + '" href="#"><div>' +
        '<div class="timeline__meta"><span class="timeline__date">' + H.short(rec.date) + "</span>" +
        '<span class="badge ' + (personal ? "badge--personal" : "badge--official") + '">' + story.title + "</span>" +
        '<span class="badge badge--role">' + H.role(p) + "</span></div>" +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        H.tags(rec) + "</div>" + H.thumb(rec) + "</a>"
      );
    },
    recordHeader: function (rec, p, story, personal) {
      return (
        (personal ? '<div class="notice">この物語は、' + H.esc(D.people[story.owner].name) + "が個人として取り組んでいる活動の記録です。黒猫台湾まつり実行委員会の公式な販売・企画ではありません。</div>" : "") +
        '<p class="article__story">物語: <a href="#" style="text-decoration:underline">' + story.title + "</a>" + (personal ? "（個人）" : "") + "</p>" +
        '<h1 class="article__title">' + rec.title + "</h1>" +
        '<div class="article__meta"><span class="card__date">' + H.dot(rec.date) + "</span>" +
        '<span class="article__author">' + H.esc(p.name) + '</span><span class="badge badge--role">' + H.role(p) + "</span>" +
        rec.tags.map(H.tag).join("") + "</div>" + H.topics(rec)
      );
    },
    recordFooter: function (rec, p, story, personal, adj) {
      return H.pager(story.title + "の前後の記録", adj.prev + "（" + story.title + "）", adj.next + "（" + story.title + "）") +
        H.pager("全体の前後の記録", adj.prev + "（全体）", adj.next + "（全体）") + H.back;
    },
    homeCard: function (rec, p, story, personal) {
      return (
        '<article class="card">' + H.thumb(rec, "card__thumb") + '<div class="card__body">' +
        '<div class="card__meta"><span class="card__date">' + H.dot(rec.date) + "</span>" +
        '<span class="badge ' + (personal ? "badge--personal" : "badge--official") + '">' + story.title + "</span>" +
        '<span class="badge badge--role">' + H.role(p) + "</span></div>" +
        '<h3 class="card__title">' + rec.title + "</h3><p class=\"card__summary\">" + rec.summary + "</p>" + H.tags(rec, "card__tags") +
        "</div></article>"
      );
    },
    homeStories: function (stories) {
      return (
        '<div class="home-stories"><h3 class="home-stories__title">物語<small>いま進んでいるもの</small></h3><div class="card-grid card-grid--2">' +
        stories.map(function (s) {
          var official = s.kind === "official";
          return (
            '<article class="card"><div class="card__body">' +
            '<div class="card__meta"><span class="badge ' + (official ? "badge--official" : "badge--personal") + '" style="' + (official ? "" : "") + '">' + (official ? "公式" : "個人の活動") + "</span></div>" +
            '<h3 class="card__title">' + s.title + "</h3><p class=\"card__summary\">" + s.subtitle + "</p>" +
            '<div class="card__stats"><span>' + H.esc(D.people[s.owner].name) + "</span><span>" + H.month(s.startDate) + "〜 進行中</span><span>記録 " + s.count + "件</span></div>" +
            "</div></article>"
          );
        }).join("") + "</div></div>"
      );
    },
    peopleList: function () {
      var keys = Object.keys(D.roles).filter(function (k) { return k !== "other"; });
      return '<p class="section-lead">これまで主に4人のコアメンバーが企画・運営を担ってきました。2027年は、次のような立場の人たちが関わります。</p><div class="roles-list">' +
        keys.map(function (k) { return '<span class="badge badge--role">' + D.roles[k] + "</span>"; }).join("") + "</div>";
    },
    personHeader: function () { return '<div class="lab-none">この案には書き手のページがありません（物語のページだけ）。</div>'; },
    personRecordsTitle: function () { return ""; }
  });

  // ---------- 案01 署名 ----------
  var v01 = extend({
    id: "01",
    name: "署名",
    note: "顔は出さない。カードの右下にペン字で「― 池田（実行委員）」。デイリーポータルZ や Burning Man Journal の「By 名前」に近い。",
    timelineCard: function (rec, p, story, personal) {
      return (
        '<a class="timeline__card' + (rec.thumb ? " timeline__card--thumb" : "") + (personal ? " timeline__card--personal" : "") + '" href="#"><div>' +
        '<div class="timeline__meta"><span class="timeline__date">' + H.short(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        '<div class="timeline__foot">' + (H.tags(rec) || "<span></span>") + H.sign(p) + "</div>" +
        "</div>" + H.thumb(rec) + "</a>"
      );
    },
    recordHeader: function (rec, p, story, personal) {
      return (
        H.crumb() +
        (personal ? H.notice(D.people[story.owner]) + H.series(story, true) : "") +
        '<h1 class="article__title">' + rec.title + "</h1>" +
        '<div class="article__meta"><span class="card__date">' + H.dot(rec.date) + "</span>" + H.sign(p) + rec.tags.map(H.tag).join("") + "</div>" +
        H.topics(rec)
      );
    },
    recordFooter: function (rec, p, story, personal, adj) {
      return H.authorCard(p, { noAvatar: true }) + (personal ? H.seriesBox(story) : "") + H.pager("前後の記録", adj.prev, adj.next) + H.back;
    },
    homeCard: function (rec, p, story, personal) {
      return (
        '<article class="card' + (personal ? " card--personal" : "") + '">' + H.thumb(rec, "card__thumb") + '<div class="card__body">' +
        '<div class="card__meta"><span class="card__date">' + H.dot(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="card__title">' + rec.title + "</h3><p class=\"card__summary\">" + rec.summary + "</p>" +
        '<div class="card__foot">' + (H.tags(rec, "card__tags") || "<span></span>") + H.sign(p) + "</div>" +
        "</div></article>"
      );
    },
    homeStories: function (stories) {
      var personal = stories.filter(function (s) { return s.kind === "personal"; });
      if (!personal.length) return "";
      return (
        '<div class="home-stories"><h3 class="home-stories__title">それぞれがつくっているもの<small>まつりの中で、自分のことに取り組んでいる人</small></h3><div class="card-grid card-grid--2">' +
        personal.map(function (s) {
          var o = D.people[s.owner];
          return (
            '<article class="card card--personal"><div class="card__body">' +
            '<span class="series">' + H.san(o) + "の</span>" +
            '<h3 class="card__title">' + s.title + "</h3><p class=\"card__summary\">" + s.subtitle + "</p>" +
            '<div class="card__foot"><div class="card__stats" style="margin-top:0"><span>' + H.month(s.startDate) + "〜 進行中</span><span>記録 " + s.count + "件</span></div>" + H.sign(o) + "</div>" +
            "</div></article>"
          );
        }).join("") + "</div></div>"
      );
    },
    peopleList: function (people) {
      return '<div class="people">' + people.map(function (p) {
        return '<a class="person-row person-row--noavatar" href="#"><div><span class="person-row__name">' + H.esc(p.name) + "</span>" +
          (H.isGroup(p) ? "" : '<span class="person-row__role">' + H.role(p) + "</span>") + "</div>" +
          '<p class="person-row__bio">' + H.esc(p.bio) + "</p></a>";
      }).join("") + "</div>";
    },
    personHeader: function (p) {
      return H.crumb() + '<header class="person-header person-header--noavatar"><div><h1>' + H.esc(p.name) + "</h1>" +
        (H.isGroup(p) ? "" : '<p class="person-header__role">' + H.role(p) + "</p>") + "</div>" +
        '<p class="person-header__bio">' + H.esc(p.bio) + "</p>" +
        '<p class="person-header__insta"><a href="#">Instagram を見る</a></p></header>';
    }
  });

  // ---------- 案03 吹き出し ----------
  var v03 = extend({
    id: "03",
    name: "吹き出し",
    note: "顔の横に吹き出し。「池田（実行委員）が書きました」と文で言う。CAMPFIRE の活動報告や LINE に近い。",
    timelineCard: function (rec, p, story, personal) {
      return (
        '<a class="timeline__card timeline__card--bubble" href="#">' + H.avatar(p, "md") +
        '<div class="bubble' + (personal ? " bubble--personal" : "") + '">' +
        '<div class="bubble__who"><span><b>' + H.esc(p.name) + "</b>" + (H.isGroup(p) ? "" : "（" + H.role(p) + "）") + "が書きました</span>" +
        '<span class="timeline__date">' + H.short(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        H.tags(rec) + H.thumb(rec, "bubble__thumb") +
        "</div></a>"
      );
    },
    recordHeader: function (rec, p, story, personal) {
      return (
        H.crumb() +
        (personal ? H.notice(D.people[story.owner]) + H.series(story, true) : "") +
        '<h1 class="article__title">' + rec.title + "</h1>" +
        '<div class="article__meta"><span class="article__who">' + H.avatar(p, "md") +
        "<span>" + H.ja(rec.date) + "、<b>" + H.esc(p.name) + "</b>" + (H.isGroup(p) ? "" : "（" + H.role(p) + "）") + "が書きました</span></span>" +
        rec.tags.map(H.tag).join("") + "</div>" +
        H.topics(rec)
      );
    },
    recordFooter: function (rec, p, story, personal, adj) {
      return H.authorCard(p, { label: "この記録を書いた人" }) + (personal ? H.seriesBox(story) : "") + H.pager("前後の記録", adj.prev, adj.next) + H.back;
    },
    homeCard: function (rec, p, story, personal) {
      return (
        '<article class="card' + (personal ? " card--personal" : "") + '">' + H.thumb(rec, "card__thumb") + '<div class="card__body">' +
        '<div class="bubble__who">' + H.avatar(p, "sm") + "<span><b>" + H.esc(p.name) + "</b>" + (H.isGroup(p) ? "" : "（" + H.role(p) + "）") + "が書きました</span>" +
        '<span class="card__date">' + H.dot(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="card__title">' + rec.title + "</h3><p class=\"card__summary\">" + rec.summary + "</p>" + H.tags(rec, "card__tags") +
        "</div></article>"
      );
    },
    homeStories: function (stories) {
      var personal = stories.filter(function (s) { return s.kind === "personal"; });
      if (!personal.length) return "";
      return (
        '<div class="home-stories"><h3 class="home-stories__title">それぞれがつくっているもの<small>まつりの中で、自分のことに取り組んでいる人</small></h3><div class="card-grid card-grid--2">' +
        personal.map(function (s) {
          var o = D.people[s.owner];
          return (
            '<article class="card card--personal"><div class="card__body">' +
            '<div class="bubble__who">' + H.avatar(o, "sm") + "<span><b>" + H.esc(o.name) + "</b>さんが、自分のお店を作っています</span></div>" +
            '<h3 class="card__title">' + s.title + "</h3><p class=\"card__summary\">" + s.subtitle + "</p>" +
            '<div class="card__stats"><span>' + H.month(s.startDate) + "〜 進行中</span><span>記録 " + s.count + "件</span></div>" +
            "</div></article>"
          );
        }).join("") + "</div></div>"
      );
    }
  });

  // ---------- 案04 顔だけ ----------
  var v04 = extend({
    id: "04",
    name: "顔と名前だけ",
    note: "立場をカードから外す。顔と名前だけで見せ、立場は開いた先の「書いた人」と「作っている人たち」にだけ出す。",
    timelineCard: function (rec, p, story, personal) {
      return (
        '<a class="timeline__card' + (rec.thumb ? " timeline__card--thumb" : "") + (personal ? " timeline__card--personal" : "") + '" href="#"><div>' +
        '<div class="timeline__meta timeline__meta--split">' + H.byline(p, { noRole: true }) + '<span class="timeline__date">' + H.short(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="timeline__title">' + rec.title + "</h3>" +
        '<p class="timeline__summary">' + rec.summary + "</p>" +
        H.tags(rec) + "</div>" + H.thumb(rec) + "</a>"
      );
    },
    recordHeader: function (rec, p, story, personal) {
      return (
        H.crumb() +
        (personal ? H.notice(D.people[story.owner]) + H.series(story, true) : "") +
        '<h1 class="article__title">' + rec.title + "</h1>" +
        '<div class="article__meta"><span class="article__byline">' + H.byline(p, { size: "md", noRole: true }) + "</span>" +
        '<span class="card__date">' + H.dot(rec.date) + "</span>" + rec.tags.map(H.tag).join("") + "</div>" +
        H.topics(rec)
      );
    },
    homeCard: function (rec, p, story, personal) {
      return (
        '<article class="card' + (personal ? " card--personal" : "") + '">' + H.thumb(rec, "card__thumb") + '<div class="card__body">' +
        '<div class="card__meta timeline__meta--split">' + H.byline(p, { noRole: true }) + '<span class="card__date">' + H.dot(rec.date) + "</span></div>" +
        (personal ? H.series(story) : "") +
        '<h3 class="card__title">' + rec.title + "</h3><p class=\"card__summary\">" + rec.summary + "</p>" + H.tags(rec, "card__tags") +
        "</div></article>"
      );
    }
  });

  // ---------- 案05 顔で絞る ----------
  var v05 = extend({
    id: "05",
    name: "顔と名前 + 顔で絞る",
    note: "案02 に、タイムラインの上に顔を並べて「人で絞る」を足したもの。物語のチップの代わり。",
    filter: function (people) {
      return (
        '<div class="faces" role="group" aria-label="人で絞る">' +
        '<button class="face face--all face--active" type="button"><span class="avatar avatar--md">全部</span><span>すべて</span></button>' +
        people.map(function (p) {
          return '<button class="face" type="button">' + H.avatar(p, "md") + "<span>" + H.esc(H.isGroup(p) ? "実行委員会" : p.name) + "</span></button>";
        }).join("") + "</div>"
      );
    }
  });

  window.LAB_VARIANTS = [v00, v01, base, v03, v04, v05];
  window.LAB_H = H;
})();
