import { site, type Phase } from '@/config/site';
import { absoluteUrl } from '@/lib/urls';

/** 静的エクスポートで out/llms.txt に書き出す（仕様書 9.5）。GET だけ */
export const dynamic = 'force-static';

/** ナビの各ページの補足。href をキーにする（nav の順序と label は site.ts に従う） */
const pageNotes: Record<string, string> = {
  '/shops/': '出店に関する記録を掲載',
  '/programs/': 'プログラムに関する記録を掲載',
  '/about/': '祭りの説明、これまでの歩み、2027年の挑戦、作っている人たち、関わり方',
  '/making/': '全記録の時系列タイムライン。書き手の顔で絞り込める',
};

const phaseLabels: Record<Phase, string> = {
  making: '準備中',
  event: '開催情報を公開中',
  archive: '開催終了',
};

/** 日程・会場・回数などは site.ts から組み立て、固定の説明文だけここに持つ */
function buildLlmsTxt(): string {
  const { event, nav, pastSites } = site;
  const venue = event.items.find((item) => item.key === 'venue')?.value ?? '未定';
  const undecided = event.items.filter((item) => !item.decided).map((item) => item.label);

  const summary = [
    '神奈川県川崎市高津区・二子新地の大山街道沿いで開かれてきた、地域密着型の台湾カルチャーフェスティバル。',
    `第${event.edition}回は${event.scheduleLabel}（会場は${venue}）。`,
    'このサイトは祭りの案内に加えて、祭りができるまでの過程を「記録」として公開している。',
  ].join('');

  const overview = [
    `- 名称: ${site.name}（Kuroneko Taiwan Matsuri ${event.year}）`,
    ...event.items.map((item) => `- ${item.label}: ${item.value}`),
    `- 回数: 第${event.edition}回（${event.year - 1}年が第${event.edition - 1}回）`,
    `- 主催: ${site.organizer}`,
    `- 状態: ${phaseLabels[site.phase]}${
      undecided.length > 0
        ? `。未定の項目: ${undecided.join('、')}（決まり次第、開催情報と記録の両方で公開）`
        : ''
    }`,
  ];

  const pages = [
    `- [トップ](${site.url}): 開催予定、最新の記録、書いている人たち、案内メニュー`,
    ...nav.map(
      (item) =>
        `- [${item.label}](${absoluteUrl(item.href)}): ${item.preparing ? '準備中。' : ''}${
          pageNotes[item.href] ?? ''
        }`,
    ),
    `- 記録: ${absoluteUrl('/making/records/')}<slug>/`,
    `- 書き手: ${absoluteUrl('/making/people/')}<id>/`,
    `- サイトマップ: ${absoluteUrl('/sitemap.xml')}`,
  ];

  const past = [...pastSites]
    .sort((a, b) => b.year - a.year)
    .map((past) => `- ${past.year}年（第${event.edition - (event.year - past.year)}回）: ${past.url}`);

  const contact = [`- 公式Instagram: ${site.instagram}`, `- メール: ${site.email}`];

  return [
    `# ${site.name}`,
    '',
    `> ${summary}`,
    '',
    '## イベント概要',
    '',
    ...overview,
    '',
    '## サイトの構成',
    '',
    '- 主コンテンツ「祭りの案内」: 決まったことを載せる。準備中のページは「まだ決まっていない」と書かれた状態で公開している',
    `- サブコンテンツ「できるまで」: ${event.year - 1}年10月から開催までの過程を「記録」として時系列で公開する。記録には必ず書き手（顔と名前）が付く`,
    '  - 記録: 出来事1件。日付、書き手、状態タグ（検討中、試作中、決定、ボツ、募集中）を持つ',
    `  - 書き手: ${site.roles
      .filter((role) => role.key !== 'other')
      .map((role) => role.label)
      .join('、')}など。公式の発表は「${site.organizer}」の名前で書く。書き手ごとに、その人の記録をまとめたページがある`,
    '',
    '## ページ',
    '',
    ...pages,
    '',
    '## 過去のサイト',
    '',
    ...past,
    '',
    '## 連絡先',
    '',
    ...contact,
    '',
  ].join('\n');
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
