import { site, type EventConfig } from '@/config/site';
import type { MakingRecord, PersonSummary } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/urls';

const organizationId = `${site.url}#organization`;
const websiteId = `${site.url}#website`;

/** 書き手ページの URL と、その中の Person ノードの @id */
function personIds(person: PersonSummary) {
  const url = absoluteUrl(`/making/people/${person.id}/`);
  return { url, personId: `${url}#person` };
}

/** 書き手を参照するノード。組織なら共通の Organization を @id で参照し、人なら Person */
function authorNode(person: PersonSummary) {
  if (person.kind === 'group') return { '@id': organizationId };
  const { url, personId } = personIds(person);
  return { '@type': 'Person', '@id': personId, name: person.name, url };
}

/** サイト共通: Organization + WebSite（仕様書 9.5） */
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: site.organizer,
      alternateName: 'Kuroneko Taiwan Matsuri',
      url: site.url,
      sameAs: [site.instagram],
      contactPoint: {
        '@type': 'ContactPoint',
        email: site.email,
        contactType: 'customer service',
        availableLanguage: ['Japanese', 'Chinese'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: site.url,
      name: site.name,
      description: site.description,
      publisher: { '@id': organizationId },
      inLanguage: 'ja-JP',
    },
  ],
};

/**
 * トップ: Festival（仕様書 9.5）。開催日（event.startDate）が確定している間だけ出す。
 * 入場料が未定のため offers / isAccessibleForFree は入れない。
 * - 延期・変更時は eventStatus を EventPostponed / EventRescheduled にし、previousStartDate を足す
 * - 開始時刻が決まったら startDate を `2027-05-29T10:00:00+09:00` の形にする
 */
export function festivalJsonLd(event: EventConfig = site.event) {
  if (!event.startDate) return undefined;
  // 会場名は site.ts の venueName、無ければ items の会場の表示文（文字列を 2 か所に持たない）
  const venue = event.venueName ?? event.items.find((item) => item.key === 'venue')?.value;
  return {
    '@context': 'https://schema.org',
    '@type': 'Festival',
    '@id': `${site.url}#event`,
    name: site.name,
    description: site.description,
    url: site.url,
    image: [absoluteUrl(site.ogImage)],
    startDate: event.startDate,
    endDate: event.endDate ?? event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    inLanguage: 'ja-JP',
    location: {
      '@type': 'Place',
      name: venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: '川崎市高津区',
        addressRegion: '神奈川県',
        addressCountry: 'JP',
      },
    },
    organizer: { '@id': organizationId },
  };
}

/** 記録・書き手ページ: BreadcrumbList。「トップ › できるまで › このページ」（Crumb コンポーネントと同じ階層） */
export function breadcrumbJsonLd(current: { name: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.name, item: site.url },
      { '@type': 'ListItem', position: 2, name: 'できるまで', item: absoluteUrl('/making/') },
      { '@type': 'ListItem', position: 3, name: current.name, item: absoluteUrl(current.path) },
    ],
  };
}

/** 記録ページ: Article。author は書き手（組織なら Organization の参照、それ以外は Person） */
export function recordJsonLd(record: MakingRecord, person: PersonSummary) {
  const url = absoluteUrl(`/making/records/${record.slug}/`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: record.title,
    description: record.summary,
    datePublished: record.date,
    dateModified: record.date,
    inLanguage: 'ja-JP',
    author: authorNode(person),
    publisher: { '@id': organizationId },
    image: [absoluteUrl(record.thumbnail ?? site.ogImage)],
    mainEntityOfPage: url,
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: '黒猫台湾まつりができるまで',
      url: absoluteUrl('/making/'),
    },
  };
}

/**
 * 書き手ページ: ProfilePage（仕様書 9.5）。
 * mainEntity は人なら Person、組織なら共通の Organization を @id で参照する。
 * dateModified はその書き手の最新の記録の日付（記録が無ければ省略）
 */
export function personJsonLd(person: PersonSummary, lastRecordDate?: string) {
  const { url, personId } = personIds(person);
  const mainEntity =
    person.kind === 'group'
      ? { '@id': organizationId }
      : {
          '@type': 'Person',
          '@id': personId,
          name: person.name,
          url,
          ...(person.avatar ? { image: absoluteUrl(person.avatar) } : {}),
          ...(person.bio ? { description: person.bio } : {}),
        };
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': url,
    url,
    name: person.name,
    inLanguage: 'ja-JP',
    ...(lastRecordDate ? { dateModified: lastRecordDate } : {}),
    isPartOf: { '@id': websiteId },
    mainEntity,
  };
}
