// 見本ページの描画。URL のハッシュ（#02 や #02/record）で案を選ぶ。
(function () {
  var D = window.LAB_DATA;
  var VARIANTS = window.LAB_VARIANTS;
  var H = window.LAB_H;
  var $ = function (id) { return document.getElementById(id); };

  function parseHash() {
    var m = location.hash.replace(/^#/, "").split("/");
    var id = VARIANTS.some(function (v) { return v.id === m[0]; }) ? m[0] : "02";
    return { id: id, section: m[1] || "" };
  }

  function variantById(id) {
    return VARIANTS.filter(function (v) { return v.id === id; })[0];
  }

  function recordsOf(filter) {
    return D.records.filter(filter);
  }

  function timelineHtml(V, records, withMonths) {
    var html = "";
    var lastMonth = "";
    records.forEach(function (rec) {
      var month = rec.date.slice(0, 7);
      if (withMonths && month !== lastMonth) {
        html += '<div class="timeline__month">' + H.month(rec.date) + "</div>";
        lastMonth = month;
      }
      var story = D.stories[rec.story];
      var personal = story.kind === "personal";
      html += '<article class="timeline__item">' + V.timelineCard(rec, D.people[rec.author], story, personal) + "</article>";
    });
    return html;
  }

  function adjacentTitles(slug) {
    var i = D.records.findIndex(function (r) { return r.slug === slug; });
    return {
      prev: i > 0 ? D.records[i - 1].title : "（なし）",
      next: i < D.records.length - 1 ? D.records[i + 1].title : "（なし）"
    };
  }

  function render() {
    var h = parseHash();
    var V = variantById(h.id);
    document.documentElement.setAttribute("data-variant", V.id);
    $("labTheme").textContent = "案" + V.id + " " + V.name;
    document.title = "案" + V.id + " " + V.name + " | design-lab v3";

    var peopleList = Object.keys(D.people).map(function (k) { return D.people[k]; });
    var storyList = Object.keys(D.stories).map(function (k) { return D.stories[k]; });

    // できるまで（タイムライン）
    $("filter").innerHTML = V.filter(peopleList);
    $("timelineBody").innerHTML =
      timelineHtml(V, D.records, true) +
      '<div class="timeline__goal">2027.05 黒猫台湾まつり2027 開催（予定）<small>日程が決まったら、ここに日付が入ります。</small></div>';

    // 記録ページ（公式）
    var recO = D.records.filter(function (r) { return r.slug === D.sampleOfficial; })[0];
    var stO = D.stories[recO.story];
    $("recordOfficial").innerHTML =
      V.recordHeader(recO, D.people[recO.author], stO, false) +
      '<div class="prose">' + recO.body + H.insta + "</div>" +
      V.recordFooter(recO, D.people[recO.author], stO, false, adjacentTitles(recO.slug));

    // 記録ページ（個人の活動。ヘッダーと末尾だけ）
    var recP = D.records.filter(function (r) { return r.slug === D.samplePersonal; })[0];
    var stP = D.stories[recP.story];
    $("recordPersonal").innerHTML =
      V.recordHeader(recP, D.people[recP.author], stP, true) +
      '<div class="prose"><p>祭りの運営とは別に、今年は自分でも一つ店を出してみようと思っています。ただ、何を売るかが決まっていません。</p><p class="text-light small">（本文は省略）</p></div>' +
      V.recordFooter(recP, D.people[recP.author], stP, true, adjacentTitles(recP.slug));

    // トップ（最新3件と、それぞれがつくっているもの）
    var latest = D.records.slice().reverse().slice(0, 3);
    $("homeCards").innerHTML = latest.map(function (rec) {
      var story = D.stories[rec.story];
      return V.homeCard(rec, D.people[rec.author], story, story.kind === "personal");
    }).join("");
    $("homeStories").innerHTML = V.homeStories(storyList, peopleList);

    // 作っている人たち
    $("peopleList").innerHTML = V.peopleList(peopleList);

    // 書き手ページ
    var person = D.people[D.samplePerson];
    var title = V.personRecordsTitle(person);
    $("personHeader").innerHTML = V.personHeader(person);
    $("personRecords").innerHTML = title
      ? '<h2 class="section-title"><span class="section-title__text">' + title + "</span></h2>" +
        '<div class="timeline">' + timelineHtml(V, recordsOf(function (r) { return r.author === person.id; }), true) + "</div>"
      : "";

    // scrollIntoView は親（index.html）まで横にスクロールさせるので、このウィンドウの中だけを動かす
    var target = h.section ? $(h.section) : null;
    window.scrollTo(0, target ? target.getBoundingClientRect().top + window.scrollY : 0);
  }

  window.addEventListener("hashchange", render);
  render();
})();
