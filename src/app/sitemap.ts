import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { getContent, getLastUpdated, recordsByAuthor } from '@/lib/content';
import { absoluteUrl } from '@/lib/urls';

/** 静的エクスポート用（sitemap.xml をビルド時に生成する） */
export const dynamic = 'force-static';

/** 静的ページ: トップ + ナビにあるページ（ページを増やしたら site.nav に足すだけでよい） */
const STATIC_PATHS = ['/', ...site.nav.map((item) => item.href)];

/** 主コンテンツ、記録、書き手を含む（仕様書 9.5） */
export default function sitemap(): MetadataRoute.Sitemap {
  const { people, records } = getContent();
  const lastUpdated = getLastUpdated();

  const pages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    ...(lastUpdated ? { lastModified: lastUpdated } : {}),
  }));

  const peoplePages: MetadataRoute.Sitemap = people.map((person) => {
    const latest = recordsByAuthor(records, person.id, 'desc')[0];
    const lastModified = latest?.date ?? lastUpdated;
    return {
      url: absoluteUrl(`/making/people/${person.id}/`),
      ...(lastModified ? { lastModified } : {}),
    };
  });

  const recordPages: MetadataRoute.Sitemap = records.map((record) => ({
    url: absoluteUrl(`/making/records/${record.slug}/`),
    lastModified: record.date,
  }));

  return [...pages, ...peoplePages, ...recordPages];
}
