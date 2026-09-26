import { site } from '@/config/site';
import type { MakingRecord, PersonSummary } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/urls';

const organizationId = `${site.url}#organization`;

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
      '@id': `${site.url}#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      publisher: { '@id': organizationId },
      inLanguage: 'ja-JP',
    },
  ],
};

/** 記録ページ: Article。author は書き手（組織なら Organization、それ以外は Person） */
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
    author: {
      '@type': person.kind === 'group' ? 'Organization' : 'Person',
      name: person.name,
      url: absoluteUrl(`/making/people/${person.id}/`),
    },
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
