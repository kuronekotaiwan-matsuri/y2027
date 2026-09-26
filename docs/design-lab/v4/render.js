// 見本ページの描画。URL のハッシュ（#01、#01/record、#01/record/faces）で案・場所・顔で絞るの有無を選ぶ。
(function () {
  var D = window.LAB_DATA;
  var VARIANTS = window.LAB_VARIANTS;
  var H = window.LAB_H;
  var $ = function (id) { return document.getElementById(id); };

  function parseHash() {
    var m = location.hash.replace(/^#/, "").split("/");
    var id = VARIANTS.some(function (v) { return v.id === m[0]; }) ? m[0] : "01";
    return { id: id, section: m[1] || "", faces: m[2] === "faces" };
  }

  function variantById(id) {
    return VARIANTS.filter(function (v) { return v.id === id; })[0];
  }

  function timelineHtml(V, records) {
    var html = "";
    var lastMonth = "";
    records.forEach(function (rec) {
      var month = rec.date.slice(0, 7);
      if (month !== lastMonth) {
        html += '<div class="timeline__month">' + H.month(rec.date) + "</div>";
        lastMonth = month;
      }
      html += '<article class="timeline__item">' + V.timelineCard(rec, H.person(rec.author)) + "</article>";
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

  function recordPage(V, container, slug) {
    var rec = D.records.filter(function (r) { return r.slug === slug; })[0];
    var p = H.person(rec.author);
    var main = V.recordHeader(rec, p) + '<div class="prose">' + rec.body + H.insta + "</div>" + V.recordFooter(rec, p, adjacentTitles(slug));
    if (V.sideLayout) {
      var others = D.records.filter(function (r) { return r.author === p.id && r.slug !== slug; }).reverse().slice(0, 3);
      container.className = "article article--side";
      container.innerHTML = '<aside class="author-panel">' + H.authorPanel(p, others) + '</aside><div class="article__main">' + main + "</div>";
    } else {
      container.className = "article";
      container.innerHTML = main;
    }
  }

  function render() {
    var h = parseHash();
    var V = variantById(h.id);
    document.documentElement.setAttribute("data-variant", V.id);
    $("labTheme").textContent = "案" + V.id + " " + V.name + (h.faces ? " ＋ 顔で絞る" : "");
    document.title = "案" + V.id + " " + V.name + " | design-lab v4";

    // できるまで（タイムライン）
    $("filter").innerHTML = h.faces ? H.facesFilter(D.people) : "";
    $("timelineBody").innerHTML =
      timelineHtml(V, D.records) +
      '<div class="timeline__goal">2027.05 黒猫台湾まつり2027 開催（予定）<small>日程が決まったら、ここに日付が入ります。</small></div>';

    // 記録ページ
    recordPage(V, $("recordA"), D.sampleA);
    recordPage(V, $("recordB"), D.sampleB);

    // トップ
    var latest = D.records.slice().reverse().slice(0, 3);
    $("homeCards").innerHTML = latest.map(function (rec) { return V.homeCard(rec, H.person(rec.author)); }).join("");
    $("homeExtra").innerHTML = V.writers(D.people);

    // 作っている人たち
    $("peopleList").innerHTML = V.peopleList(D.people);

    // 書き手ページ
    var person = H.person(D.samplePerson);
    $("personHeader").innerHTML = V.personHeader(person);
    $("personRecords").innerHTML =
      '<h2 class="section-title"><span class="section-title__text">' + V.personRecordsTitle(person) + "</span></h2>" +
      '<div class="timeline">' + timelineHtml(V, D.records.filter(function (r) { return r.author === person.id; })) + "</div>";

    // scrollIntoView は親（index.html）まで横にスクロールさせるので、このウィンドウの中だけを動かす
    var target = h.section ? $(h.section) : null;
    window.scrollTo(0, target ? target.getBoundingClientRect().top + window.scrollY : 0);
  }

  window.addEventListener("hashchange", render);
  render();
})();
